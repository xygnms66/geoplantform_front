import type { StudioPluginTab } from "@/components/studio/shell/plugin-types";

export const dataPluginTabs: StudioPluginTab[] = [
  {
    key: "assets",
    label: "数据资产",
    view: () => import("@/components/studio/plugins/data/views/DataAssetsView.vue"),
  },
  {
    key: "storage",
    label: "对象存储",
    view: () => import("@/components/studio/plugins/data/views/ObjectStorageView.vue"),
  },
  {
    key: "product",
    label: "产品管理",
    view: () => import("@/components/studio/plugins/data/views/ProductManageView.vue"),
  },
  {
    key: "dataset",
    label: "数据管理",
    view: () => import("@/components/studio/plugins/data/views/DatasetManageView.vue"),
  },
  {
    key: "inbox",
    label: "待入库",
    view: () => import("@/components/studio/plugins/data/views/InboxReviewView.vue"),
  },
  {
    key: "quality",
    label: "数据质量",
    view: () => import("@/components/studio/plugins/data/views/DataQualityView.vue"),
  },
  {
    key: "lineage",
    label: "血缘关系",
    view: () => import("@/components/studio/plugins/data/views/DataLineageView.vue"),
  },
];
