<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getToken } from "@/lib/auth";

const router = useRouter();
const auth = useAuthStore();

interface DatasetCandidate {
  id: number; title: string; source: string; sourceName: string; description: string;
  domain: string; status: string; modality: string[]; scope: string[]; projects: string[];
  storageStatus?: string; storagePath?: string; url?: string;
}

interface Statistics {
  total: number;
  by_status: { candidate: number; in_use: number; archived: number };
  by_source: Record<string, number>;
  by_domain: Record<string, number>;
}

const datasets = ref<DatasetCandidate[]>([]);
const statistics = ref<Statistics | null>(null);
const dataLoading = ref(true);
const error = ref("");

onMounted(async () => {
  if (!auth.loading && !auth.isAdmin()) { router.push("/"); return; }
  if (!auth.loading && auth.isAdmin()) await fetchData();
});

const unwatch = auth.$subscribe(() => {
  if (!auth.loading) {
    if (!auth.isAdmin()) router.push("/");
    else if (auth.isAdmin() && datasets.value.length === 0) fetchData();
    unwatch();
  }
});

async function fetchData() {
  const token = getToken();
  if (!token) { error.value = "未登录"; dataLoading.value = false; return; }
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const datasetsResponse = await fetch(`${API_BASE_URL}/api/admin/datasets/candidates`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!datasetsResponse.ok) throw new Error("获取数据集失败");
    const datasetsData = await datasetsResponse.json();
    datasets.value = datasetsData.items || [];
    const statsResponse = await fetch(`${API_BASE_URL}/api/admin/datasets/statistics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (statsResponse.ok) {
      statistics.value = await statsResponse.json();
    }
  } catch (err: any) {
    error.value = err.message || "加载数据失败";
  } finally {
    dataLoading.value = false;
  }
}
</script>

<template>
  <div v-if="auth.loading || dataLoading" style="padding: 2rem; text-align: center;"><p>加载中...</p></div>
  <div v-else-if="!auth.isAdmin()" />
  <div v-else style="padding: 2rem; max-width: 1400px; margin: 0 auto;">
    <div style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">数据管理后台</h1>
      <p style="color: #666;">管理员专用 - 查看和管理数据集候选库</p>
    </div>
    <div v-if="error" style="padding: 1rem; margin-bottom: 2rem; background: #fee; color: #c00; border-radius: 0.5rem;">{{ error }}</div>
    <div v-if="statistics" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
      <div class="panel" style="padding: 1.5rem;"><div style="font-size: 2rem; font-weight: bold; color: #2563eb;">{{ statistics.total }}</div><div style="color: #666; margin-top: 0.25rem;">总数据集</div></div>
      <div class="panel" style="padding: 1.5rem;"><div style="font-size: 2rem; font-weight: bold; color: #f59e0b;">{{ statistics.by_status.candidate }}</div><div style="color: #666; margin-top: 0.25rem;">候选数据集</div></div>
      <div class="panel" style="padding: 1.5rem;"><div style="font-size: 2rem; font-weight: bold; color: #10b981;">{{ statistics.by_status.in_use }}</div><div style="color: #666; margin-top: 0.25rem;">使用中</div></div>
      <div class="panel" style="padding: 1.5rem;"><div style="font-size: 2rem; font-weight: bold; color: #6b7280;">{{ statistics.by_status.archived }}</div><div style="color: #666; margin-top: 0.25rem;">已归档</div></div>
    </div>
    <div class="panel" style="padding: 1.5rem;">
      <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">候选数据集列表 ({{ datasets.length }})</h2>
      <p v-if="datasets.length === 0" style="color: #666; text-align: center; padding: 2rem;">暂无候选数据集</p>
      <div v-else style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
          <thead>
            <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">ID</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">标题</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">来源</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">领域</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">模态</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">存储状态</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dataset in datasets" :key="dataset.id" style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 0.75rem;">{{ dataset.id }}</td>
              <td style="padding: 0.75rem;"><div style="font-weight: 500;">{{ dataset.title }}</div><div style="font-size: 0.75rem; color: #666; margin-top: 0.25rem;">{{ dataset.description.slice(0, 60) }}...</div></td>
              <td style="padding: 0.75rem;"><span style="padding: 0.25rem 0.5rem; background: #e0e7ff; border-radius: 0.25rem; font-size: 0.75rem;">{{ dataset.sourceName }}</span></td>
              <td style="padding: 0.75rem;">{{ dataset.domain }}</td>
              <td style="padding: 0.75rem;">
                <span v-for="(m, i) in dataset.modality.slice(0, 2)" :key="i" style="display: inline-block; padding: 0.125rem 0.375rem; background: #f3f4f6; border-radius: 0.25rem; font-size: 0.75rem; margin-right: 0.25rem;">{{ m }}</span>
                <span v-if="dataset.modality.length > 2" style="font-size: 0.75rem; color: #666;">+{{ dataset.modality.length - 2 }}</span>
              </td>
              <td style="padding: 0.75rem;">
                <span v-if="dataset.storageStatus" :style="{ padding: '0.25rem 0.5rem', background: dataset.storageStatus === 'stored' ? '#d1fae5' : '#fef3c7', color: dataset.storageStatus === 'stored' ? '#065f46' : '#92400e', borderRadius: '0.25rem', fontSize: '0.75rem' }">{{ dataset.storageStatus === 'stored' ? '已存储' : dataset.storageStatus }}</span>
                <span v-else style="color: #9ca3af;">未存储</span>
              </td>
              <td style="padding: 0.75rem;"><a v-if="dataset.url" :href="dataset.url" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: none; font-size: 0.875rem;">查看详情 →</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="statistics && Object.keys(statistics.by_source).length > 0" class="panel" style="padding: 1.5rem; margin-top: 2rem;">
      <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">按来源分布</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
        <div v-for="[source, count] in Object.entries(statistics.by_source)" :key="source" style="padding: 0.75rem; background: #f9fafb; border-radius: 0.375rem;">
          <div style="font-size: 1.5rem; font-weight: bold;">{{ count }}</div>
          <div style="font-size: 0.875rem; color: #666;">{{ source }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
