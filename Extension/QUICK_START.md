# Quick Start Guide - Intelligence Scout Extension

## 🚀 Get Running in 5 Minutes

### Step 1: Load the Extension (2 min)
```
1. Open Chrome
2. Go to chrome://extensions/
3. Enable "Developer Mode" (top right)
4. Click "Load unpacked"
5. Select: c:\Users\Vedansh\COHERENCE-26_NODEtorious\Extension
6. ✅ Done! Extension appears in top right
```

### Step 2: Configure Backend URL (1 min)
Edit `Extension/popup.js` line 5:
```javascript
const API_BASE_URL = 'http://localhost:8000'; // ← Change this
```

For production, use your live API URL.

### Step 3: Add API Endpoints to Backend (2 min)
See `Extension/BACKEND_INTEGRATION.md` for:
- `/api/enroll-lead` - Saves lead to database
- `/api/generate-insight` - Returns AI recommendations

Copy-paste the Python code into your FastAPI app.

### Step 4: Test It! 🧪
1. Go to any LinkedIn profile: https://linkedin.com/in/someone
2. Click the extension icon (🎯)
3. See the magic happen:
   - Lead name auto-captured ✅
   - AI recommendation shown 🧠
   - Human-like timing meter displayed ⚠️
4. Click "Send to AuraReach"
5. Lead enrolled! 🎉

---

## File Structure

```
Extension/
├── manifest.json              ← Chrome extension config
├── popup.html                 ← UI popup
├── popup.js                   ← Core logic (UPDATE API URL HERE)
├── content.js                 ← LinkedIn page injection
├── background.js              ← API calls
├── styles.css                 ← Pretty styling
├── config.js                  ← Settings
├── README.md                  ← Full documentation
├── BACKEND_INTEGRATION.md     ← API endpoints
└── QUICK_START.md            ← This file
```

---

## Key Features Breakdown

### 1. LinkedIn Lead Capture 📌
- Injects "✨ Send to AuraReach" button on profiles
- Auto-detects: Name, Role, Company, LinkedIn URL
- One-click enrollment

### 2. AI Insights 🧠
Your backend sends back:
- Recommended outreach path (Technical/Business/Executive)
- Personalized reasoning
- Confidence score

### 3. Human-Like Timing ⚠️
Shows warning if sending looks robotic:
- ✅ Safe to Send (9 AM - 5 PM, weekdays)
- ⏳ Delay Recommended (off-hours)

---

## Troubleshooting

### Extension not showing on LinkedIn?
```
1. Check URL: Must be https://www.linkedin.com/in/[profile]
2. Refresh page: Cmd+R / Ctrl+R
3. Reload extension: Go to chrome://extensions → Click refresh
```

### API calls failing?
```
1. Check backend is running: http://localhost:8000
2. Test endpoint: curl -X POST http://localhost:8000/api/enroll-lead
3. Add CORS if needed (see BACKEND_INTEGRATION.md)
```

### Lead info not showing?
```
1. Open DevTools: F12
2. Go to Console tab
3. Look for errors
4. Check LinkedIn HTML hasn't changed
```

---

## Development Mode

### Auto-reload Changes
Chrome extension changes require manual reload:
1. Edit your `.js` or `.html` file
2. Go to chrome://extensions/
3. Click refresh icon on extension card
4. Changes appear instantly

### Debug Popup UI
```
1. Right-click on extension icon
2. Select "Inspect popup"
3. DevTools opens with popup code
4. Check Console for errors
```

### Debug LinkedIn Injection
```
1. Right-click on LinkedIn profile
2. Select "Inspect"
3. Search for "aurareach-btn" in Elements tab
4. Check Console for injection logs
```

---

## Expected API Responses

### Successful Lead Enrollment
```json
{
  "success": true,
  "message": "Lead John Doe enrolled successfully",
  "leadId": "lead_1234567890",
  "workflowId": "wf_0987654321",
  "outreachPath": "technical",
  "timestamp": "2026-03-06T10:30:00Z"
}
```

### Insight Generation
```json
{
  "success": true,
  "insight": "John is a Senior Engineer at Google. Recommend technical approach.",
  "recommendedPath": "technical",
  "confidence": 0.92,
  "reasoning": "Based on 'Senior Engineer' role, technical approach is optimal"
}
```

---

## Next Steps

1. ✅ Load extension
2. ✅ Configure API URL
3. ✅ Add backend endpoints
4. ✅ Test on LinkedIn profile
5. 📊 Monitor enrollments in your database
6. 🎯 Refine AI prompts for better insights
7. 🚀 Deploy to production

---

## Features to Add Later

- Gmail integration (track opens/clicks)
- Batch enrollment (enroll multiple leads)
- Custom outreach templates
- A/B testing different approaches
- Webhook notifications
- Analytics dashboard

---

## Questions?

1. Read the full `README.md`
2. Check `BACKEND_INTEGRATION.md` for API details
3. Open Chrome DevTools (F12) and check console
4. Review extension code - it's all documented!

**You're ready! Go capture some leads! 🚀**
