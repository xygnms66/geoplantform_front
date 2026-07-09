<script setup lang="ts">
import { computed, ref } from "vue";
import { ElRow, ElCol, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElDatePicker, ElRadioGroup, ElRadioButton, ElCheckbox, ElTag, ElText } from "element-plus";
import {
  dataAssets,
  dataInbox,
  dataModalities,
  dataScopes,
  dataSources,
  dataStats,
  dataStatuses,
  dataStores,
  dataTabs,
} from "@/lib/aefStudioData";

const taskModalOpen = ref(false);

const licenseOptions = ["Internal", "Public", "Restricted"];
const formatOptions = ["GeoTIFF", "COG", "TIFF / TIF", "GRIB", "Shapefile / SHP", "GeoJSON", "CSV", "Parquet", "GeoParquet", "JSON / JSONL"];
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

const activeTab = ref("数据资产");
const selectedSource = ref("全部数据");

const filteredAssets = computed(() => {
  if (selectedSource.value === "全部数据") return dataAssets;
  return dataAssets.filter((asset) => asset.source === selectedSource.value);
});

function statusClass(status: string) {
  const map: Record<string, string> = {
    已入库: "status-success",
    已发布: "status-success",
    处理中: "status-running",
    待质检: "status-warning",
    待审核: "status-warning",
    异常: "status-danger",
  };
  return map[status] ?? "status-muted";
}
</script>

