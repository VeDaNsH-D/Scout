import apiService from './api';
import { API_ENDPOINTS } from '../config/api';

export const workflowsService = {
  async getAll() {
    return apiService.get(API_ENDPOINTS.WORKFLOWS.LIST);
  },

  async getById(id) {
    return apiService.get(API_ENDPOINTS.WORKFLOWS.GET(id));
  },

  async create(workflowData) {
    return apiService.post(API_ENDPOINTS.WORKFLOWS.CREATE, workflowData);
  },

  async update(id, workflowData) {
    return apiService.put(API_ENDPOINTS.WORKFLOWS.UPDATE(id), workflowData);
  },

  async delete(id) {
    return apiService.delete(API_ENDPOINTS.WORKFLOWS.DELETE(id));
  },
};

export default workflowsService;
