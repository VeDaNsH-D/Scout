import apiService from './api';
import { API_ENDPOINTS } from '../config/api';

export const leadsService = {
  async getAll() {
    return apiService.get(API_ENDPOINTS.LEADS.LIST);
  },

  async getById(id) {
    return apiService.get(API_ENDPOINTS.LEADS.GET(id));
  },

  async upload(file) {
    return apiService.upload(API_ENDPOINTS.LEADS.UPLOAD, file, 'file');
  },

  async delete(id) {
    return apiService.delete(API_ENDPOINTS.LEADS.DELETE(id));
  },
};

export default leadsService;
