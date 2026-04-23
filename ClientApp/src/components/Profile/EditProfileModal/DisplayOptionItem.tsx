import { CheckCircle2 } from 'lucide-react';

interface DisplayOptionProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
}

const DisplayOptionItem = ({ label, isActive, onToggle }: DisplayOptionProps) => (
  <div 
    onClick={onToggle}
    className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-all ${
      isActive ? 'border-blue-500 bg-blue-50 shadow-inner' : 'border-gray-200 bg-white hover:bg-gray-50'
    }`}
  >
    <span className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>{label}</span>
    {isActive ? (
      <CheckCircle2 size={18} className="text-blue-600 animate-in zoom-in duration-200" />
    ) : (
      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    )}
  </div>
);

export default DisplayOptionItem;