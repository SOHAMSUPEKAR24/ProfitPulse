import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend

const GROQ_API_KEY = "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";

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
    // Updated URL for Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",  // Correct model based on your previous example
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    console.log("🧠 Groq API response:", JSON.stringify(data, null, 2)); // ✅ Debug output

    // Check if suggestions are present and return them
    res.json({ suggestions: data.choices?.[0]?.message?.content || "No suggestions from model." });
  } catch (error) {
    console.error("❌ Error from Groq API:", error);
    res.status(500).json({ error: "Error getting suggestions" });
  }
});

app.listen(3000, () => {
  console.log('✅ Server running on http://localhost:3000');
});
