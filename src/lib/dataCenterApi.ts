import type {
  DataCatalogCard,
  DataCatalogFilter,
  DataFilterGroup,
  DataProduct,
  DataProductCreate,
  DatasetCreate,
  DataSourceCard,
  FilterOption,
  StorageBucket,
} from "@/types";
import { getToken } from "./auth";
import { dataCatalogCards, dataSources } from "./dataCenterStaticData";
import { dataStores as storageFallback } from "./workbenchStudioData";

// ==================================
// MOCK START - 开发用，上线删除本块
// ==================================
const MOCK_DATASETS: DatasetRow[] = dataCatalogCards.map((c, i) => ({
  id: c.id,
  name: c.title + (c.region ? ` ${c.region}` : ""),
  product_id: c.id,
  product_name: c.title,
  region: c.region || null,
  time_start: c.beginTime ? c.beginTime + "-01" : null,
  time_end: c.endTime ? c.endTime + "-01" : null,
  status: c.status === "可用" ? "AVAILABLE" : "DRAFT",
  status_label: c.status,
  ingestion_method: "MANUAL",
  storage_status: c.storageStatus === "本地存储" ? "STORED" : "EXTERNAL_ONLY",
  owner_id: 13,
}));

const MOCK_DATA_PRODUCTS: DataProduct[] = dataCatalogCards.map((c, i) => ({
  id: c.id,
  name: c.title,
  source_id: i + 1,
  source_type: c.source.toUpperCase(),
  provider: c.title,
  platform: c.title,
  sensor: null,
  product_level: null,
  description: c.description,
  license: "PUBLIC",
  resolution_value: c.resolution ? parseFloat(c.resolution) || null : null,
  resolution_unit: "m",
  format: c.format,
  scope_ids: [1],
  modality_ids: [1],
}));

const MOCK_FORM_OPTIONS: DataProductFormOptions = {
  sources: [
    { value: "GEE", label: "Google Earth Engine", description: null },
    { value: "GEOREMOTE", label: "GeoRemote", description: null },
    { value: "PAPER", label: "论文开源数据", description: null },
    { value: "INTERNAL", label: "内部数据", description: null },
  ],
  scopes: [
    { id: 1, name: "预训练", value: "预训练", description: null },
    { id: 2, name: "变化检测", value: "变化检测", description: null },
    { id: 3, name: "目标检测", value: "目标检测", description: null },
    { id: 4, name: "热风险", value: "热风险", description: null },
    { id: 5, name: "语义分割", value: "语义分割", description: null },
    { id: 6, name: "地物分类", value: "地物分类", description: null },
  ],
  modalities: [
    { id: 1, name: "多光谱", value: "多光谱", description: null },
    { id: 2, name: "SAR", value: "SAR", description: null },
    { id: 3, name: "光学", value: "光学", description: null },
    { id: 4, name: "DEM", value: "DEM", description: null },
    { id: 5, name: "土地覆盖", value: "土地覆盖", description: null },
    { id: 6, name: "特征嵌入", value: "特征嵌入", description: null },
    { id: 7, name: "矢量", value: "矢量", description: null },
    { id: 8, name: "地表温度", value: "地表温度", description: null },
  ],
  productLevels: [
    { value: "L1", label: "L1", description: null },
    { value: "L2", label: "L2", description: null },
    { value: "L2A", label: "L2A", description: null },
    { value: "L3", label: "L3", description: null },
    { value: "L4", label: "L4", description: null },
  ],
  resolutionUnits: ["cm", "m", "km", "deg", "arcsec"],
  formats: [
    { value: "GeoTIFF", label: "GeoTIFF", description: null },
    { value: "COG", label: "COG", description: null },
    { value: "Parquet", label: "Parquet", description: null },
    { value: "GeoJSON", label: "GeoJSON", description: null },
    { value: "Shapefile", label: "Shapefile", description: null },
  ],
  licenses: [
    { value: "PUBLIC", label: "公开", description: null },
    { value: "INTERNAL", label: "内部", description: null },
    { value: "CC_BY_4_0", label: "CC-BY-4.0", description: null },
  ],
};

function isMockMode(): boolean {
  return import.meta.env.VITE_USE_MOCK === "true" || import.meta.env.VITE_USE_MOCK === "1";
}
// ==================================
// MOCK END（上面这块和下面每个函数里的 if(isMockMode) 一起删）
// ==================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const REQUEST_TIMEOUT_MS = 5000;
const responseCache = new Map<string, unknown>();

