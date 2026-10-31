import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sliders, 
  X, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Database, 
  Code2, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export default function ApiSettingsModal() {
  const { 
    isApiSettingsOpen, 
    setIsApiSettingsOpen, 
    apiConfig, 
    handleUpdateConfig,
    backendStatus,
    checkBackendHealth,
    showToast
  } = useApp();

  const [baseUrlInput, setBaseUrlInput] = useState(apiConfig.baseUrl);
  const [modeInput, setModeInput] = useState(apiConfig.mode);
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isApiSettingsOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    handleUpdateConfig({
      baseUrl: baseUrlInput.trim(),
      mode: modeInput
    });
  };

  const handleTest = async () => {
    const success = await checkBackendHealth(baseUrlInput.trim());
    if (success) {
      showToast('Successfully reached backend API server!', 'success');
    } else {
      showToast('Could not reach backend API at ' + baseUrlInput, 'error');
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleContract = `// POST /api/chat
// Request: { message: "I feel like my friends don't value my efforts.", mode: "journal", user_id: "user_123" }
// Response:
{
  "success": true,
  "reply": "I've extracted a structured FEELING memory...",
  "extractedMemories": [
    {
      "_id": "mem_001",
      "user_id": "user_123",
      "entry_id": "entry_045",
      "type": "feeling",
      "content": "Feels hurt and uncared for in a friendship.",
      "source_quote": "I told her it was fine, but honestly, I'm really hurt.",
      "status": "active",
      "is_private": false,
      "expires_at": null,
      "supersedes_id": null
    }
  ]
}`;

  return (
    <div className="modal-backdrop" onClick={() => setIsApiSettingsOpen(false)}>
      <div className="modal-card wide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge">
              <Database size={16} />
            </div>
            <div>
              <h3 className="modal-title">Backend & API Integration</h3>
              <p className="modal-subtitle">Connect your friend's backend or inspect the API contract</p>
            </div>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={() => setIsApiSettingsOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Connection status banner */}
          <div className={`connection-status-card ${backendStatus.isConnected ? 'status-ok' : 'status-offline'}`}>
            <div className="status-indicator-col">
              {backendStatus.isConnected ? (
                <CheckCircle2 size={24} className="text-emerald" />
              ) : (
                <XCircle size={24} className="text-amber" />
              )}
            </div>
            <div className="status-info-col">
              <div className="status-headline">
                {backendStatus.isConnected ? 'Backend Server Online & Connected' : 'Standalone / Mock Mode Active'}
              </div>
              <p className="status-subtext">
                {backendStatus.isConnected 
                  ? `Successfully responding at ${baseUrlInput}. Real MongoDB Atlas pipeline active.` 
                  : `Backend at "${baseUrlInput}" is not responding yet. ECHO is running using the local Agentic Memory Engine so you can develop & demo without interruption.`}
              </p>
              {backendStatus.lastChecked && (
                <div className="status-timestamp">Last tested: {backendStatus.lastChecked}</div>
              )}
            </div>
            <button 
              type="button" 
              className="action-btn secondary-btn"
              onClick={handleTest}
              disabled={backendStatus.checking}
            >
              <RefreshCw size={13} className={backendStatus.checking ? 'spin' : ''} />
              <span>{backendStatus.checking ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="api-config-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Backend API Base URL:</label>
                <input 
                  type="text" 
                  className="form-input font-mono"
                  value={baseUrlInput}
                  onChange={(e) => setBaseUrlInput(e.target.value)}
                  placeholder="http://localhost:5000/api"
                  required
                />
                <span className="input-tip">
                  Default: <code>http://localhost:5000/api</code> (or <code>/api</code> if using reverse proxy)
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Operation Mode:</label>
                <select 
                  className="form-select"
                  value={modeInput}
                  onChange={(e) => setModeInput(e.target.value)}
                >
                  <option value="auto">Auto-detect (Use Live if server online, fallback to Mock)</option>
                  <option value="live">Strict Live (Require backend server)</option>
                  <option value="mock">Standalone Mock Engine (Local hackathon demo mode)</option>
                </select>
                <span className="input-tip">
                  Use "Auto-detect" so the frontend works both before and after your friend launches the backend!
                </span>
              </div>
            </div>

            <div className="form-actions-right">
              <button type="submit" className="action-btn primary-btn">
                Save Settings
              </button>
            </div>
          </form>

          {/* API Contract Reference for Friend */}
          <div className="api-contract-section">
            <div className="contract-header">
              <div className="contract-title">
                <Code2 size={15} className="text-emerald" />
                <span>Backend API Contract (For your teammate building Node/Express)</span>
              </div>
              <button 
                className="copy-snippet-btn"
                onClick={() => copyToClipboard(sampleContract, 'sample')}
              >
                {copiedKey === 'sample' ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedKey === 'sample' ? 'Copied' : 'Copy Spec'}</span>
              </button>
            </div>

            <div className="endpoints-table">
              <div className="endpoint-row">
                <span className="http-method post">POST</span>
                <span className="endpoint-path">/api/chat</span>
                <span className="endpoint-desc">Accepts <code>message</code> & <code>mode</code>. Ingests journal entry or returns vector recall.</span>
              </div>
              <div className="endpoint-row">
                <span className="http-method get">GET</span>
                <span className="endpoint-path">/api/memories</span>
                <span className="endpoint-desc">Lists memories with optional <code>?status=active&type=feeling</code> filters.</span>
              </div>
              <div className="endpoint-row">
                <span className="http-method patch">PATCH</span>
                <span className="endpoint-path">/api/memories/:id</span>
                <span className="endpoint-desc">Supersedes memory, toggles privacy (<code>is_private</code>), or sets TTL <code>expires_at</code>.</span>
              </div>
              <div className="endpoint-row">
                <span className="http-method delete">DELETE</span>
                <span className="endpoint-path">/api/memories/:id</span>
                <span className="endpoint-desc">Permanently deletes memory from MongoDB Atlas.</span>
              </div>
              <div className="endpoint-row">
                <span className="http-method get">GET</span>
                <span className="endpoint-path">/api/memory-events</span>
                <span className="endpoint-desc">Returns audit events for the system event stream.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="action-btn secondary-btn"
            onClick={() => setIsApiSettingsOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
