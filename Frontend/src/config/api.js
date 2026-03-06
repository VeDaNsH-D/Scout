// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
  },
  // Leads
  LEADS: {
    LIST: '/api/leads',
    UPLOAD: '/api/leads/upload',
    GET: (id) => `/api/leads/${id}`,
    DELETE: (id) => `/api/leads/${id}`,
  },
  // Workflows
  WORKFLOWS: {
    LIST: '/api/workflows',
    CREATE: '/api/workflows',
    GET: (id) => `/api/workflows/${id}`,
    UPDATE: (id) => `/api/workflows/${id}`,
    DELETE: (id) => `/api/workflows/${id}`,
  },
  // Analytics
  ANALYTICS: {
    CAMPAIGN: '/api/analytics/campaign',
  },
  // Messages
  MESSAGES: {
    LIST: '/api/messages',
  },
};
