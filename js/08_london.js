/* ===================== 🚢 19世紀：倫敦・斯克特辦公室・愛丁堡牧羊 ===================== */
/* --- 地圖：倫敦40×18、斯克特辦公室26×16、愛丁堡44×26 --- */
MAPS.london=[
 "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
 "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
 "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
 "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
 "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
 "FF........................FFFFFFFFFFFFFF",
 "FF........................FFFFFFFFFFFFFF",
 "FF........................FFFFFFFFFFFFFF",
 "FF........................FFFFFFFFFFFFFF",
 "FF........................FFFFFFFFFFFFFF",
 "FF........................FFFFFFFFFFFFFF",
 "FF........................FFFFFFFFFFFFFF",
 "FFFFFFFFFFFF..FFFFFFFFFFFFFFFFFFFFFFFFFF",
 "........................................",
 "........................................",
 "........................................",
 "........................................",
 "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
];
MAPS.scott_office=[
 "FFFFFFFFFFFFFFFFFFFFFFFFFF",
 "FFFFFFFFFFFFFFFFFFFFFFFFFF",
 "FFFFFFFFFFFFFFFFFFFFFFFFFF",
 "FFFFFFFFFFFFFFFFFFFFFFFFFF",
 "FF......................FF",
 "FF......................FF",
 "FF......................FF",
 "FF......................FF",
 "FF........................",
 "FF........................",
 "FF......................FF",
 "FF......................FF",
 "FF......................FF",
 "FFFFFFFFFFF..FFFFFFFFFFFFF",
 "FFFFFFFFFFFFFFFFFFFFFFFFFF",
 "FFFFFFFFFFFFFFFFFFFFFFFFFF",
];
MAPS.edinburgh=[
 "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
 "F..........................................F",
 "F..........................................F",
 "F..........................................F",
 "F..........................................F",
 "F..........................................F",
 "F...............................FFFFFFFFFF.F",
 "F...............................F........F.F",
 "F...............................F........F.F",
 "F........................................F.F",
 "F........................................F.F",
 "F...............................F........F.F",
 "F...............................F........F.F",
 "F...............................FFFFFFFFFF.F",
 "F..........................................F",
 "F..........................................F",
 "F..........................................F",
 "F..........................................F",
 "F..........................................F",
 "F..........................................F",
 "F..........................................F",
 "F..........................................F",
 "F..........................................F",
 "F..........................................F",
 "F..........................................F",
 "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
];
GRID.london=MAPS.london.map(r=>r.padEnd(MAPS.london[0].length,r[0]).split(''));
GRID.scott_office=MAPS.scott_office.map(r=>r.padEnd(MAPS.scott_office[0].length,r[0]).split(''));
GRID.edinburgh=MAPS.edinburgh.map(r=>r.padEnd(MAPS.edinburgh[0].length,r[0]).split(''));

/* --- 場景 --- */
SCENES.london={title:'倫敦的家', big:true, spawn:{x:13,y:9}, objects:[]};
SCENES.scott_office={title:'斯克特的辦公室', big:true, spawn:{x:12,y:11}, objects:[
  {id:'scott',   x:12,y:5, e:'🧔', nm:'斯克特', kind:'scott', sense:2, hide:true},
  {id:'sherlock',x:7, y:8, e:'🐕', nm:'夏洛克', kind:'dog', did:'sherlock', hide:true},
  {id:'watson',  x:17,y:9, e:'🐶', nm:'華生',   kind:'dog', did:'watson',   hide:true},
]};
SCENES.edinburgh={title:'愛丁堡莊園・牧羊區', big:true, spawn:{x:4,y:9}, objects:[]};
SCENE_NM.london='倫敦'; SCENE_NM.scott_office='斯克特的辦公室'; SCENE_NM.edinburgh='牧羊區';
loadBg('london','london.png');             loadFg('london','london_fg.png');
loadBg('scott_office','scott_office.png');
loadBg('edinburgh','edinburgh.png');       loadFg('edinburgh','edinburgh_fg.png');

