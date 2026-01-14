require('dotenv').config();
const mysql = require('mysql2/promise');

// Configuration
const BATCH_SIZE = 1;
const DELAY_MS = 1500; // Groq is fast, but let's respect rate limits
const MAX_RETRIES = 5;
const MODEL_NAME = 'llama-3.3-70b-versatile'; // Updated to active model
// Using the key provided by the user
const API_KEY = process.env.GROQ_API_KEY;

if (!API_KEY && !process.env.AI_PROVIDER === 'ollama') {
    console.error("❌ MISSING API KEY");
    process.exit(1);
}

// Helper to generate content via REST with Retry (Groq/OpenAI/Ollama format)
async function generateWithREST(prompt, retryCount = 0) {
    const provider = process.env.AI_PROVIDER || 'groq';

    let url, apiKey, model;

    if (provider === 'ollama') {
        url = `${process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1'}/chat/completions`;
        apiKey = 'ollama'; // Not needed but requires non-empty for some libs, fetch ignores it strictly speaking but good practice
        model = process.env.OLLAMA_MODEL || 'llama3';
    } else {
        url = `https://api.groq.com/openai/v1/chat/completions`;
        apiKey = API_KEY;
        model = MODEL_NAME;
    }

    try {
        if (provider === 'ollama') {
            console.log("   ⏳ Waiting for Ollama response (this may take time)...");
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        if (response.status === 429) {
            // Rate Limit Hit
            if (retryCount >= MAX_RETRIES) throw new Error("Rate limit exceeded (Max retries reached)");

            // Groq rate limits are usually per minute.
            const waitTime = (retryCount + 1) * 2000;
            console.log(`   ⏳ Rate limit hit (429). Waiting ${waitTime / 1000}s before retry...`);
            await new Promise(r => setTimeout(r, waitTime));
            return generateWithREST(prompt, retryCount + 1);
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
    } catch (e) {
        if (e.message.includes('fetch failed') && retryCount < MAX_RETRIES) {
            console.log(`   ⚠️ Network error (${e.cause?.code || e.message}). Retrying...`);
            await new Promise(r => setTimeout(r, 2000));
            return generateWithREST(prompt, retryCount + 1);
        }
        throw e;
    }
}

async function main() {
    const provider = process.env.AI_PROVIDER || 'groq';
    const model = provider === 'ollama' ? (process.env.OLLAMA_MODEL || 'llama3') : MODEL_NAME;

    console.log(`🚀 Starting Batch Content Generation (${provider.toUpperCase()}) using model: '${model}'`);

    // 1. Connect to DB
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'ielts_vocabulary'
    });
    console.log('✅ Connected to Database');

    // 2. Get words
    const [rows] = await connection.execute(
        `SELECT id, word, definition, part_of_speech FROM vocabularies WHERE content_data IS NULL`
    );
    const words = rows;
    console.log(`📊 Found ${words.length} words needing content.`);

    // 3. Process Loop
    let successCount = 0;

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        console.log(`[${i + 1}/${words.length}] Processing "${word.word}"...`);

        try {
            const prompt = `
            Analyze the IELTS word "${word.word}" (${word.part_of_speech}).
            Definition: "${word.definition}"

            Generate a "Word Family" learning card following this EXACT format for the main word AND 1-2 important related forms (if any).

            Return ONLY valid JSON like this:
            {
                "content": [
                    {
                        "type": "word_info",
                        "ord": "1️⃣",
                        "word": "${word.word}",
                        "pos": "(${word.part_of_speech})",
                        "meaning": "Vietnamese Meaning",
                        "nuance": "Usage note (when to use)",
                        "collocations": ["collocation 1", "collocation 2"],
                        "example": "Example sentence",
                        "mistake": "Common mistake (optional, empty if none)"
                    },
                    {
                        "type": "word_info",
                        "ord": "2️⃣",
                        "word": "related_form (e.g. adjective)",
                        "pos": "(adj)",
                        "meaning": "Vietnamese Meaning",
                        "collocations": ["collocation 1"],
                        "example": "Example sentence"
                    }
                ]
            }

            Rules:
            - Max 3 items in the list.
            - Focus on IELTS high-scoring collocations.
            - "Mất gốc" friendly Vietnamese explanations.
            - If no strong related forms, just return the main word.
            `;

            const text = await generateWithREST(prompt);

            // Extract JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[0];
                // Validate JSON
                JSON.parse(jsonStr);

                // Save to DB
                await connection.execute(
                    'UPDATE vocabularies SET content_data = ? WHERE id = ?',
                    [jsonStr, word.id]
                );
                console.log(`   ✅ Saved.`);
                successCount++;
            } else {
                console.warn(`   ⚠️ Invalid response format:`, text.substring(0, 50) + "...");
            }

        } catch (error) {
            console.error(`   ❌ Failed: ${error.message}`);
        }

        // Rate limit delay
        await new Promise(r => setTimeout(r, DELAY_MS));
    }

    console.log(`\n🏁 Done! Generated ${successCount}/${words.length} words.`);
    await connection.end();
}

main();
