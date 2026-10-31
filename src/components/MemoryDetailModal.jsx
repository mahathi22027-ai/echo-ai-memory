import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BrainCircuit,
  X,
  Lock,
  Unlock,
  Clock,
  GitBranch,
  Trash2,
  Quote,
  ArrowRight,
  Copy
} from 'lucide-react';

export default function MemoryDetailModal() {
  const {
    memoryDetailModalTarget,
    setMemoryDetailModalTarget,
    setSupersedeModalTarget,
    setExpiryModalTarget,
    handleTogglePrivacy,
    handleDeleteMemory,
    memories,
    showToast
  } = useApp();

  if (!memoryDetailModalTarget) return null;

  const memory = memoryDetailModalTarget;

  // Find superseded memory or superseding memory if exists
  const supersededByMemory = memories.find(m => m.supersedes_id === memory._id);
  const ancestorMemory = memory.supersedes_id ? memories.find(m => m._id === memory.supersedes_id) : null;

  const handleCopyQuote = () => {
    navigator.clipboard?.writeText(memory.source_quote);
    showToast('Source quote copied to clipboard', 'info');
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(memory._id);
    showToast(`Copied ID ${memory._id}`, 'info');
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'None';
    try {
      const d = new Date(isoString);
      return d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (_e) {
      return isoString;
    }
  };

  const getStatusBadge = () => {
    if (memory.status === 'expired') {
      return (
        <span className="modal-status-badge badge-expired">
          <Clock size={12} /> Expired (TTL Excluded)
        </span>
      );
    }
    if (memory.is_private) {
      return (
        <span className="modal-status-badge badge-private">
          <Lock size={12} /> Private (Excluded from LLM)
        </span>
      );
    }
    if (memory.status === 'superseded') {
      return (
        <span className="modal-status-badge badge-superseded">
          <GitBranch size={12} /> Superseded (Historical Record)
        </span>
      );
    }
    return (
      <span className="modal-status-badge badge-active">
        <span className="active-glow-dot"></span> Active (In Vector Index)
      </span>
    );
  };

  return (
    <div className="modal-backdrop" onClick={() => setMemoryDetailModalTarget(null)}>
      <div className="modal-card detail-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className={`modal-icon-badge type-${memory.type}`}>
              <BrainCircuit size={18} />
            </div>
            <div>
              <div className="detail-meta-pill-row">
                <span className={`detail-type-tag type-${memory.type}`}>
                  {memory.type.toUpperCase()}
                </span>
                <span className="detail-id-pill" onClick={handleCopyId} title="Click to copy ID">
                  {memory._id}
                  <Copy size={11} className="copy-icon" />
                </span>
                {getStatusBadge()}
              </div>
              <h3 className="modal-title">Memory Document Inspector</h3>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => setMemoryDetailModalTarget(null)}
            title="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body detail-modal-body">
          {/* Main Content Box */}
          <div className="detail-section">
            <div className="section-title-label">EXTRACTED AGENTIC KNOWLEDGE</div>
            <div className="detail-content-card">
              <p className="detail-content-text">{memory.content}</p>
            </div>
          </div>

          {/* Verbatim Source Quote Box */}
          <div className="detail-section">
            <div className="section-title-row">
              <span className="section-title-label">VERBATIM USER SOURCE QUOTE (PROVENANCE)</span>
              <button className="copy-btn-small" onClick={handleCopyQuote} title="Copy source quote">
                <Copy size={12} />
                <span>Copy Quote</span>
              </button>
            </div>
            <div className="detail-quote-card">
              <Quote size={18} className="quote-icon-decor" />
              <blockquote className="detail-quote-text">
                "{memory.source_quote}"
              </blockquote>
            </div>
          </div>

          {/* 5-Dimensional Embedding Visualization */}
          {memory.embedding && Array.isArray(memory.embedding) && (
            <div className="detail-section">
              <div className="section-title-label">
                ATLAS VECTOR EMBEDDING PREVIEW ({memory.embedding.length} DIMENSIONS)
              </div>
              <div className="embedding-vis-card">
                <p className="embedding-vis-subtitle">
                  Dense semantic coordinate used for MongoDB Atlas Vector Search ($vectorSearch):
                </p>
                <div className="embedding-bars-grid">
                  {memory.embedding.map((val, idx) => {
                    const pct = Math.min(100, Math.max(10, Math.round(Math.abs(val) * 100)));
                    return (
                      <div key={idx} className="embedding-bar-item">
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{ height: `${pct}%` }}
                            title={`Dim ${idx + 1}: ${val}`}
                          ></div>
                        </div>
                        <span className="bar-label">d{idx + 1}</span>
                        <span className="bar-val">{val.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Evolution / Superseded Lineage */}
          {(ancestorMemory || supersededByMemory) && (
            <div className="detail-section">
              <div className="section-title-label">AGENTIC MEMORY EVOLUTION LINEAGE</div>
              <div className="lineage-card">
                {ancestorMemory && (
                  <div className="lineage-node ancestor-node">
                    <div className="node-icon">
                      <GitBranch size={14} className="text-purple" />
                    </div>
                    <div className="node-content">
                      <div className="node-badge">Preceding Memory ({ancestorMemory._id})</div>
                      <p className="node-text">"{ancestorMemory.content}"</p>
                    </div>
                  </div>
                )}
                <div className="lineage-node current-node">
                  <div className="node-icon">
                    <span className="current-marker-dot"></span>
                  </div>
                  <div className="node-content">
                    <div className="node-badge current-badge">Current Document ({memory._id})</div>
                    <p className="node-text font-semibold">"{memory.content}"</p>
                  </div>
                </div>
                {supersededByMemory && (
                  <div className="lineage-node child-node">
                    <div className="node-icon">
                      <ArrowRight size={14} className="text-emerald" />
                    </div>
                    <div className="node-content">
                      <div className="node-badge successor-badge">
                        Superseded By Active ({supersededByMemory._id})
                      </div>
                      <p className="node-text">"{supersededByMemory.content}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Technical Metadata Grid */}
          <div className="detail-section">
            <div className="section-title-label">DOCUMENT ATTRIBUTES</div>
            <div className="detail-meta-grid">
              <div className="meta-grid-item">
                <span className="meta-item-title">Created Timestamp</span>
                <span className="meta-item-value">{formatDateTime(memory.created_at)}</span>
              </div>
              <div className="meta-grid-item">
                <span className="meta-item-title">TTL Expiration</span>
                <span className="meta-item-value">
                  {memory.expires_at ? formatDateTime(memory.expires_at) : 'No TTL (Permanent)'}
                </span>
              </div>
              <div className="meta-grid-item">
                <span className="meta-item-title">User ID / Session</span>
                <span className="meta-item-value font-mono">{memory.user_id}</span>
              </div>
              <div className="meta-grid-item">
                <span className="meta-item-title">Privacy Boundary</span>
                <span className="meta-item-value">
                  {memory.is_private ? 'Shielded (LLM Excluded)' : 'Public (Vector Eligible)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="modal-footer detail-modal-footer">
          <div className="footer-left-actions">
            <button
              className="action-btn delete-btn"
              onClick={() => {
                handleDeleteMemory(memory._id);
                setMemoryDetailModalTarget(null);
              }}
              title="Delete memory permanently"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>

          <div className="footer-right-actions">
            <button
              className="action-btn secondary-btn"
              onClick={() => handleTogglePrivacy(memory._id, memory.is_private)}
              title={memory.is_private ? 'Make eligible for vector recall' : 'Shield memory from AI'}
            >
              {memory.is_private ? <Unlock size={14} /> : <Lock size={14} />}
              <span>{memory.is_private ? 'Unhide Memory' : 'Make Private'}</span>
            </button>

            <button
              className="action-btn secondary-btn"
              onClick={() => {
                setExpiryModalTarget(memory);
                setMemoryDetailModalTarget(null);
              }}
              title="Configure Time-to-Live (TTL)"
            >
              <Clock size={14} />
              <span>Set Expiry</span>
            </button>

            <button
              className="action-btn primary-btn"
              onClick={() => {
                setSupersedeModalTarget(memory);
                setMemoryDetailModalTarget(null);
              }}
              title="Supersede memory with updated knowledge"
            >
              <GitBranch size={14} />
              <span>Supersede</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
