/**
 * ECHO Backend Server - Node.js + Express (ES Modules)
 * MongoDB Student Hackathon · PS1: Agentic Memory
 * 
 * Features:
 * - Native 'mongodb' driver for MongoDB Atlas
 * - Groq API (llama-3.3-70b-versatile) for chat & memory extraction
 * - OpenAI API (text-embedding-3-small) for 1536-dimensional embeddings
 * - MongoDB Vector Search ($vectorSearch) with metadata filters
 * - Expiry / TTL handling, privacy shields, and superseding version control
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDB, ObjectId, getIsConnected } from './db.js';
import { 
  getEmbedding, 
  extractMemories, 
  generateContextualAnswer, 
  evaluateAgenticMemory,
  cosineSimilarity 
} from './ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend running on Vite (default port 5173) or any origin in dev
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json());

// Helper to extract authenticated or default user ID
function getUserId(req) {
  return req.headers['x-user-id'] || req.body?.user_id || req.query?.user_id || 'demo_user';
}

// Convert MongoDB document ObjectId to string
function serializeDoc(doc) {
  if (!doc) return doc;
  const serialized = { ...doc };
  if (serialized._id) {
    serialized._id = serialized._id.toString();
  }
  return serialized;
}

// ==========================================
// 1. POST /api/chat - Ingestion & Extraction (or Recall query)
// ==========================================
app.post('/api/chat', async (req, res) => {
  try {
    const userId = getUserId(req);
    const text = (req.body.text || req.body.message || '').trim();
    const mode = req.body.mode || 'journal';

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text or message is required' });
    }

    // If frontend calls /api/chat in 'auto' mode, route to autonomous agentic memory handler!
    if (mode === 'auto') {
      return handleAutoLogic(req, res, text, userId);
    }

    // If frontend calls /api/chat in 'query' mode, route to semantic query handler!
    if (mode === 'query' || text.endsWith('?') && req.body.mode !== 'journal') {
      return handleQueryLogic(req, res, text, userId);
    }

    const db = getDB();

    // 1. Save original journal entry to `journal_entries` collection
    const journalEntry = {
      user_id: userId,
      text,
      created_at: new Date()
    };
    const entryResult = await db.collection('journal_entries').insertOne(journalEntry);
    const entryId = entryResult.insertedId.toString();

    // 2. Extract structured memories & generate warm companion response via Groq LLM
    console.log(`[POST /api/chat] Extracting memories from entry for user: ${userId}...`);
    const extractionResult = await extractMemories(text);
    const extractedList = Array.isArray(extractionResult) 
      ? extractionResult 
      : (extractionResult.memories || []);
    const companionReply = extractionResult.reply || "Thank you for sharing your thoughts with me.";

    // 3. For each extracted memory: generate embedding, calculate expires_at, insert to memories in parallel
    console.log(`[POST /api/chat] Generating Gemini embeddings in parallel for ${extractedList.length} memories...`);
    const memoryDocsToInsert = await Promise.all(
      extractedList.map(async (mem) => {
        const embedding = await getEmbedding(`${mem.type}: ${mem.content}`);
        const expiresAt = mem.is_temporary 
          ? new Date(Date.now() + 24 * 60 * 60 * 1000) 
          : null;

        return {
          user_id: userId,
          entry_id: entryId,
          type: mem.type,
          content: mem.content,
          source_quote: mem.source_quote,
          embedding,
          status: 'active',
          is_private: false,
          expires_at: expiresAt,
          supersedes_id: null,
          created_at: new Date()
        };
      })
    );

    const insertedMemories = [];
    if (memoryDocsToInsert.length > 0) {
      const insertResult = await db.collection('memories').insertMany(memoryDocsToInsert);
      const insertedIds = Object.values(insertResult.insertedIds).map(id => id.toString());

      const auditEvents = memoryDocsToInsert.map((doc, idx) => {
        const memoryId = insertedIds[idx];
        insertedMemories.push({ ...doc, _id: memoryId });
        return {
          user_id: userId,
          memory_id: memoryId,
          event_type: 'memory_created',
          timestamp: new Date(),
          metadata: {
            type: doc.type,
            source_entry_id: entryId,
            content_summary: doc.content.slice(0, 50)
          }
        };
      });

      await db.collection('memory_events').insertMany(auditEvents);
    }

    console.log(`[POST /api/chat] Successfully stored ${insertedMemories.length} memories.`);

    return res.status(200).json({
      success: true,
      message: 'Journal entry processed and memories extracted.',
      reply: companionReply,
      mode: 'journal',
      extractedMemories: insertedMemories.map(serializeDoc),
      memories: insertedMemories.map(serializeDoc)
    });
  } catch (error) {
    console.error('[POST /api/chat Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. POST /api/query - Semantic Vector Recall & Contextual Response
// ==========================================
app.post('/api/query', async (req, res) => {
  try {
    const userId = getUserId(req);
    const query = (req.body.query || req.body.message || '').trim();
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }
    return handleQueryLogic(req, res, query, userId);
  } catch (error) {
    console.error('[POST /api/query Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2b. POST /api/auto - Autonomous Agentic Memory Pipeline
// ==========================================
app.post('/api/auto', async (req, res) => {
  try {
    const userId = getUserId(req);
    const text = (req.body.text || req.body.message || req.body.query || '').trim();
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text or message is required' });
    }
    return handleAutoLogic(req, res, text, userId);
  } catch (error) {
    console.error('[POST /api/auto Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Reusable vector memory retrieval with Atlas Vector Search + Cosine Fallback
async function retrieveRelevantMemories(db, userId, queryText, queryEmbedding = null) {
  const now = new Date();
  const embedding = queryEmbedding || await getEmbedding(queryText);

  let retrievedMemories = [];
  const similarityScores = {};

  const vectorFilter = {
    user_id: userId,
    status: 'active',
    is_private: false,
    $or: [
      { expires_at: null },
      { expires_at: { $gt: now } }
    ]
  };

  // 1. Attempt Native MongoDB Atlas $vectorSearch
  let usedNativeVectorSearch = false;
  try {
    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: embedding,
          numCandidates: 50,
          limit: 3,
          filter: vectorFilter
        }
      },
      {
        $project: {
          _id: 1,
          user_id: 1,
          entry_id: 1,
          type: 1,
          content: 1,
          source_quote: 1,
          status: 1,
          is_private: 1,
          expires_at: 1,
          supersedes_id: 1,
          created_at: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ];

    const results = await db.collection('memories').aggregate(pipeline).toArray();
    // Strict Grounding Gate: score >= 0.70
    const qualified = (results || []).filter(doc => (doc.score || 0) >= 0.70);
    if (qualified.length > 0) {
      retrievedMemories = qualified;
      usedNativeVectorSearch = true;
      qualified.forEach(doc => {
        similarityScores[doc._id.toString()] = Number((doc.score || 0.85).toFixed(2));
      });
      console.log(`[Vector Search] Native Atlas $vectorSearch matched ${qualified.length} grounded memories (score >= 0.70).`);
    }
  } catch (vectorErr) {
    try {
      const fallbackPipeline = [
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: embedding,
            numCandidates: 50,
            limit: 20
          }
        },
        { $match: vectorFilter },
        { $limit: 3 },
        {
          $project: {
            _id: 1,
            user_id: 1,
            entry_id: 1,
            type: 1,
            content: 1,
            source_quote: 1,
            status: 1,
            is_private: 1,
            expires_at: 1,
            supersedes_id: 1,
            created_at: 1,
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ];
      const results = await db.collection('memories').aggregate(fallbackPipeline).toArray();
      // Strict Grounding Gate: score >= 0.70
      const qualified = (results || []).filter(doc => (doc.score || 0) >= 0.70);
      if (qualified.length > 0) {
        retrievedMemories = qualified;
        usedNativeVectorSearch = true;
        qualified.forEach(doc => {
          similarityScores[doc._id.toString()] = Number((doc.score || 0.85).toFixed(2));
        });
        console.log(`[Vector Search] Native Atlas $vectorSearch (post-filter) matched ${qualified.length} grounded memories (score >= 0.70).`);
      }
    } catch (secondErr) {
      console.warn(`[Vector Search Notice] Native Atlas $vectorSearch stage not active (${secondErr.message}). Using in-memory cosine fallback over eligible documents.`);
    }
  }

  // 2. In-Memory Cosine Fallback with Strict Grounding Gate (score >= 0.72)
  if (!usedNativeVectorSearch) {
    const eligibleDocs = await db.collection('memories').find(vectorFilter).toArray();

    const scored = eligibleDocs.map(doc => {
      const score = cosineSimilarity(embedding, doc.embedding);
      return { doc, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Strict Grounding Gate: score >= 0.72
    const topMatches = scored.filter(s => s.score >= 0.72).slice(0, 3);
    retrievedMemories = topMatches.map(s => {
      const serialized = serializeDoc(s.doc);
      similarityScores[serialized._id] = Number(s.score.toFixed(2));
      return serialized;
    });
    console.log(`[Cosine Fallback] Scored ${eligibleDocs.length} eligible documents. Matched ${retrievedMemories.length} grounded memories (score >= 0.72).`);
  }

  // 3. Count private memories for privacy shield
  const privateCount = await db.collection('memories').countDocuments({
    user_id: userId,
    is_private: true
  });

  return { retrievedMemories, similarityScores, privateCount, queryEmbedding: embedding };
}

// Common handler for semantic vector search query
async function handleQueryLogic(req, res, query, userId) {
  const db = getDB();
  const { retrievedMemories, similarityScores, privateCount } = await retrieveRelevantMemories(db, userId, query);

  const answer = await generateContextualAnswer(query, retrievedMemories);
  const memoriesUsedIds = retrievedMemories.map(m => m._id.toString());

  await db.collection('memory_events').insertOne({
    user_id: userId,
    memory_id: memoriesUsedIds[0] || 'none',
    event_type: 'vector_recall',
    timestamp: new Date(),
    metadata: {
      query: query.slice(0, 80),
      memories_retrieved_count: retrievedMemories.length,
      private_shielded_count: privateCount
    }
  });

  return res.status(200).json({
    success: true,
    mode: 'query',
    answer,
    reply: answer, // for frontend compatibility
    memoriesUsed: memoriesUsedIds,
    referencedMemories: memoriesUsedIds,
    similarityScores,
    privacyShieldedCount: privateCount,
    memories: retrievedMemories.map(serializeDoc)
  });
}

// Handler for Autonomous Agentic Memory Pipeline (/api/auto)
async function handleAutoLogic(req, res, text, userId) {
  const db = getDB();

  // 1. Record journal entry in journal_entries
  const journalEntry = {
    user_id: userId,
    text,
    mode: 'auto',
    created_at: new Date()
  };
  const entryResult = await db.collection('journal_entries').insertOne(journalEntry);
  const entryId = entryResult.insertedId.toString();

  // 2. Retrieve top past memories using vector search + cosine fallback
  const { retrievedMemories, similarityScores, privateCount } = await retrieveRelevantMemories(db, userId, text);
  const memoriesUsedIds = retrievedMemories.map(m => m._id.toString());

  // 3. Autonomous Reasoning & Action Decision (Groq LLM)
  console.log(`[Auto Agent] Evaluating input with ${retrievedMemories.length} recalled memories for user: ${userId}...`);
  const aiData = await evaluateAgenticMemory(text, retrievedMemories);
  console.log(`[Auto Agent] Decision: ${aiData.action}${aiData.supersede_id ? ' -> target: ' + aiData.supersede_id : ''}`);

  let insertedMemory = null;
  let supersededId = null;

  // 4. Execute DB mutations based on decided action
  if (aiData.action === 'SAVE_NEW' && aiData.new_memory) {
    const mem = aiData.new_memory;
    const embedding = await getEmbedding(`${mem.type}: ${mem.content}`);
    const expiresAt = mem.is_temporary ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

    const memoryDoc = {
      user_id: userId,
      entry_id: entryId,
      type: mem.type,
      content: mem.content,
      source_quote: mem.source_quote,
      embedding,
      status: 'active',
      is_private: false,
      expires_at: expiresAt,
      supersedes_id: null,
      created_at: new Date()
    };

    const result = await db.collection('memories').insertOne(memoryDoc);
    const insertedId = result.insertedId.toString();
    insertedMemory = { ...memoryDoc, _id: insertedId };

    await db.collection('memory_events').insertOne({
      user_id: userId,
      memory_id: insertedId,
      event_type: 'memory_created',
      timestamp: new Date(),
      metadata: {
        type: mem.type,
        source_entry_id: entryId,
        mode: 'auto',
        action: 'SAVE_NEW',
        content_summary: mem.content.slice(0, 50)
      }
    });
  } else if (aiData.action === 'SUPERSEDE_OLD' && aiData.new_memory) {
    const mem = aiData.new_memory;
    let targetOldId = aiData.supersede_id;
    let oldMemory = null;

    if (targetOldId) {
      const queryId = ObjectId.isValid(targetOldId) ? new ObjectId(targetOldId) : targetOldId;
      oldMemory = await db.collection('memories').findOne({ _id: queryId, user_id: userId });
    }

    if (!oldMemory && retrievedMemories.length > 0) {
      const fallbackId = retrievedMemories[0]._id;
      const queryId = ObjectId.isValid(fallbackId) ? new ObjectId(fallbackId) : fallbackId;
      oldMemory = await db.collection('memories').findOne({ _id: queryId, user_id: userId });
    }

    if (oldMemory) {
      supersededId = oldMemory._id.toString();
      const embedding = await getEmbedding(`${mem.type}: ${mem.content}`);
      const expiresAt = mem.is_temporary ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

      const newMemoryDoc = {
        user_id: userId,
        entry_id: entryId,
        type: mem.type || oldMemory.type,
        content: mem.content,
        source_quote: mem.source_quote || oldMemory.source_quote,
        embedding,
        status: 'active',
        is_private: false,
        expires_at: expiresAt,
        supersedes_id: supersededId,
        created_at: new Date()
      };

      const insertResult = await db.collection('memories').insertOne(newMemoryDoc);
      const newMemoryId = insertResult.insertedId.toString();
      insertedMemory = { ...newMemoryDoc, _id: newMemoryId };

      const queryId = ObjectId.isValid(supersededId) ? new ObjectId(supersededId) : supersededId;
      await db.collection('memories').updateOne({ _id: queryId }, { $set: { status: 'superseded' } });

      await db.collection('memory_events').insertOne({
        user_id: userId,
        memory_id: newMemoryId,
        event_type: 'memory_superseded',
        timestamp: new Date(),
        metadata: {
          mode: 'auto',
          action: 'SUPERSEDE_OLD',
          superseded_memory_id: supersededId,
          new_memory_id: newMemoryId,
          type: newMemoryDoc.type
        }
      });
    } else {
      // Fallback to SAVE_NEW if target old memory not found
      const embedding = await getEmbedding(`${mem.type}: ${mem.content}`);
      const memoryDoc = {
        user_id: userId,
        entry_id: entryId,
        type: mem.type,
        content: mem.content,
        source_quote: mem.source_quote,
        embedding,
        status: 'active',
        is_private: false,
        expires_at: null,
        supersedes_id: null,
        created_at: new Date()
      };
      const result = await db.collection('memories').insertOne(memoryDoc);
      const insertedId = result.insertedId.toString();
      insertedMemory = { ...memoryDoc, _id: insertedId };

      await db.collection('memory_events').insertOne({
        user_id: userId,
        memory_id: insertedId,
        event_type: 'memory_created',
        timestamp: new Date(),
        metadata: {
          type: mem.type,
          source_entry_id: entryId,
          mode: 'auto',
          action: 'SAVE_NEW_FALLBACK',
          content_summary: mem.content.slice(0, 50)
        }
      });
    }
  } else {
    // NO_SAVE: Log vector_recall
    await db.collection('memory_events').insertOne({
      user_id: userId,
      memory_id: memoriesUsedIds[0] || 'none',
      event_type: 'vector_recall',
      timestamp: new Date(),
      metadata: {
        query: text.slice(0, 80),
        mode: 'auto',
        action: 'NO_SAVE',
        memories_retrieved_count: retrievedMemories.length,
        private_shielded_count: privateCount
      }
    });
  }

  const replyText = aiData.reply || 'Processed your thought in Auto Mode.';

  return res.status(200).json({
    success: true,
    mode: 'auto',
    reply: replyText,
    answer: replyText,
    actionTaken: aiData.action,
    memoriesUsed: memoriesUsedIds,
    referencedMemories: memoriesUsedIds,
    extractedMemories: insertedMemory ? [serializeDoc(insertedMemory)] : [],
    memories: insertedMemory ? [serializeDoc(insertedMemory)] : retrievedMemories.map(serializeDoc),
    supersededMemoryId: supersededId,
    similarityScores,
    privacyShieldedCount: privateCount
  });
}

// ==========================================
// 3. GET /api/memories - List Memories
// ==========================================
app.get('/api/memories', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { status, type } = req.query;
    const db = getDB();

    const query = { user_id: userId };
    if (status && status !== 'all') {
      query.status = status;
    }
    if (type && type !== 'all') {
      query.type = type;
    }

    const list = await db.collection('memories')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    // Check expiry in real-time: if expires_at is past, flag status as 'expired'
    const now = new Date();
    const serialized = list.map(doc => {
      const item = serializeDoc(doc);
      if (item.expires_at && new Date(item.expires_at) <= now && item.status !== 'expired') {
        item.status = 'expired';
      }
      return item;
    });

    return res.status(200).json({
      success: true,
      count: serialized.length,
      memories: serialized
    });
  } catch (error) {
    console.error('[GET /api/memories Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. PATCH /api/memories/:id/supersede - Supersede / Correct a Memory
// ==========================================
app.patch('/api/memories/:id/supersede', async (req, res) => {
  return handleSupersede(req, res);
});

async function handleSupersede(req, res) {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const newContent = req.body.newContent || req.body.supersedeWith?.content;
    const newType = req.body.newType || req.body.supersedeWith?.type;
    const newQuote = req.body.newQuote || req.body.supersedeWith?.source_quote;

    if (!newContent) {
      return res.status(400).json({ success: false, error: 'newContent is required to supersede a memory' });
    }

    const db = getDB();
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : id;

    // 1. Locate old memory
    const oldMemory = await db.collection('memories').findOne({
      _id: queryId,
      user_id: userId
    });

    if (!oldMemory) {
      return res.status(404).json({ success: false, error: 'Memory not found' });
    }

    // 2. Generate embedding for newContent
    const embedding = await getEmbedding(`${newType || oldMemory.type}: ${newContent}`);

    // 3. Insert new memory document with status: "active", supersedes_id: oldId
    const newMemoryDoc = {
      user_id: userId,
      entry_id: oldMemory.entry_id,
      type: newType || oldMemory.type,
      content: newContent,
      source_quote: newQuote || oldMemory.source_quote,
      embedding,
      status: 'active',
      is_private: false,
      expires_at: null,
      supersedes_id: oldMemory._id.toString(),
      created_at: new Date()
    };

    const insertResult = await db.collection('memories').insertOne(newMemoryDoc);
    const newMemoryId = insertResult.insertedId.toString();

    // 4. Update old memory status to "superseded"
    await db.collection('memories').updateOne(
      { _id: queryId },
      { $set: { status: 'superseded' } }
    );

    // 5. Audit log event
    await db.collection('memory_events').insertOne({
      user_id: userId,
      memory_id: newMemoryId,
      event_type: 'memory_superseded',
      timestamp: new Date(),
      metadata: {
        superseded_memory_id: oldMemory._id.toString(),
        new_memory_id: newMemoryId,
        type: newMemoryDoc.type
      }
    });

    console.log(`[Supersede] Old memory ${id} superseded by new memory ${newMemoryId}`);

    return res.status(200).json({
      success: true,
      message: 'Memory successfully superseded.',
      supersededId: oldMemory._id.toString(),
      supersededMemory: serializeDoc({ ...oldMemory, status: 'superseded' }),
      newMemory: serializeDoc({ ...newMemoryDoc, _id: newMemoryId })
    });
  } catch (error) {
    console.error('[PATCH /api/memories/:id/supersede Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// ==========================================
// 5. PATCH /api/memories/:id/privacy - Toggle Privacy
// ==========================================
app.patch('/api/memories/:id/privacy', async (req, res) => {
  return handlePrivacyToggle(req, res);
});

async function handlePrivacyToggle(req, res) {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const isPrivate = Boolean(req.body.is_private);

    const db = getDB();
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : id;

    const oldMem = await db.collection('memories').findOne({ _id: queryId, user_id: userId });
    if (!oldMem) {
      return res.status(404).json({ success: false, error: 'Memory not found' });
    }

    const nextStatus = isPrivate ? 'private' : 'active';

    await db.collection('memories').updateOne(
      { _id: queryId },
      { $set: { is_private: isPrivate, status: nextStatus } }
    );

    // Audit log
    await db.collection('memory_events').insertOne({
      user_id: userId,
      memory_id: id,
      event_type: isPrivate ? 'memory_marked_private' : 'memory_unhidden',
      timestamp: new Date(),
      metadata: {
        is_private: isPrivate,
        status: nextStatus
      }
    });

    console.log(`[Privacy] Memory ${id} is_private set to ${isPrivate}`);

    return res.status(200).json({
      success: true,
      id,
      is_private: isPrivate,
      status: nextStatus
    });
  } catch (error) {
    console.error('[PATCH /api/memories/:id/privacy Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// ==========================================
// 6. Unified PATCH /api/memories/:id - Handles supersede, privacy, or expiry
// ==========================================
app.patch('/api/memories/:id', async (req, res) => {
  if (req.body.supersedeWith || req.body.newContent) {
    return handleSupersede(req, res);
  }
  if (req.body.is_private !== undefined) {
    return handlePrivacyToggle(req, res);
  }

  // Handle setting/clearing expiry
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const expiresAt = req.body.expires_at ? new Date(req.body.expires_at) : null;

    const db = getDB();
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : id;

    await db.collection('memories').updateOne(
      { _id: queryId, user_id: userId },
      { $set: { expires_at: expiresAt } }
    );

    await db.collection('memory_events').insertOne({
      user_id: userId,
      memory_id: id,
      event_type: 'memory_expiry_configured',
      timestamp: new Date(),
      metadata: { expires_at: expiresAt }
    });

    return res.status(200).json({ success: true, id, expires_at: expiresAt });
  } catch (error) {
    console.error('[PATCH /api/memories/:id Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 7. DELETE /api/memories/:id - Delete Memory
// ==========================================
app.delete('/api/memories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const db = getDB();
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : id;

    const existing = await db.collection('memories').findOne({ _id: queryId, user_id: userId });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Memory not found' });
    }

    await db.collection('memories').deleteOne({ _id: queryId, user_id: userId });

    await db.collection('memory_events').insertOne({
      user_id: userId,
      memory_id: id,
      event_type: 'memory_deleted',
      timestamp: new Date(),
      metadata: { type: existing.type }
    });

    console.log(`[Delete] Deleted memory ${id}`);
    return res.status(200).json({ success: true, deletedId: id });
  } catch (error) {
    console.error('[DELETE /api/memories/:id Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 8. GET /api/memory-events - System Log & Audit Feed
// ==========================================
app.get('/api/memory-events', async (req, res) => {
  try {
    const userId = getUserId(req);
    const db = getDB();

    const events = await db.collection('memory_events')
      .find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    return res.status(200).json({
      success: true,
      events: events.map(serializeDoc)
    });
  } catch (error) {
    console.error('[GET /api/memory-events Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 9. GET /api/health - System Health Check
// ==========================================
app.get('/api/health', (req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('your_'));
  const hasGroq = Boolean(process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.startsWith('your_'));
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: getIsConnected() ? 'connected (MongoDB Atlas / local)' : 'running (in-memory mode)',
    llm: hasGroq ? 'Groq llama-3.3-70b-versatile' : 'Local fail-closed fallback',
    embeddings: hasGemini ? 'Google Gemini text-embedding-004 (768-dim)' : 'Deterministic normalized vector (768-dim)'
  });
});

// Start Server & Connect to DB
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 ECHO Backend API running at http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🗄️  MongoDB: ${getIsConnected() ? 'CONNECTED' : 'IN-MEMORY FALLBACK (configure MONGODB_URI)'}`);
    console.log('====================================================');
  });
}

startServer();

export default app;
