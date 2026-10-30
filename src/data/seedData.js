/**
 * Default Seed Data for ECHO - Private AI Journal with Evolving Memory
 * MongoDB Student Hackathon - PS1 Agentic Memory
 */

export const INITIAL_USER = {
  id: 'user_123',
  name: 'Alex Rivera',
  email: 'alex.rivera@hackathon.mongodb.com',
  session_id: 'sess_live_9012'
};

export const INITIAL_MEMORIES = [
  {
    _id: 'mem_001',
    user_id: 'user_123',
    entry_id: 'entry_045',
    type: 'feeling',
    content: 'Feels hurt and uncared for in a friendship.',
    source_quote: 'I told her it was fine, but honestly, I\'m really hurt.',
    embedding: [0.12, 0.44, 0.08, 0.76, 0.23],
    status: 'active',
    is_private: false,
    expires_at: null,
    supersedes_id: null,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString() // 24 hours ago
  },
  {
    _id: 'mem_002',
    user_id: 'user_123',
    entry_id: 'entry_046',
    type: 'belief',
    content: 'Believes consistency in small habits leads to creative breakthroughs.',
    source_quote: 'Writing every morning even when uninspired is the only way I break through blocks.',
    embedding: [0.35, 0.22, 0.81, 0.15, 0.49],
    status: 'active',
    is_private: false,
    expires_at: null,
    supersedes_id: null,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    _id: 'mem_003',
    user_id: 'user_123',
    entry_id: 'entry_047',
    type: 'preference',
    content: 'Prefers quiet solitary cafes over noisy co-working spaces for deep coding.',
    source_quote: 'I cannot focus when people are taking loud sales calls next to me.',
    embedding: [0.18, 0.65, 0.31, 0.42, 0.11],
    status: 'private', // Demonstrates private memory boundary!
    is_private: true,
    expires_at: null,
    supersedes_id: null,
    created_at: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    _id: 'mem_004',
    user_id: 'user_123',
    entry_id: 'entry_048',
    type: 'goal',
    content: 'Targeting completion of the agentic memory prototype before 6 PM.',
    source_quote: 'My primary milestone is wrapping up the vector search pipeline by dinner.',
    embedding: [0.55, 0.38, 0.19, 0.88, 0.62],
    status: 'active',
    is_private: false,
    expires_at: new Date(Date.now() + 3600000 * 4).toISOString(), // Expires in 4 hours
    supersedes_id: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

export const INITIAL_MESSAGES = [
  {
    id: 'msg_001',
    sender: 'user',
    text: 'I told her it was fine, but honestly, I\'m really hurt. It feels like whenever I need support, my friends are suddenly too busy, but I always show up for them.',
    mode: 'journal',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'msg_002',
    sender: 'echo',
    text: 'I\'ve heard you, and I\'ve recorded this experience. It sounds like you\'re carrying an unfair emotional load when your reciprocity isn\'t matched. I\'ve preserved this feeling so we can understand your emotional patterns over time.',
    mode: 'journal',
    timestamp: new Date(Date.now() - 3600000 * 24 + 2000).toISOString(),
    extractedMemories: ['mem_001']
  },
  {
    id: 'msg_003',
    sender: 'user',
    text: 'Writing every morning even when uninspired is the only way I break through blocks. I need to protect that 7 AM routine at all costs.',
    mode: 'journal',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'msg_004',
    sender: 'echo',
    text: 'Noted with care. I\'ve structured this into your core beliefs around creative discipline and habits. Your morning time is flagged as a sacred boundary.',
    mode: 'journal',
    timestamp: new Date(Date.now() - 3600000 * 18 + 1800).toISOString(),
    extractedMemories: ['mem_002']
  }
];

export const INITIAL_EVENTS = [
  {
    _id: 'evt_001',
    user_id: 'user_123',
    memory_id: 'mem_001',
    event_type: 'memory_created',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    metadata: {
      type: 'feeling',
      source_entry_id: 'entry_045',
      summary: 'Friendship vulnerability recorded'
    }
  },
  {
    _id: 'evt_002',
    user_id: 'user_123',
    memory_id: 'mem_002',
    event_type: 'memory_created',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    metadata: {
      type: 'belief',
      source_entry_id: 'entry_046',
      summary: 'Creative discipline belief extracted'
    }
  },
  {
    _id: 'evt_003',
    user_id: 'user_123',
    memory_id: 'mem_003',
    event_type: 'memory_created',
    timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
    metadata: {
      type: 'preference',
      source_entry_id: 'entry_047',
      summary: 'Workspace preference recorded'
    }
  },
  {
    _id: 'evt_004',
    user_id: 'user_123',
    memory_id: 'mem_003',
    event_type: 'memory_marked_private',
    timestamp: new Date(Date.now() - 3600000 * 9).toISOString(),
    metadata: {
      reason: 'User flagged as private; excluded from LLM vector retrieval',
      is_private: true
    }
  },
  {
    _id: 'evt_005',
    user_id: 'user_123',
    memory_id: 'mem_004',
    event_type: 'memory_created',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    metadata: {
      type: 'goal',
      source_entry_id: 'entry_048',
      ttl_configured: '4 hours'
    }
  }
];

export const DEMO_SCRIPT_STEPS = [
  {
    step: 1,
    title: '1. Create & Extract',
    actionText: 'Enter: "I feel like my friends don\'t value my efforts."',
    prompt: 'I feel like my friends don\'t value my efforts. Whenever plans are made, it feels like I\'m the only one reaching out.',
    mode: 'journal',
    description: 'Echo extracts a FEELING memory and shows its exact source quote in the inspector.',
    expected: 'Memory card with type FEELING is created and visible in center panel without page refresh.'
  },
  {
    step: 2,
    title: '2. Persist in Storage',
    actionText: 'End session / Reload workspace',
    isAction: 'persist',
    description: 'Simulates closing and reopening the app or switching browser sessions. Memories remain intact in MongoDB Atlas.',
    expected: 'State persists from storage, demonstrating persistent agentic memory across sessions.'
  },
  {
    step: 3,
    title: '3. Semantic Recall',
    actionText: 'Ask: "I\'m feeling the same way again."',
    prompt: 'I\'m feeling the same way again.',
    mode: 'query',
    description: 'Semantic vector search retrieves the earlier friendship feeling memory despite completely different wording.',
    expected: 'Echo retrieves mem_001, cites the provenance in the response, and highlights the memory card.'
  },
  {
    step: 4,
    title: '4. Memory Superseding',
    actionText: 'Say: "Things have improved; I don\'t feel that way now."',
    prompt: 'Things have improved between us; we talked it out and I don\'t feel that way now.',
    mode: 'journal',
    isSupersedeDemo: true,
    targetMemoryId: 'mem_001',
    description: 'A correction marks the previous memory as superseded and creates a replacement linked to it.',
    expected: 'Old memory is marked "superseded" (retained in history); new active memory is created linked via supersedes_id.'
  },
  {
    step: 5,
    title: '5. Privacy Boundary',
    actionText: 'Query private workspace preferences',
    prompt: 'Where do I prefer to work when I need to do deep programming?',
    mode: 'query',
    description: 'mem_003 is marked Private. The privacy guard strictly excludes it before LLM prompt construction.',
    expected: 'Echo abstains or reports that no public memory was found, proving private memories are excluded from retrieval.'
  },
  {
    step: 6,
    title: '6. Expiry & TTL Guard',
    actionText: 'Set a 15-second expiry on a memory and test recall',
    isAction: 'expiry_demo',
    description: 'Set expires_at on a memory. Application logic immediately filters it out once expired, before MongoDB TTL deletion.',
    expected: 'Expired memories are marked EXPIRED and become immediately ineligible for vector retrieval.'
  }
];
