"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GPUComputationRenderer, type Variable } from "three/examples/jsm/misc/GPUComputationRenderer.js";

// ── GPU ember field ──────────────────────────────────────────────────────────
// Pyro-style embers simulated on the GPU (GPGPU ping-pong textures):
//   velocity  ← buoyancy + curl-noise turbulence, pointer "wind", click shockwave
//   position  ← integrate, age over a per-particle lifetime, respawn low when burnt out
// A click also re-emits a handful of embers as fast sparks from the cursor.
// Colour cools with age: white-hot → accent gold → dull ember red.
//
// Texture layout
//   position  (x, y, age 0‥1, lifetime s)
//   velocity  (vx, vy, depth 0‥1, seed)

type Props = {
  active: boolean;
  isLight: boolean;
  /** Called when WebGL / float render targets aren't available, so the parent can fall back. */
  onUnavailable?: () => void;
};

// Ashima / Stefan Gustavson 3D simplex noise (MIT)
const SIMPLEX = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

const HASH = /* glsl */ `
float hash(float n){ return fract(sin(n) * 43758.5453123); }
`;

// Same deterministic test in both passes so velocity and position agree on who becomes a spark
const SPARK_TEST = /* glsl */ `
bool isSpark(float seed){
  return uBurst.z > 0.5 && hash(seed * 91.7 + uBurst.w * 13.1) < uBurstFrac;
}
`;

const VELOCITY_SHADER = /* glsl */ `
uniform float uTime;
uniform float uDelta;
uniform float uRise;
uniform float uTurb;
uniform vec2  uMouse;
uniform vec2  uMouseVel;
uniform float uMouseActive;
uniform vec4  uBurst;      // xy = click point, z = 1 on the burst frame, w = burst id
uniform float uBurstFrac;
${SIMPLEX}
${HASH}
${SPARK_TEST}

vec2 curl(vec2 p, float t) {
  const float e = 0.015;
  float n1 = snoise(vec3(p.x, p.y + e, t));
  float n2 = snoise(vec3(p.x, p.y - e, t));
  float n3 = snoise(vec3(p.x + e, p.y, t));
  float n4 = snoise(vec3(p.x - e, p.y, t));
  return vec2(n1 - n2, -(n3 - n4)) / (2.0 * e);
}

void main() {
  vec2 uv  = gl_FragCoord.xy / resolution.xy;
  vec4 pos = texture2D(texturePosition, uv);
  vec4 vel = texture2D(textureVelocity, uv);
  float depth = vel.z;
  float seed  = vel.w;

  // Re-emitted as a spark: spray outward from the click, biased upward
  if (isSpark(seed)) {
    float a = hash(seed * 17.3 + uBurst.w) * 6.2831853;
    float s = mix(0.7, 2.4, hash(seed * 5.1 + uBurst.w * 3.7));
    vec2 dir = normalize(vec2(cos(a), sin(a) * 0.8 + 0.35));
    gl_FragColor = vec4(dir * s, depth, seed);
    return;
  }

  vec2 p = pos.xy;

  // Buoyancy + turbulence: the noise field scrolls upward with the plume
  float t = uTime * 0.11 + depth * 0.7;
  vec2 q = p * 1.15 - vec2(0.0, uTime * 0.09);
  vec2 flow = curl(q, t) + 0.4 * curl(q * 2.6 + 3.3, t * 1.6);
  vec2 target = flow * uTurb * (0.6 + depth * 0.6) + vec2(0.0, uRise * (0.5 + depth * 0.8));
  vel.xy += (target - vel.xy) * (1.0 - exp(-uDelta * 1.5));   // also acts as drag on sparks

  // Pointer acts like a hand through a fire: drags embers along, slight push away
  vec2  d    = p - uMouse;
  float r    = length(d) + 1e-4;
  float near = smoothstep(0.32, 0.0, r) * uMouseActive;
  vel.xy += uMouseVel * near * 3.5 * uDelta;
  vel.xy += (d / r) * near * 0.9 * uDelta;

  // Shockwave on nearby embers
  if (uBurst.z > 0.5) {
    vec2  bd = p - uBurst.xy;
    float br = length(bd) + 1e-4;
    vel.xy += (bd / br) * smoothstep(0.55, 0.0, br) * 1.1;
  }

  float speed = length(vel.xy);
  if (speed > 2.6) vel.xy *= 2.6 / speed;

  gl_FragColor = vec4(vel.xy, depth, seed);
}
`;

