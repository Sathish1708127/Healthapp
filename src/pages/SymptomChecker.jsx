import React, { useState, useRef, useEffect } from 'react';
import { Card, SectionTitle, AlertBanner, Btn, Badge, Grid } from '../components/UI';
import RichMessage from '../components/RichMessage';
import { queryHealthAI } from '../utils/aiEngine';

const API_URL = 'https://api.anthropic.com/v1/messages';
const SYSTEM_PROMPT = `You are HealthAI — an AI Health Concierge for a medical app used in India (Bengaluru).

YOUR CAPABILITIES:
You have access to these tools. If the user's request matches a tool, say "Let me check that for you..." and include a [TOOL:tool_name] marker in your response.

AVAILABLE TOOLS:
1. Symptom Triage — Assess symptoms with follow-up questions. Provide ASSESSMENT, HOME CARE, URGENCY (routine/soon/emergency)
2. Lab Report Analysis [TOOL:analyze_lab_photo] — User can upload a lab report photo for OCR + interpretation
3. Drug Interaction Check [TOOL:check_drug_interaction] — Check medications for interactions
4. Environmental Health [TOOL:get_environment] — AQI, UV, pollen, mosquito, temperature for their city
5. Health Vault [TOOL:read_vault] — Search and retrieve encrypted health documents
6. Health Passport QR [TOOL:generate_qr] — Generate verifiable QR for health credentials
7. Gamification Status [TOOL:get_gamification] — Check streaks, XP, badges, challenges
8. Health Summary [TOOL:get_health_summary] — Dashboard overview of vitals, symptoms, alerts

RULES:
- You are a TRIAGE and GUIDANCE tool, NOT a diagnosis tool
- Ask follow-up: duration, severity (1-10), body part, temperature, travel history, age, conditions, medications
- After info gathered, provide structured response:
  ASSESSMENT: [conditions with likelihood %]
  HOME CARE: [steps]
  URGENCY: [routine/soon/emergency]
- For dengue (fever + headache + body ache + rash): note Bengaluru outbreak
- ALWAYS escalate to emergency for: chest pain + arm pain, difficulty breathing, loss of consciousness
- For environment/lab/vault requests: say "Let me pull that up for you..." and use [TOOL:tool_name]
- Keep responses conversational, empathetic, with line breaks
- Add "⚠️ Not a substitute for medical advice" in final assessments

The user can also upload lab report photos for analysis. Instruct them to use the upload button below.`;

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '8px 0' }}>
      {[0, 150, 300].map(delay => (
        <div key={delay} style={{
          width: 6, height: 6, borderRadius: '50%', background: 'var(--green)',
          animation: 'bounce 1s infinite', animationDelay: `${delay}ms`
        }} />
      ))}
    </div>
  );
}

