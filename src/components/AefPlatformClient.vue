<script setup lang="ts">
import { ref, computed } from "vue";
import {
  aefDatasets, aefEvalGroups, aefMembers, aefModels, aefNews,
  aefPendingData, aefReviewQueue, aefTabs, aefWorkflowBoard,
} from "@/lib/aefData";
import type { AefTabKey, AefDataset, AefEvalGroup, AefModel, AefMember, AefWorkflowCard, AefWorkflowColumn } from "@/types";

const props = withDefaults(defineProps<{
  initialTab?: AefTabKey;
}>(), {
  initialTab: "home",
});

type DomainFilter = "all" | "remote" | "multimodal" | "nlp" | "cv";
type EvalMode = "capability" | "scenario";

const activeTab = ref<AefTabKey>(props.initialTab);
const reviewQueue = ref([...aefReviewQueue]);
const activeModelId = ref(aefModels[0].id);
const activeDatasetId = ref(aefDatasets[0].id);
const evalMode = ref<EvalMode>("capability");
const activeEvalId = ref(aefEvalGroups.find((item) => item.mode === "capability")?.id ?? aefEvalGroups[0].id);
const activeDomain = ref<DomainFilter>("all");
const activeTag = ref<string | null>(null);
const activeMemberId = ref(aefMembers[0].id);
const followTags = ["模型", "数据", "评测", "遥感", "多模态"];

const activeModel = computed(() => aefModels.find((item) => item.id === activeModelId.value) ?? aefModels[0]);
const activeDataset = computed(() => aefDatasets.find((item) => item.id === activeDatasetId.value) ?? aefDatasets[0]);
const visibleEvalGroups = computed(() => aefEvalGroups.filter((item) => item.mode === evalMode.value));
const activeEval = computed(() => visibleEvalGroups.value.find((item) => item.id === activeEvalId.value) ?? visibleEvalGroups.value[0]);
const activeMember = computed(() => aefMembers.find((item) => item.id === activeMemberId.value) ?? aefMembers[0]);
const newsItems = computed(() => aefNews.filter((item) => {
  const domainOk = activeDomain.value === "all" || item.domain === activeDomain.value;
  const tagOk = activeTag.value == null || item.tags.includes(activeTag.value);
  return domainOk && tagOk;
}));

function statusPill(status: string) {
  if (["training", "ready", "done", "active"].includes(status)) return "pillGreen";
  if (status === "complete") return "pillBlue";
  if (["progress", "syncing"].includes(status)) return "pillAmber";
  return "pillMuted";
}

function statusText(status: string) {
  const map: Record<string, string> = { training: "训练中", complete: "已完成", planned: "规划中", ready: "已就绪", syncing: "同步中", done: "已完成", active: "进行中", progress: "评测中" };
  return map[status] ?? status;
}

function workflowCategoryText(category: AefWorkflowCard["category"]) {
  const map: Record<string, string> = { model: "模型", data: "数据", eval: "评测", ops: "协同" };
  return map[category];
}

function workflowPriorityClass(priority: AefWorkflowCard["priority"]) {
  if (priority === "high") return "pillRed";
  if (priority === "medium") return "pillAmber";
  return "pillBlue";
}

function workflowPriorityText(priority: AefWorkflowCard["priority"]) {
  const map: Record<string, string> = { high: "高优先级", medium: "中优先级", low: "低优先级" };
  return map[priority];
}

function workflowAccentClass(accent: AefWorkflowColumn["accent"]) {
  const map: Record<string, string> = { slate: "wfSlate", blue: "wfBlue", amber: "wfAmber", green: "wfGreen" };
  return map[accent];
}

