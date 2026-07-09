<script setup lang="ts">
import { ref } from "vue";
import {
  ElRow,
  ElCol,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElRadioGroup,
  ElRadioButton,
  ElCheckbox,
  ElTag,
  ElText,
} from "element-plus";
import {
  dashboardAgentActions,
  dashboardDatasets,
  dashboardNews,
  dashboardPipelines,
  dashboardProjects,
  dashboardStatCards,
  dashboardTasks,
} from "@/lib/aefStudioData";

const agentOpen = ref(false);
const taskModalOpen = ref(false);

const licenseOptions = ["Internal", "Public", "Restricted"];
const formatOptions = [
  "GeoTIFF",
  "COG",
  "TIFF / TIF",
  "GRIB",
  "Shapefile / SHP",
  "GeoJSON",
  "CSV",
  "Parquet",
  "GeoParquet",
  "JSON / JSONL",
];
const domainOptions = ["预训练", "变化检测", "目标检测", "热风险", "全景分割"];
const modalityOptions = ["光学", "多光谱", "SAR", "DEM", "LST", "土地覆盖", "矢量"];
const resolutionUnitOptions = ["m/pixel", "cm/pixel", "km/pixel"];

const form = ref({
  name: "",
  source: "",
  description: "",
  region: "",
  samples: "",
  begin_time: "",
  end_time: "",
  resolution: "",
  resolution_unit: "m/pixel",
  license: [] as string[],
  format: [] as string[],
  domain: [] as string[],
  modality: "",
  storage_status: "",
  storage_path: "",
});

function submitTask() {
  console.log("注册数据集提交:", JSON.parse(JSON.stringify(form.value)));
  taskModalOpen.value = false;
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    成功: "status-success",
    已入库: "status-success",
    运行中: "status-running",
    进行中: "status-running",
    失败: "status-danger",
    待审核: "status-warning",
    待质检: "status-warning",
    待开始: "status-muted",
  };
  return map[status] ?? "status-muted";
}
</script>

