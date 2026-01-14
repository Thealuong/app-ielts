
async function test() {
    console.log("🚀 Checking Ollama Status...");

    // 1. Check installed models
    try {
        const tagsResponse = await fetch('http://localhost:11434/api/tags');
        if (!tagsResponse.ok) throw new Error("Could not reach Ollama API");
        const tags = await tagsResponse.json();
        console.log("📦 Installed Models:", tags.models.map(m => m.name).join(', '));

        const hasLlama3 = tags.models.some(m => m.name.includes('llama3'));
        if (!hasLlama3) {
            console.error("❌ 'llama3' model is NOT installed.");
            console.log("👉 Run this command in terminal: ollama run llama3");
            return;
        }
    } catch (e) {
        console.error("❌ Could not connect to Ollama server at http://localhost:11434");
        console.error("   Error:", e.message);
        return;
    }

    // 2. Try generation if model exists
    console.log("\n🚀 Testing Generation...");
    const url = 'http://localhost:11434/v1/chat/completions';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3',
                messages: [{ role: 'user', content: 'Say "Ollama is working!"' }]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HTTP Error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        console.log("✅ Success! Response from Ollama:");
        console.log(data.choices[0].message.content);

    } catch (e) {
        console.error("❌ Generation Failed:");
        console.error(e.message);
    }
}

test();
