/* =========================================================
   13_curio_shop.js — 佩德羅古董店支線
   須排在 12_sheep_shear.js 之後載入。
   ---------------------------------------------------------
   解鎖條件：佩德羅好感 ≥50、玩家目前沒有伴侶（!S.partner）、19世紀（S.era>=19）、
   完成佩德羅個人支線（一次性劇情）。
   玩法：出海釣寶箱有機率撈到被詛咒的骨董（送進 S.curio.pendingAntiques 排隊）；
   接下委託後，出海也更容易撈到「神秘石板」（否則撈不到）。
   帶著石板去倫敦的家 (1,20) 的門走進「魔法房間」，裡面有碟仙桌（拖曳錢幣感應
   正確祭品）→ 神秘石板（輸入英文猜測解密古神文字）→ 五芒星祭壇（放上 5 種
   已解密的祭品完成驅魔）。除完咒的骨董會带回佩德羅的古董店「上架」，
   之後被動銷售賺錢；完成驅魔當下也會解鎖一篇古董故事。
   純資料（祭品表／古董與故事／劇情台詞）放在 dialogue.js 的 CURIO_* 區塊，
   這裡只放邏輯與 UI，架構仿照 11_perfume.js。
   ========================================================= */

(function(){
  const st=document.createElement('style');
  st.textContent=`
    .curio-chip{position:absolute;transform:translate(-50%,-50%);background:#00000055;color:#e8d9b0;
      border:1px solid #6b5a3a;border-radius:6px;padding:3px 6px;font-size:13px;letter-spacing:1px;
      pointer-events:none;transition:box-shadow .2s, background .2s}
    .curio-chip.near{background:#f2c94c77;color:#2b2117;box-shadow:0 0 8px 2px #f2c94c77}
    .curio-chip.sensed{background:#f2c94c;color:#2b2117;box-shadow:0 0 10px 3px #f2c94caa;animation:curioPulse .6s ease-out 1}
    @keyframes curioPulse{0%{transform:translate(-50%,-50%) scale(1)}40%{transform:translate(-50%,-50%) scale(1.35)}100%{transform:translate(-50%,-50%) scale(1)}}
  `;
  document.head.appendChild(st);
})();

/* ---------- 狀態 ---------- */
function ensureCurioState(){
  if(!S) return;
  if(!S.curio) S.curio={ questStage:0, unlocked:false, hasTablet:false, tabletXp:0, tabletLevel:0, ivanAff:0,
    pendingAntiques:[], jobs:{}, activeId:null, completed:[], carrying:[], shelf:[], till:0, lastShelfRun:Date.now() };
  if(!S.curio.pendingAntiques) S.curio.pendingAntiques=[];
  if(!S.curio.jobs) S.curio.jobs={};
  if(S.curio.activeId===undefined) S.curio.activeId=null;
  if(!S.curio.completed) S.curio.completed=[];
  if(!S.curio.carrying) S.curio.carrying=[];
  if(!S.curio.shelf) S.curio.shelf=[];
  if(S.curio.hasTablet===undefined) S.curio.hasTablet=false;
  if(S.curio.tabletXp===undefined) S.curio.tabletXp=0;
  if(S.curio.tabletLevel===undefined) S.curio.tabletLevel=0;
  if(S.curio.ivanAff===undefined) S.curio.ivanAff=0;
  if(S.curio.till===undefined) S.curio.till=0;
  if(!S.curio.lastShelfRun) S.curio.lastShelfRun=Date.now();
}
/* 佩德羅是伴侶時看親密度，不是伴侶（或還沒交往任何人）時看港口好感度 */
function curioAffection(){
  if(S.partner && S.partner.id==='Pedro') return S.partner.intimacy||0;
  return ((S.port.relations||{}).Pedro||{}).aff||0;
}
function curioMerchantEligible(){
  const partnerOk = !S.partner || S.partner.id==='Pedro';
  return partnerOk && S.era>=19 && curioAffection()>=50;
}
function curioUnlocked(){ ensureCurioState(); return !!S.curio.unlocked; }
function curioEncode(word){ return word.toUpperCase().split('').map(ch=>CURIO_GLYPH[ch]||ch).join(''); }
/* 祭品都是遊戲裡真實物品：名稱/圖示一律動態查真正的資料表，不是憑空編的道具 */
function curioItemNm(k){ return RECIPES[k] ? RECIPES[k].nm : ingNm(k); }
function curioItemIcon(k){ return RECIPES[k] ? dishIcon(k) : prodIcon(k,24); }   // 給 openSheet（會當 HTML 解析）用
/* toast() 是用 textContent 塞字的，不能餵它 <img> 標籤，這裡固定回傳純 emoji 給 toast 用 */
const CURIO_ITEM_EMOJI={
  strawberry:'🍓', corn:'🌽', potato:'🥔', tomato:'🍅', carrot:'🥕', onion:'🧅', rose:'🌹',
  cod:'🐠', salmon:'🐟', lobster:'🦞', mussel:'🦪', squid:'🦑',
  egg:'🥚', milk:'🥛', cheese:'🧀', wool:'🧶',
  flour:'🌾', sugar:'🧂', olive_oil:'🫒', vanilla:'🤎',
  scone:'🥐', pancake:'🥞', grilled_fish:'🐟', cinnamon_roll:'🍥',
};
function curioItemEmoji(k){ return CURIO_ITEM_EMOJI[k] || (RECIPES[k]&&RECIPES[k].e) || (PRODUCTS[k]&&PRODUCTS[k].e) || (EXTRAS[k]&&EXTRAS[k].e) || '📦'; }

