/* ===== 彈出面板：離開觸發物自動關閉 ===== */
let sheetAnchor=null;   // 記住這個 sheet 是被哪個觸發物打開的

const _openSheet=openSheet;
openSheet=function(h){
  if(!document.getElementById('mask').classList.contains('show')){
    let ax=null, ay=null;
    const o=facingObject();
    if(o){ ax=o.x; ay=o.y; }                       // 面對物件→用物件座標
    else if(curScene==='shop' && typeof nearKeeper==='function' && nearKeeper()){
      ax=Math.round((KEEPER.x1+KEEPER.x2)/2);      // 在老闆區→用老闆中心當錨點
      ay=Math.round((KEEPER.y1+KEEPER.y2)/2);
    }
    sheetAnchor = (ax!=null) ? {x:ax, y:ay, scene:curScene} : null;
  }
  _openSheet(h);
};

const _closeSheet=closeSheet;
closeSheet=function(){ sheetAnchor=null; _closeSheet(); };   // 手動關也清掉錨點

const _updAutoClose=update;
update=function(){
  _updAutoClose();
  // 每幀檢查：面板還開著、且當初的觸發物已經走遠（或換場景）→ 自動關
  if(sheetAnchor && document.getElementById('mask').classList.contains('show')){
    const bx=Math.round(player.x), by=Math.round(player.y);
    const dist=Math.max(Math.abs(sheetAnchor.x-bx), Math.abs(sheetAnchor.y-by));
    if(curScene!==sheetAnchor.scene || dist>SENSE){ closeSheet(); }
  }
};
/* ===================== 🌷 鬱金香 / 商店老闆 霍蘭德 ===================== */

/* --- 圖檔：商店背景 + 前景 --- */
loadBg('shop', 'shop.png');        // 老闆畫在這張圖的 x14~19,y6~9
loadFg('shop', 'shop_fg.png');     // 不需要前景就把這行刪掉

/* --- 鬱金香資料表（要調平衡就改這裡） --- */
const TULIP_COLORS={
  red:   {nm:'紅', w:26},
  yellow:{nm:'黃', w:24},
  pink:  {nm:'粉', w:20},
  orange:{nm:'橙', w:14},
  purple:{nm:'紫', w:9},
  white: {nm:'白', w:5},
  black: {nm:'黑', w:2},   // w = 開花機率權重，黑鬱金香最稀有
};
const TULIP_TIERS={               // 階層 → 基準賣價
  N:  {nm:'N',   base:30 },
  R:  {nm:'R',   base:90 },
  SR: {nm:'SR',  base:260},
  SSR:{nm:'SSR', base:650},
};
const TULIP_TIER_COLOR={N:'#9aa', R:'#3b82f6', SR:'#a855f7', SSR:'#f59e0b'};
const TULIP_BULB_PRICE=60;        // 球根售價（向老闆買）

/* --- 老闆台詞（奸商、話少、不親切） --- */
const KEEPER_LINES=[
  '「…要買，還是要賣？別站在那兒發呆。」',
  '「（壓低帽簷，從鼻子裡哼了一聲）……錢，帶夠了嗎？」',
  '「我這兒的價，沒得商量。嫌貴，門在那邊。」',
  '「看你這外行樣……嗯，那對我倒是好事。」',
  '「Goedendag。少廢話，要做生意就做。」',
];

const KEEPER_TULIP_LINES=[
  '「鬱金香。整個歐洲都瘋了的東西。趁你還買得起，買。」',
  '「球根嫌貴？等它開出花，你會回來跪著謝我的……也許。」',
  '「紅的紫的黑的——運氣好，一顆球根讓你翻身；運氣差，就當餵土。」',
  '「我勸你多囤幾顆。這價，明天可不保證。」',
];

/* --- 把鬱金香登記成農作物（沿用你的種植/生長引擎） --- */
FARM_CROPS.tulip={ nm:'鬱金香', img:'tulip.png', fw:32, fh:32,
  stages:['播種','發芽','成長','含苞','綻放'], frame:[0,1,2,3,4],
  grow:60000, yield:1, seed:TULIP_BULB_PRICE, hidden:true };  // hidden=不出現在一般種子店
FARM_CROPS.tulip._img=new Image(); FARM_CROPS.tulip._img.src=FARM_CROPS.tulip.img;
FARM_CROPS.tulip.stageMs=FARM_CROPS.tulip.grow/(FARM_CROPS.tulip.stages.length-1);

/* --- 老闆的位置（互動區域），想搬就改這四個數字 --- */
const KEEPER={scene:'shop', x1:14, y1:6, x2:19, y2:9};
function nearKeeper(){
  if(curScene!==KEEPER.scene) return false;
  const px=Math.round(player.x), py=Math.round(player.y);
  return px>=KEEPER.x1-1 && px<=KEEPER.x2+1 && py>=KEEPER.y1-1 && py<=KEEPER.y2+1;
}
/* --- 回農場的門：踩進這塊區域就回農牧地（區域＝無碰撞） --- */
const SHOP_DOOR={scene:'shop', x1:8, y1:13, x2:11, y2:17};
function inShopDoor(){
  if(curScene!==SHOP_DOOR.scene) return false;
  const px=Math.round(player.x), py=Math.round(player.y);
  return px>=SHOP_DOOR.x1 && px<=SHOP_DOOR.x2 && py>=SHOP_DOOR.y1 && py<=SHOP_DOOR.y2;
}
/* --- 餐廳⇄廚房：踩到門口就自動切換（不用按互動） --- */
function autoDoors(){
  if(!S) return;
}
/* --- 開花顏色（依權重隨機） --- */
function rollTulipColor(){
  let tot=0; for(const c in TULIP_COLORS) tot+=TULIP_COLORS[c].w;
  let r=Math.random()*tot;
  for(const c in TULIP_COLORS){ r-=TULIP_COLORS[c].w; if(r<=0) return c; }
  return 'red';
}

/* --- 每天重洗：各色階層 + 賣價 --- */
function rollTulipMarket(){
  if(!S) return;
  const pool=['N','N','N','R','R','R','SR','SR','SSR'];   // 抽中機率
  S.tulipDay={}; S.tulipPx={};
  for(const c in TULIP_COLORS){
    const tier=pool[(Math.random()*pool.length)|0];
    S.tulipDay[c]=tier;
    S.tulipPx[c]=Math.round(TULIP_TIERS[tier].base*(0.85+Math.random()*0.30));
  }
  // 保證每天至少有一色 SR 以上
  const cs=Object.keys(TULIP_COLORS);
  if(!cs.some(c=>S.tulipDay[c]==='SR'||S.tulipDay[c]==='SSR')){
    const c=cs[(Math.random()*cs.length)|0];
    S.tulipDay[c]='SR'; S.tulipPx[c]=Math.round(TULIP_TIERS.SR.base*(0.85+Math.random()*0.30));
  }
}

/* --- 老闆對話 + 買賣總入口 --- */
function openKeeper(){
  const line=KEEPER_LINES[(Math.random()*KEEPER_LINES.length)|0];
  const push=KEEPER_TULIP_LINES[(Math.random()*KEEPER_TULIP_LINES.length)|0];
  openSheet(`<div class="sheethead"><h3>🎩 霍蘭德</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div style="text-align:center;font-size:52px;margin:2px 0 8px">🎩</div>
    <div style="background:var(--card);border:2px solid var(--line2);border-radius:12px;padding:12px;margin-bottom:10px;font-size:14px;line-height:1.7">${line}<br><span style="color:var(--gold)">${push}</span></div>
    <button class="btn" style="width:100%;margin-bottom:6px" onclick="openShopBuy()">🧺 我要採購</button>
    <button class="btn green" style="width:100%;margin-bottom:6px" onclick="openShopSell()">💵 我要賣貨</button>
    <button class="btn gold" style="width:100%;margin-bottom:6px" onclick="openTulip()">🌷 鬱金香 / 球根</button>
    <button class="btn ghost" style="width:100%" onclick="closeSheet()">離開</button>`);
}

