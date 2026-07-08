import type { AefTabKey, AefModel, AefDataset, AefEvalGroup, AefNews, AefMember, AefWorkflowCard, AefWorkflowColumn } from "@/types";

export const aefTabs: { key: AefTabKey; label: string; icon: string }[] = [
  { key: "home", label: "通知", icon: "⌘" },
  { key: "model", label: "模型", icon: "◈" },
  { key: "data", label: "数据", icon: "▣" },
  { key: "eval", label: "测评", icon: "△" },
  { key: "explore", label: "探测", icon: "◎" },
  { key: "members", label: "成员", icon: "◌" },
];

export const aefOverview = [
  { label: "模型项目", value: "3", note: "2 个在训 · 1 个规划" },
  { label: "数据资产", value: "8", note: "6 已入库 · 2 待接入" },
  { label: "活跃任务", value: "5", note: "训练、评测、抓取并行" },
  { label: "团队成员", value: "12", note: "3 个小组协同推进" },
];

export const aefWorkflowBoard: AefWorkflowColumn[] = [
  {
    id: "planned", title: "待规划", hint: "方案冻结与资源排期", accent: "slate",
    items: [
      { id: "wf-1", title: "GeoLM 多模态预训练方案评审", category: "model", owner: "孙静", due: "07-12", project: "GeoLM", summary: "整理图文对齐损失、数据来源与首轮训练预算，形成立项方案。", priority: "high", tags: ["模型", "规划", "NLP"] },
      { id: "wf-2", title: "NAIP 1m 影像接入排期", category: "data", owner: "李华", due: "07-14", project: "Data Pipeline", summary: "确认抓取批次、切片标准与入库质检节点，为增强分支提供样本。", priority: "medium", tags: ["数据", "接入", "RGB"] },
    ],
  },
  {
    id: "ready", title: "待执行", hint: "依赖就绪，等待推进", accent: "blue",
    items: [
      { id: "wf-3", title: "LoveDA v2 新基准迁移", category: "eval", owner: "王芳", due: "07-10", project: "Evaluation", summary: "补齐城市场景标签映射与评测脚本，准备接入统一看板。", priority: "high", tags: ["评测", "基准", "分割"] },
      { id: "wf-4", title: "Copernicus DEM 统一重采样", category: "data", owner: "李华", due: "07-11", project: "DEM Asset", summary: "统一 30m 高程瓦片分辨率、坐标系和元数据模板。", priority: "medium", tags: ["DEM", "管线"] },
    ],
  },
  {
    id: "progress", title: "进行中", hint: "训练、同步与评测并行", accent: "amber",
    items: [
      { id: "wf-5", title: "OlmoEarth v2 架构训练", category: "model", owner: "张明", due: "07-09", project: "OlmoEarth", summary: "推进窗口注意力与时序融合联合训练，当前在做第 2 轮参数对比。", priority: "high", tags: ["训练", "架构", "遥感"] },
      { id: "wf-6", title: "S1 SAR 预处理入库", category: "data", owner: "陈磊", due: "07-08", project: "Sentinel-1", summary: "完成极化提取和切片写入，准备给 OlmoEarth 训练集补齐 SAR 分支。", priority: "medium", tags: ["SAR", "入库"] },
      { id: "wf-7", title: "农业监测场景复评", category: "eval", owner: "王芳", due: "07-13", project: "Scenario Eval", summary: "对作物分类和产量估计结果做交叉复核，准备输出阶段报告。", priority: "low", tags: ["场景", "复评"] },
    ],
  },
  {
    id: "done", title: "已完成", hint: "可复用成果与沉淀", accent: "green",
    items: [
      { id: "wf-8", title: "RSFormer 基线复验", category: "model", owner: "赵强", due: "07-04", project: "RSFormer", summary: "完成纯 Transformer 基线复验，并整理可迁移到 OlmoEarth 的结构结论。", priority: "medium", tags: ["基线", "复验"] },
      { id: "wf-9", title: "WorldCereal 标签对齐", category: "ops", owner: "数据组", due: "07-03", project: "WorldCereal", summary: "标签域完成对齐与归档，已进入作物识别统一数据版本。", priority: "low", tags: ["标签", "归档"] },
    ],
  },
];

