# Scout

> AI-powered workflow automation for modern outreach teams.  
> Build workflows visually, execute at scale, and deliver verifiable execution using Filecoin.

---

## 🚨 Problem Statement
Sales and growth teams lose momentum because outreach operations are fragmented:
- Lead capture happens in one tool
- Workflow execution in another
- Messaging insights are hard to track
- Audit trails are not trustworthy or verifiable

This causes manual effort, missed follow-ups, and low campaign transparency.

## ✅ Solution Overview
Scout is a full-stack platform that combines:
- **Visual workflow automation** (Trigger → Condition → Action)
- **Queue-based execution engine** for scalable async processing
- **AI layer** for lead scoring, timing, and outreach generation
- **Decentralized log anchoring on Filecoin** for verifiable workflow history
- **Conversational interface via Telegram bot** for real-time interaction

In short: **AI + Workflow + Filecoin**, in one integrated system.

## 🚀 Hackathon Upgrade
During the hackathon, Scout evolved from a strong automation platform into a **verifiable automation system**.

### What was added
- Native Filecoin integration using Lighthouse SDK
- Automatic upload of workflow completion logs to decentralized storage
- CID persistence in MongoDB per workflow run
- CID visibility in APIs and monitoring surfaces

### Why this upgrade matters
This upgrade makes Scout more than just “automation that runs.” It becomes automation that can be **proven**. Every critical workflow execution now has a decentralized reference point, enabling teams, judges, and stakeholders to independently validate outcomes with transparent evidence.

## ✨ Key Features

### 1) Workflow Builder
- Node-based visual builder for automation pipelines
- Supports trigger, condition, action, and wait steps
- Workflow graph editing with real-time collaboration support

### 2) Execution Engine
- BullMQ + Redis powered async orchestration
- Delayed jobs and branching transitions
- Multi-lead workflow runs with status tracking

### 3) AI Layer
- Python ML microservice for lead scoring and insight generation
- Best send-time prediction for outreach optimization
- LLM-powered personalized message generation

### 4) Data Layer
- MongoDB persistence for:
  - Users
  - Leads
  - Workflows
  - Workflow runs
  - Messages

### 5) Chrome Extension
- Captures leads directly from LinkedIn
- Stores and syncs leads into Scout platform

### 6) Messaging System
- SMTP-based outbound email delivery
- IMAP-based reply tracking
- Full message history persistence and status updates

### 7) Analytics Dashboard
- Campaign performance metrics
- Engagement trends and response rates
- Workflow run visibility

### 8) Decentralized Storage (Filecoin)
- Workflow completion logs uploaded via Lighthouse SDK
- Returns immutable CID per run
- CID stored in MongoDB for verification and retrieval

### 9) Telegram Bot Integration
- Interactive Telegram bot for workflow interaction and notifications
- Allows users to:
  - Receive real-time workflow alerts
  - Trigger actions via chat interface
  - Monitor execution progress remotely
- Extends Scout beyond web UI into conversational workflows

## 🎯 Track Alignment (AI & Robotics)
Scout aligns strongly with the **AI & Robotics** track by combining:
- **Agent systems**: workflows behave like modular agents (trigger, evaluate, act)
- **Autonomous execution**: BullMQ + Redis execute decisions and actions without manual intervention
- **Intelligent decision-making**: AI scoring, insights, and message generation guide each execution path

This architecture demonstrates practical autonomous systems for real-world business operations.

## 🏗️ Architecture

```text
LinkedIn -> Chrome Extension -> Scout Backend API -> MongoDB
                                         |
                                         +-> BullMQ Queue (Redis)
                                                |
                                                +-> Workflow Engine
                                                      |
                                                      +-> AI/ML Service (Flask)
                                                      +-> LLM Message Generation
                                                      +-> SMTP/IMAP Messaging
                                                      +-> Telegram Bot (Notifications & Interaction)
                                                      +-> Lighthouse (Filecoin) -> CID
                                                                            |
                                                                            +-> Saved in WorkflowRun (MongoDB)

Frontend (React) <-> Backend API <-> Analytics + Workflow State
```

## 🧰 Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Flow
- Socket.IO Client

### Backend
- Node.js
- Express
- BullMQ
- Redis
- Socket.IO
- Nodemailer + IMAP
- JWT + Passport Google OAuth

### AI/ML
- Python Flask microservice
- scikit-learn models
- LLM integrations (Groq / Gemini support)

### Data & Storage
- MongoDB (Mongoose)
- Filecoin via Lighthouse SDK

### Extension
- Chrome Extension (Manifest V3)

## 🧩 Sponsor APIs Used

### Filecoin (via Lighthouse SDK)
Scout deeply integrates Filecoin through Lighthouse SDK as part of the runtime execution path, not as a superficial add-on.

Integration depth:
- Workflow completion logs are uploaded programmatically from the execution engine
- A CID is generated for each completed run
- CID is persisted in MongoDB and surfaced in APIs/UI for downstream verification
- Logs are publicly retrievable through IPFS gateways for independent validation

This provides a durable, transparent, and verifiable evidence layer for automation history.

## ⚙️ How It Works
1. User creates a workflow in the visual builder.
2. Leads are imported (CSV/upload or LinkedIn extension).
3. Workflow run is started for selected leads.
4. BullMQ schedules and executes steps asynchronously.
5. AI services enrich leads and generate message content.
6. Messaging engine sends emails and tracks replies.
7. Users receive workflow updates and alerts via Telegram bot.
8. On workflow completion, execution log is uploaded to Filecoin.
9. Returned CID is stored in `WorkflowRun.filecoinCID` in MongoDB.
10. Dashboard shows performance and execution insights.

