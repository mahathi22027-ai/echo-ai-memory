import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Layers, 
  Search, 
  Lock, 
  Unlock, 
  Clock, 
  GitBranch, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  Quote, 
  CheckCircle,
  History,
  PlusCircle,
  LayoutGrid,
  List,
  Eye,
  Database,
  Shield
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
    openMemoryDetail,
    setIsNewMemoryModalOpen,
    handleTogglePrivacy,
    handleDeleteMemory,
    activePage
  } = useApp();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const activeCount = memories.filter(m => m.status === 'active').length;
  const supersededCount = memories.filter(m => m.status === 'superseded').length;
  const privateCount = memories.filter(m => m.is_private).length;
  const expiredCount = memories.filter(m => m.status === 'expired').length;
  const expiringCount = memories.filter(m => m.expires_at && m.status !== 'expired').length;

  const statuses = [
    { key: 'all', label: 'All', count: memories.length },
    { key: 'active', label: 'Active', count: activeCount },
    { key: 'superseded', label: 'Superseded', count: supersededCount },
    { key: 'private', label: 'Private', count: privateCount },
    { key: 'expired', label: 'Expired', count: expiredCount }
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
    const diffMs = expDate.getTime() - Date.now();

    if (diffMs <= 0) {
      return <span className="expiry-tag expired">Expired</span>;
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
    <div className={`panel inspector-panel ${activePage === 'memories' ? 'fullpage-vault' : ''}`}>
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title-group">
          <div className="panel-title-icon-wrapper inspector-color">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="panel-title">
              {activePage === 'memories' ? 'Agentic Memory Vault' : 'Memory Inspector'}
            </h2>
            <p className="panel-description">
              Structured vector documents, provenance quotes & lifecycle boundaries
            </p>
          </div>
        </div>

        <div className="inspector-header-actions">
          {/* View toggle (Grid vs Table) */}
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="List View"
            >
              <List size={14} />
            </button>
          </div>

          {/* Add Memory Button */}
          <button
            className="action-btn primary-btn add-mem-btn"
            onClick={() => setIsNewMemoryModalOpen(true)}
            title="Add a new memory to the vault"
          >
            <PlusCircle size={15} />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Top Stats Overview (visible in full page mode or wide view) */}
      <div className="vault-stats-overview">
        <div className="vault-stat-card">
          <div className="stat-icon-wrap stat-blue">
            <Database size={16} />
          </div>
          <div className="stat-content">
            <span className="stat-metric">{memories.length}</span>
            <span className="stat-title">Total Documents</span>
          </div>
        </div>

        <div className="vault-stat-card">
          <div className="stat-icon-wrap stat-emerald">
            <CheckCircle size={16} />
          </div>
          <div className="stat-content">
            <span className="stat-metric">{activeCount}</span>
            <span className="stat-title">Vector Search Active</span>
          </div>
        </div>

        <div className="vault-stat-card">
          <div className="stat-icon-wrap stat-amber">
            <Shield size={16} />
          </div>
          <div className="stat-content">
            <span className="stat-metric">{privateCount}</span>
            <span className="stat-title">Privacy Shielded</span>
          </div>
        </div>

        <div className="vault-stat-card">
          <div className="stat-icon-wrap stat-purple">
            <GitBranch size={16} />
          </div>
          <div className="stat-content">
            <span className="stat-metric">{supersededCount}</span>
            <span className="stat-title">Superseded Records</span>
          </div>
        </div>

        {expiringCount > 0 && (
          <div className="vault-stat-card">
            <div className="stat-icon-wrap stat-rose">
              <Clock size={16} />
            </div>
            <div className="stat-content">
              <span className="stat-metric">{expiringCount}</span>
              <span className="stat-title">Active TTL Timers</span>
            </div>
          </div>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="inspector-toolbar">
        <div className="search-input-wrapper">
          <Search size={14} className="search-icon" />
          <input 
            type="text"
            className="search-input"
            placeholder="Search memories by keyword, quote, category, or ID..."
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
          <span className="type-filter-label">Filter Type:</span>
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

      {/* Memory Content Container */}
      <div className="memory-cards-container">
        {filteredMemories.length === 0 ? (
          <div className="empty-inspector-state">
            <Layers size={40} className="empty-icon text-muted" />
            <p className="empty-title">No memories found</p>
            <p className="empty-desc">
              {searchQuery 
                ? `No memories matched "${searchQuery}". Try clearing search filters.` 
                : "Add a memory via chat or click 'Add Memory' above to begin building your vault."}
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
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="vault-table-wrapper">
            <table className="vault-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Extracted Knowledge</th>
                  <th>Status</th>
                  <th>Provenance Quote</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMemories.map((mem) => (
                  <tr
                    key={mem._id}
                    className={`vault-table-row ${highlightedMemoryId === mem._id ? 'highlighted-row' : ''}`}
                    onClick={() => openMemoryDetail(mem)}
                  >
                    <td className="font-mono mem-id-cell">{mem._id}</td>
                    <td>
                      <span className={`memory-type-badge ${getTypeColorClass(mem.type)}`}>
                        {mem.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="content-cell">{mem.content}</td>
                    <td>{getStatusBadge(mem)}</td>
                    <td className="quote-cell">"{mem.source_quote}"</td>
                    <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                      <div className="table-actions-inline">
                        <button
                          className="table-action-icon inspect-action"
                          onClick={() => openMemoryDetail(mem)}
                          title="Inspect Memory Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="table-action-icon"
                          onClick={() => setSupersedeModalTarget(mem)}
                          title="Supersede"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="table-action-icon"
                          onClick={() => handleTogglePrivacy(mem._id, mem.is_private)}
                          title={mem.is_private ? "Make Public" : "Mark Private"}
                        >
                          {mem.is_private ? <Unlock size={14} /> : <Lock size={14} />}
                        </button>
                        <button
                          className="table-action-icon delete-action"
                          onClick={() => handleDeleteMemory(mem._id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View Cards */
          <div className="vault-grid-layout">
            {filteredMemories.map((mem) => {
              const isHighlighted = highlightedMemoryId === mem._id;
              return (
                <div 
                  key={mem._id} 
                  id={`card-${mem._id}`}
                  className={`memory-card ${isHighlighted ? 'highlighted-card' : ''} ${mem.status === 'superseded' ? 'card-superseded' : ''}`}
                  onClick={() => {
                    setHighlightedMemoryId(mem._id);
                    openMemoryDetail(mem);
                  }}
                  title="Click card to open full inspection popup"
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
                    <span className="memory-id-badge font-mono">{mem._id}</span>
                  </div>

                  {/* Card Content Summary */}
                  <div className="memory-content-box">
                    <p className="memory-content-text">{mem.content}</p>
                  </div>

                  {/* Source Quote Box */}
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
                        <CheckCircle size={12} /> Eligible for vector recall
                      </span>
                    )}
                    {mem.is_private && (
                      <span className="eligibility-text private">
                        <ShieldAlert size={12} /> Shielded from AI context
                      </span>
                    )}
                    {mem.status === 'superseded' && (
                      <span className="eligibility-text superseded">
                        <History size={12} /> Retained in history (superseded)
                      </span>
                    )}
                    {mem.status === 'expired' && (
                      <span className="eligibility-text expired">
                        <Clock size={12} /> Expired; excluded from search
                      </span>
                    )}
                    {mem.supersedes_id && (
                      <span className="supersedes-link-badge" title={`Corrects and replaces ${mem.supersedes_id}`}>
                        <GitBranch size={11} /> Replaces {mem.supersedes_id}
                      </span>
                    )}
                  </div>

                  {/* Card Action Buttons */}
                  <div className="card-actions-bar" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="card-action-btn inspect-action"
                      onClick={() => openMemoryDetail(mem)}
                      title="Inspect full details, vector embeddings & lineage"
                    >
                      <Eye size={13} />
                      <span>Details</span>
                    </button>

                    <button 
                      className="card-action-btn edit-action"
                      onClick={() => setSupersedeModalTarget(mem)}
                      title="Correct this memory (supersedes old memory and creates new linked memory)"
                    >
                      <Edit3 size={13} />
                      <span>Supersede</span>
                    </button>

                    <button 
                      className={`card-action-btn ${mem.is_private ? 'unhide-action' : 'privacy-action'}`}
                      onClick={() => handleTogglePrivacy(mem._id, mem.is_private)}
                      title={mem.is_private ? "Make Public (Allow in LLM retrieval)" : "Mark Private (Exclude from LLM retrieval)"}
                    >
                      {mem.is_private ? <Unlock size={13} /> : <Lock size={13} />}
                      <span>{mem.is_private ? 'Public' : 'Private'}</span>
                    </button>

                    <button 
                      className="card-action-btn expiry-action"
                      onClick={() => setExpiryModalTarget(mem)}
                      title="Set time-limited expiry (TTL)"
                    >
                      <Clock size={13} />
                      <span>TTL</span>
                    </button>

                    <button 
                      className="card-action-btn delete-action"
                      onClick={() => handleDeleteMemory(mem._id)}
                      title="Permanently delete from database"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
