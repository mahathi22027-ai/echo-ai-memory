import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DemoScriptBar from './components/DemoScriptBar';
import ChatPanel from './components/ChatPanel';
import MemoryInspector from './components/MemoryInspector';
import SystemLogPanel from './components/SystemLogPanel';
import MemoryDetailModal from './components/MemoryDetailModal';
import CreateMemoryModal from './components/CreateMemoryModal';
import QuickMemoryDrawer from './components/QuickMemoryDrawer';
import SupersedeModal from './components/SupersedeModal';
import ExpiryModal from './components/ExpiryModal';
import ApiSettingsModal from './components/ApiSettingsModal';
import ToastContainer from './components/ToastContainer';

function MainLayout() {
  const { activePage } = useApp();

  return (
    <div className="echo-app-root">
      {/* Modern Collapsible Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="app-main-viewport">
        <Navbar />
        <DemoScriptBar />

        <main className="app-workspace-body">
          {/* 1. Dedicated AI Journal & Chat Page */}
          {activePage === 'chat' && (
            <div className="single-page-container chat-page-container">
              <ChatPanel />
            </div>
          )}

          {/* 2. Dedicated Agentic Memory Vault Page */}
          {activePage === 'memories' && (
            <div className="single-page-container memories-page-container">
              <MemoryInspector />
            </div>
          )}

          {/* 3. Dedicated System Analytics & Audit Page */}
          {activePage === 'analytics' && (
            <div className="single-page-container analytics-page-container">
              <SystemLogPanel />
            </div>
          )}

          {/* 4. Studio Multi-Panel Mode (Split View) */}
          {activePage === 'studio' && (
            <div className="studio-multi-panel-container three-panel-workspace">
              <div className="workspace-column column-chat">
                <ChatPanel />
              </div>
              <div className="workspace-column column-inspector">
                <MemoryInspector />
              </div>
              <div className="workspace-column column-log">
                <SystemLogPanel />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Popups, Drawers & Interactive Modals */}
      <MemoryDetailModal />
      <CreateMemoryModal />
      <QuickMemoryDrawer />
      <SupersedeModal />
      <ExpiryModal />
      <ApiSettingsModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
