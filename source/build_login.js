const fs=require('fs'),crypto=require('crypto');
const src=fs.readFileSync('quyish-open.html','utf8');
const words=['olma','daryo','tosh','bahor','chinor','qalam','yulduz','oltin','shamol','anor','karvon','sohil','paxta','bulut','kitob','ko\'prik'].map(w=>w.replace("'",''));
const pool=()=>{const a=[...words];for(let i=a.length-1;i>0;i--){const j=crypto.randomInt(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const mk=()=>{const a=pool();return `${a[0]}-${a[1]}-${a[2]}-${crypto.randomInt(1000,9999)}`};
const pw={ombor:'uz123456',admin:'uz123456',apm:'uz123456'};
// split source
const headEnd=src.indexOf('<style>');
const head=src.slice(0,headEnd);
const css=src.match(/<style>([\s\S]*?)<\/style>/)[1];
const rest=src.slice(src.indexOf('</style>')+8);
const scripts=[...rest.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const chartUrl=rest.match(/<script src="([^"]*chart[^"]*)"><\/script>/)[1];
const markup=rest.replace(/<script[\s\S]*?<\/script>/g,'').trim();
const monStart=markup.indexOf('<div id="v-mon">'), dashStart=markup.indexOf('<div id="v-dash"');
const monHtml=markup.slice(monStart,dashStart).trim();
const fullPayload={css,html:markup,scripts,chart:chartUrl};
const monPayload={css:'*{box-sizing:border-box}\n'+css+'\n#v-mon{margin-top:0}#v-mon .app{height:calc(100dvh - 26px)}body{background:#fff}',html:monHtml,scripts:[scripts[0],scripts[3]],chart:null};
function enc(obj,password){
  const salt=crypto.randomBytes(16), key=crypto.pbkdf2Sync(password,salt,250000,32,'sha256'), iv=crypto.randomBytes(12);
  const c=crypto.createCipheriv('aes-256-gcm',key,iv);
  const ct=Buffer.concat([c.update(JSON.stringify(obj),'utf8'),c.final()]);
  return {salt:salt.toString('base64'),blob:Buffer.concat([iv,ct,c.getAuthTag()]).toString('base64')};
}
const apmHtml=fs.readFileSync('apm/apm.html','utf8'), apmCss=fs.readFileSync('apm/apm.css','utf8'), apmJs=fs.readFileSync('apm/apm.js','utf8');
const adminHtml=fs.readFileSync('admin/admin.html','utf8'), adminCss=fs.readFileSync('admin/admin.css','utf8'), adminJs=fs.readFileSync('admin/admin.js','utf8');
// Static template the admin panel can re-encrypt with a new password. "ombor" is embedded as plain
// data (its host account already effectively has this content, as a subset of its own bundle).
// The host's OWN template is taken live from window.__currentPayload at change-password time, so
// self-service password changes keep working after repeated changes.
const templatesScript=`(function(){window.__accountTemplates=window.__accountTemplates||{};window.__accountTemplates.ombor=${JSON.stringify(monPayload)};})();`;
function selfRoleScript(role){return `window.__selfRole='${role}';`}
function tabScriptFor(views){ // views: [{id,btn:'tab-x',get:'v-x',hash:'#x',render:'window.__xRender'}]
  const V=views.map(v=>`${v.id}:document.getElementById('${v.get}')`).join(',');
  const H=views.map(v=>`${v.id}:'${v.hash}'`).join(',');
  const renderCalls=views.map(v=>`if(v==='${v.id}')${v.render}&&${v.render}();`).join('else ');
  return `(function(){
  var V={${V}};
  var H={${H}};
  function show(v){
    Object.keys(V).forEach(function(k){V[k].hidden=k!==v;document.getElementById('tab-'+k).setAttribute('aria-selected',k===v)});
    ${renderCalls}
    try{history.replaceState(null,'',H[v])}catch(e){}
  }
  document.getElementById('tabs').addEventListener('click',function(e){var v=e.target.dataset&&e.target.dataset.v; if(v)show(v);});
  var h=location.hash; show(${views.map(v=>`h==='${v.hash}'?'${v.id}'`).join(':')}:'mon');
})();`}
const VIEW={mon:{id:'mon',get:'v-mon',hash:'#monitor',render:'window.__monRender'},dash:{id:'dash',get:'v-dash',hash:'#tahlil',render:'window.__dashRender'},apm:{id:'apm',get:'v-apm',hash:'#apm',render:'window.__apmRender'},admin:{id:'admin',get:'v-admin',hash:'#admin',render:'window.__adminRender'}};
function withTab(markupBase,btnHtml,contentHtml,afterMarker){
  afterMarker=afterMarker||'<button role="tab" id="tab-dash" aria-selected="false" data-v="dash">Tahlil paneli</button>';
  let m=markupBase.replace(afterMarker,afterMarker+'\n  '+btnHtml);
  m=m.replace('<div class="tip" id="tip"></div>',contentHtml+'\n<div class="tip" id="tip"></div>');
  return m;
}

// ---- apm account: mon + dash + apm only ----
let apmMarkup=withTab(markup,'<button role="tab" id="tab-apm" aria-selected="false" data-v="apm">APM: reja va fakt</button>',apmHtml);
if(!apmMarkup.includes('id="tab-apm"')||!apmMarkup.includes('id="v-apm"'))throw new Error('apm markup injection failed');
const apmScripts=[scripts[0],scripts[1],scripts[3],apmJs,tabScriptFor([VIEW.mon,VIEW.dash,VIEW.apm])];
const apmPayload={css:css+'\n'+apmCss,html:apmMarkup,scripts:apmScripts,chart:chartUrl};

// ---- admin account: mon + dash + apm + admin panel (everything) ----
let adminMarkup=withTab(markup,'<button role="tab" id="tab-apm" aria-selected="false" data-v="apm">APM: reja va fakt</button>',apmHtml);
adminMarkup=withTab(adminMarkup,'<button role="tab" id="tab-admin" aria-selected="false" data-v="admin">Admin panel</button>',adminHtml,'<button role="tab" id="tab-apm" aria-selected="false" data-v="apm">APM: reja va fakt</button>');
if(!adminMarkup.includes('id="tab-apm"')||!adminMarkup.includes('id="v-apm"')||!adminMarkup.includes('id="tab-admin"')||!adminMarkup.includes('id="v-admin"'))throw new Error('admin markup injection failed');
const adminScripts=[scripts[0],scripts[1],scripts[3],templatesScript,selfRoleScript('admin'),apmJs,adminJs,tabScriptFor([VIEW.mon,VIEW.dash,VIEW.apm,VIEW.admin])];
const adminPayload={css:css+'\n'+apmCss+'\n'+adminCss,html:adminMarkup,scripts:adminScripts,chart:chartUrl};

const B={ombor:enc(monPayload,pw.ombor),admin:enc(adminPayload,pw.admin),apm:enc(apmPayload,pw.apm)};
const out=`${head}<style>
[hidden]{display:none!important}
*{box-sizing:border-box}
body{background:#fff;color:#14171c;font-family:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;margin:0}
#login{min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px 16px}
#login form{width:100%;max-width:340px;display:flex;flex-direction:column;gap:14px}
#login h1{font-size:22px;font-weight:600;margin:0;letter-spacing:-.01em}
#login p{margin:0;color:#5b6470;font-size:13.5px}
#login label{display:flex;flex-direction:column;gap:5px;font-size:13px;color:#5b6470}
#login input[type=text],#login input[type=password]{font:inherit;font-size:16px;color:#14171c;background:#f6f7f9;border:1px solid #d5d9df;border-radius:6px;padding:10px 12px;width:100%}
#login input:focus-visible,#login button:focus-visible{outline:2px solid #2a78d6;outline-offset:2px}
#login .rm{flex-direction:row;align-items:center;gap:8px;color:#14171c}
#login button{font:inherit;font-weight:600;font-size:15px;color:#fff;background:#2a78d6;border:0;border-radius:6px;padding:11px;cursor:pointer}
#login button[disabled]{opacity:.6;cursor:default}
#err{color:#c9302f;font-size:13px;min-height:18px}
#out{position:fixed;top:3px;right:10px;z-index:20;font:inherit;font-size:12px;color:#5b6470;background:#fff;border:1px solid #d5d9df;border-radius:4px;padding:2px 10px;cursor:pointer}
#out:focus-visible{outline:2px solid #2a78d6}
</style>
<div id="login">
  <form id="f" autocomplete="on">
    <div><h1>Quyish sexi paneli</h1><p>Davom etish uchun login va parolni kiriting.</p></div>
    <label>Login<input id="u" type="text" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" required></label>
    <label>Parol<input id="p" type="password" name="password" autocomplete="current-password" autocapitalize="none" autocorrect="off" spellcheck="false" required></label>
    <label class="rm"><input id="sp" type="checkbox">Parolni ko\'rsatish</label>
    <label class="rm"><input id="rm" type="checkbox" checked>Bu qurilmada eslab qol</label>
    <div id="err" role="alert"></div>
    <button id="go" type="submit">Kirish</button>
  </form>
</div>
<div id="app" hidden></div>
<button id="out" hidden>Chiqish</button>
<script>
(function(){
var B=${JSON.stringify(B)};
var ITER=250000, LS='qsp_session';
var $=function(i){return document.getElementById(i)};
function b64(s){var b=atob(s),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
function tob64(buf){var a=new Uint8Array(buf),s='';for(var i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s)}
async function derive(pw,salt){
  var k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt:b64(salt),iterations:ITER,hash:'SHA-256'},k,{name:'AES-GCM',length:256},true,['decrypt']);
}
async function unlock(user,key){
  var d=B[user]; if(!d)throw new Error('user');
  return unlockBlob(d,key);
}
async function unlockBlob(d,key){
  var bytes=b64(d.blob);
  var plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},key,bytes.slice(12));
  return JSON.parse(new TextDecoder().decode(plain));
}
async function dbOverride(user){
  try{
    if(!window.claude||!window.claude.use)return null;
    var db=await window.claude.use('db'); if(!db)return null;
    var doc=await db.doc('accounts/'+user).get();
    if(doc&&doc.salt&&doc.blob)return doc;
  }catch(x){}
  return null;
}
function loadScript(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
async function show(payload){
  window.__currentPayload=payload;
  var st=document.createElement('style');st.textContent=payload.css;document.head.appendChild(st);
  $('login').hidden=true;
  var app=$('app');app.innerHTML=payload.html;app.hidden=false;$('out').hidden=false;
  if(payload.chart){try{await loadScript(payload.chart)}catch(x){}}
  payload.scripts.forEach(function(code){var s=document.createElement('script');s.textContent=code;document.body.appendChild(s)});
}
function forget(){try{localStorage.removeItem(LS)}catch(e){}}
$('sp').addEventListener('change',function(){$('p').type=$('sp').checked?'text':'password'});
$('out').addEventListener('click',function(){forget();location.reload()});
$('f').addEventListener('submit',async function(e){
  e.preventDefault(); var err=$('err'),go=$('go'); err.textContent=''; go.disabled=true;
  var user=$('u').value.trim().toLowerCase(), pw=$('p').value.trim().toLowerCase();
  if(!window.crypto||!crypto.subtle){err.textContent='Bu brauzer shifrlashni qo\\'llamaydi. Boshqa brauzerda oching.';go.disabled=false;return}
  if(!B[user]){err.textContent='Login yoki parol noto\\'g\\'ri. Parolni chiziqchalar bilan to\\'liq kiriting.';go.disabled=false;$('p').focus();return}
  var candidates=[]; var ov=await dbOverride(user); if(ov)candidates.push(ov); candidates.push(B[user]);
  var key=null,payload=null;
  for(var i=0;i<candidates.length;i++){
    try{ key=await derive(pw,candidates[i].salt); payload=await unlockBlob(candidates[i],key); break; }catch(x){ key=null;payload=null; }
  }
  if(!payload){err.textContent='Login yoki parol noto\\'g\\'ri. Parolni chiziqchalar bilan to\\'liq kiriting.';go.disabled=false;$('p').focus();return}
  if($('rm').checked){try{var raw=await crypto.subtle.exportKey('raw',key);localStorage.setItem(LS,JSON.stringify({u:user,k:tob64(raw)}))}catch(x){}}
  await show(payload);
});
(async function(){
  try{
    var s=JSON.parse(localStorage.getItem(LS)||'null'); if(!s||!B[s.u])return;
    var key=await crypto.subtle.importKey('raw',b64(s.k),'AES-GCM',false,['decrypt']);
    await show(await unlock(s.u,key));
  }catch(x){forget()}
})();
})();
</script>
`;
fs.writeFileSync('quyish-login.html',out);
fs.writeFileSync('/tmp/claude-0/creds.json',JSON.stringify(pw));
console.log(pw,out.length);
