<script setup lang="ts">
import WorkbenchPlatformClient from "@/components/information/WorkbenchPlatformClient.vue";
</script>

<template>
  <section class="section hero-card project-hero">
    <div class="eyebrow">Information</div>
    <h1>资讯中心</h1>
    <p>
      汇聚遥感、多模态、NLP、CV
      等领域的前沿资讯与技术动态，跟踪模型、数据、评测方向的最新进展，为平台研发提供持续的信息支撑。
    </p>
  </section>
  <section class="section">
    <WorkbenchPlatformClient initial-tab="explore" />
  </section>
</template>