const POSITION_SHADER = /* glsl */ `
uniform float uTime;
uniform float uDelta;
uniform float uAspect;
uniform vec4  uBurst;
uniform float uBurstFrac;
${HASH}
${SPARK_TEST}

void main() {
  vec2 uv  = gl_FragCoord.xy / resolution.xy;
  vec4 pos = texture2D(texturePosition, uv);
  vec4 vel = texture2D(textureVelocity, uv);
  float seed = vel.w;

  if (isSpark(seed)) {
    vec2 jitter = (vec2(hash(seed * 3.3), hash(seed * 7.7)) - 0.5) * 0.03;
    gl_FragColor = vec4(uBurst.xy + jitter, 0.0, mix(0.8, 1.7, hash(seed * 2.9 + uBurst.w)));
    return;
  }

  pos.xy += vel.xy * uDelta;
  pos.z  += uDelta / pos.w;

  float halfW = uAspect + 0.1;
  pos.x = mod(pos.x + halfW, 2.0 * halfW) - halfW;

  // Burnt out or left the top: respawn low in the frame, biased toward the bottom edge
  if (pos.z >= 1.0 || pos.y > 1.2) {
    float k = seed * 31.7 + uTime * 1.37;
    pos.x = (hash(k) * 2.0 - 1.0) * halfW;
    pos.y = -1.1 + pow(hash(k + 1.3), 2.5) * 1.4;
    pos.z = 0.0;
    pos.w = mix(2.5, 6.5, hash(k + 2.9));
  }

  gl_FragColor = pos;
}
`;

const RENDER_VERTEX = /* glsl */ `
uniform sampler2D tPos;
uniform sampler2D tVel;
uniform float uSize;
uniform float uTime;
attribute vec2 reference;
varying float vAge;
varying float vDepth;
varying float vSpeed;
varying float vFlicker;

void main() {
  vec4 pos = texture2D(tPos, reference);
  vec4 vel = texture2D(tVel, reference);
  vAge     = pos.z;
  vDepth   = vel.z;
  vSpeed   = smoothstep(0.3, 1.6, length(vel.xy));
  vFlicker = 0.65 + 0.35 * sin(uTime * (5.0 + vel.w * 9.0) + vel.w * 60.0);
  gl_Position  = projectionMatrix * modelViewMatrix * vec4(pos.xy, 0.0, 1.0);
  gl_PointSize = uSize * (0.5 + vDepth * 1.1) * (1.25 - vAge * 0.6) * (1.0 + vSpeed * 0.5);
}
`;

const RENDER_FRAGMENT = /* glsl */ `
uniform vec3  uHot;
uniform vec3  uMid;
uniform vec3  uCool;
uniform float uAlpha;
varying float vAge;
varying float vDepth;
varying float vSpeed;
varying float vFlicker;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;

  float core = pow(1.0 - smoothstep(0.0, 0.22, d), 2.0);
  float halo = pow(1.0 - d * 2.0, 2.0) * 0.45;

  // Heat: young or fast embers burn hotter
  float heat = max(1.0 - vAge, vSpeed);
  vec3 col = mix(uCool, uMid, smoothstep(0.05, 0.55, heat));
  col = mix(col, uHot, smoothstep(0.7, 1.0, heat) * core);

  float life = smoothstep(0.0, 0.06, vAge) * (1.0 - smoothstep(0.65, 1.0, vAge));
  float a = uAlpha * (core + halo) * life * vFlicker * (0.35 + 0.65 * vDepth);
  gl_FragColor = vec4(col, a);
}
`;

const PALETTE = {
  dark:  { hot: "#fff1cf", mid: "#c8a96e", cool: "#7a2a10", alpha: 0.85, blending: THREE.AdditiveBlending },
  light: { hot: "#6b4a12", mid: "#b8943a", cool: "#5a2a14", alpha: 0.7,  blending: THREE.NormalBlending },
};

