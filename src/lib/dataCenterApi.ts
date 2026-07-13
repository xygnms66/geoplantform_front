import type {
  DataCatalogCard,
  DataCatalogFilter,
  DataFilterGroup,
  DataSourceCard,
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
