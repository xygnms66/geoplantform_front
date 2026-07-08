<script setup lang="ts">
import type { DataCatalogCard } from "@/types";
import { dataSources, pipelineCards } from "@/lib/dataCenterStaticData";

defineProps<{ cards: DataCatalogCard[] }>();

function statusText(status: DataCatalogCard["status"]) {
  const map: Record<DataCatalogCard["status"], string> = { candidate: "候选中", planned: "待接入", available: "已就绪", processing: "处理中", imported: "已入库" };
  return map[status];
}
function statusClass(status: DataCatalogCard["status"]) {
  if (status === "available" || status === "imported") return "hdc-status-ready";
  if (status === "processing" || status === "planned") return "hdc-status-pending";
  return "hdc-status-muted";
}

const pipeline = pipelineCards[0];
</script>

<template>
  <div class="hdc-panel">
    <div class="hdc-hero-row">
      <div class="hdc-intro-block">
        <div class="eyebrow">Data Center Preview</div>
        <h3>从首页把数据资产、外部资源和模型处理链路串成一张图</h3>
        <p>这一块不重复完整的数据页筛选逻辑，而是用更适合首页的信息密度，先回答三个问题：我们手里有什么，外面还要接什么，以及这些数据最终如何进入模型管线。</p>
        <div class="hdc-source-row">
          <span v-for="source in dataSources" :key="source.key" class="hdc-source-pill">
            <span>{{ source.icon }}</span>
            <span>{{ source.name }}</span>
          </span>
        </div>
      </div>
      <div class="hdc-stat-grid">
        <div class="hdc-stat-card"><span>已接入数据集</span><strong>{{ cards.filter(c => c.source === 'internal' || c.source === 'georemote').length }}</strong><em>首页展示重点资产</em></div>
        <div class="hdc-stat-card"><span>外部候选资源</span><strong>{{ cards.filter(c => c.source !== 'internal' && c.source !== 'georemote').length }}</strong><em>待筛选与下载接入</em></div>
        <div class="hdc-stat-card"><span>可用数据状态</span><strong>{{ cards.filter(c => c.status === 'available' || c.status === 'imported').length }}</strong><em>已就绪 / 已入库</em></div>
        <div class="hdc-stat-card"><span>模型管线</span><strong>{{ pipelineCards.length }}</strong><em>可追踪输入到输出</em></div>
      </div>
    </div>
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
          <article v-for="item in cards.filter(c => c.source === 'internal' || c.source === 'georemote').slice(0, 3)" :key="item.id" class="hdc-data-card">
            <div class="hdc-card-top"><strong>{{ item.title }}</strong><span :class="['hdc-status', statusClass(item.status)]">{{ statusText(item.status) }}</span></div>
            <p>{{ item.description }}</p>
            <div class="hdc-meta-row"><span>{{ item.size ?? "待确认" }}</span><span>{{ item.format ?? "多格式" }}</span><span>{{ item.domain }}</span></div>
            <div class="hdc-tag-row"><span v-for="tag in item.modality.slice(0, 3)" :key="tag">{{ tag }}</span></div>
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
          <article v-for="item in cards.filter(c => c.source !== 'internal' && c.source !== 'georemote').slice(0, 3)" :key="item.id" class="hdc-external-card">
            <div class="hdc-card-top"><strong>{{ item.title }}</strong><span :class="['hdc-status', statusClass(item.status)]">{{ statusText(item.status) }}</span></div>
            <p>{{ item.description }}</p>
            <div class="hdc-external-meta"><span>{{ item.sourceName }}</span><span>{{ item.license ?? "待确认授权" }}</span></div>
            <div class="hdc-tag-row"><span v-for="tag in item.scope.slice(0, 2)" :key="tag">{{ tag }}</span></div>
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
          <div class="hdc-flow-block"><em>输入数据</em><span v-for="item in pipeline.inputs.slice(0, 4)" :key="item">{{ item }}</span></div>
          <div class="hdc-flow-arrow">→</div>
          <div class="hdc-flow-block"><em>处理步骤</em><span v-for="item in pipeline.steps.slice(0, 4)" :key="item">{{ item }}</span></div>
          <div class="hdc-flow-arrow">→</div>
          <div class="hdc-flow-block"><em>输出结果</em><span v-for="item in pipeline.outputs" :key="item">{{ item }}</span></div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.hdc-panel { position: relative; overflow: hidden; padding: 28px; border-radius: 28px; border: 1px solid var(--line); background: radial-gradient(circle at 100% 0%, rgba(56, 189, 248, 0.14), transparent 26%), linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.76)); box-shadow: var(--shadow); }
