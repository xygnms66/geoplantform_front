import type { StudioPlugin } from "@/components/studio/shell/plugin-types";
import StudioProjectCenterPanel from "./StudioProjectCenterPanel.vue";
import { projectsPluginTabs } from "./tabs";

const projectsPlugin: StudioPlugin = {
  key: "projects",
  label: "项目中心",
  icon: "PM",
  desc: "项目、周期、模块、工作项与工作流",
  component: StudioProjectCenterPanel,
  tabs: projectsPluginTabs,
};

export default projectsPlugin;
