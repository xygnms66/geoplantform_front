<script setup lang="ts">
import type { Project } from "@/types";

defineProps<{ project: Project }>();
</script>

<template>
  <router-link :to="`/projects/${project.slug}`" class="card">
    <span :class="project.status === 'planning' ? 'badge amber' : 'badge green'">
      {{ project.status === "planning" ? "规划中" : "进行中" }}
    </span>
    <h3 style="margin-top: 14px">{{ project.name }}</h3>
    <p>{{ project.subtitle }}</p>
    <div class="badges">
      <span v-for="tag in project.tags.slice(0, 4)" :key="tag" class="badge">{{ tag }}</span>
    </div>
  </router-link>
</template>
