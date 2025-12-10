import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Loader2,
  Copy,
  Check,
  FileDown,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { useSpeechStore } from './stores/speechStore';
import { SpeechResult } from './components/SpeechResult';
import { Settings } from './components/Settings';
import { TitleBar } from './components/TitleBar';
import { generateSpeech } from './services/llmService';
import { exportToPDF } from './services/pdfService';
import type { SpeechParams, PDFTemplate, ToneType, DurationType, AudienceType } from './types';
import logoImage from './assets/logo.png';

const tones: { value: ToneType; label: string }[] = [
  { value: 'oficjalny', label: 'Official/Motivational' },
  { value: 'motywacyjny', label: 'Motivational' },
  { value: 'casual', label: 'Casual' },
  { value: 'akademicki', label: 'Academic' },
  { value: 'emocjonalny', label: 'Emotional' },
  { value: 'humorystyczny', label: 'Humorous' },
];

const durations: { value: DurationType; label: string }[] = [
  { value: '2 minuty', label: '2 minutes' },
  { value: '5 minut', label: '5 minutes' },
  { value: '10 minut', label: '10 minutes' },
  { value: '15 minut', label: '15 minutes' },
  { value: '20+ minut', label: '20+ minutes' },
];

const audiences: { value: AudienceType; label: string }[] = [
  { value: 'biznesowi', label: 'Business' },
  { value: 'studenci', label: 'Students' },
  { value: 'ogólna publiczność', label: 'General' },
  { value: 'eksperci', label: 'Experts' },
  { value: 'mieszana', label: 'Mixed' },
];

