<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from "vue"
import {
  ElButton,
  ElCol,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElRow,
  ElSelect,
} from "element-plus"
import type { FormInstance, FormRules } from "element-plus"

import {
  createDataProduct,
  getDataProduct,
  getDataProductFormOptions,
  updateDataProduct,
  FormOptionsLoadError,
  type LabeledOption,
  type ProductFormFilterOption,
} from "@/lib/dataCenterApi"
import type { DataProduct, DataProductCreate } from "@/types"

interface ProductForm {
  name: string
  source: string | null
  description: string
  provider: string
  platform: string
  sensor: string
  product_level: string | null
  license: string | null
  format: string
  resolution_value: number | null
  resolution_unit: string
  scope_ids: number[]
  modality_ids: number[]
}

const emit = defineEmits<{
  saved: [product?: DataProduct]
}>()

const dialogVisible = ref(false)
const editingProductId = ref<number | null>(null)

const productFormRef = ref<FormInstance>()
const optionLoading = ref(false)
const submitting = ref(false)
const submitError = ref("")

const sourceOptions = ref<LabeledOption[]>([])
const scopeOptions = ref<ProductFormFilterOption[]>([])
const modalityOptions = ref<ProductFormFilterOption[]>([])
const productLevelOptions = ref<LabeledOption[]>([])
const resolutionUnitOptions = ref<string[]>([])
const formatOptions = ref<LabeledOption[]>([])
const licenseOptions = ref<LabeledOption[]>([])

function hasLoadedFormOptions() {
  return (
    sourceOptions.value.length > 0 &&
    scopeOptions.value.length > 0 &&
    modalityOptions.value.length > 0 &&
    productLevelOptions.value.length > 0 &&
    resolutionUnitOptions.value.length > 0 &&
    formatOptions.value.length > 0 &&
    licenseOptions.value.length > 0
  )
}

function createEmptyProductForm(): ProductForm {
  return {
    name: "",
    source: null,
    description: "",
    provider: "",
    platform: "",
    sensor: "",
    product_level: null,
    license: null,
    format: "GeoTIFF",
    resolution_value: null,
    resolution_unit: "m",
    scope_ids: [],
    modality_ids: [],
  }
}

const productForm = reactive<ProductForm>(createEmptyProductForm())

const productRules: FormRules<ProductForm> = {
  name: [
    { required: true, message: "请输入产品名称", trigger: "blur" },
    { min: 2, max: 255, message: "产品名称长度应为 2～255 个字符", trigger: "blur" },
  ],
  license: [{ required: true, message: "请选择许可协议", trigger: "change" }],
  format: [{ required: true, message: "请选择数据格式", trigger: "change" }],
  resolution_value: [
    {
      validator: (_rule, value, callback) => {
        if (value !== null && value !== undefined && Number(value) <= 0) {
          callback(new Error("空间分辨率必须大于 0"))
          return
        }
        callback()
      },
      trigger: "change",
    },
  ],
}

async function loadReferenceOptions() {
  optionLoading.value = true

  try {
    const options = await getDataProductFormOptions()
    sourceOptions.value = options.sources
    scopeOptions.value = options.scopes
    modalityOptions.value = options.modalities
    productLevelOptions.value = options.productLevels
    resolutionUnitOptions.value = options.resolutionUnits
    formatOptions.value = options.formats
    licenseOptions.value = options.licenses

    if (!productForm.format && formatOptions.value.length > 0) {
      const hasGeoTiff = formatOptions.value.some((opt) => opt.value === "GeoTIFF")
      productForm.format = hasGeoTiff ? "GeoTIFF" : formatOptions.value[0].value
    }

    if (!productForm.resolution_unit && resolutionUnitOptions.value.length > 0) {
      productForm.resolution_unit = resolutionUnitOptions.value.includes("m")
        ? "m"
        : resolutionUnitOptions.value[0]
    }
  } catch (error) {
    console.error("加载产品基础选项失败：", error)
    ElMessage.error(error instanceof Error ? error.message : "产品表单选项加载失败")
    throw error
  } finally {
    optionLoading.value = false
  }
}

function resetProductForm() {
  Object.assign(productForm, createEmptyProductForm())
  editingProductId.value = null
  submitError.value = ""

  nextTick(() => {
    productFormRef.value?.clearValidate()
  })
}