/* ---------- 佩德羅個人支線：觸發古董店開張 ---------- */
function startCurioQuest(){
  ensureCurioState();
  if(S.curio.questStage>=2){ goScene('curioshop'); return; }
  _convoCid='Pedro'; freezeNpcById('mc_Pedro'); freezeNpcById('partner');
  runScript(CURIO_QUEST_LINES, [
    {t:'「好，我幫你。」', cls:'gold', run:()=>{
      S.curio.questStage=2; S.curio.unlocked=true;
      addLog('🏺 答應幫佩德羅解決古董詛咒問題，古董店開張了');
      toast('🏺 佩德羅古董店開張了！出海時要多留意——寶箱可能撈到被詛咒的骨董，也更容易撈到那塊神秘石板了。');
      save();
      goScene('curioshop');
    }}
  ]);
}

/* ---------- 出海撈到石板：一撈到就能讀懂全部古神文字，靠對照表手動解密 ---------- */
function collectTablet(){
  ensureCurioState();
  if(S.curio.hasTablet) return;
  S.curio.hasTablet=true;
  addLog('🪨 出海撈起了一塊佈滿古怪符文的石板，你竟然看得懂上面的文字');
  toast('🪨 撈起了一塊神秘石板！石板上的文字你竟然看得懂——去倫敦的家找找那扇門吧。');
  refreshTop(); save();
}

/* ---------- 委託：每件放上祭壇的骨董各自保留自己的碟仙版面／解密／擺放進度 ---------- */
function curioMakeBoard(antique){
  const correct=antique.offerings.slice();
  const restPool=Object.keys(CURIO_OFFERINGS).filter(k=>!correct.includes(k));
  const wrong=restPool.sort(()=>Math.random()-0.5).slice(0,10);
  const all=correct.concat(wrong).sort(()=>Math.random()-0.5);
  const board=all.map(key=>({ key, glyph:curioEncode(CURIO_OFFERINGS[key].en), sensed:false,
    x:8+Math.random()*80, y:12+Math.random()*68 }));
  return { id:antique.id, board, decoded:{}, placed:{} };
}
/* 挑一件排隊中的骨董放上祭壇（或切換回已經放過的），決定現在要處理哪件 */
function curioStartJob(id){
  ensureCurioState();
  if(!S.curio.jobs[id]){
    const antique=CURIO_ANTIQUES.find(a=>a.id===id); if(!antique) return;
    S.curio.jobs[id]=curioMakeBoard(antique);
    const pi=S.curio.pendingAntiques.indexOf(id); if(pi>=0) S.curio.pendingAntiques.splice(pi,1);
  }
  S.curio.activeId=id;
  save();
  openCurioPentagram();
}
function curioActiveJob(){ ensureCurioState(); return S.curio.jobs[S.curio.activeId]||null; }
function curioHasAnyAntique(){ ensureCurioState(); return !!(S.curio.pendingAntiques.length || Object.keys(S.curio.jobs).length); }

const CURIO_PEDRO_LINES=[
  '這批退貨古董，真的謝謝你幫忙處理。',
  '出海的時候多留意寶箱，說不定就撈到被詛咒的貨了。',
  '每次除完咒聽你講那些古董的來歷，都覺得比冒險小說還離譜。',
];

