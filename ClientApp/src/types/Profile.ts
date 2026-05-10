export interface IProfileResponseDto {
  id: string;
  tenTaiKhoan: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  ngaySinh?: string | null;
  gioiTinh?: string | null;
  diaChi?: string | null;
  createdAt: string;
  soLuongFollower: number;
  soLuongFollowing: number;
  soLuongPost: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

export interface IUpdateProfileRequest {
  tenTaiKhoan?: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bio?: string;
  ngaySinh?: string | null;
  gioiTinh?: string;
  diaChi?: string;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
