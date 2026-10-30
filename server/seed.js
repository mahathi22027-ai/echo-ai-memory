/**
 * Database Seed Script for ECHO
 * Injects 3 dummy memories (one active, one superseded, one private)
 * with 1536-dimensional embeddings and audit logs so the UI has rich data immediately.
 */

import { connectDB, getDB, ObjectId } from './db.js';
import { getEmbedding } from './ai.js';
import dotenv from 'dotenv';
dotenv.config();

export async function runSeed() {
  console.log('--- Seeding ECHO Database with Initial Hackathon Memories ---');
  const db = await connectDB();

  const userIds = ['demo_user', 'user_123'];

  for (const userId of userIds) {
    console.log(`Seeding data for user: ${userId}...`);

    // Clean prior memories for clean demo state
    await db.collection('memories').deleteMany({ user_id: userId });
    await db.collection('journal_entries').deleteMany({ user_id: userId });
    await db.collection('memory_events').deleteMany({ user_id: userId });

    // 1. Initial Journal Entry
    const entryResult = await db.collection('journal_entries').insertOne({
      user_id: userId,
      text: "I told her it was fine, but honestly, I'm really hurt. Whenever plans are made, it feels like I'm the only one reaching out.",
      created_at: new Date('2026-10-30T09:00:00Z')
    });
    const entryId = entryResult.insertedId.toString();

    // 2. Memory 1: ACTIVE (Feeling)
    console.log('Generating embedding for Memory 1 (Active)...');
    const embed1 = await getEmbedding('feeling: Feels hurt and uncared for in friendship reciprocity.');
    const mem1Result = await db.collection('memories').insertOne({
      user_id: userId,
      entry_id: entryId,
      type: 'feeling',
      content: 'Feels hurt and uncared for in friendship reciprocity.',
      source_quote: "I told her it was fine, but honestly, I'm really hurt.",
      embedding: embed1,
      status: 'active',
      is_private: false,
      expires_at: null,
      supersedes_id: null,
      created_at: new Date('2026-10-31T10:00:00Z')
    });
    const mem1Id = mem1Result.insertedId.toString();

    // 3. Memory 2: SUPERSEDED (Historical perception)
    console.log('Generating embedding for Memory 2 (Superseded)...');
    const embed2 = await getEmbedding('feeling: Initial perception that communication with friends was impossible.');
    const mem2Result = await db.collection('memories').insertOne({
      user_id: userId,
      entry_id: entryId,
      type: 'feeling',
      content: 'Initial perception that friends were intentionally ignoring effort.',
      source_quote: "Whenever plans are made, it feels like I'm the only one reaching out.",
      embedding: embed2,
      status: 'superseded',
      is_private: false,
      expires_at: null,
      supersedes_id: null,
      created_at: new Date('2026-10-30T09:30:00Z')
    });
    const mem2Id = mem2Result.insertedId.toString();

    // 4. Memory 3: PRIVATE (Preference)
    console.log('Generating embedding for Memory 3 (Private)...');
    const embed3 = await getEmbedding('preference: Prefers working in solitary spaces with low sensory noise.');
    const mem3Result = await db.collection('memories').insertOne({
      user_id: userId,
      entry_id: entryId,
      type: 'preference',
      content: 'Prefers working in solitary spaces with low sensory noise.',
      source_quote: "I get completely drained when people come over unannounced while I'm coding.",
      embedding: embed3,
      status: 'private',
      is_private: true,
      expires_at: null,
      supersedes_id: null,
      created_at: new Date('2026-10-29T14:15:00Z')
    });
    const mem3Id = mem3Result.insertedId.toString();

    // 5. Seed Audit Log Events
    await db.collection('memory_events').insertMany([
      {
        user_id: userId,
        memory_id: mem1Id,
        event_type: 'memory_created',
        timestamp: new Date('2026-10-31T10:00:00Z'),
        metadata: {
          type: 'feeling',
          note: 'Extracted structured feeling memory from journal entry.'
        }
      },
      {
        user_id: userId,
        memory_id: mem2Id,
        event_type: 'memory_superseded',
        timestamp: new Date('2026-10-30T10:15:00Z'),
        metadata: {
          superseded_memory_id: mem2Id,
          reason: 'Outdated perception superseded by clarified entry.'
        }
      },
      {
        user_id: userId,
        memory_id: mem3Id,
        event_type: 'memory_marked_private',
        timestamp: new Date('2026-10-29T14:30:00Z'),
        metadata: {
          type: 'preference',
          note: 'User set privacy shield. Excluded from vector retrieval.'
        }
      }
    ]);
  }

  console.log('✅ Successfully seeded:');
  console.log('   - 1 Active Memory (Feeling)');
  console.log('   - 1 Superseded Memory (Historical)');
  console.log('   - 1 Private Memory (Preference - Privacy Shielded)');
  console.log('   - 3 System Audit Events');
  console.log('--- Seeding Complete ---');
}

// Run directly if called from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed().then(() => process.exit(0)).catch(err => {
    console.error('Seed Error:', err);
    process.exit(1);
  });
}