/* ---------- 佩德羅的古董店：交貨、上架、收銀、故事收藏 ---------- */
function openCurioPedro(){
  ensureCurioState();
  freezeNpcById('cpedro');
  const line=CURIO_PEDRO_LINES[Math.floor(Math.random()*CURIO_PEDRO_LINES.length)];
  const pendingN=S.curio.pendingAntiques.length+Object.keys(S.curio.jobs).length;
  const carryRows=S.curio.carrying.map(id=>{
    const a=CURIO_ANTIQUES.find(x=>x.id===id); if(!a) return '';
    return `<div class="row"><div class="e">${a.e}</div><div class="info"><div class="n">${a.nm}</div><div class="d">已除咒，尚未上架・價值 $${fmt(a.value)}</div></div>
      <button class="btn sm gold" onclick="curioShelveAntique('${id}')">上架</button></div>`;
  }).join('');
  const shelfRows=S.curio.shelf.map(id=>{
    const a=CURIO_ANTIQUES.find(x=>x.id===id); if(!a) return '';
    return `<div class="row"><div class="e">${a.e}</div><div class="info"><div class="n">${a.nm}</div><div class="d">展示中，等待買家上門・價值 $${fmt(a.value)}</div></div></div>`;
  }).join('');
  openSheet(`<div class="sheethead"><h3>🧔 佩德羅</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div style="background:var(--card);border:2px solid var(--line2);border-radius:12px;padding:12px;margin-bottom:14px;font-size:14px;line-height:1.5">${line}</div>
    <div class="small" style="margin-bottom:4px">神秘石板：${S.curio.hasTablet?'已撈到':'尚未撈到（出海碰碰運氣）'}・排隊等待除咒 ${pendingN} 件</div>
    <div class="small" style="margin-bottom:10px">🪨 石板經驗 ${S.curio.tabletXp}（Lv.${S.curio.tabletLevel}）・驅魔法器在倫敦的家的魔法房間裡</div>
    ${carryRows?`<div class="hr"></div><b class="small">已除咒，待上架</b>${carryRows}`:''}
    <div class="hr"></div><b class="small">展示櫃（${S.curio.shelf.length} 件）</b>
    ${shelfRows||'<div class="empty-note">目前沒有展示中的古董。</div>'}
    <div class="small" style="margin:10px 0">收銀台：$${fmt(S.curio.till)}</div>
    <button class="btn gold ${S.curio.till<=0?'dis':''}" style="width:100%;margin-bottom:8px" onclick="collectCurioTill()">💰 收銀</button>
    ${S.curio.completed.length?'<button class="btn ghost" style="width:100%" onclick="openCurioStories()">📖 故事收藏</button>':''}`);
}
function curioShelveAntique(id){
  ensureCurioState();
  const i=S.curio.carrying.indexOf(id); if(i<0) return;
  S.curio.carrying.splice(i,1); S.curio.shelf.push(id);
  toast('🗄️ 上架了一件古董'); save(); openCurioPedro();
}
function collectCurioTill(){
  ensureCurioState();
  if(S.curio.till<=0){ toast('收銀台沒有錢'); return; }
  const t=Math.round(S.curio.till);
  earn(t,'古董店營收');
  S.curio.till=0;
  toast(`💰 收了 $${fmt(t)}`);
  save(); openCurioPedro();
}
/* 展示櫃被動銷售：每天每件展示中的古董有機率被買走 */
const CURIO_SELL_RATE=0.25;
function runCurioShelf(now){
  ensureCurioState();
  if(!S.curio.shelf.length){ S.curio.lastShelfRun=now; return; }
  const days=Math.min(7,Math.floor((now-(S.curio.lastShelfRun||now))/DAY));
  if(days<=0) return;
  for(let d=0; d<days; d++){
    for(let i=S.curio.shelf.length-1; i>=0; i--){
      if(Math.random()<CURIO_SELL_RATE){
        const id=S.curio.shelf.splice(i,1)[0];
        const a=CURIO_ANTIQUES.find(x=>x.id===id);
        S.curio.till+=(a&&a.value)||1500;
      }
    }
  }
  S.curio.lastShelfRun=(S.curio.lastShelfRun||now)+days*DAY;
}

