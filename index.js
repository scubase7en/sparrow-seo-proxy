<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Sparrow Food Solutions — SEO Tool</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;background:#f5f5f5;padding:2rem}
.wrap{max-width:720px;margin:0 auto}
.hdr{display:flex;align-items:center;gap:12px;margin-bottom:1.5rem}
.logo{width:44px;height:44px;background:#e8f0fe;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px}
h1{font-size:19px;font-weight:600}
.sub{font-size:12px;color:#4caf50}
.card{background:#fff;border-radius:12px;border:1px solid #e5e5e5;padding:1.2rem;margin-bottom:1rem}
label{font-size:12px;color:#666;font-weight:500;display:block;margin-bottom:5px}
input,textarea{width:100%;padding:8px 11px;border:1px solid #ddd;border-radius:8px;font-size:14px;font-family:inherit;outline:none}
input:focus,textarea:focus{border-color:#4285f4}
textarea{resize:vertical;line-height:1.6}
.row{display:flex;gap:8px}
.row input{flex:1}
.field{margin-bottom:.9rem}
.btn{padding:8px 18px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:none}
.blue{background:#4285f4;color:#fff}.blue:hover{background:#3574e2}.blue:disabled{opacity:.5;cursor:not-allowed}
.green{background:#4caf50;color:#fff}.green:hover{background:#43a047}.green:disabled{opacity:.5;cursor:not-allowed}
.gray{background:#fff;color:#333;border:1px solid #ddd}.gray:hover{background:#f5f5f5}
.acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
.msg{font-size:13px;margin-top:7px;min-height:16px}
.ok{color:#4caf50}.er{color:#ef4444}.in{color:#666}
.plist{margin-top:10px}
.pi{padding:10px 13px;border-radius:8px;border:1px solid #e5e5e5;background:#fff;margin-bottom:6px;cursor:pointer;display:flex;justify-content:space-between;align-items:center}
.pi:hover{background:#f9f9f9;border-color:#4285f4}
.pn{font-size:14px;font-weight:500}
.ps{font-size:12px;color:#888;margin-top:2px}
.pc{background:#f5f5f5;border-radius:8px;padding:10px 13px;margin-bottom:.9rem}
.vtag{display:inline-block;background:#e8f0fe;color:#1a73e8;font-size:11px;padding:2px 8px;border-radius:20px;margin:2px}
.tabs{display:flex;border-bottom:1px solid #e5e5e5;margin-bottom:.9rem}
.tab{padding:7px 15px;font-size:13px;cursor:pointer;border:none;background:none;border-bottom:2px solid transparent;color:#666}
.tab.on{color:#111;border-bottom-color:#4285f4;font-weight:500}
.hr{border:none;border-top:1px solid #e5e5e5;margin:.9rem 0}
.ok-banner{background:#e8f5e9;border:1px solid #a5d6a7;border-radius:8px;padding:9px 13px;font-size:13px;color:#2e7d32;margin-top:10px;display:none}
.spin{display:inline-block;width:11px;height:11px;border:2px solid #ddd;border-top-color:#4285f4;border-radius:50%;animation:sp .8s linear infinite;margin-right:5px;vertical-align:middle}
@keyframes sp{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div class="wrap">
<div class="hdr"><div class="logo">🐦</div><div><h1>Sparrow Food Solutions — SEO Tool</h1><div class="sub">Connected to BigCommerce · Variants auto-detected</div></div></div>
<div class="card" id="S">
<label>Search by product name or SKU</label>
<div class="row"><input type="text" id="si" placeholder="e.g. ALCP1604, fryer, cake pan..."/><button class="btn blue" onclick="doSearch()" id="sb">Search</button></div>
<div class="msg in" id="sm"></div>
<div class="plist" id="pl"></div>
</div>
<div id="E" style="display:none">
<div class="card">
<div class="tabs"><button class="tab on" onclick="doTab('c')">Description</button><button class="tab" onclick="doTab('s')">SEO & metadata</button></div>
<div id="pi"></div>
<div id="TC"><div class="field"><label>Product description</label><textarea id="fd" rows="7"></textarea></div></div>
<div id="TS" style="display:none">
<div class="field"><label>Page title <span id="ct" style="font-size:11px;color:#999"></span></label><input type="text" id="ft" oninput="cnt('ft','ct',60)"/></div>
<div class="field"><label>Meta description <span id="cm" style="font-size:11px;color:#999"></span></label><textarea id="fm" rows="3" oninput="cnt('fm','cm',160)"></textarea></div>
<div class="field"><label>Search keywords <span style="font-size:11px;color:#888">(broad | long-tail)</span></label><textarea id="fk" rows="3"></textarea></div>
</div>
<div class="hr"></div>
<div class="acts">
<button class="btn blue" onclick="doGen()" id="gb">Generate with AI</button>
<button class="btn green" onclick="doSave()" id="svb">Save to BigCommerce</button>
<button class="btn gray" onclick="doBack()">← Back</button>
</div>
<div class="msg" id="am"></div>
<div class="ok-banner" id="ob">✓ Saved to BigCommerce!</div>
</div>
</div>
</div>
<script>
const PR='https://sparrow-seo-proxy.onrender.com';
let cp=null,cv=[];
async function doSearch(){
  const q=document.getElementById('si').value.trim();if(!q)return;
  const sm=document.getElementById('sm'),pl=document.getElementById('pl'),sb=document.getElementById('sb');
  sm.innerHTML='<span class="spin"></span>Searching...';sm.className='msg in';pl.innerHTML='';sb.disabled=true;
  try{
    const r=await fetch(PR+'/products?keyword='+encodeURIComponent(q));
    const d=await r.json();const ps=d.data||[];
    if(!ps.length){sm.textContent='No products found.';sm.className='msg er';}
    else{
      sm.textContent='Found '+ps.length+' product'+(ps.length>1?'s':'')+' — click to edit';sm.className='msg ok';
      ps.forEach(p=>{const div=document.createElement('div');div.className='pi';
        div.innerHTML='<div><div class="pn">'+p.name+'</div><div class="ps">SKU: '+(p.sku||'N/A')+'</div></div><span style="font-size:12px;color:#888">Edit →</span>';
        div.onclick=()=>doLoad(p);pl.appendChild(div);});
    }
  }catch(e){sm.textContent='Error: '+e.message;sm.className='msg er';}
  sb.disabled=false;
}
async function doLoad(p){
  cp=p;cv=[];
  document.getElementById('S').style.display='none';document.getElementById('E').style.display='block';
  document.getElementById('fd').value=(p.description||'').replace(/<[^>]*>/g,'').trim();
  document.getElementById('ft').value=p.page_title||'';document.getElementById('fm').value=p.meta_description||'';document.getElementById('fk').value=p.search_keywords||'';
  cnt('ft','ct',60);cnt('fm','cm',160);
  document.getElementById('ob').style.display='none';document.getElementById('am').textContent='';doTab('c');
  document.getElementById('pi').innerHTML='<div class="pc"><div class="pn">'+p.name+'</div><div class="ps">SKU: '+(p.sku||'N/A')+' | ID: '+p.id+'</div><div id="vtags" style="margin-top:6px"><span class="spin"></span><span style="font-size:12px;color:#888">Loading variants...</span></div></div>';
  try{
    const r=await fetch(PR+'/products/'+p.id+'/variants');
    const d=await r.json();
    const variants=d.data||[];
    const vtags=document.getElementById('vtags');
    if(variants.length<=1){
      vtags.innerHTML='<span style="font-size:12px;color:#888">No variants — single product</span>';
    } else {
      const labels=[];
      variants.forEach(v=>{
        if(v.option_values&&v.option_values.length>0){
          const label=v.option_values.map(o=>o.label).join(' / ');
          labels.push(label);cv.push(label);
        }
      });
      vtags.innerHTML=labels.map(l=>'<span class="vtag">'+l+'</span>').join('');
    }
  }catch(e){
    document.getElementById('vtags').innerHTML='<span style="font-size:12px;color:#888">Could not load variants</span>';
  }
}
function doTab(t){
  document.getElementById('TC').style.display=t==='c'?'block':'none';document.getElementById('TS').style.display=t==='s'?'block':'none';
  document.querySelectorAll('.tab').forEach((x,i)=>x.className='tab'+(((i===0&&t==='c')||(i===1&&t==='s'))?' on':''));
}
function cnt(f,c,l){const n=document.getElementById(f).value.length,el=document.getElementById(c);el.textContent=n+'/'+l;el.style.color=n>l?'#ef4444':n>l*.9?'#f59e0b':'#999';}
async function doGen(){
  if(!cp)return;const gb=document.getElementById('gb'),am=document.getElementById('am');
  gb.disabled=true;am.innerHTML='<span class="spin"></span>Generating SEO content...';am.className='msg in';
  document.getElementById('ob').style.display='none';
  try{
    const r=await fetch(PR+'/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({product:cp.name,sku:cp.sku||'N/A',variants:cv})});
    const d=await r.json();
    let t=(d.content||[]).map(b=>b.text||'').join('').replace(/```json|```/g,'').trim();
    const g=JSON.parse(t);
    document.getElementById('fd').value=g.description||'';document.getElementById('ft').value=g.page_title||'';
    document.getElementById('fm').value=g.meta_description||'';document.getElementById('fk').value=g.search_keywords||'';
    cnt('ft','ct',60);cnt('fm','cm',160);
    am.textContent='Done! Review and save when ready.';am.className='msg ok';doTab('c');
  }catch(e){am.textContent='Failed: '+e.message;am.className='msg er';}
  gb.disabled=false;
}
async function doSave(){
  if(!cp)return;const svb=document.getElementById('svb'),am=document.getElementById('am');
  svb.disabled=true;am.innerHTML='<span class="spin"></span>Saving...';am.className='msg in';
  const desc=document.getElementById('fd').value;
  const html=desc.split('\n\n').filter(p=>p.trim()).map(p=>'<p>'+p+'</p>').join('')||'<p>'+desc+'</p>';
  try{
    const r=await fetch(PR+'/products/'+cp.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({description:html,page_title:document.getElementById('ft').value,meta_description:document.getElementById('fm').value,search_keywords:document.getElementById('fk').value})});
    const d=await r.json();if(!r.ok)throw new Error(d.title||JSON.stringify(d.errors));
    document.getElementById('ob').style.display='block';am.textContent='';
  }catch(e){am.textContent='Save failed: '+e.message;am.className='msg er';}
  svb.disabled=false;
}
function doBack(){cp=null;cv=[];document.getElementById('E').style.display='none';document.getElementById('S').style.display='block';document.getElementById('pl').innerHTML='';document.getElementById('sm').textContent='';}
document.getElementById('si').addEventListener('keydown',e=>{if(e.key==='Enter')doSearch();});
</script>
</body>
</html>
