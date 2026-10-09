(function(){
var $=function(i){return document.getElementById(i)};
var fmt=function(n){return Math.round(n).toLocaleString('en-US').replace(/,/g,' ')};
var css=function(n){return getComputedStyle(document.getElementById('v-apm')).getPropertyValue(n).trim()};

// Oylar bo'yicha APM ma'lumoti. Manba: "Zaxira Yetish Tahlili (IMM Grafik)" jadvali
// ("Fakt", "Fact smena", "Berilgan_Plan", "IMM_Yuklama", "IMM_Fact" varaqlari).
// Bu blokni source/rebuild_apm.py har kuni yangilaydi: joriy oy elementi yangilanadi, oy almashganda
// eskisi frozen:true bo'lib qoladi va yangi oy qo'shiladi. Qo'lda tahrirlamang.
// APM_DATA_START
var APM_MONTHS=[
{"id":"2026-09","label":"Sentabr","short":"sen","asOf":"30.09.2026","frozen":true,"days":29,"s1":[0,13759,12460,11654,18755,11612,13785,13028,14133,16650,14796,10577,0,17363,19062,23548,11820,13494,17815,11937,13924,14014,13499,28834,17154,13048,0,11205,4704],"s2":[0,8808,9513,11450,9317,0,8729,9667,11333,13260,18705,8980,0,15549,23550,14346,11357,5764,15115,0,7574,7769,12328,11716,12454,8597,0,8082,0],"fakt":null,"plan":null,"imm":{}},
{"id":"2026-10","label":"Oktabr","short":"okt","asOf":"09.10.2026","frozen":false,"days":8,"s1":[0,7112,0,0,7700,5464,15250,13929],"s2":[0,8200,0,0,5700,4810,8675,10283],"fakt":[0,15312,0,0,13400,10274,23925,24212],"plan":[null,null,null,null,null,null,18640,28142],"imm":{"8":{"№01-650T":{"plan":22.0,"fact":0,"parts":"52021395 PANEL ASM-BODY L/PLR UPR — 1320","hours":"rrrrbrrrrrrrrrrrbrrrrrrr","hq":[60,60,60,60,0,60,60,60,60,60,60,60,60,60,60,60,0,60,60,60,60,60,60,60]},"№02-650T":{"plan":26.0,"fact":0,"parts":"B6224661 4661/62 C PILLAR BLACK L — 2640","hours":"rrrrbrrrrrrrrrrrbrrrrrrr","hq":[103,103,103,103,0,103,103,103,103,103,103,103,103,103,103,103,0,103,103,103,103,103,103,103]},"№03-650T":{"plan":24.0,"fact":0,"parts":"26305045 5045/47 COVER-FRT FOG LP — 900; 26305043 5043/44 COVER-FRT FOG LP — 360","hours":"rrrrbrrrrrrrrrrrbpsrrrrr","hq":[58,58,58,58,0,58,58,58,58,58,58,58,58,58,58,58,0,30,0,58,58,58,58,58]},"№04-450T":{"plan":24.0,"fact":0,"parts":"52024228 PANEL ASM-CTR PLR LWR TR — 1320","hours":"rrrrbrrrrrrrrrrrbrrrrrrr","hq":[55,55,55,55,0,55,55,55,55,55,55,55,55,55,55,55,0,55,55,55,55,55,55,55]},"№05-450T":{"plan":22.0,"fact":0,"parts":"UZK04019 GASKET ASM-O/S RR VIEW M — 1320","hours":"rrrrbrrrrrrrrrrrbrrrrrrr","hq":[60,60,60,60,0,60,60,60,60,60,60,60,60,60,60,60,0,60,60,60,60,60,60,60]},"№06-450T":{"plan":39.0,"fact":0,"parts":"52027905 7905 GRILLE RAD UPPER (L — 240; 52164052 4052 DUCT ASM-AIR DISTR  — 2040","hours":"rrrrbsrrrrrrrrrrbrrrrrrr","hq":[60,60,60,60,0,0,60,60,60,60,60,60,60,60,60,60,0,60,60,60,60,60,60,60]},"№07-250T":{"plan":23.0,"fact":0,"parts":"52016400 6400 TRAY ASM-I/P STOW — 660; B52016400 6400 TRAY ASM-I/P STOW — 660","hours":"rrrrbrrrrrrrsrrrbrrrrrrr","hq":[60,60,60,60,0,60,60,60,60,60,60,60,0,60,60,60,0,60,60,60,60,60,60,60]},"№08-250T":{"plan":22.0,"fact":0,"parts":"UZK04015 GLASS HOLDER LH\\RH BCAR  — 1320","hours":"rrrrbrrrrrrrrrrrbrrrrrrr","hq":[60,60,60,60,0,60,60,60,60,60,60,60,60,60,60,60,0,60,60,60,60,60,60,60]},"№09-250T":{"plan":19.0,"fact":0,"parts":"26249119 9119/20 TIRE DEFLECTOR L — 2640","hours":"rrrrbrrrrrrrrrrrbrrrpiii","hq":[144,144,144,144,0,144,144,144,144,144,144,144,144,144,144,144,0,144,144,144,48,0,0,0]},"№10-250T":{"plan":21.0,"fact":0,"parts":"avc43471\n(94758905) 3471 COVER-CHILD ST RST  — 720; 26244139 CAP-RR S/D I/S HDL BOLT — 2450","hours":"rrrrbsrrrrrrrrrrbrrrrrpi","hq":[180,180,180,180,0,0,160,160,160,160,160,160,160,160,160,160,0,160,160,160,160,160,50,0]}}}}
];
// APM_DATA_END

var MACH=[['№01-650T',650],['№02-650T',650],['№03-650T',650],['№04-450T',450],['№05-450T',450],['№06-450T',450],['№07-250T',250],['№08-250T',250],['№09-250T',250],['№10-250T',250]];
var CAP=22;
var WD=['yak','dush','sesh','chor','pay','jum','shan'];
var sum=function(a){return a.reduce(function(x,y){return x+(y||0)},0)};
var pad=function(n){return (n<10?'0':'')+n};

var mi=APM_MONTHS.length-1, M, DAYS, S1, S2, TOT, PLAN, N, immFilter='';
function wd(d){var y=+M.id.slice(0,4),m=+M.id.slice(5,7);return WD[new Date(y,m-1,d).getDay()]}
function ds(d){return pad(d)+'.'+M.id.slice(5,7)}
function dlabel(d){return ds(d)+'.'+M.id.slice(0,4)+' ('+wd(d)+')'}
function hasPlan(i){return PLAN&&PLAN[i]!=null&&PLAN[i]>0}
function loadMonth(i){
  mi=i; M=APM_MONTHS[i]; N=M.days;
  DAYS=[];for(var d=1;d<=N;d++)DAYS.push(d);
  S1=DAYS.map(function(d){return (M.s1&&M.s1[d-1])||0}); S2=DAYS.map(function(d){return (M.s2&&M.s2[d-1])||0});
  TOT=DAYS.map(function(d,k){var f=M.fakt&&M.fakt[k]; return f!=null?f:S1[k]+S2[k]});
  PLAN=M.plan?DAYS.map(function(d,k){var p=M.plan[k];return p==null?null:p}):null;
  [].forEach.call(document.querySelectorAll('#v-apm .apm-range'),function(e){e.textContent='1-'+N+' '+M.label.toLowerCase()});
  $('apm-stamp').textContent='Manba: "Zaxira Yetish Tahlili (IMM Grafik)", '+M.asOf+(M.frozen?' (arxiv)':'');
}

// ---- oy va kun tanlash ----
var msel=$('apm-month'), sel=$('apm-day');
msel.innerHTML=APM_MONTHS.map(function(m,i){return '<option value="'+i+'">'+m.label+' '+m.id.slice(0,4)+(m.frozen?' (yakunlangan)':' (joriy)')+'</option>'}).reverse().join('');
function fillDays(){
  sel.innerHTML=DAYS.map(function(d){return '<option value="'+d+'">'+dlabel(d)+'</option>'}).join('');
  var def=N; while(def>1&&!(TOT[def-1]>0))def--; sel.value=def;
}

function renderDay(){
  var d=+sel.value,i=d-1,t=TOT[i];
  $('apm-daylabel').textContent=dlabel(d);
  var work=TOT.filter(function(v){return v>0}), avg=work.length?sum(work)/work.length:0;
  var pct=avg?Math.round((t/avg-1)*100):0;
  var cmp=t>0?('Kunlik o\'rtacha '+fmt(avg)+' dona; bu kun '+(pct>=0?pct+'% ko\'p':Math.abs(pct)+'% kam'))+(S1[i]>0&&S2[i]===0?'. Hozircha faqat 1-smena kiritilgan':''):'Bu kuni ishlab chiqarilmagan';
  var plan=hasPlan(i)?PLAN[i]:null;
  $('apm-kpis').innerHTML=[
    ['Fakt (butun sex, 2 smena)',fmt(t),'dona. '+cmp,''],
    ['1-smena fakt',fmt(S1[i]),'dona',''],
    ['2-smena fakt',fmt(S2[i]),'dona',''],
    plan!=null?['Reja (Berilgan_Plan)',fmt(plan),'dona · bajarilish '+Math.round(t/plan*100)+'%',t>=plan?'':'']:['Reja','kiritilmagan','bu kun uchun reja yo\'q','na']
  ].map(function(k){return '<div class="kpi"><span>'+k[0]+'</span><b class="'+k[3]+'">'+k[1]+'</b><small>'+k[2]+'</small></div>'}).join('');
  $('apm-prev').disabled=d<=1&&mi===0;$('apm-next').disabled=d>=N&&mi===APM_MONTHS.length-1;
  renderImmTables();
}
function step(k){
  var d=+sel.value+k;
  if(d<1){ if(mi>0){msel.value=mi-1;changeMonth(); sel.value=N; renderDay();} return; }
  if(d>N){ if(mi<APM_MONTHS.length-1){msel.value=mi+1;changeMonth(); sel.value=1; renderDay();} return; }
  sel.value=d; renderDay();
}
sel.addEventListener('change',renderDay);
$('apm-prev').addEventListener('click',function(){step(-1)});
$('apm-next').addEventListener('click',function(){step(1)});

// ---- oylik jadval, smena kartalari, izohlar ----
function renderMonth(){
  var total=sum(TOT), s1=sum(S1), s2=sum(S2), ptot=PLAN?sum(PLAN.map(function(p){return p||0})):0;
  var h='<thead><tr><th>Sana</th><th>Kun</th><th class="n">Reja</th><th class="n">Fakt</th><th class="n">Farq</th><th class="n">Bajarilish</th></tr></thead><tbody>';
  DAYS.forEach(function(d,i){
    var p=hasPlan(i)?PLAN[i]:null;
    h+='<tr><td>'+ds(d)+'</td><td>'+wd(d)+'</td>'+(p!=null?'<td class="n">'+fmt(p)+'</td>':'<td class="n na">kiritilmagan</td>')+'<td class="n">'+fmt(TOT[i])+'</td>'+
      (p!=null?'<td class="n">'+(TOT[i]-p>=0?'+':'')+fmt(TOT[i]-p)+'</td><td class="n">'+Math.round(TOT[i]/p*100)+'%</td>':'<td class="n na">-</td><td class="n na">-</td>')+'</tr>';
  });
  var pDays=DAYS.filter(function(d,i){return hasPlan(i)}), fOnP=sum(pDays.map(function(d){return TOT[d-1]}));
  $('apm-dtbl').innerHTML=h+'</tbody><tfoot><tr><td>Jami</td><td></td><td class="n'+(ptot?'':' na')+'">'+(ptot?fmt(ptot):'-')+'</td><td class="n">'+fmt(total)+'</td><td class="n na">-</td><td class="n'+(ptot?'':' na')+'">'+(ptot?Math.round(fOnP/ptot*100)+'%':'-')+'</td></tr></tfoot>';
  $('apm-sfind').innerHTML=[
   ['1-smena fakt',fmt(s1),total?Math.round(s1/total*100)+'% umumiy faktdan':''],
   ['2-smena fakt',fmt(s2),total?Math.round(s2/total*100)+'% umumiy faktdan':''],
   ['Oy rejasi (kiritilgan kunlar)',ptot?fmt(ptot):'kiritilmagan',ptot?(pDays.length+' kun uchun reja, bajarilish '+Math.round(fOnP/ptot*100)+'%'):'Berilgan_Plan bo\'sh']
  ].map(function(f){return '<div class="fc"><span>'+f[0]+'</span><div class="big"'+(f[1]==='kiritilmagan'?' style="font-size:18px;color:var(--muted);line-height:1.9"':'')+'>'+f[1]+'</div><p>'+f[2]+'</p></div>'}).join('');
  if($('apm-cum-total'))$('apm-cum-total').textContent=fmt(total);

  var work=TOT.filter(function(v){return v>0}), best=Math.max.apply(null,TOT.concat([0])), bestD=TOT.indexOf(best)+1;
  var noS2=DAYS.filter(function(d,i){return S1[i]>0&&!S2[i]}).map(ds), zero=DAYS.filter(function(d,i){return !TOT[i]}).map(ds);
  var immDays=Object.keys(M.imm||{}).sort();
  var notes=[];
  if(!ptot)notes.push('Reja ma\'lumoti yo\'q: "Berilgan_Plan" varag\'ida '+M.label.toLowerCase()+' uchun reja kiritilmagan, bajarilish % hisoblanmaydi.');
  else notes.push('Reja '+pDays.length+' kun uchun kiritilgan ('+pDays.map(ds).join(', ')+'): jami '+fmt(ptot)+' dona, shu kunlardagi fakt '+fmt(fOnP)+' dona ('+Math.round(fOnP/ptot*100)+'%).');
  if(work.length)notes.push('Eng yuqori kunlik fakt: '+ds(bestD)+' ('+fmt(best)+' dona). Kunlik o\'rtacha: '+fmt(sum(work)/work.length)+' dona ('+work.length+' ish kuni).');
  if(total)notes.push('1-smena ulushi '+Math.round(s1/total*100)+'%, 2-smena '+Math.round(s2/total*100)+'%.'+(noS2.length?' Faqat 1-smena fakti bor kunlar: '+noS2.join(', ')+'.':''));
  if(zero.length)notes.push('Fakt yozilmagan kunlar: '+zero.join(', ')+'.');
  notes.push(immDays.length?('IMM yuklamasi (IMM_Yuklama/IMM_Fact) saqlangan kunlar: '+immDays.map(function(k){return ds(+k)}).join(', ')+'. Boshqa kunlar uchun jadvalda IMM tarixi saqlanmaydi.'):'IMM yuklamasi bu oy uchun saqlanmagan.');
  notes.push('Fakt "Fakt" varag\'idan, smenalar "Fact smena" varag\'idan, reja "Berilgan_Plan" varag\'idan olinadi. Holat: '+M.asOf+(M.frozen?' (oy yakunlangan, arxiv)':'')+'.');
  $('apm-nl').innerHTML=notes.map(function(n){return '<li>'+n+'</li>'}).join('');
  $('apm-alert').hidden=!!ptot;
  if(!ptot)$('apm-alert').innerHTML='<b>Reja kiritilmagan.</b> "Berilgan_Plan" varag\'ida '+M.label.toLowerCase()+' uchun reja yo\'q, shuning uchun reja ustunlari "kiritilmagan" deb ko\'rsatilgan. Fakt "Fakt" va "Fact smena" varaqlaridan olingan.';
}

// ---- IMM jadvali (tanlangan kun uchun saqlangan bo'lsa) ----
var immSel=$('apm-f-imm');
MACH.forEach(function(m){var o=document.createElement('option');o.value=m[0];o.textContent=m[0];immSel.appendChild(o)});
function renderImmTables(filterImm){
  if(filterImm!==undefined)immFilter=filterImm;
  var d=+sel.value, snap=(M.imm||{})[String(d)], list=MACH.filter(function(m){return !immFilter||m[0]===immFilter});
  var t='<thead><tr><th>IMM</th><th class="n">Tonnaj</th><th class="n">Mavjud soat</th><th class="n">Reja soat</th><th class="n">Reja yuklama</th><th class="n">Fakt soat</th><th>Reja detallari</th><th>Holat</th></tr></thead><tbody>';
  var tp=0,tf=0;
  list.forEach(function(m){
    var r=snap&&snap[m[0]];
    if(r){ tp+=r.plan||0; tf+=r.fact||0;
      var pct=Math.round((r.plan||0)/CAP*100), st=!r.plan?'reja yo\'q':pct>100?'Ortiqcha yuklama':'OK';
      t+='<tr><td>'+m[0]+'</td><td class="n">'+m[1]+'</td><td class="n">'+CAP+'</td><td class="n">'+(r.plan||0)+'</td><td class="n">'+pct+'%</td><td class="n">'+(r.fact||0)+'</td><td style="white-space:normal;min-width:260px">'+(r.parts||'—').split('; ').join('<br>')+'</td><td style="white-space:nowrap'+(pct>100?';color:var(--crit,#c9302f);font-weight:600':'')+'"'+'>'+st+'</td></tr>';
    } else t+='<tr><td>'+m[0]+'</td><td class="n">'+m[1]+'</td><td class="n">'+CAP+'</td><td class="n na">-</td><td class="n na">-</td><td class="n na">-</td><td class="na">—</td><td class="na">ma\'lumot yo\'q</td></tr>';
  });
  $('apm-imm').innerHTML=t+'</tbody><tfoot><tr><td>Jami</td><td></td><td class="n">'+CAP*list.length+'</td><td class="n">'+(snap?tp:'-')+'</td><td class="n">'+(snap?Math.round(tp/(CAP*list.length)*100)+'%':'-')+'</td><td class="n">'+(snap?tf:'-')+'</td><td></td><td></td></tr></tfoot>';
  $('apm-imm-sub').textContent=snap?(dlabel(d)+' uchun (IMM_Yuklama va IMM_Taqsimot varaqlari)'):(dlabel(d)+' uchun IMM yuklamasi saqlanmagan');
  var hasH=snap&&Object.keys(snap).some(function(k){return snap[k].hours});
  var hn=$('apm-hm-note'); if(hn)hn.textContent=hasH?('Reja grafigi (IMM_Grafik varag\'i), '+dlabel(d)+'. Katakka kursorni olib borsangiz, shu soatda reja bo\'yicha necha dona quyilishi ko\'rinadi. Bu haqiqiy ish holati emas — reja.'):(dlabel(d)+' uchun soatlik grafik saqlanmagan (IMM_Grafik har kuni yangi sana bilan ustidan yoziladi, shuning uchun faqat panel yangilangan kunlar saqlanadi).');
  var hs2=$('apm-hm-sub'); if(hs2)hs2.textContent='Soatlar bo\'yicha reja grafigi, '+dlabel(d)+': 08:00 dan 07:00 gacha';
  $('apm-imm-note').textContent=(immFilter?'Ko\'rsatilmoqda: '+immFilter+'. ':'')+'Mavjud soat har bir IMM uchun kuniga 22 soat. Fakt soat "IMM_Fact" varag\'idan (kiritilmagan bo\'lsa 0).';
  if(window.__apmMap)window.__apmMap();
}
immSel.addEventListener('change',function(){renderImmTables(immSel.value)});
document.addEventListener('click',function(e){
  if(!e.target)return;
  if(e.target.id==='apm-f-apply')renderImmTables(immSel.value);
  else if(e.target.id==='apm-f-clear'){immSel.value='';msel.value=APM_MONTHS.length-1;changeMonth()}
  else if(e.target.id==='apm-filters-toggle'||e.target.id==='apm-filters-caret'){
    var pf=$('apm-filters'); if(!pf)return;
    pf.classList.toggle('collapsed');
    $('apm-filters-caret').textContent=pf.classList.contains('collapsed')?'Ko\'rsatish':'Yashirish';
  }
});

// ---- ish vaqti xaritasi ----
// Soatlik holat kodlari: run (ishlamoqda), part (qisman), stop (to'xtagan), svc (qolip almashtirish / servis). null = ma'lumot yo'q.
var ST={run:['Ishlaydi (to\'liq soat)','var(--run)'],part:['Qisman soat','var(--part)'],svc:['Qolip almashtirish','var(--svc)'],brk:['Tushlik','#f2c46d'],stop:['Ish rejalashtirilmagan','var(--stop)'],none:['Ma\'lumot yo\'q','var(--none)']};
var HCODE={r:'run',p:'part',s:'svc',b:'brk',i:'stop'};
var HRS=[];for(var q=8;q<32;q++)HRS.push(q%24);
function legend(el){el.innerHTML=Object.keys(ST).map(function(k){return '<span><i style="background:'+ST[k][1]+'"></i>'+ST[k][0]+'</span>'}).join('')}
function map(el){
  var h='<div></div>'+HRS.map(function(x){return '<div class="h">'+pad(x)+'</div>'}).join('');
  MACH.filter(function(m){return !immFilter||m[0]===immFilter}).forEach(function(m){
    h+='<div class="m">'+m[0]+'</div>';
    var snap=(M&&M.imm||{})[String(+sel.value)], r=snap&&snap[m[0]], hs=(r&&r.hours)||'', hq=(r&&r.hq)||[];
    HRS.forEach(function(x,i){var s=HCODE[hs[i]]||'none', q=hq[i]?': '+fmt(hq[i])+' dona':'';
      h+='<div class="c" style="background:'+ST[s][1]+'" title="'+m[0]+', '+pad(x)+':00 — '+ST[s][0]+q+(i===0&&r&&r.parts?'\n'+r.parts:'')+'"></div>'});
  });
  el.innerHTML=h;
}
legend($('apm-hleg'));legend($('apm-hleg2'));window.__apmMap=function(){map($('apm-hm'));map($('apm-hm2'))};
$('apm-big').addEventListener('click',function(){$('apm-ov').hidden=false;$('apm-x').focus()});
$('apm-x').addEventListener('click',function(){$('apm-ov').hidden=true});
$('apm-ov').addEventListener('click',function(e){if(e.target===$('apm-ov'))$('apm-ov').hidden=true});
document.addEventListener('keydown',function(e){if(e.key==='Escape')$('apm-ov').hidden=true});

// ---- grafiklar ----
var ch={};
function mk(id,cfg){if(ch[id])ch[id].destroy();ch[id]=new Chart($(id),cfg)}
function draw(){
  if(typeof Chart==='undefined')return;
  var ink=css('--muted'),grid=css('--line'),blue=css('--blue'),or=css('--orange'),dk=css('--ink');
  var labels=DAYS.map(function(d){return d+' '+M.short});
  var base={responsive:true,maintainAspectRatio:false,animation:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return c.dataset.label+': '+(c.parsed.y==null?'—':fmt(c.parsed.y))+' dona'}}}},
    scales:{x:{grid:{display:false},ticks:{color:ink,maxRotation:0,autoSkip:true,font:{size:12}},border:{color:grid}},y:{beginAtZero:true,grid:{color:grid},border:{display:false},ticks:{color:ink,callback:function(v){return fmt(v)},font:{size:12}},title:{display:true,text:'dona',color:ink}}}};
  var ds=[{label:'Fakt',data:TOT,backgroundColor:blue,borderRadius:{topLeft:3,topRight:3},maxBarThickness:22}];
  if(PLAN&&PLAN.some(function(p){return p>0}))ds.unshift({label:'Reja',data:PLAN.map(function(p){return p>0?p:null}),backgroundColor:'rgba(120,130,145,.35)',borderRadius:{topLeft:3,topRight:3},maxBarThickness:22});
  mk('apm-daily',{type:'bar',data:{labels:labels,datasets:ds},options:base});
  mk('apm-shift',{type:'bar',data:{labels:labels,datasets:[{label:'1-smena fakt',data:S1,backgroundColor:blue,borderRadius:{topLeft:3,topRight:3},maxBarThickness:16},{label:'2-smena fakt',data:S2,backgroundColor:or,borderRadius:{topLeft:3,topRight:3},maxBarThickness:16}]},options:base});
  var acc=0,cum=TOT.map(function(v){acc+=v;return acc});
  var cumOpts=Object.assign({},base,{plugins:{legend:{display:false},tooltip:{callbacks:{title:function(c){return c[0].label},label:function(c){var i=c.dataIndex;return ['Oy boshidan jami: '+fmt(c.parsed.y)+' dona','Shu kuni: '+fmt(TOT[i])+' dona']}}}}});
  mk('apm-cum',{type:'line',data:{labels:labels,datasets:[{label:'Yig\'ma fakt',data:cum,borderColor:dk,backgroundColor:'rgba(42,120,214,.10)',fill:true,borderWidth:2.5,pointRadius:3,tension:0}]},options:cumOpts});
}
function changeMonth(){ loadMonth(+msel.value); fillDays(); renderMonth(); renderDay(); setTimeout(draw,30); }
msel.addEventListener('change',changeMonth);
msel.value=mi; changeMonth();
window.__apmRender=draw;
window.__apmExport=function(){return {month:M.label,days:DAYS.map(function(d,i){return {sana:ds(d),reja:hasPlan(i)?PLAN[i]:null,fakt:TOT[i],s1:S1[i],s2:S2[i]}})}};

