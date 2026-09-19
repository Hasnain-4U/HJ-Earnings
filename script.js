const API_BASE=(window.HJ_API_BASE||`${location.origin}/api`).replace(/\/$/,'');
const TOKEN_KEY='HJ_EARNING_TOKEN_V1';
const oldAuthKey='HJ_EARNING_AUTH_V1';

function getToken(){return localStorage.getItem(TOKEN_KEY)||''}
function clearAuth(){localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(oldAuthKey)}
async function api(path,options={}){
  const opts={...options,headers:{'Content-Type':'application/json',...(options.headers||{})}};
  const t=getToken(); if(t) opts.headers.Authorization='Bearer '+t;
  let res;
  try{res=await fetch(API_BASE+path,{...opts,cache:'no-store'})}
  catch(e){throw new Error('Backend se connection nahi ho raha. CMD mein npm start check karo.')}
  let data={}; try{data=await res.json()}catch{}
  if(!res.ok){
    if(res.status===401){clearAuth();location.replace('auth.html');throw new Error('Session expire ho gayi. Dobara login karo.')}
    throw new Error(data.error||`Request failed (${res.status})`)
  }
  return data;
}

const state={points:0,spins:0,referrals:0,totalEarnedPoints:0,activity:[],lastBonus:null,withdrawals:[]};
function points(n){return Number(n||0).toLocaleString()}
function rupees(p){return (Number(p||0)/1000).toFixed(2)}
function money(p){return rupees(p)}
function toast(m){const t=document.getElementById('toast');if(!t)return;t.textContent=m;t.style.display='block';clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.style.display='none',3000)}
function update(){
 document.querySelectorAll('[data-points]').forEach(e=>e.textContent=points(state.points));
 document.querySelectorAll('[data-spins]').forEach(e=>e.textContent=state.spins);
 document.querySelectorAll('[data-referrals]').forEach(e=>e.textContent=state.referrals);
 document.querySelectorAll('[data-earned-points]').forEach(e=>e.textContent=points(state.totalEarnedPoints));
 document.querySelectorAll('[data-earned-rupees]').forEach(e=>e.textContent=rupees(state.totalEarnedPoints));
 const r=document.getElementById('recentActivity');
 if(r) r.innerHTML=state.activity.length?state.activity.slice(0,6).map(a=>`<div class="action-card" style="margin-bottom:9px"><div><b>${a.text}</b><p>${a.date}</p></div><strong style="margin-left:auto">${a.amount>=0?'+':'−'} ${points(Math.abs(a.amount))} Points</strong></div>`).join(''):'<div class="empty-state"><div>📊</div><h3>No activity yet</h3><p>Start earning to see your activity here.</p></div>';
}
async function refreshState(showError=false){
 try{
   const {user}=await api('/user/me');
   state.points=Number(user.points||0);state.spins=Number(user.spins||0);state.referrals=Number(user.referrals||0);state.totalEarnedPoints=Number(user.totalEarnedPoints||0);state.lastBonus=user.last_bonus_date||null;
   const h=await api('/user/history');
   state.activity=(h.history||[]).map(x=>({amount:Number(x.points),text:x.description,date:new Date(x.createdAt).toLocaleString()}));
   const w=await api('/withdrawals'); state.withdrawals=w.withdrawals||[];
   update();
   const pn=document.getElementById('profileName');if(pn)pn.textContent=user.name||'My Profile';
   const pe=document.getElementById('profileEmail');if(pe)pe.textContent=user.email||'';
   const rc=document.getElementById('refCode');if(rc)rc.value=user.referralCode||'';
   return true;
 }catch(e){if(showError)toast(e.message);console.error('[HJ]',e);return false}
}

