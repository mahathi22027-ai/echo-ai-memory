# ECHO — Private AI Journal with Evolving Memory
**MongoDB Student Hackathon · Problem Statement 1: Agentic Memory**

> *"A diary can't find the entry that matters now. Echo can — by meaning, not just by date."*

---

## 🌟 Overview

**ECHO** is a user-controlled, agentic memory journaling system. It extracts structured memories from entries, retrieves relevant experiences using MongoDB Vector Search, allows users to inspect and supersede outdated memories, strictly enforces privacy boundaries, and handles time-to-live (TTL) expiry.

### 🖥️ Three-Panel Desktop Architecture (per Hackathon Specification)
1. **Left Panel — Chat & Journal**:
   - Reflection input and AI conversation
   - Two intent modes: **Journal Mode** (Extraction) and **Recall Mode** (Semantic Search)
   - Provenance tags referencing retrieved memories with similarity scores
   - Real-time privacy guard indicators
2. **Center Panel — Memory Inspector**:
   - Structured memory cards with Type badge (`FEELING`, `BELIEF`, `EVENT`, `DECISION`, `PREFERENCE`, `GOAL`)
   - Exact source quotes (`Source: "..."`)
   - Lifecycle status badges (`Active`, `Superseded`, `Private`, `Expired`)
   - Quick actions on each card: **Supersede / Correct**, **Mark Private / Public**, **TTL Expiry**, and **Delete**
   - Search bar and filtering by status and type
3. **Right Panel — System Audit Log**:
   - Non-sensitive lifecycle event feed (`memory_created`, `memory_superseded`, `memory_marked_private`, `vector_recall`, etc.)
   - Real-time tracking of memory evolution

---

## ⚡ 6-Step Judge Demonstration Script

Built directly into the top bar of the application:
1. **Step 1: Create & Extract** — Submits a friendship vulnerability entry; extracts a `FEELING` memory with exact quote.
2. **Step 2: Persist in Storage** — Simulates session reload; memories remain intact in database storage.
3. **Step 3: Semantic Recall** — Queries: *"I'm feeling the same way again."*; retrieves memory via vector search despite different wording.
4. **Step 4: Memory Superseding** — Submits: *"Things have improved; I don't feel that way now."*; old memory becomes superseded and linked to new active memory.
5. **Step 5: Privacy Boundary** — Queries private workspace preferences; strictly excluded from LLM vector retrieval.
6. **Step 6: Expiry & TTL Guard** — Sets a 15-second timer on a memory; watch it expire and become ineligible for retrieval.

---

## 🛠️ Getting Started

### Run the Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### Backend Integration
- The frontend includes a **built-in standalone demo engine** that allows full testing even before the backend is running.
- When your teammate starts the backend API (at `http://localhost:5000/api` or custom port), the frontend will auto-detect it or you can switch modes in the **Settings** modal (top right).
- See **[API_CONTRACT.md](file:///Users/parmarurmil/ai/API_CONTRACT.md)** for full endpoint specifications, request/response bodies, and MongoDB index configurations.
