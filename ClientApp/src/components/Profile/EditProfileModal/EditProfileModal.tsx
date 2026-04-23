import { X, Save, Camera, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import ConfirmModal from './ConfirmModal'; // Đảm bảo đúng đường dẫn

const EditProfileModal = ({ onClose, initialData }: { onClose: () => void, initialData: any }) => {
  const [data, setData] = useState(initialData);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Kiểm tra xem user đã sửa gì chưa
  const isDirty = JSON.stringify(data) !== JSON.stringify(initialData);

  const handleAttemptClose = () => {
    isDirty ? setShowConfirmClose(true) : onClose();
  };

  // Logic Click Outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!showConfirmClose && modalRef.current && !modalRef.current.contains(e.target as Node)) handleAttemptClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isDirty, showConfirmClose]);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[3000] flex items-center justify-center p-4 backdrop-blur-sm">
        <div ref={modalRef} className="bg-white w-full max-w-xl rounded-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold">Chỉnh sửa trang cá nhân</h2>
            <button onClick={handleAttemptClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
          </div>

          <div className="p-6 space-y-8 overflow-y-auto flex-1">
            {/* Media Section */}
            <div className="relative h-40 mb-10">
              <div className="w-full h-32 bg-gray-200 rounded-xl overflow-hidden relative group">
                <img src={data.coverImage} className="w-full h-full object-cover" alt="cover" />
                <button className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><Camera /></button>
              </div>
              <div className="absolute -bottom-6 left-6">
                <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md bg-white">
                  <img src={data.avatar} className="w-full h-full object-cover" alt="avatar" />
                  <button className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><Camera size={14}/></button>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tiểu sử</label>
              <textarea 
                className="w-full p-4 border rounded-xl h-24 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" 
                value={data.bio}
                onChange={(e) => setData({...data, bio: e.target.value})}
              />
            </div>

            {/* Display Settings Section */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4">Thông tin hiển thị</label>
              <div className="space-y-3">
                {[
                  { id: 'showEmail', label: 'Hiển thị Email', value: data.showEmail },
                  { id: 'showPhone', label: 'Hiển thị Số điện thoại', value: data.showPhone },
                  { id: 'showWorkplace', label: 'Hiển thị Nơi làm việc', value: data.showWorkplace }
                ].map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setData({...data, [item.id]: !item.value})}
                    className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-all ${item.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                  >
                    <span className={`text-sm font-medium ${item.value ? 'text-blue-700' : 'text-gray-700'}`}>{item.label}</span>
                    {item.value ? <CheckCircle2 size={18} className="text-blue-600" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 flex gap-3">
            <button onClick={handleAttemptClose} className="flex-1 py-2.5 bg-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-300">Hủy</button>
            <button className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg">
              <Save size={18} /> Lưu thay đổi
            </button>
          </div>
        </div>
      </div>

      {/* Render lồng ConfirmModal */}
      {showConfirmClose && <ConfirmModal onConfirm={onClose} onCancel={() => setShowConfirmClose(false)} />}
    </>
  );
};

export default EditProfileModal;