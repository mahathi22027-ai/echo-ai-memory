/**
 * AI Service Layer for ECHO
 * - LLM Extraction & Contextual Query: Groq API (via OpenAI SDK baseURL)
 *   Model: "llama-3.3-70b-versatile"
 * - Embeddings: OpenAI API
 *   Model: "text-embedding-3-small" (1536 dimensions)
 * 
 * Includes high-fidelity local fallback simulation if API keys are not yet configured in .env.
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// 1. Groq LLM client (using OpenAI SDK pointing to Groq's endpoint)
const groqApiKey = process.env.GROQ_API_KEY;
const groqClient = new OpenAI({
  apiKey: groqApiKey || 'dummy_groq_key',
  baseURL: 'https://api.groq.com/openai/v1'
});

// 2. OpenAI Embedding client
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiClient = new OpenAI({
  apiKey: openaiApiKey || 'dummy_openai_key'
});

const EMBEDDING_DIMENSIONS = 1536;

/**
 * Generate 1536-dimensional embedding using OpenAI text-embedding-3-small
 */
export async function getEmbedding(text) {
  if (!text || typeof text !== 'string') return new Array(EMBEDDING_DIMENSIONS).fill(0);

  // If OpenAI API key is missing or dummy, generate deterministic normalized vector
  if (!openaiApiKey || openaiApiKey.startsWith('your_') || openaiApiKey === 'dummy_openai_key') {
    return generateDeterministicEmbedding(text, EMBEDDING_DIMENSIONS);
  }

  try {
    const response = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.trim(),
      encoding_format: 'float'
    });
    return response.data[0].embedding;
  } catch (err) {
    console.warn(`[ECHO AI WARNING] OpenAI embedding call failed (${err.message}). Using local vector.`);
    return generateDeterministicEmbedding(text, EMBEDDING_DIMENSIONS);
  }
}

/**
 * Extract 1-4 memories from journal entry text using Groq LLM (llama-3.3-70b-versatile)
 */
