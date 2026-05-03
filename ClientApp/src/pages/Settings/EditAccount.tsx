import { useEffect, useState } from 'react';
import { Save, ArrowLeft, User, Phone, MapPin, Briefcase, Calendar, Globe, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyProfile } from '../../services/profileApi';

const EditAccount = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Nam',
    birthday: '',
    phone: '',
    email: '',
    job: 'Sinh viên',
    workplace: '',
    hometown: '',
    currentAddress: '',
    website: 'https://interacthub.id.vn'
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getMyProfile();
        setFormData({
          fullName: profile.tenTaiKhoan ?? '',
          gender: profile.gioiTinh ?? 'Nam',
          birthday: profile.ngaySinh ? profile.ngaySinh.slice(0, 10) : '',
          phone: profile.phoneNumber ?? '',
          email: profile.email ?? '',
          job: 'Sinh viên',
          workplace: profile.diaChi ?? '',
          hometown: '',
          currentAddress: profile.diaChi ?? '',
          website: 'https://interacthub.id.vn'
        });
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMyProfile({
        tenTaiKhoan: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone,
        bio: formData.job,
        gioiTinh: formData.gender,
        diaChi: formData.currentAddress,
        ngaySinh: formData.birthday || undefined,
      });
      alert('Đã lưu tất cả thay đổi!');
    } finally {
      setSaving(false);
    }
  };

  const InputGroup = ({ label, icon: Icon, value, onChange, type = "text" }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-wider">{label}</label>
      <div className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-sm transition-all">
        <Icon size={18} className="text-gray-400" />
        <input 
          type={type}
          className="bg-transparent w-full outline-none text-sm font-bold text-gray-800 placeholder-gray-400"
          value={value}
          aria-label={label}
          placeholder={label}
          onChange={onChange}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-2xl shadow-sm transition-all active:scale-90" aria-label="Quay lại" title="Quay lại">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">Thiết lập tài khoản</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Quản lý thông tin định danh của bạn</p>
          </div>
        </div>
        
        {/* Nút lưu luôn hiển thị dễ thấy */}
        <button 
          onClick={handleSave}
          disabled={loading || saving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 text-sm"
        >
          <Save size={20} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* CỘT 1 */}
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="font-black text-blue-600 flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
              <User size={18} /> Thông tin cá nhân
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
              <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Giới tính</label>
              <select 
                className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm font-bold text-gray-800 appearance-none focus:border-blue-500"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                aria-label="Giới tính"
                title="Giới tính"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="font-black text-blue-600 flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
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

        {/* CỘT 2 */}
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="font-black text-blue-600 flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
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

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="font-black text-blue-600 flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
              <MapPin size={18} /> Địa chỉ
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