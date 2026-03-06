// Extension Configuration
// Update these values to match your setup

module.exports = {
    // FastAPI Backend
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    
    // LinkedIn Configuration
    LINKEDIN_PROFILE_REGEX: /linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
    
    // Feature Flags
    FEATURES: {
        AUTO_CAPTURE: true,
        AI_INSIGHTS: true,
        HUMAN_LIKE_TIMING: true,
        EMAIL_DETECTION: true,
        RECENT_POST_EXTRACTION: true
    },
    
    // Human-like behavior settings
    HUMAN_BEHAVIOR: {
        MIN_SEND_HOUR: 9,        // 9 AM
        MAX_SEND_HOUR: 17,       // 5 PM
        BUSINESS_DAYS_ONLY: true,
        MIN_DELAY_MINUTES: 30,
        MAX_DELAY_MINUTES: 180
    },
    
    // Storage keys
    STORAGE_KEYS: {
        SETTINGS: 'intelligenceScout_settings',
        ACTIVITY_LOG: 'activityLog',
        CACHED_INSIGHTS: 'cachedInsights',
        USER_PREFERENCES: 'userPreferences'
    },
    
    // API Endpoints
    ENDPOINTS: {
        ENROLL_LEAD: '/api/enroll-lead',
        GENERATE_INSIGHT: '/api/generate-insight',
        GET_RECOMMENDATION: '/api/get-recommendation',
        LOG_ACTIVITY: '/api/log-activity'
    },
    
    // Timeouts (in milliseconds)
    TIMEOUTS: {
        API_REQUEST: 10000,
        LEAD_EXTRACTION: 5000,
        INSIGHT_GENERATION: 8000
    }
};