<template>
  <main class="studio-page">
    <section class="page-title-row dashboard-title-row">
      <div>
        <div class="title-box">今日工作</div>
        <div class="page-subtitle">
          今日有 <b>12</b> 个任务待处理，<b>2</b> 条管线异常，Agent 推荐 <b>4</b> 个动作。
        </div>
      </div>
      <div class="action-row">
        <button class="primary-btn">+ 新建任务</button>
        <button class="secondary-btn" @click="taskModalOpen = true">注册数据集</button>
        <button class="secondary-btn">生成日报</button>
      </div>
    </section>

    <section class="stats-row">
      <article v-for="card in dashboardStatCards" :key="card.title" class="stat-card panel">
        <div class="stat-icon">{{ card.icon }}</div>
        <div>
          <div class="stat-title">{{ card.title }}</div>
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-desc">{{ card.desc }}</div>
        </div>
      </article>
    </section>

    <section class="dashboard-grid">
      <div class="left-column">
        <section class="panel">
          <div class="panel-inner">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">今日待处理任务</h2>
                <p class="panel-desc">按优先级、截止时间和异常风险排序</p>
              </div>
              <button class="text-btn">查看全部</button>
            </div>

            <div class="task-list">
              <article v-for="task in dashboardTasks" :key="task.title" class="task-row">
                <div class="priority" :class="task.levelClass">{{ task.level }}</div>
                <div class="task-main">
                  <div class="task-name">{{ task.title }}</div>
                  <div class="task-meta">{{ task.module }} / 负责人：{{ task.owner }} / 截止：{{ task.deadline }}</div>
                </div>
                <span class="status-pill" :class="statusClass(task.status)">{{ task.status }}</span>
                <button class="small-btn">处理</button>
              </article>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-inner">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">本周项目进度</h2>
                <p class="panel-desc">项目阶段、任务完成数、异常风险和本周重点</p>
              </div>
              <button class="text-btn">项目中心</button>
            </div>

            <div class="progress-cards">
              <article v-for="project in dashboardProjects" :key="project.name" class="progress-card">
                <div class="progress-top">
                  <div>
                    <div class="project-name">{{ project.name }}</div>
                    <div class="project-focus">{{ project.focus }}</div>
                  </div>
                  <span class="status-pill status-running">进行中</span>
                </div>
                <div class="project-kpis">
                  <span>{{ project.done }}/{{ project.total }} 任务</span>
                  <span>{{ project.owner }}</span>
                  <span>异常 {{ project.errors }}</span>
                </div>
                <div class="progress-line">
                  <div class="progress-track">
                    <div class="progress-fill" :style="{ width: `${project.progress}%` }"></div>
                  </div>
                  <b>{{ project.progress }}%</b>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-inner">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">最新入库数据集</h2>
                <p class="panel-desc">突出来源、状态、Owner 与路径，便于直接转到数据中心继续处理</p>
              </div>
              <button class="text-btn">数据中心</button>
            </div>

            <div class="dataset-list">
              <article v-for="dataset in dashboardDatasets" :key="dataset.name" class="dataset-row">
                <div class="dataset-icon">DS</div>
                <div class="dataset-main">
                  <div class="dataset-title">{{ dataset.name }}</div>
                  <div class="dataset-meta">
                    {{ dataset.source }} / {{ dataset.modality }} / {{ dataset.resolution }} / {{ dataset.region }}
                  </div>
                  <div class="tag-line">
                    <span class="tag">{{ dataset.time }}</span>
                    <span class="tag">{{ dataset.format }}</span>
                    <span class="tag">{{ dataset.owner }}</span>
                  </div>
                </div>
                <div class="dataset-actions">
                  <span class="status-pill" :class="statusClass(dataset.status)">{{ dataset.status }}</span>
                  <button class="small-btn">详情</button>
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>

      <aside class="right-column">
        <section class="panel">
          <div class="panel-inner">
            <div class="panel-header compact">
              <div>
                <h2 class="panel-title">最新资讯</h2>
                <p class="panel-desc">工作台里的轻量趋势入口</p>
              </div>
            </div>
            <div class="news-list">
              <article v-for="item in dashboardNews" :key="item.title" class="news-card">
                <div class="news-type">{{ item.type }}</div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.summary }}</p>
                <div class="news-actions">
                  <button>收藏</button>
                  <button>转任务</button>
                  <button>生成选题</button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-inner">
            <div class="panel-header compact">
              <div>
                <h2 class="panel-title">Agent 推荐动作</h2>
                <p class="panel-desc">根据任务、管线、数据和资讯自动生成</p>
              </div>
            </div>
            <div class="agent-actions">
              <article v-for="action in dashboardAgentActions" :key="action.title" class="agent-card">
                <div class="agent-title">{{ action.title }}</div>
                <div class="agent-desc">{{ action.desc }}</div>
                <div class="agent-btns">
                  <button class="small-btn">执行</button>
                  <button class="ghost-mini">忽略</button>
                </div>
              </article>
            </div>
          </div>
        </section>
      </aside>
    </section>

    <section class="panel pipeline-panel">
      <div class="panel-inner">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">数据处理管线状态</h2>
            <p class="panel-desc">下载、预处理、入库、推理、资讯抓取等任务运行情况</p>
          </div>
          <button class="text-btn">查看运行日志</button>
        </div>
        <div class="pipeline-table">
          <div class="pipeline-row table-head">
            <span>管线名称</span>
            <span>关联项目</span>
            <span>状态</span>
            <span>最近运行</span>
            <span>耗时</span>
            <span>负责人</span>
            <span>操作</span>
          </div>
          <div v-for="pipe in dashboardPipelines" :key="pipe.name" class="pipeline-row">
            <span class="pipe-name">{{ pipe.name }}</span>
            <span>{{ pipe.project }}</span>
            <span
              ><i class="status-pill" :class="statusClass(pipe.status)">{{ pipe.status }}</i></span
            >
            <span>{{ pipe.lastRun }}</span>
            <span>{{ pipe.duration }}</span>
            <span>{{ pipe.owner }}</span>
            <span><button class="small-btn">日志</button></span>
          </div>
        </div>
      </div>
    </section>

    <button class="agent-float" type="button" @click="agentOpen = true">Agent</button>
    <div v-if="agentOpen" class="drawer-mask" @click.self="agentOpen = false">
      <aside class="agent-drawer">
        <div class="drawer-head">
          <div>
            <h2>GeoRemote Agent</h2>
            <p>当前页面：工作台</p>
          </div>
          <button type="button" @click="agentOpen = false">X</button>
        </div>
        <div class="suggestions">
          <button type="button">今天我应该先处理什么？</button>
          <button type="button">哪些数据集可以发布？</button>
          <button type="button">帮我生成本周项目周报</button>
          <button type="button">把高优先级资讯转成任务</button>
        </div>
        <div class="chat-box">我会结合任务、项目进度、数据管线和资讯，给出下一步行动建议。</div>
        <div class="chat-input">
          <input placeholder="输入问题..." />
          <button type="button">发送</button>
        </div>
      </aside>
    </div>

    <div v-if="taskModalOpen" class="modal-mask" @click.self="taskModalOpen = false">
      <div class="modal-panel">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">注册数据集</h2>
            <p class="modal-desc">注册一个新的数据集，填写以下信息后提交。</p>
          </div>
          <button type="button" class="modal-close" @click="taskModalOpen = false">✕</button>
        </div>

        <div class="modal-body">
          <el-form label-position="top" size="default" class="dark-form">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="名称">
                  <el-input v-model="form.name" placeholder="例如：Landsat 8/9 L2" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="来源">
                  <el-input v-model="form.source" placeholder="例如：georemote" clearable />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="描述">
              <el-input v-model="form.description" type="textarea" :rows="3" placeholder="数据描述信息" />
            </el-form-item>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="区域">
                  <el-input v-model="form.region" placeholder="例如：浙江省" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="样本量">
                  <el-input v-model="form.samples" placeholder="例如：12万" clearable />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="开始时间">
                  <el-date-picker
                    v-model="form.begin_time"
                    type="date"
                    placeholder="选择日期"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                    popper-class="dark-popper"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="结束时间">
                  <el-date-picker
                    v-model="form.end_time"
                    type="date"
                    placeholder="选择日期"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                    popper-class="dark-popper"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="分辨率">
                  <div style="display: flex; gap: 0; width: 100%">
                    <el-input
                      v-model="form.resolution"
                      placeholder="数值"
                      style="flex: 1; border-top-right-radius: 0; border-bottom-right-radius: 0"
                    />
                    <el-select v-model="form.resolution_unit" style="width: 110px" popper-class="dark-popper">
                      <el-option v-for="u in resolutionUnitOptions" :key="u" :label="u" :value="u" />
                    </el-select>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="许可">
                  <el-select
                    v-model="form.license"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    :reserve-keyword="false"
                    clearable
                    placeholder="请选择或输入许可"
                    collapse-tags
                    collapse-tags-tooltip
                    style="width: 100%"
                    popper-class="dark-popper"
                  >
                    <el-option v-for="opt in licenseOptions" :key="opt" :label="opt" :value="opt" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="格式">
                  <el-select
                    v-model="form.format"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    :reserve-keyword="false"
                    clearable
                    placeholder="请选择或输入格式"
                    collapse-tags
                    collapse-tags-tooltip
                    style="width: 100%"
                    popper-class="dark-popper"
                  >
                    <el-option v-for="opt in formatOptions" :key="opt" :label="opt" :value="opt" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="应用范围（可多选）">
              <el-select
                v-model="form.domain"
                multiple
                filterable
                allow-create
                default-first-option
                :reserve-keyword="false"
                placeholder="请选择应用范围或直接输入"
                collapse-tags
                collapse-tags-tooltip
                :max-collapse-tags="5"
                style="width: 100%"
                popper-class="dark-popper"
                clearable
              >
                <el-option v-for="item in domainOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>

            <el-form-item label="模态">
              <el-select
                v-model="form.modality"
                filterable
                allow-create
                default-first-option
                :reserve-keyword="false"
                placeholder="请选择模态"
                style="width: 100%"
                popper-class="dark-popper"
                clearable
              >
                <el-option v-for="item in modalityOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>

            <el-form-item label="存储状态">
              <el-radio-group v-model="form.storage_status" class="storage-toggle">
                <el-radio-button value="local">
                  <svg
                    class="radio-icon"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  本地存储
                </el-radio-button>
                <el-radio-button value="web">
                  <svg
                    class="radio-icon"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path
                      d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                    />
                  </svg>
                  网站链接
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="form.storage_status" :label="form.storage_status === 'local' ? '存储路径' : '网站地址'">
              <el-input
                v-model="form.storage_path"
                :placeholder="form.storage_status === 'local' ? '/mnt_llm_A100_V1/datasets/...' : 'https://...'"
                clearable
              />
            </el-form-item>
          </el-form>
        </div>

        <div class="modal-footer">
          <button type="button" class="secondary-btn" @click="taskModalOpen = false">取消</button>
          <button type="button" class="primary-btn" @click="submitTask">提交</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.studio-page {
  display: grid;
  gap: 20px;
}

