"""Équipement des sports de glisse et voilure du wingsuit → assets/glb/gear.glb.

Toutes les coordonnées sont écrites dans le repère du JEU (x latéral, y haut, avant = -z ; le rider regarde +x,
orteils côté +x, talons côté -x), puis converties en Blender par T(). Chaque pièce a son origine sur le point
où le jeu la pose, et ses matériaux portent un nom que le jeu recolore :

  lb_deck     plateau de longboard, longueur 1 m (le jeu l'étire à la longueur de la planche), concave, kicktails
              matériaux : deck (dessous, couleur look.deck), grip (dessus), ply (tranche bois)
  lb_truck    platine, kingpin, gommes (accent), hanger et axe ; origine = centre de l'axe des roues
  lb_wheel    roue à lèvre arrondie, noyau et roulement ; origine = centre, axe le long de x ; wheel = look.wheel
  sb_board    snowboard 1,56 m : ligne de cotes, spatule et talon relevés, cambre, carres ; base = look.deck
  sb_binding  fixation : plateau, talonnière, spoiler côté talons (-x), 2 sangles (accent) ; origine sous le pied
  wk_board    wakeboard, longueur 1 m (étirée par le jeu), rocker continu, 4 ailerons ; board = look.boardCol
  wk_binding  chausson fermé (boot), lacets ; origine sous le pied, orteils vers +x
  wk_handle   palonnier : barre gainée, embouts, patte d'oie de la corde ; axe le long de z
  ws_wing     voilure du wingsuit dans le repère de buildFlyer (points FLY de 20-gear.js) : ailes de bras et aile
              de jambes en caissons gonflés (profil épais, nervures, entrées d'air sous le bord d'attaque)
              maillages ws_arms / ws_legs ; matériaux wing (couleurs calculées par le jeu), rib, inlet

Lancer : python3 assets/blender/gear.py [--render]
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

reset()


def T(x, y, z):
    return (x, -z, y)


M = {
    'deck': material('deck', 0x2f6fd0, 0.45, clearcoat=0.5),
    'grip': material('grip', 0x1c1d20, 0.95),
    'ply': material('ply', 0xc9a06a, 0.6),
    'metal': material('metal', 0xaeb4bb, 0.3, metal=0.9),
    'bushing': material('bushing', 0xff6a1f, 0.7),
    'wheel': material('wheel', 0xf0b84a, 0.55),
    'core': material('core', 0xe8e6e0, 0.5),
    'base': material('base', 0x2f6fd0, 0.35, clearcoat=0.4),
    'top': material('top', 0x15191e, 0.4, clearcoat=0.6),
    'edge': material('edge', 0x9aa1a8, 0.25, metal=1.0),
    'binding': material('binding', 0x16191d, 0.6),
    'strap': material('strap', 0xff6a1f, 0.6),
    'board': material('board', 0xf3f1ea, 0.35, clearcoat=0.7),
    'boardbase': material('boardbase', 0x2a2f36, 0.5),
    'fin': material('fin', 0x101215, 0.5),
    'boot': material('boot', 0x1e2229, 0.7),
    'lace': material('lace', 0xff6a1f, 0.7),
    'grip_h': material('grip_h', 0x14161a, 0.9),
    'rope': material('rope', 0xfff1a8, 0.8),
    'wing': material('wing', 0xff6a1f, 0.6),
    'rib': material('rib', 0x2a2d33, 0.7),
    'inlet': material('inlet', 0x0e1013, 0.9),
}
MI = {k: i for i, k in enumerate(M)}


def mesh_from(name, verts, faces, fmats, smooth=True):
    """maillage brut ; verts en repère JEU ; fmats = clé de matériau par face"""
    me = bpy.data.meshes.new(name)
    me.from_pydata([T(*v) for v in verts], [], faces)
    used = []
    for k in fmats:
        if k not in used:
            used.append(k)
    for k in used:
        me.materials.append(M[k])
    for p, k in zip(me.polygons, fmats):
        p.material_index = used.index(k)
        p.use_smooth = smooth
    me.validate()
    ob = link(bpy.data.objects.new(name, me))
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    return ob


def shell(name, top, bot, nu, nv, mat_top, mat_bot, mat_side, closed_v=False):
    """Solide fermé entre deux nappes : top(u,v) et bot(u,v) -> point jeu, u et v dans [0,1].
    Les bords u=0, u=1, v=0, v=1 sont fermés par des faces latérales (mat_side peut être une fonction (u,v)->clé)."""
    V, F, K = [], [], []
    def grid(fn):
        base = len(V)
        for i in range(nu + 1):
            for j in range(nv + 1):
                V.append(fn(i / nu, j / nv))
        return base
    a = grid(top); b = grid(bot)
    idx = lambda base, i, j: base + i * (nv + 1) + j
    mt = mat_top if callable(mat_top) else (lambda u, v: mat_top)
    mb = mat_bot if callable(mat_bot) else (lambda u, v: mat_bot)
    ms = mat_side if callable(mat_side) else (lambda u, v: mat_side)
    for i in range(nu):
        for j in range(nv):
            u, v = (i + .5) / nu, (j + .5) / nv
            F.append((idx(a, i, j), idx(a, i + 1, j), idx(a, i + 1, j + 1), idx(a, i, j + 1))); K.append(mt(u, v))
            F.append((idx(b, i, j + 1), idx(b, i + 1, j + 1), idx(b, i + 1, j), idx(b, i, j))); K.append(mb(u, v))
    for i in range(nu):
        for j in (0, nv):
            F.append((idx(a, i, j), idx(b, i, j), idx(b, i + 1, j), idx(a, i + 1, j))); K.append(ms((i + .5) / nu, j / nv))
    for j in range(nv):
        for i in (0, nu):
            F.append((idx(a, i, j), idx(a, i, j + 1), idx(b, i, j + 1), idx(b, i, j))); K.append(ms(i / nu, (j + .5) / nv))
    ob = mesh_from(name, V, F, K)
    bm = bmesh.new(); bm.from_mesh(ob.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(ob.data); bm.free()
    return ob


# box() de common.py prend ses dimensions dans le repère Blender : (largeur x, profondeur, hauteur)
def at(ob, x, y, z):
    ob.location = T(x, y, z)
    apply_transform(ob)
    return ob


def lathe(name, prof, mats, seg=20, axis='x'):
    """révolution d'un profil [(r, x)] autour de l'axe x du jeu ; mats[i] = matériau du segment i"""
    V, F, K = [], [], []
    for (r, x) in prof:
        for s in range(seg):
            t = 2 * math.pi * s / seg
            V.append((x, r * math.cos(t), r * math.sin(t)))
    for i in range(len(prof) - 1):
        for s in range(seg):
            a, b = i * seg + s, i * seg + (s + 1) % seg
            F.append((a, b, b + seg, a + seg)); K.append(mats[i])
    return mesh_from(name, V, F, K)


parts = []

# ============================== LONGBOARD ==============================
TH = 0.014
def lb_halfw(t):  # t in [-.5,.5]
    a = abs(t)
    w = 0.125
    if a > 0.33:
        k = (a - 0.33) / 0.17
        w *= math.sqrt(max(0.0, 1 - k ** 2.2)) * 0.62 + 0.38 * (1 - k ** 3)
    return max(w, 0.035)
def lb_y(t, s):  # s in [-1,1] travers
    a = abs(t)
    kick = max(0.0, a - 0.40) / 0.10
    return 0.009 * s * s + 0.045 * kick ** 1.8
def lb_pt(u, v, top):
    t = u - 0.5
    s = v * 2 - 1
    w = lb_halfw(t)
    y = lb_y(t, s) + (TH / 2 if top else -TH / 2)
    return (s * w, y, t)
deck = shell('lb_deck', lambda u, v: lb_pt(u, v, True), lambda u, v: lb_pt(u, v, False), 48, 10, 'grip', 'deck', 'ply')
parts.append(deck)

P = []
P.append(at(box('bp', (0.064, 0.012, 0.09), (0, 0, 0), M['metal'], bevel=0.003), 0, 0.068, 0))  # platine (sous le plateau)
P.append(at(cylinder('kp', 0.006, 0.05, (0, 0, 0), M['metal'], 8, rot=(0.6, 0, 0)), 0, 0.045, 0.012))
for dy in (0.032, 0.052):
    P.append(at(cylinder('bu', 0.015, 0.014, (0, 0, 0), M['bushing'], 14, rot=(0.6, 0, 0)), 0, dy, 0.016 - (dy - 0.032) * 0.6))
hanger = loft('hanger', [{'c': T(-0.11, 0, 0), 'a': 0.008, 'b': 0.008}, {'c': T(-0.06, 0.004, 0), 'a': 0.012, 'b': 0.011},
                         {'c': T(0, 0.022, 0), 'a': 0.02, 'b': 0.016}, {'c': T(0.06, 0.004, 0), 'a': 0.012, 'b': 0.011},
                         {'c': T(0.11, 0, 0), 'a': 0.008, 'b': 0.008}], M['metal'], n=10, fwd=(0, 0, 1), subsurf=1)
P.append(hanger)
P.append(cylinder('axle', 0.004, 0.28, (0, 0, 0), M['metal'], 8, rot=(0, math.pi / 2, 0)))
truck = join(P, 'lb_truck')
parts.append(truck)

wheel = lathe('lb_wheel', [(0.012, -0.024), (0.03, -0.025), (0.035, -0.019), (0.0355, -0.005), (0.0355, 0.012), (0.034, 0.022),
                           (0.028, 0.026), (0.016, 0.026), (0.016, 0.02), (0.012, 0.02), (0.012, -0.024)],
              ['wheel', 'wheel', 'wheel', 'wheel', 'wheel', 'wheel', 'wheel', 'core', 'core', 'core'], seg=22)
parts.append(wheel)

# ============================== SNOWBOARD ==============================
SL, ST = 1.56, 0.011
def sb_halfw(t):  # sidecut : taille 0,25, spatules 0,29
    a = abs(t) / 0.5
    w = 0.125 + 0.02 * min(1.0, (a / 0.86)) ** 2
    if a > 0.86:
        k = (a - 0.86) / 0.14
        w = 0.145 * math.sqrt(max(0.0, 1 - k ** 2.4)) + 0.002
    return max(w, 0.02)
def sb_y(t):
    a = abs(t) / 0.5
    camber = 0.008 * max(0.0, 1 - (a / 0.86) ** 2) if a < 0.86 else 0.0
    up = 0.0
    if a > 0.84:
        k = (a - 0.84) / 0.16
        up = 0.062 * k ** 2.1
    return camber + up
def sb_pt(u, v, top):
    t = u - 0.5
    s = v * 2 - 1
    w = sb_halfw(t)
    return (s * w, sb_y(t) + (ST if top else 0.0), t * SL)
sb = shell('sb_board', lambda u, v: sb_pt(u, v, True), lambda u, v: sb_pt(u, v, False), 64, 8, 'top', 'base',
           lambda u, v: 'edge')
parts.append(sb)

P = []
P.append(at(box('plate', (0.2, 0.13, 0.012), (0, 0, 0), M['binding'], bevel=0.005), 0, 0.006, 0))
P.append(at(cylinder('disc', 0.05, 0.006, (0, 0, 0), M['metal'], 20), 0, 0.012, 0))
for sz in (-1, 1):  # flancs de talonnière
    P.append(at(box('side', (0.2, 0.008, 0.05), (0, 0, 0), M['binding'], bevel=0.004), -0.01, 0.035, sz * 0.064))
P.append(at(box('heelcup', (0.012, 0.13, 0.07), (0, 0, 0), M['binding'], bevel=0.005), -0.105, 0.045, 0))
hb = loft('highback', [{'c': T(-0.11, 0.05, 0), 'a': 0.006, 'b': 0.065}, {'c': T(-0.13, 0.17, 0), 'a': 0.006, 'b': 0.062},
                       {'c': T(-0.145, 0.27, 0), 'a': 0.006, 'b': 0.05}], M['binding'], n=8, fwd=(1, 0, 0), subsurf=1)
P.append(hb)
for (x, y, w) in ((-0.02, 0.085, 0.05), (0.075, 0.05, 0.04)):  # sangle de cheville, sangle d'orteils
    st = loft('strap', [{'c': T(x, y - 0.03, -0.066), 'a': 0.004, 'b': w / 2}, {'c': T(x + 0.01, y + 0.01, -0.03), 'a': 0.009, 'b': w / 2},
                        {'c': T(x + 0.012, y + 0.022, 0), 'a': 0.012, 'b': w / 2}, {'c': T(x + 0.01, y + 0.01, 0.03), 'a': 0.009, 'b': w / 2},
                        {'c': T(x, y - 0.03, 0.066), 'a': 0.004, 'b': w / 2}], M['strap'], n=8, fwd=(0, 0, 1), subsurf=1)
    P.append(st)
binding = join(P, 'sb_binding')
parts.append(binding)

# ============================== WAKEBOARD ==============================
WT = 0.022
def wk_halfw(t):
    a = abs(t) / 0.5
    return max(0.21 * math.sqrt(max(0.0, 1 - a ** 3.2)), 0.012)
def wk_y(t, s):
    a = abs(t) / 0.5
    return 0.075 * a ** 2.2 + 0.004 * (1 - s * s)
def wk_pt(u, v, top):
    t = u - 0.5
    s = v * 2 - 1
    w = wk_halfw(t)
    th = WT * (0.55 + 0.45 * math.sqrt(max(0.0, 1 - s * s))) * (0.6 + 0.4 * (1 - abs(t) / 0.5))
    return (s * w, wk_y(t, s) + (th if top else 0.0), t)
wk_mat_top = lambda u, v: 'lace' if 0.47 < u < 0.53 else 'board'
wk = shell('wk_shell', lambda u, v: wk_pt(u, v, True), lambda u, v: wk_pt(u, v, False), 56, 10, wk_mat_top, 'boardbase', 'board')
P = [wk]
for z in (-0.44, 0.44):  # ailerons (bord), à l'arrière de chaque extrémité
    for x in (-0.15, 0.15):
        f = box('fin', (0.006, 0.06, 0.025), (0, 0, 0), M['fin'], bevel=0.002)
        P.append(at(f, x, wk_y(z, 0.7) - 0.012, z * 0.92))
wkb = join(P, 'wk_board')
parts.append(wkb)

boot = loft('boot', [{'c': T(-0.13, 0.04, 0), 'a': 0.02, 'b': 0.045}, {'c': T(-0.08, 0.06, 0), 'a': 0.06, 'b': 0.055},
                     {'c': T(0.0, 0.06, 0), 'a': 0.05, 'b': 0.055}, {'c': T(0.08, 0.045, 0), 'a': 0.035, 'b': 0.05},
                     {'c': T(0.14, 0.035, 0), 'a': 0.025, 'b': 0.04}], M['boot'], n=12, fwd=(0, 1, 0), subsurf=1)
shaft = loft('shaft', [{'c': T(-0.07, 0.07, 0), 'a': 0.055, 'b': 0.052}, {'c': T(-0.075, 0.17, 0), 'a': 0.05, 'b': 0.048},
                       {'c': T(-0.08, 0.25, 0), 'a': 0.048, 'b': 0.046}], M['boot'], n=12, fwd=(1, 0, 0), subsurf=1, caps=(False, True))
sole = at(box('sole', (0.3, 0.12, 0.014), (0, 0, 0), M['fin'], bevel=0.006), 0, 0.007, 0)
P = [boot, shaft, sole]
for i in range(4):
    x = -0.02 + i * 0.035
    P.append(at(box('lace', (0.008, 0.07, 0.006), (0, 0, 0), M['lace']), x, 0.098 - i * 0.008, 0))
wkbind = join(P, 'wk_binding')
parts.append(wkbind)

P = [cylinder('bar', 0.016, 0.3, (0, 0, 0), M['grip_h'], 12, rot=(math.pi / 2, 0, 0))]
for s in (-1, 1):
    P.append(at(sphere('cap', 0.02, (0, 0, 0), M['rope'], 12, 8), 0, 0, s * 0.155))
    P.append(tube_between('bridle', T(0, 0, s * 0.15), T(0.16, 0, 0), 0.004, M['rope'], 6))
handle = join(P, 'wk_handle')
parts.append(handle)

# ============================== VOILURE WINGSUIT ==============================
FLY = {'sh': [(-.22, 0, -.6), (.22, 0, -.6)], 'el': [(-.52, 0, -.58), (.52, 0, -.58)], 'wr': [(-.8, 0, -.56), (.8, 0, -.56)],
       'hp': [(-.11, 0, .08), (.11, 0, .08)], 'kn': [(-.24, 0, .52), (.24, 0, .52)], 'an': [(-.34, 0, .96), (.34, 0, .96)]}
V3 = lambda p: Vector(p)
def bez(a, b, c, t):
    return a * (1 - t) ** 2 + b * 2 * t * (1 - t) + c * t * t
def naca(v):  # épaisseur relative d'un profil, 0 aux deux bords
    return 1.4845 * math.sqrt(v) - 0.63 * v - 1.758 * v * v + 1.4215 * v ** 3 - 0.5075 * v ** 4
def wing_patch(name, edge_lead, edge_trail, cells, chord_th, billow, side_lift):
    """Nappe gonflée : edge_lead(u) et edge_trail(u) donnent les bords d'attaque et de fuite (u envergure) ;
    profil épais (naca), caissons (billow entre nervures), entrées d'air sous le bord d'attaque."""
    nu, nv = cells * 4, 10
    def pt(u, v, top):
        A, B = edge_lead(u), edge_trail(u)
        p = A.lerp(B, v)
        cellk = abs(math.sin(math.pi * u * cells))  # 0 sur les nervures, 1 au milieu des caissons
        th = chord_th(u) * naca(max(v, 1e-4)) * (0.55 + 0.45 * cellk)
        camber = billow * math.sin(math.pi * v) * (0.4 + 0.6 * cellk) + side_lift(u)
        y = camber + (th / 2 if top else -th / 2)
        return (p.x, p.y + y, p.z)
    def m_top(u, v):
        return 'rib' if (u * cells) % 1 < 0.06 or (u * cells) % 1 > 0.94 else 'wing'
    def m_bot(u, v):
        if v < 0.09 and 0.12 < (u * cells) % 1 < 0.88:
            return 'inlet'
        return m_top(u, v)
    return shell(name, lambda u, v: pt(u, v, True), lambda u, v: pt(u, v, False), nu, nv, m_top, m_bot, 'wing')

arms = []
for s in (0, 1):
    sh, el, wr = V3(FLY['sh'][s]), V3(FLY['el'][s]), V3(FLY['wr'][s])
    sg = -1 if s == 0 else 1
    th = Vector((sg * 0.2, 0, 0.4))
    tip_rear = wr.lerp(th, 0.16)
    lead = lambda u, sh=sh, el=el, wr=wr: bez(sh, el * 2 - (sh + wr) / 2, wr, u)  # passe par le coude
    trail = lambda u, th=th, tr=tip_rear: th.lerp(tr, u) + Vector((0, 0, -0.03 * math.sin(math.pi * u)))  # bord de fuite légèrement creusé
    arms.append(wing_patch(f'arm{s}', lead, trail, 5, lambda u: 0.11 * (1 - 0.55 * u), 0.035, lambda u: 0.01 * u))
ws_arms = join(arms, 'ws_arms')
hp0, hp1 = V3(FLY['hp'][0]), V3(FLY['hp'][1]); kn0, kn1 = V3(FLY['kn'][0]), V3(FLY['kn'][1]); an0, an1 = V3(FLY['an'][0]), V3(FLY['an'][1])
# aile de jambes : envergure de la jambe gauche (u=0) à la droite (u=1) ; « bord d'attaque » = entrejambe, fuite = chevilles en V
leg_lead = lambda u: bez(hp0, Vector((0, 0, 0.18)), hp1, u)
leg_trail = lambda u: bez(an0, Vector((0, 0, 1.12)), an1, u)
ws_legs = wing_patch('ws_legs', leg_lead, leg_trail, 4, lambda u: 0.07, 0.02, lambda u: 0.0)
for o in (ws_arms, ws_legs):
    for p in o.data.polygons:
        p.use_smooth = True
ws = bpy.data.objects.new('ws_wing', None); link(ws)
ws_arms.parent = ws; ws_legs.parent = ws
parts += [ws, ws_arms, ws_legs]

# ============================== EXPORT ==============================
stats = {o.name: tri_count(o) for o in parts if o.type == 'MESH'}
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'gear.blend'))
for o in bpy.data.objects:
    o.select_set(o in parts)
out = os.path.join(ASSETS, 'glb', 'gear.glb')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True, export_animations=False,
                          export_yup=True, export_texcoords=False, export_normals=True)
print('TRIS', stats, 'TOTAL', sum(stats.values()))
print('GLB', os.path.getsize(out))

if '--render' in sys.argv:
    render_setup((900, 600), 32)
    # mise en scène : planches posées, voilure au-dessus
    for o in parts:
        o.hide_render = False
    # rangée lisible : chaque pièce décalée le long de x (Blender), voilure à part
    lay = {'lb_deck': (-1.2, 0, 0.12), 'lb_truck': (-1.2, 0.36, 0.05), 'lb_wheel': (-1.45, 0.36, 0.04),
           'sb_board': (-0.45, 0, 0.02), 'sb_binding': (-0.45, -0.24, 0.03),
           'wk_board': (0.3, 0, 0.02), 'wk_binding': (0.3, -0.27, 0.04), 'wk_handle': (0.3, 0.7, 0.05),
           'ws_wing': (1.25, 0.2, 0.35)}
    for n, loc in lay.items():
        bpy.data.objects[n].location = loc
    render(os.path.join(ASSETS, 'renders', 'gear_34.png'), (0.6, -3.2, 2.4), (0.1, 0, 0.1), 50)
