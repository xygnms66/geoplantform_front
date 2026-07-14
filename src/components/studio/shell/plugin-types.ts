import type { Component } from "vue";

export type StudioPluginKey = "dashboard" | "projects" | "data";

export type StudioPluginTab = {
  key: string;
  label: string;
  view?: () => Promise<{ default: Component }>;
};

export type StudioPlugin = {
  key: StudioPluginKey;
  label: string;
  icon: string;
  desc: string;
  component: Component | (() => Promise<{ default: Component }>);
  tabs?: StudioPluginTab[];
};
