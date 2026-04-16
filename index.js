const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const STORE_HASH = 'prsxnxsly0';
const ACCESS_TOKEN = 'nzv1vxafw5v1xu3bvwfzhlzw8zt4ero';
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;
const BC_BASE = `https://api.bigcommerce.com/stores/${STORE_HASH}/v3`;
const BC_HEADERS = {
  'X-Auth-Token': ACCESS_TOKEN,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

app.get('/products', async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    const url = `${BC_BASE}/catalog/products?keyword=${encodeURIComponent(keyword)}&limit=8&include_fields=id,name,sku,description,page_title,meta_description,search_keywords,weight,width,depth,height`;
    const r = await fetch(url, { headers: BC_HEADERS });
    const data = await r.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/products/:id/variants', async (req, res) => {
  try {
    const url = `${BC_BASE}/catalog/products/${req.params.id}/variants?limit=50&include_fields=id,sku,option_values`;
    const r = await fetch(url, { headers: BC_HEADERS });
    const data = await r.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/products/:id/custom-fields', async (req, res) => {
  try {
    const url = `${BC_BASE}/catalog/products/${req.params.id}/custom-fields`;
    const r = await fetch(url, { headers: BC_HEADERS });
    const data = await r.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const url = `${BC_BASE}/catalog/products/${req.params.id}`;
    const r = await fetch(url, { method: 'PUT', headers: BC_HEADERS, body: JSON.stringify(req.body) });
    const data = await r.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

async function googleSearch(query) {
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&num=5`;
    const r = await fetch(url);
    const data = await r.json();
    if (!data.items) return '';
    return data.items.map(item => `${item.title}: ${item.snippet}`).join('\n');
  } catch(e) {
    return '';
  }
}

app.post('/generate', async (req, res) => {
  try {
    const variants = req.body.variants && req.body.variants.length > 0 ? req.body.variants.join(', ') : '';
    const specs = req.body.specs || {};
    const customFields = req.body.customFields || [];
    const customFieldsText = customFields.length > 0 ? customFields.map(f => `${f.name}: ${f.value}`).join('\n') : '';

    const searchQuery = `${req.body.product} ${req.body.sku} commercial restaurant equipment specs`;
    const searchResults = await googleSearch(searchQuery);

    const prompt = `You are an expert SEO copywriter for Sparrow Food Solutions (sparrowfoodsolutions.com), a restaurant equipment and supplies store. You write balanced SEO + conversion copy that helps customers find the site AND buy.

Use the Google search results below to verify product details before writing. Only include facts you can confirm — never invent specs like country of origin, certifications, or dimensions unless they appear in the data provided.

PRODUCT INFO FROM STORE:
Product: ${req.body.product}
SKU: ${req.body.sku}
${variants ? 'Variants: ' + variants : ''}
${specs.weight ? 'Weight: ' + specs.weight + ' lbs' : ''}
${specs.width ? 'Dimensions: ' + specs.width + '"W x ' + specs.depth + '"D x ' + specs.height + '"H' : ''}
${customFieldsText}

GOOGLE SEARCH RESULTS FOR THIS PRODUCT:
${searchResults || 'No results found — use only confirmed store data above.'}

Write a complete product page in HTML. Return ONLY valid JSON with no markdown or backticks.

Structure:
1. <h2> headline with primary keyword
2. <p> opening paragraph — benefit-focused, who it's for, why buy it
3. <p> second paragraph — features, use cases, kitchen operations
4. <h3>Key Features</h3><ul> — 5-6 bullets: <li><strong>Name:</strong> benefit</li>
5. <h3>Product Specifications</h3><table border="1" cellpadding="6" cellspacing="0" width="100%" style="border-collapse:collapse"> — confirmed specs only
6. <h3>Ideal For</h3><ul> — 5-6 operation types
7. <p><strong>Why It Works:</strong> closing sentence

Return: {"description":"HTML","page_title":"under 60 chars","meta_description":"under 155 chars with CTA","search_keywords":"broad1, broad2, broad3 | long-tail1, long-tail2, long-tail3"}`;

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await r.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000);