export const aefModels: AefModel[] = [
  {
    id: "olmoearth", name: "OlmoEarth 遥感大模型", icon: "OE", status: "training",
    desc: "面向遥感场景的多模态大模型，统一接入 SAR、光学、地形与辅助标签数据，服务分割、变化检测和作物识别。",
    inputs: ["Sentinel-1 SAR", "Sentinel-2 光学", "Landsat 时序"],
    process: ["多模态编码器", "交叉注意力融合", "时序聚合器"],
    outputs: ["语义分割", "变化检测", "作物分类"],
    features: ["支持 SAR+光学联合建模", "12 步时序输入", "0.75m 高分增强分支"],
    tasks: [
      { name: "v2 架构训练", status: "active", owner: "张明" },
      { name: "S1 预处理入库", status: "active", owner: "李华" },
      { name: "v1 下游评测", status: "done", owner: "王芳" },
    ],
    members: ["张明", "李华", "王芳", "陈磊"],
  },
  {
    id: "rsformer", name: "RSFormer 遥感 Transformer", icon: "RF", status: "complete",
    desc: "针对遥感图像理解的 Transformer 骨干，用于场景分类和目标检测的基线体系。",
    inputs: ["高分光学", "SAR 切片"],
    process: ["Vision Transformer", "窗口注意力", "特征金字塔"],
    outputs: ["场景分类", "目标检测"],
    features: ["纯 Transformer 主干", "局部窗口注意力", "高分场景分类基线"],
    tasks: [{ name: "UCM 基准复验", status: "done", owner: "赵强" }],
    members: ["赵强", "刘婷"],
  },
  {
    id: "geolm", name: "GeoLM 地理语言模型", icon: "GL", status: "planned",
    desc: "融合地理信息与语言理解的跨模态模型，承接图文理解和地理问答类任务。",
    inputs: ["遥感影像", "地理文本", "坐标与元数据"],
    process: ["视觉编码器", "文本编码器", "跨模态对齐"],
    outputs: ["图文理解", "地理问答"],
    features: ["空间位置感知", "跨模态对齐", "知识增强问答"],
    tasks: [{ name: "方案验证", status: "planned", owner: "孙静" }],
    members: ["孙静"],
  },
];

export const aefDatasets: AefDataset[] = [
  { id: "s1", name: "Sentinel-1 SAR", icon: "S1", status: "ready", tiles: "6272 tiles", resolution: "10m", modality: "SAR", desc: "VV/VH 双极化 SAR 数据，用于变化检测和阴雨天气下的稳定观测。", pipeline: ["GEE 下载", "极化提取", "dB 转换", "Tile 切割", "H5 存储"], tags: ["SAR", "时序", "VV/VH"] },
  { id: "s2", name: "Sentinel-2 L2A", icon: "S2", status: "ready", tiles: "6272 tiles", resolution: "10m / 20m / 60m", modality: "光学", desc: "14 波段光学多光谱数据，是当前训练与评测的主数据底座。", pipeline: ["GEE 下载", "分辨率分组", "云掩膜", "Tile 切割", "H5 存储"], tags: ["光学", "多光谱", "主干数据"] },
  { id: "worldcereal", name: "WorldCereal", icon: "WC", status: "ready", tiles: "6272 tiles", resolution: "10m", modality: "标签", desc: "全球作物分布标签，用于作物识别与农业监测场景的监督学习。", pipeline: ["标签对齐", "区域裁切", "样本平衡", "入库归档"], tags: ["作物", "标签", "监督"] },
  { id: "copdem", name: "Copernicus DEM 30m", icon: "DEM", status: "syncing", tiles: "65% synced", resolution: "30m", modality: "高程", desc: "全球高程底图，用于山地区域和复杂地形的辅助建模。", pipeline: ["远端下载", "重采样", "地形裁切", "质检入库"], tags: ["DEM", "地形", "辅助模态"] },
];

export const aefPendingData = [
  { name: "NAIP 美国农业影像", note: "1m RGB，计划接入", progress: "待启动" },
  { name: "ESA WorldCover 2025", note: "待审核入库", progress: "审核中" },
  { name: "Copernicus DEM 30m", note: "全量同步中", progress: "65%" },
];

export const aefEvalGroups: AefEvalGroup[] = [
  { id: "segmentation", icon: "SEG", name: "语义分割", mode: "capability", desc: "像素级分类能力评测，覆盖农业、城建和土地覆盖场景。", tasks: [
    { name: "作物分割", model: "OlmoEarth", dataset: "WorldCereal", status: "done", score: 92.3 },
    { name: "建筑分割", model: "OlmoEarth", dataset: "OSM 栅格", status: "progress" },
  ]},
  { id: "change-detection", icon: "CHG", name: "变化检测", mode: "capability", desc: "针对时序变化和城市扩张的识别与告警评测。", tasks: [
    { name: "城市扩张检测", model: "OlmoEarth", dataset: "变化检测数据集", status: "done", score: 88.7 },
  ]},
  { id: "agriculture", icon: "AGR", name: "农业监测", mode: "scenario", desc: "关注作物分类、长势分析和产量预估等农业场景。", tasks: [
    { name: "作物分类评测", model: "OlmoEarth", dataset: "WorldCereal + CDL", status: "done", score: 91.2 },
  ]},
  { id: "city-planning", icon: "CITY", name: "城市规划", mode: "scenario", desc: "关注建筑提取、变化监测和城市治理相关任务。", tasks: [
    { name: "建筑提取评测", model: "RSFormer", dataset: "DIOR / OSM", status: "planned" },
  ]},
];

