<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import * as echarts from "echarts";

const props = defineProps<{
  projectCount: number;
  memberCount: number;
  achievementCount: number;
  dataAssetCount: number;
}>();

const chartRef = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;

function initChart() {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value, undefined, { renderer: "canvas" });

  const items = [
    { name: "项目模块", value: props.projectCount, color: "#60a5fa" },
    { name: "团队成员", value: props.memberCount, color: "#34d399" },
    { name: "成果条目", value: props.achievementCount, color: "#fbbf24" },
    { name: "数据资产", value: props.dataAssetCount, color: "#a78bfa" },
  ];

  chart.setOption({
    animationDuration: 1000,
    animationEasing: "cubicOut",
    grid: { left: 10, right: 10, top: 6, bottom: 6 },
    xAxis: {
      type: "category",
      data: items.map((d) => d.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "rgba(229,238,252,0.75)", fontSize: 12, fontWeight: "bold", margin: 10 },
    },
    yAxis: { type: "value", splitLine: { show: false }, axisLabel: { show: false }, axisLine: { show: false }, axisTick: { show: false } },
    series: [
      {
        type: "bar",
        barWidth: 50,
        barGap: 28,
        showBackground: true,
        backgroundStyle: { color: "rgba(255,255,255,0.04)", borderRadius: [8, 8, 0, 0] },
        data: items.map((d, i) => ({
          value: d.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: d.color },
              { offset: 0.6, color: d.color + "cc" },
              { offset: 1, color: d.color + "55" },
            ]),
            borderRadius: [10, 10, 2, 2],
          },
        })),
        label: { show: true, position: "top", color: "#eff6ff", fontSize: 24, fontWeight: "bold", fontFamily: "Arial, sans-serif", offset: [0, 6] },
        animationDelay: (idx: number) => idx * 180,
      },
    ],
  });
}

function onResize() { chart?.resize(); }

onMounted(() => {
  initChart();
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
  chart?.dispose();
});
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 160px; margin-top: 12px" />
</template>
