<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { getAchievement, getProject } from "@/lib/api";
import {
  getModelBySlug,
  getPipelineByModel,
  getPipelineInputs,
  getPipelineOutputs,
  getPipelineSteps,
} from "@/lib/dataApi";
import type { Achievement, Project, PipelineStep, PipelineInputDataset, PipelineOutput } from "@/types";

const route = useRoute();
const project = ref<Project>();
const achievement = ref<Achievement>();
const model = ref<any>();
const pipeline = ref<any>();
const steps = ref<PipelineStep[]>([]);
const inputs = ref<PipelineInputDataset[]>([]);
const outputs = ref<PipelineOutput[]>([]);

onMounted(async () => {
  const slug = route.params.slug as string;
  const achievementSlug = route.params.achievementSlug as string;
  const [p, a] = await Promise.all([getProject(slug), getAchievement(slug, achievementSlug)]);
  project.value = p;
  achievement.value = a;

  if (a?.type === "pipeline" && p) {
    const modelSlug = p.slug === "embedding" ? "geoorigin-embedding" : p.slug;
    const m = await getModelBySlug(modelSlug);
    model.value = m;
    const pipe = m ? await getPipelineByModel(modelSlug) : null;
    pipeline.value = pipe;
    if (pipe) {
      steps.value = await getPipelineSteps(pipe.id);
      inputs.value = await getPipelineInputs(pipe.id);
      outputs.value = await getPipelineOutputs(pipe.id);
    }
  }
});
</script>

