"""2.5D shot builder — run inside Blender:
  blender -b --factory-startup --python build_shot.py -- shot.json

The client render is re-projected along its own camera rays using a monocular depth map, so the
original viewpoint reproduces the approved render exactly; small camera moves create true parallax.
No geometry is invented: every vertex is a pixel of the client's render pushed to its estimated depth.

shot.json: {"plate": ".../p1-s08.jpg", "depth": ".../p1-s08.png", "out": ".../frames/",
            "seconds": 9, "move": "push", "strength": 1.0, "res": [1920,1080], "samples": 16,
            "hfov": 70, "overscan": 1.10, "near": 1.6, "far": 5.5, "dof": 0, "fps": 24}
"""
import bpy, json, math, os, sys
import numpy as np
from mathutils import Euler, Vector
from bpy_extras.object_utils import world_to_camera_view

args = sys.argv[sys.argv.index('--') + 1:]
S = json.load(open(args[0]))
FPS = S.get('fps', 24)
NFR = round(S['seconds'] * FPS)
RES = S.get('res', [1920, 1080])

bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene
scn.render.engine = 'BLENDER_EEVEE'
scn.render.resolution_x, scn.render.resolution_y = RES
scn.render.resolution_percentage = 100
scn.render.fps = FPS
scn.frame_start, scn.frame_end = 1, NFR
try:
    scn.view_settings.view_transform = 'Standard'   # emission must reproduce the render 1:1
    scn.view_settings.look = 'None'
except Exception as e:
    print('view transform', e)
scn.eevee.taa_render_samples = S.get('samples', 16)
scn.render.image_settings.file_format = 'JPEG'
scn.render.image_settings.quality = S.get('jpeg_q', 95)
scn.render.filepath = os.path.join(S['out'], '')
scn.render.use_overwrite = False                  # resumable
scn.render.use_placeholder = True
world = bpy.data.worlds.new('w'); scn.world = world
world.color = (0.94, 0.93, 0.91)

# ---------- plate mesh ----------
img = bpy.data.images.load(S['plate']); img.colorspace_settings.name = 'sRGB'
W, H = img.size
aspect = W / H
dimg = bpy.data.images.load(S['depth']); dimg.colorspace_settings.name = 'Non-Color'
dw, dh = dimg.size
depth = np.array(dimg.pixels[:], dtype=np.float32).reshape(dh, dw, -1)[..., 0]  # bottom-up rows

NX = 360; NY = max(2, round(NX / aspect))
us = np.linspace(0, 1, NX); vs = np.linspace(0, 1, NY)
uu, vv = np.meshgrid(us, vs)
# box-blur depth a little to soften rubber-sheet tearing at silhouettes
k = 5
pad = np.pad(depth, k, mode='edge')
cs = pad.cumsum(0).cumsum(1)
blur = (cs[2*k:, 2*k:] - cs[:-2*k, 2*k:] - cs[2*k:, :-2*k] + cs[:-2*k, :-2*k]) / (2*k) ** 2
blur = np.pad(blur, ((0, dh - blur.shape[0]), (0, dw - blur.shape[1])), mode='edge')
d = blur[(vv * (dh - 1)).astype(int), (uu * (dw - 1)).astype(int)]
near, far = S.get('near', 1.6), S.get('far', 5.5)
z = 1.0 / (1.0 / far + d * (1.0 / near - 1.0 / far))
tx = math.tan(math.radians(S.get('hfov', 70)) / 2)
ty = tx / aspect
X = (uu - 0.5) * 2 * tx * z
Y = (vv - 0.5) * 2 * ty * z
verts = np.stack([X, Y, -z], -1).reshape(-1, 3)
faces = []
for j in range(NY - 1):
    for i in range(NX - 1):
        a = j * NX + i
        faces.append((a, a + 1, a + NX + 1, a + NX))
me = bpy.data.meshes.new('plate'); me.from_pydata(verts.tolist(), [], faces); me.update()
uvl = me.uv_layers.new(name='UV')
uvs = np.stack([uu, vv], -1).reshape(-1, 2)
loop_v = np.zeros(len(me.loops), dtype=np.int32); me.loops.foreach_get('vertex_index', loop_v)
uvl.data.foreach_set('uv', uvs[loop_v].ravel())
ob = bpy.data.objects.new('plate', me); scn.collection.objects.link(ob)
mat = bpy.data.materials.new('plate'); mat.use_nodes = True
nt = mat.node_tree; nt.nodes.clear()
tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img; tex.interpolation = 'Cubic'; tex.extension = 'EXTEND'
em = nt.nodes.new('ShaderNodeEmission'); out = nt.nodes.new('ShaderNodeOutputMaterial')
nt.links.new(tex.outputs['Color'], em.inputs['Color']); nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
me.materials.append(mat)

