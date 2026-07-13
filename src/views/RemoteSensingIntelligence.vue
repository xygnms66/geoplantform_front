<template>
  <section class="section hero-card project-hero intel-hero">
    <div class="hero-content">
      <div class="eyebrow">Geo Intelligence Radar</div>
      <h1>遥感情报中心</h1>
      <p>
        持续跟踪遥感模型、数据集、论文、开源项目和行业动态。
        本周新增 <b>{{ stats.weekly }}</b> 条资讯，Agent 识别
        <b>{{ stats.highValue }}</b> 条高价值动态，建议转任务
        <b>{{ stats.toTask }}</b> 条。
      </p>

      <div class="hero-actions">
        <button class="primary-btn">生成周报</button>
        <button class="secondary-btn">添加资讯源</button>
        <button class="secondary-btn">手动录入</button>
        <button class="secondary-btn" @click="agentOpen = true">Agent 分析</button>
      </div>
    </div>

    <div class="radar-visual">
      <div class="radar-circle circle-1"></div>
      <div class="radar-circle circle-2"></div>
      <div class="radar-circle circle-3"></div>
      <div class="radar-line"></div>
      <div class="radar-dot dot-1"></div>
      <div class="radar-dot dot-2"></div>
      <div class="radar-dot dot-3"></div>
    </div>
  </section>

  <section class="section stats-grid">
    <article v-for="card in statCards" :key="card.title" class="stat-card panel">
          <div class="stat-icon">{{ card.icon }}</div>
          <div>
            <div class="stat-title">{{ card.title }}</div>
            <div class="stat-value">{{ card.value }}</div>
            <div class="stat-desc">{{ card.desc }}</div>
          </div>
        </article>
  </section>

  <section class="section layout-grid">
    <aside class="filter-panel panel">
          <div class="panel-title">筛选条件</div>

          <div class="filter-block">
            <div class="filter-label">时间范围</div>
            <button
              v-for="item in timeOptions"
              :key="item"
              class="filter-option"
              :class="{ active: selectedTime === item }"
              @click="selectedTime = item"
            >
              <span>{{ item }}</span>
            </button>
          </div>

          <div class="filter-block">
            <div class="filter-label">情报类型</div>
            <button
              v-for="item in typeOptions"
              :key="item.name"
              class="filter-option"
              :class="{ active: selectedType === item.name }"
              @click="selectedType = item.name"
            >
              <span>{{ item.name }}</span>
              <em>{{ item.count }}</em>
            </button>
          </div>

          <div class="filter-block">
            <div class="filter-label">关联方向</div>
            <button
              v-for="item in topicOptions"
              :key="item"
              class="filter-chip"
              :class="{ active: selectedTopic === item }"
              @click="selectedTopic = selectedTopic === item ? '全部' : item"
            >
              {{ item }}
            </button>
          </div>

          <div class="filter-block">
            <div class="filter-label">处理状态</div>
            <button
              v-for="item in statusOptions"
              :key="item.name"
              class="filter-option"
              :class="{ active: selectedStatus === item.name }"
              @click="selectedStatus = item.name"
            >
              <span>{{ item.name }}</span>
              <em>{{ item.count }}</em>
            </button>
          </div>
        </aside>

    <section class="timeline-panel panel">
          <div class="timeline-header">
            <div>
              <h2>情报时间轴</h2>
              <p>按时间沉淀遥感领域动态，支持转任务、入知识库、生成周报。</p>
            </div>

            <div class="view-tabs">
              <button
                v-for="tab in viewTabs"
                :key="tab"
                :class="{ active: activeView === tab }"
                @click="activeView = tab"
              >
                {{ tab }}
              </button>
            </div>
          </div>

          <article class="featured-card panel">
            <div class="featured-top">
              <span class="featured-badge">今日重点情报</span>
              <span class="score-badge">Agent Score 94</span>
            </div>

            <h3>Major TOM 多模态遥感样本更新，建议纳入预训练数据候选池</h3>

            <p>
              Agent 判断该动态与「遥感嵌入模型」和「One Terra」高度相关。
              建议将其转为数据调研任务，并加入数据中心候选资产。
            </p>

            <div class="featured-actions">
              <button>转任务</button>
              <button>加入数据候选</button>
              <button>生成选题</button>
            </div>
          </article>

          <!-- 时间轴视图 -->
          <div v-if="activeView === '时间轴'" class="timeline">
            <div
              v-for="group in filteredTimelineGroups"
              :key="group.label"
              class="timeline-group"
            >
              <div class="timeline-date">
                <span class="date-dot"></span>
                <div>
                  <strong>{{ group.label }}</strong>
                  <small>{{ group.date }}</small>
                </div>
              </div>

              <div class="timeline-items">
                <article
                  v-for="item in group.items"
                  :key="item.id"
                class="news-card panel"
                >
                  <div class="news-type-line" :class="typeClass(item.type)"></div>

                  <div class="news-main">
                    <div class="news-meta">
                      <span class="type-tag" :class="typeClass(item.type)">
                        {{ item.type }}
                      </span>
                      <span
                        class="status-tag"
                        :class="statusClass(item.status)"
                      >
                        {{ item.status }}
                      </span>
                      <span>{{ item.source }}</span>
                      <span>{{ item.time }}</span>
                    </div>

                    <h3>{{ item.title }}</h3>

                    <p class="summary">
                      {{ item.summary }}
                    </p>

                    <div class="news-tags">
                      <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
                    </div>

                    <div class="news-project">
                      关联项目：
                      <b v-for="project in item.projects" :key="project">{{ project }}</b>
                    </div>
                  </div>

                  <div class="news-side">
                    <div class="score">
                      <strong>{{ item.score }}</strong>
                      <span>Score</span>
                    </div>

                    <button>查看原文</button>
                    <button>收藏</button>
                    <button class="primary-action">转任务</button>
                    <button>知识库</button>
                  </div>
                </article>
              </div>
            </div>

            <div v-if="filteredTimelineGroups.length === 0" class="empty-state">
              没有匹配的资讯，调整筛选条件后重试。
            </div>
          </div>

          <!-- 卡片视图 -->
          <div v-else-if="activeView === '卡片'" class="card-grid">
            <article
              v-for="item in filteredItems"
              :key="item.id"
              class="compact-news-card panel"
            >
              <div class="compact-top">
                <span class="type-tag" :class="typeClass(item.type)">
                  {{ item.type }}
                </span>
                <span class="score-badge">{{ item.score }}</span>
              </div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.summary }}</p>
              <div class="news-tags">
                <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
              </div>
            </article>
          </div>

          <!-- 周报视图 -->
          <div v-else class="weekly-report">
            <div class="report-block panel">
              <h3>本周遥感情报简报草稿</h3>
              <p>
                本周遥感领域动态主要集中在遥感基础模型、多模态预训练、
                土地覆盖数据更新和开源工具链四个方向。Agent 建议重点关注
                Major TOM、WorldCover 2025、GeoFM 项目更新等内容。
              </p>
            </div>

            <div class="report-section panel">
              <h4>一、遥感基础模型</h4>
              <p>
                新增多篇基础模型综述与 Benchmark 论文，关注重点从模型结构逐渐转向数据组织、
                跨区域泛化和多模态对齐。
              </p>
            </div>

            <div class="report-section panel">
              <h4>二、数据集更新</h4>
              <p>
                WorldCover、Major TOM 等数据动态值得纳入数据中心候选池，建议创建数据调研任务。
              </p>
            </div>

            <button class="primary-btn">生成完整周报</button>
          </div>
        </section>

    <aside class="insight-panel">
      <section class="insight-card panel">
            <h3>本周情报总结</h3>
            <p>
              本周共新增 {{ stats.weekly }} 条遥感资讯，主要集中在遥感基础模型、
              数据集更新和开源项目动态三个方向。
            </p>
          </section>

      <section class="insight-card panel">
            <h3>趋势变化</h3>
            <div class="trend-list">
              <div v-for="trend in trends" :key="trend.name" class="trend-item">
                <span>{{ trend.name }}</span>
                <div class="trend-bar">
                  <i :style="{ width: trend.value + '%' }"></i>
                </div>
                <em>{{ trend.mark }}</em>
              </div>
            </div>
          </section>

      <section class="insight-card panel">
            <h3>Agent 推荐动作</h3>
            <div class="action-list">
              <article
                v-for="action in agentActions"
                :key="action.title"
                class="action-card"
              >
                <strong>{{ action.title }}</strong>
                <p>{{ action.desc }}</p>
                <div>
                  <button>{{ action.button }}</button>
                  <button class="ghost-small">忽略</button>
                </div>
              </article>
            </div>
          </section>

      <section class="insight-card panel">
            <h3>待处理清单</h3>
            <ul class="todo-list">
              <li>3 条未读资讯</li>
              <li>2 条建议转任务</li>
              <li>1 条建议加入数据中心候选</li>
              <li>4 条可纳入本周周报</li>
            </ul>
          </section>
    </aside>
  </section>

  <section class="section source-status-panel panel">
    <div class="section-header">
      <div>
        <h2>资讯源状态</h2>
        <p>监控 arXiv、GitHub、HuggingFace、ESA、NASA 等资讯来源。</p>
      </div>
      <button class="text-btn">查看抓取日志</button>
    </div>

    <div class="source-table">
      <div class="source-row source-head">
        <span>来源</span>
        <span>类型</span>
        <span>状态</span>
        <span>最近抓取</span>
        <span>新增</span>
        <span>操作</span>
      </div>

      <div
        v-for="source in sources"
        :key="source.name"
        class="source-row"
      >
        <span>{{ source.name }}</span>
        <span>{{ source.type }}</span>
        <span>
          <i class="source-status" :class="{ error: source.status === '异常' }"></i>
          {{ source.status }}
        </span>
        <span>{{ source.last }}</span>
        <span>{{ source.count }}</span>
        <span>
          <button class="mini-btn">查看</button>
        </span>
      </div>
    </div>
  </section>

  <button class="agent-float" @click="agentOpen = true">
    🤖 Agent
  </button>

  <div v-if="agentOpen" class="drawer-mask" @click.self="agentOpen = false">
    <aside class="agent-drawer">
      <div class="drawer-header">
        <div>
          <h2>遥感情报 Agent</h2>
          <p>当前页面：遥感情报时间轴</p>
        </div>
        <button class="icon-btn" @click="agentOpen = false">✕</button>
      </div>

      <div class="suggestions">
        <button>帮我总结本周遥感资讯</button>
        <button>哪些资讯适合转成任务？</button>
        <button>哪些数据更新适合入库？</button>
        <button>根据筛选结果生成周报</button>
      </div>

      <div class="agent-message">
        我可以根据时间轴中的资讯，自动提炼趋势、生成周报、创建任务，并推荐需要加入数据中心的候选数据。
      </div>

      <div class="chat-input">
        <input placeholder="输入问题，例如：本周最值得关注的资讯是什么？" />
        <button>发送</button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const selectedTime = ref('最近7天')
