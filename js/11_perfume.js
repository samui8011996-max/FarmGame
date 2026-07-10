/* =========================================================
   11_perfume.js — 香水店支線（19世紀・弗朗西斯限定）
   須排在 10_affair.js 之後載入。
   ---------------------------------------------------------
   解鎖條件：伴侶是弗朗西斯、19世紀、沒有任何情人、親密度達50。
   玩法比照廚房料理：調香台（備料→調製→熟成→收成）
   ＋展示櫃上架被動銷售＋固定客人訂單。
   沒有專屬美術圖時，場景/物件/作物一律退回色塊＋emoji顯示，
   之後把對應命名的 png 放進根目錄即可自動套用。
   ========================================================= */

/* ---------- 新增食材／作物／配方資料 ---------- */
Object.assign(EXTRAS, {
  bergamot:  {nm:'佛手柑', e:'🍊', price:12, merchantOnly:true},
  lavender:  {nm:'薰衣草', e:'💜', price:12, merchantOnly:true},
  vanilla:   {nm:'香草',   e:'🤎', price:16, merchantOnly:true},
  sandalwood:{nm:'檀香',   e:'🪵', price:22, merchantOnly:true},
});

FARM_CROPS.rose={ nm:'玫瑰', img:'rose.png', fw:32, fh:32,
  stages:['播種','發芽','成長','開花','結果'], frame:[0,1,2,3,4],
  grow:40000, yield:3, seed:10 };
FARM_CROPS.iris={ nm:'鳶尾', img:'iris.png', fw:32, fh:32,
  stages:['播種','發芽','成長','開花','結果'], frame:[0,1,2,3,4],
  grow:40000, yield:3, seed:12 };
FARM_CROPS.jasmine={ nm:'茉莉', img:'jasmine.png', fw:32, fh:32,
  stages:['播種','發芽','成長','開花','結果'], frame:[0,1,2,3,4],
  grow:40000, yield:3, seed:12 };
for(const _k of ['rose','iris','jasmine']){
  const d=FARM_CROPS[_k];
  d._img=new Image(); d._img.src=d.img;
  d.stageMs=d.grow/(d.stages.length-1);
}
CROP_ERA.rose=19; CROP_ERA.iris=19; CROP_ERA.jasmine=19;

MERCHANTS.Pedro.goods.push(
  {kind:'extra', k:'bergamot',   price:12, qty:5},
  {kind:'extra', k:'lavender',   price:12, qty:5},
  {kind:'extra', k:'vanilla',    price:16, qty:5},
  {kind:'extra', k:'sandalwood', price:22, qty:5},
);

const PERFUME_RECIPES={
  dew:{ nm:'英倫晨露', e:'🌫️', price:90,  batch:3, mix:3, agingMs:15000,
    ingredients:{bergamot:1, lavender:1, rose:1} },
  lover:{ nm:'法式戀人', e:'💐', price:130, batch:3, mix:3, agingMs:20000,
    ingredients:{iris:1, jasmine:1, vanilla:1} },
  century:{ nm:'百年玫瑰', e:'🌹', price:160, batch:3, mix:4, agingMs:25000,
    ingredients:{rose:2, sandalwood:1} },
};

/* ---------- 解鎖判定 ---------- */
function perfumeUnlocked(){
  return !!(S && S.partner && S.partner.id==='Francis' && S.era>=19
    && Object.keys(S.lovers||{}).length===0 && (S.partner.intimacy||0)>=50);
}
function ensurePerfumeState(){
  if(!S) return;
  if(!S.perfume) S.perfume={ menu:[], goods:{}, till:0, lastRun:Date.now(), guestDish:null, gday:0 };
  if(S.perfumeOpened===undefined) S.perfumeOpened=false;
}

