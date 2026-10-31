import React from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  BrainCircuit,
  Activity,
  Columns,
  PlusCircle,
  Eye,
  PlayCircle,
  RotateCcw,
  Sun,
  Moon,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const {
    activePage,
    setActivePage,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    theme,
    toggleTheme,
    memories,
    messages,
    events,
    backendStatus,
    setIsApiSettingsOpen,
    isDemoBarOpen,
    setIsDemoBarOpen,
    handleResetData,
    setIsNewMemoryModalOpen,
    setIsQuickInspectorOpen
  } = useApp();

  const activeMemoriesCount = memories.filter(m => m.status === 'active').length;
  const privateCount = memories.filter(m => m.is_private).length;

  const navItems = [
    {
      id: 'chat',
      label: 'AI Journal & Chat',
      sublabel: 'Semantic Reflection',
      icon: MessageSquare,
      badge: messages.length,
      badgeColor: 'badge-blue'
    },
    {
      id: 'memories',
      label: 'Memory Vault',
      sublabel: 'Vector Knowledge Store',
      icon: BrainCircuit,
      badge: `${activeMemoriesCount}/${memories.length}`,
      badgeColor: 'badge-emerald'
    },
    {
      id: 'analytics',
      label: 'System Analytics',
      sublabel: 'Audit & Lifecycle Stream',
      icon: Activity,
      badge: events.length,
      badgeColor: 'badge-purple'
    },
    {
      id: 'studio',
      label: 'Studio View',
      sublabel: 'Multi-Panel Workspace',
      icon: Columns,
      badge: 'Split',
      badgeColor: 'badge-amber'
    }
  ];

  return (
    <aside className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-glow">
          <div className="brand-logo-icon">
            <Sparkles size={18} className="logo-sparkle" />
          </div>
        </div>
        {!isSidebarCollapsed && (
          <div className="brand-info">
            <div className="brand-title-wrap">
              <span className="brand-name">ECHO</span>
              <span className="brand-badge-pill">AGENTIC</span>
            </div>
            <p className="brand-tagline">Private Memory That Evolves</p>
          </div>
        )}
        <button
          className="sidebar-collapse-btn"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle sidebar collapse"
        >
          {isSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Main Navigation Pages */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">
          {!isSidebarCollapsed ? 'WORKSPACE VIEWS' : 'PAGES'}
        </div>
        <ul className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`nav-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActivePage(item.id)}
                  title={item.label}
                >
                  <span className="nav-icon-wrap">
                    <Icon size={18} />
                  </span>
                  {!isSidebarCollapsed && (
                    <div className="nav-label-group">
                      <span className="nav-label-main">{item.label}</span>
                      <span className="nav-label-sub">{item.sublabel}</span>
                    </div>
                  )}
                  {!isSidebarCollapsed && item.badge && (
                    <span className={`nav-badge ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Tools & Overlays */}
      <div className="sidebar-tools">
        <div className="nav-section-label">
          {!isSidebarCollapsed ? 'QUICK TOOLS' : 'TOOLS'}
        </div>
        <div className="tools-actions-list">
          <button
            className="tool-action-btn primary-tool"
            onClick={() => setIsNewMemoryModalOpen(true)}
            title="Create New Memory Document"
          >
            <PlusCircle size={16} />
            {!isSidebarCollapsed && <span>Add New Memory</span>}
          </button>

          <button
            className="tool-action-btn"
            onClick={() => setIsQuickInspectorOpen(true)}
            title="Open Slide-over Memory Drawer"
          >
            <Eye size={16} />
            {!isSidebarCollapsed && <span>Quick Memory Peek</span>}
          </button>

          <button
            className={`tool-action-btn ${isDemoBarOpen ? 'active-tool' : ''}`}
            onClick={() => setIsDemoBarOpen(!isDemoBarOpen)}
            title="Toggle Demo Script Walkthrough"
          >
            <PlayCircle size={16} />
            {!isSidebarCollapsed && (
              <span>Demo Walkthrough</span>
            )}
          </button>

          <button
            className="tool-action-btn"
            onClick={handleResetData}
            title="Reset to clean demonstration seeds"
          >
            <RotateCcw size={16} />
            {!isSidebarCollapsed && <span>Reset Demo Data</span>}
          </button>
        </div>
      </div>

      {/* Memory Status Summary Widget */}
      {!isSidebarCollapsed && (
        <div className="sidebar-status-card">
          <div className="status-card-header">
            <span className="status-card-title">Memory Shield Guard</span>
            <span className="status-card-mode">MongoDB Atlas</span>
          </div>
          <div className="status-indicators-row">
            <div className="status-chip active-chip" title="Active eligible memories in vector index">
              <span className="chip-dot emerald-dot"></span>
              <span className="chip-count">{activeMemoriesCount}</span>
              <span className="chip-txt">Active</span>
            </div>
            <div className="status-chip private-chip" title="Memories protected by strict privacy boundary">
              <Shield size={12} className="text-amber" />
              <span className="chip-count">{privateCount}</span>
              <span className="chip-txt">Shielded</span>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Footer Controls */}
      <div className="sidebar-footer">
        {/* Backend Connectivity Status Pill */}
        <button
          className={`backend-status-pill ${backendStatus.isConnected ? 'live' : 'standalone'}`}
          onClick={() => setIsApiSettingsOpen(true)}
          title="Click to configure backend API settings"
        >
          <span className="status-pulse-dot"></span>
          {!isSidebarCollapsed && (
            <span className="backend-name-txt">
              {backendStatus.isConnected ? 'Backend: Live' : 'Backend: Standalone'}
            </span>
          )}
          <Sliders size={14} className="backend-settings-icon" />
        </button>

        {/* Theme Toggle Button */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'aurora-light' ? 'Electric Cyber Dark' : 'Vibrant Aurora Light'}`}
          aria-label="Toggle vibrant theme"
        >
          {theme === 'aurora-light' ? (
            <>
              <Moon size={16} className="text-indigo" />
              {!isSidebarCollapsed && <span className="theme-name">Electric Dark</span>}
            </>
          ) : (
            <>
              <Sun size={16} className="text-amber" />
              {!isSidebarCollapsed && <span className="theme-name">Aurora Light</span>}
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