/* --- 鬱金香子商店 --- */
function tulipIcon(col,px){   // 用該色圖的「綻放楨」當小圖示（不用另外畫，重用田裡那張）
  px=px||26; const sc=px/32;
  return `<div style="display:inline-block;width:${px}px;height:${px}px;background:url('tulip_${col}.png') ${-128*sc}px 0 no-repeat;background-size:${160*sc}px ${32*sc}px;image-rendering:pixelated;border-radius:4px"></div>`;
}
function openTulip(){
  if(!S.tulips)S.tulips={};
  if(!S.tulipDay || !Object.keys(S.tulipDay).length) rollTulipMarket();
  const order=Object.keys(TULIP_COLORS).sort((a,b)=>(S.tulipPx[b]||0)-(S.tulipPx[a]||0));
  let market='';
  for(const c of order){ const tier=S.tulipDay[c], px=S.tulipPx[c], have=S.tulips[c]||0;
    const badge=`<span style="background:${TULIP_TIER_COLOR[tier]};color:#fff;border-radius:6px;padding:1px 7px;font-weight:700;font-size:12px">${tier}</span>`;
    market+=`<div class="row"><div class="e">${tulipIcon(c)}</div><div class="info"><div class="n">${TULIP_COLORS[c].nm}鬱金香 ${badge}</div>
      <div class="d">持有 ${have}</div></div><div class="price">$${px}</div>
      <button class="btn sm ${have<=0?'dis':'green'}" onclick="sellTulip('${c}')">全賣</button></div>`;
  }
  const bulb=Math.round(TULIP_BULB_PRICE*shopBuyMul());
  openSheet(`<div class="sheethead"><h3>🌷 鬱金香交易</h3><button class="close" onclick="openKeeper()">✕</button></div>
    <div class="small">💰 現金 $${fmt(S.cash)}・球根背包 ${S.seeds.tulip||0} 顆</div>
    <div class="small" style="color:var(--ink2);margin:4px 0 8px">每天各色階層（N→SSR）重洗，價格跟著變。買球根去農田種，會隨機開出不同顏色。</div>
    <div class="hr"></div>
    <div class="row" style="background:var(--card);border:2px solid var(--gold);border-radius:12px;padding:8px">
      <div class="e">🧅</div><div class="info"><div class="n">鬱金香球根</div><div class="d">種下後隨機開花，可能是任何顏色</div></div>
      <div class="price">$${bulb}</div><button class="btn sm gold" onclick="buyBulb()">買球根</button></div>
    <div class="hr"></div>
    <b class="small">今日各色行情 / 你的花</b>${market}`);
}
function buyBulb(){
  const cost=Math.round(TULIP_BULB_PRICE*shopBuyMul());
  if(S.cash<cost){ toast('現金不足'); return; }
  spend(cost,'向霍蘭德買鬱金香球根');
  S.seeds.tulip=(S.seeds.tulip||0)+1;
  toast('🧅 買了 1 顆球根（去農田種）'); openTulip(); save();
}
function sellTulip(c){
  if(!S.tulips)S.tulips={};
  const have=S.tulips[c]||0; if(have<=0) return;
  const total=Math.round((S.tulipPx[c]||0)*have*shopSellMul());
  S.tulips[c]=0; earn(total,`賣${TULIP_COLORS[c].nm}鬱金香×${have}`);
  toast(`💰 +$${fmt(total)}`); openTulip(); save();
}

/* --- 掛鉤到既有函式（覆寫，不動原本程式碼） --- */
const _origRollMarket=rollMarket;
rollMarket=function(){ _origRollMarket(); if(!S.tulips)S.tulips={}; rollTulipMarket(); };

const _origHarvestTile=harvestTile;
harvestTile=function(key){
  const c=S.crops[key];
  if(c && c.crop==='tulip'){
    if(!S.tulips)S.tulips={};
    const col=c.tulipColor||rollTulipColor();
    S.tulips[col]=(S.tulips[col]||0)+1;
    delete S.crops[key]; closeSheet();
    toast(`🌷 開出了【${TULIP_COLORS[col].nm}】鬱金香！`); save(); return;
  }
  return _origHarvestTile(key);
};
const _origInteract=interact;
interact=function(ev){
  if(curScene==='shop' && !sitting && nearKeeper()){ if(ev&&ev.preventDefault)ev.preventDefault(); openKeeper(); return; }
  if(!sitting){ const d=activeDoor(); if(d){ if(ev&&ev.preventDefault)ev.preventDefault(); useDoor(d); return; } }
  return _origInteract(ev);
};
  
/* =================== 🌷 鬱金香系統 結束 =================== */
/* ===================== 🍱 桌上擺盤（背包食物） ===================== */
/* 食物會畫在這些格子上，想改位置/數量就改這個陣列（格座標） */
/* 四張桌子。ix,iy=互動格（要對到上面物件座標）；slots=這張桌子的擺放格 */
const FOOD_TABLES={
  table1:{ slots:[{x:11,y:9.3}] },
  table2:{ slots:[{x:16,y:9.3}] },
  table3:{ slots:[{x:22,y:7}] },
  table4:{ slots:[{x:24,y:7}] },
  table5:{ slots:[{x:28.4,y:7}] },
  table6:{ slots:[{x:30.6,y:7}] },
  table7:{ slots:[{x:35.3,y:7}] },
};
function tablePlaced(tbl){ if(!S.cafe.placed||Array.isArray(S.cafe.placed)) S.cafe.placed={}; if(!S.cafe.placed[tbl]) S.cafe.placed[tbl]=[]; return S.cafe.placed[tbl]; }
function drawCafeFood(ox,oy){
  if(curScene!=='cafe' || !S || !S.cafe || !S.cafe.placed || Array.isArray(S.cafe.placed)) return;
  ctx.save(); ctx.textAlign='center'; ctx.textBaseline='middle';
  for(const tbl in FOOD_TABLES){
    const placed=S.cafe.placed[tbl]||[];
    const slots=FOOD_TABLES[tbl].slots;
    placed.forEach((k,i)=>{ const s=slots[i]; if(!k||!s) return;
      const cx=(s.x+0.5)*TS-ox, by=(s.y+1)*TS-oy-FOOD_LIFT;
      const img=FOOD_IMG[k];
      if(img && img.complete && img.naturalWidth){
        ctx.drawImage(img, cx-16, by-32, 32, 32);
      }else{
        ctx.font='13px serif'; ctx.fillText((RECIPES[k]&&RECIPES[k].e)||'🍽️', cx, by-8);
      }
    });
  }
  ctx.restore();
}
function openFoodTable(tbl){
  tbl=tbl||'table1';
  const T=FOOD_TABLES[tbl]; if(!T) return;
  const placed=tablePlaced(tbl), cap=T.slots.length;
  const used=placed.filter(Boolean).length;
  const bag=[]; for(const k in S.cafe.goods){ if(S.cafe.goods[k]>0 && RECIPES[k]) bag.push(k); }
  const bagBody = bag.length ? bag.map(k=>{ const r=RECIPES[k];
    return `<div class="row"><div class="e">${dishIcon(k)}</div><div class="info"><div class="n">${r.nm} <span class="small">×${S.cafe.goods[k]}</span></div></div>
      <button class="btn sm ${used>=cap?'dis':'green'}" onclick="placeFood('${tbl}','${k}')">擺上桌</button></div>`;
  }).join('') : '<div class="empty-note">沒有加工成品，先去廚房做。</div>';
  const placedBody = placed.map((k,i)=> k?`<div class="row"><div class="e">${dishIcon(k)}</div>
      <div class="info"><div class="n">${RECIPES[k]?RECIPES[k].nm:k}</div></div>
      <button class="btn sm" onclick="takeFood('${tbl}',${i})">收回</button></div>`:'').join('');
  openSheet(`<div class="sheethead"><h3>🍱 擺盤（桌上 ${used}/${cap}）</h3><button class="close" onclick="closeSheet()">✕</button></div>
    ${placed.some(Boolean)?`<b class="small">這張桌上的成品</b>${placedBody}<div class="hr"></div>`:''}
    <b class="small">加工成品</b>${bagBody}`);
}
function placeFood(tbl,k){
  const T=FOOD_TABLES[tbl]; if(!T) return;
  const placed=tablePlaced(tbl);
  if((S.cafe.goods[k]||0)<=0){ toast('沒有這個成品'); return; }
  let slot=-1; for(let i=0;i<T.slots.length;i++){ if(!placed[i]){ slot=i; break; } }
  if(slot<0){ toast('這張桌子滿了'); return; }
  placed[slot]=k; S.cafe.goods[k]--; toast(`擺上 ${RECIPES[k]?RECIPES[k].nm:k}`);
  openFoodTable(tbl); save();
}
function takeFood(tbl,i){
  const placed=tablePlaced(tbl);
  const k=placed[i]; if(!k) return;
  S.cafe.goods[k]=(S.cafe.goods[k]||0)+1; placed[i]=null;
  toast(`收回 ${RECIPES[k]?RECIPES[k].nm:k}`); openFoodTable(tbl); save();
}

