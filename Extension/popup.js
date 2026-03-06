// ==========================================
// CONFIGURATION & STORAGE
// ==========================================

let API_BASE_URL = 'http://localhost:8000'; // Update to your FastAPI backend URL
const STORAGE_KEYS = {
    SETTINGS: 'intelligenceScout_settings',
    LEADS: 'capturedLeads',
    ACTIVITY_LOG: 'activityLog'
};

// DOM Elements
const captureTab = document.getElementById('capture-tab');
const leadsTab = document.getElementById('leads-tab');
const settingsTab = document.getElementById('settings-tab');
const tabButtons = document.querySelectorAll('.tab-btn');

const loadingEl = document.getElementById('loading');
const contentEl = document.getElementById('content');
const errorEl = document.getElementById('error');
const successEl = document.getElementById('success');
const errorText = document.getElementById('errorText');
const successText = document.getElementById('successText');
const leadsContainer = document.getElementById('leadsContainer');
const leadsStatus = document.getElementById('leadsStatus');
const leadsCount = document.getElementById('leadsCount');
const leadsBulkActions = document.getElementById('leadsBulkActions');

const leadNameEl = document.getElementById('leadName');
const leadRoleEl = document.getElementById('leadRole');
const leadCompanyEl = document.getElementById('leadCompany');
const leadUrlEl = document.getElementById('leadUrl');
const aiInsightEl = document.getElementById('aiInsight');
const enrollBtn = document.getElementById('enrollBtn');
const saveBtn = document.getElementById('saveBtn');
const viewDetailsBtn = document.getElementById('viewDetailsBtn');
const meterFill = document.getElementById('meterFill');
const meterText = document.getElementById('meterText');
const syncBtn = document.getElementById('syncBtn');
const clearBtn = document.getElementById('clearBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const apiUrlInput = document.getElementById('apiUrl');
const exportBtn = document.getElementById('exportBtn');

// Path selector buttons
const pathBtns = document.querySelectorAll('.path-btn');

let currentLeadData = null;
let selectedPath = 'technical';
let allLeads = [];

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    await loadLeads();
    setupTabNavigation();
    setupEventListeners();
    await fetchCurrentTabData();
});

// ==========================================
// TAB NAVIGATION
// ==========================================

function setupTabNavigation() {
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active state from all buttons
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Set active button
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Load tab-specific data
    if (tabName === 'leads') {
        renderLeadsList();
    } else if (tabName === 'settings') {
        loadSettingsUI();
    }
}

// ==========================================
// LEAD CAPTURE (LinkedIn Page)
// ==========================================

async function fetchCurrentTabData() {
    showLoading(true);
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Check if on LinkedIn
        if (!tab.url.includes('linkedin.com')) {
            showError('Please open this extension on a LinkedIn profile page.');
            showContent(false);
            return;
        }
        
        // Send message to content script to extract lead data
        chrome.tabs.sendMessage(tab.id, { action: 'getLeadData' }, (response) => {
            if (chrome.runtime.lastError) {
                showError('Please refresh the page and try again.');
                showContent(false);
                return;
            }
            
            if (response && response.leadData) {
                currentLeadData = response.leadData;
                displayLeadInfo();
                generateAIInsight();
                calculateHumanLikelihood();
                showLoading(false);
            } else {
                showError('Could not extract lead information. Make sure you\'re on a LinkedIn profile.');
                showContent(false);
                showLoading(false);
            }
        });
    } catch (error) {
        showError(`Error: ${error.message}`);
        showContent(false);
        showLoading(false);
    }
}

function displayLeadInfo() {
    if (!currentLeadData) return;
    
    leadNameEl.textContent = currentLeadData.name || 'Unknown';
    leadRoleEl.textContent = currentLeadData.role || 'Unknown';
    leadCompanyEl.textContent = currentLeadData.company || 'Unknown';
    
    if (currentLeadData.profileUrl) {
        leadUrlEl.innerHTML = '<a href="' + currentLeadData.profileUrl + '" target="_blank">View Profile ↗</a>';
    } else {
        leadUrlEl.textContent = 'Not available';
    }
    
    showContent(true);
}

