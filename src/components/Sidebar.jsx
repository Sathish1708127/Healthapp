import React, { useState } from 'react';
import {
  LayoutDashboard, Sparkles, BookOpen, Scan, Microscope,
  CloudSun, Radio, HeartPulse, Lock, FileBadge, Pill,
  Apple, FileText, Trophy, Users, WifiOff, Settings as SettingsIcon,
  ChevronLeft, ChevronRight, Activity, ShieldCheck
} from './Icons';

const NAV_ITEMS = [
  { section: 'Main' },
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'checker', icon: Sparkles, label: 'AI Concierge', badge: 'AI' },
  { id: 'journal', icon: BookOpen, label: 'Symptom Journal' },

  { section: 'Detection' },
  { id: 'skin', icon: Scan, label: 'Skin Analyser' },
  { id: 'lab', icon: Microscope, label: 'Lab Analyzer', badge: 'OCR' },
  { id: 'environment', icon: CloudSun, label: 'Health Radar' },
  { id: 'outbreak', icon: Radio, label: 'Outbreak Alerts', badge: '18km', badgeColor: 'red' },
  { id: 'vitals', icon: HeartPulse, label: 'Vitals Monitor' },

  { section: 'Data' },
  { id: 'vault', icon: Lock, label: 'Health Vault', badge: 'AES' },
  { id: 'passport', icon: FileBadge, label: 'Health Passport', badge: 'QR' },

  { section: 'Care & Community' },
  { id: 'treatment', icon: Pill, label: 'Treatment Guide' },
  { id: 'nutrition', icon: Apple, label: 'Nutrition & Water' },
  { id: 'report', icon: FileText, label: 'Clinical Report' },
  { id: 'gamification', icon: Trophy, label: 'Gamification' },
  { id: 'family', icon: Users, label: 'Family Profiles' },

  { section: 'System' },
  { id: 'rural', icon: WifiOff, label: 'Rural & Offline' },
  { id: 'settings', icon: SettingsIcon, label: 'Settings' },
];

export default function Sidebar({
  activePage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const [hoveredItem, setHoveredItem] = useState(null);

  const sidebarWidth = collapsed ? 72 : 250;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 11, 20, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 140,
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: sidebarWidth,
          background: 'rgba(11, 17, 32, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 150,
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s ease',
          transform: mobileOpen
            ? 'translateX(0)'
            : window.innerWidth < 768
            ? 'translateX(-100%)'
            : 'translateX(0)',
          overflow: 'hidden',
        }}
      >
        {/* Brand Header */}
        <div style={{
          height: 68,
          padding: collapsed ? '0 16px' : '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border)',
        }}>
          <div
            onClick={() => onNavigate('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              color: '#ffffff',
              flexShrink: 0,
            }}>
              <Activity size={22} />
            </div>

            {!collapsed && (
              <div style={{ lineHeight: 1.1 }}>
                <div style={{
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: '-0.4px',
                  color: 'var(--text)',
                }}>
                  Health<span style={{ color: 'var(--green)' }}>AI</span>
                </div>
                <div style={{
                  fontSize: 10,
                  color: 'var(--text3)',
                  letterSpacing: '0.6px',
                  fontWeight: 600,
                }}>
                  CLINICAL OS
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text3)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 4,
              }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation Items List */}
        <div style={{
          flex: 1,
          padding: '12px 8px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          {NAV_ITEMS.map((item, idx) => {
            if (item.section) {
              if (collapsed) {
                return (
                  <div
                    key={`sec-${idx}`}
                    style={{
                      height: 1,
                      background: 'rgba(255, 255, 255, 0.06)',
                      margin: '10px 8px',
                    }}
                  />
                );
              }
              return (
                <div
                  key={`sec-${idx}`}
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--text3)',
                    padding: '14px 14px 4px',
                    fontWeight: 700,
                  }}
                >
                  {item.section}
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = activePage === item.id;
            const isHovered = hoveredItem === item.id;

            return (
              <div
                key={item.id}
                style={{ position: 'relative' }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  onClick={() => {
                    onNavigate(item.id);
                    if (window.innerWidth < 768) onCloseMobile();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: 12,
                    padding: collapsed ? '10px 0' : '9px 12px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#ffffff' : isHovered ? 'var(--text)' : 'var(--text2)',
                    background: isActive
                      ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0.05) 100%)'
                      : isHovered
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? '3px solid var(--green)' : '3px solid transparent',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon
                    size={19}
                    color={isActive ? 'var(--green)' : isHovered ? 'var(--text)' : 'var(--text3)'}
                    style={{ flexShrink: 0 }}
                  />

                  {!collapsed && (
                    <span style={{
                      flex: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {item.label}
                    </span>
                  )}

                  {!collapsed && item.badge && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 10,
                      background: item.badgeColor === 'red' ? 'var(--red-dim)' : 'var(--green-dim)',
                      color: item.badgeColor === 'red' ? 'var(--red)' : 'var(--green)',
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Floating Tooltip in collapsed mode */}
                {collapsed && isHovered && (
                  <div style={{
                    position: 'absolute',
                    left: 'calc(100% + 10px)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(15, 23, 42, 0.98)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--border-hover)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                    zIndex: 200,
                    pointerEvents: 'none',
                  }}>
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info / Expand button */}
        <div style={{
          padding: 14,
          borderTop: '1px solid var(--border)',
          background: 'rgba(15, 23, 42, 0.6)',
        }}>
          {collapsed ? (
            <button
              onClick={onToggleCollapse}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--text3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 6,
              }}
              title="Expand navigation"
            >
              <ChevronRight size={18} />
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--green), #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
              }}>
                <ShieldCheck size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                  Zero-Knowledge PHR
                </div>
                <div style={{ fontSize: 10, color: 'var(--green)' }}>
                  AES-256 Encrypted
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
