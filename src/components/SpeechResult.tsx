import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Copy,
    FileDown,
    RefreshCw,
    ChevronDown,
    Check,
    Sparkles
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
        if (score >= 90) return '#22c55e';
        if (score >= 75) return '#eab308';
        return '#ef4444';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="speech-result-container"
            style={{
                background: 'rgba(15, 15, 20, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '24px',
                padding: '32px',
                maxWidth: '900px',
                margin: '0 auto',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 40px rgba(139, 92, 246, 0.1)'
            }}
        >
            {/* Success Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px',
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(34, 197, 94, 0.3)'
            }}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Sparkles size={24} color="white" />
                </motion.div>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>
                        Przemówienie gotowe!
                    </h2>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                        {currentResult.wasRefined
                            ? 'Tekst został zweryfikowany i dopracowany przez AI.'
                            : 'Tekst osiągnął wysoką jakość bez potrzeby dodatkowej korekty.'}
                    </p>
                </div>
            </div>

            {/* Quality Score */}
            <div style={{
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.7)' }}>
                        Ocena jakości
                    </span>
                    <span style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: getScoreColor(currentResult.overallScore),
                        textShadow: `0 0 20px ${getScoreColor(currentResult.overallScore)}40`
                    }}>
                        {currentResult.overallScore}%
                    </span>
                </div>
                <div style={{
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentResult.overallScore}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        style={{
                            height: '100%',
                            background: `linear-gradient(90deg, ${getScoreColor(currentResult.overallScore)} 0%, ${getScoreColor(currentResult.overallScore)}80 100%)`,
                            borderRadius: '4px',
                            boxShadow: `0 0 10px ${getScoreColor(currentResult.overallScore)}60`
                        }}
                    />
                </div>
            </div>

            {/* Verification Results */}
            {currentResult.verificationResults.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px',
                    marginBottom: '24px'
                }}>
                    {currentResult.verificationResults.map((result, index) => (
                        <motion.div
                            key={result.model}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            style={{
                                padding: '16px',
                                background: 'rgba(34, 197, 94, 0.1)',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                        >
                            <CheckCircle2 size={18} color="#22c55e" />
                            <div>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{result.model}</p>
                                <p style={{ fontSize: '16px', fontWeight: '600', color: getScoreColor(result.score) }}>
                                    {result.score}%
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Speech Text */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                    padding: '24px',
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    marginBottom: '24px'
                }}
                className="scrollbar-thin"
            >
                {currentResult.text.split('\n').map((paragraph, i) => (
                    paragraph.trim() && (
                        <p key={i} style={{
                            color: 'rgba(255,255,255,0.9)',
                            lineHeight: '1.8',
                            marginBottom: '16px',
                            fontSize: '15px'
                        }}>
                            {paragraph}
                        </p>
                    )
                ))}
            </motion.div>

            {/* Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {/* Copy Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopy}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: copied ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: copied ? '#22c55e' : 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                    }}
                >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    <span>{copied ? 'Skopiowano!' : 'Kopiuj tekst'}</span>
                </motion.button>

                {/* PDF Export */}
                <div style={{ position: 'relative' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowTemplateSelect(!showTemplateSelect)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 20px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        <FileDown size={18} />
                        <span>Eksportuj PDF</span>
                        <ChevronDown size={16} style={{ transform: showTemplateSelect ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </motion.button>

                    {/* Template Dropdown */}
                    {showTemplateSelect && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                marginTop: '8px',
                                width: '280px',
                                padding: '8px',
                                background: 'rgba(20, 20, 25, 0.98)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '16px',
                                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                                zIndex: 100
                            }}
                        >
                            {pdfTemplates.map((template) => (
                                <button
                                    key={template.value}
                                    onClick={() => {
                                        setSelectedTemplate(template.value);
                                        onExportPDF(template.value);
                                        setShowTemplateSelect(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        textAlign: 'left',
                                        background: selectedTemplate === template.value ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = selectedTemplate === template.value ? 'rgba(139, 92, 246, 0.2)' : 'transparent'}
                                >
                                    <p style={{ color: 'white', fontWeight: '500', marginBottom: '4px' }}>{template.label}</p>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{template.description}</p>
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
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.4)',
                        borderRadius: '12px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    <RefreshCw size={18} />
                    <span>Regeneruj</span>
                </motion.button>
            </div>
        </motion.div>
    );
}
