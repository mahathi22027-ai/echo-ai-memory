import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Search,
  BrainCircuit,
  Lock,
  Clock,
  GitBranch,
  PlusCircle,
  ArrowRight
} from 'lucide-react';

export default function QuickMemoryDrawer() {
  const {
    isQuickInspectorOpen,
    setIsQuickInspectorOpen,
    memories,
    openMemoryDetail,
    setActivePage,
    setIsNewMemoryModalOpen
  } = useApp();

  const [query, setQuery] = useState('');

  if (!isQuickInspectorOpen) return null;

  const filtered = memories.filter((m) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      m.content.toLowerCase().includes(q) ||
      m.source_quote.toLowerCase().includes(q) ||
      m.type.toLowerCase().includes(q) ||
      m._id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="drawer-backdrop" onClick={() => setIsQuickInspectorOpen(false)}>
      <aside className="quick-memory-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-row">
            <div className="drawer-icon-wrap">
              <BrainCircuit size={18} className="text-indigo" />
            </div>
            <div>
              <h3 className="drawer-title">Quick Memory Peek</h3>
              <p className="drawer-subtitle">
                {memories.length} memories in vector store
              </p>
            </div>
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => setIsQuickInspectorOpen(false)}
            title="Close drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="drawer-toolbar">
          <div className="drawer-search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="drawer-search-input"
              placeholder="Search memories by keyword..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="clear-btn" onClick={() => setQuery('')}>
                <X size={12} />
              </button>
            )}
          </div>
          <button
            className="drawer-add-btn"
            onClick={() => {
              setIsQuickInspectorOpen(false);
              setIsNewMemoryModalOpen(true);
            }}
            title="Add new memory"
          >
            <PlusCircle size={15} />
          </button>
        </div>

        {/* Memories List */}
        <div className="drawer-content-list">
          {filtered.length === 0 ? (
            <div className="drawer-empty-state">
              <BrainCircuit size={28} className="empty-icon text-muted" />
              <p>No matching memories found</p>
            </div>
          ) : (
            filtered.map((m) => (
              <div
                key={m._id}
                className={`drawer-memory-card type-border-${m.type}`}
                onClick={() => {
                  openMemoryDetail(m);
                }}
              >
                <div className="card-top-row">
                  <span className={`drawer-type-tag type-${m.type}`}>
                    {m.type.toUpperCase()}
                  </span>
                  <span className="drawer-mem-id font-mono">{m._id}</span>
                  {m.is_private ? (
                    <span className="privacy-pill-small" title="Private">
                      <Lock size={10} />
                    </span>
                  ) : m.status === 'superseded' ? (
                    <span className="superseded-pill-small" title="Superseded">
                      <GitBranch size={10} />
                    </span>
                  ) : m.status === 'expired' ? (
                    <span className="expired-pill-small" title="Expired">
                      <Clock size={10} />
                    </span>
                  ) : (
                    <span className="active-pill-small" title="Active">
                      <span className="active-dot"></span>
                    </span>
                  )}
                </div>
                <p className="drawer-card-content">{m.content}</p>
                <div className="drawer-card-footer">
                  <span className="click-inspect-hint">Click for full inspection & actions</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          <button
            className="drawer-full-page-btn"
            onClick={() => {
              setIsQuickInspectorOpen(false);
              setActivePage('memories');
            }}
          >
            <span>Open Dedicated Memory Vault</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </aside>
    </div>
  );
}
