import React, { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../lib/gsap';

const state = {
  band: {
    amount: 200,
    cutoff: 6,
    scale: 7,
  },
  img: {
    blur: 8,
    cutoff: 3,
    darken: 1,
  },
};

const srgb = (hex, THREE) => {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

async function createBandText(container, canvas, initialText, onFocusInput) {
  const [THREE, { ShaderPass }, { HorizontalBlurShader }, { VerticalBlurShader }] = await Promise.all([
    import('three'),
    import('three/examples/jsm/postprocessing/ShaderPass.js'),
    import('three/examples/jsm/shaders/HorizontalBlurShader.js'),
    import('three/examples/jsm/shaders/VerticalBlurShader.js'),
  ]);

  //////// SETUP

  const pr = Math.min(2, devicePixelRatio);
  const reduced = prefersReducedMotion();

  const scene = new THREE.Scene();
  const world_z = new THREE.Vector3(0, 0, 1);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 4, -4);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: false });
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x0d0e0c, 1);

  const render_update_list = new Set();

  //////// INPUT CANVAS

  const new_input_canvas = (width, height, scale, text) => {
    width *= scale;
    height *= scale;

    const canvas2d = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement('canvas'), { width, height });
    const ctx = canvas2d.getContext('2d');

    let measure_size = Math.min(width, height) / 2 | 0;
    let font_size = measure_size;
    let center_x = width / 2;

    const input = document.createElement('span');
    input.innerText = text;
    input.contentEditable = 'true';
    input.spellcheck = false;
    input.setAttribute('role', 'textbox');
    input.setAttribute('aria-label', 'Editable headline — type your own word');
    input.className = 'band-text__input';
    input.style.cssText = `
      width: fit-content;
      min-width: 1em;

      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);

      line-height: normal;
      text-align: center;
      text-wrap-mode: nowrap;
      white-space: pre;
      caret-color: #d4af37;
      color: #f000;
    `;
    container.appendChild(input);
    input.onfocus = onFocusInput;

    const get_font = (size) => `900 ${size}px Inter, system-ui, sans-serif`;

    const measure_text = (lines) => {
      let max_width = 0;
      let total_height = 0;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'ideographic';
      ctx.font = get_font(measure_size);

      for (const line of lines) {
        const m = ctx.measureText(line);
        max_width = Math.max(max_width, m.width);
        total_height += m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
      }

      const width_ratio = width / Math.max(1, max_width);
      const height_ratio = height / Math.max(1, total_height);
      const min_ratio = Math.min(width_ratio, height_ratio);

      font_size = measure_size * min_ratio | 0;
      input.style.font = get_font(font_size / scale / pr);
    };

    const draw_text = (lines) => {
      ctx.clearRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'ideographic';
      ctx.fillStyle = 'white';
      ctx.font = get_font(font_size);

      const m = ctx.measureText(lines[0]);
      const font_height = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
      const text_height = font_height * lines.length;
      const padding = (height - text_height) / 2;

      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], center_x, padding + font_height * (i + 1));
      }
    };

    const update = () => {
      const value = input.innerText.replace(/\n$/, '');
      const lines = value.split('\n');
      measure_text(lines);
      draw_text(lines);
      instance.onupdate();
    };

    input.oninput = update;

    const resize = (w, h) => {
      width = ctx.canvas.width = w * scale;
      height = ctx.canvas.height = h * scale;
      measure_size = Math.min(width, height) / 2 | 0;
      center_x = width / 2;
    };

    const instance = {
      canvas: canvas2d,
      input,
      resize,
      update,
      onupdate() {},
    };

    return instance;
  };

  const input_scale = 1 / 2 / pr;
  const rect = container.getBoundingClientRect();
  const input_canvas = new_input_canvas(rect.width, rect.height, input_scale, initialText);
  const input_texture = new THREE.CanvasTexture(input_canvas.canvas);

  //////// BLUR PASS

  class BlurFilter {
    constructor(r, width, height, flipY) {
      this.renderer = r;
      this.x_pass = new ShaderPass(HorizontalBlurShader);
      this.y_pass = new ShaderPass(VerticalBlurShader);
      this.rt_a = new THREE.WebGLRenderTarget(width, height, { flipY });
      this.rt_b = this.rt_a.clone();
    }

    setSize(width, height) {
      this.rt_a.setSize(width, height);
      this.rt_b.setSize(width, height);
      this.renderer.initRenderTarget(this.rt_a);
      this.renderer.initRenderTarget(this.rt_b);
      this.x_pass.uniforms.h.value = 1 / width;
      this.y_pass.uniforms.v.value = 1 / height;
    }

    render(texture, repeat) {
      this.renderer.copyTextureToTexture(texture, this.rt_a.texture);
      for (let i = 0; i < repeat; i++) {
        this.x_pass.render(this.renderer, this.rt_b, this.rt_a, 0, false);
        this.y_pass.render(this.renderer, this.rt_a, this.rt_b, 0, false);
      }
      this.renderer.setRenderTarget(null);
    }

    get texture() {
      return this.rt_a.texture;
    }

    dispose() {
      this.x_pass.dispose();
      this.y_pass.dispose();
      this.rt_a.dispose();
      this.rt_b.dispose();
    }
  }

  const blur = new BlurFilter(renderer, 1, 1, true);

  //////// MESH

  const band_geometry = new THREE.PlaneGeometry(2, 2);

  const band_material = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: {
      amount: { value: state.band.amount },
      band_scale: { value: state.band.scale },
      map: { value: blur.texture },
      img_cutoff: { value: state.img.cutoff },
      band_cutoff: { value: 2 ** state.band.cutoff },
      fill_darken: { value: 2 ** state.img.darken },
      bg: { value: srgb('#0d0e0c', THREE) },
      gold: { value: srgb('#b08d57', THREE) },
      ivory: { value: srgb('#f5f0e6', THREE) },
    },
    vertexShader: /* glsl */`
precision highp float;
in vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float amount;
uniform float band_scale;
out vec2 vuv; // vertex uv
out vec2 suv; // screen uv
void main() {
  vec2 pos = position.xy;
  vuv = pos * 0.5 + 0.5;
  // band quad
  pos.y += 1.0;
  pos.y *= 0.5;
  pos.x *= 2.0 * band_scale;
  // spread quads across Z-axis
  float z_step = 4.0 * band_scale / amount;
  float z = 2.0 * band_scale - float(gl_InstanceID) * z_step;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, z, 1.0);
  suv = (gl_Position.xy / gl_Position.w) * 0.5 + 0.5;
}`,
    fragmentShader: /* glsl */`
precision highp float;
in vec2 vuv; // vertex uv
in vec2 suv; // screen uv
uniform sampler2D map;
uniform float img_cutoff;
uniform float band_cutoff;
uniform float fill_darken;
uniform vec3 bg;
uniform vec3 gold;
uniform vec3 ivory;
out vec3 Color;

void main() {
  float y = 1.0 - vuv.y;
  if (y < 0.005 || y > 0.995) discard;

  float a = texture(map, suv).r;
  a *= pow(y, img_cutoff);
  y = pow(y, band_cutoff);
  a = 1.0 - (1.0 - a) * (1.0 - y); // "screen" blending
  if (a < 0.5) discard;

  // 0.5..1.0 -> 1.0..0.0
  a = (1.0 - a) * 2.0;

  Color = mix(bg, mix(gold, ivory, a), pow(a, fill_darken));
}`,
  });

  const bands_mesh = new THREE.InstancedMesh(band_geometry, band_material, state.band.amount);
  bands_mesh.frustumCulled = false;
  bands_mesh.rotation.x = -45 * THREE.MathUtils.DEG2RAD;
  scene.add(bands_mesh);

  const update_blur_rt = () => {
    input_texture.needsUpdate = true;
    blur.render(input_texture, state.img.blur);
  };

  input_canvas.onupdate = () => render_update_list.add(update_blur_rt);

  //////// RENDER

  let time = 0;
  let needsFrame = true;

  const loop = (t) => {
    const dirty = render_update_list.size > 0;
    for (const fn of render_update_list) fn();
    render_update_list.clear();

    const dt = time ? t - time : 0;
    time = t;
    if (!reduced) bands_mesh.rotateOnWorldAxis(world_z, dt * 0.0005);
    else if (!dirty && !needsFrame) return;

    needsFrame = false;
    renderer.render(scene, camera);
  };

  const setRunning = (on) => {
    time = 0;
    renderer.setAnimationLoop(on ? loop : null);
  };

  //////// HELPERS

  const resize = () => {
    const { width: cw, height: ch } = container.getBoundingClientRect();
    if (!cw || !ch) return;
    renderer.setSize(cw, ch, false);

    const width = cw * pr;
    const height = ch * pr;
    blur.setSize(width * input_scale, height * input_scale);
    input_canvas.resize(width, height);
    input_texture.dispose();
    input_canvas.update();
    needsFrame = true;

    if (height > width) {
      camera.left = camera.right = 1;
      camera.top = camera.bottom = height / width;
    } else {
      camera.left = camera.right = width / height;
      camera.top = camera.bottom = 1;
    }
    camera.left *= -1;
    camera.bottom *= -1;
    camera.updateProjectionMatrix();
  };

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  const io = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting));
  io.observe(container);

  return () => {
    io.disconnect();
    ro.disconnect();
    renderer.setAnimationLoop(null);
    input_canvas.input.remove();
    input_texture.dispose();
    blur.dispose();
    band_geometry.dispose();
    band_material.dispose();
    bands_mesh.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };
}

const hasWebGL2 = () => {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
};

export default function BandText({ text = ' Begin ', hint = 'Text is editable — type your own word', label }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [supported] = useState(hasWebGL2);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    if (!supported) return undefined;
    let disposed = false;
    let teardown = () => {};
    (document.fonts?.load?.('900 64px Inter') ?? Promise.resolve())
      .catch(() => {})
      .then(() => {
        if (disposed) return null;
        return createBandText(containerRef.current, canvasRef.current, text, () => setHintVisible(false));
      })
      .then((fn) => {
        if (!fn) return;
        if (disposed) fn();
        else teardown = fn;
      });
    return () => {
      disposed = true;
      teardown();
    };
  }, [supported, text]);

  if (!supported) {
    return (
      <div className="band-text band-text--fallback" aria-label={label}>
        <p className="band-text__fallback">{text.trim()}</p>
      </div>
    );
  }

  return (
    <div className="band-text" ref={containerRef} role="group" aria-label={label}>
      <canvas ref={canvasRef} className="band-text__canvas" aria-hidden="true" />
      <span className={`band-text__hint${hintVisible ? '' : ' is-hidden'}`}>{hint}</span>
    </div>
  );
}
