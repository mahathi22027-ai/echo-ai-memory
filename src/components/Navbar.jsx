import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Database, 
  RotateCcw, 
  PlayCircle, 
  Sliders, 
  ShieldCheck, 
  ExternalLink,
  Activity,
  Layers
} from 'lucide-react';

export default function Navbar() {
  const { 
    memories, 
    backendStatus, 
    setIsApiSettingsOpen, 
    isDemoBarOpen, 
    setIsDemoBarOpen,
    handleResetData,
    activeTabMobile,
    setActiveTabMobile
  } = useApp();

  const activeMemoriesCount = memories.filter(m => m.status === 'active').length;
  const privateCount = memories.filter(m => m.is_private).length;

  return (
    <header className="navbar">
      <div className="navbar-brand-section">
        <div className="brand-icon-wrapper">
          <div className="brand-pulse-ring"></div>
          <svg className="brand-svg" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" opacity="0.4" />
            <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="2" opacity="0.8" />
            <circle cx="16" cy="16" r="4" fill="currentColor" />
          </svg>
        </div>
        <div className="brand-text-wrapper">
          <div className="brand-title-row">
            <h1 className="brand-title">ECHO</h1>
            <span className="brand-tag">Agentic Memory</span>
            <span className="brand-hackathon-pill">MongoDB Hackathon</span>
          </div>
          <p className="brand-subtitle">A private AI journal with memory that evolves</p>
        </div>
      </div>

      {/* Middle status badges */}
      <div className="navbar-stats-row">
        <div className="stat-pill" title="Memories eligible for semantic vector retrieval">
          <Layers size={14} className="stat-icon" />
          <span className="stat-number">{activeMemoriesCount}</span>
          <span className="stat-label">Active Memories</span>
        </div>

        {privateCount > 0 && (
          <div className="stat-pill private-pill" title="Private memories shielded from LLM context">
            <ShieldCheck size={14} className="stat-icon text-amber" />
            <span className="stat-number">{privateCount}</span>
            <span className="stat-label">Privacy Shielded</span>
          </div>
        )}

        <button 
          className={`backend-pill ${backendStatus.isConnected ? 'connected' : 'standalone'}`}
          onClick={() => setIsApiSettingsOpen(true)}
          title="Click to view API contract & Backend connection settings"
        >
          <span className="backend-dot"></span>
          <span className="backend-text">
            {backendStatus.isConnected ? 'Backend: Live (Connected)' : 'Backend: Standalone (Ready for API)'}
          </span>
          <Sliders size={13} className="backend-icon" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="navbar-actions">
        <button 
          className={`action-btn demo-btn ${isDemoBarOpen ? 'active' : ''}`}
          onClick={() => setIsDemoBarOpen(!isDemoBarOpen)}
          title="Toggle Judge Demo Script Walkthrough"
        >
          <PlayCircle size={15} />
          <span>Demo Walkthrough</span>
        </button>

        <button 
          className="action-btn secondary-btn"
          onClick={handleResetData}
          title="Reset to clean demonstration state"
        >
          <RotateCcw size={14} />
          <span>Reset Demo</span>
        </button>

        <button 
          className="action-btn icon-only-btn"
          onClick={() => setIsApiSettingsOpen(true)}
          title="API Documentation & Backend Settings"
        >
          <Sliders size={16} />
        </button>
      </div>

      {/* Mobile panel tab switcher */}
      <div className="mobile-tab-bar">
        <button 
          className={`mobile-tab-btn ${activeTabMobile === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTabMobile('chat')}
        >
          Chat & Journal
        </button>
        <button 
          className={`mobile-tab-btn ${activeTabMobile === 'inspector' ? 'active' : ''}`}
          onClick={() => setActiveTabMobile('inspector')}
        >
          Memories ({memories.length})
        </button>
        <button 
          className={`mobile-tab-btn ${activeTabMobile === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTabMobile('logs')}
        >
          System Log
        </button>
      </div>
    </header>
  );
}