/* ---------- 調香台（備料→調製→熟成→收成），仿廚房 prep/kCut/kKnead/kOven ---------- */
const pprep={ recipe:null, slots:{}, mix:0, aging:false, agingStart:0 };
function pRecipe(){ return PERFUME_RECIPES[pprep.recipe]; }
function pReady(){
  const r=pRecipe(); if(!r) return false;
  for(const k in r.ingredients){ if((pprep.slots[k]||0)!==r.ingredients[k]) return false; }
  return true;
}
function pRefund(){
  for(const k in pprep.slots){ const n=pprep.slots[k]||0; if(n>0){ if(EXTRAS[k]) S.extras[k]=(S.extras[k]||0)+n; else addStore(k,n); } }
  pprep.slots={};
}
function pPickRecipe(k){
  if(pprep.aging){ toast('正在熟成中，先等它做完'); return; }
  pRefund(); pprep.mix=0; pprep.recipe=k;
  openPerfumeBench(); save();
}
function pAddIng(k){
  const r=pRecipe(); if(!r) return;
  if(!(k in r.ingredients)){ toast('這款配方不需要這個材料'); return; }
  const have=pprep.slots[k]||0;
  if(have>=r.ingredients[k]){ toast('這個材料已經放夠了'); return; }
  if((S.store[k]||0)<=0 && (S.extras[k]||0)<=0){ toast('庫存不足'); return; }
  if((S.store[k]||0)>0) S.store[k]--; else S.extras[k]--;
  pprep.slots[k]=have+1;
  toast(`放入 ${ingNm(k)}`);
  openPerfumeBench(); save();
}
function pMix(){
  if(!pReady()){ toast('材料還沒放齊'); return; }
  pprep.mix++; toast(`🥄 調製 ${pprep.mix} 次`);
  openPerfumeBench(); save();
}
function pStartAging(){
  const r=pRecipe(); if(!r) return;
  if(!pReady()){ toast('材料還沒備齊'); return; }
  if(pprep.mix<r.mix){ toast(`還要調製 ${r.mix-pprep.mix} 次`); return; }
  pprep.aging=true; pprep.agingStart=Date.now();
  openPerfumeBench(); save();
}
function pCollect(){
  const r=pRecipe(); if(!r || !pprep.aging) return;
  const t=Date.now()-pprep.agingStart;
  if(t<r.agingMs){ toast(`還在熟成中（還要 ${fmtSec(r.agingMs-t)}）`); return; }
  ensurePerfumeState();
  S.perfume.goods[pprep.recipe]=(S.perfume.goods[pprep.recipe]||0)+r.batch;
  toast(`🧴 熟成完成！收成 ${r.nm} ×${r.batch}`);
  pprep.slots={}; pprep.mix=0; pprep.aging=false; pprep.recipe=null;
  openPerfumeBench(); save();
}
function openPerfumeBench(){
  ensurePerfumeState();
  if(pprep.aging){
    const r=pRecipe();
    if(!r){ pprep.aging=false; openPerfumeBench(); return; }
    const t=Date.now()-pprep.agingStart, left=Math.max(0,r.agingMs-t);
    openSheet(`<div class="sheethead"><h3>🧪 調香台</h3><button class="close" onclick="closeSheet()">✕</button></div>
      <div class="small" style="margin-bottom:10px">${r.e} ${r.nm} 熟成中…</div>
      <button class="btn ${left>0?'dis':'gold'}" style="width:100%" onclick="pCollect()">${left>0?`⏳ 還要 ${fmtSec(left)}`:'🧴 取出成品'}</button>`);
    return;
  }
  if(!pprep.recipe){
    let body='';
    for(const k in PERFUME_RECIPES){ const r=PERFUME_RECIPES[k];
      const ingTxt=Object.keys(r.ingredients).map(i=>`${ingNm(i)}×${r.ingredients[i]}`).join('・');
      body+=`<div class="menucard" style="display:flex;align-items:center;gap:8px">
        <div style="font-size:22px">${r.e}</div>
        <div style="flex:1"><div style="font-weight:700">${r.nm} <span class="small">售$${r.price}</span></div>
        <div class="small">${ingTxt}・調製${r.mix}次・熟成${fmtSec(r.agingMs)}</div></div>
        <button class="btn sm" onclick="pPickRecipe('${k}')">開始調製</button></div>`;
    }
    openSheet(`<div class="sheethead"><h3>🧪 調香台</h3><button class="close" onclick="closeSheet()">✕</button></div>
      <div class="small" style="margin-bottom:8px">選一款配方開始調製。</div>${body}`);
    return;
  }
  const r=pRecipe();
  let rows='';
  for(const k in r.ingredients){
    const need=r.ingredients[k], have=pprep.slots[k]||0, stock=(S.store[k]||0)+(S.extras[k]||0);
    rows+=`<div class="row"><div class="e">${prodIcon(k,28)}</div>
      <div class="info"><div class="n">${ingNm(k)} <span class="small">已放 ${have}/${need}・庫存 ${stock}</span></div></div>
      <button class="btn sm ${have>=need?'dis':''}" onclick="pAddIng('${k}')">放入</button></div>`;
  }
  const ready=pReady();
  openSheet(`<div class="sheethead"><h3>🧪 調香台・${r.e} ${r.nm}</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:8px">材料備齊後按「調製」，達到次數即可開始熟成。</div>
    ${rows}<div class="hr"></div>
    <div class="small" style="margin-bottom:6px">調製次數 ${pprep.mix}/${r.mix}</div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button class="btn sm ${ready?'':'dis'}" style="flex:1" onclick="pMix()">🥄 調製</button>
      <button class="btn sm ghost" style="flex:1" onclick="pPickRecipe(null)">↩️ 換配方（退回材料）</button>
    </div>
    <button class="btn gold ${(ready&&pprep.mix>=r.mix)?'':'dis'}" style="width:100%" onclick="pStartAging()">⏳ 開始熟成</button>`);
}

