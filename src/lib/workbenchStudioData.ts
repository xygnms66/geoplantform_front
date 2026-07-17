export type StudioSectionKey = "dashboard" | "projects" | "data";

export type StudioWorkflowCard = {
  id: string;
  title: string;
  category: "model" | "data" | "eval" | "ops";
  owner: string;
  due: string;
  project: string;
  summary: string;
  priority: "high" | "medium" | "low";
  tags: string[];
};

export type StudioWorkflowColumn = {
  id: string;
  title: string;
  hint: string;
  accent: "slate" | "blue" | "amber" | "green";
  items: StudioWorkflowCard[];
};

export const studioSections: { key: StudioSectionKey; label: string; icon: string; desc: string }[] = [
  { key: "dashboard", label: "总工作台", icon: "WS", desc: "今日待办、项目进展、资讯和 Agent 动作" },
  { key: "projects", label: "项目中心", icon: "PM", desc: "项目、周期、模块、工作项与工作流" },
  { key: "data", label: "数据中心", icon: "DC", desc: "数据资产、对象存储、入库审核与质量管理" },
];

export const workflowColumns: StudioWorkflowColumn[] = [
  {
    id: "planned",
    title: "待规划",
    hint: "方案冻结与资源排期",
    accent: "slate",
    items: [
      {
        id: "wf-1",
        title: "GeoLM 多模态预训练方案评审",
        category: "model",
        owner: "孙静",
        due: "07-12",
        project: "GeoLM",
        summary: "整理图文对齐损失、数据来源与首轮训练预算，形成立项方案。",
        priority: "high",
        tags: ["模型", "规划", "NLP"],
      },
      {
        id: "wf-2",
        title: "NAIP 1m 影像接入排期",
        category: "data",
        owner: "李华",
        due: "07-14",
        project: "Data Pipeline",
        summary: "确认抓取批次、切片标准与入库质检节点，为增强分支提供样本。",
        priority: "medium",
        tags: ["数据", "接入", "RGB"],
      },
    ],
  },
  {
    id: "ready",
    title: "待执行",
    hint: "依赖就绪，等待推进",
    accent: "blue",
    items: [
      {
        id: "wf-3",
        title: "LoveDA v2 新基准迁移",
        category: "eval",
        owner: "王芳",
        due: "07-10",
        project: "Evaluation",
        summary: "补齐城市场景标签映射与评测脚本，准备接入统一看板。",
        priority: "high",
        tags: ["评测", "基准", "分割"],
      },
      {
        id: "wf-4",
        title: "Copernicus DEM 统一重采样",
        category: "data",
        owner: "李华",
        due: "07-11",
        project: "DEM Asset",
        summary: "统一 30m 高程瓦片分辨率、坐标系和元数据模板。",
        priority: "medium",
        tags: ["DEM", "管线"],
      },
    ],
  },
  {
    id: "progress",
    title: "进行中",
    hint: "训练、同步与评测并行",
    accent: "amber",
    items: [
      {
        id: "wf-5",
        title: "OlmoEarth v2 架构训练",
        category: "model",
        owner: "张明",
        due: "07-09",
        project: "OlmoEarth",
        summary: "推进窗口注意力与时序融合联合训练，当前在做第 2 轮参数对比。",
        priority: "high",
        tags: ["训练", "架构", "遥感"],
      },
      {
        id: "wf-6",
        title: "S1 SAR 预处理入库",
        category: "data",
        owner: "陈磊",
        due: "07-08",
        project: "Sentinel-1",
        summary: "完成极化提取和切片写入，准备给 OlmoEarth 训练集补齐 SAR 分支。",
        priority: "medium",
        tags: ["SAR", "入库"],
      },
      {
        id: "wf-7",
        title: "农业监测场景复评",
        category: "eval",
        owner: "王芳",
        due: "07-13",
        project: "Scenario Eval",
        summary: "对作物分类和产量估计结果做交叉复核，准备输出阶段报告。",
        priority: "low",
        tags: ["场景", "复评"],
      },
    ],
  },
  {
    id: "done",
    title: "已完成",
    hint: "可复用成果与沉淀",
    accent: "green",
    items: [
      {
        id: "wf-8",
        title: "RSFormer 基线复验",
        category: "model",
        owner: "赵强",
        due: "07-04",
        project: "RSFormer",
        summary: "完成纯 Transformer 基线复验，并整理可迁移到 OlmoEarth 的结构结论。",
        priority: "medium",
        tags: ["基线", "复验"],
      },
      {
        id: "wf-9",
        title: "WorldCereal 标签对齐",
        category: "ops",
        owner: "数据组",
        due: "07-03",
        project: "WorldCereal",
        summary: "标签域完成对齐与归档，已进入作物识别统一数据版本。",
        priority: "low",
        tags: ["标签", "归档"],
      },
    ],
  },
];

