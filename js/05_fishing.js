/* ============================================================
   🎣 捕魚小遊戲 v4（側視角）— 取代舊版整段，貼到 function loop(){…} 前面
   修正：魚全程掛在線上不斷線；收線時線收緊、鉤子乖乖回到竿下；拉到甲板上方才輕輕送進船
   保留：水裡鉤子自由飄、多魚同時上鉤、漂流垃圾扣錢、船小會飄、重量影響收線、海怪戰鬥
   依賴：spend()/earn()/refreshTop()/save()/openSheet()/closeSheet()/toast()/say()/fmt()/held/PLAYER_IMG/npcImg()
   ============================================================ */
const FISH_W=320, FISH_H=288;
const FISH_SURFACE=132;
const DECK_Y=118;                       // 甲板/船緣高度
const FISH_TOP=148, FISH_BOTTOM=274;
const BX0=46, BX1=274;                  // 船身左右
const CAP_MIN=64, CAP_MAX=256;
const FISH_BOAT_MAXHP=300;

const FISH_KINDS=[
  {k:'herring', nm:'鯡魚',    e:'🐟', rar:'普通', w:34, val:6,  wt:1.0, len:14, col:'#a9c0cc', spd:0.9},
  {k:'mackerel',nm:'鯖魚',    e:'🐟', rar:'普通', w:30, val:9,  wt:1.2, len:16, col:'#5f8fa6', spd:1.2},
  {k:'mussel',  nm:'貽貝',    e:'🦪', rar:'普通', w:26, val:5,  wt:0.6, len:10, col:'#3a3f4a', spd:0.3},
  {k:'cod',     nm:'鱈魚',    e:'🐠', rar:'少見', w:20, val:18, wt:1.7, len:20, col:'#cdb88a', spd:0.7},
  {k:'squid',   nm:'魷魚',    e:'🦑', rar:'少見', w:16, val:14, wt:1.3, len:18, col:'#8a7ea6', spd:1.3},
  {k:'salmon',  nm:'鮭魚',    e:'🐟', rar:'稀有', w:11, val:34, wt:2.2, len:22, col:'#e08a5f', spd:1.0},
  {k:'lobster', nm:'龍蝦',    e:'🦞', rar:'稀有', w:8,  val:45, wt:2.4, len:22, col:'#c2503e', spd:0.5},
  {k:'halibut', nm:'大比目魚', e:'🐠', rar:'傳說', w:5,  val:70, wt:3.4, len:30, col:'#7a6e58', spd:0.45},
];
const RAR_COL={ '普通':'#8a8a7a', '少見':'#5b8a4e', '稀有':'#3f7bd6', '傳說':'#b0883a' };
function pickFishKind(){ let tot=FISH_KINDS.reduce((s,f)=>s+f.w,0), r=Math.random()*tot;
  for(const f of FISH_KINDS){ if((r-=f.w)<=0) return f; } return FISH_KINDS[0]; }
const TRASH_KINDS=[
  {k:'boot',  nm:'破靴子', e:'👢', val:-8,  wt:1.6, len:16, spd:0.4},
  {k:'can',   nm:'奇怪的美人魚', e:'🥫', val:-5,  wt:1.0, len:13, spd:0.5},
  {k:'bottle',nm:'玻璃瓶', e:'🍶', val:-6,  wt:1.2, len:14, spd:0.5},
  {k:'tire',  nm:'義大利人', e:'🛞', val:-12, wt:6.6, len:20, spd:0.35},
];
const TRASH_RATE=0.22;
const CURSED={k:'cursed', nm:'詛咒之物', e:'🪆', val:0, wt:2.0, len:18, spd:0.3, cursed:true};
const CURSED_CHANCE=0.015;   // 一隻新漂流物有 2% 是詛咒物，要更稀有就調小
const CHEST={k:'chest', nm:'寶箱', e:'🎁', val:0, wt:2.6, len:22, spd:0.35, treasure:true};
const CHEST_CHANCE=0.06;    // 一隻新漂流物有 6% 是寶箱，要更稀有就調小
const TABLET={k:'tablet', nm:'神秘石板', e:'🪨', val:0, wt:1.8, len:16, col:'#8a8a8a', spd:0.3, tablet:true};
/* 只有接下佩德羅古董店的委託後才撈得到，撈到過一次就不再出現 */
function tabletChance(){ return (typeof S!=='undefined' && S && S.curio && S.curio.unlocked && !S.curio.hasTablet) ? 0.05 : 0; }

