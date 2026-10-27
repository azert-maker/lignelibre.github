"""Outils partagés des scripts Blender de Ligne Libre (Blender 5.x, lancés en module Python `bpy`).

Conventions du projet (identiques au rig procédural du jeu, `buildHuman` dans 20-gear.js) :
- Blender : Z vers le haut, le personnage regarde +X, son côté « 0 » est en +Y (dans Three.js : z = -y Blender).
- Mètres. Bassin à 0,96 m, cuisse 0,44 m, tibia 0,43 m, épaules à 1,57 m.
- Matériaux nommés pour être recolorés par le jeu : skin, suit, accent, accent2, helmet, shoe, sole, glove, hair...
"""
import bpy, bmesh, math, os
from mathutils import Vector, Matrix, Quaternion

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.abspath(os.path.join(HERE, '..'))


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scn = bpy.context.scene
    scn.unit_settings.system = 'METRIC'
    return scn


def srgb(h):
    """hex sRGB -> tuple linéaire (RGBA)"""
    c = [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255]
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (*lin, 1.0)


def material(name, hexcol, rough=0.6, metal=0.0, clearcoat=0.0, emit=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = srgb(hexcol)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if 'Coat Weight' in b.inputs:
        b.inputs['Coat Weight'].default_value = clearcoat
    if emit:
        b.inputs['Emission Color'].default_value = srgb(hexcol)
        b.inputs['Emission Strength'].default_value = emit
    m.diffuse_color = srgb(hexcol)
    return m


def link(ob, coll=None):
    (coll or bpy.context.scene.collection).objects.link(ob)
    return ob


def bake_to_mesh(ob, name=None, keep=False):
    """Évalue modificateurs / métaballes et remplace par un maillage réel."""
    dg = bpy.context.evaluated_depsgraph_get()
    ev = ob.evaluated_get(dg)
    me = bpy.data.meshes.new_from_object(ev)
    new = bpy.data.objects.new(name or ob.name, me)
    new.matrix_world = ob.matrix_world.copy()
    link(new)
    if not keep:
        bpy.data.objects.remove(ob, do_unlink=True)
    return new


def metaball(name, elems, resolution=0.025, threshold=0.6):
    """elems : liste de dicts {t:'BALL'|'ELLIPSOID'|'CAPSULE', co, r, size:(x,y,z), a,b (capsule de a à b), neg}"""
    mb = bpy.data.metaballs.new(name)
    mb.resolution = resolution
    mb.render_resolution = resolution
    mb.threshold = threshold
    for e in elems:
        el = mb.elements.new()
        t = e.get('t', 'BALL')
        el.radius = e.get('r', 0.1)
        el.stiffness = e.get('stiff', 2.0)
        el.use_negative = e.get('neg', False)
        if t == 'CAPSULE':
            a, b = Vector(e['a']), Vector(e['b'])
            el.type = 'CAPSULE'
            el.co = (a + b) / 2
            el.size_x = (b - a).length / 2
            el.rotation = Vector((1, 0, 0)).rotation_difference((b - a).normalized())
        elif t == 'ELLIPSOID':
            el.type = 'ELLIPSOID'
            el.co = e['co']
            el.size_x, el.size_y, el.size_z = e['size']
            if 'rot' in e:
                el.rotation = e['rot']
        else:
            el.type = 'BALL'
            el.co = e['co']
    ob = link(bpy.data.objects.new(name, mb))
    return ob


def mesh_from_metaball(name, elems, mat, resolution=0.025, threshold=0.6, decimate=None, smooth=True):
    ob = metaball(name + '_mb', elems, resolution, threshold)
    me_ob = bake_to_mesh(ob, name)
    if decimate:
        d = me_ob.modifiers.new('dec', 'DECIMATE')
        d.ratio = decimate
        me_ob = bake_to_mesh(me_ob, name)
    me = me_ob.data
    me.materials.append(mat)
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    return me_ob


def box(name, size, loc, mat, bevel=0.0, segs=2, rot=(0, 0, 0), subdiv=0):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = link(bpy.data.objects.new(name, me))
    ob.location = loc
    ob.rotation_euler = rot
    me.materials.append(mat)
    if bevel:
        m = ob.modifiers.new('bev', 'BEVEL')
        m.width = bevel
        m.segments = segs
        m.limit_method = 'NONE'
    if subdiv:
        m = ob.modifiers.new('sub', 'SUBSURF')
        m.levels = subdiv
    if bevel or subdiv:
        ob = bake_to_mesh(ob, name)
        for p in ob.data.polygons:
            p.use_smooth = True
    return ob


def cylinder(name, r, depth, loc, mat, verts=16, rot=(0, 0, 0), r2=None, cap=True):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=cap, cap_tris=False, segments=verts, radius1=r, radius2=r if r2 is None else r2, depth=depth)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = link(bpy.data.objects.new(name, me))
    ob.location = loc
    ob.rotation_euler = rot
    me.materials.append(mat)
    for p in me.polygons:
        p.use_smooth = True
    return ob


