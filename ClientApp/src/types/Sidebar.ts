import type { LucideIcon } from 'lucide-react';

export interface SidebarProps {
  onDashboardClick: () => void;
}

export interface ISidebarItem {
  name: string;
  icon: LucideIcon;
  path: string;
  subitems?: ISubItem[];
  onClick?: () => void;
  // Danh sách các quyền được phép xem mục này
  roles?: string[];
  // Badge số (ví dụ: số tin nhắn chưa đọc)
  badge?: number;
}

export interface ISubItem {
  name: string;
  path: string;
  icon: LucideIcon;
}