const selectedType = ref('全部')
const selectedTopic = ref('全部')
const selectedStatus = ref('全部')
const activeView = ref('时间轴')
const agentOpen = ref(false)

const timeOptions = ['最近7天', '最近30天', '本月', '上月']
const viewTabs = ['时间轴', '卡片', '周报']

const timelineGroups = [
  {
    label: '今日',
    date: '2026-07-10',
    items: [
      {
        id: 1,
        type: '数据集',
        status: '待处理',
        source: 'ESA / Copernicus',
        time: '10:32',
        title: 'ESA WorldCover 2025 更新，新增全球土地覆盖产品',
        summary:
          '该数据集适合作为 One Terra 项目的土地覆盖基准数据，也可以用于遥感预训练标签构建和多模态数据组织。',
        tags: ['土地覆盖', '公开数据', '预训练'],
        projects: ['One Terra', '数据中心'],
        score: 94
      },
      {
        id: 2,
        type: '论文',
        status: '已收藏',
        source: 'arXiv',
        time: '09:18',
        title: 'Remote Sensing Foundation Models: A Survey and Benchmark',
        summary:
          '论文系统总结遥感基础模型在多模态预训练、跨区域泛化和数据组织方面的挑战，建议加入模型调研知识库。',
        tags: ['基础模型', 'Benchmark', '多模态'],
        projects: ['遥感嵌入模型'],
        score: 91
      }
    ]
  },
  {
    label: '昨天',
    date: '2026-07-09',
    items: [
      {
        id: 3,
        type: 'GitHub',
        status: '已转任务',
        source: 'GitHub',
        time: '17:42',
        title: 'GeoFM 项目更新多模态遥感数据加载模块',
        summary:
          '该项目近期更新频繁，新增遥感影像与矢量数据加载模块，建议加入开源项目监控列表。',
        tags: ['开源项目', '多模态', '数据加载'],
        projects: ['GeoRemote 平台'],
        score: 86
      }
    ]
  },
  {
    label: '本周早些时候',
    date: '2026-07-07 ~ 2026-07-08',
    items: [
      {
        id: 4,
        type: '模型',
        status: '周报素材',
        source: 'HuggingFace',
        time: '07-08',
        title: '遥感变化检测模型新增多尺度特征分支',
        summary:
          '模型侧重提升复杂城市场景下的边界变化识别能力，可作为变化检测项目的模型对比候选。',
        tags: ['变化检测', '模型发布', '多尺度'],
        projects: ['变化检测'],
        score: 82
      },
      {
        id: 5,
        type: '行业',
        status: '已入知识库',
        source: 'NASA Earthdata',
        time: '07-07',
        title: 'NASA 发布新一期地球观测数据产品更新说明',
        summary:
          '本次更新涉及多个地球观测数据产品的质量说明、格式规范和访问接口变化，适合归档为数据产品文档。',
        tags: ['数据产品', 'Earthdata', '接口更新'],
        projects: ['数据中心'],
        score: 79
      }
    ]
  }
]

