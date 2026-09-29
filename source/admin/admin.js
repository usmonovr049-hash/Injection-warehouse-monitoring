(function(){
var $=function(id){return document.getElementById(id)};
function b64(buf){var a=new Uint8Array(buf),s='';for(var i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s)}
async function deriveEncKey(pw,saltBytes){
  var k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt:saltBytes,iterations:250000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt']);
}
async function encryptPayload(obj,password){
  var salt=crypto.getRandomValues(new Uint8Array(16));
  var key=await deriveEncKey(password,salt);
  var iv=crypto.getRandomValues(new Uint8Array(12));
  var ct=await crypto.subtle.encrypt({name:'AES-GCM',iv:iv},key,new TextEncoder().encode(JSON.stringify(obj)));
  var blob=new Uint8Array(iv.length+ct.byteLength); blob.set(iv,0); blob.set(new Uint8Array(ct),iv.length);
  return {salt:b64(salt.buffer),blob:b64(blob.buffer)};
}

var SELF=window.__selfRole||'admin';
var OTHER=SELF==='admin'?'apm':'admin';
var INFO={
  ombor:{label:'Ombor',desc:'Faqat Ombor monitorini ko\'radi.'},
  admin:{label:'Admin',desc:'Ombor monitori, Tahlil paneli va Admin panelni ko\'radi.'},
  apm:{label:'APM',desc:'Ombor monitori, Tahlil paneli, APM va Admin panelni ko\'radi.'}
};
var ROLES=[
  Object.assign({id:'ombor',editable:true},INFO.ombor),
  Object.assign({id:SELF,editable:true,self:true},INFO[SELF]),
  Object.assign({id:OTHER,editable:false},INFO[OTHER])
];

function cardHtml(r){
  var self=r.self?' (siz)':'';
  if(!r.editable){
    return '<div class="fc r-'+r.id+'"><div class="role"><b>'+r.label+'</b><span class="r-'+r.id+'">login: '+r.id+'</span></div><p>'+r.desc+'</p><p class="note">Parolni Claude orqali o\'zgartiring.</p></div>';
  }
  return '<div class="fc r-'+r.id+'" data-role="'+r.id+'"><div class="role"><b>'+r.label+self+'</b><span class="r-'+r.id+'">login: '+r.id+'</span></div><p>'+r.desc+'</p>'
   +'<div class="row2"><input type="password" class="np" placeholder="Yangi parol (kamida 6 belgi)" autocomplete="new-password"></div>'
   +'<div class="row2"><input type="password" class="np2" placeholder="Parolni takrorlang" autocomplete="new-password"></div>'
   +'<button type="button" class="save">Saqlash</button><div class="msg"></div></div>';
}

function render(){
  var list=$('adm-acclist'); if(!list)return;
  list.innerHTML=ROLES.map(cardHtml).join('');
  var note=$('adm-accnote');
  if(note)note.textContent='Eslatma: '+INFO[OTHER].label+' hisobining paroli bu yerdan o\'zgartirilmaydi (uning tarkibi '+INFO[SELF].label+' hisobiga ko\'rinmaydi, xavfsizlik uchun) — buni Claude orqali so\'rang.';
  list.querySelectorAll('.fc[data-role] .save').forEach(function(btn){
    btn.addEventListener('click',async function(){
      var card=btn.closest('.fc'), role=card.dataset.role;
      var p1=card.querySelector('.np').value, p2=card.querySelector('.np2').value;
      var msg=card.querySelector('.msg'); msg.className='msg';
      if(p1.length<6){msg.className='msg err';msg.textContent='Parol kamida 6 belgi bo\'lsin.';return}
      if(p1!==p2){msg.className='msg err';msg.textContent='Parollar mos emas.';return}
      var tpl = role===SELF ? window.__currentPayload : (window.__accountTemplates&&window.__accountTemplates[role]);
      if(!tpl){msg.className='msg err';msg.textContent='Ichki xato: shablon topilmadi.';return}
      btn.disabled=true; msg.className='msg'; msg.textContent='Saqlanmoqda...';
      try{
        var enc=await encryptPayload(tpl,p1.trim().toLowerCase());
        var db=null; try{db=await claude.use('db')}catch(e){}
        if(!db)throw new Error('no_db');
        await db.doc('accounts/'+role).set({salt:enc.salt,blob:enc.blob,updatedAt:Date.now()});
        msg.className='msg ok'; msg.textContent='Saqlandi. Yangi login parol: '+p1;
        card.querySelector('.np').value=''; card.querySelector('.np2').value='';
      }catch(x){
        msg.className='msg err';
        msg.textContent = x&&x.message==='no_db'
          ? 'Saqlash imkoni yo\'q: bu ko\'rinishda ma\'lumot bazasiga yozish ruxsati yo\'q. Claude orqali so\'rang.'
          : 'Xatolik yuz berdi, qayta urinib ko\'ring.';
      }
      btn.disabled=false;
    });
  });
}
render();
window.__adminRender=render;
})();