<template>
  <main class="studio-page">
    <section class="page-title-row">
      <div>
        <div class="title-box">数据中心</div>
        <div class="page-subtitle">
          统一管理遥感数据资产、对象存储、入库审核和数据处理状态。
        </div>
      </div>
      <div class="action-row">
        <button class="primary-btn" @click="taskModalOpen = true">+ 注册数据集</button>
        <button class="secondary-btn">连接对象存储</button>
        <button class="secondary-btn">批量扫描</button>
      </div>
    </section>

    <section class="data-tabs panel">
      <button
        v-for="tab in dataTabs"
        :key="tab"
        :class="{ active: activeTab === tab }"
        type="button"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </section>

    <section class="data-layout">
      <aside class="filter-panel panel">
        <div class="panel-inner">
          <h2 class="panel-title">数据筛选</h2>
          <div class="filter-group">
            <div class="filter-title">数据来源</div>
            <button
              v-for="source in dataSources"
              :key="source"
              type="button"
              :class="['filter-chip', { active: selectedSource === source }]"
              @click="selectedSource = source"
            >
              {{ source }}
            </button>
          </div>
          <div class="filter-group">
            <div class="filter-title">应用范围</div>
            <button v-for="scope in dataScopes" :key="scope" type="button" class="filter-chip small">{{ scope }}</button>
          </div>
          <div class="filter-group">
            <div class="filter-title">模态</div>
            <button v-for="modality in dataModalities" :key="modality" type="button" class="filter-chip small">{{ modality }}</button>
          </div>
          <div class="filter-group">
            <div class="filter-title">状态</div>
            <button v-for="status in dataStatuses" :key="status" type="button" class="filter-chip small">{{ status }}</button>
          </div>
        </div>
      </aside>

      <section class="data-main">
        <section class="summary-grid">
          <article v-for="item in dataStats" :key="item.label" class="summary-card panel">
            <div class="summary-value">{{ item.value }}</div>
            <div class="summary-label">{{ item.label }}</div>
            <div class="summary-desc">{{ item.desc }}</div>
          </article>
        </section>

        <section class="panel asset-panel">
          <div class="panel-inner">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">数据资产</h2>
                <p class="panel-desc">突出 Owner、标签、质量状态、存储路径和处理入口。</p>
              </div>
              <div class="asset-tools">
                <input class="asset-search" placeholder="搜索 Sentinel / Landsat / DEM / embedding" />
                <button class="secondary-btn compact">列表</button>
                <button class="secondary-btn compact">卡片</button>
              </div>
            </div>

            <div class="asset-grid">
              <article v-for="asset in filteredAssets" :key="asset.name" class="asset-card">
                <div class="asset-top">
                  <div class="asset-cube">DS</div>
                  <div class="asset-title-block">
                    <div class="asset-title">{{ asset.name }}</div>
                    <div class="asset-subtitle">{{ asset.source }} / {{ asset.size }} / {{ asset.count }}</div>
                  </div>
                  <span class="status-pill" :class="statusClass(asset.status)">{{ asset.status }}</span>
                </div>

                <p class="asset-desc">{{ asset.desc }}</p>

                <div class="meta-grid">
                  <div><span>空间范围</span><b>{{ asset.region }}</b></div>
                  <div><span>时间范围</span><b>{{ asset.time }}</b></div>
                  <div><span>分辨率</span><b>{{ asset.resolution }}</b></div>
                  <div><span>Owner</span><b>{{ asset.owner }}</b></div>
                </div>

                <div class="tag-line">
                  <span v-for="tag in asset.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>

                <div class="storage-path">{{ asset.path }}</div>

                <div class="asset-actions">
                  <button class="small-btn">详情</button>
                  <button class="small-btn">复制路径</button>
                  <button class="small-btn">触发处理</button>
                  <button class="ghost-mini">血缘</button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="bottom-grid">
          <section class="panel">
            <div class="panel-inner">
              <div class="panel-header">
                <div>
                  <h2 class="panel-title">对象存储</h2>
                  <p class="panel-desc">S3 / MinIO / NAS 接入资源，可继续扩展 Bucket 浏览。</p>
                </div>
                <button class="text-btn">全部存储</button>
              </div>
              <div class="storage-table">
                <div class="storage-row table-head">
                  <span>名称</span><span>类型</span><span>容量</span><span>状态</span><span>Endpoint</span><span>操作</span>
                </div>
                <div v-for="store in dataStores" :key="store.name" class="storage-row">
                  <span class="store-name">{{ store.name }}</span>
                  <span>{{ store.type }}</span>
                  <span>{{ store.capacity }}</span>
                  <span><i class="status-pill status-success">运行中</i></span>
                  <span class="endpoint">{{ store.endpoint }}</span>
                  <span><button class="small-btn">Bucket</button></span>
                </div>
              </div>
            </div>
          </section>

          <section class="panel">
            <div class="panel-inner">
              <div class="panel-header compact">
                <div>
                  <h2 class="panel-title">待入库审核</h2>
                  <p class="panel-desc">论文、数据源和外部文件的入库队列。</p>
                </div>
              </div>
              <div class="inbox-list">
                <article v-for="item in dataInbox" :key="item.name" class="inbox-card">
                  <div>
                    <div class="inbox-title">{{ item.name }}</div>
                    <div class="inbox-meta">{{ item.source }} / 提交：{{ item.submitter }}</div>
                  </div>
                  <div class="inbox-actions">
                    <button class="small-btn">入库</button>
                    <button class="reject-btn">驳回</button>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </section>
      </section>
    </section>
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
                  <el-date-picker v-model="form.begin_time" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%" popper-class="dark-popper" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="结束时间">
                  <el-date-picker v-model="form.end_time" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%" popper-class="dark-popper" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="分辨率">
                  <div style="display:flex;gap:0;width:100%">
                    <el-input v-model="form.resolution" placeholder="数值" style="flex:1;border-top-right-radius:0;border-bottom-right-radius:0" />
                    <el-select v-model="form.resolution_unit" style="width:110px" popper-class="dark-popper">
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
                    style="width:100%"
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
                    style="width:100%"
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
                style="width:100%"
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
                style="width:100%"
                popper-class="dark-popper"
                clearable
              >
                <el-option v-for="item in modalityOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>

            <el-form-item label="存储状态">
              <el-radio-group v-model="form.storage_status" class="storage-toggle">
                <el-radio-button value="local">
                  <svg class="radio-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  本地存储
                </el-radio-button>
                <el-radio-button value="web">
                  <svg class="radio-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  网站链接
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="form.storage_status" :label="form.storage_status === 'local' ? '存储路径' : '网站地址'">
              <el-input v-model="form.storage_path" :placeholder="form.storage_status === 'local' ? '/mnt_llm_A100_V1/datasets/...' : 'https://...'" clearable />
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

