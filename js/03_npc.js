/* ---------- 雞（在雞舍範圍走動） ---------- */
const CHICK_IMG=new Image(); CHICK_IMG.src='chick.png';
const HEN_IMG=new Image();   HEN_IMG.src='Hen.png';
const TURKEY_IMG=new Image();TURKEY_IMG.src='turkey.png';
const PIGLET_IMG=new Image();PIGLET_IMG.src='piglet.png';
const PIG_IMG=new Image();   PIG_IMG.src='pig.png';
const CALF_IMG=new Image();  CALF_IMG.src='calf.png';
const COW_IMG=new Image();   COW_IMG.src='cow.png';
/* ---------- 蛋箱：產蛋上限 + 滿箱疊圖 ---------- */
const EGG_BOX_COUNT=3;          // 蛋箱數＝最多疊幾張圖
const EGG_PER_BOX=8;            // 每箱幾顆蛋（總上限 = 3×8 = 24；想要更少蛋就把這調小）
const EGG_BOX_IMG=['egg_box1.png','egg_box2.png','egg_box3.png'];  // 三張「整張地圖一樣大」的圖
const EGG_HUNGER_MS=DAY;   // 雞超過這時間沒餵→停止產蛋（餵了才繼續），想嚴格就調小
const FEED_BOWL_IMG={ chicken:'feed_chicken.png', pig:'feed_pig.png', cow:'feed_cow.png' };  // 各區飼料盆「滿」的整張地圖圖
const BOWL_FULL_MS=60000;  // 餵完後飼料盆顯示滿盆多久（毫秒），到時間變回空盆
function bowlFull(zone){ return Date.now() - ((S.feedBowl&&S.feedBowl[zone])||0) < BOWL_FULL_MS; }
function eggCap(){ return EGG_BOX_COUNT*EGG_PER_BOX; }
function eggTotalPending(){ let s=0; const list=(S.animals&&S.animals.chicken)||[]; for(const a of list) s+=(a.pending||0); return s; }
function eggBoxes(){ return Math.min(EGG_BOX_COUNT, Math.ceil(eggTotalPending()/EGG_PER_BOX)); }  // 要疊幾張圖＝有蛋的箱數
const CHICKEN_ZONE={x1:23,y1:18,x2:28,y2:23};   // 對應 FARM_ZONES 的雞舍範圍
const CHICKEN_SPEED=0.035, CHICKEN_FRAME_MS=400;
let chickenNpcs=[];
function chickenWalkable(x,y){
  const ix=Math.round(x),iy=Math.round(y),z=CHICKEN_ZONE;
  return ix>=z.x1&&ix<=z.x2&&iy>=z.y1&&iy<=z.y2;
}
function pickChickenTarget(c){
  const z=CHICKEN_ZONE;
  for(let i=0;i<12;i++){
    const tx=z.x1+Math.floor(Math.random()*(z.x2-z.x1+1));
    const ty=z.y1+Math.floor(Math.random()*(z.y2-z.y1+1));
    if(chickenWalkable(tx,ty)){ c.tx=tx; c.ty=ty; return; }
  }
}
function buildChickens(){
  chickenNpcs=[];
  const list=(S.animals&&S.animals.chicken)||[];
  list.forEach((a,i)=>{
    const slotX=CHICKEN_ZONE.x1+(i%((CHICKEN_ZONE.x2-CHICKEN_ZONE.x1)||1));
    const slotY=CHICKEN_ZONE.y1+(i%((CHICKEN_ZONE.y2-CHICKEN_ZONE.y1+1)));
    chickenNpcs.push({ idx:i, x:slotX, y:slotY, tx:slotX, ty:slotY,
      flip:false, frame:0, frameT:0, idleUntil:0 });
  });
}
function isHen(a){ return (a.feedCount||0) >= (ANIMALS.chicken.growFeed||2); }
function updateChickens(){
  const now=Date.now(), list=(S.animals&&S.animals.chicken)||[];
  if(chickenNpcs.length!==list.length) buildChickens();
  for(const c of chickenNpcs){
    const dx=c.tx-c.x, dy=c.ty-c.y, d=Math.hypot(dx,dy);
    if(d<0.1){
      if(!c.idleUntil) c.idleUntil=now+800+Math.random()*2500;
      else if(now>=c.idleUntil){ c.idleUntil=0; pickChickenTarget(c); }
    }else{
      c.idleUntil=0;
      c.x+=(dx/d)*CHICKEN_SPEED; c.y+=(dy/d)*CHICKEN_SPEED;
      if(Math.abs(dx)>0.01) c.flip = dx<0;   // 往左走→鏡像
      if(now-c.frameT>=CHICKEN_FRAME_MS){ c.frameT=now; c.frame=(c.frame+1)%2; }
    }
  }
}
function drawChickens(ox,oy){
  const list=(S.animals&&S.animals.chicken)||[];
  for(const c of chickenNpcs){
    const a=list[c.idx]; if(!a) continue;
    const turkey=a.species==='turkey', adult=isHen(a);
    const img = turkey ? (adult?TURKEY_IMG:CHICK_IMG) : (adult?HEN_IMG:CHICK_IMG);
    const px=c.x*TS+TS/2-ox, py=c.y*TS+TS/2-oy;
    const shW=adult?12:5, shH=adult?4:2, shY=4;   // 大隻：影子大
    ctx.globalAlpha=1; ctx.fillStyle='#00000022';
    ctx.beginPath();ctx.ellipse(px,py+shY,shW,shH,0,0,Math.PI*2);ctx.fill();
    if(img && img.complete && img.naturalWidth){
      const fw=32, fh=32, sx=c.frame*fw;
      if(c.flip){
        ctx.save(); ctx.translate(px,0); ctx.scale(-1,1);
        ctx.drawImage(img, sx,0,fw,fh, -16, py-32+6, 32,32);
        ctx.restore();
      }else{
        ctx.drawImage(img, sx,0,fw,fh, px-16, py-32+6, 32,32);
      }
    }else{
      ctx.fillStyle='#000'; ctx.font='18px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(turkey?(adult?'🦃':'🐤'):(adult?'🐔':'🐤'), px, py);
    }
  }
}
/* ---------- 豬（在豬圈範圍走動） ---------- */
const PIG_ZONE={x1:22,y1:8,x2:28,y2:13};   // 對應 FARM_ZONES 的豬圈範圍
const PIG_SPEED=0.03, PIG_FRAME_MS=450;
let pigNpcs=[];
function pigWalkable(x,y){
  const ix=Math.round(x),iy=Math.round(y),z=PIG_ZONE;
  return ix>=z.x1&&ix<=z.x2&&iy>=z.y1&&iy<=z.y2;
}
function pickPigTarget(p){
  const z=PIG_ZONE;
  for(let i=0;i<12;i++){
    const tx=z.x1+Math.floor(Math.random()*(z.x2-z.x1+1));
    const ty=z.y1+Math.floor(Math.random()*(z.y2-z.y1+1));
    if(pigWalkable(tx,ty)){ p.tx=tx; p.ty=ty; return; }
  }
}
function buildPigs(){
  pigNpcs=[];
  const list=(S.animals&&S.animals.pig)||[];
  list.forEach((a,i)=>{
    const slotX=PIG_ZONE.x1+(i%((PIG_ZONE.x2-PIG_ZONE.x1)||1));
    const slotY=PIG_ZONE.y1+(i%((PIG_ZONE.y2-PIG_ZONE.y1+1)));
    pigNpcs.push({ idx:i, x:slotX, y:slotY, tx:slotX, ty:slotY,
      flip:false, frame:0, frameT:0, idleUntil:0 });
  });
}
function isGrownPig(a){ return (a.feedCount||0) >= (ANIMALS.pig.growFeed||2); }
function updatePigs(){
  const now=Date.now(), list=(S.animals&&S.animals.pig)||[];
  if(pigNpcs.length!==list.length) buildPigs();
  for(const p of pigNpcs){
    const dx=p.tx-p.x, dy=p.ty-p.y, d=Math.hypot(dx,dy);
    if(d<0.1){
      if(!p.idleUntil) p.idleUntil=now+1000+Math.random()*3000;
      else if(now>=p.idleUntil){ p.idleUntil=0; pickPigTarget(p); }
    }else{
      p.idleUntil=0;
      p.x+=(dx/d)*PIG_SPEED; p.y+=(dy/d)*PIG_SPEED;
      if(Math.abs(dx)>0.01) p.flip = dx<0;   // 往左走→鏡像
      if(now-p.frameT>=PIG_FRAME_MS){ p.frameT=now; p.frame=(p.frame+1)%2; }
    }
  }
}
function drawPigs(ox,oy){
  const list=(S.animals&&S.animals.pig)||[];
  for(const p of pigNpcs){
    const a=list[p.idx]; if(!a) continue;
    const grown=isGrownPig(a);
    const img = grown?PIG_IMG:PIGLET_IMG;
    const px=p.x*TS+TS/2-ox, py=p.y*TS+TS/2-oy;
    const shW=grown?13:6, shH=grown?4:2, shY=-1;
    ctx.globalAlpha=1; ctx.fillStyle='#00000022';
    ctx.beginPath();ctx.ellipse(px,py+shY,shW,shH,0,0,Math.PI*2);ctx.fill();
    if(img && img.complete && img.naturalWidth){
      const fw=64, fh=64, sx=p.frame*fw;   // 走路兩楨，橫向排
      if(p.flip){
        ctx.save(); ctx.translate(px,0); ctx.scale(-1,1);
        ctx.drawImage(img, sx,0,fw,fh, -32, py-64+14, 64,64);
        ctx.restore();
      }else{
        ctx.drawImage(img, sx,0,fw,fh, px-32, py-64+14, 64,64);
      }
    }else{
      ctx.fillStyle='#000'; ctx.font='18px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(grown?'🐖':'🐷', px, py);
    }
  }
}
/* ---------- 農田 NPC（少年阿爾弗雷德閒晃／顧農場） ---------- */
const ALFRED_ZONE={x1:0,y1:24,x2:21,y2:27};   // 阿爾在農田的活動範圍，想換地方就改這
let farmNpcs={};
function farmNpcWalkable(x,y){
  const ix=Math.round(x),iy=Math.round(y);
  if(ix<ALFRED_ZONE.x1||ix>ALFRED_ZONE.x2||iy<ALFRED_ZONE.y1||iy>ALFRED_ZONE.y2) return false;
  return snakeWalkable(ix,iy);   // 不走柵欄、不撞牆
}
function pickFarmNpcTarget(n){
  for(let i=0;i<20;i++){
    const tx=ALFRED_ZONE.x1+Math.floor(Math.random()*(ALFRED_ZONE.x2-ALFRED_ZONE.x1+1));
    const ty=ALFRED_ZONE.y1+Math.floor(Math.random()*(ALFRED_ZONE.y2-ALFRED_ZONE.y1+1));
    if(farmNpcWalkable(tx,ty)){ n.tx=tx; n.ty=ty; return; }
  }
}
function buildFarmNpcs(){
  farmNpcs={};
  SCENES.farm.objects=SCENES.farm.objects.filter(o=>o.id!=='alfred'&&o.id!=='howard');
  if(S.child && S.child.stage===3){   // 少年期才出現在農田
    const nm=S.child.name||'阿爾弗雷德', sx=8, sy=24;
    SCENES.farm.objects.push({id:'alfred',x:sx,y:sy,e:'🧑‍🎓',nm,kind:'farmhand',npc:true,avatar:'🧑‍🎓',hide:true});
    farmNpcs['alfred']={ x:sx,y:sy, tx:sx,ty:sy, facing:'down', frame:0,aTimer:0,aStep:0,moving:false,idleUntil:0,
      img:npcImg('child_teen.png'), fallback:'🧑‍🎓' };
  }
  if(S.employee){   // 雇用農夫後，他會在農田區走動
    const sx=14, sy=26;
    SCENES.farm.objects.push({id:'howard',x:sx,y:sy,e:'👷',nm:'霍華德',kind:'employee',npc:true,avatar:'👷',hide:true});
    farmNpcs['howard']={ x:sx,y:sy, tx:sx,ty:sy, facing:'down', frame:0,aTimer:0,aStep:0,moving:false,idleUntil:0,
      img:npcImg('employee.png'), fallback:'👷' };
  }
}
function updateFarmNpcs(){
  const now=Date.now();
  for(const id in farmNpcs){
    const n=farmNpcs[id];
    const dx=n.tx-n.x, dy=n.ty-n.y, d=Math.hypot(dx,dy);
    if(d<0.12){
      n.moving=false;
      if(!n.idleUntil) n.idleUntil=now+1200+Math.random()*2800;
      else if(now>=n.idleUntil){ n.idleUntil=0; pickFarmNpcTarget(n); }
    }else{
      n.idleUntil=0;
      const nx=n.x+(dx/d)*NPC_SPEED, ny=n.y+(dy/d)*NPC_SPEED;
      if(farmNpcWalkable(nx,n.y)) n.x=nx; else pickFarmNpcTarget(n);
      if(farmNpcWalkable(n.x,ny)) n.y=ny;
      n.facing = Math.abs(dx)>Math.abs(dy) ? (dx>0?'right':'left') : (dy>0?'down':'up');
      n.moving=true;
    }
    if(n.moving){ if(++n.aTimer>=WALK_SPEED){ n.aTimer=0; n.aStep=(n.aStep+1)%WALK_CYCLE.length; } n.frame=WALK_CYCLE[n.aStep]; }
    else { n.frame=0; n.aTimer=0; n.aStep=0; }
    const o=SCENES.farm.objects.find(ob=>ob.id===id);
    if(o){ o.x=Math.round(n.x); o.y=Math.round(n.y); }
  }
}
function drawFarmNpcs(ox,oy){
  for(const id in farmNpcs){
    const n=farmNpcs[id];
    const px=n.x*TS+TS/2-ox, py=n.y*TS+TS/2-oy;
    ctx.globalAlpha=1; ctx.fillStyle='#00000022';
    ctx.beginPath();ctx.ellipse(px,py+6,12,4,0,0,Math.PI*2);ctx.fill();
    if(n.img && n.img.complete && n.img.naturalWidth){
      const dirCols={down:0,left:1,right:2,up:3}, sx=(dirCols[n.facing]||0)*64, sy=n.frame*64;
      ctx.drawImage(n.img, sx,sy,64,64, px-32, py-64+14, 64,64);
    }else{
      ctx.fillStyle='#000'; ctx.font='22px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(n.fallback||'🧑‍🎓', px, py);
    }
  }
}
function alfredFarmLines(){
  const set=(typeof ALFRED_FARM_LINES!=='undefined')?ALFRED_FARM_LINES:{idle:['…'],hired:['…']};
  return S.childHired ? (set.hired||['…']) : (set.idle||['…']);
}
function openFarmhand(){
  const nm=(S.child&&S.child.name)||'阿爾弗雷德';
  const pool=alfredFarmLines(), line=pool[Math.floor(Math.random()*pool.length)];
  const action = S.childHired
    ? `<button class="btn ghost" style="width:100%;color:var(--danger)" onclick="fireChild()">讓他別做了</button>`
    : `<button class="btn green" style="width:100%" onclick="hireChild()">雇用他顧農場（蛇不敢來）</button>`;
  openSheet(`<div class="sheethead"><h3>🧑‍🎓 ${nm}</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div class="small" style="margin-bottom:6px">${S.childHired?'農場交給他打理中，自動照料、不怕蛇。':'少年期的他正在農田裡晃。'}</div>
    <div style="background:var(--card);border:2px solid var(--line2);border-radius:12px;padding:12px;margin-bottom:14px;font-size:14px;line-height:1.5">${line}</div>
    ${action}`);
}
function hireChild(){
  S.childHired=true; monsters=[]; shots=[];
  addLog(`🧑‍🎓 ${(S.child&&S.child.name)||'阿爾弗雷德'} 開始幫忙顧農場`);
  closeSheet(); toast('🧑‍🎓 他開始顧農場了，蛇也不敢來了'); save();
}
function fireChild(){
  S.childHired=false;
  if(curScene==='farm') spawnSnakes();
  addLog('🧑‍🎓 讓阿爾弗雷德休息一下');
  closeSheet(); toast('他暫時不顧農場了'); save();
}
/* ---------- 牛（在牛棚範圍走動） ---------- */
const COW_ZONE={x1:3,y1:8,x2:12,y2:11};   // 對應 FARM_ZONES 的牛棚範圍
const COW_SPEED=0.028, COW_FRAME_MS=460;
let cowNpcs=[];
function cowWalkable(x,y){
  const ix=Math.round(x),iy=Math.round(y),z=COW_ZONE;
  return ix>=z.x1&&ix<=z.x2&&iy>=z.y1&&iy<=z.y2;
}
function pickCowTarget(c){
  const z=COW_ZONE;
  for(let i=0;i<12;i++){
    const tx=z.x1+Math.floor(Math.random()*(z.x2-z.x1+1));
    const ty=z.y1+Math.floor(Math.random()*(z.y2-z.y1+1));
    if(cowWalkable(tx,ty)){ c.tx=tx; c.ty=ty; return; }
  }
}
function buildCows(){
  cowNpcs=[];
  const list=(S.animals&&S.animals.cow)||[];
  list.forEach((a,i)=>{
    const slotX=COW_ZONE.x1+(i%((COW_ZONE.x2-COW_ZONE.x1)||1));
    const slotY=COW_ZONE.y1+(i%((COW_ZONE.y2-COW_ZONE.y1+1)));
    cowNpcs.push({ idx:i, x:slotX, y:slotY, tx:slotX, ty:slotY,
      flip:false, frame:0, frameT:0, idleUntil:0 });
  });
}
function isGrownCow(a){ return (a.feedCount||0) >= (ANIMALS.cow.growFeed||2); }
function updateCows(){
  const now=Date.now(), list=(S.animals&&S.animals.cow)||[];
  if(cowNpcs.length!==list.length) buildCows();
  for(const c of cowNpcs){
    const dx=c.tx-c.x, dy=c.ty-c.y, d=Math.hypot(dx,dy);
    if(d<0.1){
      if(!c.idleUntil) c.idleUntil=now+1200+Math.random()*3000;
      else if(now>=c.idleUntil){ c.idleUntil=0; pickCowTarget(c); }
    }else{
      c.idleUntil=0;
      c.x+=(dx/d)*COW_SPEED; c.y+=(dy/d)*COW_SPEED;
      if(Math.abs(dx)>0.01) c.flip = dx<0;   // 往左走→鏡像
      if(now-c.frameT>=COW_FRAME_MS){ c.frameT=now; c.frame=(c.frame+1)%2; }
    }
  }
}
function drawCows(ox,oy){
  const list=(S.animals&&S.animals.cow)||[];
  for(const c of cowNpcs){
    const a=list[c.idx]; if(!a) continue;
    const grown=isGrownCow(a);
    const img = grown?COW_IMG:CALF_IMG;
    const px=c.x*TS+TS/2-ox, py=c.y*TS+TS/2-oy;
    const shW=grown?14:7, shH=grown?4:2, shY=-1;
    ctx.globalAlpha=1; ctx.fillStyle='#00000022';
    ctx.beginPath();ctx.ellipse(px,py+shY,shW,shH,0,0,Math.PI*2);ctx.fill();
    if(img && img.complete && img.naturalWidth){
      const fw=64, fh=64, sx=c.frame*fw;   // 走路兩楨，橫向排
      if(c.flip){
        ctx.save(); ctx.translate(px,0); ctx.scale(-1,1);
        ctx.drawImage(img, sx,0,fw,fh, -32, py-64+14, 64,64);
        ctx.restore();
      }else{
        ctx.drawImage(img, sx,0,fw,fh, px-32, py-64+14, 64,64);
      }
    }else{
      ctx.fillStyle='#000'; ctx.font='18px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(grown?'🐄':'🐮', px, py);
    }
  }
}
const MONSTER_CAP=2, SNAKE_SPEED=0.07, AGGRO=5, BITE_RANGE=0.7, BITE_CD=1200, SNAKE_DMG=2, SPAWN_MS=12000;
function randFarmTile(){
  const C=GRID.farm[0].length, R=GRID.farm.length;
  for(let i=0;i<30;i++){
    const x=1+Math.floor(Math.random()*(C-2)), y=1+Math.floor(Math.random()*(R-2));
    if(snakeWalkable(x,y) && Math.hypot(x-player.x,y-player.y)>5) return {x,y};
  }
  return null;
}
function inFencedPen(ix,iy){
  return FARM_ZONES.some(z=>(z.kind==='chicken'||z.kind==='cow'||z.kind==='pig')
    && ix>=z.x1&&ix<=z.x2&&iy>=z.y1&&iy<=z.y2);
}
function snakeWalkable(x,y){ const ix=Math.floor(x),iy=Math.floor(y),C=GRID.farm[0].length,R=GRID.farm.length;
  if(ix<0||iy<0||ix>=C||iy>=R) return false;
  if(inFencedPen(ix,iy)) return false;            // 不進柵欄（雞舍／牛棚／豬圈）
  return !blocked(GRID.farm[iy][ix]); }
