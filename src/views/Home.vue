<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { getAchievements, getDashboard, getPersonalMembers, getProjects, getTeamGroups } from "@/lib/api";
import { getDataCatalogCards } from "@/lib/dataCenterApi";
import type { Achievement, DashboardSummary, PersonalMember, Project, TeamGroup, DataCatalogCard } from "@/types";
import {
  achievements as achievementFallback,
  dashboardFallback,
  personalMembers,
  projects as projectFallback,
  teamGroups as teamGroupFallback,
} from "@/lib/staticData";
import { dataCatalogCards as dataCatalogFallback } from "@/lib/dataCenterStaticData";
import ProjectCard from "@/components/shared/ProjectCard.vue";
import HeroChart from "@/components/marketing/HeroChart.vue";
import SolarSpiralPreview from "@/components/marketing/SolarSpiralPreview.vue";
import HomeDataCenterPreview from "@/components/marketing/HomeDataCenterPreview.vue";
import AchievementCard from "@/components/shared/AchievementCard.vue";

const dashboard = ref<DashboardSummary>(dashboardFallback);
const members = ref<PersonalMember[]>(personalMembers);
const teamGroups = ref<TeamGroup[]>(teamGroupFallback);
const achievements = ref<Achievement[]>(achievementFallback);
const projects = ref<Project[]>(projectFallback);
const dataCatalogCards = ref<DataCatalogCard[]>(dataCatalogFallback);

onMounted(async () => {
  const [d, m, tg, a, p, dc] = await Promise.all([
    getDashboard(),
    getPersonalMembers(),
    getTeamGroups(),
    getAchievements(),
    getProjects(),
    getDataCatalogCards(),
  ]);
  dashboard.value = d;
  members.value = m;
  teamGroups.value = tg;
  achievements.value = a;
  projects.value = p;
  dataCatalogCards.value = dc;
});

const projectMap = computed(() => new Map(projects.value.map((p) => [p.id, p])));

const memberCountByGroup = computed(() => {
  const map = new Map<string, number>();
  for (const m of members.value) {
    const key = m.team_group?.key;
    if (key) map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
});
</script>

<template>
  <section class="hero">
    <div class="hero-card">
      <div class="eyebrow">GeoRemote Research Asset Platform</div>
      <h1>天地一体遥感智能模型平台</h1>
      <p>
        面向自然资源监测、城市精细治理、生态环境感知等关键场景，统一组织多源遥感数据、模型资产与评测能力，形成从数据获取、表征学习、语义理解到决策赋能的协同式研发底座。
      </p>
      <HeroChart
        :projectCount="dashboard.project_count"
        :memberCount="dashboard.member_count"
        :achievementCount="dashboard.achievement_count"
        :dataAssetCount="dashboard.data_asset_count"
      />
    </div>
    <div class="hero-side panel">
      <SolarSpiralPreview />
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <h2>当前项目</h2>
        <p class="lead">推动遥感智能模型从单任务、单场景、单数据源应用，升级为跨区域、跨尺度、跨任务的通用研究设施。</p>
      </div>
      <router-link class="button" to="/projects">全部项目</router-link>
    </div>
    <div class="grid-4">
      <ProjectCard v-for="project in dashboard.projects" :key="project.slug" :project="project" />
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <h2>数据中心</h2>
        <p class="lead">统一管理已有数据集、外部可下载数据和模型处理管线。</p>
      </div>
      <router-link class="button" to="/data">进入数据中心</router-link>
    </div>
    <HomeDataCenterPreview :cards="dataCatalogCards" />
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <h2>团队总览</h2>
        <p class="lead">
          团队围绕模型、数据、评测与应用协同推进，每个小组各自承担清晰职责，又能在统一平台里共享资产与成果。
        </p>
      </div>
      <router-link class="button" to="/team">全部成员</router-link>
    </div>
    <div class="grid-4">
      <div v-for="group in teamGroups" :key="group.key" class="team-group-card">
        <div class="group-card-head">
          <div>
            <div class="eyebrow">{{ group.short_title }}</div>
            <h2>{{ group.title }}</h2>
          </div>
          <div class="group-count">
            <strong>{{ memberCountByGroup.get(group.key) || 0 }}</strong>
            <span>人</span>
          </div>
        </div>
        <p class="group-description">{{ group.description }}</p>
        <div class="keyword-row">
          <span v-for="keyword in group.keywords" :key="keyword" class="keyword-chip">{{ keyword }}</span>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <h2>成果展示</h2>
        <p class="lead">汇总论文、报告、Demo、模型方案、数据说明和可视化结果，形成持续可复用的研究资产。</p>
      </div>
      <router-link class="button" to="/achievements">全部成果</router-link>
    </div>
    <div class="grid-4">
      <AchievementCard
        v-for="item in achievements.slice(0, 4)"
        :key="item.id"
        :item="item"
        :project="projectMap.get(item.project_id)"
      />
    </div>
  </section>
  <div class="footer-note">Geo Remote Basic Framework & Static Showcase</div>
</template>
