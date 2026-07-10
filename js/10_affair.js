/* =========================================================
   10_affair.js — 情人／出軌機制引擎
   須排在 09_dialogue_patch.js 之後載入。
   ---------------------------------------------------------
   規則：
   1) 有伴侶 + 對方好感達 LOVER_AFF_TRIGGER + 對方非伴侶
      → 觸發 LOVER_PROPOSAL 告白劇情；玩家選「答應」→ 對方成為情人
   2) 情人聊天走 LOVER_TOPICS（不是普通 CHAT_TOPICS）
      每聊一次：情人好感依選項升降 + 伴侶親密度大幅下降 + 累積懷疑值
   3) 懷疑值滿 SUSPICION_TRIGGER，下次聊 chatPartner 時強制進入 PARTNER_SUSPICION
      三個選項：糊弄 / 差點露餡 (扣親密度) / 承認 (reveal:true → 出軌吵架分手)
   4) 伴侶親密度掉到 BREAKUP_INTIMACY → 走一般分手（沒被抓到但漸行漸遠）
   5) 情人好感掉到 LOVER_AFF_LEAVE → 情人心灰意冷自行離開
   ========================================================= */

/* ---------- 平衡常數（想改難度動這裡） ---------- */
const LOVER_AFF_TRIGGER=30;              // 好感達此值 → 對方告白
const LOVER_AFF_LEAVE=-5;                // 情人好感 <= 此值 → 情人主動離開
const LOVER_CHAT_PARTNER_PENALTY=-6;     // 每次跟情人聊天，伴侶親密度變動
const SUSPICION_TRIGGER=3;               // 情人聊天次數累積到此，下次伴侶聊天走懷疑
const LOVER_ROMANCE_IDS=['Francis','Pedro','Antonio','Alfred'];

/* ---------- 存檔欄位初始化（頁面載入時 S 還是 null，改成用到時才補） ---------- */
function ensureAffairState(){
  if(!S) return;
  if(!S.lovers) S.lovers={};              // { id:true } 表示已是情人
  if(S._suspicion===undefined) S._suspicion=0;
}

function isRomanceable(id){ return LOVER_ROMANCE_IDS.indexOf(id)>=0; }
function hasLover(id){ return !!(S.lovers && S.lovers[id]); }

/* ---------- 覆寫 chatMerchant：情人／告白／原邏輯三路分派 ---------- */
const _chatMerchant_beforeAffair = chatMerchant;
chatMerchant = function(id){
  ensureAffairState();
  const rel = S.port.relations[id];
  if(!rel) return _chatMerchant_beforeAffair(id);
  // 已是情人 → 走情人聊天
  if(hasLover(id)) return chatLover(id);
  // 有伴侶 + 非伴侶本人 + 是可攻略對象 + 好感達門檻 + 沒剛拒絕 → 告白
  if(S.partner && S.partner.id!==id && isRomanceable(id)
     && rel.aff>=LOVER_AFF_TRIGGER && !rel.proposeCd){
    return loverProposal(id);
  }
  _chatMerchant_beforeAffair(id);
};

/* ---------- 情人聊天：走 LOVER_TOPICS，每次累積懷疑值 + 扣伴侶親密度 ---------- */
function chatLover(id){
  ensureAffairState();
  const rel=S.port.relations[id], now=Date.now();
  if(!rel) return;
  if(now-(rel.lastChat||0)<8000){ toast('剛聊過了，等一下'); return; }
  const pool=(typeof LOVER_TOPICS!=='undefined' && (LOVER_TOPICS[id]||LOVER_TOPICS._default)) || [];
  if(!pool.length) return;
  const topic=pool[Math.floor(Math.random()*pool.length)];
  freezeNpcById('mc_'+id); _convoCid=id;
  showDialogue(id,'neutral',topic.q, topic.a.map(opt=>({
    t:opt.t,
    run:()=>{
      rel.lastChat=Date.now();
      rel.aff+=opt.aff;
      S._suspicion=(S._suspicion||0)+1;
      if(S.partner) S.partner.intimacy=(S.partner.intimacy||0)+LOVER_CHAT_PARTNER_PENALTY;
      showDialogue(id, opt.mood, (opt.r||'……')+`（情人好感 ${opt.aff>=0?'+':''}${opt.aff}）`, [
        {t:'結束對話', run:()=>{
          if(rel.aff<=LOVER_AFF_LEAVE){ loverLeaves(id); return; }
          if(S.partner && S.partner.intimacy<=BREAKUP_INTIMACY){ breakupPartner(); return; }
          openMerchant(id); save();
        }}
      ]);
    }
  })));
}

