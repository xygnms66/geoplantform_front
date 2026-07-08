import type { ModelRecord, PipelineInputDataset, PipelineOutput, PipelineRecord, PipelineStep } from "@/types";

const models: ModelRecord[] = [
  { id: 1, slug: "geoorigin-embedding", name: "GeoOrigin 遥感嵌入模型", version: "v1.0", description: "对标 AEF 范式，面向中国自然资源调查监测需求构建的自主可控遥感影像表征基础模型。", projectSlug: "embedding" },
];

const pipelines: PipelineRecord[] = [
  { id: 1, modelSlug: "geoorigin-embedding", name: "GeoOrigin 多模态数据管线", description: "从已有数据集读取光学、SAR、土地覆盖、高程等模态，统一完成裁切、重采样、对齐和训练样本索引生成。", status: "active" },
];

const pipelineSteps: PipelineStep[] = [
  { id: 1, pipelineId: 1, stepOrder: 1, name: "数据读取", description: "从内部存储读取 Sentinel-2、Sentinel-1、WorldCover 和 SRTM DEM 原始数据文件。", stepType: "读取" },
  { id: 2, pipelineId: 1, stepOrder: 2, name: "质量检查", description: "对光学影像进行云量过滤，对 SAR 数据进行噪声检测，丢弃质量不达标的样本。", stepType: "质检" },
  { id: 3, pipelineId: 1, stepOrder: 3, name: "重采样与配准", description: "将所有模态统一重采样至 10m 分辨率，并进行空间配准，确保像素级对齐。", stepType: "重采样" },
  { id: 4, pipelineId: 1, stepOrder: 4, name: "多模态对齐", description: "按采样点坐标裁切各模态数据，生成空间一致的多通道样本块。", stepType: "对齐" },
  { id: 5, pipelineId: 1, stepOrder: 5, name: "索引生成", description: "为每个样本点生成元数据索引文件，记录坐标、模态组合、质量评分。", stepType: "索引" },
  { id: 6, pipelineId: 1, stepOrder: 6, name: "数据导出", description: "将处理后的样本序列化为 Parquet / COG 格式，写入训练数据存储路径。", stepType: "导出" },
];

const pipelineInputs: PipelineInputDataset[] = [
  { id: 1, pipelineId: 1, datasetName: "Sentinel-2 Zhejiang Multispectral v1", modalityName: "光学多光谱", usageType: "input", required: true, status: "available", note: "多光谱主干输入，包含 B02/B03/B04/B08 等 10m 波段，已完成云掩膜与切片。" },
  { id: 2, pipelineId: 1, datasetName: "Sentinel-1 Zhejiang SAR v1", modalityName: "SAR", usageType: "input", required: true, status: "available", note: "VV/VH 双极化 SAR 数据，用于与光学影像进行跨模态融合预训练。" },
  { id: 3, pipelineId: 1, datasetName: "WorldCover China 10m v1", modalityName: "土地覆盖", usageType: "label", required: false, status: "available", note: "作为辅助监督标签，引导嵌入模型对地物类别的语义区分能力。" },
  { id: 4, pipelineId: 1, datasetName: "SRTM DEM", modalityName: "高程", usageType: "auxiliary", required: false, status: "available", note: "地形高程信息作为辅助模态，增强山地和复杂地形区域的表征能力。" },
];

const pipelineOutputs: PipelineOutput[] = [
  { id: 1, pipelineId: 1, outputName: "多模态预训练数据集", outputType: "训练数据", description: "对齐后的多通道样本块，格式为 Parquet，约 4,586 个采样点，单点覆盖 2.56 km²。", status: "available" },
  { id: 2, pipelineId: 1, outputName: "样本索引文件", outputType: "索引", description: "每个样本的坐标、模态组合、质量评分和存储路径的元数据索引。", status: "available" },
  { id: 3, pipelineId: 1, outputName: "质量报告", outputType: "报告", description: "各模态覆盖率、云量分布、缺失率和重采样误差的统计分析报告。", status: "planned" },
];

export async function getModelBySlug(slug: string): Promise<ModelRecord | undefined> {
  return models.find((m) => m.slug === slug);
}

export async function getPipelineByModel(modelSlug: string): Promise<PipelineRecord | undefined> {
  return pipelines.find((p) => p.modelSlug === modelSlug);
}

export async function getPipelineSteps(pipelineId: number): Promise<PipelineStep[]> {
  return pipelineSteps.filter((s) => s.pipelineId === pipelineId);
}

export async function getPipelineInputs(pipelineId: number): Promise<PipelineInputDataset[]> {
  return pipelineInputs.filter((i) => i.pipelineId === pipelineId);
}

export async function getPipelineOutputs(pipelineId: number): Promise<PipelineOutput[]> {
  return pipelineOutputs.filter((o) => o.pipelineId === pipelineId);
}
