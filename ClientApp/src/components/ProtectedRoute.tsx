import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * Bảo vệ toàn bộ các route con cần authentication.
 * Nếu chưa đăng nhập (không có accessToken trong localStorage) thì
 * redirect về /Login, đồng thời lưu lại URL hiện tại vào state để
 * sau khi đăng nhập xong có thể quay lại đúng trang.
 */
const ProtectedRoute = () => {
  const location = useLocation();

  const isAuthenticated = (): boolean => {
    try {
      const raw = localStorage.getItem("auth");
      if (!raw) return false;
      const data = JSON.parse(raw);
      return typeof data?.accessToken === "string" && data.accessToken.length > 0;
    } catch {
      return false;
    }
  };

  if (!isAuthenticated()) {
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
