import type { StudioPlugin } from "@/components/studio/shell/plugin-types";
import StudioDashboardPanel from "./StudioDashboardPanel.vue";

const dashboardPlugin: StudioPlugin = {
  key: "dashboard",
  label: "总工作台",
  icon: "WS",
  desc: "今日待办、项目进展、资讯和 Agent 动作",
  component: StudioDashboardPanel,
};

export default dashboardPlugin;
