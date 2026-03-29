
    "The Alibi" The trivial problem: you forgot someone's birthday / missed a meeting / flaked on a friend. The agent constructs a complete, airtight alibi — a believable narrative with supporting evidence, a draft apology that sounds genuinely human, a recovery gift strategy personalized to that person's interests, and a scheduled follow-up to repair the relationship. It's absurd, it's funny, it's technically an autonomous multi-step reasoning agent doing real research and real writing. And everyone in the room has needed this.

The demo: a judge confesses a recent social failure. The agent builds the alibi live.

Input: "I forgot Sarah's birthday, she's my coworker"
          ↓
Step 1: RESEARCH AGENT
— Searches for gift ideas based on inferred interests
— Looks up florists / delivery services with availability
— Checks calendar for follow-up window
          ↓
Step 2: REASONING AGENT
— Assesses severity of the social failure
— Decides tone: humorous vs genuinely contrite
— Decides gift price range based on relationship type
          ↓
Step 3: WRITING AGENT
— Drafts alibi narrative (what "happened")
— Drafts apology message personalized to relationship
— Drafts follow-up message for 3 days later
          ↓
Step 4: ACTION AGENT
— Schedules follow-up reminder in calendar (GCal MCP)
— Drafts email ready to send (Gmail MCP)
— Surfaces gift purchase link with pre-filled cart
          ↓
Step 5: OBSERVE
— Did you send it? Did they respond?
— Updates relationship repair status

can you further breakdown this:
Person 3 — Frontend & Demo
Owns: Everything the judge sees and experiences

React frontend — input form (who did you fail, how badly, relationship type)
Live agent progress display — show each step completing in real time
Output cards — alibi narrative, apology draft, gift recommendation, follow-up scheduled
ElevenLabs integration — play the alibi narrative aloud
Demo script — rehearse the live judge confession moment

Time breakdown:

Hours8pm start Frontend scaffold, input form, basic layout
Hours : Agent progress UI, output card components
Hours: ElevenLabs voice integration, polish
Hours 11 am end Full demo run-through, fix anything that breaks on stage

**Frontend & Demo Breakdown (Person 3)**  
- **Scope**: Own the judge-facing experience: React UI (inputs, progress, outputs), live demo flow, and ElevenLabs playback.

- **Key Responsibilities**
  - Input flow: form for “who you failed,” severity slider, relationship type select, optional context field.
  - Progress display: stepper showing Research → Reasoning → Writing → Action → Observe with live statuses and timestamps.
  - Output cards: alibi narrative, apology draft, gift recommendation with link, follow-up schedule confirmation.
  - Media: ElevenLabs text-to-speech for the alibi narrative (play/pause UI).
  - Demo readiness: a scripted flow the judge follows; resilient to flaky network (graceful loading/error states).

- **Architecture / Components**
  - `App` shell with layout and theme tokens.
  - `InputForm` component: controlled fields, validation, submit triggers agent run.
  - `ProgressPanel` component: step list with status (pending/active/done/error), optional sub-events.
  - `OutputCards`:
    - `AlibiCard` (narrative + TTS play).
    - `ApologyCard` (apology text + copy).
    - `GiftCard` (gift idea, price range, CTA link).
    - `FollowUpCard` (scheduled time, “Add to calendar” / confirmed).
  - `Toast`/`Banner` for errors/network issues.
  - `Loader` and skeletons for outputs while steps run.
  - ElevenLabs hook/service: `useTTS(text)` returning audio URL, playing state, errors.

- **Data Flow (happy path)**
  1) User submits form → call backend to start agent run (returns runId).  
  2) Poll or stream step updates → update `ProgressPanel`.  
  3) When artifacts arrive, populate cards; enable TTS on alibi text.  
  4) Show follow-up scheduled status and gift link.

- **States to Handle**
  - Idle → Running → Partial results → Completed.  
  - Errors per step (recover with retry or friendly message).  
  - TTS failures (fallback: text only).  
  - Network slow: show spinners/skeletons; keep UI responsive.

- **Demo Script (judge confession moment)**
  - Prompt script: Judge says “I forgot Sarah’s birthday; she’s my coworker.”  
  - You narrate: click “Run”; call out each step lighting up; when alibi appears, hit “Play” (ElevenLabs); copy/paste apology; show gift link and follow-up timestamp.  
  - Keep a canned successful run cached in case live call is slow.

- **Time Breakdown (starting 8pm, done by ~11am)**
  - 8pm–10pm: Frontend scaffold, layout, input form with validation; dummy data for outputs.
  - 10pm–1am: Progress UI + output card components wired to mock data; skeleton/loading/error states.
  - 1am–3am: ElevenLabs integration (TTS hook, play controls); audio UI polish.
  - 3am–5am: Wire to real agent endpoints (stream/poll), basic retries, copy buttons.
  - 5am–7am: Visual polish, spacing, responsive tweaks; add cached “golden path” run for demo safety.
  - 7am–9am: Full demo run-through; fix showstopper bugs; rehearse script and timing.

- **Risks & Mitigations**
  - Network flake: cached response + retry buttons; clear error banners.
  - Audio fail: text-only fallback, disable play button on error.
  - Latency: optimistic loaders and progress heartbeat; avoid blocking UI.

- **Nice-to-haves if time**
  - Theme toggle (light for projector clarity).  
  - Keyboard-friendly form + copy buttons.  
  - Sub-step logs in ProgressPanel for extra “agent” feel.

frontend design thoughts (ask questions if doesnt fit the AI Agent):

---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.


Styling: try using roblox doors font. and cream and brown/orange accents. 

ELEVENLABS API KEY: sk_f58e82432597f9a653b7c9790875c6675b2e616d2d60b515

choose any voice.
