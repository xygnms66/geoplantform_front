<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { getAchievements, getProjects } from "@/lib/api";
import type { Achievement, Project } from "@/types";
import { achievements as achievementFallback, projects as projectFallback } from "@/lib/staticData";
import AchievementCard from "@/components/shared/AchievementCard.vue";

const achievements = ref<Achievement[]>(achievementFallback);
const projects = ref<Project[]>(projectFallback);

onMounted(async () => {
  [achievements.value, projects.value] = await Promise.all([getAchievements(), getProjects()]);
});

const projectMap = computed(() => new Map(projects.value.map((p) => [p.id, p])));
</script>

<template>
  <section class="section hero-card project-hero">
    <div class="eyebrow">Achievements</div>
    <h1>成果展示</h1>
    <p>用于展示论文、报告、Demo、模型方案、数据集说明、可视化结果和阶段性平台成果。</p>
  </section>
  <section class="section grid-4">
    <AchievementCard
      v-for="item in achievements"
      :key="item.id"
      :item="item"
      :project="projectMap.get(item.project_id)"
    />
  </section>
</template>