function spawnSnake(){ const p=randFarmTile(); if(!p) return; monsters.push({x:p.x,y:p.y,hp:4,lastBite:0,wanderT:0,wx:0,wy:0,facing:'down',frame:0,aTimer:0,aStep:0,moving:false}); }
function spawnSnakes(){ monsters=[]; shots=[]; if(S.childHired) return; for(let i=0;i<MONSTER_CAP;i++) spawnSnake(); lastSpawn=Date.now(); }
function updateMonsters(){
  if(S.childHired){ if(monsters.length) monsters=[]; return; }
  const now=Date.now();
  if(monsters.length<MONSTER_CAP && now-lastSpawn>SPAWN_MS){ lastSpawn=now; spawnSnake(); }
  for(const m of monsters){
    const px0=m.x, py0=m.y;
    const dx=player.x-m.x, dy=player.y-m.y, dist=Math.hypot(dx,dy)||0.001;
    if(dist<=AGGRO){
      const nx=m.x+(dx/dist)*SNAKE_SPEED, ny=m.y+(dy/dist)*SNAKE_SPEED;
      if(snakeWalkable(nx,m.y)) m.x=nx;
      if(snakeWalkable(m.x,ny)) m.y=ny;
      m.facing = Math.abs(dx)>Math.abs(dy) ? (dx>0?'right':'left') : (dy>0?'down':'up');
      if(dist<=BITE_RANGE && now-m.lastBite>=BITE_CD){ m.lastBite=now; damagePlayer(Math.max(1,Math.round(SNAKE_DMG*combatDefMul()))); }
    }else{
      if(now>m.wanderT){ m.wanderT=now+1000+Math.random()*1500; const a=Math.random()*Math.PI*2; m.wx=Math.cos(a); m.wy=Math.sin(a); }
      if(snakeWalkable(m.x+m.wx*SNAKE_SPEED*0.5, m.y)) m.x+=m.wx*SNAKE_SPEED*0.5;
      if(snakeWalkable(m.x, m.y+m.wy*SNAKE_SPEED*0.5)) m.y+=m.wy*SNAKE_SPEED*0.5;
      m.facing = Math.abs(m.wx)>Math.abs(m.wy) ? (m.wx>0?'right':'left') : (m.wy>0?'down':'up');
    }
    m.moving = (Math.abs(m.x-px0)>0.0005 || Math.abs(m.y-py0)>0.0005);
    if(m.moving){ if(++m.aTimer>=WALK_SPEED){ m.aTimer=0; m.aStep=(m.aStep+1)%WALK_CYCLE.length; } m.frame=WALK_CYCLE[m.aStep]; }
    else { m.frame=0; m.aTimer=0; m.aStep=0; }
  }
}
/* ---------- 投擲毒物 ---------- */
let shots=[];
let equipped=null;   // null=空手；'toxin'=選了毒物。之後要加別的工具就放這
const THROW_SPEED=0.35, TOXIN_DMG=2, SHOT_LIFE=60, HIT_RANGE=0.7;
function toggleEquip(ev){
  if(ev)ev.preventDefault();
  if(curScene==='fishing'){ fishToggleWeapon(); return; }
  if(curScene==='fishing'){ fishAttack(); return; }   // 捕魚場景：互動鍵＝攻擊
  if(curScene!=='farm'){ toast('只能在農牧地使用'); return; }
  equipped = (equipped==='toxin') ? null : 'toxin';
  toast(equipped==='toxin' ? '🧪 已選擇毒物：按互動鍵投擲' : '收起毒物，恢復一般互動');
}
function throwToxin(ev){
  if(ev)ev.preventDefault();
  if(curScene!=='farm'){ toast('只能在農牧地投擲'); return; }
  if((S.toxins||0)<=0){ toast('沒有毒物，去廚房做'); return; }
  S.toxins--;
  const d=DIR[player.facing]||{x:0,y:-1};
  shots.push({ x:player.x, y:player.y, dx:d.x*THROW_SPEED, dy:d.y*THROW_SPEED, life:SHOT_LIFE });
  save();
}
function updateShots(){
  for(let i=shots.length-1;i>=0;i--){
    const s=shots[i]; s.x+=s.dx; s.y+=s.dy; s.life--;
    let hit=!snakeWalkable(s.x,s.y);
    if(!hit){
      for(let j=monsters.length-1;j>=0;j--){
        const m=monsters[j];
        if(Math.hypot(m.x-s.x,m.y-s.y)<=HIT_RANGE){
          m.hp-=TOXIN_DMG*combatAtkMul(); hit=true;
          if(m.hp<=0){ monsters.splice(j,1); earn(2,'打死蛇'); toast('💥 打死一條蛇 +$2'); }
          else toast('🧪 命中！');
          break;
        }
      }
    }
    if(hit || s.life<=0) shots.splice(i,1);
  }
}
/* ---------- 對話系統（選項＋表情） ---------- */
const CHARS={
  Francis:{ nm:'弗朗西斯·波諾弗瓦', face:{ neutral:'Francis_neutral.png', happy:'Francis_happy.png', shy:'Francis_shy.png', love:'Francis_love.png', sad:'😢' } },
  Pedro: { nm:'佩德羅·費爾南德斯·卡里埃多', face:{ neutral:'🧔',   happy:'😄', shy:'😅', love:'😍', sad:'😟' } },
  Antonio:{ nm:'安東尼奧·費爾南德斯·卡里埃多',   face:{ neutral:'👩‍🦰', happy:'😊', shy:'😳', love:'🥰', sad:'😢' } },
  Alfred:{ nm:'阿爾弗雷德·F·瓊斯',   face:{ neutral:'🤵', happy:'😎', shy:'😏', love:'😍', sad:'😞' } },
  Matthew:{ nm:'馬修·威廉姆斯',      face:{ neutral:'😊', happy:'😄', shy:'😳', love:'🥰', sad:'😢' } },
};
function charFace(id,mood){ const c=CHARS[id]; if(!c) return '🙂'; return c.face[mood]||c.face.neutral||'🙂'; }
function charName(id){ return (CHARS[id]&&CHARS[id].nm)||(MERCHANTS[id]&&MERCHANTS[id].nm)||id; }
let _dlgChoices=[];
function showDialogue(charId, mood, text, choices){
  _dlgChoices=choices||[];
  const face=charFace(charId,mood), nm=charName(charId);
  const faceHtml = /\.(png|jpe?g|gif|webp)$/i.test(face)
    ? `<img src="${face}" style="width:110px;height:110px;object-fit:contain;image-rendering:pixelated">`
    : `<span style="font-size:56px">${face}</span>`;
  const btns=_dlgChoices.map((c,i)=>`<button class="btn ${c.cls||''}" style="width:100%;margin-bottom:6px" onclick="dlgChoice(${i})">${c.t}</button>`).join('');
  openSheet(`<div class="sheethead"><h3>${nm}</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <div style="text-align:center;margin:2px 0 10px">${faceHtml}</div>
    <div style="background:var(--card);border:2px solid var(--line2);border-radius:12px;padding:12px;margin-bottom:14px;font-size:14px;line-height:1.5">${text}</div>${btns}`);
}
function dlgChoice(i){ const c=_dlgChoices[i]; if(c&&c.run) c.run(); }


