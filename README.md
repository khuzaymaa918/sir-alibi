# Sir ALIBI — Relationship repair assistant

MVP that turns a messy real-life slip (forgot a birthday, bailed on a move, ghosted a reply) into **grounded apology copy**, **gift angles**, and **action hooks** (Gmail draft + follow-up timing). The core is a **multi-step agentic pipeline**: each stage is an LLM call with a **strict JSON contract**, validated output, and explicit handoff to the next stage—not a single chat completion. Built at **YHack 2026**.

---

## Architecture (how the pieces connect)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Frontend (React + Vite, :5173)                                         │
│  • Form → POST /api/run-agent (SSE) — optional Auth0 Bearer token       │
│  • “Draft in Gmail” → POST /api/send-apology-email                      │
│  • “Schedule follow-up” → POST /api/schedule-followup (stub success)    │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Backend (Express, :3001) — backend/server.js                           │
│  • Loads agent via dynamic import of agent/runAlibiAgent.ts (tsx/node)  │
│  • Google OAuth in-memory session → Gmail drafts (googleapis)           │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Agent (TypeScript) — agent/runAlibiAgent.ts                            │
│  • Perception → Research → [pause gate] → Reason → Write                │
│  • LLM: Lava forward → OpenAI-compatible chat/completions (agent/llm.ts)│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Agentic reasoning: what “agentic” means here

The workflow is **deliberately staged**. Each step has its own **system prompt**, **user payload** (including outputs from earlier steps), and **Zod schema** (`agent/schemas.ts`). The model is asked for **one JSON object** per step; `callLLMJson` (`agent/llmJson.ts`) parses and validates it, with **one automatic retry** if JSON or schema validation fails.

### Pipeline (execution order)

| Step | File | Role |
|------|------|------|
| **1. Perception** | `agent/steps/perception.ts` | Reads the incident text + optional **integration metadata** (`agent/perceptionContext.ts`: Gmail signals, calendar hints, user-provided budget/location/urgency). Produces `situationSummary`, `signals`, `confidence`, `assumptions`, `missingInfo`, up to **2** `clarifyingQuestions`, and `constraints` (e.g. HR-safe, urgency). |
| **2. Research** | `agent/steps/research.ts` | Consumes a formatted **perception block** + scenario. Produces gift ideas (with search queries / optional links), clarifiers, and a suggested follow-up window. |
| **3. Pause gate** | `agent/incident.ts` → `shouldPausePipeline` | **Agentic safety / product behavior**: if research or perception surfaces clarifiers under **high-stakes** heuristics (e.g. birthday/anniversary patterns + clarifying questions, or perception questions with low confidence in stakes), the pipeline **stops before Reason/Write** and returns `status: "needs_user_input"` with deterministic fallbacks so the UI can ask the human first (`agent/runAlibiAgent.ts`). |
| **4. Reason** | `agent/steps/reason.ts` | Strategy: `incidentType`, severity, tone, `alibiPolicy`, plan, risks—grounded in research + perception. |
| **5. Write** | `agent/steps/write.ts` | Final messages: apology + follow-up, respecting `alibiPolicy`. |

So “reasoning” is not one monolithic answer: it is **factored** so later steps cannot ignore structured earlier outputs unless the run is intentionally paused or a **fallback** activates (`agent/repairFallbacks.ts`).

### Follow-up timing and “calendar perception”

If a caller attaches `perceptionContext.calendar.nextFreeWindowISO`, `runAlibiAgent` maps that timestamp into **days-from-now** for the bundled follow-up action (`resolveFollowUpDays` in `agent/runAlibiAgent.ts`). The HTTP path today passes **text only** from the backend (`backend/services/runService.js`); `PerceptionContext` is fully wired in **`agent/testHarness.ts`** for judges who want to experiment with rich metadata without changing the UI.

### Demo / cost controls

Set `DEMO_MODE=true` (see `agent/demoMode.ts` + `agent/config.ts`) for smaller prompts and token caps across steps.

---

## External APIs and services

| Service | Where | Purpose |
|---------|--------|--------|
| **Lava** | `agent/llm.ts` — `POST https://api.lava.so/v1/forward?u=<encoded OpenAI chat URL>` | API gateway; Bearer `LAVA_API_KEY`. Forwards to OpenAI-compatible **chat completions**. |
| **OpenAI (via Lava)** | Same request body: `model`, `messages`, `max_tokens`, `temperature` | Actual chat model (defaults e.g. `gpt-4o-mini`; overridable via `MODEL_FAST` / `MODEL_WRITE`). |
| **Google OAuth 2.0 + Gmail API** | `backend/services/googleGmail.js` (`googleapis`) | Scope `gmail.compose`; creates **drafts** only (no auto-send). Tokens stored **in memory** on the server (restart clears). |
| **Auth0** (optional) | `frontend/src/main.jsx`, `App.jsx` | SPA login; frontend attaches `Authorization: Bearer` when a token exists. **Backend does not enforce JWT** in the current Express routes—runs work without Auth0 for local judging. |
| **ElevenLabs** (optional) | `frontend/src/hooks/useTTS.js` via `VITE_ELEVENLABS_API_KEY` | Text-to-speech if enabled in the UI. |