def tube_between(name, a, b, r, mat, verts=12):
    a, b = Vector(a), Vector(b)
    d = b - a
    ob = cylinder(name, r, d.length, (a + b) / 2, mat, verts)
    ob.rotation_mode = 'QUATERNION'
    ob.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    return ob


def sphere(name, r, loc, mat, seg=24, rings=14, scale=(1, 1, 1)):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=r)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = link(bpy.data.objects.new(name, me))
    ob.location = loc
    ob.scale = scale
    me.materials.append(mat)
    for p in me.polygons:
        p.use_smooth = True
    return ob


def torus(name, R, r, loc, mat, rot=(0, 0, 0), seg=32, mseg=10, scale=(1, 1, 1)):
    bm = bmesh.new()
    verts = []
    for i in range(seg):
        a = i / seg * 2 * math.pi
        for j in range(mseg):
            b = j / mseg * 2 * math.pi
            verts.append(bm.verts.new(((R + r * math.cos(b)) * math.cos(a), (R + r * math.cos(b)) * math.sin(a), r * math.sin(b))))
    for i in range(seg):
        for j in range(mseg):
            a = verts[i * mseg + j]
            b = verts[((i + 1) % seg) * mseg + j]
            c = verts[((i + 1) % seg) * mseg + (j + 1) % mseg]
            d = verts[i * mseg + (j + 1) % mseg]
            bm.faces.new((a, b, c, d))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = link(bpy.data.objects.new(name, me))
    ob.location = loc
    ob.rotation_euler = rot
    ob.scale = scale
    me.materials.append(mat)
    for p in me.polygons:
        p.use_smooth = True
    return ob


def boolean(ob, cutter, op='DIFFERENCE'):
    m = ob.modifiers.new('bool', 'BOOLEAN')
    m.operation = op
    m.object = cutter
    m.solver = 'EXACT'
    res = bake_to_mesh(ob, ob.name)
    bpy.data.objects.remove(cutter, do_unlink=True)
    for p in res.data.polygons:
        p.use_smooth = True
    return res


def apply_transform(ob):
    """applique la transformation dans les sommets (pour exporter des objets à l'origine)"""
    bpy.context.view_layer.update()  # matrix_world est périmée tant que le depsgraph n'est pas réévalué
    me = ob.data
    me.transform(ob.matrix_world)
    ob.matrix_world = Matrix.Identity(4)


def join(objs, name):
    """fusionne plusieurs objets maillage en un seul (sans opérateur : bmesh)"""
    bm = bmesh.new()
    mats = []
    for ob in objs:
        apply_transform(ob)
        me = ob.data
        idx_map = {}
        for i, m in enumerate(me.materials):
            if m not in mats:
                mats.append(m)
            idx_map[i] = mats.index(m)
        tmp = bmesh.new()
        tmp.from_mesh(me)
        for f in tmp.faces:
            f.material_index = idx_map.get(f.material_index, 0)
        me2 = bpy.data.meshes.new('tmp')
        tmp.to_mesh(me2)
        tmp.free()
        bm.from_mesh(me2)
        bpy.data.meshes.remove(me2)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    for ob in objs:
        bpy.data.objects.remove(ob, do_unlink=True)
    new = link(bpy.data.objects.new(name, me))
    return new


def tri_count(ob):
    return sum(len(p.vertices) - 2 for p in ob.data.polygons)


def render_setup(res=(720, 720), samples=24):
    scn = bpy.context.scene
    scn.render.engine = 'CYCLES'
    scn.cycles.device = 'CPU'
    scn.cycles.samples = samples
    scn.cycles.use_denoising = True
    scn.render.resolution_x, scn.render.resolution_y = res
    scn.render.film_transparent = False
    w = bpy.data.worlds.new('w')
    w.use_nodes = True
    bg = w.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = srgb(0x1c2733)
    bg.inputs['Strength'].default_value = 0.9
    scn.world = w
    def light(name, typ, loc, energy, col=0xffffff, size=1.0):
        ld = bpy.data.lights.new(name, typ)
        ld.energy = energy
        ld.color = srgb(col)[:3]
        if typ == 'AREA':
            ld.size = size
        ob = link(bpy.data.objects.new(name, ld))
        ob.location = loc
        ob.rotation_euler = (Vector((0, 0, 1)).rotation_difference((Vector((0, 0, 1)) - Vector(loc)).normalized()).to_euler())
        d = Vector((0, 0, 1.0)) - Vector(loc)
        ob.rotation_mode = 'QUATERNION'
        ob.rotation_quaternion = Vector((0, 0, -1)).rotation_difference(d.normalized())
        return ob
    light('key', 'AREA', (3, -2.2, 3.2), 900, 0xfff1e0, 2.5)
    light('fill', 'AREA', (2.5, 3, 1.6), 300, 0xcfe3ff, 3)
    light('rim', 'AREA', (-3, 0.5, 2.6), 700, 0x8fd3ff, 2)
    # sol
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=6)
    me = bpy.data.meshes.new('floor')
    bm.to_mesh(me)
    bm.free()
    fl = link(bpy.data.objects.new('floor', me))
    me.materials.append(material('floor_m', 0x2a3440, 0.8))
    return fl