/* ---------- 碟仙桌：拖曳錢幣感應正確祭品 ---------- */
function openOuijaBoard(){
  ensureCurioState();
  if(!S.curio.hasTablet){ toast('這裡的法器你還看不懂，先出海撈起那塊神秘石板'); return; }
  const cur=curioActiveJob();
  if(!cur){
    openSheet(`<div class="sheethead"><h3>🪙 碟仙桌</h3><button class="close" onclick="closeSheet()">✕</button></div>
      <div class="empty-note">${curioHasAnyAntique()?'先去五芒星祭壇挑一件要處理的骨董。':'目前沒有任何被詛咒的骨董，先出海釣寶箱看看。'}</div>`);
    return;
  }
  const chips=cur.board.map((c,i)=>
    `<div class="curio-chip${c.sensed?' sensed':''}" id="curioChip${i}" style="left:${c.x}%;top:${c.y}%">${c.glyph}</div>`
  ).join('');
  openSheet(`<div class="sheethead"><h3>🪙 碟仙桌</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:8px">拖曳錢幣，靠近正確的祭品文字時錢幣會震動發光。</div>
    <div id="curioBoard" style="position:relative;width:100%;height:260px;background:#2b2117;border:2px solid var(--line2);border-radius:12px;overflow:hidden;margin-bottom:10px">
      ${chips}
      <div id="curioCoin" style="position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;
        border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff6c8,#c8a545 70%);box-shadow:0 2px 6px #0007;
        cursor:grab;touch-action:none;display:flex;align-items:center;justify-content:center;font-size:16px">🪙</div>
    </div>`);
  initOuijaDrag();
}
function initOuijaDrag(){
  const board=document.getElementById('curioBoard'), coin=document.getElementById('curioCoin');
  if(!board||!coin) return;
  let dragging=false;
  function movePos(ev){
    const t=ev.touches?ev.touches[0]:ev, r=board.getBoundingClientRect();
    return { x:Math.max(0,Math.min(r.width, t.clientX-r.left)), y:Math.max(0,Math.min(r.height, t.clientY-r.top)), rect:r };
  }
  function onMove(ev){
    if(!dragging) return;
    if(ev.cancelable) ev.preventDefault();
    const p=movePos(ev);
    coin.style.left=(p.x-17)+'px'; coin.style.top=(p.y-17)+'px'; coin.style.margin='0';
    updateOuijaNear(p.x,p.y,p.rect);
  }
  function onUp(){
    dragging=false;
    document.removeEventListener('pointermove',onMove);
    document.removeEventListener('pointerup',onUp);
    commitOuijaNear();
  }
  coin.addEventListener('pointerdown',ev=>{
    dragging=true; if(ev.cancelable) ev.preventDefault();
    document.addEventListener('pointermove',onMove); document.addEventListener('pointerup',onUp);
  });
}
/* 拖曳中只是「燈亮」提示，經過又離開燈就熄滅；放開錢幣那一刻還亮著才算真的找到 */
function updateOuijaNear(cx,cy,rect){
  const cur=curioActiveJob(); if(!cur) return;
  const antique=CURIO_ANTIQUES.find(a=>a.id===cur.id); if(!antique) return;
  cur.board.forEach((c,i)=>{
    if(c.sensed) return;
    const el=document.getElementById('curioChip'+i); if(!el) return;
    const ex=(c.x/100)*rect.width, ey=(c.y/100)*rect.height;
    const near=antique.offerings.includes(c.key) && Math.hypot(cx-ex,cy-ey)<28;
    el.classList.toggle('near', near);
  });
}
function commitOuijaNear(){
  const cur=curioActiveJob(); if(!cur) return;
  let changed=false;
  cur.board.forEach((c,i)=>{
    if(c.sensed) return;
    const el=document.getElementById('curioChip'+i); if(!el) return;
    if(el.classList.contains('near')){
      c.sensed=true; changed=true;
      el.classList.remove('near'); el.classList.add('sensed');
      toast('🪙 錢幣停在這裡不動了……你找到了一個正確的字！');
    }else el.classList.remove('near');
  });
  if(changed) save();
}