const typeOptions = computed(() => {
  const items = flattenItems.value
  const names = ['全部', '论文', '数据集', '模型', 'GitHub', '行业']
  return names.map((name) => ({
    name,
    count: name === '全部' ? items.length : items.filter((i) => i.type === name).length
  }))
})

const statusOptions = computed(() => {
  const items = flattenItems.value
  const names = ['全部', '待处理', '已收藏', '已转任务', '周报素材', '已入知识库']
  return names.map((name) => ({
    name,
    count: name === '全部' ? items.length : items.filter((i) => i.status === name).length
  }))
})

const topicOptions = ['预训练', '变化检测', '目标检测', '热风险', '土地覆盖', 'SAR', 'DEM']

const flattenItems = computed(() => timelineGroups.flatMap((group) => group.items))

const filteredItems = computed(() => {
  return flattenItems.value.filter((item) => {
    const matchType = selectedType.value === '全部' || item.type === selectedType.value
    const matchStatus = selectedStatus.value === '全部' || item.status === selectedStatus.value
    const matchTopic =
      selectedTopic.value === '全部' || item.tags.includes(selectedTopic.value)

    return matchType && matchStatus && matchTopic
  })
})

const filteredTimelineGroups = computed(() => {
  return timelineGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => filteredItems.value.includes(item))
    }))
    .filter((group) => group.items.length > 0)
})