/* 食物圖（32×32）。檔名對應你的圖；沒列到的就用 emoji */
const FOOD_IMG_SRC={
  strawberry:'food_strawberry.png',
  strawberry_tart:'food_strawberry_tart.png',
  pasta:'food_pasta.png',
  stargazy_pie:'food_stargazy_pie.png',
  scone:'food_scone.png',
  pancake:'food_pancake.png',
  corn      :'food_corn.png',
  egg       :'food_egg.png',
  milk      :'food_milk.png',
  pork      :'food_pork.png',
  beef      :'food_beef.png',
  chicken_meat:'food_chicken.png',
  turkey_meat :'food_turkey.png',
};
const FOOD_IMG={};
for(const k in FOOD_IMG_SRC){ const im=new Image(); im.src=FOOD_IMG_SRC[k]; FOOD_IMG[k]=im; }
function dishIcon(k){
  const src=FOOD_IMG_SRC[k], e=(RECIPES[k]&&RECIPES[k].e)||'🍽️';
  if(!src) return e;   // 沒登記自畫圖 → 退回 emoji
  return `<img src="${src}" style="width:32px;height:32px;object-fit:contain;image-rendering:pixelated;vertical-align:middle" onerror="this.outerHTML='${e}'">`;
}
const FOOD_LIFT=0;   // 想讓食物往上坐在桌面，就把這個調大（單位 px）
/* =================== 🍱 擺盤 結束 =================== */
/* ===================== 🍎 蘋果樹（搖樹掉蘋果） ===================== */
const APPLE_DROP_ZONE={x1:15,y1:6,x2:18,y2:7};   // 蘋果掉落範圍（格座標）
const APPLE_TREE_CD=60000;   // 搖完要等多久才能再搖（毫秒）；想不限次就改成 0
const APPLE_PICK_RANGE=1.2;  // 走多近會自動撿（格），想更好撿就調大
function shakeAppleTree(){
  const now=Date.now();
  const left=APPLE_TREE_CD-(now-(S.appleTreeTs||0));
  if(left>0){ toast(`🍎 樹上的蘋果還沒長好（約 ${fmtSec(left)}）`); return; }
  S.appleTreeTs=now;
  if(!S.appleDrops) S.appleDrops=[];
  const z=APPLE_DROP_ZONE, n=1+Math.floor(Math.random()*3);   // 1~3 顆
  for(let i=0;i<n;i++){
    let x,y,tries=0;
    do{ x=z.x1+Math.floor(Math.random()*(z.x2-z.x1+1)); y=z.y1+Math.floor(Math.random()*(z.y2-z.y1+1)); tries++; }
    while(x===18 && y===5 && tries<10);   // 別掉在樹幹那格
    S.appleDrops.push({x,y});
  }
  toast(`🍎 搖下了 ${n} 顆蘋果！走過去撿起來`); save();
}
function updateAppleDrops(){
  if(!S.appleDrops || !S.appleDrops.length) return;
  for(let i=S.appleDrops.length-1;i>=0;i--){
    const a=S.appleDrops[i];
    if(Math.hypot(player.x-a.x, player.y-a.y) <= APPLE_PICK_RANGE){
      addStore('apple',1); toast('🍎 撿到蘋果 ×1');
      S.appleDrops.splice(i,1); save();
    }
  }
}
function drawAppleDrops(ox,oy){
  if(!S.appleDrops) return;
  const img=npcImg('apple.png');
  for(const a of S.appleDrops){
    const cx=a.x*TS+TS/2-ox, cy=a.y*TS+TS/2-oy;
    ctx.globalAlpha=1; ctx.fillStyle='#00000022';
    ctx.beginPath(); ctx.ellipse(cx,cy+0,5,3,0,0,Math.PI*2); ctx.fill();
    if(img && img.complete && img.naturalWidth){
      ctx.drawImage(img, 0,0, img.naturalWidth, img.naturalHeight, cx-8, cy-12, 16,16);
    }else{
      ctx.font='16px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🍎', cx, cy);
    }
  }
}
/* =================== 🍎 蘋果樹 結束 =================== */
/* ===================== 🚪 門表系統 ===================== */
/* 加新門 = 在 DOORS 裡加一筆。欄位說明：
   from   : 出發場景
   area   : 門的觸發範圍 {x1,y1,x2,y2}（含邊界，格座標）
   to      : 目的場景
   at      : 落點 {x,y}；不填＝用該場景的 spawn
   era     : 需要的最低世紀（不填＝不限），未達就不顯示也不能用
   label   : 互動提示文字（不填＝自動「去○○」）
   noFace : true=傳送後不強制朝上（很少用）
   要「互通」就寫成兩筆（A→B、B→A），各自一行。 */
const SCENE_NM={ farm:'農牧地', shop:'商店', port:'港口', cafe:'餐廳', kitchen:'廚房', office:'辦公室' };
const DOORS=[
  // 餐廳 ⇄ 廚房
  { from:'cafe',    area:{x1:1, y1:3, x2:4, y2:7},   to:'kitchen', at:{x:3,y:8},   label:'🚪 去廚房' },
  { from:'kitchen', area:{x1:1, y1:7, x2:2, y2:7},   to:'cafe',    at:{x:2,y:7},   label:'🚪 回餐廳' },
  // 港口 ⇄ 商店
  { from:'port',    area:{x1:1, y1:21, x2:4, y2:21}, to:'shop',                    label:'🚪 去商店' },
  { from:'shop',    area:{x1:8, y1:13, x2:11, y2:17},to:'port',    at:{x:2,y:21}, era:18, label:'🚪 去港口', fallback:'farm' },  // 17世紀港口沒開→去農牧地
  // 港口 ⇄ 辦公室
  { from:'port',    area:{x1:58, y1:7, x2:59, y2:10},to:'office',                  label:'🚪 回辦公室' },
  { from:'office',  area:{x1:13, y1:15, x2:16, y2:16},to:'port',   at:{x:58,y:8}, era:18, label:'🚪 去港口' },
  // 港口 ⇄ 餐廳
  { from:'port',    area:{x1:54, y1:21, x2:57, y2:21},to:'cafe',   at:{x:9,y:12}, label:'🚪 去餐廳' },
  { from:'cafe',    area:{x1:6, y1:15, x2:13, y2:16},to:'port',   at:{x:55,y:21},era:18, label:'🚪 去港口' },
];
// 找出玩家「目前正站在哪道門上」（且世紀達標），沒有就回 null
function activeDoor(){
  if(!S) return null;
  const px=Math.round(player.x), py=Math.round(player.y);
  for(const d of DOORS){
    if(d.from!==curScene) continue;
    if(d.era && S.era<d.era) continue;
    const a=d.area;
    if(px>=a.x1 && px<=a.x2 && py>=a.y1 && py<=a.y2) return d;
  }
  return null;
}
// 真的走這道門
function useDoor(d){
  // 世紀沒到：有 fallback 就改去 fallback，否則擋下
  if(d.era && S.era<d.era){
    if(d.fallback){ goScene(d.fallback); return; }
    toast(`${SCENE_NM[d.to]||d.to}還沒開放`); return;
  }
  goScene(d.to);
  if(d.at){ player.x=d.at.x; player.y=d.at.y; }
  if(!d.noFace) player.facing='up';
}
function doorLabel(d){ return d.label || ('🚪 去'+(SCENE_NM[d.to]||d.to)); }
/* =================== 🚪 門表系統 結束 =================== */
/* ===================== 🧀 乳品加工處（牛奶→乳酪＋奶油） ===================== */
/* 玩法：放牛奶進去，等一段時間自動變成乳酪和奶油，收回後可當料理食材。
   要調平衡只改下面這張表，其他都不用動。 */
