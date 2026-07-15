import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import { LoginPages, Home, Profile, Notifications, Friends, Moderation} from "./pages";
import ChatPage from "./pages/Chat";
import FriendsList from "./pages/Friends/FriendsList";
import FriendRequests from "./pages/Friends/FriendsRequest";
import PeopleYouMayKnow from "./pages/Friends/PeopleYouMayKnow";
import EditAccount from "./pages/Settings/EditAccount";
import { ThemeProvider } from "./context/ThemeContext";
import { createSignalRConnection } from "./services/signalRService";
import ToastContainer from "./components/Notifications/ToastContainer";
import { useNotifications } from "./context/NotificationContext";

// Dùng chỉ để điều hướng các trang thông qua url, không chứa logic gì khác, sử dụng react-router-dom để quản lý routing
// Có thể thêm route con cho Home để hiển thị chi tiết bài viết hoặc story mà không cần thoát khỏi layout chính
// Ví dụ: /Home/:postId để hiển thị chi tiết bài viết, /Home/stories/:userId/:storyId để hiển thị story lồng vào Home
// Để hạn chế việc lạm dụng State và load lại trang

function AppContent() {
  const { notifications } = useNotifications();

  useEffect(() => {
    // ✅ Khi app load, nếu user đã đăng nhập trước đó, tự động kết nối SignalR
    const initSignalR = async () => {
      try {
        const auth = localStorage.getItem("auth");
        if (auth) {
          const data = JSON.parse(auth);
          if (data.accessToken) {
            await createSignalRConnection(data.accessToken);
          }
        }
      } catch (err) {
        console.error("Lỗi khi khởi tạo SignalR:", err);
      }
    };

    initSignalR();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/Login" element={<LoginPages />} />
        <Route element={<MainLayout />}>
          <Route path="/Home" element={<Home />}>
            {/* ROUTE CON: Cho chi tiết bài viết */}
            <Route path=":postId" element={<Home />} /> 
            {/* ROUTE CON: Cho Story lồng vào Home */}
            <Route path="stories/:userId/:storyId" element={<Home />} />
          </Route>
          <Route path="/Profile" element={<Profile />} />
          <Route path="/Profile/:userId" element={<Profile />} />
          <Route path="/settings/edit-information" element={<EditAccount />} />
          <Route path="/Notifications" element={<Notifications />} />
          <Route path="/admin/moderation" element={<Moderation />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/friends/list" element={<FriendsList />} />
          <Route path="/friends/requests" element={<FriendRequests />} />
          <Route path="/friends/suggest" element={<PeopleYouMayKnow />} />
          <Route path="/edit" element={<EditAccount />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/Home" />} />
        <Route path="*" element={<div className="p-10 text-center">404 - Không tìm thấy trang này</div>} />
      </Routes>
      
      {/* Toast Container cho hiển thị notification pop-up */}
      <ToastContainer notifications={notifications} />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
