import React, { useState, useRef, useEffect } from 'react';
import { Card, SectionTitle, Badge, Btn, Grid, Divider, Tag, AlertBanner } from '../components/UI';
import { parseLabReport, parsePrescription, generateLabSummary, checkDrugInteractions, REFERENCE_RANGES } from '../utils/labAnalyzer';
import { performOCR } from '../utils/ocr';

const STATUS_STYLES = {
  normal: { bg: 'rgba(16,217,152,0.1)', color: 'var(--green)', label: '✅ Normal' },
  borderline: { bg: 'rgba(255,184,79,0.1)', color: 'var(--amber)', label: '⚠️ Borderline' },
  abnormal: { bg: 'rgba(255,90,106,0.1)', color: 'var(--red)', label: '🔴 Abnormal' },
  critical: { bg: 'rgba(255,90,106,0.2)', color: 'var(--red)', label: '🚨 Critical' },
  low: { bg: 'rgba(79,158,255,0.1)', color: 'var(--blue)', label: '↓ Low' },
  high: { bg: 'rgba(255,184,79,0.1)', color: 'var(--amber)', label: '↑ High' },
  unknown: { bg: 'var(--bg3)', color: 'var(--text3)', label: '— Unknown' },
};

export default function LabAnalyzer() {
  const [mode, setMode] = useState('lab'); // 'lab' | 'prescription'
  const [results, setResults] = useState([]);
  const [medications, setMedications] = useState([]);
  const [summary, setSummary] = useState('');
  const [interactions, setInteractions] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [rawText, setRawText] = useState('');
  const [activeTab, setActiveTab] = useState('results');
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    // Load history from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('healthai_lab_history') || '[]');
      setHistory(saved);
    } catch {}
  }, []);

  const saveToHistory = (type, data, text) => {
    const entry = {
      id: Date.now().toString(36),
      type,
      data,
      text: text?.slice(0, 500),
      date: new Date().toISOString(),
    };
    const updated = [entry, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem('healthai_lab_history', JSON.stringify(updated));
  };

  const handleImageAnalysis = async (file) => {
    if (!file) return;
    setAnalyzing(true);
    setResults([]);
    setMedications([]);
    setInteractions([]);

    try {
      const ocrResult = await performOCR(file);
      const ocrText = ocrResult.text || '';

      if (!ocrText || ocrText.length < 10) {
        alert('Could not extract text from this image. Try a clearer photo or type/paste the text manually.');
        setRawText('');
        setAnalyzing(false);
        return;
      }

      setRawText(ocrText);

      if (mode === 'lab') {
        const parsed = parseLabReport(ocrText);
        setResults(parsed);
        setSummary(generateLabSummary(parsed));
        saveToHistory('lab', parsed, ocrText);
      } else {
        const meds = parsePrescription(ocrText);
        setMedications(meds);
        const warnings = checkDrugInteractions(meds);
        setInteractions(warnings);
        saveToHistory('prescription', meds, ocrText);
      }
    } catch (err) {
      alert('Analysis failed: ' + err.message);
    }
    setAnalyzing(false);
  };

  const handleManualText = () => {
    if (!rawText.trim()) return;
    if (mode === 'lab') {
      const parsed = parseLabReport(rawText);
      setResults(parsed);
      setSummary(generateLabSummary(parsed));
      saveToHistory('lab', parsed, rawText);
    } else {
      const meds = parsePrescription(rawText);
      setMedications(meds);
      const warnings = checkDrugInteractions(meds);
      setInteractions(warnings);
      saveToHistory('prescription', meds, rawText);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      handleImageAnalysis(file);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Color status bar chart
  const maxResultCount = Math.max(...results.map(r => r.value || 0), 1);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>🔬 Lab Report & Prescription Analyzer</div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
          100% on-device. No data uploaded. Tesseract.js OCR + India-specific reference ranges.
        </div>
      </div>

      {/* Mode toggle */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant={mode === 'lab' ? 'green' : 'outline'} onClick={() => { setMode('lab'); setResults([]); setMedications([]); }}>
            🔬 Lab Report Analysis
          </Btn>
          <Btn variant={mode === 'prescription' ? 'green' : 'outline'} onClick={() => { setMode('prescription'); setResults([]); setMedications([]); }}>
            💊 Prescription Parser
          </Btn>
        </div>
      </Card>

      <Grid cols={2} gap={20}>
        {/* Left: Input */}
        <div>
          {/* Upload area */}
          <Card
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            style={{
              padding: 30, textAlign: 'center', marginBottom: 14,
              border: '2px dashed var(--border2)', cursor: 'pointer',
            }}
            onClick={openFilePicker}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>{mode === 'lab' ? '📋' : '💊'}</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 4 }}>
              {analyzing ? '🔍 Analyzing...' : 'Click or drag & drop a photo'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              Supports: Lab reports, Prescriptions, Medical documents
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
              <Tag>JPEG/PNG</Tag>
              <Tag>Max 10MB</Tag>
              <Tag>On-device OCR</Tag>
              <Tag>No cloud upload</Tag>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf"
              onChange={e => handleImageAnalysis(e.target.files[0])}
              style={{ display: 'none' }} />
          </Card>

          {/* Manual text input */}
          <Card>
            <SectionTitle>Or Paste Text Manually</SectionTitle>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              rows={6}
              placeholder={mode === 'lab'
                ? 'Paste lab report text here...\ne.g.\nHemoglobin: 14.2 g/dL\nWBC: 7800 /µL\nPlatelets: 250000 /µL'
                : 'Paste prescription text here...\ne.g.\nTab. Paracetamol 500mg twice daily\nTab. Amoxicillin 250mg three times a day'}
              style={{
                width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 10,
                padding: '11px 14px', fontSize: 13, color: 'var(--text)', outline: 'none',
                resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 10,
              }}
            />
            <Btn onClick={handleManualText} disabled={!rawText.trim() || analyzing} style={{ width: '100%' }}>
              {analyzing ? 'Analyzing...' : `Parse ${mode === 'lab' ? 'Lab Report' : 'Prescription'}`}
            </Btn>
          </Card>

          {/* Quick sample */}
          <Card style={{ marginTop: 14 }}>
            <SectionTitle>Try Sample</SectionTitle>
            <Btn variant="outline" onClick={() => {
              setRawText(`Hemoglobin: 14.2 g/dL (13.5-17.5)
WBC Count: 7800 /µL (4000-11000)
Platelets: 250000 /µL (150000-450000)
Fasting Glucose: 95 mg/dL (70-110)
HbA1c: 6.8% (4.0-5.7)
Total Cholesterol: 195 mg/dL (125-200)
Vitamin D (25-OH): 14 ng/mL (20-50)
TSH: 2.8 µIU/mL (0.5-5.0)
Creatinine: 0.9 mg/dL (0.6-1.2)
ALT/SGPT: 32 U/L (7-56)`);
            }} style={{ fontSize: 12 }}>
              Load sample lab report
            </Btn>
          </Card>
        </div>

        {/* Right: Results */}
        <div>
          {analyzing ? (
            <Card style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 8 }}>Analyzing...</div>
              <div style={{ animation: 'bounce 1s infinite', display: 'flex', gap: 4, justifyContent: 'center' }}>
                {[0, 150, 300].map(d => <div key={d} style={{
                  width: 8, height: 8, borderRadius: '50%', background: 'var(--green)',
                  animation: 'bounce 1s infinite', animationDelay: `${d}ms`,
                }} />)}
              </div>
            </Card>
          ) : mode === 'lab' && results.length > 0 ? (
            <>
              {/* Summary */}
              {summary && (
                <AlertBanner type={summary.includes('🚨') ? 'red' : summary.includes('⚠️') ? 'amber' : 'green'}>
                  <div style={{ whiteSpace: 'pre-line', fontSize: 12 }}>{summary}</div>
                </AlertBanner>
              )}

              {/* Results Table */}
              <Card>
                <SectionTitle>Parsed Results ({results.length})</SectionTitle>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)', fontSize: 11 }}>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>Test</th>
                        <th style={{ textAlign: 'right', padding: '6px 8px' }}>Value</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>Unit</th>
                        <th style={{ textAlign: 'left', padding: '6px 8px' }}>Range</th>
                        <th style={{ textAlign: 'center', padding: '6px 8px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => {
                        const ss = STATUS_STYLES[r.status] || STATUS_STYLES.unknown;
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '7px 8px', fontWeight: 500 }}>{r.name}</td>
                            <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 700, color: ss.color }}>
                              {r.value}
                            </td>
                            <td style={{ padding: '7px 8px', color: 'var(--text2)' }}>{r.unit}</td>
                            <td style={{ padding: '7px 8px', color: 'var(--text2)' }}>{r.range || '—'}</td>
                            <td style={{ padding: '7px 8px', textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-flex', padding: '2px 8px', borderRadius: 4,
                                fontSize: 10, fontWeight: 600, background: ss.bg, color: ss.color,
                              }}>{ss.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Visual chart */}
              <Card style={{ marginTop: 14 }}>
                <SectionTitle>Value Distribution</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {results.filter(r => r.low && r.high).slice(0, 10).map((r, i) => {
                    const range = r.high - r.low;
                    const pos = ((r.value - r.low) / range) * 100;
                    const clampedPos = Math.max(0, Math.min(100, pos));
                    const ss = STATUS_STYLES[r.status] || STATUS_STYLES.unknown;
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                          <span>{r.name}</span>
                          <span style={{ color: ss.color }}>{r.value} {r.unit}</span>
                        </div>
                        <div style={{ background: 'var(--bg3)', borderRadius: 3, height: 6, position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', left: `${(r.low / (r.high * 1.3)) * 100}%`, right: `${100 - (r.high / (r.high * 1.3)) * 100}%`, top: 0, bottom: 0, background: 'rgba(16,217,152,0.15)', borderRadius: 3 }} />
                          <div style={{ width: 4, height: 6, borderRadius: 2, background: ss.color, marginLeft: `${clampedPos}%`, transition: 'margin-left 0.5s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          ) : mode === 'prescription' && medications.length > 0 ? (
            <>
              <Card>
                <SectionTitle>Parsed Medications ({medications.length})</SectionTitle>
                {medications.map((med, i) => (
                  <div key={i} style={{
                    padding: 10, marginBottom: 8, borderRadius: 8,
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>💊 {med.drug}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 12, color: 'var(--text2)' }}>
                      {med.amount && <span>Dosage: {med.amount} {med.unit}</span>}
                      {med.frequency && <span>Frequency: {med.frequency}</span>}
                    </div>
                  </div>
                ))}
              </Card>

              {interactions.length > 0 && (
                <Card style={{ marginTop: 14 }}>
                  <SectionTitle>⚠️ Drug Interactions</SectionTitle>
                  {interactions.map((w, i) => (
                    <div key={i} style={{
                      padding: 10, marginBottom: 8, borderRadius: 8,
                      background: 'var(--red-dim)', border: '1px solid rgba(255,90,106,0.2)',
                      fontSize: 13,
                    }}>
                      <strong>{w.drugs.join(' + ')}</strong>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{w.advice}</div>
                    </div>
                  ))}
                </Card>
              )}

              {interactions.length === 0 && (
                <Card>
                  <AlertBanner type="green">✅ No drug interactions found between identified medications.</AlertBanner>
                </Card>
              )}
            </>
          ) : (
            <Card style={{ textAlign: 'center', padding: 50, color: 'var(--text3)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔬</div>
              <div style={{ fontSize: 14, marginBottom: 6 }}>
                {mode === 'lab' ? 'Upload or paste a lab report' : 'Upload or paste a prescription'}
              </div>
              <div style={{ fontSize: 12 }}>
                All processing happens on your device. No data is uploaded.
              </div>
            </Card>
          )}
        </div>
      </Grid>

      {/* History */}
      {history.length > 0 && (
        <Card style={{ marginTop: 20 }}>
          <SectionTitle>Analysis History</SectionTitle>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {history.slice(0, 10).map(h => (
              <span key={h.id} onClick={() => {
                if (h.type === 'lab') {
                  setMode('lab');
                  setResults(h.data);
                  setSummary(generateLabSummary(h.data));
                } else {
                  setMode('prescription');
                  setMedications(h.data);
                  setInteractions(checkDrugInteractions(h.data));
                }
                setRawText(h.text || '');
              }} style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)',
              }}>
                {h.type === 'lab' ? '🔬' : '💊'} {new Date(h.date).toLocaleDateString()}
              </span>
            ))}
          </div>
        </Card>
      )}

      <AlertBanner type="amber" style={{ marginTop: 14 }}>
        <strong>Medical Disclaimer:</strong> This tool is for informational purposes. Reference ranges are approximate.
        Always consult a qualified healthcare provider for interpretation of your lab results.
      </AlertBanner>
    </div>
  );
}

