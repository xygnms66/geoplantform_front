<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import NavBar from "@/components/layout/NavBar.vue";
import UserMenu from "@/components/layout/UserMenu.vue";

const auth = useAuthStore();

onMounted(() => {
  auth.init();
});
</script>

<template>
  <div class="site-shell">
    <header class="topbar">
      <router-link to="/" class="brand">
        <span class="brand-mark">G</span>
        <span>
          <strong>GeoRemote Platform</strong>
          <small>遥感研发资产展示平台</small>
        </span>
      </router-link>
      <NavBar />
      <UserMenu />
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>
