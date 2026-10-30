import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GitBranch, X, Check, Quote, AlertCircle } from 'lucide-react';

export default function SupersedeModal() {
  const { supersedeModalTarget, setSupersedeModalTarget, handleSupersede } = useApp();
  
  if (!supersedeModalTarget) return null;

  const [newContent, setNewContent] = useState(
    supersedeModalTarget.content || ''
  );
  const [newType, setNewType] = useState(supersedeModalTarget.type || 'feeling');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    handleSupersede(supersedeModalTarget._id, newContent.trim(), newType);
  };

  return (
    <div className="modal-backdrop" onClick={() => setSupersedeModalTarget(null)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge">
              <GitBranch size={16} />
            </div>
            <div>
              <h3 className="modal-title">Correct & Supersede Memory</h3>
              <p className="modal-subtitle">Update your understanding while preserving history</p>
            </div>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={() => setSupersedeModalTarget(null)}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Original Memory Reference */}
            <div className="original-memory-preview">
              <div className="preview-label">Original Active Memory ({supersedeModalTarget._id}):</div>
              <p className="preview-content">{supersedeModalTarget.content}</p>
              <div className="preview-quote">
                <Quote size={12} />
                <span>Source: "{supersedeModalTarget.source_quote}"</span>
              </div>
            </div>

            {/* Architecture Explainer */}
            <div className="modal-info-alert">
              <AlertCircle size={14} className="text-emerald" />
              <span>
                <strong>Agentic Memory Evolution:</strong> The original memory document will be marked as <code>superseded</code> and retained in your timeline. A new active memory linked via <code>supersedes_id</code> will be created for future vector recall.
              </span>
            </div>

            {/* New Memory Input */}
            <div className="form-group">
              <label className="form-label">Updated Content / New Understanding:</label>
              <textarea 
                className="form-textarea"
                rows={3}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Describe the corrected or updated understanding..."
                required
              />
            </div>

            {/* Type selector */}
            <div className="form-group">
              <label className="form-label">Memory Type:</label>
              <select 
                className="form-select"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              >
                <option value="feeling">FEELING (Emotional experience)</option>
                <option value="belief">BELIEF (Core mindset / conviction)</option>
                <option value="event">EVENT (Factual occurrence)</option>
                <option value="decision">DECISION (Choice / resolution)</option>
                <option value="preference">PREFERENCE (Personal liking / style)</option>
                <option value="goal">GOAL (Target milestone)</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="action-btn secondary-btn"
              onClick={() => setSupersedeModalTarget(null)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="action-btn primary-btn"
            >
              <GitBranch size={14} />
              <span>Supersede & Create Active Memory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