.hdc-hero-row { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr); gap: 24px; align-items: start; }
.hdc-intro-block h3 { margin: 10px 0 12px; font-size: 30px; line-height: 1.1; letter-spacing: -0.03em; }
.hdc-intro-block p { margin: 0; color: #cedcf0; line-height: 1.75; }
.hdc-source-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
.hdc-source-pill { display: inline-flex; align-items: center; gap: 8px; min-height: 34px; padding: 0 12px; border-radius: 999px; color: #dbeafe; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1); font-size: 12px; font-weight: 700; }
.hdc-stat-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.hdc-stat-card { min-height: 118px; padding: 18px; border-radius: 22px; background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(148, 163, 184, 0.04)); border: 1px solid rgba(255, 255, 255, 0.12); backdrop-filter: blur(10px); }
.hdc-stat-card span, .hdc-stat-card em { display: block; }
.hdc-stat-card span { color: var(--muted); font-size: 12px; }
.hdc-stat-card strong { display: block; margin-top: 8px; color: #eff6ff; font-size: 30px; line-height: 1; }
.hdc-stat-card em { margin-top: 10px; color: #bfd0e8; font-size: 12px; font-style: normal; }
.hdc-content-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: 24px; }
.hdc-section-card { display: grid; gap: 14px; padding: 20px; border-radius: 24px; border: 1px solid rgba(148, 163, 184, 0.14); background: rgba(255, 255, 255, 0.04); }
.hdc-section-head { display: flex; align-items: start; justify-content: space-between; gap: 12px; }
.hdc-section-title { font-size: 20px; font-weight: 800; color: #f8fbff; }
.hdc-section-head p { margin: 6px 0 0; color: var(--muted); font-size: 13px; line-height: 1.65; }
.hdc-inline-link { flex: 0 0 auto; color: #7dd3fc; font-size: 13px; font-weight: 700; }
.hdc-card-list { display: grid; gap: 12px; }
.hdc-data-card, .hdc-external-card { padding: 16px; border-radius: 18px; border: 1px solid rgba(148, 163, 184, 0.14); background: linear-gradient(180deg, rgba(2, 6, 23, 0.5), rgba(15, 23, 42, 0.35)); transition: 0.18s ease; }
.hdc-data-card:hover, .hdc-external-card:hover { transform: translateY(-2px); border-color: rgba(96, 165, 250, 0.36); }
.hdc-card-top { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
.hdc-card-top strong { font-size: 15px; line-height: 1.45; color: #f8fbff; }
.hdc-data-card p, .hdc-external-card p { margin: 10px 0 0; color: #c7d5e9; font-size: 13px; line-height: 1.7; }
.hdc-meta-row, .hdc-external-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; color: #9fb4cf; font-size: 12px; }
.hdc-tag-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.hdc-tag-row span { display: inline-flex; align-items: center; min-height: 26px; padding: 0 10px; border-radius: 999px; background: rgba(96, 165, 250, 0.1); border: 1px solid rgba(96, 165, 250, 0.2); color: #bfdbfe; font-size: 12px; }
.hdc-status { display: inline-flex; align-items: center; min-height: 26px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.hdc-status-ready { color: #bbf7d0; background: rgba(52, 211, 153, 0.12); border: 1px solid rgba(52, 211, 153, 0.22); }
.hdc-status-pending { color: #fde68a; background: rgba(251, 191, 36, 0.12); border: 1px solid rgba(251, 191, 36, 0.22); }
.hdc-status-muted { color: #cbd5e1; background: rgba(148, 163, 184, 0.12); border: 1px solid rgba(148, 163, 184, 0.2); }
.hdc-pipeline-card { background: radial-gradient(circle at 100% 0%, rgba(34, 211, 238, 0.12), transparent 26%), rgba(255, 255, 255, 0.04); }
.hdc-pipeline-hero { display: flex; flex-direction: column; gap: 12px; padding: 18px; border-radius: 20px; background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03)); border: 1px solid rgba(148, 163, 184, 0.14); }
.hdc-pipeline-badge { display: inline-flex; align-items: center; width: fit-content; min-height: 28px; padding: 0 10px; border-radius: 999px; color: #06121f; background: linear-gradient(90deg, #67e8f9, #93c5fd); font-size: 12px; font-weight: 800; text-transform: uppercase; }
.hdc-pipeline-hero h4 { margin: 0; font-size: 18px; color: #f8fbff; }
.hdc-pipeline-hero p { margin: 0; color: #c7d5e9; font-size: 13px; line-height: 1.7; }
.hdc-pipeline-model { color: #7dd3fc; font-size: 13px; font-weight: 700; }
.hdc-pipeline-flow { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 12px; align-items: stretch; }
.hdc-flow-block { display: grid; gap: 8px; padding: 14px; border-radius: 18px; background: rgba(2, 6, 23, 0.36); border: 1px solid rgba(148, 163, 184, 0.14); }
.hdc-flow-block em { color: #93c5fd; font-size: 12px; font-style: normal; font-weight: 800; }
.hdc-flow-block span { color: #dbeafe; font-size: 13px; line-height: 1.5; }
.hdc-flow-arrow { display: grid; place-items: center; color: #60a5fa; font-size: 26px; font-weight: 800; }
@media (max-width: 1100px) { .hdc-hero-row, .hdc-content-grid, .hdc-pipeline-flow { grid-template-columns: 1fr; } .hdc-flow-arrow { display: none; } }
@media (max-width: 720px) { .hdc-panel { padding: 20px; } .hdc-stat-grid { grid-template-columns: 1fr; } .hdc-section-card { padding: 16px; } }
</style>
