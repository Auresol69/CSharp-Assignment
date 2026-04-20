import type { LucideIcon } from 'lucide-react';

export interface SidebarProps {
  onDashboardClick: () => void; // Thêm dòng này vào interface của Sidebar
}

export interface ISidebarItem {
  name: string;
  icon: LucideIcon;
  path: string;
  subitems?: ISubItem[];
  onClick?: () => void;
}

export interface ISubItem {
  name: string;
  path: string;
  icon: LucideIcon;
}