export const dashboardStatCards = [
  { title: "待处理任务", value: "12", desc: "3 个即将到期", icon: "TK" },
  { title: "本周项目进度", value: "68%", desc: "4 个项目进行中", icon: "PG" },
  { title: "新入库数据集", value: "8", desc: "2 个待审核", icon: "DS" },
  { title: "数据管线", value: "21/23", desc: "2 个异常", icon: "PL" },
  { title: "最新资讯", value: "15", desc: "5 条高优先级", icon: "NW" },
  { title: "Agent 推荐", value: "4", desc: "建议生成周报", icon: "AI" },
];

export const dashboardTasks = [
  { title: "Sentinel-2 2025-06 杭州数据入库审核", module: "数据中心 / 待审核入库", owner: "我", deadline: "今天 18:00", level: "高", levelClass: "priority-high", status: "待审核" },
  { title: "OlmoEarth embedding 推理任务失败排查", module: "遥感嵌入模型 / 管线异常", owner: "我", deadline: "明天", level: "中", levelClass: "priority-mid", status: "进行中" },
  { title: "完成 GeoRemote 数据详情页字段补齐", module: "平台开发 / 数据页面", owner: "我", deadline: "周五", level: "中", levelClass: "priority-mid", status: "待开始" },
  { title: "整理本周遥感基础模型资讯简报", module: "资讯中心 / 周报生成", owner: "我", deadline: "周五", level: "低", levelClass: "priority-low", status: "待开始" },
];

export const dashboardProjects = [
  { name: "遥感嵌入模型", focus: "AEF embedding 数据入库与模型测试", owner: "模型组", progress: 72, done: 18, total: 25, errors: 2 },
  { name: "热风险估计模型", focus: "LST 数据处理与城市热环境建模", owner: "热风险组", progress: 55, done: 11, total: 20, errors: 0 },
  { name: "One Terra", focus: "全球尺度数据源整理与表征学习", owner: "遥感组", progress: 38, done: 6, total: 16, errors: 1 },
];

export const dashboardDatasets = [
  { name: "Sentinel-2 L2A Zhejiang 2025-06", source: "GEE", modality: "多光谱", resolution: "10m", region: "浙江省", time: "2025-06", format: "GeoTIFF", owner: "数据组", status: "已入库" },
  { name: "Landsat 8/9 L2 Chongqing 2025-05", source: "GEE", modality: "光学 / 热红外", resolution: "30m", region: "重庆市", time: "2025-05", format: "GeoTIFF", owner: "王子维", status: "待质检" },
  { name: "SRTM DEM China 30m", source: "公开数据", modality: "DEM", resolution: "30m", region: "中国", time: "长期", format: "GeoTIFF", owner: "数据组", status: "待审核" },
];

export const dashboardNews = [
  { type: "模型", title: "OlmoEarth v2 架构改进：引入窗口注意力机制", summary: "可能影响多尺度遥感表征训练方案，建议加入模型调研列表。" },
  { type: "数据", title: "ESA WorldCover 10m 2025 更新", summary: "适合作为 One Terra 项目的土地覆盖基准数据，可转入数据入库流程。" },
  { type: "论文", title: "Remote Sensing Foundation Models 2026", summary: "系统梳理遥感基础模型趋势，建议生成技术解读文章。" },
];

export const dashboardAgentActions = [
  { title: "触发 Sentinel-2 质量检查", desc: "2025-06 杭州数据已完成下载，建议启动云量与有效像素检查。" },
  { title: "创建推理失败排查任务", desc: "AEF Embedding 推理任务连续失败 2 次，建议分配给模型组处理。" },
  { title: "生成本周资讯周报", desc: "本周新增 15 条遥感基础模型资讯，建议生成周报草稿。" },
];

export const dashboardPipelines = [
  { name: "Sentinel-2 月度 Mosaic", project: "数据中心", status: "成功", lastRun: "07-07 09:30", duration: "42min", owner: "数据组" },
  { name: "Landsat 云掩膜处理", project: "热风险估计模型", status: "运行中", lastRun: "07-07 10:12", duration: "18min", owner: "数据组" },
  { name: "AEF Embedding 推理", project: "遥感嵌入模型", status: "失败", lastRun: "07-07 08:50", duration: "63min", owner: "模型组" },
  { name: "资讯 Agent 抓取", project: "资讯中心", status: "成功", lastRun: "07-07 08:00", duration: "4min", owner: "平台组" },
];

