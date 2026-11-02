import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Bell, AlertTriangle, User, ChevronDown,
  Menu, Sparkles, Activity, FileText, PhoneCall, Check, ExternalLink,
  Flame, Trophy, Gift, ShieldCheck
} from './Icons';
import { useNotification } from './NotificationContext';
import { useGamification } from '../context/GamificationContext';

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
  const {
    xp,
    currentLevel,
    currentTier,
    nextTier,
    xpNeededForNext,
    levelProgressPct,
    streak,
    setRewardsModalOpen,
  } = useGamification();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Active Dengue Outbreak',
      desc: 'HSR Layout (18km away) — 47 new cases reported. Preemptive watch active.',
      time: '10m ago',
      unread: true,
      type: 'alert',
      page: 'outbreak',
    },
    {
      id: 2,
      title: 'Level 4 Reward Available at 500 XP',
      desc: `You need only ${xpNeededForNext} XP more to unlock a Free Tele-Doctor Consultation Pass!`,
      time: '1h ago',
      unread: true,
      type: 'reward',
      page: 'dashboard',
    },
    {
      id: 3,
      title: 'Sleep Target Alert',
      desc: '6.8 hrs recorded last night — 20 mins below target 7.0 hrs.',
      time: '3h ago',
      unread: false,
      type: 'vitals',
      page: 'vitals',
    },
  ]);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Keyboard shortcut listener ('/' or 'Cmd+K' to focus search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
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
    { label: 'AI Health Concierge / Triage', page: 'checker', category: 'Clinical AI' },
    { label: 'Lab Report & Prescription OCR', page: 'lab', category: 'Diagnostics' },
    { label: 'Outbreak Alerts & Geo-Radar', page: 'outbreak', category: 'Surveillance' },
    { label: 'Health Data Vault (AES-256)', page: 'vault', category: 'Data Sovereignty' },
    { label: 'Health Passport (Verifiable QR)', page: 'passport', category: 'Digital Identity' },
    { label: 'Environmental Health & AQI Radar', page: 'environment', category: 'Environment' },
    { label: 'Vitals & Wearables Monitor', page: 'vitals', category: 'Biometrics' },
    { label: 'Hydration & Nutrition Planner', page: 'nutrition', category: 'Wellness' },
    { label: 'Gamification & Challenges', page: 'gamification', category: 'Rewards' },
    { label: 'Rural & Low-Bandwidth Mode', page: 'rural', category: 'Accessibility' },
  ];

  const filteredSearch = searchQuery.trim()
    ? navSearchItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header style={{
      height: 70,
      background: 'rgba(11, 17, 32, 0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
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
      {/* Left: Hamburger + Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, maxWidth: 520 }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            color: 'var(--text2)',
            padding: '8px 10px',
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

        {/* Search input with live auto-complete */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: searchFocused ? 'rgba(30, 41, 59, 0.9)' : 'rgba(30, 41, 59, 0.55)',
            border: searchFocused ? '1px solid var(--green)' : '1px solid var(--border)',
            boxShadow: searchFocused ? '0 0 16px rgba(16, 185, 129, 0.25)' : 'none',
            borderRadius: 12,
            padding: '8px 14px',
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
              placeholder="Search symptoms, lab tests, medicines... (Ctrl+K)"
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
              fontSize: 10.5,
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '2px 7px',
              borderRadius: 6,
              color: 'var(--text3)',
              fontFamily: 'var(--font-mono)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              ⌘K
            </span>
          </div>

          {/* Search Dropdown */}
          {searchFocused && filteredSearch.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'rgba(15, 23, 42, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-hover)',
              borderRadius: 14,
              padding: 8,
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
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
                    padding: '10px 14px',
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

      {/* Center/Right: Interactive Gamification Badges, Streak & Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Streak Indicator Pill */}
        <div
          onClick={() => setRewardsModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: 'var(--amber)',
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Daily Activity Streak — Click to view prizes"
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Flame size={15} color="var(--amber)" />
          <span>{streak}d Streak</span>
        </div>

        {/* Interactive Level & XP / Prize Progress Chip */}
        <div
          onClick={() => setRewardsModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '5px 14px 5px 10px',
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(6, 182, 212, 0.08) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          title="Click to open Prize Locker & Quests"
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Circular mini progress ring */}
          <div style={{ position: 'relative', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 36 36" width="26" height="26">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--green)"
                strokeWidth="3.5"
                strokeDasharray={`${levelProgressPct}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <span style={{ position: 'absolute', fontSize: 10, fontWeight: 800, color: '#ffffff' }}>
              {currentLevel}
            </span>
          </div>

          <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>
              {xp} <span style={{ fontSize: 10, color: 'var(--text3)' }}>XP</span>
            </div>
            {nextTier && (
              <div style={{ fontSize: 9.5, color: 'var(--green)', fontWeight: 600 }}>
                {xpNeededForNext} XP to Prize
              </div>
            )}
          </div>

          <Gift size={15} color="var(--blue)" />
        </div>

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
              width: 350,
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
                      if (n.type === 'reward') {
                        setRewardsModalOpen(true);
                      } else {
                        onNavigate(n.page);
                      }
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
                        color: n.type === 'alert' ? 'var(--red)' : n.type === 'reward' ? 'var(--green)' : 'var(--text)',
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
              <div style={{ fontSize: 10, color: 'var(--green)' }}>Level {currentLevel} • {currentTier.title}</div>
            </div>
            <ChevronDown size={14} color="var(--text3)" />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: 230,
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
                  Level {currentLevel} {currentTier.title}
                </div>
              </div>

              {[
                { label: '🎁 Prize Locker & Quests', action: () => setRewardsModalOpen(true) },
                { label: '👨‍👩‍👧 Family Profiles', action: () => onNavigate('family') },
                { label: '🪪 Health Passport', action: () => onNavigate('passport') },
                { label: '⚙️ Settings & Security', action: () => onNavigate('settings') },
              ].map(item => (
                <div
                  key={item.label}
                  onClick={() => {
                    item.action();
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
