import dashboardPlugin from "@/components/studio/plugins/dashboard";
import projectsPlugin from "@/components/studio/plugins/projects";
import dataPlugin from "@/components/studio/plugins/data";
import type { StudioPlugin, StudioPluginKey } from "./plugin-types";

export type { StudioPlugin, StudioPluginKey, StudioPluginTab } from "./plugin-types";
export { useStudioPluginTabs } from "./useStudioPluginTabs";

export const studioPlugins: StudioPlugin[] = [dashboardPlugin, projectsPlugin, dataPlugin];

export function getStudioPlugin(key: string): StudioPlugin {
  return studioPlugins.find((plugin) => plugin.key === key) ?? studioPlugins[0];
}

export function normalizeStudioPluginKey(tab: string): StudioPluginKey {
  if (tab === "projects" || tab === "project") return "projects";
  if (tab === "data") return "data";
  return "dashboard";
}