export const projectViewTabs = ["看板", "列表", "周期", "模块", "文档", "工作流"];

export const projectSummary = [
  { label: "进行中项目", value: "4", desc: "2 个高优先级", icon: "PRJ" },
  { label: "活跃任务", value: "32", desc: "8 个本周截止", icon: "TSK" },
  { label: "待审核交付", value: "7", desc: "数据 / 代码 / 报告", icon: "REV" },
  { label: "异常风险", value: "3", desc: "管线失败与延期", icon: "RSK" },
];

export const projectProjects = [
  {
    name: "遥感嵌入模型",
    desc: "多模态嵌入与区域检索",
    longDesc: "面向遥感多模态嵌入范式的模型研发项目，覆盖数据入库、预训练、embedding 推理、区域检索、评估与可视化展示。",
    progress: 72,
    done: 18,
    total: 25,
    risk: "中",
    color: "#38bdf8",
    tags: ["AEF", "GeoAI", "Embedding", "遥感预训练"],
  },
  {
    name: "热风险估计模型",
    desc: "城市热环境与风险评估",
    longDesc: "面向城市热环境治理的遥感估计模型项目，融合 LST、气象、土地覆盖、城市形态等多源数据。",
    progress: 55,
    done: 11,
    total: 20,
    risk: "低",
    color: "#f59e0b",
    tags: ["LST", "热风险", "城市", "风险评估"],
  },
  {
    name: "One Terra",
    desc: "全球尺度表征学习",
    longDesc: "统一地球表征与全球尺度模型项目，围绕全球分割、目标检测、地物感知和空间智能展开。",
    progress: 38,
    done: 6,
    total: 16,
    risk: "高",
    color: "#22c55e",
    tags: ["全球尺度", "地物感知", "目标检测"],
  },
];

export const projectModules = [
  { name: "数据入库", count: 8, progress: 75 },
  { name: "模型训练", count: 7, progress: 60 },
  { name: "测评分析", count: 5, progress: 45 },
  { name: "平台展示", count: 6, progress: 70 },
];

export const projectCycles = [
  { name: "Sprint 07.01 - 07.07", time: "本周周期", status: "进行中", progress: 68, done: 17, total: 25, focus: "数据入库与页面联调" },
  { name: "Sprint 07.08 - 07.14", time: "下周周期", status: "待开始", progress: 12, done: 2, total: 18, focus: "测评中心与 Agent 流程" },
  { name: "Release v0.2", time: "里程碑", status: "待审核", progress: 82, done: 31, total: 38, focus: "工作台 + 数据 + 项目中心" },
];

export const projectBoardColumns = [
  {
    name: "待开始",
    items: [
      { id: "GEO-101", priority: "中", priorityClass: "priority-mid", title: "补充 Landsat 数据详情页字段", desc: "增加空间范围、时间范围、波段、质量状态字段。", tags: ["数据中心", "前端"], assignees: ["穆", "李"], due: "周五" },
      { id: "GEO-104", priority: "低", priorityClass: "priority-low", title: "整理遥感基础模型资讯周报", desc: "将本周高优先级资讯生成周报草稿。", tags: ["资讯", "Agent"], assignees: ["王"], due: "周五" },
    ],
  },
  {
    name: "进行中",
    items: [
      { id: "GEO-088", priority: "高", priorityClass: "priority-high", title: "AEF Embedding 推理失败排查", desc: "连续失败 2 次，需要查看日志并补充失败样本记录。", tags: ["模型", "管线"], assignees: ["穆"], due: "明天" },
      { id: "GEO-095", priority: "中", priorityClass: "priority-mid", title: "数据资产卡片重构", desc: "参考 OpenMetadata 增加 Owner、Tag、Path、质量指标。", tags: ["数据", "UI"], assignees: ["陈"], due: "周四" },
    ],
  },
  {
    name: "待审核",
    items: [
      { id: "GEO-073", priority: "高", priorityClass: "priority-high", title: "Sentinel-2 2025-06 杭州数据入库审核", desc: "检查云量、有效像素、瓦片缺失和 MinIO 路径。", tags: ["Sentinel-2", "入库"], assignees: ["穆", "王"], due: "今天" },
      { id: "GEO-092", priority: "中", priorityClass: "priority-mid", title: "GeoRemote 工作台页面验收", desc: "检查今日任务、项目进度、资讯和管线模块是否完整。", tags: ["前端", "验收"], assignees: ["李"], due: "明天" },
    ],
  },
  {
    name: "已完成",
    items: [
      { id: "GEO-061", priority: "中", priorityClass: "priority-mid", title: "对象存储浏览器原型", desc: "完成 Bucket 列表、prefix 浏览、复制路径和上传入口。", tags: ["MinIO", "S3"], assignees: ["陈"], due: "已完成" },
    ],
  },
];

