"""Toits de Paris (parkour) → assets/glb/paris.glb.

Repère Blender (Z en haut) ; origine au sol de l'objet.

  pa_chimney  souche de cheminée en plâtre et brique, 0,8 × 0,8 × 2,6 m (exactement la boîte de collision du jeu),
              corniche, chapeau et 4 mitrons en terre cuite qui dépassent au-dessus (décor)
  pa_dormer   lucarne de toit mansardé : fronton, fenêtre à petits bois, couverture en zinc ; façade vers -Y,
              profondeur 0,7 m ; posée par le jeu sur le brisis (bandeau de zinc du dernier étage)

Lancer : python3 assets/blender/paris.py [--render]
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

reset()
HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.dirname(HERE)

M = {
    'plaster': material('plaster', 0xd9cdb6, 0.85),
    'brick': material('brick', 0xa65a3f, 0.8),
    'pot': material('pot', 0xc0603a, 0.7),
    'zinc': material('zinc', 0x8d98a3, 0.45, metal=0.5),
    'frame': material('frame', 0xf1ede4, 0.6),
    'glass': material('glass', 0x2a3550, 0.15),
}
parts = []

# ---------------- souche de cheminée ----------------
P = [box('stack', (0.8, 0.8, 2.3), (0, 0, 1.15), M['plaster']),
     box('band', (0.84, 0.84, 0.12), (0, 0, 1.6), M['brick']),
     box('top', (0.82, 0.82, 0.3), (0, 0, 2.45), M['brick']),
     box('cornice', (0.92, 0.92, 0.06), (0, 0, 2.6), M['plaster'])]
for i, (x, y) in enumerate(((-0.2, -0.2), (0.2, -0.2), (-0.2, 0.2), (0.2, 0.2))):
    h = 0.42 + 0.1 * (i % 2)
    P.append(cylinder('pot', 0.09, h, (x, y, 2.63 + h / 2), M['pot'], 8, r2=0.07))
    P.append(cylinder('rim', 0.085, 0.04, (x, y, 2.63 + h + 0.02), M['pot'], 8, r2=0.095))
chim = join(P, 'pa_chimney'); parts.append(chim)

# ---------------- lucarne ----------------
P = [box('cheek', (1.3, 0.7, 1.5), (0, 0.35 - 0.7, 0.75), M['plaster'])]
P[0].location.y = -0.35
# fronton triangulaire (prisme) en zinc
bm_pts = [(-0.75, 0, 1.5), (0.75, 0, 1.5), (0, 0, 2.05)]
roof = bpy.data.meshes.new('roofm')
verts = [(x, y, z) for (x, _, z) in bm_pts for y in (0.05, -0.78)]
faces = [(0, 2, 4), (1, 5, 3), (0, 1, 3, 2), (2, 3, 5, 4), (4, 5, 1, 0)]
roof.from_pydata(verts, [], faces)
roof.materials.append(M['zinc'])
ro = link(bpy.data.objects.new('roof', roof))
P.append(ro)
P.append(box('frame', (0.86, 0.06, 1.12), (0, -0.71, 0.72), M['frame']))
P.append(box('glass', (0.7, 0.03, 0.98), (0, -0.73, 0.72), M['glass']))
P.append(box('mullion', (0.04, 0.05, 0.98), (0, -0.75, 0.72), M['frame']))
for z in (0.45, 0.72, 0.99):
    P.append(box('transom', (0.7, 0.05, 0.03), (0, -0.75, z), M['frame']))
P.append(box('sill', (1.0, 0.16, 0.06), (0, -0.78, 0.13), M['plaster']))
dormer = join(P, 'pa_dormer'); parts.append(dormer)

stats = {o.name: tri_count(o) for o in parts}
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'paris.blend'))
for o in bpy.data.objects:
    o.select_set(o in parts)
out = os.path.join(ASSETS, 'glb', 'paris.glb')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True, export_animations=False,
                          export_yup=True, export_texcoords=False, export_normals=True)
print('TRIS', stats, 'TOTAL', sum(stats.values()))
print('GLB', os.path.getsize(out))

if '--render' in sys.argv:
    render_setup((800, 600), 32)
    chim.location = (-0.9, 0, 0)
    dormer.location = (0.9, 0, 0)
    render(os.path.join(ASSETS, 'renders', 'paris_props.png'), (1.2, -6.5, 2.6), (0, 0, 1.4), 40)
