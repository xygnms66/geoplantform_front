<script setup lang="ts">
import { computed, nextTick, reactive, ref } from "vue"
import {
  ElButton,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElRadioButton,
  ElRadioGroup,
  ElSelect,
} from "element-plus"

import DataProductFormDialog from "@/components/studio/plugins/data/dialogs/DataProductFormDialog.vue"
import { createDataset, getDataProducts, getStorageBuckets } from "@/lib/dataCenterApi"
import type { DataProduct, DatasetCreate, StorageBucket } from "@/types"

interface DatasetForm {
  product_id: number | null
  region: string
  time_start: string
  time_end: string
  storage_type: "local" | "web"
  bucket_id: number | null
  object_prefix: string
  source_url: string
}

const emit = defineEmits<{
  saved: []
}>()

const dialogVisible = ref(false)
const optionLoading = ref(false)
const submitting = ref(false)
const submitError = ref("")

const productOptions = ref<DataProduct[]>([])
const bucketOptions = ref<StorageBucket[]>([])
const selectedProduct = ref<DataProduct | null>(null)
const productFormDialogRef = ref<InstanceType<typeof DataProductFormDialog> | null>(null)

const form = reactive<DatasetForm>({
  product_id: null,
  region: "",
  time_start: "",
  time_end: "",
  storage_type: "local",
  bucket_id: null,
  object_prefix: "",
  source_url: "",
})

const timeError = computed(() => {
  if (form.time_start && form.time_end && form.time_start > form.time_end) {
    return "开始时间不能晚于结束时间"
  }
  return ""
})

const selectedBucket = computed(() =>
  bucketOptions.value.find((item) => item.id === form.bucket_id) ?? null,
)

const mountPrefix = computed(() => {
  const mountPath = selectedBucket.value?.mount_path?.trim()
  if (!mountPath) return ""
  return mountPath.endsWith("/") ? mountPath : `${mountPath}/`
})

const fullLocalPath = computed(() => {
  if (!mountPrefix.value) return form.object_prefix.trim()
  return `${mountPrefix.value}${form.object_prefix.trim().replace(/^\/+/, "")}`
})

const resolutionText = computed(() => {
  if (!selectedProduct.value?.resolution_value) {
    return "-"
  }
  return [selectedProduct.value.resolution_value, selectedProduct.value.resolution_unit]
    .filter(Boolean)
    .join(" ")
})

const storageError = computed(() => {
  if (form.storage_type === "local") {
    if (!form.bucket_id) return "请选择 Bucket"
    if (!selectedBucket.value?.mount_path) return "所选 Bucket 缺少挂载路径"
    return ""
  }
  if (form.storage_type === "web" && !form.source_url.trim()) {
    return "请填写网站地址"
  }
  return ""
})

function resetForm() {
  form.product_id = null
  form.region = ""
  form.time_start = ""
  form.time_end = ""
  form.storage_type = "local"
  form.bucket_id = null
  form.object_prefix = ""
  form.source_url = ""
  selectedProduct.value = null
  submitError.value = ""
}

function closeDialog() {
  dialogVisible.value = false
}

function pickDefaultBucket() {
  if (form.bucket_id && bucketOptions.value.some((item) => item.id === form.bucket_id)) {
    return
  }
  const preferred =
    bucketOptions.value.find((item) => item.is_default && item.is_active) ??
    bucketOptions.value.find((item) => item.is_active) ??
    bucketOptions.value[0] ??
    null
  form.bucket_id = preferred?.id ?? null
}

async function loadOptions() {
  optionLoading.value = true
  try {
    const [products, buckets] = await Promise.all([
      getDataProducts(),
      getStorageBuckets(true),
    ])
    productOptions.value = products
    bucketOptions.value = buckets.filter((item) => item.id > 0)
    if (form.storage_type === "local") {
      pickDefaultBucket()
    }
  } catch (error) {
    console.error("加载入库表单选项失败：", error)
    productOptions.value = []
    bucketOptions.value = []
  } finally {
    optionLoading.value = false
  }
}

function handleProductChange(productId: number | null) {
  form.product_id = productId
  selectedProduct.value =
    productOptions.value.find((item) => item.id === productId) ?? null
}

function handleStorageTypeChange(value: string | number | boolean | undefined) {
  if (value !== "local" && value !== "web") return
  form.storage_type = value
  submitError.value = ""
  if (value === "local") {
    form.source_url = ""
    pickDefaultBucket()
  } else {
    form.bucket_id = null
    form.object_prefix = ""
  }
}

function handleBucketChange(bucketId: number | null) {
  form.bucket_id = bucketId
}

async function openCreateDialog() {
  resetForm()
  dialogVisible.value = true
  await loadOptions()
  await nextTick()
}

function openProductDialog() {
  productFormDialogRef.value?.openCreateDialog()
}

async function handleProductCreated(product?: DataProduct) {
  await loadOptions()
  if (product?.id) {
    handleProductChange(product.id)
  }
}