// 手感／難度
const ROD_GRAV=0.01, ROD_LIFT=0.18, ROD_DAMP=0.985;          // 垂直：下沉、收線力、阻尼
const LOAD_SINK=0.22, LOAD_SLOW=0.45;                        // 重量→下沉更強、收線更慢
const HOOK_SPRING=0.006, HOOK_DAMP=0.95, CUR_PUSH=0.09, HOOK_NUDGE=0.11; // 水裡：鬆鬆地自由飄
const REEL_SPRING=0.07, REEL_DAMP=0.84;                      // 收線/出水：線收緊、鉤子乖乖回竿下
const PLOP_UP=7;                                             // 拋魚的向上力道（中等高度，越大拋越高）                                           // 把魚送進船的小拋力（別太大）
const AIR_G=0.30, HOOK_CAP=6;
const FISH_IMG={ herring:'fish_herring.png', mackerel:'fish_mackerel.png', cod:'fish_cod.png', salmon:'fish_salmon.png', halibut:'fish_halibut.png',
  squid:'fish_squid.png', lobster:'fish_lobster.png', mussel:'fish_mussel.png', chest:'fish_chest.png' };
const CAP_SPEED=2.0, SWIM_CAP=6;
const MON_BITE_CD=1600, MON_DMG=7, MON_HP=6, MON_CAP=2, MON_MIN=7000, MON_MAX=13000;
const ATK_CD=300, BULLET_SPEED=6, GUN_DMG=1, KNIFE_DMG=3, KNIFE_RANGE=46;

let fish=null;

 function makeSwimmer(){
  const isTablet=Math.random()<tabletChance();
  const isCursed=!isTablet && Math.random()<CURSED_CHANCE;
  const isChest=!isTablet && !isCursed && Math.random()<CHEST_CHANCE;
  const isTrash=!isTablet && !isChest && (isCursed || Math.random()<TRASH_RATE);   // 詛咒物沿用 trash_ 圖片路徑，跟寶箱分開判斷
  const kind=isTablet ? TABLET : (isCursed ? CURSED : (isChest ? CHEST : (isTrash ? TRASH_KINDS[(Math.random()*TRASH_KINDS.length)|0] : pickFishKind())));
  const dir=Math.random()<0.5?-1:1;
  return { kind, trash:isTrash, dir, x: dir>0? -20 : FISH_W+20,
    y: FISH_TOP + Math.random()*(FISH_BOTTOM-FISH_TOP),
    wob: Math.random()*Math.PI*2, hooked:false };
}

function askSail(){
  openSheet(`<div class="sheethead"><h3>⛵ 出航捕魚</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <p class="small">開船到外海釣魚，操作方式：</p>
    <div class="row"><div class="e">⬅️➡️</div><div class="info"><div class="d">移動船長；魚線在水裡會自由飄</div></div></div>
    <div class="row"><div class="e">⭕</div><div class="info"><div class="d">大圓鈕／空白鍵＝收線；魚被拉回竿邊、舉過船緣就會送進船裡</div></div></div>
    <div class="row"><div class="e">🪝</div><div class="info"><div class="d">碰到的魚＆垃圾會一起掛上來；魚越重收得越慢</div></div></div>
    <div class="row"><div class="e">🗑️</div><div class="info"><div class="d">垃圾送進船裡會扣錢</div></div></div>
    <div class="row"><div class="e">⚔️</div><div class="info"><div class="d">攻擊鈕打登船海怪（自動瞄準）</div></div></div>
    <button class="btn green" style="width:100%;margin-top:10px" onclick="closeSheet();enterFishing()">⚓ 出航！</button>`);
}