function chatPartner(){
  const p=S.partner; if(!p) return;
  freezeNpcById('partner'); _convoCid=p.id;
  const convo=PARTNER_CONVOS[Math.floor(Math.random()*PARTNER_CONVOS.length)];
  runScript(convo.lines, convo.choices.map(opt=>({ t:opt.t, run:()=>partnerPick(opt) })));
}
function partnerPick(opt){
  const p=S.partner; if(!p) return;
  p.intimacy=(p.intimacy||0)+(opt.g||0);
  if(p.intimacy<=BREAKUP_INTIMACY){ breakupPartner(); return; }
  save(); _convoCid=p.id;
  const tag = opt.g===0 ? '' : `（親密度 ${opt.g>0?'+':''}${opt.g}）`;
  const rep=opt.r||{who:'partner',mood:'happy',t:'嗯。'};
  dlgLine({who:rep.who,mood:rep.mood,t:rep.t+tag}, [
    {t:'再聊聊', run:()=>chatPartner()},
    {t:'結束', cls:'green', run:()=>openPartner()} ]);
}
function breakupPartner(){
  const p=S.partner; if(!p) return;
  const id=p.id;
  _convoCid=id; freezeNpcById('partner');     // 表情要對、對方先停下
  const lines=(typeof BREAKUP_CONVOS!=='undefined' && (BREAKUP_CONVOS[id]||BREAKUP_CONVOS._default))
            || [{who:'partner',mood:'sad',t:'…也許我們比較適合當朋友。'}];
  runScript(lines, [ {t:'…好', cls:'ghost', run:()=>finalizeBreakup(id)} ]);
}
function finalizeBreakup(id){
  const nm=(MERCHANTS[id]||{}).nm||'對方';
  S.partner=null;
  if(S.port.relations[id]) S.port.relations[id].aff=Math.min(S.port.relations[id].aff, ROMANCE_AFF-7);
  else S.port.relations[id]={aff:8,met:true,lastChat:0};
  syncPartnerObject();
  if(typeof officeNpcs!=='undefined' && officeNpcs['partner']) delete officeNpcs['partner'];
  if(typeof buildLondonNpcs==='function') buildLondonNpcs();   // 分手後馬修會回到倫敦街上
  applyCookSkin();
  addLog(`💔 和 ${nm} 漸行漸遠，回到朋友關係。`);
  closeSheet();
  toast(`💔 ${nm} 收拾好行李離開了`);
  save();
}
/* ---------- 伴侶親密互動 ---------- */
const INTIMACY_CD=10000;
let partnerAfterglow=null;     // {kind, until} 親密後的暫時心情
const AFTERGLOW_MS=20000;      // 特殊台詞持續多久（毫秒），自己調
function intimate(kind){
  const p=S.partner; if(!p) return;
  if(kind==='spicy' && curScene!=='office'){ toast('這種事只能在辦公室做啦'); return; }
  const now=Date.now();
  if(now-(p.lastIntim||0)<INTIMACY_CD){ toast('剛親熱過，等一下'); return; }
  const cfg={ kiss:{g:2, img:p.id+'_kiss.png'},
              hug:{g:1, img:p.id+'_hug.png'},
              spicy:{g:5} }[kind];
  if(!cfg) return;
  p.lastIntim=now; p.intimacy=(p.intimacy||0)+cfg.g; save();
  closeSheet(); freezeNpcById('partner');
  toast(`💕 親密度 +${cfg.g}`);
  partnerAfterglow={ kind, until:Date.now()+AFTERGLOW_MS };
  dlgNpc=null;
  if(kind==='spicy'){
    // 先播 2 秒 _spicy 全圖兩楨動畫，再切到 _afterglow 事後全圖（停住、按方向鍵才下床）
    spicyScene={ phase:'spicy', img:SPICY_IMG };
    setTimeout(()=>{ if(spicyScene){ spicyScene={ phase:'after', img:npcImg(p.id+'_afterglow.png') }; showSpicyLine(); } }, 2000);
    return;   // 不自動解凍
  }
  showIntimCG(cfg.img, player.x, player.y, 2000);
  setTimeout(unfreezeNpcs, 2000);
}