const stats = computed(() => ({
  weekly: flattenItems.value.length,
  monthly: 46,
  highValue: flattenItems.value.filter((i) => i.score >= 90).length,
  pending: flattenItems.value.filter((i) => i.status === '待处理').length,
  toTask: flattenItems.value.filter((i) => i.status === '已转任务').length + 2,
  knowledge: 21
}))

const statCards = computed(() => [
  {
    title: '本周更新',
    value: stats.value.weekly,
    desc: '近 7 天新增情报',
    icon: '🛰️'
  },
  {
    title: '本月沉淀',
    value: stats.value.monthly,
    desc: '累计记录资讯',
    icon: '📚'
  },
  {
    title: '高价值动态',
    value: stats.value.highValue,
    desc: 'Agent 评分 ≥ 90',
    icon: '✨'
  },
  {
    title: '待处理',
    value: stats.value.pending,
    desc: '建议人工确认',
    icon: '⏳'
  },
  {
    title: '已转任务',
    value: stats.value.toTask,
    desc: '进入项目流程',
    icon: '✅'
  },
  {
    title: '已入知识库',
    value: stats.value.knowledge,
    desc: '可用于 Agent 问答',
    icon: '🧠'
  }
])

const trends = [
  { name: '遥感基础模型', value: 86, mark: '↑' },
  { name: '数据集更新', value: 72, mark: '→' },
  { name: '多模态对齐', value: 64, mark: '↑' },
  { name: 'SAR 表征学习', value: 48, mark: '↑' },
  { name: '热风险建模', value: 32, mark: '→' }
]

