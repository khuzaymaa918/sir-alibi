# The Alibi 🛡️

> **AI-powered social recovery agent** — confess what you did wrong, let the AI craft the perfect apology, draft a Gmail, schedule a Calendar follow-up, and send a deeply personalized, context-aware gift card (no generic flowers!). Built at YHack 2026.

---

## Key features

**1. AI Apology Workflow**:
Craft deeply personalized, context-aware apologies using Anthropic Claude’s tool-use agentic loop. No generic templates—just real, human-sounding messages.

**2. Seamless Integrations**:
Auto-draft apologies in **Gmail**, schedule "make-up" sessions on **Google Calendar**, and send heartfelt gestures via **Tremendous Gifting**.

**3. Interactive 3D Interface**:
Built with **React Three Fiber**, Sir Alibi features a living 3D environment where your "Knight" waits to help you mend your social relationships.

**4. Tremendous Gifting**:
Automated gift card delivery based on the severity of the social "crime"—integrated directly with the Tremendous sandbox.

**5. Secure Auth & State**:
Managed by **Auth0** for user identity and **Mongoose/MongoDB** for persistent audit trails of your social recovery efforts.

## Deep Dive: System Architecture & Agent Logic

Sir Alibi operates on a sophisticated **multi-step agentic pipeline** powered by Anthropic's Claude. Unlike simple prompt-based bots, Sir Alibi breaks down the social recovery process into four distinct cognitive phases:

### 1. Perception Phase
The agent first extracts structured metadata from your raw input. It identifies the **relationship type** (e.g., manager, partner, friend), the **incident category**, and any **channel preferences**. This ensures the subsequent steps are grounded in the correct social context.

### 2. Research & Gifting Phase
The agent brainstorms personalized gift ideas and calculates the ideal **Follow-up Window**. It specifically cross-references your **Google Calendar** to find the next available "free window" for a face-to-face reconciliation, ensuring your follow-up isn't just timely, but actually possible.

### 3. Reasoning & Strategy Phase
This is the core "Alibi Engine." The agent evaluates the **severity** of the failure and selects an appropriate **Tone** and **Alibi Policy**:
- **Full Alibi**: For high-stakes situations requiring a plausible narrative.
- **Light Framing**: A softer approach that emphasizes intent over excuses.
- **Direct**: A sincere, no-nonsense apology for close relationships.

