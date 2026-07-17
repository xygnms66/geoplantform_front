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
    const headers: HeadersInit = {};
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store", signal: controller.signal, headers });
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
    const token = getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers,
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
    const headers: HeadersInit = {};
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}${cacheKey}`, { cache: "no-store", signal: controller.signal, headers });
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
  return fetchJsonOrThrow<DataProduct[]>("/data-products").catch(() => []);
}

export function createDataProduct(payload: DataProductCreate): Promise<DataProduct> {
  return postJsonOrThrow<DataProduct>("/data-products", payload);
}

export function getDataProduct(productId: number): Promise<DataProductDetail> {
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers: HeadersInit = {};
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/data-products/options`, {
      cache: "no-store",
      signal: controller.signal,
      headers,
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
    const headers: HeadersInit = {};
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store", signal: controller.signal, headers });
    clearTimeout(timeout);
    if (!response.ok) {
      return toFallbackStorageBuckets();
    }
    return (await response.json()) as StorageBucket[];
  } catch {
    return toFallbackStorageBuckets();
  }
}
