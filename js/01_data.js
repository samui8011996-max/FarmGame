const NS='happy_farm_';
const HOUR=3600*1000, DAY=24*HOUR;
const TS=16, VIEW_COLS=20, VIEW_ROWS=18;
const cv=document.getElementById('game'), ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=false;

/* ---------- static data ---------- */
const CROPS={
  strawberry:{nm:'草莓',e:'🍓',base:8,seed:3,grow:DAY,volat:'big'},

};
const ANIMALS={
  chicken:{nm:'雞',e:'🐔',cub:5,feed:1,prod:'egg',cycle: 30000,mode:'produce',growFeed:2},
  cow:{nm:'牛',e:'🐄',cub:25,feed:3,prod:'milk',cycle: 30000,mode:'produce',growFeed:2},
  pig:{nm:'豬',e:'🐖',cub:13,feed:2,prod:'pork',cycle:3,mode:'fatten',growFeed:2},
};
const PRODUCTS={
  strawberry:{nm:'草莓',e:'🍓',base:8,volat:'big'},
  corn:{nm:'玉米',e:'🌽',base:4,volat:'small'},
  potato:{nm:'馬鈴薯',e:'🥔',base:4,volat:'small'},
  apple:{nm:'蘋果',e:'🍎',base:6,volat:'small'},
  tomato:{nm:'番茄',e:'🍅',base:5,volat:'small'},
  lemon:{nm:'檸檬',e:'🍋',base:6,volat:'small'},
  olive_oil:{nm:'橄欖油',e:'🫒',base:12,volat:'mid'},
  egg:{nm:'雞蛋',e:'🥚',base:10,volat:'mid'},
  milk:{nm:'牛奶',e:'🥛',base:10,volat:'mid'},
  cheese:{nm:'乳酪',e:'🧀',base:18,volat:'mid'},
  butter:{nm:'奶油',e:'🧈',base:14,volat:'mid'},
  pork:{nm:'豬肉',e:'🥓',base:10,volat:'mid'},
  beef:{nm:'牛肉',e:'🥩',base:12,volat:'mid'},
  chicken_meat:{nm:'雞肉',e:'🍗',base:6,volat:'small'},
  turkey_meat:{nm:'火雞肉',e:'🍖',base:7,volat:'small'},
  herring:{nm:'鯡魚',e:'🐟',base:6,volat:'small'},
  mackerel:{nm:'鯖魚',e:'🐟',base:9,volat:'mid'},
  cod:{nm:'鱈魚',e:'🐠',base:18,volat:'mid'},
  salmon:{nm:'鮭魚',e:'🐟',base:34,volat:'big'},
  halibut:{nm:'大比目魚',e:'🐠',base:70,volat:'big'},
};
const EXTRAS={
  flour:{nm:'麵粉',e:'🌾',price:2},
  sugar:{nm:'糖',e:'🧂',price:1},
  w:{nm:'糖',e:'🧂',price:1},
  olive_oil:{nm:'橄欖油',e:'🫒',price:8}};
const RECIPES={
  // 旗標：known=一開始就會（免猜免買）；shop=商店可買（learnCost當售價）。都不寫＝只能瞎猜解鎖
  scone:{nm:'斯康餅',e:'🥯',price:16,batch:30,knead:2,bakeMs:5000,known:true,
    ingredients:{milk:1, egg:1, flour:1, butter:2}},
  strawberry_tart:{nm:'草莓塔',e:'🍰',price:28,batch:30,knead:4,shop:true,learnCost:60,
    ingredients:{strawberry:2, flour:1, sugar:1}},
  pancake:{nm:'鬆餅',e:'🥞',price:18,batch:30,knead:3,bakeMs:5000,shop:true,learnCost:80,
    ingredients:{egg:2, milk:1, flour:1, sugar:1}},
  stargazy_pie:{nm:'仰望星空派',e:'🥧',price:45,batch:30,knead:4,bakeMs:10000,shop:true,learnCost:120,
    ingredients:{herring:4, egg:1, flour:1, potato:1}},
    pasta:{nm:'義大利麵',e:'🍝',price:22,batch:30,knead:5,bakeMs:8000,
    ingredients:{tomato:1, olive_oil:1, flour:1}},
  grilled_fish:{nm:'烤魚',e:'🐟',price:30,batch:30,knead:0,bakeMs:10000,
    ingredients:{mackerel:1, olive_oil:1, lemon:1}},
  pork_knuckle:{nm:'烤豬腳',e:'🍖',price:35,batch:30,knead:0,bakeMs:10000,
    ingredients:{pork:1, potato:1}},
};
const QUAL_MUL={bad:0.5,normal:1,good:1.8};
const STORE_CAP=200;
const BAKE_MS=10000, BURN_MS=20000;
/* ---------- 農作物表（要加新作物就在這裡加一筆） ---------- */
const FARM_CROPS={
  strawberry:{ nm:'草莓', img:'strawberry.png', fw:32, fh:32,
    stages:['播種','發芽','成長','開花','結果'], frame:[0,1,2,3,4],
    grow:30000, yield:3, seed:3 },
  corn:{ nm:'玉米', img:'corn.png', fw:32, fh:32,
    stages:['播種','發芽','成長','開花','結果'], frame:[0,1,2,3,4],
    grow:40000, yield:4, seed:2 },
    potato:{ nm:'馬鈴薯', img:'potato.png', fw:32, fh:32,
    stages:['播種','發芽','成長','開花','結果'], frame:[0,1,2,3,4],
    grow:30000, yield:3, seed:2 },
    tomato:{ nm:'番茄', img:'tomato.png', fw:32, fh:32,
    stages:['播種','發芽','成長','開花','結果'], frame:[0,1,2,3,4],
    grow:30000, yield:3, seed:2 },
  lemon:{ nm:'檸檬', img:'lemon.png', fw:32, fh:32,
    stages:['播種','發芽','成長','開花','結果'], frame:[0,1,2,3,4],
    grow:40000, yield:3, seed:3 },
};
for(const k in FARM_CROPS){ const d=FARM_CROPS[k];   // 預載圖＋算每階段時間
  d._img=new Image(); d._img.src=d.img;
  d.stageMs=d.grow/(d.stages.length-1);
}
function fmtSec(ms){const s=Math.max(0,Math.ceil(ms/1000));return s>=60?Math.ceil(s/60)+'分':s+'秒';}     // 之後可加品質/施肥