export const FILTER_FALLBACK: DataFilterGroup[] = [
  {
    title: "适用范围",
    key: "scope",
    items: [
      { id: 1, name: "预训练", value: "预训练" },
      { id: 2, name: "变化检测", value: "变化检测" },
      { id: 3, name: "目标检测", value: "目标检测" },
      { id: 4, name: "热风险", value: "热风险" },
      { id: 5, name: "全景分割", value: "全景分割" },
    ],
  },
  {
    title: "模态",
    key: "modality",
    items: [
      { id: 1, name: "光学", value: "光学" },
      { id: 2, name: "多光谱", value: "多光谱" },
      { id: 3, name: "SAR", value: "SAR" },
      { id: 4, name: "DEM", value: "DEM" },
      { id: 5, name: "LST", value: "LST" },
      { id: 6, name: "土地覆盖", value: "土地覆盖" },
      { id: 7, name: "矢量", value: "矢量" },
    ],
  },
  {
    title: "状态",
    key: "status",
    items: [
      { id: 1, name: "已入库", value: "available" },
      { id: 2, name: "计划接入", value: "planned" },
      { id: 3, name: "待审核", value: "candidate" },
      { id: 4, name: "处理中", value: "processing" },
    ],
  },
];

type DataCatalogFiltersResponse = {
  groups?: DataFilterGroup[];
  sources?: DataSourceCard[];
};

export type LabeledOption = {
  value: string;
  label: string;
  description?: string | null;
};

export type ProductFormFilterOption = FilterOption & {
  description?: string | null;
};

export type DataProductFormOptions = {
  sources: LabeledOption[];
  scopes: ProductFormFilterOption[];
  modalities: ProductFormFilterOption[];
  productLevels: LabeledOption[];
  resolutionUnits: string[];
  formats: LabeledOption[];
  licenses: LabeledOption[];
};

export class FormOptionsLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormOptionsLoadError";
  }
}

export type DataProductDetail = DataProduct & {
  scopes?: Array<{ id: number; name: string; description?: string | null }>;
  modalities?: Array<{ id: number; name: string; description?: string | null }>;
  scope_links?: Array<{ scope_id: number }>;
  modality_links?: Array<{ modality_id: number }>;
};

export function hasActiveCatalogFilters(filter: DataCatalogFilter): boolean {
  if (filter.keyword?.trim()) return true;
  if (filter.source) return true;
  if (filter.sourceId != null) return true;
  return ["scopes", "scopeIds", "modalities", "modalityIds", "statuses", "statusIds"].some((key) => {
    const value = filter[key as keyof DataCatalogFilter];
    return Array.isArray(value) && value.length > 0;
  });
}

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  if (responseCache.has(path)) {
    return responseCache.get(path) as T;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store", signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as T;
    responseCache.set(path, data);
    return data;
  } catch {
    return fallback;
  }
}

async function postJson<T>(path: string, body: unknown, fallback: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export function getDataCenterSources(): Promise<DataSourceCard[]> {
  return fetchJson<DataSourceCard[]>("/data-sources", dataSources);
}

export async function getDataCenterFilters(): Promise<DataFilterGroup[]> {
  const cacheKey = "/datasets/filters";
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey) as DataFilterGroup[];
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const response = await fetch(`${API_BASE_URL}${cacheKey}`, { cache: "no-store", signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return FILTER_FALLBACK;
    }

    const data = (await response.json()) as DataCatalogFiltersResponse;
    const filters = data.groups ?? FILTER_FALLBACK;
    responseCache.set(cacheKey, filters);
    return filters;
  } catch {
    return FILTER_FALLBACK;
  }
}

export function getDataCatalogCards(): Promise<DataCatalogCard[]> {
  return fetchJson<DataCatalogCard[]>("/data-catalog", dataCatalogCards);
}

export function searchDataCatalogCards(
  filter: DataCatalogFilter,
  fallback: DataCatalogCard[] = [],
): Promise<DataCatalogCard[]> {
  return postJson<DataCatalogCard[]>("/data-catalog", filter, fallback);
}

export async function fetchDataCatalogCards(filter?: DataCatalogFilter): Promise<DataCatalogCard[]> {
  if (!filter || !hasActiveCatalogFilters(filter)) {
    return getDataCatalogCards();
  }
  return searchDataCatalogCards(filter);
}

