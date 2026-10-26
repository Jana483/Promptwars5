import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
router.use(express.json());

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT || 'favorable-tree-512622-b6',
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
});

const clean = (v, max = 200) => String(v ?? '').slice(0, max).trim();

router.post('/api/plan', async (req, res) => {
  const b = req.body || {};
  const input = {
    eventType: clean(b.eventType, 50), honoree: clean(b.honoree, 80),
    city: clean(b.city, 80), date: clean(b.date, 30),
    guests: Number(b.guests) || 50, budget: Number(b.budget) || 100000,
    theme: clean(b.theme), interests: clean(b.interests),
    culture: clean(b.culture), dietary: clean(b.dietary),
  };
  if (!input.eventType) return res.status(400).json({ error: 'Please choose an event type.' });

  const prompt = `You are an expert Indian event planner. Create a practical, personalized plan.
Event details: ${JSON.stringify(input)}
Rules: amounts in INR, budget categories must add up to roughly the total budget,
use the honoree's interests, culture and dietary needs for personalized ideas, and be realistic for the city.
Return ONLY JSON in this shape:
{"summary":"","totalEstimate":0,
 "budget":[{"category":"","amount":0,"notes":""}],
 "timeline":[{"when":"","task":""}],
 "vendors":[{"vendor":"","why":"","questionsToAsk":[""]}],
 "ideas":{"theme":"","colors":[""],"decor":[""],"food":[""],"activities":[""],"personalTouches":[""]},
 "tips":[""]}`;

  try {
    const r = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.9 },
    });
    res.json(JSON.parse(r.text));
  } catch (e) {
    console.error('Planner error:', e.message);
    res.status(503).json({ error: 'Our planning assistant is taking a short break and will be available again soon. Please try again shortly.' });
  }
});

export default router;