export const dataTabs = ["数据资产", "对象存储", "待入库", "数据质量", "血缘关系"];
export const dataSources = ["全部数据", "Hugging Face", "海纳数据枢纽", "GeoRemote", "论文开源数据"];
export const dataScopes = ["预训练", "变化检测", "目标检测", "热风险", "全球分割"];
export const dataModalities = ["光学", "多光谱", "SAR", "DEM", "LST", "土地覆盖", "矢量"];
export const dataStatuses = ["已入库", "待质检", "待审核", "处理中", "已发布"];

export const dataStats = [
  { label: "数据资产", value: "28", desc: "本月新增 8 个" },
  { label: "对象存储", value: "6", desc: "S3 / MinIO / NAS" },
  { label: "待审核", value: "3", desc: "2 数据 + 1 论文" },
  { label: "质量异常", value: "2", desc: "云量与缺块异常" },
];

export const dataAssets = [
  {
    name: "Sentinel-2 L2A Zhejiang 2025-06",
    source: "GeoRemote",
    size: "1.2TB",
    count: "32 万瓦片",
    status: "已入库",
    region: "浙江省",
    time: "2025-06",
    resolution: "10m",
    owner: "数据组",
    tags: ["多光谱", "遥感预训练", "GeoTIFF"],
    path: "s3://datasets/sentinel2/zhejiang/2025/06/",
    desc: "Sentinel-2 L2A 多光谱地表反射率数据，覆盖浙江省域，主要用于 GeoOrigin 遥感嵌入模型预训练与多时相分析。",
  },
  {
    name: "Sentinel-1 GRD Zhejiang 2025-06",
    source: "GeoRemote",
    size: "860GB",
    count: "18 万瓦片",
    status: "待质检",
    region: "浙江省",
    time: "2025-06",
    resolution: "10m",
    owner: "数据组",
    tags: ["SAR", "全天候", "VV/VH"],
    path: "s3://datasets/sentinel1/zhejiang/2025/06/",
    desc: "Sentinel-1 SAR 后向散射数据，包含 VV、VH 极化信息，可用于全天候地表结构建模、灾害监测与遥感预训练。",
  },
  {
    name: "High Resolution RGB Hangzhou",
    source: "海纳数据枢纽",
    size: "2.8TB",
    count: "45 万瓦片",
    status: "已入库",
    region: "杭州市",
    time: "2024-2025",
    resolution: "0.3m",
    owner: "视觉组",
    tags: ["RGB", "城市", "目标检测"],
    path: "s3://datasets/rgb/hangzhou/high-resolution/",
    desc: "杭州高分辨率 RGB 影像数据，适用于城市建筑、道路、水体、地块等细粒度地物识别与视觉语言模型训练。",
  },
  {
    name: "SRTM DEM China 30m",
    source: "论文开源数据",
    size: "120GB",
    count: "8 万瓦片",
    status: "待审核",
    region: "中国",
    time: "长期",
    resolution: "30m",
    owner: "数据组",
    tags: ["DEM", "地形", "高程"],
    path: "s3://datasets/dem/srtm/china-30m/",
    desc: "中国区域 SRTM DEM 高程数据，适合作为生态地理分区、热风险评估和遥感基础模型辅助变量。",
  },
];

export const dataStores = [
  { name: "georemote-main", type: "MinIO", capacity: "597.66TB", endpoint: "https://minio.example.com" },
  { name: "geogpt-doc", type: "MinIO", capacity: "400.00TB", endpoint: "https://minio-doc.example.com" },
  { name: "zzb21-89-tokens", type: "NFS", capacity: "0KB", endpoint: "nfs://storage.example.com/share" },
];

export const dataInbox = [
  { name: "Remote Sensing Foundation Models 2026", source: "arXiv:2603.12345", submitter: "王芳" },
  { name: "NAIP 美国农业影像 1m 分辨率", source: "https://naip.usda.gov", submitter: "李华" },
  { name: "ESA WorldCover 10m 2025", source: "https://esa-worldcover.org", submitter: "李华" },
];
