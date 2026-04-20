import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { LoginPages, Home, Profile, Notifications, Friends, Stories} from "./pages";

function App() {  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Login" element={<LoginPages />} />

        <Route element={<MainLayout />}>
          {/* ĐÃ FIX: Đổi :id thành :postId? để khớp với Home.tsx */}
          <Route path="/Home/:postId?" element={<Home />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/Notifications" element={<Notifications />} />
          <Route path="/Friends" element={<Friends />} />
          <Route path="/Stories" element={<Stories />} />
        </Route>

        <Route path="/" element={<Navigate to="/Home" />} />
        <Route path="*" element={<div className="p-10 text-center">404 - Không tìm thấy trang này</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;