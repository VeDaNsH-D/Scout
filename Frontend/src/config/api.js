// API Configuration
// Use relative URLs by default so Vite's dev proxy (`/api` -> backend)
// handles requests in development. For production, set `VITE_API_URL`.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
