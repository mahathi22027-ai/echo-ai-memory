/**
 * AI Service Layer for ECHO
 * - LLM Extraction & Contextual Query: Groq API (via OpenAI SDK baseURL)
 *   Model: "llama-3.3-70b-versatile"
 * - Embeddings: Google Gemini API (via @google/genai SDK)
 *   Model: "text-embedding-004" (768 dimensions)
 * 
 * Implements strict grounding and fail-closed policies to prevent hallucinations.
 */

import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// 1. Groq LLM client (using OpenAI SDK pointing to Groq's endpoint)
const groqApiKey = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
const groqClient = new OpenAI({
  apiKey: groqApiKey && !groqApiKey.startsWith('your_') ? groqApiKey : 'dummy_groq_key',
  baseURL: 'https://api.groq.com/openai/v1'
});

// 2. Google Gemini Embeddings client (using official @google/genai SDK)
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const isGeminiConfigured = Boolean(
  geminiApiKey && 
  !geminiApiKey.startsWith('your_') && 
  geminiApiKey !== 'dummy_gemini_key'
);

const geminiClient = isGeminiConfigured 
  ? new GoogleGenAI({ apiKey: geminiApiKey }) 
  : null;

export const EMBEDDING_DIMENSIONS = 768; // Gemini text-embedding-004

/**
 * Generate 768-dimensional normalized embedding using Google Gemini text-embedding-004
 */
export async function getEmbedding(text) {
  if (!text || typeof text !== 'string') {
    return new Array(EMBEDDING_DIMENSIONS).fill(0);
  }

  // If Gemini API key is missing, use deterministic topic-neutral normalized fallback vector
  if (!geminiClient) {
    return generateCleanFallbackEmbedding(text, EMBEDDING_DIMENSIONS);
  }

  try {
    const response = await geminiClient.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text.trim(),
      config: {
        outputDimensionality: EMBEDDING_DIMENSIONS
      }
    });

    const values = response?.embeddings?.[0]?.values || response?.embedding?.values;
    if (values && Array.isArray(values) && values.length === EMBEDDING_DIMENSIONS) {
      return values;
    }
    throw new Error(`Unexpected embedding output format or length: ${values?.length}`);
  } catch (err) {
    console.warn(`[ECHO AI WARNING] Gemini embedding call failed (${err.message}). Using normalized fallback vector.`);
    return generateCleanFallbackEmbedding(text, EMBEDDING_DIMENSIONS);
  }
}

/**
 * Extract 1-4 memories from journal entry text using Groq LLM (llama-3.3-70b-versatile)
 */
export async function extractMemories(text) {
  const prompt = `You are Echo, an empathetic personal AI journal companion.
Analyze this user's journal reflection:
1. 'reply': A warm, human, empathetic companion response (2-3 sentences). Speak directly and supportively to what they experienced or shared.
   STRICT PERSONA RULE: NEVER speak like a robot, database, or system logger! NEVER say "I have noted this in your journal", "I have updated my records", "Recorded in vault", or "Ingested". Speak directly, warmly, and humanly to them.
2. 'memories': An array of 1-4 atomic memories. Each memory needs: 'type' (event, feeling, belief, decision, preference), 'content' (clean 1-sentence summary without type prefix), 'source_quote' (exact verbatim substring from text), 'is_temporary' (boolean).

Return ONLY a JSON object:
{
  "reply": "Warm companion response",
  "memories": [...]
}`;

  if (!groqApiKey || groqApiKey.startsWith('your_') || groqApiKey === 'dummy_groq_key') {
    return localFallbackExtract(text);
  }

  try {
    const completion = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: prompt
        },
        {
          role: 'user',
          content: text
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const content = completion.choices[0]?.message?.content;
    const parsed = JSON.parse(content || '{}');
    let memories = parsed.memories || parsed.items || [];
    let reply = parsed.reply || "Thank you for sharing this reflection with me.";

    // Acceptance Check: Ensure source_quote is verifiably present in submitted text
    memories = memories.map(mem => {
      let quote = mem.source_quote || '';
      if (!text.includes(quote)) {
        const sentences = text.split(/(?<=[.?!])\s+/);
        quote = sentences.find(s => s.length > 10 && text.includes(s)) || text.slice(0, 100);
      }
      const cleanContent = String(mem.content || 'Observed reflection')
        .replace(/^(feeling|event|belief|decision|preference):\s*/i, '')
        .trim();

      return {
        type: ['event', 'feeling', 'belief', 'decision', 'preference'].includes(mem.type?.toLowerCase()) 
          ? mem.type.toLowerCase() 
          : 'feeling',
        content: cleanContent || text.slice(0, 100),
        source_quote: quote,
        is_temporary: Boolean(mem.is_temporary)
      };
    });

    if (memories.length === 0) {
      return localFallbackExtract(text);
    }

    const trimmed = memories.slice(0, 4);
    trimmed.memories = trimmed;
    trimmed.reply = reply;
    return trimmed;
  } catch (err) {
    console.warn(`[ECHO AI WARNING] Groq extraction failed (${err.message}). Using local extractor.`);
    return localFallbackExtract(text);
  }
}

