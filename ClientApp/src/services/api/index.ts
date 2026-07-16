import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5153/api",
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
