import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  BookOpen, 
  Search, 
  Sparkles, 
  ShieldAlert, 
  ExternalLink, 
  Bot,
  User,
  Eye,
  Clock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function ChatPanel() {
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    memories, 
    setHighlightedMemoryId,
    openMemoryDetail,
    setIsQuickInspectorOpen
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [selectedMode, setSelectedMode] = useState('journal'); // 'journal' | 'query'
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    sendMessage(inputVal.trim(), selectedMode);
    setInputVal('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (prompt, mode) => {
    setSelectedMode(mode);
    setInputVal(prompt);
    textareaRef.current?.focus();
  };

  const findMemory = (id) => memories.find(m => m._id === id);

  const handleJumpToMemory = (id) => {
    setHighlightedMemoryId(id);
    openMemoryDetail(id);
  };

  return (
    <div className="panel chat-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title-group">
          <div className="panel-title-icon-wrapper chat-color">
            <BookOpen size={16} />
          </div>
          <div>
            <h2 className="panel-title">AI Journal & Chat</h2>
            <p className="panel-description">Reflect freely or ask questions grounded in your evolving memory</p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="chat-header-actions">
          {/* Quick Peek Drawer Trigger */}
          <button 
<button 
            type="button" 
            className="chat-quick-peek-btn"
            onClick={() => setIsQuickInspectorOpen(true)}
            title="Open quick memory inspector pop-up drawer"
          >
            <Eye size={13} />
            <span>Quick Memory Peek</span>
          </button>

          {/* Mode Selector Toggle */}
          <div className="mode-toggle-group">
            <button 
              type="button"
              className={`mode-btn ${selectedMode === 'auto' ? 'active-auto' : ''}`}
              onClick={() => setSelectedMode('auto')}
              title="Auto (Agentic) Mode: Autonomously recalls past memories, stores new facts, or supersedes old memories"
            >
              <Sparkles size={13} />
              <span>Auto</span>
            </button>
            <button 
              type="button"
              className={`mode-btn ${selectedMode === 'journal' ? 'active-journal' : ''}`}
              onClick={() => setSelectedMode('journal')}
              title="Journal Mode: Extracts structured memories and stores them in MongoDB"
            >
              <BookOpen size={13} />
              <span>Journal</span>
            </button>
            <button 
              type="button"
              className={`mode-btn ${selectedMode === 'query' ? 'active-query' : ''}`}
              onClick={() => setSelectedMode('query')}
              title="Recall Mode: Retrieves past memories via Semantic Vector Search"
            >
              <Search size={13} />
              <span>Recall</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="chat-suggestions-bar">
        <span className="suggestions-label">Try:</span>
        <button 
          className="suggestion-chip"
          onClick={() => handleSuggestionClick("I decided to try a new routine starting tomorrow, how does this compare to my past habits?", 'auto')}
        >
          "Auto: New routine..."
        </button>
        <button 
          className="suggestion-chip"
          onClick={() => handleSuggestionClick("I feel like my friends don't value my efforts.", 'journal')}
        >
          "I feel like my friends..."
        </button>
        <button 
          className="suggestion-chip"
          onClick={() => handleSuggestionClick("I'm feeling the same way again.", 'query')}
        >
          "I'm feeling the same way again"
        </button>
        <button 
          className="suggestion-chip"
          onClick={() => handleSuggestionClick("Things have improved; I don't feel that way now.", 'auto')}
        >
          "Auto: Things have improved..."
        </button>
      </div>

      {/* Messages Stream */}
      <div className="messages-stream">
        {messages.map((msg) => {
          const isEcho = msg.sender === 'echo';
          return (
            <div 
              key={msg.id} 
              className={`message-row ${isEcho ? 'echo-row' : 'user-row'}`}
            >
              <div className="message-avatar">
                {isEcho ? (
                  <div className="echo-avatar-icon">
                    <Bot size={16} />
                  </div>
                ) : (
                  <div className="user-avatar-icon">
                    <User size={16} />
                  </div>
                )}
              </div>

              <div className="message-content-wrapper">
                <div className="message-meta-header">
                  <span className="message-sender-name">
                    {isEcho ? 'Echo' : 'You'}
                  </span>
                  <span className={`message-mode-badge ${msg.mode === 'auto' ? 'badge-auto' : ''}`}>
                    {msg.mode === 'auto'
                      ? (msg.actionTaken === 'SAVE_NEW'
                          ? 'Auto · Saved'
                          : msg.actionTaken === 'SUPERSEDE_OLD'
                            ? 'Auto · Superseded'
                            : msg.actionTaken === 'NO_SAVE'
                              ? 'Auto · Recalled'
                              : 'Auto Agentic')
                      : msg.mode === 'query' ? 'Recall Query' : 'Journal Entry'}
                  </span>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="message-bubble">
                  <p className="message-text">{msg.text}</p>
                </div>

                {/* Provenance & Retrieved Memories Badge */}
                {isEcho && msg.referencedMemories && msg.referencedMemories.length > 0 && (
                  <div className="provenance-section">
                    <div className="provenance-title">
                      <Sparkles size={13} className="text-emerald" />
                      <span>Retrieved Context (Provenance):</span>
                    </div>
                    <div className="provenance-cards">
                      {msg.referencedMemories.map((refId) => {
                        const mem = findMemory(refId);
                        const score = msg.similarityScores?.[refId];
                        return (
                          <div 
                            key={refId} 
                            className="provenance-card"
                            onClick={() => handleJumpToMemory(refId)}
                            title="Click to view full memory card in Inspector"
                          >
                            <span className="provenance-type-badge">{mem ? mem.type.toUpperCase() : 'MEMORY'}</span>
                            <span className="provenance-id">{refId}</span>
                            {score && (
                              <span className="provenance-score">
                                {Math.round(score * 100)}% match
                              </span>
                            )}
                            <span className="provenance-quote">
                              "{mem?.content || 'Retrieved from MongoDB Atlas'}"
                            </span>
                            <ArrowRight size={12} className="provenance-arrow" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Extracted Memories Badge */}
                {isEcho && msg.extractedMemories && msg.extractedMemories.length > 0 && (
                  <div className="extracted-section">
                    <div className="extracted-title">
                      <CheckCircle2 size={13} className="text-emerald" />
                      <span>Saved to Memory Vault:</span>
                    </div>
                    <div className="extracted-chips">
                      {msg.extractedMemories.map((memId) => {
                        const mem = findMemory(memId);
                        return (
                          <button 
                            key={memId} 
                            className="extracted-chip"
                            onClick={() => handleJumpToMemory(memId)}
                            title="Click to inspect extracted memory card"
                          >
                            <span className="chip-badge">{mem ? mem.type : 'extracted'}</span>
                            <span className="chip-text">{mem ? mem.content : memId}</span>
                            <ExternalLink size={11} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Privacy Shield Notice */}
                {isEcho && msg.privacyShieldedCount > 0 && (
                  <div className="privacy-shield-notice">
                    <ShieldAlert size={13} className="text-amber" />
                    <span>Privacy Guard: {msg.privacyShieldedCount} private memory excluded from LLM vector context.</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="message-row echo-row">
            <div className="message-avatar">
              <div className="echo-avatar-icon pulsing">
                <Bot size={16} />
              </div>
            </div>
            <div className="message-content-wrapper">
              <div className="message-bubble thinking-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="thinking-text">
                  {selectedMode === 'auto'
                    ? 'Autonomous agent evaluating memories & determining action...'
                    : selectedMode === 'journal' 
                      ? 'Extracting structured memories & creating embeddings...' 
                      : 'Running MongoDB Vector Search across eligible memories...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form className="chat-input-area" onSubmit={handleSubmit}>
        <div className="input-toolbar">
          <div className="current-mode-indicator">
            {selectedMode === 'auto' ? (
              <>
                <Sparkles size={12} className="text-purple" />
                <span>Auto Mode (Autonomous Recall, Save & Supersede)</span>
              </>
            ) : selectedMode === 'journal' ? (
              <>
                <BookOpen size={12} className="text-emerald" />
                <span>Journal Mode (Creates structured memory)</span>
              </>
            ) : (
              <>
                <Search size={12} className="text-cyan" />
                <span>Recall Mode (Vector search past memories)</span>
              </>
            )}
          </div>
          <span className="shortcut-hint">Press ↵ to send, Shift+↵ for new line</span>
        </div>

        <div className="textarea-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder={
              selectedMode === 'auto'
                ? "Talk to Echo freely—Echo will recall past context and remember new updates automatically..."
                : selectedMode === 'journal'
                  ? "Write your thoughts, feelings, decisions, or daily reflections..."
                  : "Ask Echo anything about your past entries or experiences..."
            }
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            disabled={isLoading}
          />

          <button 
            type="submit" 
            className="send-button"
            disabled={!inputVal.trim() || isLoading}
            title="Send (Enter)"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
