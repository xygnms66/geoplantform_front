import { defineStore } from "pinia";
import { ref } from "vue";
import type { User } from "@/lib/auth";
import { getCurrentUser, getToken, removeToken, saveToken } from "@/lib/auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const loading = ref(true);

  async function init() {
    const token = getToken();
    if (token) {
      try {
        const userData = await getCurrentUser(token);
        user.value = userData;
      } catch {
        removeToken();
      }
    }
    loading.value = false;
  }

  function login(token: string, userData: User) {
    saveToken(token);
    user.value = userData;
  }

  function logout() {
    removeToken();
    user.value = null;
  }

  const isAdmin = () => user.value?.is_admin ?? false;

  return { user, loading, init, login, logout, isAdmin };
});