async function generateAIInsight() {
    if (!currentLeadData) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/generate-insight`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: currentLeadData.name,
                role: currentLeadData.role,
                company: currentLeadData.company,
                recentPost: currentLeadData.recentPost || ''
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            selectedPath = data.recommendedPath || 'technical';
            updatePathSelector();
            aiInsightEl.innerHTML = `
                <p><strong>Insight:</strong> ${data.insight || 'Analyzing lead profile...'}</p>
                <p style="margin-top: 8px; font-size: 11px; color: #999;">
                    Confidence: ${(data.confidence * 100).toFixed(0)}%
                </p>
            `;
        } else {
            setDefaultInsight();
        }
    } catch (error) {
        console.log('Backend unavailable - using default insight');
        setDefaultInsight();
    }
}

function setDefaultInsight() {
    aiInsightEl.innerHTML = `
        <p><strong>Profile Analysis:</strong> ${selectedPath.charAt(0).toUpperCase() + selectedPath.slice(1)} approach recommended.</p>
        <p style="margin-top: 8px;">Personalize outreach based on their ${selectedPath} background.</p>
    `;
}

function calculateHumanLikelihood() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    let score = 0;
    
    if (hour >= 9 && hour <= 17) {
        score += 30;
    }
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        score += 25;
    }
    
    score += Math.random() * 25;
    score = Math.min(100, Math.max(0, score));
    
    updateMeterDisplay(score);
}

function updateMeterDisplay(score) {
    meterFill.style.width = score + '%';
    
    let status = '';
    let recommendation = '';
    
    if (score >= 80) {
        status = '✅ Safe to Send';
        recommendation = 'Perfect time for human-like behavior!';
    } else if (score >= 60) {
        status = '⚠️ Good to Send';
        recommendation = 'You can send, but waiting would look more natural.';
    } else {
        status = '⏳ Delay Recommended';
        const delay = Math.floor(Math.random() * 2) + 1;
        recommendation = `Wait ${delay}-3 hours for optimal human-like appearance.`;
    }
    
    meterText.innerHTML = `<strong>${status}</strong><br/>${recommendation}`;
}

function updatePathSelector() {
    pathBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.path === selectedPath) {
            btn.classList.add('active');
        }
    });
}

// ==========================================
// LEADS MANAGEMENT
// ==========================================

async function loadLeads() {
    return new Promise((resolve) => {
        chrome.storage.local.get(STORAGE_KEYS.LEADS, (result) => {
            allLeads = result[STORAGE_KEYS.LEADS] || [];
            updateLeadsCount();
            resolve();
        });
    });
}

function updateLeadsCount() {
    leadsCount.textContent = allLeads.length;
    leadsStatus.textContent = `${allLeads.length} lead${allLeads.length !== 1 ? 's' : ''} collected`;
}

async function saveLead() {
    if (!currentLeadData) return;
    
    const leadToSave = {
        id: 'lead_' + Date.now(),
        ...currentLeadData,
        outreachPath: selectedPath,
        capturedAt: new Date().toISOString(),
        synced: false
    };
    
    allLeads.push(leadToSave);
    
    return new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEYS.LEADS]: allLeads }, () => {
            updateLeadsCount();
            logActivity('lead_saved', { name: currentLeadData.name, company: currentLeadData.company });
            
            successText.textContent = `✅ ${currentLeadData.name} saved to collection!`;
            showSuccess(true);
            
            setTimeout(() => {
                showSuccess(false);
            }, 3000);
            
            resolve();
        });
    });
}

function renderLeadsList() {
    if (allLeads.length === 0) {
        leadsContainer.innerHTML = '<p class="empty-state">No leads captured yet. Go to LinkedIn and click "Save to Collection" on profiles!</p>';
        leadsBulkActions.style.display = 'none';
        return;
    }
    
    leadsContainer.innerHTML = '';
    
    allLeads.forEach((lead, index) => {
        const card = document.createElement('div');
        card.className = 'lead-card';
        card.innerHTML = `
            <div class="lead-card-header">
                <div>
                    <div class="lead-card-name">${lead.name}</div>
                    <div class="lead-card-meta">
                        ${lead.role} • ${lead.company}
                    </div>
                    <div class="lead-card-meta">
                        Path: <strong>${lead.outreachPath || 'technical'}</strong> 
                        ${lead.synced ? '✅ Synced' : '⏳ Pending'}
                    </div>
                </div>
            </div>
            <div class="lead-card-actions">
                <button class="lead-card-btn" onclick="viewLead(${index})" title="View full details">👁️ View</button>
                <button class="lead-card-btn delete" onclick="removeLead(${index})" title="Remove from collection">✕ Remove</button>
            </div>
        `;
        leadsContainer.appendChild(card);
    });
    
    leadsBulkActions.style.display = 'block';
}

function removeLead(index) {
    const lead = allLeads[index];
    if (confirm(`Remove ${lead.name}?`)) {
        allLeads.splice(index, 1);
        chrome.storage.local.set({ [STORAGE_KEYS.LEADS]: allLeads }, () => {
            updateLeadsCount();
            renderLeadsList();
            logActivity('lead_removed', { name: lead.name });
        });
    }
}

function viewLead(index) {
    const lead = allLeads[index];
    if (lead.profileUrl) {
        window.open(lead.profileUrl, '_blank');
    }
}

async function syncLeadsToWebsite() {
    if (allLeads.length === 0) {
        alert('No leads to sync!');
        return;
    }
    
    const unsyncedLeads = allLeads.filter(l => !l.synced);
    
    if (unsyncedLeads.length === 0) {
        alert('All leads already synced!');
        return;
    }
    
    syncBtn.disabled = true;
    syncBtn.textContent = '🔄 Syncing...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/sync-leads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                leads: unsyncedLeads,
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Mark synced leads
            allLeads = allLeads.map(lead => ({
                ...lead,
                synced: true
            }));
            
            chrome.storage.local.set({ [STORAGE_KEYS.LEADS]: allLeads }, () => {
                renderLeadsList();
                alert(`✅ Synced ${unsyncedLeads.length} lead(s) to your website!`);
                logActivity('leads_synced', { count: unsyncedLeads.length });
            });
        } else {
            alert('Failed to sync leads. Check your backend connection.');
        }
    } catch (error) {
        alert(`Sync error: ${error.message}`);
    } finally {
        syncBtn.disabled = false;
        syncBtn.textContent = '🔄 Sync to Website';
    }
}

async function clearAllLeads() {
    if (!confirm(`Delete all ${allLeads.length} leads? This cannot be undone.`)) {
        return;
    }
    
    allLeads = [];
    chrome.storage.local.set({ [STORAGE_KEYS.LEADS]: [] }, () => {
        updateLeadsCount();
        renderLeadsList();
        logActivity('all_leads_cleared', {});
    });
}

// ==========================================
// SETTINGS
// ==========================================

async function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(STORAGE_KEYS.SETTINGS, (result) => {
            const settings = result[STORAGE_KEYS.SETTINGS] || {};
            if (settings.apiUrl) {
                API_BASE_URL = settings.apiUrl;
            }
            resolve(settings);
        });
    });
}

function loadSettingsUI() {
    apiUrlInput.value = API_BASE_URL;
}

function saveSettings() {
    const settings = {
        apiUrl: apiUrlInput.value || API_BASE_URL,
        autoCapture: document.getElementById('autoCapture').checked,
        aiInsights: document.getElementById('aiInsights').checked,
        humanTiming: document.getElementById('humanTiming').checked
    };
    
    API_BASE_URL = settings.apiUrl;
    
    chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: settings }, () => {
        alert('✅ Settings saved!');
        logActivity('settings_updated', {});
    });
}

function exportLeads() {
    if (allLeads.length === 0) {
        alert('No leads to export!');
        return;
    }
    
    const dataStr = JSON.stringify(allLeads, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aurareach_leads_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    logActivity('leads_exported', { count: allLeads.length });
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    pathBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            selectedPath = e.currentTarget.dataset.path;
            updatePathSelector();
        });
    });
    
    saveBtn.addEventListener('click', saveLead);
    
    enrollBtn.addEventListener('click', async () => {
        if (!currentLeadData) return;
        
        enrollBtn.disabled = true;
        enrollBtn.textContent = '⏳ Sending...';
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/enroll-lead`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: currentLeadData.name,
                    role: currentLeadData.role,
                    company: currentLeadData.company,
                    profileUrl: currentLeadData.profileUrl,
                    email: currentLeadData.email || '',
                    outreachPath: selectedPath,
                    source: 'extension_direct',
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                successText.textContent = `✅ ${currentLeadData.name} sent to AuraReach!`;
                showSuccess(true);
                logActivity('lead_enrolled_direct', { name: currentLeadData.name });
            } else {
                alert('Failed to enroll lead. Check your connection.');
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            enrollBtn.disabled = false;
            enrollBtn.textContent = '✨ Send Directly';
        }
    });
    
    viewDetailsBtn.addEventListener('click', () => {
        if (currentLeadData && currentLeadData.profileUrl) {
            chrome.tabs.create({ url: currentLeadData.profileUrl });
        }
    });
    
    syncBtn.addEventListener('click', syncLeadsToWebsite);
    clearBtn.addEventListener('click', clearAllLeads);
    saveSettingsBtn.addEventListener('click', saveSettings);
    exportBtn.addEventListener('click', exportLeads);
}