const DAIRY={
  inMilk: 2,                    // 每批投入幾瓶牛奶
  ms: 30000,                    // 一批加工時間（毫秒）
  out: { cheese:1, butter:1 },  // 一批產出（key 要對到 PRODUCTS）
  cap: 4,                       // 最多同時加工幾批
};
function dairyOutTxt(){
  return Object.keys(DAIRY.out).map(k=>`${prodIcon(k,18)}${PRODUCTS[k].nm}${DAIRY.out[k]}`).join('・');
}
function tickDairy(now){
  if(!S) return;
  if(!S.dairy) S.dairy={batches:[],ready:{}};
  if(!S.dairy.batches) S.dairy.batches=[];
  if(!S.dairy.ready)   S.dairy.ready={};
  for(let i=S.dairy.batches.length-1;i>=0;i--){
    if(now-S.dairy.batches[i].startTs>=DAIRY.ms){           // 這批做好了
      for(const k in DAIRY.out) S.dairy.ready[k]=(S.dairy.ready[k]||0)+DAIRY.out[k];
      S.dairy.batches.splice(i,1);
    }
  }
}
function openDairy(){
  if(!S.dairy) S.dairy={batches:[],ready:{}};
  tickDairy(Date.now());                                    // 先結算，畫面才即時
  const milk=S.store.milk||0, proc=S.dairy.batches.length;
  const rc=S.dairy.ready.cheese||0, rb=S.dairy.ready.butter||0, hasReady=rc>0||rb>0;
  let procTxt='';
  if(proc>0){
    const now=Date.now();
    const t=S.dairy.batches.map(b=>Math.max(0,DAIRY.ms-(now-b.startTs))).sort((a,b)=>a-b);
    procTxt=`<div class="small" style="margin-bottom:8px">${prodIcon('milk',18)} 加工中 ${proc}/${DAIRY.cap} 批・最快還要 ${fmtSec(t[0])}</div>`;
  }
  const canPut = milk>=DAIRY.inMilk && proc<DAIRY.cap;
  openSheet(`<div class="sheethead"><h3>${prodIcon('cheese',24)} 乳品加工處</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:8px">把牛奶放進去，等一會兒就會變成乳酪和奶油。<br>${prodIcon('milk',18)} 牛奶庫存 ${milk}</div>
    ${procTxt}
    ${hasReady?`<button class="btn green" style="width:100%;margin-bottom:8px" onclick="collectDairy()">🧺 取出成品（${prodIcon('cheese',18)}${rc}・${prodIcon('butter',18)}${rb}）</button>`:''}
    <button class="btn ${canPut?'':'dis'}" style="width:100%" onclick="putMilkDairy()">${prodIcon('milk',18)} 投入 ${DAIRY.inMilk} 牛奶 → ${fmtSec(DAIRY.ms)}後得 ${dairyOutTxt()}</button>`);
}
function putMilkDairy(){
  if(!S.dairy) S.dairy={batches:[],ready:{}};
  if(S.dairy.batches.length>=DAIRY.cap){ toast('加工槽滿了，等做好再放'); return; }
  if((S.store.milk||0)<DAIRY.inMilk){ toast('牛奶不夠'); return; }
  S.store.milk-=DAIRY.inMilk;
  S.dairy.batches.push({startTs:Date.now()});
  toast(`🥛 放入 ${DAIRY.inMilk} 牛奶，開始加工`);
  openDairy(); save();
}
function collectDairy(){
  if(!S.dairy) return;
  const r=S.dairy.ready||{}; let got=0; const msg=[];
  for(const k in r){ if(r[k]>0){ addStore(k,r[k]); msg.push(`${PRODUCTS[k].e}${PRODUCTS[k].nm}${r[k]}`); got+=r[k]; } }
  if(!got){ toast('還沒有成品'); return; }
  S.dairy.ready={};
  toast(`🧺 取出 ${msg.join('・')}`);
  openDairy(); save();
}
/* 掛到 tick：跑遊戲時鐘時順便結算乳品（沿用 _orig 覆寫法，不動原本 tick） */
const _dairyOrigTick=tick;
tick=function(){ _dairyOrigTick.apply(this,arguments); tickDairy(Date.now()); };
/* =================== 🧀 乳品加工處 結束 =================== */
/* ===================== 🎨 統一圖示系統（取代 emoji） ===================== */
/* 作物：用生長圖「第六格(index 5)」當圖示，重用 FARM_CROPS[k].img，不必另存檔。
   → 你的生長圖要從 5 格(160×32) 擴成 6 格(192×32)，第六格畫成品圖示。
   其他物品：用各自 PNG；載不到圖時自動退回 emoji，不會壞。 */
const ITEM_IMG_SRC={
  apple:'food_apple.png',
  herring:'fish_herring.png', mackerel:'fish_mackerel.png',
  cod:'fish_cod.png', salmon:'fish_salmon.png', halibut:'fish_halibut.png',
  cheese:'food_cheese.png', butter:'food_butter.png',
  flour:'item_flour.png', sugar:'item_sugar.png',
  olive_oil:'item_olive_oil.png', 
};
// egg/milk/pork/beef/chicken_meat/turkey_meat 已在 FOOD_IMG_SRC，會自動沿用
const MISC_IMG_SRC={ feed:'item_feed.png', fert:'item_fert.png', toxin:'toxin.png' };
const ANIMAL_ICON_SRC={
  chick:'icon_chick.png', hen:'icon_hen.png', turkey:'icon_turkey.png',
  piglet:'icon_piglet.png', pig:'icon_pig.png',
  calf:'icon_calf.png', cow:'icon_cow.png',
};

function _imgTag(src,e,px){ px=px||32;
  return `<img src="${src}" style="width:${px}px;height:${px}px;object-fit:contain;image-rendering:pixelated;vertical-align:middle" onerror="this.outerHTML='${e}'">`;
}
/* 作物圖示＝生長圖第六格，用 CSS 裁切（背景縮到高度=px，每格剛好 px 寬，往左推 5 格） */
function cropIcon(k,px){ px=px||32; const d=FARM_CROPS[k]; if(!d) return '';
  return `<div style="display:inline-block;width:${px}px;height:${px}px;background:url('${d.img}') ${-5*px}px 0 no-repeat;background-size:auto ${px}px;image-rendering:pixelated;vertical-align:middle"></div>`;
}
/* 通用物品（作物/產品/魚/咖啡材料 都走這個） */
function prodIcon(k,px){
  if(FARM_CROPS[k]) return cropIcon(k,px);                       // 作物→第六格
  const src=ITEM_IMG_SRC[k]||FOOD_IMG_SRC[k];
  const e=(PRODUCTS[k]&&PRODUCTS[k].e)||(EXTRAS[k]&&EXTRAS[k].e)||'📦';
  return src ? _imgTag(src,e,px) : e;
}
function miscIcon(key,e,px){ const src=MISC_IMG_SRC[key]; return src?_imgTag(src,e,px):e; }
/* 動物：傳 (type,a) 自動判斷幼/成；或直接傳字串 key 指定（如 'turkey'） */
function animalIcon(type,a,px){
  if(typeof a==='string'){ const e={chick:'🐤',hen:'🐔',turkey:'🦃',piglet:'🐷',pig:'🐖',calf:'🐮',cow:'🐄'}[a]||'🐾';
    return ANIMAL_ICON_SRC[a]?_imgTag(ANIMAL_ICON_SRC[a],e,px):e; }
  let key,e;
  if(type==='chicken'){ const turkey=a&&a.species==='turkey', adult=a?isHen(a):true;
    key=turkey?'turkey':(adult?'hen':'chick'); e=turkey?'🦃':(adult?'🐔':'🐤'); }
  else if(type==='pig'){ const g=a?isGrownPig(a):true; key=g?'pig':'piglet'; e=g?'🐖':'🐷'; }
  else if(type==='cow'){ const g=a?isGrownCow(a):true; key=g?'cow':'calf'; e=g?'🐄':'🐮'; }
  else { key=type; e=(ANIMALS[type]&&ANIMALS[type].e)||'🐾'; }
  return ANIMAL_ICON_SRC[key]?_imgTag(ANIMAL_ICON_SRC[key],e,px):e;
}
/* =================== 🎨 圖示系統 結束 =================== */
/* ===================== 🍽️ 通用客人系統 ===================== */
/* 玩法固定：客人點菜 → 廚房做 → 擺上他那桌 → 對話請他吃
   加新客人 = 在 GUESTS 加一筆 ＋ 準備他的對話包(convos)，其他都不用改 */

const GUESTS={
  feli:{
    nm:'菲利奇亞諾',
    seat:{x:19,y:7},           // 坐哪一格
    table:'table3',             // 他的桌子（FOOD_TABLES 的 key）
    doneAvatar:'🥰',
    doneImg:'feli_family.png',      // 三關全解後常駐的圖
    nextMsg:'他說下次要帶家人再來。',
    doneMsg:'一家人都成了常客！',
    convos:FELI_CONVOS,
    stages:[
      { recipe:'pasta',        convo:'pasta', avatar:'😊', img:'feli_solo.png'    },  // 第一階段：他自己
      { recipe:'grilled_fish', convo:'fish',  avatar:'😄',  img:'feli_brother.png' },  // 第二階段：帶哥哥
      { recipe:'pork_knuckle', convo:'pork',  avatar:'😄',  img:'feli_bf.png'      },  // 第三階段：帶男友
    ],
  },
  /* 之後的新客人照這個格式加，例如：
  ludwig:{ nm:'路德維希', seat:{x:24,y:12}, table:'table4', doneAvatar:'😊',
    convos:LUDWIG_CONVOS,
    stages:[{ recipe:'pork_knuckle', convo:'knuckle', avatar:'🇩🇪' }] },
  */
};

/* 臉：接進既有對話系統（沿用原本做法） */
for(const id in FELI_FACES){ CHARS[id]={ nm:FELI_FACES[id].nm, face:FELI_FACES[id] }; }

/* ---- 狀態 ---- */
function guestState(gid){
  if(!S.guests) S.guests={};
  if(!S.guests[gid]) S.guests[gid]={stage:0};
  return S.guests[gid];
}
function guestStage(gid){ return guestState(gid).stage; }
function guestDone(gid){ return guestStage(gid)>=GUESTS[gid].stages.length; }
function guestCurStage(gid){ return guestDone(gid)?null:GUESTS[gid].stages[guestStage(gid)]; }

/* ---- 座位：一次擺好所有客人 ---- */
function syncGuestSeats(){
  SCENES.cafe.objects=SCENES.cafe.objects.filter(o=>o.kind!=='guest');
  for(const gid in GUESTS){
    const g=GUESTS[gid], st=guestCurStage(gid);
    const av=st?st.avatar:g.doneAvatar;
    SCENES.cafe.objects.push({ id:'guest_'+gid, gid:gid, x:g.seat.x, y:g.seat.y,
      e:av, nm:g.nm, kind:'guest', npc:true, avatar:av, hide:true, sense:1.6 });
  }
}

/* ---- 他的桌上有沒有他要的菜 ---- */
function guestDishIdx(gid){
  const st=guestCurStage(gid); if(!st) return -1;
  return tablePlaced(GUESTS[gid].table).indexOf(st.recipe);
}

