import api from './index';
import type {
  IChangePasswordRequest,
  IProfileResponseDto,
  IUpdateProfileRequest,
} from '../../types/Profile';

export async function getMyProfile() {
  const res = await api.get<IProfileResponseDto>('/profile/me');
  return res.data;
}

export async function getUserProfile(userId: string) {
  const res = await api.get<IProfileResponseDto>(`/profile/${userId}`);
  return res.data;
}

export async function updateMyProfile(request: IUpdateProfileRequest) {
  const res = await api.put<IProfileResponseDto>('/profile/me', request);
  return res.data;
}

export async function changePassword(request: IChangePasswordRequest) {
  const res = await api.post('/profile/change-password', request);
  return res.data as { message: string };
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/profile/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data as { avatarUrl: string };
}

export async function toggleFollow(userId: string) {
  const res = await api.post(`/profile/${userId}/follow`);
  return res.data as { message: string; isFollowing: boolean };
}

export async function getFollowers(userId: string, page = 1, size = 20) {
  const res = await api.get<IProfileResponseDto[]>(`/profile/${userId}/followers`, {
    params: { page, size },
  });
  return res.data;
}

export async function getFollowing(userId: string, page = 1, size = 20) {
  const res = await api.get<IProfileResponseDto[]>(`/profile/${userId}/following`, {
    params: { page, size },
  });
  return res.data;
}

