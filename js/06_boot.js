function loop(){if(S){update();draw();}requestAnimationFrame(loop);}
/* ---------- sheets ---------- */
function openSheet(h){document.getElementById('sheet').innerHTML=h;document.getElementById('mask').classList.add('show');}
function closeSheet(){document.getElementById('mask').classList.remove('show'); unfreezeNpcs();}
document.getElementById('mask').addEventListener('click',e=>{if(e.target.id==='mask')closeSheet();});

/* ---------- 前往清單（大卡片，好按） ---------- */
function openTravel(){
  const here=curScene, portLock=S.era<18;
  const card=(s,e,nm,note,lock)=>`<button class="btn ${s===here?'green':'ghost'} ${lock?'dis':''}"
    style="width:100%;text-align:left;padding:13px 14px;margin-bottom:8px;font-size:15px;display:flex;align-items:center;gap:10px"
    ${lock?'':`onclick="closeSheet();goScene('${s}')"`}>
    <span style="font-size:22px">${e}</span><span style="flex:1">${nm}</span>
    ${s===here?'<span class="small">目前所在</span>':(note?`<span class="small">${note}</span>`:'')}</button>`;
  openSheet(`<div class="sheethead"><h3>🗺️ 要去哪裡？</h3><button class="close" onclick="closeSheet()">✕</button></div>
    <b class="small">戶外</b>
    ${card('farm','🌱','農牧地')}
    ${card('shop','🏪','商店')}
    ${card('port','⚓','港口', portLock?'18世紀解鎖':'', portLock)}
    <div class="hr"></div>
    <b class="small">店面</b>
    ${card('cafe','🍽️','餐廳')}
    ${card('kitchen','👩‍🍳','廚房')}
    <div class="hr"></div>
    <b class="small">家</b>
    ${card('office','🏠','辦公室')}`);
}
function goScene(name){
  spicyScene=null;if(name!=='fishing'){ const fu=document.getElementById('fishUI'); if(fu) fu.style.display='none'; const fw=document.getElementById('fishWeaponBtn'); if(fw) fw.style.display='none'; }
  if(name==='port'){ if(S.era<18){ toast('港口在 18 世紀才會開放'); return; }
    if(!S.port.merchants.length || Date.now()-(S.port.lastTs||0)>PORT_REFRESH_MS) refreshPort(); else buildPortObjects();
    buildPortNpcs(); }
  if(name==='office'){ syncPartnerObject(); buildOfficeNpcs(); }
  if(name==='farm'){ if(S.childHired){ monsters=[]; shots=[]; } else spawnSnakes(); buildChickens(); buildPigs(); buildCows(); buildFarmNpcs(); }
  curScene=name; applyCookSkin();
  player.x=SCENES[name].spawn.x;player.y=SCENES[name].spawn.y;player.facing='up';
  document.getElementById('sceneTitle').textContent=SCENES[name].title;
  const navOf={farm:'farm',shop:'farm',cafe:'cafe',kitchen:'cafe',office:'office'};
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.s===navOf[name]));
  closeSheet();dlgNpc=null;clearTimeout(say._t);say._t=null;idleDlg();
  tick();refreshTop();save();
}
function refreshTop(){
  document.getElementById('cash').textContent=fmt(S.cash);
  document.getElementById('net').textContent=fmt(netWorth());
  document.getElementById('hp').textContent=S.hp+'/'+S.maxHp;
  document.getElementById('clock').textContent='第 '+S.day+' 天';
}

/* ---------- boot ---------- */
function listSaves(){const out=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(NS))out.push(k.slice(NS.length));}return out;}
function renderSaveList(){const box=document.getElementById('saveList');const s=listSaves();if(!s.length){box.innerHTML='';return;}
  box.innerHTML='<div class="small" style="margin-bottom:6px">繼續之前的存檔</div>'+s.map(n=>`<button class="btn ghost sm" style="margin:3px" onclick="startGame('${n}')">${n}</button>`).join('');}
