import type { ITabsProps } from '../../types/Notifications';

const NotificationTabs = ({ filter, setFilter }: ITabsProps) => (
  <div className="flex px-4 border-b bg-white">
    {(['all', 'unread'] as const).map((t) => (
      <button 
        key={t}
        onClick={() => setFilter(t)}
        className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
          filter === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        {t === 'all' ? 'Tất cả' : 'Chưa đọc'}
      </button>
    ))}
  </div>
);

export default NotificationTabs;