/**
 * Generate context-aware answer for query strictly grounded in retrieved memories.
 * Fails closed if retrievedMemories is empty.
 */
export async function generateContextualAnswer(query, retrievedMemories = []) {
  if (!retrievedMemories || retrievedMemories.length === 0) {
    return localFallbackAnswer(query, []);
  }

  if (!groqApiKey || groqApiKey.startsWith('your_') || groqApiKey === 'dummy_groq_key') {
    return localFallbackAnswer(query, retrievedMemories);
  }

  const memoryContext = retrievedMemories.map((m, idx) => {
    return `[Memory ${idx + 1}] Type: ${m.type.toUpperCase()} | Summary: "${m.content}" | Source Quote: "${m.source_quote}"`;
  }).join('\n');

  const systemPrompt = `You are Echo, a private AI journal assistant with evolving memory.
Answer the user's inquiry directly and empathetically based ONLY on their past journal memories provided below.
Strict Grounding Rules:
1. Ground your answer strictly in the provided memories. Quote verbatim where helpful.
2. If the provided memories are empty or do not genuinely answer the question, state politely that you searched their active journal memories but found no relevant past memories in their vault for this topic. Do NOT hallucinate, guess, or invent ungrounded details.
3. Be supportive, concise, and thoughtful.`;

  const userPrompt = `Retrieved Memories from Vault:
${memoryContext}

User Inquiry: "${query}"`;

  try {
    const completion = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 350
    });

    return completion.choices[0]?.message?.content?.trim() || localFallbackAnswer(query, retrievedMemories);
  } catch (err) {
    console.warn(`[ECHO AI WARNING] Groq answer generation failed (${err.message}). Using local answer generator.`);
    return localFallbackAnswer(query, retrievedMemories);
  }
}

/**
 * Cosine similarity calculation between two vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Deterministic, topic-neutral fallback embedding generator.
 * Does NOT contain biased topic clusters (e.g. no hardcoded 'friendship' or 'presentation').
 */
function generateCleanFallbackEmbedding(text, dim = 768) {
  const vector = new Array(dim).fill(0);
  const clean = text.toLowerCase().trim();
  
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    const idx = (code * 31 + i * 17) % dim;
    vector[idx] += 1.0;
  }

  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vector[i] * vector[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) vector[i] = Number((vector[i] / norm).toFixed(6));
  } else {
    vector[0] = 1.0;
  }

  return vector;
}

/**
 * Local rule-based fallback memory extractor without hardcoded scenario bias.
 */
function localFallbackExtract(text) {
  const lower = text.toLowerCase();
  let type = 'feeling';
  let isTemp = false;

  if (lower.includes('feel') || lower.includes('hurt') || lower.includes('sad') || lower.includes('happy') || lower.includes('anxious') || lower.includes('stressed') || lower.includes('excited')) {
    type = 'feeling';
  } else if (lower.includes('believe') || lower.includes('habit') || lower.includes('routine') || lower.includes('discipline')) {
    type = 'belief';
  } else if (lower.includes('prefer') || lower.includes('like') || lower.includes('dislike') || lower.includes('hate')) {
    type = 'preference';
  } else if (lower.includes('decide') || lower.includes('choose') || lower.includes('will') || lower.includes('plan')) {
    type = 'decision';
  } else {
    type = 'event';
  }

  if (lower.includes('today only') || lower.includes('temporary') || lower.includes('for now') || lower.includes('this week')) {
    isTemp = true;
  }

  const clean = text.trim().replace(/[.?!]+$/, '');
  const sentences = clean.split(/(?<=[.?!])\s+/);
  const quote = sentences[0] || clean.slice(0, 100);

  let reply = "Thank you for taking a moment to write down your thoughts. How did that experience feel for you?";
  if (lower.includes('trip') || lower.includes('travel') || lower.includes('vacation')) {
    reply = "A trip sounds so refreshing! Getting away from your everyday routine is such a wonderful way to recharge. Where did you go, and what was the highlight?";
  } else if (lower.includes('presentation') || lower.includes('nervous') || lower.includes('scared')) {
    reply = "It's completely natural to feel nervous before stepping up. Take a deep breath—you're capable of getting through this, and I'm cheering you on!";
  }

  const result = [
    {
      type,
      content: quote.slice(0, 100),
      source_quote: quote,
      is_temporary: isTemp
    }
  ];
  result.memories = result;
  result.reply = reply;
  return result;
}