/* ---- 對話：桌上有菜才出現「請他吃」 ---- */
function openGuest(gid){
  const g=GUESTS[gid];
  freezeNpcById('guest_'+gid);
  if(guestDone(gid)){
    const pool=g.convos.done;
    const ln=pool[Math.floor(Math.random()*pool.length)];
    _convoCid=ln.who;
    dlgLine(ln,[{t:'再會',cls:'green',run:()=>closeSheet()}]);
    return;
  }
  const st=guestCurStage(gid), r=RECIPES[st.recipe];
  const onTable=guestDishIdx(gid)>=0;
  const lines=g.convos[st.convo];
  _convoCid=lines[0].who;
  runScript(lines,[
    onTable ? {t:`🍽️ 請他吃${r.nm}`, cls:'gold', run:()=>serveGuest(gid)} : null,
    {t:'知道了', cls:'green', run:()=>closeSheet()},
  ].filter(Boolean));
}

/* ---- 請客：吃的是「他桌上」那份 ---- */
function serveGuest(gid){
  const g=GUESTS[gid], st=guestCurStage(gid); if(!st) return;
  const r=RECIPES[st.recipe];
  const placed=tablePlaced(g.table);
  const i=placed.indexOf(st.recipe);
  if(i<0){ toast(`先把${r.nm}擺到他桌上再請他吃`); return; }
  placed[i]=null;                          // 吃掉桌上那份（不退回背包）
  earn(st.pay??r.price, `招待${g.nm}・${r.nm}`);
  guestState(gid).stage++;
  syncGuestSeats();
  addLog(`🍽️ ${g.nm}吃到了${r.nm}，非常滿意！`);
  closeSheet(); refreshTop(); save();
  toast(`🍽️ ${r.nm}大成功！${guestDone(gid)?(g.doneMsg||`${g.nm}成了常客！`):(g.nextMsg||'他還想再吃別的。')}`);
}

/* ---- 互動分派 ---- */
const _guestOrigInteract=interact;
interact=function(ev){
  const o=(!sitting)?facingObject():null;
  if(o && o.kind==='guest'){ if(ev&&ev.preventDefault)ev.preventDefault(); openGuest(o.gid); return; }
  return _guestOrigInteract(ev);
};

/* ---- 進餐廳時擺好所有客人 ---- */
const _guestOrigGoScene=goScene;
goScene=function(name){
  _guestOrigGoScene(name);
  if(name==='cafe') syncGuestSeats();
};

/* ---- 存檔相容：舊 S.feli.stage 自動搬進新格式 ---- */
const _guestOrigStart=startGame;
startGame=function(n){
  _guestOrigStart(n);
  if(!S.guests) S.guests={};
  if(S.feli && !S.guests.feli) S.guests.feli={stage:S.feli.stage||0};
  if(curScene==='cafe') syncGuestSeats();
  save();
};
/* =================== 🍽️ 通用客人系統 結束 =================== */
/* ===================== 🚶 咖啡廳固定客人＋擺放上菜（走過講話、互動鍵上菜，不開面板） ===================== */
/* 三位固定客人各坐一桌，每人一張整張地圖大小的疊圖：guest2.png / guest5.png / guest6.png
   dish 指定他想吃哪道（用 RECIPES 的 key）。座位 (x,y) 先估，之後照畫面微調。
   plateDx/plateDy：上菜後盤子畫在桌上的位置微調（單位＝格）。 */
const CAFE_GUESTS=[
  { id:'cg_2', x:18, y:10, img:'guest2', face:'🧳', nm:'旅人',   dish:'pasta',
    table:'table2',
    plateDx:0, plateDy:0.4,
    orderLine:'走了一整天，好想吃{dish}啊。',
    doneLines:['就是這個味道，謝謝招待！','歇夠了，繼續上路～'] },
  { id:'cg_5', x:27, y:6,  img:'guest5', face:'🎩', nm:'老紳士', dish:'strawberry_tart',
    table:'table5',
    plateDx:0, plateDy:0.4,
    orderLine:'來一份{dish}配咖啡，正好。',
    doneLines:['手藝真不錯，下次再訪。','年輕人，經營得很用心。'] },
  { id:'cg_6', x:33, y:6,  img:'guest6', face:'👒', nm:'紅髮小姐', dish:'strawberry_tart',
    table:'table6',
    plateDx:0, plateDy:0.4,
    orderLine:'聽說這裡的{dish}很有名，來一份！',
    doneLines:['太幸福了～','下次一定還要再來坐坐。'] },
];
for(const g of CAFE_GUESTS){ CHARS[g.id]={ nm:g.nm, face:{neutral:g.face} }; }
function _cgPick(a){ return a[Math.floor(Math.random()*a.length)]; }

/* 可被抽到的菜＝當前時代已解鎖的食譜 */
function cgDishPool(){
  const p=[]; for(const k in RECIPES){ if(recipeEra(k)<=S.era) p.push(k); }
  return p.length?p:Object.keys(RECIPES);
}
/* 這位客人今天點的菜（同一天固定，隔天重抽） */
function cgDish(g){ return (S.cguests && S.cguests.dish && S.cguests.dish[g.id]) || g.dish; }
/* 換日重置＋每人重抽一道菜（下次一批新客人點的都不一樣） */
function ensureCafeGuests(){
  if(!S.cguests || S.cguests.day!==S.day || !S.cguests.dish){
    const pool=cgDishPool(), dish={};
    for(const g of CAFE_GUESTS){ dish[g.id]=_cgPick(pool); }
    S.cguests={ day:S.day, served:{}, gone:{}, dish:dish };
  }
}

/* 擺互動點：npc:true → 走到面前自動講話；kind:'cguest' → 互動鍵交給下面自訂（上菜） */
function syncCafeGuests(){
  SCENES.cafe.objects=SCENES.cafe.objects.filter(o=>o.kind!=='cguest');
  for(const g of CAFE_GUESTS){
    SCENES.cafe.objects.push({ id:g.id, x:g.x, y:g.y, e:g.face, avatar:g.face,
      nm:g.nm, kind:'cguest', cguest:true, npc:true, hide:true });
  }
}

/* 走過去講的台詞：未上菜→點餐（有成品就提示按鍵）；已上菜→滿足台詞 */
const _cgOrigShowDlg=showDlg;
showDlg=function(o){
  if(o && o.cguest){
    ensureCafeGuests();
    const g=CAFE_GUESTS.find(x=>x.id===o.id), r=RECIPES[cgDish(g)];
    document.getElementById('dialogue').classList.remove('idle');
    document.getElementById('dlgAvatar').textContent=g.face;
    let line;
    if(S.cguests.served[g.id]){ line=_cgPick(g.doneLines); }
    else{
      const onTable = tablePlaced(g.table).indexOf(cgDish(g))>=0;
      line=g.orderLine.replace('{dish}', r.nm) + (onTable?'（按互動鍵請他享用）':`（把${r.nm}擺到這桌）`);
    }
    document.getElementById('dlgText').innerHTML=`<span class="name">${g.nm}</span>${line}`;
    return;
  }
  return _cgOrigShowDlg(o);
};

/* 上菜＝請他吃「桌上擺的那份」：先用擺盤桌擺菜，再對客人按互動 */
function serveCafeGuest(g){
  ensureCafeGuests();
  if(S.cguests.served[g.id]){ toast('這桌已經上過菜囉'); return; }
  const k=cgDish(g), r=RECIPES[k]; if(!r) return;
  const pl=tablePlaced(g.table);
  const i=pl.indexOf(k);
  if(i<0){ toast(`先把${r.nm}擺到他那桌（擺盤桌）`); return; }
  pl[i]=null;                                   // 吃掉桌上那份（食物圖同時消失）
  earn(r.price, '上菜・'+r.nm);
  S.cguests.served[g.id]=true;
  addLog(`🍽️ ${g.nm}吃到了${r.nm}，+$${r.price}`);
  toast(`🍽️ ${g.nm}開動了！+$${r.price}`);
  dlgNpc=null;                                   // 下一幀走過去→秀滿足台詞→排程離席
  refreshTop(); save();
}

/* 互動鍵：面前是客人就上菜（不開面板），其餘照舊 */
const _cgOrigInteract=interact;
interact=function(ev){
  if(!sitting){
    const o=facingObject();
    if(o && o.cguest){
      if(ev&&ev.preventDefault) ev.preventDefault();
      serveCafeGuest(CAFE_GUESTS.find(x=>x.id===o.id));
      return;
    }
  }
  return _cgOrigInteract(ev);
};

