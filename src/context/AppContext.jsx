/**
 * Application Context for ECHO
 * Coordinates state across the 3 panels: Chat, Memory Inspector, and System Log
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchMemories,
  fetchMemoryEvents,
  sendChatMessage,
  updateMemory,
  createMemory,
  deleteMemory,
  resetStorageToSeeds,
  getApiConfig,
  saveApiConfig,
  testBackendConnection
} from '../services/api';
import { DEMO_SCRIPT_STEPS, INITIAL_MESSAGES } from '../data/seedData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Core Entities
  const [memories, setMemories] = useState([]);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('echo_messages_v1');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch (_e) {
      return INITIAL_MESSAGES;
    }
  });
  const [events, setEvents] = useState([]);
  
  // Page Navigation & Theme States
  const [activePage, setActivePage] = useState('chat'); // 'chat' | 'memories' | 'analytics' | 'studio'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('echo_theme') || 'aurora-light';
    } catch (_e) {
      return 'aurora-light';
    }
  });

  // UI & Filter States
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedMemoryId, setHighlightedMemoryId] = useState(null);
  const [activeTabMobile, setActiveTabMobileState] = useState('chat'); // backward compatibility

  // Unified page setter that syncs mobile tab
  const handleSetActivePage = useCallback((page) => {
    setActivePage(page);
    if (page === 'memories') setActiveTabMobileState('inspector');
    else if (page === 'analytics') setActiveTabMobileState('logs');
    else setActiveTabMobileState('chat');
  }, []);

  const setActiveTabMobile = useCallback((tab) => {
    setActiveTabMobileState(tab);
    if (tab === 'inspector') setActivePage('memories');
    else if (tab === 'logs') setActivePage('analytics');
    else setActivePage('chat');
  }, []);
  
  // Modals & Drawers
  const [isLoading, setIsLoading] = useState(false);
  const [supersedeModalTarget, setSupersedeModalTarget] = useState(null);
  const [expiryModalTarget, setExpiryModalTarget] = useState(null);
  const [memoryDetailModalTarget, setMemoryDetailModalTarget] = useState(null);
  const [isNewMemoryModalOpen, setIsNewMemoryModalOpen] = useState(false);
  const [isQuickInspectorOpen, setIsQuickInspectorOpen] = useState(false);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [isDemoBarOpen, setIsDemoBarOpen] = useState(true);

  // Sync theme attribute to HTML root
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('echo_theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'aurora-light' ? 'cyber-dark' : 'aurora-light');
  }, []);

  // Demo script states
  const [currentDemoStep, setCurrentDemoStep] = useState(null);
  const [demoBannerMessage, setDemoBannerMessage] = useState(null);

  // API & Connectivity
  const [apiConfig, setApiConfigState] = useState(getApiConfig);
  const [backendStatus, setBackendStatus] = useState({
    isConnected: false,
    checking: false,
    error: null,
    lastChecked: null
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  // Save messages to storage
  useEffect(() => {
    try {
      localStorage.setItem('echo_messages_v1', JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
  }, [messages]);

  // Load Memories and Events
  const refreshAllData = useCallback(async () => {
    try {
      const [memRes, evtRes] = await Promise.all([
        fetchMemories(),
        fetchMemoryEvents()
      ]);
      if (memRes?.memories) setMemories(memRes.memories);
      if (evtRes?.events) setEvents(evtRes.events);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, []);

  // Check backend health
  const checkBackendHealth = useCallback(async (customUrl) => {
    setBackendStatus(prev => ({ ...prev, checking: true }));
    const result = await testBackendConnection(customUrl);
    setBackendStatus({
      isConnected: result.ok,
      checking: false,
      error: result.ok ? null : (result.error || `HTTP ${result.status}`),
      lastChecked: new Date().toLocaleTimeString()
    });
    return result.ok;
  }, []);

  // Initial load
  useEffect(() => {
    refreshAllData();
    checkBackendHealth();

    // Check expiry interval every 5 seconds to demonstrate real-time TTL behavior
    const interval = setInterval(() => {
      setMemories(prev => {
        let changed = false;
        const now = new Date();
        const updated = prev.map(m => {
          if (m.expires_at && new Date(m.expires_at) <= now && m.status !== 'expired') {
            changed = true;
            return { ...m, status: 'expired' };
          }
          return m;
        });
        if (changed) {
          showToast('A time-limited memory expired and was removed from vector retrieval', 'warning');
        }
        return changed ? updated : prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshAllData, checkBackendHealth, showToast]);

  // Send Message (Journal Entry or Recall Query)
  const sendMessage = async (text, mode = 'journal') => {
    if (!text.trim()) return;

    const userMsgId = `msg_${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text,
      mode,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage({ message: text, mode });
      
      const aiMsg = {
        id: `msg_${Date.now() + 1}`,
        sender: 'echo',
        text: response.reply,
        mode: response.mode || mode,
        timestamp: new Date().toISOString(),
        extractedMemories: response.extractedMemories ? response.extractedMemories.map(m => m._id) : undefined,
        referencedMemories: response.referencedMemories || undefined,
        similarityScores: response.similarityScores || undefined,
        supersededMemoryId: response.supersededMemoryId || undefined,
        privacyShieldedCount: response.privacyShieldedCount || 0
      };

      setMessages(prev => [...prev, aiMsg]);

      // If new memories or events created, refresh inspector & system log
      await refreshAllData();

      // Automatically highlight provenance if a memory was retrieved
      if (response.referencedMemories && response.referencedMemories.length > 0) {
        setHighlightedMemoryId(response.referencedMemories[0]);
        showToast(`Recalled memory ${response.referencedMemories[0]} with semantic match!`, 'success');
      } else if (response.extractedMemories && response.extractedMemories.length > 0) {
        setHighlightedMemoryId(response.extractedMemories[0]._id);
        showToast(`Extracted ${response.extractedMemories[0].type.toUpperCase()} memory into vault`, 'success');
      }

    } catch (err) {
      console.error('Chat error:', err);
      showToast('Error sending message: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Supersede Memory
  const handleSupersede = async (id, updatedContent, updatedType) => {
    try {
      const res = await updateMemory(id, {
        supersedeWith: {
          content: updatedContent,
          type: updatedType
        }
      });
      await refreshAllData();
      setSupersedeModalTarget(null);
      showToast(`Memory superseded! New active memory linked via supersedes_id.`, 'success');
      if (res?.newMemory) {
        setHighlightedMemoryId(res.newMemory._id);
      }
    } catch (err) {
      showToast('Failed to supersede: ' + err.message, 'error');
    }
  };

  // Toggle Privacy
  const handleTogglePrivacy = async (id, currentPrivateState) => {
    try {
      const nextState = !currentPrivateState;
      await updateMemory(id, { is_private: nextState });
      await refreshAllData();
      showToast(
        nextState 
          ? 'Memory marked Private. Strictly excluded from vector recall & LLM context.'
          : 'Memory unhidden. Restored to public retrieval eligibility.',
        'info'
      );
    } catch (err) {
      showToast('Privacy update failed: ' + err.message, 'error');
    }
  };

  // Set Expiry
  const handleSetExpiry = async (id, expiresAt) => {
    try {
      await updateMemory(id, { expires_at: expiresAt });
      await refreshAllData();
      setExpiryModalTarget(null);
      showToast(
        expiresAt ? `Expiry configured. TTL active.` : `Expiry cleared.`,
        'info'
      );
    } catch (err) {
      showToast('Expiry update failed: ' + err.message, 'error');
    }
  };

  // Delete Memory
  const handleDeleteMemory = async (id) => {
    if (!window.confirm('Delete this memory permanently from MongoDB Atlas?')) return;
    try {
      await deleteMemory(id);
      await refreshAllData();
      showToast('Memory deleted from MongoDB Atlas', 'warning');
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  };

  // Run Judge Demo Step
  const runDemoStep = async (stepNum) => {
    const stepConfig = DEMO_SCRIPT_STEPS.find(s => s.step === stepNum);
    if (!stepConfig) return;

    setCurrentDemoStep(stepNum);
    setDemoBannerMessage({
      step: stepNum,
      title: stepConfig.title,
      description: stepConfig.description,
      expected: stepConfig.expected
    });

    if (stepConfig.isAction === 'persist') {
      // Step 2: Persist demo - reload from persistent storage
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 600));
      await refreshAllData();
      setIsLoading(false);
      showToast('Session reconnected: All memories persist in database storage!', 'success');
      return;
    }

    if (stepConfig.isAction === 'expiry_demo') {
      // Step 6: Expiry demo - set 15-second expiry on mem_001 or first active
      const target = memories.find(m => m.status === 'active') || memories[0];
      if (target) {
        const soon = new Date(Date.now() + 15000).toISOString();
        await handleSetExpiry(target._id, soon);
        showToast(`Set 15-second timer on ${target._id}. Watch it expire and get excluded!`, 'warning');
      }
      return;
    }

    if (stepConfig.prompt) {
      await sendMessage(stepConfig.prompt, stepConfig.mode);
    }
  };

  // Reset to initial hackathon seeds
  const handleResetData = () => {
    if (window.confirm('Reset all memories, chat history, and audit log to initial seed state?')) {
      resetStorageToSeeds();
      setMessages(INITIAL_MESSAGES);
      refreshAllData();
      setCurrentDemoStep(null);
      setDemoBannerMessage(null);
      showToast('Reset to clean hackathon demo state', 'info');
    }
  };

  // Update backend config
  const handleUpdateConfig = (newConfig) => {
    const merged = { ...apiConfig, ...newConfig };
    setApiConfigState(merged);
    saveApiConfig(merged);
    checkBackendHealth(merged.baseUrl);
    showToast('API Configuration saved', 'success');
  };

  // Filtered Memories calculation
  const filteredMemories = memories.filter(mem => {
    if (activeStatusFilter !== 'all' && mem.status !== activeStatusFilter) {
      return false;
    }
    if (activeTypeFilter !== 'all' && mem.type !== activeTypeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        mem.content.toLowerCase().includes(q) ||
        mem.source_quote.toLowerCase().includes(q) ||
        mem.type.toLowerCase().includes(q) ||
        mem._id.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Create new memory manually
  const handleCreateMemory = async (memoryData) => {
    try {
      const res = await createMemory(memoryData);
      await refreshAllData();
      setIsNewMemoryModalOpen(false);
      showToast(`Created new ${memoryData.type.toUpperCase()} memory in vault!`, 'success');
      if (res?.memory?._id) {
        setHighlightedMemoryId(res.memory._id);
      }
    } catch (err) {
      showToast('Failed to create memory: ' + err.message, 'error');
    }
  };

  const openMemoryDetail = useCallback((memoryOrId) => {
    if (!memoryOrId) return;
    if (typeof memoryOrId === 'string') {
      const found = memories.find(m => m._id === memoryOrId);
      if (found) {
        setMemoryDetailModalTarget(found);
      }
    } else {
      setMemoryDetailModalTarget(memoryOrId);
    }
  }, [memories]);

  const value = {
    memories,
    filteredMemories,
    messages,
    events,
    isLoading,
    activePage,
    setActivePage: handleSetActivePage,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    theme,
    toggleTheme,
    activeStatusFilter,
    setActiveStatusFilter,
    activeTypeFilter,
    setActiveTypeFilter,
    searchQuery,
    setSearchQuery,
    highlightedMemoryId,
    setHighlightedMemoryId,
    activeTabMobile,
    setActiveTabMobile,
    supersedeModalTarget,
    setSupersedeModalTarget,
    expiryModalTarget,
    setExpiryModalTarget,
    memoryDetailModalTarget,
    setMemoryDetailModalTarget,
    openMemoryDetail,
    isNewMemoryModalOpen,
    setIsNewMemoryModalOpen,
    isQuickInspectorOpen,
    setIsQuickInspectorOpen,
    isApiSettingsOpen,
    setIsApiSettingsOpen,
    isDemoBarOpen,
    setIsDemoBarOpen,
    currentDemoStep,
    demoBannerMessage,
    apiConfig,
    backendStatus,
    toasts,
    sendMessage,
    handleCreateMemory,
    handleSupersede,
    handleTogglePrivacy,
    handleSetExpiry,
    handleDeleteMemory,
    refreshAllData,
    runDemoStep,
    handleResetData,
    handleUpdateConfig,
    checkBackendHealth,
    showToast
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