/* --- 門表 --- */
DOORS.push(
  { from:'london',       area:{x1:1, y1:14, x2:4, y2:16},  to:'port',         at:{x:9,y:14},  label:'⛵ 搭船回港口' },
  { from:'london',       area:{x1:30,y1:14, x2:34,y2:16},  to:'scott_office', at:{x:12,y:12}, era:19, label:'🐴 搭馬車去愛丁堡莊園' },
  { from:'scott_office', area:{x1:11,y1:13, x2:12,y2:13},  to:'london',       at:{x:31,y:15}, label:'🐴 搭馬車回倫敦' },
  { from:'scott_office', area:{x1:24,y1:8,  x2:25,y2:9},   to:'edinburgh',    at:{x:4,y:9},   label:'🚪 去牧羊區' },
  { from:'edinburgh',    area:{x1:1, y1:7,  x2:2, y2:11},  to:'scott_office', at:{x:23,y:8},  label:'🚪 回斯克特的辦公室' },
);

/* --- 19世紀上船選單：捕魚 or 回倫敦 --- */
const _sailOrig=askSail;
function goFishTrip(){ _sailOrig(); }
function sailToLondon(){ closeSheet(); goScene('london'); player.x=3; player.y=15; player.facing='right'; toast('🚢 抵達倫敦'); }
askSail=function(){
  if(!S || S.era<19){ _sailOrig(); return; }
  openSheet(`<div class="sheethead"><h3>⚓ 要開船去哪裡？</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <button class="btn" style="width:100%;text-align:left;padding:13px 14px;margin-bottom:8px;font-size:15px" onclick="closeSheet();goFishTrip()">🎣 出海捕魚</button>
    <button class="btn gold" style="width:100%;text-align:left;padding:13px 14px;font-size:15px" onclick="sailToLondon()">🚢 航向倫敦</button>`);
};

/* ===================== 🐕 牧羊犬（餵牛肉刷好感） ===================== */
const HERD_DOGS={
  sherlock:{ nm:'夏洛克', breed:'邊境牧羊犬', img:'dog_sherlock.png', e:'🐕', spd:0.14, scare:3.2, note:'跑得快，追羊一流' },
  watson:  { nm:'華生',   breed:'柯基',       img:'dog_watson.png',   e:'🐶', spd:0.10, scare:4.5, note:'腿短跑不快，但氣勢驚人（嚇羊範圍大）' },
};
const DOG_FOLLOW_AFF=30, DOG_FEED_GAIN=10, DOG_AFF_MAX=100;
function dogState(id){ if(!S.dogs)S.dogs={}; if(!S.dogs[id])S.dogs[id]={aff:0}; return S.dogs[id]; }
function dogReady(id){ return dogState(id).aff>=DOG_FOLLOW_AFF; }
function dogLine(id,pool){ const set=(typeof DOG_LINES!=='undefined'&&DOG_LINES[id])?DOG_LINES[id]:{};
  const arr=set[pool]||['汪。']; return arr[(Math.random()*arr.length)|0]; }
