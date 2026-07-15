<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { getAchievements, getProject, getProjects } from "@/lib/api";
import type { Achievement, Project } from "@/types";
import AchievementCard from "@/components/shared/AchievementCard.vue";
import EvalTable, {
  type EvalTableData,
  type ModelCompTableData,
  type SimpleModelTableData,
} from "@/components/shared/EvalTable.vue";

type SubItem = {
  name: string;
  desc: string;
  images?: string[];
  imageScale?: number;
  evalTable?: EvalTableData;
  modelCompTable?: ModelCompTableData;
  simpleModelTable?: SimpleModelTableData;
};
type ContentSection = {
  title: string;
  content: string;
  images?: string[];
  imageScale?: number;
  items?: SubItem[];
};

const PROJECT_SECTIONS: Record<string, ContentSection[]> = {
  embedding: [
    {
      title: "技术路线",
      content:
        "研发嵌入模型，突破跨模态地理信息统一表征与对齐核心技术，实现多时序、多尺度、多传感器数据的网格化编码与自适应泛化建模。",
      items: [
        {
          name: "数据预处理",
          desc: "构建统一预处理数据管线，对光学、SAR、DEM、土地覆盖等多源遥感数据进行配准、切片、重采样与质量筛选，约 4,586 个采样点，单点覆盖 2.56 km²。",
          images: ["/project/aef2.png"],
        },
        {
          name: "多模态融合",
          desc: "构建了浙江省 13 类多模态嵌入预训练高质量数据集 16 亿张，覆盖国土、林草、海洋、测绘等领域的 13 类多模态数据（光学、SAR、近红外、热红外、高光谱、DEM、矢量、土地覆盖、大气、树冠高度、海温）。",
          images: ["/project/aef3.png"],
          imageScale: 0.7,
        },
        {
          name: "算法架构",
          desc: "多源遥感观测和高质量地图数据构造训练样本，模态感知 Masking 设计预训练任务， Latent MIM Lite 在潜在特征空间中学习统一的遥感表征，对标 AEF 范式构建自主可控基础模型。",
          images: ["/project/aef1.png"],
        },
      ],
    },
    {
      title: "下游应用",
      content:
        "面向遥感核心解译任务，通过微调基础嵌入模型验证跨场景泛化能力，实现全景分割、目标识别和变化检测。支撑自然资源调查与国土监测业务落地。",
      items: [
        {
          name: "全景分割",
          desc: "融合语义分割与实例分割，实现地物像素级全场景理解，支持开放词汇类别扩展。",
          images: ["/project/aef4.png"],
        },
        {
          name: "目标检测",
          desc: "面向建筑、车辆、舰船等典型地物的旋转框检测，支持多尺度密集目标场景。",
          modelCompTable: {
            title: "目标检测性能对比",
            subtitle: "对比 AEF 与地溯 GeoOrigin 在典型目标类别上的 F1 与 IoU 指标。",
            categories: ["近海养殖", "淤菅", "室外运动场", "推推土"],
            rows: [
              {
                model: "AEF",
                scores: {
                  近海养殖: { f1: 0.0772, iou: 0.0401 },
                  淤菅: { f1: null, iou: null },
                  室外运动场: { f1: 0.5604, iou: 0.3893 },
                  推推土: { f1: null, iou: null },
                },
              },
              {
                model: "地溯 GeoOrigin",
                isHighlight: true,
                scores: {
                  近海养殖: { f1: 0.6939, iou: 0.5313 },
                  淤菅: { f1: 0.9498, iou: 0.9044 },
                  室外运动场: { f1: 0.8019, iou: 0.6693 },
                  推推土: { f1: 0.9174, iou: 0.8475 },
                },
              },
            ],
          },
        },
        {
          name: "变化检测",
          desc: "双时相或多时相影像差异分析，已在 3 类以上评测集上完成微调测评。",
          simpleModelTable: {
            title: "变化检测性能对比",
            subtitle: "对比各模型在变化检测任务上的 F1、Precision、Recall 与 IoU 指标。",
            metricLabels: ["F1", "Precision", "Recall", "IoU"],
            rows: [
              { model: "AEF", metrics: { F1: 0.786, Precision: 0.8435, Recall: 0.7366, IoU: 0.648 } },
              { model: "地溯 GeoOrigin", metrics: { F1: 0.6858, Precision: 0.71, Recall: 0.66, IoU: 0.5219 } },
              {
                model: "地溯嵌入融合 AEF",
                isHighlight: true,
                metrics: { F1: 0.8095, Precision: 0.8064, Recall: 0.8125, IoU: 0.6799 },
              },
            ],
          },
        },
      ],
    },
  ],
  "heat-risk": [
    {
      title: "技术路线",
      content:
        "面向全球城市热风险识别需求，融合亚米级遥感影像、数字高程、地表温度、粗粒度空气温度及气候分区等多源数据，构建街道级近地气温估计与热风险评估模型，实现从地表环境感知到城市热暴露识别的精细化建模。",
      items: [
        {
          name: "温度估计算法模型",
          desc: "基于遥感影像预测城市 2 米近地气温，引入地表温度 LST 与粗粒度气温数据作为代理监督信号，并通过多源约束和损失函数设计提升空间分辨率与预测精度。",
          images: ["/project/heat1.png"],
        },
        {
          name: "温度估计建模思路",
          desc: "融合亚米级遥感、数字高程、地表温度和粗粒度空气温度等全球多源数据，建立从地表环境特征到街道级 2 米近地气温的精细化估计模型，为城市热风险识别、气候适应和公共健康治理提供支撑。",
          images: ["/project/heat2.png"],
        },
      ],
    },
    {
      title: "成果展示",
      content:
        "模型实现了对全球典型城市近地气温和热风险空间格局的精细化刻画，可为城市热岛治理、公共健康预警和韧性城市建设提供数据支撑。",
      items: [
        {
          name: "温度估计",
          desc: "完成全球 100 个城市的街道级 2 米近地气温估计，空间分辨率提升至 10 米级，平均预测误差控制在 1℃ 以内，显著增强城市热风险精细识别能力。",
          images: ["/project/heat5.png"],
        },
      ],
    },
  ],
  "one-terra": [
    {
      title: "技术路线",
      content:
        "从 0 到 1 构建遥感领域首个开放词汇全景分割模型，统一支持全景分割、指代分割、推理分割和目标检测等多类任务，推动遥感解译从封闭类别识别向开放语义理解升级。",
      items: [
        {
          name: "全景分割建模思路",
          desc: "基于 Transformer 架构构建统一遥感视觉理解模型，融合语义分割、实例分割和全景分割任务，实现面向多尺度、多类别、多场景遥感影像的可扩展训练与开放词汇识别。",
          images: ["/project/terra1.png"],
        },
      ],
    },
    {
      title: "成果展示",
      content:
        "oneTerra 具备开放类别识别、多模态感知和跨区域泛化能力，可支撑从地表覆盖识别到细粒度实体检测的多层次遥感智能解译。",
      items: [
        {
          name: "模型特色",
          desc: "构建 18B 参数级遥感视觉-语言模型，融合光学与 SAR 多模态信息，支持从宏观地表覆盖到细粒度地物实体的全天候全景感知与语义理解。",
          images: ["/project/terra2.png"],
        },
        {
          name: "性能优势",
          desc: "模型具备优异的跨区域泛化能力和少样本学习能力，在零样本开放词汇地物分类、全景分割与目标检测等任务中达到业内领先水平。",
          images: ["/project/terra3.png"],
        },
      ],
    },
    {
      title: "下游应用",
      content:
        "依托开放词汇全景分割能力，oneTerra 可广泛应用于国土调查、城市监测、资源管理、交通识别和重点目标动态感知等遥感业务场景。",
      items: [
        {
          name: "全景分割应用",
          desc: "对大范围遥感影像中的建筑、道路、水体、植被、农田等地物进行像素级统一识别与精细制图，形成服务国土调查、城市监测和资源管理的全要素空间底图。",
          images: ["/project/terra4.png"],
        },
        {
          name: "细粒度目标检测应用",
          desc: "在亚米级遥感影像中精准识别车辆、船舶、道路设施等小尺度目标的位置、类别与分布，支撑交通监测、城市治理和重点目标动态感知。",
          images: ["/project/terra5.png"],
        },
      ],
    },
  ],
  "city-model": [
    {
      title: "技术路线",
      content:
        "构建覆盖 0.3 米至 30 米空间分辨率、连续 25 年时间跨度的城市统一编码体系，实现城市空间结构、建筑高度、地表覆盖和形态特征的多尺度表达，支撑多类城市下游应用。",
      items: [
        {
          name: "高度估计建模思路",
          desc: "通过源域有标注数据监督训练与目标域伪标签自训练相结合，利用土地覆盖结果引导建筑高度伪标签优化，实现跨区域城市建筑高度的精细化估计。",
          images: ["/project/city3.png"],
        },
        {
          name: "城市 One Tokenizer",
          desc: "面向城市多源遥感数据构建统一编码器，将建筑、道路、绿地、水体、地表覆盖和高度等空间信息转化为统一城市 token 表达，支撑城市建模、变化分析、功能识别和多任务应用迁移。",
          images: ["/project/city1.png"],
        },
      ],
    },
    {
      title: "成果展示",
      content:
        "模型形成了面向全球典型城市的三维空间表达能力，可快速生成城市建筑高度、体量和空间分布信息，为城市精细治理提供基础数据支撑。",
      items: [
        {
          name: "城市高度估计",
          desc: "基于高分辨率遥感影像快速生成城市建筑三维模型，实现建筑高度、体量与空间分布的可视化表达，为通风廊道分析、热岛治理和可持续城市规划提供精细化空间底座。",
          images: ["/project/city2.png"],
        },
      ],
    },
  ],
};

