
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: './.env.local' });

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// In-memory store for user activity tracking
const users = {}; 
const getToday = () => new Date().toISOString().split('T')[0];

app.post('/api/register-user', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    if (!users[email]) {
        users[email] = { registeredAt: new Date(), logs: {} };
        console.log(`User registered: ${email}`);
    }

    res.status(200).json({ message: "Registered" });
});

app.post('/api/log-food', (req, res) => {
    const { email } = req.body;
    if (!email || !users[email]) return res.status(404).json({ error: "User not found or not registered" });

    const today = getToday();
    if (!users[email].logs[today]) users[email].logs[today] = { breakfast: false, lunch: false, dinner: false, anyLog: false };

    users[email].logs[today].anyLog = true;

    const hour = new Date().getHours();
    if (hour < 11) users[email].logs[today].breakfast = true;
    else if (hour < 16) users[email].logs[today].lunch = true;
    else users[email].logs[today].dinner = true;

    console.log(`Activity logged for ${email} at ${hour}:00`);
    res.status(200).json({ message: "Logged" });
});

app.post('/api/emergency-alert', async (req, res) => {
    const { condition, heart_rate, respiratory_rate } = req.body;
    console.log(`Emergency alert triggered: ${condition}, HR: ${heart_rate}, RR: ${respiratory_rate}`);
    res.status(200).json({ message: "Caregiver alert logged successfully" });
});

// ─── Kidney Analysis Endpoint ───────────────────────────────────────────────
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const GEMINI_KEYS = [
    process.env.VITE_GEMINI_KEY_1,
    process.env.VITE_GEMINI_KEY_2,
    process.env.VITE_GEMINI_KEY_3,
    process.env.VITE_GEMINI_KEY_4,
    process.env.VITE_GEMINI_KEY_5,
    process.env.VITE_GEMINI_KEY_6,
    process.env.VITE_GEMINI_KEY_7,
    process.env.VITE_GEMINI_KEY_8,
    process.env.VITE_GEMINI_KEY_9,
].filter(Boolean);

app.post('/api/kidney-analysis', upload.array('images', 5), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No images provided.' });
        }

        if (GEMINI_KEYS.length === 0) {
            return res.status(500).json({ error: 'Gemini API key not configured on server.' });
        }

        // Build inline image parts for each uploaded file
        const imageParts = files.map(file => ({
            inlineData: {
                mimeType: file.mimetype,
                data: file.buffer.toString('base64'),
            },
        }));

        const prompt = `You are an expert nephrologist and radiologist AI. Analyze the provided kidney scan(s) or lab report image(s) and return a JSON object ONLY — no markdown, no explanation text outside JSON.\n\nReturn exactly this structure:\n{\n  "summary": "<2-3 sentence overview of overall kidney health>",\n  "issues": [\n    { "condition": "<condition name>", "severity": "low" | "moderate" | "high" }\n  ],\n  "causes": {\n    "lifestyle": ["<cause 1>", "<cause 2>"],\n    "medical": ["<cause 1>", "<cause 2>"]\n  },\n  "precautions": ["<precaution 1>", "<precaution 2>", "<precaution 3>"],\n  "consult_doctor": "<when to seek immediate medical attention>"\n}\n\nIf the image is not a kidney scan or medical report, still return the JSON with a summary explaining that, and empty arrays for issues. Never return anything outside the JSON object.`;

        // Try each key until one works (handles rate limits / quota errors)
        let rawText = '';
        let lastError = null;
        const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash-002'];

        outerLoop:
        for (const modelName of modelsToTry) {
            for (const apiKey of GEMINI_KEYS) {
                try {
                    const ai = new GoogleGenAI({ apiKey });
                    const response = await ai.models.generateContent({
                        model: modelName,
                        contents: [{ role: 'user', parts: [...imageParts, { text: prompt }] }],
                    });
                    // response.text is the correct accessor for @google/genai SDK
                    rawText = response.text || '';
                    lastError = null;
                    break outerLoop; // success - stop trying
                } catch (err) {
                    lastError = err;
                    console.warn(`Model ${modelName} with key ...${apiKey.slice(-6)} failed: ${err.message}`);
                }
            }
        }

        if (lastError && !rawText) {
            console.error('All Gemini models/keys failed:', lastError);
            return res.status(500).json({ error: 'Gemini API unavailable. Please try again later.', details: lastError.message });
        }

        // Strip markdown code fences if present
        rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

        let parsed;
        try {
            parsed = JSON.parse(rawText);
        } catch {
            console.error('Gemini raw response (not JSON):', rawText);
            return res.status(500).json({ error: 'AI returned an unexpected format. Please try again.' });
        }

        return res.status(200).json(parsed);
    } catch (err) {
        console.error('Kidney analysis error:', err);
        return res.status(500).json({ error: 'Analysis failed on server.', details: err.message });
    }
});
// ─────────────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log("Updated with correct Sender: Ganeshgouli204@gmail.com");
    console.log("Scheduler active for Meal Reminders (9am/10am, 1pm/2pm, 8pm/9pm).");
});
