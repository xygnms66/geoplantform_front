import type { DataCatalogCard, DataFilterGroup, DataSourceCard } from "@/types";
import { dataCatalogCards, dataSources } from "./dataCenterStaticData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const responseCache = new Map<string, unknown>();

export const FILTER_FALLBACK: DataFilterGroup[] = [
  { title: "适用范围", items: ["预训练", "变化检测", "目标检测", "热风险", "全景分割"] },
  { title: "模态", items: ["光学", "多光谱", "SAR", "DEM", "LST", "土地覆盖", "矢量"] },
];

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  if (responseCache.has(path)) {
    return responseCache.get(path) as T;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store", signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      responseCache.set(path, fallback);
      return fallback;
    }

    const data = (await response.json()) as T;
    responseCache.set(path, data);
    return data;
  } catch {
    responseCache.set(path, fallback);
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
    const timeout = setTimeout(() => controller.abort(), 1200);
    const response = await fetch(`${API_BASE_URL}${cacheKey}`, { cache: "no-store", signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      responseCache.set(cacheKey, FILTER_FALLBACK);
      return FILTER_FALLBACK;
    }

    const data = await response.json();
    const filters: DataFilterGroup[] = [
      { title: "适用范围", items: (data.scope ?? []).map((item: { name: string }) => item.name) },
      { title: "模态", items: (data.modality ?? []).map((item: { name: string }) => item.name) },
    ];

    responseCache.set(cacheKey, filters);
    return filters;
  } catch {
    responseCache.set(cacheKey, FILTER_FALLBACK);
    return FILTER_FALLBACK;
  }
}

export function getDataCatalogCards(): Promise<DataCatalogCard[]> {
  return fetchJson<DataCatalogCard[]>("/data-catalog", dataCatalogCards);
}
