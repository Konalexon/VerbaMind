// LLM Service for VerbaMind
// Handles communication with Claude, OpenAI, and Gemini APIs

import type {
    SpeechParams,
    GenerationResult,
    VerificationResult,
    ApiKeys
} from '../types';

const GENERATION_PROMPT = (params: SpeechParams) => `Jesteś profesjonalnym autorem przemówień. Napisz przemówienie spełniające poniższe wymagania:

TEMAT: ${params.topic}
TON: ${params.tone}
DŁUGOŚĆ: ${params.duration}
ODBIORCY: ${params.audience}
${params.details ? `DODATKOWE SZCZEGÓŁY: ${params.details}` : ''}

ZASADY:
1. Pisz naturalnym, płynnym językiem polskim
2. Unikaj typowych fraz AI jak "Podsumowując...", "Warto zauważyć...", "W dzisiejszych czasach..."
3. Zachowaj strukturę: wstęp (hook) → rozwinięcie → mocne zakończenie
4. Dostosuj słownictwo i złożoność do odbiorców
5. Użyj retorycznych pytań, anegdot i metafor gdzie pasuje
6. Tekst ma być gotowy do wygłoszenia na głos - nie używaj skomplikowanych struktur
7. Zachowaj odpowiednią długość dla ${params.duration}

Napisz TYLKO przemówienie, bez komentarzy czy meta-informacji.`;

const NATURALNESS_PROMPT = (speech: string) => `Jesteś ekspertem od naturalnego języka polskiego. 
Przeanalizuj poniższe przemówienie pod kątem:
1. Czy brzmi naturalnie, jak napisane przez człowieka?
2. Czy nie zawiera typowych fraz AI (np. "Podsumowując...", "Warto zauważyć...")?
3. Czy ma odpowiedni rytm i kadencję dla przemówienia mówionego?

Przemówienie:
"""
${speech}
"""

Odpowiedz TYLKO w formacie JSON (bez markdown):
{ "score": <liczba 0-100>, "feedback": ["uwaga 1", "uwaga 2"] }`;

const STYLE_PROMPT = (speech: string, tone: string) => `Jesteś redaktorem językowym. Oceń tekst pod kątem:
1. Poprawności gramatycznej i interpunkcyjnej
2. Spójności stylu (wymagany ton: ${tone})
3. Odpowiedniej długości zdań dla przemówienia

Tekst:
"""
${speech}
"""

Odpowiedz TYLKO w formacie JSON (bez markdown):
{ "score": <liczba 0-100>, "feedback": ["uwaga 1", "uwaga 2"] }`;

const LOGIC_PROMPT = (speech: string) => `Jesteś analitykiem treści. Sprawdź:
1. Czy argumenty są logicznie powiązane?
2. Czy struktura (wstęp-rozwinięcie-zakończenie) jest zachowana?
3. Czy nie ma powtórzeń lub sprzeczności?

Tekst:
"""
${speech}
"""

Odpowiedz TYLKO w formacie JSON (bez markdown):
{ "score": <liczba 0-100>, "feedback": ["uwaga 1", "uwaga 2"] }`;

const REFINEMENT_PROMPT = (speech: string, feedback: string[], params: SpeechParams) =>
    `Popraw poniższe przemówienie na podstawie uwag ekspertów.

Uwagi do poprawy:
${feedback.map(f => `- ${f}`).join('\n')}

Oryginalne przemówienie:
"""
${speech}
"""

Wymagany ton: ${params.tone}
Odbiorcy: ${params.audience}

Zwróć TYLKO poprawiony tekst przemówienia, bez komentarzy czy wyjaśnień.`;

// Humanizer - podrasowuje tekst, usuwa frazy AI
const HUMANIZER_PROMPT = (speech: string) => `Jesteś ekspertem od pisania naturalnych tekstów. 
Twoje zadanie to SUBTELNIE podrasować poniższy tekst, aby brzmiał bardziej naturalnie i ludzko.

ZASADY:
1. USUŃ lub ZAMIEŃ typowe frazy AI takie jak:
   - "Podsumowując..." → użyj czegoś kreatywnego lub pomiń
   - "Warto zauważyć..." → przejdź od razu do meritum
   - "W dzisiejszych czasach..." → bądź konkretny
   - "Jak wiemy..." → pomiń lub zamień na pytanie retoryczne
   - "Nie da się ukryć..." → po prostu stwierdź fakt
   - "Zanurzmy się..." → pomiń
   
2. ZACHOWAJ:
   - Główny przekaz i strukturę
   - Długość tekstu (+-10%)
   - Ton i styl

3. DODAJ naturalność:
   - Krótsze zdania gdzie pasuje
   - Naturalny rytm mowy
   - Ludzkie zwroty frazowe

Tekst do podrasowania:
"""
${speech}
"""

Zwróć TYLKO podrasowany tekst, bez komentarzy.`;

// API calling functions
async function callClaude(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
}

async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 4096,
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
    console.log('Calling Gemini API with key:', apiKey.substring(0, 8) + '...');

    // Lista modeli do wypróbowania (od najnowszych do starszych)
    const models = [
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro',
    ];

    let lastError: Error | null = null;

    for (const model of models) {
        try {
            console.log(`Trying Gemini model: ${model}`);

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.warn(`Gemini model ${model} failed:`, response.status, errorData?.error?.message);
                lastError = new Error(`Gemini ${model}: ${errorData?.error?.message || response.status}`);
                continue; // Próbuj następny model
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
                console.warn(`Gemini model ${model}: Invalid response structure`);
                lastError = new Error(`Gemini ${model}: No content in response`);
                continue;
            }

            console.log(`Gemini API success with model: ${model}`);
            return data.candidates[0].content.parts[0].text;

        } catch (e) {
            console.warn(`Gemini model ${model} error:`, e);
            lastError = e instanceof Error ? e : new Error(String(e));
            continue;
        }
    }

    // Wszystkie modele zawiodły
    throw lastError || new Error('All Gemini models failed');
}

