<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getModelBySlug, getPipelineByModel, getPipelineInputs, getPipelineOutputs, getPipelineSteps } from "@/lib/dataApi";
import type { PipelineStep, PipelineInputDataset, PipelineOutput } from "@/types";

const route = useRoute();
const model = ref<any>();
const pipeline = ref<any>();
const steps = ref<PipelineStep[]>([]);
const inputs = ref<PipelineInputDataset[]>([]);
const outputs = ref<PipelineOutput[]>([]);

onMounted(async () => {
  const modelId = route.params.modelId as string;
  const m = await getModelBySlug(modelId);
  model.value = m;
  const pipe = await getPipelineByModel(modelId);
  pipeline.value = pipe;
  if (pipe) {
    steps.value = await getPipelineSteps(pipe.id);
    inputs.value = await getPipelineInputs(pipe.id);
    outputs.value = await getPipelineOutputs(pipe.id);
  }
});
</script>

<template>
  <div class="pld-page">
    <template v-if="model && pipeline">
      <section class="pld-hero-card">
        <div class="eyebrow">Model Pipeline</div>
        <h1>{{ pipeline.name }}</h1>
        <p>{{ pipeline.description }}</p>
        <div class="pld-tag-list">
          <span class="pld-tag">{{ model.name }}</span>
          <span class="pld-tag">{{ model.version }}</span>
          <span class="pld-tag">{{ pipeline.status }}</span>
        </div>
      </section>
      <section class="pld-section">
        <div class="pld-section-header"><h2>输入数据来源</h2><p>管线处理的不同模态数据均来源于平台已有数据集。</p></div>
        <div class="pld-grid3">
          <div v-for="item in inputs" :key="item.id" class="pld-input-card">
            <div class="pld-card-topline"><span class="pld-tag">{{ item.modalityName }}</span><span class="pld-status-available">{{ item.status }}</span></div>
            <h3>{{ item.datasetName }}</h3>
            <p>{{ item.note }}</p>
            <div class="pld-muted pld-small">用途：{{ { input: "输入", label: "标签", auxiliary: "辅助", output: "输出" }[item.usageType] }} · {{ item.required ? "必需数据" : "可选数据" }}</div>
          </div>
        </div>
      </section>
      <section class="pld-section-card">
        <div class="pld-section-header"><h2>处理流程</h2><p>当前先展示静态管线结构，后续可接入真实处理进度和执行日志。</p></div>
        <div class="pld-pipeline-flow">
          <div v-for="step in [...steps].sort((a, b) => a.stepOrder - b.stepOrder)" :key="step.id" class="pld-pipeline-step">
            <div class="pld-step-index">{{ step.stepOrder }}</div>
            <div>
              <h3>{{ step.name }}</h3>
              <p>{{ step.description }}</p>
              <span class="pld-tag">{{ step.stepType }}</span>
            </div>
          </div>
        </div>
      </section>
      <section class="pld-section">
        <div class="pld-section-header"><h2>管线产出</h2><p>处理后的预处理数据、训练数据、索引文件和质量报告。</p></div>
        <div class="pld-grid2">
          <div v-for="item in outputs" :key="item.id" class="pld-module-card">
            <div class="pld-card-topline"><span class="pld-tag">{{ item.outputType }}</span><span class="pld-status-available">{{ item.status }}</span></div>
            <h3>{{ item.outputName }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </section>
    </template>
    <template v-else>
      <section class="pld-hero-card"><h1>未找到模型管线</h1><p>当前模型还没有配置数据处理管线。</p></section>
    </template>
  </div>
</template>

<style scoped>
.pld-page { width: min(1180px, calc(100% - 40px)); margin: 0 auto; padding: 32px 0 56px; }
.pld-section { margin-top: 32px; }
.pld-hero-card, .pld-section-card, .pld-module-card, .pld-input-card { border: 1px solid rgba(148, 163, 184, 0.18); background: rgba(15, 23, 42, 0.72); border-radius: 22px; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.22); }
.pld-hero-card { padding: 34px; }
.pld-hero-card h1 { margin: 8px 0 12px; font-size: 38px; }
.pld-hero-card p { max-width: 780px; color: rgba(226, 232, 240, 0.78); line-height: 1.8; }
.eyebrow { color: #38bdf8; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; }
.pld-section-header { margin-bottom: 16px; }
.pld-section-header h2 { margin: 0 0 8px; }
.pld-section-header p { color: rgba(226, 232, 240, 0.64); margin: 0; }
.pld-section-card { padding: 24px; margin-top: 24px; }
.pld-grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 24px; }
.pld-grid3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: 18px; }
.pld-module-card, .pld-input-card { display: block; padding: 24px; text-decoration: none; color: inherit; }
.pld-module-card h3, .pld-input-card h3 { margin: 10px 0; }
.pld-module-card p, .pld-input-card p { color: rgba(226, 232, 240, 0.68); line-height: 1.7; }
.pld-tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.pld-tag { display: inline-flex; align-items: center; min-height: 24px; padding: 2px 9px; border-radius: 999px; background: rgba(14, 165, 233, 0.12); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.18); font-size: 12px; }
.pld-status-available { display: inline-flex; align-items: center; min-height: 24px; padding: 2px 9px; border-radius: 999px; font-size: 12px; background: rgba(34, 197, 94, 0.14); color: #86efac; }
.pld-card-topline { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.pld-muted { color: rgba(226, 232, 240, 0.58); }
.pld-small { font-size: 12px; line-height: 1.6; }
.pld-pipeline-flow { display: grid; gap: 14px; }
.pld-pipeline-step { display: grid; grid-template-columns: 42px 1fr; gap: 14px; padding: 16px; border-radius: 16px; background: rgba(2, 6, 23, 0.42); border: 1px solid rgba(148, 163, 184, 0.12); }
.pld-step-index { width: 36px; height: 36px; border-radius: 12px; background: rgba(56, 189, 248, 0.16); color: #7dd3fc; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.pld-pipeline-step h3 { margin: 0 0 6px; }
.pld-pipeline-step p { margin: 0 0 10px; color: rgba(226, 232, 240, 0.68); line-height: 1.7; }
@media (max-width: 900px) { .pld-grid2, .pld-grid3 { grid-template-columns: 1fr; } .pld-hero-card h1 { font-size: 30px; } }
</style>
