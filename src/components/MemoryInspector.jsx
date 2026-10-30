import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Layers, 
  Search, 
  Filter, 
  Lock, 
  Unlock, 
  Clock, 
  GitBranch, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Quote, 
  AlertCircle,
  CheckCircle,
  History,
  Tag
} from 'lucide-react';

export default function MemoryInspector() {
  const { 
    filteredMemories, 
    memories,
    activeStatusFilter, 
    setActiveStatusFilter,
    activeTypeFilter, 
    setActiveTypeFilter,
    searchQuery, 
    setSearchQuery,
    highlightedMemoryId,
    setHighlightedMemoryId,
    setSupersedeModalTarget,
    setExpiryModalTarget,
    handleTogglePrivacy,
    handleDeleteMemory
  } = useApp();

  const statuses = [
    { key: 'all', label: 'All', count: memories.length },
    { key: 'active', label: 'Active', count: memories.filter(m => m.status === 'active').length },
    { key: 'superseded', label: 'Superseded', count: memories.filter(m => m.status === 'superseded').length },
    { key: 'private', label: 'Private', count: memories.filter(m => m.is_private).length },
    { key: 'expired', label: 'Expired', count: memories.filter(m => m.status === 'expired').length }
  ];

  const types = ['all', 'feeling', 'belief', 'event', 'decision', 'preference', 'goal'];

  // Status color helpers
  const getStatusBadge = (memory) => {
    if (memory.status === 'expired') {
      return (
        <span className="memory-status-badge badge-expired">
          <Clock size={11} /> Expired (TTL)
        </span>
      );
    }
    if (memory.is_private) {
      return (
        <span className="memory-status-badge badge-private">
          <Lock size={11} /> Private (Excluded)
        </span>
      );
    }
    if (memory.status === 'superseded') {
      return (
        <span className="memory-status-badge badge-superseded">
          <History size={11} /> Superseded
        </span>
      );
    }
    return (
      <span className="memory-status-badge badge-active">
        <span className="active-dot"></span> Active
      </span>
    );
  };

  const getTypeColorClass = (type) => {
    switch (type.toLowerCase()) {
      case 'feeling': return 'type-feeling';
      case 'belief': return 'type-belief';
      case 'decision': return 'type-decision';
      case 'preference': return 'type-preference';
      case 'goal': return 'type-goal';
      case 'event': return 'type-event';
      default: return 'type-default';
    }
  };

  // Expiry time display helper
  const getExpiryDisplay = (expiresAt) => {
    if (!expiresAt) return null;
    const expDate = new Date(expiresAt);
    const now = new Date();
    const diffMs = expDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return <span className="expiry-tag expired">Expired at {expDate.toLocaleTimeString()}</span>;
    }
    const diffSec = Math.round(diffMs / 1000);
    if (diffSec < 60) {
      return <span className="expiry-tag expiring-soon">Expires in {diffSec}s</span>;
    }
    const diffMin = Math.round(diffSec / 60);
    if (diffMin < 60) {
      return <span className="expiry-tag">Expires in {diffMin}m</span>;
    }
    return <span className="expiry-tag">Expires {expDate.toLocaleDateString()}</span>;
  };

  return (
    <div className="panel inspector-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title-group">
          <div className="panel-title-icon-wrapper inspector-color">
            <Layers size={16} />
          </div>
          <div>
            <h2 className="panel-title">Memory Inspector</h2>
            <p className="panel-description">Structured, inspectable memories extracted from entries</p>
          </div>
        </div>
        <div className="inspector-counter-pill">
          <span>{filteredMemories.length}</span> / {memories.length} shown
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="inspector-toolbar">
        <div className="search-input-wrapper">
          <Search size={14} className="search-icon" />
          <input 
            type="text"
            className="search-input"
            placeholder="Search memories, quotes, or IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="status-tabs-row">
          {statuses.map(st => (
            <button
              key={st.key}
              className={`status-tab-btn ${activeStatusFilter === st.key ? 'active' : ''}`}
              onClick={() => setActiveStatusFilter(st.key)}
            >
              <span>{st.label}</span>
              <span className="tab-count">{st.count}</span>
            </button>
          ))}
        </div>

        {/* Memory Type Filter Chips */}
        <div className="type-chips-row">
          <span className="type-filter-label">Type:</span>
          {types.map(t => (
            <button
              key={t}
              className={`type-chip-btn ${activeTypeFilter === t ? 'active' : ''} ${getTypeColorClass(t)}`}
              onClick={() => setActiveTypeFilter(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="memory-cards-container">
        {filteredMemories.length === 0 ? (
          <div className="empty-inspector-state">
            <Layers size={36} className="empty-icon" />
            <p className="empty-title">No memories found</p>
            <p className="empty-desc">
              {searchQuery 
                ? `No memories matched "${searchQuery}". Try clearing search filters.` 
                : "Submit a journal entry to extract new structured memories."}
            </p>
            {(activeStatusFilter !== 'all' || activeTypeFilter !== 'all' || searchQuery) && (
              <button 
                className="action-btn secondary-btn"
                onClick={() => {
                  setActiveStatusFilter('all');
                  setActiveTypeFilter('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          filteredMemories.map((mem) => {
            const isHighlighted = highlightedMemoryId === mem._id;
            return (
              <div 
                key={mem._id} 
                id={`card-${mem._id}`}
                className={`memory-card ${isHighlighted ? 'highlighted-card' : ''} ${mem.status === 'superseded' ? 'card-superseded' : ''}`}
                onClick={() => setHighlightedMemoryId(mem._id)}
              >
                {/* Card Top Row: Type & Status Badges */}
                <div className="card-top-row">
                  <div className="card-badges-group">
                    <span className={`memory-type-badge ${getTypeColorClass(mem.type)}`}>
                      {mem.type.toUpperCase()}
                    </span>
                    {getStatusBadge(mem)}
                    {getExpiryDisplay(mem.expires_at)}
                  </div>
                  <span className="memory-id-badge">{mem._id}</span>
                </div>

                {/* Card Content Summary */}
                <div className="memory-content-box">
                  <p className="memory-content-text">{mem.content}</p>
                </div>

                {/* Source Quote Box (Required by Page 4 of Project Plan) */}
                <div className="memory-source-box">
                  <Quote size={13} className="quote-icon" />
                  <p className="memory-source-quote">
                    Source: "{mem.source_quote}"
                  </p>
                </div>

                {/* Status Vocabulary & Retrieval Eligibility Banner */}
                <div className="memory-eligibility-row">
                  {mem.status === 'active' && !mem.is_private && !mem.expires_at && (
                    <span className="eligibility-text eligible">
                      <CheckCircle size={12} /> Visible to memory retrieval
                    </span>
                  )}
                  {mem.is_private && (
                    <span className="eligibility-text private">
                      <ShieldAlert size={12} /> Excluded from AI context (Private boundary)
                    </span>
                  )}
                  {mem.status === 'superseded' && (
                    <span className="eligibility-text superseded">
                      <History size={12} /> Retained for historical audit (superseded)
                    </span>
                  )}
                  {mem.status === 'expired' && (
                    <span className="eligibility-text expired">
                      <Clock size={12} /> Ineligible for recall (Expired; TTL pending)
                    </span>
                  )}
                  {mem.supersedes_id && (
                    <span className="supersedes-link-badge" title={`Corrects and replaces ${mem.supersedes_id}`}>
                      <GitBranch size={11} /> Replaces {mem.supersedes_id}
                    </span>
                  )}
                </div>

                {/* Card Action Buttons (Page 4: actions to correct, hide or delete) */}
                <div className="card-actions-bar">
                  <button 
                    className="card-action-btn edit-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSupersedeModalTarget(mem);
                    }}
                    title="Correct this memory (supersedes old memory and creates new linked memory)"
                  >
                    <Edit3 size={13} />
                    <span>Supersede</span>
                  </button>

                  <button 
                    className={`card-action-btn ${mem.is_private ? 'unhide-action' : 'privacy-action'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePrivacy(mem._id, mem.is_private);
                    }}
                    title={mem.is_private ? "Make Public (Allow in LLM retrieval)" : "Mark Private (Exclude from LLM retrieval)"}
                  >
                    {mem.is_private ? <Unlock size={13} /> : <Lock size={13} />}
                    <span>{mem.is_private ? 'Make Public' : 'Mark Private'}</span>
                  </button>

                  <button 
                    className="card-action-btn expiry-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpiryModalTarget(mem);
                    }}
                    title="Set time-limited expiry (TTL)"
                  >
                    <Clock size={13} />
                    <span>TTL Expiry</span>
                  </button>

                  <button 
                    className="card-action-btn delete-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMemory(mem._id);
                    }}
                    title="Permanently delete from database"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