/* ---------- 情人好感掉到底 → 心灰意冷離開 ---------- */
function loverLeaves(id){
  const nm=(MERCHANTS[id]||{}).nm||'對方';
  delete S.lovers[id];
  S._suspicion=0;
  const rel=S.port.relations[id];
  if(rel) rel.proposeCd=true;
  addLog(`💔 ${nm} 心灰意冷，離開了你`);
  toast(`💔 ${nm} 心灰意冷地離開了`);
  closeSheet();
  save();
}

/* ---------- 情人告白 ---------- */
function loverProposal(id){
  freezeNpcById('mc_'+id); _convoCid=id;
  const nm=MERCHANTS[id].nm;
  const lines=(typeof LOVER_PROPOSAL!=='undefined' && (LOVER_PROPOSAL[id]||LOVER_PROPOSAL._default))
            || [{who:'partner',mood:'love',t:'亞瑟，跟我在一起吧。'}];
  const rep=(typeof LOVER_PROPOSAL_REPLY!=='undefined'
          && (LOVER_PROPOSAL_REPLY[id]||LOVER_PROPOSAL_REPLY._default)) || {};
  const endWith=(line, fallbackMood)=>{
    if(line){
      showDialogue(id, line.mood||fallbackMood, line.t,
        [{t:'結束對話', run:()=>{ openMerchant(id); save(); }}]);
    }else{ openMerchant(id); save(); }
  };
  runScript(lines, [
    {t:'……好。（成為情人）', cls:'gold', run:()=>{
      S.lovers[id]=true;
      const rel=S.port.relations[id]; rel.proposeCd=false;
      addLog(`💔 和 ${nm} 開始了情人關係（伴侶不知情）`);
      toast(`💔 ${nm} 成了你的情人`);
      save();
      endWith(rep.yes, 'love');
    }},
    {t:'不能……我有伴侶了', run:()=>{
      const rel=S.port.relations[id];
      rel.aff = Math.max(rel.aff-8, LOVER_AFF_TRIGGER-10);   // 好感掉一截，暫時不會再問
      rel.proposeCd = true;
      addLog(`💧 婉拒了 ${nm} 的告白`);
      toast(`💧 婉拒了 ${nm}`);
      save();
      endWith(rep.no, 'sad');
    }},
  ]);
}

/* ---------- 覆寫 chatPartner：懷疑值到門檻 → 走懷疑對話 ---------- */
const _chatPartner_beforeAffair = chatPartner;
chatPartner = function(){
  ensureAffairState();
  const p=S.partner; if(!p) return;
  const pool = (typeof PARTNER_SUSPICION!=='undefined')
             && (PARTNER_SUSPICION[p.id]||PARTNER_SUSPICION._default);
  if((S._suspicion||0)>=SUSPICION_TRIGGER && pool && pool.length){
    S._suspicion=0;   // 消耗掉這波懷疑
    freezeNpcById('partner'); _convoCid=p.id;
    const convo=pool[Math.floor(Math.random()*pool.length)];
    runScript(convo.lines, convo.choices.map(opt=>({
      t:opt.t,
      cls: opt.reveal?'ghost':undefined,
      run:()=>{
        if(opt.reveal){ triggerAffairBreakup(p.id); }
        else { partnerPick(opt); }
      }
    })));
    return;
  }
  _chatPartner_beforeAffair();
};

/* ---------- 出軌被抓 → 吵架 → 分手 ---------- */
function triggerAffairBreakup(pid){
  const lines=(typeof AFFAIR_BREAKUP!=='undefined' && (AFFAIR_BREAKUP[pid]||AFFAIR_BREAKUP._default))
            || (BREAKUP_CONVOS[pid]||BREAKUP_CONVOS._default);
  freezeNpcById('partner');
  runScript(lines, [
    {t:'（沉默地看著他離去）', cls:'ghost', run:()=>{
      // 出軌分手：對方好感直接掉底，不只是回朋友
      const rel=S.port.relations[pid];
      if(rel) rel.aff=Math.min(rel.aff,-5);
      finalizeBreakup(pid);
      S._suspicion=0;
      addLog(`💔 出軌被 ${(MERCHANTS[pid]||{}).nm||'伴侶'} 發現，關係徹底破裂`);
    }}
  ]);
}