/* ---------- 辦公室 NPC（伴侶／小孩 範圍走動） ---------- */
const NPC_IMG={};
function npcImg(src){ if(!NPC_IMG[src]){ const i=new Image(); i.src=src; NPC_IMG[src]=i; } return NPC_IMG[src]; }
const PARTNER_ZONE={x1:2,y1:10,x2:9,y2:13};   // 伴侶活動範圍（辦公室格座標）
const CHILD_ZONE  ={x1:26,y1:8,x2:32,y2:11}; // 小孩房活動範圍（29,10 一帶）
const NPC_SPEED=0.05;
let officeNpcs={};
function officeWalkable(x,y){ const ix=Math.floor(x),iy=Math.floor(y),g=GRID.office;
  if(iy<0||ix<0||iy>=g.length||ix>=g[0].length) return false; return !blocked(g[iy][ix]); }
function buildOfficeNpcs(){
  officeNpcs={};
  if(S.partner){
    officeNpcs['partner']={ x:5,y:11, tx:5,ty:11, facing:'down', frame:0,aTimer:0,aStep:0,moving:false,idleUntil:0,
      zone:PARTNER_ZONE, img:npcImg(partnerSpriteSrc()), fallback:(MERCHANTS[S.partner.id]||{}).e||'🙂' };
  }
  if(S.child && S.child.stage>=1){   // 嬰兒(stage 0)不動，固定在搖籃
    officeNpcs['crib']={ x:29,y:10, tx:29,ty:10, facing:'down', frame:0,aTimer:0,aStep:0,moving:false,idleUntil:0,
      zone:CHILD_ZONE, img:npcImg('child_'+CHILD_STAGES[S.child.stage].key+'.png'), fallback:CHILD_STAGES[S.child.stage].e };
  }
}
function pickNpcTarget(n){
  for(let i=0;i<20;i++){
    const tx=n.zone.x1+Math.floor(Math.random()*(n.zone.x2-n.zone.x1+1));
    const ty=n.zone.y1+Math.floor(Math.random()*(n.zone.y2-n.zone.y1+1));
    if(officeWalkable(tx,ty)){ n.tx=tx; n.ty=ty; return; }
  }
}
function updateOfficeNpcs(){
  const now=Date.now();
  for(const id in officeNpcs){
    const n=officeNpcs[id];
    if(n.frozen){ n.moving=false; n.frame=0; continue; }
    const dx=n.tx-n.x, dy=n.ty-n.y, d=Math.hypot(dx,dy);
    if(d<0.12){
      n.moving=false;
      if(!n.idleUntil) n.idleUntil=now+1200+Math.random()*2500;
      else if(now>=n.idleUntil){ n.idleUntil=0; pickNpcTarget(n); }
    }else{
      n.idleUntil=0;
      const nx=n.x+(dx/d)*NPC_SPEED, ny=n.y+(dy/d)*NPC_SPEED;
      if(officeWalkable(nx,n.y)) n.x=nx; else pickNpcTarget(n);
      if(officeWalkable(n.x,ny)) n.y=ny;
      n.facing = Math.abs(dx)>Math.abs(dy) ? (dx>0?'right':'left') : (dy>0?'down':'up');
      n.moving=true;
    }
    if(n.moving){ if(++n.aTimer>=WALK_SPEED){ n.aTimer=0; n.aStep=(n.aStep+1)%WALK_CYCLE.length; } n.frame=WALK_CYCLE[n.aStep]; }
    else { n.frame=0; n.aTimer=0; n.aStep=0; }
    const o=SCENES.office.objects.find(ob=>ob.id===id);
    if(o){ o.x=Math.round(n.x); o.y=Math.round(n.y); }   // 互動點跟著移動
  }
}
function drawOfficeNpcs(ox,oy){
  for(const id in officeNpcs){
    if(intimCG && id==='partner') continue;
    const n=officeNpcs[id];
    const px=n.x*TS+TS/2-ox, py=n.y*TS+TS/2-oy;
    ctx.globalAlpha=1; ctx.fillStyle='#00000022';
    ctx.beginPath();ctx.ellipse(px,py+6,12,4,0,0,Math.PI*2);ctx.fill();
    if(n.img && n.img.complete && n.img.naturalWidth){
      const dirCols={down:0,left:1,right:2,up:3}, sx=(dirCols[n.facing]||0)*64, sy=n.frame*64;
      ctx.drawImage(n.img, sx,sy,64,64, px-32, py-64+14, 64,64);
    }else{
      ctx.fillStyle='#000'; ctx.font='22px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(n.fallback||'🙂', px, py);
    }
  }
}
/* ---------- 港口 NPC（商人走動） ---------- */
const PORT_ZONE={x1:1,y1:4,x2:18,y2:15};   // 商人活動範圍（碼頭地面）
let portNpcs={};
function portWalkable(x,y){ const ix=Math.floor(x),iy=Math.floor(y),g=GRID.port;
  if(iy<0||ix<0||iy>=g.length||ix>=g[0].length) return false; return !blocked(g[iy][ix]); }