async function openCreateDialog() {
  resetProductForm()
  dialogVisible.value = true

  if (!hasLoadedFormOptions()) {
    try {
      await loadReferenceOptions()
    } catch {
      dialogVisible.value = false
    }
  }
}

async function openEditDialog(productId: number) {
  resetProductForm()
  editingProductId.value = productId
  dialogVisible.value = true
  optionLoading.value = true

  try {
    const [product] = await Promise.all([getDataProduct(productId), loadReferenceOptions()])

    Object.assign(productForm, {
      name: product.name ?? "",
      source: product.source_type ?? null,
      description: product.description ?? "",
      provider: product.provider ?? "",
      platform: product.platform ?? "",
      sensor: product.sensor ?? "",
      product_level: product.product_level ?? null,
      license: product.license ?? null,
      format: product.format ?? "GeoTIFF",
      resolution_value: product.resolution_value ?? null,
      resolution_unit: product.resolution_unit ?? "m",
      scope_ids:
        product.scope_ids ??
        product.scopes?.map((item) => item.id) ??
        product.scope_links?.map((item) => item.scope_id) ??
        [],
      modality_ids:
        product.modality_ids ??
        product.modalities?.map((item) => item.id) ??
        product.modality_links?.map((item) => item.modality_id) ??
        [],
    })

    await nextTick()
    productFormRef.value?.clearValidate()
  } catch (error) {
    console.error("加载产品详情失败：", error)
    if (!(error instanceof FormOptionsLoadError)) {
      ElMessage.error(error instanceof Error ? error.message : "产品详情加载失败")
    }
    dialogVisible.value = false
  } finally {
    optionLoading.value = false
  }
}

function closeDialog() {
  dialogVisible.value = false
}

function resolveSourceId(sourceKey: string | null): number | null {
  if (!sourceKey) return null
  const index = sourceOptions.value.findIndex((item) => item.value === sourceKey)
  return index >= 0 ? index + 1 : null
}

function buildSubmitPayload(): DataProductCreate {
  return {
    name: productForm.name.trim(),
    source_id: resolveSourceId(productForm.source),
    description: productForm.description.trim() || null,
    provider: productForm.provider.trim() || null,
    platform: productForm.platform.trim() || null,
    sensor: productForm.sensor.trim() || null,
    product_level: productForm.product_level || null,
    license: productForm.license,
    resolution_value:
      productForm.resolution_value === null ? null : Number(productForm.resolution_value),
    resolution_unit: productForm.resolution_unit as DataProductCreate["resolution_unit"],
    format: productForm.format,
    scope_ids: [...new Set(productForm.scope_ids.map(Number))],
    modality_ids: [...new Set(productForm.modality_ids.map(Number))],
  }
}

