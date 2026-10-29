"""Modules de snowpark fournis par le propriétaire du projet (assets/third_party/snowpark/*.fbx) → assets/glb/snowpark.glb.

Chaque module devient un nœud sp_<nom>, origine au centre de sa base, axe long le long de -Z Three.js,
matériau unique sur la texture « trim » réduite (256×512 : métal brossé, blanc, rouge).
Lancer : python3 assets/blender/snowpark.py [--render]
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

SRC = os.path.join(ASSETS, 'third_party', 'snowpark')
MODS = {'sp_srail': 'S rail.fbx', 'sp_rail': 'straight rail.fbx', 'sp_press': 'straigt press.fbx', 'sp_aframe': 'aframe.fbx',
        'sp_aflat': 'aflatframe.fbx', 'sp_bonk': 'bonk.fbx', 'sp_kink': 'fat kink.fbx', 'sp_rainbow': 'raimbowpress.fbx'}
reset()
img = bpy.data.images.load(os.path.join(SRC, 'TRIM_BASE_512.png'))
mat = bpy.data.materials.new('trim'); mat.use_nodes = True
b = mat.node_tree.nodes['Principled BSDF']; tx = mat.node_tree.nodes.new('ShaderNodeTexImage'); tx.image = img
mat.node_tree.links.new(tx.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = 0.45; b.inputs['Metallic'].default_value = 0.3
out = []
for name, fn in MODS.items():
    before = set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=os.path.join(SRC, fn))
    new = [o for o in bpy.data.objects if o not in before and o.type == 'MESH']
    bpy.context.view_layer.update()
    ob = join(new, name)
    me = ob.data
    # axe long (le plus grand de X/Y) aligné sur Y Blender (= -Z Three.js), base au sol, centré
    xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]
    if max(xs) - min(xs) > max(ys) - min(ys):
        me.transform(Matrix.Rotation(math.pi / 2, 4, 'Z'))
    xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]; zs = [v.co.z for v in me.vertices]
    me.transform(Matrix.Translation((-(min(xs) + max(xs)) / 2, -(min(ys) + max(ys)) / 2, -min(zs))))
    me.materials.clear(); me.materials.append(mat)
    for p in me.polygons: p.use_smooth = False
    ob['len'] = round(max(ys) - min(ys), 3); ob['h'] = round(max(zs) - min(zs), 3)
    out.append(ob)
for o in list(bpy.data.objects):
    if o not in out: bpy.data.objects.remove(o, do_unlink=True)
for i, o in enumerate(out): o.location = ((i % 4) * 5 - 7.5, (i // 4) * 12 - 6, 0)
stats = {o.name: (tri_count(o), o['len'], o['h']) for o in out}
for o in out: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(ASSETS, 'glb', 'snowpark.glb'), export_format='GLB', use_selection=True, export_texcoords=True,
                          export_normals=True, export_extras=True, export_image_format='JPEG')
print('STATS', stats); print('GLB', os.path.getsize(os.path.join(ASSETS, 'glb', 'snowpark.glb')))
if '--render' in sys.argv:
    render_setup((900, 600), 16)
    render(os.path.join(ASSETS, 'renders', 'snowpark.png'), (14, -22, 12), (0, 0, 0.5), 40)
