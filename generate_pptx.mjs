import pptxgen from "pptxgenjs";

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

// Colors based on Echo Theme (Emerald / Forest & Slate)
const BG_DARK = "0F172A";
const ACCENT = "10B981";
const ACCENT_LIGHT = "D1FAE5";
const TEXT_MUTED = "94A3B8";
const TEXT_WHITE = "FFFFFF";
const CARD_BG = "1E293B";

// Slide 1: Title
{
  const slide = pptx.addSlide();
  slide.background = { color: BG_DARK };

  slide.addText("MONGODB STUDENT HACKATHON 2026", {
    x: 0.8, y: 0.8, w: 8.0, h: 0.4,
    fontSize: 13, bold: true, color: ACCENT, fontFace: "Arial"
  });

  slide.addText("ECHO", {
    x: 0.8, y: 1.4, w: 10.0, h: 1.2,
    fontSize: 54, bold: true, color: TEXT_WHITE, fontFace: "Arial"
  });

  slide.addText("A Private AI Journal with Memory that Evolves", {
    x: 0.8, y: 2.5, w: 11.0, h: 0.6,
    fontSize: 22, color: ACCENT_LIGHT, fontFace: "Arial"
  });

  slide.addText('"A diary can\'t find the entry that matters now. Echo can — by meaning, not just by date."', {
    x: 0.8, y: 3.4, w: 11.5, h: 0.8,
    fontSize: 16, italic: true, color: TEXT_MUTED, fontFace: "Arial"
  });

  // Team info box
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 4.8, w: 11.7, h: 1.6,
    fill: { color: CARD_BG }, line: { color: "334155", width: 1 }
  });

  slide.addText([
    { text: "Team: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "Echo Team   |   ", options: { color: TEXT_MUTED } },
    { text: "Track: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "PS1: Agentic Memory\n", options: { color: ACCENT } },
    { text: "Members: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "Mahathi S S (Lead, Integration & QA), Kunal Mahale (Backend & DB), Urmil Parmar (Frontend & UI/UX)\n", options: { color: TEXT_MUTED } },
    { text: "Contact: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "mahathi22027@gmail.com", options: { color: ACCENT_LIGHT } }
  ], { x: 1.1, y: 5.0, w: 11.2, h: 1.2, fontSize: 13, fontFace: "Arial" });
}

// Slide 2: 01 Problem
{
  const slide = pptx.addSlide();
  slide.background = { color: BG_DARK };

  slide.addText("01  PROBLEM", {
    x: 0.8, y: 0.6, w: 4.0, h: 0.4,
    fontSize: 12, bold: true, color: ACCENT, fontFace: "Arial"
  });
  slide.addText("What problem are we solving and for whom?", {
    x: 0.8, y: 1.0, w: 11.0, h: 0.6,
    fontSize: 22, bold: true, color: TEXT_WHITE, fontFace: "Arial"
  });

  // Card 1
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.8, w: 5.6, h: 4.6,
    fill: { color: CARD_BG }, line: { color: "334155", width: 1 }
  });
  slide.addText("The Problem", {
    x: 1.1, y: 2.1, w: 5.0, h: 0.4,
    fontSize: 18, bold: true, color: ACCENT, fontFace: "Arial"
  });
  slide.addText([
    { text: "• Chronological Traps: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "Traditional diaries lock reflections into calendar silos. Users cannot surface related past feelings or beliefs without knowing exact dates or keywords.\n\n", options: { color: TEXT_MUTED } },
    { text: "• Session Amnesia: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "Standard conversational chatbots reset context every session, forcing users to constantly repeat personal values, history, and working habits from scratch.", options: { color: TEXT_MUTED } }
  ], { x: 1.1, y: 2.7, w: 5.0, h: 3.4, fontSize: 13, fontFace: "Arial" });

  // Card 2
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.8, y: 1.8, w: 5.7, h: 4.6,
    fill: { color: CARD_BG }, line: { color: "334155", width: 1 }
  });
  slide.addText("Who Is Affected", {
    x: 7.1, y: 2.1, w: 5.1, h: 0.4,
    fontSize: 18, bold: true, color: ACCENT, fontFace: "Arial"
  });
  slide.addText([
    { text: "• Reflective Writers & Students:\n", options: { bold: true, color: TEXT_WHITE } },
    { text: "People tracking mental well-being, habit formation, and personal growth.\n\n", options: { color: TEXT_MUTED } },
    { text: "• Why It Matters:\n", options: { bold: true, color: TEXT_WHITE } },
    { text: "Journaling is only as powerful as your ability to notice long-term emotional and cognitive patterns over time.\n\n", options: { color: TEXT_MUTED } },
    { text: "• The Missing Link:\n", options: { bold: true, color: TEXT_WHITE } },
    { text: "Users need an AI companion that remembers their evolving journey while maintaining strict, transparent privacy boundaries.", options: { color: TEXT_MUTED } }
  ], { x: 7.1, y: 2.7, w: 5.1, h: 3.4, fontSize: 13, fontFace: "Arial" });
}

// Slide 3: 02 Solution
{
  const slide = pptx.addSlide();
  slide.background = { color: BG_DARK };

  slide.addText("02  SOLUTION", {
    x: 0.8, y: 0.6, w: 4.0, h: 0.4,
    fontSize: 12, bold: true, color: ACCENT, fontFace: "Arial"
  });
  slide.addText("What makes Echo different?", {
    x: 0.8, y: 1.0, w: 11.0, h: 0.6,
    fontSize: 22, bold: true, color: TEXT_WHITE, fontFace: "Arial"
  });

  // Card 1
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.8, w: 5.6, h: 4.6,
    fill: { color: CARD_BG }, line: { color: "334155", width: 1 }
  });
  slide.addText("What We Built", {
    x: 1.1, y: 2.1, w: 5.0, h: 0.4,
    fontSize: 18, bold: true, color: ACCENT, fontFace: "Arial"
  });
  slide.addText([
    { text: "Echo is a Memory-Governed AI Companion.\n\n", options: { bold: true, color: TEXT_WHITE } },
    { text: "It separates raw journal text from derived structured memory objects (Feelings, Beliefs, Events, Preferences).\n\n", options: { color: TEXT_MUTED } },
    { text: "Each reflection extracts typed facts with exact source quotes and dense 768-dim embeddings, stored in MongoDB Atlas for instant semantic recall across conversations.", options: { color: TEXT_MUTED } }
  ], { x: 1.1, y: 2.7, w: 5.0, h: 3.4, fontSize: 13, fontFace: "Arial" });

  // Card 2
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.8, y: 1.8, w: 5.7, h: 4.6,
    fill: { color: CARD_BG }, line: { color: "334155", width: 1 }
  });
  slide.addText("What Makes It Unique", {
    x: 7.1, y: 2.1, w: 5.1, h: 0.4,
    fontSize: 18, bold: true, color: ACCENT, fontFace: "Arial"
  });
  slide.addText([
    { text: "1. Visible Memory Inspector: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "Full transparency into every fact the AI knows about you.\n\n", options: { color: TEXT_MUTED } },
    { text: "2. Provenance & Superseding: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "When you change your mind, old memories are archived as superseded, preserving your evolution.\n\n", options: { color: TEXT_MUTED } },
    { text: "3. Differential Privacy Shield: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "Private memories are filtered out before prompt construction with zero LLM leakage.\n\n", options: { color: TEXT_MUTED } },
    { text: "4. TTL Expiry: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "Temporary thoughts auto-expire via MongoDB background indexes.", options: { color: TEXT_MUTED } }
  ], { x: 7.1, y: 2.7, w: 5.1, h: 3.4, fontSize: 12.5, fontFace: "Arial" });
}

// Slide 4: 03 Key Features & Demo
{
  const slide = pptx.addSlide();
  slide.background = { color: BG_DARK };

  slide.addText("03  FEATURES & ARCHITECTURE", {
    x: 0.8, y: 0.6, w: 6.0, h: 0.4,
    fontSize: 12, bold: true, color: ACCENT, fontFace: "Arial"
  });
  slide.addText("Key Capabilities & UI Layout", {
    x: 0.8, y: 1.0, w: 11.0, h: 0.6,
    fontSize: 22, bold: true, color: TEXT_WHITE, fontFace: "Arial"
  });

  // Feature 1
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.8, w: 3.7, h: 4.6,
    fill: { color: CARD_BG }, line: { color: "334155", width: 1 }
  });
  slide.addText("1. Semantic Recall", {
    x: 1.0, y: 2.1, w: 3.3, h: 0.4,
    fontSize: 16, bold: true, color: ACCENT, fontFace: "Arial"
  });
  slide.addText([
    { text: "Matches meaning, not keywords.\n\n", options: { bold: true, color: TEXT_WHITE } },
    { text: "Ask: \"I feel so alone today.\"\n", options: { italic: true, color: ACCENT_LIGHT } },
    { text: "Recalls: \"Felt hurt and uncared for in friendship.\"\n\n", options: { color: TEXT_MUTED } },
    { text: "Powered by Atlas $vectorSearch + Google Gemini text-embedding-004.", options: { color: TEXT_MUTED } }
  ], { x: 1.0, y: 2.7, w: 3.3, h: 3.3, fontSize: 12, fontFace: "Arial" });

  // Feature 2
  slide.addShape(pptx.ShapeType.rect, {
    x: 4.8, y: 1.8, w: 3.7, h: 4.6,
    fill: { color: CARD_BG }, line: { color: "334155", width: 1 }
  });
  slide.addText("2. Memory Inspector", {
    x: 5.0, y: 2.1, w: 3.3, h: 0.4,
    fontSize: 16, bold: true, color: ACCENT, fontFace: "Arial"
  });
  slide.addText([
    { text: "Live Visual Memory Vault.\n\n", options: { bold: true, color: TEXT_WHITE } },
    { text: "Inspect typed memory cards (Feeling, Event, Belief, Preference) with original source quote attribution.\n\n", options: { color: TEXT_MUTED } },
    { text: "Correct, supersede, toggle privacy, or delete memories with one click.", options: { color: TEXT_MUTED } }
  ], { x: 5.0, y: 2.7, w: 3.3, h: 3.3, fontSize: 12, fontFace: "Arial" });

  // Feature 3
  slide.addShape(pptx.ShapeType.rect, {
    x: 8.8, y: 1.8, w: 3.7, h: 4.6,
    fill: { color: CARD_BG }, line: { color: "334155", width: 1 }
  });
  slide.addText("3. Privacy & Expiry", {
    x: 9.0, y: 2.1, w: 3.3, h: 0.4,
    fontSize: 16, bold: true, color: ACCENT, fontFace: "Arial"
  });
  slide.addText([
    { text: "Governed Control (GOV-01).\n\n", options: { bold: true, color: TEXT_WHITE } },
    { text: "Private memories are excluded at database query level and never sent to LLM.\n\n", options: { color: TEXT_MUTED } },
    { text: "TTL Index auto-deletes time-bound thoughts when their expiry timestamp passes.", options: { color: TEXT_MUTED } }
  ], { x: 9.0, y: 2.7, w: 3.3, h: 3.3, fontSize: 12, fontFace: "Arial" });
}

// Slide 5: 04 Tech Stack & Impact
{
  const slide = pptx.addSlide();
  slide.background = { color: BG_DARK };

  slide.addText("04  TECH STACK & IMPACT", {
    x: 0.8, y: 0.6, w: 6.0, h: 0.4,
    fontSize: 12, bold: true, color: ACCENT, fontFace: "Arial"
  });
  slide.addText("Architecture, Stack & Scalability", {
    x: 0.8, y: 1.0, w: 11.0, h: 0.6,
    fontSize: 22, bold: true, color: TEXT_WHITE, fontFace: "Arial"
  });

  // Left Column - Tech Stack
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.8, w: 5.6, h: 4.6,
    fill: { color: CARD_BG }, line: { color: "334155", width: 1 }
  });
  slide.addText("Technology Stack", {
    x: 1.1, y: 2.1, w: 5.0, h: 0.4,
    fontSize: 18, bold: true, color: ACCENT, fontFace: "Arial"
  });
  slide.addText([
    { text: "• Frontend: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "React 19, TypeScript, Vite 8, Figma Make Kit, Custom CSS Engine.\n\n", options: { color: TEXT_MUTED } },
    { text: "• Backend / APIs: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "Node.js 24, Express 5 (ES Modules), JWT & bcryptjs authentication.\n\n", options: { color: TEXT_MUTED } },
    { text: "• Database / Vector Search: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "MongoDB Atlas Native Driver, Atlas $vectorSearch (Cosine Metric, 768-dim).\n\n", options: { color: TEXT_MUTED } },
    { text: "• AI Models: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "Groq (llama-3.3-70b-versatile) & Google Gemini text-embedding-004.", options: { color: TEXT_MUTED } }
  ], { x: 1.1, y: 2.7, w: 5.0, h: 3.4, fontSize: 12.5, fontFace: "Arial" });

  // Right Column - Impact
  slide.addShape(pptx.ShapeType.rect, {
    x: 6.8, y: 1.8, w: 5.7, h: 4.6,
    fill: { color: CARD_BG }, line: { color: "334155", width: 1 }
  });
  slide.addText("Impact & Scalability", {
    x: 7.1, y: 2.1, w: 5.1, h: 0.4,
    fontSize: 18, bold: true, color: ACCENT, fontFace: "Arial"
  });
  slide.addText([
    { text: "• Real-World Impact: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "Eliminates repetitive context re-prompting. Empowers users with reflective emotional self-awareness and continuity.\n\n", options: { color: TEXT_MUTED } },
    { text: "• Scalability with MongoDB: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "Compound indexing on (user_id, status, is_private) guarantees high-throughput isolation across thousands of concurrent users.\n\n", options: { color: TEXT_MUTED } },
    { text: "• Next Steps: ", options: { bold: true, color: TEXT_WHITE } },
    { text: "Contradiction detection to surface conflicting beliefs and weekly multi-entry synthesized growth patterns.", options: { color: TEXT_MUTED } }
  ], { x: 7.1, y: 2.7, w: 5.1, h: 3.4, fontSize: 12.5, fontFace: "Arial" });
}

// Slide 6: Links & Submission
{
  const slide = pptx.addSlide();
  slide.background = { color: BG_DARK };

  slide.addText("SUBMISSION & LINKS", {
    x: 0.8, y: 0.6, w: 6.0, h: 0.4,
    fontSize: 12, bold: true, color: ACCENT, fontFace: "Arial"
  });
  slide.addText("Public Deliverables", {
    x: 0.8, y: 1.0, w: 11.0, h: 0.6,
    fontSize: 22, bold: true, color: TEXT_WHITE, fontFace: "Arial"
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 1.8, w: 11.7, h: 4.0,
    fill: { color: CARD_BG }, line: { color: "334155", width: 1 }
  });

  slide.addText([
    { text: "🔗 Live Web Application (Frontend):\n", options: { bold: true, color: ACCENT } },
    { text: "https://echo-ai-memory-woad.vercel.app/\n\n", options: { color: TEXT_WHITE } },
    { text: "⚙️ Backend API Service (Render):\n", options: { bold: true, color: ACCENT } },
    { text: "https://echo-ai-memory.onrender.com/api/health\n\n", options: { color: TEXT_WHITE } },
    { text: "📂 GitHub Repository (Open Source):\n", options: { bold: true, color: ACCENT } },
    { text: "https://github.com/mahathi22027-ai/echo-ai-memory\n\n", options: { color: TEXT_WHITE } },
    { text: "🎥 Demo Video (2-3 min):\n", options: { bold: true, color: ACCENT } },
    { text: "Walkthrough and presentation video recording", options: { color: TEXT_MUTED } }
  ], { x: 1.2, y: 2.1, w: 10.9, h: 3.4, fontSize: 13, fontFace: "Arial" });

  slide.addText("Thank you!  —  Team Echo", {
    x: 0.8, y: 6.0, w: 11.7, h: 0.6,
    fontSize: 18, bold: true, align: "center", color: ACCENT, fontFace: "Arial"
  });
}

pptx.writeFile({ fileName: "C:/Users/Mahathi/.gemini/antigravity/scratch/echo-ai-memory/backend-repo/ECHO_Presentation.pptx" })
  .then(fileName => {
    console.log("Successfully created: " + fileName);
  })
  .catch(err => {
    console.error("Error creating presentation:", err);
  });
