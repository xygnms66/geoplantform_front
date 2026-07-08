<script setup lang="ts">
export type ModelScore = { f1: number | null; iou: number | null };
export type ModelCompRow = { model: string; isHighlight?: boolean; scores: Record<string, ModelScore> };
export type ModelCompTableData = { title?: string; subtitle?: string; categories: string[]; rows: ModelCompRow[] };
export type SimpleModelRow = { model: string; isHighlight?: boolean; metrics: Record<string, number | null> };
export type SimpleModelTableData = { title?: string; subtitle?: string; metricLabels: string[]; rows: SimpleModelRow[] };
export type EvalProjectDef = { label: string; aefKey: string; geoKey: string };
export type EvalRowData = { category: string; isOverall?: boolean; scores: Record<string, number | null> };
export type EvalTableData = { title?: string; subtitle?: string; showSummaryCards?: boolean; projects: EvalProjectDef[]; rows: EvalRowData[] };

const props = withDefaults(defineProps<{
  categories?: string[];
  title?: string;
  subtitle?: string;
  rows?: any[];
  metricLabels?: string[];
  projects?: EvalProjectDef[];
  showSummaryCards?: boolean;
}>(), {
  rows: () => [],
  showSummaryCards: false,
});

function fmtScore(v: number | null) { return v == null ? "/" : v.toFixed(4); }
function fmt(v: number | null) { return v == null ? "—" : v.toFixed(4); }
function delta(base: number | null, target: number | null): number | null {
  if (base == null || target == null) return null;
  return target - base;
}
function fmtDelta(base: number | null, target: number | null) {
  const d = delta(base, target);
  if (d == null) return "—";
  return (d >= 0 ? "+" : "") + d.toFixed(4);
}
function deltaClass(base: number | null, target: number | null) {
  const d = delta(base, target);
  if (d == null) return "ed-empty";
  if (d > 0.02) return "ed-positive";
  if (d < 0) return "ed-negative";
  return "ed-neutral";
}
</script>