async function submitDataset() {
  if (!form.product_id) {
    submitError.value = "请选择数据产品"
    return
  }
  if (timeError.value) {
    submitError.value = timeError.value
    return
  }
  if (storageError.value) {
    submitError.value = storageError.value
    return
  }

  submitting.value = true
  submitError.value = ""

  try {
    const payload: DatasetCreate = {
      product_id: form.product_id,
      region: form.region.trim() || null,
      time_start: form.time_start || null,
      time_end: form.time_end || null,
      storage_type: form.storage_type,
      bucket_id: form.storage_type === "local" ? form.bucket_id : null,
      object_prefix:
        form.storage_type === "local"
          ? form.object_prefix.trim().replace(/^\/+/, "") || null
          : null,
      source_url: form.storage_type === "web" ? form.source_url.trim() || null : null,
    }

    await createDataset(payload)
    ElMessage.success("数据集创建成功")
    dialogVisible.value = false
    emit("saved")
    resetForm()
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
          <h2 class="modal-title">数据集入库</h2>
          <p class="modal-desc">选择数据产品，填写数据集覆盖的区域、时间与存储位置。</p>
        </div>
        <button type="button" class="modal-close" @click="closeDialog">✕</button>
      </div>

      <div
        v-loading="optionLoading"
        class="modal-body dataset-create-page"
        element-loading-text="正在加载表单选项..."
      >
        <p v-if="submitError" class="modal-error">{{ submitError }}</p>

        <div class="form-panel">
          <div class="section-header">
            <h3 class="section-title">入库信息</h3>
            <button type="button" class="create-product-button" @click="openProductDialog">
              + 新建数据产品
            </button>
          </div>

          <el-form label-position="top" size="default" class="dark-form" @submit.prevent="submitDataset">
            <el-form-item label="数据产品" required>
              <el-select
                :model-value="form.product_id"
                filterable
                placeholder="请选择数据产品"
                style="width: 100%"
                popper-class="dark-popper"
                @update:model-value="handleProductChange"
              >
                <el-option
                  v-for="product in productOptions"
                  :key="product.id"
                  :label="product.name"
                  :value="product.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="数据区域">
              <el-input
                v-model="form.region"
                type="textarea"
                :rows="3"
                placeholder="例如：浙江省杭州市，或填写 GeoJSON/区域描述"
              />
            </el-form-item>

            <div class="date-row">
              <el-form-item label="开始时间">
                <el-date-picker
                  v-model="form.time_start"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  popper-class="dark-popper"
                />
              </el-form-item>
              <el-form-item label="结束时间">
                <el-date-picker
                  v-model="form.time_end"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  popper-class="dark-popper"
                />
              </el-form-item>
            </div>

            <p v-if="timeError" class="inline-error">{{ timeError }}</p>

            <el-form-item label="存储类型" required>
              <el-radio-group
                :model-value="form.storage_type"
                class="storage-toggle"
                @update:model-value="handleStorageTypeChange"
              >
                <el-radio-button value="local">本地存储</el-radio-button>
                <el-radio-button value="web">网站链接</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <template v-if="form.storage_type === 'local'">
              <el-form-item label="Bucket" required>
                <el-select
                  :model-value="form.bucket_id"
                  filterable
                  placeholder="请选择 Bucket / 存储卷"
                  style="width: 100%"
                  popper-class="dark-popper"
                  @update:model-value="handleBucketChange"
                >
                  <el-option
                    v-for="bucket in bucketOptions"
                    :key="bucket.id"
                    :label="`${bucket.bucket_name}${bucket.mount_path ? `（${bucket.mount_path}）` : ''}`"
                    :value="bucket.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="存储路径" required>
                <div class="path-input">
                  <span v-if="mountPrefix" class="path-prefix" :title="mountPrefix">{{ mountPrefix }}</span>
                  <el-input
                    v-model="form.object_prefix"
                    class="path-suffix"
                    :disabled="!form.bucket_id"
                    placeholder="datasets/public/..."
                    clearable
                  />
                </div>
                <p v-if="form.bucket_id && mountPrefix" class="path-preview">
                  完整路径：{{ fullLocalPath || mountPrefix }}
                </p>
                <p v-else-if="form.bucket_id && !mountPrefix" class="inline-error">
                  所选 Bucket 未配置挂载路径
                </p>
              </el-form-item>
            </template>

            <el-form-item v-else label="网站地址" required>
              <el-input
                v-model="form.source_url"
                placeholder="https://..."
                clearable
              />
            </el-form-item>
          </el-form>
        </div>

        <div class="product-detail-panel">
          <template v-if="selectedProduct">
            <h3 class="detail-title">{{ selectedProduct.name }}</h3>
            <dl class="detail-list">
              <dt>提供方</dt>
              <dd>{{ selectedProduct.provider || "-" }}</dd>
              <dt>平台</dt>
              <dd>{{ selectedProduct.platform || "-" }}</dd>
              <dt>传感器</dt>
              <dd>{{ selectedProduct.sensor || "-" }}</dd>
              <dt>产品级别</dt>
              <dd>{{ selectedProduct.product_level || "-" }}</dd>
              <dt>空间分辨率</dt>
              <dd>{{ resolutionText }}</dd>
              <dt>数据格式</dt>
              <dd>{{ selectedProduct.format || "-" }}</dd>
              <dt>产品描述</dt>
              <dd>{{ selectedProduct.description || "-" }}</dd>
            </dl>
          </template>
          <div v-else class="empty-product">选择数据产品后，此处显示产品信息</div>
        </div>
      </div>

      <div class="modal-footer dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          :disabled="Boolean(timeError) || Boolean(storageError) || !form.product_id"
          @click="submitDataset"
        >
          {{ submitting ? "正在创建..." : "创建数据集" }}
        </el-button>
      </div>
    </div>

    <DataProductFormDialog ref="productFormDialogRef" @saved="handleProductCreated" />
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
  max-width: 980px;
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
  padding: 24px 28px;
}

.dataset-create-page {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 20px;
  align-items: start;
}

.modal-error {
  grid-column: 1 / -1;
  margin: 0;
  padding: 10px 12px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
  font-size: 14px;
}

.form-panel,
.product-detail-panel {
  border: 1px solid rgba(121, 167, 255, 0.14);
  border-radius: 18px;
  background: rgba(2, 8, 21, 0.28);
  padding: 18px;
  min-height: 360px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #e8f4ff;
}

.create-product-button {
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.12);
  color: #9fe8ff;
  font-weight: 800;
  font-size: 13px;
  padding: 6px 12px;
  cursor: pointer;
}

