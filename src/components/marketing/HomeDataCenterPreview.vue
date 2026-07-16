<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import type { DataCatalogCard } from "@/types";
import { dataSources, pipelineCards } from "@/lib/dataCenterStaticData";

const props = defineProps<{ cards: DataCatalogCard[] }>();

const radarChartRef = ref<HTMLElement>();
let radarInstance: echarts.ECharts | null = null;

// --- computed stats ---
const internalCards = computed(() => props.cards.filter((c) => c.source === "internal" || c.source === "georemote"));
const externalCards = computed(() => props.cards.filter((c) => c.source !== "internal" && c.source !== "georemote"));
const readyCards = computed(() => props.cards.filter((c) => c.status === "可用"));

const allModalities = computed(() => {
  const set = new Set<string>();
  props.cards.forEach((c) => c.modality.forEach((m) => set.add(m)));
  return [...set];
});

const allScopes = computed(() => {
  const set = new Set<string>();
  props.cards.forEach((c) => c.scope.forEach((s) => set.add(s)));
  return [...set];
});

const totalSize = computed(() => {
  let total = 0;
  props.cards.forEach((c) => {
    if (c.size && c.size.includes("TB")) total += parseFloat(c.size) * 1024;
    else if (c.size && c.size.includes("GB")) total += parseFloat(c.size);
  });
  return total >= 1024 ? (total / 1024).toFixed(1) + "TB" : Math.round(total) + "GB";
});

// --- radar ---
function buildRadarOption() {
  const internal = internalCards.value.length;
  const external = externalCards.value.length;
  const ready = readyCards.value.length;
  const pipelines = pipelineCards.length;
  const modalityCount = allModalities.value.length;
  const scopeCount = allScopes.value.length;
  const maxVal = Math.max(internal, external, ready, pipelines, modalityCount, scopeCount, 5);

  return {
    radar: {
      indicator: [
        { name: "已接入数据集", max: maxVal },
        { name: "外部候选资源", max: maxVal },
        { name: "覆盖模态", max: maxVal },
        { name: "应用场景", max: maxVal },
        { name: "已就绪/已入库", max: maxVal },
        { name: "模型管线", max: maxVal },
      ],
      radius: "62%",
      center: ["50%", "50%"],
      nameGap: 6,
      name: { textStyle: { color: "#94a3b8", fontSize: 11 } },
      splitNumber: 4,
      axisName: { color: "#93c5fd" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.1)" } },
      splitArea: {
        areaStyle: {
          color: ["rgba(59,130,246,0.02)", "rgba(59,130,246,0.05)", "rgba(59,130,246,0.02)", "rgba(59,130,246,0.05)"],
        },
      },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: [internal, external, modalityCount, scopeCount, ready, pipelines],
            name: "数据中心",
            symbol: "circle",
            symbolSize: 5,
            lineStyle: { color: "#60a5fa", width: 2 },
            itemStyle: { color: "#60a5fa" },
            areaStyle: { color: "rgba(96,165,250,0.15)" },
          },
        ],
        animationDuration: 1200,
      },
    ],
    tooltip: {
      backgroundColor: "rgba(15,23,42,0.92)",
      borderColor: "rgba(96,165,250,0.3)",
      textStyle: { color: "#e2e8f0", fontSize: 12 },
    },
  };
}

function initRadar() {
  if (!radarChartRef.value) return;
  radarInstance = echarts.init(radarChartRef.value);
  radarInstance.setOption(buildRadarOption());
}

onMounted(() => {
  initRadar();
  window.addEventListener("resize", handleRadarResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleRadarResize);
  radarInstance?.dispose();
});

function handleRadarResize() {
  radarInstance?.resize();
}

function statusText(status: DataCatalogCard["status"]) {
  return status;
}
function statusClass(status: DataCatalogCard["status"]) {
  if (status === "可用") return "hdc-status-ready";
  if (status === "处理中" || status === "等待验收") return "hdc-status-pending";
  return "hdc-status-muted";
}

const pipeline = pipelineCards[0];
</script>

