import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import DemoScriptBar from './components/DemoScriptBar';
import ChatPanel from './components/ChatPanel';
import MemoryInspector from './components/MemoryInspector';
import SystemLogPanel from './components/SystemLogPanel';
import SupersedeModal from './components/SupersedeModal';
import ExpiryModal from './components/ExpiryModal';
import ApiSettingsModal from './components/ApiSettingsModal';
import ToastContainer from './components/ToastContainer';

function MainLayout() {
  const { activeTabMobile } = useApp();

  return (
    <div className="echo-app-root">
      <Navbar />
      <DemoScriptBar />

      <main className="three-panel-workspace">
        {/* Left Panel: Chat & Journal */}
        <div className={`workspace-column column-chat ${activeTabMobile === 'chat' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <ChatPanel />
        </div>

        {/* Center Panel: Memory Inspector */}
        <div className={`workspace-column column-inspector ${activeTabMobile === 'inspector' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <MemoryInspector />
        </div>

        {/* Right Panel: System Log & Audit Feed */}
        <div className={`workspace-column column-log ${activeTabMobile === 'logs' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <SystemLogPanel />
        </div>
      </main>

      {/* Interactive Modals */}
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
