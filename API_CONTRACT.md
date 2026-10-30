# ECHO — Backend API Contract & Integration Guide
**MongoDB Student Hackathon · PS1: Agentic Memory**

This document specifies the exact API contract for the backend developer (building Node.js + Express + MongoDB Atlas) to connect with the React frontend.

---

## 🚀 Quick Setup for Backend Developer

1. The frontend is running at: `http://localhost:5173`
2. Expected backend URL: `http://localhost:5000/api` (Configurable directly in the frontend Settings UI)
3. Ensure CORS is enabled on the backend for `http://localhost:5173`.
   ```js
   const cors = require('cors');
   app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
   ```

---

## 📡 API Endpoints Specification

### 1. Chat & Ingestion / Recall Endpoint
- **Method**: `POST`
- **Path**: `/api/chat`
- **Headers**:
  - `Content-Type: application/json`
  - `x-user-id: user_123` (or authenticated session token)

#### A. When `mode === "journal"` (Journal Entry & Memory Extraction):
**Request Body**:
```json
{
  "message": "I feel like my friends don't value my efforts. Whenever plans are made, it feels like I'm the only one reaching out.",
  "mode": "journal",
  "user_id": "user_123"
}
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "mode": "journal",
  "reply": "I've ingested your reflection and extracted a structured FEELING memory into your MongoDB vault.",
  "extractedMemories": [
    {
      "_id": "mem_001",
      "user_id": "user_123",
      "entry_id": "entry_045",
      "type": "feeling",
      "content": "Experiences vulnerability and unmet expectations in friendship reciprocity.",
      "source_quote": "I feel like my friends don't value my efforts.",
      "embedding": [0.12, 0.44, 0.08, 0.76, 0.23],
      "status": "active",
      "is_private": false,
      "expires_at": null,
      "supersedes_id": null,
      "created_at": "2026-10-31T10:00:00Z"
    }
  ]
}
```

#### B. When `mode === "query"` (Semantic Recall & Provenance):
**Request Body**:
```json
{
  "message": "I'm feeling the same way again.",
  "mode": "query",
  "user_id": "user_123"
}
```

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "mode": "query",
  "reply": "Based on your past journal entry, you shared: 'I feel like my friends don't value my efforts.' You felt an imbalance in reciprocity. Is this recurring today?",
  "referencedMemories": ["mem_001"],
  "similarityScores": {
    "mem_001": 0.89
  },
  "privacyShieldedCount": 0
}
```

---

### 2. List Memories
- **Method**: `GET`
- **Path**: `/api/memories`
- **Query Params**:
  - `status`: (optional) `active` | `superseded` | `private` | `expired`
  - `type`: (optional) `feeling` | `belief` | `event` | `decision` | `preference` | `goal`
- **Headers**:
  - `x-user-id: user_123`

**Expected Response (200 OK)**:
```json
{
  "success": true,
  "memories": [
    {
      "_id": "mem_001",
      "user_id": "user_123",
      "entry_id": "entry_045",
      "type": "feeling",
      "content": "Feels hurt and uncared for in a friendship.",
      "source_quote": "I told her it was fine, but honestly, I'm really hurt.",
      "status": "active",
      "is_private": false,
      "expires_at": null,
      "supersedes_id": null,
      "created_at": "2026-10-31T10:00:00Z"
    }
  ]
}
```

---

### 3. Update / Supersede / Privacy / Expiry
- **Method**: `PATCH`
- **Path**: `/api/memories/:id`

#### A. Superseding a Memory (Correction):
**Request Body**:
```json
{
  "supersedeWith": {
    "content": "Reconciled with friends and emotional burden lifted.",
    "type": "feeling",
    "source_quote": "Things have improved between us; we talked it out."
  }
}
```
**Expected Behavior**:
1. Mark old memory document with `status: "superseded"`.
2. Insert new memory document with `status: "active"` and `supersedes_id: ":id"`.
3. Return `{ "success": true, "supersededMemory": { ... }, "newMemory": { ... } }`.

#### B. Toggle Privacy:
**Request Body**:
```json
{ "is_private": true }
```

#### C. Set Expiry (TTL):
**Request Body**:
```json
{ "expires_at": "2026-10-31T10:15:00Z" }
```

---

### 4. Delete Memory
- **Method**: `DELETE`
- **Path**: `/api/memories/:id`

**Expected Response**:
```json
{ "success": true, "deletedId": "mem_001" }
```

---

### 5. System Audit Events
- **Method**: `GET`
- **Path**: `/api/memory-events`

**Expected Response**:
```json
{
  "success": true,
  "events": [
    {
      "_id": "evt_001",
      "user_id": "user_123",
      "memory_id": "mem_001",
      "event_type": "memory_created",
      "timestamp": "2026-10-31T10:00:00Z",
      "metadata": {
        "type": "feeling",
        "source_entry_id": "entry_045"
      }
    }
  ]
}
```

---

## 🗄️ MongoDB Atlas Schema Summary

### Collection: `memories`
```javascript
{
  _id: ObjectId("..."),
  user_id: "user_123",
  entry_id: "entry_045",
  type: "feeling", // 'event' | 'feeling' | 'belief' | 'decision' | 'preference' | 'goal'
  content: "Feels hurt and uncared for in a friendship.",
  source_quote: "I told her it was fine, but honestly, I'm really hurt.",
  embedding: [0.12, 0.44, 0.08, ...], // Match vector dimensions
  status: "active", // 'active' | 'superseded' | 'private' | 'expired'
  is_private: false,
  expires_at: ISODate("...") or null,
  supersedes_id: "mem_001" or null,
  created_at: ISODate("...")
}
```

### MongoDB Indexes:
1. **Vector Search Index**: on `embedding` with filters on `user_id`, `status`, `is_private`.
2. **TTL Index**: on `expires_at` (`expireAfterSeconds: 0`).
3. **Compound Index**: `user_id: 1, status: 1, created_at: -1`.
