/* ============================================================
   🎣 捕魚小遊戲（側視角）— 把這整段貼到  function loop(){…}  的前面
   左右移動船長／放收魚線釣魚／克蘇魯海怪登船破壞船體／開槍或揮刀
   ============================================================ */
const FISH_W=320, FISH_H=288;          // 沿用 canvas 尺寸
const FISH_SURFACE=132;                 // 海面 y
const DECK_Y=118;                       // 甲板表面 y
const FISH_TOP=148, FISH_BOTTOM=274;    // 魚活動水域上下界
const CAP_MIN=46, CAP_MAX=274;          // 船長 x 範圍
const FISH_BOAT_MAXHP=100;

// 魚種：w=出現權重（越大越常見）、val=每條售價
const FISH_KINDS=[
  {k:'herring', nm:'鯡魚',    e:'🐟', rar:'普通', w:34, val:6,  len:14, col:'#a9c0cc', spd:0.9},
  {k:'mackerel',nm:'鯖魚',    e:'🐟', rar:'普通', w:30, val:9,  len:16, col:'#5f8fa6', spd:1.2},
  {k:'cod',     nm:'鱈魚',    e:'🐠', rar:'少見', w:20, val:18, len:20, col:'#cdb88a', spd:0.7},
  {k:'salmon',  nm:'鮭魚',    e:'🐟', rar:'稀有', w:11, val:34, len:22, col:'#e08a5f', spd:1.0},
  {k:'halibut', nm:'大比目魚', e:'🐠', rar:'傳說', w:5,  val:70, len:30, col:'#7a6e58', spd:0.45},
];
const RAR_COL={ '普通':'#8a8a7a', '少見':'#5b8a4e', '稀有':'#3f7bd6', '傳說':'#b0883a' };
function pickFishKind(){
  let tot=FISH_KINDS.reduce((s,f)=>s+f.w,0), r=Math.random()*tot;
  for(const f of FISH_KINDS){ if((r-=f.w)<=0) return f; } return FISH_KINDS[0];
}

// 各種數值，要調難度改這裡
const HOOK_SPEED=1.6, REEL_SPEED=2.2, CAP_SPEED=2.0, SWIM_CAP=5;
const MON_BITE_CD=1600, MON_DMG=7, MON_HP=6, MON_CAP=2, MON_MIN=7000, MON_MAX=13000;
const BULLET_SPEED=6, GUN_DMG=1, GUN_CD=240, KNIFE_DMG=3, KNIFE_CD=420, KNIFE_RANGE=44;

let fish=null;   // 釣魚場景執行狀態

function makeSwimmer(){
  const kind=pickFishKind(), dir=Math.random()<0.5?-1:1;
  return { kind, dir, x: dir>0? -20 : FISH_W+20,
    y: FISH_TOP + Math.random()*(FISH_BOTTOM-FISH_TOP),
    wob: Math.random()*Math.PI*2, hooked:false };
}

function askSail(){
  openSheet(`<div class="sheethead"><h3>⛵ 出航捕魚</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <p class="small">開船到外海釣魚，操作方式：</p>
    <div class="row"><div class="e">⬅️➡️</div><div class="info"><div class="d">左右移動船長</div></div></div>
    <div class="row"><div class="e">⬇️</div><div class="info"><div class="d">放下魚線（越按越深）</div></div></div>
    <div class="row"><div class="e">⬆️</div><div class="info"><div class="d">收線；魚咬鉤後拉回水面就入袋</div></div></div>
    <div class="row"><div class="e">🔫🔪</div><div class="info"><div class="d">武器鈕切換槍／刀，互動鍵攻擊登船海怪</div></div></div>
    <div class="row"><div class="e">🐙</div><div class="info"><div class="d">海怪會破壞船體，船沉就被迫靠岸</div></div></div>
    <button class="btn green" style="width:100%;margin-top:10px" onclick="closeSheet();enterFishing()">⚓ 出航！</button>`);
}

function enterFishing(){
  fish={ capX:160, facing:'right', hookDepth:0, hooked:null,
    swimmers:[], bullets:[], monsters:[],
    boatHp:FISH_BOAT_MAXHP, score:0, caught:0,
    weapon:'gun', lastAtk:0, lastMonster:Date.now()+3000,
    knifeSwing:0, bob:0, over:false };
  for(let i=0;i<SWIM_CAP;i++) fish.swimmers.push(makeSwimmer());
  curScene='fishing';
  document.getElementById('sceneTitle').textContent='🎣 外海捕魚';
  document.getElementById('fishUI').style.display='block';
  const fw=document.getElementById('fishWeaponBtn'); fw.style.display='flex'; fishUpdateWeaponBtn();
  document.getElementById('equipBtn').style.display='none';
  document.getElementById('actBtn').className='actbtn';
  const h=document.getElementById('hint'); if(h) h.classList.remove('show');
  say('出航囉！↓放線釣魚、↑收線；怪獸登船就開槍或揮刀！');
}

