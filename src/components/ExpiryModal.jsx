import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, X, Zap, Calendar, AlertTriangle } from 'lucide-react';

export default function ExpiryModal() {
  const { expiryModalTarget, setExpiryModalTarget, handleSetExpiry } = useApp();

  if (!expiryModalTarget) return null;

  const [customDateTime, setCustomDateTime] = useState('');

  const handlePreset = (seconds) => {
    const expiresAt = new Date(Date.now() + seconds * 1000).toISOString();
    handleSetExpiry(expiryModalTarget._id, expiresAt);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customDateTime) return;
    const expiresAt = new Date(customDateTime).toISOString();
    handleSetExpiry(expiryModalTarget._id, expiresAt);
  };

  const handleClearExpiry = () => {
    handleSetExpiry(expiryModalTarget._id, null);
  };

  return (
    <div className="modal-backdrop" onClick={() => setExpiryModalTarget(null)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge amber-badge">
              <Clock size={16} />
            </div>
            <div>
              <h3 className="modal-title">Configure Time-to-Live (TTL)</h3>
              <p className="modal-subtitle">Set memory lifespan for automatic exclusion and deletion</p>
            </div>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={() => setExpiryModalTarget(null)}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="original-memory-preview">
            <div className="preview-label">Target Memory ({expiryModalTarget._id}):</div>
            <p className="preview-content">{expiryModalTarget.content}</p>
          </div>

          <div className="modal-info-alert">
            <AlertTriangle size={14} className="text-amber" />
            <span>
              <strong>MongoDB TTL & Application Guard:</strong> Once expired, application logic immediately filters this memory out from semantic search. MongoDB Atlas background TTL worker deletes it asynchronously.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Quick Demo Presets:</label>
            <div className="presets-grid">
              <button 
                type="button" 
                className="preset-btn highlight-preset"
                onClick={() => handlePreset(15)}
              >
                <Zap size={14} className="text-amber" />
                <span>15 Seconds</span>
                <span className="preset-sub">Ideal for Judge Demo</span>
              </button>
              <button 
                type="button" 
                className="preset-btn"
                onClick={() => handlePreset(60)}
              >
                <span>1 Minute</span>
                <span className="preset-sub">Quick test</span>
              </button>
              <button 
                type="button" 
                className="preset-btn"
                onClick={() => handlePreset(3600)}
              >
                <span>1 Hour</span>
                <span className="preset-sub">Temporary focus</span>
              </button>
              <button 
                type="button" 
                className="preset-btn"
                onClick={() => handlePreset(86400 * 7)}
              >
                <span>7 Days</span>
                <span className="preset-sub">Weekly goal</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleCustomSubmit} className="custom-date-form">
            <label className="form-label">Or Pick Custom Date/Time:</label>
            <div className="custom-input-row">
              <input 
                type="datetime-local" 
                className="form-input"
                value={customDateTime}
                onChange={(e) => setCustomDateTime(e.target.value)}
              />
              <button type="submit" className="action-btn secondary-btn" disabled={!customDateTime}>
                Set Custom
              </button>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          {expiryModalTarget.expires_at && (
            <button 
              type="button" 
              className="action-btn delete-btn"
              onClick={handleClearExpiry}
            >
              Clear Expiry (Keep Forever)
            </button>
          )}
          <button 
            type="button" 
            className="action-btn secondary-btn"
            onClick={() => setExpiryModalTarget(null)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
