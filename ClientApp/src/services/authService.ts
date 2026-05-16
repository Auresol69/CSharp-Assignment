import api from "./api";
import { createSignalRConnection, disconnectSignalR } from "./signalRService";

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
    phoneNữmber?: string;
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

export async function saveAuth(data: AuthResponse) {
  try {
    localStorage.setItem("auth", JSON.stringify(data));
    api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
    
    // ✅ Tự động kết nối SignalR sau khi lưu auth
    try {
      await createSignalRConnection(data.accessToken);
    } catch (err) {
      console.error("Không thể kết nối SignalR:", err);
      // Không throw - để cho login vẫn thành công ngay cả khi SignalR thất bại
    }
  } catch (e) {
    console.error("Lỗi khi lưu auth:", e);
  }
}

export async function clearAuth() {
  localStorage.removeItem("auth");
  delete api.defaults.headers.common["Authorization"];
  
  // ✅ Ngắt kết nối SignalR khi logout
  await disconnectSignalR();
}

export default { login, register, saveAuth, clearAuth };

