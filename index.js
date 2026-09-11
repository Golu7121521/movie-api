const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

const TMDB_KEY = "bda15b72d8122a53b19ef34ab5f04523";

// Health check route
app.get('/', (req, res) => {
  res.json({ status: "online", message: "Movie Proxy & Resolver is running smoothly" });
});

// 1. TMDb Search Proxy (Bypasses Indian ISP restrictions on TMDb)
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Search query 'q' parameter is required" });
  }

  try {
    const tmdbResponse = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`,
      { timeout: 8000 }
    );
    res.json(tmdbResponse.data);
  } catch (error) {
    res.status(500).json({ 
      error: "TMDb API retrieval failed", 
      details: error.message 
    });
  }
});

// 2. Multi-Mirror Resolver & Direct Downloader Target
app.get('/resolve', (req, res) => {
  const tmdbId = req.query.id;
  if (!tmdbId) {
    return res.status(400).json({ error: "TMDb movie ID 'id' parameter is required" });
  }

  // Active mirror networks (India unblocked fallbacks)
  const mirrorSources = [
    {
      name: "VidSrc Mirror 1 (.pm)",
      url: `https://vidsrc.pm/embed/movie/${tmdbId}`
    },
    {
      name: "VidSrc Mirror 2 (.net)",
      url: `https://vidsrc.net/embed/movie/${tmdbId}`
    },
    {
      name: "VidSrc Mirror 3 (.xyz)",
      url: `https://vidsrc.xyz/embed/movie/${tmdbId}`
    },
    {
      name: "VidSrc Mirror 4 (.in)",
      url: `https://vidsrc.in/embed/movie/${tmdbId}`
    },
    {
      name: "VidSrc Legacy (.to)",
      url: `https://vidsrc.to/embed/movie/${tmdbId}`
    }
  ];

  res.json({
    status: "success",
    tmdb_id: tmdbId,
    default_download_url: mirrorSources[0].url,
    referer: "https://vidsrc.pm/",
    mirrors: mirrorSources
  });
});

app.listen(PORT, () => {
  console.log(`Server actively running on port ${PORT}`);
});
