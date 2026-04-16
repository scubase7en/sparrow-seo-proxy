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
    const customFieldsText = customFields.length > 0 ? customFields.map(f => `${f.name}: ${f.value}`).join('\n') : '';

    const specsRows = [
      `<tr><td><strong>Model</strong></td><td>${req.body.sku}</td></tr>`,
      specs.weight ? `<tr><td><strong>Weight</strong></td><td>${specs.weight} lbs</td></tr>` : '',
      specs.width ? `<tr><td><strong>Dimensions</strong></td><td>${specs.width}"W x ${specs.depth}"D x ${specs.height}"H</td></tr>` : '',
      customFields.map(f => `<tr><td><strong>${f.name}</strong></td><td>${f.value}</td></tr>`).join('')
    ].filter(Boolean).join('');

    const variantsTable = variants ? `<h3>Available Options</h3><ul>${req.body.variants.map(v => `<li>${v}</li>`).join('')}</ul>` : '';

    const prompt = `You are an expert SEO copywriter for Sparrow Food Solutions (sparrowfoodsolutions.com), a restaurant equipment and supplies store. You write balanced SEO + conversion copy that helps customers find the site AND buy.

Generate a complete, rich product page in HTML. Return ONLY valid JSON with no markdown or backticks.

Product: ${req.body.product}
SKU: ${req.body.sku}
${variants ? 'Available variants: ' + variants : ''}
${specs.weight ? 'Weight: ' + specs.weight + ' lbs' : ''}
${specs.width ? 'Dimensions: ' + specs.width + '"W x ' + specs.depth + '"D x ' + specs.height + '"H' : ''}
${customFieldsText}

Write the description as HTML with this EXACT structure:
1. <h2> - Compelling headline with primary keyword (mention origin like "Made in Korea" if relevant)
2. <p> - Opening paragraph: what it is, who it's for, why food service pros should buy it. Benefit-driven, not just specs. Include natural keywords.
3. <p> - Second paragraph: features, use cases, how it improves kitchen operations. Varied language.
4. <h3>Key Features</h3><ul> - 5-6 bullet points. Each: <li><strong>Feature Name:</strong> benefit-focused description</li>
5. <h3>Product Specifications</h3><table border="1" cellpadding="6" cellspacing="0" width="100%" style="border-collapse:collapse"> - Include all specs provided plus model/SKU. Use <tr><td> rows.
6. ${variantsTable ? '<h3>Available Options</h3> - List all variants' : ''}
7. <h3>Ideal For</h3><ul> - 5-6 bullet points listing types of operations
8. <p><strong>Why It Works:</strong> - Closing sentence tying together key selling points

IMPORTANT: Keep total HTML under 900 characters of actual text content. Be concise but complete.

Also provide:
- page_title: model number + product type + key benefit, under 60 chars
- meta_description: key benefit + strong CTA like "Shop now" or "Order today", under 155 chars
- search_keywords: "broad1, broad2, broad3, broad4 | long-tail1, long-tail2, long-tail3, long-tail4" (tiered: broad high-volume | specific buyer-intent)

Return exactly: {"description":"full HTML","page_title":"title","meta_description":"meta","search_keywords":"broad | long-tail"}`;

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
