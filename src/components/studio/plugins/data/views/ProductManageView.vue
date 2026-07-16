<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

import DataProductFormDialog from "@/components/studio/plugins/data/dialogs/DataProductFormDialog.vue";
import { deleteDataProduct, getDataProducts } from "@/lib/dataCenterApi";
import type { DataProduct } from "@/types";

const products = ref<DataProduct[]>([]);
const loading = ref(false);
const loadError = ref("");
const deletingId = ref<number | null>(null);
const productFormDialogRef = ref<InstanceType<typeof DataProductFormDialog> | null>(null);

function resolutionText(product: DataProduct) {
  if (product.resolution_value == null) return "-";
  return [product.resolution_value, product.resolution_unit].filter(Boolean).join(" ");
}

async function loadProducts() {
  loading.value = true;
  loadError.value = "";
  try {
    products.value = await getDataProducts();
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : "加载数据产品失败";
    products.value = [];
  } finally {
    loading.value = false;
  }
}

function openEdit(product: DataProduct) {
  productFormDialogRef.value?.openEditDialog(product.id);
}

async function handleSaved() {
  await loadProducts();
}

async function handleDelete(product: DataProduct) {
  try {
    await ElMessageBox.confirm(
      `确定删除数据产品「${product.name}」吗？`,
      "删除确认",
      { type: "warning", confirmButtonText: "删除", cancelButtonText: "取消" },
    );
  } catch {
    return;
  }

  deletingId.value = product.id;
  try {
    await deleteDataProduct(product.id);
    products.value = products.value.filter((item) => item.id !== product.id);
    ElMessage.success("已删除");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "删除失败");
  } finally {
    deletingId.value = null;
  }
}

onMounted(() => {
  void loadProducts();
});
</script>

<template>
  <section class="panel">
    <div class="panel-inner">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">产品管理</h2>
          <p class="panel-desc">维护当前用户的数据产品元信息，供数据集入库时选择关联。</p>
        </div>
        <button class="text-btn" type="button" :disabled="loading" @click="loadProducts">
          {{ loading ? "刷新中…" : "刷新" }}
        </button>
      </div>

      <p v-if="loadError" class="hint error">{{ loadError }}</p>

      <div class="table">
        <div class="row table-head">
          <span>名称</span>
          <span>来源</span>
          <span>提供方</span>
          <span>产品级别</span>
          <span>分辨率</span>
          <span>数据格式</span>
          <span class="ops-col">操作</span>
        </div>

        <div v-if="loading && products.length === 0" class="row empty-row">加载中…</div>
        <div v-else-if="!loading && products.length === 0" class="row empty-row">暂无数据产品</div>

        <div v-for="product in products" :key="product.id" class="row">
          <span class="name" :title="product.name">{{ product.name }}</span>
          <span>{{ product.source_type || "-" }}</span>
          <span :title="product.provider || ''">{{ product.provider || "-" }}</span>
          <span>{{ product.product_level || "-" }}</span>
          <span>{{ resolutionText(product) }}</span>
          <span>{{ product.format || "-" }}</span>
          <span class="ops-col">
            <button class="op-btn" type="button" @click="openEdit(product)">编辑</button>
            <button
              class="op-btn danger"
              type="button"
              :disabled="deletingId === product.id"
              @click="handleDelete(product)"
            >
              {{ deletingId === product.id ? "删除中…" : "删除" }}
            </button>
          </span>
        </div>
      </div>
    </div>

    <DataProductFormDialog ref="productFormDialogRef" @saved="handleSaved" />
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
  grid-template-columns: 1.5fr 0.8fr 1fr 0.7fr 0.9fr 0.8fr 1fr;
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
}

.op-btn:hover {
  background: rgba(56, 189, 248, 0.24);
}

.op-btn.danger {
  color: #fecaca;
  background: rgba(239, 68, 68, 0.16);
}

.op-btn.danger:hover {
  background: rgba(239, 68, 68, 0.26);
}

.op-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 960px) {
  .row {
    grid-template-columns: 1fr;
    padding: 12px 14px;
  }
}
</style>