function fishToggleWeapon(){ if(!fish) return;
  fish.weapon = fish.weapon==='gun' ? 'knife':'gun';
  fishUpdateWeaponBtn();
  toast(fish.weapon==='gun' ? '🔫 切換到槍':'🔪 切換到刀');
}
function fishUpdateWeaponBtn(){
  const b=document.getElementById('fishWeaponBtn'); if(!b||!fish) return;
  b.innerHTML=(fish.weapon==='gun'?'🔫':'🔪')+
    '<span style="font-size:10px;color:var(--ink2)">'+(fish.weapon==='gun'?'槍':'刀')+'</span>';
}

function fishAttack(){
  if(!fish||fish.over) return;
  const now=Date.now(), dir=fish.facing==='left'?-1:1;
  if(fish.weapon==='gun'){
    if(now-fish.lastAtk<GUN_CD) return; fish.lastAtk=now;
    fish.bullets.push({ x:fish.capX+dir*12, dir });
  }else{
    if(now-fish.lastAtk<KNIFE_CD) return; fish.lastAtk=now; fish.knifeSwing=8;
    for(let j=fish.monsters.length-1;j>=0;j--){
      const m=fish.monsters[j];
      if((m.x-fish.capX)*dir>=-8 && Math.abs(m.x-fish.capX)<KNIFE_RANGE){
        m.hp-=KNIFE_DMG; m.hit=6; if(m.hp<=0) killMonster(j);
      }
    }
  }
}
function killMonster(j){
  fish.monsters.splice(j,1);
  earn(8,'擊退海怪'); refreshTop(); save();
  toast('💥 擊退一隻海怪 +$8');
}

function landFish(s){
  const f=s.kind;
  fish.score+=f.val; fish.caught++;
  S.fishLog=S.fishLog||{}; S.fishLog[f.k]=(S.fishLog[f.k]||0)+1;
  toast(`🎣 釣到 ${f.rar}・${f.nm}！+$${f.val}`);
  const idx=fish.swimmers.indexOf(s);
  if(idx>=0) fish.swimmers[idx]=makeSwimmer(); else fish.swimmers.push(makeSwimmer());
}

function sinkBoat(){ if(!fish) return; fish.over=true;
  toast('🌊 船快沉了！緊急靠岸'); setTimeout(()=>landBoat(false), 1000); }

function landBoat(){
  if(!fish){ goScene('port'); return; }
  const gain=fish.score, n=fish.caught, log=Object.assign({},S.fishLog||{});
  if(gain>0){ earn(gain,'販售魚獲'); }
  fish=null; goScene('port'); refreshTop();
  const rows=FISH_KINDS.map(f=>`<div class="row"><div class="e">${f.e}</div><div class="info">
    <div class="n">${f.nm} <span class="small" style="color:${RAR_COL[f.rar]}">${f.rar}</span></div>
    <div class="d">累計釣獲 ${log[f.k]||0} 條・每條 $${f.val}</div></div></div>`).join('');
  openSheet(`<div class="sheethead"><h3>🎣 出航結算</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <p>這趟釣到 <b>${n}</b> 條魚，魚獲賣得 <b class="up">$${fmt(gain)}</b>。</p>
    <div class="hr"></div>${rows}
    <button class="btn green" style="width:100%;margin-top:10px" onclick="closeSheet();askSail()">⛵ 再出航一次</button>`);
}