async function fetchJsonOrThrow<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    signal: controller.signal,
    ...init,
    headers,
  });
  clearTimeout(timeout);

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.detail === "string") message = errorBody.detail;
      else if (Array.isArray(errorBody?.detail)) {
        message = errorBody.detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join("; ");
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function postJsonOrThrow<T>(path: string, body: unknown): Promise<T> {
  return fetchJsonOrThrow<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getDataProducts(): Promise<DataProduct[]> {
  // ========== MOCK START ==========
  if (isMockMode()) return Promise.resolve(MOCK_DATA_PRODUCTS);
  // ========== MOCK END ==========
  return fetchJsonOrThrow<DataProduct[]>("/data-products").catch(() => []);
}

export function createDataProduct(payload: DataProductCreate): Promise<DataProduct> {
  return postJsonOrThrow<DataProduct>("/data-products", payload);
}

export function getDataProduct(productId: number): Promise<DataProductDetail> {
  // ========== MOCK START ==========
  if (isMockMode()) {
    const p = MOCK_DATA_PRODUCTS.find((d) => d.id === productId);
    if (!p) return Promise.reject(new Error("产品不存在"));
    return Promise.resolve({ ...p, scopes: [], modalities: [], scope_links: [], modality_links: [] });
  }
  // ========== MOCK END ==========
  return fetchJsonOrThrow<DataProductDetail>(`/data-products/${productId}`);
}

export function updateDataProduct(productId: number, payload: DataProductCreate): Promise<DataProduct> {
  return fetchJsonOrThrow<DataProduct>(`/data-products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteDataProduct(productId: number): Promise<void> {
  return fetchJsonOrThrow<void>(`/data-products/${productId}`, {
    method: "DELETE",
  });
}

function normalizeLabeledOptions(items: Array<string | LabeledOption> | undefined): LabeledOption[] {
  if (!items?.length) return [];
  return items.map((item) =>
    typeof item === "string"
      ? { value: item, label: item, description: null }
      : {
          value: item.value,
          label: item.label || item.value,
          description: item.description ?? null,
        },
  );
}

type DataProductFormOptionsResponse = {
  sources?: Array<string | LabeledOption>;
  scopes?: ProductFormFilterOption[];
  modalities?: ProductFormFilterOption[];
  product_levels?: Array<string | LabeledOption>;
  resolution_units?: string[];
  formats?: Array<string | LabeledOption>;
  licenses?: Array<string | LabeledOption>;
};

export async function getDataProductFormOptions(): Promise<DataProductFormOptions> {
  // ========== MOCK START ==========
  if (isMockMode()) return MOCK_FORM_OPTIONS;
  // ========== MOCK END ==========

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/data-products/options`, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new FormOptionsLoadError(`加载产品表单选项失败（HTTP ${response.status}）`);
    }

    const data = (await response.json()) as DataProductFormOptionsResponse;

    return {
      sources: normalizeLabeledOptions(data.sources),
      scopes: data.scopes ?? [],
      modalities: data.modalities ?? [],
      productLevels: normalizeLabeledOptions(data.product_levels),
      resolutionUnits: data.resolution_units ?? [],
      formats: normalizeLabeledOptions(data.formats),
      licenses: normalizeLabeledOptions(data.licenses),
    };
  } catch (error) {
    if (error instanceof FormOptionsLoadError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new FormOptionsLoadError("加载产品表单选项超时，请检查后端服务是否可用");
    }
    const detail = error instanceof Error ? error.message : "未知错误";
    throw new FormOptionsLoadError(`加载产品表单选项失败：${detail}`);
  } finally {
    clearTimeout(timeout);
  }
}

export function createDataset(payload: DatasetCreate): Promise<unknown> {
  // ========== MOCK START ==========
  if (isMockMode()) {
    const newDs = { id: Date.now(), ...payload, name: `数据集 ${Date.now()}`, status: "DRAFT", status_label: "未处理" };
    return Promise.resolve(newDs);
  }
  // ========== MOCK END ==========

  const token = getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetchJsonOrThrow("/datasets", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

export type DatasetRow = {
  id: number;
  name: string;
  product_id: number;
  product_name?: string | null;
  region?: string | null;
  time_start?: string | null;
  time_end?: string | null;
  status: string;
  status_label?: string | null;
  ingestion_method?: string;
  storage_status?: string;
  owner_id?: number | null;
};

export type DatasetUpdatePayload = {
  region?: string | null;
  time_start?: string | null;
  time_end?: string | null;
  status?: string;
};

export function getDatasets(): Promise<DatasetRow[]> {
  // ========== MOCK START ==========
  if (isMockMode()) return Promise.resolve(MOCK_DATASETS);
  // ========== MOCK END ==========
  return fetchJsonOrThrow<DatasetRow[]>("/datasets").catch(() => []);
}

export function updateDataset(datasetId: number, payload: DatasetUpdatePayload): Promise<DatasetRow> {
  return fetchJsonOrThrow<DatasetRow>(`/datasets/${datasetId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteDataset(datasetId: number): Promise<void> {
  return fetchJsonOrThrow<void>(`/datasets/${datasetId}`, {
    method: "DELETE",
  });
}

export function transferDataset(datasetId: number, newOwnerEmployeeNo: string): Promise<DatasetRow> {
  return postJsonOrThrow<DatasetRow>(`/datasets/${datasetId}/transfer`, {
    new_owner_employee_no: newOwnerEmployeeNo,
  });
}

function toFallbackStorageBuckets(): StorageBucket[] {
  return storageFallback.map((store, index) => ({
    id: -(index + 1),
    backend_id: -(index + 1),
    bucket_name: store.name,
    mount_protocol: store.type.toLowerCase() === "nfs" ? "nfs" : "s3fs",
    mount_path: null,
    description: null,
    is_default: index === 0,
    is_active: true,
    status: "运行中",
    backend_key: store.name,
    backend_name: store.name,
    backend_type: store.type.toLowerCase(),
    type_label: store.type,
    endpoint_url: store.endpoint,
  }));
}

export async function getStorageBuckets(activeOnly = false): Promise<StorageBucket[]> {
  const query = activeOnly ? "?active_only=true" : "";
  const path = `/storage-buckets${query}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store", signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      return toFallbackStorageBuckets();
    }
    return (await response.json()) as StorageBucket[];
  } catch {
    return toFallbackStorageBuckets();
  }
}