const agentActions = [
  {
    title: 'WorldCover 2025 建议入库',
    desc: '该数据与 One Terra 项目高度相关，建议加入数据候选池。',
    button: '加入候选'
  },
  {
    title: '基础模型论文建议转任务',
    desc: '建议创建模型调研任务，并关联遥感嵌入模型项目。',
    button: '转任务'
  },
  {
    title: '生成本周情报周报',
    desc: '本周已有多条高价值资讯，可自动生成周报草稿。',
    button: '生成周报'
  }
]

const sources = [
  { name: 'arXiv Remote Sensing', type: 'RSS', status: '正常', last: '10 分钟前', count: '+2' },
  { name: 'GitHub Trending', type: 'API', status: '正常', last: '30 分钟前', count: '+1' },
  { name: 'HuggingFace Datasets', type: 'API', status: '异常', last: '2 小时前', count: '0' },
  { name: 'ESA Copernicus', type: 'RSS', status: '正常', last: '1 小时前', count: '+1' }
]

function typeClass(type) {
  return {
    论文: 'type-paper',
    数据集: 'type-dataset',
    模型: 'type-model',
    GitHub: 'type-github',
    行业: 'type-industry'
  }[type] || 'type-default'
}

function statusClass(status) {
  return {
    待处理: 'status-pending',
    已收藏: 'status-saved',
    已转任务: 'status-task',
    周报素材: 'status-digest',
    已入知识库: 'status-knowledge'
  }[status] || 'status-default'
}
</script>

<style scoped>
button {
  cursor: pointer;
  border: none;
  font-family: inherit;
}

.secondary-btn,
.primary-btn,
.text-btn,
.mini-btn,
.icon-btn {
  transition: all 0.18s ease;
}

.secondary-btn,
.icon-btn {
  height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  color: #d7ebff;
  background: rgba(15, 23, 42, 0.68);
}

.icon-btn {
  width: 40px;
  padding: 0;
}

.primary-btn {
  height: 42px;
  padding: 0 18px;
  border-radius: 12px;
  color: white;
  font-weight: 800;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.28);
}

.intel-hero {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 24px;
  align-items: stretch;
}

