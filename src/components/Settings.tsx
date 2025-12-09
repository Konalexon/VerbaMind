import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Key,
    Eye,
    EyeOff,
    Save,
    CheckCircle2,
    ExternalLink,
    Trash2
} from 'lucide-react';
import { useSpeechStore } from '../stores/speechStore';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
    const { apiKeys, setApiKeys, history, clearHistory } = useSpeechStore();

    const [claudeKey, setClaudeKey] = useState(apiKeys.claude || '');
    const [openaiKey, setOpenaiKey] = useState(apiKeys.openai || '');
    const [geminiKey, setGeminiKey] = useState(apiKeys.gemini || '');

    const [showClaude, setShowClaude] = useState(false);
    const [showOpenai, setShowOpenai] = useState(false);
    const [showGemini, setShowGemini] = useState(false);

    const [saved, setSaved] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // Sync local state with store when modal opens
    useEffect(() => {
        if (isOpen) {
            setClaudeKey(apiKeys.claude || '');
            setOpenaiKey(apiKeys.openai || '');
            setGeminiKey(apiKeys.gemini || '');
        }
    }, [isOpen, apiKeys]);

    const handleSave = () => {
        setApiKeys({
            claude: claudeKey.trim() || undefined,
            openai: openaiKey.trim() || undefined,
            gemini: geminiKey.trim() || undefined,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleClearHistory = () => {
        clearHistory();
        setShowClearConfirm(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40"
                        style={{
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(8px)'
                        }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed z-50"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%',
                            maxWidth: '420px',
                            maxHeight: 'calc(100vh - 100px)',
                            background: 'rgba(15, 15, 18, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: '20px',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.15)',
                            overflow: 'hidden'
                        }}
                    >
                        <div
                            className="p-5 overflow-y-auto scrollbar-thin"
                            style={{ maxHeight: 'calc(100vh - 120px)' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Key size={20} style={{ color: '#8b5cf6' }} />
                                    Ustawienia
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg transition-all"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)'
                                    }}
                                >
                                    <X size={18} className="text-zinc-400" />
                                </button>
                            </div>

                            {/* API Keys Section */}
                            <div className="space-y-3 mb-6">
                                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Klucze API
                                </h3>
                                <p className="text-xs text-zinc-500">
                                    Wprowadź swoje klucze API. Są przechowywane lokalnie.
                                </p>

                                {/* Claude API Key */}
                                <div>
                                    <label className="flex items-center justify-between text-sm font-medium text-zinc-300 mb-1.5">
                                        <span>Claude (Anthropic)</span>
                                        <a
                                            href="https://console.anthropic.com/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs flex items-center gap-1"
                                            style={{ color: '#8b5cf6' }}
                                        >
                                            Pobierz klucz <ExternalLink size={10} />
                                        </a>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showClaude ? 'text' : 'password'}
                                            value={claudeKey}
                                            onChange={(e) => setClaudeKey(e.target.value)}
                                            placeholder="sk-ant-..."
                                            className="input-primary pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowClaude(!showClaude)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                        >
                                            {showClaude ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* OpenAI API Key */}
                                <div>
                                    <label className="flex items-center justify-between text-sm font-medium text-zinc-300 mb-1.5">
                                        <span>OpenAI (GPT-4)</span>
                                        <a
                                            href="https://platform.openai.com/api-keys"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs flex items-center gap-1"
                                            style={{ color: '#8b5cf6' }}
                                        >
                                            Pobierz klucz <ExternalLink size={10} />
                                        </a>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showOpenai ? 'text' : 'password'}
                                            value={openaiKey}
                                            onChange={(e) => setOpenaiKey(e.target.value)}
                                            placeholder="sk-..."
                                            className="input-primary pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOpenai(!showOpenai)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                        >
                                            {showOpenai ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Gemini API Key */}
                                <div>
                                    <label className="flex items-center justify-between text-sm font-medium text-zinc-300 mb-1.5">
                                        <span>Google (Gemini)</span>
                                        <a
                                            href="https://aistudio.google.com/app/apikey"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs flex items-center gap-1"
                                            style={{ color: '#8b5cf6' }}
                                        >
                                            Pobierz klucz <ExternalLink size={10} />
                                        </a>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showGemini ? 'text' : 'password'}
                                            value={geminiKey}
                                            onChange={(e) => setGeminiKey(e.target.value)}
                                            placeholder="AIza..."
                                            className="input-primary pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowGemini(!showGemini)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                        >
                                            {showGemini ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSave}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white text-sm"
                                    style={{
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
                                    }}
                                >
                                    {saved ? (
                                        <>
                                            <CheckCircle2 size={16} />
                                            Zapisano!
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Zapisz klucze
                                        </>
                                    )}
                                </motion.button>
                            </div>

                            {/* Info Box */}
                            <div
                                className="p-3 rounded-xl mb-5"
                                style={{
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    border: '1px solid rgba(139, 92, 246, 0.2)'
                                }}
                            >
                                <p className="text-xs text-zinc-300">
                                    <strong style={{ color: '#8b5cf6' }}>💡 Wskazówka:</strong> Potrzebujesz minimum jednego klucza API.
                                </p>
                            </div>

                            {/* History Section */}
                            <div
                                className="pt-4"
                                style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
                            >
                                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                                    Dane
                                </h3>

                                <div
                                    className="flex items-center justify-between p-3 rounded-xl"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.06)'
                                    }}
                                >
                                    <div>
                                        <p className="text-sm font-medium text-white">Historia przemówień</p>
                                        <p className="text-xs text-zinc-500">{history.length} zapisanych</p>
                                    </div>

                                    {showClearConfirm ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleClearHistory}
                                                className="px-2.5 py-1 text-xs rounded-lg"
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.2)',
                                                    color: '#f87171'
                                                }}
                                            >
                                                Potwierdź
                                            </button>
                                            <button
                                                onClick={() => setShowClearConfirm(false)}
                                                className="px-2.5 py-1 text-xs rounded-lg text-zinc-400"
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.05)'
                                                }}
                                            >
                                                Anuluj
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowClearConfirm(true)}
                                            className="p-2 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                                            title="Wyczyść historię"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
