import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from './Icons';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [modalConfig, setModalConfig] = useState(null);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showModal = useCallback(({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    type = 'info'
  }) => {
    setModalConfig({
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: async () => {
        if (onConfirm) await onConfirm();
        setModalConfig(null);
      },
      onCancel: () => setModalConfig(null),
      type,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalConfig(null);
  }, []);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="var(--green)" />;
      case 'warning':
        return <AlertTriangle size={18} color="var(--amber)" />;
      case 'error':
        return <AlertCircle size={18} color="var(--red)" />;
      default:
        return <Info size={18} color="var(--blue)" />;
    }
  };

  const getToastBorder = (type) => {
    switch (type) {
      case 'success': return '1px solid rgba(16, 185, 129, 0.3)';
      case 'warning': return '1px solid rgba(245, 158, 11, 0.3)';
      case 'error': return '1px solid rgba(244, 63, 94, 0.3)';
      default: return '1px solid rgba(56, 189, 248, 0.3)';
    }
  };

  return (
    <NotificationContext.Provider value={{ showToast, showModal, closeModal }}>
      {children}

      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
        maxWidth: 400,
        width: 'calc(100% - 48px)',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            pointerEvents: 'auto',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: getToastBorder(t.type),
            borderRadius: 12,
            padding: '12px 16px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'var(--text)',
            fontSize: 13.5,
            animation: 'fadeInUp 0.25s ease-out',
          }}>
            <span style={{ flexShrink: 0 }}>{getToastIcon(t.type)}</span>
            <div style={{ flex: 1, lineHeight: 1.4, wordBreak: 'break-word' }}>
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text3)',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 4,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Modal Dialog */}
      {modalConfig && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'rgba(7, 11, 20, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            background: 'var(--card-solid)',
            border: '1px solid var(--border-hover)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 480,
            padding: 24,
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(16, 185, 129, 0.1)',
            animation: 'fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: modalConfig.type === 'error' ? 'var(--red-dim)' : 'var(--green-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {modalConfig.type === 'error'
                  ? <AlertCircle size={20} color="var(--red)" />
                  : <Info size={20} color="var(--green)" />}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px', margin: 0 }}>
                {modalConfig.title}
              </h3>
            </div>

            <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              {modalConfig.message}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              {modalConfig.cancelText && (
                <button
                  onClick={modalConfig.onCancel}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    background: 'var(--bg3)',
                    border: '1px solid var(--border)',
                    color: 'var(--text2)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}
                >
                  {modalConfig.cancelText}
                </button>
              )}
              <button
                onClick={modalConfig.onConfirm}
                style={{
                  padding: '9px 20px',
                  borderRadius: 8,
                  background: modalConfig.type === 'error'
                    ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
                    : 'linear-gradient(135deg, var(--green), #059669)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {modalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return fallback in case it's used outside provider
    return {
      showToast: (msg) => console.log('Toast fallback:', msg),
      showModal: ({ message }) => console.log('Modal fallback:', message),
      closeModal: () => {},
    };
  }
  return context;
}