function openDog(id){
  const d=HERD_DOGS[id], st=dogState(id), ready=dogReady(id);
  const line=dogLine(id, ready?'high':'low');
  openSheet(`<div class="sheethead"><h3>${d.e} ${d.nm}・${d.breed}</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div style="background:var(--card);border:2px solid var(--line2);border-radius:12px;padding:12px;margin-bottom:10px;font-size:14px;line-height:1.6">${line}</div>
    <div class="small" style="margin-bottom:4px">好感 ${st.aff}/${DOG_AFF_MAX}・${ready?'<b style="color:var(--accent2)">願意跟你去牧羊</b>':`還不信任你（${DOG_FOLLOW_AFF} 以上才肯跟）`}</div>
    <div class="small" style="margin-bottom:10px">${d.note}</div>
    <button class="btn green ${(S.store.beef||0)<1?'dis':''}" style="width:100%" onclick="feedDog('${id}')">🥩 餵牛肉（庫存 ${S.store.beef||0}）</button>`);
}
function feedDog(id){
  if((S.store.beef||0)<1){ toast('沒有牛肉。宰牛或跟商人買一些吧'); return; }
  S.store.beef--; const st=dogState(id);
  st.aff=Math.min(DOG_AFF_MAX, st.aff+DOG_FEED_GAIN);
  toast(`🥩 ${HERD_DOGS[id].nm}：${dogLine(id,'feed')}`);
  save(); openDog(id);
}
/* --- 斯克特 --- */
const SCOTT_IMG=npcImg('scott.png');   // 64×64 單張立繪，沒放就用 emoji
function openScott(){
  const anyReady=Object.keys(HERD_DOGS).some(dogReady);
  const pool=(typeof SCOTT_LINES!=='undefined')
    ? (S.herdJustDone?SCOTT_LINES.done:(anyReady?SCOTT_LINES.ready:SCOTT_LINES.intro))
    : ['……'];
  const line=pool[(Math.random()*pool.length)|0];
  openSheet(`<div class="sheethead"><h3>🧔 斯克特</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div style="background:var(--card);border:2px solid var(--line2);border-radius:12px;padding:12px;margin-bottom:10px;font-size:14px;line-height:1.7">${line}</div>
    <div class="small">任務：餵牛肉討好狗（好感 ${DOG_FOLLOW_AFF}+）→ 去牧羊區站在柵欄邊「開始牧羊」→ 操縱狗把 ${5} 隻羊全趕進柵欄 → 關上柵欄門。做完一輪領一次工錢。</div>`);
}
/* --- 辦公室裡兩隻狗走動 --- */
const SCOTT_DOG_ZONE={x1:4,y1:6,x2:20,y2:11};
let scottNpcs={};
function scottWalkable(x,y){ const ix=Math.floor(x),iy=Math.floor(y),g=GRID.scott_office;
  if(iy<0||ix<0||iy>=g.length||ix>=g[0].length) return false; return !blocked(g[iy][ix]); }
function buildScottNpcs(){
  scottNpcs={};
  scottNpcs.sherlock={ x:7,y:8, tx:7,ty:8, facing:'down',frame:0,aT:0,aS:0,idleUntil:0 };
  scottNpcs.watson  ={ x:17,y:9,tx:17,ty:9,facing:'down',frame:0,aT:0,aS:0,idleUntil:0 };
}
function updateScottNpcs(){
  const now=Date.now();
  for(const id in scottNpcs){
    const n=scottNpcs[id];
    const dx=n.tx-n.x, dy=n.ty-n.y, d=Math.hypot(dx,dy);
    if(d<0.12){
      if(!n.idleUntil) n.idleUntil=now+1500+Math.random()*3000;
      else if(now>=n.idleUntil){ n.idleUntil=0;
        for(let i=0;i<15;i++){ const tx=SCOTT_DOG_ZONE.x1+Math.random()*(SCOTT_DOG_ZONE.x2-SCOTT_DOG_ZONE.x1),
          ty=SCOTT_DOG_ZONE.y1+Math.random()*(SCOTT_DOG_ZONE.y2-SCOTT_DOG_ZONE.y1);
          if(scottWalkable(tx,ty)){ n.tx=tx; n.ty=ty; break; } } }
      _herdAnim(n,false);
    }else{
      n.idleUntil=0;
      const nx=n.x+(dx/d)*0.045, ny=n.y+(dy/d)*0.045;
      if(scottWalkable(nx,n.y)) n.x=nx; if(scottWalkable(n.x,ny)) n.y=ny;
      _herdFace(n,dx,dy); _herdAnim(n,true);
    }
    const o=SCENES.scott_office.objects.find(ob=>ob.id===id);
    if(o){ o.x=Math.round(n.x); o.y=Math.round(n.y); }   // 互動點跟著狗
  }
}
function drawScottNpcs(){
  const ox=Math.round(cam.x*TS), oy=Math.round(cam.y*TS);
  // 斯克特（單張立繪）
  { const o=SCENES.scott_office.objects.find(x=>x.id==='scott');
    const px=o.x*TS+TS/2-ox, py=o.y*TS+TS/2-oy;
    if(SCOTT_IMG&&SCOTT_IMG.complete&&SCOTT_IMG.naturalWidth) ctx.drawImage(SCOTT_IMG,px-32,py-64+14,64,64);
    else{ ctx.font='26px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🧔',px,py); } }
  for(const id in scottNpcs) drawHerdSprite(npcImg(HERD_DOGS[id].img), scottNpcs[id], ox, oy, HERD_DOGS[id].e);
}

