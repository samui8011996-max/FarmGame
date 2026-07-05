/* ---------- maps ---------- */
const MAPS={
  farm:[
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   ".......FFFFFFFFFFFFFFFFFFFFFF",
   ".......FFFFFFFFFFFFFFFFFFFFFF",
   ".FFFF..FFFFFFFFFFFFFFFFFFFFFF",
   ".FFFF..FFFFFFF......FFFFFFFFF",
   ".FFFF.....FFFF......FFFFFFFFF",
   ".FFFF........F......FFFFFFFFF",
   ".FF..........F......FFFFFFFFF",
   ".FF..........F......FFFFFFFFF",
   ".FFFFFFFFFFFFF......FFFFFFFFF",
   ".FFFFFFFFFFFFF......FFFFFFFFF",
   ".FFFFFFFFFFFFF......FFFFFFFFF",
   "....................FFFFFFFFF",
   "....................FFFFFFFFF",
   "........FFFF........FFFFFFFFF",
   "........FFFF..........FFFFFFF",
   "..FFFF..FFFF..FFFF....FFFFFFF",
   "..FFFF..FFFF..FFFF....FFFFFFF",
   "..FFFF..FFFF..FFFF....FFFFFFF",
   "..FFFF..FFFF..FFFF....FFFFFFF",
   "..FFFF........FFFF....FFFFFFF",
   "..FFFF........FFFF....FFFFFFF",
   "......................FFFFFFF",
   "......................FFFFFFF",
   "......................FFFFFFF",
   ".............................",
  ],
  office:[
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF.F",
   "FF............FFFFFFFFFFFF.....FFFF...F",
   "FF............FFFFFFFFFFFF......FF....F",
   "FF............FFFFFFFFFF..............F",
   "FF...............................FFF..F",
   "F................................FFF..F",
   "F.......................FFF......FFF..F",
   "F..................FFFFFFFFFFFFF...F..F",
   "F................FFFFFFFFFFFFFFF...FF.F",
   "FFFFFFFFFFFFF....FFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFF....FFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
  ],
  cafe:[
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "F................FFF.FFFFF.FFFFFF.FFFFF",
   "FFFFF.FFFFFFFFFFFFFF.FFFFF.FFFFFF.FFFFF",
   "FFFFF.FFFFFFFFFFFFFF.FFFFF.FFFFFF.FFF.F",
   "FFFFF.FFFFFFFFFFFFFF..................F",
   "F.....................................F",
   "F.....................................F",
   "F.....................................F",
   "F.....................................F",
   "F.....................................F",
   "F.....................................F",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
  ],
  kitchen:[
   "FFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFF",
   "F................FFF",
   "F................FFF",
   "F.........FFFFFFFFFF",
   "F.........FFFFFFFFFF",
   "F.........FFFFFFFFFF",
   "F.........FFFFFFFFFF",
   "FFF................F",
   "FFF...............FF",
   "FFF.FFFFFFFFFFFFFFFF",
   "FFF.FFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFF",
  ],
  shop:[
   "FFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFF",
   "FFFF..........FFFFFF",
   "FFFF...FFFF...FFFFFF",
   "FFFFFF.FFFF.....FFFF",
   "FFFFFF..........FFFF",
   "FFFF............FFFF",
   "F..................F",
   "F..................F",
   "F..................F",
   "F..................F",
   "FFFFFFFFFFFFFFFFFFFF",
  ],
  port:[
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF..............FF...",
   "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF..............FF...",
   "...............FF......FF......FF......FF..............FF...",
   "...............FF......FF......FF......FF...................",
   "...............FF.....FFF......FF......FF...................",
   "...............FF.....FFF......FF......FF......FFFFFFFFFFFFF",
   "...............FF......FF......FF......FF.....FFFFFFFFFFFFFF",
   "...............FF......FF......FF......FF.....FFFFFFFFFFFFFF",
   "...............FFFF..FFFFFF..FFFFFF..FFFFFF..FFFFFFFFFFFFFFF",
   "FFFFFFFFFFFF...FFFF..FFFFFF..FFFFFF..FFFFFF..FFFFFFFFFFFFFFF",
   "FFFFFFFFFFFF...FFFF..FFFFFF..FFFFFF..FFFFFF..FFFFFFFFFFFFFFF",
   "FFFFFFFFFFFF...FFFF..FFFFFF..FFFFFF..FFFFFF..FFFFFFFFFFFFFFF",
   "FFFFFFFFFFFF...................................FFFFFFFFFFFFF",
   "FFFFFFFFFFFF...................................FFFFFFFFFFFFF",
   "............................................................",
  ],
};
// normalize all map rows to grid arrays
const GRID={};
for(const k in MAPS){ GRID[k]=MAPS[k].map(r=>r.padEnd(MAPS[k][0].length,r[0]).split('')); }

/* ---------- scene definitions (objects + spawn + camera mode) ---------- */
const SCENES={
  farm:{title:'農牧地', big:true, spawn:{x:10,y:14}, objects:[
    {id:'appletree',x:18,y:5,e:'🍎',nm:'蘋果樹',kind:'appletree',hide:true},
    {id:'dairy',x:8,y:6,e:'🧀',nm:'乳品加工處',kind:'dairy',sense:2.5,hide:true},
  ]},
office:{title:'辦公室', big:false, spawn:{x:12,y:10}, objects:[
    {id:'era',x:18,y:14,e:'📅',nm:'時代進程',kind:'eraBoard',hide:true},
    {id:'crib',x:22,y:8,e:'',nm:'阿爾弗雷德',kind:'child',npc:true,avatar:'🧒',hide:true},
    {id:'wardrobe',x:12,y:6,e:'🧥',nm:'衣櫃',kind:'wardrobe',hide:true},
    {id:'cat',x:37,y:7,e:'🐱',nm:'妖精桑',kind:'npc',npc:true,avatar:'🐱',hide:true,
      lines:['（在曬太陽）','今天也辛苦了。','摸摸我（並不會回血）。']},
    {id:'chair',x:4,y:15,e:'🪑',nm:'書桌',kind:'chair',hide:true},
  ]},
  cafe:{title:'餐廳（前台）', big:true, spawn:{x:2,y:7}, objects:[
    {id:'counter',x:16,y:6,e:'☕',nm:'吧檯（泡咖啡）',kind:'brew',hide:true},
    {id:'menu',x:10,y:8,e:'📋',nm:'上架菜單',kind:'menu',hide:true},
    {id:'till',x:13,y:6,e:'💰',nm:'收銀台',kind:'till',hide:true},
    {id:'table1',x:11,y:10,e:'🍱',nm:'擺盤桌',kind:'foodtable',tbl:'table1',hide:true},
    {id:'table2',x:16,y:10,e:'🍱',nm:'擺盤桌',kind:'foodtable',tbl:'table2',hide:true},
    {id:'table3',x:22,y:9,e:'🍱',nm:'擺盤桌',kind:'foodtable',tbl:'table3',hide:true},
    {id:'table4',x:24,y:9,e:'🍱',nm:'擺盤桌',kind:'foodtable',tbl:'table4',hide:true},
    {id:'table5',x:28,y:9,e:'🍱',nm:'擺盤桌',kind:'foodtable',tbl:'table5',hide:true},
    {id:'table6',x:31,y:9,e:'🍱',nm:'擺盤桌',kind:'foodtable',tbl:'table6',hide:true},
    {id:'table7',x:35,y:9,e:'🍱',nm:'擺盤桌',kind:'foodtable',tbl:'table7',hide:true},
    
  ]},
  
  kitchen:{title:'廚房', big:true, spawn:{x:3,y:8}, objects:[
    {id:'board',x:13,y:9,e:'🔪',nm:'備料台（放食材）',kind:'cut',hide:true},
    {id:'table',x:18,y:7,e:'🫓',nm:'桌子（揉/拌）',kind:'knead',hide:true},
    {id:'oven',x:9,y:6,e:'🔥',nm:'烤箱',kind:'oven',hide:true},
    {id:'recipepick',x:13,y:6,e:'📖',nm:'食譜本（選甜點）',kind:'pickrecipe',hide:true},
    
  ]},
  shop:{title:'商店', big:false, spawn:{x:9,y:12}, objects:[
    {x:8,y:7,e:'🌷',nm:'亞瑟',kind:'npc',npc:true,hide:true,sense:1,lines:['這些花值這麼多錢嗎...']},
    {x:4,y:7,e:'🌷',nm:'亞瑟',kind:'npc',npc:true,hide:true,sense:1,lines:['這些是藍瓷?好美，但價格不便宜']},
  ]},

    port:{title:'港口', big:true, spawn:{x:9,y:14}, objects:[
  {x:16,y:19,e:'🌷',nm:'亞瑟',kind:'npc',npc:true,hide:true,sense:1,lines:['這些是藍瓷?好美，但價格不便宜']},
  
  ]},
};

