/* ===================== 🧶 剃羊毛 & 宰羊（愛丁堡牧羊區・場上的羊都能剃/宰） ===================== */
const SHEAR={
  RANGE:1.6,             // 靠近判定距離（格）
  GAIN:14,                // 每次「刮」增加的進度 %
  MIN_GAP:260,            // 兩次刮之間至少要隔的毫秒數，太快＝犯規
  MAX_STRIKES:2,          // 犯規次數達這個數→羊嚇跑，剃毛失敗
  WOOL_REGROW_MS:180000,  // 3分鐘長回羊毛
  RESPAWN_MS:180000,      // 3分鐘補新羊
  KILL_FEE:20,            // 宰殺付給斯克特的錢
  MUTTON_YIELD:3,         // 宰殺獲得的羊肉數量
};
const SHEEP_SHORN_IMG=npcImg('sheep_shorn.png');
const SHEEP_BLACK_SHORN_IMG=npcImg('sheep_black_shorn.png');
let shearMode=null;   // {i, progress, lastStroke, strikes}

function sheepState(i){
  if(!S.sheepState) S.sheepState={};
  if(!S.sheepState[i]) S.sheepState[i]={shorn:false, woolReadyAt:0, dead:false, deadUntil:0};
  return S.sheepState[i];
}
function killSheep(s){ s.x=-100; s.y=-100; s.tx=-100; s.ty=-100; }
function respawnSheep(s){
  for(let t=0;t<30;t++){ const x=4+Math.random()*22, y=4+Math.random()*17;
    if(edinWalkable(x,y) && !inPen(x,y)){ s.x=x; s.y=y; break; } }
  s.tx=s.x; s.ty=s.y;
}
/* 場景重建羊群（或每幀）後，把持久化狀態套回每隻羊物件、處理逾時自動恢復 */
function syncSheepPersist(){
  const now=Date.now();
  for(let i=0;i<sheepNpcs.length;i++){
    const s=sheepNpcs[i], st=sheepState(i);
    if(st.shorn && now>=st.woolReadyAt) st.shorn=false;
    if(st.dead && now>=st.deadUntil){ st.dead=false; respawnSheep(s); }
    else if(st.dead && s.x>-50){ killSheep(s); }   // initHerd 重生時可能把死羊擺回場上，這裡再藏起來
    s.shorn=st.shorn;
  }
}
function nearestLiveSheep(){
  let best=null, bd=SHEAR.RANGE;
  for(let i=0;i<sheepNpcs.length;i++){
    if(sheepState(i).dead) continue;
    const s=sheepNpcs[i], d=Math.hypot(s.x-player.x, s.y-player.y);
    if(d<bd){ bd=d; best=i; }
  }
  return best;
}
function openSheepMenu(i){
  const s=sheepNpcs[i]; if(!s) return;
  const st=sheepState(i);
  const woolBtn = st.shorn
    ? `<button class="btn sm dis" style="width:100%;margin-bottom:8px">🧶 剃毛中（約${fmtSec(st.woolReadyAt-Date.now())}後長回）</button>`
    : `<button class="btn sm green" style="width:100%;margin-bottom:8px" onclick="closeSheet();startShear(${i})">🧶 剃羊毛</button>`;
  openSheet(`<div class="sheethead"><h3>${s.black?'⚫':'🐑'} 一隻羊</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:10px">剃毛時按互動鍵慢慢刮，太快羊會嚇跑，要重新靠近。</div>
    ${woolBtn}
    <button class="btn sm gold" style="width:100%" onclick="confirmSlaughterSheep(${i})">🔪 宰殺（付斯克特 $${SHEAR.KILL_FEE}）</button>`);
}
function startShear(i){
  const st=sheepState(i);
  if(st.dead){ toast('這隻羊不見了'); return; }
  if(st.shorn){ toast('羊毛還沒長回來'); return; }
  if(herdCtl){ toast('先收工再來剃毛'); return; }
  shearMode={i, progress:0, lastStroke:0, strikes:0};
  toast('🧶 開始剃毛！穩穩地按互動鍵，太快羊會嚇跑');
}
function shearStroke(){
  if(!shearMode) return;
  const st=sheepState(shearMode.i);
  if(st.dead || st.shorn){ shearMode=null; return; }
  const now=Date.now();
  if(shearMode.lastStroke && now-shearMode.lastStroke<SHEAR.MIN_GAP){
    shearMode.strikes++;
    if(shearMode.strikes>=SHEAR.MAX_STRIKES){ shearFail(); return; }
    toast('太快了！慢一點～'); return;
  }
  shearMode.strikes=0; shearMode.lastStroke=now;
  shearMode.progress=Math.min(100, shearMode.progress+SHEAR.GAIN);
  if(shearMode.progress>=100) shearSuccess();
}
function shearFail(){
  const s=sheepNpcs[shearMode.i]; if(s) sheepTarget(s);   // 嚇跑：換個閒晃目標
  shearMode=null;
  toast('😨 羊嚇跑了，剃毛失敗！要重新靠近');
}
function shearSuccess(){
  const i=shearMode.i, st=sheepState(i), s=sheepNpcs[i];
  st.shorn=true; st.woolReadyAt=Date.now()+SHEAR.WOOL_REGROW_MS;
  if(s) s.shorn=true;
  addStore('wool',1);
  shearMode=null;
  addLog('🧶 剃到了 1 份羊毛');
  toast('🧶 剃毛成功！獲得 1 份羊毛');
  refreshTop(); save();
}
function confirmSlaughterSheep(i){
  const st=sheepState(i); if(st.dead){ toast('這隻羊不見了'); return; }
  if(S.cash<SHEAR.KILL_FEE){ toast('現金不足，付不出斯克特的宰殺費'); return; }
  openSheet(`<div class="sheethead"><h3>確認宰殺這隻羊？</h3><button class="close" onclick="openSheepMenu(${i})">✕</button></div>
    <div style="text-align:center;padding:10px"><div style="font-size:42px">🐑➡️🍖</div>
    <p>付斯克特 $${SHEAR.KILL_FEE}，宰殺後得到 <b>${SHEAR.MUTTON_YIELD} 份羊肉</b>，這隻羊 3 分鐘後才會有新的補上，無法復原。</p></div>
    <div style="display:flex;gap:10px"><button class="btn ghost" style="flex:1" onclick="openSheepMenu(${i})">取消</button>
    <button class="btn gold" style="flex:1" onclick="slaughterSheep(${i})">確認</button></div>`);
}
function slaughterSheep(i){
  const st=sheepState(i); if(st.dead) return;
  if(S.cash<SHEAR.KILL_FEE){ toast('現金不足'); return; }
  spend(SHEAR.KILL_FEE,'付斯克特・宰羊');
  addStore('mutton',SHEAR.MUTTON_YIELD);
  st.dead=true; st.deadUntil=Date.now()+SHEAR.RESPAWN_MS; st.shorn=false;
  if(shearMode && shearMode.i===i) shearMode=null;
  const s=sheepNpcs[i]; if(s) killSheep(s);
  closeSheet();
  addLog(`🔪 宰了一隻羊，得到 ${SHEAR.MUTTON_YIELD} 份羊肉`);
  toast(`🍖 得到 ${SHEAR.MUTTON_YIELD} 份羊肉`);
  refreshTop(); save();
}

