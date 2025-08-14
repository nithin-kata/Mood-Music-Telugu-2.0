import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import ytsr from "ytsr";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 5000;
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
const MOODS = {
  happy: "Telugu happy songs",
  sad: "Telugu sad songs",
  romantic: "Telugu romantic songs",
  energetic: "Telugu mass songs"
};

let cache = { timestamp: 0, data: {} };

async function fetchTopSongs(query, limit = 10) {
  try {
    const searchResults = await ytsr(query, { limit: limit + 5 });
    return searchResults.items
      .filter(item => item.type === "video")
      .slice(0, limit)
      .map(v => ({
        title: v.title,
        url: v.url,
        thumb: v.bestThumbnail?.url || ""
      }));
  } catch (err) {
    console.error("Error fetching:", query, err);
    return [];
  }
}

async function buildPayload() {
  const data = {};
  for (const [mood, query] of Object.entries(MOODS)) {
    console.log(`Fetching ${mood}...`);
    data[mood] = await fetchTopSongs(query, 10);
  }
  return data;
}

app.get("/songs", async (req, res) => {
  const now = Date.now();
  if (!cache.data.happy || now - cache.timestamp > CACHE_TTL) {
    cache.data = await buildPayload();
    cache.timestamp = now;
  }
  res.json(cache.data);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