/* ---------- 商會座位：坐在商會裡（全圖立繪，位置畫死在圖裡） ---------- */
const MERCHANT_SEAT={
  // id : { img:'全圖立繪檔名', x,y:互動格（要對到圖裡那個人坐的位置） }
  Francis:{ img:'guild_Francis.png', x:21, y:8 },
  Pedro:  { img:'guild_Pedro.png',   x:36, y:8 },
  Antonio:{ img:'guild_Antonio.png', x:28, y:8 },
   Alfred: { img:'guild_Alfred.png',  x:54, y:8 },
};
const SIT_SWITCH_MIN=12000, SIT_SWITCH_MAX=25000;   // 每隔這麼久考慮換一次「坐/走」
function hasSeat(id){ return !!MERCHANT_SEAT[id]; }
function schedSwitch(n){ n.nextSwitch=Date.now()+SIT_SWITCH_MIN+Math.random()*(SIT_SWITCH_MAX-SIT_SWITCH_MIN); }
function enterSit(n){
  const seat=MERCHANT_SEAT[n.mid]; if(!seat) return;
  n.mode='sit'; n.moving=false; n.frame=0;
  n.x=seat.x; n.y=seat.y; n.tx=seat.x; n.ty=seat.y;   // 邏輯位置貼到座位→互動點也在座位
  schedSwitch(n);
}
function enterWalk(n){
  n.mode='walk';
  const slot=PORT_SLOTS[(S.port.merchants||[]).indexOf(n.mid)]||{x:9,y:6};
  n.x=slot.x; n.y=slot.y;   // 起身：先回碼頭區，再開始晃（不要從商會橫越半張地圖）
  schedSwitch(n); pickPortTarget(n);
}
function buildPortNpcs(){
  portNpcs={};
  (S.port.merchants||[]).forEach((id,i)=>{
    const m=MERCHANTS[id]; if(!m) return;
    const slot=PORT_SLOTS[i]||{x:9,y:6};
    const n={ x:slot.x,y:slot.y, tx:slot.x,ty:slot.y, facing:'down', frame:0,aTimer:0,aStep:0,moving:false,idleUntil:0,
      zone:PORT_ZONE, img:npcImg('partner_'+id+'.png'), fallback:m.e, mid:id, mode:'walk' };
    schedSwitch(n);
    portNpcs['mc_'+id]=n;
    if(hasSeat(id) && Math.random()<0.5) enterSit(n);   // 進場時一半機率正坐在商會
  });
}
function pickPortTarget(n){
  for(let i=0;i<20;i++){
    const tx=n.zone.x1+Math.floor(Math.random()*(n.zone.x2-n.zone.x1+1));
    const ty=n.zone.y1+Math.floor(Math.random()*(n.zone.y2-n.zone.y1+1));
    if(portWalkable(tx,ty)){ n.tx=tx; n.ty=ty; return; }
  }
}
function updatePortNpcs(){
  const now=Date.now();
  for(const id in portNpcs){
    const n=portNpcs[id];
    if(n.frozen){ n.moving=false; n.frame=0; continue; }
    if(n.mode==='sit'){                                // 坐著：不移動，互動點固定在座位
      n.moving=false; n.frame=0;
      const o=SCENES.port.objects.find(ob=>ob.id===id);
      if(o){ o.x=Math.round(n.x); o.y=Math.round(n.y); }
      continue;
    }
    const dx=n.tx-n.x, dy=n.ty-n.y, d=Math.hypot(dx,dy);
    if(d<0.12){
      n.moving=false;
      if(!n.idleUntil) n.idleUntil=now+1200+Math.random()*2500;
      else if(now>=n.idleUntil){ n.idleUntil=0; pickPortTarget(n); }
    }else{
      n.idleUntil=0;
      const nx=n.x+(dx/d)*NPC_SPEED, ny=n.y+(dy/d)*NPC_SPEED;
      if(portWalkable(nx,n.y)) n.x=nx; else pickPortTarget(n);
      if(portWalkable(n.x,ny)) n.y=ny;
      n.facing = Math.abs(dx)>Math.abs(dy) ? (dx>0?'right':'left') : (dy>0?'down':'up');
      n.moving=true;
    }
    if(n.moving){ if(++n.aTimer>=WALK_SPEED){ n.aTimer=0; n.aStep=(n.aStep+1)%WALK_CYCLE.length; } n.frame=WALK_CYCLE[n.aStep]; }
    else { n.frame=0; n.aTimer=0; n.aStep=0; }
    const o=SCENES.port.objects.find(ob=>ob.id===id);
    if(o){ o.x=Math.round(n.x); o.y=Math.round(n.y); }
  }
}
function drawGuildSitters(ox,oy){
  for(const id in portNpcs){
    const n=portNpcs[id];
    if(n.mode!=='sit') continue;
    const seat=MERCHANT_SEAT[n.mid]; if(!seat) continue;
    const img=npcImg(seat.img);
    if(img && img.complete && img.naturalWidth){
      ctx.drawImage(img, -ox, -oy, mapCols()*TS, mapRows()*TS);   // 全圖：位置畫死在圖裡
    }else{   // 沒圖→先用 emoji 站在座位，補上圖後自動換成立繪
      const px=seat.x*TS+TS/2-ox, py=seat.y*TS+TS/2-oy;
      ctx.font='22px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText((MERCHANTS[n.mid]||{}).e||'🙂', px, py);
    }
  }
}
function drawPortNpcs(ox,oy){
  for(const id in portNpcs){
    const n=portNpcs[id];
    if(n.mode==='sit') continue;   // 坐著→交給 drawGuildSitters，不畫走路版（兩種不同時出現）
    const px=n.x*TS+TS/2-ox, py=n.y*TS+TS/2-oy;
    ctx.globalAlpha=1; ctx.fillStyle='#00000022';
    ctx.beginPath();ctx.ellipse(px,py+6,12,4,0,0,Math.PI*2);ctx.fill();
    if(n.img && n.img.complete && n.img.naturalWidth){
      const dirCols={down:0,left:1,right:2,up:3}, sx=(dirCols[n.facing]||0)*64, sy=n.frame*64;
      ctx.drawImage(n.img, sx,sy,64,64, px-32, py-64+14, 64,64);
    }else{
      ctx.fillStyle='#000'; ctx.font='22px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(n.fallback||'🙂', px, py);
    }
  }
}
/* ---------- NPC 互動凍結 + 親密 CG ---------- */
function freezeNpcById(id){
  const n=(typeof officeNpcs!=='undefined'&&officeNpcs[id])||(typeof portNpcs!=='undefined'&&portNpcs[id]);
  if(n){ n.frozen=true; n.moving=false; n.frame=0;
    const dx=player.x-n.x, dy=player.y-n.y;
    n.facing = Math.abs(dx)>Math.abs(dy) ? (dx>0?'right':'left') : (dy>0?'down':'up'); }
}
function unfreezeNpcs(){
  if(typeof officeNpcs!=='undefined') for(const id in officeNpcs) officeNpcs[id].frozen=false;
  if(typeof portNpcs!=='undefined')   for(const id in portNpcs)   portNpcs[id].frozen=false;
}
function playIntimacyCG(src, ms, done){
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:95;background:#3a2c1ccc;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .25s';
  ov.innerHTML=`<img src="${src}" style="max-width:92%;max-height:82%;object-fit:contain;border-radius:12px;image-rendering:pixelated;box-shadow:0 6px 24px #0006">`;
  document.body.appendChild(ov);
  requestAnimationFrame(()=>ov.style.opacity=1);
  let closed=false;
  const end=()=>{ if(closed)return; closed=true; ov.style.opacity=0; setTimeout(()=>{ ov.remove(); if(done)done(); },300); };
  const t=setTimeout(end, ms||1600);
  ov.onclick=()=>{ clearTimeout(t); end(); };
}
/* ---------- NPC 互動凍結 + 地圖互動立繪 ---------- */
function freezeNpcById(id){
  const n=(typeof officeNpcs!=='undefined'&&officeNpcs[id])||(typeof portNpcs!=='undefined'&&portNpcs[id])||(typeof londonNpcs!=='undefined'&&londonNpcs[id]);
  if(n){ n.frozen=true; n.moving=false; n.frame=0;
    const dx=player.x-n.x, dy=player.y-n.y;
    n.facing=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'); }
}
function unfreezeNpcs(){
  if(typeof officeNpcs!=='undefined') for(const id in officeNpcs) officeNpcs[id].frozen=false;
  if(typeof portNpcs!=='undefined')   for(const id in portNpcs)   portNpcs[id].frozen=false;
  if(typeof londonNpcs!=='undefined') for(const id in londonNpcs) londonNpcs[id].frozen=false;
}
let intimCG=null;
let spicyScene=null;   // 跟伴侶做可疑的事：兩人躺床的事後全圖，按方向鍵才解除
const SPICY_IMG=npcImg('spicy.png');   // 開場就預載，避免第一次觸發時閃黑屏字幕
function showSpicyLine(){
  const p=S.partner; if(!p) return;
  const nm=(MERCHANTS[p.id]||{}).nm||'伴侶';
  const pool=(typeof AFTERGLOW_LINES!=='undefined' && AFTERGLOW_LINES.spicy) || ['…剛剛，真是太瘋狂了。'];
  const line=pool[Math.floor(Math.random()*pool.length)];
  const box=document.getElementById('dialogue'); box.classList.remove('idle');
  document.getElementById('dlgAvatar').textContent='😌';
  document.getElementById('dlgText').innerHTML=`<span class="name">${nm}</span>${line}`;
}
function showIntimCG(src,tx,ty,ms){ intimCG={ img:npcImg(src), x:tx, y:ty, until:Date.now()+(ms||2000) }; }
function wipeSave(){
  if(!confirm('確定要刪除存檔嗎？此動作無法復原。')) return;
  try{
    const ks=[];
    for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k && k.indexOf('happy_farm_')===0) ks.push(k); }
    ks.forEach(k=>localStorage.removeItem(k));
  }catch(e){}
  location.reload();
}
/* ---------- maps ---------- */