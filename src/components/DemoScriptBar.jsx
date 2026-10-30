import React from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_SCRIPT_STEPS } from '../data/seedData';
import { Play, CheckCircle2, ChevronRight, HelpCircle, X, Sparkles } from 'lucide-react';

export default function DemoScriptBar() {
  const { 
    isDemoBarOpen, 
    setIsDemoBarOpen, 
    currentDemoStep, 
    runDemoStep,
    demoBannerMessage,
    isLoading
  } = useApp();

  if (!isDemoBarOpen) return null;

  return (
    <div className="demo-script-bar">
      <div className="demo-script-header">
        <div className="demo-header-title">
          <Sparkles size={16} className="text-emerald" />
          <span className="demo-badge">JUDGE DEMONSTRATION SCRIPT</span>
          <span className="demo-hint">6-step live workflow defined in the project plan</span>
        </div>
        <button 
          className="demo-close-btn"
          onClick={() => setIsDemoBarOpen(false)}
          title="Minimize Demo Script Bar"
        >
          <X size={15} />
        </button>
      </div>

      <div className="demo-steps-grid">
        {DEMO_SCRIPT_STEPS.map((s) => {
          const isActive = currentDemoStep === s.step;
          return (
            <button
              key={s.step}
              className={`demo-step-card ${isActive ? 'active-step' : ''}`}
              onClick={() => runDemoStep(s.step)}
              disabled={isLoading}
              title={`Step ${s.step}: ${s.description}`}
            >
              <div className="step-card-top">
                <span className="step-number-badge">Step {s.step}</span>
                <span className="step-play-icon">
                  <Play size={11} fill="currentColor" />
                </span>
              </div>
              <div className="step-card-title">{s.title.split('. ')[1]}</div>
              <div className="step-card-preview">{s.actionText}</div>
            </button>
          );
        })}
      </div>

      {demoBannerMessage && (
        <div className="demo-active-explanation">
          <div className="explanation-icon">
            <CheckCircle2 size={16} className="text-emerald" />
          </div>
          <div className="explanation-content">
            <span className="explanation-title">
              Executing Step {demoBannerMessage.step}: {demoBannerMessage.title}
            </span>
            <span className="explanation-text">
              <strong>Judge Expectation:</strong> {demoBannerMessage.expected}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
