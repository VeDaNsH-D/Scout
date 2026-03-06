# Intelligence Scout - AuraReach Extension

🎯 **Smart Lead Capture + AI-Powered Outreach Recommendations**

A Chrome extension that brings the power of AI-driven lead intelligence directly into LinkedIn, inspired by Apollo.io but tailored for your AuraReach automation platform.

## Features

### 1. **One-Click Lead Enrollment** 📌
- Injects a "Send to AuraReach" button directly on LinkedIn profiles
- Captures lead name, role, company, and profile URL in one click
- No data copy-pasting required—pure magic!

### 2. **AI-Powered Insights** 🧠
- Analyzes the lead's role and company to recommend optimal outreach strategy
- Suggests three engagement paths:
  - **Technical**: Product-focused, technical capability discussion
  - **Business**: Revenue/efficiency angle, business impact
  - **Executive**: Strategic value, transformation narrative
- Integrates with your FastAPI backend for dynamic recommendations

### 3. **Human-Like Behavior Detection** ⚠️
- **Send Timing Meter**: Analyzes current time, day of week, and behavioral patterns
- Warns if sending feels "robotic" (e.g., 100 emails at 3 AM)
- Suggests optimal delay times: "Wait until 2:15 PM to look human"
- Prevents spam filter triggers by mimicking natural human behavior

### 4. **Activity Dashboard**
- Tracks all enrolled leads with timestamps
- Logs outreach paths used for each lead
- Provides analytics on which strategies work best

---

## Installation

### Step 1: Clone or Download
```bash
git clone <your-repo>
cd Extension
```

### Step 2: Load in Chrome
1. Open **Chrome** → Go to `chrome://extensions/`
2. Enable **"Developer Mode"** (top right)
3. Click **"Load unpacked"**
4. Select the `Extension` folder from your project

✅ The extension is now installed!

### Step 3: Configure Backend URL
Edit `popup.js` and update:
```javascript
const API_BASE_URL = 'http://localhost:8000'; // Change to your FastAPI URL
```

For production:
```javascript
const API_BASE_URL = 'https://api.aurareach.com';
```

---

## How to Use

### On LinkedIn Profile Pages:

1. **Open any LinkedIn profile** → The extension detects you're on a profile
2. **Click the extension icon** in your Chrome toolbar
3. **Review the popup**:
   - Lead name, role, and company are auto-detected
   - AI recommendations appear (e.g., "Technical approach recommended")
   - Human-like timing meter shows if it's safe to send
4. **Select an outreach path** (Technical, Business, or Executive)
5. **Click "Send to AuraReach"** → Lead enrolled in your workflow!

### Direct LinkedIn Button:
- A "✨ Send to AuraReach" button is injected directly on the profile
- Click it for instant enrollment without opening the popup

---

## Backend API Integration

Your FastAPI backend needs these endpoints:

### `POST /api/enroll-lead`
Enrolls a lead into the workflow.

**Request:**
```json
{
  "name": "John Doe",
  "role": "Senior Software Engineer",
  "company": "Google",
  "email": "john@google.com",
  "profileUrl": "https://linkedin.com/in/johndoe",
  "outreachPath": "technical",
  "source": "extension",
  "timestamp": "2026-03-06T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "leadId": "lead_12345",
  "workflowId": "wf_67890",
  "message": "Lead enrolled successfully"
}
```

### `POST /api/generate-insight` (Optional)
Generates AI-powered recommendations.

**Request:**
```json
{
  "name": "John Doe",
  "role": "Senior Software Engineer",
  "company": "Google",
  "recentPost": "Just shipped a new Kubernetes operator..."
}
```

**Response:**
```json
{
  "insight": "John recently posted about infrastructure. Recommend technical approach focusing on DevOps automation.",
  "recommendedPath": "technical",
  "confidence": 0.92
}
```

---

## Configuration

Edit these values in `popup.js`:

```javascript
// API endpoint
const API_BASE_URL = 'http://localhost:8000';

// Outreach paths
'technical'   // For engineers/CTOs - focus on product/tech
'business'    // For managers/VPs - focus on ROI/efficiency
'executive'   // For C-suite - focus on strategy/transformation
```