const geooriginModalities = [
  { name: "Sentinel-1 SAR", desc: "合成孔径雷达", tags: ["VV", "VH", "10m"] },
  { name: "Sentinel-2 L2A 光学", desc: "光学多光谱 L2A", tags: ["B01", "B02", "B03", "B04", "10m/20m/60m"] },
  { name: "Landsat 光学", desc: "Collection 2 光学多光谱", tags: ["B1", "B2", "B3", "B4", "30m→10m"] },
  { name: "WorldCover", desc: "全球土地覆盖", tags: ["10m", "land_cover"] },
  { name: "中国 CDL", desc: "中国作物数据层", tags: ["30m→10m", "land_cover"] },
  { name: "SRTM DEM", desc: "数字高程模型", tags: ["30m→10m", "dem"] },
];

const route = useRoute();
const project = ref<Project>();
const allProjects = ref<Project[]>([]);
const achievements = ref<Achievement[]>([]);

const metricEntries = computed(() =>
  Object.entries(project.value?.metrics ?? {}).map(([label, value]) => ({ label, value: String(value) })),
);

const projectAchievements = computed(() => achievements.value.filter((item) => item.project_id === project.value?.id));

async function loadProjectData() {
  const slug = route.params.slug as string;
  const [projectDetail, projectList, achievementList] = await Promise.all([
    getProject(slug),
    getProjects(),
    getAchievements(),
  ]);
  project.value = projectDetail;
  allProjects.value = projectList;
  achievements.value = achievementList;
}