.dashboard-title-row {
  align-items: center;
}

.page-title-row {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
}

.title-box {
  display: inline-flex;
  align-items: center;
  min-height: 58px;
  padding: 0 22px;
  border: 1px solid rgba(96, 165, 250, 0.34);
  border-radius: 18px;
  background: rgba(11, 22, 40, 0.72);
  color: #fff;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.page-subtitle {
  margin-top: 12px;
  color: var(--muted);
  line-height: 1.7;
}

.page-subtitle b {
  color: #67e8f9;
}

.action-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn,
.small-btn,
.ghost-mini,
.text-btn,
.news-actions button,
.suggestions button,
.chat-input button,
.drawer-head button {
  border: 0;
  cursor: pointer;
  transition: 0.18s ease;
}

.primary-btn {
  height: 42px;
  padding: 0 18px;
  border-radius: 12px;
  color: #fff;
  font-weight: 800;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.28);
}

.secondary-btn {
  height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  color: #d9edff;
  background: rgba(12, 28, 52, 0.72);
  border: 1px solid rgba(120, 165, 255, 0.2);
}

.small-btn,
.ghost-mini,
.news-actions button {
  height: 30px;
  padding: 0 10px;
  border-radius: 9px;
  color: #dff5ff;
  background: rgba(56, 189, 248, 0.14);
}