## 🔐 Filecoin Integration (Critical)
Scout uses **Lighthouse SDK** to write workflow execution logs to Filecoin.

### What gets uploaded
Each completion log includes key metadata such as:
- `workflowRunId`
- `workflowId`
- `leadId`
- `status`
- `timestamp`
- `source: "Scout Workflow Engine"`

### Why this matters
- Immutable and tamper-resistant execution trail
- Verifiable proof of workflow completion
- Public CID-based inspection via IPFS gateways
- Enables **trustless verification of workflows** with transparent, audit-friendly execution evidence

### CID lifecycle
1. Workflow completes in backend engine.
2. JSON log is uploaded through Lighthouse.
3. Lighthouse returns a CID (`response.data.Hash`).
4. CID is stored in MongoDB (`WorkflowRun.filecoinCID`).

You can verify log availability through any IPFS gateway:

`https://gateway.lighthouse.storage/ipfs/<CID>`

## 🛠️ Installation

### 1) Clone the project
```bash
git clone https://github.com/pallavdeshmukh/COHERENCE-26_NODEtorious.git
cd COHERENCE-26_NODEtorious
```

### 2) Install root dependencies
```bash
npm install
```

### 3) Install backend dependencies
```bash
cd Backend
npm install
cd ..
```

### 4) Install frontend dependencies
```bash
cd Frontend
npm install
cd ..
```

### 5) Install ML dependencies
```bash
cd ML
pip3 install flask flask-cors joblib pandas python-dotenv google-genai scikit-learn
cd ..
```

## 🔑 Environment Variables

Create `Backend/.env` with:

```env
# Core
PORT=8000
MONGO_URI=mongodb://localhost:27017/scout
JWT_SECRET=your_jwt_secret

# Redis / BullMQ
REDIS_HOST=localhost
REDIS_PORT=6379

# Filecoin (Lighthouse)
LIGHTHOUSE_API_KEY=your_lighthouse_api_key

# ML service
ML_API_URL=http://127.0.0.1:5001/api/ml

# LLM
GROQ_API_KEY=your_groq_key
LLM_API_KEY=your_gemini_or_llm_key

# Email
SMTP_USER=your_email
SMTP_PASS=your_email_password_or_app_password
IMAP_HOST=imap.gmail.com
IMAP_PORT=993

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

Create `Frontend/.env` (optional for production API host override):

```env
VITE_API_URL=http://localhost:8000
```

## ▶️ How to Run

### Option A: Run everything from root (recommended)
```bash
npm run dev
```

This starts:
- Backend (Node/Express)
- Frontend (Vite)
- ML service (Flask)
- Redis server
- ngrok tunnel

### Option B: Run services separately

Backend:
```bash
cd Backend
npm run dev
```

Frontend:
```bash
cd Frontend
npm run dev
```

ML service:
```bash
cd ML
python3 app.py
```

## 🎬 Demo
- Demo Video: https://demo.scout-platform.app/video
- Product Walkthrough: https://demo.scout-platform.app

## 🧠 Why Scout Is Unique
- Combines **visual workflow automation** with **real async orchestration**
- Uses **AI for both scoring and communication intelligence**
- Adds **Filecoin-backed verifiability** for execution logs
- Bridges lead capture directly from LinkedIn into execution pipelines
- Extends automation into conversational interfaces via Telegram bot

## 🏆 Hackathon Highlights
- End-to-end full-stack build (Frontend + Backend + ML + Extension)
- Production-style queue architecture with BullMQ + Redis
- Real-world messaging automation with reply tracking
- Decentralized trust layer using Filecoin CIDs
- Telegram bot for real-time workflow interaction and alerts

## 📝 Submission Summary
Scout addresses a common and costly problem in modern outreach operations: teams can design and run automations, but they struggle to prove what actually executed, when it executed, and whether outcomes can be trusted. Most workflow tools optimize for convenience, not verifiability. For hackathon judging, this often means powerful demos without strong accountability layers.

Scout solves this by combining a visual workflow builder, an asynchronous execution engine, an AI decision layer, and a decentralized verification layer. On the frontend, users build Trigger → Condition → Action pipelines visually. On the backend, Node.js + Express orchestrate API and workflow control, while BullMQ + Redis execute jobs asynchronously with support for delays and branching. MongoDB stores the system of record across users, leads, workflows, runs, and messaging state.

The intelligence layer is practical and execution-focused. A Flask ML microservice scores leads, generates insights, and predicts optimal send times. LLM integration powers personalized outreach generation so every execution can adapt messaging to context instead of sending static templates. Combined, this creates intelligent decision-making at runtime and not just static automation rules.

The key innovation for this submission is Filecoin integration via Lighthouse SDK. When workflows complete, execution logs are uploaded to decentralized storage, a CID is returned, and that CID is persisted with workflow run metadata. This transforms Scout into a platform with verifiable execution: logs can be independently checked via IPFS gateways, enabling trustless validation, stronger auditability, and transparent reporting.

Impact: Scout improves operational speed with autonomous execution, improves campaign quality with AI guidance, and improves trust with decentralized evidence. It is a complete, production-minded full-stack system that demonstrates technical excellence, integration depth, and real utility for teams running mission-critical outreach workflows.

## 🔭 Future Scope
- Multi-channel automation (WhatsApp, LinkedIn DM, SMS)
- Advanced workflow templates marketplace
- CID explorer inside dashboard for on-chain log verification
- Team permissions and org-level audit controls
- AI agent for auto-optimizing workflow branches

## 📄 License
MIT License

