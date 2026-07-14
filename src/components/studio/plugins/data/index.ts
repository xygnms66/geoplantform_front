import type { StudioPlugin } from "@/components/studio/shell/plugin-types";
import StudioDataCenterPanel from "./StudioDataCenterPanel.vue";
import { dataPluginTabs } from "./tabs";

const dataPlugin: StudioPlugin = {
  key: "data",
  label: "数据中心",
  icon: "DC",
  desc: "数据资产、对象存储、入库审核与质量管理",
  component: StudioDataCenterPanel,
  tabs: dataPluginTabs,
};

export default dataPlugin;
