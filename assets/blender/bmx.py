"""BMX freestyle de référence (vertical slice).

Pièces séparées, chacune avec son origine sur le pivot utilisé par le jeu (46-bmx.js) :
  bmx_frame (cadre, selle, plateau, chaîne, pegs arrière)  pivot du tailwhip (0, 0, -0,42)
  bmx_front (fourche, potence, cintre, poignées, pegs avant) pivot du barspin (0, 0, -0,42)
  bmx_wheelR / bmx_wheelF (pneu, jante, 36 rayons, moyeu)   axes des roues
  bmx_crank (manivelles, pédales)                          boîtier de pédalier
Coordonnées données dans le repère du jeu (x latéral, y haut, avant = -z) puis converties en Blender.
Lancer : python3 assets/blender/bmx.py [--render]
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

reset()


def T(x, y, z):
    """repère jeu (Three.js) -> Blender (Z haut) ; l'export glTF (+Y haut) refait la conversion inverse"""
    return (x, -z, y)


M = {
    'frame': material('frame', 0x8a5cff, 0.3, clearcoat=0.8),     # recoloré par look.bmxCol
    'chrome': material('chrome', 0xc9ced4, 0.18, metal=1.0),
    'dark': material('dark', 0x16191d, 0.55),
    'tire': material('tire', 0x141516, 0.85),
    'rim': material('rim', 0xf0b84a, 0.35, metal=0.6),            # recoloré par look.wheel
    'grip': material('grip', 0xff5a36, 0.8),                       # recoloré par look.accent
    'seat': material('seat', 0x1d2026, 0.6),
    'logo': material('logo', 0xf4f1ea, 0.5),
}
PIV = -0.42
BB, HB, HT, ST, RA, FA = (0, .3, .1), (0, .56, -.38), (0, .76, -.42), (0, .66, .26), (0, .26, .47), (0, .26, -.5)


def add(v, d):
    return tuple(a + b for a, b in zip(v, d))


def tube(name, a, b, r, mat, verts=12):
    return tube_between(name, T(*a), T(*b), r, mat, verts)


def path_tube(name, pts, r, mat, verts=10, closed=False):
    """tube lissé le long d'une polyligne (cintre, chaîne)"""
    rings = [{'c': T(*p), 'a': r, 'b': r} for p in pts]
    if closed:
        rings.append(rings[0])
    return loft(name, rings, mat, n=verts, caps=(not closed, not closed), subsurf=0, fwd=(0, 0, 1) if not closed else (1, 0, 0))


def finish(objs, name, pivot):
    ob = join(objs, name)
    me = ob.data
    off = Vector(T(*pivot))
    me.transform(Matrix.Translation(-off))
    ob.location = off
    for p in me.polygons:
        p.use_smooth = True
    return ob


# ======================= CADRE =======================
P = []
P.append(tube('down', BB, HB, 0.025, M['frame'], 16))
P.append(tube('top', ST, HT, 0.021, M['frame'], 16))
P.append(tube('seattube', BB, add(ST, (0, .03, .015)), 0.021, M['frame'], 16))
P.append(tube('headtube', add(HB, (0, -.03, .005)), add(HT, (0, .02, -.005)), 0.03, M['frame'], 18))
P.append(cylinder('bbshell', 0.03, 0.11, T(*BB), M['frame'], 16, rot=(0, math.pi / 2, 0)))
for s in (-1, 1):
    P.append(tube(f'cs{s}', (s * .045, BB[1], BB[2] + .02), (s * .06, RA[1], RA[2]), 0.013, M['frame'], 10))
    P.append(tube(f'ss{s}', (s * .025, ST[1] - .03, ST[2]), (s * .06, RA[1] + .01, RA[2]), 0.012, M['frame'], 10))
    P.append(box(f'drop{s}', (0.008, 0.05, 0.05), T(s * .062, RA[1], RA[2]), M['frame'], bevel=0.006))
    P.append(cylinder(f'peg_r{s}', 0.024, 0.11, T(s * .12, RA[1], RA[2]), M['chrome'], 14, rot=(0, math.pi / 2, 0)))
    P.append(cylinder(f'axlenut_r{s}', 0.012, 0.02, T(s * .07, RA[1], RA[2]), M['dark'], 6, rot=(0, math.pi / 2, 0)))