.intel-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(to bottom, black, transparent 80%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.intel-hero p b {
  color: #67e8f9;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.radar-visual {
  position: relative;
  z-index: 1;
  width: 220px;
  height: 220px;
  align-self: center;
  justify-self: center;
}

.radar-circle {
  position: absolute;
  inset: 50%;
  border: 1px solid rgba(103, 232, 249, 0.25);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.circle-1 {
  width: 210px;
  height: 210px;
}

.circle-2 {
  width: 145px;
  height: 145px;
}

.circle-3 {
  width: 78px;
  height: 78px;
}

.radar-line {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 98px;
  height: 2px;
  background: linear-gradient(90deg, #67e8f9, transparent);
  transform-origin: left center;
  animation: scan 5s linear infinite;
}

.radar-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #67e8f9;
  box-shadow: 0 0 18px rgba(103, 232, 249, 0.9);
}

.dot-1 {
  left: 72px;
  top: 56px;
}

.dot-2 {
  right: 58px;
  top: 112px;
}

.dot-3 {
  left: 108px;
  bottom: 44px;
}

@keyframes scan {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  gap: 14px;
  align-items: center;
  min-height: 106px;
  padding: 18px;
  border-radius: 22px;
}

.stat-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(56, 189, 248, 0.12);
}

.stat-title {
  color: #94a3b8;
  font-size: 13px;
}

.stat-value {
  margin-top: 4px;
  color: #67e8f9;
  font-size: 28px;
  font-weight: 900;
}

.stat-desc {
  margin-top: 2px;
  color: #64748b;
  font-size: 12px;
}

.layout-grid {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 380px;
  gap: 20px;
  align-items: start;
}

.filter-panel,
.timeline-panel,
.insight-panel {
  min-width: 0;
}

.filter-panel,
.timeline-panel {
  border-radius: 24px;
}

.filter-panel {
  position: sticky;
  top: 92px;
  padding: 18px;
}

.panel-title {
  margin-bottom: 18px;
  font-size: 18px;
  font-weight: 850;
}

.filter-block {
  margin-bottom: 22px;
}

.filter-label {
  margin-bottom: 10px;
  color: #7d91a8;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.filter-option {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 34px;
  align-items: center;
  margin-bottom: 6px;
  padding: 0 10px;
  border-radius: 10px;
  color: #cfe8ff;
  background: transparent;
}

.filter-option em {
  color: #64748b;
  font-style: normal;
}

.filter-option.active,
.filter-option:hover {
  color: #67e8f9;
  background: rgba(56, 189, 248, 0.1);
}

.filter-chip {
  display: inline-flex;
  margin: 0 6px 8px 0;
  padding: 6px 10px;
  border-radius: 999px;
  color: #bcd5ec;
  background: rgba(148, 163, 184, 0.1);
}

.filter-chip.active {
  color: #67e8f9;
  background: rgba(56, 189, 248, 0.16);
}

.timeline-panel {
  padding: 22px;
}

.timeline-header,
.section-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.timeline-header h2,
.section-header h2 {
  margin: 0;
  font-size: 22px;
}

.timeline-header p,
.section-header p {
  margin: 6px 0 0;
  color: #7d91a8;
  font-size: 13px;
}

.view-tabs {
  display: inline-flex;
  padding: 4px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.3);
}

.view-tabs button {
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  color: #94a3b8;
  background: transparent;
}

.view-tabs button.active {
  color: white;
  background: rgba(56, 189, 248, 0.2);
}

.featured-card {
  margin-bottom: 22px;
  background:
    linear-gradient(135deg, rgba(14, 165, 233, 0.16), rgba(37, 99, 235, 0.08)),
    linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.74));
}

.featured-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.featured-badge,
.score-badge {
  display: inline-flex;
  height: 28px;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  color: #67e8f9;
  background: rgba(56, 189, 248, 0.14);
  font-size: 12px;
  font-weight: 850;
}

.featured-card h3 {
  margin: 14px 0 8px;
  font-size: 20px;
}

.featured-card p {
  margin: 0;
  color: #9fb1c7;
  line-height: 1.7;
}

.featured-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.featured-actions button {
  height: 32px;
  padding: 0 12px;
  border-radius: 10px;
  color: #dff5ff;
  background: rgba(56, 189, 248, 0.12);
}

.timeline {
  position: relative;
}

.timeline-group {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 16px;
}

.timeline-date {
  position: sticky;
  top: 92px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  height: fit-content;
  padding-top: 8px;
}

.timeline-date strong {
  display: block;
  font-size: 15px;
}

.timeline-date small {
  display: block;
  margin-top: 4px;
  color: #64748b;
}

.date-dot {
  width: 12px;
  height: 12px;
  margin-top: 4px;
  border: 2px solid #67e8f9;
  border-radius: 50%;
  box-shadow: 0 0 16px rgba(103, 232, 249, 0.7);
}

