<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";

const containerRef = ref<HTMLElement>();

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.OrthographicCamera;
let animationId: number;
let scanLine: THREE.Line;
let dots: THREE.Mesh[] = [];
let resizeObserver: ResizeObserver;

const COLOR = 0x67e8f9;
const R = 100;

function init() {
  const el = containerRef.value!;
  const size = Math.min(el.clientWidth, el.clientHeight);

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-R, R, R, -R, -100, 100);
  camera.position.z = 50;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(size, size);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.borderRadius = "50%";
  el.appendChild(renderer.domElement);

  createRings();
  scanLine = createScanLine();
  dots = createDots();
}

function createRings() {
  const mat = new THREE.LineBasicMaterial({ color: COLOR, transparent: true, opacity: 0.15 });
  [R * 0.32, R * 0.58, R * 0.84].forEach((r) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), 0));
    }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  });
}

function createScanLine() {
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(R * 0.88, 0, 0),
    ]),
    new THREE.LineBasicMaterial({ color: 0xa5f3fc, transparent: true, opacity: 0.6 }),
  );
  scene.add(line);
  return line;
}

function createDots() {
  const list: THREE.Mesh[] = [];
  const count = 15;
  const geo = new THREE.CircleGeometry(1, 12);

  for (let i = 0; i < count; i++) {
    const ringT = (i % 3) / 3;
    const r = R * (0.3 + ringT * 0.55) * (0.85 + Math.random() * 0.15);
    const a = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
    const mat = new THREE.MeshBasicMaterial({ color: COLOR, transparent: true, opacity: 0.7, depthWrite: false });
    const mesh = new THREE.Mesh(geo.clone(), mat);
    mesh.position.set(r * Math.cos(a), r * Math.sin(a), 0);
    mesh.scale.set(2, 2, 1);
    mesh.userData = { phase: Math.random() * Math.PI * 2 };
    scene.add(mesh);
    list.push(mesh);
  }
  return list;
}

let flashTimer = 0;
let flashing: number[] = [];

function animate() {
  const t = performance.now() / 1000;

  scanLine.rotation.z = -t * 0.5;

  flashTimer -= 0.016;
  if (flashTimer <= 0) {
    flashTimer = 2 + Math.random();
    flashing = [];
    const count = Math.random() > 0.5 ? 2 : 1;
    const pool = Array.from({ length: dots.length }, (_, i) => i);
    for (let i = 0; i < count && pool.length; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      flashing.push(pool[idx]);
      pool.splice(idx, 1);
    }
    flashing.forEach((idx) => { dots[idx].userData.flash = 0; });
  }

  dots.forEach((d, i) => {
    const u = d.userData;
    if (flashing.includes(i)) {
      u.flash = (u.flash ?? 0) + 0.04;
      if (u.flash >= 1) {
        flashing = flashing.filter((v) => v !== i);
        u.flash = 1;
      }
      const p = u.flash;
      const s = 1 + Math.sin(p * Math.PI) * 5;
      d.scale.set(s, s, 1);
      d.material.opacity = Math.max(0, 1 - p * 1.5);
    } else {
      u.flash = 1;
      const pulse = Math.sin(t * 0.6 + u.phase) * 0.12;
      d.material.opacity = 0.65 + pulse;
      d.scale.set(2 + pulse * 0.4, 2 + pulse * 0.4, 1);
    }
  });

  renderer.render(scene, camera);
  animationId = requestAnimationFrame(animate);
}

function handleResize() {
  const el = containerRef.value;
  if (!el || !renderer) return;
  const size = Math.min(el.clientWidth, el.clientHeight);
  renderer.setSize(size, size);
}

onMounted(() => {
  init();
  animate();
  resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(containerRef.value!);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId);
  resizeObserver?.disconnect();
  renderer?.dispose();
});
</script>

<template>
  <div ref="containerRef" class="radar-three" />
</template>

<style scoped>
.radar-three {
  position: relative;
  z-index: 1;
  width: 280px;
  height: 280px;
  align-self: center;
  justify-self: center;
  overflow: hidden;
}
</style>
