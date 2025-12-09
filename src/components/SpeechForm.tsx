import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Mic,
    Clock,
    Users,
    FileText,
    Loader2
} from 'lucide-react';
import { useSpeechStore } from '../stores/speechStore';
import type { ToneType, DurationType, AudienceType, SpeechParams } from '../types';

const tones: { value: ToneType; label: string; emoji: string }[] = [
    { value: 'oficjalny', label: 'Oficjalny', emoji: '🎩' },
    { value: 'motywacyjny', label: 'Motywacyjny', emoji: '🔥' },
    { value: 'casual', label: 'Casual', emoji: '😎' },
    { value: 'akademicki', label: 'Akademicki', emoji: '🎓' },
    { value: 'emocjonalny', label: 'Emocjonalny', emoji: '💝' },
    { value: 'humorystyczny', label: 'Humorystyczny', emoji: '😄' },
];

const durations: { value: DurationType; label: string }[] = [
    { value: '2 minuty', label: '2 minuty' },
    { value: '5 minut', label: '5 minut' },
    { value: '10 minut', label: '10 minut' },
    { value: '15 minut', label: '15 minut' },
    { value: '20+ minut', label: '20+ minut' },
];

const audiences: { value: AudienceType; label: string; emoji: string }[] = [
    { value: 'biznesowi', label: 'Biznesowi', emoji: '💼' },
    { value: 'studenci', label: 'Studenci', emoji: '📚' },
    { value: 'ogólna publiczność', label: 'Ogólna', emoji: '👥' },
    { value: 'eksperci', label: 'Eksperci', emoji: '🧠' },
    { value: 'mieszana', label: 'Mieszana', emoji: '🌍' },
];

interface SpeechFormProps {
    onGenerate: (params: SpeechParams) => Promise<void>;
}

export function SpeechForm({ onGenerate }: SpeechFormProps) {
    const { isGenerating, generationProgress, apiKeys } = useSpeechStore();

    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState<ToneType>('oficjalny');
    const [duration, setDuration] = useState<DurationType>('5 minut');
    const [audience, setAudience] = useState<AudienceType>('biznesowi');
    const [details, setDetails] = useState('');

    const hasApiKeys = apiKeys.claude || apiKeys.openai || apiKeys.gemini;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim() || !hasApiKeys) return;

        await onGenerate({ topic, tone, duration, audience, details });
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-panel p-8 rounded-2xl max-w-2xl mx-auto"
            onSubmit={handleSubmit}
        >
            {/* Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 mb-4"
                >
                    <Sparkles className="w-7 h-7 text-accent-primary" />
                    <h2 className="text-2xl font-semibold gradient-text">
                        Stwórzmy razem idealne przemówienie
                    </h2>
                </motion.div>
                <p className="text-zinc-400 text-sm">
                    Wprowadź szczegóły, a AI stworzy dopracowany tekst.
                </p>
            </div>

            {/* No API Keys Warning */}
            {!hasApiKeys && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
                >
                    <p className="text-amber-400 text-sm flex items-center gap-2">
                        <span>⚠️</span>
                        Dodaj klucze API w ustawieniach, aby móc generować przemówienia.
                    </p>
                </motion.div>
            )}

            {/* Topic Input */}
            <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-zinc-300">
                    <Mic size={16} className="text-accent-primary" />
                    Temat przemówienia
                </label>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder='np. "Motywacja zespołu sprzedażowego na Q1"'
                    className="input-primary"
                    required
                    disabled={isGenerating}
                />
            </div>

            {/* Select Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Tone Select */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2 text-zinc-300">
                        <Sparkles size={16} className="text-accent-primary" />
                        Ton
                    </label>
                    <div className="relative">
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value as ToneType)}
                            className="select-primary w-full"
                            disabled={isGenerating}
                        >
                            {tones.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.emoji} {t.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Duration Select */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2 text-zinc-300">
                        <Clock size={16} className="text-accent-primary" />
                        Długość
                    </label>
                    <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value as DurationType)}
                        className="select-primary w-full"
                        disabled={isGenerating}
                    >
                        {durations.map((d) => (
                            <option key={d.value} value={d.value}>
                                {d.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Audience Select */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2 text-zinc-300">
                        <Users size={16} className="text-accent-primary" />
                        Odbiorcy
                    </label>
                    <select
                        value={audience}
                        onChange={(e) => setAudience(e.target.value as AudienceType)}
                        className="select-primary w-full"
                        disabled={isGenerating}
                    >
                        {audiences.map((a) => (
                            <option key={a.value} value={a.value}>
                                {a.emoji} {a.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Details Textarea */}
            <div className="mb-8">
                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-zinc-300">
                    <FileText size={16} className="text-accent-primary" />
                    Dodatkowe szczegóły (opcjonalne)
                </label>
                <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Kontekst, kluczowe punkty, specjalne wymagania, cytaty do użycia..."
                    className="input-primary h-24 resize-none"
                    disabled={isGenerating}
                />
            </div>

            {/* Submit Button */}
            <motion.button
                type="submit"
                disabled={isGenerating || !topic.trim() || !hasApiKeys}
                whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                className="btn-primary w-full py-4 text-lg font-semibold"
            >
                {isGenerating ? (
                    <span className="flex items-center justify-center gap-3">
                        <Loader2 className="animate-spin" size={22} />
                        <span>{generationProgress || 'Generowanie...'}</span>
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <Sparkles size={22} />
                        Generuj przemówienie
                    </span>
                )}
            </motion.button>

            {/* Progress indicator */}
            {isGenerating && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4"
                >
                    <div className="h-1 bg-dark-tertiary rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 30, ease: 'linear' }}
                        />
                    </div>
                </motion.div>
            )}
        </motion.form>
    );
}