/* ---------- 神秘石板：輸入英文猜測解密 ---------- */
function openCurioTablet(){
  ensureCurioState();
  if(!S.curio.hasTablet){
    openSheet(`<div class="sheethead"><h3>🪨 神秘石板</h3><button class="close" onclick="closeSheet()">✕</button></div>
      <div class="empty-note">房間角落空蕩蕩的，好像少了什麼最重要的東西……得先出海碰碰運氣，看能不能撈到那塊石板。</div>`);
    return;
  }
  const cur=curioActiveJob();
  const letterBtns=Object.keys(CURIO_GLYPH).map(L=>
    `<button class="btn sm ghost" style="width:34px;height:42px;padding:2px;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:0" onclick="curioTypeLetter('${L}')">
      <span style="font-weight:700;font-size:14px;line-height:1.2">${CURIO_GLYPH[L]}</span><span style="font-size:10px;line-height:1.2">${L}</span></button>`
  ).join('');
  let pending=`<div class="empty-note">${curioHasAnyAntique()?'先去五芒星祭壇挑一件要處理的骨董。':'目前沒有任何被詛咒的骨董，先出海釣寶箱看看。'}</div>`, collected='（尚無）';
  if(cur){
    const antique=CURIO_ANTIQUES.find(a=>a.id===cur.id);
    const sensedUndecoded=cur.board.filter(c=>c.sensed && antique.offerings.includes(c.key) && !cur.decoded[c.key]);
    pending=sensedUndecoded.length
      ? sensedUndecoded.map(c=>`<div class="row"><div class="e">🔤</div><div class="info"><div class="n" style="letter-spacing:2px">${c.glyph}</div><div class="d">還沒解密</div></div></div>`).join('')
      : '<div class="empty-note">目前沒有待解密的文字，先去碟仙桌感應。</div>';
    const names=Object.keys(cur.decoded).map(k=>`${curioItemIcon(k)} ${curioItemNm(k)}`);
    collected=names.length?names.join('・'):'（尚無）';
  }
  openSheet(`<div class="sheethead"><h3>🪨 神秘石板</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:6px">古神文字對照表（有石板就能讀，按符號拼出英文單字）：</div>
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:10px">${letterBtns}</div>
    <div class="hr"></div>
    <b class="small">待解密的文字</b>${pending}
    <div class="hr"></div>
    <div class="small" style="margin-bottom:4px">目前拼出的英文（例如 ROSE）：</div>
    <div style="min-height:20px;border:1px solid var(--line2);border-radius:8px;padding:8px;margin-bottom:8px;font-size:16px;font-weight:700;letter-spacing:3px">
      ${curioGuessBuf||'<span class="small" style="font-weight:400;letter-spacing:0;color:var(--ink2)">（按上面的符號拼字）</span>'}</div>
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <button class="btn ghost sm" style="flex:1" onclick="curioBackspace()">⌫ 刪除</button>
      <button class="btn ghost sm" style="flex:1" onclick="curioClearGuess()">清空</button>
    </div>
    <button class="btn gold" style="width:100%;margin-bottom:10px" onclick="curioGuessWord()">🔍 解密</button>
    <div class="small" style="margin-bottom:10px">已收集祭品：${collected}</div>
    ${S.curio.ivanAff>=30?'<button class="btn" style="width:100%" onclick="openIvanChat()">🔮 找石板裡的祂聊聊</button>':''}`);
}
let curioGuessBuf='';
function curioTypeLetter(L){ curioGuessBuf+=L; openCurioTablet(); }
function curioBackspace(){ curioGuessBuf=curioGuessBuf.slice(0,-1); openCurioTablet(); }
function curioClearGuess(){ curioGuessBuf=''; openCurioTablet(); }
function curioGuessWord(){
  const cur=curioActiveJob(); if(!cur){ toast('先去五芒星祭壇挑一件要處理的骨董'); return; }
  const guess=curioGuessBuf.toUpperCase(); if(!guess) return;
  const antique=CURIO_ANTIQUES.find(a=>a.id===cur.id);
  const target=cur.board.find(c=>c.sensed && antique.offerings.includes(c.key) && !cur.decoded[c.key] && CURIO_OFFERINGS[c.key].en===guess);
  if(!target){ toast('無法對應，再想想…'); return; }
  cur.decoded[target.key]=true;
  toast(`✔ 解密成功！${curioItemEmoji(target.key)} ${curioItemNm(target.key)}`);
  curioGuessBuf='';
  save();
  openCurioTablet();
}

