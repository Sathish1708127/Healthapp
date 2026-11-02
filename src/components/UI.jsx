import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from './Icons';

export function Card({ children, style = {}, className = '', onClick, hover = false }) {
  return (
    <div
      onClick={onClick}
      className={`glass-panel ${className}`}
      style={{
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 22,
        boxShadow: 'var(--shadow-md)',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onMouseEnter={e => {
        if (hover || onClick) {
          e.currentTarget.style.borderColor = 'var(--border-hover)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }
      }}
      onMouseLeave={e => {
        if (hover || onClick) {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, style = {}, badge }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      ...style,
    }}>
      <div style={{
        fontSize: 12.5,
        fontWeight: 700,
        color: 'var(--text2)',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{ width: 4, height: 14, borderRadius: 2, background: 'var(--green)' }} />
        {children}
      </div>
      {badge && <div>{badge}</div>}
    </div>
  );
}

export function Badge({ children, color = 'green' }) {
  const colors = {
    green: { bg: 'rgba(16, 185, 129, 0.12)', c: 'var(--green)', border: 'rgba(16, 185, 129, 0.25)' },
    red: { bg: 'rgba(244, 63, 94, 0.12)', c: 'var(--red)', border: 'rgba(244, 63, 94, 0.25)' },
    amber: { bg: 'rgba(245, 158, 11, 0.12)', c: 'var(--amber)', border: 'rgba(245, 158, 11, 0.25)' },
    blue: { bg: 'rgba(56, 189, 248, 0.12)', c: 'var(--blue)', border: 'rgba(56, 189, 248, 0.25)' },
    purple: { bg: 'rgba(168, 85, 247, 0.12)', c: 'var(--purple)', border: 'rgba(168, 85, 247, 0.25)' },
    teal: { bg: 'rgba(20, 184, 166, 0.12)', c: 'var(--teal)', border: 'rgba(20, 184, 166, 0.25)' },
  };
  const { bg, c, border } = colors[color] || colors.green;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      background: bg,
      color: c,
      border: `1px solid ${border}`,
      letterSpacing: '0.2px',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c }} />
      {children}
    </span>
  );
}

export function AlertBanner({ children, type = 'amber' }) {
  const config = {
    red: {
      bg: 'rgba(244, 63, 94, 0.08)',
      border: 'rgba(244, 63, 94, 0.3)',
      icon: <AlertCircle size={18} color="var(--red)" />,
      color: '#ffffff',
    },
    amber: {
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.3)',
      icon: <AlertTriangle size={18} color="var(--amber)" />,
      color: '#ffffff',
    },
    green: {
      bg: 'rgba(16, 185, 129, 0.08)',
      border: 'rgba(16, 185, 129, 0.3)',
      icon: <CheckCircle2 size={18} color="var(--green)" />,
      color: '#ffffff',
    },
  };
  const { bg, border, icon, color } = config[type] || config.amber;

  return (
    <div style={{
      padding: '14px 18px',
      borderRadius: 14,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 20,
      background: bg,
      backdropFilter: 'blur(12px)',
      border: `1px solid ${border}`,
      color,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <span style={{ flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div style={{ fontSize: 13.5, lineHeight: 1.5, flex: 1 }}>{children}</div>
    </div>
  );
}

export function ProgressBar({ value, max = 100, color = 'var(--green)', label, sublabel }) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 500, marginBottom: 6 }}>
          <span>{label}</span>
          {sublabel && <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{sublabel}</span>}
        </div>
      )}
      <div style={{ background: 'var(--bg3)', borderRadius: 6, height: 7, overflow: 'hidden' }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          borderRadius: 6,
          background: color,
          boxShadow: `0 0 10px ${color}66`,
          transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
      </div>
    </div>
  );
}

export function Btn({ children, variant = 'green', onClick, style = {}, disabled = false }) {
  const styles = {
    green: {
      background: 'linear-gradient(135deg, var(--green) 0%, #059669 100%)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
    },
    blue: {
      background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)',
    },
    outline: {
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid var(--border)',
      color: 'var(--text)',
      boxShadow: 'none',
    },
    danger: {
      background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)',
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '10px 18px',
        borderRadius: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: disabled ? 0.45 : 1,
        ...styles[variant],
        ...style,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          if (variant === 'outline') e.currentTarget.style.borderColor = 'var(--green)';
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          if (variant === 'outline') e.currentTarget.style.borderColor = 'var(--border)';
        }
      }}
    >
      {children}
    </button>
  );
}

export function Grid({ cols = 2, gap = 16, children, style = {} }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap,
      ...style,
    }}>{children}</div>
  );
}

export function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '18px 0' }} />;
}

export function Tag({ children }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 6,
      fontSize: 11.5,
      fontWeight: 500,
      background: 'rgba(30, 41, 59, 0.6)',
      border: '1px solid var(--border)',
      color: 'var(--text2)',
      margin: 3,
    }}>{children}</span>
  );
}

export function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 44,
        height: 24,
        borderRadius: 14,
        cursor: 'pointer',
        background: checked ? 'var(--green)' : 'var(--bg3)',
        border: `1px solid ${checked ? 'var(--green)' : 'var(--border-hover)'}`,
        boxShadow: checked ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 2,
        left: checked ? 22 : 2,
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }} />
    </div>
  );
}
