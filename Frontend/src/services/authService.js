import apiService from './api';
import { API_ENDPOINTS } from '../config/api';

export const authService = {
  async register(userData) {
    const response = await apiService.post(
      API_ENDPOINTS.AUTH.REGISTER,
      userData,
      { includeAuth: false }
    );
    
    if (response.token) {
      apiService.setToken(response.token);
    }
    
    return response;
  },

  async login(credentials) {
    const response = await apiService.post(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
      { includeAuth: false }
    );
    
    if (response.token) {
      apiService.setToken(response.token);
    }
    
    return response;
  },

  async getCurrentUser() {
    return apiService.get(API_ENDPOINTS.AUTH.ME);
  },

  logout() {
    apiService.removeToken();
  },

  isAuthenticated() {
    return !!apiService.getToken();
  },
};

export default authService;
