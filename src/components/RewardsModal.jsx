import React, { useState } from 'react';
import {
  Trophy, Gift, CheckCircle2, Lock, Sparkles, X,
  ArrowRight, Flame, Shield, Award, ChevronRight
} from './Icons';
import { useGamification } from '../context/GamificationContext';

export default function RewardsModal({ onClose, onNavigate }) {
  const {
    xp,
    currentLevel,
    currentTier,
    nextTier,
    xpNeededForNext,
    levelProgressPct,
    streak,
    allTiers,
    quests,
    completeQuest,
    claimPrize,
  } = useGamification();

  const [activeTab, setActiveTab] = useState('prizes'); // 'prizes' | 'quests'

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(7, 11, 20, 0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 20,
        width: '100%',
        maxWidth: 640,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(16, 185, 129, 0.15)',
        animation: 'fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
              color: '#ffffff',
            }}>
              <Trophy size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                  Health Rewards & Level Hub
                </h2>
                <span style={{
                  fontSize: 11,
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--amber)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <Flame size={12} /> {streak}-Day Streak
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text2)', margin: '4px 0 0 0' }}>
                Complete health actions, unlock medical perks, and level up your care.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text3)',
              padding: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Level Status Banner */}
        <div style={{ padding: '16px 24px', background: 'rgba(30, 41, 59, 0.35)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{currentTier.badge}</span>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700 }}>
                  Level {currentLevel}: {currentTier.title}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 8 }}>
                  ({xp} Total XP)
                </span>
              </div>
            </div>

            {nextTier ? (
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--green)',
                background: 'var(--green-dim)',
                padding: '3px 10px',
                borderRadius: 12,
              }}>
                🎯 {xpNeededForNext} XP more needed for Level {nextTier.level}
              </span>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 700 }}>
                🏆 Maximum Tier Reached!
              </span>
            )}
          </div>

          {/* Progress bar towards next tier */}
          <div style={{ background: 'var(--bg3)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
            <div style={{
              width: `${levelProgressPct}%`,
              height: '100%',
              borderRadius: 6,
              background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
              transition: 'width 0.4s ease',
            }} />
          </div>

          {nextTier && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              color: 'var(--text3)',
              marginTop: 6,
            }}>
              <span>{currentTier.xpRequired} XP</span>
              <span style={{ color: 'var(--blue)', fontWeight: 600 }}>
                Next Prize: {nextTier.prize.split('+')[0]}
              </span>
              <span>{nextTier.xpRequired} XP</span>
            </div>
          )}
        </div>

        {/* Tab switch */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(15, 23, 42, 0.4)',
        }}>
          <button
            onClick={() => setActiveTab('prizes')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'prizes' ? '2px solid var(--green)' : '2px solid transparent',
              color: activeTab === 'prizes' ? 'var(--green)' : 'var(--text3)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s',
            }}
          >
            <Gift size={16} />
            <span>Prize Locker & Level Rewards</span>
          </button>
          <button
            onClick={() => setActiveTab('quests')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'quests' ? '2px solid var(--green)' : '2px solid transparent',
              color: activeTab === 'quests' ? 'var(--green)' : 'var(--text3)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s',
            }}
          >
            <Sparkles size={16} />
            <span>Daily Health Quests ({quests.filter(q => !q.completed).length} Available)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {activeTab === 'prizes' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {allTiers.map(t => {
                const isUnlocked = xp >= t.xpRequired;
                const isNext = nextTier && nextTier.level === t.level;
                const pointsRemaining = t.xpRequired - xp;

                return (
                  <div
                    key={t.level}
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      background: isUnlocked
                        ? 'rgba(16, 185, 129, 0.05)'
                        : isNext
                        ? 'rgba(56, 189, 248, 0.05)'
                        : 'rgba(30, 41, 59, 0.3)',
                      border: isUnlocked
                        ? '1px solid rgba(16, 185, 129, 0.25)'
                        : isNext
                        ? '1px solid rgba(56, 189, 248, 0.3)'
                        : '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 14,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: isUnlocked ? 'var(--green-dim)' : isNext ? 'var(--blue-dim)' : 'var(--bg3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        flexShrink: 0,
                      }}>
                        {t.badge}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700 }}>
                            Level {t.level}: {t.title}
                          </span>
                          <span style={{
                            fontSize: 10,
                            color: 'var(--text3)',
                            background: 'rgba(255, 255, 255, 0.06)',
                            padding: '1px 6px',
                            borderRadius: 6,
                          }}>
                            {t.xpRequired} XP
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: isUnlocked ? 'var(--text)' : 'var(--text2)', fontWeight: 600, marginTop: 2 }}>
                          🎁 {t.prize}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                          {t.prizeDesc}
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div style={{ flexShrink: 0 }}>
                      {isUnlocked ? (
                        <button
                          onClick={() => claimPrize(t.level)}
                          style={{
                            background: 'var(--green-dim)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: 'var(--green)',
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>Unlocked</span>
                        </button>
                      ) : (
                        <div style={{
                          textAlign: 'right',
                          padding: '6px 10px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                        }}>
                          <div style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Lock size={12} />
                            <span>Locked</span>
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', marginTop: 2 }}>
                            {pointsRemaining} XP needed
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Quests Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quests.map(q => (
                <div
                  key={q.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: q.completed ? 'rgba(16, 185, 129, 0.04)' : 'rgba(30, 41, 59, 0.4)',
                    border: q.completed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{q.icon}</span>
                    <div>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: q.completed ? 'line-through' : 'none',
                        color: q.completed ? 'var(--text3)' : 'var(--text)',
                      }}>
                        {q.label}
                      </div>
                      <span style={{
                        fontSize: 10,
                        color: 'var(--text3)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1px 6px',
                        borderRadius: 4,
                      }}>
                        {q.category}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: q.completed ? 'var(--text3)' : 'var(--green)',
                      background: q.completed ? 'transparent' : 'var(--green-dim)',
                      padding: '3px 8px',
                      borderRadius: 10,
                    }}>
                      +{q.xp} XP
                    </span>

                    {q.completed ? (
                      <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
                        Done ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => completeQuest(q.id)}
                        style={{
                          background: 'linear-gradient(135deg, var(--green), #059669)',
                          border: 'none',
                          color: '#ffffff',
                          padding: '6px 14px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
