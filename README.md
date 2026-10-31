# Echo: The Memory-Governed AI Journal

> **"A diary can't find the entry that matters now. Echo can — by meaning, not just by date."**

Echo is a private, AI-powered journaling application built for the **MongoDB Student Hackathon — Uncharted 2026** (Problem Statement 1: Agentic Memory). Unlike standard chatbots that forget everything when you close the session, Echo extracts structured memories from your journal entries, retrieves them using semantic vector search, and gives you total governance over what is remembered, corrected, shielded, or set to expire.

---

## 🔗 Live Links & Media

- **Live Frontend:** [Deploying to Vercel/Render]
- **Live API Backend:** [Deploying to Render]
- **Demo Video:** Coming soon
- **Presentation Deck (PPT):** [Google Drive Presentation Slides](https://drive.google.com/drive/folders/1xw4U0sCrN8pbvLPVlLoAlrkvSnVBmLPe?usp=share_link)
- **Repository:** [https://github.com/mahathi22027-ai/echo-ai-memory](https://github.com/mahathi22027-ai/echo-ai-memory)

---

## 🛠️ Complete Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **React 19, TypeScript, Vite 8** | Modern, responsive single-page web app built with component modularity |
| **Styling & Design** | **Figma Make Kit, Custom CSS Variables** | Native theme engine (Light/Dark mode), smooth custom scrollbars, and tactile controls |
| **Backend Framework**| **Node.js 24, Express 5 (ES Modules)** | High-throughput asynchronous REST API for chat ingestion and memory orchestration |
| **Authentication** | **JWT (`jsonwebtoken`) & `bcryptjs`** | Secure user registration, password hashing, and token-based API request authorization |
| **Primary Database** | **MongoDB Atlas** | Document store for users, journal entries, memory documents, and audit logs |
| **Vector Search** | **Atlas `$vectorSearch` + Cosine Fallback** | Native approximate k-nearest neighbor (k-NN) semantic vector retrieval |
| **LLM & Reasoning** | **Groq (`llama-3.3-70b-versatile`)** | Fast extraction of feelings/events/beliefs, companion responses, and autonomous agent decisions |
| **Embeddings** | **Google Gemini (`text-embedding-004`)** | 768-dimensional dense semantic vectors for memories and queries |

---

## ✨ Core Agentic Memory Features

### 1. Semantic Recall via Vector Search
- Switch between **Journal Entry** (ingestion mode) and **Ask Echo** (query mode).
- Queries like *"I feel so alone today"* match related past memories such as *"Felt hurt and uncared for by friend"*, even without keyword overlap.
- Uses hybrid retrieval: Native Atlas `$vectorSearch` with automatic cosine similarity math fallback.

### 2. Live Memory Inspector
- A dedicated right-hand side panel showing every stored memory in real time.
- Categorizes memory objects into:
  - 💭 **Feeling** (Emotional states, vulnerabilities)
  - 📅 **Event** (Things that happened, life milestones)
  - 💡 **Belief** (Personal values, convictions, perspectives)
  - ⚙️ **Preference** (Daily routines, working conditions)
- Displays exact source quotes, timestamps, status badges, and action buttons.

### 3. Memory Governance & Versioning (Superseding)
- Humans change their minds and perspectives. If you write: *"Actually, I wasn't angry, I was just exhausted"*, Echo allows you to supersede the past memory.
- The previous memory is preserved with `status: "superseded"` for provenance, while the new active memory takes its place.

### 4. Differential Privacy Shield (GOV-01)
- Toggle any memory to **Private** with one click.
- Memories marked private are **completely excluded** from AI retrieval prompts and chat context, ensuring the LLM cannot access or leak shielded reflections.

### 5. Time-Bound Expiry (TTL Indexing)
- Mark thoughts as temporary (e.g., *"Don't bring up my exam anxiety after Friday"*).
- Echo assigns an `expires_at` timestamp.
- The memory is immediately filtered out of queries in application logic and purged automatically from MongoDB using a background TTL index.

### 6. Real-time Audit & Activity Log
- Inspect live system events: memory creations, privacy toggles, version superseding, and vector recall queries with sub-second timestamps.

---

## 🗄️ MongoDB Architecture & Schemas

### Collections

1. `users` — Authenticated user records with hashed passwords and profile metadata.
2. `journal_entries` — Raw original journal reflections submitted by the user.
3. `memories` — Structured agentic memory documents with vector embeddings.
4. `memory_events` — Immutable audit log recording every lifecycle event.

### Memory Document Schema (`memories`)

```json
{
  "_id": "6724a8bc1d4e2f0012ab34cd",
  "user_id": "user_mahathi_gmail_com",
  "entry_id": "6724a8ba1d4e2f0012ab34cc",
  "type": "feeling",
  "content": "Feels hurt and uncared for in a friendship",
  "source_quote": "I told her it was fine, but honestly, I'm really hurt.",
  "embedding": [0.0142, -0.0521, 0.0819, ...],
  "status": "active",
  "is_private": false,
  "expires_at": null,
  "supersedes_id": null,
  "created_at": "2026-10-31T10:00:00.000Z"
}
```

### MongoDB Atlas Indexes

- **Vector Search Index (`vector_index`)**:
  ```json
  {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 768,
        "similarity": "cosine"
      },
      {
        "type": "filter",
        "path": "user_id"
      },
      {
        "type": "filter",
        "path": "status"
      },
      {
        "type": "filter",
        "path": "is_private"
      }
    ]
  }
  ```
- **TTL Index**: `{ "expires_at": 1 }` with `{ expireAfterSeconds: 0 }`
- **Compound Query Index**: `{ "user_id": 1, "status": 1, "created_at": -1 }`

---

## ⚙️ Running Locally

### 1. Prerequisites
- **Node.js** v20+ installed
- **MongoDB Atlas** cluster or local MongoDB instance
- Free API keys from:
  - [Groq Console](https://console.groq.com/keys)
  - [Google AI Studio](https://aistudio.google.com/)

### 2. Environment Variables

Create `.env` in the root (or `server/.env`):

```env
# Server Port
PORT=5000

# MongoDB Atlas URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.petwe6h.mongodb.net/
MONGODB_DB_NAME=echo_journal

# LLM & AI Keys
GROQ_API_KEY=gsk_your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Authentication
JWT_SECRET=your_jwt_secret_key_here
```

In `frontend/.env` (optional for local dev, defaults to Vite proxy):
```env
VITE_BACKEND_URL=http://localhost:5000/api
```

### 3. Installation & Startup

```bash
# Clone the repository
git clone https://github.com/mahathi22027-ai/echo-ai-memory.git
cd echo-ai-memory

# Install root & backend dependencies
npm install

# Install frontend dependencies
npm --prefix frontend install

# Terminal 1: Start Backend API (Port 5000)
npm run server

# Terminal 2: Start Frontend Application (Port 5173 / 5174)
npm run dev
```

Visit **`http://localhost:5173`** (or `http://localhost:5174`) in your browser.

---

## 🚀 Deployment Instructions

### Deploying Backend (e.g. Render / Railway)
- **Root Directory:** leave empty or set to `server`
- **Build Command:** `npm install`
- **Start Command:** `node server/server.js`
- **Environment Variables:** Set `PORT`, `MONGODB_URI`, `MONGODB_DB_NAME`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `JWT_SECRET`.

### Deploying Frontend (e.g. Vercel / Netlify / Render Static Site)
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Environment Variable:** `VITE_BACKEND_URL=https://your-backend-api.onrender.com/api`

---

## 👥 The Team

- **Mahathi S S:** Integration, Full-Stack Architecture & QA
- **Kunal Mahale:** Backend & MongoDB Architecture
- **Urmil Parmar:** Frontend & UI/UX

---

## 🏆 Hackathon Alignment

Built for the **MongoDB Student Hackathon — Uncharted 2026** under **Problem Statement 1: Agentic Memory**. Echo proves that long-term AI companionship requires user-first memory governance: transparent storage, editable facts, differential privacy shields, and automatic time-bound forgetting.
