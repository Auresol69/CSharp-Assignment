import { useState } from 'react';
import { Save, ArrowLeft, User, Phone, MapPin, Briefcase, Calendar, Globe, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EditAccount = () => {
  const navigate = useNavigate();

  // Khởi tạo state với đầy đủ các trường ông giáo yêu cầu
  const [formData, setFormData] = useState({
    // Nhóm: Thông tin cơ bản
    fullName: 'Nguyễn Văn A',
    gender: 'Nam',
    birthday: '2004-01-01',
    
    // Nhóm: Liên lạc
    phone: '0901234567',
    email: 'sinhvien.sgu@gmail.com',
    
    // Nhóm: Tiểu sử & Công việc
    job: 'Sinh viên',
    workplace: 'Đại học Sài Gòn (SGU)',
    
    // Nhóm: Địa chỉ
    hometown: 'Long An',
    currentAddress: 'Quận 5, TP.HCM',
    website: 'https://interacthub.id.vn'
  });

  const handleSave = () => {
    // Đây là nơi ông giáo sẽ gọi API ASP.NET Core 8.0 để lưu vào SQL Server
    console.log("Dữ liệu cập nhật:", formData);
    alert("Đã lưu tất cả thay đổi!");
  };

  // Component con để render từng ô Input cho nhanh và đồng nhất
  const InputGroup = ({ label, icon: Icon, value, onChange, type = "text" }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase ml-1">{label}</label>
      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-blue-500 focus-within:bg-white transition-all">
        <Icon size={18} className="text-gray-400" />
        <input 
          type={type}
          className="bg-transparent w-full outline-none text-sm font-medium text-gray-800"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-[calc(100%-10rem)] mx-auto p-8 pt-4"> {/* pt-24 để tránh bị Sidebar/Header che */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Thiết lập tài khoản</h1>
            <p className="text-sm text-gray-500">Quản lý thông tin định danh của bạn trên InteractHub</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Save size={18} /> Lưu tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CỘT 1: THÔNG TIN CÁ NHÂN */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="font-bold text-blue-600 flex items-center gap-2 mb-2">
              <User size={18} /> Thông tin định danh
            </h2>
            <InputGroup 
              label="Họ và tên" icon={User} value={formData.fullName} 
              onChange={(e:any) => setFormData({...formData, fullName: e.target.value})} 
            />
            <InputGroup 
              label="Ngày sinh" icon={Calendar} type="date" value={formData.birthday} 
              onChange={(e:any) => setFormData({...formData, birthday: e.target.value})} 
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Giới tính</label>
              <select 
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="font-bold text-blue-600 flex items-center gap-2 mb-2">
              <Phone size={18} /> Liên lạc
            </h2>
            <InputGroup 
              label="Số điện thoại" icon={Phone} value={formData.phone} 
              onChange={(e:any) => setFormData({...formData, phone: e.target.value})} 
            />
            <InputGroup 
              label="Email" icon={Globe} value={formData.email} 
              onChange={(e:any) => setFormData({...formData, email: e.target.value})} 
            />
          </div>
        </div>

        {/* CỘT 2: CÔNG VIỆC & ĐỊA CHỈ */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="font-bold text-blue-600 flex items-center gap-2 mb-2">
              <Briefcase size={18} /> Công việc & Học tập
            </h2>
            <InputGroup 
              label="Nghề nghiệp" icon={Briefcase} value={formData.job} 
              onChange={(e:any) => setFormData({...formData, job: e.target.value})} 
            />
            <InputGroup 
              label="Nơi làm việc / Trường học" icon={MapPin} value={formData.workplace} 
              onChange={(e:any) => setFormData({...formData, workplace: e.target.value})} 
            />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="font-bold text-blue-600 flex items-center gap-2 mb-2">
              <MapPin size={18} /> Địa chỉ & Xuất thân
            </h2>
            <InputGroup 
              label="Quê quán" icon={Home} value={formData.hometown} 
              onChange={(e:any) => setFormData({...formData, hometown: e.target.value})} 
            />
            <InputGroup 
              label="Địa chỉ hiện tại" icon={MapPin} value={formData.currentAddress} 
              onChange={(e:any) => setFormData({...formData, currentAddress: e.target.value})} 
            />
            <InputGroup 
              label="Website cá nhân" icon={Globe} value={formData.website} 
              onChange={(e:any) => setFormData({...formData, website: e.target.value})} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAccount;