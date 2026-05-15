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
  // Thêm dòng này: Danh sách các quyền được phép xem mục này
  roles?: string[]; 
}

export interface ISubItem {
  name: string;
  path: string;
  icon: LucideIcon;
}