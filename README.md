# The Alibi 🛡️

> **AI-powered social recovery agent** — confess what you did wrong, let the AI craft the perfect apology, draft a Gmail, and send a gift card. Built at YHack 2026.

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
| `LAVA_API_KEY` | Anthropic / agent API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (for Gmail drafts) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Must be `http://localhost:3001/api/auth/google/callback` |

### Google OAuth Setup (for Gmail drafts)

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
| `GET` | `/api/auth/google/start` | Begin Google OAuth flow |
| `GET` | `/api/auth/status` | Check if Google is connected |
| `POST` | `/api/send-apology-email` | Create Gmail draft with apology |
| `POST` | `/api/run-agent` | Run the full Alibi agent |
| `POST` | `/api/send-gift` | Send gift card via Tremendous |

---

## Tech Stack

- **Frontend**: React 18, Vite, Three.js / React Three Fiber
- **Backend**: Node.js, Express 5, Mongoose
- **AI**: Anthropic Claude (tool-use agentic loop)
- **Auth**: Google OAuth 2.0
- **Integrations**: Gmail API, Tremendous Gifting API
- **Database**: MongoDB (Mongoose)
