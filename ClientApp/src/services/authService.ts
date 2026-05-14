import api from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  tenTaiKhoan: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  user: {
    id: string;
    tenTaiKhoan: string;
    email: string;
    phoneNumber?: string;
    roles: string[];
  };
}

export async function login(req: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/Auth/login", req);
  return res.data;
}

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/Auth/register", req);
  return res.data;
}

export function saveAuth(data: AuthResponse) {
  try {
    localStorage.setItem("auth", JSON.stringify(data));
    api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
  } catch (e) {
  }
}

export function clearAuth() {
  localStorage.removeItem("auth");
  delete api.defaults.headers.common["Authorization"];
}

export default { login, register, saveAuth, clearAuth };
