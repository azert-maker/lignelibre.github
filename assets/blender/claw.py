"""Machine à pinces (modèle fourni par Jean, assets/third_party/claw_machine/Claw_Machine_Free.blend) → assets/glb/claw.glb.

Nœuds exportés (repère Three.js : machine centrée, sol à 0, façade vers +Z) :
  claw_machine            meuble, vitres, logo, lampes, bouton, levier, roulettes, trappe à lots (statique)
  claw_bar                barre transversale (avance / recule en Z)
  claw_carriage           chariot sur la barre (glisse en X)
  claw_head               tête de pince (descend en Y) ; enfants claw_finger0..2 (charnière à l'origine)
  toy_<animal>            14 peluches, origine au centre de la base, échelle 0,7
Extras sur claw_machine : zone de jeu (x, z min/max), hauteur du plancher, position de la trappe.
Textures réduites à 512 px (WEBP) pour garder le jeu en un seul fichier léger.
Lancer : python3 assets/blender/claw.py [--render]
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

SRC = os.path.join(ASSETS, 'third_party', 'claw_machine', 'Claw_Machine_Free.blend')
bpy.ops.wm.open_mainfile(filepath=SRC, load_ui=False, use_scripts=False)
CX, CY = -3.576, 0.01          # centre du meuble (Blender)
SHIFT = Matrix.Translation((-CX, -CY, 0))
TOYS = ['Bear', 'Cat', 'Chick', 'Crocodile', 'Dog', 'Elephant', 'Fox', 'Koala', 'Lion', 'Panda', 'Penguin', 'Pig', 'Rabbit', 'Shark', 'Unicorn']
for n in ['Text', 'Text.001', 'Text.002', 'Text.003', 'ColorSet_01', 'ColorSet_02', 'ColorSet_03', 'ColorSet_04']:
    o = bpy.data.objects.get(n)
    if o: bpy.data.objects.remove(o, do_unlink=True)
dg = bpy.context.evaluated_depsgraph_get()

def baked(names, name, origin):
    """fusionne des objets (transformations appliquées) avec une origine donnée (Blender, après recentrage)"""
    bm = bmesh.new(); mats = []
    for n in names:
        ob = bpy.data.objects[n]
        me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg), depsgraph=dg)
        me.transform(Matrix.Translation(-origin) @ SHIFT @ ob.matrix_world)
        tmp = bmesh.new(); tmp.from_mesh(me)
        for f in tmp.faces:
            m = me.materials[f.material_index] if me.materials else None
            if m not in mats: mats.append(m)
            f.material_index = mats.index(m)
        me2 = bpy.data.meshes.new('t'); tmp.to_mesh(me2); tmp.free(); bm.from_mesh(me2); bpy.data.meshes.remove(me2); bpy.data.meshes.remove(me)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for m in mats: me.materials.append(m)
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob); ob.location = origin
    return ob

def loc(n):
    return SHIFT @ bpy.data.objects[n].matrix_world.translation

static = ['Toy_Claw_01', 'Toy_Claw_Logo_01', 'Lamps_01', 'Button_01', 'Lever_01', 'Cap_01'] + [o.name for o in bpy.data.objects if o.name.startswith('Wheel')]
machine = baked(static, 'claw_machine', Vector((0, 0, 0)))
bar = baked(['Claw_Mechanism_01'], 'claw_bar', loc('Claw_Mechanism_01'))
carriage = baked(['Claw_Mechanism_02', 'Claw_Piston_01'], 'claw_carriage', loc('Claw_Mechanism_02'))
head = baked(['Claw_Piston_02'], 'claw_head', loc('Claw_Piston_02'))
fingers = [baked([n], f'claw_finger{i}', loc(n)) for i, n in enumerate(['Claw_01', 'Claw_01.001', 'Claw_01.002'])]
# hiérarchie : barre > chariot > tête > doigts
for child, parent in [(carriage, bar), (head, carriage)] + [(f, head) for f in fingers]:
    w = child.matrix_world.copy(); child.parent = parent; child.matrix_world = w
toys = []
for t in TOYS:
    ob = bpy.data.objects.get(f'{t}_01')
    if not ob: continue
    ws = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    base = Vector(((min(v.x for v in ws) + max(v.x for v in ws)) / 2, (min(v.y for v in ws) + max(v.y for v in ws)) / 2, min(v.z for v in ws)))
    base = SHIFT @ base
    to = baked([ob.name], f'toy_{t.lower()}', base)
    to.data.transform(Matrix.Scale(0.7, 4)); to.location = (0, 0, 0)
    md = to.modifiers.new('dec', 'DECIMATE'); md.ratio = 0.5   # peluches : -50 % de triangles
    bpy.context.view_layer.update(); to = bake_to_mesh(to, f'toy_{t.lower()}'); to.name = f'toy_{t.lower()}'
    to['h'] = round(max(v.z for v in ws) - min(v.z for v in ws), 3) * 0.7
    toys.append(to)
for o in list(bpy.data.objects):
    if o not in [machine, bar, carriage, head] + fingers + toys:
        bpy.data.objects.remove(o, do_unlink=True)
# zone de jeu (mesurée par lancers de rayons : murs vitrés x ±0,52, y −0,43..0,45 ; plancher z 1,161 ; plafond 2,2)
machine['play'] = {'x0': -0.46, 'x1': 0.46, 'z0': -0.39, 'z1': 0.37, 'floor': 1.161, 'top': 2.1}
machine['chute'] = [-0.34, 1.161, 0.29]     # trappe à lots, coin avant gauche (Three.js)
# textures : 512 px
for im in bpy.data.images:
    if im.size[0] > 512:
        im.scale(512, 512)
stats = {o.name: tri_count(o) for o in [machine, bar, carriage, head] + fingers + toys}
for o in bpy.data.objects: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(ASSETS, 'glb', 'claw.glb'), export_format='GLB', use_selection=True,
                          export_animations=False, export_yup=True, export_texcoords=True, export_normals=True, export_extras=True,
                          export_image_format='WEBP')
print('TRIS', sum(stats.values()), {k: v for k, v in stats.items() if not k.startswith('toy_')}, 'toys', len(toys))
print('GLB', os.path.getsize(os.path.join(ASSETS, 'glb', 'claw.glb')))
if '--render' in sys.argv:
    render_setup((700, 900), 16)
    for i, t in enumerate(toys[:9]):
        t.location = (-0.3 + (i % 3) * 0.3, -0.25 + (i // 3) * 0.25, 1.161)
    render(os.path.join(ASSETS, 'renders', 'claw_front.png'), (0.9, -2.6, 1.9), (0, 0, 1.35), 40)
