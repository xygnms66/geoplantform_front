<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { computed, onBeforeUnmount, ref } from "vue";

const route = useRoute();
const auth = useAuthStore();

const publicNavItems = [
  { href: "/", label: "首页" },
  { href: "/projects", label: "项目" },
  { href: "/team", label: "团队" },
  { href: "/data", label: "数据" },
  { href: "/achievements", label: "成果" },
  { href: "/information", label: "资讯" },
];

const authNavItems = [{ href: "/workbench", label: "工作台" }];

const allItems = computed(() => (auth.user ? [...publicNavItems, ...authNavItems] : publicNavItems));

const animTimers = ref<Map<string, number>>(new Map());

function isActive(href: string) {
  if (href === "/") return route.path === "/";
  return route.path.startsWith(href);
}

function handleClick(href: string) {
  const existing = animTimers.value.get(href);
  if (existing) clearTimeout(existing);
  const linkEl = document.querySelector(`[data-nav="${href}"]`);
  if (linkEl) {
    linkEl.classList.remove("nav-shimmer");
    void (linkEl as HTMLElement).offsetWidth;
    linkEl.classList.add("nav-shimmer");
    const timer = window.setTimeout(() => {
      linkEl.classList.remove("nav-shimmer");
    }, 650);
    animTimers.value.set(href, timer);
  }
}

onBeforeUnmount(() => {
  for (const timer of animTimers.value.values()) {
    clearTimeout(timer);
  }
  animTimers.value.clear();
});
</script>

<template>
  <nav class="nav">
    <template v-for="item in allItems" :key="item.href">
      <router-link
        :to="item.href"
        :data-nav="item.href"
        :class="isActive(item.href) ? 'active' : ''"
        @click="handleClick(item.href)"
      >
        {{ item.label }}
      </router-link>
    </template>
  </nav>
</template>