# ---------- camera ----------
cam_d = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', cam_d); scn.collection.objects.link(cam)
scn.camera = cam
out_aspect = RES[0] / RES[1]
t_out = min(tx, ty * out_aspect) / S.get('overscan', 1.10)
cam_d.sensor_fit = 'HORIZONTAL'; cam_d.angle = 2 * math.atan(t_out)
cam_d.clip_start, cam_d.clip_end = 0.05, 100
focus = float(np.median(z[NY//3:2*NY//3, NX//3:2*NX//3]))
if S.get('dof'):
    cam_d.dof.use_dof = True; cam_d.dof.focus_distance = S.get('focus', focus); cam_d.dof.aperture_fstop = S['dof']

M = S.get('move', 'push'); g = S.get('strength', 1.0)
def pose(m, s):
    """(location, euler) at amount s∈[0,1] of move m, before strength scaling."""
    yaw_for = lambda x: math.atan2(x, focus)
    if m == 'push':      return Vector((0, 0.03*s, -0.42*s)), Euler((0, 0, 0))
    if m == 'pull':      return Vector((0, 0.03*(1-s), -0.42*(1-s))), Euler((0, 0, 0))
    if m == 'truck_r':   x = -0.20 + 0.40*s; return Vector((x, 0, -0.12)), Euler((0, yaw_for(x), 0))
    if m == 'truck_l':   x = 0.20 - 0.40*s;  return Vector((x, 0, -0.12)), Euler((0, yaw_for(x), 0))
    if m == 'rise':      y = -0.14 + 0.28*s; return Vector((0, y, -0.18)), Euler((-math.atan2(y, focus) * 0.6, 0, 0))
    if m == 'arc_r':     x = -0.24 + 0.48*s; return Vector((x, 0.02, -0.25 + 0.12*abs(x))), Euler((0, yaw_for(x) * 1.3, 0))
    if m == 'arc_l':     x = 0.24 - 0.48*s;  return Vector((x, 0.02, -0.25 + 0.12*abs(x))), Euler((0, yaw_for(x) * 1.3, 0))
    if m == 'hold':      return Vector((0, 0, -0.06*s)), Euler((0, 0, 0))
    raise ValueError(m)

def scaled(m, s, k):
    loc, rot = pose(m, s)
    return loc * k, Euler((rot.x * k, rot.y * k, rot.z * k))

# boundary vertices of the plate (world space == mesh space)
idx = np.arange(NX * NY).reshape(NY, NX)
bounds = {'L': verts[idx[:, 0]], 'R': verts[idx[:, -1]], 'B': verts[idx[0, :]], 'T': verts[idx[-1, :]]}
def covers(k):
    for s in np.linspace(0, 1, 9):
        loc, rot = scaled(M, s, k)
        cam.location = loc; cam.rotation_euler = rot
        bpy.context.view_layer.update()
        pr = {key: np.array([world_to_camera_view(scn, cam, Vector(p))[:2] for p in v[::4]]) for key, v in bounds.items()}
        if pr['L'][:, 0].max() > -0.003 or pr['R'][:, 0].min() < 1.003 or pr['B'][:, 1].max() > -0.003 or pr['T'][:, 1].min() < 1.003:
            return False
    return True
k = g
while k > 0.05 and not covers(k):
    k *= 0.85
print(f'MOVE {M} strength requested={g} used={k:.2f} focus={focus:.2f}m frames={NFR}')

def ease(t):   # cinematic ease-in-out (smootherstep)
    return t * t * t * (t * (t * 6 - 15) + 10)
for f in range(1, NFR + 1, 2 if NFR > 2 else 1):
    s = ease((f - 1) / max(1, NFR - 1))
    loc, rot = scaled(M, s, k)
    cam.location = loc; cam.rotation_euler = rot
    cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f)
if S.get('rack'):
    a, b = S['rack']
    cam_d.dof.focus_distance = a; cam_d.dof.keyframe_insert('focus_distance', frame=1)
    cam_d.dof.focus_distance = b; cam_d.dof.keyframe_insert('focus_distance', frame=NFR)

if S.get('save_blend'):
    bpy.ops.wm.save_as_mainfile(filepath=S['save_blend'])
if not S.get('no_render'):
    bpy.ops.render.render(animation=True)
