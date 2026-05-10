import { X, Save, Camera, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import ConfirmModal from './ConfirmModal';
import api from '../../../services/api';
import type { ProfileData } from '../../../pages/Profile';

const EditProfileModal = ({ onClose, initialData, onSaved }: { onClose: () => void, initialData: any, onSaved?: (profile: ProfileData) => void }) => {
  const [data, setData] = useState(initialData);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const coverImageSrc = data.coverImage?.trim() ? data.coverImage : undefined;
  const avatarSrc = data.avatar?.trim() ? data.avatar : undefined;

  const isDirty = JSON.stringify(data) !== JSON.stringify(initialData);

  const handleAttemptClose = () => {
    isDirty ? setShowConfirmClose(true) : onClose();
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!showConfirmClose && modalRef.current && !modalRef.current.contains(e.target as Node)) handleAttemptClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isDirty, showConfirmClose]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      const response = await api.put<ProfileData>('/profile/me', {
        tenTaiKhoan: data.tenTaiKhoan,
        email: data.email,
        phoneNumber: data.phoneNumber,
        avatarUrl: data.avatar,
        bio: data.bio,
        ngaySinh: data.ngaySinh || null,
        gioiTinh: data.gioiTinh,
        diaChi: data.diaChi
      });
      onSaved?.(response.data);
      onClose();
    } catch {
      setError('Khong luu duoc profile. Vui long kiem tra lai du lieu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-9999 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
        <div
          ref={modalRef}
          className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-2xl h-[92vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-all"
        >
          <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <h2 className="text-lg sm:text-xl font-black text-gray-900">Chỉnh sửa trang cá nhân</h2>
            <button onClick={handleAttemptClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500" aria-label="Đóng chỉnh sửa trang cá nhân" title="Đóng chỉnh sửa trang cá nhân"><X size={24}/></button>
          </div>

          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="relative mb-6">
              <div className="w-full h-28 sm:h-32 bg-gray-200 rounded-2xl overflow-hidden relative group">
                {coverImageSrc ? <img src={coverImageSrc} className="w-full h-full object-cover" alt="cover" /> : <div className="w-full h-full bg-gray-200" />}
                <button className="absolute inset-0 bg-black/30 flex items-center justify-center text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" aria-label="Chỉnh sửa ảnh bìa" title="Chỉnh sửa ảnh bìa">
                  <Camera size={20} />
                </button>
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white relative group">
                  {avatarSrc ? <img src={avatarSrc} className="w-full h-full object-cover" alt="avatar" /> : <div className="w-full h-full bg-gray-300" />}
                  <button className="absolute inset-0 bg-black/30 flex items-center justify-center text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" aria-label="Chỉnh sửa ảnh đại diện" title="Chỉnh sửa ảnh đại diện">
                    <Camera size={16}/>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <label className="block text-xs sm:text-sm font-black text-gray-500 uppercase mb-2">Ten hien thi</label>
              <input
                className="w-full p-4 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={data.tenTaiKhoan}
                onChange={(e) => setData({...data, tenTaiKhoan: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-gray-500 uppercase mb-2">Tieu su</label>
              <textarea
                className="w-full p-4 border border-gray-200 rounded-2xl h-24 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                value={data.bio}
                onChange={(e) => setData({...data, bio: e.target.value})}
                placeholder="Mo ta ngan ve ban"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-black text-gray-500 uppercase mb-2">Email</label>
                <input className="w-full p-4 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={data.email} onChange={(e) => setData({...data, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-black text-gray-500 uppercase mb-2">So dien thoai</label>
                <input className="w-full p-4 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={data.phoneNumber} onChange={(e) => setData({...data, phoneNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-black text-gray-500 uppercase mb-2">Ngay sinh</label>
                <input type="date" className="w-full p-4 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={data.ngaySinh ? data.ngaySinh.slice(0, 10) : ''} onChange={(e) => setData({...data, ngaySinh: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-black text-gray-500 uppercase mb-2">Gioi tinh</label>
                <input className="w-full p-4 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={data.gioiTinh} onChange={(e) => setData({...data, gioiTinh: e.target.value})} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-black text-gray-500 uppercase mb-2">Dia chi</label>
                <input className="w-full p-4 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={data.diaChi} onChange={(e) => setData({...data, diaChi: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-gray-500 uppercase mb-4">Thong tin hien thi</label>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { id: 'showEmail', label: 'Hien thi Email', value: data.showEmail },
                  { id: 'showPhone', label: 'Hien thi So dien thoai', value: data.showPhone },
                  { id: 'showWorkplace', label: 'Hien thi Noi lam viec', value: data.showWorkplace }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setData({...data, [item.id]: !item.value})}
                    className={`flex justify-between items-center p-4 border rounded-2xl cursor-pointer transition-all ${item.value ? 'border-blue-500 bg-blue-50 shadow-[0_0_0_1px_rgba(59,130,246,0.5)]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                  >
                    <span className={`text-sm font-bold ${item.value ? 'text-blue-700' : 'text-gray-700'}`}>{item.label}</span>
                    {item.value ? <CheckCircle2 size={20} className="text-blue-600 fill-blue-50" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-sm font-bold text-red-500">{error}</p>}
          </div>

          <div className="p-4 border-t bg-gray-50 flex gap-3 sticky bottom-0">
            <button onClick={handleAttemptClose} className="flex-1 py-3 bg-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-300 active:scale-95 transition-all text-sm sm:text-base">Huy</button>
            <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-blue-800 shadow-lg shadow-blue-100 active:scale-95 transition-all text-sm sm:text-base">
              <Save size={18} /> {isSaving ? 'Dang luu...' : 'Luu lai'}
            </button>
          </div>
        </div>
      </div>

      {showConfirmClose && <ConfirmModal onConfirm={onClose} onCancel={() => setShowConfirmClose(false)} />}
    </>
  );
};

export default EditProfileModal;