function enterFishing(){
  fish={ capX:160, facing:'right',
    hookDepth:0, hv:0, hookX:160, hvx:0, hooked:[],
    swimmers:[], airborne:[], bullets:[], monsters:[],
    boatHp:FISH_BOAT_MAXHP, score:0, caught:0, boatX:0,
    lastAtk:0, lastMonster:Date.now()+3000, knifeSwing:0, bob:0, over:false };
  for(let i=0;i<SWIM_CAP;i++) fish.swimmers.push(makeSwimmer());
  curScene='fishing';
  PLAYER_IMG.src='captain.png';   // 出海自動換上船長服
  document.getElementById('sceneTitle').textContent='🎣 外海捕魚';
  document.getElementById('fishUI').style.display='block';
  const fw=document.getElementById('fishWeaponBtn'); fw.style.display='flex';
  document.getElementById('equipBtn').style.display='none';
  document.getElementById('actBtn').className='actbtn';
  const h=document.getElementById('hint'); if(h) h.classList.remove('show');
  say('出航囉！讓線沉下去，碰到魚就上鉤，按住收線把牠拉過船緣送進船裡！');
}

function actDown(ev){ if(ev)ev.preventDefault(); if(curScene==='fishing'){ held.rod=true; return; } interact(ev); }
function actUp(){ held.rod=false; }
function weaponBtn(ev){ if(ev)ev.preventDefault(); if(curScene==='fishing'){ fishAttack(); return; } toggleEquip(ev); }

function fishAttack(){
  if(!fish||fish.over) return;
  const now=Date.now(); if(now-fish.lastAtk<ATK_CD) return; fish.lastAtk=now;
  let target=null, best=1e9;
  for(const m of fish.monsters){ const d=Math.abs(m.x-fish.capX); if(d<best){best=d;target=m;} }
  if(target) fish.facing = target.x<fish.capX ? 'left':'right';
  fish.knifeSwing=8;   // 每次攻擊都切換拿槍造型
  const dir=fish.facing==='left'?-1:1;
  if(target && best<=KNIFE_RANGE){ fish.knifeSwing=8; target.hit=6; target.hp-=KNIFE_DMG;
    if(target.hp<=0) killMonster(fish.monsters.indexOf(target)); }
  else fish.bullets.push({ x:fish.capX+dir*16, dir });
}
function killMonster(j){ if(j<0) return; fish.monsters.splice(j,1);
  earn(8,'擊退海怪'); refreshTop(); save(); toast('💥 擊退一隻海怪 +$8'); }

function landCatch(a){
  if(a.kind.tablet){ if(typeof collectTablet==='function') collectTablet(); return; }
  if(a.kind.cursed){ triggerCurse(); return; }
  if(a.kind.treasure){ openTreasureChest(); return; }
  if(a.trash){
    const dmg=Math.abs(a.kind.val);                         // 用垃圾原本的「價值」當傷害
    fish.boatHp=Math.max(0, fish.boatHp-dmg);
    toast(`🗑️ ${a.kind.nm}撞上船 -${dmg}🚢`);
    if(fish.boatHp<=0){ sinkBoat(); return; }
    refreshTop(); save(); return;                           // 垃圾不入帳、不入庫，到此為止
  }
  else{ const f=a.kind; fish.caught++;
    addStore(f.k,1);                                   // 🐟 入背包（之後可做料理／賣）
    S.fishLog=S.fishLog||{}; S.fishLog[f.k]=(S.fishLog[f.k]||0)+1;
    toast(`🎣 ${f.rar}・${f.nm} 入背包！`); }
  refreshTop(); save();
}