.ghost-mini {
  background: rgba(121, 167, 255, 0.14);
  color: #cfe8ff;
}

.text-btn {
  padding: 0;
  color: #67e8f9;
  background: transparent;
  font-weight: 800;
}

.panel {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.76));
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(14px);
}

.panel-inner {
  padding: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.panel-header.compact {
  margin-bottom: 14px;
}

.panel-title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
}

.panel-desc {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(6, minmax(170px, 1fr));
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.stat-card {
  min-height: 112px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
}

.stat-icon,
.dataset-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 14px;
  color: #67e8f9;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  background: rgba(56, 189, 248, 0.13);
}

.stat-title {
  color: var(--muted);
  font-size: 13px;
}

.stat-value {
  margin-top: 2px;
  color: #67e8f9;
  font-size: 32px;
  font-weight: 950;
}

.stat-desc {
  color: #7f92a9;
  font-size: 12px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 20px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.task-list,
.dataset-list,
.news-list,
.agent-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-row {
  min-height: 70px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto auto;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid rgba(121, 167, 255, 0.12);
  border-radius: 16px;
  background: rgba(2, 8, 21, 0.34);
}

.priority,
.status-pill,
.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  white-space: nowrap;
}

.priority {
  width: 36px;
  height: 30px;
  font-size: 12px;
  font-weight: 900;
}

.priority-high {
  color: #fecaca;
  background: rgba(239, 68, 68, 0.18);
}

.priority-mid {
  color: #fde68a;
  background: rgba(245, 158, 11, 0.18);
}

.priority-low {
  color: #bfdbfe;
  background: rgba(59, 130, 246, 0.18);
}

.task-name,
.dataset-title,
.project-name {
  overflow: hidden;
  color: #f8fbff;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-meta,
.dataset-meta,
.project-focus,
.news-card p,
.agent-desc {
  margin-top: 5px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}

.status-pill {
  min-height: 26px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 800;
}

.status-success {
  color: #86efac;
  background: rgba(34, 197, 94, 0.16);
}

.status-running {
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.16);
}

.status-warning {
  color: #fde68a;
  background: rgba(245, 158, 11, 0.16);
}

.status-danger {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.16);
}

.status-muted {
  color: #cbd5e1;
  background: rgba(100, 116, 139, 0.18);
}

.progress-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.progress-card,
.news-card,
.agent-card {
  padding: 16px;
  border: 1px solid rgba(121, 167, 255, 0.12);
  border-radius: 18px;
  background: rgba(2, 8, 21, 0.28);
}

