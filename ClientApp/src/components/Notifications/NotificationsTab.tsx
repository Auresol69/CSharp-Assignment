import { useTheme } from "../../context/ThemeContext";
import type { ITabsProps } from "../../types/Notifications";

const NotificationTabs = ({ filter, setFilter, showModeration }: ITabsProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "unread", label: "Chưa đọc" },
    ...(showModeration ? [{ id: "moderation", label: "Kiểm duyệt" } as const] : []),
  ] as const;

  return (
    <div className={`flex px-4 border-b ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setFilter(t.id)}
          className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            filter === t.id
              ? "border-blue-600 text-blue-600"
              : `border-transparent ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default NotificationTabs;