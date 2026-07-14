<script setup lang="ts">
import type { Achievement, Project } from "@/types";

const props = defineProps<{ item: Achievement; project?: Project }>();

const typeLabel: Record<string, string> = {
  visualization: "可视化",
  report: "报告",
  model: "模型",
  demo: "Demo",
  dataset: "数据集",
  pipeline: "数据管线",
};
</script>

<template>
  <component
    :is="project && item.slug ? 'router-link' : 'article'"
    v-if="project && item.slug"
    :to="`/projects/${project.slug}/achievement/${item.slug}`"
    class="card card-link"
    style="text-decoration: none; color: inherit"
  >
    <div>
      <span class="badge green">{{ typeLabel[item.type] || item.type }}</span>
      <h3 style="margin-top: 14px">{{ item.title }}</h3>
      <p>{{ item.description }}</p>
      <div class="badges">
        <span v-for="tag in item.tags" :key="tag" class="badge">{{ tag }}</span>
      </div>
      <div class="meta">
        <span>{{ item.authors_team?.title ?? item.authors_team?.short_title }}</span>
        <span>{{ item.cover_text }}</span>
      </div>
    </div>
  </component>
  <article v-else class="card">
    <span class="badge green">{{ typeLabel[item.type] || item.type }}</span>
    <h3 style="margin-top: 14px">{{ item.title }}</h3>
    <p>{{ item.description }}</p>
    <div class="badges">
      <span v-for="tag in item.tags" :key="tag" class="badge">{{ tag }}</span>
    </div>
    <div class="meta">
      <span>{{ item.authors_team?.title ?? item.authors_team?.short_title }}</span>
      <span>{{ item.cover_text }}</span>
    </div>
  </article>
</template>