function App() {
  const {
    currentResult,
    setResult,
    setGenerating,
    setProgress,
    setError,
    addToHistory,
    apiKeys,
    isDarkMode,
    toggleTheme,
    history,
    isGenerating,
    generationProgress,
    error,
    setParams,
  } = useSpeechStore();

  const [showSettings, setShowSettings] = useState(false);
  const [view, setView] = useState<'form' | 'result'>('form');
  const [copied, setCopied] = useState(false);
  const [pdfExported, setPdfExported] = useState(false);

  // Form state
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<ToneType>('oficjalny');
  const [duration, setDuration] = useState<DurationType>('5 minut');
  const [audience, setAudience] = useState<AudienceType>('biznesowi');
  const [details, setDetails] = useState('');

  const handleCopy = async () => {
    if (!currentResult?.text) return;
    await navigator.clipboard.writeText(currentResult.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasApiKeys = apiKeys.claude || apiKeys.openai || apiKeys.gemini;

  const handleGenerate = useCallback(async () => {
    console.log('handleGenerate called. hasApiKeys:', hasApiKeys, 'apiKeys:', apiKeys);
    if (!topic.trim() || !hasApiKeys) {
      console.log('Generation skipped - no topic or no API keys');
      return;
    }

    const params: SpeechParams = { topic, tone, duration, audience, details };
    setParams(params);
    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const result = await generateSpeech(params, apiKeys, setProgress);
      setResult(result);
      // NIE przełączamy widoku - wynik wyświetla się w sekcji AI Output pod formularzem

      addToHistory({
        id: crypto.randomUUID(),
        params,
        result,
        createdAt: new Date(),
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Wystąpił błąd podczas generowania');
      console.error('Generation error:', error);
    } finally {
      setGenerating(false);
      setProgress('');
    }
  }, [topic, tone, duration, audience, details, hasApiKeys, apiKeys, setParams, setGenerating, setError, setResult, setProgress, addToHistory]);

  const handleRegenerate = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleExportPDF = useCallback(async (template: PDFTemplate) => {
    if (!currentResult) return;

    try {
      await exportToPDF({
        title: topic || 'Przemówienie',
        text: currentResult.text,
        template,
      });
      // Pokaż powiadomienie o sukcesie
      setPdfExported(true);
      setTimeout(() => setPdfExported(false), 3000);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Błąd podczas eksportu PDF. Spróbuj ponownie.');
    }
  }, [currentResult, topic]);

  const handleSelectHistoryItem = (item: typeof history[0]) => {
    setTopic(item.params.topic);
    setTone(item.params.tone);
    setDuration(item.params.duration);
    setAudience(item.params.audience);
    setDetails(item.params.details || '');
    setResult(item.result);
    setView('result');
  };

  const handleNewSpeech = () => {
    setResult(null);
    setView('form');
  };

  return (
    <div className={`min-h-screen app-with-titlebar ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Custom Title Bar - jak Discord */}
      <TitleBar />

      {/* PDF Export Success Toast */}
      <AnimatePresence>
        {pdfExported && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            style={{
              position: 'fixed',
              top: '50px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              padding: '16px 28px',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(34, 197, 94, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <CheckCircle2 size={24} color="white" />
            <span style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>
              📄 Plik PDF został pobrany!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background gradient */}
      <div className="bg-gradient-overlay" />

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          {/* Logo */}
          <div className="logo" onClick={handleNewSpeech}>
            <img
              src={logoImage}
              alt="VerbaMind"
              className="logo-image"
            />
          </div>

          {/* Actions */}
          <div className="header-actions">
            {/* Theme Toggle Switch */}
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className="theme-toggle-slider">
                {isDarkMode ? <Moon size={12} /> : <Sun size={12} />}
              </div>
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className="icon-btn"
              title="Settings"
            >
              <SettingsIcon size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          {view === 'form' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="form-layout"
            >
              {/* Topic Input - Full Width */}
              <div className="topic-section">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter speech topic..."
                  className="topic-input"
                  disabled={isGenerating}
                />
              </div>

              {/* Two Column Layout */}
              <div className="two-column">
                {/* Left - Past Speeches */}
                <div className="past-speeches">
                  <h3 className="section-title">Past Speeches</h3>
                  <div className="speech-list">
                    {history.length === 0 ? (
                      <p className="empty-text">No past speeches yet</p>
                    ) : (
                      history.slice(0, 6).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelectHistoryItem(item)}
                          className="speech-item"
                        >
                          <span className="speech-title">
                            {item.params.topic.slice(0, 25)}
                            {item.params.topic.length > 25 ? '...' : ''}
                          </span>
                          <span className="speech-date">
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Right - Options - GLASS CONTAINER */}
                <div className="options-section glass-container">
                  {/* Dropdowns Row */}
                  <div className="dropdowns-row">
                    <div className="dropdown-group">
                      <label>Tone:</label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value as ToneType)}
                        className="dropdown"
                        disabled={isGenerating}
                      >
                        {tones.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="dropdown-group">
                      <label>Duration:</label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value as DurationType)}
                        className="dropdown"
                        disabled={isGenerating}
                      >
                        {durations.map((d) => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="dropdown-group">
                      <label>Audience:</label>
                      <select
                        value={audience}
                        onChange={(e) => setAudience(e.target.value as AudienceType)}
                        className="dropdown"
                        disabled={isGenerating}
                      >
                        {audiences.map((a) => (
                          <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Details textarea */}
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Add any specific details, key points, or constraints here..."
                    className="details-textarea"
                    disabled={isGenerating}
                  />

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic.trim() || !hasApiKeys}
                    className="generate-btn"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>{generationProgress || 'Generating...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Generate Speech</span>
                      </>
                    )}
                  </button>

                  {/* No API Keys Warning */}
                  {!hasApiKeys && (
                    <p className="warning-text">
                      ⚠️ Add API keys in settings to generate speeches.
                    </p>
                  )}
                </div>
              </div>

              {/* AI Output Section - Glass */}
              <motion.div
                className="ai-output-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="ai-output-header">
                  <MessageSquare size={18} style={{ color: 'var(--accent-secondary)' }} />
                  <span className="ai-output-title">AI Generated Speech</span>
                </div>

                <div className="ai-output-content scrollbar-thin">
                  {isGenerating ? (
                    <div className="ai-output-empty">
                      <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 0.75rem', display: 'block', color: 'var(--accent-secondary)' }} />
                      <span>{generationProgress || 'Generating your speech...'}</span>
                    </div>
                  ) : error ? (
                    <div className="ai-output-error">
                      <span style={{ color: '#f87171', fontWeight: 500 }}>⚠️ Error:</span>
                      <p style={{ color: '#fca5a5', marginTop: '0.5rem' }}>{error}</p>
                    </div>
                  ) : currentResult?.text ? (
                    <div className="ai-output-text">
                      {currentResult.text.split('\n').map((paragraph, i) => (
                        paragraph.trim() && (
                          <p key={i}>{paragraph}</p>
                        )
                      ))}
                    </div>
                  ) : (
                    <p className="ai-output-empty">
                      Your generated speech will appear here...
                    </p>
                  )}
                </div>

                {currentResult?.text && (
                  <div className="ai-output-actions">
                    <button onClick={handleCopy} className="btn-secondary">
                      {copied ? (
                        <><Check size={16} className="text-green-500" /> Copied!</>
                      ) : (
                        <><Copy size={16} /> Copy</>
                      )}
                    </button>
                    <button onClick={() => handleExportPDF('modern')} className="btn-secondary">
                      <FileDown size={16} /> Export PDF
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button onClick={handleNewSpeech} className="back-btn">
                ← New Speech
              </button>
              <SpeechResult
                onRegenerate={handleRegenerate}
                onExportPDF={handleExportPDF}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Settings Modal */}
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

export default App;
