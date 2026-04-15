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
const BC_BASE = `https://api.bigcommerce.com/stores/${STORE_HASH}/v3`;
const BC_HEADERS = {
  'X-Auth-Token': ACCESS_TOKEN,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

app.get('/products', async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    const url = `${BC_BASE}/catalog/products?keyword=${encodeURIComponent(keyword)}&limit=8&include_fields=id,name,sku,description,page_title,meta_description,search_keywords`;
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

app.post('/generate', async (req, res) => {
  try {
    const prompt = `You are an expert ecommerce copywriter and SEO strategist for Sparrow Food Solutions (sparrowfoodsolutions.com), a restaurant equipment and supplies store. Your goal is to maximize organic search traffic AND drive conversions from restaurant owners, bakeries, catering companies, and food service professionals.

Generate high-converting, SEO-optimized content for this product. Return ONLY valid JSON with no markdown or backticks.

Product: ${req.body.product}
SKU: ${req.body.sku}

Guidelines:
- Description: 2-3 punchy paragraphs. Lead with the biggest benefit. Use power words that drive urgency and confidence (professional-grade, commercial-quality, built to last, trusted by chefs). Include natural high-volume keywords. End with a subtle call to action.
- Page title: Include the primary keyword + brand benefit. Under 60 characters.
- Meta description: Highlight a key benefit with a strong call to action like "Shop now" or "Order today". Under 155 characters.
- Search keywords: Provide TWO tiers separated by a pipe | symbol. First tier: 4-5 broad high-volume keywords that capture maximum traffic. Second tier: 4-5 specific long-tail buyer-intent phrases that convert best (e.g. "commercial 8 quart chafer set for catering"). Format: "broad1, broad2, broad3, broad4 | long-tail1, long-tail2, long-tail3, long-tail4"

Return exactly: {"description":"optimized description","page_title":"optimized page title","meta_description":"optimized meta description","search_keywords":"broad keywords | long-tail keywords"}`;

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
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