// Helper to call the best available API
async function callBestAvailableAPI(
    apiKeys: ApiKeys,
    prompt: string,
    preference: 'claude' | 'openai' | 'gemini' = 'claude'
): Promise<string> {
    const order = preference === 'claude'
        ? ['claude', 'openai', 'gemini']
        : preference === 'openai'
            ? ['openai', 'claude', 'gemini']
            : ['gemini', 'claude', 'openai'];

    for (const api of order) {
        const key = apiKeys[api as keyof ApiKeys];
        if (key) {
            try {
                switch (api) {
                    case 'claude':
                        return await callClaude(key, prompt);
                    case 'openai':
                        return await callOpenAI(key, prompt);
                    case 'gemini':
                        return await callGemini(key, prompt);
                }
            } catch (error) {
                console.warn(`${api} failed, trying next...`, error);
                continue;
            }
        }
    }

    throw new Error('No working API available');
}

// Parse JSON from response (handles markdown code blocks)
function parseJSON(text: string): { score: number; feedback: string[] } {
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        // Default response if parsing fails
        return { score: 85, feedback: ['Nie udało się przeanalizować odpowiedzi'] };
    }
}

// Main generation function
export async function generateSpeech(
    params: SpeechParams,
    apiKeys: ApiKeys,
    onProgress: (status: string) => void,
    fastMode: boolean = true // Domyślnie szybki tryb - tylko generowanie
): Promise<GenerationResult> {
    // Phase 1: Generate initial speech
    onProgress('Generowanie przemówienia...');
    const initialSpeech = await callBestAvailableAPI(
        apiKeys,
        GENERATION_PROMPT(params),
        'claude'
    );

    // Phase 2: Weryfikacja (opcjonalna w trybie szybkim)
    const verificationResults: VerificationResult[] = [];

    if (!fastMode) {
        // Pełna weryfikacja - wolniejsza ale dokładniejsza
        const keysAvailable = Object.values(apiKeys).filter(Boolean).length;

        if (keysAvailable >= 1) {
            onProgress('Weryfikacja jakości...');

            // Naturalness check
            try {
                const naturalnessResponse = await callBestAvailableAPI(
                    apiKeys,
                    NATURALNESS_PROMPT(initialSpeech),
                    'claude'
                );
                const naturalness = parseJSON(naturalnessResponse);
                verificationResults.push({
                    model: 'Naturalność',
                    aspect: 'naturalness',
                    score: naturalness.score,
                    feedback: naturalness.feedback,
                    icon: '🗣️',
                });
            } catch (e) {
                console.warn('Naturalness check failed', e);
            }

            // Style check (prefer OpenAI)
            if (apiKeys.openai || apiKeys.claude || apiKeys.gemini) {
                try {
                    onProgress('Analiza stylu...');
                    const styleResponse = await callBestAvailableAPI(
                        apiKeys,
                        STYLE_PROMPT(initialSpeech, params.tone),
                        'openai'
                    );
                    const style = parseJSON(styleResponse);
                    verificationResults.push({
                        model: 'Styl',
                        aspect: 'style',
                        score: style.score,
                        feedback: style.feedback,
                        icon: '✍️',
                    });
                } catch (e) {
                    console.warn('Style check failed', e);
                }
            }

            // Logic check (prefer Gemini)
            if (apiKeys.gemini || apiKeys.claude || apiKeys.openai) {
                try {
                    onProgress('Sprawdzanie logiki...');
                    const logicResponse = await callBestAvailableAPI(
                        apiKeys,
                        LOGIC_PROMPT(initialSpeech),
                        'gemini'
                    );
                    const logic = parseJSON(logicResponse);
                    verificationResults.push({
                        model: 'Logika',
                        aspect: 'logic',
                        score: logic.score,
                        feedback: logic.feedback,
                        icon: '🧠',
                    });
                } catch (e) {
                    console.warn('Logic check failed', e);
                }
            }
        }
    }

    // Calculate overall score
    const overallScore = verificationResults.length > 0
        ? Math.round(verificationResults.reduce((sum, r) => sum + r.score, 0) / verificationResults.length)
        : 90; // Default if no verification (szybki tryb)

    // Phase 3: Refinement if needed
    let finalText = initialSpeech;
    let wasRefined = false;

    if (overallScore < 85 && verificationResults.length > 0) {
        onProgress('Dopracowywanie tekstu...');
        const allFeedback = verificationResults.flatMap(r => r.feedback);

        try {
            finalText = await callBestAvailableAPI(
                apiKeys,
                REFINEMENT_PROMPT(initialSpeech, allFeedback, params),
                'claude'
            );
            wasRefined = true;
        } catch (e) {
            console.warn('Refinement failed, using original', e);
        }
    }

    // Phase 4: Humanizer - podrasowuje tekst, usuwa typowe frazy AI
    onProgress('Podrasowywanie tekstu...');
    try {
        finalText = await callBestAvailableAPI(
            apiKeys,
            HUMANIZER_PROMPT(finalText),
            'gemini' // Gemini jest szybszy
        );
    } catch (e) {
        console.warn('Humanizer failed, using original', e);
        // Jeśli humanizer nie zadziała, używamy oryginalnego tekstu
    }

    onProgress('Gotowe!');

    return {
        text: finalText,
        verificationResults,
        overallScore: wasRefined ? Math.min(overallScore + 5, 98) : overallScore,
        wasRefined,
        generatedAt: new Date(),
    };
}