/* ---------- 每楨邏輯 ---------- */
function updateFishing(){
  if(!fish){ enterFishing(); return; }
  if(fish.over) return;
  const now=Date.now();
  fish.bob=Math.sin(now/420)*2;
  if(fish.knifeSwing>0) fish.knifeSwing--;

  // 船長移動
  if(held.left){ fish.capX=Math.max(CAP_MIN, fish.capX-CAP_SPEED); fish.facing='left'; }
  if(held.right){ fish.capX=Math.min(CAP_MAX, fish.capX+CAP_SPEED); fish.facing='right'; }
  // 魚線：↓放 ↑收
  if(held.down) fish.hookDepth=Math.min(FISH_BOTTOM-FISH_SURFACE, fish.hookDepth+HOOK_SPEED);
  else if(held.up) fish.hookDepth=Math.max(0, fish.hookDepth-REEL_SPEED);

  const hookX=fish.capX, hookY=FISH_SURFACE+fish.hookDepth;
  // 咬鉤的魚跟著鉤，收到水面就入袋
  if(fish.hooked){ fish.hooked.x=hookX; fish.hooked.y=hookY;
    if(fish.hookDepth<=2){ landFish(fish.hooked); fish.hooked=null; } }

  // 魚群移動＋咬鉤
  for(const s of fish.swimmers){
    if(s.hooked) continue;
    s.x += s.dir*s.kind.spd; s.wob+=0.05; s.y += Math.sin(s.wob)*0.3;
    if(s.y<FISH_TOP) s.y=FISH_TOP; if(s.y>FISH_BOTTOM) s.y=FISH_BOTTOM;
    if(s.x<-30||s.x>FISH_W+30){ Object.assign(s, makeSwimmer()); }
    if(!fish.hooked && fish.hookDepth>6 &&
       Math.abs(s.x-hookX)<10 && Math.abs(s.y-hookY)<10){
      s.hooked=true; fish.hooked=s; say('上鉤了！按 ↑ 收線拉上來');
    }
  }
  while(fish.swimmers.length<SWIM_CAP) fish.swimmers.push(makeSwimmer());

  // 海怪生成
  if(fish.monsters.length<MON_CAP && now>fish.lastMonster){
    fish.lastMonster=now + MON_MIN + Math.random()*(MON_MAX-MON_MIN);
    fish.monsters.push({ x:CAP_MIN+Math.random()*(CAP_MAX-CAP_MIN), hp:MON_HP,
      born:now, lastBite:now+900, frame:0, hit:0 });
    toast('🐙 海怪登船了！');
  }
  // 海怪啃船
  for(const m of fish.monsters){
    m.frame=Math.floor(now/240)%2; if(m.hit>0) m.hit--;
    if(now-m.lastBite>=MON_BITE_CD){ m.lastBite=now;
      fish.boatHp=Math.max(0, fish.boatHp-MON_DMG);
      if(fish.boatHp<=0){ sinkBoat(); return; }
    }
  }
  // 子彈
  for(let i=fish.bullets.length-1;i>=0;i--){
    const b=fish.bullets[i]; b.x+=b.dir*BULLET_SPEED;
    let gone=(b.x<-6||b.x>FISH_W+6);
    for(let j=fish.monsters.length-1;j>=0;j--){
      const m=fish.monsters[j];
      if(Math.abs(m.x-b.x)<16){ m.hp-=GUN_DMG; m.hit=6; gone=true;
        if(m.hp<=0) killMonster(j); break; }
    }
    if(gone) fish.bullets.splice(i,1);
  }
}

/* ---------- 每楨繪圖 ---------- */
function drawFishing(){
  if(!fish){ enterFishing(); }
  const now=Date.now();
  // 天空
  let sky=ctx.createLinearGradient(0,0,0,FISH_SURFACE);
  sky.addColorStop(0,'#bfe0ea'); sky.addColorStop(1,'#e9f3ee');
  ctx.fillStyle=sky; ctx.fillRect(0,0,FISH_W,FISH_SURFACE);
  // 海
  let sea=ctx.createLinearGradient(0,FISH_SURFACE,0,FISH_H);
  sea.addColorStop(0,'#5aa6bd'); sea.addColorStop(1,'#1f5d77');
  ctx.fillStyle=sea; ctx.fillRect(0,FISH_SURFACE,FISH_W,FISH_H-FISH_SURFACE);
  // 海面波紋
  ctx.strokeStyle='#ffffff55'; ctx.lineWidth=2;
  for(let x=0;x<FISH_W;x+=24){
    ctx.beginPath();
    ctx.moveTo(x,FISH_SURFACE+2+Math.sin(x+now/200)*1.5);
    ctx.lineTo(x+12,FISH_SURFACE+2+Math.sin(x+12+now/200)*1.5); ctx.stroke();
  }
  // 魚群
  for(const s of fish.swimmers) drawOneFish(s);

  // 船身
  const bx0=22,bx1=298,deck=DECK_Y;
  ctx.fillStyle='#7a5230';
  ctx.beginPath(); ctx.moveTo(bx0,deck); ctx.lineTo(bx1,deck);
  ctx.lineTo(bx1-26,FISH_SURFACE+20); ctx.lineTo(bx0+26,FISH_SURFACE+20);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle='#8a6038'; ctx.fillRect(bx0,deck-6,bx1-bx0,8);
  ctx.fillStyle='#5e3f24'; ctx.fillRect(bx0,deck+2,bx1-bx0,3);

  // 釣竿＋魚線＋鉤
  const hookX=fish.capX, hookY=FISH_SURFACE+fish.hookDepth;
  const rodTipX=fish.capX+(fish.facing==='left'?-14:14), rodTipY=deck-30;
  ctx.strokeStyle='#b08a3a'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(fish.capX,deck-12); ctx.lineTo(rodTipX,rodTipY); ctx.stroke();
  ctx.strokeStyle='#ffffffaa'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(rodTipX,rodTipY); ctx.lineTo(hookX,hookY); ctx.stroke();
  ctx.strokeStyle='#dfe6ea'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(hookX,hookY+2,2.5,0,Math.PI*1.5); ctx.stroke();

  // 船長（沿用四向圖的左右兩列；沒圖就用 emoji）
  const px=fish.capX, py=deck-2+fish.bob*0.3;
  if(PLAYER_IMG.complete && PLAYER_IMG.naturalWidth){
    const col=fish.facing==='left'?1:2;
    ctx.drawImage(PLAYER_IMG, col*64,0,64,64, px-22,py-44, 44,44);
  }else{
    ctx.font='26px serif'; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    ctx.fillText('🧑‍✈️', px, py);
  }

  // 海怪
  for(const m of fish.monsters) drawMonster(m, now);

  // 子彈
  ctx.fillStyle='#ffd24a';
  for(const b of fish.bullets) ctx.fillRect(b.x-4,deck-26,8,3);
  // 刀光
  if(fish.knifeSwing>0){
    const dir=fish.facing==='left'?-1:1;
    ctx.strokeStyle='#ffffffcc'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(fish.capX+dir*16, deck-22, 18, dir>0?-0.8:2.3, dir>0?0.8:3.9); ctx.stroke();
  }

  // HUD：船體血條
  ctx.fillStyle='#00000055'; ctx.fillRect(8,8,104,12);
  ctx.fillStyle = fish.boatHp>40?'#6fae5e':(fish.boatHp>15?'#d6a93e':'#c2503e');
  ctx.fillRect(10,10, Math.max(0,fish.boatHp)/FISH_BOAT_MAXHP*100, 8);
  ctx.fillStyle='#fff'; ctx.font='9px serif'; ctx.textAlign='left'; ctx.textBaseline='middle';
  ctx.fillText('🚢 船體', 8, 28);
  // 魚獲（畫中間，避開右上角的靠岸鈕）
  ctx.textAlign='center'; ctx.font='11px serif'; ctx.fillStyle='#fff';
  ctx.fillText('🎣'+fish.caught+'　$'+fish.score, FISH_W/2-6, 14);
}

