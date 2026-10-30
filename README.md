# Echo: The Memory-Governed AI Journal

**"A diary can't find the entry that matters now. Echo can — by meaning, not just by date."**

Echo is a private, AI-powered journaling application built for the Agentic Memory track. Unlike standard chatbots that forget you the moment you close the tab, Echo extracts structured memories from your journal entries, retrieves them based on semantic meaning, and gives you full control over what is remembered, corrected, hidden, or allowed to expire.

---

## 🔗 Live Links

- **Live Deployment:** Coming soon
- **Demo Video:** Coming soon
- **Presentation Deck:** Coming soon

---

## 🚀 The Core Problem & Solution

Traditional journals store text chronologically. If you write about a fight with a friend today, a standard journal won't remind you of a similar feeling you wrote about three months ago.

Echo solves this by acting as a Memory Engine. It separates raw text from structured data. It understands what happened, how you felt, and what you believe, storing these as individual memory objects in MongoDB.

---

## ✨ Key Features (Agentic Memory)

### 1. Semantic Recall (Vector Search)
Ask Echo, "I feel so alone today." It can search past entries by meaning and retrieve a memory such as, "Felt hurt and uncared for by Riya," even though the exact words don't match.

### 2. Visible Memory Inspector
A live UI panel displays every extracted memory, its type (Event, Feeling, Belief), and the exact source quote it was extracted from.

### 3. Memory Governance (Superseding)
If you say, "Actually, I wasn't angry, I was just tired," Echo marks the old memory as superseded and creates a new active memory, preserving your history of growth.

### 4. Privacy & Redaction
You can flag specific memories as private. Echo excludes them from AI context and retrieval, ensuring the AI does not use them in its responses.

### 5. Time-Bound Expiry (TTL)
Set a thought as temporary (e.g., "Don't bring up my job search for a week"). Echo sets an `expires_at` timestamp. The memory is filtered out of retrieval immediately after expiry, and MongoDB's TTL index deletes it later.

---

## 🛠️ Technology Stack

- **Frontend:** To be finalized
- **Backend:** To be finalized
- **Database:** MongoDB Atlas
- AI / LLM: Google Gemini 3.8 Flash
- Embeddings: Google Gemini Embedding 001
- Database: MongoDB Atlas with Vector Search

---

## 🗄️ MongoDB Architecture

We utilize MongoDB Atlas to power the memory lifecycle.

- **Vector Search Index:** Applied to the `embedding` field to enable semantic retrieval. Retrieval is scoped by `user_id`, `status: "active"`, and `is_private: false`.
- **TTL Index:** Applied to the `expires_at` field. MongoDB automatically deletes documents after their expiry time, subject to its background cleanup process.
- **Compound Index:** Applied to `user_id` and `status` for efficient rendering of the Memory Inspector.

### Data Schema (Memories Collection)

```json
{
  "_id": "mem_001",
  "user_id": "user_123",
  "type": "feeling",
  "content": "Feels hurt and uncared for in a friendship",
  "source_quote": "I told her it was fine, but honestly, I'm really hurt.",
  "embedding": [0.12, 0.44],
  "status": "active",
  "is_private": false,
  "expires_at": null,
  "supersedes_id": null,
  "created_at": "2026-10-31T10:00:00Z"
}
```

*Note: The embedding array above is illustrative. Its actual dimensions must match the selected embedding model.*

---

## ⚙️ How to Run Locally

### 1. Prerequisites

- Node.js installed
- MongoDB Atlas account
- API key for the chosen LLM provider

### 2. Environment Variables

Create a `.env` or `.env.local` file in the appropriate project directory and add:

```env
MONGODB_URI=your_mongodb_connection_string
LLM_API_KEY=your_llm_api_key
NEXTAUTH_SECRET=your_auth_secret
```

Never commit your actual environment file or API keys to GitHub.

### 3. Installation

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/echo-ai-memory.git
cd echo-ai-memory
```

Install dependencies and start the development server according to the final frontend/backend project structure.

For a single Node.js application, the commands may be:

```bash
npm install
npm run dev
```

### 4. MongoDB Setup

To enable semantic memory search, configure the required indexes in MongoDB Atlas:

1. **Vector Search Index:** Create a search index on the `memories` collection using the `embedding` field. Set its dimensions according to the selected embedding model.
2. **TTL Index:** Create a TTL index on `expires_at` to enable automatic deletion of expired memory documents.
3. **Compound Index:** Create an index on `user_id` and `status` to support efficient memory queries.

---

## 🛡️ Privacy & Safety

- **Data Scoping:** Database queries must enforce `user_id` scoping so users can access only their own memories.
- **Memory Privacy:** Private memories must be excluded from AI retrieval and prompt construction, not merely hidden in the interface.
- **Expiry Handling:** Expired memories must be excluded from retrieval immediately, even if MongoDB's TTL cleanup has not yet deleted them.
- **No Secret Leaks:** API keys and database credentials must remain server-side and must never be exposed to the client.

Echo is a journaling and memory-management tool, not a substitute for professional mental health care.

---

## 👥 The Team

- **Kunal Mahale:** Backend & MongoDB Architecture
- **Urmil Parmar:** Frontend & UI/UX
- **Mahathi SS:** Integration, Deployment & QA

---

## 🎯 Project Goal

Echo aims to demonstrate how persistent, semantic, and user-governed memory can make AI interactions more contextual, useful, and respectful of user control.

**Built for the MongoDB Student Hackathon — Uncharted 2026.**
