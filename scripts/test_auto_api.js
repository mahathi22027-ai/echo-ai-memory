/**
 * Integration & Unit Test Suite for Autonomous Agentic Memory Pipeline (Auto Mode)
 */
import { evaluateAgenticMemory } from '../server/ai.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING AGENTIC MEMORY PIPELINE TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // --- UNIT TESTS: AI Evaluator Logic ---
  console.log('--- 1. Testing AI Evaluator: NO_SAVE (Pure Query) ---');
  const pastMems = [
    {
      _id: 'mem_123',
      type: 'feeling',
      content: 'Feels like friends do not value effort in plans.',
      source_quote: 'Whenever plans are made, it feels like I am the only one reaching out.'
    }
  ];

  const queryResult = await evaluateAgenticMemory("How did I feel about my friends last week?", pastMems);
  console.log('Query Result:', queryResult);
  assert(queryResult.action === 'NO_SAVE', 'Action should be NO_SAVE for questions');
  assert(typeof queryResult.reply === 'string' && queryResult.reply.length > 0, 'Reply must be populated');
  assert(queryResult.new_memory === null, 'new_memory must be null on NO_SAVE');
  assert(queryResult.supersede_id === null, 'supersede_id must be null on NO_SAVE');

  console.log('\n--- 2. Testing AI Evaluator: SAVE_NEW (New Reflection) ---');
  const newResult = await evaluateAgenticMemory("I decided to wake up at 5:30 AM every day to read and meditate.", pastMems);
  console.log('New Result:', newResult);
  assert(newResult.action === 'SAVE_NEW', 'Action should be SAVE_NEW for new lifestyle decisions');
  assert(newResult.new_memory !== null, 'new_memory must be an object');
  assert(newResult.new_memory.content.length > 0, 'new_memory.content must have text');
  assert(newResult.supersede_id === null, 'supersede_id must be null for SAVE_NEW');

  console.log('\n--- 3. Testing AI Evaluator: SUPERSEDE_OLD (Contradiction/Update) ---');
  const supResult = await evaluateAgenticMemory("Things have improved with my friends; we talked it out and I don't feel that way anymore.", pastMems);
  console.log('Supersede Result:', supResult);
  assert(supResult.action === 'SUPERSEDE_OLD', 'Action should be SUPERSEDE_OLD for resolved feelings');
  assert(supResult.new_memory !== null, 'new_memory must be provided');
  assert(supResult.supersede_id === 'mem_123', 'supersede_id must match the contradicted past memory ID');

  console.log('\n--- 3b. Testing Presentation Emotional Resolution (Scared -> Confident) ---');
  const presentationFearMem = [
    {
      _id: 'mem_pres_456',
      type: 'feeling',
      content: 'Felt scared and anxious about delivering upcoming first presentation',
      source_quote: 'i am feeling scared to give my first presentation'
    }
  ];

  // Turn A: First presentation fear
  const presFearResult = await evaluateAgenticMemory("i am feeling scared to give my first presentation", []);
  console.log('Presentation Fear Result:', presFearResult);
  assert(presFearResult.action === 'SAVE_NEW', 'Turn A should be SAVE_NEW');
  assert(!presFearResult.reply.startsWith("I've noted this in your journal"), 'Reply should NOT be robotic');
  assert(!presFearResult.new_memory.content.toLowerCase().startsWith('feeling:'), 'Content must NOT start with "Feeling:"');

  // Turn B: Presentation completed with confidence
  const presConfResult = await evaluateAgenticMemory("i gave my presnetation now i think i am confident enough whenever i would need to next time", presentationFearMem);
  console.log('Presentation Confidence Result:', presConfResult);
  assert(presConfResult.action === 'SUPERSEDE_OLD', 'Overcoming presentation fear must trigger SUPERSEDE_OLD');
  assert(presConfResult.supersede_id === 'mem_pres_456', 'supersede_id must target the presentation fear memory');
  assert(!presConfResult.new_memory.content.toLowerCase().startsWith('event:'), 'Content must NOT start with "Event:"');
  assert(!presConfResult.reply.startsWith("I've noted this in your journal"), 'Reply must be an empathetic companion response');

  // --- INTEGRATION TESTS: Live Backend if active ---
  console.log('\n--- 4. Checking Live Backend at http://localhost:5000/api ---');
  try {
    const healthRes = await fetch('http://localhost:5000/api/health', { signal: AbortSignal.timeout(1500) });
    if (healthRes.ok) {
      console.log('Backend is online. Testing POST /api/auto live endpoint...');
      
      const autoRes = await fetch('http://localhost:5000/api/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: "I am trying a new coding workspace at the local library.",
          user_id: 'test_runner_user'
        })
      });
      const autoData = await autoRes.json();
      console.log('POST /api/auto response:', {
        status: autoRes.status,
        mode: autoData.mode,
        actionTaken: autoData.actionTaken,
        reply: autoData.reply?.slice(0, 70)
      });
      assert(autoRes.status === 200, 'POST /api/auto returns HTTP 200');
      assert(autoData.mode === 'auto', 'Response mode is "auto"');
      assert(['SAVE_NEW', 'SUPERSEDE_OLD', 'NO_SAVE'].includes(autoData.actionTaken), 'actionTaken is valid');
      assert(autoData.reply && autoData.answer, 'Both reply and answer fields are populated');
    } else {
      console.log('Live backend returned status:', healthRes.status);
    }
  } catch (err) {
    console.log('Backend server is not running right now (skipping live HTTP test - offline simulation tested).');
  }

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

