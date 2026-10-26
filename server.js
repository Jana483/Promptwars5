import express from "express";
import { GoogleGenAI } from "@google/genai";
import { Firestore } from "@google-cloud/firestore";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const db = new Firestore();
const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION || "global",
});

const PRODUCT_FACTS = `
You are the official assistant for the VoltRide X1 electric scooter launch.
Facts (only use these, never invent specs or prices):
- Anti-fall self-balancing system: the scooter does not fall over
- 30-minute quick charging mode
- 380 km range per charge
- Auto-charge adds 50 km per charge
- Puncture-free airless tyres
- 10-year full warranty, support anywhere, anytime (24/7)
- Charging points every 50 km
- Launch event: 15 Nov 2026, 10:00 AM IST, Hyderabad International Convention Centre
- Agenda: 10:00 check-in, 10:30 unveiling, 11:15 demo & test rides, 12:00 media Q&A, 12:30 public zone
If asked about price or anything not listed, say it will be announced at the launch event.
Keep answers short, friendly and professional.`;

app.post("/api/ask", async (req, res) => {
  const question = String(req.body?.question || "").slice(0, 500);
  if (!question) return res.status(400).json({ error: "Question required" });
  try {
    const r = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
      config: { systemInstruction: PRODUCT_FACTS, temperature: 0.3 },
    });
    res.json({ answer: r.text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Thanks for reaching out! Our VoltRide assistant is taking a short break and will be available again soon. We will help you shortly. Meanwhile, you can email us at support@voltride.example." });
  }
});

app.post("/api/register", async (req, res) => {
  const { name, email, phone, type, organization = "", testRide = false } = req.body || {};
  if (!name || !email || !phone || !["public", "media"].includes(type))
    return res.status(400).json({ error: "Missing fields" });
  try {
    await db.collection("registrations").add({
      name, email, phone, type, organization, testRide: !!testRide,
      registeredAt: new Date().toISOString(),
    });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not save" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`VoltRide launch running on ${port}`));
