import { useEffect, useState } from 'react';
import { Save, ArrowLeft, User, Phone, MapPin, Briefcase, Calendar, Globe, Lock, X, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { changePassword, getMyProfile, updateMyProfile } from '../../services/api/profileApi';

const EditAccount = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });

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
      setStatus('Đã lưu tất cả thay đổi!');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Mat khau xac nhan khong khop.' });
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      setPasswordStatus({ type: 'success', message: 'Doi mat khau thanh cong!' });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordStatus({ type: '', message: '' });
      }, 2000);
    } catch {
      setPasswordStatus({ type: 'error', message: 'Sai mat khau cu hoac loi he thong.' });
    }
  };

  const InputGroup = ({ label, icon: Icon, value, onChange, type = 'text', disabled = false }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-black text-gray-400 uppercase ml-1 tracking-wider">{label}</label>
      <div className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-sm transition-all">
        <Icon size={18} className="text-gray-400" />
        <input
          type={type}
          disabled={disabled}
          className="bg-transparent w-full outline-none text-sm font-bold text-gray-800 placeholder-gray-400 disabled:text-gray-400"
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
      {/* Header & Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-2xl shadow-sm transition-all active:scale-90" aria-label="Quay lại" title="Quay lại">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">Thiet lap tai khoan</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Quan ly thong tin va bao mat tai khoan</p>
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

      {status && (
        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
          {status}
        </div>
      )}

      {/* Main Grid Content (Giu nguyen nhu code cu) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="font-black text-blue-600 flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
              <User size={18} /> Thong tin ca nhan
            </h2>
            <InputGroup
              label="Ho va ten" icon={User} value={formData.fullName}
              onChange={(e:any) => setFormData({...formData, fullName: e.target.value})}
            />
            <InputGroup
              label="Ngay sinh" icon={Calendar} type="date" value={formData.birthday}
              onChange={(e:any) => setFormData({...formData, birthday: e.target.value})}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Gioi tinh</label>
              <select
                className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm font-bold text-gray-800 appearance-none focus:border-blue-500"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                aria-label="Giới tính"
                title="Giới tính"
              >
                <option value="">Chua cap nhat</option>
                <option value="Nam">Nam</option>
                <option value="Nu">Nu</option>
                <option value="Khac">Khac</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="font-black text-blue-600 flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
              <Phone size={18} /> Lien lac
            </h2>
            <InputGroup
              label="So dien thoai" icon={Phone} value={formData.phone}
              onChange={(e:any) => setFormData({...formData, phone: e.target.value})}
            />
            <InputGroup
              label="Email" icon={Globe} value={formData.email}
              onChange={(e:any) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="font-black text-blue-600 flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
              <Briefcase size={18} /> Cong viec va hoc tap
            </h2>
            <InputGroup label="Nghe nghiep" icon={Briefcase} value={formData.job} disabled onChange={() => {}} />
            <InputGroup label="Noi lam viec / Truong hoc" icon={MapPin} value={formData.workplace} disabled onChange={() => {}} />
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="font-black text-blue-600 flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
              <MapPin size={18} /> Dia chi
            </h2>
            <InputGroup
              label="Dia chi hien tai" icon={MapPin} value={formData.currentAddress}
              onChange={(e:any) => setFormData({...formData, currentAddress: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Modal Doi Mat Khau */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 flex items-center gap-2">
                <Lock className="text-blue-600" size={20} /> Doi mat khau moi
              </h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-6 space-y-5">
              {passwordStatus.message && (
                <div className={`p-3 rounded-xl text-xs font-bold ${passwordStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {passwordStatus.message}
                </div>
              )}

              <InputGroup 
                label="Mat khau hien tai" icon={Key} type="password" 
                value={passwordData.oldPassword}
                onChange={(e:any) => setPasswordData({...passwordData, oldPassword: e.target.value})}
              />
              <InputGroup 
                label="Mat khau moi" icon={Lock} type="password" 
                value={passwordData.newPassword}
                onChange={(e:any) => setPasswordData({...passwordData, newPassword: e.target.value})}
              />
              <InputGroup 
                label="Xac nhan mat khau" icon={Lock} type="password" 
                value={passwordData.confirmPassword}
                onChange={(e:any) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              />

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl font-black text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all text-sm"
                >
                  Huy bo
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all text-sm"
                >
                  Xac nhan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditAccount;