/* ---------- 五芒星祭壇：放置祭品、完成驅魔 ---------- */
function openCurioPentagram(){
  ensureCurioState();
  if(!S.curio.hasTablet){ toast('這裡的法器你還看不懂，先出海撈起那塊神秘石板'); return; }
  const cur=curioActiveJob();
  if(!cur){ openCurioAltarPicker(); return; }
  const antique=CURIO_ANTIQUES.find(a=>a.id===cur.id);
  const slots=antique.offerings.map(key=>{
    const placed=cur.placed[key];
    const action=placed?'<span class="small">已就位</span>'
      :(cur.decoded[key]?`<button class="btn sm gold" onclick="curioPlaceOffering('${key}')">放置</button>`
        :'<span class="small" style="color:var(--ink2)">尚未解密</span>');
    return `<div class="row"><div class="e">${placed?curioItemIcon(key):'❓'}</div><div class="info"><div class="n">${placed?curioItemNm(key):'未知祭品'}</div></div>${action}</div>`;
  }).join('');
  const placedCount=antique.offerings.filter(k=>cur.placed[k]).length;
  const ready=placedCount===antique.offerings.length;
  openSheet(`<div class="sheethead"><h3>⛤ 五芒星祭壇・${antique.e} ${antique.nm}</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:8px">中央放著被詛咒的${antique.nm}，五個角需要放上正確的祭品。</div>
    ${slots}
    <button class="btn ${ready?'gold':'dis'}" style="width:100%;margin-top:10px" onclick="curioFinishExorcism()">${ready?'🕯️ 開始驅魔':`還缺 ${5-placedCount} 種祭品`}</button>
    <button class="btn ghost" style="width:100%;margin-top:8px" onclick="openCurioAltarPicker()">🔄 換一件要處理的骨董</button>`);
}
/* 選擇祭壇上要放哪一件骨董：排隊中（還沒開始）的可以直接放上去，已經開始過的可以換回來繼續，各自進度互不影響 */
function openCurioAltarPicker(){
  ensureCurioState();
  const notStarted=S.curio.pendingAntiques.map(id=>{
    const a=CURIO_ANTIQUES.find(x=>x.id===id); if(!a) return '';
    return `<div class="row"><div class="e">${a.e}</div><div class="info"><div class="n">${a.nm}</div><div class="d">還沒開始</div></div>
      <button class="btn sm gold" onclick="curioStartJob('${id}')">放上祭壇</button></div>`;
  }).join('');
  const started=Object.keys(S.curio.jobs).map(id=>{
    const a=CURIO_ANTIQUES.find(x=>x.id===id); if(!a) return '';
    const job=S.curio.jobs[id], active=S.curio.activeId===id;
    const decodedN=Object.keys(job.decoded).length, placedN=Object.keys(job.placed).length;
    return `<div class="row"><div class="e">${a.e}</div><div class="info"><div class="n">${a.nm}${active?'　<span class="small">（祭壇上）</span>':''}</div><div class="d">已解密 ${decodedN}/5・已放置 ${placedN}/5</div></div>
      ${active?'<span class="small">處理中</span>':`<button class="btn sm" onclick="curioStartJob('${id}')">換成這件</button>`}</div>`;
  }).join('');
  const body=(notStarted+started)||'<div class="empty-note">目前沒有任何被詛咒的骨董，先出海釣寶箱看看。</div>';
  openSheet(`<div class="sheethead"><h3>⛤ 五芒星祭壇</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:8px">選一件要放上祭壇中央處理的骨董：</div>${body}`);
}
function curioPlaceOffering(key){
  const cur=curioActiveJob(); if(!cur||!cur.decoded[key]) return;
  cur.placed[key]=true;
  toast(`${curioItemEmoji(key)} 放上了五芒星的一角`);
  save(); openCurioPentagram();
}
function curioFinishExorcism(){
  const cur=curioActiveJob(); if(!cur) return;
  const antique=CURIO_ANTIQUES.find(a=>a.id===cur.id);
  if(antique.offerings.some(k=>!cur.placed[k])){ toast('祭品還沒放齊'); return; }
  const reward=Math.round(antique.value*0.1);   // 驅魔當下先拿一成當工錢，其餘賣掉古董本體再賺
  S.curio.completed.push(antique.id);
  S.curio.carrying.push(antique.id);
  S.curio.tabletXp=(S.curio.tabletXp||0)+1;
  S.curio.tabletLevel=Math.floor(S.curio.tabletXp/2);
  S.curio.ivanAff=(S.curio.ivanAff||0)+6;
  earn(reward,`驅魔委託・${antique.nm}`);
  delete S.curio.jobs[antique.id];
  S.curio.activeId=null;
  addLog(`🕯️ 成功驅除了${antique.nm}的詛咒`);
  save();
  _convoCid='Pedro';
  runScript([
    {who:'me',mood:'think',t:`「……成功了。」古神文字碎裂消散，${antique.nm}恢復了原本平凡的樣子。`},
    {who:'partner',mood:'happy',t:'太好了！這下總算能安心賣出去了。謝了，亞瑟。'},
  ], [
    {t:`💰 獲得 $${reward}・石板經驗 +1`, cls:'gold', run:()=>openCurioStory(antique.id)}
  ]);
}

/* ---------- 古董故事收藏 ---------- */
function openCurioStory(id){
  const antique=CURIO_ANTIQUES.find(a=>a.id===id); if(!antique) return;
  openSheet(`<div class="sheethead"><h3>${antique.e} ${antique.nm}</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div style="background:var(--card);border:2px solid var(--line2);border-radius:12px;padding:12px;margin-bottom:14px;font-size:14px;line-height:1.7;white-space:pre-line">${antique.story}</div>
    <button class="btn ghost" style="width:100%" onclick="openCurioPedro()">↩ 返回</button>`);
}
function openCurioStories(){
  ensureCurioState();
  const body=S.curio.completed.length ? S.curio.completed.map(id=>{
    const a=CURIO_ANTIQUES.find(x=>x.id===id);
    return `<div class="row"><div class="e">${a.e}</div><div class="info"><div class="n">${a.nm}</div></div><button class="btn sm" onclick="openCurioStory('${a.id}')">閱讀</button></div>`;
  }).join('') : '<div class="empty-note">還沒有收藏任何故事，先完成驅魔委託。</div>';
  openSheet(`<div class="sheethead"><h3>📖 古董故事收藏</h3><button class="close" onclick="closeSheet()">✕</button></div>${body}
    <button class="btn ghost" style="width:100%;margin-top:10px" onclick="openCurioPedro()">↩ 返回</button>`);
}