<template>
  <div class="adm-page" v-if="achievement">
    <section class="adm-hero-card" v-if="achievement.type === 'pipeline' && pipeline">
      <div class="eyebrow">Model Pipeline</div>
      <h1>{{ pipeline.name }}</h1>
      <p>{{ pipeline.description }}</p>
      <div class="adm-tag-list">
        <span class="adm-tag">{{ model?.name }}</span>
        <span class="adm-tag">{{ model?.version }}</span>
        <span class="adm-tag">{{ pipeline.status }}</span>
      </div>
    </section>
    <section class="adm-hero-card" v-else>
      <div class="eyebrow">{{ achievement.type }}</div>
      <h1>{{ achievement.title }}</h1>
      <p>{{ achievement.description }}</p>
      <div class="adm-tag-list">
        <span v-for="tag in achievement.tags" :key="tag" class="adm-tag">{{ tag }}</span>
      </div>
    </section>

    <template v-if="achievement.type === 'pipeline' && pipeline">
      <section class="adm-section">
        <div class="adm-section-header">
          <h2>输入数据来源</h2>
          <p>管线处理的不同模态数据均来源于平台已有数据集。</p>
        </div>
        <div class="adm-grid3">
          <div v-for="item in inputs" :key="item.id" class="adm-pipeline-input-card">
            <div class="adm-card-topline">
              <span class="adm-tag">{{ item.modalityName }}</span
              ><span class="adm-status adm-status-available">{{ item.status }}</span>
            </div>
            <h3>{{ item.datasetName }}</h3>
            <p>{{ item.note }}</p>
            <div class="adm-muted adm-small">
              用途：{{ { input: "输入", label: "标签", auxiliary: "辅助", output: "输出" }[item.usageType] }} ·
              {{ item.required ? "必需数据" : "可选数据" }}
            </div>
          </div>
        </div>
      </section>
      <section class="adm-section-card">
        <div class="adm-section-header">
          <h2>处理流程</h2>
          <p>当前先展示静态管线结构，后续可接入真实处理进度和执行日志。</p>
        </div>
        <div class="adm-pipeline-flow">
          <div
            v-for="step in [...steps].sort((a, b) => a.stepOrder - b.stepOrder)"
            :key="step.id"
            class="adm-pipeline-step"
          >
            <div class="adm-step-index">{{ step.stepOrder }}</div>
            <div>
              <h3>{{ step.name }}</h3>
              <p>{{ step.description }}</p>
              <span class="adm-tag">{{ step.stepType }}</span>
            </div>
          </div>
        </div>
      </section>
      <section class="adm-section">
        <div class="adm-section-header">
          <h2>管线产出</h2>
          <p>处理后的预处理数据、训练数据、索引文件和质量报告。</p>
        </div>
        <div class="adm-grid2">
          <div v-for="item in outputs" :key="item.id" class="adm-module-card">
            <div class="adm-card-topline">
              <span class="adm-tag">{{ item.outputType }}</span
              ><span class="adm-status adm-status-available">{{ item.status }}</span>
            </div>
            <h3>{{ item.outputName }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </section>
    </template>

    <template v-else>
      <section class="adm-section">
        <div class="adm-section-header"><h2>项目信息</h2></div>
        <div class="adm-module-card">
          <h3>{{ project?.name }}</h3>
          <p>{{ project?.description }}</p>
        </div>
      </section>
      <section v-if="achievement.authors_team" class="adm-section">
        <div class="adm-section-header"><h2>负责团队</h2></div>
        <div class="adm-module-card">
          <h3>{{ achievement.authors_team.title }}</h3>
          <p>{{ achievement.authors_team.description }}</p>
        </div>
      </section>
    </template>
  </div>
  <div v-else-if="!achievement && project === undefined" class="adm-page">
    <section class="adm-hero-card">
      <h1>未找到成果</h1>
      <p>该成果不存在或已被移除。</p>
    </section>
  </div>
</template>

<style scoped>
.adm-page {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 32px 0 56px;
}
.adm-section {
  margin-top: 32px;
}
.adm-hero-card,
.adm-section-card,
.adm-module-card,
.adm-pipeline-input-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.72);
  border-radius: 22px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.22);
}
.adm-hero-card {
  padding: 34px;
}
.adm-hero-card h1 {
  margin: 8px 0 12px;
  font-size: 38px;
}
.adm-hero-card p {
  max-width: 780px;
  color: rgba(226, 232, 240, 0.78);
  line-height: 1.8;
}
.eyebrow {
  color: #38bdf8;
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.adm-section-header {
  margin-bottom: 16px;
}
.adm-section-header h2 {
  margin: 0 0 8px;
}
.adm-section-header p {
  color: rgba(226, 232, 240, 0.64);
  margin: 0;
}
.adm-section-card {
  padding: 24px;
  margin-top: 24px;
}
.adm-grid2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 24px;
}
.adm-grid3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}
.adm-module-card,
.adm-pipeline-input-card {
  display: block;
  padding: 24px;
  text-decoration: none;
  color: inherit;
}
.adm-module-card h3,
.adm-pipeline-input-card h3 {
  margin: 10px 0;
}
.adm-module-card p,
.adm-pipeline-input-card p {
  color: rgba(226, 232, 240, 0.68);
  line-height: 1.7;
}
.adm-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.adm-tag {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 2px 9px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.12);
  color: #7dd3fc;
  border: 1px solid rgba(56, 189, 248, 0.18);
  font-size: 12px;
}
.adm-status {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 12px;
  background: rgba(148, 163, 184, 0.14);
  color: #cbd5e1;
}
.adm-status-available {
  background: rgba(34, 197, 94, 0.14);
  color: #86efac;
}
.adm-card-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.adm-muted {
  color: rgba(226, 232, 240, 0.58);
}
.adm-small {
  font-size: 12px;
  line-height: 1.6;
}
.adm-pipeline-flow {
  display: grid;
  gap: 14px;
}
.adm-pipeline-step {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(2, 6, 23, 0.42);
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.adm-step-index {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(56, 189, 248, 0.16);
  color: #7dd3fc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.adm-pipeline-step h3 {
  margin: 0 0 6px;
}
.adm-pipeline-step p {
  margin: 0 0 10px;
  color: rgba(226, 232, 240, 0.68);
  line-height: 1.7;
}
@media (max-width: 900px) {
  .adm-grid2,
  .adm-grid3 {
    grid-template-columns: 1fr;
  }
  .adm-hero-card h1 {
    font-size: 30px;
  }
}
</style>