// ==========================================
// ACTIVITY LOGGING
// ==========================================

function logActivity(action, details) {
    chrome.storage.local.get(STORAGE_KEYS.ACTIVITY_LOG, (result) => {
        const log = result[STORAGE_KEYS.ACTIVITY_LOG] || [];
        log.push({
            action,
            details,
            timestamp: new Date().toISOString()
        });
        
        if (log.length > 100) {
            log.shift();
        }
        
        chrome.storage.local.set({ [STORAGE_KEYS.ACTIVITY_LOG]: log });
    });
}

// ==========================================
// UI HELPERS
// ==========================================

function showLoading(show) {
    loadingEl.style.display = show ? 'flex' : 'none';
    contentEl.style.display = show ? 'none' : 'block';
    errorEl.style.display = 'none';
    successEl.style.display = 'none';
}

function showContent(show) {
    contentEl.style.display = show ? 'block' : 'none';
    loadingEl.style.display = 'none';
    errorEl.style.display = 'none';
    successEl.style.display = 'none';
}

function showError(message) {
    errorText.textContent = message;
    errorEl.style.display = 'block';
    contentEl.style.display = 'none';
    loadingEl.style.display = 'none';
    successEl.style.display = 'none';
}

function showSuccess(show) {
    if (show) {
        successEl.style.display = 'block';
        contentEl.style.display = 'none';
        errorEl.style.display = 'none';
        loadingEl.style.display = 'none';
    } else {
        successEl.style.display = 'none';
    }
}