P.append(tube('gusset', add(HB, (0, .05, .01)), add(HT, (0, -.06, .04)), 0.012, M['frame'], 8))
# selle « pivotal » + tige
P.append(tube('post', add(ST, (0, .02, .01)), (0, .72, .3), 0.014, M['chrome'], 10))
seat = loft('seat', [{'c': T(0, .74, z), 'a': a, 'b': b} for z, a, b in ((.42, .02, .05), (.36, .03, .07), (.28, .028, .055), (.2, .022, .03), (.16, .016, .018))],
            M['seat'], n=12, fwd=(0, 0, 1))
seat.rotation_euler = (math.radians(-12), 0, 0)
P.append(seat)
# plateau 25 dents ajouré + chaîne + pignon
spr = cylinder('sprocket', 0.078, 0.006, (0, 0, 0), M['chrome'], 25)
for k in range(5):
    a = k / 5 * 2 * math.pi
    spr = boolean(spr, cylinder('h', 0.02, 0.05, (0.045 * math.cos(a), 0.045 * math.sin(a), 0), M['chrome'], 10))
spr.rotation_euler = (0, math.pi / 2, 0)
spr.location = T(.055, BB[1], BB[2])
P.append(spr)
P.append(cylinder('cog', 0.03, 0.008, T(.055, RA[1], RA[2]), M['chrome'], 9, rot=(0, math.pi / 2, 0)))
chain = []
for k in range(25):
    a = math.pi / 2 + k / 24 * math.pi
    chain.append((.055, BB[1] + .08 * math.sin(a), BB[2] + .08 * math.cos(a)))
for k in range(13):
    a = -math.pi / 2 + k / 12 * math.pi
    chain.append((.055, RA[1] + .033 * math.sin(a), RA[2] + .033 * math.cos(a)))
P.append(path_tube('chain', chain, 0.005, M['dark'], 6, closed=True))
frame = finish(P, 'bmx_frame', (0, 0, PIV))

# ======================= AVANT (fourche, cintre) =======================
P = []
crown = add(HB, (0, -.03, .01))
P.append(box('crown', (0.12, 0.05, 0.035), T(*crown), M['chrome'], bevel=0.012))
for s in (-1, 1):
    P.append(tube(f'fork{s}', (s * .05, crown[1], crown[2]), (s * .05, FA[1], FA[2]), 0.016, M['chrome'], 12))
    P.append(box(f'fdrop{s}', (0.01, 0.03, 0.04), T(s * .05, FA[1], FA[2]), M['chrome'], bevel=0.005))
    P.append(cylinder(f'peg_f{s}', 0.024, 0.11, T(s * .12, FA[1], FA[2]), M['chrome'], 14, rot=(0, math.pi / 2, 0)))
P.append(tube('steerer', HB, add(HT, (0, .05, 0)), 0.018, M['chrome'], 10))
P.append(box('stem', (0.06, 0.07, 0.07), T(0, .86, -.405), M['dark'], bevel=0.012))
P.append(cylinder('topcap', 0.022, 0.012, T(0, .83, -.42), M['chrome'], 12))
for s in (-1, 1):  # cintre BMX deux pièces : remontée en V + barre transversale
    pts = [(0, .88, -.405), (s * .07, .885, -.405), (s * .13, .93, -.408), (s * .18, .98, -.41), (s * .23, .995, -.41), (s * .37, .997, -.408)]
    P.append(path_tube(f'bar{s}', pts, 0.0115, M['dark'], 10))
    P.append(cylinder(f'grip{s}', 0.019, 0.11, T(s * .315, .997, -.408), M['grip'], 12, rot=(0, math.pi / 2, 0)))
    P.append(cylinder(f'end{s}', 0.021, 0.012, T(s * .375, .997, -.408), M['dark'], 12, rot=(0, math.pi / 2, 0)))
