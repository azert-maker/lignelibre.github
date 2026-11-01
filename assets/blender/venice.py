"""Mobilier de Venice Beach (boardwalk et skatepark) → assets/glb/venice.glb.

Modélisé directement dans le repère Blender (Z en haut, face avant vers -Y = +z du jeu après export Y-up).
Chaque objet a son origine au sol, au centre de son pied ; le jeu le pose et le tourne (instanciation).

  vk_bench     banc : pieds en béton, 3 lattes de bois pour l'assise, 2 pour le dossier
  vk_bin       poubelle en tonneau peint (couleur 'bin' recolorée par le jeu), anneau et couvercle
  vk_lamp      lampadaire de promenade 4,6 m, crosse et lanterne
  vk_flood     mât d'éclairage du skatepark 9 m, cadre et 4 projecteurs
  vk_fountain  fontaine à boire sur colonne

Lancer : python3 assets/blender/venice.py [--render]
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

reset()
HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.dirname(HERE)

M = {
    'concrete': material('concrete', 0xb9b2a6, 0.9),
    'wood': material('wood', 0xa8743f, 0.7),
    'metal': material('metal', 0x5d646c, 0.45, metal=0.6),
    'bin': material('bin', 0x2b8fb3, 0.6),
    'binrim': material('binrim', 0x2a2e33, 0.5, metal=0.4),
    'glass': material('glass', 0xfff4d6, 0.2, emit=1.5),
    'pole': material('pole', 0x3a4048, 0.5, metal=0.5),
}
parts = []

# ---------------- banc ----------------
P = []
for x in (-0.75, 0.75):
    P.append(box('leg', (0.12, 0.5, 0.42), (x, 0, 0.21), M['concrete']))
    P.append(box('back_leg', (0.1, 0.08, 0.5), (x, 0.24, 0.62), M['concrete'], rot=(-0.18, 0, 0)))
for i, y in enumerate((-0.17, 0.0, 0.17)):
    P.append(box('slat', (1.9, 0.14, 0.045), (0, y, 0.445), M['wood']))
for z in (0.62, 0.78):
    P.append(box('bslat', (1.9, 0.045, 0.12), (0, 0.26 + (z - 0.62) * 0.18, z), M['wood'], rot=(-0.18, 0, 0)))
bench = join(P, 'vk_bench'); parts.append(bench)

# ---------------- poubelle ----------------
P = [cylinder('barrel', 0.29, 0.86, (0, 0, 0.43), M['bin'], 12)]
for z in (0.12, 0.74):
    P.append(torus('hoop', 0.295, 0.014, (0, 0, z), M['binrim'], seg=12, mseg=4))
P.append(cylinder('lid', 0.31, 0.05, (0, 0, 0.885), M['binrim'], 12, r2=0.25))
P.append(cylinder('hole', 0.12, 0.012, (0, 0, 0.915), M['metal'], 10))
binm = join(P, 'vk_bin'); parts.append(binm)

# ---------------- lampadaire ----------------
P = [cylinder('base', 0.14, 0.45, (0, 0, 0.225), M['pole'], 12, r2=0.09),
     cylinder('shaft', 0.06, 4.2, (0, 0, 2.5), M['pole'], 10, r2=0.045)]
arc = [(0, 0, 4.5), (0, -0.25, 4.72), (0, -0.55, 4.7)]
for a, b in zip(arc, arc[1:]):
    P.append(tube_between('arm', a, b, 0.03, M['pole'], 8))
P.append(cylinder('cap', 0.22, 0.1, (0, -0.6, 4.62), M['pole'], 12, r2=0.06))
P.append(cylinder('lantern', 0.13, 0.26, (0, -0.6, 4.44), M['glass'], 12, r2=0.17))
lamp = join(P, 'vk_lamp'); parts.append(lamp)

# ---------------- mât d'éclairage ----------------
P = [cylinder('fbase', 0.3, 0.5, (0, 0, 0.25), M['concrete'], 12),
     cylinder('fshaft', 0.12, 8.6, (0, 0, 4.8), M['pole'], 10, r2=0.08)]
P.append(box('frame', (1.6, 0.1, 0.1), (0, 0, 9.0), M['pole']))
P.append(box('frame2', (1.6, 0.1, 0.1), (0, 0, 9.55), M['pole']))
for x in (-0.55, 0.55):
    for z in (9.0, 9.55):
        P.append(box('head', (0.42, 0.18, 0.34), (x, -0.12, z + 0.1), M['pole'], rot=(0.35, 0, 0)))
        P.append(box('lens', (0.36, 0.02, 0.28), (x, -0.22, z + 0.06), M['glass'], rot=(0.35, 0, 0)))
flood = join(P, 'vk_flood'); parts.append(flood)

# ---------------- fontaine ----------------
P = [cylinder('col', 0.16, 0.85, (0, 0, 0.425), M['concrete'], 14, r2=0.13),
     cylinder('bowl', 0.24, 0.1, (0, 0, 0.9), M['metal'], 16, r2=0.2),
     cylinder('spout', 0.02, 0.08, (0, -0.05, 0.98), M['metal'], 8)]
fountain = join(P, 'vk_fountain'); parts.append(fountain)

stats = {o.name: tri_count(o) for o in parts}
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'venice.blend'))
for o in bpy.data.objects:
    o.select_set(o in parts)
out = os.path.join(ASSETS, 'glb', 'venice.glb')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True, export_animations=False,
                          export_yup=True, export_texcoords=False, export_normals=True)
print('TRIS', stats, 'TOTAL', sum(stats.values()))
print('GLB', os.path.getsize(out))

if '--render' in sys.argv:
    render_setup((900, 600), 32)
    for o, x in ((bench, -2.6), (binm, -1.2), (fountain, -0.4), (lamp, 0.8), (flood, 2.6)):
        o.location = (x, 0, 0)
    render(os.path.join(ASSETS, 'renders', 'venice_props.png'), (0.2, -11, 4.2), (0.1, 0, 3.0), 40)