/* 整個接管 drawHerd：把「剃毛/有毛」的圖選擇塞進同一個依 Y 排序的畫圖流程，
   這樣剃毛羊才會跟原本的羊、玩家一樣有正確的前後遮擋，不會兩張圖疊在一起。 */
drawHerd=function(){
  const ox=Math.round(cam.x*TS), oy=Math.round(cam.y*TS);
  drawGateBar(ox,oy);
  const all=[];
  for(let i=0;i<sheepNpcs.length;i++){
    const st=sheepState(i); if(st.dead) continue;
    const s=sheepNpcs[i];
    const img = st.shorn ? (s.black?SHEEP_BLACK_SHORN_IMG:SHEEP_SHORN_IMG) : (s.black?SHEEP_BLACK_IMG:SHEEP_IMG);
    all.push({o:s, img, fb:s.black?'⚫':'🐑'});
  }
  for(const f of herdFollowers){ if(herdCtl && f.id===herdCtl.id) continue;
    all.push({o:f, img:npcImg(HERD_DOGS[f.id].img), fb:HERD_DOGS[f.id].e}); }
  if(herdCtl) all.push({o:herdCtl.o, img:npcImg(HERD_DOGS[herdCtl.id].img), fb:HERD_DOGS[herdCtl.id].e});
  all.push({o:player, isPlayer:true});
  all.sort((a,b)=>a.o.y-b.o.y);
  for(const it of all){ if(it.isPlayer) drawPlayerCopy(ox,oy); else drawHerdSprite(it.img,it.o,ox,oy,it.fb); }
  if(isPanic()){ ctx.font='bold 12px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    for(let i=0;i<sheepNpcs.length;i++){ if(sheepState(i).dead) continue; const s=sheepNpcs[i];
      const px=s.x*TS+TS/2-ox, py=s.y*TS-oy-50;
      ctx.fillStyle='#d23b3b'; ctx.strokeStyle='#ffffffcc'; ctx.lineWidth=3;
      ctx.strokeText('！',px,py); ctx.fillText('！',px,py); } }
  if(isBarking()){ const o=herdCtl.o, px=o.x*TS+TS/2-ox, py=o.y*TS-oy-52;
    ctx.font='bold 13px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='#fff'; ctx.strokeStyle='#00000088'; ctx.lineWidth=3;
    ctx.strokeText('汪！',px,py); ctx.fillText('汪！',px,py); }
};

