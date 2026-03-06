// Content Script - Injected into LinkedIn pages

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getLeadData') {
        const leadData = extractLeadData();
        console.log('[AuraReach] Extracted lead data:', JSON.stringify(leadData));
        sendResponse({ leadData });
    }
});

// Extract lead information from LinkedIn profile
function extractLeadData() {
    const leadData = {
        name: '',
        role: '',
        company: '',
        email: '',
        profileUrl: window.location.href,
        recentPost: ''
    };

    // Only extract from actual profile pages (linkedin.com/in/...)
    if (!window.location.pathname.startsWith('/in/')) {
        return leadData;
    }

    // ── Name ───────────────────────────────────────────────
    // Try every possible way to get the name

    // Method 1: All h1 elements - scan them all
    const allH1 = document.querySelectorAll('h1');
    console.log('[AuraReach] Found', allH1.length, 'h1 elements');
    for (const h1 of allH1) {
        const text = h1.innerText.trim();
        console.log('[AuraReach] h1 text:', text, 'classes:', h1.className);
        if (text && text.length > 1 && text.length < 100) {
            leadData.name = text;
            break;
        }
    }

    // Method 2: If h1 didn't work, try the page title
    // LinkedIn titles are like "Chris Alphanso - Student - ... | LinkedIn"
    if (!leadData.name && document.title) {
        const title = document.title;
        const pipeIdx = title.indexOf(' |');
        const dashIdx = title.indexOf(' -');
        const endIdx = Math.min(
            pipeIdx > 0 ? pipeIdx : 999,
            dashIdx > 0 ? dashIdx : 999
        );
        if (endIdx < 999) {
            leadData.name = title.substring(0, endIdx).trim();
        }
    }

    // Method 3: og:title meta tag
    if (!leadData.name) {
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            const content = ogTitle.getAttribute('content') || '';
            const dashIdx = content.indexOf(' -');
            leadData.name = dashIdx > 0 ? content.substring(0, dashIdx).trim() : content.trim();
        }
    }

    // ── Headline / Role ────────────────────────────────────
    // The headline is the text directly below the name on the profile.
    // LinkedIn page titles follow: "(N) Name - Headline | LinkedIn"
    // This is the most reliable source.

    // Method 1: From page title (most reliable)
    if (document.title) {
        // Strip leading "(N) " notification count if present
        let title = document.title.replace(/^\(\d+\)\s*/, '');
        // Format: "Name - Headline | LinkedIn"
        const pipeIdx = title.lastIndexOf(' | ');
        if (pipeIdx > 0) title = title.substring(0, pipeIdx);
        const firstDash = title.indexOf(' - ');
        if (firstDash > 0) {
            leadData.role = title.substring(firstDash + 3).trim();
        }
    }

    // Method 2: From meta description
    if (!leadData.role) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            const content = metaDesc.getAttribute('content') || '';
            const dashIdx = content.indexOf(' - ');
            if (dashIdx > 0) {
                const afterDash = content.substring(dashIdx + 3);
                const dotIdx = afterDash.indexOf('.');
                leadData.role = dotIdx > 0 ? afterDash.substring(0, dotIdx).trim() : afterDash.trim();
            }
        }
    }

    // Method 3: DOM walk from the h1 — find the next visible text block
    const nameEl = allH1[0];
    if (!leadData.role && nameEl) {
        // Try nextElementSibling of h1, or its parent's next sibling
        let candidate = nameEl.nextElementSibling;
        // Walk up if needed
        if (!candidate && nameEl.parentElement) {
            candidate = nameEl.parentElement.nextElementSibling;
        }
        if (candidate) {
            const text = candidate.innerText.trim();
            if (text && text.length > 3 && text.length < 300 && text !== leadData.name) {
                leadData.role = text;
            }
        }
    }

    console.log('[AuraReach] Role:', leadData.role);

    // ── Company ────────────────────────────────────────────
    // Method 1 (most reliable): Parse "at Company" from headline
    if (leadData.role) {
        const roleText = leadData.role;
        const atIdx = roleText.lastIndexOf(' at ');
        if (atIdx !== -1) {
            leadData.company = roleText.substring(atIdx + 4).trim();
            leadData.role = roleText.substring(0, atIdx).trim();
        }
    }

    // Method 2: Company links within the main profile area (not sidebar)
    if (!leadData.company) {
        const mainEl = document.querySelector('main') || document;
        const companyLinks = mainEl.querySelectorAll('a[href*="/company/"]');
        for (const link of companyLinks) {
            // Skip links in sidebar/aside or recommendation sections
            if (link.closest('aside') || link.closest('[data-test-id="aside"]')) continue;
            const span = link.querySelector('span[aria-hidden="true"]');
            const text = span ? span.innerText.trim() : link.innerText.trim();
            if (text && text.length > 1 && text.length < 100) {
                leadData.company = text;
                break;
            }
        }
    }

    // Method 3: From page title — "Name - Role at Company | LinkedIn"
    // Already handled above via "at" parsing

    // ── Email (if visible on page) ─────────────────────────
    const emailLink = document.querySelector('a[href^="mailto:"]');
    if (emailLink) {
        leadData.email = emailLink.href.replace('mailto:', '');
    }

    return leadData;
}