/* ===================== 🐑 牧羊小遊戲（操縱狗版） ===================== */
const HERD={ N:5, WANDER_SPD:0.03, FLEE_SPD:0.075, REWARD:500,
  FIELD:{x1:2,y1:2,x2:30,y2:23},
  PEN:{x1:33,y1:7,x2:40,y2:12},
  GATE:[{x:32,y:9},{x:32,y:10}],
  START:{x1:28,y1:7,x2:31,y2:12} };   // 站這裡按互動＝開始牧羊
const HERD_DIR_ROW={down:0,left:1,right:2,up:3};   // 走路圖方向列順序，不對改這裡
const BARK={ ms:700,          // 一次吠叫嚇羊的持續時間，越短越難
  spamN:4, spamWin:2500,      // 2.5 秒內吠到第 4 次 → 羊群恐慌
  panicMs:2500, panicSpd:0.11 // 恐慌持續時間／亂衝速度
};
let barkLog=[], panicUntil=0;
const BLACK_SHEEP={ flee:0.15, wander:0.05, senseMul:1.25,
  idleMs:300, idleRnd:700,   // 發呆超短：0.3~1 秒就動
  jink:0.025,                // 走路中每幀 2.5% 機率突然改道
  zig:0.65 };                // 逃跑蛇行幅度（0=直線逃，越大越歪）
const SHEEP_IMG=npcImg('sheep.png');
const SHEEP_BLACK_IMG=npcImg('sheep_black.png');
let sheepNpcs=[], herdCtl=null, gateClosed=false, herdDoneShown=false, herdFollowers=[];

function edinWalkable(x,y){ const ix=Math.floor(x),iy=Math.floor(y),g=GRID.edinburgh;
  if(iy<0||ix<0||iy>=g.length||ix>=g[0].length) return false; return !blocked(g[iy][ix]); }
function gateBlockedAt(x,y){ if(!gateClosed) return false;
  const ix=Math.floor(x),iy=Math.floor(y); return HERD.GATE.some(g=>g.x===ix&&g.y===iy); }
function herdWalkable(x,y){ return edinWalkable(x,y)&&!gateBlockedAt(x,y); }
function inPen(x,y){ const p=HERD.PEN, ix=Math.round(x),iy=Math.round(y);
  return ix>=p.x1&&ix<=p.x2&&iy>=p.y1&&iy<=p.y2; }
function inHerdStart(){ const a=HERD.START, px=Math.round(player.x),py=Math.round(player.y);
  return px>=a.x1&&px<=a.x2&&py>=a.y1&&py<=a.y2; }
function sheepTarget(s){ const z=inPen(s.x,s.y)?HERD.PEN:HERD.FIELD;
  for(let i=0;i<20;i++){ const tx=z.x1+Math.random()*(z.x2-z.x1), ty=z.y1+Math.random()*(z.y2-z.y1);
    if(edinWalkable(tx,ty)){ s.tx=tx; s.ty=ty; return; } } }
