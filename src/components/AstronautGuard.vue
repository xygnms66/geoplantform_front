<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";

const props = defineProps<{ passwordFocused: boolean }>();

const containerRef = ref<HTMLElement>();
const mouseX = ref(0.5);
const mouseY = ref(0.5);

function handleMouseMove(e: MouseEvent) {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  mouseX.value = Math.max(0.15, Math.min(0.85, (e.clientX - rect.left) / rect.width));
  mouseY.value = Math.max(0.1, Math.min(0.8, (e.clientY - rect.top) / rect.height));
}

onMounted(() => window.addEventListener("mousemove", handleMouseMove));
onBeforeUnmount(() => window.removeEventListener("mousemove", handleMouseMove));

const eyeX = computed(() => (mouseX.value - 0.5) * 8);
const eyeY = computed(() => (mouseY.value - 0.5) * 5);
</script>

<template>
  <div ref="containerRef" class="astronaut-group">
    <!-- Astronaut 1 - Blue (left) -->
    <div class="astronaut astro-left">
      <svg viewBox="0 0 140 180" width="110" height="140">
        <defs>
          <radialGradient id="helmet1" cx="45%" cy="40%">
            <stop offset="0%" stop-color="#e8eef5" />
            <stop offset="60%" stop-color="#c5d5e8" />
            <stop offset="100%" stop-color="#9ab0c8" />
          </radialGradient>
          <radialGradient id="visor1" cx="35%" cy="30%">
            <stop offset="0%" stop-color="#3a6aaa" />
            <stop offset="50%" stop-color="#1a3a6a" />
            <stop offset="100%" stop-color="#0a1a35" />
          </radialGradient>
          <linearGradient id="suit1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6a9ad5" />
            <stop offset="100%" stop-color="#3a6aaa" />
          </linearGradient>
          <linearGradient id="arm1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#5a8ac5" />
            <stop offset="100%" stop-color="#3a6aaa" />
          </linearGradient>
          <filter id="shadow1"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3" /></filter>
        </defs>
        <!-- Backpack -->
        <rect x="32" y="88" width="76" height="42" rx="8" fill="#4a7ab5" opacity="0.7" />
        <rect x="36" y="92" width="68" height="34" rx="6" fill="#3a6a9a" />
        <circle cx="50" cy="105" r="4" fill="#2a5a8a" stroke="#5a9ad5" stroke-width="1" />
        <circle cx="90" cy="105" r="4" fill="#2a5a8a" stroke="#5a9ad5" stroke-width="1" />
        <rect x="60" y="95" width="20" height="6" rx="2" fill="#2a5a8a" />
        <rect x="63" y="97" width="4" height="2" rx="1" fill="#5ada5a" />
        <rect x="69" y="97" width="4" height="2" rx="1" fill="#da5a5a" />
        <!-- Legs -->
        <rect x="46" y="138" width="18" height="28" rx="8" fill="url(#suit1)" />
        <rect x="76" y="138" width="18" height="28" rx="8" fill="url(#suit1)" />
        <ellipse cx="55" cy="168" rx="12" ry="6" fill="#c5d5e8" />
        <ellipse cx="85" cy="168" rx="12" ry="6" fill="#c5d5e8" />
        <ellipse cx="55" cy="166" rx="11" ry="5" fill="#d8e4f0" />
        <ellipse cx="85" cy="166" rx="11" ry="5" fill="#d8e4f0" />
        <!-- Body -->
        <ellipse cx="70" cy="120" rx="30" ry="28" fill="url(#suit1)" filter="url(#shadow1)" />
        <rect x="54" y="102" width="32" height="22" rx="5" fill="#4a7ab5" stroke="#6aaaf5" stroke-width="0.8" />
        <rect x="58" y="106" width="10" height="3" rx="1" fill="#2a5a8a" />
        <rect x="58" y="111" width="10" height="3" rx="1" fill="#2a5a8a" />
        <circle cx="78" cy="108" r="3" fill="#2a5a8a" stroke="#5a9ad5" stroke-width="0.6" />
        <circle cx="78" cy="116" r="2" fill="#5ada5a">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <!-- Left arm -->
        <path
          d="M42 108 Q28 115 24 130 Q22 138 28 142"
          stroke="url(#arm1)"
          stroke-width="14"
          fill="none"
          stroke-linecap="round"
        />
        <ellipse cx="28" cy="144" rx="8" ry="6" fill="#c5d5e8" />
        <ellipse cx="24" cy="141" rx="3" ry="2.5" fill="#c5d5e8" />
        <ellipse cx="28" cy="139" rx="3" ry="2.5" fill="#c5d5e8" />
        <ellipse cx="32" cy="140" rx="2.8" ry="2.3" fill="#c5d5e8" />
        <!-- Right arm -->
        <path
          d="M98 108 Q112 115 116 130 Q118 138 112 142"
          stroke="url(#arm1)"
          stroke-width="14"
          fill="none"
          stroke-linecap="round"
        />
        <ellipse cx="112" cy="144" rx="8" ry="6" fill="#c5d5e8" />
        <ellipse cx="108" cy="140" rx="2.8" ry="2.3" fill="#c5d5e8" />
        <ellipse cx="112" cy="139" rx="3" ry="2.5" fill="#c5d5e8" />
        <ellipse cx="116" cy="141" rx="3" ry="2.5" fill="#c5d5e8" />
        <!-- Neck ring -->
        <ellipse cx="70" cy="88" rx="28" ry="8" fill="#9ab0c8" />
        <ellipse cx="70" cy="87" rx="26" ry="7" fill="#b8cce0" />
        <!-- Helmet -->
        <circle cx="70" cy="58" r="36" fill="url(#helmet1)" filter="url(#shadow1)" />
        <circle cx="70" cy="58" r="36" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
        <ellipse cx="60" cy="32" rx="14" ry="5" fill="rgba(255,255,255,0.25)" transform="rotate(-10 60 32)" />
        <!-- Visor -->
        <ellipse cx="70" cy="56" rx="26" ry="22" fill="url(#visor1)" />
        <ellipse cx="56" cy="46" rx="10" ry="4" fill="rgba(255,255,255,0.15)" transform="rotate(-25 56 46)" />
        <ellipse cx="80" cy="64" rx="6" ry="2.5" fill="rgba(255,255,255,0.07)" transform="rotate(15 80 64)" />
        <!-- Eyes -->
        <g :style="{ transform: `translate(${eyeX}px, ${eyeY}px)`, transition: 'transform 0.08s ease-out' }">
          <ellipse cx="60" cy="55" rx="5.5" ry="6" fill="white" />
          <ellipse cx="80" cy="55" rx="5.5" ry="6" fill="white" />
          <circle cx="60" cy="55" r="3" fill="#1a1a2e" />
          <circle cx="80" cy="55" r="3" fill="#1a1a2e" />
          <circle cx="58.5" cy="53.5" r="1.3" fill="white" />
          <circle cx="78.5" cy="53.5" r="1.3" fill="white" />
          <circle cx="61.5" cy="57" r="0.6" fill="rgba(255,255,255,0.5)" />
          <circle cx="81.5" cy="57" r="0.6" fill="rgba(255,255,255,0.5)" />
        </g>
        <!-- Eyelids -->
        <g
          :style="{
            transform: passwordFocused ? 'translateY(0)' : 'translateY(-14px)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }"
        >
          <ellipse cx="60" cy="55" rx="6.5" ry="7" fill="#0a1a35" />
          <ellipse cx="80" cy="55" rx="6.5" ry="7" fill="#0a1a35" />
          <path d="M53 55 Q60 59 67 55" stroke="#1a3a6a" stroke-width="1" fill="none" />
          <path d="M73 55 Q80 59 87 55" stroke="#1a3a6a" stroke-width="1" fill="none" />
        </g>
        <!-- Eyebrows -->
        <g
          :style="{
            transform: passwordFocused ? 'translateY(-3px)' : 'translateY(0)',
            transition: 'transform 0.3s ease',
          }"
        >
          <path d="M53 45 Q60 41 67 45" stroke="#5a9ad5" stroke-width="2.2" fill="none" stroke-linecap="round" />
          <path d="M73 45 Q80 41 87 45" stroke="#5a9ad5" stroke-width="2.2" fill="none" stroke-linecap="round" />
        </g>
        <!-- Hands -->
        <g
          :style="{
            transform: passwordFocused ? 'translateY(-52px) scale(1.05)' : 'translateY(20px) scale(0.7)',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            opacity: passwordFocused ? 1 : 0,
          }"
        >
          <ellipse cx="56" cy="56" rx="12" ry="9" fill="#c5d5e8" />
          <ellipse cx="48" cy="51" rx="3.5" ry="3" fill="#c5d5e8" />
          <ellipse cx="53" cy="48" rx="3.5" ry="3" fill="#c5d5e8" />
          <ellipse cx="58" cy="47" rx="3.2" ry="2.8" fill="#c5d5e8" />
          <ellipse cx="63" cy="49" rx="3" ry="2.5" fill="#c5d5e8" />
          <ellipse cx="84" cy="56" rx="12" ry="9" fill="#c5d5e8" />
          <ellipse cx="77" cy="49" rx="3" ry="2.5" fill="#c5d5e8" />
          <ellipse cx="82" cy="47" rx="3.2" ry="2.8" fill="#c5d5e8" />
          <ellipse cx="87" cy="48" rx="3.5" ry="3" fill="#c5d5e8" />
          <ellipse cx="92" cy="51" rx="3.5" ry="3" fill="#c5d5e8" />
        </g>
        <!-- Antenna -->
        <line x1="70" y1="22" x2="70" y2="8" stroke="#8a9ab0" stroke-width="2" />
        <circle cx="70" cy="6" r="3" fill="#ff6b6b">
          <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>

    <!-- Astronaut 2 - Green (center, bigger) -->
    <div class="astronaut astro-center">
      <svg viewBox="0 0 140 180" width="128" height="162">
        <defs>
          <radialGradient id="helmet2" cx="45%" cy="40%">
            <stop offset="0%" stop-color="#e0f0ea" />
            <stop offset="60%" stop-color="#b8d8cc" />
            <stop offset="100%" stop-color="#88b8a8" />
          </radialGradient>
          <radialGradient id="visor2" cx="35%" cy="30%">
            <stop offset="0%" stop-color="#2a8a6a" />
            <stop offset="50%" stop-color="#1a5a4a" />
            <stop offset="100%" stop-color="#0a2a20" />
          </radialGradient>
          <linearGradient id="suit2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4acaa6" />
            <stop offset="100%" stop-color="#2a8a6a" />
          </linearGradient>
          <linearGradient id="arm2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#3abaa0" />
            <stop offset="100%" stop-color="#2a8a6a" />
          </linearGradient>
          <filter id="shadow2"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3" /></filter>
        </defs>
        <!-- Backpack -->
        <rect x="30" y="86" width="80" height="46" rx="9" fill="#2a9a7a" opacity="0.7" />
        <rect x="34" y="90" width="72" height="38" rx="7" fill="#1a7a5a" />
        <circle cx="52" cy="106" r="5" fill="#0a5a3a" stroke="#4acaa6" stroke-width="1" />
        <circle cx="88" cy="106" r="5" fill="#0a5a3a" stroke="#4acaa6" stroke-width="1" />
        <rect x="62" y="93" width="16" height="7" rx="2" fill="#0a5a3a" />
        <rect x="64" y="95" width="4" height="3" rx="1" fill="#5afa5a" />
        <rect x="70" y="95" width="4" height="3" rx="1" fill="#fa5a5a" />
        <!-- Legs -->
        <rect x="44" y="136" width="20" height="30" rx="9" fill="url(#suit2)" />
        <rect x="76" y="136" width="20" height="30" rx="9" fill="url(#suit2)" />
        <ellipse cx="54" cy="168" rx="13" ry="7" fill="#b8d8cc" />
        <ellipse cx="86" cy="168" rx="13" ry="7" fill="#b8d8cc" />
        <ellipse cx="54" cy="166" rx="12" ry="6" fill="#d0e8e0" />
        <ellipse cx="86" cy="166" rx="12" ry="6" fill="#d0e8e0" />
        <!-- Body -->
        <ellipse cx="70" cy="118" rx="32" ry="30" fill="url(#suit2)" filter="url(#shadow2)" />
        <rect x="52" y="100" width="36" height="24" rx="5" fill="#2a9a7a" stroke="#4adab6" stroke-width="0.8" />
        <rect x="56" y="104" width="12" height="3" rx="1" fill="#0a5a3a" />
        <rect x="56" y="109" width="12" height="3" rx="1" fill="#0a5a3a" />
        <circle cx="80" cy="106" r="3.5" fill="#0a5a3a" stroke="#4acaa6" stroke-width="0.6" />
        <circle cx="80" cy="115" r="2.5" fill="#5afa5a">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <rect x="56" y="115" width="18" height="6" rx="2" fill="#1a7a5a" />
        <text
          x="65"
          y="120"
          text-anchor="middle"
          fill="#c8f0e0"
          font-size="4.5"
          font-weight="bold"
          font-family="monospace"
        >
          CAPTAIN
        </text>
        <!-- Left arm -->
        <path
          d="M40 106 Q24 114 20 130 Q18 140 24 144"
          stroke="url(#arm2)"
          stroke-width="15"
          fill="none"
          stroke-linecap="round"
        />
        <ellipse cx="24" cy="146" rx="9" ry="7" fill="#b8d8cc" />
        <ellipse cx="19" cy="142" rx="3.5" ry="3" fill="#b8d8cc" />
        <ellipse cx="24" cy="140" rx="3.5" ry="3" fill="#b8d8cc" />
        <ellipse cx="29" cy="141" rx="3.2" ry="2.8" fill="#b8d8cc" />
        <!-- Right arm -->
        <path
          d="M100 106 Q116 114 120 130 Q122 140 116 144"
          stroke="url(#arm2)"
          stroke-width="15"
          fill="none"
          stroke-linecap="round"
        />
        <ellipse cx="116" cy="146" rx="9" ry="7" fill="#b8d8cc" />
        <ellipse cx="111" cy="141" rx="3.2" ry="2.8" fill="#b8d8cc" />
        <ellipse cx="116" cy="140" rx="3.5" ry="3" fill="#b8d8cc" />
        <ellipse cx="121" cy="142" rx="3.5" ry="3" fill="#b8d8cc" />
        <!-- Neck ring -->
        <ellipse cx="70" cy="86" rx="30" ry="9" fill="#88b8a8" />
        <ellipse cx="70" cy="85" rx="28" ry="8" fill="#a8d0c0" />
        <!-- Helmet -->
        <circle cx="70" cy="54" r="38" fill="url(#helmet2)" filter="url(#shadow2)" />
        <circle cx="70" cy="54" r="38" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
        <ellipse cx="58" cy="28" rx="16" ry="5.5" fill="rgba(255,255,255,0.22)" transform="rotate(-8 58 28)" />
        <!-- Visor -->
        <ellipse cx="70" cy="52" rx="28" ry="24" fill="url(#visor2)" />
        <ellipse cx="54" cy="42" rx="11" ry="4.5" fill="rgba(255,255,255,0.13)" transform="rotate(-22 54 42)" />
        <ellipse cx="82" cy="62" rx="7" ry="3" fill="rgba(255,255,255,0.06)" transform="rotate(12 82 62)" />
        <!-- Eyes -->
        <g :style="{ transform: `translate(${eyeX}px, ${eyeY}px)`, transition: 'transform 0.08s ease-out' }">
          <ellipse cx="59" cy="51" rx="6" ry="6.5" fill="white" />
          <ellipse cx="81" cy="51" rx="6" ry="6.5" fill="white" />
          <circle cx="59" cy="51" r="3.3" fill="#1a1a2e" />
          <circle cx="81" cy="51" r="3.3" fill="#1a1a2e" />
          <circle cx="57.5" cy="49.5" r="1.4" fill="white" />
          <circle cx="79.5" cy="49.5" r="1.4" fill="white" />
          <circle cx="60.5" cy="53" r="0.7" fill="rgba(255,255,255,0.5)" />
          <circle cx="82.5" cy="53" r="0.7" fill="rgba(255,255,255,0.5)" />
        </g>
        <!-- Eyelids -->
        <g
          :style="{
            transform: passwordFocused ? 'translateY(0)' : 'translateY(-15px)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }"
        >
          <ellipse cx="59" cy="51" rx="7" ry="7.5" fill="#0a2a20" />
          <ellipse cx="81" cy="51" rx="7" ry="7.5" fill="#0a2a20" />
          <path d="M51 51 Q59 56 67 51" stroke="#1a5a4a" stroke-width="1.2" fill="none" />
          <path d="M73 51 Q81 56 89 51" stroke="#1a5a4a" stroke-width="1.2" fill="none" />
        </g>
        <!-- Eyebrows -->
        <g
          :style="{
            transform: passwordFocused ? 'translateY(-4px)' : 'translateY(0)',
            transition: 'transform 0.3s ease',
          }"
        >
          <path d="M51 40 Q59 35 67 40" stroke="#4acaa6" stroke-width="2.5" fill="none" stroke-linecap="round" />
          <path d="M73 40 Q81 35 89 40" stroke="#4acaa6" stroke-width="2.5" fill="none" stroke-linecap="round" />
        </g>
        <!-- Hands -->
        <g
          :style="{
            transform: passwordFocused ? 'translateY(-56px) scale(1.08)' : 'translateY(22px) scale(0.65)',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            opacity: passwordFocused ? 1 : 0,
          }"
        >
          <ellipse cx="56" cy="52" rx="14" ry="10" fill="#b8d8cc" />
          <ellipse cx="46" cy="46" rx="4" ry="3.5" fill="#b8d8cc" />
          <ellipse cx="52" cy="43" rx="4" ry="3.5" fill="#b8d8cc" />
          <ellipse cx="58" cy="42" rx="3.8" ry="3.2" fill="#b8d8cc" />
          <ellipse cx="64" cy="44" rx="3.5" ry="3" fill="#b8d8cc" />
          <ellipse cx="84" cy="52" rx="14" ry="10" fill="#b8d8cc" />
          <ellipse cx="76" cy="44" rx="3.5" ry="3" fill="#b8d8cc" />
          <ellipse cx="82" cy="42" rx="3.8" ry="3.2" fill="#b8d8cc" />
          <ellipse cx="88" cy="43" rx="4" ry="3.5" fill="#b8d8cc" />
          <ellipse cx="94" cy="46" rx="4" ry="3.5" fill="#b8d8cc" />
        </g>
        <!-- Antenna -->
        <line x1="70" y1="16" x2="70" y2="2" stroke="#7a9a8a" stroke-width="2.5" />
        <circle cx="70" cy="0" r="4" fill="#4ade80">
          <animate attributeName="opacity" values="1;0.15;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>

    <!-- Astronaut 3 - Purple (right) -->
    <div class="astronaut astro-right">
      <svg viewBox="0 0 140 180" width="110" height="140">
        <defs>
          <radialGradient id="helmet3" cx="45%" cy="40%">
            <stop offset="0%" stop-color="#ece0f8" />
            <stop offset="60%" stop-color="#d0b8e8" />
            <stop offset="100%" stop-color="#a888c8" />
          </radialGradient>
          <radialGradient id="visor3" cx="35%" cy="30%">
            <stop offset="0%" stop-color="#6a3aaa" />
            <stop offset="50%" stop-color="#3a1a7a" />
            <stop offset="100%" stop-color="#1a0a40" />
          </radialGradient>
          <linearGradient id="suit3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#aa7ae0" />
            <stop offset="100%" stop-color="#6a3aaa" />
          </linearGradient>
          <linearGradient id="arm3" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#9a6ad0" />
            <stop offset="100%" stop-color="#6a3aaa" />
          </linearGradient>
          <filter id="shadow3"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3" /></filter>
        </defs>
        <!-- Backpack -->
        <rect x="32" y="88" width="76" height="42" rx="8" fill="#7a4ab5" opacity="0.7" />
        <rect x="36" y="92" width="68" height="34" rx="6" fill="#5a2a9a" />
        <circle cx="50" cy="105" r="4" fill="#3a1a7a" stroke="#aa7ae0" stroke-width="1" />
        <circle cx="90" cy="105" r="4" fill="#3a1a7a" stroke="#aa7ae0" stroke-width="1" />
        <rect x="60" y="95" width="20" height="6" rx="2" fill="#3a1a7a" />
        <rect x="63" y="97" width="4" height="2" rx="1" fill="#5afa5a" />
        <rect x="69" y="97" width="4" height="2" rx="1" fill="#fa5a5a" />
        <!-- Legs -->
        <rect x="46" y="138" width="18" height="28" rx="8" fill="url(#suit3)" />
        <rect x="76" y="138" width="18" height="28" rx="8" fill="url(#suit3)" />
        <ellipse cx="55" cy="168" rx="12" ry="6" fill="#d0b8e8" />
        <ellipse cx="85" cy="168" rx="12" ry="6" fill="#d0b8e8" />
        <ellipse cx="55" cy="166" rx="11" ry="5" fill="#e0d0f0" />
        <ellipse cx="85" cy="166" rx="11" ry="5" fill="#e0d0f0" />
        <!-- Body -->
        <ellipse cx="70" cy="120" rx="30" ry="28" fill="url(#suit3)" filter="url(#shadow3)" />
        <rect x="54" y="102" width="32" height="22" rx="5" fill="#7a4ab5" stroke="#aa7af5" stroke-width="0.8" />
        <rect x="58" y="106" width="10" height="3" rx="1" fill="#3a1a7a" />
        <rect x="58" y="111" width="10" height="3" rx="1" fill="#3a1a7a" />
        <circle cx="78" cy="108" r="3" fill="#3a1a7a" stroke="#aa7ae0" stroke-width="0.6" />
        <circle cx="78" cy="116" r="2" fill="#fa5a8a">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <!-- Left arm -->
        <path
          d="M42 108 Q28 115 24 130 Q22 138 28 142"
          stroke="url(#arm3)"
          stroke-width="14"
          fill="none"
          stroke-linecap="round"
        />
        <ellipse cx="28" cy="144" rx="8" ry="6" fill="#d0b8e8" />
        <ellipse cx="24" cy="141" rx="3" ry="2.5" fill="#d0b8e8" />
        <ellipse cx="28" cy="139" rx="3" ry="2.5" fill="#d0b8e8" />
        <ellipse cx="32" cy="140" rx="2.8" ry="2.3" fill="#d0b8e8" />
        <!-- Right arm -->
        <path
          d="M98 108 Q112 115 116 130 Q118 138 112 142"
          stroke="url(#arm3)"
          stroke-width="14"
          fill="none"
          stroke-linecap="round"
        />
        <ellipse cx="112" cy="144" rx="8" ry="6" fill="#d0b8e8" />
        <ellipse cx="108" cy="140" rx="2.8" ry="2.3" fill="#d0b8e8" />
        <ellipse cx="112" cy="139" rx="3" ry="2.5" fill="#d0b8e8" />
        <ellipse cx="116" cy="141" rx="3" ry="2.5" fill="#d0b8e8" />
        <!-- Neck ring -->
        <ellipse cx="70" cy="88" rx="28" ry="8" fill="#a888c8" />
        <ellipse cx="70" cy="87" rx="26" ry="7" fill="#c0a8d8" />
        <!-- Helmet -->
        <circle cx="70" cy="58" r="36" fill="url(#helmet3)" filter="url(#shadow3)" />
        <circle cx="70" cy="58" r="36" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
        <ellipse cx="60" cy="32" rx="14" ry="5" fill="rgba(255,255,255,0.22)" transform="rotate(-10 60 32)" />
        <!-- Visor -->
        <ellipse cx="70" cy="56" rx="26" ry="22" fill="url(#visor3)" />
        <ellipse cx="56" cy="46" rx="10" ry="4" fill="rgba(255,255,255,0.13)" transform="rotate(-25 56 46)" />
        <ellipse cx="80" cy="64" rx="6" ry="2.5" fill="rgba(255,255,255,0.06)" transform="rotate(15 80 64)" />
        <!-- Eyes -->
        <g :style="{ transform: `translate(${eyeX}px, ${eyeY}px)`, transition: 'transform 0.08s ease-out' }">
          <ellipse cx="60" cy="55" rx="5.5" ry="6" fill="white" />
          <ellipse cx="80" cy="55" rx="5.5" ry="6" fill="white" />
          <circle cx="60" cy="55" r="3" fill="#1a1a2e" />
          <circle cx="80" cy="55" r="3" fill="#1a1a2e" />
          <circle cx="58.5" cy="53.5" r="1.3" fill="white" />
          <circle cx="78.5" cy="53.5" r="1.3" fill="white" />
          <circle cx="61.5" cy="57" r="0.6" fill="rgba(255,255,255,0.5)" />
          <circle cx="81.5" cy="57" r="0.6" fill="rgba(255,255,255,0.5)" />
        </g>
        <!-- Eyelids -->
        <g
          :style="{
            transform: passwordFocused ? 'translateY(0)' : 'translateY(-14px)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }"
        >
          <ellipse cx="60" cy="55" rx="6.5" ry="7" fill="#1a0a40" />
          <ellipse cx="80" cy="55" rx="6.5" ry="7" fill="#1a0a40" />
          <path d="M53 55 Q60 59 67 55" stroke="#3a1a7a" stroke-width="1" fill="none" />
          <path d="M73 55 Q80 59 87 55" stroke="#3a1a7a" stroke-width="1" fill="none" />
        </g>
        <!-- Eyebrows -->
        <g
          :style="{
            transform: passwordFocused ? 'translateY(-3px)' : 'translateY(0)',
            transition: 'transform 0.3s ease',
          }"
        >
          <path d="M53 45 Q60 41 67 45" stroke="#aa7ae0" stroke-width="2.2" fill="none" stroke-linecap="round" />
          <path d="M73 45 Q80 41 87 45" stroke="#aa7ae0" stroke-width="2.2" fill="none" stroke-linecap="round" />
        </g>
        <!-- Hands -->
        <g
          :style="{
            transform: passwordFocused ? 'translateY(-52px) scale(1.05)' : 'translateY(20px) scale(0.7)',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            opacity: passwordFocused ? 1 : 0,
          }"
        >
          <ellipse cx="56" cy="56" rx="12" ry="9" fill="#d0b8e8" />
          <ellipse cx="48" cy="51" rx="3.5" ry="3" fill="#d0b8e8" />
          <ellipse cx="53" cy="48" rx="3.5" ry="3" fill="#d0b8e8" />
          <ellipse cx="58" cy="47" rx="3.2" ry="2.8" fill="#d0b8e8" />
          <ellipse cx="63" cy="49" rx="3" ry="2.5" fill="#d0b8e8" />
          <ellipse cx="84" cy="56" rx="12" ry="9" fill="#d0b8e8" />
          <ellipse cx="77" cy="49" rx="3" ry="2.5" fill="#d0b8e8" />
          <ellipse cx="82" cy="47" rx="3.2" ry="2.8" fill="#d0b8e8" />
          <ellipse cx="87" cy="48" rx="3.5" ry="3" fill="#d0b8e8" />
          <ellipse cx="92" cy="51" rx="3.5" ry="3" fill="#d0b8e8" />
        </g>
        <!-- Antenna -->
        <line x1="70" y1="22" x2="70" y2="8" stroke="#9a8ab0" stroke-width="2" />
        <circle cx="70" cy="6" r="3" fill="#c084fc">
          <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>

    <!-- Stars -->
    <div class="stars">
      <span
        v-for="i in 18"
        :key="i"
        class="star"
        :style="{
          left: 3 + ((i * 5.3) % 94) + '%',
          top: 3 + ((i * 4.1) % 88) + '%',
          animationDelay: i * 0.25 + 's',
          animationDuration: 1.8 + (i % 4) * 0.5 + 's',
          width: 1 + (i % 3) + 'px',
          height: 1 + (i % 3) + 'px',
        }"
      ></span>
    </div>
  </div>
</template>

<style scoped>
.astronaut-group {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 170px;
  margin-bottom: 6px;
  overflow: visible;
}
.astronaut {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.astro-left {
  transform: rotate(-8deg);
  margin-right: -18px;
  z-index: 1;
  animation: bobble-left 4s ease-in-out infinite;
}
.astro-center {
  z-index: 3;
  margin-bottom: -10px;
  animation: bobble-center 3.5s ease-in-out infinite;
}
.astro-right {
  transform: rotate(8deg);
  margin-left: -18px;
  z-index: 1;
  animation: bobble-right 4.2s ease-in-out infinite;
}
.astronaut svg {
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.4));
}
@keyframes bobble-left {
  0%,
  100% {
    transform: rotate(-8deg) translateY(0);
  }
  50% {
    transform: rotate(-6deg) translateY(-8px);
  }
}
@keyframes bobble-center {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
@keyframes bobble-right {
  0%,
  100% {
    transform: rotate(8deg) translateY(0);
  }
  50% {
    transform: rotate(6deg) translateY(-7px);
  }
}
.stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 2s ease-in-out infinite;
}
@keyframes twinkle {
  0%,
  100% {
    opacity: 0.1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(2);
  }
}
</style>
