import apiService from './api';
import { API_ENDPOINTS } from '../config/api';

export const analyticsService = {
  async getCampaignAnalytics() {
    return apiService.get(API_ENDPOINTS.ANALYTICS.CAMPAIGN);
  },
};

export default analyticsService;
