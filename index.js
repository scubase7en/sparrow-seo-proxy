const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const STORE_HASH = 'prsxnxsly0';
const ACCESS_TOKEN = 'nzv1vxafw5v1xu3bvwfzhlzw8zt4ero';
const ANTHROPIC_KEY = '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';
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
    const prompt = `You are an SEO expert for Sparrow Food Solutions. Generate SEO content for this product. Return ONLY valid JSON with these exact keys: description, page_title, meta_description, search_keywords. Product: ${req.body.product} SKU: ${req.body.sku}`;
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const text = await r.text();
    res.setHeader('Content-Type', 'application/json');
    res.send(text);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => {
  res.send('<h1>Sparrow SEO Proxy is running!</h1>');
});

app.listen(process.env.PORT || 3000);