/* 畫客人疊圖＋已上菜的盤子 */
const _cgOrigDrawCafeFood=drawCafeFood;
drawCafeFood=function(ox,oy){
  _cgOrigDrawCafeFood(ox,oy);
  if(curScene!=='cafe') return;
  ensureCafeGuests();
  ctx.save(); ctx.textAlign='center'; ctx.textBaseline='middle';
  for(const g of CAFE_GUESTS){
    if(S.cguests.gone && S.cguests.gone[g.id]) continue;   // 離開的客人不畫（含盤子）
    const img=npcImg(`${g.img}.png`);
    if(img && img.complete && img.naturalWidth){
      ctx.drawImage(img, -ox, -oy, mapCols()*TS, mapRows()*TS);
    }else{
      const cx=(g.x+0.5)*TS-ox, by=(g.y+1)*TS-oy;
      ctx.globalAlpha=1; ctx.fillStyle='#000'; ctx.font='13px serif';
      ctx.fillText(g.face, cx, by-8);
    }
    if(S.cguests.served[g.id]){                  // 上菜後桌上出現那道菜
      const r=RECIPES[cgDish(g)];
      const px=(g.x+0.5+(g.plateDx||0))*TS-ox, py=(g.y+(g.plateDy||0.4))*TS-oy;
      ctx.globalAlpha=1; ctx.fillStyle='#000'; ctx.font='14px serif';
      ctx.fillText(r.e, px, py);
    }
  }
  ctx.restore();
};

/* 進場擺好客人 */
const _cgOrigGoScene=goScene;
goScene=function(name){ _cgOrigGoScene(name); if(name==='cafe') syncCafeGuests(); };
syncCafeGuests();
/* =================== 🚶 咖啡廳固定客人＋擺放上菜 結束 =================== */
/* ===== 🍝 故事客人（GUESTS）整張地圖疊圖：跟著階段換圖 ===== */
const _sgOrigDrawCafeFood=drawCafeFood;
drawCafeFood=function(ox,oy){
  _sgOrigDrawCafeFood(ox,oy);
  if(curScene!=='cafe'||!S) return;
  ctx.save(); ctx.textAlign='center'; ctx.textBaseline='middle';
  for(const gid in GUESTS){
    const g=GUESTS[gid], st=guestCurStage(gid);
    const src=st ? st.img : g.doneImg;
    const img=src ? npcImg(src) : null;
    if(img && img.complete && img.naturalWidth){
      ctx.drawImage(img, -ox, -oy, mapCols()*TS, mapRows()*TS);
    }else{   // 圖還沒好 → emoji 在座位格頂著
      const av=st ? st.avatar : g.doneAvatar;
      ctx.font='13px serif'; ctx.fillText(av, (g.seat.x+0.5)*TS-ox, (g.seat.y+1)*TS-oy-8);
    }
  }
  ctx.restore();
};
/* ===== 疊圖 結束 ===== */
/* ===== 🚶 隨機客人：講完話就離席，重進餐廳換新客人 ===== */
const CG_LEAVE_MS=1500;   // 講完滿足台詞後幾毫秒離開，想久一點就調大
const PLATE_SENSE=3;      // 空盤感應範圍（格），收不到就再調大
const _cgLeaving={};      // 防止重複排程

/* 1) 走過去聽到滿足台詞 → 排程離席（人＋食物＋互動點消失，留下空盤） */
const _leaveOrigShowDlg=showDlg;
showDlg=function(o){
  _leaveOrigShowDlg(o);
  if(o && o.cguest && S.cguests && S.cguests.served[o.id]
     && !(S.cguests.gone && S.cguests.gone[o.id]) && !_cgLeaving[o.id]){
    _cgLeaving[o.id]=true;
    const g=CAFE_GUESTS.find(x=>x.id===o.id);
    setTimeout(()=>{
      _cgLeaving[o.id]=false;
      if(!S.cguests.gone) S.cguests.gone={};
      S.cguests.gone[o.id]=true;
      SCENES.cafe.objects=SCENES.cafe.objects.filter(ob=>ob.id!==o.id);   // 移除互動點
      if(!S.cguests.plates) S.cguests.plates={};
      S.cguests.plates[o.id]=true;                                        // 桌上留下空盤
      if(g && g.table){ const pl=tablePlaced(g.table);                    // 吃掉桌上擺的那份菜
        for(let i=0;i<pl.length;i++) pl[i]=null; }
      syncEmptyPlates();
      dlgNpc=null; idleDlg();
      toast(`👋 ${g?g.nm:'客人'}滿足地離開了`);
      save();
    }, CG_LEAVE_MS);
  }
};

/* 2) 擺互動點時跳過已離開的客人 */
const _leaveOrigSync=syncCafeGuests;
syncCafeGuests=function(){
  _leaveOrigSync();
  if(S && S.cguests && S.cguests.gone)
    SCENES.cafe.objects=SCENES.cafe.objects.filter(o=>o.kind!=='cguest' || !S.cguests.gone[o.id]);
};

/* 3) 重進餐廳＝地圖刷新 → 盤子收了的空位才補新客人（重抽菜色、狀態歸零） */
function refreshGoneGuests(){
  ensureCafeGuests();
  if(!S.cguests.gone) return;
  const pool=cgDishPool();
  let refreshed=false;
  for(const id in S.cguests.gone){
    if(!S.cguests.gone[id]) continue;
    if(S.cguests.plates && S.cguests.plates[id]) continue;   // 空盤沒收→這桌不來新客人
    S.cguests.gone[id]=false;
    S.cguests.served[id]=false;
    S.cguests.dish[id]=_cgPick(pool);   // 新客人點新的菜
    refreshed=true;
  }
  if(refreshed) syncCafeGuests();
  syncEmptyPlates();
}
const _leaveOrigGoScene=goScene;
goScene=function(name){ _leaveOrigGoScene(name); if(name==='cafe') refreshGoneGuests(); };
/* ===== 隨機客人離席 結束 ===== */
/* ---- 🍽️ 空盤：客人走了留下盤子，按互動鍵收回 ---- */
function cgPlateSlot(g){
  const T=FOOD_TABLES[g.table];
  return (T && T.slots[0]) || {x:g.x+(g.plateDx||0), y:g.y+(g.plateDy||0.4)};  // 沒設 table→退回舊算法
}
function syncEmptyPlates(){
  SCENES.cafe.objects=SCENES.cafe.objects.filter(o=>o.kind!=='emptyplate');
  if(!S.cguests || !S.cguests.plates) return;
  for(const g of CAFE_GUESTS){
    if(!S.cguests.plates[g.id]) continue;
    const s=cgPlateSlot(g);
    SCENES.cafe.objects.push({ id:'plate_'+g.id, pid:g.id,
      x:Math.round(s.x), y:Math.round(s.y),
      e:'🍽️', nm:'空盤', kind:'emptyplate', hide:true, sense:PLATE_SENSE });
  }
}
function nearEmptyPlate(){
  if(curScene!=='cafe') return null;
  const bx=Math.round(player.x), by=Math.round(player.y);
  for(const o of SCENES.cafe.objects){
    if(o.kind!=='emptyplate') continue;
    if(Math.max(Math.abs(o.x-bx), Math.abs(o.y-by)) <= (o.sense||PLATE_SENSE)) return o;
  }
  return null;
}
function takeEmptyPlate(pid){
  if(!S.cguests || !S.cguests.plates || !S.cguests.plates[pid]) return;
  S.cguests.plates[pid]=false;
  syncEmptyPlates();
  toast('🍽️ 收走了空盤');
  save();
}
function drawEmptyPlates(ox,oy){
  if(curScene!=='cafe' || !S.cguests || !S.cguests.plates) return;
  const img=npcImg('plate_empty.png');
  for(const g of CAFE_GUESTS){
    if(!S.cguests.plates[g.id]) continue;
    const s=cgPlateSlot(g);
    const cx=(s.x+0.5)*TS-ox, by=(s.y+1)*TS-oy-FOOD_LIFT;   // 與擺盤食物同一套座標公式
    if(img && img.complete && img.naturalWidth){
      ctx.globalAlpha=1;
      ctx.drawImage(img, 0,0, img.naturalWidth, img.naturalHeight, cx-16, by-32, 32,32);
    }else{
      ctx.font='14px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillStyle='#000'; ctx.fillText('🍽️', cx, by-8);
    }
  }
}
/* 畫空盤：掛在 drawCafeFood 後面 */
const _plateOrigDrawCafeFood=drawCafeFood;
drawCafeFood=function(ox,oy){ _plateOrigDrawCafeFood(ox,oy); drawEmptyPlates(ox,oy); };
/* 互動鍵：附近有空盤→優先收走 */
const _plateOrigInteract=interact;
interact=function(ev){
  if(!sitting){ const p=nearEmptyPlate();
    if(p){ if(ev&&ev.preventDefault)ev.preventDefault(); takeEmptyPlate(p.pid); return; } }
  return _plateOrigInteract(ev);
};
/* 提示文字 */
const _plateOrigUpdate=update;
update=function(){
  _plateOrigUpdate();
  if(!S||sitting||curScene!=='cafe') return;
  const p=nearEmptyPlate();
  if(p){ const h=document.getElementById('hint');
    if(h){ h.textContent='🍽️ 收走空盤（互動鍵）'; h.classList.add('show'); } }
};
/* ---- 空盤還在→這桌不能擺菜/上菜 ---- */
function tableHasPlate(tbl){
  if(!S.cguests || !S.cguests.plates) return false;
  return CAFE_GUESTS.some(g=>g.table===tbl && S.cguests.plates[g.id]);
}
const _plateOrigPlaceFood=placeFood;
placeFood=function(tbl,k){
  if(tableHasPlate(tbl)){ toast('🍽️ 桌上還有空盤，先收走再擺菜'); return; }
  return _plateOrigPlaceFood(tbl,k);
};
const _plateOrigServeCafe2=serveCafeGuest;
serveCafeGuest=function(g){
  if(S.cguests && S.cguests.plates && S.cguests.plates[g.id]){
    toast('🍽️ 先收走桌上的空盤'); return;
  }
  return _plateOrigServeCafe2(g);
};
/* ===================== 🛢️ 儲物桶系統 ===================== */
/* 加桶子＝在這張表加一筆：id 不能重複、scene 場景、x,y 格座標、nm 顯示名。
   之後想在別的場景放桶子，照樣加一行就好。 */
