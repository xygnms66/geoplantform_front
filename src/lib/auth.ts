const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export interface User {
  id: number;
  name: string;
  role?: string;
  team_group_id?: number;
  is_admin: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserListItem {
  id: number;
  name: string;
  role?: string;
  team_group_id?: number;
}

export async function login(userId: number, password: string): Promise<LoginResponse> {
  const formData = new FormData();
  formData.append("username", userId.toString());
  formData.append("password", password);

  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "登录失败" }));
    throw new Error(error.detail || "登录失败");
  }

  return response.json();
}

export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("获取用户信息失败");
  }

  return response.json();
}

export async function getUsers(): Promise<UserListItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/auth/users`);
  if (!response.ok) return [];
  return response.json();
}

export function saveToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
}

export async function changePassword(token: string, oldPassword: string, newPassword: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "修改密码失败" }));
    throw new Error(error.detail || "修改密码失败");
  }
}
