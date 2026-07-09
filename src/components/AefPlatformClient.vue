<script setup lang="ts">
import { ref, computed } from "vue";
import { aefNews } from "@/lib/aefData";

type DomainFilter = "all" | "remote" | "multimodal" | "nlp" | "cv";

const activeDomain = ref<DomainFilter>("all");
const activeTag = ref<string | null>(null);
const followTags = ["模型", "数据", "评测", "遥感", "多模态"];

const newsItems = computed(() =>
  aefNews.filter((item) => {
    const domainOk = activeDomain.value === "all" || item.domain === activeDomain.value;
    const tagOk = activeTag.value == null || item.tags.includes(activeTag.value);
    return domainOk && tagOk;
  }),
);

function setActiveDomain(domain: DomainFilter) {
  activeDomain.value = domain;
}
function setActiveTag(tag: string | null) {
  activeTag.value = activeTag.value === tag ? null : tag;
}
</script>

<template>
  <div :class="$style.shell">
    <div :class="$style.workspace">
      <aside :class="[$style.panel, $style.sidebar]">
        <div :class="$style.sidebarSection">
          <div :class="$style.sidebarCaption">领域筛选</div>
          <div :class="$style.filterRow">
            <button
              v-for="item in [
                { key: 'all', label: '全部' },
                { key: 'remote', label: '遥感' },
                { key: 'multimodal', label: '多模态' },
                { key: 'nlp', label: 'NLP' },
                { key: 'cv', label: 'CV' },
              ]"
              :key="item.key"
              type="button"
              :class="[$style.filterButton, { [$style.filterButtonActive]: activeDomain === item.key }]"
              @click="setActiveDomain(item.key as DomainFilter)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
        <div :class="$style.sidebarSection">
          <div :class="$style.sidebarCaption">我的关注标签</div>
          <div :class="$style.filterRow">
            <button
              v-for="tag in followTags"
              :key="tag"
              type="button"
              :class="[$style.filterButton, { [$style.filterButtonActive]: activeTag === tag }]"
              @click="setActiveTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </aside>
      <section :class="[$style.panel, $style.detail]">
        <div :class="$style.detailHeader">
          <div>
            <div :class="$style.eyebrow">Explore Workspace</div>
            <h2 :class="$style.detailTitle">资讯探索中心</h2>
          </div>
          <div :class="$style.badgeRow">
            <span :class="[$style.pill, $style.pillBlue]">{{
              activeDomain === "all" ? "全部领域" : activeDomain
            }}</span>
            <span v-if="activeTag" :class="[$style.pill, $style.pillAmber]">#{{ activeTag }}</span>
          </div>
        </div>
        <p :class="$style.detailText">
          这里保留"资讯流 +
          标签过滤"的结构，后面如果接入真实接口，可以继续作为轻量异步内容区，不会和首屏工作流看板冲突。
        </p>
        <div v-if="newsItems.length > 0" :class="$style.taskList">
          <article v-for="item in newsItems" :key="item.id" :class="$style.newsCard">
            <div :class="$style.newsHeader">
              <div :class="$style.moduleName">{{ item.title }}</div>
              <span :class="$style.metaText">{{ item.date }}</span>
            </div>
            <p :class="$style.newsDesc">{{ item.desc }}</p>
            <div :class="$style.newsMeta">
              <span :class="[$style.pill, $style.pillMuted]">{{ item.category }}</span>
              <span v-for="tag in item.tags" :key="tag" :class="[$style.pill, $style.pillBlue]">{{ tag }}</span>
            </div>
          </article>
        </div>
        <div v-else :class="$style.emptyState">当前筛选条件下没有匹配资讯，可以切换领域或清除标签再试试。</div>
      </section>
    </div>
  </div>
</template>

<style module>
.shell {
  display: grid;
  gap: 24px;
  margin-top: 28px;
  padding-bottom: 40px;
}

.eyebrow {
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 999px;
  color: #bfdbfe;
  background: rgba(96, 165, 250, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.22);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.panel {
  border-radius: 28px;
  border: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.74));
  box-shadow: var(--shadow);
}

.moduleName {
  font-size: 15px;
  font-weight: 700;
}
.metaText,
.newsDesc,
.detailText {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.65;
}

.pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}
.pillBlue {
  color: #67e8f9;
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.22);
}
.pillAmber {
  color: #fde68a;
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.22);
}
.pillMuted {
  color: #cbd5e1;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.newsHeader {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}
.newsMeta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.workspace {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 18px;
  align-items: start;
}
.sidebar {
  padding: 18px;
}
.sidebarSection + .sidebarSection {
  margin-top: 18px;
}
.sidebarCaption {
  margin-bottom: 10px;
  color: #93c5fd;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.detail {
  padding: 22px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.74));
}
.detailHeader {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
  margin-bottom: 18px;
}
.detailTitle {
  margin: 8px 0 0;
  font-size: 30px;
  letter-spacing: -0.03em;
}
.badgeRow,
.filterRow {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.taskList {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}
.emptyState {
  padding: 34px;
  border-radius: 24px;
  border: 1px dashed rgba(147, 197, 253, 0.24);
  color: #93c5fd;
  background: rgba(255, 255, 255, 0.03);
  text-align: center;
}

.filterButton {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.04);
  color: var(--muted);
  cursor: pointer;
  transition: 0.18s ease;
}
.filterButtonActive {
  color: #fff;
  border-color: rgba(96, 165, 250, 0.5);
  background: rgba(37, 99, 235, 0.35);
}

.newsCard {
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  transition: 0.18s ease;
}
.newsCard:hover {
  transform: translateY(-2px);
  border-color: rgba(96, 165, 250, 0.35);
}

@media (max-width: 1100px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .sidebar,
  .detail {
    padding: 20px;
  }
}
</style>