Human-like timing can be customized in `background.js`:
```javascript
HUMAN_BEHAVIOR: {
    MIN_SEND_HOUR: 9,        // Don't send before 9 AM
    MAX_SEND_HOUR: 17,       // Don't send after 5 PM
    BUSINESS_DAYS_ONLY: true, // Skip weekends
}
```

---

## File Structure

```
Extension/
├── manifest.json           # Extension metadata
├── popup.html             # UI popup
├── popup.js               # Popup logic & AI insights
├── content.js             # LinkedIn page injection
├── background.js          # API calls & messaging
├── styles.css             # UI styling
├── config.js              # Configuration settings
└── README.md              # This file
```

### Key Scripts:

| File | Purpose |
|------|---------|
| `manifest.json` | Chrome extension configuration |
| `content.js` | Runs on LinkedIn pages—extracts lead data & injects button |
| `background.js` | Background worker—calls API, handles messaging |
| `popup.js` | Shows insights, recommendations, timing meter |
| `popup.html` | Extension UI |

---

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│ User opens LinkedIn profile                             │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ content.js detects profile & injects "Send to AuraReach" │
│ button                                                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ User clicks extension icon or injected button           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ popup.js extracts lead data from page                   │
│ - Name, role, company, LinkedIn URL                     │
│ - Recent posts (if available)                           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ popup.js calls FastAPI backend for:                     │
│ 1. AI insight generation                                │
│ 2. Recommended outreach path                            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Extension shows:                                        │
│ - Lead info                                             │
│ - AI reasoning                                          │
│ - Human-like timing meter                              │
│ - Path selection buttons                                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ User clicks "Send to AuraReach"                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ background.js sends to /api/enroll-lead endpoint        │
│ Workflow is triggered automatically!                     │
└─────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### "Could not extract lead information"
- Make sure you're on a LinkedIn profile page (not search results)
- Try refreshing the page
- Check the browser console (`F12` → `Console` tab)

### Extension not appearing on LinkedIn
- Reload the extension: `chrome://extensions/` → Click refresh
- Check `manifest.json` has correct `host_permissions` for LinkedIn

### API calls failing
- Verify FastAPI backend is running on configured URL
- Check CORS settings in backend (allow requests from extension)
- Verify endpoints exist: `/api/enroll-lead`, `/api/generate-insight`

### Backend CORS Issue?
Add this to your FastAPI app:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only!
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Development

### Testing Locally
1. Set `API_BASE_URL = 'http://localhost:8000'` in `popup.js`
2. Run FastAPI: `python -m uvicorn main:app --reload`
3. Open LinkedIn in Chrome
4. Changes to extension code require reloading in `chrome://extensions/`

### Debug Console
Open Chrome DevTools on any page and click the extension icon:
- Check popup console: `Right-click popup` → `Inspect`
- Check content script: `Right-click page` → `Inspect` → `Console`

---

## API Requirements

Your FastAPI backend should handle these requests:

```python
@app.post("/api/enroll-lead")
async def enroll_lead(lead_data: dict):
    # 1. Save lead to database
    # 2. Trigger workflow engine
    # 3. Return workflow ID
    return {"success": True, "workflowId": "..."}

@app.post("/api/generate-insight")
async def generate_insight(lead_data: dict):
    # 1. Call your AI model for recommendations
    # 2. Analyze role and company
    # 3. Return recommended path and insight
    return {
        "insight": "...",
        "recommendedPath": "technical",
        "confidence": 0.92
    }
```

---

## Future Enhancements

- [ ] Gmail integration: Detect outreach responses
- [ ] Email finding: Auto-detect verified work emails
- [ ] Company research: Show funding, tech stack, revenue
- [ ] Sequence preview: Draft message templates
- [ ] A/B testing: Track which paths perform best
- [ ] Batch operations: Enroll multiple leads at once
- [ ] Custom timing: User-defined quiet hours

---

## License

Built with ❤️ for your hackathon project.

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Chrome extension documentation: https://developer.chrome.com/docs/extensions/
3. Open an issue on your project repo

---

**Ready to make lead capture feel like magic?** 🚀

Install the extension now and watch your workflow automation come alive!