async function submitProduct() {
  submitError.value = ""

  try {
    await productFormRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true

  try {
    const payload = buildSubmitPayload()

    if (editingProductId.value !== null) {
      const updated = await updateDataProduct(editingProductId.value, payload)
      ElMessage.success("数据产品修改成功")
      dialogVisible.value = false
      emit("saved", updated)
    } else {
      const created = await createDataProduct(payload)
      ElMessage.success("数据产品创建成功")
      dialogVisible.value = false
      emit("saved", created)
    }

    resetProductForm()
  } catch (error) {
    console.error("保存数据产品失败：", error)
    submitError.value = error instanceof Error ? error.message : "数据产品保存失败，请检查填写内容"
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadReferenceOptions().catch(() => {
    // 错误已在 loadReferenceOptions 中通过 ElMessage 提示
  })
})

defineExpose({
  openCreateDialog,
  openEditDialog,
})
</script>

<template>
  <div v-if="dialogVisible" class="modal-mask" @click.self="closeDialog">
    <div class="modal-panel product-form-panel">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">
            {{ editingProductId ? "编辑数据产品" : "新建数据产品" }}
          </h2>
          <p class="modal-desc">创建或修改数据产品元信息，保证同源数据产品唯一。</p>
        </div>
        <button type="button" class="modal-close" @click="closeDialog">✕</button>
      </div>

      <div
        v-loading="optionLoading"
        class="modal-body"
        element-loading-text="正在加载基础选项..."
      >
        <p v-if="submitError" class="modal-error">{{ submitError }}</p>

        <el-form
          ref="productFormRef"
          :model="productForm"
          :rules="productRules"
          label-position="top"
          size="default"
          class="dark-form"
        >
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12">
              <el-form-item label="产品名称" prop="name">
                <el-input
                  v-model="productForm.name"
                  placeholder="例如：Landsat 8/9 L2"
                  maxlength="255"
                  show-word-limit
                  clearable
                />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12">
              <el-form-item label="数据来源" prop="source">
                <el-select
                  v-model="productForm.source"
                  filterable
                  clearable
                  placeholder="请选择数据来源"
                  style="width: 100%"
                  popper-class="dark-popper"
                >
                  <el-option
                    v-for="opt in sourceOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                    :title="opt.description || undefined"
                  >
                    <div class="option-with-desc">
                      <span>{{ opt.label }}</span>
                      <span v-if="opt.description" class="option-desc">{{ opt.description }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="产品描述" prop="description">
            <el-input
              v-model="productForm.description"
              type="textarea"
              :rows="3"
              maxlength="2000"
              show-word-limit
              placeholder="请输入数据产品的主要内容、覆盖范围和使用方式"
            />
          </el-form-item>

          <el-row :gutter="16">
            <el-col :xs="24" :sm="8">
              <el-form-item label="提供方" prop="provider">
                <el-input v-model="productForm.provider" placeholder="例如：USGS" clearable />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-form-item label="平台" prop="platform">
                <el-input v-model="productForm.platform" placeholder="例如：Landsat 8/9" clearable />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-form-item label="传感器" prop="sensor">
                <el-input v-model="productForm.sensor" placeholder="例如：OLI/TIRS" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :xs="24" :sm="8">
              <el-form-item label="产品级别" prop="product_level">
                <el-select
                  v-model="productForm.product_level"
                  clearable
                  placeholder="请选择产品级别"
                  style="width: 100%"
                  popper-class="dark-popper"
                >
                  <el-option
                    v-for="level in productLevelOptions"
                    :key="level.value"
                    :label="level.label"
                    :value="level.value"
                    :title="level.description || undefined"
                  >
                    <div class="option-with-desc">
                      <span>{{ level.label }}</span>
                      <span v-if="level.description" class="option-desc">{{ level.description }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-form-item label="许可协议" prop="license">
                <el-select
                  v-model="productForm.license"
                  clearable
                  placeholder="请选择许可协议"
                  style="width: 100%"
                  popper-class="dark-popper"
                >
                  <el-option
                    v-for="opt in licenseOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                    :title="opt.description || undefined"
                  >
                    <div class="option-with-desc">
                      <span>{{ opt.label }}</span>
                      <span v-if="opt.description" class="option-desc">{{ opt.description }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-form-item label="数据格式" prop="format">
                <el-select
                  v-model="productForm.format"
                  clearable
                  placeholder="请选择数据格式"
                  style="width: 100%"
                  popper-class="dark-popper"
                >
                  <el-option
                    v-for="opt in formatOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                    :title="opt.description || undefined"
                  >
                    <div class="option-with-desc">
                      <span>{{ opt.label }}</span>
                      <span v-if="opt.description" class="option-desc">{{ opt.description }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :xs="24" :sm="12">
              <el-form-item label="空间分辨率" prop="resolution_value">
                <div class="resolution-input">
                  <el-input-number
                    v-model="productForm.resolution_value"
                    :min="0"
                    :precision="6"
                    :controls="false"
                    placeholder="请输入数值"
                    class="resolution-value"
                  />
                  <el-select
                    v-model="productForm.resolution_unit"
                    placeholder="单位"
                    class="resolution-unit"
                    popper-class="dark-popper"
                  >
                    <el-option
                      v-for="unit in resolutionUnitOptions"
                      :key="unit"
                      :label="unit"
                      :value="unit"
                    />
                  </el-select>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="应用范围" prop="scope_ids">
            <el-select
              v-model="productForm.scope_ids"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="4"
              placeholder="请选择该产品适用的业务场景"
              no-data-text="暂无可用应用范围"
              style="width: 100%"
              popper-class="dark-popper"
            >
              <el-option
                v-for="item in scopeOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <div class="option-content">
                  <span class="option-name">{{ item.name }}</span>
                  <span v-if="item.description" class="option-description">
                    {{ item.description }}
                  </span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="数据模态" prop="modality_ids">
            <el-select
              v-model="productForm.modality_ids"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="4"
              placeholder="请选择该产品包含的数据模态"
              no-data-text="暂无可用数据模态"
              style="width: 100%"
              popper-class="dark-popper"
            >
              <el-option
                v-for="item in modalityOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <div class="option-content">
                  <span class="option-name">{{ item.name }}</span>
                  <span v-if="item.description" class="option-description">
                    {{ item.description }}
                  </span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div class="modal-footer dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitProduct">
          {{ editingProductId ? "保存修改" : "创建产品" }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  background: rgba(2, 6, 23, 0.7);
  backdrop-filter: blur(6px);
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

.product-form-panel {
  display: flex;
  flex-direction: column;
  max-width: 860px;
  max-height: calc(100vh - 120px);
}

.product-form-panel .modal-body {
  flex: 1;
  overflow-y: auto;
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

.resolution-input {
  display: flex;
  width: 100%;
}

.resolution-value {
  flex: 1;
}

.resolution-value :deep(.el-input__wrapper) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.resolution-unit {
  width: 100px;
  margin-left: -1px;
}

.resolution-unit :deep(.el-select__wrapper) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.option-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.option-name {
  flex-shrink: 0;
}

.option-description {
  overflow: hidden;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

<style>
.product-form-panel .dark-form {
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

.product-form-panel .dark-form .el-form-item__label {
  color: #c9d9eb;
  font-weight: 800;
  font-size: 13px;
  padding-bottom: 4px;
}

.product-form-panel .dark-form .el-input__wrapper,
.product-form-panel .dark-form .el-select .el-input__wrapper,
.product-form-panel .dark-form .el-select__wrapper,
.product-form-panel .dark-form .el-input-number .el-input__wrapper {
  background: rgba(2, 8, 21, 0.4) !important;
  border: 1px solid rgba(121, 167, 255, 0.18);
  border-radius: 12px;
  box-shadow: none !important;
}

.product-form-panel .dark-form .el-input__wrapper.is-focus,
.product-form-panel .dark-form .el-select .el-input__wrapper.is-focus,
.product-form-panel .dark-form .el-select__wrapper.is-focused,
.product-form-panel .dark-form .el-select__wrapper:hover {
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
}

.product-form-panel .dark-form .el-input__inner,
.product-form-panel .dark-form .el-select__selected-item,
.product-form-panel .dark-form .el-select__placeholder,
.product-form-panel .dark-form .el-select__tags-text,
.product-form-panel .dark-form .el-select__input-wrapper,
.product-form-panel .dark-form .el-select__caret {
  color: #f8fbff !important;
}

.product-form-panel .dark-form .el-select__placeholder.is-transparent {
  color: #7f92a9 !important;
}

.product-form-panel .dark-form .el-textarea__inner {
  background: rgba(2, 8, 21, 0.4) !important;
  border: 1px solid rgba(121, 167, 255, 0.18);
  border-radius: 12px;
  color: #f8fbff !important;
  box-shadow: none !important;
}

.product-form-panel .dark-form .el-textarea__inner:focus {
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
}

.product-form-panel .dark-form .el-select__wrapper {
  min-height: 42px;
  padding: 1px 11px;
}

.product-form-panel .dark-form .el-tag {
  --el-tag-bg-color: rgba(37, 99, 235, 0.2);
  --el-tag-border-color: rgba(59, 130, 246, 0.3);
  --el-tag-text-color: #d9edff;
}

.dark-popper .el-select-dropdown__item.is-selected .el-select-dropdown__option-icon {
  color: #4ade80 !important;
}

/* 带 description 的选项需要突破 el-option 默认固定高度，否则说明文字会被压扁 */
.dark-popper .el-select-dropdown__item:has(.option-with-desc) {
  height: auto;
  min-height: 34px;
  line-height: normal;
  padding-top: 8px;
  padding-bottom: 8px;
  white-space: normal;
}

.dark-popper .option-with-desc {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.4;
  white-space: normal;
}

.dark-popper .option-with-desc .option-desc {
  color: #8aa0b8;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  white-space: normal;
}

.product-form-panel .dark-form .el-input__count,
.product-form-panel .dark-form .el-textarea__count {
  background: transparent !important;
}

.product-form-panel .dark-form .el-input__count-inner,
.product-form-panel .dark-form .el-textarea__count-inner {
  background: rgba(2, 8, 21, 0.6) !important;
  color: #8aa0b8 !important;
  border-radius: 6px;
  padding: 1px 8px;
  font-size: 12px;
}
</style>
