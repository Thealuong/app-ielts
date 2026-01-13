const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Testing REST List Models Call to: ${url.replace(apiKey, 'HIDDEN_KEY')}`);

const req = https.get(url, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(body);
            if (parsed.models) {
                console.log("Available Models:");
                parsed.models.forEach(m => console.log(`- ${m.name}`));
            } else {
                console.log("Response (No models found):", body);
            }
        } catch (e) {
            console.log("Response (Parse Error):", body);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});