onMounted(loadProjectData);

watch(
  () => route.params.slug,
  () => {
    loadProjectData();
    window.scrollTo(0, 0);
  },
);
</script>

<template>
  <div v-if="project" class="project-detail-layout">
    <nav class="project-sidenav">
      <div class="project-sidenav-track">
        <div v-for="item in allProjects" :key="item.slug" class="project-sidenav-entry">
          <router-link
            :to="`/projects/${item.slug}`"
            :class="['project-sidenav-dot-wrap', { active: item.slug === project.slug }]"
          >
            <div class="project-sidenav-dot" />
            <span class="project-sidenav-slug">{{ item.slug }}</span>
          </router-link>
        </div>
      </div>
    </nav>

    <div class="project-detail-content">
      <section class="section hero-card project-hero">
        <div class="eyebrow">Project / {{ project.slug }}</div>
        <h1>{{ project.name }}</h1>
        <p>{{ project.description }}</p>
        <div class="badges">
          <span v-for="tag in project.tags" :key="tag" class="badge">{{ tag }}</span>
        </div>
      </section>

      <section v-if="metricEntries.length > 0" class="section">
        <div class="section-head">
          <div>
            <h2>核心指标</h2>
            <p class="lead">保留原项目页的关键信息密度，用统一卡片展示当前项目的基础指标。</p>
          </div>
        </div>
        <div class="kv">
          <div v-for="item in metricEntries" :key="item.label">
            <strong>{{ item.value }}</strong
            ><span>{{ item.label }}</span>
          </div>
        </div>
      </section>

      <section class="section grid-2">
        <div class="panel">
          <h2>当前进度</h2>
          <p class="lead">
            {{ project.achieve || project.stage || "当前项目正在稳步推进，相关阶段信息会持续同步到平台。" }}
          </p>
          <div class="badges">
            <span class="badge green">{{ project.status }}</span>
            <span v-if="project.owner" class="badge">{{ project.owner }}</span>
          </div>
        </div>
        <div class="panel">
          <h2>下一阶段</h2>
          <p class="lead">{{ project.next_stage || "后续阶段规划将在项目推进过程中持续补充。" }}</p>
        </div>
      </section>

      <section v-for="sec in PROJECT_SECTIONS[project.slug] ?? []" :key="sec.title" class="section">
        <div class="content-block">
          <h2>{{ sec.title }}</h2>
          <p>{{ sec.content }}</p>
          <div
            v-if="sec.items && sec.items.length > 0"
            style="display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 24px"
          >
            <div
              v-for="item in sec.items"
              :key="item.name"
              style="
                padding: 24px;
                border-radius: 16px;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(148, 163, 184, 0.14);
              "
            >
              <div style="font-weight: 700; font-size: 16px; margin-bottom: 10px; color: #dbeafe">{{ item.name }}</div>
              <p style="margin: 0; color: var(--muted); font-size: 14px; line-height: 1.7">{{ item.desc }}</p>
              <div
                v-if="item.images && item.images.length > 0"
                :style="{
                  width: (item.imageScale ?? 1) * 100 + '%',
                  marginTop: '20px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }"
              >
                <div
                  :style="{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(' + item.images.length + ', 1fr)',
                    gap: '12px',
                  }"
                >
                  <img
                    v-for="src in item.images"
                    :key="src"
                    :src="src"
                    :alt="item.name"
                    style="width: 100%; border-radius: 10px; object-fit: contain"
                  />
                </div>
              </div>
              <EvalTable v-if="item.evalTable" v-bind="item.evalTable" />
              <EvalTable v-if="item.modelCompTable" v-bind="item.modelCompTable" />
              <EvalTable v-if="item.simpleModelTable" v-bind="item.simpleModelTable" />
            </div>
          </div>
          <div
            v-if="sec.images && sec.images.length > 0"
            :style="{
              width: (sec.imageScale ?? 1) * 100 + '%',
              marginTop: '28px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }"
          >
            <div
              :style="{
                display: 'grid',
                gridTemplateColumns: 'repeat(' + sec.images.length + ', 1fr)',
                gap: '16px',
                alignItems: 'stretch',
              }"
            >
              <div
                v-for="src in sec.images"
                :key="src"
                class="content-block-image"
                style="margin: 0; display: flex; align-items: center"
              >
                <img :src="src" :alt="sec.title" style="width: 100%; height: 100%; object-fit: contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="project.slug === 'embedding'" class="section">
        <div class="section-head">
          <div>
            <h2>GeoOrigin 预处理数据模态展示</h2>
            <p class="lead">构建了浙江省 13 类多模态嵌入预训练高质量数据集 16 亿张。</p>
          </div>
        </div>
        <div class="grid-3">
          <article v-for="item in geooriginModalities" :key="item.name" class="card">
            <h3>{{ item.name }}</h3>
            <p>{{ item.desc }}</p>
            <div class="badges">
              <span v-for="tag in item.tags" :key="tag" class="badge">{{ tag }}</span>
            </div>
          </article>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div>
            <h2>项目成果</h2>
            <p class="lead">展示该项目已经沉淀的报告、模型、数据说明与 Demo。</p>
          </div>
          <router-link class="button" to="/achievements">全部成果</router-link>
        </div>
        <div v-if="projectAchievements.length > 0" class="grid-3">
          <AchievementCard v-for="item in projectAchievements" :key="item.id" :item="item" :project="project" />
        </div>
        <div v-else class="panel">
          <h3>暂无关联成果</h3>
          <p>当前项目的成果条目还在整理中，后续会同步到这里。</p>
        </div>
      </section>

      <div class="footer-note">{{ project.name }} · 静态详情页</div>
    </div>
  </div>
</template>
