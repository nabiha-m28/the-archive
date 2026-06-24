require('dotenv').config({ path: '.env.local' });
const express = require('express');
const { runSearch } = require('./api/_search-logic.cjs');

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json({ limit: '10mb' }));

app.post('/api/search', async (req, res) => {
  try {
    const result = await runSearch(req.body, {
      GROQ_API_KEY: process.env.GROQ_API_KEY,
      SERPAPI_KEY: process.env.SERPAPI_KEY
    });
    res.status(200).json(result);
  } catch (err) {
    console.error('Search error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Something went wrong.' });
  }
});

app.listen(PORT, () => {
  console.log(`✓ API server running at http://localhost:${PORT}`);
});