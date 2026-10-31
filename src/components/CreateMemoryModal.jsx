import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PlusCircle, X, Lock, Unlock } from 'lucide-react';

export default function CreateMemoryModal() {
  const { isNewMemoryModalOpen, setIsNewMemoryModalOpen, handleCreateMemory } = useApp();

  const [content, setContent] = useState('');
  const [sourceQuote, setSourceQuote] = useState('');
  const [type, setType] = useState('belief');
  const [isPrivate, setIsPrivate] = useState(false);
  const [expiryOption, setExpiryOption] = useState('none');

  if (!isNewMemoryModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    let expiresAt = null;
    if (expiryOption === '15s') {
      expiresAt = new Date(Date.now() + 15000).toISOString();
    } else if (expiryOption === '1h') {
      expiresAt = new Date(Date.now() + 3600000).toISOString();
    } else if (expiryOption === '1d') {
      expiresAt = new Date(Date.now() + 86400000).toISOString();
    } else if (expiryOption === '7d') {
      expiresAt = new Date(Date.now() + 86400000 * 7).toISOString();
    }

    handleCreateMemory({
      content: content.trim(),
      source_quote: sourceQuote.trim() || content.trim(),
      type,
      is_private: isPrivate,
      expires_at: expiresAt
    });
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsNewMemoryModalOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge emerald-badge">
              <PlusCircle size={18} />
            </div>
            <div>
              <h3 className="modal-title">Add Memory to Vault</h3>
              <p className="modal-subtitle">Inject knowledge directly into the agentic memory store</p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => setIsNewMemoryModalOpen(false)}
            title="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Memory Type */}
            <div className="form-group">
              <label className="form-label">Category / Memory Type:</label>
              <div className="type-chips-grid">
                {[
                  { id: 'feeling', label: 'Feeling', color: 'rose' },
                  { id: 'belief', label: 'Belief', color: 'purple' },
                  { id: 'preference', label: 'Preference', color: 'amber' },
                  { id: 'goal', label: 'Goal', color: 'teal' },
                  { id: 'event', label: 'Event', color: 'blue' },
                  { id: 'decision', label: 'Decision', color: 'emerald' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`type-chip-btn ${type === item.id ? `active-${item.color}` : ''}`}
                    onClick={() => setType(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="form-group">
              <label className="form-label">Extracted Semantic Knowledge:</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="E.g. Prefers focused morning sessions without interruptions..."
                required
              />
            </div>

            {/* Source Quote */}
            <div className="form-group">
              <label className="form-label">Verbatim User Quote (Provenance):</label>
              <input
                type="text"
                className="form-input"
                value={sourceQuote}
                onChange={(e) => setSourceQuote(e.target.value)}
                placeholder='E.g. "I get my best creative thinking done before 9 AM."'
              />
            </div>

            {/* Privacy Shield Toggle */}
            <div className="form-group privacy-toggle-group">
              <div className="toggle-info">
                <span className="toggle-title">Privacy Boundary Shield</span>
                <span className="toggle-sub">
                  {isPrivate
                    ? 'Strictly shielded from LLM context and vector recall'
                    : 'Eligible for semantic vector retrieval ($vectorSearch)'}
                </span>
              </div>
              <button
                type="button"
                className={`privacy-switch-btn ${isPrivate ? 'active-private' : ''}`}
                onClick={() => setIsPrivate(!isPrivate)}
              >
                {isPrivate ? <Lock size={15} /> : <Unlock size={15} />}
                <span>{isPrivate ? 'Private' : 'Public'}</span>
              </button>
            </div>

            {/* Expiry Options */}
            <div className="form-group">
              <label className="form-label">Time-to-Live (TTL Expiration):</label>
              <div className="expiry-pills-row">
                {[
                  { id: 'none', label: 'Permanent' },
                  { id: '15s', label: '15 Sec (Demo)' },
                  { id: '1h', label: '1 Hour' },
                  { id: '1d', label: '1 Day' },
                  { id: '7d', label: '7 Days' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`expiry-pill-btn ${expiryOption === opt.id ? 'active' : ''}`}
                    onClick={() => setExpiryOption(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="action-btn secondary-btn"
              onClick={() => setIsNewMemoryModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="action-btn primary-btn"
              disabled={!content.trim()}
            >
              <PlusCircle size={15} />
              <span>Save to Memory Vault</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