/* ---------- 展示櫃／上架＋收銀，仿 openMenu/toggleMenu/runCafe/collectTill ---------- */
function openPerfumeShelf(){
  ensurePerfumeState();
  let body='';
  for(const k in PERFUME_RECIPES){ const r=PERFUME_RECIPES[k];
    const on=S.perfume.menu.includes(k), made=S.perfume.goods[k]||0;
    if(made<=0 && !on) continue;
    body+=`<div class="menucard${on?' on':''}" style="display:flex;align-items:center;gap:8px">
      <div style="font-size:22px">${r.e}</div><div style="flex:1"><div style="font-weight:700">${r.nm} <span class="small">庫存 ${made}・售$${r.price}</span></div></div>
      <button class="btn sm ${on?'green':'ghost'}" onclick="pToggleMenu('${k}')">${on?'已上架':'上架'}</button></div>`;
  }
  if(!body) body='<div class="empty-note">還沒有任何香水成品，先去調香台做。</div>';
  openSheet(`<div class="sheethead"><h3>🗄️ 展示櫃</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:8px">上架後每天會有顧客自動上門購買，收入請到收銀台收取。</div>${body}`);
}
function pToggleMenu(k){
  ensurePerfumeState();
  const i=S.perfume.menu.indexOf(k);
  if(i>=0) S.perfume.menu.splice(i,1);
  else{ if((S.perfume.goods[k]||0)<=0){ toast('沒有成品可上架，先去調香台做'); return; } S.perfume.menu.push(k); }
  pRerollGuestDishes();
  openPerfumeShelf(); save();
}
function collectPerfumeTill(){
  ensurePerfumeState();
  if(S.perfume.till<=0){ toast('收銀台沒有錢'); return; }
  const t=Math.round(S.perfume.till);
  earn(t,'香水店營收');
  S.perfume.till=0;
  toast(`💰 收了 $${fmt(t)}`);
  save();
}
function runPerfume(now){
  ensurePerfumeState();
  const P=S.perfume;
  if(!P.menu.length){ P.lastRun=now; return; }
  let days=Math.min(7,Math.floor((now-(P.lastRun||now))/DAY));
  if(days<=0) return;
  const cap=4+P.menu.length*3;
  for(let d=0; d<days; d++){
    let total=0; for(const k of P.menu) total+=(P.goods[k]||0);
    if(total<=0) continue;
    let toSell=Math.min(total, Math.round(cap*(0.6+Math.random()*0.4))), rev=0;
    for(const k of [...P.menu].sort(()=>Math.random()-0.5)){
      if(toSell<=0) break;
      const av=P.goods[k]||0, s=Math.min(av, Math.ceil(toSell/P.menu.length)+1, toSell);
      rev+=s*PERFUME_RECIPES[k].price; P.goods[k]-=s; toSell-=s;
    }
    rev-=10; if(rev<0) rev=0; P.till+=rev;
  }
  P.lastRun=(P.lastRun||now)+days*DAY;
}