function submitNick(){const v=document.getElementById('nickInput').value.trim();if(!v){toast('請先輸入暱稱');return;}startGame(v);}
function startGame(n){
  user=n;const saved=load(n);S=saved||blankState();
  if(!saved){rollMarket();addLog('🌾 開張！起始 $50，送 1 貓 1 雞。');}
  // migration safety
  if(!S.animals.cow)S.animals.cow=[];if(!S.animals.pig)S.animals.pig=[];
  if(!S.cafe.goods)S.cafe.goods={};if(!S.curRecipe)S.curRecipe='strawberry_tart';
  if(!S.recipesUnlocked)S.recipesUnlocked={};
  if(!S.crops)S.crops={};if(!S.era)S.era=17;if(!S.port)S.port={merchants:[],relations:{},lastTs:0};if(!S.maxHp)S.maxHp=20;if(S.hp===undefined)S.hp=S.maxHp;if(S.toxins===undefined)S.toxins=0;if(!S.cookBy)S.cookBy='self';
  if(!S.wardrobe)S.wardrobe={owned:['default'],wearing:'default'};
  if(S.wardrobe&&!S.wardrobe.owned.includes('captain')) S.wardrobe.owned.push('captain');
  if(!S.kitchenPickups)S.kitchenPickups=[];
  if(!S.appleDrops)S.appleDrops=[];
  if(S.appleTreeTs===undefined)S.appleTreeTs=0;
  if(S.childHired===undefined)S.childHired=false;
  if(!S.feedBowl)S.feedBowl={};
  if(S.animals){   // 已長大的火雞/豬/牛補上體重欄位
    (S.animals.chicken||[]).forEach(a=>{ if(a.species==='turkey' && isHen(a) && a.weight===undefined) a.weight=MEAT_SPEC.turkey.baseKg; });
    (S.animals.pig||[]).forEach(a=>{ if(isGrownPig(a) && a.weight===undefined) a.weight=MEAT_SPEC.pig.baseKg; });
    (S.animals.cow||[]).forEach(a=>{ if(isGrownCow(a) && a.weight===undefined) a.weight=MEAT_SPEC.cow.baseKg; });
  }
  // 清掉舊存檔殘留的爆量雞蛋：總 pending 超過蛋箱上限會讓 room 變負、雞全面停產
  if(S.animals && S.animals.chicken){
    let over=0; for(const a of S.animals.chicken) over+=(a.pending||0);
    over-=eggCap();
    for(const a of S.animals.chicken){ if(over<=0) break;
      const cut=Math.min(a.pending||0, over); a.pending=(a.pending||0)-cut; over-=cut; }
  }
  if(!S.child && !S.childLeftHome) S.child={ name:'阿爾弗雷德·F·瓊斯', stage:0, affinity:0, lastCare:Date.now(), crying:false, bornTs:Date.now() };
  applySkin(S.wardrobe.wearing);
  if(S.partner && S.partner.intimacy===undefined){ S.partner.intimacy=0; S.partner.lastIntim=0; }
  if(S.partner && MERCHANTS[S.partner.id]) S.partner.job=MERCHANTS[S.partner.id].job;   // 同步最新職業
  if(!S.era)S.era=17;
  if(!S.decor)S.decor=blankDecor();
  else for(const era in DECOR){ S.decor[era]=S.decor[era]||{}; for(const slot in DECOR[era]) if(!(slot in S.decor[era])) S.decor[era][slot]=null; }
  if(!S.decor)S.decor=blankDecor();
  else for(const era in DECOR){ S.decor[era]=S.decor[era]||{}; for(const slot in DECOR[era]) if(!(slot in S.decor[era])) S.decor[era][slot]=null; }
  document.getElementById('splash').style.display='none';
  document.getElementById('shell').style.display='flex';
  goScene('office');
}
document.getElementById('nickInput').addEventListener('keydown',e=>{if(e.key==='Enter')submitNick();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S){tick();refreshTop();save();}});
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.style.opacity=1;clearTimeout(t._t);t._t=setTimeout(()=>t.style.opacity=0,1500);}
renderSaveList();
loop();