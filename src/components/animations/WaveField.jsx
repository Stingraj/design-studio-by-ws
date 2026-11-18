import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/gsap';
import { Link } from '../../lib/router';

const SEPARATION = 100;
const AMOUNT_X = 15;
const AMOUNT_Y = 15;
const STATIC_PROGRESS = 0.32;

const hasWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
};

async function createWaveField(container, { reduced, getProgress }) {
  const THREE = await import('three');

  const canvas = document.createElement('canvas');
  canvas.className = 'wave-field__canvas';

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  container.appendChild(canvas);
  const pr = Math.min(2, window.devicePixelRatio || 1);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x07074e, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 1, 10000);
  camera.position.set(0, 0, 1000);

  const count = AMOUNT_X * AMOUNT_Y;
  const positions = new Float32Array(count * 3);
  const grid = new Float32Array(count * 2);
  const accents = new Float32Array(count);

  let i = 0;
  for (let ix = 0; ix < AMOUNT_X; ix++) {
    for (let iy = 0; iy < AMOUNT_Y; iy++) {
      positions[i * 3] = ix * SEPARATION - (AMOUNT_X * SEPARATION) / 2;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = iy * SEPARATION - (AMOUNT_Y * SEPARATION) / 2;
      grid[i * 2] = ix;
      grid[i * 2 + 1] = iy;
      accents[i] = (ix * AMOUNT_Y + iy) % 23 === 0 ? 1 : 0;
      i++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aGrid', new THREE.BufferAttribute(grid, 2));
  geometry.setAttribute('aAccent', new THREE.BufferAttribute(accents, 1));

  const uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: pr },
    uIvory: { value: new THREE.Color('#f5f0e6') },
    uGold: { value: new THREE.Color('#b08d57') },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      attribute vec2 aGrid;
      attribute float aAccent;
      varying float vAlpha;
      varying float vAccent;

      void main() {
        float waveA = sin((aGrid.x + uTime) * 0.3);
        float waveB = sin((aGrid.y + uTime) * 0.5);

        vec3 p = position;
        p.y = waveA * 50.0 + waveB * 50.0;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float depth = max(-mv.z, 1.0);
        gl_Position = projectionMatrix * mv;

        float amp = (waveA + 1.0) + (waveB + 1.0);
        float size = 1.0 + amp * 0.75 + aAccent * 0.8;
        gl_PointSize = clamp(size * uPixelRatio * (900.0 / depth), 1.0, 36.0);

        vAlpha = smoothstep(40.0, 300.0, depth);
        vAccent = aAccent;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform vec3 uIvory;
      uniform vec3 uGold;
      varying float vAlpha;
      varying float vAccent;

      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float a = (1.0 - smoothstep(0.08, 0.5, length(c))) * vAlpha;
        if (a < 0.01) discard;
        gl_FragColor = vec4(mix(uIvory, uGold, vAccent), a * 0.85);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (reduced) renderOnce();
  };

  let time = 0;
  let smoothed = reduced ? STATIC_PROGRESS : 0;

  const applyCamera = (p) => {
    const progress = Math.max(0, Math.min(1, p));
    camera.position.z = 1000 - progress * 1500;
    camera.position.y = Math.sin(progress * 4) * 100;
  };

  const renderOnce = () => {
    uniforms.uTime.value = time;
    applyCamera(smoothed);
    renderer.render(scene, camera);
  };

  let last = 0;
  const frame = (now) => {
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    time += dt * 6;
    const target = getProgress();
    smoothed += (target - smoothed) * Math.min(1, dt * 6.5);
    renderOnce();
  };

  const start = () => {
    if (reduced) return;
    last = 0;
    renderer.setAnimationLoop(frame);
  };
  const stop = () => renderer.setAnimationLoop(null);

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();
  renderOnce();

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) start();
    else stop();
  });
  io.observe(container);

  return () => {
    io.disconnect();
    ro.disconnect();
    stop();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}

export default function WaveField({
  kicker = 'Site Reading',
  title = 'The site speaks before we draw.',
  text = 'Every commission starts as a field of measured points — orientation, levels, the path of light. We read the site until its constraints become the plan.',
  meta = [
    ['Field', '15 × 15 datum grid'],
    ['Reading', 'Levels · Light · Lines of sight'],
  ],
  linkTo = '/process',
  linkLabel = 'How a site becomes a plan',
}) {
  const rootRef = useRef(null);
  const hostRef = useRef(null);
  const railRef = useRef(null);
  const progressRef = useRef(0);
  const [reduced] = useState(() => prefersReducedMotion());
  const [supported] = useState(hasWebGL);

  useEffect(() => {
    if (!supported) return undefined;
    let disposed = false;
    let teardown = () => {};
    createWaveField(hostRef.current, {
      reduced,
      getProgress: () => (reduced ? STATIC_PROGRESS : progressRef.current),
    })
      .then((fn) => {
        if (disposed) fn();
        else teardown = fn;
      })
      .catch((error) => {
        console.error('[WaveField] initialisation failed', error);
      });
    return () => {
      disposed = true;
      teardown();
    };
  }, [supported, reduced]);

  useEffect(() => {
    if (reduced) {
      progressRef.current = STATIC_PROGRESS;
      return undefined;
    }
    const root = rootRef.current;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * 1.7)}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          if (railRef.current) railRef.current.style.transform = `scaleY(${self.progress})`;
        },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const lines = String(title).split('\n');

  return (
    <section
      ref={rootRef}
      className={`wave-field${reduced ? ' wave-field--static' : ''}`}
      aria-labelledby="wave-field-title"
    >
      <div className="wave-field__stage" aria-hidden="true">
        <div className="wave-field__fallback" />
        <div className="wave-field__canvas-host" ref={hostRef} />
        <div className="wave-field__veil" />
        {!reduced && <div className="wave-field__progress"><span ref={railRef} /></div>}
      </div>

      <div className="wave-field__inner">
        <div className="wave-field__copy">
          <span className="sec-roman wave-field__kicker">{kicker}</span>
          <h2 className="wave-field__title" id="wave-field-title">
            {lines.map((line, index) => (
              <span key={line} className="wave-field__line">{line}</span>
            ))}
          </h2>
          <p className="wave-field__text">{text}</p>
        </div>

        <div className="wave-field__aside">
          <dl className="wave-field__meta">
            {meta.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <Link to={linkTo} className="wave-field__link">
            {linkLabel}
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
              <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
