// Website Bridge Script - Inject this into your AuraReach website
// This allows your website to request captured leads from the extension

// Check if extension is installed by looking for extension messages
window.extensionData = {
    leads: [],
    isConnected: false
};

/**
 * Request leads from the Intelligence Scout extension
 * Usage: window.extensionData.getLeads()
 */
window.extensionData.getLeads = async function() {
    return new Promise((resolve, reject) => {
        // Request leads from Chrome extension via content script
        chrome.runtime?.sendMessage(
            { 
                action: 'getLeads'
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error('Extension not installed or not responding'));
                    return;
                }
                
                if (response && response.leads) {
                    window.extensionData.leads = response.leads;
                    window.extensionData.isConnected = true;
                    resolve(response.leads);
                } else {
                    reject(new Error('No leads available'));
                }
            }
        );
    });
};

/**
 * Clear leads from extension after syncing
 * Usage: window.extensionData.clearLeads()
 */
window.extensionData.clearLeads = async function() {
    return new Promise((resolve, reject) => {
        chrome.runtime?.sendMessage(
            { 
                action: 'clearLeads'
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error('Extension not responding'));
                    return;
                }
                
                resolve(response?.success || false);
            }
        );
    });
};

/**
 * Display leads in a modal on your website
 * Usage: window.extensionData.showLeadsModal()
 */
window.extensionData.showLeadsModal = async function() {
    try {
        const leads = await window.extensionData.getLeads();
        
        if (leads.length === 0) {
            alert('No leads captured in extension!');
            return;
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'aurareach-leads-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            padding: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;
        
        // Header
        const header = document.createElement('div');
        header.innerHTML = `
            <h2 style="margin: 0 0 8px 0; color: #667eea; font-size: 22px;">
                📊 Captured Leads from Extension
            </h2>
            <p style="margin: 0 0 16px 0; color: #999; font-size: 14px;">
                ${leads.length} lead${leads.length !== 1 ? 's' : ''} ready to sync
            </p>
        `;
        modalContent.appendChild(header);
        
        // Leads list
        const leadsDiv = document.createElement('div');
        leadsDiv.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 20px;
        `;
        
        leads.forEach((lead, index) => {
            const card = document.createElement('div');
            card.style.cssText = `
                padding: 12px;
                background: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            card.onmouseenter = () => {
                card.style.borderColor = '#667eea';
                card.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.1)';
            };
            
            card.onmouseleave = () => {
                card.style.borderColor = '#ddd';
                card.style.boxShadow = 'none';
            };
            
            card.innerHTML = `
                <div style="font-weight: 600; color: #333; font-size: 14px; margin-bottom: 4px;">
                    ${lead.name}
                </div>
                <div style="font-size: 12px; color: #666; margin-bottom: 6px;">
                    ${lead.role} at ${lead.company}
                </div>
                <div style="font-size: 11px; color: #999;">
                    Path: <strong>${lead.outreachPath}</strong> | Captured: ${new Date(lead.capturedAt).toLocaleDateString()}
                </div>
            `;
            
            leadsDiv.appendChild(card);
        });
        
        modalContent.appendChild(leadsDiv);
        
        // Action buttons
        const actions = document.createElement('div');
        actions.style.cssText = `
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        `;
        
        const syncBtn = document.createElement('button');
        syncBtn.textContent = '✨ Sync All Leads';
        syncBtn.style.cssText = `
            flex: 1;
            min-width: 140px;
            padding: 10px 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.3s ease;
        `;
        
        syncBtn.onmouseover = () => {
            syncBtn.style.transform = 'translateY(-2px)';
            syncBtn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        };
        
        syncBtn.onmouseout = () => {
            syncBtn.style.transform = 'none';
            syncBtn.style.boxShadow = 'none';
        };
        
        syncBtn.onclick = async () => {
            // You can add your own sync logic here
            alert(`Syncing ${leads.length} leads...`);
            // Example: Send leads to your backend
            // await fetch('/api/sync-leads', { method: 'POST', body: JSON.stringify(leads) });
        };
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕ Close';
        closeBtn.style.cssText = `
            flex: 1;
            min-width: 100px;
            padding: 10px 16px;
            background: #f0f0f0;
            color: #333;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 13px;
        `;
        
        closeBtn.onclick = () => {
            document.body.removeChild(modal);
        };
        
        actions.appendChild(syncBtn);
        actions.appendChild(closeBtn);
        modalContent.appendChild(actions);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

// Auto-detect and show notification if extension is available
window.addEventListener('load', () => {
    // Try to detect if extension is available
    chrome.runtime?.sendMessage(
        { action: 'ping' },
        (response) => {
            if (!chrome.runtime.lastError) {
                window.extensionData.isConnected = true;
                
                // Show a subtle notification
                const banner = document.createElement('div');
                banner.id = 'aurareach-extension-banner';
                banner.style.cssText = `
                    position: fixed;
                    top: 0;
                    right: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 12px 16px;
                    border-radius: 0 0 0 12px;
                    font-size: 12px;
                    z-index: 9999;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                `;
                
                banner.textContent = '✨ Intelligence Scout Connected - Click to view captured leads';
                banner.onclick = () => {
                    window.extensionData.showLeadsModal();
                    banner.style.display = 'none';
                };
                
                document.body.appendChild(banner);
                
                // Auto-hide after 10 seconds
                setTimeout(() => {
                    if (banner.parentElement) {
                        banner.style.display = 'none';
                    }
                }, 10000);
            }
        }
    );
});

console.log('🎯 Intelligence Scout Website Bridge loaded');
console.log('Usage: window.extensionData.showLeadsModal()');
console.log('Or: window.extensionData.getLeads()');
