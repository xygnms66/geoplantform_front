<script setup lang="ts">
import { nextTick, ref } from "vue"
import {
  ElButton,
  ElCol,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElRadioButton,
  ElRadioGroup,
  ElRow,
  ElSelect,
} from "element-plus"

import { createDataset, getDataCenterFilters, getDataProducts } from "@/lib/dataCenterApi"
import type { DataProduct, FilterOption } from "@/types"

interface DatasetForm {
  display_name: string
  product_id: number | null
  region: string
  time_start: string
  time_end: string
  sample_count: string
  status: number
  storage_location_type: number
  storage_path: string
  source_url: string
  agent_summary: string
}

const emit = defineEmits<{
  saved: []
}>()

const dialogVisible = ref(false)
const optionLoading = ref(false)
const submitting = ref(false)
const submitError = ref("")

const products = ref<DataProduct[]>([])
const statusOptions = ref<FilterOption[]>([])

const datasetForm = ref<DatasetForm>(createEmptyDatasetForm())

function createEmptyDatasetForm(): DatasetForm {
  return {
    display_name: "",
    product_id: null,
    region: "",
    time_start: "",
    time_end: "",
    sample_count: "",
    status: 3,
    storage_location_type: 1,
    storage_path: "",
    source_url: "",
    agent_summary: "",
  }
}

async function loadReferenceOptions() {
  optionLoading.value = true

  try {
    const [productList, filterGroups] = await Promise.all([
      getDataProducts(),
      getDataCenterFilters(),
    ])
    products.value = productList
    statusOptions.value = filterGroups.find((group) => group.key === "status")?.items ?? []
  } catch (error) {
    console.error("加载数据集表单选项失败：", error)
  } finally {
    optionLoading.value = false
  }
}

function resetDatasetForm() {
  datasetForm.value = createEmptyDatasetForm()
  submitError.value = ""
}

function closeDialog() {
  dialogVisible.value = false
}

async function openCreateDialog() {
  resetDatasetForm()
  dialogVisible.value = true

  if (products.value.length === 0 || statusOptions.value.length === 0) {
    await loadReferenceOptions()
  }

  await nextTick()
}

async function submitDataset() {
  if (!datasetForm.value.display_name.trim()) {
    submitError.value = "请填写数据集名称"
    return
  }

  submitting.value = true
  submitError.value = ""

  try {
    const sampleCount = datasetForm.value.sample_count
      ? Number(datasetForm.value.sample_count)
      : null

    await createDataset({
      display_name: datasetForm.value.display_name.trim(),
      product_id: datasetForm.value.product_id,
      region: datasetForm.value.region || null,
      time_start: datasetForm.value.time_start || null,
      time_end: datasetForm.value.time_end || null,
      sample_count: Number.isFinite(sampleCount) ? sampleCount : null,
      status: datasetForm.value.status,
      storage_location_type: datasetForm.value.storage_location_type,
      storage_path:
        datasetForm.value.storage_location_type === 1
          ? datasetForm.value.storage_path || null
          : null,
      source_url:
        datasetForm.value.storage_location_type === 2
          ? datasetForm.value.source_url || null
          : null,
      agent_summary: datasetForm.value.agent_summary || null,
    })

    dialogVisible.value = false
    emit("saved")
    resetDatasetForm()
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : "创建数据集失败"
  } finally {
    submitting.value = false
  }
}

defineExpose({
  openCreateDialog,
})
</script>

