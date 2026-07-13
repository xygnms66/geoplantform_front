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
  <div class="achievements-page">
    <section class="ach-hero-card">
      <div class="eyebrow">Achievements</div>
      <h1>成果展示</h1>
      <p>用于展示论文、报告、Demo、模型方案、数据集说明、可视化结果和阶段性平台成果。</p>
    </section>

    <section class="ach-grid">
      <AchievementCard
        v-for="item in achievements"
        :key="item.id"
        :item="item"
        :project="projects.find((p) => p.id === item.project_id)"
      />
    </section>
  </div>
</template>

<style scoped>
.achievements-page {
  width: min(1520px, calc(100% - 40px));
  margin: 0 auto;
  padding: 8px 0 56px;
}

.ach-hero-card {
  position: relative;
  overflow: hidden;
  padding: 34px 38px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.68);
  backdrop-filter: blur(18px);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.22);
}

.ach-hero-card::after {
  content: "";
  position: absolute;
  right: -80px;
  top: -80px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.12);
  pointer-events: none;
}

.ach-hero-card .eyebrow {
  position: relative;
  z-index: 1;
  color: #38bdf8;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.ach-hero-card h1 {
  position: relative;
  z-index: 1;
  margin: 10px 0 14px;
  font-size: clamp(36px, 5vw, 56px);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.ach-hero-card p {
  position: relative;
  z-index: 1;
  max-width: 820px;
  margin: 0;
  color: rgba(226, 232, 240, 0.78);
  line-height: 1.75;
}

.ach-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  margin-top: 28px;
}

.achievements-page :deep(.card) {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.68);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.2);
}

.achievements-page :deep(.card:hover) {
  border-color: rgba(56, 189, 248, 0.35);
  background: rgba(15, 23, 42, 0.78);
}

@media (max-width: 1200px) {
  .ach-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .ach-grid {
    grid-template-columns: 1fr;
  }

  .ach-hero-card {
    padding: 28px 24px;
  }
}
</style>
