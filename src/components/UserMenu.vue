<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { changePassword, getToken } from "@/lib/auth";

const auth = useAuthStore();

const showMenu = ref(false);
const showChangePwd = ref(false);

const oldPwd = ref("");
const newPwd = ref("");
const confirmPwd = ref("");
const pwdError = ref("");
const pwdLoading = ref(false);
const pwdSuccess = ref(false);

function closeMenu() {
  showMenu.value = false;
}

function openChangePwd() {
  pwdError.value = "";
  pwdSuccess.value = false;
  oldPwd.value = "";
  newPwd.value = "";
  confirmPwd.value = "";
  showMenu.value = false;
  showChangePwd.value = true;
}

function closeChangePwd() {
  showChangePwd.value = false;
  pwdError.value = "";
  pwdSuccess.value = false;
  oldPwd.value = "";
  newPwd.value = "";
  confirmPwd.value = "";
}

function handleLogout() {
  auth.logout();
  closeMenu();
}

async function handleChangePwd() {
  pwdError.value = "";
  pwdSuccess.value = false;

  if (!oldPwd.value || !newPwd.value || !confirmPwd.value) {
    pwdError.value = "请填写所有字段";
    return;
  }

  if (newPwd.value !== confirmPwd.value) {
    pwdError.value = "两次输入的新密码不一致";
    return;
  }

  if (newPwd.value.length < 6) {
    pwdError.value = "新密码至少 6 位";
    return;
  }

  if (oldPwd.value === newPwd.value) {
    pwdError.value = "新密码不能与原密码相同";
    return;
  }

  pwdLoading.value = true;

  try {
    const token = getToken();

    if (!token) {
      throw new Error("登录已失效，请重新登录");
    }

    await changePassword(token, oldPwd.value, newPwd.value);

    pwdSuccess.value = true;
    oldPwd.value = "";
    newPwd.value = "";
    confirmPwd.value = "";
  } catch (err: unknown) {
    if (err instanceof Error) {
      pwdError.value = err.message;
    } else {
      pwdError.value = "修改密码失败";
    }
  } finally {
    pwdLoading.value = false;
  }
}
</script>

<template>
  <div
    v-if="auth.loading"
    style="margin-left: auto; padding: 0 1rem; color: var(--muted)"
  >
    加载中...
  </div>

  <router-link
    v-else-if="!auth.user"
    to="/login"
    class="button"
    style="margin-left: auto"
  >
    登录
  </router-link>

  <div v-else style="margin-left: auto; position: relative">
    <button
      type="button"
      @click="showMenu = !showMenu"
      class="button"
      style="display: flex; align-items: center; gap: 0.35rem"
    >
      <span>{{ auth.user.name || "用户" }}</span>
      <span style="font-size: 12px; opacity: 0.7">▾</span>
    </button>

    <div
      v-if="showMenu"
      style="
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 0.5rem;
        background: rgba(15, 23, 42, 0.96);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 0.75rem;
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.4);
        min-width: 180px;
        z-index: 50;
        backdrop-filter: blur(16px);
        overflow: hidden;
      "
    >
      <button
        type="button"
        @click="openChangePwd"
        style="
          width: 100%;
          padding: 0.75rem 1rem;
          text-align: left;
          border: none;
          background: none;
          cursor: pointer;
          color: var(--text);
          transition: background 0.15s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
        "
      >
        <span style="font-size: 14px">🔑</span>
        <span>修改密码</span>
      </button>

      <button
        type="button"
        @click="handleLogout"
        style="
          width: 100%;
          padding: 0.75rem 1rem;
          text-align: left;
          border: none;
          background: none;
          cursor: pointer;
          color: #f87171;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        "
      >
        <span style="font-size: 14px">🚪</span>
        <span>退出登录</span>
      </button>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="showChangePwd"
      class="modal-mask"
      @click.self="closeChangePwd"
    >
      <div class="change-pwd-panel">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">修改密码</h2>
            <p class="modal-desc">请输入原密码和新密码</p>
          </div>

          <button
            type="button"
            class="modal-close"
            @click="closeChangePwd"
          >
            ✕
          </button>
        </div>

        <div v-if="pwdSuccess" class="pwd-success">
          <div class="success-icon">✓</div>
          <strong>密码修改成功</strong>
          <p>请下次登录时使用新密码。</p>

          <button
            type="button"
            class="primary-btn"
            @click="closeChangePwd"
          >
            知道了
          </button>
        </div>

        <div v-else class="pwd-form">
          <div class="form-group">
            <label class="form-label">原密码</label>
            <input
              v-model="oldPwd"
              type="password"
              class="form-input"
              placeholder="请输入原密码"
              autocomplete="current-password"
              @keyup.enter="handleChangePwd"
            />
          </div>

          <div class="form-group">
            <label class="form-label">新密码</label>
            <input
              v-model="newPwd"
              type="password"
              class="form-input"
              placeholder="至少 6 位"
              autocomplete="new-password"
              @keyup.enter="handleChangePwd"
            />
          </div>

          <div class="form-group">
            <label class="form-label">确认新密码</label>
            <input
              v-model="confirmPwd"
              type="password"
              class="form-input"
              placeholder="再次输入新密码"
              autocomplete="new-password"
              @keyup.enter="handleChangePwd"
            />
          </div>

          <div v-if="pwdError" class="error-msg">
            {{ pwdError }}
          </div>

          <button
            type="button"
            class="primary-btn"
            :disabled="pwdLoading"
            @click="handleChangePwd"
          >
            <template v-if="pwdLoading">提交中...</template>
            <template v-else>确认修改</template>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(8px);
  overflow-y: auto;
}

.change-pwd-panel {
  width: 100%;
  max-width: 420px;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: #0f1729;
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(56, 189, 248, 0.08) inset;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 28px 28px 0;
}

.modal-title {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  color: var(--text);
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
  font-size: 16px;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.3);
}

.pwd-form {
  padding: 24px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 700;
  color: #d9edff;
  letter-spacing: 0.02em;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #e5eefc;
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.form-input::placeholder {
  color: #6b7a90;
}

.error-msg {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #fca5a5;
  font-size: 13px;
}

.primary-btn {
  width: 100%;
  padding: 12px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.4);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pwd-success {
  padding: 40px 28px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.success-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(74, 222, 128, 0.15);
  border: 2px solid #4ade80;
  color: #4ade80;
  display: grid;
  place-items: center;
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 8px;
}

.pwd-success strong {
  font-size: 18px;
  color: var(--text);
}

.pwd-success p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

.pwd-success .primary-btn {
  margin-top: 16px;
  max-width: 200px;
}
</style>