P.append(tube('crossbar', (-.15, .955, -.409), (.15, .955, -.409), 0.009, M['dark'], 8))
front = finish(P, 'bmx_front', (0, 0, PIV))


# ======================= ROUES =======================
def wheel(name):
    P = []
    t = torus(name + '_tire', 0.247, 0.034, (0, 0, 0), M['tire'], seg=40, mseg=10, scale=(1, 1, 1.05))
    t.rotation_euler = (0, math.pi / 2, 0)
    P.append(t)
    r = torus(name + '_rim', 0.214, 0.012, (0, 0, 0), M['rim'], seg=40, mseg=6, scale=(1, 1, 1.6))
    r.rotation_euler = (0, math.pi / 2, 0)
    P.append(r)
    P.append(cylinder(name + '_hub', 0.024, 0.1, (0, 0, 0), M['chrome'], 14, rot=(0, math.pi / 2, 0)))
    for s in (-1, 1):
        P.append(cylinder(f'{name}_fl{s}', 0.034, 0.006, (s * 0.032, 0, 0), M['chrome'], 14, rot=(0, math.pi / 2, 0)))
    for k in range(36):  # rayonnage croisé
        s = 1 if k % 2 else -1
        a0 = k / 36 * 2 * math.pi
        a1 = a0 + s * 0.45
        h = Vector((s * 0.032, 0.032 * math.cos(a0), 0.032 * math.sin(a0)))
        e = Vector((0.0, 0.205 * math.cos(a1), 0.205 * math.sin(a1)))
        P.append(tube_between(f'{name}_sp{k}', h, e, 0.0018, M['chrome'], 4))
    ob = join(P, name)
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


wR = wheel('bmx_wheelR')
wR.location = T(*RA)
wF = wheel('bmx_wheelF')
wF.location = T(*FA)

# ======================= PÉDALIER =======================
P = []
P.append(cylinder('spindle', 0.012, 0.2, (0, 0, 0), M['chrome'], 10, rot=(0, math.pi / 2, 0)))
for s in (-1, 1):
    a = (s * .085, 0, 0)
    P.append(box(f'arm{s}', (0.02, 0.03, 0.19), (s * 0.085, 0, -s * 0.085), M['dark'], bevel=0.008))
    pd = box(f'pedal{s}', (0.1, 0.085, 0.018), (s * 0.135, 0, -s * 0.17), M['dark'], bevel=0.006)
    P.append(pd)
    for px in (-0.035, 0.035):
        for py in (-0.03, 0.03):
            P.append(cylinder(f'pin{s}{px}{py}', 0.003, 0.026, (s * 0.135 + px, py, -s * 0.17), M['chrome'], 4))
crank = join(P, 'bmx_crank')
crank.location = T(*BB)
for p in crank.data.polygons:
    p.use_smooth = True

parts = [frame, front, wR, wF, crank]
os.makedirs(os.path.join(ASSETS, 'glb'), exist_ok=True)
stats = {o.name: tri_count(o) for o in parts}
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'bmx.blend'))
for o in bpy.data.objects:
    o.select_set(o in parts)
bpy.ops.export_scene.gltf(filepath=os.path.join(ASSETS, 'glb', 'bmx.glb'), export_format='GLB', use_selection=True,
                          export_animations=False, export_yup=True, export_texcoords=False, export_normals=True)
print('TRIS', stats, 'TOTAL', sum(stats.values()))
print('GLB', os.path.getsize(os.path.join(ASSETS, 'glb', 'bmx.glb')))

if '--render' in sys.argv:
    render_setup((900, 640), 24)
    render(os.path.join(ASSETS, 'renders', 'bmx_side.png'), (2.4, 0.3, 0.7), (0, 0.0, 0.5), 45)
    render(os.path.join(ASSETS, 'renders', 'bmx_34.png'), (1.3, -1.5, 1.2), (0, 0.0, 0.5), 45)
