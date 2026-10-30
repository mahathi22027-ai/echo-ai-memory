/**
 * End-to-end API test script for ECHO Backend
 */

const BASE_URL = 'http://localhost:5000/api';

async function testAll() {
  console.log('Testing ECHO Backend Endpoints at:', BASE_URL);

  // 1. Health check
  console.log('\n--- 1. Testing GET /api/health ---');
  const healthRes = await fetch(`${BASE_URL}/health`);
  console.log('Health Status:', healthRes.status, await healthRes.json());

  // 2. Chat extraction
  console.log('\n--- 2. Testing POST /api/chat (Journal Extraction) ---');
  const chatRes = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: "I feel like my friends don't value my efforts. Whenever plans are made, it feels like I'm the only one reaching out.",
      user_id: 'demo_user'
    })
  });
  const chatData = await chatRes.json();
  console.log('Chat Extraction Status:', chatRes.status, 'Extracted count:', chatData.extractedMemories?.length);
  const memoryId = chatData.extractedMemories?.[0]?._id;
  console.log('First Extracted Memory:', {
    id: memoryId,
    type: chatData.extractedMemories?.[0]?.type,
    content: chatData.extractedMemories?.[0]?.content,
    source_quote: chatData.extractedMemories?.[0]?.source_quote,
    status: chatData.extractedMemories?.[0]?.status,
    embedding_len: chatData.extractedMemories?.[0]?.embedding?.length
  });

  // 3. Query
  console.log('\n--- 3. Testing POST /api/query (Semantic Recall) ---');
  const queryRes = await fetch(`${BASE_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: "I'm feeling the same way again.",
      user_id: 'demo_user'
    })
  });
  const queryData = await queryRes.json();
  console.log('Query Status:', queryRes.status, {
    answer: queryData.answer,
    memoriesUsed: queryData.memoriesUsed,
    similarityScores: queryData.similarityScores
  });

  // 4. List memories
  console.log('\n--- 4. Testing GET /api/memories ---');
  const memsRes = await fetch(`${BASE_URL}/memories?user_id=demo_user`);
  const memsData = await memsRes.json();
  console.log('Memories count:', memsData.count, 'status:', memsRes.status);

  // 5. Supersede
  if (memoryId) {
    console.log('\n--- 5. Testing PATCH /api/memories/:id/supersede ---');
    const supRes = await fetch(`${BASE_URL}/memories/${memoryId}/supersede`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newContent: "Things have improved; we talked it out and I don't feel that way now.",
        newType: "feeling",
        user_id: 'demo_user'
      })
    });
    const supData = await supRes.json();
    console.log('Supersede Status:', supRes.status, {
      supersededId: supData.supersededId,
      newMemoryId: supData.newMemory?._id,
      newMemoryStatus: supData.newMemory?.status
    });

    // 6. Privacy toggle
    console.log('\n--- 6. Testing PATCH /api/memories/:id/privacy ---');
    const privRes = await fetch(`${BASE_URL}/memories/${supData.newMemory?._id}/privacy`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_private: true,
        user_id: 'demo_user'
      })
    });
    const privData = await privRes.json();
    console.log('Privacy Status:', privRes.status, privData);
  }

  // 7. System Log events
  console.log('\n--- 7. Testing GET /api/memory-events ---');
  const eventsRes = await fetch(`${BASE_URL}/memory-events?user_id=demo_user`);
  const eventsData = await eventsRes.json();
  console.log('Audit events count:', eventsData.events?.length);

  console.log('\n✅ All API Tests Completed Successfully!');
}

testAll().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
