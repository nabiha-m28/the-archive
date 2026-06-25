const ENABLE_DIRECT_LINKS = true;
async function runSearch({ description, era, category, price }, keys) {
    const { GROQ_API_KEY, SERPAPI_KEY } = keys;

    if (!GROQ_API_KEY || !SERPAPI_KEY) {
        const err = new Error('Server is missing API keys. Check your .env.local or Vercel environment variables.');
        err.status = 500;
        throw err;
    }

    let searchQuery = description;

    if (!searchQuery) {
        const err = new Error('Could not determine what to search for.');
        err.status = 400;
        throw err;
    }

    let fullQuery = `${searchQuery}`;
    if (era) fullQuery += ` ${era}`;
    if (category) fullQuery += ` ${category}`;

    let listings = await fetchShoppingResults(fullQuery, searchQuery, SERPAPI_KEY, price, GROQ_API_KEY);

    const summary = await summarizeFind(searchQuery, GROQ_API_KEY);

    return {
        query_title: searchQuery,
        item_summary: summary,
        results: listings
    };
}


async function summarizeFind(query, apiKey) {
    try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: `In 1-2 sentences, describe this vintage item for a shopper: "${query}". Mention likely era, material, or style notes if relevant. Be concise, no preamble.` }]
            })
        });
        if (!res.ok) return '';
        const data = await res.json();
        return (data.choices?.[0]?.message?.content || '').trim();
    } catch {
        return '';
    }
}

const RESALE_SELLER_NAMES = [
    'vestiaire collective',
    'vestiairecollective',
    'the realreal',
    'therealreal',
    '1stdibs',
    'ebay',
    'fashionphile',
    'depop',
    'poshmark',
    'chairish',
    'grailed',
    'thredup',
    'sororité',
    'sororite',
    'baby archive',
    'pissed and broke',
    'pissed & broke',
    'what goes around comes around',
    'wgaca',
    'into archive'
];

const EXCLUDED_RETAIL_NAMES = [
    'amazon',
    'nordstrom',
    'farfetch',
    'net-a-porter',
    'ssense',
    'shopbop',
    'macy',
    'saks',
    'neiman marcus',
    'bloomingdale',
    'zappos',
    'walmart',
    'target',
    'saks',
    'bergdorf',
    'harrods'
];