export default function SymptomChecker({ onNavigate }) {
  const [messages, setMessages] = useState([{
    role: 'ai',
    text: "🤖 **Hi! I'm your AI Health Concierge.**\n\nTell me what's going on — describe your symptoms, ask about your environment, check medications, or access your health vault.\n\n**Examples:**\n• \"I have fever and headache\" → Symptom triage\n• \"Check my lab report\" → Upload photo → AI analyzes it\n• \"What's the AQI today?\" → Environmental check\n• \"Show my blood reports\" → Vault search\n\n⚠️ This is a guidance tool, not a diagnosis.\n🚨 For emergencies, call 112."
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [triageResult, setTriageResult] = useState(null);
  const [showChips, setShowChips] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTools, setActiveTools] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setShowChips(false);
    setUploadedFile(null);
    const newHistory = [...history, { role: 'user', content: msg }];
    setHistory(newHistory);
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const response = await queryHealthAI(msg, newHistory, {
        vitals: { hr: 72, temp: 98.4, spo2: 98 },
        activePage: 'checker',
      });
      let reply = response.text || 'I have analyzed your query.';

      // Check for tool invocation markers
      const toolMatch = reply.match(/\[TOOL:(\w+)\]/);
      if (toolMatch) {
        const toolId = toolMatch[1];
        setActiveTools(prev => ({ ...prev, [toolId]: true }));
        const toolResult = await executeToolAction(toolId, msg);
        if (toolResult) {
          reply += '\n\n' + toolResult.summary;
          setMessages(prev => [...prev, { role: 'ai', text: reply, type: 'tool_result', toolId, data: toolResult.data }]);
        } else {
          setMessages(prev => [...prev, { role: 'ai', text: reply }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: reply }]);
      }

      setHistory(prev => [...prev, { role: 'assistant', content: reply }]);

      if (response.triageLevel) {
        setTriageResult({ level: response.triageLevel });
      } else if (reply.includes('ASSESSMENT:') || reply.includes('URGENCY:')) {
        const isEmergency = reply.toLowerCase().includes('emergency');
        const isSoon = reply.toLowerCase().includes('soon');
        setTriageResult({ level: isEmergency ? 'emergency' : isSoon ? 'soon' : 'routine' });
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'I encountered an error connecting to the clinical triage service. Please try again.' }]);
    }
    setLoading(false);
  };

  const executeToolAction = async (toolId, query) => {
    try {
      const { executeTool } = await import('../utils/conciergeTools');
      const result = await executeTool(toolId, { query, text: query, city: 'Bengaluru' });
      return result;
    } catch {
      return null;
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setShowChips(false);

    const userMsg = `📎 [Uploaded: ${file.name}]`;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const { performOCR } = await import('../utils/ocr');
      const ocrResult = await performOCR(file);
      const ocrText = ocrResult?.text || '';

      if (ocrText && ocrText.length > 20) {
        // Try lab report parsing
        const { parseLabReport, generateLabSummary, parsePrescription } = await import('../utils/labAnalyzer');
        const labResults = parseLabReport(ocrText);
        if (labResults.length > 0) {
          const summary = generateLabSummary(labResults);
          setAnalysisResult({ type: 'lab', data: labResults, summary });
          setMessages(prev => [...prev, {
            role: 'ai', text: `🔬 **Lab Report Analyzed!**\n\n${summary}\n\nView full details in the Lab Analyzer page.`,
            type: 'tool_result', toolId: 'analyze_lab_photo',
            data: { summary, abnormal: labResults.filter(r => r.status !== 'normal'), normal: labResults.filter(r => r.status === 'normal').map(r => `${r.name}: ${r.value} ${r.unit}`) },
          }]);
        } else {
          // Try prescription parsing
          const meds = parsePrescription(ocrText);
          if (meds.length > 0) {
            const medList = meds.map(m => `💊 ${m.drug}${m.amount ? ' — ' + m.amount + m.unit : ''}${m.frequency ? ' (' + m.frequency + ')' : ''}`).join('\n');
            setMessages(prev => [...prev, {
              role: 'ai', text: `💊 **Prescription Parsed!**\n\nExtracted ${meds.length} medication(s):\n${medList}\n\nView full details in the Lab Analyzer page.`,
              type: 'tool_result', toolId: 'analyze_lab_photo',
              data: { summary: `${meds.length} medications extracted`, abnormal: [], normal: meds.map(m => `${m.drug} ${m.amount || ''}`) },
            }]);
          } else {
            setMessages(prev => [...prev, {
              role: 'ai', text: `📄 Text extracted from ${file.name}. Could not identify structured lab values. You can paste the text manually in the Lab Analyzer page for better results.\n\nExtracted text preview:\n\`\`\`\n${ocrText.slice(0, 500)}\n\`\`\``,
            }]);
          }
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'ai', text: `⚠️ Could not extract enough text from ${file.name}. Try a clearer image or type/paste the values manually in the Lab Analyzer page.`,
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai', text: `❌ Error analyzing file: ${err.message}. Try typing the values manually.`,
      }]);
    }
    setLoading(false);
  };

  const quickChips = [
    { label: '🤒 Fever + headache', tooltip: 'Check symptoms' },
    { label: '🔬 Analyze my lab report', tooltip: 'Upload & analyze' },
    { label: '🌤️ What\'s the AQI?', tooltip: 'Environment check' },
    { label: '💊 Check drug interaction', tooltip: 'Medication safety' },
    { label: '🔐 Show my health vault', tooltip: 'Vault search' },
    { label: '🏆 My gamification status', tooltip: 'XP & badges' },
    { label: '📊 Health summary', tooltip: 'Dashboard overview' },
  ];

  const triageColors = {
    emergency: { bg: 'var(--red-dim)', color: 'var(--red)', text: '🚨 Emergency — Seek care now' },
    soon: { bg: 'var(--amber-dim)', color: 'var(--amber)', text: '⚡ See doctor soon' },
    routine: { bg: 'var(--green-dim)', color: 'var(--green)', text: '✅ Routine monitoring' },
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>🤖 AI Health Concierge</div>
          <Badge color="green">Claude + Local Tools</Badge>
          <Badge color="blue">7 Integrated Tools</Badge>
        </div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
          Your unified health assistant. Chat naturally to check symptoms, analyze lab reports, check medications,
          monitor environment, access your vault, and more.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
        {/* Chat area */}
        <Card style={{ height: 'calc(70vh + 60px)', display: 'flex', flexDirection: 'column' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 8 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: msg.role === 'user' ? 12 : 14, fontWeight: 600, flexShrink: 0,
                  background: msg.role === 'user' ? 'var(--blue-dim)' : 'var(--green-dim)',
                  color: msg.role === 'user' ? 'var(--blue)' : 'var(--green)',
                }}>
                  {msg.role === 'user' ? 'S' : '🤖'}
                </div>
                <div style={{ maxWidth: msg.type === 'tool_result' ? '85%' : '75%' }}>
                  {msg.type === 'tool_result' ? (
                    <>
                      <div style={{
                        padding: '11px 15px', borderRadius: 12, fontSize: 13.5, lineHeight: 1.6,
                        background: 'var(--bg3)', border: '1px solid var(--border)', whiteSpace: 'pre-wrap',
                      }}>{msg.text}</div>
                      <RichMessage message={msg} />
                    </>
                  ) : (
                    <div style={{
                      padding: '11px 15px', borderRadius: 12, fontSize: 13.5, lineHeight: 1.6,
                      background: msg.role === 'user' ? 'var(--blue-dim)' : 'var(--bg3)',
                      border: `1px solid ${msg.role === 'user' ? 'rgba(79,158,255,0.2)' : 'var(--border)'}`,
                      whiteSpace: 'pre-wrap',
                    }}>{msg.text}</div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                <div style={{ padding: '8px 15px', borderRadius: 12, background: 'var(--bg3)', border: '1px solid var(--border)' }}>
                  <ThinkingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips */}
          {showChips && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {quickChips.map(chip => (
                <span key={chip.label} onClick={() => sendMessage(chip.label)} style={{
                  padding: '5px 12px', borderRadius: 20, background: 'var(--bg3)', border: '1px solid var(--border)',
                  fontSize: 12, color: 'var(--text2)', cursor: 'pointer', transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }} title={chip.tooltip}>{chip.label}</span>
              ))}
            </div>
          )}

          {/* File upload bar */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf"
              onChange={handleFileUpload} style={{ display: 'none' }} />
            <Btn variant="outline" onClick={() => fileInputRef.current?.click()}
              disabled={loading} style={{ fontSize: 12, padding: '6px 12px' }}>
              📎 Upload Lab/Prescription
            </Btn>
            {uploadedFile && (
              <span style={{ fontSize: 11, color: 'var(--green)', alignSelf: 'center' }}>
                ✅ {uploadedFile.name}
              </span>
            )}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: 10 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              rows={2}
              placeholder="Ask anything: symptoms, lab reports, environment, medications..."
              style={{
                flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 10,
                padding: '11px 14px', fontSize: 13.5, color: 'var(--text)', outline: 'none',
                resize: 'none', fontFamily: 'inherit',
              }}
            />
            <Btn onClick={() => sendMessage()} disabled={loading || !input.trim()}>Send</Btn>
          </div>
        </Card>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {triageResult && (
            <Card>
              <SectionTitle>Triage Assessment</SectionTitle>
              <div style={{ padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13, fontWeight: 600, background: triageColors[triageResult.level].bg, color: triageColors[triageResult.level].color }}>
                {triageColors[triageResult.level].text}
              </div>
              <Btn variant="outline" onClick={() => onNavigate('treatment')} style={{ width: '100%', fontSize: 12 }}>View treatment guide →</Btn>
            </Card>
          )}

          {/* Active tools */}
          <Card>
            <SectionTitle>Available Tools</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { id: 'symptom', icon: '🩺', label: 'Symptom Triage', desc: 'Multi-symptom AI assessment' },
                { id: 'lab', icon: '🔬', label: 'Lab Analyzer', desc: 'OCR + reference range check', onClick: () => onNavigate('lab') },
                { id: 'environment', icon: '🌤️', label: 'Health Radar', desc: 'AQI, UV, pollen alerts', onClick: () => onNavigate('environment') },
                { id: 'vault', icon: '🔐', label: 'Health Vault', desc: 'Encrypted document search', onClick: () => onNavigate('vault') },
                { id: 'passport', icon: '🪪', label: 'Health Passport', desc: 'QR credentials', onClick: () => onNavigate('passport') },
                { id: 'gamification', icon: '🏆', label: 'Gamification', desc: 'XP, badges, streaks', onClick: () => onNavigate('gamification') },
              ].map(tool => (
                <div key={tool.id} onClick={tool.onClick}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    borderRadius: 8, cursor: tool.onClick ? 'pointer' : 'default',
                    background: activeTools[tool.id] ? 'var(--green-dim)' : 'var(--bg3)',
                    border: '1px solid var(--border)', transition: 'all 0.15s',
                  }}>
                  <span style={{ fontSize: 16 }}>{tool.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{tool.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>{tool.desc}</div>
                  </div>
                  {tool.onClick && <span style={{ fontSize: 10, color: 'var(--green)' }}>Open →</span>}
                </div>
              ))}
            </div>
          </Card>

          {/* Lab analysis result summary */}
          {analysisResult && (
            <Card>
              <SectionTitle>🔬 Latest Analysis</SectionTitle>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
                {analysisResult.type === 'lab'
                  ? `${analysisResult.data.length} values parsed`
                  : `${analysisResult.data.length} medications extracted`}
              </div>
              <Btn variant="outline" onClick={() => onNavigate('lab')}
                style={{ width: '100%', fontSize: 12 }}>
                View full details →
              </Btn>
            </Card>
          )}

          <Card>
            <SectionTitle>Emergency</SectionTitle>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.8 }}>
              🚨 Chest pain + arm pain<br/>
              🚨 Difficulty breathing<br/>
              🚨 Severe bleeding<br/>
              🚨 Unconsciousness<br/>
              🚨 High fever in infants
            </div>
            <div style={{ marginTop: 8, padding: 10, background: 'var(--red-dim)', borderRadius: 8, fontSize: 12, color: 'var(--red)' }}>
              Call 112 immediately. Do not wait.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