.timeline-items {
  position: relative;
  padding: 0 0 22px 22px;
  border-left: 1px solid rgba(103, 232, 249, 0.2);
}

.news-card {
  position: relative;
  display: grid;
  grid-template-columns: 4px 1fr 116px;
  gap: 16px;
  margin-bottom: 14px;
  overflow: hidden;
  padding: 16px;
  border-radius: 18px;
}

.news-type-line {
  width: 4px;
  border-radius: 999px;
}

.news-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  color: #7d91a8;
  font-size: 12px;
}

.type-tag,
.status-tag {
  display: inline-flex;
  height: 24px;
  align-items: center;
  padding: 0 8px;
  border-radius: 999px;
  font-weight: 800;
}

.type-paper {
  color: #c4b5fd;
  background: rgba(124, 58, 237, 0.16);
}

.type-dataset {
  color: #67e8f9;
  background: rgba(6, 182, 212, 0.16);
}

.type-model {
  color: #93c5fd;
  background: rgba(37, 99, 235, 0.16);
}

.type-github {
  color: #86efac;
  background: rgba(34, 197, 94, 0.15);
}

.type-industry {
  color: #fcd34d;
  background: rgba(245, 158, 11, 0.14);
}

.status-pending {
  color: #fde68a;
  background: rgba(245, 158, 11, 0.15);
}

.status-saved {
  color: #bfdbfe;
  background: rgba(59, 130, 246, 0.15);
}

.status-task {
  color: #86efac;
  background: rgba(34, 197, 94, 0.14);
}

.status-digest {
  color: #f0abfc;
  background: rgba(217, 70, 239, 0.14);
}

.status-knowledge {
  color: #67e8f9;
  background: rgba(6, 182, 212, 0.14);
}

.news-card h3,
.compact-news-card h3 {
  margin: 10px 0 8px;
  color: #f8fbff;
  font-size: 17px;
  line-height: 1.5;
}

.summary {
  margin: 0;
  color: #9fb1c7;
  font-size: 14px;
  line-height: 1.75;
}

.news-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.news-tags span {
  padding: 4px 8px;
  border-radius: 999px;
  color: #bcd5ec;
  background: rgba(148, 163, 184, 0.12);
  font-size: 12px;
}

.news-project {
  margin-top: 10px;
  color: #7d91a8;
  font-size: 13px;
}

.news-project b {
  margin-right: 8px;
  color: #67e8f9;
}

.news-side {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
}

.score {
  display: grid;
  place-items: center;
  height: 58px;
  border-radius: 14px;
  background: rgba(56, 189, 248, 0.1);
}

.score strong {
  color: #67e8f9;
  font-size: 22px;
}

.score span {
  margin-top: -6px;
  color: #64748b;
  font-size: 11px;
}

.news-side button {
  height: 30px;
  border-radius: 9px;
  color: #cfe8ff;
  background: rgba(148, 163, 184, 0.12);
}

.news-side .primary-action {
  color: white;
  background: rgba(14, 165, 233, 0.75);
}

.empty-state {
  padding: 60px 0;
  color: #64748b;
  text-align: center;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.compact-news-card {
  padding: 16px;
  border-radius: 18px;
}

.compact-top {
  display: flex;
  justify-content: space-between;
}

.compact-news-card p,
.weekly-report p {
  color: #9fb1c7;
  line-height: 1.75;
}

.weekly-report {
  display: grid;
  gap: 16px;
}

.report-block,
.report-section {
  padding: 18px;
  border-radius: 18px;
}

.report-block h3,
.report-section h4 {
  margin-top: 0;
}

.insight-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.insight-card {
  padding: 18px;
  border-radius: 22px;
}

.insight-card h3 {
  margin: 0 0 12px;
  font-size: 18px;
}

.insight-card p {
  margin: 0;
  color: #9fb1c7;
  line-height: 1.7;
  font-size: 14px;
}

.trend-list {
  display: grid;
  gap: 12px;
}

.trend-item {
  display: grid;
  grid-template-columns: 96px 1fr 20px;
  gap: 10px;
  align-items: center;
  color: #cfe8ff;
  font-size: 13px;
}

.trend-bar {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.16);
}

