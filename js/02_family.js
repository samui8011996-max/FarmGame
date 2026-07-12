/* ---------- 小孩系統 ---------- */
const CHILD_STAGES=[
  {key:'baby',   nm:'嬰兒', e:'👶', need:'餵奶／哄睡'},
  {key:'toddler',nm:'幼兒', e:'🧒', need:'陪玩'},
  {key:'child',  nm:'兒童', e:'🧑', need:'陪玩／幫忙'},
  {key:'teen',   nm:'少年', e:'🧑‍🎓', need:'陪伴'},
];
const CHILD_CRY_MS=45000, CHILD_CARE_CD=12000, CHILD_CARE_GAIN=2;

function childLines(){
  const c=S.child; if(!c) return ['……'];
  return byStage[S.era] || byStage.any || byStage[17] || ['……'];
}

let _childChoices=[];
function childSay(text, choices){
  const c=S.child; if(!c) return;
  const st=CHILD_STAGES[c.stage];
  _childChoices=choices||[];
  const btns=_childChoices.map((ch,i)=>`<button class="btn ${ch.cls||''}" style="width:100%;margin-bottom:6px" onclick="childChoice(${i})">${ch.t}</button>`).join('');
  openSheet(`<div class="sheethead"><h3>${st.e} ${c.name}</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div style="text-align:center;margin:2px 0 10px;font-size:56px">${st.e}</div>
    <div style="background:var(--card);border:2px solid var(--line2);border-radius:12px;padding:12px;margin-bottom:14px;font-size:14px;line-height:1.5">${text}</div>${btns}`);
}
function childChoice(i){ const ch=_childChoices[i]; if(ch&&ch.run) ch.run(); }
function talkChild(){
  const c=S.child; if(!c) return;
  freezeNpcById('crib');
  const pool=CHILD_TOPICS[CHILD_STAGES[c.stage].key]||[];
  if(!pool.length){ childSay('……',[{t:'返回', cls:'green', run:()=>openChild()}]); return; }
  const topic=pool[Math.floor(Math.random()*pool.length)];
  const choices=topic.a.map(opt=>({ t:opt.t, run:()=>{
    const cap=childAffCap(), before=c.affinity;
    c.affinity=Math.min(cap, c.affinity+(opt.g||0));
    const gained=c.affinity-before;
    growChild(); if(curScene==='office') buildOfficeNpcs(); save();
    if(!S.child) return;
    const tag = (opt.g>0) ? (gained>0?`（好感 +${gained}）`:'（這個時代好感已封頂）') : '';
    childSay(`${opt.r}${tag}`, [
      {t:'再聊聊', run:()=>talkChild()},
      {t:'結束', cls:'green', run:()=>openChild()} ]);
  }}));
  childSay(topic.q, choices);
}
/* ---------- 腳本式對話：多句、頭像會換、最後才選擇 ---------- */
let _convoCid=null, _dlgBtns=[];
function dlgBtn(i){ const b=_dlgBtns[i]; if(b&&b.run) b.run(); }
function speakerFace(ln){
  if(ln.who==='me'){ const m={neutral:'🙂',happy:'😊',warm:'🥰',think:'🤔',soft:'😌',sad:'😟',laugh:'😄'}; return m[ln.mood]||'🙂'; }
  if(ln.who==='child'){ return S.child?CHILD_STAGES[S.child.stage].e:'🧒'; }
  return charFace(_convoCid, ln.mood);
}
function speakerName(ln){
  if(ln.who==='me') return '我';
  if(ln.who==='child') return (S.child&&S.child.name)||'孩子';
  return charName(_convoCid);
}
function dlgLine(ln, buttons){
  const face=speakerFace(ln);
  const faceHtml = /\.(png|jpe?g|gif|webp)$/i.test(face)
    ? `<img src="${face}" style="width:96px;height:96px;object-fit:contain;image-rendering:pixelated">`
    : `<span style="font-size:56px">${face}</span>`;
  _dlgBtns=buttons;
  const btns=buttons.map((b,i)=>`<button class="btn ${b.cls||''}" style="width:100%;margin-bottom:6px" onclick="dlgBtn(${i})">${b.t}</button>`).join('');
  openSheet(`<div class="sheethead"><h3>${speakerName(ln)}</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div style="text-align:center;margin:2px 0 10px">${faceHtml}</div>
    <div style="background:var(--card);border:2px solid var(--line2);border-radius:12px;padding:12px;margin-bottom:14px;font-size:14px;line-height:1.5">${ln.t}</div>${btns}`);
}
function runScript(lines, endButtons){
  let i=0;
  const step=()=>{ const ln=lines[i];
    if(i<lines.length-1) dlgLine(ln, [ {t:'▶ 繼續', run:()=>{ i++; step(); }} ]);
    else dlgLine(ln, endButtons);
  };
  if(lines && lines.length) step();
}


