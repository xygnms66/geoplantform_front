<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const mountRef = ref<HTMLDivElement>();
let cleanup: (() => void) | null = null;

onMounted(async () => {
  const mount = mountRef.value;
  if (!mount) return;

  const THREE = await import("three");

  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  mount.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 1.2, 9.5);

  scene.add(new THREE.AmbientLight("#8ccfff", 1.15));
  const keyLight = new THREE.PointLight("#60a5fa", 26, 30, 2);
  keyLight.position.set(4, 2.5, 4.5);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight("#c4b5fd", 1.4);
  rimLight.position.set(-4, 3, -5);
  scene.add(rimLight);

  const starPositions = new Float32Array(720 * 3);
  for (let i = 0; i < 720; i += 1) {
    const radius = THREE.MathUtils.randFloat(8, 18);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    const index = i * 3;
    starPositions[index] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[index + 1] = radius * Math.cos(phi);
    starPositions[index + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starsGeometry,
    new THREE.PointsMaterial({ color: "#dbeafe", size: 0.05, transparent: true, opacity: 0.9, sizeAttenuation: true }),
  );
  scene.add(stars);

  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.72, 40, 40), new THREE.MeshBasicMaterial({ color: "#fde68a" }));
  sun.position.set(-1.9, 0.55, -0.6);
  scene.add(sun);
  const sunGlow = new THREE.Mesh(
    new THREE.SphereGeometry(1.06, 32, 32),
    new THREE.MeshBasicMaterial({ color: "#fb923c", transparent: true, opacity: 0.18, side: THREE.BackSide }),
  );
  sun.add(sunGlow);

  const earthGroup = new THREE.Group();
  earthGroup.position.set(1.2, -0.15, 0);
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1.16, 56, 56),
    new THREE.MeshStandardMaterial({
      color: "#1d4ed8",
      emissive: "#0a225d",
      emissiveIntensity: 0.75,
      roughness: 0.72,
      metalness: 0.08,
    }),
  );
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.3, 56, 56),
    new THREE.MeshBasicMaterial({ color: "#67e8f9", transparent: true, opacity: 0.14, side: THREE.BackSide }),
  );
  const latLines = new THREE.Mesh(
    new THREE.SphereGeometry(1.22, 18, 18),
    new THREE.MeshBasicMaterial({ color: "#93c5fd", wireframe: true, transparent: true, opacity: 0.12 }),
  );
  earthGroup.add(earth, atmosphere, latLines);
  scene.add(earthGroup);

  const orbitRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.05, 0.01, 8, 180),
    new THREE.MeshBasicMaterial({ color: "#38bdf8", transparent: true, opacity: 0.16 }),
  );
  orbitRing.rotation.x = Math.PI / 2.7;
  orbitRing.rotation.y = Math.PI / 4.2;
  earthGroup.add(orbitRing);

  const satellitePivot = new THREE.Group();
  satellitePivot.rotation.x = THREE.MathUtils.degToRad(28);
  satellitePivot.rotation.z = THREE.MathUtils.degToRad(-18);
  const satellite = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.18, 0.26),
    new THREE.MeshStandardMaterial({ color: "#f8fafc", metalness: 0.62, roughness: 0.34 }),
  );
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: "#60a5fa",
    emissive: "#2563eb",
    emissiveIntensity: 0.35,
  });
  const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.03, 0.18), panelMaterial);
  leftPanel.position.x = -0.34;
  const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.03, 0.18), panelMaterial);
  rightPanel.position.x = 0.34;
  const antenna = new THREE.Mesh(
    new THREE.ConeGeometry(0.04, 0.12, 16),
    new THREE.MeshStandardMaterial({ color: "#e0f2fe", emissive: "#67e8f9", emissiveIntensity: 0.2 }),
  );
  antenna.position.z = 0.18;
  antenna.rotation.x = Math.PI / 2;
  satellite.add(body, leftPanel, rightPanel, antenna);
  satellite.position.x = 2.05;
  satellitePivot.add(satellite);
  earthGroup.add(satellitePivot);

  const resize = () => {
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(mount);

  const clock = new THREE.Clock();
  let frameId = 0;
  const animate = () => {
    const elapsed = clock.getElapsedTime();
    earth.rotation.y = elapsed * 0.22;
    latLines.rotation.y = -elapsed * 0.08;
    atmosphere.rotation.y = elapsed * 0.12;
    satellitePivot.rotation.y = elapsed * 0.78;
    satellite.rotation.y = elapsed * 1.1;
    stars.rotation.y = elapsed * 0.012;
    sunGlow.scale.setScalar(1 + Math.sin(elapsed * 2.2) * 0.04);
    camera.position.x = Math.sin(elapsed * 0.16) * 0.45;
    camera.position.y = 1.15 + Math.cos(elapsed * 0.22) * 0.18;
    camera.lookAt(0.8, 0, 0);
    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(animate);
  };
  frameId = window.requestAnimationFrame(animate);

  cleanup = () => {
    window.cancelAnimationFrame(frameId);
    observer.disconnect();
    mount.removeChild(renderer.domElement);
    scene.traverse((object: any) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) object.material.forEach((m: any) => m.dispose());
        else object.material.dispose();
      }
    });
    starsGeometry.dispose();
    renderer.dispose();
  };
});