<template>
  <!-- ModelCompTable -->
  <div v-if="categories" class="ew-wrap">
    <div v-if="title || subtitle" class="ew-header">
      <h3 v-if="title">{{ title }}</h3>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div class="ew-table-wrap">
      <table class="ew-table">
        <thead>
          <tr><th rowspan="2" class="ew-model-col">模型名称</th><th v-for="cat in categories" :key="cat" colspan="2">{{ cat }}</th></tr>
          <tr><template v-for="cat in categories" :key="cat"><th>f1</th><th>IoU</th></template></tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.model" :class="{ 'ew-highlight-row': row.isHighlight }">
            <td class="ew-model-cell">{{ row.model }}</td>
            <template v-for="cat in categories" :key="cat">
              <td :class="{ 'ew-highlight-cell': row.isHighlight }">{{ fmtScore(row.scores[cat]?.f1 ?? null) }}</td>
              <td :class="{ 'ew-highlight-cell': row.isHighlight }">{{ fmtScore(row.scores[cat]?.iou ?? null) }}</td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- SimpleModelTable -->
  <div v-else-if="metricLabels" class="ew-wrap">
    <div v-if="title || subtitle" class="ew-header">
      <h3 v-if="title">{{ title }}</h3>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div class="ew-table-wrap">
      <table class="ew-table">
        <thead>
          <tr><th class="ew-model-col">模型名称</th><th v-for="label in metricLabels" :key="label">{{ label }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.model" :class="{ 'ew-highlight-row': row.isHighlight }">
            <td class="ew-model-cell">{{ row.model }}</td>
            <td v-for="label in metricLabels" :key="label" :class="{ 'ew-highlight-cell': row.isHighlight }">{{ row.metrics[label] != null ? (row.metrics[label] as number).toFixed(4) : "—" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- EvalTable -->
  <div v-else-if="projects" class="ew-wrap">
    <div v-if="title || subtitle" class="ew-header">
      <h3 v-if="title">{{ title }}</h3>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="showSummaryCards" :style="{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(projects.length * rows.filter(r => r.isOverall).length, 4)}, minmax(0, 1fr))`, gap: '12px', marginBottom: '16px' }">
      <template v-for="proj in projects" :key="proj.label">
        <div v-for="row in rows.filter(r => r.isOverall)" :key="`${proj.label}-${row.category}`" class="ew-summary-card">
          <div class="ew-card-top"><span>{{ proj.label }}</span><strong>{{ row.category }}</strong></div>
          <div class="ew-score-main">{{ fmt(row.scores[proj.geoKey]) }}</div>
          <div class="ew-card-bottom"><span>AEF {{ fmt(row.scores[proj.aefKey]) }}</span><span v-if="delta(row.scores[proj.aefKey], row.scores[proj.geoKey]) != null" class="ew-improve">+{{ (delta(row.scores[proj.aefKey], row.scores[proj.geoKey]) as number).toFixed(4) }} / +{{ ((delta(row.scores[proj.aefKey], row.scores[proj.geoKey]) as number) / (row.scores[proj.aefKey] as number) * 100).toFixed(1) }}%</span></div>
        </div>
      </template>
    </div>
    <div class="ew-table-wrap">
      <table class="ew-table">
        <thead>
          <tr><th rowspan="2" class="ew-cat-col">类别</th><th v-for="proj in projects" :key="proj.label" colspan="3">{{ proj.label }}</th></tr>
          <tr><template v-for="proj in projects" :key="proj.label"><th>AEF</th><th class="ew-geo-head">地溯 GeoOrigin</th><th>Δ 提升</th></template></tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.category" :class="{ 'ew-overall-row': row.isOverall }">
            <td class="ew-cat-name">{{ row.category }}</td>
            <template v-for="proj in projects" :key="proj.label">
              <td>{{ fmt(row.scores[proj.aefKey]) }}</td>
              <td class="ew-geo-cell">{{ fmt(row.scores[proj.geoKey]) }}</td>
              <td :class="deltaClass(row.scores[proj.aefKey], row.scores[proj.geoKey])">{{ fmtDelta(row.scores[proj.aefKey], row.scores[proj.geoKey]) }}</td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.ew-wrap { margin-top: 24px; }
.ew-header { margin-bottom: 14px; }
.ew-header h3 { margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #93c5fd; }
.ew-header p { margin: 0; font-size: 13px; color: rgba(148, 163, 184, 0.75); }
.ew-table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid rgba(148, 163, 184, 0.14); }
.ew-table { width: 100%; min-width: 720px; border-collapse: separate; border-spacing: 0; font-size: 13px; }
.ew-table th { background: #164f78; color: white; padding: 10px 12px; text-align: center; border-right: 1px solid rgba(255, 255, 255, 0.18); font-weight: 700; }
.ew-table thead tr:nth-child(2) th { background: rgba(16, 42, 67, 0.9); color: #bfdbfe; border-right: 1px solid rgba(255, 255, 255, 0.08); }
.ew-table td { padding: 9px 12px; text-align: center; border-bottom: 1px solid rgba(148, 163, 184, 0.09); border-right: 1px solid rgba(148, 163, 184, 0.09); background: rgba(255, 255, 255, 0.02); color: #cbd5e1; }
.ew-table tbody tr:nth-child(even) td { background: rgba(255, 255, 255, 0.045); }
.ew-cat-col { width: 110px; }
.ew-cat-name { position: sticky; left: 0; z-index: 1; text-align: left !important; font-weight: 700; color: #93c5fd; background: #0f172a !important; }
.ew-geo-head { background: rgba(22, 79, 120, 0.8) !important; color: #bfdbfe !important; }
.ew-geo-cell { background: rgba(22, 79, 120, 0.22) !important; font-weight: 700; color: #93c5fd; }
.ew-model-col { width: 130px; text-align: left !important; }
.ew-model-cell { position: sticky; left: 0; z-index: 1; text-align: left !important; font-weight: 700; color: #93c5fd; background: #0f172a !important; white-space: nowrap; }
.ew-highlight-row td { background: rgba(22, 57, 100, 0.55) !important; }
.ew-highlight-row .ew-model-cell { background: rgba(14, 30, 54, 0.95) !important; color: #dbeafe; }
.ew-highlight-cell { color: #fb923c !important; font-weight: 800; }
.ew-overall-row td { background: rgba(22, 79, 120, 0.28) !important; font-weight: 900; color: #bfdbfe; }
.ew-overall-row .ew-geo-cell { color: #60a5fa; }
.ed-positive { color: #4ade80; font-weight: 800; }
.ed-negative { color: #f87171; font-weight: 800; }
.ed-neutral { color: #94a3b8; font-weight: 700; }
.ed-empty { color: #4b5563; }
.ew-summary-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(148, 163, 184, 0.14); border-radius: 14px; padding: 14px; }
.ew-card-top { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; color: rgba(148, 163, 184, 0.7); }
.ew-card-top strong { color: #93c5fd; white-space: nowrap; }
.ew-score-main { margin-top: 12px; font-size: 26px; font-weight: 800; color: #dbeafe; letter-spacing: -0.5px; }
.ew-card-bottom { margin-top: 10px; display: flex; justify-content: space-between; gap: 8px; font-size: 12px; color: rgba(148, 163, 184, 0.7); }
.ew-improve { color: #4ade80; font-weight: 700; }
</style>
