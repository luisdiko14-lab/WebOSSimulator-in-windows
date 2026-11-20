(() => {
  'use strict';
  const featureBase = new URL('./windows-features/', document.currentScript.src);
  const ids = ['quick-settings','virtual-desktops','snap-layouts','clipboard-history','focus-sessions','widgets-dashboard','notification-history','personalization','accessibility','app-permissions','system-monitor','storage-sense','power-profiles','shortcut-guide','restore-points'];
  const features = new Map();
  const KEY = 'wos-nexus-state-v1';
  let state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) {}
  let activeFeature = null;
  let launch, panel, grid, detail, heading, subtitle, toastNode;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }
  function api(feature) {
    return {
      get(key, fallback){ const value=state[feature.id+':'+key]; return value === undefined ? fallback : value; },
      set(key, value){ state[feature.id+':'+key]=value; save(); },
      toast(message){ toast(String(message)); },
      escape: esc,
      root: detail
    };
  }
  function toast(message) {
    if(!toastNode) return;
    toastNode.textContent=message;
    toastNode.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer=setTimeout(()=>toastNode.classList.remove('show'),2300);
  }
  function controlsHTML(f) {
    return (f.controls || []).map(c => {
      const value = api(f).get(c.key, c.default);
      if(c.type==='toggle') return '<label class="wosu-control"><span><b>'+esc(c.label)+'</b><small>'+esc(c.detail||'Simulation setting')+'</small></span><input type="checkbox" data-setting="'+esc(c.key)+'" '+(value?'checked':'')+'><i></i></label>';
      if(c.type==='range') return '<label class="wosu-control wosu-range"><span><b>'+esc(c.label)+'</b><small data-value-for="'+esc(c.key)+'">'+esc(value ?? c.default ?? '')+'</small></span><input type="range" data-setting="'+esc(c.key)+'" min="'+(c.min??0)+'" max="'+(c.max??100)+'" step="'+(c.step??1)+'" value="'+esc(value ?? c.default ?? 50)+'"></label>';
      if(c.type==='select') return '<label class="wosu-control wosu-select"><span><b>'+esc(c.label)+'</b><small>'+esc(c.detail||'Choose an option')+'</small></span><select data-setting="'+esc(c.key)+'">'+(c.options||[]).map(o=>'<option value="'+esc(o.value)+'" '+(String(value)===String(o.value)?'selected':'')+'>'+esc(o.label)+'</option>').join('')+'</select></label>';
      if(c.type==='button') return '<div class="wosu-control wosu-action"><span><b>'+esc(c.label)+'</b><small>'+esc(c.detail||'')+'</small></span><button data-action="'+esc(c.action)+'">'+esc(c.button||'Open')+'</button></div>';
      return '<div class="wosu-note">'+esc(c.text||c.label||'')+'</div>';
    }).join('');
  }
  function renderDashboard() {
    grid.hidden=false; detail.hidden=true; activeFeature=null;
    grid.innerHTML=Array.from(features.values()).map(f=>'<button class="wosu-card" data-feature="'+esc(f.id)+'"><span>'+esc(f.icon||'◈')+'</span><b>'+esc(f.title)+'</b><small>'+esc(f.short||f.description||'')+'</small></button>').join('');
    grid.querySelectorAll('[data-feature]').forEach(btn=>btn.addEventListener('click',()=>openFeature(btn.dataset.feature)));
    heading.textContent='Nexus Control Center'; subtitle.textContent=features.size+' tools for your Windows simulation';
  }
  function openFeature(id) {
    const f=features.get(id); if(!f) return;
    activeFeature=f; grid.hidden=true; detail.hidden=false;
    heading.textContent=(f.icon||'◈')+' '+f.title; subtitle.textContent=f.description||'Local simulation feature';
    detail.innerHTML='<div class="wosu-feature-intro">'+esc(f.description||'')+'</div>'+controlsHTML(f)+(f.content||'');
    detail.querySelectorAll('[data-setting]').forEach(input=>{
      const update=()=>{const value=input.type==='checkbox'?input.checked:input.type==='range'?Number(input.value):input.value; api(f).set(input.dataset.setting,value); const out=detail.querySelector('[data-value-for="'+input.dataset.setting+'"]'); if(out) out.textContent=String(value); if(f.onSetting) f.onSetting(input.dataset.setting,value,api(f),detail);};
      input.addEventListener(input.type==='range'?'input':'change',update);
    });
    detail.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>{
      const fn=f.actions && f.actions[btn.dataset.action]; if(fn) fn(api(f),detail,btn);
    }));
    if(f.mount) f.mount(detail,api(f));
  }
  function register(feature) { if(!feature || !feature.id) return; features.set(feature.id,feature); if(panel && !grid.hidden && panel.classList.contains('open')) renderDashboard(); }
  window.WOSFeatureHub={register,api:(id)=>features.has(id)?api(features.get(id)):null,open:()=>showPanel(),toast};
  function showPanel(){ panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); renderDashboard(); }
  function closePanel(){ panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); }
  function init() {
    launch=document.createElement('button'); launch.className='wosu-launcher'; launch.type='button'; launch.innerHTML='<span>✦</span> Nexus'; launch.title='Open Windows simulation upgrades (Ctrl+Shift+X)';
    panel=document.createElement('section'); panel.className='wosu-panel'; panel.setAttribute('aria-hidden','true');
    panel.innerHTML='<header class="wosu-head"><div><b id="wosu-heading">Nexus Control Center</b><small id="wosu-subtitle">15 simulation upgrades</small></div><button class="wosu-close" aria-label="Close">×</button></header><div class="wosu-grid" id="wosu-grid"></div><div class="wosu-detail" id="wosu-detail" hidden></div><footer>Local browser simulation · Settings stay on this device</footer>';
    toastNode=document.createElement('div'); toastNode.className='wosu-toast';
    document.body.append(launch,panel,toastNode);
    grid=panel.querySelector('#wosu-grid'); detail=panel.querySelector('#wosu-detail'); heading=panel.querySelector('#wosu-heading'); subtitle=panel.querySelector('#wosu-subtitle');
    launch.addEventListener('click',showPanel); panel.querySelector('.wosu-close').addEventListener('click',closePanel);
    document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='x'){e.preventDefault();panel.classList.contains('open')?closePanel():showPanel();}if(e.key==='Escape')closePanel();});
    const screen=document.getElementById('screen-desktop');
    if(screen){const sync=()=>launch.style.display=screen.classList.contains('active')?'flex':'none';sync();new MutationObserver(sync).observe(screen,{attributes:true,attributeFilter:['class']});}
    Promise.all(ids.map(id=>new Promise(resolve=>{const s=document.createElement('script');s.src=new URL(id+'.js',featureBase).href;s.onload=resolve;s.onerror=resolve;document.head.appendChild(s);}))).then(()=>{if(features.size!==15)toast('Loaded '+features.size+' of 15 upgrade modules');});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();