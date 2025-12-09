// Types for the VerbaMind application

export interface SpeechParams {
    topic: string;
    tone: ToneType;
    duration: DurationType;
    audience: AudienceType;
    details?: string;
}

export type ToneType =
    | 'oficjalny'
    | 'motywacyjny'
    | 'casual'
    | 'akademicki'
    | 'emocjonalny'
    | 'humorystyczny';

export type DurationType =
    | '2 minuty'
    | '5 minut'
    | '10 minut'
    | '15 minut'
    | '20+ minut';

export type AudienceType =
    | 'biznesowi'
    | 'studenci'
    | 'ogólna publiczność'
    | 'eksperci'
    | 'mieszana';

export interface VerificationResult {
    model: string;
    aspect: 'naturalness' | 'style' | 'logic';
    score: number;
    feedback: string[];
    icon: string;
}

export interface GenerationResult {
    text: string;
    verificationResults: VerificationResult[];
    overallScore: number;
    wasRefined: boolean;
    generatedAt: Date;
}

export interface SpeechHistoryItem {
    id: string;
    params: SpeechParams;
    result: GenerationResult;
    createdAt: Date;
}

export interface ApiKeys {
    claude?: string;
    openai?: string;
    gemini?: string;
}

export type PDFTemplate = 'official' | 'modern' | 'minimal' | 'academic';

export interface PDFOptions {
    template: PDFTemplate;
    title: string;
    author?: string;
    date?: string;
    includeLogo?: boolean;
}