.trend-bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #38bdf8, #2563eb);
}

.trend-item em {
  color: #67e8f9;
  font-style: normal;
}

.action-list {
  display: grid;
  gap: 12px;
}

.action-card {
  padding: 12px;
  border-radius: 14px;
  background: rgba(2, 6, 23, 0.28);
}

.action-card strong {
  display: block;
  margin-bottom: 6px;
}

.action-card p {
  margin-bottom: 10px;
  font-size: 13px;
}

.action-card button {
  height: 28px;
  margin-right: 8px;
  padding: 0 10px;
  border-radius: 8px;
  color: white;
  background: rgba(14, 165, 233, 0.7);
}

.action-card .ghost-small {
  color: #cfe8ff;
  background: rgba(148, 163, 184, 0.12);
}

.todo-list {
  margin: 0;
  padding-left: 18px;
  color: #bcd5ec;
  line-height: 1.9;
}

.source-status-panel {
  padding: 20px;
}

.text-btn {
  padding: 0;
  color: #38bdf8;
  background: transparent;
  font-weight: 800;
}

.source-table {
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 18px;
}

.source-row {
  display: grid;
  grid-template-columns: 1.5fr 0.8fr 0.8fr 1fr 0.6fr 0.6fr;
  gap: 12px;
  align-items: center;
  min-height: 50px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  color: #c8d8ea;
  font-size: 13px;
}

.source-row:last-child {
  border-bottom: none;
}

.source-head {
  color: #7d91a8;
  background: rgba(2, 6, 23, 0.32);
  font-weight: 800;
}

.source-status {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;
  background: #22c55e;
}

.source-status.error {
  background: #ef4444;
}

.mini-btn {
  height: 28px;
  padding: 0 10px;
  border-radius: 9px;
  color: #dff5ff;
  background: rgba(56, 189, 248, 0.12);
}

.agent-float {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 30;
  height: 50px;
  padding: 0 18px;
  border-radius: 999px;
  color: white;
  font-weight: 850;
  background: linear-gradient(135deg, #06b6d4, #2563eb);
  box-shadow: 0 20px 50px rgba(37, 99, 235, 0.42);
}

.drawer-mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  justify-content: flex-end;
  background: rgba(2, 6, 23, 0.55);
  backdrop-filter: blur(8px);
}

.agent-drawer {
  width: min(440px, 100%);
  height: 100%;
  padding: 22px;
  border-left: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(3, 7, 18, 0.96);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.drawer-header h2 {
  margin: 0;
}

.drawer-header p {
  margin: 6px 0 0;
  color: #8ca1b8;
  font-size: 13px;
}

.suggestions {
  display: grid;
  gap: 10px;
  margin: 22px 0;
}

.suggestions button {
  padding: 12px;
  border: 1px solid rgba(56, 189, 248, 0.16);
  border-radius: 14px;
  color: #dff5ff;
  text-align: left;
  background: rgba(15, 23, 42, 0.78);
}

.agent-message {
  min-height: 220px;
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 18px;
  color: #dff5ff;
  background: rgba(15, 23, 42, 0.42);
  line-height: 1.7;
}

.chat-input {
  display: grid;
  grid-template-columns: 1fr 72px;
  gap: 10px;
  margin-top: 14px;
}

.chat-input input {
  height: 42px;
  padding: 0 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  color: #dff5ff;
  background: rgba(15, 23, 42, 0.78);
  outline: none;
}

.chat-input button {
  border-radius: 12px;
  color: white;
  background: #0ea5e9;
  font-weight: 800;
}

button:hover {
  transform: translateY(-1px);
}

@media (max-width: 1320px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .layout-grid {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .insight-panel {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .intel-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .news-card {
    grid-template-columns: 4px 1fr;
  }

  .news-side {
    grid-column: 2;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .score {
    width: 80px;
  }

  .view-tabs {
    width: 100%;
  }

  .view-tabs button {
    flex: 1;
  }
}
</style>