.create-product-button:hover {
  background: rgba(56, 189, 248, 0.2);
}

.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.inline-error {
  margin: -4px 0 0;
  color: #f87171;
  font-size: 13px;
}

.path-input {
  width: 100%;
  display: flex;
  align-items: stretch;
  gap: 0;
  overflow: hidden;
  border: 1px solid rgba(121, 167, 255, 0.18);
  border-radius: 12px;
  background: rgba(2, 8, 21, 0.4);
}

.path-prefix {
  max-width: 46%;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  background: rgba(56, 189, 248, 0.1);
  color: #7dd3fc;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-right: 1px solid rgba(121, 167, 255, 0.18);
}

.path-suffix {
  flex: 1;
  min-width: 0;
}

.path-preview {
  margin: 8px 0 0;
  color: #93c5fd;
  font-size: 12px;
  word-break: break-all;
}

.detail-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 900;
  color: #fff;
}

.detail-list {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 10px 12px;
  margin: 0;
}

.detail-list dt {
  color: #7f92a9;
  font-size: 13px;
  font-weight: 700;
}

.detail-list dd {
  margin: 0;
  color: #d9edff;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

.empty-product {
  height: 100%;
  min-height: 280px;
  display: grid;
  place-items: center;
  color: #7f92a9;
  font-size: 14px;
  text-align: center;
  padding: 24px;
}

.modal-footer {
  padding: 0 28px 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 860px) {
  .dataset-create-page,
  .date-row {
    grid-template-columns: 1fr;
  }

  .path-prefix {
    max-width: 40%;
  }
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

.dataset-form-panel .dark-form .path-input .el-input__wrapper {
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.dataset-form-panel .dark-form .el-input__wrapper.is-focus,
.dataset-form-panel .dark-form .el-select .el-input__wrapper.is-focus,
.dataset-form-panel .dark-form .el-select__wrapper.is-focused,
.dataset-form-panel .dark-form .el-select__wrapper:hover {
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
}

.dataset-form-panel .dark-form .path-input .el-input__wrapper.is-focus {
  box-shadow: none !important;
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

.dataset-form-panel .dark-form .el-radio-group.storage-toggle {
  display: flex;
  gap: 12px;
}

.dataset-form-panel .dark-form .el-radio-group.storage-toggle .el-radio-button__inner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 10px 24px !important;
  border: 1px solid rgba(121, 167, 255, 0.2) !important;
  border-radius: 999px !important;
  background: rgba(2, 8, 21, 0.3) !important;
  color: #c7e9ff !important;
  font-weight: 700;
  box-shadow: none !important;
}

.dataset-form-panel .dark-form .el-radio-group.storage-toggle .el-radio-button:not(.is-active) .el-radio-button__inner:hover {
  background: rgba(59, 130, 246, 0.12) !important;
  border-color: rgba(59, 130, 246, 0.4) !important;
}

.dataset-form-panel .dark-form .el-radio-group.storage-toggle .el-radio-button.is-active .el-radio-button__inner {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(59, 130, 246, 0.15)) !important;
  border-color: #3b82f6 !important;
}

.dark-popper .el-select-dropdown__item.is-selected .el-select-dropdown__option-icon {
  color: #4ade80 !important;
}
</style>
