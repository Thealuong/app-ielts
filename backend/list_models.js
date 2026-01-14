require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log("Fetching models from:", url.replace(apiKey, 'HIDDEN_KEY'));

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("✅ Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(` - ${m.name.replace('models/', '')}`);
                }
            });
        } else {
            console.log("⚠️ Error response:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("❌ Network error:", error);
    }
}

listModels();
