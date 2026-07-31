import { GoogleGenAI } from "@google/genai";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  app.post("/api/verify-document", async (req, res) => {
    try {
      const { base64Data, mimeType, expectedName } = req.body;
      
      if (!base64Data || !mimeType || !expectedName) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `You are a strict document verification assistant.
The user is trying to verify their identity. Their profile name is "${expectedName}".
Look at this document (e.g. Student ID or Admission Letter) and verify if it clearly belongs to the person with this name. Look for names that match or closely resemble "${expectedName}".
Respond in JSON format:
{
  "verified": true|false,
  "reason": "explanation of why it matched or didn't match"
}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          prompt,
          { inlineData: { data: base64Data, mimeType } }
        ],
        config: {
          responseMimeType: "application/json",
        }
      });
      
      if (response.text) {
        const result = JSON.parse(response.text);
        res.json(result);
      } else {
        res.status(500).json({ error: "No response from AI." });
      }
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to verify document." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
