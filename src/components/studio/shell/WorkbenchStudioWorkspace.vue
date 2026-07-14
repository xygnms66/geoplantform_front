<script setup lang="ts">
import { computed, ref, type Component } from "vue";
import {
  getStudioPlugin,
  normalizeStudioPluginKey,
  studioPlugins,
  type StudioPluginKey,
} from "@/components/studio/shell/plugin-registry";

const props = withDefaults(defineProps<{ initialTab?: string }>(), {
  initialTab: "dashboard",
});

const activeSection = ref<StudioPluginKey>(normalizeStudioPluginKey(props.initialTab));

const activePlugin = computed(() => getStudioPlugin(activeSection.value));

const activeComponent = computed<Component>(() => {
  const component = activePlugin.value.component;
  return component as Component;
});
</script>

<template>
  <div class="workspace-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-brand">GeoRemote Studio</div>
      </div>
      <nav class="sidebar-nav">
        <button
          v-for="plugin in studioPlugins"
          :key="plugin.key"
          type="button"
          :class="['nav-item', { active: activeSection === plugin.key }]"
          @click="activeSection = plugin.key"
        >
          <span class="nav-icon">{{ plugin.icon }}</span>
          <div class="nav-text">
            <span class="nav-label">{{ plugin.label }}</span>
            <span class="nav-desc">{{ plugin.desc }}</span>
          </div>
        </button>
      </nav>
      <div class="sidebar-footer">
        <div class="current-label">当前视图</div>
        <div class="current-title">{{ activePlugin.label }}</div>
      </div>
    </aside>
    <main class="content-area">
      <component :is="activeComponent" />
    </main>
  </div>
</template>

<style scoped>
.workspace-layout {
  margin-top: 28px;
  padding: 0 20px 40px;
  min-height: calc(100vh - 180px);
}

.content-area {
  margin-left: 304px;
}

.sidebar {
  position: fixed;
  top: 90px;
  left: 20px;
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 16px;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.76));
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  z-index: 10;
}

.sidebar-header {
  padding: 0 12px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  margin-bottom: 8px;
}

.sidebar-brand {
  color: #67e8f9;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid transparent;
  border-radius: 16px;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(96, 165, 250, 0.25);
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.08));
  border-color: rgba(96, 165, 250, 0.4);
  box-shadow:
    inset 3px 0 0 #3b82f6,
    0 8px 24px rgba(37, 99, 235, 0.12);
}

.nav-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: #67e8f9;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.08em;
  background: rgba(56, 189, 248, 0.13);
  flex-shrink: 0;
  transition: 0.2s ease;
}

.nav-item.active .nav-icon {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #fff;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
}

.nav-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.nav-label {
  font-size: 16px;
  font-weight: 900;
  color: #f8fbff;
}

.nav-desc {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sidebar-footer {
  margin-top: auto;
  padding: 16px 12px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.current-label {
  color: #93c5fd;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.current-title {
  margin-top: 6px;
  font-size: 18px;
  font-weight: 900;
  color: #67e8f9;
}

.content-area {
  min-width: 0;
}

@media (max-width: 1080px) {
  .content-area {
    margin-left: 0;
  }

  .sidebar {
    width: calc(100vw - 24px);
    left: 12px;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 12px 16px;
    gap: 6px;
  }

  .sidebar-header {
    display: none;
  }

  .sidebar-nav {
    flex-direction: row;
    flex: 1;
    gap: 6px;
  }

  .nav-item {
    flex: 1;
    padding: 12px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .nav-item:hover {
    transform: translateY(-2px);
  }

  .nav-text {
    align-items: center;
  }

  .nav-desc {
    display: none;
  }

  .sidebar-footer {
    display: none;
  }
}
</style>