const STORAGE_POINTS=[
  { id:'kitchen1', scene:'kitchen', x:18, y:11, nm:'儲物桶 A' },
  { id:'kitchen2', scene:'kitchen', x:1, y:14, nm:'儲物桶 B' },
  { id:'kitchen3', scene:'kitchen', x:1, y:16, nm:'儲物桶 C' },
];
const STORAGE_SLOTS=30;   // 一個桶最多放幾「種」東西（數量不限）

/* 把桶子登記成場景物件（hide:true→不畫方塊，但會擋路＋能互動） */
for(const sp of STORAGE_POINTS){
  const sc=SCENES[sp.scene]; if(!sc) continue;
  sc.objects.push({ id:'storage_'+sp.id, sid:sp.id, x:sp.x, y:sp.y,
    e:'🛢️', nm:sp.nm, kind:'storage', hide:true, sense:2});
}

/* ---- 存取邏輯 ---- */
function storageBank(id){ if(!S.storage)S.storage={}; if(!S.storage[id])S.storage[id]={}; return S.storage[id]; }
function storagePool(cat){ return cat==='seed'?S.seeds : cat==='store'?S.store : cat==='extra'?S.extras : S.cafe.goods; }
function storageName(cat,k){ return cat==='seed'?((FARM_CROPS[k]?FARM_CROPS[k].nm:k)+'種子') : cat==='good'?(RECIPES[k]?RECIPES[k].nm:k) : ingNm(k); }
function storageIcon(cat,k,px){ return cat==='good'?dishIcon(k):prodIcon(k,px); }
function _selId(pfx,key){ return pfx+key.replace(/[^a-zA-Z0-9]/g,'_'); }
function storageBagList(){
  const out=[];
  for(const k in S.seeds)      if(S.seeds[k]>0)      out.push({cat:'seed', k, n:S.seeds[k]});
  for(const k in S.store)      if(S.store[k]>0)      out.push({cat:'store',k, n:S.store[k]});
  for(const k in S.extras)     if(S.extras[k]>0)     out.push({cat:'extra',k, n:S.extras[k]});
  for(const k in S.cafe.goods) if(S.cafe.goods[k]>0) out.push({cat:'good', k, n:S.cafe.goods[k]});
  return out;
}
function openStorage(id){
  const sp=STORAGE_POINTS.find(s=>s.id===id), nm=sp?sp.nm:'儲物桶';
  const bank=storageBank(id);
  const keys=Object.keys(bank).filter(kk=>bank[kk]>0);
  const inside = keys.length ? keys.map(kk=>{ const [cat,k]=kk.split(':'), n=bank[kk];
    return `<div class="row"><div class="e">${storageIcon(cat,k,28)}</div>
      <div class="info"><div class="n">${storageName(cat,k)} <span class="small">×${n}</span></div></div>
      ${qtyOpts(_selId('wd_',kk),n)}<button class="btn sm green" onclick="storageWithdraw('${id}','${kk}')">取出</button></div>`;
  }).join('') : '<div class="empty-note">桶子是空的。</div>';
  const bag=storageBagList();
  const put = bag.length ? bag.map(it=>
    `<div class="row"><div class="e">${storageIcon(it.cat,it.k,28)}</div>
      <div class="info"><div class="n">${storageName(it.cat,it.k)} <span class="small">×${it.n}</span></div></div>
      ${qtyOpts('dp_'+it.cat+'_'+it.k,it.n)}<button class="btn sm" onclick="storageDeposit('${id}','${it.cat}','${it.k}')">存入</button></div>`
  ).join('') : '<div class="empty-note">背包沒有東西可以存。</div>';
  openSheet(`<div class="sheethead"><h3>🛢️ ${nm}</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:8px">容量 ${keys.length}/${STORAGE_SLOTS} 種</div>
    <b class="small">桶內物品</b>${inside}<div class="hr"></div>
    <b class="small">背包物品</b>${put}`);
}
function storageDeposit(id,cat,k){
  const bank=storageBank(id), pool=storagePool(cat), have=pool[k]||0;
  if(have<=0){ toast('背包沒有這個'); return; }
  const slotKey=cat+':'+k, existing=bank[slotKey]||0;
  if(!existing && Object.keys(bank).filter(kk=>bank[kk]>0).length>=STORAGE_SLOTS){ toast(`這個桶滿了（最多 ${STORAGE_SLOTS} 種）`); return; }
  const sel=document.getElementById('dp_'+cat+'_'+k);
  let q=sel?(parseInt(sel.value)||have):have; q=Math.min(q,have);
  pool[k]=have-q; bank[slotKey]=existing+q;
  toast(`存入 ${storageName(cat,k)} ×${q}`); openStorage(id); save();
}
function storageWithdraw(id,slotKey){
  const bank=storageBank(id), have=bank[slotKey]||0;
  if(have<=0){ toast('桶內沒有這個'); return; }
  const sel=document.getElementById(_selId('wd_',slotKey));
  let q=sel?(parseInt(sel.value)||have):have; q=Math.min(q,have);
  const [cat,k]=slotKey.split(':'), pool=storagePool(cat);
  pool[k]=(pool[k]||0)+q; bank[slotKey]=have-q;
  if(bank[slotKey]<=0) delete bank[slotKey];
  toast(`取出 ${storageName(cat,k)} ×${q}`); openStorage(id); save();
}

/* ---- 互動：面對桶子按互動鍵→開面板 ---- */
const _storageOrigInteract=interact;
interact=function(ev){
  if(!sitting){ const o=facingObject();
    if(o && o.kind==='storage'){ if(ev&&ev.preventDefault)ev.preventDefault(); openStorage(o.sid); return; } }
  return _storageOrigInteract(ev);
};

/* ---- 提示文字：面對桶子時顯示 ---- */
const _storageOrigUpdate=update;
update=function(){
  _storageOrigUpdate();
  if(!S||sitting||curScene==='fishing'||!SCENES[curScene]) return;
  const o=facingObject();
  if(o && o.kind==='storage'){ const h=document.getElementById('hint');
    if(h){ h.textContent='🛢️ '+(o.nm||'儲物桶')+'（互動鍵）'; h.classList.add('show'); } }
};

/* 畫桶子（barrel.png，32×32；沒圖先用 emoji）→ 由 draw 在「人物之前」呼叫 */
function drawStorageBarrels(ox,oy){
  if(!S) return;
  const img=npcImg('barrel.png');
  for(const sp of STORAGE_POINTS){
    if(sp.scene!==curScene) continue;
    const cx=sp.x*TS+TS/2-ox, by=(sp.y+1)*TS-oy;
    ctx.globalAlpha=1; ctx.fillStyle='#00000022';
    ctx.beginPath(); ctx.ellipse(cx,by-2,9,4,0,0,Math.PI*2); ctx.fill();
    if(img && img.complete && img.naturalWidth){ ctx.drawImage(img,0,0,img.naturalWidth,img.naturalHeight, cx-16, by-32, 32,40); }
    else{ ctx.font='20px serif'; ctx.textAlign='center'; ctx.textBaseline='alphabetic'; ctx.fillStyle='#000'; ctx.fillText('🛢️',cx,by-4); }
  }
}
/* =================== 🛢️ 儲物桶系統 結束 =================== */
/* ===================== ⭐ 餐廳商譽系統 ===================== */
const REP_CFG={
  max:100,          // 商譽上限
  tipRate:0.25,     // 小費 = 售價 × 比例（至少 $1）
  gainStory:5,      // 招待故事客人（菲利等）+商譽
  gainRand:2,       // 招待隨機客人 +商譽
  revPerRep:0.005,  // 每點商譽 → 每日營收 +0.5%（100點=+50%）
};
function repMul(){ return 1 + Math.min(REP_CFG.max, S.rep||0)*REP_CFG.revPerRep; }
function gainRep(n){
  const before=S.rep||0;
  S.rep=Math.min(REP_CFG.max, before+n);
  const got=S.rep-before;
  if(got>0) toast(`⭐ 商譽 +${got}（${S.rep}/${REP_CFG.max}）`);
}
function giveTip(price,who){
  const tip=Math.max(1, Math.round(price*REP_CFG.tipRate));
  earn(tip, `小費・${who}`);
  toast(`💰 收到小費 +$${tip}`);
}

