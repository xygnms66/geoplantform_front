<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const showMenu = ref(false);

function closeMenu() {
  showMenu.value = false;
}
</script>

<template>
  <div v-if="auth.loading" style="margin-left: auto; padding: 0 1rem; color: var(--muted)">加载中...</div>
  <router-link v-else-if="!auth.user" to="/login" class="button" style="margin-left: auto">登录</router-link>
  <div v-else style="margin-left: auto; position: relative">
    <button @click="showMenu = !showMenu" class="button" style="display: flex; align-items: center; gap: 0.5rem">
      <span>{{ auth.user.name }}</span>
      <span
        v-if="auth.user.is_admin"
        style="background: #ef4444; color: white; padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem"
        >管理员</span
      >
    </button>
    <div
      v-if="showMenu"
      style="
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 0.5rem;
        background: rgba(15, 23, 42, 0.96);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 0.75rem;
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.4);
        min-width: 200px;
        z-index: 50;
        backdrop-filter: blur(16px);
      "
    >
      <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(148, 163, 184, 0.15)">
        <div style="font-weight: bold; color: var(--text)">{{ auth.user.name }}</div>
        <div v-if="auth.user.role" style="font-size: 0.875rem; color: var(--muted)">{{ auth.user.role }}</div>
      </div>
      <router-link
        v-if="auth.user.is_admin"
        to="/admin/datasets"
        @click="closeMenu"
        style="
          display: block;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: var(--text);
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
          transition: background 0.15s;
        "
        >数据管理</router-link
      >
      <button
        @click="
          auth.logout();
          closeMenu();
        "
        style="
          width: 100%;
          padding: 0.75rem 1rem;
          text-align: left;
          border: none;
          background: none;
          cursor: pointer;
          color: #f87171;
          transition: background 0.15s;
        "
      >
        退出登录
      </button>
    </div>
  </div>
</template>
