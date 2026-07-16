<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import {
  ElButton,
  ElDatePicker,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElSelect,
} from "element-plus";

import {
  deleteDataset,
  getDatasets,
  transferDataset,
  updateDataset,
  type DatasetRow,
} from "@/lib/dataCenterApi";
import { getUsers, type UserListItem } from "@/lib/auth";

type StatusConfig = {
  value: string;
  label: string;
  color: "gray" | "blue" | "red" | "amber" | "green" | "slate";
};

// 与后端 DATASET_STATUS_OPTIONS 对齐的 value → label / 颜色配置
const STATUS_OPTIONS: StatusConfig[] = [
  { value: "draft", label: "未处理", color: "gray" },
  { value: "checking", label: "处理中", color: "blue" },
  { value: "check_failed", label: "处理异常", color: "red" },
  { value: "pending_acceptance", label: "等待验收", color: "amber" },
  { value: "available", label: "可用", color: "green" },
  { value: "rejected", label: "验收未通过", color: "red" },
  { value: "archived", label: "已归档", color: "slate" },
];

const STATUS_MAP = new Map(STATUS_OPTIONS.map((item) => [item.value, item]));

const datasets = ref<DatasetRow[]>([]);
const loading = ref(false);
const loadError = ref("");
const deletingId = ref<number | null>(null);

function statusLabel(row: DatasetRow): string {
  return row.status_label || STATUS_MAP.get(row.status)?.label || row.status || "-";
}

function statusColor(row: DatasetRow): string {
  return STATUS_MAP.get(row.status)?.color || "slate";
}

function timeRangeText(row: DatasetRow): string {
  const start = row.time_start || "";
  const end = row.time_end || "";
  if (start && end) return `${start} ~ ${end}`;
  if (start) return `${start} 起`;
  if (end) return `截至 ${end}`;
  return "-";
}

async function loadDatasets() {
  loading.value = true;
  loadError.value = "";
  try {
    datasets.value = await getDatasets();
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : "加载数据集失败";
    datasets.value = [];
  } finally {
    loading.value = false;
  }
}

// ---------- 编辑 ----------
const editVisible = ref(false);
const editSubmitting = ref(false);
const editError = ref("");
const editForm = reactive({
  id: 0,
  name: "",
  region: "",
  time_start: "",
  time_end: "",
  status: "",
});

function openEdit(row: DatasetRow) {
  editForm.id = row.id;
  editForm.name = row.name;
  editForm.region = row.region ?? "";
  editForm.time_start = row.time_start ?? "";
  editForm.time_end = row.time_end ?? "";
  editForm.status = row.status;
  editError.value = "";
  editVisible.value = true;
}

async function submitEdit() {
  if (editForm.time_start && editForm.time_end && editForm.time_start > editForm.time_end) {
    editError.value = "开始时间不能晚于结束时间";
    return;
  }
  editSubmitting.value = true;
  editError.value = "";
  try {
    const updated = await updateDataset(editForm.id, {
      region: editForm.region.trim() || null,
      time_start: editForm.time_start || null,
      time_end: editForm.time_end || null,
      status: editForm.status,
    });
    const idx = datasets.value.findIndex((item) => item.id === updated.id);
    if (idx !== -1) datasets.value[idx] = updated;
    ElMessage.success("已保存");
    editVisible.value = false;
  } catch (error) {
    editError.value = error instanceof Error ? error.message : "保存失败";
  } finally {
    editSubmitting.value = false;
  }
}

// ---------- 删除 ----------
async function handleDelete(row: DatasetRow) {
  try {
    await ElMessageBox.confirm(`确定删除数据集「${row.name}」吗？`, "删除确认", {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    });
  } catch {
    return;
  }

  deletingId.value = row.id;
  try {
    await deleteDataset(row.id);
    datasets.value = datasets.value.filter((item) => item.id !== row.id);
    ElMessage.success("已删除");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "删除失败");
  } finally {
    deletingId.value = null;
  }
}

