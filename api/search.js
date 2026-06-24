import { runSearch } from './_search-logic.cjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const result = await runSearch(req.body, {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      SERPAPI_KEY: process.env.SERPAPI_KEY
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error('Search error:', err);
    return res.status(err.status || 500).json({ error: err.message || 'Something went wrong.' });
  }
}