def render(path, cam_loc, target=(0, 0, 1.0), lens=50):
    scn = bpy.context.scene
    cd = bpy.data.cameras.get('cam') or bpy.data.cameras.new('cam')
    cd.lens = lens
    co = bpy.data.objects.get('cam') or link(bpy.data.objects.new('cam', cd))
    co.location = cam_loc
    d = Vector(target) - Vector(cam_loc)
    co.rotation_mode = 'QUATERNION'
    co.rotation_quaternion = d.to_track_quat('-Z', 'Y')
    scn.camera = co
    scn.render.filepath = path
    bpy.ops.render.render(write_still=True)


def loft(name, rings, mats, n=16, caps=(True, True), fwd=(1, 0, 0), subsurf=1, mat_fn=None, cap_round=0.6):
    """Tube lissé à partir d'anneaux elliptiques (méthode « box modeling » scriptée).
    rings : liste de dicts {c:(x,y,z), a: rayon vers `fwd`, b: rayon latéral, rot: torsion (rad)}.
    mats : matériau ou liste de matériaux ; mat_fn(centre_face) -> index de matériau (zones de couleur).
    Les extrémités sont fermées par un pôle arrondi ; une subdivision de Catmull-Clark lisse le tout."""
    mats = mats if isinstance(mats, (list, tuple)) else [mats]
    bm = bmesh.new()
    C = [Vector(r['c']) for r in rings]
    F0 = Vector(fwd)
    loops = []
    for i, r in enumerate(rings):
        d = (C[min(i + 1, len(C) - 1)] - C[max(i - 1, 0)]).normalized()
        f = F0 - d * F0.dot(d)
        if f.length < 1e-4:
            f = Vector((0, 1, 0)) - d * d.y
        f.normalize()
        s = d.cross(f)
        tw = r.get('rot', 0.0)
        ring = []
        for j in range(n):
            t = 2 * math.pi * j / n + tw
            p = C[i] + f * (r['a'] * math.cos(t)) + s * (r['b'] * math.sin(t))
            ring.append(bm.verts.new(p))
        loops.append((ring, d))
    for i in range(len(loops) - 1):
        A, B = loops[i][0], loops[i + 1][0]
        for j in range(n):
            bm.faces.new((A[j], A[(j + 1) % n], B[(j + 1) % n], B[j]))
    for end, (ring, d) in ((0, loops[0]), (1, loops[-1])):
        if not caps[end]:
            continue
        r = rings[0 if end == 0 else -1]
        sign = -1 if end == 0 else 1
        pole = bm.verts.new(C[0 if end == 0 else -1] + d * sign * min(r['a'], r['b']) * cap_round)
        for j in range(n):
            v = (ring[j], ring[(j + 1) % n], pole) if end == 1 else (ring[(j + 1) % n], ring[j], pole)
            bm.faces.new(v)
    bm.normal_update()
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    ob = link(bpy.data.objects.new(name, me))
    # orientation des faces vers l'extérieur
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    if subsurf:
        md = ob.modifiers.new('ss', 'SUBSURF')
        md.levels = subsurf
        md.render_levels = subsurf
        ob = bake_to_mesh(ob)
        ob.name = name
    if mat_fn:
        for p in ob.data.polygons:
            p.material_index = mat_fn(p.center)
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def surface_patch(name, target, mat, us, vs, ray, offset=0.0025, max_dist=None):
    """Décalque posé sur une surface : grille (u, v) projetée par lancer de rayons sur `target`.
    ray(u, v) -> (origine, direction) ; le premier impact est décalé de `offset` le long de la normale.
    Évite l'effet « escalier » des zones de couleur peintes face par face."""
    from mathutils.bvhtree import BVHTree
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    tree = BVHTree.FromObject(target, dg)
    mw = target.matrix_world
    inv = mw.inverted()
    bm = bmesh.new()
    grid = []
    for u in us:
        row = []
        for v in vs:
            o, d = ray(u, v)
            o, d = Vector(o), Vector(d).normalized()
            lo, ld = inv @ o, (inv.to_3x3() @ d).normalized()
            hit = tree.ray_cast(lo, ld)
            if hit[0] is None or (max_dist and hit[3] > max_dist):
                row.append(None)
                continue
            p, n = mw @ hit[0], (mw.to_3x3() @ hit[1]).normalized()
            if n.dot(d) > 0:
                n = -n
            row.append(bm.verts.new(p + n * offset))
        grid.append(row)
    for i in range(len(grid) - 1):
        for j in range(len(grid[i]) - 1):
            q = (grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1])
            if all(q):
                bm.faces.new(q)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(mat)
    for f in me.polygons:
        f.use_smooth = True
    return link(bpy.data.objects.new(name, me))
