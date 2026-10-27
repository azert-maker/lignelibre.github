"""Moto de motocross : import du modèle fourni par Jean (assets/third_party/dirtbike/DirtBike.blend), nettoyage, export GLB.

Le modèle d'origine est riggé (armature 14 os, pièces attachées aux os). Pour le jeu on « cuit » chaque pièce
dans l'espace monde, on retourne la moto (avant vers -Z Three.js), on la met à l'échelle du gabarit du jeu
(empattement ≈ 1,5 m) et on regroupe les pièces selon les groupes animés par 47-moto.js :
  moto_body   cadre, carénages, moteur, bras oscillant + chaîne        (groupe body, origine au sol)
  moto_front  guidon, plaque numéro, fourche, leviers                 (groupe front, origine = pivot de direction)
  moto_wheelF / moto_wheelR                                           (origine au centre de la roue)
Les positions des pivots sont écrites dans les « extras » glTF de chaque nœud (pivot = position dans l'espace moto).
Lancer : python3 assets/blender/moto.py [--render]
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

SRC = os.path.join(ASSETS, 'third_party', 'dirtbike', 'DirtBike.blend')
bpy.ops.wm.open_mainfile(filepath=SRC, load_ui=False, use_scripts=False)
SCALE = 1.1
# retournement (avant -Y Blender -> +Y, ce qui donne -Z dans Three.js) + échelle
XF = Matrix.Rotation(math.pi, 4, 'Z') @ Matrix.Scale(SCALE, 4)

dg = bpy.context.evaluated_depsgraph_get()
def bake(name):
    ob = bpy.data.objects[name]
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg), depsgraph=dg)
    me.transform(XF @ ob.matrix_world)
    return me

arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
def bone_pos(n):
    return XF @ (arm.matrix_world @ arm.data.bones[n].head_local)

GROUPS = {
    'moto_body': ['Body_GEO', 'Engine_GEO', 'RearWheelChain_GEO'],
    'moto_front': ['Handle_GEO', 'FrontShock_GEO', 'LeftLeaver_GEO', 'RightLeaver_GEO'],
    'moto_wheelF': ['FrontWheel_GEO'],
    'moto_wheelR': ['RearWheel_GEO'],
}
PIVOT = {'moto_body': Vector((0, 0, 0)), 'moto_front': bone_pos('handle_main'), 'moto_wheelF': bone_pos('wheel_f'), 'moto_wheelR': bone_pos('wheel_r')}
meshes = {g: [bake(n) for n in names] for g, names in GROUPS.items()}
GRIPS = {side: bone_pos(n) for side, n in (('L', 'handle_l'), ('R', 'handle_r'))}
LEVERS = {side: bone_pos(n) for side, n in (('L', 'breakLeaver_l'), ('R', 'breakLeaver_r'))}

# scène propre : on ne garde que les pièces cuites
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
out = []
for g, mes in meshes.items():
    bm = bmesh.new()
    mats = []
    for me in mes:
        tmp = bmesh.new(); tmp.from_mesh(me)
        for f in tmp.faces:
            m = me.materials[f.material_index] if me.materials else None
            if m not in mats: mats.append(m)
            f.material_index = mats.index(m)
        me2 = bpy.data.meshes.new('t'); tmp.to_mesh(me2); tmp.free(); bm.from_mesh(me2); bpy.data.meshes.remove(me2)
    me = bpy.data.meshes.new(g); bm.to_mesh(me); bm.free()
    for m in mats: me.materials.append(m)
    me.transform(Matrix.Translation(-PIVOT[g]))
    ob = link(bpy.data.objects.new(g, me)); ob.location = PIVOT[g]
    if g.startswith('moto_wheel'):  # pneus à crampons très denses : -45 % de triangles, silhouette conservée
        md = ob.modifiers.new('dec', 'DECIMATE'); md.ratio = 0.55
        bpy.context.view_layer.update(); loc = ob.location.copy(); ob = bake_to_mesh(ob, g); ob.name = g; ob.location = loc
    p = PIVOT[g]
    # pivot en coordonnées Three.js (x, z, -y)
    ob['pivot'] = [round(p.x, 4), round(p.z, 4), round(-p.y, 4)]
    out.append(ob)
# grip positions pour l'IK des mains (Three.js, espace moto)
for side in ('L', 'R'):
    p = LEVERS[side]
    out[1][f'grip{side}'] = [round(p.x, 4), round(p.z, 4), round(-p.y, 4)]
stats = {o.name: tri_count(o) for o in out}
os.makedirs(os.path.join(ASSETS, 'glb'), exist_ok=True)
for o in bpy.data.objects:
    o.select_set(o in out)
bpy.ops.export_scene.gltf(filepath=os.path.join(ASSETS, 'glb', 'moto.glb'), export_format='GLB', use_selection=True,
                          export_animations=False, export_yup=True, export_texcoords=True, export_normals=True, export_extras=True,
                          export_image_format='NONE')  # la plaque reçoit le numéro du joueur en jeu : pas d'image embarquée
print('PIVOTS', {o.name: list(o['pivot']) for o in out}, 'GRIPS', list(out[1]['gripL']), list(out[1]['gripR']))
print('TRIS', stats, 'TOTAL', sum(stats.values()))
print('GLB', os.path.getsize(os.path.join(ASSETS, 'glb', 'moto.glb')))
if '--render' in sys.argv:
    render_setup((900, 600), 16)
    render(os.path.join(ASSETS, 'renders', 'moto_side.png'), (3.2, 0.2, 0.9), (0, 0.05, 0.6), 45)
    render(os.path.join(ASSETS, 'renders', 'moto_34.png'), (2.0, 2.3, 1.5), (0, 0, 0.6), 45)
