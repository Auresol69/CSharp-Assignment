import axios from "axios";

const api = axios.create({
  baseURL: "http://10.218.174.93:5153/api",
});

// Load token from localStorage on startup
function initializeAuth() {
  try {
    const auth = localStorage.getItem("auth");
    if (auth) {
      const data = JSON.parse(auth);
      if (data.accessToken) {
        api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
      }
    }
  } catch (e) {
    // Silent fail
  }
}

// Initialize on module load
initializeAuth();

export default api;
