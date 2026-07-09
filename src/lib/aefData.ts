import type { AefNews } from "@/types";

export const aefTabs = [
  { key: "explore" as const, label: "探测", icon: "◎" },
];

export const aefNews: AefNews[] = [
  { id: "n1", category: "model", domain: "remote", title: "OlmoEarth v2 引入窗口注意力机制", desc: "借鉴 Swin 路线，在多模态融合层引入局部窗口注意力，训练效率明显提升。", date: "2026-07-02", tags: ["模型", "架构", "遥感"] },
  { id: "n2", category: "data", domain: "remote", title: "Sentinel-2 L2A 更新至 2026 年 6 月", desc: "杭州研究区域数据已补齐，可直接进入新一轮训练集构建。", date: "2026-07-01", tags: ["数据", "S2", "光学"] },
  { id: "n3", category: "eval", domain: "remote", title: "LoveDA v2 遥感分割基准发布", desc: "新增城市场景类别与跨区域测试集，适合做新一轮通用分割评测。", date: "2026-06-30", tags: ["测评", "分割", "基准"] },
  { id: "n4", category: "model", domain: "multimodal", title: "GeoLM 跨模态预训练方案正式立项", desc: "影像、地理文本与空间坐标统一对齐，Q3 进入训练准备阶段。", date: "2026-06-29", tags: ["模型", "跨模态", "规划"] },
  { id: "n5", category: "data", domain: "cv", title: "0.75m 高分辨率 RGB 数据完成预处理", desc: "高分辨率增强分支所需样本已完成切片，可进入增强实验。", date: "2026-06-28", tags: ["数据", "高分辨率", "增强"] },
  { id: "n6", category: "model", domain: "nlp", title: "Qwen3 混合专家模型发布", desc: "MoE 路线持续成熟，可为 GeoLM 的文本侧提供参考骨干。", date: "2026-06-30", tags: ["模型", "MoE", "NLP"] },
];