(function(){
  var H=document.documentElement, btn=$('apm-full'); if(!btn)return;
  function setFs(on){
    H.classList.toggle('apm-fs',on);
    btn.setAttribute('aria-pressed',on); btn.innerHTML=on?'&#x2715; Chiqish':'&#x26F6; To\'liq ekran'; btn.title=on?'To\'liq ekrandan chiqish (Esc)':'';
    try{
      if(on&&!document.fullscreenElement&&H.requestFullscreen){var p=H.requestFullscreen(); if(p&&p.catch)p.catch(function(){})}
      if(!on&&document.fullscreenElement&&document.exitFullscreen){var q=document.exitFullscreen(); if(q&&q.catch)q.catch(function(){})}
    }catch(e){}
    try{localStorage.setItem('apm_fs',on?'1':'0')}catch(e){}
    setTimeout(draw,60);
  }
  btn.addEventListener('click',function(){setFs(!H.classList.contains('apm-fs'))});
  document.addEventListener('fullscreenchange',function(){ if(!document.fullscreenElement&&H.classList.contains('apm-fs'))setFs(false) });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&H.classList.contains('apm-fs')&&$('apm-ov').hidden)setFs(false) });
  try{if(localStorage.getItem('apm_fs')==='1')setTimeout(function(){ if(!$('v-apm').hidden)setFs(true) },0)}catch(e){}
})();
$('apm-mon').addEventListener('toggle',function(){if($('apm-mon').open)setTimeout(draw,30)});
})();
