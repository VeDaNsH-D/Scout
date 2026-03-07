// Popup Script - Handles popup UI interactions

const API_BASE_URL = 'http://localhost:8000';

const STORAGE_KEYS = {
    LEADS: 'intelligenceScout_leads',
    SETTINGS: 'intelligenceScout_settings',
};

// ── Tab Switching ────────────────────────────────────────────────

document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        // Deactivate all tabs and contents
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));

        btn.classList.add('active');
        const tabId = btn.dataset.tab + '-tab';
        const tabEl = document.getElementById(tabId);
        if (tabEl) tabEl.classList.add('active');
    });
});

// ── Path Selector ────────────────────────────────────────────────

document.querySelectorAll('.path-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.path-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// ── Capture Tab – Extract lead from active LinkedIn tab ─────────

async function loadLeadData() {
    const loadingEl = document.getElementById('loading');
    const contentEl = document.getElementById('content');
    const errorEl = document.getElementById('error');

    try {
        loadingEl.style.display = 'flex';
        contentEl.style.display = 'none';
        errorEl.style.display = 'none';

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab || !tab.url || !tab.url.includes('linkedin.com')) {
            showError('Navigate to a LinkedIn profile to capture lead data.');
            return;
        }

        // Ensure the content script is injected (it may not be if the page was
        // open before the extension was installed/reloaded)
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js'],
            });
        } catch (_) {
            // Already injected or no permission – continue anyway
        }

        // Helper: request lead data with a small delay for retries
        function requestLeadData(retriesLeft) {
            chrome.tabs.sendMessage(tab.id, { action: 'getLeadData' }, (response) => {
                if (chrome.runtime.lastError || !response || !response.leadData) {
                    if (retriesLeft > 0) {
                        setTimeout(() => requestLeadData(retriesLeft - 1), 1500);
                        return;
                    }
                    loadingEl.style.display = 'none';
                    showError('Could not read profile data. Make sure you are on a LinkedIn profile page.');
                    return;
                }

                const lead = response.leadData;

                // If name is still empty, the profile may not have rendered yet – retry
                if (!lead.name && retriesLeft > 0) {
                    setTimeout(() => requestLeadData(retriesLeft - 1), 1500);
                    return;
                }

                loadingEl.style.display = 'none';

                document.getElementById('leadName').textContent = lead.name || '-';
                document.getElementById('leadRole').textContent = lead.role || '-';
                document.getElementById('leadCompany').textContent = lead.company || '-';
                document.getElementById('leadUrl').textContent = lead.profileUrl || '-';

                contentEl.style.display = 'block';

                // Simple AI insight placeholder
                const insightBox = document.getElementById('aiInsight');
                if (insightBox) {
                    insightBox.innerHTML = generateInsight(lead);
                }

                // Human-likelihood meter
                updateMeter();
            });
        }

        // Start extraction with up to 5 retries (LinkedIn SPA loads slowly)
        requestLeadData(5);
    } catch (err) {
        showError(err.message);
    }
}

function showError(msg) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'none';
    const errorEl = document.getElementById('error');
    document.getElementById('errorText').textContent = msg;
    errorEl.style.display = 'block';
}

function showSuccess(msg) {
    const successEl = document.getElementById('success');
    document.getElementById('successText').textContent = msg;
    successEl.style.display = 'block';
    setTimeout(() => {
        successEl.style.display = 'none';
    }, 3000);
}

function generateInsight(lead) {
    if (!lead.name) return '<p>No lead data available.</p>';
    const role = lead.role || 'professional';
    const company = lead.company || 'their company';
    return `<p>Based on <strong>${lead.name}</strong>'s role as <em>${role}</em> at <strong>${company}</strong>, a personalised outreach focusing on relevant pain points is recommended.</p>`;
}

function updateMeter() {
    const hour = new Date().getHours();
    let score = 0;
    if (hour >= 9 && hour <= 11) score = 90;
    else if (hour >= 14 && hour <= 16) score = 80;
    else if (hour >= 8 && hour <= 17) score = 60;
    else score = 30;

    const fill = document.getElementById('meterFill');
    const text = document.getElementById('meterText');
    if (fill) fill.style.width = score + '%';
    if (text) {
        if (score >= 80) text.textContent = 'Great time to send outreach!';
        else if (score >= 50) text.textContent = 'Acceptable window – consider waiting for peak hours.';
        else text.textContent = 'Off-hours – schedule for business hours instead.';
    }
}

// ── Save / Enroll buttons ────────────────────────────────────────

document.getElementById('saveBtn')?.addEventListener('click', async () => {
    const lead = getCurrentLeadData();
    if (!lead.name) return;

    const result = await chrome.storage.local.get(STORAGE_KEYS.LEADS);
    const leads = result[STORAGE_KEYS.LEADS] || [];
    lead.savedAt = new Date().toISOString();
    leads.push(lead);
    await chrome.storage.local.set({ [STORAGE_KEYS.LEADS]: leads });
    updateLeadsCount(leads.length);
    showSuccess('Lead saved to collection!');
});

