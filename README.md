<div align="left">

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=28&duration=3000&pause=1000&color=00D4FF&center=false&vCenter=false&width=700&lines=Sir+Alibi+%F0%9F%9B%A1%EF%B8%8F;Apology+Drafted.+Gift+Sent.+Voice+Cloned.;Confess.+Repair.+Move+On." alt="Sir Alibi" />

<p align="left">
  <strong>Confess what you did wrong. Sir Alibi handles the rest.</strong><br/>
  Apology drafted. Gift sent. Follow-up scheduled. Delivered in your own voice.
</p>

<p align="left">
  <img src="https://img.shields.io/badge/Built%20at-YHack%202026-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Node-18%2B-brightgreen?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-OpenAI%20via%20Lava-412991?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
</p>

<p align="left">
  <img src="https://img.shields.io/badge/Gmail%20API-EA4335?style=for-the-badge&logo=gmail&logoColor=white" />
  <img src="https://img.shields.io/badge/Google%20Calendar-4285F4?style=for-the-badge&logo=googlecalendar&logoColor=white" />
  <img src="https://img.shields.io/badge/Spotify-1DB954?style=for-the-badge&logo=spotify&logoColor=white" />
  <img src="https://img.shields.io/badge/ElevenLabs-000000?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Tremendous-FF0000?style=for-the-badge" />
</p>

---

</div>

## What is Sir Alibi?

You forgot. You flaked. You said the wrong thing at the wrong time.

**Sir Alibi** is an autonomous, LLM-powered relationship-repair agent. It doesn't just generate an apology — it *acts*. One prompt in. Full repair plan out.

```
Confess → Perceive → Research → [Pause Gate] → Reason → Write → Execute
```

> Built in 24 hours at YHack 2026 by Khuzayma Mushtaq, Abdullah Rashid, Manas Mehra, and Zhihan Shi.

---

## What it actually does

| Action | Integration | Details |
|--------|------------|---------|
| 📧 Drafts a personalized apology | Gmail API + Google OAuth | Saved as a draft — you review before sending |
| 🎁 Sends a real gift card | Tremendous API | Amazon, Starbucks, Subway — scaled to severity |
| 📅 Schedules a follow-up | Google Calendar API | Auto-timed based on urgency and relationship context |
| 🎵 Generates a playlist | Spotify API | Personalized to the recipient's taste |
| 🎙️ Clones your voice | ElevenLabs TTS | Delivers the apology in your actual voice |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend  (React + Vite, :5173)                            │
│  Form input → SSE stream → Gmail / Calendar action buttons  │
└───────────────────────┬─────────────────────────────────────┘
                        │ POST /api/run-agent (SSE)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend  (Express + Node.js, :3001)                        │
│  Google OAuth · Gmail drafts · route handling               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Agent Pipeline  (TypeScript)                               │
│                                                             │
│  1. Perception   → reads context, stakes, missing info      │
│  2. Research     → gift ideas, follow-up timing             │
│  3. Pause Gate   → halts on high-stakes; asks user first    │
│  4. Reason       → tone, severity, alibi policy, risks      │
│  5. Write        → final apology + follow-up messages       │
│                                                             │
│  Every step: strict JSON → Zod schema validation →          │
│  1 auto-retry → deterministic fallback                      │
└─────────────────────────────────────────────────────────────┘
```

---

## The agent pipeline — how it reasons

This is not a single LLM call. Each step is **independently prompted, structured, and validated**.

| Step | File | What it does |
|------|------|-------------|
| **Perception** | `agent/steps/perception.ts` | Reads incident + context. Outputs severity, confidence, missing info, clarifying questions, constraints |
| **Research** | `agent/steps/research.ts` | Gift ideas with search queries, follow-up window, relationship signals |
| **Pause Gate** | `agent/incident.ts` | Stops pipeline if high-stakes + low confidence. Returns `needs_user_input` instead of guessing |
| **Reason** | `agent/steps/reason.ts` | Strategy: incident type, tone, alibi policy, risks |
| **Write** | `agent/steps/write.ts` | Final apology + follow-up, grounded in all prior steps |

### Why schema validation matters

Every step calls `callLLMJson()` (`agent/llmJson.ts`) which:
- Extracts JSON from the LLM response
- Validates against a **Zod schema** (`agent/schemas.ts`)
- Retries once automatically on failure
- Falls back deterministically if retry fails (`agent/repairFallbacks.ts`)

This is what made it demeable. The bugs were never in the AI calls — they were in the handoffs.

---

## Tech stack

| Layer | Stack |
|-------|-------|
| **Frontend** | React, Vite, JavaScript |
| **Backend** | Node.js, Express |
| **Agent** | TypeScript, Zod |
| **AI** | OpenAI (via Lava AI Gateway) |
| **Auth** | Google OAuth 2.0, Auth0 (optional) |
| **Integrations** | Gmail API, Google Calendar API, Spotify API, Tremendous API, ElevenLabs |

---

## Quick start

### Prerequisites
- Node.js 18+
- Google Cloud project (Gmail API enabled)
- OpenAI API key
- Lava account (AI gateway)
- Tremendous sandbox account

### 1. Clone

```bash
git clone https://github.com/khuzaymaa918/sir-alibi.git
cd sir-alibi
```

### 2. Install

```bash
# Root
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure

```bash
cp backend/.env.example backend/.env
# Fill in your API keys
```

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && node server.js

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open `http://localhost:5173` and confess your crime.

---

## Built by

| Name | Role |
|------|------|
| [Khuzayma Mushtaq](https://github.com/khuzaymaa918) | Backend, integrations, Google OAuth, Gmail API, endpoints |
| [Abdullah Rashid](https://github.com) | Frontend, UI/UX |
| [Manas Mehra](https://github.com/manasmehra-rgb) | Agent pipeline, LLM integration |
| [Zhihan Shi](https://github.com/zhihankshi) | Agent architecture, TypeScript, repo setup |

---

<div align="center">

**YHack 2026 · Yale University · 24 hours · 5 live integrations**

⭐ Star this repo if you think Sir Alibi deserved a trophy

</div>