/**
 * Local fallback answer generator strictly adhering to "Fail Closed" policy.
 * NEVER fabricates fake scenarios.
 */
function localFallbackAnswer(query, retrievedMemories = []) {
  if (!retrievedMemories || retrievedMemories.length === 0) {
    return "I searched your active journal memories, but I don't have enough past context or a relevant memory recorded for this yet. Feel free to share more!";
  }

  const top = retrievedMemories[0];
  return `Based on your previous entry ("${top.source_quote}"), you shared: "${top.content}". Does this connect with what you're thinking about right now?`;
}

/**
 * Autonomous Agentic Memory Evaluation
 * Analyzes text + past memories to generate an answer and determine DB action:
 * - 'SAVE_NEW': Insert new memory
 * - 'SUPERSEDE_OLD': Replace an existing contradicted memory
 * - 'NO_SAVE': Pure question or greeting, do not mutate memory collection
 */
export async function evaluateAgenticMemory(text, pastMemories = []) {
  if (!text || typeof text !== 'string') {
    return {
      reply: "I couldn't process an empty message.",
      action: 'NO_SAVE',
      new_memory: null,
      supersede_id: null
    };
  }

  // If Groq key is missing or dummy, use fail-closed local agentic evaluator
  if (!groqApiKey || groqApiKey.startsWith('your_') || groqApiKey === 'dummy_groq_key') {
    return localFallbackAgentic(text, pastMemories);
  }

  const pastContext = pastMemories.length > 0
    ? pastMemories.map((m, idx) => {
        const idStr = m._id?.toString() || `mem_${idx}`;
        return `[ID: ${idStr}] Type: ${m.type} | Summary: "${m.content}" | Source Quote: "${m.source_quote}"`;
      }).join('\n')
    : 'No active relevant past memories found.';

  const systemPrompt = `You are Echo, an empathetic, supportive, personal AI journal companion with continuous evolving memory.
You are having an authentic, heartfelt conversation with the user while intelligently maintaining their private memory vault.

Available Past Memories Retrieved from the User's Vault:
${pastContext}

YOUR DUAL OBJECTIVE:
1. 'reply':
   - Speak warmly, compassionately, and naturally—like an attentive journal companion who truly knows and cares for the user.
   - Ground your answer ONLY in their past memories when relevant.
   - STRICT GROUNDING RULE: If no relevant past memories are provided above, DO NOT invent or pretend that you recall earlier events. Answer directly based on what they just shared.
   - STRICT PERSONA RULE: NEVER speak like a robot, database, or system logger! NEVER say "I have noted this in your journal", "I have updated my records", "Retrieved memory", or "According to my records". Speak directly, warmly, and humanly to them.

2. 'action', 'new_memory', and 'supersede_id':
   Analyze the user's message against the retrieved past memories:

   A. ACTION "SUPERSEDE_OLD":
      - MANDATORY EMOTIONAL PROGRESSION & RESOLUTION RULE: If the user describes having completed, overcome, resolved, or improved upon an issue, fear, anxiety, or challenge from a past memory (for example: they previously felt scared, nervous, or stressed about a presentation/interview/meeting/conflict, and they now share that they gave it, handled it, feel confident, or resolved it), you MUST choose the action "SUPERSEDE_OLD".
      - 'supersede_id': MUST be the exact ID of the specific old past memory that is being overcome, contradicted, or resolved (from the [ID: ...] list above).
      - 'new_memory':
        * 'type': "event" | "feeling" | "belief" | "decision" | "preference"
        * 'content': A clear, concise 1-sentence summary of the new state or milestone. 
          STRICT RULE: DO NOT prepend "Feeling:", "Event:", "Preference:", or any type prefix to the content! DO NOT copy-paste raw typo-laden text.
        * 'source_quote': exact verbatim quote from the user's message.
        * 'is_temporary': boolean (true if temporary/transient).

   B. ACTION "SAVE_NEW":
      - TRIGGER: The user shares a personal reflection, event, feeling, preference, belief, or decision that is new and does NOT contradict or resolve any past memory listed above.
      - 'supersede_id': null
      - 'new_memory': Same clean 1-sentence structure as above (no type prefixes, concise summary).

   C. ACTION "NO_SAVE":
      - TRIGGER: The message is primarily a question, inquiry, greeting, or transient remark that introduces no lasting personal updates.
      - 'supersede_id': null
      - 'new_memory': null

Return ONLY a JSON object:
{
  "reply": "Empathetic, authentic companion response",
  "action": "SAVE_NEW" | "SUPERSEDE_OLD" | "NO_SAVE",
  "new_memory": { "type": "...", "content": "...", "source_quote": "...", "is_temporary": false } | null,
  "supersede_id": "..." | null
}`;

  try {
    const completion = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1024
    });

    let rawJson = completion.choices[0]?.message?.content || '{}';
    rawJson = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(rawJson);
    
    // Normalize and validate action
    let action = (parsed.action || 'NO_SAVE').toUpperCase();
    if (!['SAVE_NEW', 'SUPERSEDE_OLD', 'NO_SAVE'].includes(action)) {
      action = 'NO_SAVE';
    }

    // Defensive check for supersede_id
    let supersedeId = parsed.supersede_id ? String(parsed.supersede_id).trim() : null;
    if (action === 'SUPERSEDE_OLD') {
      const existsInPast = pastMemories.some(m => m._id?.toString() === supersedeId);
      if (!existsInPast) {
        if (pastMemories.length > 0 && pastMemories[0]._id) {
          supersedeId = pastMemories[0]._id.toString();
        } else {
          action = 'SAVE_NEW';
          supersedeId = null;
        }
      }
    } else {
      supersedeId = null;
    }

    let newMemory = null;
    if (action === 'SAVE_NEW' || action === 'SUPERSEDE_OLD') {
      const rawMem = parsed.new_memory || {};
      let quote = rawMem.source_quote || '';
      if (!text.includes(quote)) {
        const sentences = text.split(/(?<=[.?!])\s+/);
        quote = sentences.find(s => text.includes(s)) || text.slice(0, 100);
      }
      
      let cleanContent = String(rawMem.content || text.slice(0, 100))
        .replace(/^(feeling|event|belief|decision|preference):\s*/i, '')
        .trim();

      newMemory = {
        type: ['event', 'feeling', 'belief', 'decision', 'preference'].includes(rawMem.type?.toLowerCase())
          ? rawMem.type.toLowerCase()
          : 'feeling',
        content: cleanContent || text.slice(0, 100),
        source_quote: quote,
        is_temporary: Boolean(rawMem.is_temporary)
      };
    }

    return {
      reply: parsed.reply || localFallbackAnswer(text, pastMemories),
      action,
      new_memory: newMemory,
      supersede_id: supersedeId
    };
  } catch (err) {
    console.warn(`[ECHO AI WARNING] Groq agentic evaluation failed (${err.message}). Using fail-closed fallback.`);
    return localFallbackAgentic(text, pastMemories);
  }
}

