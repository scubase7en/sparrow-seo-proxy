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
    const variantsText = req.body.variants && req.body.variants.length > 0
      ? `Available variants/sizes: ${req.body.variants.join(', ')}`
      : 'No variants — single product';

    const specsText = req.body.specs
      ? `Product specs from store: Weight: ${req.body.specs.weight || 'N/A'} lbs, Dimensions: ${req.body.specs.width || 'N/A'}"W x ${req.body.specs.depth || 'N/A'}"D x ${req.body.specs.height || 'N/A'}"H`
      : '';

    const prompt = `You are an expert ecommerce copywriter and SEO strategist for Sparrow Food Solutions (sparrowfoodsolutions.com), a restaurant equipment and supplies store. Your goal is to maximize organic search traffic AND drive conversions from restaurant owners, bakeries, catering companies, and food service professionals.

Generate a DETAILED, high-converting, SEO-optimized product description in the style of a professional restaurant equipment retailer. Return ONLY valid JSON with no markdown or backticks.

Product: ${req.body.product}
SKU: ${req.body.sku}
${variantsText}
${specsText}

Generate a rich product description with ALL of these sections formatted as HTML:

1. Opening headline (h2) with main keyword
2. 2-3 persuasive paragraphs highlighting benefits, use cases, and why food service pros should buy it. Use power words. Naturally include keywords.
3. Key Features section (h3) with 5-6 bullet points (strong tag for feature name, then description)
4. Product Specifications table (h3) using an HTML table with alternating rows. Include any specs provided plus model/SKU. If variants exist list them.
5. Ideal For section (h3) with bullet points listing the types of operations this suits
6. A closing Why It Works paragraph that ties together the key selling points

For SEO fields:
- Page title: Primary keyword + key benefit, under 60 chars
- Meta description: Key benefit + strong call to action, under 155 chars  
- Search keywords: TWO tiers: "broad1, broad2, broad3, broad4 | long-tail1, long-tail2, long-tail3, long-tail4"

Return exactly: {"description":"full HTML description","page_title":"page title","meta_description":"meta description","search_keywords":"broad | long-tail"}`;

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
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
