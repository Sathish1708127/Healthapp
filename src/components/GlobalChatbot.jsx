import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, X, Send, Mic, MicOff, Volume2, VolumeX,
  Maximize2, Minimize2, Sparkles, AlertCircle, Bot, ArrowRight,
  ShieldCheck, RefreshCw
} from './Icons';
import { queryHealthAI } from '../utils/aiEngine';
import { useNotification } from './NotificationContext';

export default function GlobalChatbot({ activePage, onNavigate, userVitals }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();

  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: "👋 **Hello! I'm your HealthAI Copilot.**\n\nI'm ready across all pages. Ask me about symptoms, upload or review lab results, verify medication safety, or check environmental factors.",
      actions: [
        { label: '🤒 I have a fever & body ache', prompt: 'I have a fever, headache, and body aches since yesterday.' },
        { label: '🌤️ Is AQI safe today?', prompt: 'What is the air quality and is it safe for outdoor running?' },
        { label: '🔬 Check normal HbA1c', prompt: 'What are normal HbA1c and Vitamin D reference ranges?' },
      ],
      time: 'Just now',
    },
  ]);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, isOpen]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        showToast(`Heard: "${transcript}"`, 'info', 2000);
      };

      recognition.onerror = () => {
        setIsListening(false);
        showToast('Voice input cancelled or not permitted', 'warning', 2500);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [showToast]);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      showToast('Speech recognition not supported in this browser', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        showToast('Listening... Speak now', 'info', 2000);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const speakText = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (manualText) => {
    const textToSend = (manualText || input).trim();
    if (!textToSend || loading) return;

    setInput('');
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await queryHealthAI(textToSend, messages, {
        activePage,
        vitals: userVitals,
      });

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.text,
        triageLevel: response.triageLevel,
        actions: response.actions,
        source: response.source,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
      speakText(response.text);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          text: '⚠️ I encountered an unexpected error. Please try asking again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    if (action.prompt) {
      handleSend(action.prompt);
      return;
    }

    if (action.action === 'call_112') {
      window.location.href = 'tel:112';
      showToast('Calling 112 Emergency...', 'error');
      return;
    }

    if (action.action?.startsWith('navigate_')) {
      const pageTarget = action.action.replace('navigate_', '');
      onNavigate(pageTarget);
      showToast(`Navigated to ${pageTarget.toUpperCase()}`, 'success', 2000);
      if (window.innerWidth < 768) setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Action Launcher (When closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 20px',
            borderRadius: 50,
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4), 0 0 15px rgba(6, 182, 212, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.5), 0 0 20px rgba(6, 182, 212, 0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.4), 0 0 15px rgba(6, 182, 212, 0.3)';
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Bot size={22} />
            <div style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 0 6px #ffffff',
            }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' }}>
            AI Health Copilot
          </span>
          <span style={{
            fontSize: 10,
            background: 'rgba(255, 255, 255, 0.25)',
            padding: '2px 7px',
            borderRadius: 12,
            fontWeight: 700,
          }}>
            Live
          </span>
        </button>
      )}

      {/* Floating Chat Window (When Open) */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: isExpanded ? 0 : 20,
          right: isExpanded ? 0 : 20,
          width: isExpanded ? '100vw' : '420px',
          height: isExpanded ? '100vh' : '640px',
          maxHeight: 'calc(100vh - 40px)',
          maxWidth: 'calc(100vw - 40px)',
          background: 'rgba(11, 17, 32, 0.94)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: isExpanded ? 0 : 20,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.75), 0 0 30px rgba(16, 185, 129, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            background: 'rgba(15, 23, 42, 0.8)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--green), #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                position: 'relative',
              }}>
                <Bot size={20} />
                <div style={{
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '2px solid #0f172a',
                }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>HealthAI Copilot</span>
                  <span style={{
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 8,
                    background: 'var(--green-dim)',
                    color: 'var(--green)',
                    fontWeight: 600,
                  }}>
                    Active
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  Viewing: <span style={{ color: 'var(--blue)', textTransform: 'capitalize' }}>{activePage}</span>
                </div>
              </div>
            </div>

            {/* Header Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* TTS Audio toggle */}
              <button
                onClick={() => {
                  setTtsEnabled(!ttsEnabled);
                  showToast(ttsEnabled ? 'Voice readout muted' : 'Voice readout enabled', 'info', 1500);
                }}
                style={{
                  background: ttsEnabled ? 'var(--green-dim)' : 'transparent',
                  border: 'none',
                  color: ttsEnabled ? 'var(--green)' : 'var(--text3)',
                  padding: 6,
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={ttsEnabled ? 'Disable speech output' : 'Enable speech output'}
              >
                {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {/* Expand/Collapse */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text3)',
                  padding: 6,
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={isExpanded ? 'Restore window size' : 'Expand full screen'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text3)',
                  padding: 6,
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Minimize assistant"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            {messages.map(m => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '88%',
                  padding: '12px 16px',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg, #2563eb, #0284c7)'
                    : 'rgba(30, 41, 59, 0.75)',
                  border: m.role === 'user'
                    ? '1px solid rgba(255, 255, 255, 0.15)'
                    : m.triageLevel === 'emergency'
                    ? '1px solid rgba(244, 63, 94, 0.4)'
                    : '1px solid var(--border)',
                  color: 'var(--text)',
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  boxShadow: m.role === 'user'
                    ? '0 4px 14px rgba(37, 99, 235, 0.25)'
                    : '0 4px 12px rgba(0, 0, 0, 0.25)',
                }}>
                  {m.text}

                  {/* Actions / Suggestion Pills inside Assistant bubble */}
                  {m.actions && m.actions.length > 0 && (
                    <div style={{
                      marginTop: 12,
                      paddingTop: 10,
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                    }}>
                      {m.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          style={{
                            background: act.primary
                              ? 'linear-gradient(135deg, var(--green), #059669)'
                              : 'rgba(255, 255, 255, 0.06)',
                            border: `1px solid ${act.primary ? 'transparent' : 'rgba(255, 255, 255, 0.15)'}`,
                            color: act.primary ? '#ffffff' : 'var(--text2)',
                            borderRadius: 16,
                            padding: '5px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            if (!act.primary) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            if (!act.primary) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                          }}
                        >
                          <span>{act.label}</span>
                          <ArrowRight size={12} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timestamp & Source badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 10,
                  color: 'var(--text3)',
                  marginTop: 4,
                  padding: '0 4px',
                }}>
                  <span>{m.time}</span>
                  {m.source && (
                    <span style={{ color: 'var(--green)', opacity: 0.8 }}>
                      • {m.source}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'var(--green-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--green)',
                }}>
                  <RefreshCw size={14} className="spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                  Analyzing symptoms & local outbreak context...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Page Suggestions */}
          <div style={{
            padding: '8px 14px',
            background: 'rgba(15, 23, 42, 0.5)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
          }}>
            {[
              '🤒 Dengue precautions in Bengaluru',
              '💓 Interpret my vitals',
              '💊 Can I take Paracetamol with Metformin?',
            ].map(q => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '4px 10px',
                  borderRadius: 14,
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  color: 'var(--text3)',
                  fontSize: 11,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--text)';
                  e.currentTarget.style.borderColor = 'var(--green)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text3)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div style={{
            padding: 12,
            background: 'rgba(15, 23, 42, 0.9)',
            borderTop: '1px solid var(--border)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg3)',
              borderRadius: 12,
              padding: '6px 10px',
              border: isListening ? '1px solid var(--red)' : '1px solid var(--border2)',
              boxShadow: isListening ? '0 0 10px rgba(244, 63, 94, 0.3)' : 'none',
              transition: 'border 0.2s',
            }}>
              {/* Voice button */}
              <button
                onClick={toggleVoiceListening}
                style={{
                  background: isListening ? 'var(--red-dim)' : 'transparent',
                  border: 'none',
                  color: isListening ? 'var(--red)' : 'var(--text3)',
                  padding: 6,
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s',
                }}
                title={isListening ? 'Stop listening' : 'Speak using microphone'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isListening ? 'Listening to voice...' : 'Ask HealthAI about any symptom or report...'}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text)',
                  fontSize: 13.5,
                }}
              />

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                style={{
                  background: input.trim() && !loading
                    ? 'linear-gradient(135deg, var(--green), #059669)'
                    : 'transparent',
                  border: 'none',
                  color: input.trim() && !loading ? '#ffffff' : 'var(--text3)',
                  padding: '7px 10px',
                  borderRadius: 8,
                  cursor: input.trim() && !loading ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <Send size={16} />
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              fontSize: 10,
              color: 'var(--text3)',
              marginTop: 8,
            }}>
              <ShieldCheck size={12} color="var(--green)" />
              <span>Guidance tool only. For life-threatening emergencies, call 112 immediately.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
