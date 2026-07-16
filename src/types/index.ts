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

export type DataSourceKey =
  | "internal"
  | "georemote"
  | "gee"
  | "huggingface"
  | "paper"
  | "data_portal"
  | "stac"
  | "agent"
  | "other";
export type DataStatus = string;
export type StorageStatus = string;

export type DataSourceCard = {
  key: DataSourceKey;
  name: string;
  subtitle: string;
  icon: string;
};

export type FilterOption = {
  id: number;
  name: string;
  value: string;
};

export type DataFilterGroup = {
  title: string;
  key: string;
  items: FilterOption[];
};

export type DataCatalogFilter = {
  keyword?: string | null;
  source?: string | null;
  sourceId?: number | null;
  scopes?: string[];
  scopeIds?: number[];
  modalities?: string[];
  modalityIds?: number[];
  statuses?: string[];
  statusIds?: number[];
};

export type ActiveCatalogFilter = {
  groupKey: string;
  item: FilterOption;
};

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

export type DataProductCreate = {
  name: string;
  source_id?: number | null;
  provider?: string | null;
  platform?: string | null;
  sensor?: string | null;
  product_level?: string | null;
  description?: string | null;
  license?: string;
  resolution_value?: number | null;
  resolution_unit?: "cm" | "m" | "km" | "deg" | "arcsec";
  format?: string;
  scope_ids?: number[];
  modality_ids?: number[];
};

export type DataProduct = {
  id: number;
  name: string;
  source_id?: number | null;
  provider?: string | null;
  platform?: string | null;
  sensor?: string | null;
  product_level?: string | null;
  description?: string | null;
  license: string;
  resolution_value?: number | null;
  resolution_unit?: string | null;
  format?: string | null;
  scope_ids: number[];
  modality_ids: number[];
};

export type DatasetCreate = {
  display_name: string;
  product_id?: number | null;
  region?: string | null;
  time_start?: string | null;
  time_end?: string | null;
  sample_count?: number | null;
  status?: number;
  storage_location_type?: number;
  storage_path?: string | null;
  source_url?: string | null;
  agent_summary?: string | null;
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

