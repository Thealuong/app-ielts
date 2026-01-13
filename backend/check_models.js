const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy init to access client? No, need direct access if possible or just try-catch standard ones.
        // The SDK doesn't expose listModels directly on the main class easily in all versions, 
        // but let's try a direct REST call or a standard model test.

        // Better idea: Try to generate content with a few common model names and see which one does NOT 404.
        const modelsToTry = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro"];

        for (const modelName of modelsToTry) {
            console.log(`Testing model: ${modelName}...`);
            try {
                const m = genAI.getGenerativeModel({ model: modelName });
                const result = await m.generateContent("Hello");
                console.log(`✅ SUCCESS: ${modelName} is working.`);
                return; // We found one!
            } catch (e) {
                console.log(`❌ FAILED: ${modelName} - ${e.message}`);
            }
        }

    } catch (error) {
        console.error("Error", error);
    }
}

listModels();