function drawOneFish(s){
  const f=s.kind, L=f.len, flip=s.dir<0;
  ctx.save(); ctx.translate(s.x,s.y); if(flip) ctx.scale(-1,1);
  ctx.fillStyle=f.col;
  ctx.beginPath(); ctx.moveTo(-L*0.5,0); ctx.lineTo(-L*0.5-6,-5); ctx.lineTo(-L*0.5-6,5); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0,0,L*0.5,L*0.32,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(L*0.28,-2,1.8,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(L*0.30,-2,0.9,0,Math.PI*2); ctx.fill();
  ctx.restore();
  if(s.hooked){ ctx.strokeStyle='#fff'; ctx.globalAlpha=0.4+0.4*Math.sin(Date.now()/120);
    ctx.lineWidth=1.5; ctx.beginPath(); ctx.ellipse(s.x,s.y,L*0.6,L*0.45,0,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1; }
}

function drawMonster(m, now){
  const grow=Math.min(1,(now-m.born)/400), bob=Math.sin(now/300+m.x)*3;
  const mx=m.x, my=DECK_Y-14+bob;
  const ci=npcImg('cthulhu.png');   // 想換成圖片：放一張橫向兩楨的 cthulhu.png 進專案即可
  ctx.save(); ctx.translate(mx,my); ctx.scale(grow,grow);
  if(ci && ci.complete && ci.naturalWidth){
    const fw=ci.naturalWidth/2;
    ctx.drawImage(ci, m.frame*fw,0, fw,ci.naturalHeight, -20,-28, 40,40);
  }else{
    const t=m.frame?4:-4;
    ctx.fillStyle = m.hit>0 ? '#e8e36a' : '#4f6e4a';
    ctx.lineWidth=3; ctx.strokeStyle=ctx.fillStyle;
    for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(i*5,4);
      ctx.quadraticCurveTo(i*7,16, i*6+(i%2?t:-t),24); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(0,0,15,14,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#f5d24a'; ctx.beginPath(); ctx.arc(-5,-2,3.2,0,Math.PI*2); ctx.arc(5,-2,3.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(-5,-2,1.4,0,Math.PI*2); ctx.arc(5,-2,1.4,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
  // 怪獸小血條
  ctx.fillStyle='#00000066'; ctx.fillRect(mx-14,my-30,28,4);
  ctx.fillStyle='#c2503e'; ctx.fillRect(mx-13,my-29, 26*(m.hp/MON_HP), 2);
}
