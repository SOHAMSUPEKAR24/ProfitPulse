import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GROQ_API_KEY = "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";

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Serve index.html on root route for Railway or any browser access
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle suggestions request
app.post('/api/suggestions', async (req, res) => {
  const { revenue, expenses, profit } = req.body;

  const expenseSummary = expenses.map(e => `${e.category}: ₹${e.amount}`).join(', ');
  const prompt = `
You are an AI business analyst. Analyze the company's financials and provide:

1. A clear summary of business performance
2. Three practical suggestions to improve profit

Financial Data:
- Revenue: ₹${revenue}
- Net Profit: ₹${profit}
- Expenses: ${expenseSummary}
  `;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    console.log("🧠 Groq API response:", JSON.stringify(data, null, 2));

    res.json({ suggestions: data.choices?.[0]?.message?.content || "No suggestions from model." });
  } catch (error) {
    console.error("❌ Error from Groq API:", error);
    res.status(500).json({ error: "Error getting suggestions" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
