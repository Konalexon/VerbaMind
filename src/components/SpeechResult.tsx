import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Copy,
    FileDown,
    RefreshCw,
    ChevronDown,
    Check
} from 'lucide-react';
import { useSpeechStore } from '../stores/speechStore';
import type { PDFTemplate } from '../types';

const pdfTemplates: { value: PDFTemplate; label: string; description: string }[] = [
    { value: 'official', label: '🎩 Oficjalny', description: 'Elegancki, profesjonalny' },
    { value: 'modern', label: '✨ Nowoczesny', description: 'Gradient, dynamiczny' },
    { value: 'minimal', label: '◻️ Minimalistyczny', description: 'Czysty, prosty' },
    { value: 'academic', label: '🎓 Akademicki', description: 'Klasyczny, Times Roman' },
];

interface SpeechResultProps {
    onRegenerate: () => void;
    onExportPDF: (template: PDFTemplate) => void;
}

export function SpeechResult({ onRegenerate, onExportPDF }: SpeechResultProps) {
    const { currentResult } = useSpeechStore();
    const [copied, setCopied] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate>('modern');
    const [showTemplateSelect, setShowTemplateSelect] = useState(false);

    if (!currentResult) return null;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(currentResult.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-400';
        if (score >= 75) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreBarWidth = (score: number) => `${score}%`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-panel p-8 rounded-2xl max-w-3xl mx-auto"
        >
            {/* Success Header */}
            <div className="flex items-center gap-3 mb-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                >
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                </motion.div>
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        Przemówienie gotowe!
                    </h2>
                    <p className="text-zinc-400 text-sm">
                        {currentResult.wasRefined
                            ? 'Tekst został zweryfikowany i dopracowany przez wielomodelowy system AI.'
                            : 'Tekst osiągnął wysoką jakość bez potrzeby dodatkowej korekty.'}
                    </p>
                </div>
            </div>

            {/* Overall Score */}
            <div className="mb-6 p-4 bg-dark-tertiary/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-zinc-300">Quality Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(currentResult.overallScore)}`}>
                        {currentResult.overallScore}%
                    </span>
                </div>
                <div className="score-bar">
                    <motion.div
                        className="score-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: getScoreBarWidth(currentResult.overallScore) }}
                        transition={{ duration: 1, delay: 0.3 }}
                    />
                </div>
            </div>

            {/* Verification Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                {currentResult.verificationResults.map((result, index) => (
                    <motion.div
                        key={result.model}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="verification-badge success"
                    >
                        <CheckCircle2 size={16} className="text-green-500" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-zinc-400 truncate">{result.model}</p>
                            <p className={`font-semibold ${getScoreColor(result.score)}`}>
                                {result.score}%
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t border-dark-border my-6" />

            {/* Speech Text */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-6"
            >
                <div
                    className="p-6 rounded-xl max-h-96 overflow-y-auto scrollbar-thin"
                    style={{
                        background: 'rgba(20, 20, 25, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                >
                    <div className="prose prose-invert max-w-none">
                        {currentResult.text.split('\n').map((paragraph, i) => (
                            paragraph.trim() && (
                                <p key={i} className="text-zinc-200 leading-relaxed mb-4 last:mb-0">
                                    {paragraph}
                                </p>
                            )
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
                {/* Copy Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopy}
                    className="btn-secondary flex items-center gap-2"
                >
                    {copied ? (
                        <>
                            <Check size={18} className="text-green-500" />
                            <span>Skopiowano!</span>
                        </>
                    ) : (
                        <>
                            <Copy size={18} />
                            <span>Kopiuj tekst</span>
                        </>
                    )}
                </motion.button>

                {/* PDF Export */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowTemplateSelect(!showTemplateSelect)}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <FileDown size={18} />
                        <span>Eksportuj PDF</span>
                        <ChevronDown size={16} className={`transition-transform ${showTemplateSelect ? 'rotate-180' : ''}`} />
                    </motion.button>

                    {/* Template Dropdown */}
                    {showTemplateSelect && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-full left-0 mt-2 w-64 p-2 bg-dark-secondary border border-dark-border rounded-xl shadow-xl z-10"
                        >
                            {pdfTemplates.map((template) => (
                                <button
                                    key={template.value}
                                    onClick={() => {
                                        setSelectedTemplate(template.value);
                                        onExportPDF(template.value);
                                        setShowTemplateSelect(false);
                                    }}
                                    className={`w-full p-3 text-left rounded-lg transition-colors hover:bg-dark-tertiary ${selectedTemplate === template.value ? 'bg-dark-tertiary' : ''
                                        }`}
                                >
                                    <p className="font-medium text-white">{template.label}</p>
                                    <p className="text-xs text-zinc-400">{template.description}</p>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Regenerate Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onRegenerate}
                    className="btn-secondary flex items-center gap-2"
                >
                    <RefreshCw size={18} />
                    <span>Regeneruj</span>
                </motion.button>
            </div>
        </motion.div>
    );
}
