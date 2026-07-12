/* =========================================================
   11_perfume.js — 香水店支線（19世紀・弗朗西斯限定）
   須排在 10_affair.js 之後載入。
   ---------------------------------------------------------
   解鎖條件：伴侶是弗朗西斯、19世紀、沒有任何情人、親密度達50。
   玩法：
   1) 蒸餾瓶：投入原料（農產品／魚貨／香料皆可），固定秒數萃取出精油。
   2) 調香台：前調／中調／後調各選一種精油，比例三格自動湊滿100%，
      可自訂名字＋挑香水瓶，配方書提供三款預設一鍵套用。
      材料本身有「調性(前/中/後)」＋「氣味標籤(花香/果香/木質/美食/腥羶)」
      ＋「品質分數」，品質與比例是否協調會直接影響售價；魚肉類品質低，
      故意亂加價格會被拖累（喜劇效果：魚腥香水賣不出好價錢）。
   3) 展示櫃上架被動銷售＋收銀台收錢；3 位固定客人各自偏好某種氣味調性，
      配對成功會用更高價買走。
   沒有專屬美術圖時，場景/物件/作物一律退回色塊＋emoji顯示，
   之後把對應命名的 png 放進根目錄即可自動套用。
   ========================================================= */

/* ---------- 新增食材／作物／商人商品（維持不變） ---------- */
Object.assign(EXTRAS, {
  bergamot:  {nm:'佛手柑', e:'🍊', price:12, merchantOnly:true},
  lavender:  {nm:'薰衣草', e:'💜', price:12, merchantOnly:true},
  vanilla:   {nm:'香草',   e:'🤎', price:16, merchantOnly:true},
  sandalwood:{nm:'檀香',   e:'🪵', price:22, merchantOnly:true},
});
Object.assign(ITEM_IMG_SRC, {
  bergamot:'item_bergamot.png', vanilla:'item_vanilla.png', sandalwood:'item_sandalwood.png',
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
FARM_CROPS.lavender={ nm:'薰衣草', img:'lavender.png', fw:32, fh:32,
  stages:['播種','發芽','成長','開花','結果'], frame:[0,1,2,3,4],
  grow:40000, yield:3, seed:10 };
for(const _k of ['rose','iris','jasmine','lavender']){
  const d=FARM_CROPS[_k];
  d._img=new Image(); d._img.src=d.img;
  d.stageMs=d.grow/(d.stages.length-1);
}
CROP_ERA.rose=19; CROP_ERA.iris=19; CROP_ERA.jasmine=19; CROP_ERA.lavender=19;

MERCHANTS.Pedro.goods.push(
  {kind:'extra', k:'bergamot',   price:12, qty:5},
  {kind:'extra', k:'lavender',   price:12, qty:5},
  {kind:'extra', k:'vanilla',    price:16, qty:5},
  {kind:'extra', k:'sandalwood', price:22, qty:5},
);

/* ---------- 材料調香屬性：note(前/中/後調) + tag(氣味標籤) + q(品質 -1~1) ---------- */
const PERFUME_NOTES={
  bergamot:  {note:'top',  tag:'fruity',   q:1},
  lavender:  {note:'mid',  tag:'floral',   q:0.8},
  vanilla:   {note:'base', tag:'gourmand', q:0.8},
  sandalwood:{note:'base', tag:'woody',    q:1},
  rose:      {note:'mid',  tag:'floral',   q:1},
  iris:      {note:'mid',  tag:'floral',   q:0.8},
  jasmine:   {note:'mid',  tag:'floral',   q:1},
  strawberry:{note:'top',  tag:'fruity',   q:0.8},
  lemon:     {note:'top',  tag:'fruity',   q:1},
  apple:     {note:'top',  tag:'fruity',   q:0.7},
  tomato:    {note:'top',  tag:'fruity',   q:0.2},
  corn:      {note:'top',  tag:'fruity',   q:0.1},
  potato:    {note:'base', tag:'woody',    q:0.1},
  egg:       {note:'mid',  tag:'gourmand', q:0},
  milk:      {note:'mid',  tag:'gourmand', q:0.3},
  cheese:    {note:'mid',  tag:'gourmand', q:0.2},
  butter:    {note:'mid',  tag:'gourmand', q:0.2},
  olive_oil: {note:'base', tag:'woody',    q:0.3},
  pork:      {note:'base', tag:'offal',    q:-0.8},
  beef:      {note:'base', tag:'offal',    q:-0.7},
  chicken_meat:{note:'base', tag:'offal',  q:-0.6},
  turkey_meat: {note:'base', tag:'offal',  q:-0.6},
  herring:   {note:'base', tag:'offal',    q:-1},
  mackerel:  {note:'base', tag:'offal',    q:-1},
  cod:       {note:'base', tag:'offal',    q:-0.9},
  salmon:    {note:'base', tag:'offal',    q:-0.7},
  halibut:   {note:'base', tag:'offal',    q:-0.6},
};
function perfumeNoteOf(k){ return PERFUME_NOTES[k]||{note:'mid',tag:'gourmand',q:0}; }
function noteLabel(n){ return {top:'前調',mid:'中調',base:'後調'}[n]||n; }
function tagLabel(t){ return {floral:'花香',fruity:'果香',woody:'木質',gourmand:'美食',offal:'腥羶'}[t]||t; }
function materialValue(k){
  if(PRODUCTS[k]) return PRODUCTS[k].base;
  if(FARM_CROPS[k]) return FARM_CROPS[k].seed*2;
  if(EXTRAS[k]) return EXTRAS[k].price;
  return 5;
}

/* ---------- 香水瓶（決定售價倍率＋成本） ---------- */
const PERFUME_BOTTLES={
  plain: {nm:'素面玻璃瓶', mul:1.0, cost:0},
  cut:   {nm:'切割水晶瓶', mul:1.3, cost:30},
  gilded:{nm:'鎏金雕花瓶', mul:1.7, cost:80},
};

/* ---------- 配方書：三款預設，一鍵套用（仍可自行調整比例／材料） ---------- */
const PERFUME_PRESETS={
  dew:    { nm:'英倫晨露', top:'bergamot',   mid:'lavender', base:'sandalwood', pTop:35, pMid:40 },
  lover:  { nm:'法式戀人', top:'strawberry', mid:'jasmine',  base:'vanilla',    pTop:25, pMid:45 },
  century:{ nm:'百年玫瑰', top:'lemon',      mid:'rose',     base:'sandalwood', pTop:20, pMid:50 },
};

/* ---------- 解鎖判定 ---------- */
function perfumeUnlocked(){
  return !!(S && S.partner && S.partner.id==='Francis' && S.era>=19
    && Object.keys(S.lovers||{}).length===0 && (S.partner.intimacy||0)>=50);
}
function ensurePerfumeState(){
  if(!S) return;
  if(!S.perfume || !S.perfume.oils || !S.perfume.custom){
    S.perfume={ oils:{}, custom:{}, menu:[], till:(S.perfume&&S.perfume.till)||0,
      lastRun:Date.now(), still:{key:null,start:0}, bottleStock:{} };
  }
  if(!S.perfume.bottleStock) S.perfume.bottleStock={};
  if(S.perfumeOpened===undefined) S.perfumeOpened=false;
}
function bottleStock(id){ return (S.perfume.bottleStock && S.perfume.bottleStock[id])||0; }
function oilStock(k){ return (S.perfume.oils && S.perfume.oils[k])||0; }

/* ---------- 蒸餾瓶：原料→精油，固定秒數（仿烤箱） ---------- */
const DISTILL_MS=20000, DISTILL_IN=3, DISTILL_OUT=1;
function distillList(){
  return Object.keys(PERFUME_NOTES)
    .map(k=>({k, stock:(S.store[k]||0)+(S.extras[k]||0)}))
    .filter(x=>x.stock>0);
}
function openPerfumeStill(){
  ensurePerfumeState();
  const st=S.perfume.still;
  if(st && st.key){
    const t=Date.now()-st.start, left=Math.max(0,DISTILL_MS-t);
    openSheet(`<div class="sheethead"><h3>🧫 蒸餾瓶</h3><button class="close" onclick="closeSheet()">✕</button></div>
      <div class="small" style="margin-bottom:10px">正在萃取 ${ingNm(st.key)} 精油…</div>
      <button class="btn ${left>0?'dis':'gold'}" style="width:100%" onclick="collectDistill()">${left>0?`⏳ 還要 ${fmtSec(left)}`:'🧪 取出精油'}</button>`);
    return;
  }
  const list=distillList();
  const oilTxt=Object.keys(S.perfume.oils).filter(k=>S.perfume.oils[k]>0).map(k=>`${ingNm(k)}×${S.perfume.oils[k]}`).join('・')||'無';
  const body = list.length ? list.map(x=>{
    const nt=perfumeNoteOf(x.k);
    return `<div class="row"><div class="e">${prodIcon(x.k,28)}</div>
      <div class="info"><div class="n">${ingNm(x.k)} <span class="small">庫存 ${x.stock}・${noteLabel(nt.note)}／${tagLabel(nt.tag)}</span></div></div>
      <button class="btn sm ${x.stock<DISTILL_IN?'dis':''}" onclick="startDistill('${x.k}')">萃取（耗${DISTILL_IN}）</button></div>`;
  }).join('') : '<div class="empty-note">沒有可萃取的材料（農產品／魚貨／香料庫存都算）。</div>';
  openSheet(`<div class="sheethead"><h3>🧫 蒸餾瓶</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:8px">投入 ${DISTILL_IN} 份原料，${fmtSec(DISTILL_MS)}後可得 ${DISTILL_OUT} 份精油。<br>目前精油庫存：${oilTxt}</div>
    ${body}`);
}
function startDistill(k){
  ensurePerfumeState();
  const stock=(S.store[k]||0)+(S.extras[k]||0);
  if(stock<DISTILL_IN){ toast('材料不足'); return; }
  let need=DISTILL_IN;
  const fromStore=Math.min(S.store[k]||0, need); S.store[k]=(S.store[k]||0)-fromStore; need-=fromStore;
  if(need>0) S.extras[k]=(S.extras[k]||0)-need;
  S.perfume.still={key:k, start:Date.now()};
  toast(`🧫 開始萃取 ${ingNm(k)}`);
  openPerfumeStill(); save();
}
function collectDistill(){
  ensurePerfumeState();
  const st=S.perfume.still; if(!st||!st.key) return;
  const t=Date.now()-st.start;
  if(t<DISTILL_MS){ toast(`還在萃取中（還要 ${fmtSec(DISTILL_MS-t)}）`); return; }
  S.perfume.oils[st.key]=(S.perfume.oils[st.key]||0)+DISTILL_OUT;
  toast(`🧪 萃取完成，得到 ${ingNm(st.key)} 精油 ×${DISTILL_OUT}`);
  S.perfume.still={key:null,start:0};
  openPerfumeStill(); save();
}

/* ---------- 調香台：前/中/後調各選一種精油＋比例（自動湊100%）＋命名＋選瓶 ---------- */
const PERFUME_BATCH=3;
const pprep={ top:null, mid:null, base:null, pTop:34, pMid:33, name:'', bottle:'plain' };
function pBaseCalc(){ return Math.max(0, 100-pprep.pTop-pprep.pMid); }
function pSyncNameFromInput(){
  const el=document.getElementById('pfNameInput');
  if(el) pprep.name=el.value;
}
function pSetNote(slot,k){
  pSyncNameFromInput();
  pprep[slot]=k;
  openPerfumeBench();
}
function pAdjustPct(which,delta){
  pSyncNameFromInput();
  if(which==='top'){
    pprep.pTop=Math.max(0,Math.min(100,pprep.pTop+delta));
    if(pprep.pTop+pprep.pMid>100) pprep.pMid=100-pprep.pTop;
  }else{
    pprep.pMid=Math.max(0,Math.min(100,pprep.pMid+delta));
    if(pprep.pTop+pprep.pMid>100) pprep.pTop=100-pprep.pMid;
  }
  openPerfumeBench();
}
function pSetBottle(id){
  pSyncNameFromInput();
  pprep.bottle=id;
  openPerfumeBench();
}
function pApplyPreset(id){
  const p=PERFUME_PRESETS[id]; if(!p) return;
  pprep.top=p.top; pprep.mid=p.mid; pprep.base=p.base;
  pprep.pTop=p.pTop; pprep.pMid=p.pMid; pprep.name=p.nm;
  openPerfumeBench();
}
function pQuality(){
  if(!pprep.top||!pprep.mid||!pprep.base) return 0;
  const nt=perfumeNoteOf(pprep.top), nm=perfumeNoteOf(pprep.mid), nb=perfumeNoteOf(pprep.base);
  return nt.q*(pprep.pTop/100) + nm.q*(pprep.pMid/100) + nb.q*(pBaseCalc()/100);
}
function pDominantTag(){
  if(!pprep.top||!pprep.mid||!pprep.base) return 'gourmand';
  const arr=[
    {t:perfumeNoteOf(pprep.top).tag,  p:pprep.pTop},
    {t:perfumeNoteOf(pprep.mid).tag,  p:pprep.pMid},
    {t:perfumeNoteOf(pprep.base).tag, p:pBaseCalc()},
  ];
  arr.sort((a,b)=>b.p-a.p);
  return arr[0].t;
}
function pBalanced(){
  const b=pBaseCalc();
  return pprep.pTop>=15 && pprep.pTop<=40 && pprep.pMid>=35 && pprep.pMid<=55 && b>=15 && b<=40;
}
function pMaterialAvgValue(){
  if(!pprep.top||!pprep.mid||!pprep.base) return 0;
  return materialValue(pprep.top)*(pprep.pTop/100) + materialValue(pprep.mid)*(pprep.pMid/100) + materialValue(pprep.base)*(pBaseCalc()/100);
}
function pPrice(){
  const q=pQuality(), qualMul=Math.max(0.3, 1+q*0.6), balMul=pBalanced()?1.15:1;
  const bottle=PERFUME_BOTTLES[pprep.bottle]||PERFUME_BOTTLES.plain;
  return Math.max(5, Math.round(pMaterialAvgValue()*8*qualMul*balMul*bottle.mul));
}
function pComboKey(){
  return [pprep.top,pprep.mid,pprep.base,pprep.pTop,pprep.pMid,pprep.bottle].join('|');
}
function pCanCraft(){
  if(!pprep.top||!pprep.mid||!pprep.base) return false;
  return oilStock(pprep.top)>=1 && oilStock(pprep.mid)>=1 && oilStock(pprep.base)>=1;
}
function craftPerfume(){
  ensurePerfumeState();
  pSyncNameFromInput();
  if(!pCanCraft()){ toast('材料或精油不足'); return; }
  const bottle=PERFUME_BOTTLES[pprep.bottle]||PERFUME_BOTTLES.plain;
  const haveStock=bottleStock(pprep.bottle), useStock=Math.min(haveStock,PERFUME_BATCH);
  const cost=bottle.cost*(PERFUME_BATCH-useStock);
  if(S.cash<cost){ toast('現金不足，付不出瓶身費用'); return; }
  S.perfume.oils[pprep.top]--; S.perfume.oils[pprep.mid]--; S.perfume.oils[pprep.base]--;
  if(useStock>0) S.perfume.bottleStock[pprep.bottle]-=useStock;
  if(cost>0) spend(cost,'香水瓶身費用');
  const key=pComboKey(), nm=(pprep.name&&pprep.name.trim())||'無名香水';
  const price=pPrice(), tag=pDominantTag(), q=pQuality();
  if(!S.perfume.custom[key]) S.perfume.custom[key]={
    name:nm, top:pprep.top, mid:pprep.mid, base:pprep.base,
    pTop:pprep.pTop, pMid:pprep.pMid, pBase:pBaseCalc(),
    bottle:pprep.bottle, tag, quality:q, price, count:0 };
  else S.perfume.custom[key].price=price;
  S.perfume.custom[key].count+=PERFUME_BATCH;
  pprep.name=nm;
  toast(`🧴 調配完成！${nm} ×${PERFUME_BATCH}`);
  openPerfumeBench(); save();
}
function pPickerRow(slot){
  const list=Object.keys(PERFUME_NOTES).filter(k=>PERFUME_NOTES[k].note===slot && oilStock(k)>0);
  if(!list.length) return `<div class="small" style="margin:2px 0 8px;color:var(--ink2)">（沒有${noteLabel(slot)}精油，先去蒸餾瓶萃取）</div>`;
  return `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">${list.map(k=>{
    const on=pprep[slot]===k;
    return `<button class="btn sm ${on?'gold':'ghost'}" onclick="pSetNote('${slot}','${k}')">${prodIcon(k,20)} ${ingNm(k)}（${oilStock(k)}）</button>`;
  }).join('')}</div>`;
}
function openPerfumeBench(){
  ensurePerfumeState();
  const presetBtns=Object.keys(PERFUME_PRESETS).map(id=>{
    const p=PERFUME_PRESETS[id];
    return `<button class="btn sm ghost" onclick="pApplyPreset('${id}')">📖 ${p.nm}</button>`;
  }).join('');
  const canCraft=pCanCraft();
  const q=pQuality(), qIcon=q>=0.3?'👍':q<=-0.3?'👎':'😐';
  const preview = (pprep.top&&pprep.mid&&pprep.base)
    ? `<div class="small" style="margin:8px 0">預覽：${tagLabel(pDominantTag())}調・品質 ${qIcon}（${q.toFixed(2)}）${pBalanced()?'・比例協調 +15%':''}<br>預估售價 $${pPrice()}／瓶・一批 ${PERFUME_BATCH} 瓶</div>`
    : '<div class="small" style="margin:8px 0;color:var(--ink2)">前中後調都選好才能預覽售價。</div>';
  const bottleBtns=Object.keys(PERFUME_BOTTLES).map(id=>{
    const b=PERFUME_BOTTLES[id], on=pprep.bottle===id, stock=bottleStock(id);
    const covered=Math.min(stock,PERFUME_BATCH)>=PERFUME_BATCH;
    const priceTag=b.cost?(covered?' 本批免費':` $${b.cost}`):'';
    return `<button class="btn sm ${on?'gold':'ghost'}" onclick="pSetBottle('${id}')">${b.nm}${stock?` 🎣庫存${stock}`:''}${priceTag}</button>`;
  }).join('');
  openSheet(`<div class="sheethead"><h3>🧪 調香台</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:6px">配方書（一鍵套用，仍可自行調整）</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">${presetBtns}</div>
    <div class="hr"></div>
    <b class="small">前調 Top</b>${pPickerRow('top')}
    <b class="small">中調 Mid</b>${pPickerRow('mid')}
    <b class="small">後調 Base</b>${pPickerRow('base')}
    <div class="hr"></div>
    <div class="small" style="margin-bottom:4px">前調 ${pprep.pTop}%　<button class="btn sm ghost" onclick="pAdjustPct('top',-5)">－</button> <button class="btn sm ghost" onclick="pAdjustPct('top',5)">＋</button></div>
    <div class="small" style="margin-bottom:4px">中調 ${pprep.pMid}%　<button class="btn sm ghost" onclick="pAdjustPct('mid',-5)">－</button> <button class="btn sm ghost" onclick="pAdjustPct('mid',5)">＋</button></div>
    <div class="small" style="margin-bottom:8px">後調 ${pBaseCalc()}%（自動計算，總和固定100%）</div>
    <div class="hr"></div>
    <div class="small" style="margin-bottom:4px">香水名稱</div>
    <input id="pfNameInput" value="${(pprep.name||'').replace(/"/g,'&quot;')}" placeholder="幫它取個名字" style="width:100%;padding:8px;border:1px solid var(--line2);border-radius:8px;margin-bottom:10px;font-family:inherit">
    <div class="small" style="margin-bottom:4px">選擇香水瓶</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px">${bottleBtns}</div>
    ${preview}
    <button class="btn gold ${canCraft?'':'dis'}" style="width:100%" onclick="craftPerfume()">🧴 調配（消耗前/中/後調精油各1份）</button>`);
}

/* ---------- 展示櫃／上架＋收銀 ---------- */
function openPerfumeShelf(){
  ensurePerfumeState();
  let body='';
  for(const key in S.perfume.custom){
    const it=S.perfume.custom[key];
    const on=S.perfume.menu.includes(key);
    if(it.count<=0 && !on) continue;
    const qIcon=it.quality>=0.3?'👍':it.quality<=-0.3?'👎':'😐';
    body+=`<div class="menucard${on?' on':''}" style="display:flex;align-items:center;gap:8px">
      <div style="font-size:22px">🧴</div><div style="flex:1"><div style="font-weight:700">${it.name} <span class="small">${tagLabel(it.tag)}・${qIcon}</span></div>
      <div class="small">庫存 ${it.count}・售$${it.price}</div></div>
      <button class="btn sm ${on?'green':'ghost'}" onclick="pToggleMenu('${key}')">${on?'已上架':'上架'}</button></div>`;
  }
  if(!body) body='<div class="empty-note">還沒有任何香水成品，先去調香台調配。</div>';
  openSheet(`<div class="sheethead"><h3>🗄️ 展示櫃</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:8px">上架後每天會有顧客自動上門購買，收入請到收銀台收取。</div>${body}`);
}
function pToggleMenu(key){
  ensurePerfumeState();
  const i=S.perfume.menu.indexOf(key);
  if(i>=0) S.perfume.menu.splice(i,1);
  else{
    if(!S.perfume.custom[key] || S.perfume.custom[key].count<=0){ toast('沒有現貨可上架'); return; }
    S.perfume.menu.push(key);
  }
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
  const menu=P.menu.filter(key=>P.custom[key]);
  if(!menu.length){ P.lastRun=now; return; }
  let days=Math.min(7,Math.floor((now-(P.lastRun||now))/DAY));
  if(days<=0) return;
  const cap=4+menu.length*3;
  for(let d=0; d<days; d++){
    let total=0; for(const k of menu) total+=(P.custom[k]?P.custom[k].count:0);
    if(total<=0) continue;
    let toSell=Math.min(total, Math.round(cap*(0.6+Math.random()*0.4))), rev=0;
    for(const k of [...menu].sort(()=>Math.random()-0.5)){
      if(toSell<=0) break;
      const it=P.custom[k]; if(!it) continue;
      const av=it.count, s=Math.min(av, Math.ceil(toSell/menu.length)+1, toSell);
      rev+=s*it.price; it.count-=s; toSell-=s;
    }
    rev-=10; if(rev<0) rev=0; P.till+=rev;
  }
  P.lastRun=(P.lastRun||now)+days*DAY;
}

/* ---------- 客人：各自偏好某種氣味調性，配對成功用更高價買走 ---------- */
const PERFUME_GUESTS=[
  {id:'pg1', x:5,  y:11, face:'🎩', nm:'紳士訪客', prefer:'woody',  line:'我偏好沉穩厚重的木質調。'},
  {id:'pg2', x:14, y:11, face:'👒', nm:'貴婦訪客', prefer:'floral', line:'給我來點浪漫的花香調吧。'},
  {id:'pg3', x:9,  y:13, face:'🎀', nm:'少女訪客', prefer:'fruity', line:'我想要清新甜美的果香味！'},
];
function guestPrice(g,key){
  const it=S.perfume.custom[key]; if(!it) return 0;
  let p=it.price;
  if(it.tag===g.prefer && it.quality>=-0.1) p=Math.round(p*1.5);
  else if(it.quality<-0.3) p=Math.round(p*0.6);
  return p;
}
function openPerfumeGuest(id){
  ensurePerfumeState();
  const g=PERFUME_GUESTS.find(x=>x.id===id);
  const entries=Object.keys(S.perfume.custom).filter(k=>S.perfume.custom[k].count>0);
  const body = entries.length ? entries.map(key=>{
    const it=S.perfume.custom[key], pay=guestPrice(g,key), match=it.tag===g.prefer;
    return `<div class="row"><div class="e">🧴</div>
      <div class="info"><div class="n">${it.name} ${match?'✨':''}</div><div class="d">${tagLabel(it.tag)}・庫存${it.count}</div></div>
      <button class="btn sm gold" onclick="servePerfumeGuest('${id}','${key}')">賣 $${pay}</button></div>`;
  }).join('') : '<div class="empty-note">背包沒有香水可以賣，先去調香台做。</div>';
  openSheet(`<div class="sheethead"><h3>${g.face} ${g.nm}</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div style="background:var(--card);border:2px solid var(--line2);border-radius:12px;padding:12px;margin-bottom:14px;font-size:14px;line-height:1.5">${g.line}<br><span class="small">（偏好：${tagLabel(g.prefer)}調）</span></div>
    ${body}`);
}
function servePerfumeGuest(id,key){
  ensurePerfumeState();
  const g=PERFUME_GUESTS.find(x=>x.id===id), it=S.perfume.custom[key];
  if(!it || it.count<=0){ toast('沒有現貨'); return; }
  const pay=guestPrice(g,key), match=it.tag===g.prefer;
  it.count--;
  earn(pay, `香水訂單・${it.name}`);
  toast(match?`🧴 ${g.nm}非常喜歡${it.name}！+$${pay}`:`🧴 ${g.nm}買下了${it.name}，+$${pay}`);
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
  {id:'ptill',  x:5,  y:5,  e:'💰', nm:'收銀台', kind:'perfumetill'},
  {id:'pbench', x:9,  y:5,  e:'🧪', nm:'調香台', kind:'perfumebench'},
  {id:'pshelf', x:13, y:5,  e:'🗄️', nm:'展示櫃', kind:'perfumeshelf'},
  {id:'pstill', x:17, y:5,  e:'🧫', nm:'蒸餾瓶', kind:'perfumestill'},
  {id:'pguest_pg1', gid:'pg1', x:5,  y:11, e:'🎩', nm:'紳士訪客', kind:'perfumeguest'},
  {id:'pguest_pg2', gid:'pg2', x:14, y:11, e:'👒', nm:'貴婦訪客', kind:'perfumeguest'},
  {id:'pguest_pg3', gid:'pg3', x:9,  y:13, e:'🎀', nm:'少女訪客', kind:'perfumeguest'},
  {id:'pfrancis', x:9, y:3, e:'🧑', nm:'弗朗西斯', kind:'npc', npc:true,
    lines:['沒想到我們真的把這間店開起來了。','要不要也調一瓶屬於我們的味道？','客人的訂單，可別讓他們等太久喔。']},
]};
SCENE_NM.perfumery='香水店';
loadBg('perfumery','perfumery.png');
loadFg('perfumery','perfumery_fg.png');

/* ---------- 掛勾：互動、時間流逝、更新迴圈 ---------- */
const _pfOrigInteract=interact;
interact=function(ev){
  if(!sitting && curScene==='perfumery'){
    const o=facingObject();
    if(o){
      if(o.kind==='perfumebench'){ if(ev&&ev.preventDefault) ev.preventDefault(); openPerfumeBench(); return; }
      if(o.kind==='perfumeshelf'){ if(ev&&ev.preventDefault) ev.preventDefault(); openPerfumeShelf(); return; }
      if(o.kind==='perfumetill'){ if(ev&&ev.preventDefault) ev.preventDefault(); collectPerfumeTill(); return; }
      if(o.kind==='perfumestill'){ if(ev&&ev.preventDefault) ev.preventDefault(); openPerfumeStill(); return; }
      if(o.kind==='perfumeguest'){ if(ev&&ev.preventDefault) ev.preventDefault(); openPerfumeGuest(o.gid); return; }
    }
  }
  return _pfOrigInteract(ev);
};

const _pfOrigTick=tick;
tick=function(){ _pfOrigTick.apply(this,arguments); runPerfume(Date.now()); };

const _pfOrigUpdate=update;
update=function(){
  _pfOrigUpdate();
  if(!S || curScene!=='perfumery') return;
  const ob=document.getElementById('ovenbar');
  const st=S.perfume && S.perfume.still;
  if(st && st.key){
    const t=Date.now()-st.start;
    ob.classList.add('show'); ob.classList.remove('warn'); ob.classList.remove('burn');
    document.getElementById('ovenFill').style.width=Math.min(100,(t/DISTILL_MS)*100)+'%';
    document.getElementById('ovenTxt').textContent = t<DISTILL_MS ? `萃取中 ${fmtSec(DISTILL_MS-t)}` : '✅ 可以取出了';
  }
  const hint=document.getElementById('hint');
  const o=facingObject();
  if(o && o.kind==='perfumebench'){ hint.textContent='🧪 調香台（互動鍵）'; hint.classList.add('show'); }
  else if(o && o.kind==='perfumeshelf'){ hint.textContent='🗄️ 展示櫃（互動鍵）'; hint.classList.add('show'); }
  else if(o && o.kind==='perfumetill'){ hint.textContent='💰 收銀台（互動鍵）'; hint.classList.add('show'); }
  else if(o && o.kind==='perfumestill'){ hint.textContent='🧫 蒸餾瓶（互動鍵）'; hint.classList.add('show'); }
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
  btn.className = S.perfumeOpened ? 'btn gold' : 'btn';
  btn.style.cssText='width:100%;margin-top:8px';
  btn.textContent = S.perfumeOpened ? '🧴 去香水店' : '🍷 弗朗西斯好像有話想說……';
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