/* ---------- 石板裡的祂（伊凡・布拉金斯基）閒聊 ---------- */
function openIvanChat(){
  ensureCurioState();
  const line=IVAN_LINES[Math.floor(Math.random()*IVAN_LINES.length)];
  openSheet(`<div class="sheethead"><h3>🪨 石板裡的祂</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div style="text-align:center;margin:2px 0 10px;font-size:56px">🐙</div>
    <div style="background:var(--card);border:2px solid var(--line2);border-radius:12px;padding:12px;margin-bottom:14px;font-size:14px;line-height:1.5">${line}</div>
    <button class="btn green" style="width:100%;margin-bottom:8px" onclick="ivanTalk()">再聊聊</button>
    <button class="btn ghost" style="width:100%" onclick="openCurioTablet()">↩ 返回</button>`);
}
function ivanTalk(){ S.curio.ivanAff=(S.curio.ivanAff||0)+1; save(); openIvanChat(); }

/* ---------- 場景一：佩德羅的古董店（展示／上架／收銀） ---------- */
MAPS.curioshop=[
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
GRID.curioshop=MAPS.curioshop.map(r=>r.padEnd(MAPS.curioshop[0].length,r[0]).split(''));
SCENES.curioshop={ title:'古董店', big:false, spawn:{x:9,y:14}, objects:[
  {id:'cpedro', x:9, y:8, e:'🧔', nm:'佩德羅', kind:'curiopedro'},
]};
SCENE_NM.curioshop='古董店';
loadBg('curioshop','curioshop.png');
loadFg('curioshop','curioshop_fg.png');

/* ---------- 場景二：魔法房間（倫敦的家內，走門進入） ---------- */
MAPS.curiomagic=[
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
GRID.curiomagic=MAPS.curiomagic.map(r=>r.padEnd(MAPS.curiomagic[0].length,r[0]).split(''));
SCENES.curiomagic={ title:'魔法房間', big:false, spawn:{x:9,y:9}, objects:[
  {id:'cpentagram', x:5,  y:4, e:'⛤', nm:'五芒星祭壇', kind:'curiopentagram'},
  {id:'coboard',    x:9,  y:4, e:'🪙', nm:'碟仙桌', kind:'curioouija'},
  {id:'ctablet',    x:13, y:4, e:'🪨', nm:'神秘石板', kind:'curiotablet'},
]};
SCENE_NM.curiomagic='魔法房間';
loadBg('curiomagic','curiomagic.png');
loadFg('curiomagic','curiomagic_fg.png');

/* ---------- 倫敦的家 (1,20) 開一扇門通往魔法房間 ---------- */
DOORS.push(
  { from:'london',     area:{x1:1,y1:20,x2:1,y2:21}, to:'curiomagic', at:{x:9,y:9},  label:'🚪 走進魔法房間' },
  { from:'curiomagic', area:{x1:8,y1:15,x2:10,y2:16}, to:'london',     at:{x:1,y:20}, label:'🚪 離開魔法房間' },
);

/* ---------- 掛勾：互動、更新迴圈、被動銷售 ---------- */
const _curioOrigInteract=interact;
interact=function(ev){
  if(!sitting && curScene==='curioshop'){
    const o=facingObject();
    if(o && o.kind==='curiopedro'){ if(ev&&ev.preventDefault) ev.preventDefault(); openCurioPedro(); return; }
  }
  if(!sitting && curScene==='curiomagic'){
    const o=facingObject();
    if(o){
      if(o.kind==='curiopentagram'){ if(ev&&ev.preventDefault) ev.preventDefault(); openCurioPentagram(); return; }
      if(o.kind==='curioouija'){ if(ev&&ev.preventDefault) ev.preventDefault(); openOuijaBoard(); return; }
      if(o.kind==='curiotablet'){ if(ev&&ev.preventDefault) ev.preventDefault(); openCurioTablet(); return; }
    }
  }
  return _curioOrigInteract(ev);
};
const _curioOrigUpdate=update;
update=function(){
  if(S && curScene==='curiomagic' && !curioUnlocked()){
    toast('這扇門好像被鎖住了……');
    goScene('london');
    return;
  }
  _curioOrigUpdate();
  if(!S) return;
  if(curScene==='curioshop'){
    const hint=document.getElementById('hint'), o=facingObject();
    if(o && o.kind==='curiopedro'){ hint.textContent='🧔 佩德羅（互動鍵）'; hint.classList.add('show'); }
  }else if(curScene==='curiomagic'){
    const hint=document.getElementById('hint'), o=facingObject();
    if(o && o.kind==='curiopentagram'){ hint.textContent='⛤ 五芒星祭壇（互動鍵）'; hint.classList.add('show'); }
    else if(o && o.kind==='curioouija'){ hint.textContent='🪙 碟仙桌（互動鍵）'; hint.classList.add('show'); }
    else if(o && o.kind==='curiotablet'){ hint.textContent='🪨 神秘石板（互動鍵）'; hint.classList.add('show'); }
  }
};
const _curioOrigTick=tick;
tick=function(){ _curioOrigTick.apply(this,arguments); runCurioShelf(Date.now()); };

/* ---------- 解鎖入口：商人面板／伴侶面板追加按鈕（佩德羅無論是不是伴侶都適用） ---------- */
function curioAppendEntryButton(sheet){
  if(!sheet) return;
  if(curioUnlocked()){
    const btn=document.createElement('button');
    btn.className='btn gold'; btn.style.cssText='width:100%;margin-top:8px';
    btn.textContent='🏺 去古董店';
    btn.onclick=()=>{ closeSheet(); goScene('curioshop'); };
    sheet.appendChild(btn);
  }else if(curioMerchantEligible() && S.curio.questStage<2){
    const btn=document.createElement('button');
    btn.className='btn'; btn.style.cssText='width:100%;margin-top:8px';
    btn.textContent='🕯️ 佩德羅好像有話想說……';
    btn.onclick=()=>{ closeSheet(); startCurioQuest(); };
    sheet.appendChild(btn);
  }
}
const _curioOrigOpenMerchant=openMerchant;
openMerchant=function(id){
  _curioOrigOpenMerchant.apply(this,arguments);
  if(id!=='Pedro') return;
  ensureCurioState();
  curioAppendEntryButton(document.getElementById('sheet'));
};
const _curioOrigOpenPartner=openPartner;
openPartner=function(){
  _curioOrigOpenPartner.apply(this,arguments);
  if(!S.partner || S.partner.id!=='Pedro') return;
  ensureCurioState();
  curioAppendEntryButton(document.getElementById('sheet'));
};
const _curioOrigOpenTravel=openTravel;
openTravel=function(){
  _curioOrigOpenTravel.apply(this,arguments);
  ensureCurioState();
  if(!curioUnlocked()) return;
  const sheet=document.getElementById('sheet'); if(!sheet) return;
  sheet.insertAdjacentHTML('beforeend', `<div class="hr"></div><b class="small">事業</b>
    <button class="btn ${curScene==='curioshop'?'green':'ghost'}" style="width:100%;text-align:left;padding:13px 14px;margin-bottom:8px;font-size:15px;display:flex;align-items:center;gap:10px" onclick="closeSheet();goScene('curioshop')">
    <span style="font-size:22px">🏺</span><span style="flex:1">古董店</span>${curScene==='curioshop'?'<span class="small">目前所在</span>':''}</button>`);
};
/* ---------- 背包也看得到石板／身上的骨董 ---------- */
const _curioOrigOpenBag=openBag;
openBag=function(){
  _curioOrigOpenBag.apply(this,arguments);
  ensureCurioState();
  const hasAny=S.curio.hasTablet || S.curio.pendingAntiques.length || Object.keys(S.curio.jobs).length || S.curio.carrying.length;
  if(!hasAny) return;
  const sheet=document.getElementById('sheet'); if(!sheet) return;
  const chips=[];
  if(S.curio.hasTablet) chips.push(`<span class="seedchip">🪨 神秘石板</span>`);
  for(const id of S.curio.pendingAntiques){
    const a=CURIO_ANTIQUES.find(x=>x.id===id); if(a) chips.push(`<span class="seedchip">${a.e} ${a.nm}（被詛咒）</span>`);
  }
  for(const id in S.curio.jobs){
    const a=CURIO_ANTIQUES.find(x=>x.id===id);
    if(a) chips.push(`<span class="seedchip">${a.e} ${a.nm}（驅魔中${S.curio.activeId===id?'・祭壇上':''}）</span>`);
  }
  for(const id of S.curio.carrying){
    const a=CURIO_ANTIQUES.find(x=>x.id===id); if(a) chips.push(`<span class="seedchip">${a.e} ${a.nm}（已除咒，待上架）</span>`);
  }
  sheet.insertAdjacentHTML('beforeend', `<div class="hr"></div><b class="small">神秘物品</b><div style="margin:4px 0 8px">${chips.join('')||'<span class="small">無</span>'}</div>`);
};

const _curioOrigStart=startGame;
startGame=function(n){
  _curioOrigStart.apply(this,arguments);
  ensureCurioState();
  save();
};
/* =================== 🏺 佩德羅古董店支線 結束 =================== */