// ---------- 转移资产 ----------
const transferVisible = ref(false);
const transferSubmitting = ref(false);
const transferError = ref("");
const userOptions = ref<UserListItem[]>([]);
const transferForm = reactive({
  id: 0,
  name: "",
  new_owner_employee_no: "",
});

async function openTransfer(row: DatasetRow) {
  transferForm.id = row.id;
  transferForm.name = row.name;
  transferForm.new_owner_employee_no = "";
  transferError.value = "";
  transferVisible.value = true;
  if (userOptions.value.length === 0) {
    try {
      userOptions.value = await getUsers();
    } catch {
      userOptions.value = [];
    }
  }
}

async function submitTransfer() {
  if (!transferForm.new_owner_employee_no) {
    transferError.value = "请选择新的负责人";
    return;
  }
  transferSubmitting.value = true;
  transferError.value = "";
  try {
    await transferDataset(transferForm.id, transferForm.new_owner_employee_no);
    // 转移后该数据集不再属于当前用户，从列表移除
    datasets.value = datasets.value.filter((item) => item.id !== transferForm.id);
    ElMessage.success("已转移数据资产");
    transferVisible.value = false;
  } catch (error) {
    transferError.value = error instanceof Error ? error.message : "转移失败";
  } finally {
    transferSubmitting.value = false;
  }
}

onMounted(() => {
  void loadDatasets();
});
</script>

<template>
  <section class="panel">
    <div class="panel-inner">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">数据管理</h2>
          <p class="panel-desc">管理当前用户拥有的数据集实例。</p>
        </div>
        <button class="text-btn" type="button" :disabled="loading" @click="loadDatasets">
          {{ loading ? "刷新中…" : "刷新" }}
        </button>
      </div>

      <p v-if="loadError" class="hint error">{{ loadError }}</p>

      <div class="table">
        <div class="row table-head">
          <span>名称</span>
          <span>所属产品</span>
          <span>空间范围</span>
          <span>时间范围</span>
          <span>当前状态</span>
          <span class="ops-col">操作</span>
        </div>

        <div v-if="loading && datasets.length === 0" class="row empty-row">加载中…</div>
        <div v-else-if="!loading && datasets.length === 0" class="row empty-row">暂无数据集</div>

        <div v-for="dataset in datasets" :key="dataset.id" class="row">
          <span class="name" :title="dataset.name">{{ dataset.name }}</span>
          <span :title="dataset.product_name || ''">{{ dataset.product_name || "-" }}</span>
          <span :title="dataset.region || ''">{{ dataset.region || "-" }}</span>
          <span>{{ timeRangeText(dataset) }}</span>
          <span>
            <span class="status-badge" :class="`status-${statusColor(dataset)}`">
              {{ statusLabel(dataset) }}
            </span>
          </span>
          <span class="ops-col">
            <button class="op-btn" type="button" @click="openEdit(dataset)">编辑</button>
            <button class="op-btn" type="button" @click="openTransfer(dataset)">转移资产</button>
            <button
              class="op-btn danger"
              type="button"
              :disabled="deletingId === dataset.id"
              @click="handleDelete(dataset)"
            >
              {{ deletingId === dataset.id ? "删除中…" : "🗑 删除" }}
            </button>
          </span>
        </div>
      </div>
    </div>

    <ElDialog
      v-model="editVisible"
      title="编辑数据集"
      width="480px"
      append-to-body
      class="dataset-manage-dialog"
    >
      <p class="dialog-subtitle">{{ editForm.name }}</p>
      <p v-if="editError" class="dialog-error">{{ editError }}</p>
      <ElForm label-position="top" class="dark-form">
        <ElFormItem label="空间范围">
          <ElInput
            v-model="editForm.region"
            type="textarea"
            :rows="3"
            placeholder="例如：浙江省杭州市，或填写区域描述"
          />
        </ElFormItem>
        <div class="date-row">
          <ElFormItem label="开始时间">
            <ElDatePicker
              v-model="editForm.time_start"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </ElFormItem>
          <ElFormItem label="结束时间">
            <ElDatePicker
              v-model="editForm.time_end"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </ElFormItem>
        </div>
        <ElFormItem label="当前状态">
          <ElSelect v-model="editForm.status" placeholder="请选择状态" style="width: 100%">
            <ElOption
              v-for="opt in STATUS_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="editVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="editSubmitting" @click="submitEdit">保存</ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="transferVisible"
      title="转移数据资产"
      width="420px"
      append-to-body
      class="dataset-manage-dialog"
    >
      <p class="dialog-subtitle">将「{{ transferForm.name }}」的所有权转移给其他用户。</p>
      <p v-if="transferError" class="dialog-error">{{ transferError }}</p>
      <ElForm label-position="top" class="dark-form">
        <ElFormItem label="新的负责人">
          <ElSelect
            v-model="transferForm.new_owner_employee_no"
            filterable
            placeholder="请选择用户"
            style="width: 100%"
          >
            <ElOption
              v-for="user in userOptions"
              :key="user.employee_no"
              :label="`${user.name || user.employee_no}（${user.employee_no}）`"
              :value="user.employee_no"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="transferVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="transferSubmitting" @click="submitTransfer">
          确认转移
        </ElButton>
      </template>
    </ElDialog>
  </section>
