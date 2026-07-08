<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getProjects } from "@/lib/api";
import type { Project } from "@/types";
import { projects as projectFallback } from "@/lib/staticData";
import ProjectCard from "@/components/ProjectCard.vue";

const projects = ref<Project[]>(projectFallback);
onMounted(async () => { projects.value = await getProjects(); });
</script>

<template>
  <section class="section project-hero hero-card">
    <div class="eyebrow">Projects</div>
    <h1>遥感项目中心</h1>
    <p>体系以"数据—科学—分析—决策"一体化理念，融合卫星遥感、空间矢量、城市空间数据与多源行业数据，形成覆盖"感知—理解—推理—评估—赋能"的遥感智能技术链条。平台以四个核心模型项目为支撑共同服务于自然资源管理、城市更新、生态环境监测、灾害风险预警与可持续发展决策。</p>
    <div class="grid-4" style="margin-top: 28px;">
      <ProjectCard v-for="project in projects" :key="project.slug" :project="project" />
    </div>
  </section>
</template>