onUnmounted(() => {
  cleanup?.();
});
</script>

<template>
  <div class="solar-spiral-shell">
    <div ref="mountRef" class="solar-spiral-canvas" />
    <div class="solar-spiral-veil" />
    <div class="solar-spiral-hud">
      <span class="solar-spiral-kicker">Solar Spiral</span>
      <strong>轨道观测可视化</strong>
    </div>
    <div class="solar-spiral-readout">
      <div class="solar-spiral-row"><span>Orbital Link</span><strong>Active</strong></div>
      <div class="solar-spiral-row"><span>Telemetry</span><strong>Live Feed</strong></div>
      <div class="solar-spiral-row"><span>Focus</span><strong>Earth Observation</strong></div>
    </div>
  </div>
</template>

<style scoped>
.solar-spiral-shell {
  position: relative;
  overflow: hidden;
  min-height: 260px;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background:
    radial-gradient(circle at 18% 18%, rgba(96, 165, 250, 0.14), transparent 24%),
    linear-gradient(180deg, rgba(4, 11, 25, 0.94), rgba(8, 18, 34, 0.78));
}
.solar-spiral-canvas {
  position: absolute;
  inset: 0;
}
.solar-spiral-canvas :deep(canvas) {
  width: 100%;
  height: 100%;
  display: block;
}
.solar-spiral-veil {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 68% 42%, rgba(37, 99, 235, 0.16), transparent 20%),
    linear-gradient(180deg, rgba(2, 6, 23, 0.04), rgba(2, 6, 23, 0.42));
  pointer-events: none;
}
.solar-spiral-hud {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 8px;
  padding: 22px 22px 0;
  max-width: 280px;
}
.solar-spiral-kicker {
  display: inline-flex;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  color: #bfdbfe;
  background: rgba(59, 130, 246, 0.16);
  border: 1px solid rgba(96, 165, 250, 0.24);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.solar-spiral-hud strong {
  font-size: 26px;
  line-height: 1.05;
  letter-spacing: -0.03em;
}
.solar-spiral-readout {
  position: absolute;
  right: 18px;
  bottom: 18px;
  z-index: 1;
  display: grid;
  gap: 10px;
  min-width: 172px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(6, 12, 27, 0.56);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(10px);
}
.solar-spiral-row {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  color: #9fb0c8;
  font-size: 12px;
}
.solar-spiral-row strong {
  color: #e5eefc;
  font-size: 14px;
}
@media (max-width: 560px) {
  .solar-spiral-shell {
    min-height: 230px;
  }
  .solar-spiral-hud {
    max-width: none;
    padding: 20px 18px 0;
  }
  .solar-spiral-hud strong {
    font-size: 22px;
  }
  .solar-spiral-readout {
    left: 18px;
    right: 18px;
    min-width: 0;
  }
}
</style>
