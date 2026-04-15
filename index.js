const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

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
    const prompt = `You are an SEO expert for a restaurant equipment and supplies store called Sparrow Food Solutions. Customers are restaurant owners, bakeries, catering companies, and food service professionals.

Generate optimized SEO content for this product. Return ONLY valid JSON, no markdown, no backticks.

Product: ${req.body.product}
SKU: ${req.body.sku}

Return exactly this JSON:
{"description":"2 short paragraphs of plain text for food service buyers","page_title":"SEO title under 60 chars","meta_description":"Meta description under 155 chars with call to action","search_keywords":"5-6 comma separated keywords"}`;

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
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Sparrow Food Solutions — SEO Tool</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;color:#1a1a1a;padding:2rem}
.container{max-width:760px;margin:0 auto}
.header{display:flex;align-items:center;gap:14px;margin-bottom:2rem}
.logo{width:48px;height:48px;border-radius:10px;background:#e8f0fe;display:flex;align-items:center;justify-content:center;font-size:24px}
h1{font-size:20px;font-weight:600}
.subtitle{font-size:13px;color:#4caf50;margin-top:2px}
.card{background:white;border-radius:12px;border:1px solid #e5e5e5;padding:1.25rem;margin-bottom:1rem}
label{font-size:12px;color:#666;font-weight:500;display:block;margin-bottom:6px}
input[type=text],textarea{width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;font-family:inherit;outline:none}
input[type=text]:focus,textarea:focus{border-color:#4285f4}
textarea{resize:vertical;line-height:1.6}
.row{display:flex;gap:8px;align-items:center}
.row input{flex:1}
.field{margin-bottom:1rem}
.field-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.char-count{font-size:11px;color:#999}
.char-count.warn{color:#f59e0b}
.char-count.over{color:#ef4444}
.btn{padding:9px 20px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;border:none}
.btn-blue{background:#4285f4;color:white}
.btn-blue:hover{background:#3574e2}
.btn-blue:disabled{opacity:0.5;cursor:not-allowed}
.btn-green{background:#4caf50;color:white}
.btn-green:hover{background:#43a047}
.btn-green:disabled{opacity:0.5;cursor:not-allowed}
.btn-gray{background:white;color:#333;border:1px solid #ddd}
.btn-gray:hover{background:#f5f5f5}
.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
.status{font-size:13px;margin-top:8px;min-height:18px}
.status.ok{color:#4caf50}
.status.err{color:#ef4444}
.status.info{color:#666}
.product-list{margin-top:10px}
.product-item{padding:10px 14px;border-radius:8px;border:1px solid #e5e5e5;background:white;margin-bottom:6px;cursor:pointer;display:flex;justify-content:space-between;align-items:center}
.product-item:hover{background:#f9f9f9;border-color:#4285f4}
.product-name{font-size:14px;font-weight:500}
.product-sku{font-size:12px;color:#888;margin-top:2px}
.product-card{background:#f5f5f5;border-radius:8px;padding:10px 14px;margin-bottom:1rem}
.tabs{display:flex;gap:4px;border-bottom:1px solid #e5e5e5;margin-bottom:1rem}
.tab{padding:8px 16px;font-size:13px;cursor:pointer;border:none;background:none;border-bottom:2px solid transparent;color:#666}
.tab.active{color:#1a1a1a;border-bottom-color:#4285f4;font-weight:500}
.divider{border:none;border-top:1px solid #e5e5e5;margin:1rem 0}
.success-banner{background:#e8f5e9;border:1px solid #a5d6a7;border-radius:8px;padding:10px 14px;font-size:13px;color:#2e7d32;margin-top:12px;display:none}
.spinner{display:inline-block;width:12px;height:12px;border:2px solid #ddd;border-top-color:#4285f4;border-radius:50%;animation:spin 0.8s linear infinite;margin-right:6px;vertical-align:middle}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">🐦</div>
    <div>
      <h1>Sparrow Food Solutions — SEO Tool</h1>
      <div class="subtitle">Connected to BigCommerce</div>
    </div>
  </div>
  <div class="card" id="search-section">
    <label>Search products by name or SKU</label>
    <div class="row">
      <input type="text" id="search-input" placeholder="e.g. ALCP1604, fryer, prep table..."/>
      <button class="btn btn-blue" onclick="searchProducts()" id="search-btn">Search</button>
    </div>
    <div class="status info" id="search-status"></div>
    <div class="product-list" id="product-list"></div>
  </div>
  <div id="editor-section" style="display:none">
    <div class="card">
      <div class="tabs">
        <button class="tab active" onclick="switchTab('content')">Description</button>
        <button class="tab" onclick="switchTab('seo')">SEO & metadata</button>
      </div>
      <div id="product-info"></div>
      <div id="tab-content">
        <div class="field">
          <label>Product description</label>
          <textarea id="f-desc" rows="8"></textarea>
        </div>
      </div>
      <div id="tab-seo" style="display:none">
        <div class="field">
          <div class="field-header">
            <label style="margin:0">Page title</label>
            <span class="char-count" id="cc-title"></span>
          </div>
          <input type="text" id="f-title" oninput="countChars('f-title','cc-title',60)"/>
        </div>
        <div class="field">
          <div class="field-header">
            <label style="margin:0">Meta description</label>
            <span class="char-count" id="cc-meta"></span>
          </div>
          <textarea id="f-meta" rows="3" oninput="countChars('f-meta','cc-meta',160)"></textarea>
        </div>
        <div class="field">
          <label>Search keywords</label>
          <input type="text" id="f-keys" placeholder="comma separated"/>
        </div>
      </div>
      <div class="divider"></div>
      <div class="actions">
        <button class="btn btn-blue" onclick="generateContent()" id="gen-btn">Generate with AI</button>
        <button class="btn btn-green" onclick="saveToStore()" id="save-btn">Save to BigCommerce</button>
        <button class="btn btn-gray" onclick="resetEditor()">← Back</button>
      </div>
      <div class="status" id="action-status"></div>
      <div class="success-banner" id="success-banner">✓ Saved successfully to BigCommerce!</div>
    </div>
  </div>
</div>
<script>
let currentProduct=null;
async function searchProducts(){
  const q=document.getElementById('search-input').value.trim();
  if(!q)return;
  const st=document.getElementById('search-status');
  const pl=document.getElementById('product-list');
  const btn=document.getElementById('search-btn');
  st.innerHTML='<span class="spinner"></span>Searching...';
  st.className='status info';
  pl.innerHTML='';
  btn.disabled=true;
  try{
    const res=await fetch('/products?keyword='+encodeURIComponent(q));
    const data=await res.json();
    const products=data.data||[];
    if(products.length===0){st.textContent='No products found.';st.className='status err';}
    else{
      st.textContent='Found '+products.length+' product'+(products.length>1?'s':'')+' — click one to edit';
      st.className='status ok';
      products.forEach(p=>{
        const div=document.createElement('div');
        div.className='product-item';
        div.innerHTML='<div><div class="product-name">'+p.name+'</div><div class="product-sku">SKU: '+(p.sku||'N/A')+'</div></div><span style="font-size:12px;color:#888">Edit →</span>';
        div.onclick=()=>loadProduct(p);
        pl.appendChild(div);
      });
    }
  }catch(e){st.textContent='Error: '+e.message;st.className='status err';}
  btn.disabled=false;
}
function loadProduct(p){
  currentProduct=p;
  document.getElementById('search-section').style.display='none';
  document.getElementById('editor-section').style.display='block';
  document.getElementById('product-info').innerHTML='<div class="product-card"><div class="product-name">'+p.name+'</div><div class="product-sku">SKU: '+(p.sku||'N/A')+' | ID: '+p.id+'</div></div>';
  document.getElementById('f-desc').value=(p.description||'').replace(/<[^>]*>/g,'').trim();
  document.getElementById('f-title').value=p.page_title||'';
  document.getElementById('f-meta').value=p.meta_description||'';
  document.getElementById('f-keys').value=p.search_keywords||'';
  countChars('f-title','cc-title',60);countChars('f-meta','cc-meta',160);
  document.getElementById('success-banner').style.display='none';
  document.getElementById('action-status').textContent='';
  switchTab('content');
}
function switchTab(tab){
  document.getElementById('tab-content').style.display=tab==='content'?'block':'none';
  document.getElementById('tab-seo').style.display=tab==='seo'?'block':'none';
  document.querySelectorAll('.tab').forEach((t,i)=>t.classList.toggle('active',(i===0&&tab==='content')||(i===1&&tab==='seo')));
}
function countChars(fieldId,countId,limit){
  const len=document.getElementById(fieldId).value.length;
  const el=document.getElementById(countId);
  el.textContent=len+'/'+limit;
  el.className='char-count'+(len>limit?' over':len>limit*0.9?' warn':'');
}
async function generateContent(){
  if(!currentProduct)return;
  const btn=document.getElementById('gen-btn');
  const st=document.getElementById('action-status');
  btn.disabled=true;
  st.innerHTML='<span class="spinner"></span>Generating SEO content...';
  st.className='status info';
  document.getElementById('success-banner').style.display='none';
  try{
    const res=await fetch('/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({product:currentProduct.name,sku:currentProduct.sku||'N/A'})});
    const data=await res.json();
    let text=(data.content||[]).map(b=>b.text||'').join('').replace(/\`\`\`json|\`\`\`/g,'').trim();
    const p=JSON.parse(text);
    document.getElementById('f-desc').value=p.description||'';
    document.getElementById('f-title').value=p.page_title||'';
    document.getElementById('f-meta').value=p.meta_description||'';
    document.getElementById('f-keys').value=p.search_keywords||'';
    countChars('f-title','cc-title',60);countChars('f-meta','cc-meta',160);
    st.textContent='Content generated! Review and save when ready.';
    st.className='status ok';
    switchTab('content');
  }catch(e){st.textContent='Generation failed: '+e.message;st.className='status err';}
  btn.disabled=false;
}
async function saveToStore(){
  if(!currentProduct)return;
  const btn=document.getElementById('save-btn');
  const st=document.getElementById('action-status')