/* ---------- 客人訂單（簡化版 CAFE_GUESTS：現貨即賣，賣完立刻換單） ---------- */
const PERFUME_GUESTS=[
  {id:'pg1', x:5,  y:11, face:'🎩', nm:'紳士訪客', orderLine:'我想找一瓶{dish}。'},
  {id:'pg2', x:14, y:11, face:'👒', nm:'貴婦訪客', orderLine:'聽說這裡新開了香水店，來瓶{dish}吧。'},
];
function pDishPool(){
  ensurePerfumeState();
  const p=(S.perfume.menu||[]).filter(k=>PERFUME_RECIPES[k]);
  return p.length ? p : Object.keys(PERFUME_RECIPES);
}
function pPick(a){ return a[Math.floor(Math.random()*a.length)]; }
function ensurePerfumeGuests(){
  ensurePerfumeState();
  if(!S.perfume.guestDish || S.perfume.gday!==S.day){
    const pool=pDishPool(), dish={};
    for(const g of PERFUME_GUESTS) dish[g.id]=pPick(pool);
    S.perfume.guestDish=dish; S.perfume.gday=S.day;
  }
}
function pRerollGuestDishes(){
  ensurePerfumeState();
  if(!S.perfume.guestDish) return;
  const pool=pDishPool();
  for(const g of PERFUME_GUESTS) S.perfume.guestDish[g.id]=pPick(pool);
}
function openPerfumeGuest(id){
  ensurePerfumeGuests();
  const g=PERFUME_GUESTS.find(x=>x.id===id), k=S.perfume.guestDish[id], r=PERFUME_RECIPES[k];
  const have=(S.perfume.goods[k]||0)>0;
  openSheet(`<div class="sheethead"><h3>${g.face} ${g.nm}</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div style="background:var(--card);border:2px solid var(--line2);border-radius:12px;padding:12px;margin-bottom:14px;font-size:14px;line-height:1.5">${g.orderLine.replace('{dish}', r.nm)}</div>
    <button class="btn gold ${have?'':'dis'}" style="width:100%" onclick="servePerfumeGuest('${id}')">${have?`🧴 賣給他（+$${Math.round(r.price*1.3)}）`:'沒有現貨（先去調香台做）'}</button>`);
}
function servePerfumeGuest(id){
  ensurePerfumeGuests();
  const k=S.perfume.guestDish[id], r=PERFUME_RECIPES[k];
  if((S.perfume.goods[k]||0)<=0){ toast('沒有現貨'); return; }
  S.perfume.goods[k]--;
  const pay=Math.round(r.price*1.3);
  earn(pay, `香水訂單・${r.nm}`);
  const g=PERFUME_GUESTS.find(x=>x.id===id);
  toast(`🧴 ${g.nm}買走了 ${r.nm}，+$${pay}`);
  S.perfume.guestDish[id]=pPick(pDishPool());
  closeSheet(); refreshTop(); save();
}

/* ---------- 場景：香水店 ---------- */
MAPS.perfumery=[
  'FFFFFFFFFFFFFFFFFFFF',
  'F..................F',
  'F..................F',
  'F..................F',
  'F..................F',
  'F..................F',
  'F..................F',
  'F..................F',
  'F..................F',
  'F..................F',
  'F..................F',
  'F..................F',
  'F..................F',
  'F..................F',
  'F..................F',
  'F..................F',
  'F..................F',
  'FFFFFFFFFFFFFFFFFFFF',
];
GRID.perfumery=MAPS.perfumery.map(r=>r.padEnd(MAPS.perfumery[0].length,r[0]).split(''));
SCENES.perfumery={ title:'香水店', big:false, spawn:{x:9,y:14}, objects:[
  {id:'pbench', x:9,  y:5,  e:'🧪', nm:'調香台', kind:'perfumebench'},
  {id:'pshelf', x:13, y:5,  e:'🗄️', nm:'展示櫃', kind:'perfumeshelf'},
  {id:'ptill',  x:5,  y:5,  e:'💰', nm:'收銀台', kind:'perfumetill'},
  {id:'pguest_pg1', gid:'pg1', x:5,  y:11, e:'🎩', nm:'紳士訪客', kind:'perfumeguest'},
  {id:'pguest_pg2', gid:'pg2', x:14, y:11, e:'👒', nm:'貴婦訪客', kind:'perfumeguest'},
  {id:'pfrancis', x:9, y:3, e:'🧑', nm:'弗朗西斯', kind:'npc', npc:true,
    lines:['沒想到我們真的把這間店開起來了。','要不要也調一瓶屬於我們的味道？','客人的訂單，可別讓他們等太久喔。']},
]};
SCENE_NM.perfumery='香水店';
loadBg('perfumery','perfumery.png');
loadFg('perfumery','perfumery_fg.png');

/* ---------- 掛勾：互動、場景切換、時間流逝、更新迴圈 ---------- */
const _pfOrigInteract=interact;
interact=function(ev){
  if(!sitting && curScene==='perfumery'){
    const o=facingObject();
    if(o){
      if(o.kind==='perfumebench'){ if(ev&&ev.preventDefault) ev.preventDefault(); openPerfumeBench(); return; }
      if(o.kind==='perfumeshelf'){ if(ev&&ev.preventDefault) ev.preventDefault(); openPerfumeShelf(); return; }
      if(o.kind==='perfumetill'){ if(ev&&ev.preventDefault) ev.preventDefault(); collectPerfumeTill(); return; }
      if(o.kind==='perfumeguest'){ if(ev&&ev.preventDefault) ev.preventDefault(); openPerfumeGuest(o.gid); return; }
    }
  }
  return _pfOrigInteract(ev);
};