.action-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn,
.small-btn,
.ghost-mini,
.reject-btn,
.filter-chip,
.data-tabs button {
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

.secondary-btn.compact {
  height: 38px;
}

.small-btn,
.ghost-mini,
.reject-btn {
  height: 30px;
  padding: 0 10px;
  border-radius: 9px;
  color: #dff5ff;
  background: rgba(56, 189, 248, 0.14);
}

.ghost-mini {
  color: #cfe8ff;
  background: rgba(121, 167, 255, 0.14);
}

.reject-btn {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.14);
}

.text-btn {
  padding: 0;
  color: #67e8f9;
  background: transparent;
  border: 0;
  cursor: pointer;
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

.panel-desc,
.summary-desc,
.asset-subtitle,
.asset-desc,
.inbox-meta {
  color: var(--muted);
}

.data-tabs {
  display: flex;
  gap: 8px;
  padding: 8px;
  width: fit-content;
}

.data-tabs button {
  height: 38px;
  padding: 0 16px;
  border-radius: 12px;
  color: var(--muted);
  background: transparent;
  font-weight: 850;
}

.data-tabs button.active {
  color: #fff;
  background: rgba(59, 130, 246, 0.72);
}

.data-layout {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 20px;
}

.filter-panel {
  align-self: start;
  position: sticky;
  top: 78px;
}

.filter-group {
  margin-top: 24px;
}

.filter-title {
  margin-bottom: 10px;
  color: #c9d9eb;
  font-weight: 900;
}

.filter-chip {
  width: 100%;
  min-height: 46px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  margin-bottom: 10px;
  border: 1px solid rgba(121, 167, 255, 0.15);
  border-radius: 14px;
  color: #d9edff;
  text-align: left;
  background: rgba(2, 8, 21, 0.28);
}

.filter-chip.active {
  border-color: rgba(103, 232, 249, 0.42);
  color: #67e8f9;
  background: rgba(59, 130, 246, 0.2);
}

.filter-chip.small {
  width: auto;
  min-height: 34px;
  display: inline-flex;
  margin: 0 8px 8px 0;
  border-radius: 999px;
}

.data-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.summary-card {
  padding: 18px;
}

.summary-value {
  color: #67e8f9;
  font-size: 32px;
  font-weight: 950;
}

.summary-label {
  margin-top: 4px;
  font-weight: 900;
}

.summary-desc {
  margin-top: 4px;
  font-size: 12px;
}

.asset-tools {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.asset-search {
  width: 320px;
  height: 38px;
  padding: 0 13px;
  border: 1px solid rgba(121, 167, 255, 0.18);
  border-radius: 12px;
  color: var(--text);
  outline: 0;
  background: rgba(2, 8, 21, 0.34);
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.asset-card {
  padding: 18px;
  border: 1px solid rgba(121, 167, 255, 0.13);
  border-radius: 20px;
  background: rgba(2, 8, 21, 0.32);
}

.asset-top {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}

.asset-cube {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  color: #67e8f9;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  background: rgba(56, 189, 248, 0.16);
}

.asset-title {
  color: #fff;
  font-size: 18px;
  font-weight: 950;
}

.asset-subtitle {
  margin-top: 5px;
  font-size: 12px;
}

.asset-desc {
  min-height: 68px;
  margin: 16px 0;
  line-height: 1.7;
  font-size: 14px;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(15, 32, 56, 0.48);
}

.meta-grid span {
  display: block;
  margin-bottom: 4px;
  color: #94a8bf;
  font-size: 12px;
}

.meta-grid b {
  color: #dff5ff;
  font-size: 13px;
}

.tag-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.tag,
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  white-space: nowrap;
}

.tag {
  min-height: 26px;
  padding: 0 10px;
  border: 1px solid rgba(125, 211, 252, 0.18);
  color: #c7e9ff;
  background: rgba(30, 64, 175, 0.2);
  font-size: 12px;
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

.storage-path {
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px dashed rgba(121, 167, 255, 0.18);
  border-radius: 12px;
  color: #95a9c0;
  font-family: Consolas, "SFMono-Regular", monospace;
  font-size: 12px;
  background: rgba(2, 8, 21, 0.35);
}

.asset-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(350px, 0.8fr);
  gap: 20px;
}

.storage-table {
  overflow: hidden;
  border: 1px solid rgba(121, 167, 255, 0.12);
  border-radius: 16px;
}

.storage-row {
  min-height: 54px;
  display: grid;
  grid-template-columns: 1fr 0.7fr 0.85fr 0.8fr 1.4fr 0.65fr;
  gap: 12px;
  align-items: center;
  padding: 0 14px;
  border-bottom: 1px solid rgba(121, 167, 255, 0.1);
  color: #c9d9eb;
  font-size: 13px;
}

.storage-row:last-child {
  border-bottom: 0;
}

.table-head {
  color: var(--muted);
  background: rgba(2, 8, 21, 0.44);
  font-weight: 900;
}

.store-name {
  color: #fff;
  font-weight: 900;
}

.endpoint {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inbox-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inbox-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 13px;
  border: 1px solid rgba(121, 167, 255, 0.12);
  border-radius: 16px;
  background: rgba(2, 8, 21, 0.32);
}

.inbox-title {
  color: #fff;
  font-weight: 900;
}

.inbox-meta {
  margin-top: 5px;
  font-size: 12px;
}

.inbox-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 1280px) {
  .data-layout {
    grid-template-columns: 1fr;
  }

  .filter-panel {
    position: static;
  }

  .summary-grid,
  .asset-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .page-title-row {
    flex-direction: column;
  }

  .data-tabs {
    width: 100%;
    overflow-x: auto;
  }

  .asset-search {
    width: 100%;
  }

  .meta-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .inbox-card {
    flex-direction: column;
    align-items: flex-start;
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
  background: rgba(2, 8, 21, 0.3) !important;
  border-radius: 999px !important;
  color: #c7e9ff !important;
  font-weight: 700;
}

.dark-form .el-radio-group.storage-toggle .el-radio-button:not(.is-active) .el-radio-button__inner:hover {
  background: rgba(59, 130, 246, 0.12) !important;
  border-color: rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px);
}

.dark-form .el-radio-group.storage-toggle .el-radio-button.is-active .el-radio-button__inner {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(59, 130, 246, 0.15)) !important;
  border-color: #3b82f6 !important;
  box-shadow: 0 0 24px rgba(59, 130, 246, 0.18), 0 0 0 1px rgba(59, 130, 246, 0.35) !important;
  --el-radio-button-checked-bg-color: transparent;
  --el-radio-button-checked-border-color: #3b82f6;
  --el-radio-button-checked-text-color: #fff;
}

.dark-popper .el-select-dropdown__item.is-selected .el-select-dropdown__option-icon {
  color: #4ade80 !important;
}
.dark-popper .el-select-dropdown__item.is-selected .el-select-dropdown__option-icon svg {
  stroke: #4ade80 !important;
  fill: none !important;
  filter: drop-shadow(0 0 4px rgba(74, 222, 128, 0.5));
}

.dark-form .el-radio-group.storage-toggle .radio-icon {
  opacity: 0.7;
  flex-shrink: 0;
}

.dark-form .el-radio-group.storage-toggle .el-radio-button.is-active .radio-icon {
  opacity: 1;
}
</style>