function mountAdCode(container, code){
  if(!window.HJ_ADS?.enabled || !code) return;
  container.innerHTML='';
  const tpl=document.createElement('template');
  tpl.innerHTML=code;
  [...tpl.content.childNodes].forEach(node=>{
    if(node.nodeType===1 && node.tagName==='SCRIPT'){
      const sc=document.createElement('script');
      [...node.attributes].forEach(a=>sc.setAttribute(a.name,a.value));
      sc.textContent=node.textContent||'';
      container.appendChild(sc);
    }else container.appendChild(node.cloneNode(true));
  });
}
function adSlot(position,variant='banner'){
 const el=document.createElement('section');
 el.className=`hj-ad hj-ad-${position} hj-ad-${variant}`;
 el.dataset.adSlot=position;
 el.setAttribute('aria-label','Advertisement');
 el.innerHTML=`<span class="hj-ad-label">Advertisement</span><div class="hj-ad-inner"><div class="hj-ad-code" data-ad-code="${position}"></div><span class="hj-ad-fallback">Advertisement space</span></div>`;
 const code=window.HJ_ADS?.slots?.[position]||'';
 mountAdCode(el.querySelector('.hj-ad-code'),code);
 if(code) el.querySelector('.hj-ad-fallback')?.remove();
 return el;
}
function initAdLayout(){
 if(document.querySelector('.hj-ad-layout-ready'))return;
 document.body.classList.add('hj-ad-layout-ready');
 const main=document.querySelector('.main');
 if(!main)return;
 const topbar=main.querySelector('.topbar');
 const top=adSlot('top');
 if(topbar) topbar.insertAdjacentElement('afterend',top); else main.insertBefore(top,main.firstChild);
 const path=location.pathname.toLowerCase();
 const contentSelectors={
   '/earn.html':'.earn-layout',
   '/bonus.html':'.page-card',
   '/refer.html':'.page-card',
   '/history.html':'.page-card',
   '/withdraw.html':'.withdraw-layout'
 };
 const selector=Object.entries(contentSelectors).find(([key])=>path.endsWith(key))?.[1];
 if(selector){
   const content=main.querySelector(selector);
   if(content) content.insertAdjacentElement('afterend',adSlot('content','compact'));
 }
 const bottom=adSlot('bottom');
 main.appendChild(bottom);
 document.body.appendChild(adSlot('left','side'));
 document.body.appendChild(adSlot('right','side'));
}

function logout(){clearAuth();location.replace('auth.html')}
window.logout=logout;
function toggleSidebar(){document.querySelector('.sidebar')?.classList.toggle('open')}
async function spinWheel(){
 const b=document.getElementById('spinButton'),w=document.getElementById('wheel');if(!b||!w)return;b.disabled=true;b.textContent='⏳ SPINNING...';
 try{
   const result=await api('/earning/spin',{method:'POST'});
   const rewards=[10,20,50,100,150,200],idx=Math.max(0,rewards.indexOf(Number(result.reward))),seg=360/rewards.length;
   w.style.transform=`rotate(${(360-(idx*seg+seg/2))+360*4}deg)`;
   await new Promise(r=>setTimeout(r,4100));
   await refreshState(true); toast('🎉 You earned '+points(result.reward)+' Points');
 }catch(e){toast(e.message);console.error('[HJ spin]',e)}finally{b.disabled=false;b.textContent='🎡 SPIN NOW'}
}
async function claimBonus(){
 const b=document.querySelector('[onclick="claimBonus()"]');if(b)b.disabled=true;
 try{const r=await api('/earning/daily-bonus',{method:'POST'});if(b){b.textContent='✅ Bonus Claimed Today';b.disabled=true;}await refreshState(true);toast('🎁 Daily bonus: '+points(r.points)+' Points')}
 catch(e){toast(e.message);console.error('[HJ bonus]',e);if(b)b.disabled=false}
}
function refer(){const c=document.getElementById('refCode')?.value||'';navigator.clipboard?.writeText(c);toast('Referral code copied')}
async function requestWithdrawal(){
 const p=Number(document.getElementById('withdrawPoints').value),num=document.getElementById('accountNumber').value.trim(),method=document.querySelector('input[name=method]:checked')?.value||'Easypaisa';
 if(!Number.isInteger(p)||p<20000)return toast('Minimum withdrawal is 20,000 Points');if(!num)return toast('Enter account/mobile number');
 try{await api('/withdrawals',{method:'POST',body:JSON.stringify({points:p,method,accountNumber:num})});toast('Withdrawal request submitted');await refreshState(true)}catch(e){toast(e.message);console.error('[HJ withdrawal]',e)}
}
async function redeemCode(){const input=document.getElementById('redeemCode'),code=input?.value.trim();if(!code)return toast('Enter redeem code');try{const r=await api('/redeem',{method:'POST',body:JSON.stringify({code})});input.value='';await refreshState(true);toast('🎁 Redeem successful: +'+points(r.points)+' Points')}catch(e){toast(e.message)}}
window.redeemCode=redeemCode;window.spinWheel=spinWheel;window.claimBonus=claimBonus;window.requestWithdrawal=requestWithdrawal;window.refreshState=refreshState;window.toggleSidebar=toggleSidebar;window.refer=refer;window.toast=toast;window.money=money;window.state=state;
document.addEventListener('DOMContentLoaded',()=>{initAdLayout();update();if(getToken())refreshState(true)});