<template>
  <div v-if="dialogVisible" class="modal-mask" @click.self="closeDialog">
    <div class="modal-panel dataset-form-panel">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">新建数据集</h2>
          <p class="modal-desc">创建数据集实例并挂载到数据产品，对应 POST /api/datasets。</p>
        </div>
        <button type="button" class="modal-close" @click="closeDialog">✕</button>
      </div>

      <div
        v-loading="optionLoading"
        class="modal-body"
        element-loading-text="正在加载基础选项..."
      >
        <p v-if="submitError" class="modal-error">{{ submitError }}</p>

        <el-form label-position="top" size="default" class="dark-form">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="数据集名称" required>
                <el-input
                  v-model="datasetForm.display_name"
                  placeholder="例如：浙江省 2025 S2"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="关联数据产品">
                <el-select
                  v-model="datasetForm.product_id"
                  clearable
                  filterable
                  placeholder="可选"
                  style="width: 100%"
                  popper-class="dark-popper"
                >
                  <el-option
                    v-for="product in products"
                    :key="product.id"
                    :label="product.name"
                    :value="product.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="区域">
                <el-input v-model="datasetForm.region" placeholder="例如：浙江省" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="样本量">
                <el-input
                  v-model="datasetForm.sample_count"
                  type="number"
                  placeholder="例如：120000"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="开始时间">
                <el-date-picker
                  v-model="datasetForm.time_start"
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
                  v-model="datasetForm.time_end"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  popper-class="dark-popper"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="状态">
            <el-select
              v-model="datasetForm.status"
              style="width: 100%"
              popper-class="dark-popper"
            >
              <el-option
                v-for="item in statusOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="存储类型">
            <el-radio-group v-model="datasetForm.storage_location_type" class="storage-toggle">
              <el-radio-button :value="1">本地存储</el-radio-button>
              <el-radio-button :value="2">网站链接</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="datasetForm.storage_location_type === 1" label="存储路径">
            <el-input
              v-model="datasetForm.storage_path"
              placeholder="/mnt_llm_A100_V1/datasets/..."
              clearable
            />
          </el-form-item>

          <el-form-item v-else label="网站地址">
            <el-input v-model="datasetForm.source_url" placeholder="https://..." clearable />
          </el-form-item>

          <el-form-item label="Agent 摘要">
            <el-input
              v-model="datasetForm.agent_summary"
              type="textarea"
              :rows="2"
              placeholder="可选"
            />
          </el-form-item>
        </el-form>
      </div>

      <div class="modal-footer dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitDataset">
          {{ submitting ? "提交中..." : "提交" }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.modal-error {
  margin: 0 0 16px;
  padding: 10px 12px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
  font-size: 14px;
}

.modal-footer {
  padding: 0 28px 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dark-form :deep(.el-radio-group.storage-toggle) {
  display: flex;
  gap: 12px;
}

.dark-form :deep(.el-radio-group.storage-toggle .el-radio-button__inner) {
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

.dark-form :deep(.el-radio-group.storage-toggle .el-radio-button:not(.is-active) .el-radio-button__inner:hover) {
  background: rgba(59, 130, 246, 0.12) !important;
  border-color: rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px);
}

.dark-form :deep(.el-radio-group.storage-toggle .el-radio-button.is-active .el-radio-button__inner) {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(59, 130, 246, 0.15)) !important;
  border-color: #3b82f6 !important;
  box-shadow:
    0 0 24px rgba(59, 130, 246, 0.18),
    0 0 0 1px rgba(59, 130, 246, 0.35) !important;
}
</style>

<style>
.dataset-form-panel .dark-form {
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

.dataset-form-panel .dark-form .el-form-item__label {
  color: #c9d9eb;
  font-weight: 800;
  font-size: 13px;
  padding-bottom: 4px;
}

.dataset-form-panel .dark-form .el-input__wrapper,
.dataset-form-panel .dark-form .el-select .el-input__wrapper,
.dataset-form-panel .dark-form .el-select__wrapper {
  background: rgba(2, 8, 21, 0.4) !important;
  border: 1px solid rgba(121, 167, 255, 0.18);
  border-radius: 12px;
  box-shadow: none !important;
}

.dataset-form-panel .dark-form .el-input__wrapper.is-focus,
.dataset-form-panel .dark-form .el-select .el-input__wrapper.is-focus,
.dataset-form-panel .dark-form .el-select__wrapper.is-focused,
.dataset-form-panel .dark-form .el-select__wrapper:hover {
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
}

.dataset-form-panel .dark-form .el-input__inner,
.dataset-form-panel .dark-form .el-select__selected-item,
.dataset-form-panel .dark-form .el-select__placeholder,
.dataset-form-panel .dark-form .el-select__tags-text,
.dataset-form-panel .dark-form .el-select__input-wrapper,
.dataset-form-panel .dark-form .el-select__caret {
  color: #f8fbff !important;
}

.dataset-form-panel .dark-form .el-select__placeholder.is-transparent {
  color: #7f92a9 !important;
}

.dataset-form-panel .dark-form .el-textarea__inner {
  background: rgba(2, 8, 21, 0.4) !important;
  border: 1px solid rgba(121, 167, 255, 0.18);
  border-radius: 12px;
  color: #f8fbff !important;
  box-shadow: none !important;
}

.dataset-form-panel .dark-form .el-textarea__inner:focus {
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
}

.dataset-form-panel .dark-form .el-select__wrapper {
  min-height: 42px;
  padding: 1px 11px;
}

.dataset-form-panel .dark-form .el-date-editor {
  --el-date-editor-width: 100%;
}

.dark-popper .el-select-dropdown__item.is-selected .el-select-dropdown__option-icon {
  color: #4ade80 !important;
}
</style>
