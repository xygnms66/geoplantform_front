import type {
  DataCatalogCard,
  DataCatalogFilter,
  DataFilterGroup,
  DataProduct,
  DataProductCreate,
  DatasetCreate,
  DataSourceCard,
  FilterOption,
} from "@/types";
import { dataCatalogCards, dataSources } from "./dataCenterStaticData";

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
  sources?: DataProductFormSource[];
};

export type DataProductFormSource = {
  id: number;
  key: string;
  name: string;
  subtitle?: string | null;
  icon?: string | null;
};

export type LicenseOption = {
  id: number;
  name: string;
  label: string;
};

export type ProductFormFilterOption = FilterOption & {
  description?: string | null;
};

export type DataProductFormOptions = {
  sources: DataProductFormSource[];
  scopes: ProductFormFilterOption[];
  modalities: ProductFormFilterOption[];
  productLevels: string[];
  resolutionUnits: string[];
  formats: string[];
  licenses: LicenseOption[];
};

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
  return fetchJson<DataProduct[]>("/data-products", []);
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

const FALLBACK_FORM_SOURCES: DataProductFormSource[] = [
  { id: 1, key: "huggingface", name: "Hugging Face", subtitle: "社区开源数据", icon: "🤗" },
  { id: 2, key: "haina", name: "海纳数据枢纽", subtitle: "平台候选数据", icon: "🌊" },
  { id: 3, key: "georemote", name: "GeoRemote", subtitle: "遥感自有数据", icon: "🗄️" },
  { id: 4, key: "paper", name: "论文开源数据", subtitle: "学术论文附带数据", icon: "📄" },
  { id: 5, key: "gee", name: "GEE 数据集", subtitle: "Google Earth Engine 公开数据产品", icon: "🛰️" },
];

const FALLBACK_PRODUCT_LEVELS = ["L0", "L1", "L1A", "L1B", "L1C", "L2", "L2A", "L3", "L4"];

const FALLBACK_RESOLUTION_UNITS = ["cm", "m", "km"];

const FALLBACK_FORMATS = [
  "GeoTIFF",
  "COG",
  "TIFF",
  "GRIB",
  "Shapefile",
  "GeoJSON",
  "CSV",
  "Parquet",
  "GeoParquet",
  "JSON",
  "JSONL",
];

const FALLBACK_LICENSES: LicenseOption[] = [
  { id: 1, name: "Internal", label: "内部已有数据资产" },
  { id: 2, name: "Public", label: "外部公开数据集" },
  { id: 3, name: "Restricted", label: "受项目或客户授权限制的数据" },
];

type DataProductFormOptionsResponse = {
  sources?: DataProductFormSource[];
  scopes?: ProductFormFilterOption[];
  modalities?: ProductFormFilterOption[];
  product_levels?: string[];
  resolution_units?: string[];
  formats?: string[];
  licenses?: LicenseOption[];
};

function buildFallbackFormOptions(): DataProductFormOptions {
  return {
    sources: FALLBACK_FORM_SOURCES,
    scopes: FILTER_FALLBACK.find((group) => group.key === "scope")?.items ?? [],
    modalities: FILTER_FALLBACK.find((group) => group.key === "modality")?.items ?? [],
    productLevels: FALLBACK_PRODUCT_LEVELS,
    resolutionUnits: FALLBACK_RESOLUTION_UNITS,
    formats: FALLBACK_FORMATS,
    licenses: FALLBACK_LICENSES,
  };
}

export async function getDataProductFormOptions(): Promise<DataProductFormOptions> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const response = await fetch(`${API_BASE_URL}/data-products/options`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = (await response.json()) as DataProductFormOptionsResponse;

    return {
      sources: data.sources?.length ? data.sources : FALLBACK_FORM_SOURCES,
      scopes: data.scopes?.length ? data.scopes : buildFallbackFormOptions().scopes,
      modalities: data.modalities?.length ? data.modalities : buildFallbackFormOptions().modalities,
      productLevels: data.product_levels?.length ? data.product_levels : FALLBACK_PRODUCT_LEVELS,
      resolutionUnits: data.resolution_units?.length ? data.resolution_units : FALLBACK_RESOLUTION_UNITS,
      formats: data.formats?.length ? data.formats : FALLBACK_FORMATS,
      licenses: data.licenses?.length ? data.licenses : FALLBACK_LICENSES,
    };
  } catch {
    return buildFallbackFormOptions();
  }
}

export function createDataset(payload: DatasetCreate): Promise<unknown> {
  return postJsonOrThrow("/datasets", payload);
}
