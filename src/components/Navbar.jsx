import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  RotateCcw, 
  PlayCircle, 
  Sliders, 
  ShieldCheck, 
  Layers,
  Sun,
  Moon,
  PlusCircle,
  Eye,
  MessageSquare,
  BrainCircuit,
  Activity,
  Columns
} from 'lucide-react';

export default function Navbar() {
  const { 
    memories, 
    backendStatus, 
    setIsApiSettingsOpen, 
    isDemoBarOpen, 
    setIsDemoBarOpen,
    handleResetData,
    activePage,
    setActivePage,
    theme,
    toggleTheme,
    setIsNewMemoryModalOpen,
    setIsQuickInspectorOpen
  } = useApp();

  const activeMemoriesCount = memories.filter(m => m.status === 'active').length;
  const privateCount = memories.filter(m => m.is_private).length;

  const getPageInfo = () => {
    switch (activePage) {
      case 'chat':
        return {
          title: 'AI Journal & Chat',
          badge: 'Semantic Reflection'
        };
      case 'memories':
        return {
          title: 'Memory Vault',
          badge: `${memories.length} Documents`
        };
      case 'analytics':
        return {
          title: 'System Analytics & Audit',
          badge: 'Lifecycle Stream'
        };
      case 'studio':
        return {
          title: 'Studio Workspace',
          badge: 'Multi-Panel View'
        };
      default:
        return {
          title: 'AI Journal & Chat',
          badge: 'Active'
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <header className="navbar">
      {/* Left: Active View Breadcrumb / Title */}
      <div className="navbar-page-title-section">
        <div className="navbar-badge-pulse"></div>
        <div>
          <div className="title-row">
            <h1 className="navbar-heading">{pageInfo.title}</h1>
            <span className="navbar-page-badge">{pageInfo.badge}</span>
          </div>
          <p className="navbar-subheading">
            Private AI journal powered by MongoDB Atlas Agentic Memory
          </p>
        </div>
      </div>

      {/* Middle: Active Memory & Privacy Stats */}
      <div className="navbar-stats-row">
        <button
          className="stat-pill"
          onClick={() => setActivePage('memories')}
          title="Click to view Vector Memory Vault"
        >
          <Layers size={14} className="stat-icon text-indigo" />
          <span className="stat-number">{activeMemoriesCount}</span>
          <span className="stat-label">Active Memories</span>
        </button>

        {privateCount > 0 && (
          <button 
            className="stat-pill private-pill"
            onClick={() => setActivePage('memories')}
            title="Private memories shielded from LLM context"
          >
            <ShieldCheck size={14} className="stat-icon text-amber" />
            <span className="stat-number">{privateCount}</span>
            <span className="stat-label">Privacy Shielded</span>
          </button>
        )}

        <button 
          className={`backend-pill ${backendStatus.isConnected ? 'connected' : 'standalone'}`}
          onClick={() => setIsApiSettingsOpen(true)}
          title="Click to view API contract & Backend connection settings"
        >
          <span className="backend-dot"></span>
          <span className="backend-text">
            {backendStatus.isConnected ? 'Backend: Live' : 'Backend: Standalone'}
          </span>
          <Sliders size={13} className="backend-icon" />
        </button>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="navbar-actions">
        {/* Quick Add Memory */}
        <button
          className="action-btn navbar-add-btn"
          onClick={() => setIsNewMemoryModalOpen(true)}
          title="Add Memory Document directly"
        >
          <PlusCircle size={14} />
          <span>New Memory</span>
        </button>

        {/* Quick Peek Drawer */}
        <button
          className="action-btn secondary-btn"
          onClick={() => setIsQuickInspectorOpen(true)}
          title="Open slide-over quick memory peek drawer"
        >
          <Eye size={14} />
          <span>Peek</span>
        </button>

        {/* Demo Script Walkthrough */}
        <button 
          className={`action-btn demo-btn ${isDemoBarOpen ? 'active' : ''}`}
          onClick={() => setIsDemoBarOpen(!isDemoBarOpen)}
          title="Toggle Judge Demo Script Walkthrough"
        >
          <PlayCircle size={14} />
          <span>Demo Script</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          className="action-btn theme-switch-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'aurora-light' ? 'Electric Cyber Dark' : 'Vibrant Aurora Light'}`}
        >
          {theme === 'aurora-light' ? (
            <Moon size={15} className="text-indigo" />
          ) : (
            <Sun size={15} className="text-amber" />
          )}
        </button>

        {/* Reset Demo Button */}
        <button 
          className="action-btn secondary-btn"
          onClick={handleResetData}
          title="Reset to clean demonstration state"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      {/* Mobile Page Tab Bar */}
      <div className="mobile-tab-bar">
        <button 
          className={`mobile-tab-btn ${activePage === 'chat' ? 'active' : ''}`}
          onClick={() => setActivePage('chat')}
        >
          <MessageSquare size={14} />
          <span>Journal</span>
        </button>
        <button 
          className={`mobile-tab-btn ${activePage === 'memories' ? 'active' : ''}`}
          onClick={() => setActivePage('memories')}
        >
          <BrainCircuit size={14} />
          <span>Vault ({memories.length})</span>
        </button>
        <button 
          className={`mobile-tab-btn ${activePage === 'analytics' ? 'active' : ''}`}
          onClick={() => setActivePage('analytics')}
        >
          <Activity size={14} />
          <span>Audit</span>
        </button>
        <button 
          className={`mobile-tab-btn ${activePage === 'studio' ? 'active' : ''}`}
          onClick={() => setActivePage('studio')}
        >
          <Columns size={14} />
          <span>Studio</span>
        </button>
      </div>
    </header>
  );
}
