"""Personnage de référence « Rider » (vertical slice BMX).

Construit entièrement par script (reproductible), riggé sur le squelette du jeu, pondéré, animé, exporté en GLB.
Lancer : python3 assets/blender/rider.py [--render]
Sorties : assets/blender/rider.blend, assets/glb/rider.glb, assets/renders/rider_*.png
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

reset()
# --lo : variante légère (qualité éco, fantômes, autres joueurs) sans subdivision et avec moins de segments
LO = '--lo' in sys.argv
_loft = loft
def loft(*a, **k):
    k['subsurf'] = 0 if LO else min(k.get('subsurf', 1), 1)
    if LO:
        k['n'] = max(8, int(k.get('n', 16) * 0.75))
    return _loft(*a, **k)

# ---------------- palette (recolorée par le jeu via les noms de matériaux) ----------------
M = {
    'skin': material('skin', 0xd9a77f, 0.55),
    'accent': material('accent', 0xff5a36, 0.75),      # maillot / sweat
    'accent2': material('accent2', 0xffd23a, 0.6),     # bandes, logo
    'suit': material('suit', 0x1d2731, 0.85),          # pantalon
    'helmet': material('helmet', 0xf2f2ee, 0.25, clearcoat=1.0),
    'visor': material('visor', 0x0b0e11, 0.08, metal=0.3),
    'shoe': material('shoe', 0x2a3038, 0.7),
    'sole': material('sole', 0xece8de, 0.8),
    'glove': material('glove', 0x1b2026, 0.7),
    'hair': material('hair', 0x2b1d14, 0.7),
    'eye': material('eye_white', 0xf4f1ea, 0.3),
    'iris': material('iris', 0x5a3a22, 0.25),
    'pupil': material('pupil', 0x050506, 0.2),
    'lip': material('lip', 0xa8665a, 0.5),
    'brow': material('brow', 0x2b1d14, 0.8),
    'detail': material('detail', 0x15191e, 0.6),
    'metal': material('metal', 0xb9c0c8, 0.3, metal=1.0),
}

# ---------------- articulations (mêmes positions que le rig du jeu) ----------------
J = {
    'pelvis': (0, 0, 0.96), 'spine': (0, 0, 1.06), 'torso': (0, 0, 1.26), 'neck': (0, 0, 1.66), 'head': (0, 0, 1.71), 'headTop': (0, 0, 1.95),
}
for i, s in enumerate((-1, 1)):
    y = -s  # côté 0 (s=-1) en +Y Blender
    J[f'clav{i}'] = (0, y * 0.07, 1.57)
    J[f'shoulder{i}'] = (0, y * 0.22, 1.57)
    J[f'elbow{i}'] = (0, y * 0.22, 1.27)
    J[f'wrist{i}'] = (0, y * 0.22, 0.97)
    J[f'handEnd{i}'] = (0, y * 0.22, 0.85)
    J[f'hip{i}'] = (0, y * 0.10, 0.91)
    J[f'knee{i}'] = (0, y * 0.10, 0.47)
    J[f'ankle{i}'] = (0, y * 0.10, 0.04)
    J[f'toe{i}'] = (0.21, y * 0.10, 0.03)

def P(k, dx=0, dy=0, dz=0):
    v = J[k]
    return (v[0] + dx, v[1] + dy, v[2] + dz)

parts = {}
TOPM = [M['accent'], M['accent2'], M['detail']]

# ---------------- sweat (buste) : anneaux elliptiques du bassin au col ----------------
def top_zone(c):
    if 1.325 < c.z < 1.385 and c.x > 0.02:
        return 1                                    # bande de poitrine
    if c.z < 1.0:
        return 2                                    # bord-côte
    return 0
torso_rings = [
    (0.975, 0.000, 0.112, 0.162), (1.00, 0.000, 0.116, 0.166), (1.08, 0.004, 0.118, 0.168), (1.18, 0.008, 0.122, 0.172),
    (1.30, 0.012, 0.132, 0.188), (1.40, 0.010, 0.134, 0.205), (1.48, 0.002, 0.126, 0.222), (1.535, -0.006, 0.108, 0.205),
    (1.585, -0.010, 0.080, 0.125), (1.615, -0.005, 0.062, 0.074),
]
parts['top'] = loft('top', [{'c': (cx, 0, z), 'a': a, 'b': b} for z, cx, a, b in torso_rings], TOPM, n=20,
                    caps=(True, False), mat_fn=top_zone)
# capuche roulée au col, poche ventrale, logo
parts['hood'] = torus('hood', 0.085, 0.034, (-0.018, 0, 1.6), M['accent'], scale=(1.05, 1.2, 1), rot=(0, math.radians(-14), 0))
parts['pocket'] = loft('pocket', [{'c': (0.118, 0, z), 'a': 0.012, 'b': w} for z, w in ((1.07, 0.09), (1.12, 0.1), (1.17, 0.085))], M['accent'], n=12)
parts['logo'] = cylinder('logo', 0.03, 0.01, (0.142, 0.07, 1.44), M['accent2'], verts=6, rot=(0, math.pi / 2, 0))

# ---------------- manches + mains (gants) ----------------
for i in range(2):
    y = J[f'shoulder{i}'][1]
    sy = 1 if y > 0 else -1
    rings = [
        (1.565, 0.0, 0.030, 0.030), (1.55, 0.0, 0.064, 0.064), (1.51, 0.0, 0.073, 0.073), (1.42, 0.004, 0.068, 0.066),
        (1.30, 0.004, 0.062, 0.060), (1.25, 0.0, 0.060, 0.058), (1.14, 0.004, 0.057, 0.054), (1.02, 0.004, 0.056, 0.052),
        (0.995, 0.004, 0.050, 0.047),
    ]
    parts[f'sleeve{i}'] = loft(f'sleeve{i}', [{'c': (cx, y - sy * 0.005 * (k == 0), z), 'a': a, 'b': b} for k, (z, cx, a, b) in enumerate(rings)],
                               [M['accent'], M['detail']], n=16, caps=(True, False),
                               mat_fn=lambda c: 1 if c.z < 1.03 else 0)
    # gant : paume + doigts en moufle légèrement fléchie + pouce
    hand = [(1.0, 0.004, 0.034, 0.042), (0.965, 0.008, 0.036, 0.05), (0.92, 0.014, 0.034, 0.054), (0.885, 0.022, 0.030, 0.052),
            (0.855, 0.030, 0.026, 0.046), (0.835, 0.034, 0.020, 0.036)]
    g = loft(f'glove{i}', [{'c': (cx, y, z), 'a': a, 'b': b} for z, cx, a, b in hand], M['glove'], n=12)
    th = loft(f'thumb{i}', [{'c': c, 'a': 0.014, 'b': 0.014} for c in ((0.02, y - sy * 0.03, 0.955), (0.042, y - sy * 0.04, 0.925), (0.055, y - sy * 0.035, 0.9))], M['glove'], n=8)
    parts[f'glove{i}'] = join([g, th], f'glove{i}')

# ---------------- pantalon : bassin + jambes ----------------
def pant_zone(c):
    return 1 if (0.4 < c.z < 0.54 and c.x > 0.03) else 0
parts['hips'] = loft('hips', [{'c': (0, 0, z), 'a': a, 'b': b} for z, a, b in ((1.03, 0.112, 0.162), (0.96, 0.12, 0.172), (0.88, 0.112, 0.168), (0.84, 0.09, 0.15))],
                     M['suit'], n=20)
for i in range(2):
    y = J[f'hip{i}'][1]
    sy = 1 if y > 0 else -1
    rings = [(0.93, 0.0, 0.098, 0.092), (0.84, 0.006, 0.096, 0.09), (0.70, 0.010, 0.088, 0.082), (0.56, 0.008, 0.075, 0.07),
             (0.47, 0.012, 0.070, 0.066), (0.38, 0.0, 0.068, 0.064), (0.24, -0.008, 0.064, 0.06), (0.15, 0.0, 0.068, 0.066), (0.10, 0.004, 0.074, 0.072)]
    parts[f'leg{i}'] = loft(f'leg{i}', [{'c': (cx, y + sy * 0.004, z), 'a': a, 'b': b} for z, cx, a, b in rings], [M['suit'], M['detail']], n=16,
                            caps=(False, False), mat_fn=pant_zone)
    parts[f'cargo{i}'] = box(f'cargo{i}', (0.075, 0.025, 0.1), (0.005, y + sy * 0.09, 0.72), M['suit'], bevel=0.012)
parts['belt'] = torus('belt', 0.152, 0.013, (0, 0, 1.025), M['detail'], scale=(0.78, 1.1, 1))

# ---------------- cou, tête, visage ----------------
parts['neck'] = loft('neck', [{'c': (0.004, 0, z), 'a': 0.057, 'b': 0.062} for z in (1.56, 1.64, 1.72)], M['skin'], n=12, caps=(False, False))
head_rings = [  # z, avance du centre, demi-profondeur, demi-largeur
    (1.708, 0.052, 0.030, 0.034), (1.722, 0.040, 0.060, 0.056), (1.748, 0.022, 0.082, 0.074), (1.785, 0.008, 0.097, 0.087),
    (1.825, 0.000, 0.104, 0.092), (1.865, -0.006, 0.103, 0.092), (1.905, -0.010, 0.094, 0.084), (1.935, -0.012, 0.074, 0.066),
    (1.955, -0.012, 0.042, 0.038),
]
parts['head'] = loft('head', [{'c': (cx, 0, z), 'a': a, 'b': b} for z, cx, a, b in head_rings], M['skin'], n=20, subsurf=2)
parts['nose'] = loft('nose', [{'c': c, 'a': a, 'b': b} for c, a, b in (((0.098, 0, 1.828), 0.012, 0.012), ((0.112, 0, 1.802), 0.014, 0.016), ((0.114, 0, 1.79), 0.010, 0.017))],
                     M['skin'], n=10, fwd=(0, 0, 1))
for i, s in enumerate((1, -1)):
    parts[f'ear{i}'] = sphere(f'ear{i}', 0.03, (-0.008, s * 0.092, 1.818), M['skin'], 12, 8, scale=(0.6, 0.35, 1.0))
    y = s * 0.038
    parts[f'eye{i}'] = sphere(f'eye{i}', 0.0175, (0.088, y, 1.835), M['eye'], 16, 10)
    parts[f'iris{i}'] = sphere(f'iris{i}', 0.0095, (0.1035, y, 1.835), M['iris'], 12, 8, scale=(0.4, 1, 1))
    parts[f'pupil{i}'] = sphere(f'pupil{i}', 0.0048, (0.1072, y, 1.835), M['pupil'], 8, 6, scale=(0.4, 1, 1))
    parts[f'brow{i}'] = box(f'brow{i}', (0.012, 0.036, 0.008), (0.1, y * 1.08, 1.862), M['brow'], bevel=0.003, rot=(s * 0.1, 0, 0))
parts['mouth'] = box('mouth', (0.008, 0.038, 0.006), (0.104, 0, 1.758), M['lip'], bevel=0.0025)

# ---------------- cheveux (mèches visibles sous le casque bol) ----------------
hr = sphere('hair', 0.11, (-0.016, 0, 1.872), M['hair'], *((16, 10) if LO else (24, 14)), scale=(1.04, 0.97, 0.98))
parts['hair'] = boolean(hr, box('hcut', (0.2, 0.3, 0.16), (0.16, 0, 1.79), M['hair']))
parts['hair'] = boolean(parts['hair'], box('hcut2', (0.4, 0.4, 0.2), (0, 0, 1.69), M['hair']))

# ---------------- casque intégral v2 (BMX/MX) ----------------
# Coque lissée par anneaux (profil MX : dôme, nuque, mentonnière qui avance), épaisseur réelle (solidify),
# ouverture du masque arrondie, bandes de couleur peintes sur la coque, visière cintrée, masque à écran bombé.
HR_ = [  # z, avance du centre, demi-profondeur, demi-largeur
    (1.688, 0.050, 0.140, 0.108), (1.715, 0.042, 0.156, 0.120), (1.755, 0.026, 0.160, 0.128), (1.80, 0.014, 0.158, 0.133),
    (1.85, 0.008, 0.155, 0.135), (1.90, 0.004, 0.147, 0.131), (1.945, 0.0, 0.128, 0.116), (1.975, -0.004, 0.096, 0.088), (1.993, -0.006, 0.052, 0.048),
]
shell = loft('helmet_full', [{'c': (cx, 0, z), 'a': a, 'b': b} for z, cx, a, b in HR_], M['helmet'],
             n=16 if LO else 22, caps=(False, True), cap_round=0.4)
sol = shell.modifiers.new('sol', 'SOLIDIFY')
sol.thickness = 0.014
sol.offset = -1
shell = bake_to_mesh(shell, 'helmet_full')
port = box('port', (0.2, 0.172, 0.082), (0.2, 0, 1.836), M['helmet'], bevel=0.03, segs=3)
shell = boolean(shell, port)
parts['helmet_full'] = shell
# décors projetés sur la coque (bords nets) : bande centrale, mentonnière peinte, grille d'aération
def from_out(cz, th, y):
    d = Vector((math.cos(th), 0, math.sin(th)))
    return (Vector((0, y, cz)) + d * 0.45, -d)
NS = 18 if LO else 34
parts['helmet_full_stripe'] = surface_patch('helmet_full_stripe', shell, M['accent'],
    [math.radians(24 + 185 * k / NS) for k in range(NS + 1)], [-0.021, 0, 0.021], lambda u, v: from_out(1.84, u, v))
parts['helmet_full_chin'] = surface_patch('helmet_full_chin', shell, M['accent'],
    [math.radians(-48 + 38 * k / 10) for k in range(11)], [-0.075 + 0.15 * k / 8 for k in range(9)], lambda u, v: from_out(1.80, u, v), offset=0.0035, max_dist=0.33)
parts['helmet_full_vent'] = surface_patch('helmet_full_vent', shell, M['detail'],
    [math.radians(-36 + 14 * k / 4) for k in range(5)], [-0.03 + 0.06 * k / 4 for k in range(5)], lambda u, v: from_out(1.80, u, v), offset=0.006, max_dist=0.33)
# visière : plaque cintrée ancrée dans la coque au-dessus du masque
peak = []
for k in range(7):
    t = k / 6
    peak.append({'c': (0.085 + 0.15 * t, 0, 1.942 + 0.022 * t), 'a': 0.005, 'b': 0.084 + 0.016 * t})
parts['helmet_full_peak'] = loft('helmet_full_peak', peak, M['accent'], n=10, fwd=(0, 0, 1), subsurf=0 if LO else 1)
for s in (-1, 1):
    parts[f'helmet_full_screw{s}'] = cylinder(f'helmet_full_screw{s}', 0.009, 0.008, (0.092, s * 0.092, 1.952), M['metal'], 10, rot=(math.pi / 2, 0, 0))
# masque : cadre arrondi + écran bombé teinté + sangle
parts['goggle_frame'] = box('goggle_frame', (0.04, 0.2, 0.072), (0.163, 0, 1.836), M['detail'], bevel=0.02, segs=3)
parts['goggle'] = sphere('goggle', 1.0, (0.178, 0, 1.836), M['visor'], *((16, 10) if LO else (28, 16)), scale=(0.02, 0.086, 0.03))
parts['goggle_strap'] = torus('goggle_strap', 0.152, 0.01, (0.004, 0, 1.842), M['accent2'], scale=(1.03, 0.9, 1), seg=24 if LO else 36, mseg=6)
# casque bol (skate / downhill)
op = sphere('helmet_open', 0.14, (0.0, 0, 1.862), M['helmet'], *((18, 10) if LO else (28, 16)), scale=(1.08, 0.98, 0.95))
parts['helmet_open'] = boolean(op, box('lo2', (0.5, 0.5, 0.3), (0, 0, 1.70), M['helmet']))
for k in range(3):
    parts[f'helmet_open_vent{k}'] = box(f'helmet_open_vent{k}', (0.06, 0.018, 0.012), (0.03 - k * 0.05, 0, 1.993 - k * 0.003), M['detail'], bevel=0.004)

# ---------------- baskets ----------------
for i in range(2):
    y = J[f'ankle{i}'][1]
    sole = box(f'sole{i}', (0.29, 0.112, 0.034), (0.06, y, 0.017), M['sole'], bevel=0.014, segs=3)
    up = loft(f'upper{i}', [{'c': (x, y, z), 'a': a, 'b': b} for x, z, a, b in
                           ((-0.06, 0.075, 0.035, 0.045), (-0.02, 0.07, 0.05, 0.05), (0.05, 0.058, 0.04, 0.052), (0.12, 0.05, 0.03, 0.05), (0.18, 0.045, 0.022, 0.044))],
              M['shoe'], n=12, fwd=(0, 0, 1))
    collar = loft(f'collar{i}', [{'c': (-0.025, y, z), 'a': 0.06, 'b': 0.052} for z in (0.06, 0.12, 0.155)], M['shoe'], n=12, caps=(False, True))
    stripe = box(f'shoestripe{i}', (0.12, 0.112, 0.012), (0.04, y, 0.065), M['accent2'], bevel=0.004, rot=(0, math.radians(-12), 0))
    laces = [box(f'lace{i}{k}', (0.012, 0.05, 0.006), (0.06 + k * 0.025, y, 0.098 - k * 0.008), M['sole'], bevel=0.002) for k in range(3)]
    parts[f'shoe{i}'] = join([sole, up, collar, stripe] + laces, f'shoe{i}')

# ---------------- protections ----------------
for i in range(2):
    parts[f'kneepad{i}'] = box(f'kneepad{i}', (0.035, 0.11, 0.12), P(f'knee{i}', dx=0.078, dz=0.01), M['detail'], bevel=0.025, segs=3)

# =====================================================================
#  SQUELETTE (mêmes noms et pivots que le rig procédural du jeu)
# =====================================================================
arm = bpy.data.armatures.new('rig')
rig = link(bpy.data.objects.new('rig', arm))
bpy.context.view_layer.objects.active = rig
rig.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
EB = arm.edit_bones
def bone(name, a, b, parent=None, connect=False):
    e = EB.new(name)
    e.head = a
    e.tail = b
    if parent:
        e.parent = EB[parent]
        e.use_connect = connect
    e.roll = 0
    return e
bone('pelvis', J['pelvis'], J['spine'])
bone('spine', J['spine'], J['torso'], 'pelvis')
bone('torso', J['torso'], J['neck'], 'spine')
bone('neck', J['neck'], J['head'], 'torso')
bone('head', J['head'], J['headTop'], 'neck')
for i in range(2):
    bone(f'clavicle{i}', J[f'clav{i}'], J[f'shoulder{i}'], 'torso')
    bone(f'upperArm{i}', J[f'shoulder{i}'], J[f'elbow{i}'], f'clavicle{i}')
    bone(f'foreArm{i}', J[f'elbow{i}'], J[f'wrist{i}'], f'upperArm{i}')
    bone(f'hand{i}', J[f'wrist{i}'], J[f'handEnd{i}'], f'foreArm{i}')
    bone(f'upperLeg{i}', J[f'hip{i}'], J[f'knee{i}'], 'pelvis')
    bone(f'lowerLeg{i}', J[f'knee{i}'], J[f'ankle{i}'], f'upperLeg{i}')
    bone(f'foot{i}', J[f'ankle{i}'], J[f'toe{i}'], f'lowerLeg{i}')
bpy.ops.object.mode_set(mode='OBJECT')
BONES = {b.name: (Vector(b.head_local), Vector(b.tail_local)) for b in arm.bones}

# =====================================================================
#  PONDÉRATION : distance aux segments des os autorisés pour chaque pièce
#  (mélange doux aux articulations ; pièces rigides = 100 % sur un os)
# =====================================================================
def seg_dist(p, a, b):
    ab = b - a
    t = max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
    return (a + ab * t - p).length

def skin(ob, bones, rigid=None, fall=0.035):
    apply_transform(ob)
    vg = {n: ob.vertex_groups.new(name=n) for n in (bones if not rigid else [rigid])}
    for v in ob.data.vertices:
        if rigid:
            vg[rigid].add([v.index], 1.0, 'REPLACE')
            continue
        p = v.co
        ds = [(seg_dist(p, *BONES[n]), n) for n in bones]
        dmin = min(d for d, _ in ds)
        ws = [(math.exp(-(d - dmin) / fall), n) for d, n in ds if d - dmin < fall * 4]
        tot = sum(w for w, _ in ws)
        for w, n in ws:
            if w / tot > 0.02:
                vg[n].add([v.index], w / tot, 'REPLACE')
    ob.parent = rig
    m = ob.modifiers.new('arm', 'ARMATURE')
    m.object = rig

ARMB = lambda i: [f'clavicle{i}', f'upperArm{i}', f'foreArm{i}', f'hand{i}']
skin(parts['top'], ['pelvis', 'spine', 'torso', 'neck', 'clavicle0', 'clavicle1'], fall=0.05)
skin(parts['hood'], ['torso', 'neck'], fall=0.04)
skin(parts['logo'], [], rigid='torso')
skin(parts['pocket'], [], rigid='spine')
skin(parts['hips'], ['pelvis', 'upperLeg0', 'upperLeg1'], fall=0.03)
skin(parts['belt'], [], rigid='pelvis')
skin(parts['neck'], ['torso', 'neck', 'head'], fall=0.03)
for i in range(2):
    skin(parts[f'sleeve{i}'], ['torso', f'clavicle{i}', f'upperArm{i}', f'foreArm{i}'], fall=0.03)
    skin(parts[f'glove{i}'], [], rigid=f'hand{i}')
    skin(parts[f'leg{i}'], ['pelvis', f'upperLeg{i}', f'lowerLeg{i}'], fall=0.03)
    skin(parts[f'shoe{i}'], [], rigid=f'foot{i}')
    skin(parts[f'cargo{i}'], [], rigid=f'upperLeg{i}')
    skin(parts[f'kneepad{i}'], [], rigid=f'lowerLeg{i}')
for k, ob in parts.items():
    if ob.parent is None:  # tout le reste est sur la tête
        skin(ob, [], rigid='head')

# regroupement par usage (moins d'appels de dessin dans le jeu) : corps, tête, casque intégral, casque bol
groups = {
    'body': [k for k in parts if not k.startswith(('helmet', 'goggle', 'head', 'hair', 'mouth', 'nose', 'ear', 'eye', 'iris', 'pupil', 'brow'))],
    'face': ['head', 'mouth', 'nose'] + [k for k in parts if k.startswith(('ear', 'eye', 'iris', 'pupil', 'brow'))],
    'hair': ['hair'],
    'helmet_full': [k for k in parts if k.startswith('helmet_full')] + ['goggle', 'goggle_frame', 'goggle_strap'],
    'helmet_open': [k for k in parts if k.startswith('helmet_open')],
}

def join_skinned(keys, name):
    """fusion de pièces déjà pondérées (conserve groupes de sommets et matériaux)"""
    obs = [parts[k] for k in keys]
    bm = bmesh.new()
    mats, groupsN = [], []
    deform = bm.verts.layers.deform.verify()
    for ob in obs:
        names = [g.name for g in ob.vertex_groups]
        for n in names:
            if n not in groupsN:
                groupsN.append(n)
        tmp = bmesh.new()
        tmp.from_mesh(ob.data)
        dl = tmp.verts.layers.deform.verify()
        for f in tmp.faces:
            m = ob.data.materials[f.material_index]
            if m not in mats:
                mats.append(m)
            f.material_index = mats.index(m)
        # renumérote les groupes
        for v in tmp.verts:
            d = dict(v[dl])
            v[dl].clear()
            for gi, w in d.items():
                v[dl][groupsN.index(names[gi])] = w
        me2 = bpy.data.meshes.new('t')
        tmp.to_mesh(me2)
        tmp.free()
        bm.from_mesh(me2)
        bpy.data.meshes.remove(me2)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    new = link(bpy.data.objects.new(name, me))
    for n in groupsN:
        new.vertex_groups.new(name=n)
    new.parent = rig
    mod = new.modifiers.new('arm', 'ARMATURE')
    mod.object = rig
    for p in me.polygons:
        p.use_smooth = True
    for ob in obs:
        bpy.data.objects.remove(ob, do_unlink=True)
    return new

final = {k: join_skinned(v, k) for k, v in groups.items()}

# =====================================================================
#  ANIMATIONS (clips du garage et de l'écran de fin) : idle, celebrate, run
#  En course, le jeu pilote les mêmes os par sa pose procédurale.
# =====================================================================
scn = bpy.context.scene
scn.render.fps = 30
rig.animation_data_create()
PB = rig.pose.bones
for pb in PB:
    pb.rotation_mode = 'XYZ'

def key_pose(frame, rots, loc=None):
    for pb in PB:
        r = rots.get(pb.name, (0, 0, 0))
        pb.rotation_euler = r
        pb.keyframe_insert('rotation_euler', frame=frame)
    PB['pelvis'].location = loc or (0, 0, 0)
    PB['pelvis'].keyframe_insert('location', frame=frame)

def new_action(name, frames):
    act = bpy.data.actions.new(name)
    act.use_fake_user = True
    rig.animation_data.action = act
    for f, rots, loc in frames:
        key_pose(f, rots, loc)
    return act

# axes locaux Blender des os : X = flexion principale pour les membres verticaux
arms_down = lambda sp: {f'upperArm0': (0, 0, 0), 'upperArm1': (0, 0, 0)}
idle = new_action('idle', [
    (1, {'torso': (0.03, 0, 0), 'upperArm0': (0, 0, 0.12), 'upperArm1': (0, 0, -0.12), 'foreArm0': (-0.2, 0, 0), 'foreArm1': (-0.2, 0, 0), 'head': (0, 0, 0.05)}, None),
    (31, {'torso': (-0.02, 0, 0.03), 'upperArm0': (0, 0, 0.15), 'upperArm1': (0, 0, -0.1), 'foreArm0': (-0.25, 0, 0), 'foreArm1': (-0.18, 0, 0), 'head': (0.04, 0, -0.08)}, (0, 0, -0.01)),
    (61, {'torso': (0.03, 0, 0), 'upperArm0': (0, 0, 0.12), 'upperArm1': (0, 0, -0.12), 'foreArm0': (-0.2, 0, 0), 'foreArm1': (-0.2, 0, 0), 'head': (0, 0, 0.05)}, None),
])
cel = new_action('celebrate', [
    (1, {}, None),
    (8, {'upperArm0': (0, 0, 2.6), 'upperArm1': (0, 0, -2.6), 'foreArm0': (-0.3, 0, 0), 'foreArm1': (-0.3, 0, 0), 'spine': (0.0, -0.15, 0), 'head': (0, -0.25, 0)}, (0, 0, 0.05)),
    (14, {'upperArm0': (0, 0, 2.9), 'upperArm1': (0, 0, -2.4), 'foreArm0': (-0.9, 0, 0), 'foreArm1': (-0.2, 0, 0), 'spine': (0.0, -0.2, 0.1), 'head': (0, -0.3, 0.1)}, (0, 0, 0.02)),
    (22, {'upperArm0': (0, 0, 2.5), 'upperArm1': (0, 0, -2.8), 'foreArm0': (-0.2, 0, 0), 'foreArm1': (-0.9, 0, 0), 'spine': (0.0, -0.2, -0.1), 'head': (0, -0.3, -0.1)}, (0, 0, 0.05)),
    (36, {}, None),
])
run_frames = []
for k, ph in enumerate((0, 0.5, 1.0)):
    s = math.cos(ph * 2 * math.pi)
    run_frames.append((1 + k * 10, {'upperLeg0': (0, -0.7 * s, 0), 'upperLeg1': (0, 0.7 * s, 0), 'lowerLeg0': (0, 0.9 * max(0, s) + 0.2, 0), 'lowerLeg1': (0, 0.9 * max(0, -s) + 0.2, 0),
        'upperArm0': (0, 0.6 * s, 0.15), 'upperArm1': (0, -0.6 * s, -0.15), 'foreArm0': (0, -1.0, 0), 'foreArm1': (0, -1.0, 0), 'torso': (0, -0.15, 0)}, (0, 0, -0.03 * abs(s))))
run = new_action('run', run_frames)
rig.animation_data.action = None
for pb in PB:
    pb.rotation_euler = (0, 0, 0)
    pb.location = (0, 0, 0)

# =====================================================================
#  SAUVEGARDE, EXPORT GLB, RENDUS DE CONTRÔLE
# =====================================================================
os.makedirs(os.path.join(ASSETS, 'glb'), exist_ok=True)
os.makedirs(os.path.join(ASSETS, 'renders'), exist_ok=True)
stats = {k: tri_count(o) for k, o in final.items()}
OUT = 'rider_lo' if LO else 'rider'
if not LO:
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'rider.blend'))
for o in bpy.data.objects:
    o.select_set(o.name in final or o.name == 'rig')
bpy.ops.export_scene.gltf(filepath=os.path.join(ASSETS, 'glb', OUT + '.glb'), export_format='GLB', use_selection=True,
                          export_animations=True, export_animation_mode='ACTIONS', export_apply=False, export_yup=True,
                          export_skins=True, export_def_bones=False, export_texcoords=False, export_normals=True)
print('TRIS', stats, 'TOTAL', sum(stats.values()))
print('GLB', os.path.getsize(os.path.join(ASSETS, 'glb', OUT + '.glb')))

if '--render' in sys.argv and not LO:
    final['helmet_open'].hide_render = True
    render_setup((640, 800), 24)
    render(os.path.join(ASSETS, 'renders', 'rider_34.png'), (2.6, -1.9, 1.55), (0, 0, 1.0), 45)
    render(os.path.join(ASSETS, 'renders', 'helmet_front.png'), (0.95, 0.0, 1.84), (0, 0, 1.83), 50)
    render(os.path.join(ASSETS, 'renders', 'helmet_34.png'), (0.7, -0.6, 1.95), (0, 0, 1.83), 50)
    final['helmet_full'].hide_render = True
    render(os.path.join(ASSETS, 'renders', 'rider_face.png'), (0.75, -0.35, 1.84), (0, 0, 1.82), 50)
    final['helmet_full'].hide_render = False
    rig.animation_data.action = cel
    scn.frame_set(14)
    render(os.path.join(ASSETS, 'renders', 'rider_celebrate.png'), (2.4, 1.6, 1.4), (0, 0, 1.1), 45)