export const aefNews: AefNews[] = [
  { id: "n1", category: "model", domain: "remote", title: "OlmoEarth v2 引入窗口注意力机制", desc: "借鉴 Swin 路线，在多模态融合层引入局部窗口注意力，训练效率明显提升。", date: "2026-07-02", tags: ["模型", "架构", "遥感"] },
  { id: "n2", category: "data", domain: "remote", title: "Sentinel-2 L2A 更新至 2026 年 6 月", desc: "杭州研究区域数据已补齐，可直接进入新一轮训练集构建。", date: "2026-07-01", tags: ["数据", "S2", "光学"] },
  { id: "n3", category: "eval", domain: "remote", title: "LoveDA v2 遥感分割基准发布", desc: "新增城市场景类别与跨区域测试集，适合做新一轮通用分割评测。", date: "2026-06-30", tags: ["测评", "分割", "基准"] },
  { id: "n4", category: "model", domain: "multimodal", title: "GeoLM 跨模态预训练方案正式立项", desc: "影像、地理文本与空间坐标统一对齐，Q3 进入训练准备阶段。", date: "2026-06-29", tags: ["模型", "跨模态", "规划"] },
  { id: "n5", category: "data", domain: "cv", title: "0.75m 高分辨率 RGB 数据完成预处理", desc: "高分辨率增强分支所需样本已完成切片，可进入增强实验。", date: "2026-06-28", tags: ["数据", "高分辨率", "增强"] },
  { id: "n6", category: "model", domain: "nlp", title: "Qwen3 混合专家模型发布", desc: "MoE 路线持续成熟，可为 GeoLM 的文本侧提供参考骨干。", date: "2026-06-30", tags: ["模型", "MoE", "NLP"] },
];

export const aefMembers: AefMember[] = [
  { id: "zhangming", name: "张明", role: "项目负责人", team: "模型组", focus: ["模型", "架构", "遥感"], recent: "主持 OlmoEarth v2 架构评审，推进时序融合方案收敛。", next: "完成 v2 训练配置冻结，拉通模型组与数据组的联调节奏。" },
  { id: "lihua", name: "李华", role: "数据工程师", team: "数据组", focus: ["数据", "管线", "DEM"], recent: "推进 SRTM 与 Copernicus DEM 的接入和质检脚本。", next: "完成高程辅助模态的统一重采样和元数据记录。" },
  { id: "wangfang", name: "王芳", role: "研究员", team: "测评组", focus: ["测评", "基准", "分割"], recent: "分析作物分割评测结果，整理 LoveDA v2 迁移方案。", next: "补齐变化检测和农业监测的统一评测看板。" },
  { id: "chenlei", name: "陈磊", role: "训练工程师", team: "模型组", focus: ["训练", "优化", "分布式"], recent: "在南湖平台调优 8 卡训练效率，压缩冗余同步时间。", next: "稳定 DDP 训练脚本并沉淀标准模板。" },
  { id: "zhaoqiang", name: "赵强", role: "架构设计", team: "模型组", focus: ["Transformer", "模型", "骨干"], recent: "完成 RSFormer 窗口注意力实验，对比全局注意力版本。", next: "把高分场景分类经验迁移给 OlmoEarth 分支。" },
  { id: "sunjing", name: "孙静", role: "研究员", team: "规划组", focus: ["跨模态", "规划", "NLP"], recent: "完成 GeoLM 跨模态对齐初稿设计，梳理问答场景需求。", next: "验证图文对齐损失函数与知识增强方案。" },
];

export const aefReviewQueue = [
  { type: "论文", title: "Remote Sensing Foundation Models 2026", source: "arXiv:2603.12345", owner: "王芳" },
  { type: "数据", title: "NAIP 美国农业影像 1m 分辨率", source: "USDA 数据源", owner: "李华" },
  { type: "数据", title: "ESA WorldCover 10m 2025", source: "ESA WorldCover", owner: "李华" },
];