---

## Repository map (files judges care about)

| Path | Purpose |
|------|---------|
| `agent/runAlibiAgent.ts` | Orchestrates the full pipeline, pause logic, response assembly |
| `agent/steps/*.ts` | Perception, Research, Reason, Write LLM steps |
| `agent/llm.ts`, `agent/llmJson.ts` | Lava + JSON extraction/validation |
| `agent/runAgentContract.ts` | Public **`RunAgentResponse`** Zod schema (API contract) |
| `agent/perceptionContext.ts` | Optional structured Gmail/Calendar/user-fields for perception |
| `backend/server.js` | Express app, mounts `/api` routes |
| `backend/controllers/agentController.js` | SSE wrapper around `runAlibiAgent` |
| `backend/services/runService.js` | Builds agent text from form body; maps agent JSON → UI bundle |
| `frontend/src/App.jsx` | Form, SSE client, Gmail draft + follow-up buttons |

---

## Judge / developer setup

### Prerequisites

- **Node.js 20+** (Express 5 and tooling expect a current Node).
- **Lava API key** (for LLM calls).
- Optional: **Google Cloud** project with Gmail API + OAuth client (for real drafts).

### 1. Agent dependencies (repo root)

```bash
npm install
```

Root `package.json` includes a harness script:

```bash
npm run dev
# runs: tsx agent/testHarness.ts
```

Requires `LAVA_API_KEY` in the environment (or a `.env` at repo root if you add one locally).

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: LAVA_API_KEY, and optionally Google OAuth vars (see below)
npx tsx server.js
```

Health check:

```bash
curl http://localhost:3001/health
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # if present; set VITE_API_URL=http://localhost:3001 when needed
npm run dev
```

Open `http://localhost:5173`. If the backend is down, the app falls back to **local demo mode** (`App.jsx`).

### 4. Environment variables (reference)

**Backend (`backend/.env`)** — see `backend/.env.example`:

- `PORT` — default `3001`
- `LAVA_API_KEY` — required for live agent runs from the server
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` — for Gmail drafts
- Optional agent tuning: `MODEL_FAST`, `MODEL_WRITE`, `MAX_TOKENS_*`, `TEMPERATURE`, `DEMO_MODE`

**Frontend** — optional: `VITE_API_URL`, Auth0 `VITE_AUTH0_*`, `VITE_ELEVENLABS_API_KEY`

---

## HTTP API (backend)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness |
| `POST` | `/api/run-agent` | Body: form JSON (`name`, `relationship`, `failure_type`, …). Response: **SSE** stream; final event `agent_complete` with `result` shaped for the UI |
| `GET` | `/api/auth/google/start` | Redirect to Google consent |
| `GET` | `/api/auth/google/callback` | OAuth callback (exchanges code, stores tokens in memory) |
| `GET` | `/api/auth/status` | `{ ok, connected }` |
| `POST` | `/api/send-apology-email` | JSON: `subject`, `body` (or nested `apology`); creates Gmail **draft** |
| `POST` | `/api/schedule-followup` | Validates payload; returns success (**Google Calendar is not called** in this stub—safe for demos that only need the success path) |

Example Gmail draft (after OAuth):

```bash
curl -X POST http://localhost:3001/api/send-apology-email \
  -H "Content-Type: application/json" \
  -d '{"to":"you@gmail.com","subject":"Hello","body":"Draft body"}'
```

---

## Google OAuth + Gmail draft (minimal)

1. In Google Cloud: enable **Gmail API**, configure **OAuth consent screen**, create **OAuth 2.0 Client ID** (Web application).
2. **Authorized redirect URI** must match `GOOGLE_REDIRECT_URI` exactly, e.g. `http://localhost:3001/api/auth/google/callback`.
3. Visit `http://localhost:3001/api/auth/google/start`, complete consent; expect “Google connected”.
4. `curl http://localhost:3001/api/auth/status` → `"connected": true`.

**Testing users:** While the app is *Testing*, add the judge’s Gmail under **Test users** on the consent screen.

---

## Demo checklist (presentation)

- [ ] `LAVA_API_KEY` set on the machine running the backend
- [ ] Walk through **one** incident and mention the stages: perception → research → (optional pause) → reason → write
- [ ] Show **Gmail draft** after OAuth (or explain in-memory token limitation on restart)
- [ ] If Wi‑Fi fails: app can still run **demo mode** from the frontend
- [ ] Have `npm run dev` (harness) ready to show **perception with/without** `PerceptionContext` snapshots

---

## Prize submission checklist

- [ ] Devpost submission with demo video
- [ ] GitHub repo with commits during hackathon window
- [ ] Team check-in / judging presence per organizer rules
- [ ] Tracks: e.g. Personal AI Agents, Most Creative, Best UI/UX

---
