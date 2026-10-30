import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Activity, 
  PlusCircle, 
  GitBranch, 
  Lock, 
  Unlock, 
  Trash2, 
  Search, 
  Clock, 
  Filter, 
  Sparkles, 
  CheckCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function SystemLogPanel() {
  const { events, refreshAllData, setHighlightedMemoryId, setActiveTabMobile } = useApp();
  const [selectedEventType, setSelectedEventType] = useState('all');

  const getEventIcon = (type) => {
    switch (type) {
      case 'memory_created':
        return <PlusCircle size={14} className="text-emerald" />;
      case 'memory_superseded':
        return <GitBranch size={14} className="text-purple" />;
      case 'memory_marked_private':
        return <Lock size={14} className="text-amber" />;
      case 'memory_unhidden':
        return <Unlock size={14} className="text-cyan" />;
      case 'memory_deleted':
        return <Trash2 size={14} className="text-rose" />;
      case 'vector_recall':
        return <Search size={14} className="text-blue" />;
      case 'memory_expired':
      case 'memory_expiry_configured':
        return <Clock size={14} className="text-amber" />;
      default:
        return <Activity size={14} className="text-slate" />;
    }
  };

  const getEventLabel = (type) => {
    switch (type) {
      case 'memory_created': return 'Memory Created';
      case 'memory_superseded': return 'Memory Superseded';
      case 'memory_marked_private': return 'Marked Private';
      case 'memory_unhidden': return 'Unhidden (Public)';
      case 'memory_deleted': return 'Memory Deleted';
      case 'vector_recall': return 'Vector Recall Executed';
      case 'memory_expired': return 'Memory Expired (TTL)';
      case 'memory_expiry_configured': return 'TTL Configured';
      default: return type.replace(/_/g, ' ');
    }
  };

  const filteredEvents = selectedEventType === 'all'
    ? events
    : events.filter(e => e.event_type === selectedEventType);

  const handleEventMemoryClick = (memId) => {
    if (!memId || memId === 'none') return;
    setHighlightedMemoryId(memId);
    setActiveTabMobile('inspector');
  };

  return (
    <div className="panel log-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title-group">
          <div className="panel-title-icon-wrapper log-color">
            <Activity size={16} />
          </div>
          <div>
            <h2 className="panel-title">System Audit Log</h2>
            <p className="panel-description">Non-sensitive lifecycle & vector event stream</p>
          </div>
        </div>
        <button 
          className="icon-refresh-btn" 
          onClick={refreshAllData} 
          title="Refresh audit events from MongoDB"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Log Filter Pills */}
      <div className="log-filter-bar">
        <button 
          className={`log-filter-chip ${selectedEventType === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedEventType('all')}
        >
          All Events ({events.length})
        </button>
        <button 
          className={`log-filter-chip ${selectedEventType === 'vector_recall' ? 'active' : ''}`}
          onClick={() => setSelectedEventType('vector_recall')}
        >
          Vector Recall
        </button>
        <button 
          className={`log-filter-chip ${selectedEventType === 'memory_superseded' ? 'active' : ''}`}
          onClick={() => setSelectedEventType('memory_superseded')}
        >
          Superseded
        </button>
        <button 
          className={`log-filter-chip ${selectedEventType === 'memory_marked_private' ? 'active' : ''}`}
          onClick={() => setSelectedEventType('memory_marked_private')}
        >
          Privacy
        </button>
      </div>

      {/* Events List */}
      <div className="events-stream-container">
        {filteredEvents.length === 0 ? (
          <div className="empty-log-state">
            <Activity size={28} className="empty-icon" />
            <p>No audit events match this filter</p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const timeStr = new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            return (
              <div key={evt._id} className="audit-event-item">
                <div className="event-icon-badge">
                  {getEventIcon(evt.event_type)}
                </div>

                <div className="event-details">
                  <div className="event-header-row">
                    <span className="event-type-name">
                      {getEventLabel(evt.event_type)}
                    </span>
                    <span className="event-timestamp">{timeStr}</span>
                  </div>

                  {/* Memory ID Link */}
                  {evt.memory_id && evt.memory_id !== 'none' && (
                    <div className="event-memory-link">
                      <span className="event-label">Memory:</span>
                      <button 
                        className="event-id-btn"
                        onClick={() => handleEventMemoryClick(evt.memory_id)}
                        title="Highlight memory in inspector"
                      >
                        {evt.memory_id}
                      </button>
                    </div>
                  )}

                  {/* Metadata key-values (strictly non-sensitive) */}
                  {evt.metadata && (
                    <div className="event-metadata-box">
                      {evt.metadata.type && (
                        <span className="meta-pill meta-type">type: {evt.metadata.type}</span>
                      )}
                      {evt.metadata.top_similarity_score !== undefined && (
                        <span className="meta-pill meta-score">
                          similarity: {Math.round(evt.metadata.top_similarity_score * 100)}%
                        </span>
                      )}
                      {evt.metadata.private_excluded_count > 0 && (
                        <span className="meta-pill meta-private">
                          private shielded: {evt.metadata.private_excluded_count}
                        </span>
                      )}
                      {evt.metadata.superseded_memory_id && (
                        <span className="meta-pill meta-superseded">
                          replaces: {evt.metadata.superseded_memory_id}
                        </span>
                      )}
                      {evt.metadata.ttl_configured && (
                        <span className="meta-pill meta-ttl">
                          ttl: {evt.metadata.ttl_configured}
                        </span>
                      )}
                      {evt.metadata.note && (
                        <span className="meta-note">{evt.metadata.note}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="log-footer-privacy-note">
        <ShieldCheck size={12} className="text-emerald" />
        <span>Privacy Notice: Raw journal text is excluded from the audit log per security specifications.</span>
      </div>
    </div>
  );
}
