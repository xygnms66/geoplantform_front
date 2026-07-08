<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getAchievements, getProjects } from "@/lib/api";
import type { Achievement, Project } from "@/types";
import { achievements as achievementFallback, projects as projectFallback } from "@/lib/staticData";
import AchievementCard from "@/components/AchievementCard.vue";

const achievements = ref<Achievement[]>(achievementFallback);
const projects = ref<Project[]>(projectFallback);

onMounted(async () => {
  [achievements.value, projects.value] = await Promise.all([getAchievements(), getProjects()]);
});
</script>

<template>
  <section class="section hero-card project-hero">
    <div class="eyebrow">Achievements</div>
    <h1>成果展示</h1>
    <p>用于展示论文、报告、Demo、模型方案、数据集说明、可视化结果和阶段性平台成果。</p>
  </section>
  <section class="section grid-4">
    <AchievementCard v-for="item in achievements" :key="item.id" :item="item" :project="projects.find((p) => p.id === item.project_id)" />
  </section>
</template>
