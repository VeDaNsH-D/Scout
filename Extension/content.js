// Content Script - Injected into LinkedIn pages

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getLeadData') {
        const leadData = extractLeadData();
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
    
    // Extract name - usually in the main heading
    const nameElement = document.querySelector('h1, [data-test-id="top-card-name"]');
    if (nameElement) {
        leadData.name = nameElement.textContent.trim();
    }
    
    // Extract role/headline
    const roleElement = document.querySelector(
        '.text-body-medium.v-align-middle, [data-test-id="top-card-headline"]'
    );
    if (roleElement) {
        leadData.role = roleElement.textContent.trim();
    }
    
    // Extract company from current position
    const companyElements = document.querySelectorAll('a[href*="company"]');
    if (companyElements.length > 0) {
        leadData.company = companyElements[0].textContent.trim();
    }
    
    // Alternative: Look for company in the headline
    if (!leadData.company && leadData.role) {
        const roleText = leadData.role;
        const atIndex = roleText.lastIndexOf('at ');
        if (atIndex !== -1) {
            leadData.company = roleText.substring(atIndex + 3).trim();
            // Remove company from role
            leadData.role = roleText.substring(0, atIndex).trim();
        }
    }
    
    // Try to extract email (if visible)
    const emailLink = document.querySelector('a[href^="mailto:"]');
    if (emailLink) {
        leadData.email = emailLink.href.replace('mailto:', '');
    }
    
    // Extract recent post
    const postElement = document.querySelector(
        '[data-test-id="feed-item-content"] [data-test-id="content"]'
    );
    if (postElement) {
        leadData.recentPost = postElement.textContent.trim().substring(0, 200);
    }
    
    // Inject action button if data found
    if (leadData.name) {
        injectActionButton();
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
window.addEventListener('load', () => {
    setTimeout(() => {
        extractLeadData();
        injectActionButton();
        initObservers();
    }, 1000);
});