.progress-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.project-kpis {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-top: 14px;
  color: var(--muted);
  font-size: 12px;
}

.progress-line {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  color: #67e8f9;
}

.progress-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(121, 167, 255, 0.15);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #67e8f9, #3b82f6);
}

.dataset-row {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 14px;
  border: 1px solid rgba(121, 167, 255, 0.12);
  border-radius: 18px;
  background: rgba(2, 8, 21, 0.28);
}

.tag-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag {
  min-height: 26px;
  padding: 0 10px;
  border: 1px solid rgba(125, 211, 252, 0.18);
  color: #c7e9ff;
  background: rgba(30, 64, 175, 0.2);
  font-size: 12px;
}

.dataset-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.news-type {
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  color: #67e8f9;
  background: rgba(56, 189, 248, 0.13);
  font-size: 12px;
  font-weight: 900;
}

.news-card h3 {
  margin: 12px 0 8px;
  font-size: 16px;
  line-height: 1.45;
}

.news-actions,
.agent-btns {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.agent-title {
  font-weight: 900;
}

.pipeline-panel {
  margin-top: 4px;
}

.pipeline-table {
  overflow: hidden;
  border: 1px solid rgba(121, 167, 255, 0.12);
  border-radius: 16px;
}

.pipeline-row {
  min-height: 54px;
  display: grid;
  grid-template-columns: 1.45fr 1fr 0.75fr 1fr 0.65fr 0.75fr 0.55fr;
  gap: 12px;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(121, 167, 255, 0.1);
  color: #c9d9eb;
  font-size: 13px;
}

.pipeline-row:last-child {
  border-bottom: 0;
}

.table-head {
  color: var(--muted);
  background: rgba(2, 8, 21, 0.44);
  font-weight: 900;
}

.pipe-name {
  color: #fff;
  font-weight: 900;
}

.agent-float {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 30;
  height: 50px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(135deg, #06b6d4, #2563eb);
  box-shadow: 0 18px 44px rgba(37, 99, 235, 0.45);
  font-weight: 900;
  cursor: pointer;
}

.drawer-mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  justify-content: flex-end;
  background: rgba(2, 6, 23, 0.6);
  backdrop-filter: blur(8px);
}

.agent-drawer {
  width: min(440px, 100%);
  min-height: 100%;
  padding: 22px;
  border-left: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(3, 9, 22, 0.98);
}

.drawer-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.drawer-head h2 {
  margin: 0;
}

.drawer-head p {
  margin: 6px 0 0;
  color: var(--muted);
}

.drawer-head button {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: #fff;
  background: rgba(121, 167, 255, 0.14);
}

.suggestions {
  display: grid;
  gap: 10px;
  margin: 24px 0;
}

.suggestions button {
  padding: 12px;
  border-radius: 14px;
  color: #dff5ff;
  text-align: left;
  background: rgba(15, 32, 56, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.chat-box {
  min-height: 260px;
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  color: #dff5ff;
  line-height: 1.6;
  background: rgba(10, 24, 44, 0.64);
}

.chat-input {
  display: grid;
  grid-template-columns: 1fr 70px;
  gap: 10px;
  margin-top: 12px;
}

.chat-input input {
  height: 42px;
  padding: 0 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  color: var(--text);
  outline: 0;
  background: rgba(10, 24, 44, 0.78);
}

.chat-input button {
  border-radius: 12px;
  color: #fff;
  background: #0ea5e9;
  font-weight: 900;
}

@media (max-width: 1360px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .right-column {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .page-title-row,
  .progress-cards,
  .right-column {
    grid-template-columns: 1fr;
  }

  .page-title-row {
    flex-direction: column;
  }

  .task-row {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .pipeline-table {
    overflow-x: auto;
  }

  .pipeline-row {
    min-width: 880px;
  }
}

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 24px;
  background: rgba(2, 6, 23, 0.7);
  backdrop-filter: blur(6px);
  overflow-y: auto;
}

.modal-panel {
  width: 100%;
  max-width: 720px;
  border-radius: 28px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(180deg, rgba(11, 20, 38, 0.98), rgba(7, 14, 28, 0.98));
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(14px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 24px 28px 0;
}

.modal-title {
  margin: 0;
  font-size: 24px;
  font-weight: 900;
}

.modal-desc {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 14px;
}

.modal-close {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;
  cursor: pointer;
  transition: 0.18s ease;
  flex-shrink: 0;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.3);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px 28px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 28px 24px;
}

.modal-footer .primary-btn,
.modal-footer .secondary-btn {
  height: 44px;
  padding: 0 24px;
  font-size: 14px;
}
</style>

<style>
/* Global dark overrides for Element Plus poppers */
.el-popper {
  background: rgba(7, 14, 28, 0.98) !important;
  border: 1px solid rgba(121, 167, 255, 0.18) !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6) !important;
}

.el-popper .el-popper__arrow::before {
  background: rgba(7, 14, 28, 0.98) !important;
  border-color: rgba(121, 167, 255, 0.18) !important;
}

.el-popper .el-select-dropdown {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.el-popper .el-select-dropdown__item {
  color: #d9edff !important;
  font-weight: 600 !important;
}

.el-popper .el-select-dropdown__item.hover,
.el-popper .el-select-dropdown__item:hover {
  background: rgba(37, 99, 235, 0.2) !important;
  color: #f8fbff !important;
}

.el-popper .el-select-dropdown__item.is-selected {
  background: rgba(37, 99, 235, 0.1) !important;
}
.el-popper .el-select-dropdown__item.is-selected .el-select-dropdown__option-icon,
.el-popper .el-select-dropdown__item.is-selected .el-icon-check,
.el-popper .el-select-dropdown__item.is-selected [class*="check"] {
  color: #60a5fa !important;
}
.el-popper .el-select-dropdown__item.is-selected svg {
  stroke: #60a5fa !important;
  fill: none !important;
  filter: drop-shadow(0 0 6px rgba(96, 165, 250, 0.6));
}

.el-popper .el-select-dropdown__item.is-selected .el-select-dropdown__option-icon,
.el-popper .el-select-dropdown__item.is-selected .el-select-dropdown__item-prefix,
.el-popper .el-select-dropdown__item.is-selected i,
.el-popper .el-select-dropdown__item.is-selected svg {
  color: #60a5fa !important;
  stroke: #60a5fa !important;
  fill: none !important;
  filter: drop-shadow(0 0 3px rgba(37, 99, 235, 0.4));
}

.el-popper .el-picker-panel {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.el-popper .el-date-table th {
  color: #7f92a9 !important;
}

.el-popper .el-date-table td .el-date-table-cell__text {
  color: #d9edff !important;
}

.el-popper .el-date-table td.today .el-date-table-cell__text {
  color: #60a5fa !important;
  font-weight: 700 !important;
}

.el-popper .el-date-table td:not(.available) .el-date-table-cell__text {
  color: #4a5568 !important;
}

.el-popper .el-date-table td.current:not(.disabled) .el-date-table-cell__text {
  background: rgba(37, 99, 235, 0.3) !important;
  color: #f8fbff !important;
}

.el-popper .el-year-table td .el-year-table-cell__text,
.el-popper .el-month-table td .el-month-table-cell__text {
  color: #d9edff !important;
}

.el-popper .el-year-table td.current:not(.disabled) .el-year-table-cell__text,
.el-popper .el-month-table td.current:not(.disabled) .el-month-table-cell__text {
  background: rgba(37, 99, 235, 0.3) !important;
  color: #f8fbff !important;
}

.el-popper .el-date-picker__header-label {
  color: #c9d9eb !important;
}

.el-popper .el-date-picker__header-label:hover {
  color: #60a5fa !important;
}

.el-popper .el-date-picker__prev-btn,
.el-popper .el-date-picker__next-btn {
  color: #7f92a9 !important;
}

.el-popper .el-date-picker__prev-btn:hover,
.el-popper .el-date-picker__next-btn:hover {
  color: #f8fbff !important;
}

.dark-form {
  --el-fill-color: rgba(2, 8, 21, 0.4);
  --el-fill-color-light: rgba(10, 24, 44, 0.6);
  --el-fill-color-lighter: rgba(2, 8, 21, 0.3);
  --el-border-color: rgba(121, 167, 255, 0.18);
  --el-border-color-light: rgba(148, 163, 184, 0.18);
  --el-text-color-primary: #f8fbff;
  --el-text-color-regular: #d9edff;
  --el-text-color-placeholder: #7f92a9;
  --el-bg-color: transparent;
  --el-bg-color-overlay: rgba(7, 14, 28, 0.98);
  --el-input-bg-color: rgba(2, 8, 21, 0.4);
}

.dark-form .el-form-item__label {
  color: #c9d9eb;
  font-weight: 800;
  font-size: 13px;
  padding-bottom: 4px;
}

.dark-form .el-input__wrapper,
.dark-form .el-select .el-input__wrapper,
.dark-form .el-select__wrapper {
  background: rgba(2, 8, 21, 0.4) !important;
  border: 1px solid rgba(121, 167, 255, 0.18);
  border-radius: 12px;
  box-shadow: none !important;
}

.dark-form .el-input__wrapper.is-focus,
.dark-form .el-select .el-input__wrapper.is-focus,
.dark-form .el-select__wrapper.is-focused,
.dark-form .el-select__wrapper:hover {
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
}

.dark-form .el-input__inner,
.dark-form .el-select__selected-item,
.dark-form .el-select__placeholder,
.dark-form .el-select__tags-text,
.dark-form .el-select__input-wrapper,
.dark-form .el-select__caret {
  color: #f8fbff !important;
}

.dark-form .el-select__placeholder.is-transparent {
  color: #7f92a9 !important;
}

.dark-form .el-textarea__inner {
  background: rgba(2, 8, 21, 0.4) !important;
  border: 1px solid rgba(121, 167, 255, 0.18);
  border-radius: 12px;
  color: #f8fbff !important;
  box-shadow: none !important;
}

.dark-form .el-textarea__inner:focus {
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
}

.dark-form .el-checkbox-button,
.dark-form .el-radio-button {
  --el-checkbox-button-checked-bg-color: rgba(37, 99, 235, 0.25);
  --el-checkbox-button-checked-border-color: #3b82f6;
  --el-checkbox-button-checked-text-color: #fff;
  --el-radio-button-checked-bg-color: rgba(37, 99, 235, 0.25);
  --el-radio-button-checked-border-color: #3b82f6;
  --el-radio-button-checked-text-color: #fff;
}

.dark-form .el-checkbox-button__inner,
.dark-form .el-radio-button__inner {
  background: rgba(2, 8, 21, 0.3) !important;
  border-color: rgba(121, 167, 255, 0.2) !important;
  color: #c7e9ff !important;
  font-weight: 700;
  border-radius: 999px !important;
  padding: 6px 16px !important;
}

.dark-form .el-checkbox-button.is-checked .el-checkbox-button__inner,
.dark-form .el-radio-button.is-active .el-radio-button__inner {
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
}

.dark-form .el-radio-group.storage-toggle {
  display: flex;
  gap: 12px;
}

.dark-form .el-radio-group.storage-toggle .el-radio-button__inner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px !important;
  min-width: 120px;
  justify-content: center;
  font-size: 14px;
  letter-spacing: 0.02em;
  transition: all 0.25s ease;
  border: 1px solid rgba(121, 167, 255, 0.2) !important;
}

.dark-form .el-radio-group.storage-toggle .el-radio-button:not(.is-active) .el-radio-button__inner:hover {
  background: rgba(59, 130, 246, 0.12) !important;
  border-color: rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px);
}

.dark-form .el-radio-group.storage-toggle .el-radio-button.is-active .el-radio-button__inner {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(59, 130, 246, 0.15)) !important;
  border-color: #3b82f6 !important;
  box-shadow:
    0 0 24px rgba(59, 130, 246, 0.18),
    0 0 0 1px rgba(59, 130, 246, 0.35) !important;
}

.dark-form .el-radio-group.storage-toggle .radio-icon {
  opacity: 0.7;
  flex-shrink: 0;
}

.dark-form .el-radio-group.storage-toggle .el-radio-button.is-active .radio-icon {
  opacity: 1;
}

.dark-form .el-date-editor {
  --el-date-editor-width: 100%;
}

.dark-form .el-picker-panel {
  background: rgba(11, 20, 38, 0.98);
  border-color: rgba(148, 163, 184, 0.2);
}

.dark-form .el-select .el-input__wrapper {
  border-radius: 12px;
}

.dark-form .el-select__wrapper {
  min-height: 42px;
  padding: 1px 11px;
}

.dark-form .el-select ~ .el-input .el-input__wrapper,
.dark-form .el-input ~ .el-select .el-input__wrapper {
  border-radius: 12px;
}

.dark-form .el-select-dropdown {
  background: rgba(7, 14, 28, 0.98);
  border: 1px solid rgba(121, 167, 255, 0.18);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
}

.dark-form .el-select-dropdown__item {
  color: #d9edff;
  font-weight: 600;
}

.dark-form .el-select-dropdown__item.hover,
.dark-form .el-select-dropdown__item:hover {
  background: rgba(37, 99, 235, 0.2);
  color: #f8fbff;
}

.dark-form .el-select-dropdown__item.is-selected {
  background: rgba(37, 99, 235, 0.1);
}

.dark-popper .el-select-dropdown__item.is-selected .el-select-dropdown__option-icon {
  color: #60a5fa !important;
}
.dark-popper .el-select-dropdown__item.is-selected .el-select-dropdown__option-icon svg {
  stroke: #60a5fa !important;
  fill: none !important;
  filter: drop-shadow(0 0 4px rgba(96, 165, 250, 0.5));
}

.dark-form .el-tag {
  --el-tag-bg-color: rgba(37, 99, 235, 0.2);
  --el-tag-border-color: rgba(59, 130, 246, 0.3);
  --el-tag-text-color: #d9edff;
  --el-tag-close-hover-color: #f8fbff;
}

.dark-form .el-tag .el-tag__close {
  color: #7f92a9;
}

.dark-form .el-tag .el-tag__close:hover {
  color: #f8fbff;
  background: rgba(239, 68, 68, 0.3);
}

.dark-popper {
  background: rgba(7, 14, 28, 0.98) !important;
  border: 1px solid rgba(121, 167, 255, 0.18) !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6) !important;
}

.dark-popper .el-popper__arrow::before {
  background: rgba(7, 14, 28, 0.98) !important;
  border-color: rgba(121, 167, 255, 0.18) !important;
}

.dark-popper .el-select-dropdown {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.dark-popper .el-select-dropdown__item {
  color: #d9edff !important;
  font-weight: 600 !important;
  background: transparent !important;
}

.dark-popper .el-select-dropdown__item.hover,
.dark-popper .el-select-dropdown__item:hover,
.dark-popper .el-select-dropdown__item.is-hovering {
  background: rgba(37, 99, 235, 0.2) !important;
  color: #f8fbff !important;
}

.dark-popper .el-select-dropdown__item.is-selected {
  background: rgba(37, 99, 235, 0.1) !important;
}

.dark-popper .el-picker-panel {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.dark-popper .el-date-table th {
  color: #7f92a9 !important;
}

.dark-popper .el-date-table td .el-date-table-cell__text {
  color: #d9edff !important;
}

.dark-popper .el-date-table td.today .el-date-table-cell__text {
  color: #60a5fa !important;
  font-weight: 700 !important;
}

.dark-popper .el-date-table td:not(.available) .el-date-table-cell__text {
  color: #4a5568 !important;
}

.dark-popper .el-date-table td.current:not(.disabled) .el-date-table-cell__text {
  background: rgba(37, 99, 235, 0.3) !important;
  color: #f8fbff !important;
}

.dark-popper .el-year-table td .el-year-table-cell__text,
.dark-popper .el-month-table td .el-month-table-cell__text {
  color: #d9edff !important;
}

.dark-popper .el-year-table td.current:not(.disabled) .el-year-table-cell__text,
.dark-popper .el-month-table td.current:not(.disabled) .el-month-table-cell__text {
  background: rgba(37, 99, 235, 0.3) !important;
  color: #f8fbff !important;
}

.dark-popper .el-date-picker__header-label {
  color: #c9d9eb !important;
}

.dark-popper .el-date-picker__header-label:hover {
  color: #60a5fa !important;
}

.dark-popper .el-date-picker__prev-btn,
.dark-popper .el-date-picker__next-btn {
  color: #7f92a9 !important;
}

.dark-popper .el-date-picker__prev-btn:hover,
.dark-popper .el-date-picker__next-btn:hover {
  color: #f8fbff !important;
}
</style>
