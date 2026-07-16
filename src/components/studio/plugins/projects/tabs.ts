import type { StudioPluginTab } from "@/components/studio/shell/plugin-types";

export const projectsPluginTabs: StudioPluginTab[] = [
  {
    key: "board",
    label: "看板",
    view: () => import("@/components/studio/plugins/projects/views/ProjectBoardView.vue"),
  },
  {
    key: "list",
    label: "列表",
    view: () => import("@/components/studio/plugins/projects/views/ProjectListView.vue"),
  },
  {
    key: "cycle",
    label: "周期",
    view: () => import("@/components/studio/plugins/projects/views/ProjectCycleView.vue"),
  },
  {
    key: "module",
    label: "模块",
    view: () => import("@/components/studio/plugins/projects/views/ProjectModuleView.vue"),
  },
  {
    key: "docs",
    label: "文档",
    view: () => import("@/components/studio/plugins/projects/views/ProjectDocsView.vue"),
  },
  {
    key: "workflow",
    label: "工作流",
    view: () => import("@/components/studio/plugins/projects/views/ProjectWorkflowView.vue"),
  },
];