</template>

<style scoped>
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

.panel-title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
}

.panel-desc {
  color: var(--muted);
}

.text-btn {
  padding: 0;
  color: #67e8f9;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-weight: 800;
}

.text-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint {
  margin: 0 0 12px;
  color: #93c5fd;
  font-size: 13px;
}

.hint.error {
  color: #fca5a5;
}

.table {
  overflow: hidden;
  border: 1px solid rgba(121, 167, 255, 0.12);
  border-radius: 16px;
}

.row {
  min-height: 50px;
  display: grid;
  grid-template-columns: 1.6fr 1.1fr 1.1fr 1.2fr 0.9fr 1.4fr;
  gap: 12px;
  align-items: center;
  padding: 0 14px;
  border-bottom: 1px solid rgba(121, 167, 255, 0.1);
  color: #c9d9eb;
  font-size: 13px;
}

.row:last-child {
  border-bottom: 0;
}

.row > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-row {
  color: var(--muted);
}

.table-head {
  color: var(--muted);
  background: rgba(2, 8, 21, 0.44);
  font-weight: 900;
}

.name {
  color: #fff;
  font-weight: 800;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid transparent;
  line-height: 1.4;
}

.status-green {
  color: #6ee7b7;
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(16, 185, 129, 0.45);
}

.status-blue {
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.14);
  border-color: rgba(59, 130, 246, 0.45);
}

.status-amber {
  color: #fcd34d;
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.45);
}

.status-red {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.14);
  border-color: rgba(239, 68, 68, 0.45);
}

.status-gray {
  color: #cbd5e1;
  background: rgba(148, 163, 184, 0.14);
  border-color: rgba(148, 163, 184, 0.4);
}

.status-slate {
  color: #94a3b8;
  background: rgba(71, 85, 105, 0.2);
  border-color: rgba(100, 116, 139, 0.45);
}

.ops-col {
  display: flex;
  gap: 8px;
  overflow: visible;
}

.op-btn {
  height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 9px;
  color: #dff5ff;
  background: rgba(56, 189, 248, 0.14);
  cursor: pointer;
  font-weight: 700;
  white-space: nowrap;
}

.op-btn:hover {
  background: rgba(56, 189, 248, 0.24);
}

.op-btn.danger {
  color: #fecaca;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(220, 38, 38, 0.12));
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.op-btn.danger:hover {
  color: #fff;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.45), rgba(220, 38, 38, 0.3));
  border-color: rgba(239, 68, 68, 0.45);
}

.op-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dialog-subtitle {
  margin: 0 0 12px;
  color: #93c5fd;
  font-size: 13px;
}

.dialog-error {
  margin: 0 0 12px;
  padding: 8px 10px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
  font-size: 13px;
}

.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 960px) {
  .row {
    grid-template-columns: 1fr;
    padding: 12px 14px;
  }
}
</style>

