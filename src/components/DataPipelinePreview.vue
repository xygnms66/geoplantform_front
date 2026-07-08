<script setup lang="ts">
import type { PipelineMiniCard } from "@/types";

defineProps<{ pipelines: PipelineMiniCard[] }>();
</script>

<template>
  <section :style="{ marginTop: '24px' }">
    <div :style="{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }">
      <div>
        <h2 :style="{ margin: 0, fontSize: '24px' }">模型数据管线</h2>
        <p :style="{ margin: '6px 0 0', color: 'var(--muted)' }">项目下属模型通过管线调用已有数据集，并产出预处理与训练数据。</p>
      </div>
    </div>
    <div :style="{ display: 'grid', gap: '12px' }">
      <div v-for="p in pipelines" :key="p.id"
        :style="{ padding: '16px', borderRadius: '20px', border: '1px solid var(--line)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', color: 'inherit', transition: '0.18s ease' }"
        @click="$router.push(p.href)">
        <div :style="{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }">
          <strong>{{ p.title }}</strong>
          <span :style="{ padding: '4px 8px', borderRadius: '999px', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.22)', color: '#67e8f9', fontSize: '12px', fontWeight: 700 }">{{ p.tag }}</span>
        </div>
        <p :style="{ margin: '10px 0 0', color: 'var(--muted)', fontSize: '13px', lineHeight: '1.65' }">{{ p.description }}</p>
        <div :style="{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--line)', fontSize: '13px', color: 'var(--muted)' }">
          <div><em :style="{ display: 'block', marginBottom: '4px', color: '#93c5fd', fontStyle: 'normal' }">输入模态</em><span>{{ p.inputs.join(" / ") }}</span></div>
          <b :style="{ color: '#60a5fa' }">→</b>
          <div><em :style="{ display: 'block', marginBottom: '4px', color: '#93c5fd', fontStyle: 'normal' }">处理步骤</em><span>{{ p.steps.join(" / ") }}</span></div>
          <b :style="{ color: '#60a5fa' }">→</b>
          <div><em :style="{ display: 'block', marginBottom: '4px', color: '#93c5fd', fontStyle: 'normal' }">管线产出</em><span>{{ p.outputs.join(" / ") }}</span></div>
        </div>
      </div>
    </div>
  </section>
</template>
