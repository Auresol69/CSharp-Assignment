import { Heart, MessageCircle, UserPlus, MoreHorizontal, Circle } from 'lucide-react';
import type { INotification } from '../../types/Notifications';

const NotificationItem = ({ data }: { data: INotification }) => {
  const renderIcon = (type: string) => {
    switch (type) {
      case 'like': return <div className="absolute -bottom-1 -right-1 bg-red-500 p-0.5 rounded-full border-2 border-white"><Heart size={10} fill="white" className="text-white" /></div>;
      case 'comment': return <div className="absolute -bottom-1 -right-1 bg-green-500 p-0.5 rounded-full border-2 border-white"><MessageCircle size={10} fill="white" className="text-white" /></div>;
      case 'follow': return <div className="absolute -bottom-1 -right-1 bg-blue-500 p-0.5 rounded-full border-2 border-white"><UserPlus size={10} fill="white" className="text-white" /></div>;
      default: return null;
    }
  };

  return (
    <div className={`p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors relative ${!data.isRead ? 'bg-blue-50/40' : ''}`}>
      <div className="relative flex-shrink-0">
        <img src={data.user.avatar} className="w-12 h-12 rounded-full object-cover border" alt="avatar" />
        {renderIcon(data.type)}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-800 leading-tight">
          <span className="font-bold hover:underline">{data.user.name}</span> {data.content}
        </p>
        <span className={`text-[11px] mt-1 block ${!data.isRead ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>{data.time}</span>
      </div>
      {data.targetImage && <img src={data.targetImage} className="w-10 h-10 rounded-md object-cover flex-shrink-0" alt="target" />}
      <div className="flex flex-col items-center justify-between self-stretch">
        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16} /></button>
        {!data.isRead && <Circle size={10} fill="#2563eb" className="text-blue-600" />}
      </div>
    </div>
  );
};

export default NotificationItem;