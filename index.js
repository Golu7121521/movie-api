const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Android app se direct connection allow karne ke liye CORS
app.use(cors());
app.use(express.json());

// Multi-provider catalog jo TMDb IDs accept karte hain
const PROVIDERS = [
  {
    name: "Server 1 (AutoEmbed)",
    getUrl: (id) => `https://player.autoembed.cc/embed/movie/${id}`
  },
  {
    name: "Server 2 (VidSrc)",
    getUrl: (id) => `https://vidsrc.to/embed/movie/${id}`
  },
  {
    name: "Server 3 (SuperEmbed)",
    getUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`
  },
  {
    name: "Server 4 (Smashystream)",
    getUrl: (id) => `https://embed.smashystream.com/playere.php?tmdb=${id}`
  }
];

// Health check endpoint (Render deployment test karne ke liye)
app.get('/', (req, res) => {
  res.send({ status: "running", message: "Movie API is active" });
});

// Main stream resolver endpoint
app.get('/resolve', (req, res) => {
  const tmdbId = req.query.id;

  if (!tmdbId) {
    return res.status(400).json({
      status: "error",
      message: "TMDb ID query parameter missing. Example: /resolve?id=348892"
    });
  }

  // Har server ka direct embed link generate karein
  const availableServers = PROVIDERS.map((provider, index) => ({
    server_id: index + 1,
    server_name: provider.name,
    stream_source: provider.getUrl(tmdbId)
  }));

  res.json({
    status: "success",
    tmdb_id: tmdbId,
    total_servers: availableServers.length,
    servers: availableServers
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
