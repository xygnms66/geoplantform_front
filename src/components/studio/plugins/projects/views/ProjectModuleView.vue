<template>
  <section class="panel placeholder">
    <div class="panel-inner">
      <h2 class="panel-title">模块</h2>
      <p class="panel-desc">项目模块划分、任务归属与进度追踪将在此二级界面展开。</p>
    </div>
  </section>
</template>

<style scoped>
.panel {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.76));
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
}

.panel-inner {
  padding: 28px 20px;
}

.panel-title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
}

.panel-desc {
  margin-top: 10px;
  color: var(--muted);
  line-height: 1.7;
}
</style>
