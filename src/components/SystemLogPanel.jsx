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
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronRight,
  Database,
  BarChart3
} from 'lucide-react';

export default function SystemLogPanel() {
  const { events, refreshAllData, setHighlightedMemoryId, openMemoryDetail, activePage } = useApp();
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [expandedEventId, setExpandedEventId] = useState(null);

  const getEventIcon = (type) => {
    switch (type) {
      case 'memory_created':
        return <PlusCircle size={15} className="text-emerald" />;
      case 'memory_superseded':
        return <GitBranch size={15} className="text-purple" />;
      case 'memory_marked_private':
        return <Lock size={15} className="text-amber" />;
      case 'memory_unhidden':
        return <Unlock size={15} className="text-cyan" />;
      case 'memory_deleted':
        return <Trash2 size={15} className="text-rose" />;
      case 'vector_recall':
        return <Search size={15} className="text-blue" />;
      case 'memory_expired':
      case 'memory_expiry_configured':
        return <Clock size={15} className="text-amber" />;
      default:
        return <Activity size={15} className="text-slate" />;
    }
  };

  const getEventLabel = (type) => {
    switch (type) {
      case 'memory_created': return 'Memory Ingested';
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

  const createdCount = events.filter(e => e.event_type === 'memory_created').length;
  const supersededCount = events.filter(e => e.event_type === 'memory_superseded').length;
  const recallCount = events.filter(e => e.event_type === 'vector_recall').length;
  const privacyCount = events.filter(e => e.event_type === 'memory_marked_private' || e.event_type === 'memory_unhidden').length;

  const handleEventMemoryClick = (memId) => {
    if (!memId || memId === 'none') return;
    setHighlightedMemoryId(memId);
    openMemoryDetail(memId);
  };

  const toggleExpand = (id) => {
    setExpandedEventId(prev => (prev === id ? null : id));
  };

  return (
    <div className={`panel log-panel ${activePage === 'analytics' ? 'fullpage-analytics' : ''}`}>
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title-group">
          <div className="panel-title-icon-wrapper log-color">
            <Activity size={18} />
          </div>
          <div>
            <h2 className="panel-title">System Audit Log & Analytics</h2>
            <p className="panel-description">Non-sensitive lifecycle, evolution & vector event stream</p>
          </div>
        </div>
        <button 
          className="icon-refresh-btn" 
          onClick={refreshAllData} 
          title="Refresh audit events from MongoDB Atlas"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top Metrics Cards (when in analytics page or wide view) */}
      <div className="analytics-metrics-overview">
        <div className="analytics-metric-card">
          <div className="metric-icon-wrap stat-purple">
            <Activity size={16} />
          </div>
          <div className="metric-data">
            <span className="metric-number">{events.length}</span>
            <span className="metric-label">Total Audit Events</span>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="metric-icon-wrap stat-emerald">
            <PlusCircle size={16} />
          </div>
          <div className="metric-data">
            <span className="metric-number">{createdCount}</span>
            <span className="metric-label">Ingested Knowledge</span>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="metric-icon-wrap stat-blue">
            <Search size={16} />
          </div>
          <div className="metric-data">
            <span className="metric-number">{recallCount}</span>
            <span className="metric-label">Vector Recalls ($vectorSearch)</span>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="metric-icon-wrap stat-amber">
            <ShieldCheck size={16} />
          </div>
          <div className="metric-data">
            <span className="metric-number">{privacyCount}</span>
            <span className="metric-label">Privacy Guard Actions</span>
          </div>
        </div>
      </div>

      {/* Log Filter Pills */}
      <div className="log-filter-bar">
        {[
          { id: 'all', label: `All Events (${events.length})` },
          { id: 'vector_recall', label: `Vector Recalls (${recallCount})` },
          { id: 'memory_created', label: `Ingested (${createdCount})` },
          { id: 'memory_superseded', label: `Superseded (${supersededCount})` },
          { id: 'memory_marked_private', label: 'Privacy Changes' }
        ].map(filter => (
          <button 
            key={filter.id}
            className={`log-filter-chip ${selectedEventType === filter.id ? 'active' : ''}`}
            onClick={() => setSelectedEventType(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="events-stream-container">
        {filteredEvents.length === 0 ? (
          <div className="empty-log-state">
            <Activity size={36} className="empty-icon text-muted" />
            <p className="empty-title">No audit events match this filter</p>
            <p className="empty-sub">Interact with the journal or execute a demo step to generate events.</p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const timeDate = new Date(evt.timestamp);
            const timeStr = timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const dateStr = timeDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
            const isExpanded = expandedEventId === evt._id;

            return (
              <div key={evt._id} className="audit-event-item">
                <div className="event-icon-badge">
                  {getEventIcon(evt.event_type)}
                </div>

                <div className="event-details">
                  <div className="event-header-row">
                    <div className="event-title-group">
                      <span className="event-type-name">
                        {getEventLabel(evt.event_type)}
                      </span>
                      {evt.memory_id && evt.memory_id !== 'none' && (
                        <button
                          className="event-memory-pill"
                          onClick={() => handleEventMemoryClick(evt.memory_id)}
                          title="Click to view memory popup"
                        >
                          <Eye size={11} />
                          <span>{evt.memory_id}</span>
                        </button>
                      )}
                    </div>
                    <span className="event-timestamp">
                      {dateStr} {timeStr}
                    </span>
                  </div>

                  {/* Metadata preview summary */}
                  {evt.metadata && (
                    <div className="event-meta-summary">
                      {evt.metadata.type && (
                        <span className="meta-tag type-tag">
                          Type: {evt.metadata.type}
                        </span>
                      )}
                      {evt.metadata.policy && (
                        <span className="meta-tag policy-tag">
                          Policy: {evt.metadata.policy}
                        </span>
                      )}
                      {evt.metadata.reason && (
                        <span className="meta-tag reason-tag">
                          {evt.metadata.reason}
                        </span>
                      )}
                      {evt.metadata.note && (
                        <span className="meta-tag note-tag">
                          {evt.metadata.note}
                        </span>
                      )}
                      {evt.metadata.query_preview && (
                        <span className="meta-tag query-tag">
                          Query: "{evt.metadata.query_preview}"
                        </span>
                      )}
                    </div>
                  )}

                  {/* Collapsible raw metadata toggle */}
                  {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                    <div className="event-expand-wrap">
                      <button
                        className="event-expand-btn"
                        onClick={() => toggleExpand(evt._id)}
                      >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        <span>{isExpanded ? 'Hide Raw JSON Payload' : 'Inspect JSON Payload'}</span>
                      </button>
                      {isExpanded && (
                        <pre className="event-json-dump">
                          {JSON.stringify(evt.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
