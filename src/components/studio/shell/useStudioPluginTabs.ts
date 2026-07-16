import { computed, defineAsyncComponent, shallowRef, type Component } from "vue";

import type { StudioPluginTab } from "./plugin-types";

export function useStudioPluginTabs(tabs: StudioPluginTab[], defaultKey?: string) {
  const activeTab = shallowRef(defaultKey ?? tabs[0]?.key ?? "");

  const activeTabConfig = computed(() => tabs.find((tab) => tab.key === activeTab.value) ?? null);

  const viewCache = new Map<string, Component>();

  function resolveView(key: string): Component | null {
    if (viewCache.has(key)) {
      return viewCache.get(key) ?? null;
    }

    const tab = tabs.find((item) => item.key === key);
    if (!tab?.view) {
      return null;
    }

    const component = defineAsyncComponent(tab.view);
    viewCache.set(key, component);
    return component;
  }

  const activeView = computed(() => resolveView(activeTab.value));

  function setActiveTab(key: string) {
    activeTab.value = key;
  }

  return {
    tabs,
    activeTab,
    activeTabConfig,
    activeView,
    setActiveTab,
  };
}