const CHEST_CASH_MIN=200, CHEST_CASH_MAX=3000, CHEST_BOTTLE_CHANCE=0.45, CHEST_ANTIQUE_CHANCE=0.35;
function openTreasureChest(){
  const cash=CHEST_CASH_MIN+Math.floor(Math.random()*(CHEST_CASH_MAX-CHEST_CASH_MIN+1));
  earn(cash,'釣到寶箱');
  if(fish) fish.score+=cash;   // 寶箱的錢算進這趟的淨收益
  let msg=`🎁 撈到寶箱！+$${fmt(cash)}`;
  if(typeof PERFUME_BOTTLES!=='undefined' && Math.random()<CHEST_BOTTLE_CHANCE){
    const ids=Object.keys(PERFUME_BOTTLES);
    const id=ids[(Math.random()*ids.length)|0];
    if(typeof ensurePerfumeState==='function') ensurePerfumeState();
    S.perfume.bottleStock=S.perfume.bottleStock||{};
    S.perfume.bottleStock[id]=(S.perfume.bottleStock[id]||0)+1;
    msg+=`，還撈到一個「${PERFUME_BOTTLES[id].nm}」！`;
  }
  // 寶箱裡偶爾會有被詛咒的古董，要送去魔法房間除咒才能上架賣錢
  if(typeof CURIO_ANTIQUES!=='undefined' && S.curio && S.curio.unlocked && Math.random()<CHEST_ANTIQUE_CHANCE){
    const got=new Set([...(S.curio.pendingAntiques||[]), ...(S.curio.current?[S.curio.current.id]:[]),
      ...(S.curio.carrying||[]), ...(S.curio.shelf||[]), ...(S.curio.completed||[])]);
    const pool=CURIO_ANTIQUES.filter(a=>!got.has(a.id));
    if(pool.length){
      const pick=pool[(Math.random()*pool.length)|0];
      S.curio.pendingAntiques.push(pick.id);
      msg+=`，還撈到一件被詛咒的古董——${pick.e} ${pick.nm}！`;
    }
  }
  toast(msg);
  refreshTop(); save();
}
function sinkBoat(){ if(!fish) return; fish.over=true; toast('🌊 船快沉了！緊急靠岸'); setTimeout(()=>landBoat(),1000); }
function landBoat(){
  if(!fish){ goScene('port'); return; }
  const net=fish.score, n=fish.caught, log=Object.assign({},S.fishLog||{});
  fish=null; goScene('port'); refreshTop();
  const rows=FISH_KINDS.map(f=>`<div class="row"><div class="e">${prodIcon(f.k,28)}</div><div class="info">
    <div class="n">${f.nm} <span class="small" style="color:${RAR_COL[f.rar]}">${f.rar}</span></div>
    <div class="d">累計釣獲 ${log[f.k]||0} 條・每條 $${f.val}・重量 ${f.wt}</div></div></div>`).join('');
  openSheet(`<div class="sheethead"><h3>🎣 出航結算</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <p>這趟送進船 <b>${n}</b> 條魚，本趟淨收益 <b class="${net>=0?'up':'down'}">$${fmt(net)}</b>（已即時入帳）。</p>
    <div class="hr"></div>${rows}
    <button class="btn green" style="width:100%;margin-top:10px" onclick="closeSheet();askSail()">⛵ 再出航一次</button>`);
}
function triggerCurse(){
  if(!fish) return;
  fish.over=true;                 // 停掉這趟的更新
  fish=null;                      // 結束捕魚狀態
  goScene('office');              // 回辦公室（會自動把 fishUI 收起來）
  // 躺到床範圍內、腳下可走的格子（跟 faint 一樣）
  let bx=Math.round((BED.x1+BED.x2)/2), by=BED.y2;
  for(let y=BED.y2;y>=BED.y1;y--) for(let x=BED.x1;x<=BED.x2;x++){
    if(walkable(x+0.5,y+0.5)){ bx=x; by=y; }
  }
  player.x=bx; player.y=by;
  sleeping=true;
  save();
  setTimeout(()=>toast('🪆 你釣起了不該碰的東西……回過神已躺在床上。'), 300);
}
/* ---------- 每楨邏輯 ---------- */
function updateFishing(){
  if(!fish){ enterFishing(); return; }
  if(fish.over) return;
  const now=Date.now();
  fish.bob=Math.sin(now/420)*2;
  fish.boatX=Math.sin(now/2200)*14;
  const boatX=fish.boatX;
  if(fish.knifeSwing>0) fish.knifeSwing--;

  if(held.left){ fish.capX=Math.max(CAP_MIN, fish.capX-CAP_SPEED); fish.facing='left'; }
  if(held.right){ fish.capX=Math.min(CAP_MAX, fish.capX+CAP_SPEED); fish.facing='right'; }

  // 線上總重量
  let load=0; for(const h of fish.hooked) load+=(h.kind.wt||1);

  // 垂直：重力下沉；按鈕收線(重量越大收越慢)。鉤子最高只到竿邊，不衝上天
  const reeling=(held.rod||held.up);
  fish.hv += ROD_GRAV*(1+load*LOAD_SINK);
  if(reeling)  fish.hv -= ROD_LIFT/(1+load*LOAD_SLOW);   // 上鍵／拉竿鈕：收線往上拉
  if(held.down) fish.hv += ROD_LIFT*0.7;                  // 下鍵：主動把魚鉤放下去
  fish.hv *= ROD_DAMP;
  fish.hookDepth += fish.hv;
  const maxD=FISH_BOTTOM-FISH_SURFACE, minD=-56;   // minD≈竿邊高度（收到竿子就停）
  if(fish.hookDepth>maxD){ fish.hookDepth=maxD; if(fish.hv>0) fish.hv=0; }
  if(fish.hookDepth<minD){ fish.hookDepth=minD; if(fish.hv<0) fish.hv=0; }

  // 水平：水裡鬆鬆地自由飄；一收線/出水就把線收緊、鉤子乖乖回到竿下
  const pivotX=fish.capX+boatX+(fish.facing==='left'?-16:16);
  const shallow=fish.hookDepth<24, tight=reeling||shallow;
  const springK = tight ? REEL_SPRING : HOOK_SPRING/(1+fish.hookDepth*0.01);
  fish.hvx += (pivotX-fish.hookX)*springK;
  if(!tight && fish.hookDepth>4) fish.hvx += Math.sin(now/650)*CUR_PUSH + Math.sin(now/1700)*CUR_PUSH*0.6;
  if(held.left)  fish.hvx -= HOOK_NUDGE;
  if(held.right) fish.hvx += HOOK_NUDGE;
  fish.hvx *= tight ? REEL_DAMP : HOOK_DAMP;
  fish.hookX += fish.hvx;
  fish.hookX=Math.max(8, Math.min(FISH_W-8, fish.hookX));

  const hookX=fish.hookX, hookY=FISH_SURFACE+fish.hookDepth;

  // 收線把魚拉過船緣 → 輕輕送進船裡（在這之前魚一直被線牽著）
  if(fish.hooked.length && hookY <= DECK_Y-6){
    const boatCx=(BX0+BX1)/2+boatX;
    for(let k=0;k<fish.hooked.length;k++){
      const s=fish.hooked[k];
      fish.airborne.push({ kind:s.kind, trash:s.trash, x:hookX, y:hookY,
      vx:(boatCx-hookX)*0.04 + fish.hvx*0.45 + (Math.random()-0.5)*0.9, vy:-PLOP_UP-k*0.45, spin:0 });
      const i=fish.swimmers.indexOf(s); if(i>=0) fish.swimmers[i]=makeSwimmer();
    }
    fish.hooked=[];
  }

  // 水裡碰到的魚／垃圾→掛上（不限一隻）
  if(fish.hookDepth>3 && fish.hooked.length<HOOK_CAP){
    for(const s of fish.swimmers){
      if(s.hooked) continue;
      if(Math.abs(s.x-hookX)<11 && Math.abs(s.y-hookY)<11){
        s.hooked=true; fish.hooked.push(s);
        if(fish.hooked.length===1) say(s.trash?'呃，掛到垃圾了…':'上鉤了！按住收線把牠拉上船');
      }
    }
  }
  // 掛著的排成一串跟著鉤子（這就是「魚被線牽著」）
  fish.hooked.forEach((s,k)=>{ s.x=hookX+Math.sin(now/200+k)*2; s.y=hookY+6+k*7; });

  // 魚群／垃圾游動
  for(const s of fish.swimmers){
    if(s.hooked) continue;
    s.x += s.dir*(s.kind.spd||0.6); s.wob+=0.05; s.y += Math.sin(s.wob)*0.3;
    if(s.y<FISH_TOP) s.y=FISH_TOP; if(s.y>FISH_BOTTOM) s.y=FISH_BOTTOM;
    if(s.x<-30||s.x>FISH_W+30) Object.assign(s, makeSwimmer());
  }
  while(fish.swimmers.length<SWIM_CAP) fish.swimmers.push(makeSwimmer());

  // 送進船的漁獲：小拋物線落到甲板計分/扣錢
  for(let i=fish.airborne.length-1;i>=0;i--){
    const a=fish.airborne[i];
    a.vy+=AIR_G; a.x+=a.vx; a.y+=a.vy; a.spin+=0.25;
    if(a.vy>0 && a.y>=DECK_Y && a.x>(BX0+boatX+8) && a.x<(BX1+boatX-8)){
      landCatch(a);
      if(!fish) return;            // 詛咒物觸發→fish 已清空，立刻收手別再碰 fish
      fish.airborne.splice(i,1); continue;
    }
    if(a.y>FISH_H+30){ if(!a.trash) toast('💦 魚滑回海裡了…'); fish.airborne.splice(i,1); }
  }

  // 海怪
  if(fish.monsters.length<MON_CAP && now>fish.lastMonster){
    fish.lastMonster=now+MON_MIN+Math.random()*(MON_MAX-MON_MIN);
    fish.monsters.push({ x:CAP_MIN+Math.random()*(CAP_MAX-CAP_MIN), hp:MON_HP, born:now, lastBite:now+900, frame:0, hit:0 });
    toast('🐙 海怪登船了！快攻擊牠！');
  }
  for(const m of fish.monsters){
    m.frame=Math.floor(now/240)%2; if(m.hit>0) m.hit--;
    if(now-m.lastBite>=MON_BITE_CD){ m.lastBite=now; fish.boatHp=Math.max(0,fish.boatHp-MON_DMG);
      if(fish.boatHp<=0){ sinkBoat(); return; } }
  }
  for(let i=fish.bullets.length-1;i>=0;i--){
    const b=fish.bullets[i]; b.x+=b.dir*BULLET_SPEED;
    let gone=(b.x<-6||b.x>FISH_W+6);
    for(let j=fish.monsters.length-1;j>=0;j--){
      const m=fish.monsters[j];
      if(Math.abs(m.x-b.x)<18){ m.hp-=GUN_DMG; m.hit=6; gone=true; if(m.hp<=0) killMonster(j); break; }
    }
    if(gone) fish.bullets.splice(i,1);
  }

  // 更新 HTML HUD（血條 + 計分）
  const hpFill=document.getElementById('fishHpFill');
  if(hpFill){
    const pct=Math.max(0,fish.boatHp)/FISH_BOAT_MAXHP*100;
    hpFill.style.width=pct+'%';
    hpFill.style.background = fish.boatHp>40?'#6fae5e':(fish.boatHp>15?'#d6a93e':'#c2503e');
  }
  const sc=document.getElementById('fishScore');
  if(sc){
    let txt='🎣'+fish.caught+'　$'+fish.score;
    if(fish.hooked.length){ let load=0; for(const h of fish.hooked) load+=(h.kind.wt||1);
      txt+='　🪝×'+fish.hooked.length+'（重'+load.toFixed(1)+'）'; }
    sc.textContent=txt;
  }
}

