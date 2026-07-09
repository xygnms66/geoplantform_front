import { achievements, dashboardFallback, personalMembers, projects, teamGroups } from "./staticData";
import type { Achievement, DashboardSummary, PersonalMember, Project, TeamGroup } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const responseCache = new Map<string, unknown>();

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  if (responseCache.has(path)) {
    return responseCache.get(path) as T;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300);
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

export function getDashboard(): Promise<DashboardSummary> {
  return fetchJson<DashboardSummary>("/dashboard/summary", dashboardFallback);
}

export function getProjects(): Promise<Project[]> {
  return fetchJson<Project[]>("/projects", projects);
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const fallback = projects.find((item) => item.slug === slug);
  return fetchJson<Project | undefined>(`/projects/${slug}`, fallback);
}

export function getAchievements(): Promise<Achievement[]> {
  return fetchJson<Achievement[]>("/achievements", achievements);
}

export async function getAchievement(projectSlug: string, achievementSlug: string): Promise<Achievement | undefined> {
  const fallback = achievements.find((item) => item.slug === achievementSlug);
  return fetchJson<Achievement | undefined>(`/projects/${projectSlug}/achievements/${achievementSlug}`, fallback);
}

export function getTeamGroups(): Promise<TeamGroup[]> {
  return fetchJson<TeamGroup[]>("/team-groups", teamGroups);
}

export function getPersonalMembers(): Promise<PersonalMember[]> {
  return fetchJson<PersonalMember[]>("/personal-members", personalMembers);
}
