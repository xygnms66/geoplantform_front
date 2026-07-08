<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getPersonalMembers, getProjects, getTeamGroups } from "@/lib/api";
import type { PersonalMember, Project, TeamGroup } from "@/types";
import { personalMembers, projects as projectFallback, teamGroups as teamGroupFallback } from "@/lib/staticData";
import MemberCard from "@/components/MemberCard.vue";

const rawMembers = ref<PersonalMember[]>(personalMembers);
const projects = ref<Project[]>(projectFallback);
const teamGroups = ref<TeamGroup[]>(teamGroupFallback);

onMounted(async () => {
  [rawMembers.value, projects.value, teamGroups.value] = await Promise.all([getPersonalMembers(), getProjects(), getTeamGroups()]);
});

const projectNameMap = () => Object.fromEntries(projects.value.map((p) => [p.slug, p.name]));
const resolveProjects = (slugs?: string[] | null) => slugs?.map((s) => projectNameMap()[s] ?? s);

const teamLead = () => rawMembers.value.find((m) => m.isTeamLead || m.role?.includes("团队负责人") || m.title?.includes("团队负责人"));
const normalMembers = () => rawMembers.value.filter((m) => m.id !== teamLead()?.id);
const groupedMembers = () => teamGroups.value.map((group) => ({
  ...group,
  members: normalMembers().filter((m) => m.team_group?.key === group.key),
}));
</script>

<template>
  <section class="section team-hero">
    <div class="team-hero-content">
      <div>
        <div class="eyebrow">TEAM</div>
        <h1>团队展示</h1>
        <p>团队按照研究与工程方向划分为数据组、遥感嵌入模型组、遥感视觉语言模型组和温度模型组。每个成员围绕所属方向承担具体的数据、模型、平台与应用任务。</p>
      </div>
      <div class="team-hero-stats">
        <div class="team-stat"><strong>{{ teamGroups.length }}</strong><span>研究组</span></div>
        <div class="team-stat"><strong>{{ rawMembers.length }}</strong><span>成员</span></div>
        <div class="team-stat"><strong>{{ projects.length }}</strong><span>核心项目</span></div>
      </div>
    </div>
  </section>

  <section v-if="teamLead()" class="section team-lead-card">
    <div class="lead-avatar">{{ teamLead()!.name.slice(0, 1) }}</div>
    <div class="lead-main">
      <div class="lead-title-row">
        <div>
          <div class="eyebrow">Team Lead</div>
          <h2>{{ teamLead()!.name }}</h2>
        </div>
        <span class="lead-badge">团队负责人</span>
      </div>
      <div class="lead-role">{{ teamLead()!.title || "遥感团队负责人" }}</div>
      <p>{{ teamLead()!.description || "负责天地一体遥感智能模型体系的总体规划、技术架构设计与工程化落地，统筹各研究组协同推进。" }}</p>
      <div class="project-tags">
        <span v-for="project in (resolveProjects(teamLead()!.projects) ?? [])" :key="project" class="project-tag project-tag-strong">{{ project }}</span>
      </div>
    </div>
  </section>

  <section class="section team-groups-grid">
    <div v-for="group in groupedMembers()" :key="group.key" class="team-group-card">
      <div class="group-card-head">
        <div>
          <div class="eyebrow">{{ group.short_title }}</div>
          <h2>{{ group.title }}</h2>
        </div>
        <div class="group-count"><strong>{{ group.members.length }}</strong><span>人</span></div>
      </div>
      <p class="group-description">{{ group.description }}</p>
      <div class="keyword-row">
        <span v-for="keyword in group.keywords" :key="keyword" class="keyword-chip">{{ keyword }}</span>
      </div>
      <div class="member-list">
        <template v-if="group.members.length > 0">
          <MemberCard v-for="member in group.members" :key="member.id" :member="{ ...member, projects: resolveProjects(member.projects) as string[] | null }" />
        </template>
        <div v-else class="empty-member-card">暂无成员信息，后续可在后台维护。</div>
      </div>
    </div>
  </section>
</template>