<template>
  <div class="hdc-panel">
    <div class="hdc-hero-row">
      <!-- LEFT: info block -->
      <div class="hdc-intro-block">
        <div class="eyebrow">Data Center Preview</div>
        <h3>数据总览</h3>

        <!-- stat badges -->
        <div class="hdc-stat-badges">
          <div class="hdc-stat-badge">
            <span class="hdc-stat-num">{{ cards.length }}</span>
            <span class="hdc-stat-label">数据集</span>
          </div>
          <div class="hdc-stat-badge">
            <span class="hdc-stat-num">{{ dataSources.length }}</span>
            <span class="hdc-stat-label">数据源</span>
          </div>
          <div class="hdc-stat-badge">
            <span class="hdc-stat-num">{{ allModalities.length }}</span>
            <span class="hdc-stat-label">模态</span>
          </div>
          <div class="hdc-stat-badge">
            <span class="hdc-stat-num">{{ allScopes.length }}</span>
            <span class="hdc-stat-label">应用场景</span>
          </div>
          <div class="hdc-stat-badge">
            <span class="hdc-stat-num">{{ totalSize }}</span>
            <span class="hdc-stat-label">总容量</span>
          </div>
        </div>

        <!-- modality tags -->
        <div class="hdc-tag-group">
          <span class="hdc-tag-group-label">模态</span>
          <span v-for="m in allModalities" :key="m" class="hdc-modality-tag">{{ m }}</span>
        </div>

        <!-- scope tags -->
        <div class="hdc-tag-group">
          <span class="hdc-tag-group-label">场景</span>
          <span v-for="s in allScopes" :key="s" class="hdc-scope-tag">{{ s }}</span>
        </div>

        <!-- source pills -->
        <div class="hdc-source-row">
          <span v-for="source in dataSources" :key="source.key" class="hdc-source-pill">
            <span>{{ source.icon }}</span>
            <span>{{ source.name }}</span>
          </span>
        </div>
      </div>

      <!-- RIGHT: radar chart -->
      <div ref="radarChartRef" class="hdc-radar-chart"></div>
    </div>

    <!-- BOTTOM: content cards (unchanged) -->
    <div class="hdc-content-grid">
      <section class="hdc-section-card">
        <div class="hdc-section-head">
          <div>
            <div class="hdc-section-title">已有数据集</div>
            <p>优先展示当前站内已经能直接支撑训练和评测的资产。</p>
          </div>
          <router-link to="/data" class="hdc-inline-link">查看全部</router-link>
        </div>
        <div class="hdc-card-list">
          <article v-for="item in internalCards.slice(0, 3)" :key="item.id" class="hdc-data-card">
            <div class="hdc-card-top">
              <strong>{{ item.title }}</strong
              ><span :class="['hdc-status', statusClass(item.status)]">{{ statusText(item.status) }}</span>
            </div>
            <p>{{ item.description }}</p>
            <div class="hdc-meta-row">
              <span>{{ item.size ?? "待确认" }}</span
              ><span>{{ item.format ?? "多格式" }}</span
              ><span>{{ item.domain }}</span>
            </div>
            <div class="hdc-tag-row">
              <span v-for="tag in item.modality.slice(0, 3)" :key="tag">{{ tag }}</span>
            </div>
          </article>
        </div>
      </section>
      <section class="hdc-section-card">
        <div class="hdc-section-head">
          <div>
            <div class="hdc-section-title">外部可下载数据</div>
            <p>把 Hugging Face 和外部资源位列成待选池，和数据页的来源筛选保持一致。</p>
          </div>
          <router-link to="/data" class="hdc-inline-link">去筛选</router-link>
        </div>
        <div class="hdc-card-list">
          <article v-for="item in externalCards.slice(0, 3)" :key="item.id" class="hdc-external-card">
            <div class="hdc-card-top">
              <strong>{{ item.title }}</strong
              ><span :class="['hdc-status', statusClass(item.status)]">{{ statusText(item.status) }}</span>
            </div>
            <p>{{ item.description }}</p>
            <div class="hdc-external-meta">
              <span>{{ item.sourceName }}</span
              ><span>{{ item.license ?? "待确认授权" }}</span>
            </div>
            <div class="hdc-tag-row">
              <span v-for="tag in item.scope.slice(0, 2)" :key="tag">{{ tag }}</span>
            </div>
          </article>
        </div>
      </section>
      <section class="hdc-section-card hdc-pipeline-card">
        <div class="hdc-section-head">
          <div>
            <div class="hdc-section-title">模型处理管线</div>
            <p>把数据中心不是"只存数据"的含义说清楚，直接串到模型管线页。</p>
          </div>
          <router-link :to="pipeline.href" class="hdc-inline-link">进入管线</router-link>
        </div>
        <div class="hdc-pipeline-hero">
          <div>
            <span class="hdc-pipeline-badge">{{ pipeline.tag }}</span>
            <h4>{{ pipeline.title }}</h4>
            <p>{{ pipeline.description }}</p>
          </div>
          <div class="hdc-pipeline-model">{{ pipeline.modelName }}</div>
        </div>
        <div class="hdc-pipeline-flow">
          <div class="hdc-flow-block">
            <em>输入数据</em><span v-for="item in pipeline.inputs.slice(0, 4)" :key="item">{{ item }}</span>
          </div>
          <div class="hdc-flow-arrow">→</div>
          <div class="hdc-flow-block">
            <em>处理步骤</em><span v-for="item in pipeline.steps.slice(0, 4)" :key="item">{{ item }}</span>
          </div>
          <div class="hdc-flow-arrow">→</div>
          <div class="hdc-flow-block">
            <em>输出结果</em><span v-for="item in pipeline.outputs" :key="item">{{ item }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.hdc-panel {
  position: relative;
  overflow: hidden;
  padding: 28px;
  border-radius: 28px;
  border: 1px solid var(--line);
  background:
    radial-gradient(circle at 100% 0%, rgba(56, 189, 248, 0.14), transparent 26%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.76));
  box-shadow: var(--shadow);
}
.hdc-hero-row {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 24px;
  align-items: stretch;
}

