import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: () => import("@/views/Home.vue") },
    { path: "/login", name: "login", component: () => import("@/views/Login.vue") },
    { path: "/projects", name: "projects", component: () => import("@/views/Projects.vue") },
    { path: "/projects/:slug", name: "project-detail", component: () => import("@/views/ProjectDetail.vue") },
    { path: "/projects/:slug/achievement/:achievementSlug", name: "achievement-detail", component: () => import("@/views/AchievementDetail.vue") },
    { path: "/projects/:slug/models/:modelId/pipeline", name: "pipeline-detail", component: () => import("@/views/PipelineDetail.vue") },
    { path: "/team", name: "team", component: () => import("@/views/Team.vue") },
    { path: "/achievements", name: "achievements", component: () => import("@/views/Achievements.vue") },
    { path: "/data", name: "data", component: () => import("@/views/DataCenter.vue") },
    { path: "/admin/datasets", name: "admin-datasets", component: () => import("@/views/AdminDatasets.vue") },
    { path: "/information", name: "information", component: () => import("@/views/RemoteSensingIntelligence.vue") },
    { path: "/aef", name: "aef", component: () => import("@/views/AefPlatform.vue") },
  ],
});

export default router;