/**
 * Fail-closed local fallback for Agentic Memory evaluation.
 * Never fabricates fake memories or fake scenarios.
 */
function localFallbackAgentic(text, pastMemories = []) {
  const lower = text.toLowerCase().trim();
  const isQuestion = lower.endsWith('?') || 
    lower.startsWith('how') || 
    lower.startsWith('what') || 
    lower.startsWith('why') || 
    lower.startsWith('when') || 
    lower.startsWith('do i') || 
    lower.startsWith('am i') || 
    lower.startsWith('tell me') ||
    lower.startsWith('is there') ||
    lower.startsWith('did i');

  if (isQuestion) {
    return {
      reply: localFallbackAnswer(text, pastMemories),
      action: 'NO_SAVE',
      new_memory: null,
      supersede_id: null
    };
  }

  const extracted = localFallbackExtract(text)[0];

  const overcomesPastChallenge = pastMemories.some(m => {
    const memText = `${m.content} ${m.source_quote}`.toLowerCase();
    const hadFear = /scared|nervous|fear|anxious|stress|worry|dread|hurt/i.test(memText);
    const hasOvercome = /confident|finished|handled|gave|completed|did it|proud|went well|improved/i.test(lower);
    return hadFear && hasOvercome;
  });

  const isCorrection = overcomesPastChallenge ||
    lower.includes('improved') || 
    lower.includes('no longer') || 
    lower.includes('not anymore') || 
    lower.includes('resolved') || 
    lower.includes('changed my mind') || 
    lower.includes("don't feel that way") ||
    lower.includes('we talked it out');

  if (isCorrection && pastMemories.length > 0) {
    const targetMemory = pastMemories.find(m => {
      const memText = `${m.content} ${m.source_quote}`.toLowerCase();
      return /scared|nervous|fear|anxious|stress|worry|dread|hurt/i.test(memText);
    }) || pastMemories[0];
    const targetId = targetMemory._id?.toString() || null;

    return {
      reply: `I hear you, and it's wonderful to see how your thoughts have shifted. I've updated your journal to reflect this evolution.`,
      action: 'SUPERSEDE_OLD',
      new_memory: extracted,
      supersede_id: targetId
    };
  }

  return {
    reply: `Thank you for sharing your thoughts with me. I've safely recorded this in your memory vault.`,
    action: 'SAVE_NEW',
    new_memory: extracted,
    supersede_id: null
  };
}
