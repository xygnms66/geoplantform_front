const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// ==================================
// MOCK START - 开发用，上线删除本块
// ==================================
const MOCK_USERS = [
  { id: 1, employee_no: "000772", password: "12345", role: 1, is_admin: false, personal_member_id: 0, name: "刘婧" },
  { id: 2, employee_no: "003223", password: "12345", role: 2, is_admin: false, personal_member_id: 1, name: "王子群" },
  { id: 3, employee_no: "000127", password: "12345", role: 3, is_admin: false, personal_member_id: 2, name: "王笑" },
  { id: 4, employee_no: "002514", password: "12345", role: 3, is_admin: false, personal_member_id: 3, name: "王英瑾" },
  { id: 5, employee_no: "001883", password: "12345", role: 2, is_admin: false, personal_member_id: 4, name: "郑黄河" },
  { id: 6, employee_no: "002679", password: "12345", role: 3, is_admin: false, personal_member_id: 5, name: "张德义" },
  { id: 7, employee_no: "000767", password: "12345", role: 3, is_admin: false, personal_member_id: 6, name: "申慧" },
  { id: 8, employee_no: "000402", password: "12345", role: 3, is_admin: false, personal_member_id: 7, name: "张航" },
  { id: 9, employee_no: "002692", password: "12345", role: 3, is_admin: false, personal_member_id: 8, name: "李霄涵" },
  { id: 10, employee_no: "000783", password: "12345", role: 2, is_admin: false, personal_member_id: 9, name: "王振" },
  { id: 11, employee_no: "001513", password: "12345", role: 3, is_admin: false, personal_member_id: 10, name: "杨森" },
  { id: 12, employee_no: "001996", password: "12345", role: 3, is_admin: false, personal_member_id: 11, name: "姬朋立" },
  { id: 13, employee_no: "001253", password: "12345", role: 3, is_admin: true, personal_member_id: 12, name: "李萧缘" },
  { id: 14, employee_no: "003062", password: "12345", role: 2, is_admin: false, personal_member_id: 13, name: "华梓强" },
  { id: 15, employee_no: "001699", password: "12345", role: 3, is_admin: false, personal_member_id: 14, name: "林应琪" },
  { id: 16, employee_no: "002660", password: "12345", role: 3, is_admin: false, personal_member_id: 15, name: "宋恺祥" },
  { id: 17, employee_no: "000408", password: "12345", role: 3, is_admin: false, personal_member_id: 16, name: "宋飞翔" },
];

const MOCK_PERSONAL_MEMBERS: Record<number, number> = {
  0: 0, 1: 1, 2: 1, 3: 1, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3,
  9: 2, 10: 2, 11: 2, 12: 2, 13: 4, 14: 4, 15: 4, 16: 4,
};

function isMockMode(): boolean {
  return import.meta.env.VITE_USE_MOCK === "true" || import.meta.env.VITE_USE_MOCK === "1";
}

function mockToken(userId: number): string {
  return `mock-token-${userId}`;
}

function decodeMockUser(token: string): (typeof MOCK_USERS)[0] | null {
  const match = token.match(/^mock-token-(\d+)$/);
  if (!match) return null;
  return MOCK_USERS.find((u) => u.id === Number(match[1])) || null;
}
// ==================================
// MOCK END（上面这块和下面每个函数里的 if(isMockMode) 一起删）
// ==================================

export interface User {
  id: number;
  employee_no: string;
  name: string | null;
  role?: string | number;
  team_group_id?: number | null;
  is_admin: boolean;
  personal_member_id?: number | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserListItem {
  id?: number;
  employee_no: string;
  name: string;
  role?: string | number;
  team_group_id?: number | null;
}

export async function login(
  employeeNo: string,
  password: string
): Promise<LoginResponse> {
  // ========== MOCK START ==========
  if (isMockMode()) {
    const user = MOCK_USERS.find((u) => u.employee_no === employeeNo && u.password === password);
    if (!user) throw new Error("工号或密码错误");
    return {
      access_token: mockToken(user.id),
      token_type: "bearer",
      user: { id: user.id, employee_no: user.employee_no, name: user.name, role: user.role, team_group_id: MOCK_PERSONAL_MEMBERS[user.id] ?? null, is_admin: user.is_admin, personal_member_id: user.personal_member_id },
    };
  }
  // ========== MOCK END ==========

  const formData = new URLSearchParams();
  formData.append("username", employeeNo);
  formData.append("password", password);

  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "登录失败" }));
    throw new Error(error.detail || "登录失败");
  }

  return response.json();
}

export async function getCurrentUser(token: string): Promise<User> {
  // ========== MOCK START ==========
  if (isMockMode()) {
    const user = decodeMockUser(token);
    if (!user) throw new Error("获取用户信息失败");
    return { id: user.id, employee_no: user.employee_no, name: user.name, role: user.role, team_group_id: MOCK_PERSONAL_MEMBERS[user.id] ?? null, is_admin: user.is_admin, personal_member_id: user.personal_member_id };
  }
  // ========== MOCK END ==========

  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("获取用户信息失败");
  }

  return response.json();
}

export async function getUsers(): Promise<UserListItem[]> {
  // ========== MOCK START ==========
  if (isMockMode()) {
    return MOCK_USERS.map((u) => ({ id: u.id, employee_no: u.employee_no, name: u.name, role: u.role, team_group_id: MOCK_PERSONAL_MEMBERS[u.id] ?? null }));
  }
  // ========== MOCK END ==========

  const response = await fetch(`${API_BASE_URL}/api/auth/users`);

  if (!response.ok) {
    return [];
  }

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

export async function changePassword(
  token: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  // ========== MOCK START ==========
  if (isMockMode()) {
    return;
  }
  // ========== MOCK END ==========

  const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "修改密码失败" }));

    throw new Error(error.detail || "修改密码失败");
  }
}