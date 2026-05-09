"use client";

import { useEffect, useRef } from "react";

// ── Shaders ───────────────────────────────────────────────────────────────────

const BG_VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment shader template — %%OCTAVES%% replaced at runtime
const BG_FRAG_TPL = /* glsl */`
precision mediump float;
uniform float uTime;
uniform float uIsLight;
uniform vec2  uMouse;
varying vec2  vUv;

vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}

float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash22(i),             f            ),
        dot(hash22(i + vec2(1,0)), f - vec2(1,0)), u.x),
    mix(dot(hash22(i + vec2(0,1)), f - vec2(0,1)),
        dot(hash22(i + vec2(1,1)), f - vec2(1,1)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < %%OCTAVES%%; i++) {
    v += a * gnoise(p);
    p  = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;

  vec2 md = uMouse - uv;
  uv += md * 0.012 * smoothstep(0.65, 0.0, length(md));

  float t = uTime * 0.035;

  float q1 = fbm(uv * 2.2 + vec2(t,        t * 0.6));
  float q2 = fbm(uv * 1.6 + vec2(-t * 0.4, t * 0.25) + q1 * 0.45);
  float n01 = (q1 * 0.55 + q2 * 0.45) * 0.5 + 0.5;

  float lumD = 0.031 + n01 * 0.036;
  vec3  colD  = vec3(lumD * 0.98, lumD * 0.97, lumD);
  vec3  goldD = vec3(0.784, 0.663, 0.431);
  colD = mix(colD, goldD * lumD * 2.1, smoothstep(0.38, 0.78, n01) * 0.044);

  float lumL = 0.91 + n01 * 0.07;
  vec3  colL  = vec3(lumL, lumL * 0.996, lumL * 0.976);
  vec3  goldL = vec3(0.722, 0.580, 0.227);
  colL = mix(colL, goldL, smoothstep(0.42, 0.80, n01) * 0.028);

  vec3 col = mix(colD, colL, uIsLight);
  gl_FragColor = vec4(col, 1.0);
}
`;

const STAR_VERT = /* glsl */`
attribute float aPhase;
uniform  float uTime;
varying  float vAlpha;
varying  float vIsGold;

void main() {
  float twinkle = 0.5 + 0.5 * sin(uTime * 0.8 + aPhase * 6.28318);
  vAlpha  = 0.15 + twinkle * 0.85;
  vIsGold = step(3.14159, aPhase);
  gl_PointSize = 1.0 + twinkle * 1.5;
  gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const STAR_FRAG = /* glsl */`
precision mediump float;
uniform float uIsLight;
varying float vAlpha;
varying float vIsGold;

void main() {
  vec2  c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = vAlpha * (1.0 - smoothstep(0.15, 0.5, d));

  vec3 whiteD = vec3(1.0);
  vec3 goldD  = vec3(0.784, 0.663, 0.431);
  vec3 whiteL = vec3(0.35, 0.35, 0.35);
  vec3 goldL  = vec3(0.45, 0.36, 0.15);

  vec3 whiteCol = mix(whiteD, whiteL, uIsLight);
  vec3 goldCol  = mix(goldD,  goldL,  uIsLight);
  vec3 col = mix(whiteCol, goldCol, vIsGold);
  float alpha = a * mix(0.72, 0.55, uIsLight);
  gl_FragColor = vec4(col, alpha);
}
`;

// ── Component ─────────────────────────────────────────────────────────────────

function checkWebGL(): boolean {
  try {
    const test = document.createElement("canvas");
    return !!(test.getContext("webgl") || test.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

interface Props { className?: string }

export default function WebGLBackground({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !checkWebGL()) return;

    const isMobile = window.innerWidth < 768;
    const STAR_COUNT = isMobile ? 180 : 260;
    const FBM_OCTAVES = isMobile ? 3 : 4;
    const BG_FRAG = BG_FRAG_TPL.replace("%%OCTAVES%%", String(FBM_OCTAVES));

    let cancelled = false;
    let dispose: (() => void) | undefined;

    import("three").then((THREE) => {
      if (cancelled || !canvas) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));

      const scene  = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      const sizeRenderer = () => {
        const w = canvas.clientWidth  || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        renderer.setSize(w, h, false);
      };
      sizeRenderer();
      const ro = new ResizeObserver(sizeRenderer);
      ro.observe(canvas);

      const isLightVal = () =>
        document.documentElement.classList.contains("light") ? 1.0 : 0.0;

      // ── Background plane ───────────────────────────────────────────────────
      const bgGeo = new THREE.PlaneGeometry(2, 2);
      const bgMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime:    { value: 0 },
          uIsLight: { value: isLightVal() },
          uMouse:   { value: new THREE.Vector2(0.5, 0.5) },
        },
        vertexShader:   BG_VERT,
        fragmentShader: BG_FRAG,
      });
      scene.add(new THREE.Mesh(bgGeo, bgMat));

      // ── Stars ──────────────────────────────────────────────────────────────
      const N   = STAR_COUNT;
      const pos = new Float32Array(N * 3);
      const ph  = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * 2;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 2;
        pos[i * 3 + 2] = 0;
        ph[i]          = Math.random() * Math.PI * 2;
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      starGeo.setAttribute("aPhase",   new THREE.BufferAttribute(ph,  1));
      const starMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime:    { value: 0 },
          uIsLight: { value: isLightVal() },
        },
        vertexShader:   STAR_VERT,
        fragmentShader: STAR_FRAG,
        transparent:    true,
        depthWrite:     false,
      });
      scene.add(new THREE.Points(starGeo, starMat));

      // ── Mouse ──────────────────────────────────────────────────────────────
      const onMove = (e: MouseEvent) => {
        bgMat.uniforms.uMouse.value.set(
          e.clientX / window.innerWidth,
          1 - e.clientY / window.innerHeight
        );
      };
      window.addEventListener("mousemove", onMove, { passive: true });

      // ── Theme observer ─────────────────────────────────────────────────────
      const themeObs = new MutationObserver(() => {
        const v = isLightVal();
        bgMat.uniforms.uIsLight.value   = v;
        starMat.uniforms.uIsLight.value = v;
      });
      themeObs.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      // ── Visibility pausing ─────────────────────────────────────────────────
      let paused = false;
      let isHeroSection = true;

      const updatePause = () => {
        paused = document.hidden || !isHeroSection;
      };

      const onVisibilityChange = () => updatePause();
      document.addEventListener("visibilitychange", onVisibilityChange);

      const onSection = (e: Event) => {
        isHeroSection = (e as CustomEvent<number>).detail === 0;
        updatePause();
      };
      window.addEventListener("snap-section", onSection);

      // ── RAF loop with 60fps cap ────────────────────────────────────────────
      let raf: number;
      let lastT = 0;
      const FPS_CAP = 1000 / 60;

      const tick = (t: number) => {
        raf = requestAnimationFrame(tick);
        if (paused) return;
        if (t - lastT < FPS_CAP - 1) return; // cap at 60fps
        lastT = t;
        const sec = t * 0.001;
        bgMat.uniforms.uTime.value   = sec;
        starMat.uniforms.uTime.value = sec;
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(tick);

      dispose = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        themeObs.disconnect();
        window.removeEventListener("mousemove", onMove);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        window.removeEventListener("snap-section", onSection);
        bgGeo.dispose();
        bgMat.dispose();
        starGeo.dispose();
        starMat.dispose();
        renderer.dispose();
      };
    });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}
    />
  );
}