// Inject "Send to AuraReach" button on LinkedIn profile
function injectActionButton() {
    // Check if button already exists
    if (document.getElementById('aurareach-action-btn')) {
        return;
    }

    // Find the action buttons container (usually near the top of the profile)
    const actionContainer = document.querySelector(
        '.pv-top-card-v3-section .display-flex, [data-test-id="top-card"]'
    );

    if (!actionContainer) {
        return;
    }

    // Create button
    const button = document.createElement('button');
    button.id = 'aurareach-action-btn';
    button.className = 'aurareach-btn';
    button.innerHTML = '✨ Send to AuraReach';
    button.title = 'Add this lead to your AuraReach workflow';

    // Style the button
    button.style.cssText = `
        padding: 10px 16px;
        margin-left: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 24px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    `;

    // Add hover effect
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
    });

    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Open extension popup or trigger enrollment
        const leadData = extractLeadData();

        // Send to background script
        chrome.runtime.sendMessage(
            { action: 'enrollLead', leadData: leadData },
            (response) => {
                button.innerHTML = '✅ Sent!';
                button.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                setTimeout(() => {
                    button.innerHTML = '✨ Send to AuraReach';
                    button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }, 2000);
            }
        );
    });

    // Try multiple approaches to append the button
    try {
        // Approach 1: Find the message button and insert next to it
        const messageBtn = document.querySelector('button[aria-label*="Message"]');
        if (messageBtn && messageBtn.parentElement) {
            messageBtn.parentElement.insertBefore(button, messageBtn.nextSibling);
            return;
        }

        // Approach 2: Find any action button container
        const actionBtn = document.querySelector('button[data-test-id*="top-card"]');
        if (actionBtn && actionBtn.parentElement) {
            actionBtn.parentElement.insertBefore(button, actionBtn.nextSibling);
            return;
        }

        // Approach 3: Insert in main profile header
        const profileHeader = document.querySelector('[data-test-id="profile-top-card"]');
        if (profileHeader) {
            profileHeader.appendChild(button);
            return;
        }

        // Approach 4: Insert after name heading
        const nameHeading = document.querySelector('h1');
        if (nameHeading && nameHeading.parentElement) {
            nameHeading.parentElement.appendChild(button);
        }
    } catch (error) {
        console.log('Could not inject button:', error);
    }
}

// Ensure observers start only after the DOM is ready
function initObservers() {
    const target = document.body || document.documentElement;
    if (!target) {
        // Try again shortly if body is not yet available
        setTimeout(initObservers, 200);
        return;
    }

    // Watch for URL/page changes (LinkedIn is a SPA)
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            setTimeout(() => {
                injectActionButton();
            }, 500);
        }
    });

    urlObserver.observe(target, { childList: true, subtree: true });

    // Reinject when DOM changes significantly
    const domObserver = new MutationObserver(() => {
        injectActionButton();
    });

    domObserver.observe(target, { childList: true, subtree: true });
}

// Initial extraction and button injection
// LinkedIn is an SPA – the page may already be loaded, so run immediately too
function init() {
    extractLeadData();
    injectActionButton();
    initObservers();
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 500);
} else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
}