### 4. Actionable Output Generation
The system drafts the **Gmail apology**, sets the **Calendar reminder**, and prepares the **Tremendous gift order**. For high-stakes incidents, the pipeline includes a **Safety Pause**, prompting for clarifying questions before finalizing the strategy.

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm
- A `.env` file in `backend/` (see [Environment Variables](#environment-variables))

### 1. Install dependencies

```bash
# Root (agent test harness)
npm install

# Backend (Express API)
cd backend && npm install

# Frontend (React + Vite)
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
# Then edit backend/.env with your keys (see below)
```

### 3. Run the app

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 3001)
cd backend
node server.js
```

```bash
# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Then open **http://localhost:5173**

---

## Architecture

```
Frontend (React + Vite)  →  Backend (Express + Node)  →  Claude AI (Anthropic SDK)
     Port 5173                    Port 3001                  tool-use agentic loop
                                      ↓
                          Google OAuth / Gmail API
                          Mongoose / MongoDB
                          Tremendous Gifting API
```

---

## Environment Variables

Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description |
|---|---|
| `PORT` | Backend port (default: `3001`) |
| `ANTHROPIC_API_KEY` | Anthropic / agent API key |
| `MONGO_URI` | MongoDB Atlas URI |
| `AUTH0_DOMAIN` | Auth0 Domain |
| `AUTH0_AUDIENCE` | Auth0 Audience (e.g. `https://alibi-api`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (for Gmail drafts) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Must be `http://localhost:3001/api/auth/google/callback` |
| `TREMENDOUS_API_KEY` | Tremendous sandbox API key |
| `TREMENDOUS_API_URL` | https://testflight.tremendous.com |
| `TREMENDOUS_ENVIRONMENT` | testflight |
| `FUNDING_SOURCE_ID` | Tremendous funding source ID |
| `CAMPAIGN_ID` | Tremendous campaign ID |
| `GIFT_TIER_AMOUNT_LOW` | Optional tier overrides (USD) |

### Auth0 Setup (30 min)
1. Go to manage.auth0.com → Create Application → Single Page App
2. Create API → Identifier: `https://alibi-api`
3. Set Allowed Callback URLs: `http://localhost:5173`
4. Set Allowed Logout URLs: `http://localhost:5173`
5. Set Allowed Web Origins: `http://localhost:5173`
6. Copy Domain and Client ID to `.env` and to `src/main.jsx`:
```jsx
// src/main.jsx
<Auth0Provider
  domain="YOUR_AUTH0_DOMAIN"
  clientId="YOUR_AUTH0_CLIENT_ID"
  authorizationParams={{
    redirect_uri: window.location.origin,
    audience: "https://alibi-api",
  }}
>
  <App />
</Auth0Provider>
```

### MongoDB Atlas Setup (15 min)
1. Go to mongodb.com/atlas → Free tier → Create cluster
2. Add your IP to allowlist
3. Create database user
4. Copy connection string to `.env`

### Google OAuth Setup (for Gmail & Calendar integrations)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → enable **Gmail API**
3. **OAuth consent screen** → External → add your email as test user
4. **Credentials** → **OAuth 2.0 Client ID** → Application type: **Web application**
5. Add Authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
6. Copy **Client ID** and **Client Secret** into `backend/.env`

**Link your Google account** (after starting the backend):
```bash
open http://localhost:3001/api/auth/google/start
```

**Check status**:
```bash
curl http://localhost:3001/api/auth/status
```

### Tremendous Gifting (sandbox)

*Note: We bypass the Tremendous Node SDK to avoid versioning/type conflicts, interacting directly with their v2 REST API via native fetch.*

Tier mapping used by backend:
- score `<= 0` → skip gift
- score `< 20` → `$15`
- score `< 50` → `$30`
- score `< 100` → `$75`
- score `>= 100` → `$150`

Create a sandbox gift order:
```bash
curl -X POST http://localhost:3001/api/send-gift \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_name": "Taylor Smith",
    "recipient_email": "taylor@example.com",
    "ai_evaluation_score": 62,
    "failure_id": "failure_123"
  }'
```

`failure_id` is reused as Tremendous `external_id` for idempotency.

---

## Project Structure

```
yhack2026/
├── agent/              # AI agent logic (TypeScript, Claude tool-use loop)
│   └── testHarness.ts  # Standalone agent test runner
├── backend/            # Express API server
│   ├── server.js       # Entry point (port 3001)
│   ├── routes/         # API route handlers
│   ├── controllers/    # Business logic
│   └── services/       # Gmail, Tremendous, etc.
├── frontend/           # React + Vite UI
│   ├── src/
│   │   └── components/ # React components (KnightScene, forms, etc.)
│   └── public/         # Static assets (3D models, etc.)
├── package.json        # Root — agent test harness
└── tsconfig.json
```

---

## Testing the Agent Standalone

```bash
# From project root
npm run dev
```

This runs `agent/testHarness.ts` directly via `tsx` — no server required.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/auth/google/start` | Begin Google OAuth flow (Gmail) |
| `GET` | `/api/google/auth` | Begin Google Calendar OAuth flow |
| `GET` | `/api/auth/status` | Check if Google is connected |
| `POST` | `/api/send-apology-email` | Create Gmail draft with apology |
| `POST` | `/api/run-agent` | Run the full Alibi agent |
| `POST` | `/api/send-gift` | Send gift card via Tremendous |

**Test agent API (need JWT — use Auth0 test token from dashboard)**:
```bash
curl -X POST http://localhost:3001/api/run-agent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEST_JWT" \
  -d '{"name":"Sarah","relationship":"close friend","failure_type":"forgot birthday"}'
```

---

## Tech Stack

- **Frontend**: React 18, Vite, Three.js / React Three Fiber
- **Backend**: Node.js, Express 5, Mongoose
- **AI**: Anthropic Claude (tool-use agentic loop)
- **Auth**: Google OAuth 2.0
- **Integrations**: Gmail API, Tremendous Gifting API
- **Database**: MongoDB (Mongoose)
