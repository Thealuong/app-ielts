require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Explicitly listing models not available in some older SDK versions, 
    // but try-catch block will handle it.
    // Actually standard getting started code uses:
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log("Checking available models...");
    try {
        // This is a direct fetch if sdk doesn't support listModels directly straightforwardly in all versions
        // But let's try a simple generation strictly first to isolate the "space" issue
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello, are you there?");
        const response = await result.response;
        console.log("✅ simple generation success: ", response.text());
    } catch (error) {
        console.error("❌ Generation failed:", error.message);
    }
}

checkModels();
