import { AlertCircle } from 'lucide-react';

const ConfirmModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
    <div className="bg-white w-[350px] rounded-2xl p-6 shadow-2xl animate-in zoom-in duration-200 text-center border border-gray-100">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Hủy các thay đổi?</h3>
      <p className="text-sm text-gray-500 mb-6">Bạn có thay đổi chưa lưu. Nếu thoát bây giờ, dữ liệu sẽ bị mất.</p>
      <div className="flex flex-col gap-2">
        <button onClick={onConfirm} className="w-full py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors">Vẫn thoát và hủy</button>
        <button onClick={onCancel} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Tiếp tục chỉnh sửa</button>
      </div>
    </div>
  </div>
);
export default ConfirmModal;