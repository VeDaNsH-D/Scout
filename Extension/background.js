// Background Service Worker - Handles API calls and message routing

const API_BASE_URL = 'http://localhost:8000'; // Update to your FastAPI backend

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'enrollLead') {
        enrollLeadToWorkflow(request.leadData)
            .then(result => {
                sendResponse({ success: true, data: result });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });
        return true; // Will respond asynchronously
    }
});

// Enroll lead to workflow via API
async function enrollLeadToWorkflow(leadData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/enroll-lead`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'AuraReach-Extension/1.0'
            },
            body: JSON.stringify({
                name: leadData.name,
                role: leadData.role,
                company: leadData.company,
                email: leadData.email || '',
                profileUrl: leadData.profileUrl,
                source: 'extension',
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Log the action for analytics
        logAction('lead_enrolled', {
            leadName: leadData.name,
            company: leadData.company,
            timestamp: new Date().toISOString()
        });
        
        return data;
    } catch (error) {
        console.error('Failed to enroll lead:', error);
        throw error;
    }
}

// Get stored leads for website sync
async function getStoredLeads() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(STORAGE_KEYS.LEADS, (result) => {
            const leads = result[STORAGE_KEYS.LEADS] || [];
            resolve(leads);
        });
    });
}

// Clear stored leads after sync
async function clearStoredLeads() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [STORAGE_KEYS.LEADS]: [] }, () => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(true);
            }
        });
    });
}

// Listen for extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Open welcome page
        chrome.tabs.create({ 
            url: 'https://yoursite.com/extension-welcome',
            active: true
        });
        
        // Initialize settings
        chrome.storage.sync.set({
            'intelligenceScout_settings': {
                apiUrl: API_BASE_URL,
                enabled: true,
                autoCapture: true,
                humanLikeDelay: true
            }
        });
    }
});

// Periodic task: Clean up old activity logs
chrome.alarms.create('cleanupLogs', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'cleanupLogs') {
        chrome.storage.local.get(['activityLog'], (result) => {
            const log = result.activityLog || [];
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            
            const filtered = log.filter(entry => {
                return new Date(entry.timestamp) > oneWeekAgo;
            });
            
            chrome.storage.local.set({ activityLog: filtered });
        });
    }
});