function openChild(){
  if(!S.child){
    if(S.childLeftHome){
      openSheet(`<div class="sheethead"><h3>👶 搖籃</h3><button class="close" onclick="closeSheet()">✕</button></div>
        <div class="empty-note">阿爾弗雷德已經長大離家了。</div>`);
      return;
    }
    S.child={ name:'阿爾弗雷德·F·瓊斯', stage:0, affinity:0, lastCare:Date.now(), crying:false, bornTs:Date.now() };
    addLog('👶 阿爾弗雷德·F·瓊斯 來到了這個家'); save();
  }
  freezeNpcById('crib');
  const c=S.child;
  const st=CHILD_STAGES[c.stage];
  const status=c.crying?'😢 正在哭，需要安撫':'😊 心情不錯';
  openSheet(`<div class="sheethead"><h3>${st.e} ${c.name}・${st.nm}</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:6px">好感 ${c.affinity}・需要：${st.need}</div>
    <div class="small" style="margin-bottom:12px">${status}</div>
    <button class="btn green" style="width:100%;margin-bottom:8px" onclick="careChild()">${c.crying?'🍼 安撫':'🧸 陪玩'}</button>
    <button class="btn" style="width:100%" onclick="talkChild()">💬 聊聊天</button>
    <div class="small" style="margin-top:10px;color:var(--ink2)">陪玩累積好感就會長大；幼兒之後要進入 18 世紀才會繼續長，少年期養到底就會離家。</div>`);
}
function childReward(){
  if(Math.random()>0.35) return null;
  const pool=[];
  for(const k in FARM_CROPS) if(cropEra(k)<=S.era && !FARM_CROPS[k].hidden) pool.push({t:'seed',k});
  pool.push({t:'extra',k:'flour'},{t:'extra',k:'sugar'});
  const p=pool[Math.floor(Math.random()*pool.length)];
  if(p.t==='seed'){ S.seeds[p.k]=(S.seeds[p.k]||0)+1; return `${FARM_CROPS[p.k].nm}種子`; }
  S.extras[p.k]=(S.extras[p.k]||0)+1; return EXTRAS[p.k].nm;
}
function careChild(){
  const c=S.child; if(!c) return openChild();
  const now=Date.now(), st=CHILD_STAGES[c.stage], cap=childAffCap();
  if(!c.crying && c.affinity>=cap && c.stage>=childCap()){
    toast('這個時代他已經長到極限了，推進世紀才能繼續成長'); return;
  }
  let soothed=false;
  if(c.crying){
    c.crying=false; c.lastCare=now; c.affinity=Math.min(cap, c.affinity+CHILD_CARE_GAIN);
    const item=childReward();
    toast(`${st.e} 哄好了，好感 +${CHILD_CARE_GAIN}${item?'，獲得'+item:''}`);
    soothed=true;
  }else if(now-c.lastCare>=CHILD_CARE_CD){
    c.lastCare=now; c.affinity=Math.min(cap, c.affinity+1);
    const item=childReward();
    toast(`${st.e} 玩得很開心，好感 +1${item?'，獲得'+item:''}`);
  }else{ toast('孩子正在玩，待會再來'); return; }
  growChild(); if(curScene==='office') buildOfficeNpcs(); save();
  if(soothed){ playSootheCG(); return; }   // 安撫：放兩楨動畫、不重開面板
  if(S.child) openChild();
}
function playSootheCG(){
  closeSheet(); freezeNpcById('crib');
  const npcC=(typeof officeNpcs!=='undefined') && officeNpcs['crib'];
  const cribObj=SCENES.office.objects.find(o=>o.id==='crib');
  const tx=npcC?Math.round(npcC.x):(cribObj?cribObj.x:22);   // CG 落在哪一格 → 改這
  const ty=npcC?Math.round(npcC.y):(cribObj?cribObj.y:8);    //  ↑ 想固定就直接寫死數字
  showIntimCG('child_soothe.png', tx, ty, 2000);             // 圖檔 128×64（兩格）
  setTimeout(unfreezeNpcs, 2000);
}
const CHILD_GROW_AFF=[10,45,70,100];         // 升上去所需好感：嬰兒→幼兒→兒童→少年→離家
function childCap(){ return S.era>=18 ? 3 : 1; }  // 17 世紀最多到幼兒(1)；18 世紀起可到少年(3)
function childAffCap(){ return S.era>=18 ? 999 : 40; }  // 17 世紀好感封頂 40；進 18 世紀才放開繼續長大
function growChild(){
  const c=S.child; if(!c) return;
  const cap=childCap();
  if(c.stage<cap && c.affinity>=CHILD_GROW_AFF[c.stage]){   // 一次只升一階，保證會經過兒童
    c.stage++; c.crying=false; c.lastCare=Date.now();
    toast(`🎉 ${c.name||'孩子'}長大成${CHILD_STAGES[c.stage].nm}了！`);
  }
  if(S.era>=18 && c.stage===3 && c.affinity>=CHILD_GROW_AFF[3]) childLeaveHome();
}
function childLeaveHome(){
  const c=S.child; if(!c) return;
  const nm=c.name||'孩子';
  S.child=null; S.childLeftHome=true; S.childHired=false;
  if(typeof officeNpcs!=='undefined' && officeNpcs['crib']) delete officeNpcs['crib'];
  if(typeof farmNpcs!=='undefined' && farmNpcs['alfred']) delete farmNpcs['alfred'];
  SCENES.office.objects=SCENES.office.objects.filter(o=>o.id!=='crib');   // 連搖籃互動點一起移除
  SCENES.farm.objects=SCENES.farm.objects.filter(o=>o.id!=='alfred');     // 農田的阿爾弗雷德也移除
  addLog(`🎓 ${nm}長大成人，離家追尋自己的人生了。`);
  closeSheet(); save(); refreshTop();
  toast(`🎓 ${nm}離家了，一路順風。`);
}