/* 故事客人：serveGuest 成功（stage 有前進）→ 小費＋商譽 */
const _repOrigServeGuest=serveGuest;
serveGuest=function(gid){
  const before=guestStage(gid);
  _repOrigServeGuest(gid);
  if(guestStage(gid)>before){
    const st=GUESTS[gid].stages[before], r=RECIPES[st.recipe];
    giveTip(st.pay??r.price, GUESTS[gid].nm);
    gainRep(REP_CFG.gainStory);
    save();
  }
};

/* 固定客人：serveCafeGuest 成功（served 由 false 變 true）→ 小費＋商譽 */
const _repOrigServeCafe=serveCafeGuest;
serveCafeGuest=function(g){
  const was=!!(S.cguests && S.cguests.served && S.cguests.served[g.id]);
  _repOrigServeCafe(g);
  const now=!!(S.cguests && S.cguests.served && S.cguests.served[g.id]);
  if(!was && now){
    giveTip(RECIPES[cgDish(g)].price, g.nm);
    gainRep(REP_CFG.gainRand);
    save();
  }
};

/* 每日結算加成：包住 runCafe，只放大「這次新增的營收」 */
const _repOrigRunCafe=runCafe;
runCafe=function(now){
  const before=S.cafe.till||0;
  _repOrigRunCafe(now);
  const gained=(S.cafe.till||0)-before;
  if(gained>0 && (S.rep||0)>0){
    S.cafe.till=before + Math.round(gained*repMul());
  }
};

/* 頂欄加 ⭐ 商譽顯示 */
(function(){
  const bar=document.querySelector('.topbar');
  if(bar && !document.getElementById('rep')){
    const sp=document.createElement('span');
    sp.className='stat'; sp.innerHTML='⭐<b id="rep">0</b>';
    bar.insertBefore(sp, document.getElementById('clock'));
  }
})();
const _repOrigRefreshTop=refreshTop;
refreshTop=function(){
  _repOrigRefreshTop();
  const el=document.getElementById('rep');
  if(el) el.textContent=(S.rep||0);
};

/* 存檔相容 */
const _repOrigStartGame=startGame;
startGame=function(n){
  _repOrigStartGame(n);
  if(S.rep===undefined) S.rep=0;
  refreshTop(); save();
};
/* ===== 商人專賣商品 + 伴侶免費拿貨 ===== */

/* 1) 新增商品到 EXTRAS，標記 merchantOnly（只有這三位商人賣，一般採購看不到） */
Object.assign(EXTRAS, {
  wine:{nm:'葡萄酒',e:'🍷',price:20,merchantOnly:true},
  white_wine:{nm:'白葡萄酒',e:'🥂',price:20,merchantOnly:true},
  brandy:{nm:'白蘭地',e:'🥃',price:28,merchantOnly:true},
  champagne:{nm:'香檳',e:'🍾',price:32,merchantOnly:true},
  nutmeg:{nm:'肉豆蔻',e:'🌰',price:12,merchantOnly:true},
  cinnamon:{nm:'肉桂',e:'🟤',price:10,merchantOnly:true},
  bay_leaf:{nm:'月桂葉',e:'🍃',price:8,merchantOnly:true},
  black_pepper:{nm:'黑胡椒',e:'⚫',price:10,merchantOnly:true},
  ginger:{nm:'薑',e:'🫚',price:6,merchantOnly:true},
  pineapple:{nm:'鳳梨',e:'🍍',price:14,merchantOnly:true},
  ex_tomato:{nm:'番茄',e:'🍅',price:5,merchantOnly:true},
  citrus:{nm:'柑橘',e:'🍊',price:8,merchantOnly:true},
  cocoa:{nm:'可可豆',e:'🫘',price:16,merchantOnly:true},
  coconut:{nm:'椰子',e:'🥥',price:12,merchantOnly:true},
});

/* 2) 換掉三位商人賣的東西（原本的整組覆蓋） */
if(MERCHANTS.Francis) MERCHANTS.Francis.goods=[
  {kind:'extra',k:'wine',price:20},{kind:'extra',k:'white_wine',price:20},
  {kind:'extra',k:'brandy',price:28},{kind:'extra',k:'champagne',price:32} ];
if(MERCHANTS.Pedro) MERCHANTS.Pedro.goods=[
  {kind:'extra',k:'nutmeg',price:12},{kind:'extra',k:'cinnamon',price:10},
  {kind:'extra',k:'bay_leaf',price:8},{kind:'extra',k:'black_pepper',price:10},
  {kind:'extra',k:'ginger',price:6} ];
if(MERCHANTS.Antonio) MERCHANTS.Antonio.goods=[
  {kind:'extra',k:'pineapple',price:14},{kind:'extra',k:'ex_tomato',price:5},
  {kind:'extra',k:'citrus',price:8},{kind:'extra',k:'cocoa',price:16},
  {kind:'extra',k:'coconut',price:12} ];

/* 3) 一般採購面板隱藏 merchantOnly 商品（疊加 override，不動原函式） */
if(typeof openShopBuy==='function'){
  const _origOpenShopBuy=openShopBuy;
  openShopBuy=function(){
    _origOpenShopBuy.apply(this,arguments);
    const sheet=document.getElementById('sheet'); if(!sheet) return;
    sheet.querySelectorAll('[onclick^="buyExtra("]').forEach(btn=>{
      const mm=(btn.getAttribute('onclick')||'').match(/buyExtra\('([^']+)'/);
      if(mm && EXTRAS[mm[1]] && EXTRAS[mm[1]].merchantOnly){ const row=btn.closest('.row'); if(row) row.remove(); }
    });
  };
}

/* 4) 伴侶免費：若向你的伴侶買，改走「免費拿」 */
if(typeof buyMerchantGood==='function'){
  const _origBuyMerchantGood=buyMerchantGood;
  buyMerchantGood=function(id,gi){
    if(S.partner && S.partner.id===id){ takePartnerGood(gi); return; }
    return _origBuyMerchantGood(id,gi);
  };
}
function takePartnerGood(gi){
  const p=S.partner; if(!p){ toast('還沒有伴侶'); return; }
  const g=MERCHANTS[p.id].goods[gi], qty=g.qty||1;
  if(g.kind==='seed') S.seeds[g.k]=(S.seeds[g.k]||0)+qty; else S.extras[g.k]=(S.extras[g.k]||0)+qty;
  toast(`💞 伴侶特惠・免費拿了 ${g.kind==='seed'?FARM_CROPS[g.k].nm+'種子':EXTRAS[g.k].nm}${qty>1?' ×'+qty:''}`);
  if(document.getElementById('mask').classList.contains('show')) openPartnerGoods();
  save();
}

/* 5) 伴侶搬回家後會離開港口，所以在「伴侶」面板加一個免費拿貨入口 */
function openPartnerGoods(){
  const p=S.partner; if(!p){ toast('還沒有伴侶'); return; }
  const m=MERCHANTS[p.id];
  const goods=(m.goods||[]).map((g,gi)=>{
    const nm=g.kind==='seed'?(FARM_CROPS[g.k].nm+'種子'):EXTRAS[g.k].nm;
    const e =g.kind==='seed'?((PRODUCTS[g.k]&&PRODUCTS[g.k].e)||'🌱'):EXTRAS[g.k].e;
    const qty=g.qty||1;
    return `<div class="row"><div class="e">${e}</div><div class="info"><div class="n">${nm}${qty>1?' ×'+qty:''}</div></div>
      <button class="btn sm green" onclick="takePartnerGood(${gi})">免費拿</button></div>`;
  }).join('');
  openSheet(`<div class="sheethead"><h3>🎁 ${m.nm} 的貨</h3><button class="close" onclick="openPartner()">✕</button></div>
    <div class="small" style="margin-bottom:8px">和 ${m.nm} 同居中，這些商品免費拿。</div>${goods}`);
}
if(typeof openPartner==='function'){
  const _origOpenPartner=openPartner;
  openPartner=function(){
    _origOpenPartner.apply(this,arguments);
    if(!S.partner) return;
    const m=MERCHANTS[S.partner.id];
    if(!m||!m.goods||!m.goods.length) return;
    const sheet=document.getElementById('sheet'); if(!sheet) return;
    const btn=document.createElement('button');
    btn.className='btn gold'; btn.style.cssText='width:100%;margin-top:10px';
    btn.textContent='🎁 免費拿貨（伴侶特惠）';
    btn.onclick=openPartnerGoods;
    sheet.appendChild(btn);
  };
}
/* 擺盤桌感應範圍統一調整 */
SCENES.cafe.objects.forEach(o=>{ if(o.kind==='foodtable') o.sense=3; });