import apiService from './api';
import { API_ENDPOINTS } from '../config/api';

/**
 * Service for ML-powered lead analysis.
 * Calls the backend orchestrator which coordinates:
 * - Lead Scoring
 * - Insights Generation
 * - Send Time Optimization
 * - Workflow Strategy Generation
 */
export const analyzeService = {
  /**
   * Analyze a lead using ML models.
   * 
   * @param {Object} leadFeatures - The lead features to analyze
   * @param {string} leadFeatures.role - Job role (e.g., "CTO", "Marketing Manager")
   * @param {string} leadFeatures.industry - Industry (e.g., "SaaS", "AI")
   * @param {string} leadFeatures.company_size - Size (e.g., "small", "medium", "large")
   * @param {string} leadFeatures.lead_source - Source (e.g., "Referral", "Website")
   * @param {string} leadFeatures.company_name - Company name
   * 
   * @returns {Promise<Object>} Analysis result containing:
   *   - lead_score: number (0-1)
   *   - insights: string[]
   *   - best_send_day: string
   *   - best_send_hour: number
   *   - workflow_template: Object
   */
  async analyzeLead(leadFeatures) {
    return apiService.post(API_ENDPOINTS.ANALYZE.LEAD, {
      lead_features: leadFeatures
    });
  },
};

export default analyzeService;