const FARM_ZONES = [
  {kind:'chicken', nm:'雞舍', x1:21, y1:16, x2:30, y2:27},
  {kind:'pig', nm:'豬圈', x1:19, y1:5, x2:30, y2:16},
  {kind:'cow', nm:'牛棚', x1:-1, y1:3, x2:14, y2:14},
  {kind:'plot', nm:'農田', x1:14, y1:18, x2:17, y2:23},
  {kind:'plot', nm:'農田', x1:8, y1:16, x2:11, y2:21},
  {kind:'plot', nm:'農田', x1:2, y1:18, x2:5, y2:23},
];
function farmZoneAt(x,y){
  const ix=Math.round(x),iy=Math.round(y);
  return FARM_ZONES.find(z=>ix>=z.x1&&ix<=z.x2&&iy>=z.y1&&iy<=z.y2)||null;
}
/* ---------- game state ---------- */
let S=null, user=null, curScene='farm';
const player={x:15,y:22,facing:'up'};
const SPEED=0.13;
const SENSE=2;   // 互動感應範圍（格），要更大就調大、太貪心就改 1
const held={up:false,down:false,left:false,right:false};
const DIR={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
const cam={x:0,y:0};
let animFrame=0, animTimer=0, walkStep=0;
const WALK_CYCLE=[0,1,0,2];   // 收步→跨左→收步→跨右（對應上面的第幾列）
const WALK_SPEED=7;           // 每幾個畫面換一次姿勢，數字越小走越快
let sitting=false;
const CHAIR={scene:'office', x:4, y:14};   // 椅子那一格（座標等下再調）
let sleeping=false;
const BED={scene:'office', x1:14, y1:7, x2:19, y2:10};   // 床的觸發範圍（矩形），數字自己調
const DOCK={scene:'port', x1:0, y1:6, x2:14, y2:10};   // 港口登船區（矩形）
const SIT_POS={ x:120, y:166, w:64, h:64 };   // 坐姿圖固定畫在這（地圖像素），對不準就改 x/y
function blankState(){
  const plots=[];for(let i=0;i<4;i++)plots.push(null);
  return {
    day:1, era:17, startTs:Date.now(), lastTick:Date.now(),
    cash:50000, hp:20, maxHp:20, toxins:0, cookBy:'self', plots, fert:0, feed:0, seeds:{}, crops:{},
    animals:{chicken:[{born:Date.now(),fed:Date.now(),lastProd:Date.now(),feedCount:0}],cow:[],pig:[]},
    store:{}, extras:{}, market:{}, marketDay:0, feedBowl:{},
    port:{merchants:[], relations:{}, lastTs:0},
    partner:null,
    wardrobe:{owned:['default'],wearing:'default'},
    employee:null,
    cafe:{staff:false,till:0,menu:[],goods:{},lastRun:Date.now()},
    ledger:[], log:[], curRecipe:'strawberry_tart', decor:blankDecor(), child:null, childHired:false,
    kitchenPickups:[],
  };
}
const CELL=2;   // 一格作物 = 2×2 tile = 32×32 像素.


function cellKeyAt(ix,iy){
  const ok=FARM_ZONES.some(z=>z.kind==='plot'&&ix>=z.x1&&ix<=z.x2&&iy>=z.y1&&iy<=z.y2);
  if(!ok) return null;
  const cx=Math.floor(ix/CELL)*CELL, cy=Math.floor(iy/CELL)*CELL;
  return cx+','+cy;
}
function farmTileHere(){ return cellKeyAt(Math.round(player.x),Math.round(player.y)); }
function farmCellNear(){
  let k=farmTileHere(); if(k) return k;                          // 先看站立格
  const d=DIR[player.facing], bx=Math.round(player.x), by=Math.round(player.y);
  for(let i=1;i<=SENSE;i++){ const kk=cellKeyAt(bx+d.x*i, by+d.y*i); if(kk) return kk; }
  return null;                                                    // 面前 SENSE 格內找農格
}
function isCropTile(ix,iy){ return false; }
function cropAt(cx,cy){ return curScene==='farm' && isCropTile(Math.floor(cx),Math.floor(cy)); }
function openTileFarm(key){
  const c=S.crops[key];
  if(!c){
    let btns='';
    for(const id in FARM_CROPS){ 
    if(cropEra(id) > S.era) continue;  // ← 加這行
    const d=FARM_CROPS[id];
    const e=prodIcon(id,24); const have=S.seeds[id]||0;

      btns+=`<button class="btn green ${have<=0?'dis':''}" style="width:100%;margin-bottom:6px" onclick="plantTile('${key}','${id}')">${e} 播種${d.nm}（種子 ${have}）</button>`; }
    btns+=`<button class="btn ghost" style="width:100%" onclick="closeSheet();goScene('shop')">🏪 去商店買種子</button>`;
    openSheet(`<div class="sheethead"><h3>🟫 空地</h3><button class="close" onclick="closeSheet()">✕</button></div>
      <div class="small" style="margin-bottom:10px">選要種的作物（需要種子）。</div>${btns}`);
    return;
  }
  const def=FARM_CROPS[c.crop], last=def.stages.length-1, e=prodIcon(c.crop,24);
  if(c.stage>=last){
    openSheet(`<div class="sheethead"><h3>${e} ${def.nm}（可收成）</h3><button class="close" onclick="closeSheet()">✕</button></div>
      <button class="btn green" style="width:100%" onclick="harvestTile('${key}')">🧺 收成</button>`);
  }else{
    const left = c.watered ? `再 ${fmtSec(def.stageMs-(Date.now()-c.t))} 進下一階段` : '需要澆水才會成長';
    openSheet(`<div class="sheethead"><h3>${e} ${def.nm}・${def.stages[c.stage]}</h3><button class="close" onclick="closeSheet()">✕</button></div>
      <div class="small" style="margin-bottom:12px">階段 ${c.stage+1}/${def.stages.length}・${left}</div>
      <button class="btn green ${c.watered?'dis':''}" style="width:100%" onclick="waterTile('${key}')">💧 澆水</button>`);
  }
}
function plantTile(key,crop){
  if((S.seeds[crop]||0)<=0){ toast(`沒有${FARM_CROPS[crop].nm}種子，去商店買`); return; }
  S.seeds[crop]--;
  const c={crop,stage:0,watered:false,t:Date.now()};
  if(crop==='tulip') c.tulipColor=rollTulipColor();   // 種下就決定顏色，整株按該色顯示
  S.crops[key]=c;
  closeSheet(); toast(`已播種${FARM_CROPS[crop].nm}，記得澆水`); save();
}
function waterTile(key){ const c=S.crops[key]; if(!c)return; c.watered=true; c.t=Date.now(); closeSheet(); toast('💧 澆好水了'); save(); }
function harvestTile(key){ const c=S.crops[key]; const def=FARM_CROPS[c.crop]; const y=def.yield; addStore(c.crop,y); delete S.crops[key]; closeSheet(); toast(`🧺 收成 ${y} 個${def.nm}`); save(); }
function save(){ if(user) localStorage.setItem(NS+user,JSON.stringify(S)); }
function load(u){ const r=localStorage.getItem(NS+u); return r?JSON.parse(r):null; }

/* ---------- helpers ---------- */
function fmt(n){return Math.round(n).toLocaleString();}
function spend(n,l){S.cash-=n;S.ledger.unshift({l,a:-n});if(S.ledger.length>60)S.ledger.pop();}
function earn(n,l){S.cash+=n;S.ledger.unshift({l,a:n});if(S.ledger.length>60)S.ledger.pop();}
function addLog(m){S.log.unshift(m);if(S.log.length>30)S.log.pop();}
function addStore(k,n){S.store[k]=Math.min(STORE_CAP,(S.store[k]||0)+n);}
function volRange(v){return v==='big'?[.18,.55]:v==='mid'?[.13,.45]:[.08,.35];}
function jitter(b,p){return Math.round((b*(1+(Math.random()*2-1)*p))*10)/10;}
function seedKey(c,q){return c+'_'+q;}
function seedCount(c,q){return S.seeds[seedKey(c,q)]||0;}

/* ---------- market: mean reversion + shocks ---------- */
function rollMarket(){
  for(const k in PRODUCTS){
    const p=PRODUCTS[k];const m=S.market[k]||{price:p.base};
    const[sa,ba]=volRange(p.volat);
    let price=m.price+(p.base-m.price)*0.45;
    price+=price*(Math.random()*2-1)*sa*0.5;
    if(Math.random()<0.10){const d=Math.random()<0.5?-1:1;price=price*(1+d*(ba*0.5+Math.random()*ba*0.5));}
    price=Math.max(p.base*0.35,price);
    m.price=Math.round(price*10)/10;S.market[k]=m;
  }
  S.marketDay=S.day;
}
function priceOf(k){return S.market[k]?S.market[k].price:PRODUCTS[k].base;}
function priceDir(k){const m=S.market[k];if(!m)return 0;return m.price>PRODUCTS[k].base*1.05?1:m.price<PRODUCTS[k].base*0.95?-1:0;}

/* ---------- tick: time progression ---------- */
function tick(){
  const now=Date.now();
  if(S.hp<S.maxHp && now-lastRegen>=HP_REGEN_MS){ lastRegen=now; S.hp=Math.min(S.maxHp,S.hp+1); }
  const newDay=Math.floor((now-S.startTs)/DAY)+1;
  if(newDay>S.day || !S.market.strawberry){ S.day=Math.max(S.day,newDay); if(S.marketDay!==S.day) rollMarket(); }
  // employee wages
  if(S.employee){
    while(now-S.employee.lastPaidTs>=30*DAY){
      if(S.cash>=300){spend(300,'雇員月薪');S.employee.lastPaidTs+=30*DAY;addLog('💸 付雇員月薪 $300');}
      else{addLog('👷 沒錢付月薪，雇員離職');S.employee=null;break;}
    }
  }
  const emp=!!S.employee || (isPartnerWorking()&&S.partner.job==='farm') || S.childHired;
  // crops（每格、要澆水才長）
 for(const key in S.crops){
    const c=S.crops[key]; const def=FARM_CROPS[c.crop]; if(!def){delete S.crops[key];continue;}
    const last=def.stages.length-1;
    if(emp) c.watered=true;
    if(c.stage<last && c.watered && now-c.t>=def.stageMs){ c.stage++; if(!emp)c.watered=false; c.t=now; }
    if(emp && c.stage===last){ if(c.crop==='tulip'){ S.tulips=S.tulips||{}; const _col=c.tulipColor||rollTulipColor(); S.tulips[_col]=(S.tulips[_col]||0)+1; } else { addStore(c.crop,Math.round(def.yield*0.6)); } delete S.crops[key]; }
  }
  // animals
  for(const type in S.animals){
    const def=ANIMALS[type];
    S.animals[type]=S.animals[type].filter(a=>{
      if(emp)a.fed=now;
      if(!emp && now-(a.fed||a.born)>2*DAY){ addLog(`☠️ 一隻${def.nm}太久沒餵死了`); return false; }
      if(def.mode==='produce'){
        if(type==='chicken' && a.species==='turkey'){ return true; }   // 火雞不產蛋
        if(type==='chicken' && def.growFeed && (a.feedCount||0)<def.growFeed){ return true; }   // 還是小雞→不生蛋
        if(type==='cow' && def.growFeed && (a.feedCount||0)<def.growFeed){ return true; }       // 還是小牛→不擠奶
        if(type==='chicken' && !emp && now-(a.fed||a.born) > EGG_HUNGER_MS){ a.lastProd=now; return true; }   // 太久沒餵→停產蛋
        const n=Math.floor((now-(a.lastProd||a.born))/def.cycle);
        if(n>0){
          a.lastProd=(a.lastProd||a.born)+n*def.cycle;
          if(type==='chicken'){
            const room=eggCap()-eggTotalPending();        // 蛋箱還能裝幾顆（滿了 room=0 → 不再生蛋）
            const add=Math.max(0,Math.min(n,room));
            if(add>0) a.pending=(a.pending||0)+add;
            if(emp && a.pending>0){ addStore('egg',Math.floor(a.pending*0.6)); a.pending=0; }
          }else{
            a.pending=(a.pending||0)+n;
            if(emp){const g=Math.floor(a.pending*0.6);if(g>0)addStore(def.prod,g);a.pending=0;}
          }
        }
      }else if(type==='pig' && def.growFeed && (a.feedCount||0)<def.growFeed){ /* 還是小豬→先養大 */ }
      else if(now-a.born>=def.cycle)a.fat=true;
      return true;
    });
  }
if(S.child && !S.child.crying && now-S.child.lastCare>CHILD_CRY_MS) S.child.crying=true;
  if(isPartnerWorking() && S.partner.job==='bake'){ const PB=20000; while(now-(S.partner.lastBake||now)>=PB){ S.partner.lastBake=(S.partner.lastBake||now)+PB; if(RECIPES[S.curRecipe]) S.cafe.goods[S.curRecipe]=(S.cafe.goods[S.curRecipe]||0)+5; } }
  if(isPartnerWorking() && S.partner.job==='rich'){ const RB=30000; while(now-(S.partner.lastBake||now)>=RB){ S.partner.lastBake=(S.partner.lastBake||now)+RB; earn(40,'伴侶的零用金'); } }
  runCafe(now);
  S.lastTick=now;
}
function baseYield(p){let y=3;if(p.qual==='good')y=Math.round(y*1.5);if(p.qual==='bad')y=Math.round(y*0.5);if(p.fert)y=Math.round(y*1.5);return Math.max(1,y);}
function resetPlot(p){p.crop=null;p.stage='empty';p.fert=false;p.qual=null;p.watered=false;}
function runCafe(now){
  if(!S.cafe.staff||S.cafe.menu.length===0){S.cafe.lastRun=now;return;}
  let days=Math.min(7,Math.floor((now-(S.cafe.lastRun||now))/DAY));
 if(days<=0)return;
  const cap=10+S.cafe.menu.length*6+decorCap()+partnerBuff('cafe')*15+cafeMateCap();
  for(let d=0;d<days;d++){
    let total=0;for(const k of S.cafe.menu)total+=(S.cafe.goods[k]||0);
    if(total<=0)continue;
    let toSell=Math.min(total,Math.round(cap*(0.6+Math.random()*0.4)));let rev=0;
    for(const k of [...S.cafe.menu].sort(()=>Math.random()-0.5)){
      if(toSell<=0)break;const av=S.cafe.goods[k]||0;const s=Math.min(av,Math.ceil(toSell/S.cafe.menu.length)+2,toSell);
      rev+=s*RECIPES[k].price;S.cafe.goods[k]-=s;toSell-=s;
    }
    rev-=20;if(rev<0)rev=0;S.cafe.till+=rev;
  }
  S.cafe.lastRun=(S.cafe.lastRun||now)+days*DAY;
}
function netWorth(){
  let n=S.cash+(S.cafe.till||0);
  for(const k in S.store)n+=(S.store[k]||0)*priceOf(k);
  for(const k in S.cafe.goods)n+=(S.cafe.goods[k]||0)*RECIPES[k].price;
  for(const t in S.animals)n+=S.animals[t].length*ANIMALS[t].cub;
  n+=S.fert*6+S.feed*1;
  return n;
}

/* ---------- engine: scene accessors ---------- */
function grid(){return GRID[curScene];}
function sceneDef(){return SCENES[curScene];}
function mapCols(){return grid()[0].length;}
function mapRows(){return grid().length;}
function tileAt(x,y){const g=grid();if(x<0||y<0||x>=mapCols()||y>=mapRows())return g===GRID.farm?'F':'W';return g[y][x];}
function blocked(ch){return ch==='F'||ch==='W'||ch==='B'||ch==='C'||ch==='T'||ch==='S'||ch==='A'||ch==='R'&&false;}
function walkable(tx,ty){
  const ix=Math.floor(tx),iy=Math.floor(ty);
  if(blocked(tileAt(ix,iy)))return false;
  for(const o of sceneDef().objects) if(ix===o.x&&iy===o.y) return false;
  return true;
}
function facingObject(){
  const bx=Math.round(player.x), by=Math.round(player.y), d=DIR[player.facing];
  let best=null, bestScore=Infinity;
  for(const o of sceneDef().objects){
    const dx=o.x-bx, dy=o.y-by;
    const reach=(o.sense!=null)?o.sense:SENSE;                  // 物件可自帶範圍，沒寫就用全域
    if(Math.max(Math.abs(dx),Math.abs(dy))>reach) continue;     // 在各自範圍內
    const align=dx*d.x+dy*d.y;                                   // >0 = 在面前方向
    const score=(Math.abs(dx)+Math.abs(dy))-align*0.6;           // 近的、面前的優先
    if(score<bestScore){ bestScore=score; best=o; }
  }
  return best;
}
function updateCamera(){
  let cx=player.x-VIEW_COLS/2+0.5, cy=player.y-VIEW_ROWS/2+0.5;
  cam.x=Math.max(0,Math.min(cx,mapCols()-VIEW_COLS));
  cam.y=Math.max(0,Math.min(cy,mapRows()-VIEW_ROWS));
}

/* ---------- input ---------- */
function press(d,ev){if(ev)ev.preventDefault();held[d]=true;player.facing=d;}
function release(d){held[d]=false;}
document.addEventListener('keydown',e=>{
  const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
  if(m[e.key]){held[m[e.key]]=true;player.facing=m[e.key];e.preventDefault();}
  if(e.key===' '||e.key==='Enter'){ if(curScene==='fishing'){held.rod=true;} else {interact();} e.preventDefault(); }
});
document.addEventListener('keyup',e=>{
  const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
  if(m[e.key])held[m[e.key]]=false;
  if(e.key===' '||e.key==='Enter') held.rod=false;
});

/* ---------- kitchen prep state (per-session) ---------- */
const prep={slots:{},knead:0,inOven:false,ovenStart:0};
function curRecipe(){return RECIPES[S.curRecipe];}
function ingNm(k){ return PRODUCTS[k]?PRODUCTS[k].nm:(FARM_CROPS[k]?FARM_CROPS[k].nm:(EXTRAS[k]?EXTRAS[k].nm:k)); }
function ingE(k){ return (PRODUCTS[k]&&PRODUCTS[k].e)||(EXTRAS[k]&&EXTRAS[k].e)||'🥣'; }
function prepReady(){ const need=curRecipe().ingredients||{}; for(const k in need){ if((prep.slots[k]||0)<need[k]) return false; } return true; }
function slotsUsed(){ return Object.keys(prep.slots).filter(k=>prep.slots[k]>0).length; }
function kStep(){ const r=curRecipe(); if(!prepReady())return 0; if(prep.knead<(r.knead??4))return 1; return 2; }

/* ---------- interact dispatch ---------- */
let dlgNpc=null, dlgIdx=0;
function interact(ev){
  if(ev)ev.preventDefault();
  // 坐在書桌時：互動鍵 = 打開桌面選單（看帳本／雇用）
  if(sitting){ openDeskMenu(); return; }
  if(!sitting && curScene===CHAIR.scene && Math.round(player.x)===CHAIR.x && Math.round(player.y)===CHAIR.y){ askSit(); return; }
  if(!sleeping && curScene===BED.scene && Math.round(player.x)>=BED.x1 && Math.round(player.x)<=BED.x2 && Math.round(player.y)>=BED.y1 && Math.round(player.y)<=BED.y2){ askSleep(); return; }
 if(curScene===DOCK.scene && S.era>=18 && Math.round(player.x)>=DOCK.x1 && Math.round(player.x)<=DOCK.x2 && Math.round(player.y)>=DOCK.y1 && Math.round(player.y)<=DOCK.y2){ /* 上船 */ askSail(); return; }
  const o=facingObject();
  if(!o){
    if(curScene==='farm'){
      const fx=Math.round(player.x)+DIR[player.facing].x, fy=Math.round(player.y)+DIR[player.facing].y;
      const front=cellKeyAt(fx,fy), here=farmTileHere();
      const onTile=(front&&S.crops[front])?front:(here&&!S.crops[here])?here:(front||null);
      if(onTile){ openTileFarm(onTile); return; }
      const zone=farmZoneAt(player.x,player.y);
      if(zone && zone.kind!=='plot'){ openAnimals(zone.kind); return; }
    }
    toast('面前沒有可互動的東西'); return;
  }
  switch(o.kind){
    case 'npc': if(o.lines){dlgIdx=(dlgIdx+1)%o.lines.length;showDlg(o);} return;
    case 'farm': return openFarm(o.plotIdx);
    case 'animals': return openAnimals(o.atype);
    case 'ledger': return openLedger();
    case 'employee': return openEmployee();
    case 'menu': return openMenu();
    case 'eraBoard': return openEra();
    case 'child': return openChild();
    case 'merchant': return openMerchant(o.mid);
    case 'farmhand': return openFarmhand();
    case 'partner': return openPartner();
    case 'wardrobe': return openWardrobe();
    case 'appletree': return shakeAppleTree();
    case 'dairy': return openDairy();
    case 'till': return collectTill();
    case 'brew': return toast('☕ （試作）泡咖啡：之後接咖啡商品');
    case 'foodtable': return openFoodTable(o.tbl);
    case 'shopBuy': return openShopBuy();
    case 'shopSell': return openShopSell();
    case 'pickrecipe': return openPickRecipe();
    case 'cut': return kCut();
    case 'knead': return kKnead();
    case 'oven': return kOven();
    case 'gotoShop': return goScene('shop');
    case 'boatSail': return askSail();
    case 'gotoKitchen': return goScene('kitchen');
    case 'gotoCafe': return goScene('cafe');
    case 'gotoFarm': return goScene('farm');
    case 'wardrobe': return openWardrobe();
    case 'chair': return askSit();
  }
}
function goCafeDoor(x,y){ goScene('cafe'); player.x=x; player.y=y; player.facing='up'; return true; }
/* ---------- FARM actions ---------- */
let sheetFarmIdx=null;
function openFarm(i){
  sheetFarmIdx=i;const p=S.plots[i];
  if(!p||p.stage==='empty'||!p.stage){
    const owned=Object.keys(S.seeds).filter(k=>S.seeds[k]>0);
    let body= owned.length? owned.map(k=>{const[c,q]=k.split('_');const d=CROPS[c];
      return `<div class="menucard" style="display:flex;align-items:center;gap:8px"><div style="font-size:24px">${d.e}</div>
        <div style="flex:1;font-weight:700">${d.nm}・${q==='good'?'優':q==='bad'?'劣':'普'} <span class="small">×${S.seeds[k]}</span></div>
        <button class="btn sm green" onclick="plant(${i},'${c}','${q}')">種</button></div>`;}).join('')
      : `<div class="empty-note">背包沒有種子。</div><button class="btn" style="width:100%" onclick="closeSheet();goScene('shop')">去商店買種子</button>`;
    openSheet(`<div class="sheethead"><h3>🌱 農田（空）</h3><button class="close" onclick="closeSheet()">✕</button></div>
      <div class="small" style="margin-bottom:10px">選背包種子播種。</div>${body}`);
  }else if(p.stage==='growing'){
    const left=CROPS[p.crop].grow-(Date.now()-p.planted);
    openSheet(`<div class="sheethead"><h3>${CROPS[p.crop].e} ${CROPS[p.crop].nm}（生長中）</h3><button class="close" onclick="closeSheet()">✕</button></div>
      <div class="small" style="margin-bottom:12px">還有 ${timeLeft(left)} 成熟。${p.watered?'已澆水。':'未澆水。'}${p.fert?'已施肥。':''}</div>
      <button class="btn green ${p.watered?'dis':''}" style="width:100%;margin-bottom:8px" onclick="water(${i})">💧 澆水</button>
      <button class="btn gold ${p.fert||S.fert<=0?'dis':''}" style="width:100%" onclick="fertilize(${i})">💩 施肥（庫存 ${S.fert}）</button>`);
  }else{
    openSheet(`<div class="sheethead"><h3>${CROPS[p.crop].e} ${CROPS[p.crop].nm}（可收成）</h3><button class="close" onclick="closeSheet()">✕</button></div>
      <button class="btn green" style="width:100%" onclick="harvest(${i})">🧺 收成</button>`);
  }
}
function plant(i,c,q){ if(seedCount(c,q)<=0){toast('沒有種子');return;} S.seeds[seedKey(c,q)]--;
  S.plots[i]={crop:c,stage:'growing',planted:Date.now(),qual:q,fert:false,watered:false};closeSheet();toast(`種下${CROPS[c].nm}`);save();}
function water(i){S.plots[i].watered=true;closeSheet();toast('💧 澆水好了');save();}
function fertilize(i){if(S.fert<=0)return;S.fert--;S.plots[i].fert=true;closeSheet();toast('💩 施肥 +50%');save();}
function harvest(i){const p=S.plots[i];const y=baseYield(p);addStore(p.crop,y);resetPlot(p);closeSheet();toast(`🧺 收成 ${y} 個${CROPS[p.crop].nm}`);save();}

/* ---------- 體重／產肉系統 ---------- */
const MEAT_SPEC={
  turkey:{ feedKg:0.6, maxKg:9,   baseKg:4,  meatPerKg:0.8,  prod:'turkey_meat' },
  pig:   { feedKg:4,   maxKg:60,  baseKg:20, meatPerKg:0.25, prod:'pork' },
  cow:   { feedKg:6,   maxKg:120, baseKg:50, meatPerKg:0.12, prod:'beef' },
};
function meatSpecFor(type,a){
  if(type==='pig') return MEAT_SPEC.pig;
  if(type==='cow') return MEAT_SPEC.cow;
  if(type==='chicken' && a && a.species==='turkey') return MEAT_SPEC.turkey;
  return null;   // 一般母雞→null（產肉固定、不顯示體重）
}
function meatYield(spec,w){ return Math.max(1, Math.round((w||spec.baseKg)*spec.meatPerKg)); }
function gainWeight(type,a){ const s=meatSpecFor(type,a); if(!s)return; a.weight=Math.min(s.maxKg,(a.weight||s.baseKg)+s.feedKg); }
function weightTxt(type,a){ const s=meatSpecFor(type,a); if(!s)return ''; const w=(a.weight||s.baseKg); return `・${w.toFixed(1)}/${s.maxKg}公斤${w>=s.maxKg?'(已肥)':''}`; }
/* ---------- ANIMALS ---------- */
function openAnimals(type){
  const def=ANIMALS[type];const list=S.animals[type];
  let rows = list.length? list.map((a,idx)=>{
    const sinceFed=Date.now()-(a.fed||a.born);const hrs=Math.floor(sinceFed/HOUR);
    if(type==='chicken'){
      const turkey=a.species==='turkey', adult=isHen(a);
      const e=animalIcon('chicken',a,28), nm=turkey?'火雞':'雞';
      const wt = (turkey&&adult) ? weightTxt('chicken',a) : '';
      let act = turkey
        ? (adult?`<button class="btn sm gold" onclick="confirmKillBird(${idx})">宰殺</button>`:`<span class="small">養大中</span>`)
        : (adult?`<button class="btn sm gold" onclick="confirmKillBird(${idx})">宰殺</button>`:`<span class="small">小雞養大中</span>`);
      return `<div class="row"><div class="e">${e}</div>
        <div class="info"><div class="n">${nm} #${idx+1}</div><div class="d">距餵食 ${hrs}時${wt}${S.employee?'（雇員顧）':''}</div></div>
        ${act}</div>`;
    }
    if(type==='pig'){
      const grown=isGrownPig(a), e=animalIcon('pig',a,28);
      const wt = grown ? weightTxt('pig',a) : '';
      let act = !grown ? `<span class="small">小豬養大中</span>`
        : `<button class="btn sm gold" onclick="confirmSellPig(${idx})">宰殺</button>`;
      return `<div class="row"><div class="e">${e}</div>
        <div class="info"><div class="n">${grown?'豬':'小豬'} #${idx+1}</div><div class="d">距餵食 ${hrs}時${wt}${S.employee?'（雇員顧）':''}</div></div>
        ${act}</div>`;
    }
    if(type==='cow'){
      const grown=isGrownCow(a), e=animalIcon('cow',a,28);
      const wt = grown ? weightTxt('cow',a) : '';
      let act = !grown ? `<span class="small">小牛養大中</span>`
        : `<button class="btn sm ${a.pending?'green':'dis'}" onclick="collect('cow',${idx})">擠奶${a.pending?'('+a.pending+')':''}</button> <button class="btn sm gold" onclick="confirmSellCow(${idx})">宰殺</button>`;
      return `<div class="row"><div class="e">${e}</div>
        <div class="info"><div class="n">${grown?'牛':'小牛'} #${idx+1}</div><div class="d">距餵食 ${hrs}時${wt}${S.employee?'（雇員顧）':''}</div></div>
        ${act}</div>`;
    }
    let act = def.mode==='produce'
      ? `<button class="btn sm ${a.pending?'green':'dis'}" onclick="collect('${type}',${idx})">${def.prod==='egg'?'取蛋':'擠奶'}${a.pending?'('+a.pending+')':''}</button>`
      : (a.fat?`<button class="btn sm gold" onclick="confirmSellPig(${idx})">賣豬</button>`:`<span class="small">養肥中</span>`);
    return `<div class="row"><div class="e">${animalIcon(type,null,28)}</div>
      <div class="info"><div class="n">${def.nm} #${idx+1}</div><div class="d">距餵食 ${hrs}時${S.employee?'（雇員顧）':''}</div></div>
      ${act}</div>`;
  }).join('') : `<div class="empty-note">還沒有${def.nm}，去商店買幼崽。</div>`;
const feedAllBtn = list.length
    ? `<button class="btn green ${S.feed<def.feed?'dis':''}" style="width:100%;margin-bottom:10px" onclick="feedAll('${type}')">🌾 餵食全部${def.nm}（每隻 ${def.feed} 份・庫存 ${S.feed}）</button>`
    : '';
  let eggBtns='';
  if(type==='chicken'){
    const total=eggTotalPending(), boxes=eggBoxes();
    eggBtns=`<button class="btn gold ${total>0?'':'dis'}" style="width:100%;margin-bottom:10px" onclick="collectTopEggBox()">🥚 取蛋（還有 ${boxes} 箱・共 ${total} 顆）</button>`;
  }
  openSheet(`<div class="sheethead"><h3>${animalIcon(type,null,24)} ${def.nm}（${list.length}/10）</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:8px">飼料庫存 ${S.feed} 份。幼崽/飼料到商店買。${type==='chicken'?`<br>🥚 蛋箱 ${eggTotalPending()}/${eggCap()}・使用 ${eggBoxes()}/${EGG_BOX_COUNT} 箱（滿了暫停產蛋，收蛋後再生）`:''}</div>${feedAllBtn}${eggBtns}${rows}`);
}
function feedAll(type){
  const def=ANIMALS[type], list=S.animals[type]||[];
  if(!list.length){ toast(`還沒有${def.nm}`); return; }
  if(S.feed<def.feed){ toast('飼料不足'); return; }
  let fedN=0;
  for(const a of list){
    if(S.feed<def.feed) break;            // 飼料不夠→餵到這裡為止
    S.feed-=def.feed; a.fed=Date.now(); fedN++;
    if((type==='chicken'||type==='pig'||type==='cow') && def.growFeed){
      a.feedCount=(a.feedCount||0)+1;
      const turkey=type==='chicken'&&a.species==='turkey';
      if(a.feedCount===def.growFeed){
        if(type==='chicken'&&!turkey) a.lastProd=Date.now();
        if(type==='cow') a.lastProd=Date.now();
        const s=meatSpecFor(type,a); if(s) a.weight=s.baseKg;
      }else if(a.feedCount>def.growFeed){
        gainWeight(type,a);
      }
    }
  }
  if(!S.feedBowl) S.feedBowl={};
  if(fedN>0) S.feedBowl[type]=Date.now();   // 餵到任何一隻→這區飼料桶變滿
  const short = S.feed<def.feed && fedN<list.length;
  toast(`🌾 餵了 ${fedN} 隻${def.nm}${short?'（飼料不夠，剩下的沒餵到）':''}`);
  openAnimals(type); save();
}
function feed(type,idx){
  const def=ANIMALS[type]; if(S.feed<def.feed){toast('飼料不足');return;}
  S.feed-=def.feed; const a=S.animals[type][idx]; a.fed=Date.now();
  if(!S.feedBowl) S.feedBowl={};
  S.feedBowl[type]=Date.now();   // 餵了→這區（雞舍/豬圈/牛棚）的飼料盆變滿
  if((type==='chicken'||type==='pig'||type==='cow') && def.growFeed){
    a.feedCount=(a.feedCount||0)+1;
    const turkey=type==='chicken'&&a.species==='turkey';
    const youngNm=type==='chicken'?(turkey?'小火雞':'小雞'):type==='pig'?'小豬':'小牛';
    const grownNm=type==='chicken'?(turkey?'火雞':'母雞'):def.nm;
    if(a.feedCount===def.growFeed){              // 剛長大
      if(type==='chicken'&&!turkey) a.lastProd=Date.now();
      if(type==='cow') a.lastProd=Date.now();
      const s=meatSpecFor(type,a); if(s) a.weight=s.baseKg;   // 開始有體重
      toast(`🎉 ${youngNm}長大了！`);
    }else if(a.feedCount<def.growFeed){
      toast(`🌾 餵了${youngNm}（${a.feedCount}/${def.growFeed} 就會長大）`);
    }else{                                       // 成年→增重（封頂）
      gainWeight(type,a);
      const s=meatSpecFor(type,a);
      toast(s ? `🌾 餵了${grownNm}（${a.weight.toFixed(1)} 公斤）` : `🌾 餵了${grownNm}`);
    }
  }else{ toast(`🌾 餵了${def.nm}`); }
  openAnimals(type); save();
}
function collect(type,idx){const a=S.animals[type][idx];const def=ANIMALS[type];if(!a.pending){toast('還沒產出');return;}addStore(def.prod,a.pending);toast(`收了 ${a.pending} ${PRODUCTS[def.prod].nm}`);a.pending=0;openAnimals(type);save();}
function collectTopEggBox(){
  const total=eggTotalPending();
  if(total<=0){ toast('目前沒有蛋'); return; }
  collectEggBox(eggBoxes()-1);   // 取最上面（最後）那一箱，按一次收一箱
}
function collectEggBox(boxIdx){
  const total=eggTotalPending();
  if(total<=0){ toast('目前沒有蛋'); return; }
  // 這箱實際有幾顆：第 boxIdx 箱（0起算）裝的範圍
  const start=boxIdx*EGG_PER_BOX;
  const inThisBox=Math.max(0, Math.min(EGG_PER_BOX, total-start));
  if(inThisBox<=0){ toast(`第 ${boxIdx+1} 箱還沒有蛋`); return; }
  // 從各隻雞的 pending 依序扣，湊滿這箱的數量
  let need=inThisBox;
  const list=S.animals.chicken||[];
  for(const a of list){
    if(need<=0) break;
    const take=Math.min(a.pending||0, need);
    if(take>0){ a.pending-=take; need-=take; }
  }
  const got=inThisBox-need;
  addStore('egg',got);
  toast(`🥚 收了第 ${boxIdx+1} 箱 ${got} 顆蛋`);
  openAnimals('chicken'); save();
}
function confirmSellPig(idx){
  const a=S.animals.pig[idx]; if(!a) return;
  const spec=MEAT_SPEC.pig, amt=meatYield(spec,a.weight), w=(a.weight||spec.baseKg).toFixed(1);
  openSheet(`<div class="sheethead"><h3>確認宰殺豬？</h3><button class="close" onclick="openAnimals('pig')">✕</button></div>
    <div style="text-align:center;padding:10px"><div style="font-size:42px">🐖➡️🥩</div><p>宰殺後得到 <b>${amt} 豬肉</b>（${w}公斤），無法復原。</p></div>
    <div style="display:flex;gap:10px"><button class="btn ghost" style="flex:1" onclick="openAnimals('pig')">取消</button>
    <button class="btn green" style="flex:1" onclick="sellPig(${idx})">確認</button></div>`);
}
function sellPig(idx){
  const a=S.animals.pig[idx]; if(!a) return;
  const amt=meatYield(MEAT_SPEC.pig,a.weight);
  addStore('pork',amt); S.animals.pig.splice(idx,1); buildPigs();
  closeSheet(); toast(`🥩 取得 ${amt} 豬肉（去商店賣）`); save();
}
function confirmSellCow(idx){
  const a=S.animals.cow[idx]; if(!a) return;
  const spec=MEAT_SPEC.cow, amt=meatYield(spec,a.weight), w=(a.weight||spec.baseKg).toFixed(1);
  openSheet(`<div class="sheethead"><h3>確認宰殺牛？</h3><button class="close" onclick="openAnimals('cow')">✕</button></div>
    <div style="text-align:center;padding:10px"><div style="font-size:42px">🐄➡️🥩</div><p>宰殺後得到 <b>${amt} 牛肉</b>（${w}公斤），無法復原；之後就不能再擠奶了。</p></div>
    <div style="display:flex;gap:10px"><button class="btn ghost" style="flex:1" onclick="openAnimals('cow')">取消</button>
    <button class="btn green" style="flex:1" onclick="sellCow(${idx})">確認</button></div>`);
}
function sellCow(idx){
  const a=S.animals.cow[idx]; if(!a) return;
  const amt=meatYield(MEAT_SPEC.cow,a.weight);
  addStore('beef',amt); S.animals.cow.splice(idx,1); buildCows();
  closeSheet(); toast(`🥩 取得 ${amt} 牛肉（去商店賣）`); save();
}
function killBird(idx){
  const a=S.animals.chicken[idx]; if(!a) return;
  const turkey=a.species==='turkey';
  let meat,amt;
  if(turkey){ meat='turkey_meat'; amt=meatYield(MEAT_SPEC.turkey, a.weight); }   // 火雞→依體重
  else { meat='chicken_meat'; amt=3; }                                           // 母雞→固定
  addStore(meat,amt); S.animals.chicken.splice(idx,1); buildChickens();
  closeSheet(); toast(`🔪 取得 ${amt} ${PRODUCTS[meat].nm}（去商店賣）`); save();
}
function confirmKillBird(idx){
  const a=S.animals.chicken[idx]; if(!a) return;
  const turkey=a.species==='turkey';
  const nm=turkey?'火雞':'母雞', e=turkey?'🦃':'🐔';
  const amt = turkey ? meatYield(MEAT_SPEC.turkey, a.weight) : 3;
  const meatNm = turkey?'火雞肉':'雞肉';
  const wTxt = turkey ? `（${(a.weight||MEAT_SPEC.turkey.baseKg).toFixed(1)}公斤）` : '';
  openSheet(`<div class="sheethead"><h3>確認宰殺${nm}？</h3><button class="close" onclick="openAnimals('chicken')">✕</button></div>
    <div style="text-align:center;padding:10px"><div style="font-size:42px">${e}➡️🍗</div><p>宰殺後得到 <b>${amt} ${meatNm}</b>${wTxt}，無法復原。</p></div>
    <div style="display:flex;gap:10px"><button class="btn ghost" style="flex:1" onclick="openAnimals('chicken')">取消</button>
    <button class="btn green" style="flex:1" onclick="killBird(${idx})">確認</button></div>`);
}
/* ---------- OFFICE ---------- */
function openDeskMenu(){
  openSheet(`<div class="sheethead"><h3>🪑 書桌</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:12px">坐在書桌前，要做什麼？</div>
    <button class="btn green" style="width:100%;margin-bottom:8px" onclick="openLedger()">📒 看帳本</button>
    <button class="btn" style="width:100%;margin-bottom:8px" onclick="openEmployee()">👷 雇用人員</button>
    <button class="btn gold" style="width:100%" onclick="openDecor()">🎨 裝潢店面</button>`);
}
function openLedger(){
  const rows=S.ledger.length?S.ledger.slice(0,14).map(x=>`<div class="row"><div style="flex:1">${x.l}</div><div class="${x.a>=0?'up':'down'}">${x.a>=0?'+':''}$${fmt(x.a)}</div></div>`).join(''):'<div class="empty-note">還沒有紀錄</div>';
  openSheet(`<div class="sheethead"><h3>📒 帳簿（最近）</h3><button class="close" onclick="closeSheet()">✕</button></div>${rows}`);
}
function askSit(){
  openSheet(`<div class="sheethead"><h3>🪑 要坐下嗎？</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:12px">坐著時按互動鍵可翻開帳簿。</div>
    <div style="display:flex;gap:10px">
      <button class="btn ghost" style="flex:1" onclick="closeSheet()">先不要</button>
      <button class="btn green" style="flex:1" onclick="sitting=true;openDeskMenu()">坐下</button></div>`);
}
function askSleep(){
  openSheet(`<div class="sheethead"><h3>🛏️ 確定要睡覺嗎？</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:12px">躺下休息一下。</div>
    <div style="display:flex;gap:10px">
      <button class="btn ghost" style="flex:1" onclick="closeSheet()">先不要</button>
      <button class="btn green" style="flex:1" onclick="sleeping=true;closeSheet()">睡覺</button></div>`);
}
function openEmployee(){
  const b = S.employee
    ? `<div class="small" style="margin-bottom:10px">雇員上工中，自動照料、不死保險。</div><button class="btn ghost" style="width:100%;color:var(--danger)" onclick="fireEmp()">解雇</button>`
    : `<div class="small" style="margin-bottom:10px">雇用時先付首月 $300，之後每滿30天再扣。效率60%，不碰買賣。</div><button class="btn" style="width:100%" onclick="hireEmp()">雇用 $300/月</button>`;
  openSheet(`<div class="sheethead"><h3>👷 霍華德（雇員）</h3><button class="close" onclick="closeSheet()">✕</button></div>${b}`);
}
function hireEmp(){
  if(S.cash<300){toast('現金不足，付不出首月薪水');return;}
  spend(300,'雇員首月薪');
  S.employee={hiredTs:Date.now(),lastPaidTs:Date.now()};
  addLog('👷 雇用了雇員（先付首月 $300）');
  closeSheet();toast('已雇用，已扣首月 $300');save();refreshTop();
}
function fireEmp(){S.employee=null;addLog('解雇雇員');closeSheet();toast('已解雇');save();}

/* ---------- CAFE ---------- */
function openMenu(){
  let body='';
  for(const k in RECIPES){const r=RECIPES[k];const on=S.cafe.menu.includes(k);const made=S.cafe.goods[k]||0;
    if(made<=0 && !on) continue;   // 沒成品又沒上架的不顯示
    body+=`<div class="menucard${on?' on':''}" style="display:flex;align-items:center;gap:8px">
      <div style="font-size:22px">${dishIcon(k)}</div><div style="flex:1"><div style="font-weight:700">${r.nm} <span class="small">成品 ${made}・售$${r.price}</span></div></div>
      <button class="btn sm ${on?'green':'ghost'}" onclick="toggleMenu('${k}')">${on?'已上架':'上架'}</button></div>`;}
  if(!body) body='<div class="empty-note">還沒有任何成品，先去廚房做料理。</div>';
  const cap=10+S.cafe.menu.length*6;
  openSheet(`<div class="sheethead"><h3>📋 上架菜單</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:8px">${S.cafe.staff?'店員營業中':'店員未雇用'}・當日賣出上限約 ${cap} 份。成品在廚房做。</div>${body}
    <button class="btn" style="width:100%;margin-top:6px" onclick="toggleCafeStaff()">${S.cafe.staff?'解雇店員':'雇用店員 $20/日'}</button>`);
}
function toggleMenu(k){const i=S.cafe.menu.indexOf(k);if(i>=0)S.cafe.menu.splice(i,1);
  else{if((S.cafe.goods[k]||0)<=0){toast('沒有成品可上架，先去廚房做');return;}S.cafe.menu.push(k);}
  cgRerollDishes();   // 菜單變動→還沒點餐的客人立刻改點新菜單
  openMenu();save();}
function toggleCafeStaff(){S.cafe.staff=!S.cafe.staff;openMenu();save();}
function collectTill(){if(S.cafe.till<=0){toast('收銀台沒有錢');return;}const t=Math.round(S.cafe.till);earn(t,'餐廳營收');S.cafe.till=0;toast(`🍽️ 收了 $${fmt(t)}`);save();}

/* ---------- KITCHEN ---------- */
function openPickRecipe(){
  let body='';
  for(const k in RECIPES){ if(recipeEra(k)>S.era) continue;
    if(!recipeKnown(k)) continue;   // 預設(known)或做過/買過 → 顯示
    const r=RECIPES[k];
    const ingTxt=Object.keys(r.ingredients||{}).map(i=>`${ingNm(i)}${r.ingredients[i]}`).join('・');
    const bakeTxt=`揉${r.knead??4}次・烤${Math.round((r.bakeMs||BAKE_MS)/1000)}秒`;
    body+=`<div class="menucard" style="display:flex;align-items:center;gap:8px"><div style="font-size:22px">${dishIcon(k)}</div>
      <div style="flex:1"><div style="font-weight:700">${r.nm} <span class="small">一批${r.batch}・售$${r.price}</span></div>
      <div class="small">${ingTxt}・${bakeTxt}</div></div></div>`;
  }
  if(!body) body='<div class="empty-note">還沒做出任何料理。<br>到備料台放食材、揉製、烤對秒數，做成功就會記在這裡。</div>';
  const hasP=!!S.partner, self=S.cookBy!=='partner';
  const cookSel=`<div class="small" style="margin-bottom:6px">由誰製作</div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button class="btn sm ${self?'green':'ghost'}" style="flex:1" onclick="setCookBy('self')">🧑‍🍳 主角（毒物）</button>
      <button class="btn sm ${(!self&&hasP)?'green':(hasP?'ghost':'dis')}" style="flex:1" onclick="setCookBy('partner')">💞 伴侶（食物）</button>
    </div>
    <div class="small" style="margin-bottom:8px;color:var(--ink2)">${hasP?'隨時切換要做武器還是食物。':'沒有伴侶時只能做出毒物（18 世紀有伴侶後解鎖食物）。'}</div>`;
  openSheet(`<div class="sheethead"><h3>📖 食譜本</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:8px">這裡是做過的料理圖鑑。到備料台放食材、揉製、烤對秒數就能做出來。</div>${cookSel}${body}`);
}
function pickRecipe(k){ refundSlots(); prep.knead=0; prep.inOven=false; S.curRecipe=k; closeSheet(); toast(`開始做 ${RECIPES[k].nm}`); save(); }
function refundSlots(){ for(const k in prep.slots){ const n=prep.slots[k]||0; if(n>0){ if(EXTRAS[k]) S.extras[k]=(S.extras[k]||0)+n; else addStore(k,n); } } prep.slots={}; }
function discardPrep(){
  if(slotsUsed()===0){ toast('料台上沒有食材'); return; }
  prep.slots={};
  toast('🗑️ 倒掉了，這些食材回收不了');
  kCut(); save();
}
function addIng(k){
  if(!prep.slots[k] && slotsUsed()>=5){ toast('料台最多放 5 種食材'); return; }
  if((S.store[k]||0)<=0 && (S.extras[k]||0)<=0){ toast('庫存不足'); return; }
  if((S.store[k]||0)>0) S.store[k]--; else S.extras[k]--;
  prep.slots[k]=(prep.slots[k]||0)+1; toast(`放入 ${ingNm(k)}`);
  kCut(); save();
}
function recipeCheatList(){
  let cards='';
  for(const k in RECIPES){
    if(recipeEra(k)>S.era) continue;
    if(!recipeKnown(k)) continue;
    const r=RECIPES[k];
    const ingTxt=Object.keys(r.ingredients||{}).map(i=>`${ingNm(i)}${r.ingredients[i]}`).join('・');
    const bakeTxt=`揉${r.knead??4}次・烤${Math.round((r.bakeMs||BAKE_MS)/1000)}秒`;
    cards+=`<div class="menucard" style="display:flex;align-items:center;gap:8px;padding:6px">
      <div style="font-size:20px">${dishIcon(k)}</div>
      <div style="flex:1"><div style="font-weight:700;font-size:13px">${r.nm}</div>
      <div class="small">${ingTxt}・${bakeTxt}</div></div></div>`;
  }
  if(!cards) cards='<div class="empty-note" style="padding:8px">還沒學會任何食譜，到食譜本或商店學。</div>';
  return `<div style="margin-top:8px">${cards}</div>`;
}
function toggleKCutRecipes(){ prep._showRecipes=!prep._showRecipes; kCut(); }
function kCut(){
  let body=`<div class="small" style="margin-bottom:6px">放入食材，揉製後進烤箱。食材＋揉次＋烤秒數對上某道食譜就會做出來。</div>
    <div class="small">已用料台 ${slotsUsed()}/5 種</div>
    <div style="display:flex;gap:8px;margin-top:6px">
      <button class="btn ghost sm" style="color:var(--danger)${slotsUsed()?'':';opacity:.4'}" onclick="discardPrep()">🗑️ 倒掉料台食材（不回收）</button>
      <button class="btn ghost sm" onclick="toggleKCutRecipes()">📖 ${prep._showRecipes?'收起食譜 ▲':'看食譜 ▼'}</button>
    </div>
    ${prep._showRecipes?recipeCheatList():''}
    <div class="hr"></div><b class="small">放入食材</b>`;
  const avail=[];
  for(const k in S.store) if(S.store[k]>0) avail.push({k,n:S.store[k]});
  for(const k in S.extras) if(S.extras[k]>0) avail.push({k,n:S.extras[k]});
  body+= avail.length? avail.map(it=>`<div class="row"><div class="e">${prodIcon(it.k,28)}</div>
    <div class="info"><div class="n">${ingNm(it.k)} <span class="small">庫存 ${it.n}・已放 ${prep.slots[it.k]||0}</span></div></div>
    <button class="btn sm" onclick="addIng('${it.k}')">放入</button></div>`).join('')
    : '<div class="empty-note">沒有食材，去農田收成或商店買。</div>';
  openSheet(`<div class="sheethead"><h3>🔪 備料台</h3><button class="close" onclick="closeSheet()">✕</button></div>${body}`);
}
function kKnead(){
  if(slotsUsed()===0){ say('先去備料台放材料！'); return; }
  prep.knead++; toast(`🫓 揉製 ${prep.knead} 次`);
}
function kOven(){
  if(prep.inOven){ finishBake(Date.now()-prep.ovenStart); }
  else{ if(slotsUsed()===0){ say('料台沒有食材。'); return; }
    prep.inOven=true; prep.ovenStart=Date.now(); save(); }
}
/* ---------- 桌上取貨：做好的先擺桌上，走過去碰到才收 ---------- */
const KITCHEN_TABLE_SLOTS=[   // 第一種在 10,14；每多一「種」往左 2 格(=32px)；最多 5 種
  {x:10,y:15},{x:8,y:15},{x:6,y:15},{x:4,y:15},{x:2,y:15},
];
const TOXIN_PER_COMPLEXITY=1;   // 毒物量 = 料理複雜度 × 這個倍率，想更毒就調大
function recipeComplexity(k){
  const r=RECIPES[k]; if(!r) return 1;
  let n=0; for(const ing in (r.ingredients||{})) n+=r.ingredients[ing];   // 食材總數
  n+=(r.knead||0);                                                        // ＋揉製次數
  return Math.max(1,n);
}
function toxinYield(k){ return Math.max(1, Math.round(recipeComplexity(k)*TOXIN_PER_COMPLEXITY)); }
function addKitchenPickup(kind, recipe, count){
  if(!S.kitchenPickups) S.kitchenPickups=[];
  const same=S.kitchenPickups.find(p=>p.kind===kind && p.recipe===recipe);   // 同款疊加在同一格
  if(same){ same.count+=count; save(); return true; }
  const slot=KITCHEN_TABLE_SLOTS.find(s=>!S.kitchenPickups.some(p=>p.x===s.x&&p.y===s.y));
  if(!slot){ return false; }   // 桌上已滿（最多 5 種），擺不下
  S.kitchenPickups.push({x:slot.x, y:slot.y, kind, recipe, count});
  save(); return true;
}
function updateKitchenPickups(){
  if(!S.kitchenPickups || !S.kitchenPickups.length) return;
  for(let i=S.kitchenPickups.length-1;i>=0;i--){
    const p=S.kitchenPickups[i];
   if(Math.hypot(player.x-p.x, player.y-p.y) <=2){   // 走到旁邊就收（範圍想大調大）
      if(p.kind==='food'){ S.cafe.goods[p.recipe]=(S.cafe.goods[p.recipe]||0)+p.count; toast(`🍰 收下 ${RECIPES[p.recipe].nm} ×${p.count}`); }
      else { S.toxins=(S.toxins||0)+p.count; toast(`🧪 收下毒物 ×${p.count}`); }
      S.kitchenPickups.splice(i,1); save();
    }
  }
}
function drawKitchenPickups(ox,oy){
  if(!S.kitchenPickups) return;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  for(const p of S.kitchenPickups){
    const src = p.kind==='food' ? ('food_'+p.recipe+'.png') : 'toxin.png';
    const img = npcImg(src), cx=p.x*TS+TS/2-ox, cy=p.y*TS+TS/2-oy;
    if(img && img.complete && img.naturalWidth){
      ctx.globalAlpha=1; ctx.drawImage(img, 0,0, img.naturalWidth, img.naturalHeight, cx-16, cy-22, 32,32);
    }else{
      ctx.font='16px serif'; ctx.fillStyle='#000';
      ctx.fillText(p.kind==='food'?RECIPES[p.recipe].e:'🧪', cx, cy-6);
    }
  
  }
}
/* 用料台內容＋揉次＋烤秒數，比對找出符合的食譜（找不到回 null） */
function matchRecipe(t){
  for(const k in RECIPES){
    const r=RECIPES[k];
    const need=r.ingredients||{};
    // 1. 料台食材種類數要一樣
    if(slotsUsed()!==Object.keys(need).length) continue;
    // 2. 每種數量要剛好對
    let ok=true;
    for(const ing in need){ if((prep.slots[ing]||0)!==need[ing]){ ok=false; break; } }
    if(!ok) continue;
    // 3. 揉製次數要夠
    if(prep.knead<(r.knead??4)) continue;
    // 4. 烤秒數要對（±1.5秒）
    const bm=r.bakeMs||BAKE_MS;
    if(Math.abs(t-bm)>1500) continue;
    return k;   // 全部符合
  }
  return null;
}
function finishBake(t){
  prep.inOven=false;
  if(t>BURN_MS){ toast('💀 燒焦了！這批報廢'); prep.slots={}; prep.knead=0; save(); return; }
  const k=matchRecipe(t);   // 用料台內容＋烤秒數找出是哪道
  if(!k){ toast('這不像任何一道食譜，報廢了'); prep.slots={}; prep.knead=0; save(); return; }
  const r=RECIPES[k];
  if(S.cookBy==='partner' && S.partner){
    const out=Math.round(r.batch*cookBatchMul());
    if(addKitchenPickup('food', k, out)) toast(`出爐 ${out} 個${r.nm}，擺到桌上了`);
    else { S.cafe.goods[k]=(S.cafe.goods[k]||0)+out; toast(`出爐 ${out} 個${r.nm}（直接收進背包）`); }
  } else {
    const out=toxinYield(k);
    if(addKitchenPickup('toxin', k, out)) toast(`做出 ${out} 份毒物，擺到桌上了`);
    else { S.toxins=(S.toxins||0)+out; toast(`做出 ${out} 份毒物（直接收進背包）`); }
  }
  if(!S.recipesCooked) S.recipesCooked={};
  S.recipesCooked[k]=true;
  prep.slots={}; prep.knead=0; save();
}

/* ---------- SHOP ---------- */
function openShopBuy(){
  let seeds='';
  for(const k in FARM_CROPS){ if(cropEra(k)>S.era) continue; if(FARM_CROPS[k].hidden) continue; const d=FARM_CROPS[k]; const e=prodIcon(k,28);
    seeds+=`<div class="row"><div class="e">${e}</div><div class="info"><div class="n">${d.nm}種子</div>
      <div class="d">背包 ${S.seeds[k]||0}</div></div>
      <div class="price">$${d.seed}</div><button class="btn sm" onclick="buyCropSeed('${k}')">買</button></div>`;}
  let animals='';
  for(const k in ANIMALS){const d=ANIMALS[k];const cnt=S.animals[k].length;
   animals+=`<div class="row"><div class="e">${adultIcon(k)}</div><div class="info"><div class="n">${d.nm} <span class="small">${cnt}/10</span></div></div>
      <div class="price">$${d.cub}</div><button class="btn sm ${cnt>=10?'dis':''}" onclick="buyAnimal('${k}')">買</button></div>`;}
  {const cnt=S.animals.chicken.length;
    animals+=`<div class="row"><div class="e">${adultIcon('turkey')}</div><div class="info"><div class="n">火雞 <span class="small">養雞舍・${cnt}/10</span></div></div>
      <div class="price">$8</div><button class="btn sm ${cnt>=10?'dis':''}" onclick="buyTurkey()">買</button></div>`;}
  let extras='';
  for(const k in EXTRAS){const x=EXTRAS[k];
    extras+=`<div class="row"><div class="e">${prodIcon(k,28)}</div><div class="info"><div class="n">${x.nm}</div><div class="d">庫存 ${S.extras[k]||0}</div></div>
      <div class="price">$${x.price}</div><button class="btn sm" onclick="buyExtra('${k}',10)">買10</button></div>`;}
  let recipes='';
  for(const k in RECIPES){ const r=RECIPES[k];
    if(!r.shop) continue;                           // 只賣標了 shop:true 的配方
    if(recipeEra(k)>S.era) continue;                // 沒到時代不賣（想全賣就刪這行）
    const known=recipeKnown(k);
    const cost=Math.round((r.learnCost||60)*shopBuyMul());
    recipes+=`<div class="row"><div class="e"><img src="recipe.png" style="width:32px;height:32px;object-fit:contain;image-rendering:pixelated;vertical-align:middle"></div><div class="info"><div class="n">${r.nm}配方</div>
      <div class="d">${known?'已學會（看食譜本）':'買了才知道做法'}</div></div>
      <div class="price">$${cost}</div>
      <button class="btn sm ${known?'dis':''}" onclick="buyRecipe('${k}')">${known?'已學會':'買'}</button></div>`;
  }
      const fp=jitter(6,.1),fe=jitter(1,.1);S._fp=fp;S._fe=fe;
  openSheet(`<div class="sheethead"><h3>🧺 採購</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small">💰 現金 $${fmt(S.cash)}${perk('Pedro')?'・<b style="color:var(--accent2)">佩德羅同居中：結帳 8 折</b>':''}</div><div class="hr"></div>
    <b class="small">種子</b>${seeds}<div class="hr"></div>
    <b class="small">幼崽（直接進牧地）</b>${animals}<div class="hr"></div>
    <b class="small">飼料 / 肥料 / 咖啡材料</b>
    <div class="row"><div class="e">${miscIcon('feed','🌾',28)}</div><div class="info"><div class="n">飼料</div><div class="d">庫存 ${S.feed}</div></div><div class="price">$${fe}</div>
      <button class="btn sm" onclick="buyFeed(10)">買10</button><button class="btn sm ghost" onclick="buyFeed(50)">買50</button></div>
    <div class="row"><div class="e">${miscIcon('fert','💩',28)}</div><div class="info"><div class="n">肥料</div><div class="d">庫存 ${S.fert}</div></div><div class="price">$${fp}</div>
      <button class="btn sm" onclick="buyFert(1)">買1</button><button class="btn sm ghost" onclick="buyFert(5)">買5</button></div>${extras}${recipes?`<div class="hr"></div><b class="small">📖 配方</b>${recipes}`:''}`);
}
function buySeed(c,q){const cost=Math.round(CROPS[c].seed*QUAL_MUL[q]);if(S.cash<cost){toast('現金不足');return;}spend(cost,`買${CROPS[c].nm}種子`);S.seeds[seedKey(c,q)]=(S.seeds[seedKey(c,q)]||0)+1;toast(`買了${CROPS[c].nm}種子`);openShopBuy();save();}
function buyCropSeed(k){const cost=Math.round(FARM_CROPS[k].seed*shopBuyMul()); if(S.cash<cost){toast('現金不足');return;} spend(cost,`買${FARM_CROPS[k].nm}種子`); S.seeds[k]=(S.seeds[k]||0)+1; toast(`買了${FARM_CROPS[k].nm}種子`); openShopBuy(); save();}

function buyAnimal(k){const d=ANIMALS[k];if(S.animals[k].length>=10){toast('已達上限');return;}const cost=Math.round(d.cub*shopBuyMul());if(S.cash<cost){toast('現金不足');return;}spend(cost,`買${d.nm}`);S.animals[k].push({born:Date.now(),fed:Date.now(),lastProd:Date.now(),feedCount:0});buildChickens();buildPigs();buildCows();toast(`買了${d.nm}，已進牧地`);openShopBuy();save();}
function buyTurkey(){
  if(S.animals.chicken.length>=10){toast('雞舍滿了');return;}
  const cost=Math.round(8*shopBuyMul());
  if(S.cash<cost){toast('現金不足');return;}
  spend(cost,'買火雞');
  S.animals.chicken.push({born:Date.now(),fed:Date.now(),lastProd:Date.now(),feedCount:0,species:'turkey'});
  buildChickens(); toast('買了火雞，已進雞舍'); openShopBuy(); save();
}

function buyFeed(q){const c=Math.round((S._fe||1)*q*shopBuyMul());if(S.cash<c){toast('現金不足');return;}spend(c,`買飼料×${q}`);S.feed+=q;toast(`+${q}飼料`);openShopBuy();save();}

function buyFert(q){const c=Math.round((S._fp||6)*q*shopBuyMul());if(S.cash<c){toast('現金不足');return;}spend(c,`買肥料×${q}`);S.fert+=q;toast(`+${q}肥料`);openShopBuy();save();}

function buyExtra(k,q){const c=Math.round(EXTRAS[k].price*q*shopBuyMul());if(S.cash<c){toast('現金不足');return;}spend(c,`買${EXTRAS[k].nm}×${q}`);S.extras[k]=(S.extras[k]||0)+q;toast(`+${q}${EXTRAS[k].nm}`);openShopBuy();save();}
function buyRecipe(k){
  if(!RECIPES[k]||!RECIPES[k].shop) return;
  if(S.recipesCooked&&S.recipesCooked[k]){ toast('食譜本已經有這道了'); return; }
  const cost=Math.round((RECIPES[k].learnCost||60)*shopBuyMul());
  if(S.cash<cost){ toast('現金不足'); return; }
  spend(cost, `買${RECIPES[k].nm}配方`);
  if(!S.recipesCooked) S.recipesCooked={};
  S.recipesCooked[k]=true;            // 買了 → 食譜本直接顯示做法
  toast(`📖 學會了 ${RECIPES[k].nm} 的做法！食譜本可以看了`);
  openShopBuy();
}
function qtyOpts(id, have){
  const dis = have<=0;
  const btnStyle='padding:2px 8px'+(dis?';opacity:.35;pointer-events:none':'');
  return `<span style="display:inline-flex;align-items:center;gap:3px;margin:0 4px;flex:none">
    <button class="btn sm ghost" style="${btnStyle}" onclick="qtyAdj('${id}',-1,${have})">−</button>
    <input id="${id}" type="number" inputmode="numeric" min="1" max="${have}" value="${dis?0:have}" ${dis?'disabled':''}
      style="width:44px;text-align:center;padding:2px;border:1px solid var(--line2);border-radius:6px;background:var(--card)${dis?';opacity:.5':''}"
      onchange="qtyClamp('${id}',${have})">
    <button class="btn sm ghost" style="${btnStyle}" onclick="qtyAdj('${id}',1,${have})">＋</button>
    <button class="btn sm ghost" style="padding:2px 6px;font-size:11px${dis?';opacity:.35;pointer-events:none':''}" onclick="qtyMax('${id}',${have})">全部</button>
  </span>`;
}
function qtyAdj(id,d,max){ const el=document.getElementById(id); if(!el||el.disabled)return;
  let v=parseInt(el.value)||1; v=Math.max(1,Math.min(max,v+d)); el.value=v; }
function qtyClamp(id,max){ const el=document.getElementById(id); if(!el)return;
  let v=parseInt(el.value); if(!v||v<1)v=1; if(v>max)v=max; el.value=v; }
function qtyMax(id,max){ const el=document.getElementById(id); if(el)el.value=max; }
function openShopSell(){
  let raw='';let any=false;
  for(const k in PRODUCTS){const have=S.store[k]||0;const price=priceOf(k);const dir=priceDir(k);
    const arrow=dir>0?'<span class="up">▲</span>':dir<0?'<span class="down">▼</span>':'';
    raw+=`<div class="row"><div class="e">${prodIcon(k,28)}</div><div class="info"><div class="n">${PRODUCTS[k].nm} <span class="small">基準$${PRODUCTS[k].base}</span></div>
      <div class="d">庫存 ${have}</div></div><div class="price">$${price} ${arrow}</div>
      ${qtyOpts('sq_'+k,have)}<button class="btn sm ${have<=0?'dis':'green'}" onclick="sellProduct('${k}')">賣</button></div>`;
    if(have>0)any=true;}
  let goods='';
  for(const k in RECIPES){const have=S.cafe.goods[k]||0;
    goods+=`<div class="row"><div class="e">${dishIcon(k)}</div><div class="info"><div class="n">${RECIPES[k].nm}</div><div class="d">庫存 ${have}</div></div>
      <div class="price">$${RECIPES[k].price}</div>${qtyOpts('sg_'+k,have)}<button class="btn sm ${have<=0?'dis':'green'}" onclick="sellGood('${k}')">賣</button></div>`;}
  openSheet(`<div class="sheethead"><h3>💵 收購</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small">賣價每天浮動，會暴漲暴跌。${any?'':'（農畜產庫存空）'}${perk('Pedro')?'・<b style="color:var(--accent2)">佩德羅同居中：收購 +20%</b>':''}</div><div class="hr"></div>
    <b class="small">農畜產品</b>${raw}<div class="hr"></div><b class="small">加工品</b>${goods}`);
}
function sellProduct(k){
  const have=S.store[k]||0; if(have<=0) return;
  const sel=document.getElementById('sq_'+k);
  let q=sel?(parseInt(sel.value)||have):have; q=Math.min(q,have);
  const total=Math.round(priceOf(k)*q*shopSellMul());
  S.store[k]-=q; earn(total,`賣${PRODUCTS[k].nm}×${q}`); toast(`💰 +$${fmt(total)}`); openShopSell(); save();
}
function sellGood(k){
  const have=S.cafe.goods[k]||0; if(have<=0) return;
  const sel=document.getElementById('sg_'+k);
  let q=sel?(parseInt(sel.value)||have):have; q=Math.min(q,have);
  const total=Math.round(RECIPES[k].price*q*shopSellMul());
  S.cafe.goods[k]-=q; earn(total,`賣${RECIPES[k].nm}×${q}`); toast(`💰 +$${fmt(total)}`); openShopSell(); save();
}
/* ---------- BAG ---------- */
function openBag(){
  let seeds=Object.keys(S.seeds).filter(k=>S.seeds[k]>0).map(k=>{const d=FARM_CROPS[k]; const e=prodIcon(k,20); const nm=d?d.nm:k; return `<span class="seedchip">${e}${nm}種子×${S.seeds[k]}</span>`;}).join('')||'<span class="small">無</span>';
  let prod=Object.keys(S.store).filter(k=>S.store[k]>0).map(k=>`<span class="seedchip">${prodIcon(k,20)}${PRODUCTS[k].nm}×${S.store[k]}</span>`).join('')||'<span class="small">無</span>';
  let goods=Object.keys(S.cafe.goods).filter(k=>S.cafe.goods[k]>0).map(k=>{const r=RECIPES[k];const heal=Math.max(2,Math.round(r.price/6));
    return `<div class="row"><div class="e">${dishIcon(k)}</div><div class="info"><div class="n">${r.nm} <span class="small">×${S.cafe.goods[k]}</span></div><div class="d">吃一個回 ${heal} 血</div></div>
      <button class="btn sm green" onclick="eatDish('${k}')">吃</button></div>`;}).join('')||'<div class="empty-note">無</div>';
  let ext=Object.keys(S.extras).filter(k=>S.extras[k]>0).map(k=>`<span class="seedchip">${prodIcon(k,20)}${EXTRAS[k].nm}×${S.extras[k]}</span>`).join('')||'<span class="small">無</span>';
  openSheet(`<div class="sheethead"><h3>🎒 背包</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <b class="small">種子</b><div style="margin:4px 0 8px">${seeds}</div>
    <b class="small">農畜產品</b><div style="margin:4px 0 8px">${prod}</div>
    <b class="small">加工品成品</b><div style="margin:4px 0 8px">${goods}</div>
    <b class="small">材料</b><div style="margin:4px 0 8px">${ext}</div>
    <div class="hr"></div><div class="small">飼料 ${S.feed}・肥料 ${S.fert}・${miscIcon('toxin','🧪',16)} 毒物 ${S.toxins||0}</div>`);
}

/* ---------- dialogue ---------- */
function showDlg(o){document.getElementById('dialogue').classList.remove('idle');
  let avatar=o.avatar||o.e, line;
  const glow = o.id==='partner' && partnerAfterglow && Date.now()<partnerAfterglow.until && AFTERGLOW_LINES[partnerAfterglow.kind];
  if(glow){ const pool=AFTERGLOW_LINES[partnerAfterglow.kind]; line=pool[Math.floor(Math.random()*pool.length)]; }
  else if(o.id==='partner'){ const pool=partnerWalkLines(); line=pool[Math.floor(Math.random()*pool.length)]; }
  else if(o.id==='crib'){ const pool=childWalkLines();
    avatar = S.child ? (S.child.crying?'😢':CHILD_STAGES[S.child.stage].e) : '🕊️';
    line=pool[Math.floor(Math.random()*pool.length)]; }
  else if(o.id==='alfred'){ const pool=alfredFarmLines(); line=pool[Math.floor(Math.random()*pool.length)]; avatar='🧑‍🎓'; }
  else { const pool=o.lines; line=pool?pool[dlgIdx%pool.length]:'……'; }
  document.getElementById('dlgAvatar').textContent=avatar;
  document.getElementById('dlgText').innerHTML=`<span class="name">${o.nm}</span>${line}`;}
function childWalkLines(){
  if(!S.child) return CHILD_GONE_LINES;
  const key=CHILD_STAGES[S.child.stage].key;                 // baby / toddler / child / teen
  if(key==='baby') return CHILD_BABY_LINES;
  if(S.partner){
    if(partnerHoneymoon() && typeof CHILD_SETTLING_LINES!=='undefined' && CHILD_SETTLING_LINES[key])
      return CHILD_SETTLING_LINES[key];                       // 同居初期：孩子還在觀望，先不排斥
    const byStage=CHILD_PARTNER_LINES[key] || CHILD_PARTNER_LINES.child;
    return byStage[S.partner.id] || byStage._default;
  }
  return CHILD_HAPPY_LINES;
}
function partnerHoneymoon(){ return !!(S.partner && (S.partner.newlyMoved||0)>0); }
function partnerWalkLines(){
  const p=S.partner; if(!p) return ['…'];
  const set=(typeof PARTNER_WALK_LINES!=='undefined' && (PARTNER_WALK_LINES[p.id]||PARTNER_WALK_LINES._default))
            || {base:['和你在一起真好。']};
  if(partnerHoneymoon() && set.newlyMoved && set.newlyMoved.length){   // 剛同居：先放幾次「搬進來」台詞
    if(p.newlyMoved>0){ p.newlyMoved--; save(); }
    return set.newlyMoved;
  }
  let pool=(set.base||[]).slice();
  if(S.child && S.child.stage>=1 && set.jealous) pool=pool.concat(set.jealous);  // 阿爾弗雷德到幼兒以上才摻心事
  return pool.length?pool:['…'];
}
function idleDlg(){document.getElementById('dialogue').classList.add('idle');
  document.getElementById('dlgAvatar').textContent='🙂';
  let tip='用方向鍵走動，走到物件旁按互動鍵。';
   if(curScene==='kitchen'){tip=prep.inOven?'烤箱運作中，回烤箱按互動出爐。':slotsUsed()===0?'到🔪備料台放食材。':prep.knead<1?'到🫓桌子揉製。':'到🔥烤箱開烤。';}
  document.getElementById('dlgText').textContent=tip;}
function say(t){const box=document.getElementById('dialogue');box.classList.remove('idle');
  document.getElementById('dlgAvatar').textContent= curScene==='kitchen'?'🍳':'💬';
  document.getElementById('dlgText').innerHTML=`<span class="name">${curScene==='kitchen'?'食譜':'提示'}</span>${t}`;
  clearTimeout(say._t);say._t=setTimeout(idleDlg,2600);}

/* ---------- recipe bar (kitchen only) ---------- */
function renderRecipeBar(){
  const bar=document.getElementById('recipeBar');
  if(curScene!=='kitchen'){bar.innerHTML='';return;}
  const modeTxt=(S.cookBy==='partner'&&S.partner)?'🍰食物':'🧪毒物';
  const ingTxt=Object.keys(prep.slots).filter(k=>prep.slots[k]>0).map(k=>`${ingNm(k)}${prep.slots[k]}`).join('・')||'（空）';
  bar.innerHTML=`[${modeTxt}] 料台：${ingTxt}　揉 ${prep.knead} 次　${prep.inOven?'🔥烘烤中':'待烤'}`;
}

/* ---------- loop ---------- */
let tickAccum=0;
function update(){
  if(curScene==='fishing'){ updateFishing(); return; }
  if(spicyScene){
    if(held.up||held.down||held.left||held.right){ spicyScene=null; unfreezeNpcs(); }   // 按方向鍵→大家下床
    else{
      const bx=(BED.x1+BED.x2)/2, by=(BED.y1+BED.y2)/2;          // 鏡頭鎖在床上
      cam.x=Math.max(0,Math.min(bx-VIEW_COLS/2+0.5, mapCols()-VIEW_COLS));
      cam.y=Math.max(0,Math.min(by-VIEW_ROWS/2+0.5, mapRows()-VIEW_ROWS));
      const h=document.getElementById('hint'); if(h) h.classList.remove('show');
      return;
    }
  }
  let dx=0,dy=0;
  if(held.up)dy-=1;if(held.down)dy+=1;if(held.left)dx-=1;if(held.right)dx+=1;
  const moving = (dx||dy);                         // ← 新增：有沒有在動
  if(moving){const len=Math.hypot(dx,dy);dx/=len;dy/=len;
    const nx=player.x+dx*SPEED,ny=player.y+dy*SPEED;
    const foot=0.5;
if(walkable(nx+0.5,player.y+foot))player.x=nx;
    if(walkable(player.x+0.5,ny+foot))player.y=ny;}

  // ← 新增：走路動畫
  if(moving){
    animTimer++;
    if(animTimer>=WALK_SPEED){ animTimer=0; walkStep=(walkStep+1)%WALK_CYCLE.length; }
    animFrame=WALK_CYCLE[walkStep];
  }else{
    animFrame=0; animTimer=0; walkStep=0;          // 停下來→回到收步
  }
document.getElementById('sceneTitle').textContent='('+Math.round(player.x)+','+Math.round(player.y)+')';
  updateCamera();
  autoDoors();
  if(curScene==='farm'){ updateMonsters(); updateShots(); updateChickens(); updatePigs(); updateCows(); updateFarmNpcs(); updateAppleDrops(); }
  if(curScene==='office') updateOfficeNpcs();
  if(curScene==='port') updatePortNpcs();
  if(curScene==='kitchen') updateKitchenPickups();
  const eb=document.getElementById('equipBtn');
  if(eb){
    if(curScene==='farm'){
      eb.style.display='flex';
      const on = equipped==='toxin';
      eb.style.background = on ? 'var(--accent2)' : 'var(--card)';
      eb.style.borderColor = on ? 'var(--accent2)' : 'var(--line2)';
      const ec=document.getElementById('equipCount'); if(ec){ ec.textContent=S.toxins||0; ec.style.color=on?'#ffffffcc':'var(--ink2)'; }
    }else{ eb.style.display='none'; }
  }
  const _faceChair = (()=>{ const o=facingObject(); return !!(o && o.kind==='chair'); })();
  const onChair = _faceChair;
  const onBed = (curScene===BED.scene
    && Math.round(player.x)>=BED.x1 && Math.round(player.x)<=BED.x2
    && Math.round(player.y)>=BED.y1 && Math.round(player.y)<=BED.y2);
    const onDock = (curScene===DOCK.scene && S.era>=18
    && Math.round(player.x)>=DOCK.x1 && Math.round(player.x)<=DOCK.x2
    && Math.round(player.y)>=DOCK.y1 && Math.round(player.y)<=DOCK.y2);
  if(!onChair) sitting=false;   // 離開椅子→起身
  if(sleeping && (held.up||held.down||held.left||held.right)) sleeping=false;   // 睡覺中按方向鍵→直接起床
  else if(!onBed) sleeping=false;    // 離開床→起來
  // oven ui
  const ob=document.getElementById('ovenbar');
  if(curScene==='kitchen'&&prep.inOven){const t=Date.now()-prep.ovenStart;ob.classList.add('show');
  document.getElementById('ovenFill').style.width=Math.min(100,(t/BURN_MS)*100)+'%';
  ob.classList.remove('warn');ob.classList.toggle('burn',t>BURN_MS);
  document.getElementById('ovenTxt').textContent=t<=BURN_MS?`烘烤中 ${(t/1000).toFixed(1)}s`:'💀燒焦中';
  }else ob.classList.remove('show');
  // hint + dialogue
  const near=facingObject();
  
  const hint=document.getElementById('hint');
  if(sitting){
    document.getElementById('actBtn').className='actbtn';
    hint.textContent='📒 翻開帳簿（互動鍵）／按方向鍵起身';
    hint.classList.add('show');
 }else if(sleeping){
    document.getElementById('actBtn').className='actbtn dim';
    hint.textContent='😴 睡覺中・按方向鍵起床';
    hint.classList.add('show');
 }else if(curScene==='farm' && equipped==='toxin'){
    dlgNpc=null; if(!say._t) idleDlg();
    document.getElementById('actBtn').className='actbtn throw';
    hint.textContent=(S.toxins>0)?'🧪 投擲毒物（互動鍵）':'🧪 沒有毒物了，去廚房做';
    hint.classList.add('show');
 }else{
    let onTile = null;
    if(curScene==='farm'){
      const fx=Math.round(player.x)+DIR[player.facing].x, fy=Math.round(player.y)+DIR[player.facing].y;
      const front=cellKeyAt(fx,fy), here=farmTileHere();
      if(front && S.crops[front]) onTile=front;
      else if(here && !S.crops[here]) onTile=here;
      else if(front) onTile=front;
    }
    const zone   = curScene==='farm' ? farmZoneAt(player.x,player.y) : null;
    const animal = zone && zone.kind!=='plot' ? zone : null;
    document.getElementById('actBtn').className='actbtn'+((near||onTile||animal||onChair||onBed||(curScene==='shop'&&nearKeeper()))?'':' dim');
 const _atKeeper = curScene==='shop' && nearKeeper();
    const _door = sitting ? null : activeDoor();
    document.getElementById('actBtn').className='actbtn'+((near||onTile||animal||onChair||onBed||onDock||_atKeeper||_door)?'':' dim');
    if(_atKeeper){ if(dlgNpc!=='keeper'){ dlgNpc='keeper'; dlgIdx=(Math.random()*KEEPER_NPC.lines.length)|0; showDlg(KEEPER_NPC); } hint.textContent='🎩 霍蘭德（互動鍵）'; hint.classList.add('show'); }
    else if(_door){ dlgNpc=null; if(!say._t) idleDlg(); hint.textContent=doorLabel(_door)+'（互動鍵）'; hint.classList.add('show'); }
    else if(near&&near.kind==='appletree'){ dlgNpc=null; if(!say._t) idleDlg(); hint.textContent='🍎 搖蘋果樹（互動鍵）'; hint.classList.add('show'); }
    else if(near&&near.kind==='dairy'){ dlgNpc=null; if(!say._t) idleDlg(); hint.textContent='🧀 乳品加工處（互動鍵）'; hint.classList.add('show'); }
    else if(near&&near.npc){if(dlgNpc!==near.id){dlgNpc=near.id;dlgIdx=0;showDlg(near);}hint.classList.remove('show');}
    else if(onTile){dlgNpc=null;if(!say._t)idleDlg();
      const c=S.crops[onTile];
      if(!c){ hint.textContent='🟫 播種（互動鍵）'; }
      else { const def=FARM_CROPS[c.crop];
        hint.textContent = c.stage>=def.stages.length-1 ? `🧺 收成${def.nm}（互動鍵）`
          : `${def.nm}・${def.stages[c.stage]}${c.watered?'':'・需澆水'}（互動鍵）`; }
      hint.classList.add('show');}
    else if(animal){dlgNpc=null;if(!say._t)idleDlg();hint.textContent=`${ANIMALS[animal.kind].e} ${animal.nm}・餵食/收成（互動鍵）`;hint.classList.add('show');}
    else if(onChair){dlgNpc=null;if(!say._t)idleDlg();hint.textContent='🪑 坐下（互動鍵）';hint.classList.add('show');}
    else if(onBed){dlgNpc=null;if(!say._t)idleDlg();hint.textContent='🛏️ 睡覺（互動鍵）';hint.classList.add('show');}
    else if(onDock){dlgNpc=null;if(!say._t)idleDlg();hint.textContent='🚢 上船（互動鍵）';hint.classList.add('show');}
    else{dlgNpc=null;if(!say._t)idleDlg();hint.classList.remove('show');}
  }
  renderRecipeBar();
  // periodic tick (every ~2s) for time progression
  tickAccum++; if(tickAccum>=120){tickAccum=0;tick();refreshTop();save();}
}
function cssVar(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim();}
function tileColor(ch,x,y){
  switch(ch){
    case 'F':return '--fence'; case 'W':return '--wall'; case 'B':return '--brick';
    case 'P':return '--path';
    case '.':return curScene==='farm'?((x+y)%2?'--soil':'--soil2'):((x+y)%2?'--floor':'--floor2');
    case 'R':return '--rug'; case 'D':return '--accent2'; case 'A':return '--water';
    case 'C':case 'T':case 'S':return '--counter';
    case 'G':return (x+y)%2?'--grass':'--grass2';
    default: return curScene==='farm'?((x+y)%2?'--grass':'--grass2'):((x+y)%2?'--floor':'--floor2');
  }
}
/* ---------- 場景底圖 ---------- */
const SCENE_BG = {};                          // 存各場景的圖
function loadBg(scene, src){
  const img = new Image();
  img.src = src;
  SCENE_BG[scene] = img;
}
const SCENE_FG = {};                       // 前景圖（畫在人物上面）
function loadFg(scene, src){ const img=new Image(); img.src=src; SCENE_FG[scene]=img; }
loadFg('office', 'office_desk.png');       // 整張透明、只有桌子的那張
loadBg('office', 'office.png');               // 辦公室用你的圖
loadBg('office_grown', 'office_grown.png');   // 孩子長成幼兒後的辦公室
loadBg('office_18', 'office_18.png');         // 18 世紀辦公室（沒放就退回 office.png）
loadBg('port', 'port.png');                   // 港口底圖（320×288）
loadFg('port', 'port_fg.png');                   // 港口底圖（320×288）
loadBg('cafe_17', 'cafe_17.png');             // 17 世紀café（不放的話 17 世紀是色塊）
loadBg('cafe_18', 'cafe_18.png');
loadBg('farm', 'farm.png');
loadBg('farm_18', 'farm_18.png');             // 18 世紀農牧地（沒放就退回 farm.png）
loadFg('kitchen', 'kitchen_fg.png');       // 廚房前景（只畫要蓋過人物的部分，其餘透明）  
loadFg('cafe', 'cafe_fg.png'); 
loadFg('farm', 'farm_fg.png'); 
loadBg('kitchen', 'kitchen.png');             // 廚房底圖

const PLAYER_IMG = new Image();
PLAYER_IMG.src = 'player.png';   // 你的小人圖
const CAPTAIN_GUN_IMG = new Image();
CAPTAIN_GUN_IMG.src = 'captain_gun.png';   // 整套拿武器造型，256×192，格式同 captain
const SIT_IMG = new Image();
SIT_IMG.src = 'sit.png';   // 坐著的樣子（背面）
const SLEEP_IMG = new Image();
SLEEP_IMG.src = 'sleep.png';   // 睡覺的樣子
const BAKE_IMG=[new Image(),new Image()];   // 烤東西的地圖動畫（兩楨，輪流畫）
BAKE_IMG[0].src='bake1.png';
BAKE_IMG[1].src='bake2.png';
BAKE_IMG[0].src='bake1.png';
BAKE_IMG[1].src='bake2.png';
function draw(){
  ctx.clearRect(0,0,cv.width,cv.height);
  if(curScene==='fishing'){ drawFishing(); return; }
  if(spicyScene && curScene==='office'){
    const ox=Math.round(cam.x*TS), oy=Math.round(cam.y*TS);
    let _s='office'; if((S.child&&S.child.stage>=1)||S.childLeftHome) _s='office_grown';
    const _bg=SCENE_BG[_s+'_'+S.era]||SCENE_BG[_s]||SCENE_BG['office_'+S.era]||SCENE_BG['office'];
    if(_bg && _bg.complete && _bg.naturalWidth) ctx.drawImage(_bg,-ox,-oy,_bg.naturalWidth,_bg.naturalHeight);
    const im=spicyScene.img, mw=mapCols()*TS, mh=mapRows()*TS;
    if(im && im.complete && im.naturalWidth){
      if(spicyScene.phase==='spicy'){
        // _spicy.png 橫向兩楨（整張地圖寬×2），輪播
        const fw=im.naturalWidth/2, fc=Math.floor(Date.now()/350)%2;
        ctx.drawImage(im, fc*fw,0, fw,im.naturalHeight, -ox,-oy, mw,mh);
      }else{
        ctx.drawImage(im, -ox,-oy, mw,mh);
      }
    }
    return;
  }
  const big=sceneDef().big;const ox=Math.round(cam.x*TS),oy=Math.round(cam.y*TS);
  const sx=big?Math.floor(cam.x)-1:0, ex=big?Math.floor(cam.x)+VIEW_COLS+1:mapCols();
  const sy=big?Math.floor(cam.y)-1:0, ey=big?Math.floor(cam.y)+VIEW_ROWS+1:mapRows();
  let _bgScene=curScene;
  if(curScene==='office' && ((S.child && S.child.stage>=1) || S.childLeftHome)) _bgScene='office_grown';
  if(curScene==='cafe') _bgScene='cafe_17';   // 餐廳固定用這張，不隨時代換
  const bg = SCENE_BG[_bgScene+'_'+S.era] || SCENE_BG[_bgScene] || SCENE_BG[curScene+'_'+S.era] || SCENE_BG[curScene];
  if (bg && bg.complete && bg.naturalWidth) {
    // 這個場景有底圖且載入好了 → 鋪滿整個舞台
    ctx.drawImage(bg, -ox, -oy, bg.naturalWidth, bg.naturalHeight);
  } else {
    // 沒圖（或還沒載入）→ 用原本的色塊格子
    for(let y=sy;y<ey;y++)for(let x=sx;x<ex;x++){
      const ch=tileAt(x,y);
      ctx.fillStyle=cssVar(tileColor(ch,x,y));
      ctx.fillRect(x*TS-ox,y*TS-oy,TS,TS);
    if(ch==='W'||ch==='F'||ch==='B'){ctx.fillStyle='#00000022';ctx.fillRect(x*TS-ox,y*TS-oy+TS-3,TS,3);}
    }
  }
  // 蛋箱：依「有蛋的箱數」疊上整張地圖大小的圖（位置畫死在圖裡，所以精準）
  if(curScene==='farm'){
    const nb=eggBoxes();
    for(let i=0;i<nb;i++){ const eb=npcImg(EGG_BOX_IMG[i]);
      if(eb&&eb.complete&&eb.naturalWidth) ctx.drawImage(eb, -ox, -oy, mapCols()*TS, mapRows()*TS); }
    for(const z in FEED_BOWL_IMG){ if(!bowlFull(z)) continue;   // 餵過的那區→疊滿盆圖
      const fb=npcImg(FEED_BOWL_IMG[z]);
      if(fb&&fb.complete&&fb.naturalWidth) ctx.drawImage(fb, -ox, -oy, mapCols()*TS, mapRows()*TS); }
  }
  // DEBUG：顯示碰撞格（對齊家具用，調好後把 DEBUG 改成 false）
// DEBUG：作物格範圍（每框=一株=CELL×CELL）。Console 打 DEBUG_CROPCELL=true 開啟
  if (window.DEBUG_CROPCELL && curScene==='farm') {
    ctx.lineWidth=1; ctx.strokeStyle='rgba(20,120,255,.95)';
    ctx.font='9px monospace'; ctx.fillStyle='rgba(10,80,200,.95)'; ctx.textAlign='left'; ctx.textBaseline='top';
    for(const z of FARM_ZONES){ if(z.kind!=='plot') continue;
      for(let cy=Math.floor(z.y1/CELL)*CELL; cy<=z.y2; cy+=CELL)
      for(let cx=Math.floor(z.x1/CELL)*CELL; cx<=z.x2; cx+=CELL){
        const X=cx*TS-ox, Y=cy*TS-oy;
        ctx.strokeRect(X+0.5,Y+0.5,CELL*TS,CELL*TS);
        ctx.fillText(cx+','+cy, X+2, Y+1);
      }
    }
  }
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(const o of sceneDef().objects){
    if((curScene==='office' && officeNpcs[o.id]) || (curScene==='port' && portNpcs[o.id])) continue;
    let icon=o.e;
    if(o.kind==='farm'){const p=S.plots[o.plotIdx];icon=!p||p.stage==='empty'||!p.stage?'🟫':p.stage==='growing'?'🌱':CROPS[p.crop].e;}
    if(o.kind==='animals'){const n=S.animals[o.atype].length;if(n===0)icon='⬜';}
if(o.kind==='oven'&&prep.inOven){const t=Date.now()-prep.ovenStart;icon=t>BURN_MS?'💀':'🔥';}
    if(o.kind==='child'&&S.child){ icon=S.child.crying?'😢':CHILD_STAGES[S.child.stage].e; }
    if(o.kind==='child' && S.child && S.child.stage===0){
      const bi=npcImg('child_baby.png');
      if(bi&&bi.complete&&bi.naturalWidth){
        const rows=Math.max(1,Math.round(bi.naturalHeight/64)), ry=Math.min(S.child.crying?1:0,rows-1);
        ctx.globalAlpha=1; ctx.drawImage(bi, 0, ry*64, 64,64, o.x*TS-ox+TS/2-32, o.y*TS-oy+TS/2-64+14, 64,64);
        continue;
      }
    }
    if(o.id==='cat'){
      const ci=npcImg('cat.png');
      if(ci&&ci.complete&&ci.naturalWidth){
        ctx.globalAlpha=1;
        ctx.drawImage(ci, 0,0, ci.naturalWidth, ci.naturalHeight, o.x*TS-ox+TS/2-32, o.y*TS-oy+TS/2-64+14, 64,64);
        continue;
      }
    }
    if(o.hide){ continue; }   // 標了 hide:true 的物件不畫圖示／底色（互動仍有效）
    if(curScene!=='farm'){ctx.fillStyle=cssVar('--counter');ctx.fillRect(o.x*TS-ox+1,o.y*TS-oy+1,TS-2,TS-2);}
    ctx.font='13px serif';ctx.fillText(icon,(o.x+0.5)*TS-ox,(o.y+0.5)*TS-oy);
  }
/* ---------- 通用：經過會切換開/關的整張地圖門（兩楨動畫） ---------- */
/* 圖規格：整張地圖大小、橫向兩楨 → 寬 = 地圖寬×2、高 = 地圖高。
   左楨=關著、右楨=打開。玩家靠近 (tx,ty) 在 near 格內 → 顯示「打開」那楨。
   tx,ty 只是用來偵測距離（門大概在哪一格），不影響畫的位置。 */
const FLAPS=[
  { scene:'cafe', img:'cafe_flap.png', tx:5, ty:8, near:2.0 },
  // 港口以後加，例如：
  { scene:'port', img:'port_flap1.png', tx:19, ty:18, near:3.0 },
  { scene:'port', img:'port_flap2.png', tx:27, ty:18, near:3.0 },
  { scene:'port', img:'port_flap3.png', tx:36, ty:18, near:3.0 },
  { scene:'port', img:'port_flap4.png', tx:44, ty:18, near:3.0 },
  { scene:'scott_office', img:'scott_office_flap.png', tx:18, ty:15, near:4.0 },
];
function drawFlaps(ox,oy){
  for(const f of FLAPS){
    if(f.scene!==curScene) continue;
    const img=npcImg(f.img);
    if(!(img && img.complete && img.naturalWidth)) continue;   // 沒圖就不畫（不卡死）
    const open = Math.hypot(player.x-f.tx, player.y-f.ty) <= (f.near||1.4);
    const fw=img.naturalWidth/2;          // 兩楨：左關、右開
    const sx=open ? fw : 0;
    ctx.drawImage(img, sx,0, fw,img.naturalHeight, -ox,-oy, mapCols()*TS, mapRows()*TS);
  }
}
drawCafeFood(ox,oy);   // 餐廳擺盤食物：畫在物件之後、人物之前 → 會被人物蓋住
drawStorageBarrels(ox,oy);   // 桶子：畫在人物之前 → 人會站在桶子前面
  if(curScene==='farm'){
    const SZ=CELL*TS;
    for(const key in S.crops){
      const c=S.crops[key], def=FARM_CROPS[c.crop]; if(!def) continue;
      let img=def._img;
      if(c.crop==='tulip' && c.tulipColor){ const ti=npcImg('tulip_'+c.tulipColor+'.png'); if(ti&&ti.complete&&ti.naturalWidth) img=ti; }
      if(!(img.complete && img.naturalWidth)) continue;
      const [tx,ty]=key.split(',').map(Number);
      const fr=def.frame[c.stage]||0;
      if(c.watered){ ctx.globalAlpha=1; ctx.fillStyle='rgba(60,38,20,.32)'; ctx.fillRect(tx*TS-ox, ty*TS-oy, SZ, SZ); }
      ctx.drawImage(img, fr*def.fw,0,def.fw,def.fh, tx*TS-ox, ty*TS-oy, SZ, SZ);
      if(!c.watered && c.stage<def.stages.length-1){ ctx.globalAlpha=1; ctx.fillStyle='#7fb6c4'; ctx.font='12px serif'; ctx.fillText('💧',(tx+CELL/2)*TS-ox,(ty)*TS-oy); }
    }
  }
  if(curScene==='farm'){ ctx.globalAlpha=1; ctx.textAlign='center';ctx.textBaseline='middle';
    const _si=npcImg('snake.png');
    for(const m of monsters){ const mx=m.x*TS+TS/2-ox, my=m.y*TS+TS/2-oy;
      ctx.globalAlpha=1; ctx.fillStyle='#00000022';
      ctx.beginPath();ctx.ellipse(mx-3,my+2,12,2.5,0,0,Math.PI*2);ctx.fill();
      if(_si&&_si.complete&&_si.naturalWidth){ const fr=(m.frame>0?1:0)*32, flip=(m.facing==='left');
        if(flip){ ctx.save(); ctx.translate(mx,0); ctx.scale(-1,1); ctx.drawImage(_si, fr,0,32,32, -16, my-32+6, 32,32); ctx.restore(); }
        else ctx.drawImage(_si, fr,0,32,32, mx-16, my-32+6, 32,32); }
      else { ctx.fillStyle='#000'; ctx.font='18px serif'; ctx.fillText('🐍', mx, my); } }
    const _ti=npcImg('throw_toxin.png');
    for(const s of shots){ const sx=s.x*TS+TS/2-ox, sy=s.y*TS+TS/2-oy;
      if(_ti&&_ti.complete&&_ti.naturalWidth){ ctx.drawImage(_ti, 0,0,_ti.naturalWidth,_ti.naturalHeight, sx-16, sy-16, 32,32); }
      else { ctx.fillStyle='#000'; ctx.font='14px serif'; ctx.fillText('🧪', sx, sy); } }
  }
  if(curScene==='farm') drawChickens(ox,oy);
  if(curScene==='farm') drawPigs(ox,oy);
  if(curScene==='farm') drawCows(ox,oy);
  if(curScene==='farm') drawAppleDrops(ox,oy);
  if(curScene==='farm') drawFarmNpcs(ox,oy);
  if(curScene==='office') drawOfficeNpcs(ox,oy);
  if(curScene==='port'){ drawGuildSitters(ox,oy); drawPortNpcs(ox,oy); }
   // === 烤箱運作：兩楨地圖動畫（畫在人物下面）===
  if (curScene==='kitchen' && prep.inOven){
    const bf=BAKE_IMG[Math.floor(Date.now()/350)%BAKE_IMG.length];
    if (bf && bf.complete && bf.naturalWidth) ctx.drawImage(bf, -ox, -oy, mapCols()*TS, mapRows()*TS);
  }
  drawFlaps(ox,oy);   // 門：畫在人物之前 → 人會站在門前面
  const px=player.x*TS+TS/2-ox, py=player.y*TS+TS/2-oy;
  if(intimCG){
    if(Date.now()<intimCG.until){
      if(curScene==='office'){ const _im=intimCG.img;
        if(_im&&_im.complete&&_im.naturalWidth){
          const fh=_im.naturalHeight, fc=Math.max(1,Math.round(_im.naturalWidth/fh)), fi=Math.floor(Date.now()/350)%fc;
          ctx.globalAlpha=1;
          ctx.drawImage(_im, fi*fh,0, fh,fh, intimCG.x*TS+TS/2-ox-32, intimCG.y*TS+TS/2-oy-64+14, 64,64); } }
      const _fg=SCENE_FG[curScene];                                              // ← 補畫前景，桌子才不會消失
      if(_fg && _fg.complete && _fg.naturalWidth) ctx.drawImage(_fg, -ox, -oy, mapCols()*TS, mapRows()*TS);
      return;
    } else intimCG=null;
  }

   if (sitting || sleeping) {
    // 坐著：這裡先不畫，人物消失（坐姿圖留到最後畫，蓋過桌子）
  } else {
    // 沒坐：照常畫影子＋走路的小人
    ctx.fillStyle='#00000022';
    ctx.beginPath();ctx.ellipse(px+1,py+2,9,5,0,0,Math.PI*2);ctx.fill();
    if (PLAYER_IMG.complete && PLAYER_IMG.naturalWidth) {
      const spriteW=64, spriteH=64;
      const dirCols={ down:0, left:1, right:2, up:3 };
      const colIndex=dirCols[player.facing]||0;
      const sx=colIndex*spriteW;
      const sy=animFrame*spriteH;
      ctx.drawImage(PLAYER_IMG, sx, sy, spriteW, spriteH, px-32, py-64+14, 64, 64);
    } else {
      ctx.font='24px serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('🧑‍🌾', px, py);
    }
  }

// DEBUG：人物碰撞點。Console 打 DEBUG_PLAYER=true 開啟
 if(window.DEBUG_SENSE){
    const bx=Math.round(player.x), by=Math.round(player.y);
    ctx.strokeStyle='rgba(0,180,80,.85)'; ctx.lineWidth=1;
    ctx.strokeRect((bx-SENSE)*TS-ox+0.5,(by-SENSE)*TS-oy+0.5,(SENSE*2+1)*TS,(SENSE*2+1)*TS);
  }
 // === 前景：桌子畫在人物之後 → 蓋在人物上面 ===
  const fg = SCENE_FG[curScene];
  if (fg && fg.complete && fg.naturalWidth) {
    ctx.drawImage(fg, -ox, -oy, mapCols()*TS, mapRows()*TS);
  }
   
  if(curScene==='kitchen') drawKitchenPickups(ox,oy);   // 桌上食物：畫在前景(餐桌)之上


// === 坐姿圖：畫在最上面，連桌子都蓋過去 ===
  if (sitting && SIT_IMG.complete && SIT_IMG.naturalWidth) {
    ctx.drawImage(SIT_IMG, -ox, -oy, mapCols()*TS, mapRows()*TS);
  }

  // === 睡姿圖：一樣畫在最上面 ===
  if (sleeping && SLEEP_IMG.complete && SLEEP_IMG.naturalWidth) {
    ctx.drawImage(SLEEP_IMG, -ox, -oy, mapCols()*TS, mapRows()*TS);
  }
}