<style>
/* ElDialog 深色主题 - 编辑数据集 & 转移资产 */
.dataset-manage-dialog {
  --el-dialog-bg-color: rgba(11, 20, 38, 0.98) !important;
  --el-dialog-title-font-size: 20px;
  --el-dialog-content-font-size: 14px;
}

.dataset-manage-dialog .el-dialog {
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 28px;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(14px);
}

.dataset-manage-dialog .el-dialog__header {
  padding: 24px 28px 0;
  border-bottom: 0;
}

.dataset-manage-dialog .el-dialog__title {
  color: #f8fbff;
  font-weight: 900;
}

.dataset-manage-dialog .el-dialog__headerbtn {
  top: 24px;
  right: 28px;
}

.dataset-manage-dialog .el-dialog__headerbtn .el-dialog__close {
  color: #94a3b8;
  font-size: 18px;
}

.dataset-manage-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: #fca5a5;
}

.dataset-manage-dialog .el-dialog__body {
  padding: 20px 28px;
  color: #d9edff;
}

.dataset-manage-dialog .el-dialog__footer {
  padding: 0 28px 24px;
  border-top: 0;
}

/* dark-form inside dialog */
.dataset-manage-dialog .dark-form {
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

.dataset-manage-dialog .dark-form .el-form-item__label {
  color: #c9d9eb;
  font-weight: 800;
  font-size: 13px;
  padding-bottom: 4px;
}

.dataset-manage-dialog .dark-form .el-input__wrapper,
.dataset-manage-dialog .dark-form .el-select .el-input__wrapper,
.dataset-manage-dialog .dark-form .el-select__wrapper {
  background: rgba(2, 8, 21, 0.4) !important;
  border: 1px solid rgba(121, 167, 255, 0.18);
  border-radius: 12px;
  box-shadow: none !important;
}

.dataset-manage-dialog .dark-form .el-input__wrapper.is-focus,
.dataset-manage-dialog .dark-form .el-select .el-input__wrapper.is-focus,
.dataset-manage-dialog .dark-form .el-select__wrapper.is-focused,
.dataset-manage-dialog .dark-form .el-select__wrapper:hover {
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
}

.dataset-manage-dialog .dark-form .el-input__inner,
.dataset-manage-dialog .dark-form .el-select__selected-item,
.dataset-manage-dialog .dark-form .el-select__placeholder,
.dataset-manage-dialog .dark-form .el-select__tags-text,
.dataset-manage-dialog .dark-form .el-select__input-wrapper,
.dataset-manage-dialog .dark-form .el-select__caret {
  color: #f8fbff !important;
}

.dataset-manage-dialog .dark-form .el-select__placeholder.is-transparent {
  color: #7f92a9 !important;
}

.dataset-manage-dialog .dark-form .el-textarea__inner {
  background: rgba(2, 8, 21, 0.4) !important;
  border: 1px solid rgba(121, 167, 255, 0.18);
  border-radius: 12px;
  color: #f8fbff !important;
  box-shadow: none !important;
}

.dataset-manage-dialog .dark-form .el-textarea__inner:focus {
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
}

.dataset-manage-dialog .dark-form .el-select__wrapper {
  min-height: 42px;
  padding: 1px 11px;
}

.dataset-manage-dialog .el-picker-panel,
.dataset-manage-dialog .el-date-picker__header,
.dataset-manage-dialog .el-date-table th {
  background: rgba(7, 14, 28, 0.98) !important;
  color: #d9edff !important;
  border-color: rgba(121, 167, 255, 0.18) !important;
}

.dataset-manage-dialog .el-date-table td .el-date-table-cell__text {
  color: #d9edff !important;
}

.dataset-manage-dialog .el-date-table td.current:not(.disabled) .el-date-table-cell__text {
  background: #3b82f6 !important;
  color: #fff !important;
  border-radius: 50%;
}

.dataset-manage-dialog .el-date-table td:not(.disabled):hover .el-date-table-cell__text {
  background: rgba(59, 130, 246, 0.25) !important;
  border-radius: 50%;
}
</style>
