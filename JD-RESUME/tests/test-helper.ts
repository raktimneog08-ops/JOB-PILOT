import fs from "fs";
import path from "path";

export function loadEnv() {
  // If GROQ_API_KEY is not set, or is set to placeholder, try loading from .env.local
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_real_key") {
    try {
      const envPath = path.resolve(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
            const [key, ...valueParts] = trimmed.split("=");
            const value = valueParts.join("=");
            if (key.trim() === "GROQ_API_KEY") {
              process.env.GROQ_API_KEY = value.trim();
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load .env.local in test helper:", e);
    }
  }
}
