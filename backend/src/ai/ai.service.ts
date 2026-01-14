import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiGeneratedContent } from './entities/ai-generated-content.entity';

@Injectable()
export class AiService {
    private genAI: GoogleGenerativeAI;
    private model: any;
    private aiProvider: string;
    private ollamaBaseUrl: string;
    private ollamaModel: string;

    constructor(
        @InjectRepository(AiGeneratedContent)
        private cacheRepository: Repository<AiGeneratedContent>,
        private configService: ConfigService,
    ) {
        this.aiProvider = this.configService.get<string>('AI_PROVIDER') || 'groq'; // logic from env, default usually groq in other files but gemini here? let's respect env
        // The previous env logic in generate_content.js defaulted to groq, but here it was Gemini only.
        // Let's grab the new vars.
        this.ollamaBaseUrl = this.configService.get<string>('OLLAMA_BASE_URL') || 'http://127.0.0.1:11434/v1';
        this.ollamaModel = this.configService.get<string>('OLLAMA_MODEL') || 'llama3';

        const apiKey = this.configService.get<string>('GEMINI_API_KEY');

        // Initialize Gemini if key exists (even if using Ollama, we might want fallback? simplified for now)
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        }
    }

    private async generateRaw(prompt: string): Promise<string> {
        if (this.aiProvider === 'groq') {
            try {
                const groqKey = this.configService.get<string>('GROQ_API_KEY');
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${groqKey}`
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [{ role: 'user', content: prompt }],
                        response_format: { type: "json_object" }
                    })
                });

                if (!response.ok) {
                    const err = await response.text();
                    throw new Error(`Groq API Error: ${err}`);
                }

                const data: any = await response.json();
                return data.choices?.[0]?.message?.content || '';
            } catch (error) {
                console.error("Groq Generation Failed:", error);
                throw error;
            }
        }

        if (this.aiProvider === 'ollama') {
            try {
                // Using fetch directly (Node v18+)
                const response = await fetch(`${this.ollamaBaseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: this.ollamaModel,
                        messages: [{ role: 'user', content: prompt }],
                        stream: false
                    })
                });

                if (!response.ok) {
                    throw new Error(`Ollama API Error: ${response.statusText}`);
                }

                const data: any = await response.json();
                return data.choices?.[0]?.message?.content || '';
            } catch (error) {
                console.error("Ollama Generation Failed:", error);
                throw error;
            }
        }

        // Default / Fallback to Gemini
        if (this.model) {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }

        throw new Error("No AI Provider Configured");
    }

    async generateExamples(word: string, definition: string, partOfSpeech: string): Promise<any> {
        // Check cache first
        const cached = await this.getCachedContent(word, 'example');
        if (cached) {
            try {
                const data = JSON.parse(cached.content);
                // Validate cache has the new 'content' structure
                if (data.content && Array.isArray(data.content) && data.content.length > 0) {
                    return data;
                }
            } catch (e) { }
        }

        const defaultFallback = {
            content: [
                {
                    pattern: `${word} + ...`,
                    meaning: 'Basic usage',
                    example: `This is an example sentence using "${word}".`
                },
                {
                    pattern: `to ${word} ...`,
                    meaning: 'Action usage',
                    example: `You should learn how to ${word} correctly.`
                }
            ]
        };

        if (!this.model && this.aiProvider !== 'ollama') {
            return defaultFallback;
        }

        const prompt = `Generate structured learning content for the IELTS vocabulary word "${word}" (${partOfSpeech}). Definition: "${definition}". 
    
    Return ONLY a JSON object with this structure:
    {
        "content": [
            {
                "pattern": "collocation pattern (e.g. adjust to + noun)",
                "meaning": "brief meaning in Vietnamese (or simple English)",
                "example": "Complete example sentence using this pattern"
            },
            {
                "pattern": "another pattern",
                "meaning": "meaning",
                "example": "example"
            }
        ]
    }

    Requirements:
    - Generate 2-3 high-quality learning points
    - Focus on common IELTS collocations and usage patterns
    - Patterns should be clear (e.g. 'cause + noun', 'cause + of')
    - Examples should be natural and context-rich
    - Return valid JSON only`;

        try {
            const text = await this.generateRaw(prompt);

            // Extract JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);

                // Extra validation before caching
                if (!data.content || !Array.isArray(data.content)) {
                    throw new Error('Invalid data structure from AI');
                }

                // Cache the result
                await this.cacheContent(word, 'example', JSON.stringify(data));

                return data;
            } else {
                throw new Error('Invalid JSON response');
            }
        } catch (error) {
            console.error('AI generation error:', error);
            return defaultFallback;
        }
    }

    async generateQuiz(word: string, definition: string): Promise<any> {
        // Check cache first
        const cached = await this.getCachedContent(word, 'quiz');
        if (cached) {
            return JSON.parse(cached.content);
        }

        if (!this.model && this.aiProvider !== 'ollama') {
            // Return default quiz if no API key
            return {
                question: `What does "${word}" mean?`,
                options: [definition, 'Wrong answer 1', 'Wrong answer 2', 'Wrong answer 3'],
                correctIndex: 0,
            };
        }

        const prompt = `Create a multiple-choice quiz question for the word "${word}". Definition: "${definition}".
    
    Return ONLY a JSON object with this structure:
    {
      "question": "Fill in the blank or definition question",
      "options": ["correct answer", "wrong 1", "wrong 2", "wrong 3"],
      "correctIndex": 0
    }
    
    Make distractors (wrong answers) plausible but clearly incorrect.`;

        try {
            const text = await this.generateRaw(prompt);

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const quiz = JSON.parse(jsonMatch[0]);

                // Cache the result
                await this.cacheContent(word, 'quiz', JSON.stringify(quiz));

                return quiz;
            }
        } catch (error) {
            console.error('AI quiz generation error:', error);
        }

        // Fallback
        return {
            question: `What does "${word}" mean?`,
            options: [definition, 'Wrong answer 1', 'Wrong answer 2', 'Wrong answer 3'],
            correctIndex: 0,
        };
    }

    async generatePracticeSet(word: string, definition: string, partOfSpeech: string, topic?: string): Promise<any> {
        // Check cache (key inclusive of topic if provided)
        const cacheKey = topic ? `practice_set_${topic}` : 'practice_set';
        const cached = await this.getCachedContent(word, cacheKey);
        if (cached) {
            try {
                const data = JSON.parse(cached.content);
                if (data.questions && data.questions.length === 5) return data;
            } catch (e) { }
        }

        if (!this.model && this.aiProvider !== 'ollama') {
            // Fallback for mocked environment
            return {
                questions: [
                    { type: 'mcq_def', question: `What is the definition of "${word}"?`, options: [definition, 'Wrong 1', 'Wrong 2', 'Wrong 3'], correctIndex: 0 },
                    { type: 'mcq_fill', question: `Select the word to fill: "He had to ___ the plan."`, options: [word, 'ignore', 'delete', 'sleep'], correctIndex: 0 },
                    { type: 'fill_hint', question: `Fill in the blank: "To a___ to the new environment."`, hint: `Starts with ${word[0]}`, answer: word },
                    { type: 'fill_no_hint', question: `Fill in the blank: "The mechanic had to ___ the brakes."`, answer: word },
                    { type: 'sentence', question: `Write a sentence using "${word}".`, answer: word }
                ]
            };
        }

        const contextInstruction = topic
            ? `Context: The word is being learned under the IELTS topic "${topic}". Ensure all sentences and examples relate to "${topic}".`
            : '';

        const prompt = `Create a 5-level practice set for the IELTS word "${word}" (${partOfSpeech}, definition: "${definition}").
    ${contextInstruction}
    
    Return ONLY a JSON object with this structure:
    {
        "questions": [
            { "level": 1, "type": "mcq_def", "question": "Select the correct definition for '${word}'", "options": ["${definition}", "wrong definition 1", "wrong definition 2", "wrong definition 3"], "correctIndex": 0 },
            { "level": 2, "type": "mcq_fill", "question": "Fill in the blank: [Sentence with '_______']", "options": ["${word}", "distractor1", "distractor2", "distractor3"], "correctIndex": 0 },
            { "level": 3, "type": "fill_hint", "question": "Complete the word in this sentence: [Sentence with partially hidden word like 'a_____']", "answer": "${word}" },
            { "level": 4, "type": "fill_no_hint", "question": "Fill in the blank: [Complex sentence with '_______']", "answer": "${word}" },
            { "level": 5, "type": "collocation", "question": "Which word collocates with '${word}'? [Phrase like '_______ ${word}' or '${word} _______']", "answer": "[The missing collocate]" }
        ]
    }

    Requirements:
    - Level 1: Recognition (MCQ Definition). Randomize correctIndex if possible, but I will handle shuffling on frontend loop to be safe, easier to keep 0 here and shuffle there. ACTUALLY, please randomize the Options and give me the correctIndex.
    - Level 2: Context (MCQ Fill-in-blank).
    - Level 3: Recall (Fill blank with first letter hint).
    - Level 4: Production (Fill blank, no hint).
    - Level 5: Collocation/Usage (Identify the collocate word).
    - Sentences must be IELTS academic style.
    - Return valid JSON only.`;

        try {
            const text = await this.generateRaw(prompt);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                await this.cacheContent(word, cacheKey, JSON.stringify(data));
                return data;
            }
        } catch (error) {
            console.error('AI Practice generation error:', error);
        }

        return {
            questions: [
                { type: 'mcq_def', question: `What is the definition of "${word}"?`, options: [definition, 'Wrong 1', 'Wrong 2', 'Wrong 3'], correctIndex: 0 },
                { type: 'mcq_fill', question: `Select the word to fill: "Example sentence with ___."`, options: [word, 'wrong', 'bad', 'false'], correctIndex: 0 },
                { type: 'fill_hint', question: `Fill in the blank: "Starts with ${word[0]}..."`, hint: `Starts with ${word[0]}`, answer: word },
                { type: 'fill_no_hint', question: `Fill in the blank: "Sentence with ___."`, answer: word },
                { type: 'collocation', question: `Complete the phrase: "___ ${word}"`, answer: 'common' }
            ]
        };
    }

    async generateExplanation(word: string, userSentence: string): Promise<string> {
        if (!this.model && this.aiProvider !== 'ollama') {
            return 'AI explanation not available. Please configure GEMINI_API_KEY.';
        }

        const prompt = `A student is learning the word "${word}" for IELTS. They wrote this sentence: "${userSentence}"
    
    Provide brief, encouraging feedback (2-3 sentences):
    - If correct: praise and explain why it's good
    - If incorrect: gently correct and show the right way
    - Focus on IELTS-appropriate usage`;

        try {
            return await this.generateRaw(prompt);
        } catch (error) {
            console.error('AI explanation error:', error);
            return 'Could not generate explanation at this time.';
        }
    }

    async explainError(question: string, userAnswer: string, correctAnswer: string, context: string = ''): Promise<string> {
        // Cache Check
        const cacheKey = this.generateCacheKey('explain_error', `${question}:${userAnswer}:${correctAnswer}`);
        const cached = await this.getCachedContent('', 'explain_error', cacheKey);
        if (cached) return cached.content;

        if (!this.model && this.aiProvider !== 'ollama') return 'Không thể tạo giải thích lúc này.';

        const prompt = `A student answered a quiz question wrong.
        Question: "${question}"
        Student Answer: "${userAnswer}"
        Correct Answer: "${correctAnswer}"
        ${context ? `Context: ${context}` : ''}

        Task: Explain in VIETNAMESE why the student's answer is wrong and why the correct answer is right.
        Requirements:
        - Very brief (1-2 sentences).
        - Friendly and encouraging tone.
        - Start with "Tiếc quá!" or "Chưa đúng rồi!".`;

        try {
            const text = await this.generateRaw(prompt);

            // Save Cache
            await this.cacheContent('', 'explain_error', text, cacheKey);
            return text;
        } catch (error) {
            console.error('AI error explain:', error);
            return 'Rất tiếc, AI đang bận.';
        }
    }

    async translate(text: string, context: string = ''): Promise<string> {
        // Cache Check
        const cacheKey = this.generateCacheKey('translate', `${text}:${context}`);
        const cached = await this.getCachedContent('', 'translate', cacheKey);
        if (cached) return cached.content;

        if (!this.model && this.aiProvider !== 'ollama') return 'AI Translate Unavailable';

        const prompt = `Translate the following text to VIETNAMESE.
        Text: "${text}"
        ${context ? `Context/Topic: ${context}` : ''}
        
        Requirements:
        - Return ONLY the Vietnamese translation.
        - Keep the tone natural and appropriate for learning.
        - If it's a single word, provide the meaning.
        - If it's a sentence, translate the full sentence.`;

        try {
            const translation = await this.generateRaw(prompt);

            // Save Cache
            await this.cacheContent('', 'translate', translation, cacheKey);

            return translation;
        } catch (error) {
            console.error('AI error translate:', error);
            return 'Lỗi dịch thuật.';
        }
    }

    private generateCacheKey(type: string, input: string): string {
        return `${type}:${crypto.createHash('md5').update(input).digest('hex')}`;
    }

    private async getCachedContent(word: string, contentType: string, cacheKey?: string): Promise<AiGeneratedContent | null> {
        // Build query
        const query: any = { contentType };

        if (cacheKey) {
            query.cache_key = cacheKey;
        } else {
            // Fallback for legacy ID-based cache
            // We can't query by word string directly unless we join, but for now let's assume word passed is actually ID or ignored if key provided
            // Actually, for legacy, we relied on vocabularyId matching.
            // If no cacheKey provided, we skip or assume caller handled ID logic. 
            // Best to just rely on cacheKey for new flow.
            return null;
        }

        const cached = await this.cacheRepository.findOne({
            where: query
        });

        if (cached && (!cached.expiresAt || cached.expiresAt > new Date())) {
            return cached;
        }

        return null;
    }

    private async cacheContent(word: string, contentType: string, content: string, cacheKey?: string) {
        // Cache for 30 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const cache = this.cacheRepository.create({
            vocabularyId: null, // Legacy ID can be null now
            cache_key: cacheKey,
            contentType,
            content,
            expiresAt,
        });

        await this.cacheRepository.save(cache);
    }
}
