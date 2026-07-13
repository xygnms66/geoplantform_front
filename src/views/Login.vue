<script setup lang="ts">
import { ref, onMounted } from "vue";
import AstronautGuard from "@/components/AstronautGuard.vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { login } from "@/lib/auth";

const router = useRouter();
const auth = useAuthStore();

const employeeNo = ref("");
const password = ref("");
const passwordFocused = ref(false);
const error = ref("");
const loading = ref(false);

onMounted(() => {
  if (auth.user) {
    router.push("/");
  }
});

async function handleSubmit(e: Event) {
  e.preventDefault();

  const employeeNoValue = employeeNo.value.trim();

  if (!employeeNoValue) {
    error.value = "请输入工号";
    return;
  }

  if (!password.value) {
    error.value = "请输入密码";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const response = await login(employeeNoValue, password.value);

    auth.login(response.access_token, response.user);

    router.push("/");
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = "登录失败，请检查工号或密码";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-background"></div>
    <div class="login-card">
      <div class="login-card-glow"></div>
      <div class="login-header">
        <div class="login-eyebrow">GeoRemote Research Platform</div>
        <h1>天地一体遥感智能平台</h1>
        <p class="login-subtitle">选择您的账号并输入密码进入系统</p>
      </div>
      <AstronautGuard :passwordFocused="passwordFocused" />
      <form @submit="handleSubmit" class="login-form">
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">👤</span>
            工号
          </label>

          <input
            type="text"
            v-model="employeeNo"
            required
            placeholder="请输入工号"
            class="form-input"
            autocomplete="username"
          />
        </div>
        <div class="form-group">
          <label class="form-label"><span class="label-icon">🔒</span> 密码</label>
          <input
            type="password"
            v-model="password"
            required
            placeholder="请输入密码"
            class="form-input"
            @focus="passwordFocused = true"
            @blur="passwordFocused = false"
          />
        </div>
        <div v-if="error" class="error-message"><span class="error-icon">⚠️</span> {{ error }}</div>
        <button type="submit" :disabled="loading" class="login-button" :class="{ loading }">
          <template v-if="loading"><span class="loading-spinner"></span> 登录中...</template>
          <template v-else><span class="button-icon">🚀</span> 登录系统</template>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: hidden;
  box-sizing: border-box;
}
.login-background {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(56, 189, 248, 0.15), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(129, 140, 248, 0.12), transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.08), transparent 50%);
  z-index: 0;
}
.login-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  border-radius: 32px;
  padding: 48px 40px;
  background:
    radial-gradient(circle at 90% 10%, rgba(56, 189, 248, 0.18), transparent 35%),
    radial-gradient(circle at 10% 90%, rgba(129, 140, 248, 0.15), transparent 35%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.88));
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(56, 189, 248, 0.1) inset;
  backdrop-filter: blur(20px);
  z-index: 1;
}
.login-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #38bdf8, #22d3ee, #818cf8);
}
.login-card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 30%, rgba(56, 189, 248, 0.08), transparent 70%);
  animation: glow-pulse 4s ease-in-out infinite;
  pointer-events: none;
  border-radius: 32px;
}
@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}
.login-header {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-bottom: 36px;
}
.login-eyebrow {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.3);
  color: #93c5fd;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.login-header h1 {
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: 800;
  color: #e5eefc;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.login-subtitle {
  margin: 0;
  color: #9fb0c8;
  font-size: 14px;
  line-height: 1.6;
}
.login-form {
  position: relative;
  z-index: 1;
}
.form-group {
  margin-bottom: 24px;
}
.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #dbeafe;
  font-size: 14px;
  font-weight: 600;
}
.label-icon {
  font-size: 16px;
}
.form-select,
.form-input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #e5eefc;
  font-size: 15px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}
.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: rgba(96, 165, 250, 0.5);
  background: rgba(15, 23, 42, 0.8);
  box-shadow:
    0 0 0 3px rgba(96, 165, 250, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.2);
}
.form-select option {
  background: #0f172a;
  color: #e5eefc;
}
.form-input::placeholder {
  color: #6b7a90;
}
.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  margin-bottom: 20px;
  border-radius: 16px;
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #fca5a5;
  font-size: 14px;
}
.error-icon {
  font-size: 18px;
  flex-shrink: 0;
}
.login-button {
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow:
    0 8px 20px rgba(37, 99, 235, 0.3),
    0 0 0 1px rgba(59, 130, 246, 0.2) inset;
}
.login-button:hover:not(.loading) {
  transform: translateY(-2px);
  box-shadow:
    0 12px 28px rgba(37, 99, 235, 0.4),
    0 0 0 1px rgba(59, 130, 246, 0.3) inset;
}
.login-button:active:not(.loading) {
  transform: translateY(0);
}
.login-button.loading {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  cursor: not-allowed;
}
.button-icon {
  font-size: 18px;
}
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.admin-notice {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 24px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.3);
  color: #fcd34d;
  font-size: 13px;
  line-height: 1.6;
}
.notice-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}
@media (max-width: 560px) {
  .login-card {
    padding: 36px 28px;
    border-radius: 24px;
  }
  .login-header h1 {
    font-size: 26px;
  }
}
</style>