document.getElementById('enrollBtn')?.addEventListener('click', () => {
    const lead = getCurrentLeadData();
    if (!lead.name) return;

    chrome.runtime.sendMessage({ action: 'enrollLead', leadData: lead }, (response) => {
        if (response && response.success) {
            showSuccess('Lead sent to Scout!');
        } else {
            showError('Failed to enrol lead. Check backend connection.');
        }
    });
});

document.getElementById('viewDetailsBtn')?.addEventListener('click', async () => {
    const url = document.getElementById('leadUrl')?.textContent;
    if (url && url !== '-') {
        await chrome.tabs.create({ url, active: true });
    }
});

function getCurrentLeadData() {
    return {
        name: document.getElementById('leadName')?.textContent || '',
        role: document.getElementById('leadRole')?.textContent || '',
        company: document.getElementById('leadCompany')?.textContent || '',
        profileUrl: document.getElementById('leadUrl')?.textContent || '',
    };
}

// ── Leads Tab ────────────────────────────────────────────────────

async function renderLeads() {
    const result = await chrome.storage.local.get(STORAGE_KEYS.LEADS);
    const leads = result[STORAGE_KEYS.LEADS] || [];
    const container = document.getElementById('leadsContainer');
    const bulkActions = document.getElementById('leadsBulkActions');
    const status = document.getElementById('leadsStatus');

    updateLeadsCount(leads.length);
    if (status) status.textContent = `${leads.length} lead${leads.length !== 1 ? 's' : ''} collected`;

    if (leads.length === 0) {
        container.innerHTML = '<p class="empty-state">No leads captured yet. Go to LinkedIn and click "Save to Collection" on profiles!</p>';
        if (bulkActions) bulkActions.style.display = 'none';
        return;
    }

    if (bulkActions) bulkActions.style.display = 'block';

    container.innerHTML = leads
        .map(
            (l, i) => `
        <div class="lead-card" data-index="${i}">
            <strong>${escapeHtml(l.name)}</strong>
            <span class="lead-meta">${escapeHtml(l.role || '')} ${l.company ? '@ ' + escapeHtml(l.company) : ''}</span>
        </div>`
        )
        .join('');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function updateLeadsCount(count) {
    const el = document.getElementById('leadsCount');
    if (el) el.textContent = count;
}

document.getElementById('syncBtn')?.addEventListener('click', async () => {
    const result = await chrome.storage.local.get(STORAGE_KEYS.LEADS);
    const leads = result[STORAGE_KEYS.LEADS] || [];
    if (leads.length === 0) return;

    try {
        const resp = await fetch(`${API_BASE_URL}/api/enroll-lead`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leads }),
        });
        if (!resp.ok) throw new Error('Sync failed');
        await chrome.storage.local.set({ [STORAGE_KEYS.LEADS]: [] });
        renderLeads();
        showSuccess('Leads synced to website!');
    } catch (e) {
        showError('Sync failed: ' + e.message);
    }
});

document.getElementById('clearBtn')?.addEventListener('click', async () => {
    if (!confirm('Clear all captured leads?')) return;
    await chrome.storage.local.set({ [STORAGE_KEYS.LEADS]: [] });
    renderLeads();
});

// ── Settings Tab ─────────────────────────────────────────────────

async function loadSettings() {
    const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
    const settings = result[STORAGE_KEYS.SETTINGS] || {};

    const apiUrlInput = document.getElementById('apiUrl');
    if (apiUrlInput) apiUrlInput.value = settings.apiUrl || API_BASE_URL;

    const autoCapture = document.getElementById('autoCapture');
    if (autoCapture) autoCapture.checked = settings.autoCapture !== false;

    const aiInsights = document.getElementById('aiInsights');
    if (aiInsights) aiInsights.checked = settings.aiInsights !== false;

    const humanTiming = document.getElementById('humanTiming');
    if (humanTiming) humanTiming.checked = settings.humanLikeDelay !== false;
}

document.getElementById('saveSettingsBtn')?.addEventListener('click', async () => {
    const settings = {
        apiUrl: document.getElementById('apiUrl')?.value || API_BASE_URL,
        enabled: true,
        autoCapture: document.getElementById('autoCapture')?.checked ?? true,
        aiInsights: document.getElementById('aiInsights')?.checked ?? true,
        humanLikeDelay: document.getElementById('humanTiming')?.checked ?? true,
    };
    await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: settings });
    showSuccess('Settings saved!');
});

document.getElementById('exportBtn')?.addEventListener('click', async () => {
    const result = await chrome.storage.local.get(STORAGE_KEYS.LEADS);
    const leads = result[STORAGE_KEYS.LEADS] || [];
    if (leads.length === 0) {
        showError('No leads to export.');
        return;
    }
    const blob = new Blob([JSON.stringify(leads, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    await chrome.downloads.download({ url, filename: 'scout_leads.json', saveAs: true });
    URL.revokeObjectURL(url);
});

// ── Init ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    loadLeadData();
    renderLeads();
    loadSettings();
});
