import api from './api';

export async function sendFriendRequest(recipientId: string) {
  const res = await api.post(`/friendship/${recipientId}/request`);
  return res.data as { success: boolean; message: string };
}

export async function acceptFriendRequest(senderId: string) {
  const res = await api.post(`/friendship/${senderId}/accept`);
  return res.data as { success: boolean; message: string };
}
