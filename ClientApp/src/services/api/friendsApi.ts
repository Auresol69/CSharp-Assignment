import api from "../api";
import type { IFriend } from "../../types/Friends";

export const sendFriendRequest = (userId: string) => {
  return api.post(`/friends/request/${userId}`);
};

export const acceptFriendRequest = (senderId: string) => {
  return api.post(`/friends/accept/${senderId}`);
};

export const rejectFriendRequest = (senderId: string) => {
  return api.post(`/friends/reject/${senderId}`);
};

export const cancelFriendRequest = (userId: string) => {
  return api.post(`/friends/cancel/${userId}`);
};

export const unfriend = (userId: string) => {
  return api.post(`/friends/unfriend/${userId}`);
};

export const getFriends = () => {
  return api.get<IFriend[]>(`/friends/list`);
};

export const getFriendRequests = () => {
  return api.get<IFriend[]>(`/friends/requests`);
};

export const getRequests = getFriendRequests;

export const getSuggestions = () => {
  return api.get<IFriend[]>(`/friends/suggestions`);
};

