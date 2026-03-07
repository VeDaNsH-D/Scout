import apiService from './api';
import { API_ENDPOINTS } from '../config/api';

export const analyticsService = {
  async getCampaignAnalytics() {
    return apiService.get(API_ENDPOINTS.ANALYTICS.CAMPAIGN);
  },
  async getChartData() {
    return apiService.get(API_ENDPOINTS.ANALYTICS.CHART_DATA);
  },
};

export default analyticsService;
