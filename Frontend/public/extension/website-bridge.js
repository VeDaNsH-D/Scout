// Re-export of the extension website bridge so Vite can serve it from /public.
// Original source lives in /Extension/website-bridge.js in the repo.

// NOTE: this file should stay in sync with the extension version.

window.extensionData = {
    leads: [],
    isConnected: false
};

window.extensionData.getLeads = async function () {
    return new Promise((resolve, reject) => {
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

window.extensionData.clearLeads = async function () {
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

window.extensionData.showLeadsModal = async function () {
    try {
        const leads = await window.extensionData.getLeads();

        if (leads.length === 0) {
            alert('No leads captured in extension!');
            return;
        }

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

        const leadsDiv = document.createElement('div');
        leadsDiv.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 20px;
        `;

        leads.forEach((lead) => {
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
            alert(`Syncing ${leads.length} leads...`);
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

window.addEventListener('load', () => {
    chrome.runtime?.sendMessage(
        { action: 'ping' },
        () => {
            if (!chrome.runtime.lastError) {
                window.extensionData.isConnected = true;
            }
        }
    );
});