function initHerd(){
  sheepNpcs=[]; herdCtl=null; gateClosed=false;   // 每次進場：門打開、羊全放回草地
  barkLog=[]; panicUntil=0;
  S.herdJustDone=false;                            // 新的一輪 → 斯克特台詞重置
  for(let i=0;i<HERD.N+1;i++){                       // 多的那一隻是黑羊
    const s={x:8,y:8,tx:0,ty:0,facing:'down',frame:0,aT:0,aS:0,idleUntil:0,black:(i===HERD.N)};
    for(let t=0;t<30;t++){ const x=4+Math.random()*22, y=4+Math.random()*17;
      if(edinWalkable(x,y)&&!inPen(x,y)){ s.x=x; s.y=y; break; } }
    s.tx=s.x; s.ty=s.y; sheepNpcs.push(s);
  }
  herdFollowers=[];                                  // 好感達標的狗跟你進場
  let off=1;
  for(const id in HERD_DOGS){ if(dogReady(id)){
    herdFollowers.push({ id, x:player.x-off, y:player.y+0.5, facing:'right', frame:0, aT:0, aS:0 });
    off+=1.2;
  } }
}
function _herdAnim(o,moving){
  if(moving){ if(++o.aT>=WALK_SPEED){ o.aT=0; o.aS=(o.aS+1)%WALK_CYCLE.length; } o.frame=WALK_CYCLE[o.aS]; }
  else { o.frame=0; o.aT=0; o.aS=0; } }
