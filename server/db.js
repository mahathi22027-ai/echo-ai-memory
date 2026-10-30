/**
 * MongoDB Native Driver Database Layer
 * Connects to MongoDB Atlas or local MongoDB using the native 'mongodb' driver.
 * Includes graceful connection handling and collection index initialization.
 */

import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();
try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(__dirname, '.env') });
} catch (e) {}

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/echo_journal';
const dbName = process.env.MONGODB_DB_NAME || 'echo_journal';

let client = null;
let db = null;
let isConnected = false;

// In-memory fallback store in case MongoDB is temporarily unavailable
class MockCollection {
  constructor(name) {
    this.name = name;
    this.documents = [];
  }

  async insertOne(doc) {
    const _id = doc._id || new ObjectId();
    const newDoc = { ...doc, _id };
    this.documents.push(newDoc);
    return { insertedId: _id, acknowledged: true };
  }

  async insertMany(docs) {
    const insertedIds = {};
    const newDocs = docs.map((doc, idx) => {
      const _id = doc._id || new ObjectId();
      insertedIds[idx] = _id;
      return { ...doc, _id };
    });
    this.documents.push(...newDocs);
    return { insertedIds, acknowledged: true, insertedCount: docs.length };
  }

  find(query = {}) {
    let results = this.documents.filter(doc => this._match(doc, query));
    let sortObj = null;
    let limitNum = null;
    let skipNum = 0;

    const cursor = {
      sort: (s) => {
        sortObj = s;
        return cursor;
      },
      limit: (n) => {
        limitNum = n;
        return cursor;
      },
      skip: (n) => {
        skipNum = n;
        return cursor;
      },
      toArray: async () => {
        let list = [...results];
        if (sortObj) {
          const key = Object.keys(sortObj)[0];
          const dir = sortObj[key];
          list.sort((a, b) => {
            const valA = a[key] instanceof Date ? a[key].getTime() : a[key];
            const valB = b[key] instanceof Date ? b[key].getTime() : b[key];
            return dir === -1 ? (valB > valA ? 1 : -1) : (valA > valB ? 1 : -1);
          });
        }
        if (skipNum > 0) {
          list = list.slice(skipNum);
        }
        if (limitNum !== null) {
          list = list.slice(0, limitNum);
        }
        return list;
      }
    };
    return cursor;
  }

  async findOne(query) {
    return this.documents.find(doc => this._match(doc, query)) || null;
  }

  async updateOne(query, update) {
    const doc = this.documents.find(d => this._match(d, query));
    if (!doc) return { matchedCount: 0, modifiedCount: 0 };
    if (update.$set) {
      Object.assign(doc, update.$set);
    }
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(query) {
    const idx = this.documents.findIndex(d => this._match(d, query));
    if (idx === -1) return { deletedCount: 0 };
    this.documents.splice(idx, 1);
    return { deletedCount: 1 };
  }

  async deleteMany(query = {}) {
    const initial = this.documents.length;
    this.documents = this.documents.filter(d => !this._match(d, query));
    return { deletedCount: initial - this.documents.length };
  }

  async countDocuments(query = {}) {
    return this.documents.filter(d => this._match(d, query)).length;
  }

  aggregate(pipeline) {
    return {
      toArray: async () => {
        // Mock fallback does not natively parse Atlas vectorSearch stage
        return [];
      }
    };
  }

  async createIndex() {
    return 'mock_index_created';
  }

  _match(doc, query) {
    for (const [key, val] of Object.entries(query)) {
      if (key === '_id') {
        const docIdStr = doc._id?.toString();
        const queryIdStr = val?.toString();
        if (docIdStr !== queryIdStr) return false;
      } else if (key === '$or' && Array.isArray(val)) {
        const matchesOr = val.some(subQuery => this._match(doc, subQuery));
        if (!matchesOr) return false;
      } else if (val && typeof val === 'object' && !(val instanceof Date)) {
        if ('$gt' in val) {
          if (!doc[key] || new Date(doc[key]) <= new Date(val.$gt)) return false;
        }
        if ('$ne' in val) {
          if (doc[key] === val.$ne) return false;
        }
      } else {
        if (doc[key] !== val) return false;
      }
    }
    return true;
  }
}

class MockDb {
  constructor() {
    this.collections = {
      journal_entries: new MockCollection('journal_entries'),
      memories: new MockCollection('memories'),
      memory_events: new MockCollection('memory_events')
    };
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new MockCollection(name);
    }
    return this.collections[name];
  }
}

const mockDbInstance = new MockDb();

export async function connectDB() {
  if (db && isConnected) return db;

  try {
    console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}...`);
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 5000
    });

    await client.connect();
    db = client.db(dbName);
    isConnected = true;
    console.log(`Successfully connected to MongoDB database: "${dbName}"`);

    // Ensure required collections and indexes exist
    await initIndexes(db);
    return db;
  } catch (err) {
    console.warn(`[ECHO WARNING] Could not connect to real MongoDB (${err.message}).`);
    console.warn(`Using in-memory database fallback so server can run. Update MONGODB_URI in .env to connect to MongoDB Atlas.`);
    isConnected = false;
    db = mockDbInstance;
    return db;
  }
}

export function getDB() {
  if (!db) {
    return mockDbInstance;
  }
  return db;
}

export function getIsConnected() {
  return isConnected;
}

async function initIndexes(database) {
  try {
    const memories = database.collection('memories');
    const journalEntries = database.collection('journal_entries');
    const memoryEvents = database.collection('memory_events');

    // 1. Compound index for fast listing of user's memories
    await memories.createIndex({ user_id: 1, status: 1, created_at: -1 });

    // 2. TTL index for automatic deletion of expired memories
    await memories.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });

    // 3. User chronological index for journal entries
    await journalEntries.createIndex({ user_id: 1, created_at: -1 });

    // 4. Audit events index
    await memoryEvents.createIndex({ user_id: 1, timestamp: -1 });

    console.log('MongoDB standard indexes verified (compound, TTL, and chronological).');
  } catch (e) {
    console.warn('Index initialization notice:', e.message);
  }
}

export { ObjectId };
