export type TeamGroup = {
  id: number;
  key: string;
  title: string;
  short_title?: string | null;
  description?: string | null;
  keywords: string[];
};

export type Project = {
  id: number;
  name: string;
  slug: string;
  subtitle?: string | null;
  description: string;
  stage?: string | null;
  achieve?: string | null;
  next_stage?: string | null;
  status: string;
  owner?: string | null;
  cover_image?: string | null;
  tags: string[];
  metrics: Record<string, string | number>;
  created_at?: string;
  updated_at?: string;
};

export type PersonalMember = {
  id: number;
  name: string;
  role?: string | null;
  team_group_id?: number | null;
  team_group?: TeamGroup | null;
  title?: string | null;
  description?: string | null;
  direction?: string | null;
  researchDirection?: string | null;
  responsibility?: string | null;
  current_work?: string | null;
  recentWork?: string | null;
  future_plan?: string | null;
  plan?: string | null;
  projects?: string[] | null;
  isTeamLead?: string | boolean | null;
};

export type Achievement = {
  id: number;
  slug: string;
  title: string;
  type: string;
  description: string;
  authors_team_id?: number | null;
  authors_team?: TeamGroup | null;
  link?: string | null;
  cover_text?: string | null;
  tags: string[];
  project_id?: number | null;
};

export type DashboardSummary = {
  project_count: number;
  member_count: number;
  achievement_count: number;
  data_asset_count: number;
  model_count: number;
  projects: Project[];
  modality_stats: { name: string; count: number }[];
  progress_stages: { name: string; status: string; ratio: number }[];
};

export type DatasetRecord = {
  id: number;
  name: string;
  description?: string;
  projectSlug: string;
  modalityName: string;
  datasetType: string;
  region?: string;
  resolution?: string;
  dataSize?: string;
  sampleCount?: number;
  status: "available" | "processing" | "failed" | "archived";
  linkedModels?: string[];
};

export type ExternalDatasetCard = {
  id: number;
  title: string;
  description: string;
  sourceName: string;
  modalityName: string;
  region?: string;
  resolution?: string;
  priority: string;
  tags?: string[];
  suitableProjects: string[];
  externalUrl?: string;
  downloadStatus: "candidate" | "planned" | "downloading" | "imported" | "ignored";
};

export type ModelRecord = {
  id: number;
  slug: string;
  name: string;
  version: string;
  description: string;
  projectSlug: string;
};

export type PipelineRecord = {
  id: number;
  modelSlug: string;
  name: string;
  description: string;
  status: string;
};

export type PipelineStep = {
  id: number;
  pipelineId: number;
  stepOrder: number;
  name: string;
  description: string;
  stepType: string;
};

export type PipelineInputDataset = {
  id: number;
  pipelineId: number;
  datasetName: string;
  modalityName: string;
  usageType: "input" | "label" | "auxiliary" | "output";
  required: boolean;
  status: string;
  note: string;
};

export type PipelineOutput = {
  id: number;
  pipelineId: number;
  outputName: string;
  outputType: string;
  description: string;
  status: string;
};

export type DataSourceKey = "huggingface" | "haina" | "georemote" | "internal";
export type DataStatus = "candidate" | "planned" | "available" | "processing" | "imported";

export type DataSourceCard = {
  key: DataSourceKey;
  name: string;
  subtitle: string;
  icon: string;
};

export type DataFilterGroup = {
  title: string;
  items: string[];
};

export type StorageStatus = "local" | "drive";

export type DataCatalogCard = {
  id: number;
  title: string;
  source: DataSourceKey;
  sourceName: string;
  description: string;
  region?: string;
  beginTime?: string;
  endTime?: string;
  resolution?: string;
  size?: string;
  samples?: string;
  stars?: number;
  license?: string;
  domain: string;
  format?: string;
  language?: string;
  modality: string[];
  scope: string[];
  projects: string[];
  projectNames?: string[];
  suitableModels: string[];
  status: DataStatus;
  storageStatus?: StorageStatus;
  storagePath?: string;
  url?: string;
};

export type PipelineMiniCard = {
  id: number;
  projectSlug: string;
  modelName: string;
  tag: string;
  title: string;
  description: string;
  inputs: string[];
  steps: string[];
  outputs: string[];
  href: string;
};

export type WorkbenchNews = {
  id: string;
  category: "model" | "data" | "eval";
  domain: "remote" | "multimodal" | "nlp" | "cv";
  title: string;
  desc: string;
  date: string;
  tags: string[];
};

