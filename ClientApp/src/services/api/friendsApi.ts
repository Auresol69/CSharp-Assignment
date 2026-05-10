import axios from "axios";

const API_URL = "http://localhost:5000/api/friends"; // sửa theo backend bạn

const getToken = () => localStorage.getItem("token");

const config = {
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
};

// Gửi lời mời
export const sendFriendRequest = (userId: string) => {
    return axios.post(`${API_URL}/request/${userId}`, {}, config);
};

// Chấp nhận
export const acceptFriendRequest = (senderId: string) => {
    return axios.post(`${API_URL}/accept/${senderId}`, {}, config);
};

// Từ chối
export const rejectFriendRequest = (senderId: string) => {
    return axios.post(`${API_URL}/reject/${senderId}`, {}, config);
};

// Danh sách bạn bè
export const getFriends = () => {
    return axios.get(`${API_URL}/list`, config);
};

// Lời mời
export const getFriendRequests = () => {
    return axios.get(`${API_URL}/requests`, config);
};

// Gợi ý
export const getSuggestions = () => {
    return axios.get(`${API_URL}/suggestions`, config);
};