/* ===================== 掛勾 ===================== */
const _shearGoScene=goScene;
goScene=function(n){
  if(n!=='edinburgh') shearMode=null;
  _shearGoScene(n);
  if(n==='edinburgh') syncSheepPersist();
};
const _shearUpdate=update;
update=function(){
  _shearUpdate();
  if(!S || curScene!=='edinburgh') return;
  syncSheepPersist();
  const hint=document.getElementById('hint');
  if(shearMode){
    const s=sheepNpcs[shearMode.i];
    if(!s || sheepState(shearMode.i).dead || Math.hypot(s.x-player.x,s.y-player.y)>SHEAR.RANGE+0.6){
      shearMode=null; toast('離太遠了，剃毛中斷');
    }else if(hint){
      hint.textContent=`🧶 剃毛中 ${shearMode.progress}%（互動鍵：穩穩地按，太快會嚇跑）`;
      hint.classList.add('show');
    }
  }else if(!herdCtl && !inHerdStart()){
    const idx=nearestLiveSheep();
    if(idx!=null && hint){
      const st=sheepState(idx);
      hint.textContent = st.shorn ? '🐑 靠近的羊・還沒長回羊毛（互動鍵）' : '🐑 靠近的羊（互動鍵）';
      hint.classList.add('show');
    }
  }
};
const _shearDraw=draw;
draw=function(){
  _shearDraw();
  if(!S || curScene!=='edinburgh') return;
  const ox=Math.round(cam.x*TS), oy=Math.round(cam.y*TS);
  if(shearMode){
    const s=sheepNpcs[shearMode.i];
    if(s){
      const px=s.x*TS+TS/2-ox, py=s.y*TS-oy-46;
      ctx.fillStyle='#00000088'; ctx.fillRect(px-20,py-6,40,8);
      ctx.fillStyle='#7fd97f'; ctx.fillRect(px-19,py-5,38*(shearMode.progress/100),6);
      ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.strokeRect(px-20,py-6,40,8);
    }
  }
};
const _shearInteract=interact;
interact=function(ev){
  if(S && curScene==='edinburgh' && shearMode){
    if(ev&&ev.preventDefault) ev.preventDefault();
    shearStroke(); return;
  }
  if(S && curScene==='edinburgh' && !herdCtl && !inHerdStart()){
    const idx=nearestLiveSheep();
    if(idx!=null){ if(ev&&ev.preventDefault) ev.preventDefault(); openSheepMenu(idx); return; }
  }
  return _shearInteract(ev);
};
/* =================== 🧶 剃羊毛 & 宰羊 結束 =================== */
