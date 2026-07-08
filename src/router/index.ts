import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/Home.vue";
import LoginView from "@/views/Login.vue";
import ProjectsView from "@/views/Projects.vue";
import ProjectDetailView from "@/views/ProjectDetail.vue";
import AchievementDetailView from "@/views/AchievementDetail.vue";
import PipelineDetailView from "@/views/PipelineDetail.vue";
import TeamView from "@/views/Team.vue";
import AchievementsView from "@/views/Achievements.vue";
import DataCenterView from "@/views/DataCenter.vue";
import AdminDatasetsView from "@/views/AdminDatasets.vue";
import AefPlatformView from "@/views/AefPlatform.vue";
import InformationView from "@/views/Information.vue";


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/login", name: "login", component: LoginView },
    { path: "/projects", name: "projects", component: ProjectsView },
    { path: "/projects/:slug", name: "project-detail", component: ProjectDetailView },
    { path: "/projects/:slug/achievement/:achievementSlug", name: "achievement-detail", component: AchievementDetailView },
    { path: "/projects/:slug/models/:modelId/pipeline", name: "pipeline-detail", component: PipelineDetailView },
    { path: "/team", name: "team", component: TeamView },
    { path: "/achievements", name: "achievements", component: AchievementsView },
    { path: "/data", name: "data", component: DataCenterView },
    { path: "/admin/datasets", name: "admin-datasets", component: AdminDatasetsView },
    { path: "/information", name: "information", component: InformationView },
    { path: "/aef", name: "aef", component: AefPlatformView },
  ],
});

export default router;