function _herdFace(o,dx,dy){ o.facing=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'); }
function moveSheep(s,nx,ny){ if(herdWalkable(nx,s.y)) s.x=nx; if(herdWalkable(s.x,ny)) s.y=ny; }

/* --- 開始牧羊：選狗 --- */
function openHerdStart(){
  let rows='';
  for(const id in HERD_DOGS){ const d=HERD_DOGS[id], ok=dogReady(id);
    rows+=`<div class="row"><div class="e">${d.e}</div>
      <div class="info"><div class="n">${d.nm}・${d.breed}</div><div class="d">${d.note}${ok?'':`・好感不足（${dogState(id).aff}/${DOG_FOLLOW_AFF}）`}</div></div>
      <button class="btn sm ${ok?'green':'dis'}" onclick="${ok?`startHerdCtl('${id}')`:''}">${ok?'帶牠上':'不肯來'}</button></div>`; }
   
  openSheet(`<div class="sheethead"><h3>🐑 開始牧羊</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:8px">你會站在柵欄邊改為操縱狗。把 ${HERD.N} 隻羊全趕進柵欄，狗靠近門按互動鍵關門即完成。</div>
     ${rows}`);
}
function startHerdCtl(id){
  if(!dogReady(id)){ toast('牠還不肯聽你的'); return; }
  closeSheet();
  const _f=herdFollowers.find(x=>x.id===id);           // 從狗現在的位置出發
  herdCtl={ id, o:{ x:_f?_f.x:30, y:_f?_f.y:9.5, facing:'left', frame:0, aT:0, aS:0 } };
  player.facing='left';
  showBarkBtn(true);
  toast(`🐕 ${HERD_DOGS[id].nm} 出動！🔊鈕＝吠叫趕羊；互動鍵：靠門＝開關門、回主人旁＝收工`);
}
function endHerdCtl(msg){
  if(herdCtl){ const f=herdFollowers.find(x=>x.id===herdCtl.id);
    if(f){ f.x=herdCtl.o.x; f.y=herdCtl.o.y; } }     // 狗從收工地點自己走回你身邊
  herdCtl=null; showBarkBtn(false);
  toast(msg||'🐕 收工，回到自己身上');
}
function toggleGate(){ gateClosed=!gateClosed; toast(gateClosed?'🚧 柵欄門關上了':'🚧 柵欄門打開了'); }

/* --- 操縱狗模式：每幀 --- */
function updateHerdCtl(){
  const d=HERD_DOGS[herdCtl.id], o=herdCtl.o;
  let dx=0,dy=0;
  if(held.up)dy-=1; if(held.down)dy+=1; if(held.left)dx-=1; if(held.right)dx+=1;
  if(dx||dy){ const l=Math.hypot(dx,dy); dx/=l; dy/=l;
    const nx=o.x+dx*d.spd, ny=o.y+dy*d.spd;
    if(herdWalkable(nx,o.y)) o.x=nx;
    if(herdWalkable(o.x,ny)) o.y=ny;
    _herdFace(o,dx,dy); _herdAnim(o,true);
  } else _herdAnim(o,false);
  cam.x=Math.max(0,Math.min(o.x-VIEW_COLS/2+0.5, mapCols()-VIEW_COLS));
  cam.y=Math.max(0,Math.min(o.y-VIEW_ROWS/2+0.5, mapRows()-VIEW_ROWS));
  const penned=updateSheep(isBarking()?[{x:o.x, y:o.y, r:d.scare}]:[]);
  document.getElementById('sceneTitle').textContent=`🐑 已進欄 ${penned}/${sheepNpcs.length}・門${gateClosed?'關':'開'}`;
  const h=document.getElementById('hint');
  if(h){ h.textContent=dogNearGate()?'🚧 開／關柵欄門（互動鍵）'
      :dogNearPlayer()?'🏁 收工（互動鍵）'
      :'🔊 吠叫鈕（或 B 鍵）趕羊';
    h.classList.add('show'); }
  if(penned===sheepNpcs.length && gateClosed){
    S.herdJustDone=true;                     // 這一輪完成 → 斯克特換「做得還行」的台詞
    earn(HERD.REWARD,'幫斯克特牧羊');
    addLog(`🐑 ${HERD.N} 隻羊全數進欄，斯克特付了 $${HERD.REWARD}`);
    refreshTop(); save();
    endHerdCtl(`🎉 全部進欄！斯克特丟來一袋錢 +$${HERD.REWARD}`);
  }
}
function updateFollowers(){                          // 狗排成一列跟在你後面
  let lead={x:player.x, y:player.y};
  for(const f of herdFollowers){
    if(herdCtl && f.id===herdCtl.id){ continue; }    // 被操縱中的狗不跟
    const dx=lead.x-f.x, dy=lead.y-f.y, dist=Math.hypot(dx,dy);
    if(dist>1.3){
      const sp=HERD_DOGS[f.id].spd*0.9;
      const nx=f.x+(dx/dist)*sp, ny=f.y+(dy/dist)*sp;
      if(edinWalkable(nx,f.y)) f.x=nx;
      if(edinWalkable(f.x,ny)) f.y=ny;
      _herdFace(f,dx,dy); _herdAnim(f,true);
    } else _herdAnim(f,false);
    lead=f;
  }
}
function dogNearGate(){ if(!herdCtl) return false; const o=herdCtl.o;
  return HERD.GATE.some(g=>Math.max(Math.abs(o.x-g.x),Math.abs(o.y-g.y))<=1.6); }
function dogNearPlayer(){ if(!herdCtl) return false; const o=herdCtl.o;
  return Math.max(Math.abs(o.x-player.x),Math.abs(o.y-player.y))<=1.6; }
function bark(){
  if(!herdCtl) return;
  const now=Date.now();
  herdCtl.barkUntil=now+BARK.ms;
  barkLog.push(now);
  barkLog=barkLog.filter(t=>now-t<=BARK.spamWin);
  if(barkLog.length>=BARK.spamN && now>=panicUntil){
    panicUntil=now+BARK.panicMs; barkLog=[];
    for(const s of sheepNpcs){ const a=Math.random()*Math.PI*2;   // 每隻抽一個亂衝方向
      s.pvx=Math.cos(a); s.pvy=Math.sin(a); }
    toast('💥 吠太兇了！羊群恐慌亂衝！');
  }
}
function isPanic(){ return Date.now()<panicUntil; }
function herdBark(ev){ if(ev&&ev.preventDefault)ev.preventDefault(); bark(); }
function showBarkBtn(on){ const b=document.getElementById('barkBtn'); if(b) b.style.display=on?'flex':'none'; }
function isBarking(){ return herdCtl && Date.now()<(herdCtl.barkUntil||0); }
/* --- 羊：亂晃＋怕人和狗（threats=[{x,y,r}]） --- */
function updateSheep(threats){
  const now=Date.now(); let penned=0;
  for(const s of sheepNpcs){
    if(inPen(s.x,s.y)) penned++;
    if(isPanic()){                                     // 恐慌：不理狗，朝各自方向狂衝
      if(Math.random()<0.04){ const a=Math.random()*Math.PI*2; s.pvx=Math.cos(a); s.pvy=Math.sin(a); }
      const ox=s.x, oy=s.y;
      moveSheep(s, s.x+(s.pvx||0)*BARK.panicSpd, s.y+(s.pvy||0)*BARK.panicSpd);
      if(s.x===ox && s.y===oy){ const a=Math.random()*Math.PI*2; s.pvx=Math.cos(a); s.pvy=Math.sin(a); }  // 撞牆就換方向
      s.tx=s.x; s.ty=s.y; s.idleUntil=0;
      _herdFace(s, s.pvx||0, s.pvy||1); _herdAnim(s,true);
      continue;
    }
    let vx=0,vy=0,flee=false;
    const fleeSpd=s.black?BLACK_SHEEP.flee:HERD.FLEE_SPD;
    const wanderSpd=s.black?BLACK_SHEEP.wander:HERD.WANDER_SPD;
    for(const t of (threats||[])){
      const r=t.r*(s.black?BLACK_SHEEP.senseMul:1);   // 黑羊更早察覺
      const dx=s.x-t.x, dy=s.y-t.y, dd=Math.hypot(dx,dy);
      if(dd<r){ flee=true; const w=(r-dd)/r;
        vx+=(dx/(dd||0.01))*w; vy+=(dy/(dd||0.01))*w; } }
   if(flee){
      let l=Math.hypot(vx,vy)||1; vx/=l; vy/=l;
      if(s.black){                                    // 蛇行：疊一個左右擺的垂直分量
        const k=Math.sin(now/170 + s.x*3)*BLACK_SHEEP.zig;
        const px=-vy, py=vx;                          // 垂直方向
        vx+=px*k; vy+=py*k;
        l=Math.hypot(vx,vy)||1; vx/=l; vy/=l;
      }
      moveSheep(s, s.x+vx*fleeSpd, s.y+vy*fleeSpd);
      s.tx=s.x; s.ty=s.y; s.idleUntil=0; _herdFace(s,vx,vy); _herdAnim(s,true);
    }else{
      const dx=s.tx-s.x, dy=s.ty-s.y, dd=Math.hypot(dx,dy);
      if(dd<0.15){
        if(!s.idleUntil) s.idleUntil=now+(s.black?BLACK_SHEEP.idleMs+Math.random()*BLACK_SHEEP.idleRnd:1500+Math.random()*3000);
        else if(now>=s.idleUntil){ s.idleUntil=0; sheepTarget(s); }
        _herdAnim(s,false);
      }else{
        if(s.black && Math.random()<BLACK_SHEEP.jink) sheepTarget(s);   // 走一走突然改道
        moveSheep(s, s.x+(dx/dd)*wanderSpd, s.y+(dy/dd)*wanderSpd);
        _herdFace(s,dx,dy); _herdAnim(s,true); }
    }
  }
  return penned;
}
/* --- 畫圖 --- */
function drawHerdSprite(img,o,ox,oy,fb){
  const px=o.x*TS+TS/2-ox, py=o.y*TS+TS/2-oy;
  ctx.globalAlpha=1; ctx.fillStyle='#00000022';
  ctx.beginPath(); ctx.ellipse(px,py+5,11,4,0,0,Math.PI*2); ctx.fill();
  if(img&&img.complete&&img.naturalWidth){
    const sx=o.frame*64, sy=(HERD_DIR_ROW[o.facing]||0)*64;
    ctx.drawImage(img,sx,sy,64,64, px-32, py-64+14, 64,64);
  }else{ ctx.fillStyle='#000'; ctx.font='20px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(fb,px,py); }
}
function drawGateBar(ox,oy){                       // 關門時的簡易門板，之後可換圖
  if(!gateClosed) return;
  ctx.fillStyle='#8a5a2b';
  ctx.fillRect(HERD.GATE[0].x*TS-ox+3, HERD.GATE[0].y*TS-oy, 5, TS*HERD.GATE.length);
}
function drawHerd(){
  const ox=Math.round(cam.x*TS), oy=Math.round(cam.y*TS);
  const all=sheepNpcs.map(s=>({o:s, img:s.black?SHEEP_BLACK_IMG:SHEEP_IMG, fb:s.black?'⚫':'🐑'}));
  for(const f of herdFollowers){ if(herdCtl && f.id===herdCtl.id) continue;
    all.push({o:f, img:npcImg(HERD_DOGS[f.id].img), fb:HERD_DOGS[f.id].e}); }
  if(herdCtl) all.push({o:herdCtl.o, img:npcImg(HERD_DOGS[herdCtl.id].img), fb:HERD_DOGS[herdCtl.id].e});
  all.sort((a,b)=>a.o.y-b.o.y);
  for(const it of all) drawHerdSprite(it.img,it.o,ox,oy,it.fb);
  if(isPanic()){ ctx.font='bold 12px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    for(const s of sheepNpcs){ const px=s.x*TS+TS/2-ox, py=s.y*TS-oy-50;
      ctx.fillStyle='#d23b3b'; ctx.strokeStyle='#ffffffcc'; ctx.lineWidth=3;
      ctx.strokeText('！',px,py); ctx.fillText('！',px,py); } }
  if(isBarking()){ const o=herdCtl.o, px=o.x*TS+TS/2-ox, py=o.y*TS-oy-52;
    ctx.font='bold 13px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='#fff'; ctx.strokeStyle='#00000088'; ctx.lineWidth=3;
    ctx.strokeText('汪！',px,py); ctx.fillText('汪！',px,py); }
  drawGateBar(ox,oy);
}

/* ===================== 掛勾 ===================== */
const _herdGoScene=goScene;
goScene=function(n){
  if(n!=='edinburgh'){ herdCtl=null; showBarkBtn(false); }
  _herdGoScene(n);
  if(n==='edinburgh') initHerd();
  if(n==='scott_office') buildScottNpcs();
};
const _herdUpdate=update;
update=function(){
  if(S && curScene==='edinburgh' && herdCtl){ updateHerdCtl(); return; }   // 操縱狗時整幀接管
  _herdUpdate();
  if(!S) return;
  if(curScene==='edinburgh'){
    updateFollowers();
    const penned=updateSheep([]);   // 平常模式：人和跟隨的狗都趕不動羊，只能看
    document.getElementById('sceneTitle').textContent=`🐑 已進欄 ${penned}/${sheepNpcs.length}・門${gateClosed?'關':'開'}`;
    if(inHerdStart()){ const h=document.getElementById('hint');
      if(h){ h.textContent='🐑 開始牧羊（互動鍵）'; h.classList.add('show'); } }
  }
  if(curScene==='scott_office') updateScottNpcs();
};
const _herdDraw=draw;
draw=function(){
  _herdDraw();
  if(!S) return;
  if(curScene==='edinburgh') drawHerd();
  if(curScene==='scott_office') drawScottNpcs();
};
const _herdInteract=interact;
interact=function(ev){
  if(S && curScene==='edinburgh' && herdCtl){
    if(ev&&ev.preventDefault) ev.preventDefault();
    if(dogNearGate()) toggleGate();
    else if(dogNearPlayer()) endHerdCtl();
    return;
  }
  if(S && curScene==='edinburgh' && !herdCtl && inHerdStart()){
    if(ev&&ev.preventDefault) ev.preventDefault(); openHerdStart(); return;
  }
  if(S && curScene==='scott_office' && !sitting){
    const o=facingObject();
    if(o && o.kind==='scott'){ if(ev&&ev.preventDefault)ev.preventDefault(); openScott(); return; }
    if(o && o.kind==='dog'){ if(ev&&ev.preventDefault)ev.preventDefault(); openDog(o.did); return; }
  }
  return _herdInteract(ev);
};
document.addEventListener('keydown',e=>{ if((e.key==='b'||e.key==='B')&&herdCtl){ bark(); e.preventDefault(); } });
/* =================== 🐑 19世紀內容 結束 =================== */