function setTab(tab: AefTabKey) { activeTab.value = tab; }
function setActiveModelId(id: string) { activeModelId.value = id; }
function setActiveDatasetId(id: string) { activeDatasetId.value = id; }
function setEvalMode(mode: EvalMode) { evalMode.value = mode; activeEvalId.value = aefEvalGroups.find((item) => item.mode === mode)?.id ?? aefEvalGroups[0].id; }
function setActiveEvalId(id: string) { activeEvalId.value = id; }
function setActiveDomain(domain: DomainFilter) { activeDomain.value = domain; }
function setActiveTag(tag: string | null) { activeTag.value = activeTag.value === tag ? null : tag; }
function setActiveMemberId(id: string) { activeMemberId.value = id; }
function removeReview(index: number) { reviewQueue.value = reviewQueue.value.filter((_, i) => i !== index); }
</script>

<template>
  <div :class="$style.shell">
    <section :class="$style.hero">

      <div :class="$style.workflowBoard">
        <div v-for="col in aefWorkflowBoard" :key="col.id" :class="[$style.workflowColumn, $style[workflowAccentClass(col.accent)]]">
          <div :class="$style.wfColHead">
            <div>
              <div :class="$style.wfColTitle">{{ col.title }}</div>
              <div :class="$style.wfColHint">{{ col.hint }}</div>
            </div>
            <span :class="[$style.pill, $style.pillMuted]">{{ col.items.length }}</span>
          </div>
          <div :class="$style.wfCards">
            <article v-for="item in col.items" :key="item.id" :class="$style.wfCard" :style="{}">
              <div :class="$style.wfCardTop">
                <span :class="[$style.pill, $style.pillBlue]">{{ workflowCategoryText(item.category) }}</span>
                <span :class="[$style.pill, $style[workflowPriorityClass(item.priority)]]">{{ workflowPriorityText(item.priority) }}</span>
              </div>
              <div :class="$style.wfProject">{{ item.project }}</div>
              <h3 :class="$style.wfCardTitle">{{ item.title }}</h3>
              <p :class="$style.wfSummary">{{ item.summary }}</p>
              <div :class="$style.wfTagRow">
                <span v-for="tag in item.tags" :key="tag" :class="[$style.pill, $style.pillMuted]">{{ tag }}</span>
              </div>
              <div :class="$style.wfCardFooter">
                <span :class="$style.wfMetaItem">负责人 {{ item.owner }}</span>
                <span :class="$style.wfMetaItem">节点 {{ item.due }}</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <div :class="$style.tabBar">
      <button v-for="tab in aefTabs" :key="tab.key" type="button" :class="[$style.tabButton, { [$style.tabButtonActive]: activeTab === tab.key }]" @click="setTab(tab.key)">
        <span :class="$style.tabIcon">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Home Tab -->
    <div v-if="activeTab === 'home'" :class="$style.homeGrid">
      <div :class="$style.homeColumn">
        <section :class="[$style.panel, $style.block]">
          <div :class="$style.blockHead">
            <div>
              <h2 :class="$style.blockTitle">待审核入库</h2>
              <p :class="$style.blockLead">保留原工作台里的资料入库动作，作为首页的待办入口。</p>
            </div>
            <span :class="[$style.pill, $style.pillAmber]">{{ reviewQueue.length }} 条待处理</span>
          </div>
          <div :class="$style.reviewList">
            <article v-for="(item, index) in reviewQueue" :key="item.title" :class="$style.reviewCard">
              <div :class="$style.reviewHeader">
                <div>
                  <div :class="$style.moduleName">{{ item.title }}</div>
                  <div :class="$style.reviewMeta">{{ item.type }} · {{ item.source }} · 提交人 {{ item.owner }}</div>
                </div>
                <span :class="[$style.pill, $style.pillMuted]">{{ item.type }}</span>
              </div>
              <div :class="$style.reviewActions">
                <button type="button" :class="[$style.pill, $style.pillGreen]" @click="removeReview(index)">入库</button>
                <button type="button" :class="[$style.pill, $style.pillRed]" @click="removeReview(index)">驳回</button>
              </div>
            </article>
          </div>
        </section>
      </div>
      <div :class="$style.homeColumn">
        <section :class="[$style.panel, $style.block]">
          <div :class="$style.blockHead">
            <div>
              <h2 :class="$style.blockTitle">最新资讯</h2>
              <p :class="$style.blockLead">保留探索资讯流，和上面的工作流形成"任务 + 动态"的首页组合。</p>
            </div>
          </div>
          <div :class="$style.newsList">
            <article v-for="item in aefNews.slice(0, 4)" :key="item.id" :class="$style.newsCard">
              <div :class="$style.newsHeader">
                <div :class="$style.moduleName">{{ item.title }}</div>
                <span :class="$style.metaText">{{ item.date }}</span>
              </div>
              <p :class="$style.newsDesc">{{ item.desc }}</p>
              <div :class="$style.newsMeta">
                <span v-for="tag in item.tags" :key="tag" :class="[$style.pill, $style.pillBlue]">{{ tag }}</span>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>

    <!-- Model Tab -->
    <div v-else-if="activeTab === 'model'" :class="$style.workspace">
      <aside :class="[$style.panel, $style.sidebar]">
        <div :class="$style.sidebarSection">
          <div :class="$style.sidebarCaption">模型列表</div>
          <div :class="$style.sidebarList">
            <button v-for="item in aefModels" :key="item.id" type="button" :class="[$style.sidebarItem, { [$style.sidebarItemActive]: activeModel.id === item.id }]" @click="setActiveModelId(item.id)">
              <div :class="$style.sidebarHeader">
                <span :class="$style.sidebarTitle">{{ item.name }}</span>
                <span :class="[$style.pill, $style[statusPill(item.status)]]">{{ statusText(item.status) }}</span>
              </div>
              <div :class="$style.sidebarSub">{{ item.desc }}</div>
            </button>
          </div>
        </div>
      </aside>
      <section :class="[$style.panel, $style.detail]">
        <div :class="$style.detailHeader">
          <div>
            <div :class="$style.eyebrow">Model Workspace</div>
            <h2 :class="$style.detailTitle">{{ activeModel.name }}</h2>
          </div>
          <div :class="$style.badgeRow">
            <span :class="[$style.pill, $style[statusPill(activeModel.status)]]">{{ statusText(activeModel.status) }}</span>
            <span :class="[$style.pill, $style.pillBlue]">{{ activeModel.members.length }} 名成员</span>
          </div>
        </div>
        <p :class="$style.detailText">{{ activeModel.desc }}</p>
        <div :class="$style.detailGrid">
          <div :class="$style.detailMini"><div :class="$style.detailMiniLabel">输入模态</div><div :class="$style.detailMiniValue">{{ activeModel.inputs.length }} 类</div></div>
          <div :class="$style.detailMini"><div :class="$style.detailMiniLabel">处理阶段</div><div :class="$style.detailMiniValue">{{ activeModel.process.length }} 段</div></div>
          <div :class="$style.detailMini"><div :class="$style.detailMiniLabel">下游输出</div><div :class="$style.detailMiniValue">{{ activeModel.outputs.length }} 项</div></div>
        </div>
        <div :class="$style.tripleGrid">
          <div :class="$style.listCard"><h4>输入</h4><ul :class="$style.plainList"><li v-for="item in activeModel.inputs" :key="item">{{ item }}</li></ul></div>
          <div :class="$style.listCard"><h4>处理链路</h4><ul :class="$style.plainList"><li v-for="item in activeModel.process" :key="item">{{ item }}</li></ul></div>
          <div :class="$style.listCard"><h4>输出任务</h4><ul :class="$style.plainList"><li v-for="item in activeModel.outputs" :key="item">{{ item }}</li></ul></div>
        </div>
        <div :class="$style.doubleGrid">
          <div :class="$style.listCard"><h4>当前特性</h4><ul :class="$style.plainList"><li v-for="item in activeModel.features" :key="item">{{ item }}</li></ul></div>
          <div :class="$style.listCard"><h4>参与成员</h4><div :class="$style.chipRow"><span v-for="member in activeModel.members" :key="member" :class="[$style.pill, $style.pillMuted]">{{ member }}</span></div></div>
        </div>
        <div :class="$style.taskList">
          <article v-for="task in activeModel.tasks" :key="task.name" :class="$style.taskCard">
            <div :class="$style.taskHeader">
              <div>
                <div :class="$style.moduleName">{{ task.name }}</div>
                <div :class="$style.taskMeta">负责人：{{ task.owner }}</div>
              </div>
              <span :class="[$style.pill, $style[statusPill(task.status)]]">{{ statusText(task.status) }}</span>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- Data Tab -->
    <div v-else-if="activeTab === 'data'" :class="$style.workspace">
      <aside :class="[$style.panel, $style.sidebar]">
        <div :class="$style.sidebarSection">
          <div :class="$style.sidebarCaption">数据列表</div>
          <div :class="$style.sidebarList">
            <button v-for="item in aefDatasets" :key="item.id" type="button" :class="[$style.sidebarItem, { [$style.sidebarItemActive]: activeDataset.id === item.id }]" @click="setActiveDatasetId(item.id)">
              <div :class="$style.sidebarHeader">
                <span :class="$style.sidebarTitle">{{ item.name }}</span>
                <span :class="[$style.pill, $style[statusPill(item.status)]]">{{ statusText(item.status) }}</span>
              </div>
              <div :class="$style.sidebarSub">{{ item.modality }} · {{ item.resolution }}</div>
            </button>
          </div>
        </div>
        <div :class="$style.sidebarSection">
          <div :class="$style.sidebarCaption">待下载 / 待接入</div>
          <div :class="$style.summaryList">
            <article v-for="item in aefPendingData" :key="item.name" :class="$style.pendingCard">
              <div :class="$style.moduleName">{{ item.name }}</div>
              <div :class="$style.metaText">{{ item.note }}</div>
              <div :class="$style.newsMeta"><span :class="[$style.pill, $style.pillAmber]">{{ item.progress }}</span></div>
            </article>
          </div>
        </div>
      </aside>
      <section :class="[$style.panel, $style.detail]">
        <div :class="$style.detailHeader">
          <div>
            <div :class="$style.eyebrow">Data Workspace</div>
            <h2 :class="$style.detailTitle">{{ activeDataset.name }}</h2>
          </div>
          <div :class="$style.badgeRow">
            <span :class="[$style.pill, $style[statusPill(activeDataset.status)]]">{{ statusText(activeDataset.status) }}</span>
            <span :class="[$style.pill, $style.pillBlue]">{{ activeDataset.modality }}</span>
          </div>
        </div>
        <p :class="$style.detailText">{{ activeDataset.desc }}</p>
        <div :class="$style.detailGrid">
          <div :class="$style.detailMini"><div :class="$style.detailMiniLabel">样本规模</div><div :class="$style.detailMiniValue">{{ activeDataset.tiles }}</div></div>
          <div :class="$style.detailMini"><div :class="$style.detailMiniLabel">空间分辨率</div><div :class="$style.detailMiniValue">{{ activeDataset.resolution }}</div></div>
          <div :class="$style.detailMini"><div :class="$style.detailMiniLabel">标签数</div><div :class="$style.detailMiniValue">{{ activeDataset.tags.length }}</div></div>
        </div>
        <div :class="$style.doubleGrid">
          <div :class="$style.listCard"><h4>处理管线</h4><ul :class="$style.plainList"><li v-for="item in activeDataset.pipeline" :key="item">{{ item }}</li></ul></div>
          <div :class="$style.listCard"><h4>标签与用途</h4><div :class="$style.chipRow"><span v-for="tag in activeDataset.tags" :key="tag" :class="[$style.pill, $style.pillBlue]">{{ tag }}</span></div></div>
        </div>
      </section>
    </div>

    <!-- Eval Tab -->
    <div v-else-if="activeTab === 'eval'" :class="$style.workspace">
      <aside :class="[$style.panel, $style.sidebar]">
        <div :class="$style.sidebarSection">
          <div :class="$style.sidebarCaption">评测维度</div>
          <div :class="$style.modeRow">
            <button type="button" :class="[$style.modeButton, { [$style.modeButtonActive]: evalMode === 'capability' }]" @click="setEvalMode('capability')">按能力</button>
            <button type="button" :class="[$style.modeButton, { [$style.modeButtonActive]: evalMode === 'scenario' }]" @click="setEvalMode('scenario')">按场景</button>
          </div>
        </div>
        <div :class="$style.sidebarSection">
          <div :class="$style.sidebarList">
            <button v-for="item in visibleEvalGroups" :key="item.id" type="button" :class="[$style.sidebarItem, { [$style.sidebarItemActive]: activeEval.id === item.id }]" @click="setActiveEvalId(item.id)">
              <div :class="$style.sidebarTitle">{{ item.name }}</div>
              <div :class="$style.sidebarSub">{{ item.desc }}</div>
            </button>
          </div>
        </div>
      </aside>
      <section :class="[$style.panel, $style.detail]">
        <div :class="$style.detailHeader">
          <div>
            <div :class="$style.eyebrow">Evaluation Workspace</div>
            <h2 :class="$style.detailTitle">{{ activeEval.name }}</h2>
          </div>
          <div :class="$style.badgeRow">
            <span :class="[$style.pill, $style.pillBlue]">{{ evalMode === 'capability' ? '能力维度' : '场景维度' }}</span>
            <span :class="[$style.pill, $style.pillGreen]">{{ activeEval.tasks.filter(t => t.status === 'done').length }}/{{ activeEval.tasks.length }} 已完成</span>
          </div>
        </div>
        <p :class="$style.detailText">{{ activeEval.desc }}</p>
        <div :class="$style.taskList">
          <article v-for="task in activeEval.tasks" :key="task.name" :class="$style.taskCard">
            <div :class="$style.taskHeader">
              <div>
                <div :class="$style.moduleName">{{ task.name }}</div>
                <div :class="$style.taskMeta">{{ task.model }} · {{ task.dataset }}</div>
              </div>
              <span :class="[$style.pill, $style[statusPill(task.status)]]">{{ statusText(task.status) }}</span>
            </div>
            <div :class="$style.newsMeta">
              <span v-if="typeof task.score === 'number'" :class="[$style.pill, $style.pillBlue]">得分 {{ task.score }}%</span>
              <span v-else :class="[$style.pill, $style.pillMuted]">待评测结果</span>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- Explore Tab -->
    <div v-else-if="activeTab === 'explore'" :class="$style.workspace">
      <aside :class="[$style.panel, $style.sidebar]">
        <div :class="$style.sidebarSection">
          <div :class="$style.sidebarCaption">领域筛选</div>
          <div :class="$style.filterRow">
            <button v-for="item in [{key:'all',label:'全部'},{key:'remote',label:'遥感'},{key:'multimodal',label:'多模态'},{key:'nlp',label:'NLP'},{key:'cv',label:'CV'}]" :key="item.key" type="button" :class="[$style.filterButton, { [$style.filterButtonActive]: activeDomain === item.key }]" @click="setActiveDomain(item.key as DomainFilter)">{{ item.label }}</button>
          </div>
        </div>
        <div :class="$style.sidebarSection">
          <div :class="$style.sidebarCaption">我的关注标签</div>
          <div :class="$style.filterRow">
            <button v-for="tag in followTags" :key="tag" type="button" :class="[$style.filterButton, { [$style.filterButtonActive]: activeTag === tag }]" @click="setActiveTag(tag)">{{ tag }}</button>
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
            <span :class="[$style.pill, $style.pillBlue]">{{ activeDomain === 'all' ? '全部领域' : activeDomain }}</span>
            <span v-if="activeTag" :class="[$style.pill, $style.pillAmber]">#{{ activeTag }}</span>
          </div>
        </div>
        <p :class="$style.detailText">这里保留"资讯流 + 标签过滤"的结构，后面如果接入真实接口，可以继续作为轻量异步内容区，不会和首屏工作流看板冲突。</p>
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

    <!-- Members Tab -->
    <div v-else-if="activeTab === 'members'" :class="$style.workspace">
      <aside :class="[$style.panel, $style.sidebar]">
        <div :class="$style.sidebarSection">
          <div :class="$style.sidebarCaption">团队成员</div>
          <div :class="$style.sidebarList">
            <button v-for="item in aefMembers" :key="item.id" type="button" :class="[$style.sidebarItem, { [$style.sidebarItemActive]: activeMember.id === item.id }]" @click="setActiveMemberId(item.id)">
              <div :class="$style.sidebarHeader">
                <span :class="$style.sidebarTitle">{{ item.name }}</span>
                <span :class="[$style.pill, $style.pillBlue]">{{ item.team }}</span>
              </div>
              <div :class="$style.sidebarSub">{{ item.role }}</div>
            </button>
          </div>
        </div>
      </aside>
      <section :class="[$style.panel, $style.detail]">
        <div :class="$style.detailHeader">
          <div>
            <div :class="$style.eyebrow">Member Workspace</div>
            <h2 :class="$style.detailTitle">{{ activeMember.name }}</h2>
          </div>
          <div :class="$style.badgeRow">
            <span :class="[$style.pill, $style.pillBlue]">{{ activeMember.team }}</span>
            <span :class="[$style.pill, $style.pillMuted]">{{ activeMember.role }}</span>
          </div>
        </div>
        <div :class="$style.memberDetailGrid">
          <article :class="$style.memberMiniCard">
            <div :class="$style.moduleName">关注方向</div>
            <div :class="$style.chipRow"><span v-for="item in activeMember.focus" :key="item" :class="[$style.pill, $style.pillBlue]">{{ item }}</span></div>
          </article>
          <article :class="$style.memberMiniCard">
            <div :class="$style.moduleName">近期工作</div>
            <div :class="$style.detailText">{{ activeMember.recent }}</div>
          </article>
          <article :class="$style.memberMiniCard">
            <div :class="$style.moduleName">下一步计划</div>
            <div :class="$style.detailText">{{ activeMember.next }}</div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style module>
