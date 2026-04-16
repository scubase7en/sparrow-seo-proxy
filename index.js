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

app.post('/generate', async (req, res) => {
  try {
    const variants = req.body.variants && req.body.variants.length > 0 ? req.body.variants.join(', ') : '';
    const specs = req.body.specs || {};
    const customFields = req.body.customFields || [];

    const customFieldsText = customFields.length > 0
      ? customFields.map(f => `${f.name}: ${f.value}`).join('\n')
      : '';

    const prompt = `You are an SEO copywriter for Sparrow Food Solutions, a restaurant equipment store. Generate content for this product and return ONLY a JSON object with no markdown.

Product: ${req.body.product}
SKU: ${req.body.sku}
${variants ? 'Variants: ' + variants : ''}
${specs.weight ? 'Weight: ' + specs.weight + ' lbs' : ''}
${specs.width ? 'Dimensions: ' + specs.width + '"W x ' + specs.depth + '"D x ' + specs.height + '"H' : ''}
${customFieldsText}

Return this JSON:
{
  "description": "<h2>Catchy headline with main keyword</h2><p>Benefit-focused paragraph for food service pros with power words.</p><p>Second paragraph about features, use cases, and why they should buy now.</p><h3>Key Features</h3><ul><li><strong>Feature 1:</strong> Description</li><li><strong>Feature 2:</strong> Description</li><li><strong>Feature 3:</strong> Description</li><li><strong>Feature 4:</strong> Description</li><li><strong>Feature 5:</strong> Description</li></ul>${customFieldsText ? '<h3>Product Specifications</h3><table border=1 cellpadding=4 cellspacing=0 width=100%><tr><td>Model</td><td>${req.body.sku}</td></tr>SPECS_ROWS</table>' : ''}<h3>Ideal For</h3><ul><li>Restaurants</li><li>Catering operations</li><li>Cafeterias and food courts</li><li>Hotel banquet services</li></ul><p><strong>Why It Works:</strong> Closing sentence tying together key benefits.</p>",
  "page_title": "Under 60 char SEO title",
  "meta_description": "Under 155 char meta with call to action",
  "search_keywords": "broad1, broad2, broad3 | long-tail1, long-tail2, long-tail3"
}

Replace SPECS_ROWS with actual table rows for each spec provided. Keep description under 800 words total.`;

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