/* intro block */
.hdc-intro-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  padding: 8px 0;
}
.hdc-intro-block h3 {
  margin: 0;
  font-size: 32px;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

/* stat badges */
.hdc-stat-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.hdc-stat-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 72px;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.hdc-stat-num {
  font-size: 22px;
  font-weight: 800;
  color: #7dd3fc;
  line-height: 1.2;
}
.hdc-stat-label {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

/* tag groups */
.hdc-tag-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.hdc-tag-group-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 36px;
}
.hdc-modality-tag {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.2);
  color: #bfdbfe;
  font-size: 12px;
}
.hdc-scope-tag {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(52, 211, 153, 0.08);
  border: 1px solid rgba(52, 211, 153, 0.18);
  color: #bbf7d0;
  font-size: 12px;
}

/* source pills */
.hdc-source-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.hdc-source-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  color: #dbeafe;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  font-weight: 700;
}

/* radar */
.hdc-radar-chart {
  width: 100%;
  min-height: 300px;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(2, 6, 23, 0.3);
}

/* bottom grid (unchanged) */
.hdc-content-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 24px;
}
.hdc-section-card {
  display: grid;
  gap: 14px;
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.04);
}
.hdc-section-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}
.hdc-section-title {
  font-size: 20px;
  font-weight: 800;
  color: #f8fbff;
}
.hdc-section-head p {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.65;
}
.hdc-inline-link {
  flex: 0 0 auto;
  color: #7dd3fc;
  font-size: 13px;
  font-weight: 700;
}
.hdc-card-list {
  display: grid;
  gap: 12px;
}
.hdc-data-card,
.hdc-external-card {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: linear-gradient(180deg, rgba(2, 6, 23, 0.5), rgba(15, 23, 42, 0.35));
  transition: 0.18s ease;
}
.hdc-data-card:hover,
.hdc-external-card:hover {
  transform: translateY(-2px);
  border-color: rgba(96, 165, 250, 0.36);
}
.hdc-card-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}
.hdc-card-top strong {
  font-size: 15px;
  line-height: 1.45;
  color: #f8fbff;
}
.hdc-data-card p,
.hdc-external-card p {
  margin: 10px 0 0;
  color: #c7d5e9;
  font-size: 13px;
  line-height: 1.7;
}
.hdc-meta-row,
.hdc-external-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
  color: #9fb4cf;
  font-size: 12px;
}
.hdc-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.hdc-tag-row span {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.2);
  color: #bfdbfe;
  font-size: 12px;
}
.hdc-status {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}
.hdc-status-ready {
  color: #bbf7d0;
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.22);
}
.hdc-status-pending {
  color: #fde68a;
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.22);
}
.hdc-status-muted {
  color: #cbd5e1;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.2);
}
.hdc-pipeline-card {
  background: radial-gradient(circle at 100% 0%, rgba(34, 211, 238, 0.12), transparent 26%), rgba(255, 255, 255, 0.04);
}
.hdc-pipeline-hero {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(148, 163, 184, 0.14);
}
.hdc-pipeline-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  color: #06121f;
  background: linear-gradient(90deg, #67e8f9, #93c5fd);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}
.hdc-pipeline-hero h4 {
  margin: 0;
  font-size: 18px;
  color: #f8fbff;
}
.hdc-pipeline-hero p {
  margin: 0;
  color: #c7d5e9;
  font-size: 13px;
  line-height: 1.7;
}
.hdc-pipeline-model {
  color: #7dd3fc;
  font-size: 13px;
  font-weight: 700;
}
.hdc-pipeline-flow {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  gap: 12px;
  align-items: stretch;
}
.hdc-flow-block {
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(2, 6, 23, 0.36);
  border: 1px solid rgba(148, 163, 184, 0.14);
}
.hdc-flow-block em {
  color: #93c5fd;
  font-size: 12px;
  font-style: normal;
  font-weight: 800;
}
.hdc-flow-block span {
  color: #dbeafe;
  font-size: 13px;
  line-height: 1.5;
}
.hdc-flow-arrow {
  display: grid;
  place-items: center;
  color: #60a5fa;
  font-size: 26px;
  font-weight: 800;
}
@media (max-width: 1100px) {
  .hdc-hero-row,
  .hdc-content-grid,
  .hdc-pipeline-flow {
    grid-template-columns: 1fr;
  }
  .hdc-flow-arrow {
    display: none;
  }
}
@media (max-width: 720px) {
  .hdc-panel {
    padding: 20px;
  }
  .hdc-radar-chart {
    min-height: 220px;
  }
  .hdc-section-card {
    padding: 16px;
  }
}
</style>