/* ---------- 每楨繪圖 ---------- */
function drawFishing(){
  if(!fish){ enterFishing(); }
  const now=Date.now(), boatX=fish.boatX||0;
  const deck=DECK_Y, px=fish.capX+boatX;
 // 天空＋海＋波紋
  let sky=ctx.createLinearGradient(0,0,0,FISH_SURFACE);
  sky.addColorStop(0,'#bfe0ea'); sky.addColorStop(1,'#e9f3ee');
  ctx.fillStyle=sky; ctx.fillRect(0,0,FISH_W,FISH_SURFACE);
  let sea=ctx.createLinearGradient(0,FISH_SURFACE,0,FISH_H);
  sea.addColorStop(0,'#58CCB9'); sea.addColorStop(0.5,'#0E8A93');sea.addColorStop(1,'#1f5d77');
  ctx.fillStyle=sea; ctx.fillRect(0,FISH_SURFACE,FISH_W,FISH_H-FISH_SURFACE);
  ctx.strokeStyle='#ffffff55'; ctx.lineWidth=2;
  for(let x=0;x<FISH_W;x+=24){ ctx.beginPath();
    ctx.moveTo(x,FISH_SURFACE+2+Math.sin(x+now/200)*1.5);
    ctx.lineTo(x+12,FISH_SURFACE+2+Math.sin(x+12+now/200)*1.5); ctx.stroke(); }
// 背景雲（全幅，最底層）
  { const bg=npcImg('bg.png');
    if(bg && bg.complete && bg.naturalWidth) ctx.drawImage(bg, 0, 0);
    else { /* 沒圖才畫程式的天空海 */ } }
  // ① 船帆（背景，全幅）
  { const sm=npcImg('sail.png');
    if(sm && sm.complete && sm.naturalWidth) ctx.drawImage(sm, Math.round(boatX), 0); }

  // ② 船身（全幅；沒圖退回向量）
  const boatImg=npcImg('boat.png');
  if(boatImg && boatImg.complete && boatImg.naturalWidth){
    ctx.drawImage(boatImg, Math.round(boatX), 0);
  }else{
    const bx0=BX0+boatX, bx1=BX1+boatX;
    ctx.fillStyle='#7a5230';
    ctx.beginPath(); ctx.moveTo(bx0,deck); ctx.lineTo(bx1,deck);
    ctx.lineTo(bx1-22,FISH_SURFACE+18); ctx.lineTo(bx0+22,FISH_SURFACE+18); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#8a6038'; ctx.fillRect(bx0,deck-6,bx1-bx0,8);
    ctx.fillStyle='#5e3f24'; ctx.fillRect(bx0,deck+2,bx1-bx0,3);
  }

  // 釣竿（畫在人後面、位置稍低）
  const rodTipX=px+(fish.facing==='left'?-16:16), rodTipY=deck-52;
  ctx.strokeStyle='#b08a3a'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(px,deck-12); ctx.lineTo(rodTipX,rodTipY); ctx.stroke();

  // ③ 船長（夾在船身與前景裝飾中間）
  const py=deck-2+fish.bob*0.3;
  const dirCols={ down:0, left:1, right:2, up:3 }, col=dirCols[fish.facing]||2;
  const bodyImg = (fish.knifeSwing>0 && CAPTAIN_GUN_IMG.complete && CAPTAIN_GUN_IMG.naturalWidth)
    ? CAPTAIN_GUN_IMG : PLAYER_IMG;
  if(bodyImg.complete && bodyImg.naturalWidth){
    ctx.drawImage(bodyImg, col*64,0,64,64, px-32, py-64+14, 64,64);
  }else{ ctx.font='26px serif'; ctx.textAlign='center'; ctx.textBaseline='alphabetic'; ctx.fillText('🧑‍✈️',px,py); }

  // ④ 船上裝飾（前景，全幅，蓋在人前面）
  { const dm=npcImg('deck.png');
    if(dm && dm.complete && dm.naturalWidth) ctx.drawImage(dm, Math.round(boatX), 0); }

  // ⑤ 魚（在 deck 之上）
  for(const s of fish.swimmers) drawOneFish(s);
  for(const s of fish.hooked)   drawOneFish(s);

  // ⑥ 魚線＋鉤（在 deck 之上；釣竿已畫在人後面了）
  const hookX=fish.hookX, hookY=FISH_SURFACE+fish.hookDepth;
  ctx.strokeStyle='#eef6f8cc'; ctx.lineWidth=1.2;
  const spanX=Math.abs(hookX-rodTipX);
  const cx=(rodTipX+hookX)/2 + Math.sin(now/500)*3;
  const cy=(rodTipY+hookY)/2 + 10 + spanX*0.25;
  ctx.beginPath(); ctx.moveTo(rodTipX,rodTipY); ctx.quadraticCurveTo(cx,cy,hookX,hookY); ctx.stroke();
  ctx.strokeStyle='#dfe6ea'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(hookX,hookY+2,2.5,0,Math.PI*1.5); ctx.stroke();

  // ⑦ 飛魚／海怪／子彈／刀光
  for(const a of fish.airborne) drawItem(a.kind,a.trash,a.x,a.y,a.vx<0,a.spin);
  for(const m of fish.monsters) drawMonster(m, now, boatX);
  ctx.fillStyle='#ffd24a';
  for(const b of fish.bullets) ctx.fillRect(b.x+boatX-4,deck-18,8,3);
  if(fish.knifeSwing>0){ const dir=fish.facing==='left'?-1:1; ctx.strokeStyle='#ffffffcc'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(px+dir*18,deck-24,20, dir>0?-0.8:2.3, dir>0?0.8:3.9); ctx.stroke(); }
}
function drawItem(kind,trash,x,y,flip,spin){
  ctx.save(); ctx.translate(x,y); if(spin) ctx.rotate(spin);
  if(trash){
    const tim = npcImg('trash_'+kind.k+'.png');
    if(tim && tim.complete && tim.naturalWidth){ if(flip && kind.k!=='tire') ctx.scale(-1,1); ctx.drawImage(tim, -tim.naturalWidth/2, -tim.naturalHeight/2); }
    else { ctx.font='16px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(kind.e,0,0); }
  }
  else{
    const im = kind.k && FISH_IMG[kind.k] ? npcImg(FISH_IMG[kind.k]) : null;
    if(im && im.complete && im.naturalWidth){              // 有貼圖：原尺寸置中畫，朝左自動翻
      if(flip) ctx.scale(-1,1);
      ctx.drawImage(im, -im.naturalWidth/2, -im.naturalHeight/2);
    }else{                                                  // 沒貼圖：退回向量魚
      const L=kind.len; if(flip) ctx.scale(-1,1);
      ctx.fillStyle=kind.col;
      ctx.beginPath(); ctx.moveTo(-L*0.5,0); ctx.lineTo(-L*0.5-6,-5); ctx.lineTo(-L*0.5-6,5); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0,0,L*0.5,L*0.32,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(L*0.28,-2,1.8,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(L*0.30,-2,0.9,0,Math.PI*2); ctx.fill();
    }
  }
  ctx.restore();
}
function drawOneFish(s){
  drawItem(s.kind, s.trash, s.x, s.y, s.dir<0, 0);
  if(s.hooked){ const L=s.kind.len||14; ctx.strokeStyle='#fff'; ctx.globalAlpha=0.4+0.4*Math.sin(Date.now()/120); ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.ellipse(s.x,s.y,L*0.6,L*0.45,0,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1; }
}
function drawMonster(m, now, boatX){
  const grow=Math.min(1,(now-m.born)/400), bob=Math.sin(now/300+m.x)*3;
  const mx=m.x+(boatX||0), my=DECK_Y-14+bob;
  const ci=npcImg('cthulhu.png');
  ctx.save(); ctx.translate(mx,my); ctx.scale(grow,grow);
if(ci && ci.complete && ci.naturalWidth){
    ctx.drawImage(ci, m.frame*64,0, 64,64, -32, -64+24, 64, 64);
  }else{
    const t=m.frame?4:-4; ctx.fillStyle = m.hit>0 ? '#e8e36a' : '#4f6e4a'; ctx.lineWidth=3; ctx.strokeStyle=ctx.fillStyle;
    for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(i*5,4); ctx.quadraticCurveTo(i*7,16, i*6+(i%2?t:-t),24); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(0,0,15,14,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#f5d24a'; ctx.beginPath(); ctx.arc(-5,-2,3.2,0,Math.PI*2); ctx.arc(5,-2,3.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(-5,-2,1.4,0,Math.PI*2); ctx.arc(5,-2,1.4,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle='#00000066'; ctx.fillRect(mx-22,my-92,44,5);
  ctx.fillStyle='#c2503e'; ctx.fillRect(mx-21,my-91, 42*(m.hp/MON_HP), 3);
}