export function EmberField({ active, isLight, onUnavailable }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Live values read by the render loop without re-running the setup effect
  const activeRef   = useRef(active);
  const themeRef    = useRef<((light: boolean) => void) | null>(null);
  const resumeRef   = useRef<(() => void) | null>(null);
  const fallbackRef = useRef(onUnavailable);
  fallbackRef.current = onUnavailable;

  useEffect(() => {
    activeRef.current = active;
    if (active) resumeRef.current?.();
  }, [active]);

  useEffect(() => { themeRef.current?.(isLight); }, [isLight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      fallbackRef.current?.();
      return;
    }

    const isSmall = window.matchMedia("(max-width: 768px)").matches || navigator.hardwareConcurrency <= 4;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SIZE    = isSmall ? 48 : 96; // ~2.3k / ~9.2k embers
    const COUNT   = SIZE * SIZE;
    const dpr     = Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 1.75);

    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    container.appendChild(canvas);

    let aspect = Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1);
    const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0, 10);
    camera.position.z = 1;
    const scene = new THREE.Scene();

    // ── GPGPU setup ──
    const gpu = new GPUComputationRenderer(SIZE, SIZE, renderer);
    if (!renderer.extensions.has("EXT_color_buffer_float")) gpu.setDataType(THREE.HalfFloatType);

    const pos0 = gpu.createTexture();
    const vel0 = gpu.createTexture();
    const pd = pos0.image.data as Float32Array;
    const vd = vel0.image.data as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      // Start mid-burn across the whole frame so the hero isn't empty on load
      pd[i * 4 + 0] = (Math.random() * 2 - 1) * (aspect + 0.1);
      pd[i * 4 + 1] = Math.random() * 2.2 - 1.1;
      pd[i * 4 + 2] = Math.random();               // age
      pd[i * 4 + 3] = 2.5 + Math.random() * 4;     // lifetime (s)
      vd[i * 4 + 0] = 0;
      vd[i * 4 + 1] = 0.1;
      vd[i * 4 + 2] = Math.random();               // depth layer
      vd[i * 4 + 3] = Math.random() * 100;         // seed
    }

    const velVar: Variable = gpu.addVariable("textureVelocity", VELOCITY_SHADER, vel0);
    const posVar: Variable = gpu.addVariable("texturePosition", POSITION_SHADER, pos0);
    gpu.setVariableDependencies(velVar, [velVar, posVar]);
    gpu.setVariableDependencies(posVar, [velVar, posVar]);

    const burst = new THREE.Vector4(0, 0, 0, 0);
    const vu = velVar.material.uniforms;
    vu.uTime        = { value: 0 };
    vu.uDelta       = { value: 0 };
    vu.uRise        = { value: 0.16 };
    vu.uTurb        = { value: 0.07 };
    vu.uMouse       = { value: new THREE.Vector2(99, 99) };
    vu.uMouseVel    = { value: new THREE.Vector2() };
    vu.uMouseActive = { value: 0 };
    vu.uBurst       = { value: burst };
    vu.uBurstFrac   = { value: isSmall ? 0.06 : 0.035 }; // ~140 / ~320 sparks per click
    const pu = posVar.material.uniforms;
    pu.uTime      = { value: 0 };
    pu.uDelta     = { value: 0 };
    pu.uAspect    = { value: aspect };
    pu.uBurst     = { value: burst };
    pu.uBurstFrac = vu.uBurstFrac;

    const initError = gpu.init();
    if (initError !== null) {
      renderer.dispose();
      canvas.remove();
      fallbackRef.current?.();
      return;
    }

    // ── Points ──
    const geometry = new THREE.BufferGeometry();
    const refs = new Float32Array(COUNT * 2);
    for (let i = 0; i < COUNT; i++) {
      refs[i * 2]     = ((i % SIZE) + 0.5) / SIZE;
      refs[i * 2 + 1] = (Math.floor(i / SIZE) + 0.5) / SIZE;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
    geometry.setAttribute("reference", new THREE.BufferAttribute(refs, 2));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        tPos:   { value: gpu.getCurrentRenderTarget(posVar).texture },
        tVel:   { value: gpu.getCurrentRenderTarget(velVar).texture },
        uSize:  { value: (isSmall ? 6.5 : 5.5) * dpr },
        uTime:  { value: 0 },
        uHot:   { value: new THREE.Color() },
        uMid:   { value: new THREE.Color() },
        uCool:  { value: new THREE.Color() },
        uAlpha: { value: 1 },
      },
      vertexShader: RENDER_VERTEX,
      fragmentShader: RENDER_FRAGMENT,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    const draw = () => renderer.render(scene, camera);

    const applyTheme = (light: boolean) => {
      const p = light ? PALETTE.light : PALETTE.dark;
      material.uniforms.uHot.value.set(p.hot);
      material.uniforms.uMid.value.set(p.mid);
      material.uniforms.uCool.value.set(p.cool);
      material.uniforms.uAlpha.value = p.alpha;
      material.blending = p.blending;
      material.needsUpdate = true;
      if (reduced) draw();
    };
    applyTheme(document.documentElement.classList.contains("light"));
    themeRef.current = applyTheme;

    // ── Resize ──
    const resize = () => {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      aspect = w / h;
      renderer.setSize(w, h, false);
      camera.left = -aspect;
      camera.right = aspect;
      camera.updateProjectionMatrix();
      pu.uAspect.value = aspect;
      if (reduced) draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Reduced motion: a single still frame of embers, no simulation and no pointer reaction
    if (reduced) {
      draw();
      return () => {
        themeRef.current = null;
        ro.disconnect();
        gpu.dispose();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        canvas.remove();
      };
    }

    // ── Pointer → world space ──
    const mouse     = new THREE.Vector2(99, 99);
    const lastMouse = new THREE.Vector2(99, 99);
    const mouseVel  = new THREE.Vector2();
    const inst      = new THREE.Vector2();
    let hasPointer  = false;
    let burstPending: { x: number; y: number } | null = null;
    let burstId = 0;

    const toWorld = (cx: number, cy: number, out: THREE.Vector2) => {
      const r = container.getBoundingClientRect();
      return out.set(((cx - r.left) / r.width * 2 - 1) * aspect, -((cy - r.top) / r.height * 2 - 1));
    };
    const onMove = (e: PointerEvent) => {
      toWorld(e.clientX, e.clientY, mouse);
      if (!hasPointer) lastMouse.copy(mouse);
      hasPointer = true;
    };
    const onDown = (e: PointerEvent) => {
      if (!activeRef.current) return;
      const p = toWorld(e.clientX, e.clientY, new THREE.Vector2());
      burstPending = { x: p.x, y: p.y };
    };
    const onLeave = () => { hasPointer = false; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    // ── Loop ──
    let raf = 0;
    let running = false;
    let last = performance.now();
    let time = 0;

    const tick = (now: number) => {
      if (!activeRef.current || document.hidden) { running = false; return; }
      raf = requestAnimationFrame(tick);

      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      time += dt;

      inst.subVectors(mouse, lastMouse).divideScalar(Math.max(dt, 1e-3));
      if (inst.length() > 20) inst.set(0, 0); // ignore teleports (pointer re-entering)
      mouseVel.lerp(inst, 0.25);
      lastMouse.copy(mouse);

      // Burst is a one-frame impulse
      if (burstPending) {
        burst.set(burstPending.x, burstPending.y, 1, ++burstId % 1000);
        burstPending = null;
      } else {
        burst.z = 0;
      }

      vu.uTime.value = time;
      vu.uDelta.value = dt;
      pu.uTime.value = time;
      pu.uDelta.value = dt;
      vu.uMouse.value.copy(mouse);
      vu.uMouseVel.value.copy(mouseVel);
      vu.uMouseActive.value += ((hasPointer ? 1 : 0) - vu.uMouseActive.value) * Math.min(dt * 6, 1);

      gpu.compute();
      material.uniforms.tPos.value = gpu.getCurrentRenderTarget(posVar).texture;
      material.uniforms.tVel.value = gpu.getCurrentRenderTarget(velVar).texture;
      material.uniforms.uTime.value = time;
      draw();
    };

    const start = () => {
      if (running || !activeRef.current || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    resumeRef.current = start;
    const onVisibility = () => start();
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      resumeRef.current = null;
      themeRef.current = null;
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      gpu.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" aria-hidden />;
}
