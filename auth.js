const API_BASE=(window.HJ_API_BASE||'/api');
const TOKEN_KEY='HJ_EARNING_TOKEN_V1';
const AUTH_KEY='HJ_EARNING_AUTH_V1';
async function authApi(path,body){const r=await fetch(API_BASE+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Request failed');return d}
window.HJAuth={
 async signup(name,email,password,referralCode=''){const d=await authApi('/auth/register',{name,email,password,referralCode:referralCode||undefined});localStorage.setItem(TOKEN_KEY,d.token);localStorage.setItem(AUTH_KEY,JSON.stringify(d.user));return d},
 async login(email,password){const d=await authApi('/auth/login',{email,password});localStorage.setItem(TOKEN_KEY,d.token);localStorage.setItem(AUTH_KEY,JSON.stringify(d.user));return d},
 logout(){localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(AUTH_KEY);location.replace('auth.html')},
 isLoggedIn(){return !!localStorage.getItem(TOKEN_KEY)}
};