.shell { display: grid; gap: 24px; margin-top: 28px; padding-bottom: 40px; }

.hero {
  position: relative; overflow: hidden; display: grid; gap: 26px; padding: 30px;
  border-radius: 30px; border: 1px solid var(--line);
  background: radial-gradient(circle at 85% 10%, rgba(56, 189, 248, 0.12), transparent 22%), radial-gradient(circle at 18% 100%, rgba(129, 140, 248, 0.12), transparent 30%), linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(15, 23, 42, 0.76));
  box-shadow: var(--shadow);
}
.eyebrow { display: inline-flex; padding: 7px 12px; border-radius: 999px; color: #bfdbfe; background: rgba(96, 165, 250, 0.12); border: 1px solid rgba(96, 165, 250, 0.22); font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }

.workflowBoard { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.workflowColumn { min-height: 100%; padding: 16px; border-radius: 24px; background: linear-gradient(180deg, rgba(8, 15, 30, 0.72), rgba(15, 23, 42, 0.55)); border: 1px solid rgba(148, 163, 184, 0.18); backdrop-filter: blur(10px); }
.wfSlate { box-shadow: inset 0 3px 0 rgba(148, 163, 184, 0.42); }
.wfBlue { box-shadow: inset 0 3px 0 rgba(59, 130, 246, 0.52); }
.wfAmber { box-shadow: inset 0 3px 0 rgba(251, 191, 36, 0.52); }
.wfGreen { box-shadow: inset 0 3px 0 rgba(52, 211, 153, 0.52); }
.wfColHead { display: flex; align-items: start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.wfColTitle { font-size: 18px; font-weight: 800; color: #f8fbff; }
.wfColHint { margin-top: 4px; color: #9fb4cf; font-size: 12px; line-height: 1.5; }
.wfCards { display: grid; gap: 12px; }
.wfCard { padding: 14px; border-radius: 20px; border: 1px solid rgba(148, 163, 184, 0.14); background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03)); transition: 0.18s ease; }
.wfCard:hover { transform: translateY(-2px); border-color: rgba(96, 165, 250, 0.36); }
.wfCardTop { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.wfProject { margin-top: 12px; color: #7dd3fc; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.wfCardTitle { margin: 8px 0 0; font-size: 16px; line-height: 1.45; color: #f8fbff; }
.wfSummary { margin: 10px 0 0; color: #c5d3e5; font-size: 13px; line-height: 1.7; }
.wfTagRow { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.wfCardFooter { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(148, 163, 184, 0.12); }
.wfMetaItem { color: #c0d2e8; font-size: 12px; }

.tabBar { display: flex; flex-wrap: wrap; gap: 10px; }
.tabButton { display: inline-flex; align-items: center; gap: 8px; min-height: 42px; padding: 0 16px; border-radius: 999px; border: 1px solid rgba(148, 163, 184, 0.22); background: rgba(15, 23, 42, 0.62); color: var(--muted); cursor: pointer; transition: 0.18s ease; }
.tabButton:hover { color: #fff; border-color: rgba(96, 165, 250, 0.42); transform: translateY(-1px); }
.tabButtonActive { color: #fff; border-color: rgba(96, 165, 250, 0.5); background: rgba(37, 99, 235, 0.35); box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.3); }
.tabIcon { font-size: 13px; opacity: 0.9; }

.panel { border-radius: 28px; border: 1px solid var(--line); background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.74)); box-shadow: var(--shadow); }
.homeGrid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 18px; }
.homeColumn { display: grid; gap: 18px; }
.block { padding: 22px; }
.blockHead { display: flex; align-items: end; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.blockTitle { margin: 0; font-size: 22px; }
.blockLead { margin: 6px 0 0; color: var(--muted); font-size: 14px; line-height: 1.7; }
.reviewList, .newsList, .summaryList { display: grid; gap: 12px; }

.reviewCard, .newsCard, .pendingCard, .taskCard, .memberMiniCard { border-radius: 20px; border: 1px solid rgba(148, 163, 184, 0.16); background: rgba(255, 255, 255, 0.05); padding: 16px; transition: 0.18s ease; }
.reviewCard:hover, .newsCard:hover, .pendingCard:hover, .taskCard:hover, .memberMiniCard:hover { transform: translateY(-2px); border-color: rgba(96, 165, 250, 0.35); }

.moduleName { font-size: 15px; font-weight: 700; }
.metaText, .newsDesc, .reviewMeta, .taskMeta, .detailText { color: var(--muted); font-size: 13px; line-height: 1.65; }

.pill { display: inline-flex; align-items: center; min-height: 28px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.pillBlue { color: #67e8f9; background: rgba(34, 211, 238, 0.1); border: 1px solid rgba(34, 211, 238, 0.22); }
.pillGreen { color: #bbf7d0; background: rgba(52, 211, 153, 0.12); border: 1px solid rgba(52, 211, 153, 0.22); cursor: pointer; }
.pillGreen:hover { background: rgba(52, 211, 153, 0.25); }
.pillAmber { color: #fde68a; background: rgba(251, 191, 36, 0.12); border: 1px solid rgba(251, 191, 36, 0.22); }
.pillMuted { color: #cbd5e1; background: rgba(148, 163, 184, 0.12); border: 1px solid rgba(148, 163, 184, 0.2); }
.pillRed { color: #fca5a5; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); cursor: pointer; }
.pillRed:hover { background: rgba(239, 68, 68, 0.22); }

.reviewActions { display: flex; gap: 8px; margin-top: 12px; }
.reviewHeader, .newsHeader, .sidebarHeader, .taskHeader { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.newsMeta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }

.workspace { display: grid; grid-template-columns: 290px 1fr; gap: 18px; align-items: start; }
.sidebar { padding: 18px; }
.sidebarSection + .sidebarSection { margin-top: 18px; }
.sidebarCaption { margin-bottom: 10px; color: #93c5fd; font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
.sidebarList { display: grid; gap: 10px; }
.sidebarItem { padding: 14px; cursor: pointer; color: inherit; border-radius: 20px; border: 1px solid rgba(148, 163, 184, 0.16); background: rgba(255, 255, 255, 0.05); transition: 0.18s ease; }
.sidebarItem:hover { transform: translateY(-2px); border-color: rgba(96, 165, 250, 0.35); }
.sidebarItemActive { border-color: rgba(96, 165, 250, 0.4); background: rgba(96, 165, 250, 0.1); }
.sidebarTitle { font-size: 14px; font-weight: 700; }
.sidebarSub { margin-top: 4px; color: var(--muted); font-size: 12px; }

.detail { padding: 22px; background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.74)); }
.detailHeader { display: flex; justify-content: space-between; gap: 16px; align-items: start; margin-bottom: 18px; }
.detailTitle { margin: 8px 0 0; font-size: 30px; letter-spacing: -0.03em; }
.badgeRow, .chipRow, .filterRow, .modeRow { display: flex; flex-wrap: wrap; gap: 8px; }

.detailGrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 18px 0; }
.detailMini { padding: 14px; border-radius: 18px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(148, 163, 184, 0.16); }
.detailMiniLabel { color: var(--muted); font-size: 12px; }
.detailMiniValue { margin-top: 8px; color: #eff6ff; font-size: 15px; font-weight: 700; }

.tripleGrid, .doubleGrid { display: grid; gap: 12px; }
.tripleGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.doubleGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }

.listCard { padding: 16px; border-radius: 20px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(148, 163, 184, 0.16); }
.listCard h4 { margin: 0 0 10px; font-size: 15px; }
.plainList { display: grid; gap: 10px; padding: 0; margin: 0; list-style: none; }
.plainList li { color: #dbeafe; font-size: 13px; line-height: 1.6; }

.taskList { display: grid; gap: 10px; margin-top: 16px; }
.emptyState { padding: 34px; border-radius: 24px; border: 1px dashed rgba(147, 197, 253, 0.24); color: #93c5fd; background: rgba(255, 255, 255, 0.03); text-align: center; }

.filterButton, .modeButton { min-height: 34px; padding: 0 12px; border-radius: 999px; border: 1px solid rgba(148, 163, 184, 0.2); background: rgba(255, 255, 255, 0.04); color: var(--muted); cursor: pointer; transition: 0.18s ease; }
.filterButtonActive, .modeButtonActive { color: #fff; border-color: rgba(96, 165, 250, 0.5); background: rgba(37, 99, 235, 0.35); }

.memberDetailGrid { display: grid; gap: 12px; margin-top: 18px; }
.memberMiniCard { display: grid; gap: 6px; padding: 16px; }

@media (max-width: 1100px) {
  .workflowBoard, .homeGrid, .workspace, .doubleGrid, .tripleGrid, .detailGrid { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .hero, .block, .sidebar, .detail { padding: 20px; }
  .workflowBoard { grid-template-columns: 1fr; }
  .workflowColumn { padding: 14px; }
}
</style>