/* ---------- 時代系統（第一步：解鎖門檻） ---------- */
const CROP_ERA={ strawberry:17, corn:17, potato:17, tomato:17, lemon:17,
                  };          
const RECIPE_ERA={ strawberry_tart:17, stargazy_pie:17 };
function cropEra(k){ return CROP_ERA[k]||17; }
function recipeEra(k){ return RECIPE_ERA[k]||17; }
function recipeKnown(k){ const r=RECIPES[k]; return !!(r && (r.known || (S&&S.recipesCooked&&S.recipesCooked[k]))); }
/* ---------- 裝潢系統 ---------- */
const DECOR={
  17:{
    sign:   [{id:'wood_sign',   nm:'木製招牌',  price:40,  cap:4,  buff:'每日客流上限 +4'}],
    counter:[{id:'wood_counter',nm:'原木吧檯',  price:60,          buff:'基礎吧檯'}],
    floor:  [{id:'stone_floor', nm:'石板地牆',  price:50,          buff:'基礎裝潢'}],
  },
  18:{
    sign:   [{id:'carved_sign', nm:'雕花招牌',  price:120, cap:8,  buff:'每日客流上限 +8'}],
    counter:[{id:'tile_counter',nm:'磁磚吧檯',  price:160,         buff:'洛可可風'}],
    floor:  [{id:'rococo_floor',nm:'洛可可磁磚',price:140,         buff:'氛圍提升'}],
  },
  19:{
    sign:   [{id:'brass_sign',  nm:'黃銅招牌',  price:300, cap:14, buff:'每日客流上限 +14'}],
    counter:[{id:'iron_counter',nm:'工業吧檯',  price:360,         buff:'維多利亞風'}],
    floor:  [{id:'marble_floor',nm:'大理石地牆',price:320,         buff:'氛圍提升'}],
    light:  [{id:'chandelier',  nm:'水晶吊燈',  price:400,         buff:'解鎖夜間營業'}],
  },
};
function blankDecor(){ const o={}; for(const era in DECOR){ o[era]={}; for(const slot in DECOR[era]) o[era][slot]=null; } return o; }
function decorDone(era){ const cat=DECOR[era]||{}; return Object.keys(cat).every(s=>S.decor[era]&&S.decor[era][s]); }
function decorCap(){ const cat=DECOR[S.era]; if(!cat||!cat.sign)return 0; const id=S.decor[S.era].sign; if(!id)return 0; const o=cat.sign.find(x=>x.id===id); return o&&o.cap?o.cap:0; }
function slotName(s){ return {sign:'招牌',counter:'吧檯／廚具',floor:'地板＋牆面',light:'燈光'}[s]||s; }
function openDecor(){
  const era=S.era, cat=DECOR[era]||{}; let body='';
  for(const slot in cat){
    body+=`<b class="small">${slotName(slot)}</b>`;
    for(const opt of cat[slot]){
      const owned=S.decor[era][slot]===opt.id;
      body+=`<div class="row"><div class="e">🎨</div>
        <div class="info"><div class="n">${opt.nm}</div><div class="d">${opt.buff}</div></div>
        <div class="price">$${opt.price}</div>
        <button class="btn sm ${owned?'green dis':''}" onclick="${owned?'':`buyDecor('${slot}','${opt.id}')`}">${owned?'已裝':'安裝'}</button></div>`;
    }
  }
  const done=decorDone(era);
  openSheet(`<div class="sheethead"><h3>🎨 裝潢店面・${era}世紀</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:8px">💰 現金 $${fmt(S.cash)}・本時代裝潢 ${done?'<b style="color:var(--accent2)">已完成</b>':'未完成（升時代需全部裝好）'}</div>${body}`);
}
function buyDecor(slot,id){
  const opt=(DECOR[S.era][slot]||[]).find(o=>o.id===id); if(!opt)return;
  if(S.decor[S.era][slot]===id){toast('已經裝好了');return;}
  if(S.cash<opt.price){toast('現金不足');return;}
  spend(opt.price,`裝潢：${opt.nm}`); S.decor[S.era][slot]=id;
  toast(`🎨 裝好了 ${opt.nm}`); openDecor(); save();
}
/* ---------- 升時代 ---------- */
const ERA_REQ={
  17:{ money:800,  childAff:30, next:18 },
  18:{ money:3000, childAff:60, next:19 },
};
function eraStatus(){
  const r=ERA_REQ[S.era];
  if(!r) return {max:true};
  const moneyOK = netWorth()>=r.money;
  const decorOK = decorDone(S.era);
  const childOK = S.era===18
    ? (S.childLeftHome===true)                              // 升 19 世紀：孩子必須已長大離家
    : (!S.child || (S.child.affinity||0)>=r.childAff);      // 其他時代：好感達標（沒小孩不擋）
  return { r, moneyOK, decorOK, childOK, ok: moneyOK&&decorOK&&childOK, max:false };
}
function openEra(){
  const st=eraStatus();
  if(st.max){
    openSheet(`<div class="sheethead"><h3>📅 時代進程</h3><button class="close" onclick="closeSheet()">✕</button></div>
      <div class="empty-note">已經是最後的 ${S.era} 世紀了。</div>`);
    return;
  }
  const r=st.r;
  const row=(ok,txt)=>`<div class="row"><div class="e">${ok?'✅':'⬜'}</div><div class="info"><div class="n">${txt}</div></div></div>`;
  const childLine = (S.era===18)
    ? row(!!S.childLeftHome, S.childLeftHome?`孩子已長大離家`:`孩子尚未離家（需養到少年期結束）`)
    : (S.child
        ? row(st.childOK, `小孩好感 ${S.child.affinity||0} / ${r.childAff}`)
        : row(true, `小孩好感（尚未有小孩，暫不限制）`));
  openSheet(`<div class="sheethead"><h3>📅 邁向 ${r.next} 世紀</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:8px">三項都達成即可推進，時代不可回頭。</div>
    ${row(st.moneyOK, `淨資產 ${fmt(netWorth())} / ${r.money}`)}
    ${row(st.decorOK, `本時代裝潢全部裝好`)}
    ${childLine}
    <div style="margin-top:12px"><button class="btn ${st.ok?'':'dis'}" style="width:100%" onclick="advanceEra()">${st.ok?'🚀 推進到下一個世紀':'條件未達成'}</button></div>`);
}
function advanceEra(){
  const st=eraStatus(); if(st.max||!st.ok){toast('條件還沒達成');return;}
  const from=S.era, to=st.r.next;
  S.era=to;
  let childMsg='';
  if(S.child && typeof growChild==='function'){ growChild(); childMsg='孩子也長大了一些。'; }
  addLog(`📅 邁入 ${to} 世紀！`);
  closeSheet(); save(); refreshTop();
  eraCutscene(from,to,childMsg);
}
function eraCutscene(from,to,extra){
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:90;background:#3a2c1c;color:#f4ecd9;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;opacity:0;transition:opacity .6s;font-family:inherit';
  ov.innerHTML=`<div style="font-size:46px;margin-bottom:10px">⏳</div>
    <div style="font-size:22px;font-weight:700;letter-spacing:2px;margin-bottom:6px">時光流轉</div>
    <div style="font-size:15px;opacity:.85">${from} 世紀 → ${to} 世紀</div>
    <div style="font-size:14px;opacity:.8;margin-top:14px;max-width:300px;line-height:1.6">店面煥然一新，新的作物與甜點即將登場。${extra}</div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(()=>ov.style.opacity=1);
  setTimeout(()=>{ ov.style.opacity=0; setTimeout(()=>ov.remove(),700); refreshTop(); toast(`🎉 歡迎來到 ${to} 世紀`); }, 2400);
}
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