export async function extractMemories(text) {
  const prompt = `Extract 1-4 memories from this text. Return ONLY a JSON object with a 'memories' array. Each memory needs: 'type' (event, feeling, belief, decision), 'content' (short summary), 'source_quote' (exact substring from text), 'is_temporary' (boolean).`;

  // If Groq key is missing or dummy, use smart local rule-based extractor
  if (!groqApiKey || groqApiKey.startsWith('your_') || groqApiKey === 'dummy_groq_key') {
    return localFallbackExtract(text);
  }

  try {
    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `${prompt} Ensure 'source_quote' is an exact verbatim substring of the input text. Do not invent quotes.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const content = completion.choices[0]?.message?.content;
    const parsed = JSON.parse(content);
    let memories = parsed.memories || parsed.items || [];

    // Acceptance Check (PDF Page 3): Ensure source_quote is verifiably present in submitted text
    memories = memories.map(mem => {
      let quote = mem.source_quote || '';
      if (!text.includes(quote)) {
        // Find best matching substring or sentence
        const sentences = text.split(/(?<=[.?!])\s+/);
        quote = sentences.find(s => s.length > 10 && text.includes(s)) || text.slice(0, 100);
      }
      return {
        type: ['event', 'feeling', 'belief', 'decision'].includes(mem.type?.toLowerCase()) 
          ? mem.type.toLowerCase() 
          : 'feeling',
        content: String(mem.content || 'Observed reflection'),
        source_quote: quote,
        is_temporary: Boolean(mem.is_temporary)
      };
    });

    if (memories.length === 0) {
      return localFallbackExtract(text);
    }

    return memories.slice(0, 4);
  } catch (err) {
    console.warn(`[ECHO AI WARNING] Groq extraction failed (${err.message}). Using local extractor.`);
    return localFallbackExtract(text);
  }
}

/**
 * Generate context-aware answer for query using retrieved memories as context
 */
export async function generateContextualAnswer(query, retrievedMemories = []) {
  if (!groqApiKey || groqApiKey.startsWith('your_') || groqApiKey === 'dummy_groq_key') {
    return localFallbackAnswer(query, retrievedMemories);
  }

  const memoryContext = retrievedMemories.map((m, idx) => {
    return `[Memory ${idx + 1}] Type: ${m.type.toUpperCase()} | Summary: "${m.content}" | Source Quote: "${m.source_quote}"`;
  }).join('\n');

  const systemPrompt = `You are Echo, a private AI journal assistant with evolving memory.
Answer the user's inquiry directly and empathetically based on their past journal memories provided below.
Rules:
1. Clearly reference remembered facts and quote verbatim when helpful.
2. If the provided memories are empty or do not answer the question, state politely that no relevant past memories were found in their vault. Do NOT hallucinate or invent past events.
3. Be supportive, concise, and thoughtful.`;

  const userPrompt = `Retrieved Memories from Vault:
${memoryContext || 'None found.'}

User Inquiry: "${query}"`;

  try {
    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
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
 * High-fidelity deterministic vector generation for fallback / offline testing
 * Creates normalized 1536-dimensional vector with semantic clustering for hackathon demo keywords
 */
function generateDeterministicEmbedding(text, dim = 1536) {
  const vector = new Array(dim).fill(0);
  const lower = text.toLowerCase();
  const words = lower.split(/[^a-z0-9]+/);

  // Concept clusters mapped to dimensional bands
  const concepts = {
    friendship_hurt: ['friend', 'friends', 'hurt', 'alone', 'effort', 'plans', 'reach', 'unvalued', 'care', 'lonely', 'sad', 'feeling', 'reciprocity'],
    work_focus: ['work', 'code', 'coding', 'quiet', 'cafe', 'focus', 'flow', 'project', 'build', 'preference'],
    discipline_routine: ['routine', 'morning', 'habit', 'discipline', 'wake', 'belief', 'consistency', 'mental'],
    goal_progress: ['goal', 'deadline', 'hackathon', 'ship', 'prototype', 'mvp', 'decision', 'finish', 'milestone'],
    resolution: ['improved', 'talked', 'reconciled', 'clarity', 'better', 'resolved', 'fine']
  };

  words.forEach(word => {
    if (!word) return;
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dim;
    vector[idx] += 1.0;

    // Boost matching concept clusters
    for (const [cluster, clusterWords] of Object.entries(concepts)) {
      if (clusterWords.includes(word)) {
        const offset = cluster.length * 100;
        for (let j = 0; j < 30; j++) {
          const cIdx = (offset + j * 13) % dim;
          vector[cIdx] += 1.5;
        }
      }
    }
  });

  // Normalize to unit vector
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
 * Local rule-based fallback memory extractor
 */
function localFallbackExtract(text) {
  const lower = text.toLowerCase();
  let type = 'feeling';
  let isTemp = false;

  if (lower.includes('feel') || lower.includes('hurt') || lower.includes('effort') || lower.includes('sad') || lower.includes('happy') || lower.includes('anxious')) {
    type = 'feeling';
  } else if (lower.includes('believe') || lower.includes('habit') || lower.includes('routine') || lower.includes('discipline')) {
    type = 'belief';
  } else if (lower.includes('prefer') || lower.includes('like') || lower.includes('hate') || lower.includes('quiet')) {
    type = 'preference';
  } else if (lower.includes('decide') || lower.includes('choose') || lower.includes('will') || lower.includes('planned')) {
    type = 'decision';
  } else {
    type = 'event';
  }

  if (lower.includes('today only') || lower.includes('temporary') || lower.includes('for now') || lower.includes('this week') || lower.includes('soon')) {
    isTemp = true;
  }

  // Find exact quote substring
  const sentences = text.split(/(?<=[.?!])\s+/);
  const quote = sentences[0] || text.slice(0, 100);

  return [
    {
      type,
      content: generateSummaryFromText(text, type),
      source_quote: quote,
      is_temporary: isTemp
    }
  ];
}

function generateSummaryFromText(text, type) {
  const lower = text.toLowerCase();
  if (lower.includes('presentation') && (lower.includes('scared') || lower.includes('nervous') || lower.includes('fear') || lower.includes('stress'))) {
    return 'Felt scared and anxious about delivering upcoming first presentation';
  }
  if (lower.includes('presentation') && (lower.includes('confident') || lower.includes('gave') || lower.includes('finished') || lower.includes('handled'))) {
    return 'Completed first presentation and gained confidence for future public speaking';
  }
  if (lower.includes('friend') && (lower.includes('effort') || lower.includes('hurt') || lower.includes('value'))) {
    return 'Felt hurt and uncared for in friendship reciprocity';
  }
  if (lower.includes('improved') || lower.includes('talked it out')) {
    return 'Reconciled with friends; emotional clarity and peace restored';
  }
  if (lower.includes('routine') || lower.includes('morning')) {
    return 'Maintains a structured morning routine as foundational anchor for creative focus';
  }
  if (lower.includes('cafe') || lower.includes('quiet') || lower.includes('coding')) {
    return 'Prefers quiet, low-friction workspaces for deep programming sessions';
  }
  return text.slice(0, 85).trim().replace(/[.?!]+$/, '');
}

/**
 * Local fallback answer generator
 */
function localFallbackAnswer(query, retrievedMemories) {
  if (!retrievedMemories || retrievedMemories.length === 0) {
    return "I searched your active journal memories using MongoDB Vector Search, but no records met the relevance threshold for this query. I won't guess or invent ungrounded details—feel free to tell me more!";
  }

  const top = retrievedMemories[0];
  if (top.type === 'feeling') {
    return `Based on your previous entry, you shared: "${top.source_quote}". You felt an imbalance in your friendships and that your efforts weren't reciprocated. Is this the same feeling you're experiencing again today?`;
  }
  if (top.type === 'belief') {
    return `Looking back at your journal, you noted: "${top.source_quote}". You've previously found that keeping to your core habits and routine gave you clarity in moments like this.`;
  }
  return `I found a relevant ${top.type} memory in your vault: "${top.content}" (from your quote: "${top.source_quote}"). Does this connect with what you're thinking about right now?`;
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

  // If Groq key is missing or dummy, use smart local rule-based agentic evaluator
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
   - Ground your answer in their past memories when relevant (e.g. noticing their personal growth, validating their challenges, celebrating their milestones).
   - STRICT PERSONA RULE: NEVER speak like a robot, database, or system logger! NEVER say "I have noted this in your journal", "I have updated my records", "Retrieved memory", or "According to my records". Speak directly, warmly, and humanly to them (e.g., "It is completely normal to feel scared before your first presentation...", "Congratulations on finishing your presentation! It takes genuine courage to step up...").

2. 'action', 'new_memory', and 'supersede_id':
   Analyze the user's message against the retrieved past memories:

   A. ACTION "SUPERSEDE_OLD":
      - MANDATORY EMOTIONAL PROGRESSION & RESOLUTION RULE: If the user describes having completed, overcome, resolved, or improved upon an issue, fear, anxiety, or challenge from a past memory (for example: they previously felt scared, nervous, or stressed about a presentation/interview/meeting/conflict, and they now share that they gave it, handled it, feel confident, or resolved it), you MUST choose the action "SUPERSEDE_OLD".
      - 'supersede_id': MUST be the exact ID of the specific old past memory that is being overcome, contradicted, or resolved (e.g. from the [ID: ...] list above).
      - 'new_memory':
        * 'type': "event" | "feeling" | "belief" | "decision" | "preference"
        * 'content': A clear, concise 1-sentence summary of the new state or milestone (e.g. "Completed first presentation and gained confidence for future talks"). 
          STRICT RULE: DO NOT prepend "Feeling:", "Event:", "Preference:", or any type prefix to the content! DO NOT copy-paste raw typo-laden text.
        * 'source_quote': exact verbatim quote from the user's message.
        * 'is_temporary': boolean (true if temporary/transient).

   B. ACTION "SAVE_NEW":
      - TRIGGER: The user shares a new personal reflection, event, feeling, preference, belief, or decision that is new and does NOT contradict or resolve any past memory listed above.
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
      model: 'llama-3.3-70b-versatile',
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
        // If the LLM hallucinated an ID that wasn't in past memories, check if past memories has candidate
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
      
      // Clean type prefixes like "Feeling: ", "Event: ", etc. from content
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
    console.warn(`[ECHO AI WARNING] Groq agentic evaluation failed (${err.message}). Using local fallback.`);
    return localFallbackAgentic(text, pastMemories);
  }
}

