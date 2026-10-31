# ECHO — Presentation Deck Content
### MongoDB Student Hackathon — Uncharted 2026
**Track:** PS1: Agentic Memory

---

## Slide 1: Title Slide

```text
[Header / Badge]
MONGODB STUDENT HACKATHON 2026

[Project Title]
ECHO
A Private AI Journal with Memory that Evolves

[Tagline]
"A diary can't find the entry that matters now. Echo can — by meaning, not just by date."

[Metadata]
Team: Echo Team  |  Track: PS1 — Agentic Memory
Members: 
• Mahathi S S (Integration, Full-Stack & QA)
• Kunal Mahale (Backend & MongoDB Architecture)
• Urmil Parmar (Frontend & UI/UX)
Contact: mahathi22027@gmail.com
```

---

## Slide 2: 01 Problem

```text
[Header]
01  PROBLEM

[Problem Statement]
What problem are you solving and for whom?
Traditional journals store entries chronologically, trapping valuable reflections in past dates, while generic AI chatbots suffer from session amnesia—forgetting your experiences, beliefs, and emotional patterns the moment you close the browser.

[The Problem]
• Chronological Silos: Users cannot surface relevant past feelings or patterns without knowing the exact date or verbatim text.
• Ephemeral AI Context: LLMs start tabula rasa every conversation, forcing users to constantly repeat personal background, preferences, and context.

[Who Is Affected]
Reflective writers, students, and professionals seeking mindful personal growth who need an AI companion that remembers their evolving life story while strictly respecting user privacy and boundaries.
```

---

## Slide 3: 02 Solution

```text
[Header]
02  SOLUTION

[Simple Explanation]
Explain your idea simply, and what makes it different.
Echo separates raw journal entries from derived structured memory objects, using semantic vector search and governance rules so the AI remembers across sessions and updates its understanding as you evolve.

[What We Built]
An end-to-end autonomous memory engine that extracts typed memories (Feelings, Beliefs, Events, Preferences) directly from personal reflections and stores them in MongoDB Atlas with 768-dimensional embeddings for instantaneous semantic recall.

[What Makes It Unique]
Unlike black-box AI memory, Echo provides complete user governance:
• Explicit Memory Inspection: Inspect extracted memories with exact source quotes.
• Provenance & Superseding: Correct past perspectives without overwriting personal growth history.
• Differential Privacy Shield: Strict zero-leakage masking of private memories from LLM context.
• Time-Bound Expiry: Automatic TTL deletion for temporary thoughts.
```

---

## Slide 4: 03 Features

```text
[Header]
03  FEATURES & DEMO

[Feature 1]
1. Semantic Recall via Vector Search
Ask "I feel so alone today" and Echo recalls "Felt hurt by friend" by meaning, not exact keywords.

[Feature 2]
2. Visible Memory Inspector & Evolution
Inspect extracted Feeling/Event/Belief cards and supersede outdated perspectives while keeping audit provenance.

[Feature 3]
3. Differential Privacy Shield & TTL Expiry
One-click lock eliminates memories from LLM prompts; TTL indexes automatically purge time-bound thoughts.

[Mockup / Visual Reference]
• 3-Panel Responsive Layout:
  Left: Conversational Journal & Real-time Audit Activity Feed
  Center: Dialogue Stream with Referenced Memory Provenance Pills
  Right: Live MongoDB Memory Inspector & Privacy Shields
```

---

## Slide 5: 04 Tech Stack & Impact

```text
[Header]
04  TECH STACK & IMPACT

[Tech Stack]
• Frontend: React 19, TypeScript, Vite 8, Figma Make Design Kit, Dark/Light Theme Engine
• Backend / APIs: Node.js 24, Express 5 REST API, JWT (`jsonwebtoken`) & `bcryptjs` Auth
• Data / AI: MongoDB Atlas Native Driver, Atlas `$vectorSearch` (Cosine Metric), Groq (`llama-3.3-70b-versatile`), Google Gemini (`text-embedding-004`)
• Cloud / Tools: Vercel (Frontend Hosting), Render (Backend API Service), MongoDB Atlas M0 Cluster

[Impact & Next Steps]
• Immediate Impact: Eliminates repetitive prompting; transforms passive journaling into proactive personal reflection and continuity.
• Scalability: Sub-second vector retrieval with MongoDB Atlas compound filtering (`user_id`, `status`, `is_private`).
• Next Steps: Contradiction detection agent to surface conflicting beliefs and weekly synthesized emotional growth summaries.
```

---

## Slide 6: Links & Submission

```text
[Header]
SUBMISSION & LINKS

[All links are public and tested without login requirements]

• Live Web Application (Frontend):
  https://echo-ai-memory-woad.vercel.app/

• Backend API Service:
  https://echo-ai-memory.onrender.com/api/health

• GitHub Repository:
  https://github.com/mahathi22027-ai/echo-ai-memory

• Demo Video (2-3 min):
  [Link to Video Walkthrough]

Thank you!  — Team Echo
```
