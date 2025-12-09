import { motion } from 'framer-motion';
import {
    Clock,
    Trash2,
    FileText,
    ChevronRight
} from 'lucide-react';
import { useSpeechStore } from '../stores/speechStore';
import type { SpeechHistoryItem } from '../types';

interface HistoryProps {
    onSelectItem: (item: SpeechHistoryItem) => void;
}

export function History({ onSelectItem }: HistoryProps) {
    const { history, removeFromHistory } = useSpeechStore();

    if (history.length === 0) {
        return (
            <div className="text-center py-8">
                <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">
                    Brak historii przemówień
                </p>
                <p className="text-zinc-600 text-xs mt-1">
                    Wygenerowane przemówienia pojawią się tutaj
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock size={14} />
                Historia ({history.length})
            </h3>

            {history.map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative p-3 bg-dark-tertiary/50 hover:bg-dark-tertiary 
                     rounded-lg cursor-pointer transition-colors"
                    onClick={() => onSelectItem(item)}
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {item.params.topic.slice(0, 40)}
                                {item.params.topic.length > 40 ? '...' : ''}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-zinc-500">
                                    {item.params.tone}
                                </span>
                                <span className="text-xs text-zinc-600">•</span>
                                <span className="text-xs text-zinc-500">
                                    {new Date(item.createdAt).toLocaleDateString('pl-PL')}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <span className={`text-xs font-medium ${item.result.overallScore >= 90 ? 'text-green-400' :
                                    item.result.overallScore >= 75 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                {item.result.overallScore}%
                            </span>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromHistory(item.id);
                                }}
                                className="p-1 opacity-0 group-hover:opacity-100 text-zinc-500 
                           hover:text-red-400 transition-all"
                                title="Usuń"
                            >
                                <Trash2 size={14} />
                            </button>

                            <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