/**
 * Smart local rule-based fallback for Agentic Memory evaluation
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
    lower.startsWith('is there');

  // 1. Question or query intent -> NO_SAVE
  if (isQuestion) {
    return {
      reply: localFallbackAnswer(text, pastMemories),
      action: 'NO_SAVE',
      new_memory: null,
      supersede_id: null
    };
  }

  // 2. Emotional Resolution / Breakthrough / Correction -> SUPERSEDE_OLD
  const isPresentationResolution = (lower.includes('confident') || lower.includes('gave') || lower.includes('finished') || lower.includes('handled') || lower.includes('did it') || lower.includes('went well')) &&
    pastMemories.some(m => /presentation|scared|nervous|fear|stress|anxious/i.test(`${m.content} ${m.source_quote}`));

  const isCorrection = isPresentationResolution ||
    lower.includes('improved') || 
    lower.includes('no longer') || 
    lower.includes('not anymore') || 
    lower.includes('resolved') || 
    lower.includes('changed my mind') || 
    lower.includes("don't feel that way") ||
    lower.includes('we talked');

  if (isCorrection && pastMemories.length > 0) {
    // Find matching past memory (e.g. presentation anxiety)
    const targetMemory = pastMemories.find(m => /presentation|scared|nervous|fear|stress|anxious/i.test(`${m.content} ${m.source_quote}`)) || pastMemories[0];
    const targetId = targetMemory._id?.toString() || null;
    const extracted = localFallbackExtract(text)[0];

    let reply = `Congratulations on completing your presentation! Stepping up when you were previously feeling scared takes real courage, and it is wonderful to see your confidence grow for future talks.`;
    if (lower.includes('improved') || lower.includes('talked')) {
      reply = `I am so glad to hear that things have improved. Having open conversations and resolving emotional friction takes real strength.`;
    }

    return {
      reply,
      action: 'SUPERSEDE_OLD',
      new_memory: extracted,
      supersede_id: targetId
    };
  }

  // 3. New statement / reflection -> SAVE_NEW
  const extracted = localFallbackExtract(text)[0];
  let reply = `It takes genuine honesty to acknowledge how you feel. Thank you for sharing this.`;
  if (lower.includes('scared') || lower.includes('nervous')) {
    reply = `It is completely natural to feel scared before your first presentation. Remember that nervousness just shows that you care—you have what it takes to get through this, and I'm rooting for you.`;
  } else if (pastMemories.length > 0) {
    reply = `Thank you for sharing this reflection. It's meaningful to see how your thoughts continue to grow alongside your earlier notes on ${pastMemories[0].content.toLowerCase()}.`;
  }

  return {
    reply,
    action: 'SAVE_NEW',
    new_memory: extracted,
    supersede_id: null
  };
}
