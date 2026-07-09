/* =========================================================
   09_dialogue_patch.js — 對話系統升級
   1) chatPartner：PARTNER_CONVOS 改依伴侶 id 分組（相容舊陣列格式）
   2) chatMerchant：CHAT_TOPICS 改依商人 id 分組，選項支援自訂回應 r
   ========================================================= */

chatPartner=function(){
  const p=S.partner; if(!p) return;
  freezeNpcById('partner'); _convoCid=p.id;
  const base=Array.isArray(PARTNER_CONVOS) ? PARTNER_CONVOS
            : (PARTNER_CONVOS[p.id] || PARTNER_CONVOS._default) || [];
  // 依親密度解鎖的進階（好感度）對話
  let tierPool=[];
  const tiers=(typeof PARTNER_CONVOS_TIER!=='undefined') && PARTNER_CONVOS_TIER[p.id];
  if(tiers){ const aff=p.intimacy||0; tiers.forEach(t=>{ if(aff>=t.min) tierPool.push(t); }); }
  // 好感度對話優先：有解鎖就只從進階池抽，沒解鎖(親密度<30)才回原本對話
  const pool = tierPool.length ? tierPool : base;
  const convo=pool[Math.floor(Math.random()*pool.length)];
  runScript(convo.lines, convo.choices.map(opt=>({ t:opt.t, run:()=>partnerPick(opt) })));
};

chatMerchant=function(id){
  const rel=S.port.relations[id], now=Date.now();
  if(now-(rel.lastChat||0)<8000){ toast('剛聊過了，等一下'); return; }
  const pool=Array.isArray(CHAT_TOPICS) ? CHAT_TOPICS
            : (CHAT_TOPICS[id] || CHAT_TOPICS._default);
  const topic=pool[Math.floor(Math.random()*pool.length)];
  showDialogue(id,'neutral',topic.q, topic.a.map(opt=>({
    t:opt.t,
    run:()=>{
      rel.lastChat=Date.now(); rel.aff+=opt.aff;
      const react=opt.r || (opt.aff>=2?'（眼睛亮了起來）真的嗎？好開心！'
                  :opt.aff<=0?'（表情淡淡的）…這樣啊。':'謝謝你。');
      showDialogue(id, opt.mood, react+`（好感 ${opt.aff>=0?'+':''}${opt.aff}）`, [
        {t:'結束對話', run:()=>{ openMerchant(id); save(); }} ]);
    }
  })));
};