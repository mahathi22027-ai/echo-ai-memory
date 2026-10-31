import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function ToastContainer() {
  const { toasts } = useApp();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={16} className="text-emerald" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber" />;
      case 'error': return <AlertCircle size={16} className="text-rose" />;
      default: return <Info size={16} className="text-cyan" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-card toast-${t.type || 'info'}`}>
          <div className="toast-icon">{getIcon(t.type)}</div>
          <div className="toast-message">{t.message}</div>
        </div>
      ))}
    </div>
  );
}
