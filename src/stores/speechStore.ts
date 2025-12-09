import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    SpeechParams,
    GenerationResult,
    SpeechHistoryItem,
    ApiKeys
} from '../types';

interface SpeechState {
    // Current speech generation
    currentParams: SpeechParams | null;
    currentResult: GenerationResult | null;
    isGenerating: boolean;
    generationProgress: string;
    error: string | null;

    // History
    history: SpeechHistoryItem[];

    // API Keys
    apiKeys: ApiKeys;

    // Theme
    isDarkMode: boolean;

    // Actions
    setParams: (params: SpeechParams) => void;
    setResult: (result: GenerationResult | null) => void;
    setGenerating: (isGenerating: boolean) => void;
    setProgress: (progress: string) => void;
    setError: (error: string | null) => void;
    addToHistory: (item: SpeechHistoryItem) => void;
    removeFromHistory: (id: string) => void;
    clearHistory: () => void;
    setApiKeys: (keys: ApiKeys) => void;
    toggleTheme: () => void;
    reset: () => void;
}

const initialState = {
    currentParams: null,
    currentResult: null,
    isGenerating: false,
    generationProgress: '',
    error: null,
    history: [],
    apiKeys: {},
    isDarkMode: true,
};

export const useSpeechStore = create<SpeechState>()(
    persist(
        (set) => ({
            ...initialState,

            setParams: (params) => set({ currentParams: params }),

            setResult: (result) => set({ currentResult: result }),

            setGenerating: (isGenerating) => set({ isGenerating }),

            setProgress: (progress) => set({ generationProgress: progress }),

            setError: (error) => set({ error }),

            addToHistory: (item) => set((state) => ({
                history: [item, ...state.history].slice(0, 50) // Keep last 50
            })),

            removeFromHistory: (id) => set((state) => ({
                history: state.history.filter((item) => item.id !== id)
            })),

            clearHistory: () => set({ history: [] }),

            setApiKeys: (keys) => set((state) => ({
                apiKeys: { ...state.apiKeys, ...keys }
            })),

            toggleTheme: () => set((state) => ({
                isDarkMode: !state.isDarkMode
            })),

            reset: () => set({
                currentParams: null,
                currentResult: null,
                isGenerating: false,
                generationProgress: '',
                error: null,
            }),
        }),
        {
            name: 'verbamind-storage',
            partialize: (state) => ({
                history: state.history,
                apiKeys: state.apiKeys,
                isDarkMode: state.isDarkMode,
            }),
        }
    )
);