async function fetchShoppingResults(searchQuery, coreQuery, apiKey, priceFilter, groqKey) {
    const PAGES_TO_FETCH = 3;
    const RESULTS_PER_PAGE = 20;

    const priceRanges = {
        'Under $50': { max: 50 },
        '$50 – $200': { min: 50, max: 200 },
        '$200 – $500': { min: 200, max: 500 },
        '$500 – $1,000': { min: 500, max: 1000 },
        '$1,000+': { min: 1000 }
    };

    const buildParams = (start) => {
        const params = new URLSearchParams({
            engine: 'google_shopping',
            q: searchQuery,
            api_key: apiKey,
            start: String(start)
        });
        if (priceFilter && priceRanges[priceFilter]) {
            const { min, max } = priceRanges[priceFilter];
            if (min) params.set('tbs', `mr:1,price:1,ppr_min:${min}${max ? `,ppr_max:${max}` : ''}`);
            else if (max) params.set('tbs', `mr:1,price:1,ppr_max:${max}`);
        }
        return params;
    };

    const pages = await Promise.all(
        Array.from({ length: PAGES_TO_FETCH }, (_, i) =>
            fetch(`https://serpapi.com/search?${buildParams(i * RESULTS_PER_PAGE)}`)
                .then(r => r.ok ? r.json() : { shopping_results: [] })
                .catch(() => ({ shopping_results: [] }))
        )
    );

    const seen = new Set();
    const shoppingResults = pages.flatMap(p => p.shopping_results || []).filter(item => {
        const key = item.product_id || `${item.title}-${item.source}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    if (shoppingResults.length === 0) {
        throw new Error("We couldn't find any matches right now. Try a different search.");
    }

    console.log(`[search] Raw SerpAPI results: ${shoppingResults.length}`);

    const resaleOnly = filterToResaleSites(shoppingResults, coreQuery);
    console.log(`[search] After resale-site filter: ${resaleOnly.length}`);

    const relevant = await rankByRelevance(resaleOnly, coreQuery, groqKey);
    console.log(`[search] After relevance ranking: ${relevant.length}`);

    return Promise.all(relevant.map(async (item, i) => ({
        id: item.product_id || `result-${Date.now()}-${i}`,
        name: item.title || 'Untitled listing',
        era: '',
        price: item.price || 'Price unavailable',
        source: item.source || 'Unknown seller',
        condition: '',
        notes: item.snippet || '',
        url: ENABLE_DIRECT_LINKS
            ? await resolveDirectUrl(item.serpapi_immersive_product_api, apiKey, item.product_link || '#')
            : (item.product_link || '#'),
        image: item.thumbnail || null
    })));
}

function filterToResaleSites(results, coreQuery) {
    const queryLower = (coreQuery || '').toLowerCase();

    const filtered = results.filter(item => {
        const sourceName = (item.source || '').toLowerCase().trim();
        const isExcludedRetail = EXCLUDED_RETAIL_NAMES.some(name => sourceName.includes(name));
        if (isExcludedRetail) return false;
        const isLikelyBrandDirect = sourceName.length > 0 && queryLower.includes(sourceName);
        if (isLikelyBrandDirect) return false;

        return true;
    });

    return filtered.length > 0 ? filtered : results;
}

async function rankByRelevance(results, coreQuery, apiKey) {
    if (results.length === 0) return results;

    const candidates = results.slice(0, 40);

    const titleList = candidates
        .map((item, i) => `${i + 1}. "${item.title || 'Untitled'}" (seller: ${item.source || 'unknown'})`)
        .join('\n');

    const prompt = `A shopper is searching for: "${coreQuery}"
    Here is a numbered list of marketplace listing titles found via text search:
    ${titleList}
    For each listing, rate how likely it is to actually be the exact item the shopper is searching for, on a scale of 0-10.
    Score 9-10: brand matches AND the specific named style/variant matches exactly.
    Score 5-7: brand and general item type match, but the specific named variant is different. IMPORTANT: this applies even when listings are clearly from the same product line or collection — e.g. if the query asks for "Basketball Heel" and a listing says "Tennis Ball" or "Baseball" heel from the same brand/seller, that is a DIFFERENT variant, not a match, even though it's obviously a related design. Do not score these as 9-10 just because they share a brand, seller, or general design concept.
    Score 0-4: different brand, different item type, or only a generic word in common (e.g. matching on "heel" or "shoe" alone is not enough).
    Be strict about exact variant names when the shopper's query names one specifically.
    Respond with ONLY a comma-separated list of ${candidates.length} numbers, one per listing, in order. Example: 8,1,0,6,9,2...`;

    try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!res.ok) {
            const errorBody = await res.text();
            console.error(`[rankByRelevance] Groq API call failed (${res.status}):`, errorBody);
            return results;
        }

        const data = await res.json();
        const text = (data.choices?.[0]?.message?.content || '').trim();
        console.log(`[rankByRelevance] Groq raw response: "${text}"`);

        const scores = text.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        console.log(`[rankByRelevance] Parsed ${scores.length} scores, expected ${candidates.length}`);

        if (Math.abs(scores.length - candidates.length) > 8) {
            console.log('[rankByRelevance] Score count mismatch — falling back to unranked results');
            return results;
        }

        const scored = candidates
            .map((item, i) => ({ item, score: scores[i] }))
            .filter(s => s.score >= 5)
            .sort((a, b) => b.score - a.score)
            .map(s => s.item);

        console.log('[rankByRelevance] Top 5 after ranking:',
            scored.slice(0, 5).map((item, i) => `#${i + 1} "${item.title}" (score: ${scores[i]})`));

        return scored.length > 0 ? scored : results;

    } catch (err) {
        console.error('[rankByRelevance] Unexpected error:', err.message);
        return results;
    }
}

async function resolveDirectUrl(immersiveApiUrl, serpApiKey, fallbackUrl) {
    if (!immersiveApiUrl) return fallbackUrl;
    try {
        const res = await fetch(`${immersiveApiUrl}&api_key=${serpApiKey}`);
        if (!res.ok) return fallbackUrl;
        const data = await res.json();
        console.log('[resolveDirectUrl] product_results:', JSON.stringify(data?.product_results).slice(0, 500));
        const link = data?.sellers_results?.online_sellers?.[0]?.link
            || data?.product_results?.sellers?.[0]?.link
            || data?.product_results?.online_sellers?.[0]?.link
            || data?.product_results?.stores?.[0]?.link;
        console.log('[resolveDirectUrl] stores:', JSON.stringify(data?.product_results?.stores?.[0]));
        return link || fallbackUrl;
    } catch {
        return fallbackUrl;
    }
}

module.exports = { runSearch };