const _pfOrigGoScene=goScene;
goScene=function(name){
  _pfOrigGoScene(name);
  if(name==='perfumery') ensurePerfumeGuests();
};

const _pfOrigTick=tick;
tick=function(){ _pfOrigTick.apply(this,arguments); runPerfume(Date.now()); };

const _pfOrigUpdate=update;
update=function(){
  _pfOrigUpdate();
  if(!S || curScene!=='perfumery') return;
  const ob=document.getElementById('ovenbar');
  if(pprep.aging){
    const r=pRecipe();
    if(r){
      const t=Date.now()-pprep.agingStart;
      ob.classList.add('show'); ob.classList.remove('warn'); ob.classList.remove('burn');
      document.getElementById('ovenFill').style.width=Math.min(100,(t/r.agingMs)*100)+'%';
      document.getElementById('ovenTxt').textContent = t<r.agingMs ? `熟成中 ${Math.ceil((r.agingMs-t)/1000)}s` : '✅ 可以取出了';
    }
  }
  const hint=document.getElementById('hint');
  const o=facingObject();
  if(o && o.kind==='perfumebench'){ hint.textContent='🧪 調香台（互動鍵）'; hint.classList.add('show'); }
  else if(o && o.kind==='perfumeshelf'){ hint.textContent='🗄️ 展示櫃（互動鍵）'; hint.classList.add('show'); }
  else if(o && o.kind==='perfumetill'){ hint.textContent='💰 收銀台（互動鍵）'; hint.classList.add('show'); }
  else if(o && o.kind==='perfumeguest'){ hint.textContent='🧴 招呼客人（互動鍵）'; hint.classList.add('show'); }
};

/* ---------- 解鎖入口：伴侶面板追加按鈕、一次性劇情、前往選單追加卡片 ---------- */
const PERFUME_INVITE_LINES=[
  {who:'partner',mood:'happy',t:'亞瑟，我一直在想……我們何不開一間屬於自己的香水店？'},
  {who:'me',mood:'neutral',t:'「香水店？你我都沒做過這個。」'},
  {who:'partner',mood:'love',t:'不會的，有你在，什麼生意我都不怕。而且——我想親手為你調一瓶屬於我們的味道。'},
];
function enterPerfumeShop(){
  ensurePerfumeState();
  if(S.perfumeOpened){ goScene('perfumery'); return; }
  if(!S.partner) return;
  _convoCid=S.partner.id;
  freezeNpcById('partner');
  runScript(PERFUME_INVITE_LINES, [
    {t:'……好，開一間吧。', cls:'gold', run:()=>{
      S.perfumeOpened=true;
      addLog('🧴 和弗朗西斯一起開了香水店');
      toast('🧴 香水店開張了！');
      save();
      goScene('perfumery');
    }}
  ]);
}

const _pfOrigOpenPartner=openPartner;
openPartner=function(){
  _pfOrigOpenPartner.apply(this,arguments);
  ensurePerfumeState();
  if(!perfumeUnlocked()) return;
  const sheet=document.getElementById('sheet'); if(!sheet) return;
  const btn=document.createElement('button');
  btn.className='btn gold'; btn.style.cssText='width:100%;margin-top:8px';
  btn.textContent = S.perfumeOpened ? '🧴 去香水店' : '🧴 一起開間香水店？';
  btn.onclick=()=>{ closeSheet(); enterPerfumeShop(); };
  sheet.appendChild(btn);
};

const _pfOrigOpenTravel=openTravel;
openTravel=function(){
  _pfOrigOpenTravel.apply(this,arguments);
  ensurePerfumeState();
  if(!(perfumeUnlocked() && S.perfumeOpened)) return;
  const sheet=document.getElementById('sheet'); if(!sheet) return;
  sheet.insertAdjacentHTML('beforeend', `<div class="hr"></div><b class="small">事業</b>
    <button class="btn ${curScene==='perfumery'?'green':'ghost'}" style="width:100%;text-align:left;padding:13px 14px;margin-bottom:8px;font-size:15px;display:flex;align-items:center;gap:10px" onclick="closeSheet();goScene('perfumery')">
    <span style="font-size:22px">🧴</span><span style="flex:1">香水店</span>${curScene==='perfumery'?'<span class="small">目前所在</span>':''}</button>`);
};

const _pfOrigStart=startGame;
startGame=function(n){
  _pfOrigStart.apply(this,arguments);
  ensurePerfumeState();
  save();
};
/* =================== 🧴 香水店支線 結束 =================== */