const PORT_SLOTS=[{x:1,y:11},{x:4,y:11},{x:9,y:11},{x:14,y:11}];
const PORT_REFRESH_MS=60000;
function refreshPort(){
  const ids=Object.keys(MERCHANTS).filter(id=>!(S.partner&&S.partner.id===id) && !MERCHANTS[id].portExempt && (MERCHANTS[id].era||18)<=S.era).sort(()=>Math.random()-0.5);
  const n=1+Math.floor(Math.random()*3);
  S.port.merchants=ids.slice(0,n);
  S.port.lastTs=Date.now();
  S.port.merchants.forEach(id=>{ if(!S.port.relations[id]) S.port.relations[id]={aff:0,met:false,lastChat:0}; });
  buildPortObjects();
}
const PORT_STATIC=[
  {id:'arthur',x:17,y:18,e:'🌷',nm:'波諾弗瓦酒莊商行',kind:'npc',npc:true,avatar:'🌷',sense:1,lines:['販售高品質葡萄酒  成立於1738 '],hide:true},
  {id:'arthur',x:10,y:20,e:'🌷',nm:'黃金鬱金香雜貨店',kind:'npc',npc:true,avatar:'🌷',sense:1,lines:['種苗、飼料、雜貨、骨董 '],hide:true},
  {id:'arthur',x:52,y:20,e:'🌷',nm:'餐廳',kind:'npc',npc:true,avatar:'🌷',sense:1,lines:['各式餐點 '],hide:true},
];
function buildPortObjects(){
  const objs=PORT_STATIC.slice();   // 先放固定物件，再疊商人
  S.port.merchants.forEach((id,i)=>{
    const m=MERCHANTS[id], slot=PORT_SLOTS[i]; if(!m||!slot) return;
    objs.push({ id:'mc_'+id, x:slot.x, y:slot.y, e:m.e, nm:m.nm, kind:'merchant', mid:id, npc:true, avatar:m.e, lines:m.lines });
  });

  
  SCENES.port.objects=objs;
}
function openMerchant(id){
  freezeNpcById('mc_'+id);
  const m=MERCHANTS[id], rel=S.port.relations[id]||(S.port.relations[id]={aff:0,met:false,lastChat:0});
  rel.met=true;
  const goods=m.goods.map((g,gi)=>{
    if(g.kind==='recipe'){
      const known=recipeKnown(g.k);
      return `<div class="row"><div class="e">${recipeIcon(24)}</div><div class="info"><div class="n">${RECIPES[g.k].nm}食譜</div>
        <div class="d">${known?'已學會（看食譜本）':'買了才知道做法'}</div></div>
        <div class="price">$${g.price}</div><button class="btn sm ${known?'dis':''}" onclick="buyMerchantGood('${id}',${gi})">${known?'已學會':'買'}</button></div>`;
    }
    const nm=g.kind==='seed'?(FARM_CROPS[g.k].nm+'種子'):ingNm(g.k);
    const e = prodIcon(g.k, 24);
    const qty=g.qty||1;
    return `<div class="row"><div class="e">${e}</div><div class="info"><div class="n">${nm}${qty>1?' ×'+qty:''}</div></div>
      <div class="price">$${g.price}</div><button class="btn sm" onclick="buyMerchantGood('${id}',${gi})">買</button></div>`;
  }).join('');
  const gardenerBlock = (id==='Matthew') ? (()=>{
    const set=(typeof GARDENER_LINES!=='undefined')?GARDENER_LINES:{idle:['…'],hired:['…']};
    const pool=S.gardenerHired?(set.hired||['…']):(set.idle||['…']);
    const line=pool[Math.floor(Math.random()*pool.length)];
    return `<div class="small" style="margin-bottom:6px">阿爾弗雷德的雙胞胎弟弟，個性比哥哥細心溫柔許多。${S.gardenerHired?'現在正細心地照料倫敦小花園，會自動澆水、養到開花結果，但不會幫你採收。':'常在小花園附近晃悠。'}</div>
      <div style="background:var(--card);border:2px solid var(--line2);border-radius:12px;padding:12px;margin-bottom:10px;font-size:14px;line-height:1.5">${line}</div>
      ${S.gardenerHired
        ? `<button class="btn ghost" style="width:100%;margin-bottom:10px;color:var(--danger)" onclick="fireGardener()">讓他先休息</button>`
        : `<button class="btn green" style="width:100%;margin-bottom:10px" onclick="hireGardener()">雇用他照顧花園</button>`}`;
  })() : '';
  openSheet(`<div class="sheethead"><h3>${m.e} ${m.nm}</h3><button class="close" onclick="closeSheet()">✕</button></div>
    ${gardenerBlock}
    <div class="small" style="margin-bottom:8px">好感 ${rel.aff}・現金 $${fmt(S.cash)}</div>
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <button class="btn green sm" style="flex:1" onclick="chatMerchant('${id}')">💬 聊天</button>
      <button class="btn gold sm" style="flex:1" onclick="openGift('${id}')">🎁 送禮</button></div>
    ${romanceHtml(id,rel)}
    <b class="small">商品</b>${goods}`);
  save();
}
function chatMerchant(id){
  const rel=S.port.relations[id], now=Date.now();
  if(now-(rel.lastChat||0)<8000){ toast('剛聊過了，等一下'); return; }
  const topic=CHAT_TOPICS[Math.floor(Math.random()*CHAT_TOPICS.length)];
  showDialogue(id,'neutral',topic.q, topic.a.map(opt=>({
    t:opt.t,
    run:()=>{
      rel.lastChat=Date.now(); rel.aff+=opt.aff;
      const react=opt.aff>=2?'（眼睛亮了起來）真的嗎？好開心！':opt.aff<=0?'（表情淡淡的）…這樣啊。':'謝謝你。';
      showDialogue(id, opt.mood, react+`（好感 ${opt.aff>=0?'+':''}${opt.aff}）`, [
        {t:'結束對話', run:()=>{ openMerchant(id); save(); }} ]);
    }
  })));
}
function openGift(id){
  const items=[];
  for(const k in S.seeds) if(S.seeds[k]>0) items.push({kind:'seed',k,n:S.seeds[k]});
  for(const k in S.store) if(S.store[k]>0) items.push({kind:'store',k,n:S.store[k]});
  for(const k in S.extras) if(S.extras[k]>0) items.push({kind:'extra',k,n:S.extras[k]});
  const body=items.length?items.map(it=>{
    const nm=it.kind==='seed'?((FARM_CROPS[it.k]?FARM_CROPS[it.k].nm:it.k)+'種子')
           :it.kind==='extra'?(EXTRAS[it.k]?EXTRAS[it.k].nm:it.k)
           :(PRODUCTS[it.k]?PRODUCTS[it.k].nm:(FARM_CROPS[it.k]?FARM_CROPS[it.k].nm:it.k));
    const e = prodIcon(it.k, 24);
    return `<div class="row"><div class="e">${e}</div><div class="info"><div class="n">${nm} <span class="small">×${it.n}</span></div></div>
      <button class="btn sm gold" onclick="giveGift('${id}','${it.kind}','${it.k}')">送</button></div>`;
  }).join(''):'<div class="empty-note">背包沒有可送的東西。</div>';
  openSheet(`<div class="sheethead"><h3>🎁 送禮給 ${MERCHANTS[id].nm}</h3><button class="close" onclick="openMerchant('${id}')">✕</button></div>
    <div class="small" style="margin-bottom:8px">送一個物品 +3 好感。</div>${body}`);
}
function giveGift(id,kind,k){
  const bag=kind==='seed'?S.seeds:(kind==='store'?S.store:S.extras);
  if(!bag[k]||bag[k]<=0){ toast('沒有這個東西'); return; }
  bag[k]--; S.port.relations[id].aff+=3;
  toast(`🎁 ${MERCHANTS[id].nm} 很開心（好感 +3）`);
  openMerchant(id); save();
}
function buyMerchantGood(id,gi){
  const g=MERCHANTS[id].goods[gi], qty=g.qty||1;
  if(g.kind==='recipe'){
    if(S.recipesCooked&&S.recipesCooked[g.k]){ toast('食譜本已經有這道了'); return; }
    if(S.cash<g.price){ toast('現金不足'); return; }
    spend(g.price,`向${MERCHANTS[id].nm}買${RECIPES[g.k].nm}配方`);
    if(!S.recipesCooked) S.recipesCooked={};
    S.recipesCooked[g.k]=true;
    toast(`📖 跟${MERCHANTS[id].nm}學會了 ${RECIPES[g.k].nm} 的做法！`);
    openMerchant(id); save(); return;
  }
  if(S.cash<g.price){ toast('現金不足'); return; }
  spend(g.price,`向${MERCHANTS[id].nm}購買`);
  if(g.kind==='seed') S.seeds[g.k]=(S.seeds[g.k]||0)+qty; else S.extras[g.k]=(S.extras[g.k]||0)+qty;
  toast(`買了 ${g.kind==='seed'?FARM_CROPS[g.k].nm+'種子':ingNm(g.k)}${qty>1?' ×'+qty:''}`);
  openMerchant(id); save();
}
/* ---------- 戀愛＋伴侶 ---------- */
const ROMANCE_AFF=15;
const BREAKUP_INTIMACY=-10;   // 親密度低於此值 → 分手變回朋友
function familyReady(){ return (S.child && S.child.stage>=1) || S.childLeftHome; }   // 養過孩子（現有或已離家）
function isPartnerWorking(){ return false; }   // 已移除上班系統，改用 PARTNER_PERK 一結交就生效
function partnerBuff(job){ return (isPartnerWorking() && S.partner.job===job) ? 1 : 0; }
/* ---------- 同居人被動加成（依對象，住在一起就生效，與上班無關） ---------- */
/* 伴侶被動特殊功能：一結交（同居）就生效，與上班無關 */
const PARTNER_PERK={
  Francis:{ batchMul:1.5 },              // 弗朗西斯：做料理時一批產量更多
  Pedro:  { buyMul:0.8, sellMul:1.3 },   // 佩德羅：商店買更便宜、賣更好價
  Antonio:{ yieldMul:1.5 },              // 安東尼奧：農產品收成量加成
  Alfred: { atkMul:2,   defMul:0.5 },                 // 阿爾：毒物傷害↑（可一擊）、被蛇咬傷害減半
};
function perk(id){ return (S.partner && S.partner.id===id) ? PARTNER_PERK[id] : null; }
function cafeMateCap(){ const p=perk('Alfred');  return (p&&p.cafeCap) ||0; }
function cookBatchMul(){ const p=perk('Francis'); return (p&&p.batchMul)||1; }
function farmYieldMul(){ const p=perk('Antonio'); return (p&&p.yieldMul)||1; }
function shopBuyMul(){ const p=perk('Pedro');    return (p&&p.buyMul) ||1; }
function shopSellMul(){ const p=perk('Pedro');   return (p&&p.sellMul)||1; }
function combatAtkMul(){ const p=perk('Alfred'); return (p&&p.atkMul)||1; }
function combatDefMul(){ const p=perk('Alfred'); return (p&&p.defMul)||1; }
function romanceHtml(id,rel){
  if(S.partner&&S.partner.id===id) return `<div class="small" style="margin-bottom:10px;color:var(--accent2)">💞 你的伴侶（住在家裡）</div>`;
  if(S.partner) return '';
  if(rel.aff>=ROMANCE_AFF && familyReady())
    return `<button class="btn gold" style="width:100%;margin-bottom:10px" onclick="cohabit('${id}')">💞 邀請同居</button>`;
  const why = !familyReady() ? (S.child ? '孩子要養到幼兒以上' : '需要先養育過孩子') : `好感達到 ${ROMANCE_AFF}（目前 ${rel.aff}）`;
  return `<div class="small" style="margin-bottom:10px;color:var(--ink2)">💞 同居條件：${why}</div>`;
}
function cohabit(id){
  const rel=S.port.relations[id];
  if(rel.aff<ROMANCE_AFF){toast('好感還不夠');return;}
  if(!familyReady()){toast('要先養育過孩子（養到幼兒以上）');return;}
  if(S.partner){toast('你已經有伴侶了');return;}
  const m=MERCHANTS[id];
  S.partner={id, job:m.job, working:false, lastBake:Date.now(), intimacy:0, lastIntim:0, newlyMoved:6, wardrobe:{owned:['default'],wearing:'default'}};
  S.port.merchants=S.port.merchants.filter(x=>x!==id); buildPortObjects();
  if(typeof buildLondonNpcs==='function') buildLondonNpcs();   // 馬修同居後就不再是倫敦街上走動的商人
  addLog(`💞 和 ${m.nm} 開始同居`);
  closeSheet(); toast(`💞 ${m.nm} 搬進來一起住了`); save(); goScene('office');
}
function openPartner(){
  const p=S.partner; if(!p){toast('還沒有伴侶');return;}
  freezeNpcById('partner');
  freezeNpcById('partner');
  const m=MERCHANTS[p.id];
  const PERK_DESC={ Francis:'做料理時產量更多', Pedro:'在商店買賣有更好的價格', Antonio:'農產品收成量增加', Alfred:'戰鬥更強（對毒物傷害提高、被咬傷害減半）' };
  const jobNm=PERK_DESC[p.id]||'陪在你身邊';
  const inOffice=curScene==='office';
  openSheet(`<div class="sheethead"><h3>${m.e} ${m.nm}</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:4px">你的伴侶。專長：${jobNm}。</div>
    <div class="small" style="margin-bottom:10px">💕 親密度 ${p.intimacy||0}</div>
    <button class="btn" style="width:100%;margin-bottom:8px" onclick="chatPartner()">💬 聊天</button>
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <button class="btn green sm" style="flex:1" onclick="intimate('kiss')">💋 親親</button>
      <button class="btn green sm" style="flex:1" onclick="intimate('hug')">🤗 抱抱</button>
      <button class="btn gold sm" style="flex:1${inOffice?'':';opacity:.45'}" onclick="intimate('spicy')">🔥 可疑的事</button>
    </div>`);
    /* 已移除：上班切換按鈕、換裝按鈕（如需恢復請看下方備註） */   
}
function togglePartnerWork(){ S.partner.working=!S.partner.working; if(S.partner.working)S.partner.lastBake=Date.now(); toast(S.partner.working?'開始上班':'休息中'); openPartner(); save(); }
function syncPartnerObject(){
  const base=SCENES.office.objects.filter(o=>o.id!=='partner');
  if(S.partner){ const m=MERCHANTS[S.partner.id];
    base.push({id:'partner',x:11,y:11,e:m.e,nm:m.nm,kind:'partner',npc:true,avatar:m.e,
      lines:['今天店裡也很熱鬧呢。','和你在一起真好。','需要我幫忙嗎？']}); }
  SCENES.office.objects=base;
}
/* ---------- 衣櫃 ---------- */
const SKINS={
  default:  { nm:'預設',       walk:'player.png',          price:0 },
  captain:  { nm:'船長服',     walk:'captain.png',         price:0 },
  rococo:   { nm:'洛可可裝',   walk:'player_rococo.png',   price:80,  era:18 },
  victoria: { nm:'維多利亞裝', walk:'player_victoria.png', price:200, era:19 },
};
function applySkin(id){ const s=SKINS[id]||SKINS.default; PLAYER_IMG.src=s.walk; SIT_IMG.src=s.sit||'sit.png'; SLEEP_IMG.src=s.sleep||'sleep.png'; }
function applyCookSkin(){
  if(curScene==='kitchen' && S.cookBy==='partner' && S.partner) PLAYER_IMG.src='partner_'+S.partner.id+'.png';
  if(curScene==='kitchen' && S.cookBy==='partner' && S.partner) PLAYER_IMG.src=partnerSpriteSrc();
  else applySkin(S.wardrobe.wearing);
}
/* ---------- 伴侶衣櫃 ---------- */
const PARTNER_SKINS={
  default:  { nm:'預設',       price:0 },
  rococo:   { nm:'洛可可裝',   price:80,  era:18 },
  victoria: { nm:'維多利亞裝', price:200, era:19 },
};
function partnerSpriteSrc(){
  if(!S.partner) return 'player.png';
  const id=S.partner.id, w=(S.partner.wardrobe&&S.partner.wardrobe.wearing)||'default';
  return 'partner_'+id+(w!=='default'?'_'+w:'')+'.png';
}
function openPartnerWardrobe(){
  if(!S.partner){ toast('還沒有伴侶'); return; }
  freezeNpcById('partner');
  const w=S.partner.wardrobe, nm=(MERCHANTS[S.partner.id]||{}).nm||'伴侶';
  let body='';
  for(const id in PARTNER_SKINS){ const s=PARTNER_SKINS[id];
    const owned=w.owned.includes(id), wearing=w.wearing===id, locked=s.era&&S.era<s.era;
    let btn;
    if(wearing) btn=`<button class="btn sm green dis">穿著中</button>`;
    else if(owned) btn=`<button class="btn sm" onclick="wearPartnerSkin('${id}')">穿上</button>`;
    else if(locked) btn=`<button class="btn sm dis">${s.era}世紀解鎖</button>`;
    else btn=`<button class="btn sm gold" onclick="buyPartnerSkin('${id}')">購買 $${s.price}</button>`;
    body+=`<div class="row"><div class="e">🧥</div><div class="info"><div class="n">${s.nm}</div><div class="d">${owned?'已擁有':locked?'尚未解鎖':'$'+s.price}</div></div>${btn}</div>`;
  }
  openSheet(`<div class="sheethead"><h3>👗 ${nm} 的衣櫃</h3><button class="close" onclick="openPartner()">✕</button></div>
    <div class="small" style="margin-bottom:8px">幫伴侶換上喜歡的造型。</div>${body}`);
}
function buyPartnerSkin(id){
  const s=PARTNER_SKINS[id]; if(!s||!S.partner) return;
  if(s.era&&S.era<s.era){ toast('時代還沒到'); return; }
  if(S.cash<s.price){ toast('現金不足'); return; }
  spend(s.price,`伴侶造型：${s.nm}`); S.partner.wardrobe.owned.push(id);
  toast(`買了 ${s.nm}`); openPartnerWardrobe(); save();
}
function wearPartnerSkin(id){
  if(!S.partner || !S.partner.wardrobe.owned.includes(id)) return;
  S.partner.wardrobe.wearing=id;
  if(officeNpcs['partner']) officeNpcs['partner'].img=npcImg(partnerSpriteSrc());  // 不重建、不會傳送回原點
  applyCookSkin();
  toast(`換上 ${PARTNER_SKINS[id].nm}`); openPartnerWardrobe(); save();
}
function openWardrobe(){
  let body='';
  for(const id in SKINS){ const s=SKINS[id];
    const owned=S.wardrobe.owned.includes(id), wearing=S.wardrobe.wearing===id, locked=s.era&&S.era<s.era;
    let btn;
    if(wearing) btn=`<button class="btn sm green dis">穿著中</button>`;
    else if(owned) btn=`<button class="btn sm" onclick="wearSkin('${id}')">穿上</button>`;
    else if(locked) btn=`<button class="btn sm dis">${s.era}世紀解鎖</button>`;
    else btn=`<button class="btn sm gold" onclick="buySkin('${id}')">購買 $${s.price}</button>`;
    body+=`<div class="row"><div class="e">🧥</div><div class="info"><div class="n">${s.nm}</div><div class="d">${owned?'已擁有':locked?'尚未解鎖':'$'+s.price}</div></div>${btn}</div>`;
  }
  openSheet(`<div class="sheethead"><h3>🧥 衣櫃</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:8px">換上喜歡的造型。</div>${body}`);
}

