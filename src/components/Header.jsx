import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Bell, AlertTriangle, User, ChevronDown,
  Menu, Sparkles, Activity, FileText, PhoneCall, Check, ExternalLink
} from './Icons';
import { useNotification } from './NotificationContext';

export default function Header({
  activePage,
  onNavigate,
  onToggleSidebar,
  sidebarCollapsed,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { showToast } = useNotification();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Active Dengue Outbreak',
      desc: 'HSR Layout (18km away) — 47 new cases reported. Take precautions.',
      time: '10m ago',
      unread: true,
      type: 'alert',
      page: 'outbreak',
    },
    {
      id: 2,
      title: 'Sleep Target Alert',
      desc: '6.8 hrs recorded last night — 20 mins below recommended 7.0 hrs.',
      time: '2h ago',
      unread: true,
      type: 'vitals',
      page: 'vitals',
    },
    {
      id: 3,
      title: 'Hydration Target',
      desc: '1.2L remaining to hit today’s 3.0L goal.',
      time: '4h ago',
      unread: false,
      type: 'nutrition',
      page: 'nutrition',
    },
  ]);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Keyboard shortcut listener ('/' to focus search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    showToast('All notifications marked as read', 'info', 2000);
  };

  const navSearchItems = [
    { label: 'Symptom Checker / AI Concierge', page: 'checker', category: 'Clinical' },
    { label: 'Lab Report & Prescription OCR', page: 'lab', category: 'Diagnostics' },
    { label: 'Outbreak Radar (Dengue, COVID)', page: 'outbreak', category: 'Surveillance' },
    { label: 'Health Data Vault (Encrypted PHR)', page: 'vault', category: 'Security' },
    { label: 'Health Passport (Verifiable QR)', page: 'passport', category: 'Identity' },
    { label: 'Environmental Health & AQI Radar', page: 'environment', category: 'Environment' },
    { label: 'Vitals & Wearables Monitor', page: 'vitals', category: 'Diagnostics' },
    { label: 'Hydration & Nutrition Plan', page: 'nutrition', category: 'Wellness' },
    { label: 'Gamification & Challenges', page: 'gamification', category: 'Engagement' },
    { label: 'Rural Mode & Offline Guides', page: 'rural', category: 'Accessibility' },
  ];

  const filteredSearch = searchQuery.trim()
    ? navSearchItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header style={{
      height: 68,
      background: 'rgba(11, 17, 32, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      gap: 16,
    }}>
      {/* Left: Mobile hamburger + Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, maxWidth: 540 }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text2)',
            padding: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          <Menu size={18} />
        </button>

        {/* Search bar with auto-complete */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: searchFocused ? 'var(--bg3)' : 'rgba(30, 41, 59, 0.6)',
            border: searchFocused ? '1px solid var(--green)' : '1px solid var(--border)',
            boxShadow: searchFocused ? '0 0 12px rgba(16, 185, 129, 0.2)' : 'none',
            borderRadius: 10,
            padding: '7px 12px',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <Search size={16} color={searchFocused ? 'var(--green)' : 'var(--text3)'} />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Search symptoms, lab tests, medications... (Press / to search)"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text)',
                fontSize: 13,
              }}
            />
            <span style={{
              fontSize: 10,
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '2px 6px',
              borderRadius: 4,
              color: 'var(--text3)',
              fontFamily: 'var(--font-mono)',
            }}>
              /
            </span>
          </div>

          {/* Search Dropdown Results */}
          {searchFocused && filteredSearch.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'rgba(15, 23, 42, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-hover)',
              borderRadius: 12,
              padding: 8,
              boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
              zIndex: 100,
              maxHeight: 320,
              overflowY: 'auto',
            }}>
              {filteredSearch.map(item => (
                <div
                  key={item.page}
                  onMouseDown={() => {
                    onNavigate(item.page);
                    setSearchQuery('');
                  }}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontSize: 10,
                    background: 'var(--green-dim)',
                    color: 'var(--green)',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontWeight: 600,
                  }}>
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center / Right: Quick Action Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Quick Triage Pill */}
        <button
          onClick={() => onNavigate('checker')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '7px 13px',
            borderRadius: 20,
            background: activePage === 'checker' ? 'var(--green)' : 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: activePage === 'checker' ? '#090d16' : 'var(--green)',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Sparkles size={14} />
          <span className="hide-mobile">AI Triage</span>
        </button>

        {/* Upload Lab Pill */}
        <button
          onClick={() => onNavigate('lab')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '7px 13px',
            borderRadius: 20,
            background: activePage === 'lab' ? 'var(--blue)' : 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: activePage === 'lab' ? '#090d16' : 'var(--blue)',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <FileText size={14} />
          <span className="hide-mobile">Scan Lab</span>
        </button>

        {/* Emergency Hotline Button */}
        <button
          onClick={() => {
            window.location.href = 'tel:112';
            showToast('Initiating 112 Emergency Call...', 'error');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 20,
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--red)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          title="Direct emergency dial 112"
        >
          <PhoneCall size={13} />
          <span>112</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: notificationsOpen ? 'var(--bg3)' : 'rgba(30, 41, 59, 0.6)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text2)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s',
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 7,
                right: 7,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--red)',
                boxShadow: '0 0 6px var(--red)',
              }} />
            )}
          </button>

          {/* Notifications Panel */}
          {notificationsOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: 340,
              background: 'rgba(15, 23, 42, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-hover)',
              borderRadius: 16,
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
              overflow: 'hidden',
              zIndex: 100,
              animation: 'fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={{
                      fontSize: 10,
                      background: 'var(--red-dim)',
                      color: 'var(--red)',
                      padding: '1px 6px',
                      borderRadius: 10,
                      fontWeight: 700,
                    }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--green)',
                      fontSize: 11,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      onNavigate(n.page);
                      setNotificationsOpen(false);
                    }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: n.unread ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.unread ? 'rgba(16, 185, 129, 0.04)' : 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: n.type === 'alert' ? 'var(--red)' : 'var(--text)',
                      }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text3)' }}>{n.time}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.4 }}>
                      {n.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Card & Menu */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 10px 5px 6px',
              borderRadius: 24,
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              color: 'var(--text)',
              transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--purple), var(--blue))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: '#ffffff',
            }}>
              S
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Sathish S</div>
              <div style={{ fontSize: 10, color: 'var(--green)' }}>Level 3 • 340 XP</div>
            </div>
            <ChevronDown size={14} color="var(--text3)" />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: 220,
              background: 'rgba(15, 23, 42, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-hover)',
              borderRadius: 14,
              padding: 8,
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
              zIndex: 100,
              animation: 'fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Sathish S</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>sathish@healthai.local</div>
                <div style={{
                  marginTop: 6,
                  display: 'inline-block',
                  background: 'var(--green-dim)',
                  color: 'var(--green)',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 700,
                }}>
                  Premium Citizen
                </div>
              </div>

              {[
                { label: 'Family Profiles', page: 'family' },
                { label: 'Health Passport', page: 'passport' },
                { label: 'Settings & Security', page: 'settings' },
              ].map(item => (
                <div
                  key={item.page}
                  onClick={() => {
                    onNavigate(item.page);
                    setProfileOpen(false);
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    fontSize: 12.5,
                    color: 'var(--text2)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--bg3)';
                    e.currentTarget.style.color = 'var(--text)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text2)';
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
