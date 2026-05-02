import { useEffect, useState } from 'react';
import { Save, ArrowLeft, User, Phone, MapPin, Briefcase, Calendar, Globe, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const EditAccount = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    birthday: '',
    phone: '',
    email: '',
    job: 'Sinh vien',
    workplace: 'Dai hoc Sai Gon (SGU)',
    hometown: '',
    currentAddress: '',
    website: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get('/profile/me');
        setFormData(prev => ({
          ...prev,
          fullName: response.data.tenTaiKhoan || '',
          gender: response.data.gioiTinh || '',
          birthday: response.data.ngaySinh ? response.data.ngaySinh.slice(0, 10) : '',
          phone: response.data.phoneNumber || '',
          email: response.data.email || '',
          currentAddress: response.data.diaChi || ''
        }));
      } catch {
        setStatus('Khong tai duoc thong tin tai khoan tu backend.');
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setStatus('');
      await api.put('/profile/me', {
        tenTaiKhoan: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone,
        ngaySinh: formData.birthday || null,
        gioiTinh: formData.gender,
        diaChi: formData.currentAddress
      });
      setStatus('Da luu thay doi vao backend.');
    } catch {
      setStatus('Luu that bai. Vui long kiem tra du lieu hoac dang nhap lai.');
    } finally {
      setIsSaving(false);
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
          onChange={onChange}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-2xl shadow-sm transition-all active:scale-90">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">Thiet lap tai khoan</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Du lieu dang doc/ghi qua Profile API cua backend</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-blue-700 disabled:bg-blue-800 shadow-xl shadow-blue-100 transition-all active:scale-95 text-sm"
        >
          <Save size={20} /> {isSaving ? 'Dang luu...' : 'Luu thay doi'}
        </button>
      </div>

      {status && (
        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
          {status}
        </div>
      )}

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
            <p className="text-xs font-bold text-gray-400">Backend hien chua co field nghe nghiep/truong hoc trong UpdateProfileRequestDto.</p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="font-black text-blue-600 flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
              <MapPin size={18} /> Dia chi
            </h2>
            <InputGroup label="Que quan" icon={Home} value={formData.hometown} disabled onChange={() => {}} />
            <InputGroup
              label="Dia chi hien tai" icon={MapPin} value={formData.currentAddress}
              onChange={(e:any) => setFormData({...formData, currentAddress: e.target.value})}
            />
            <InputGroup label="Website ca nhan" icon={Globe} value={formData.website} disabled onChange={() => {}} />
            <p className="text-xs font-bold text-gray-400">Backend hien chi co mot field diaChi cho dia chi.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAccount;
