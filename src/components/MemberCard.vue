<script setup lang="ts">
const props = defineProps<{
  member: {
    id: string | number;
    name: string;
    group?: string | null;
    role?: string | null;
    title?: string | null;
    description?: string | null;
    direction?: string | null;
    researchDirection?: string | null;
    recentWork?: string | null;
    plan?: string | null;
    projects?: string[] | null;
    isTeamLead?: string | boolean | null;
  };
  fallbackProjects?: string[];
}>();

const projects =
  props.member.projects && props.member.projects.length > 0 ? props.member.projects : (props.fallbackProjects ?? []);
const direction = props.member.researchDirection || props.member.direction || "待补充研究方向";
const recentWork = props.member.recentWork || props.member.plan || "待补充近期工作目标 / 计划";
</script>

<template>
  <article class="member-card">
    <div class="member-card-top">
      <div class="member-avatar">{{ member.name.slice(0, 1) }}</div>
      <div class="member-basic">
        <div class="member-name-row">
          <h3>{{ member.name }}</h3>
          <span v-if="member.isTeamLead" class="member-lead-badge">Team Lead</span>
        </div>
        <p>{{ member.role || member.title || "团队成员" }}</p>
      </div>
    </div>
    <div v-if="projects.length > 0" class="project-tags member-project-tags">
      <span v-for="project in projects" :key="project" class="project-tag">{{ project }}</span>
    </div>
    <div class="member-info">
      <div>
        <span>研究方向</span>
        <p>{{ direction }}</p>
      </div>
      <div>
        <span>近期工作目标 / 计划</span>
        <p>{{ recentWork }}</p>
      </div>
    </div>
  </article>
</template>
