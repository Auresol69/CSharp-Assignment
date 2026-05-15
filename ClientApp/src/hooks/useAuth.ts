// src/hooks/useAuth.ts
// src/hooks/useAuth.ts
import type { AuthResponse } from '../services/authService'; // Điều chỉnh path nếu cần
 // Điều chỉnh path nếu cần

export const useAuth = () => {
  const authData = localStorage.getItem("auth");
  
  if (!authData) {
    return { user: null, isAdmin: false, roles: [] };
  }

  const auth: AuthResponse = JSON.parse(authData);
  const roles = auth.user.roles || [];
  
  return {
    user: auth.user,
    roles: roles,
    // Kiểm tra xem trong mảng roles có quyền 'Admin' không
    isAdmin: roles.includes('Admin') 
  };
};