function buySkin(id){ const s=SKINS[id]; if(s.era&&S.era<s.era){toast('時代還沒到');return;} if(S.cash<s.price){toast('現金不足');return;} spend(s.price,`購買造型：${s.nm}`); S.wardrobe.owned.push(id); toast(`買了 ${s.nm}`); openWardrobe(); save(); }
function wearSkin(id){ if(!S.wardrobe.owned.includes(id))return; S.wardrobe.wearing=id; applySkin(id); toast(`換上 ${SKINS[id].nm}`); openWardrobe(); save(); }
/* ---------- HP／戰鬥基礎 ---------- */
const HP_REGEN_MS=8000;   // 多久自動回 1 點血
let lastRegen=Date.now();
function damagePlayer(n){ S.hp=Math.max(0,S.hp-n); refreshTop(); if(S.hp<=0) faint(); }
function healPlayer(n){ S.hp=Math.min(S.maxHp,S.hp+n); refreshTop(); toast(`❤️ 回復 ${n} 點`); }
function faint(){
  S.hp=S.maxHp; toast('😵 你昏倒了，被送回家休息');
  goScene('office');
  // 放到床範圍內、但腳下是可走的格子（避免起床卡在床的碰撞框裡）
  let bx=Math.round((BED.x1+BED.x2)/2), by=BED.y2;
  for(let y=BED.y2;y>=BED.y1;y--) for(let x=BED.x1;x<=BED.x2;x++){
    if(walkable(x+0.5,y+0.5)){ bx=x; by=y; }
  }
  player.x=bx; player.y=by;
  sleeping=true;
  save();
}
function eatDish(k){
  if((S.cafe.goods[k]||0)<=0){ toast('沒有這個成品'); return; }
  if(S.hp>=S.maxHp){ toast('血量已滿'); return; }
  const r=RECIPES[k], heal=Math.max(2,Math.round(r.price/6));
  S.cafe.goods[k]--; healPlayer(heal); openBag(); save();
}
/* ---------- 烹飪：武器 or 食物 ---------- */
const POISON_YIELD=10;
function setCookBy(who){
  if(who==='partner' && !S.partner){ toast('沒有伴侶，只能由主角製作（產出毒物）'); return; }
  S.cookBy=who; applyCookSkin(); toast(who==='partner'?'交給伴侶做：產出食物':'主角親手做：產出毒物'); openPickRecipe(); save();
}