import { GoogleGenAI } from "@google/genai";
import fs from "fs";
const ai = new GoogleGenAI({ vertexai: true, project: "favorable-tree-512622-b6", location: "us-central1" });
const r = await ai.models.generateImages({
  model: "imagen-4.0-generate-001",
  prompt: "Studio product photo of a futuristic sleek electric scooter, teal and electric blue glossy body, airless puncture-free tyres, glowing LED headlight, side view, dark navy background, dramatic rim lighting, ultra realistic, 4k",
  config: { numberOfImages: 1, aspectRatio: "16:9" },
});
fs.writeFileSync("public/scooter.png", Buffer.from(r.generatedImages[0].image.imageBytes, "base64"));
console.log("Saved public/scooter.png");
