import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const authApi = {
  // API đăng nhập
  postLogin: (account) => {
    return axios.post(`${API_URL}/login`, account);
  },

  // API kiểm tra auth
  getAuth: () => {
    const token = localStorage.getItem('access_token');
    return axios.get(`${API_URL}/auth`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // API logout
  postLogout: () => {
    const token = localStorage.getItem('access_token');
    return axios.post(`${API_URL}/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // API refresh token
  postRefreshToken: (refreshToken) => {
    return axios.post(`${API_URL}/refresh-token`, { refresh_token: refreshToken });
  }
};

export default authApi;