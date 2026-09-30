(function(){
var $=function(i){return document.getElementById(i)};
var fmt=function(n){return Math.round(n).toLocaleString('en-US').replace(/,/g,' ')};
var css=function(n){return getComputedStyle(document.getElementById('v-apm')).getPropertyValue(n).trim()};
var DAYS=[];for(var i=1;i<=24;i++)DAYS.push(i);
var S1=[0,13759,12460,11654,18755,11612,13785,13028,14133,16650,14796,10577,0,17363,19062,23548,11820,13494,17815,11937,13924,14014,13499,28334];
var S2=[0,8808,9513,11450,9317,0,8729,9667,11333,13260,18705,8980,0,15549,23550,14346,11357,5764,15115,0,7574,7769,12328,11716];
var TOT=S1.map(function(v,i){return v+S2[i]});
var WD=['yak','dush','sesh','chor','pay','jum','shan']; // 2026-09-01 is Tuesday
function wd(d){return WD[(d-1+2)%7]}
var MACH=[['№01-650T',650],['№02-650T',650],['№03-650T',650],['№04-450T',450],['№05-450T',450],['№06-450T',450],['№07-250T',250],['№08-250T',250],['№09-250T',250],['№10-250T',250]];
var CAP=22;
var sum=function(a){return a.reduce(function(x,y){return x+y},0)};
var total=sum(TOT), work=TOT.filter(function(v){return v>0}).length, s1=sum(S1), s2=sum(S2);
var best=Math.max.apply(null,TOT), bestD=TOT.indexOf(best)+1;

$('apm-alert').innerHTML='<b>Reja kiritilmagan.</b> "Berilgan_Plan" varag\'ida 1-30 sentabr uchun reja jami 0 dona, "IMM_Taqsimot", "IMM_Fact" va "IMM_Grafik" varaqlari 25.09.2026 uchun bo\'sh. Shu sababli reja ustunlari "kiritilmagan" deb ko\'rsatilgan, fakt esa "Fakt" va "Fact smena" varaqlaridan olingan.';

function dlabel(d){return (d<10?'0':'')+d+'.09.2026 ('+wd(d)+')'}
var sel=$('apm-day');
DAYS.forEach(function(d){var o=document.createElement('option');o.value=d;o.textContent=dlabel(d);sel.appendChild(o)});
sel.value=24;
var avg=total/work;
function renderDay(){
  var d=+sel.value,i=d-1,t=TOT[i];
  $('apm-daylabel').textContent=dlabel(d);
  var cmp=t>0?(Math.round((t/avg-1)*100)>=0?'+':'')+Math.round((t/avg-1)*100)+'% oylik o\'rtachadan':'Ishlab chiqarilmagan';
  $('apm-kpis').innerHTML=[
    ['Fakt',fmt(t),'dona. '+cmp,''],
    ['1-smena fakt',fmt(S1[i]),'dona',''],
    ['2-smena fakt',fmt(S2[i]),'dona',''],
    ['Reja','kiritilmagan','bajarilish % hisoblanmaydi','na']
  ].map(function(k){return '<div class="kpi"><span>'+k[0]+'</span><b class="'+k[3]+'">'+k[1]+'</b><small>'+k[2]+'</small></div>'}).join('');
  $('apm-prev').disabled=d<=1;$('apm-next').disabled=d>=24;
}
sel.addEventListener('change',renderDay);
$('apm-prev').addEventListener('click',function(){if(+sel.value>1){sel.value=+sel.value-1;renderDay()}});
$('apm-next').addEventListener('click',function(){if(+sel.value<24){sel.value=+sel.value+1;renderDay()}});
renderDay();

// daily table
var h='<thead><tr><th>Sana</th><th>Kun</th><th class="n">Reja</th><th class="n">Fakt</th><th class="n">Farq</th><th class="n">Bajarilish</th></tr></thead><tbody>';
DAYS.forEach(function(d,i){h+='<tr><td>'+(d<10?'0':'')+d+'.09</td><td>'+wd(d)+'</td><td class="n na">kiritilmagan</td><td class="n">'+fmt(TOT[i])+'</td><td class="n na">-</td><td class="n na">-</td></tr>'});
$('apm-dtbl').innerHTML=h+'</tbody><tfoot><tr><td>Jami</td><td></td><td class="n na">-</td><td class="n">'+fmt(total)+'</td><td class="n na">-</td><td class="n na">-</td></tr></tfoot>';

// shift cards
$('apm-sfind').innerHTML=[
 ['1-smena fakt',fmt(s1),Math.round(s1/total*100)+'% umumiy faktdan'],
 ['2-smena fakt',fmt(s2),Math.round(s2/total*100)+'% umumiy faktdan'],
 ['Smena rejasi','kiritilmagan','Smena bo\'yicha bajarilish % hisoblanmaydi']
].map(function(f){return '<div class="fc"><span>'+f[0]+'</span><div class="big"'+(f[1]==='kiritilmagan'?' style="font-size:18px;color:var(--muted);line-height:1.9"':'')+'>'+f[1]+'</div><p>'+f[2]+'</p></div>'}).join('');

// IMM tables (filterable by IMM)
var immSel=$('apm-f-imm');
MACH.forEach(function(m){var o=document.createElement('option');o.value=m[0];o.textContent=m[0];immSel.appendChild(o)});
function renderImmTables(filterImm){
  var list=MACH.filter(function(m){return !filterImm||m[0]===filterImm});
  var t='<thead><tr><th>IMM</th><th class="n">Tonnaj</th><th class="n">Mavjud soat</th><th class="n">Reja soat</th><th class="n">Reja yuklama</th><th class="n">Fakt soat</th><th class="n">Fakt yuklama</th><th>Holat</th></tr></thead><tbody>';
  list.forEach(function(m){t+='<tr><td>'+m[0]+'</td><td class="n">'+m[1]+'</td><td class="n">'+CAP+'</td><td class="n">0.0</td><td class="n">0%</td><td class="n">0.0</td><td class="n">0%</td><td class="na">ma\'lumot yo\'q</td></tr>'});
  $('apm-imm').innerHTML=t+'</tbody><tfoot><tr><td>Jami</td><td></td><td class="n">'+CAP*list.length+'</td><td class="n">0.0</td><td class="n">0%</td><td class="n">0.0</td><td class="n">0%</td><td></td></tr></tfoot>';
  $('apm-imm-note').textContent=filterImm?('Ko\'rsatilmoqda: '+filterImm+'. Mavjud soat har bir IMM uchun kuniga 22 soat.'):'10 ta IMM: 3 ta 650T, 3 ta 450T, 4 ta 250T. Mavjud soat har bir IMM uchun kuniga 22 soat.';
  var p='<thead><tr><th>IMM</th><th class="n">Tonnaj</th><th>Detal</th><th class="n">Ishlab chiqarilgan, dona</th><th>Holat</th></tr></thead><tbody>';
  list.forEach(function(m){p+='<tr><td>'+m[0]+'</td><td class="n">'+m[1]+'</td><td class="na">kiritilmagan</td><td class="n">0</td><td class="na">ma\'lumot yo\'q</td></tr>'});
  $('apm-prod').innerHTML=p+'</tbody><tfoot><tr><td>Jami</td><td></td><td></td><td class="n">0</td><td></td></tr></tfoot>';
}
renderImmTables('');
document.addEventListener('click',function(e){
  if(!e.target)return;
  if(e.target.id==='apm-f-apply')renderImmTables(immSel.value);
  else if(e.target.id==='apm-f-clear'){immSel.value='';renderImmTables('')}
  else if(e.target.id==='apm-filters-toggle'||e.target.id==='apm-filters-caret'){
    var pf=$('apm-filters'); if(!pf)return;
    pf.classList.toggle('collapsed');
    $('apm-filters-caret').textContent=pf.classList.contains('collapsed')?'Ko\'rsatish':'Yashirish';
  }
});

// notes
var lows=[];DAYS.forEach(function(d,i){if(wd(d)==='yak')lows.push((d<10?'0':'')+d+'.09: '+fmt(TOT[i])+' dona')});
var notes=[
 'Reja ma\'lumoti yo\'q: "Berilgan_Plan" varag\'ida 1-30 sentabr uchun reja kiritilmagan, shuning uchun kunlik, smena va umumiy bajarilish foizini hisoblab bo\'lmaydi.',
 'IMM ma\'lumoti faqat 25.09.2026 uchun: "IMM_Taqsimot", "IMM_Fact", "IMM_Grafik" bo\'sh. IMM bo\'yicha ishlab chiqarish va ish vaqtining oldingi kunlari jadvalda saqlanmagan.',
 'Eng yuqori kunlik fakt: '+bestD+'.09 ('+fmt(best)+' dona). Kunlik o\'rtacha: '+fmt(total/work)+' dona ('+work+' ish kuni).',
 '2-smena ulushi '+Math.round(s2/total*100)+'%; 1-smena '+Math.round(s1/total*100)+'%. 06.09 va 20.09 da 2-smena ishlamagan.',
 'Yakshanba kunlari fakt past yoki nol: '+lows.join(', ')+'. 01.09 da ishlab chiqarish yozilmagan.',
 'Fakt "Fakt" varag\'idan, smena ma\'lumoti "Fact smena" varag\'idan olingan; kunlik jami ikkala varaqda mos keladi.'
];
$('apm-nl').innerHTML=notes.map(function(n){return '<li>'+n+'</li>'}).join('');
var KEY='apm_notes_v1';
try{var v=localStorage.getItem(KEY);if(v)$('apm-ta').value=v}catch(e){}
$('apm-save').addEventListener('click',function(){
  try{localStorage.setItem(KEY,$('apm-ta').value);$('apm-saved').textContent='Saqlandi (faqat shu brauzerda)'}catch(e){$('apm-saved').textContent='Saqlab bo\'lmadi'}
});


// ---- ish vaqti xaritasi ----
// Soatlik holat kodlari: run (ishlamoqda), part (qisman), stop (to'xtagan), svc (qolip almashtirish / servis). null = ma'lumot yo'q.
var HOUR_STATUS={};
var ST={run:['Ishlamoqda','var(--run)'],part:['Qisman ishlagan','var(--part)'],stop:['To\'xtab turgan','var(--stop)'],svc:['Qolip almashtirish / servis','var(--svc)'],none:['Ma\'lumot yo\'q','var(--none)']};
var HRS=[];for(var q=8;q<32;q++)HRS.push(q%24);
function pad(n){return (n<10?'0':'')+n}
function legend(el){el.innerHTML=Object.keys(ST).map(function(k){return '<span><i style="background:'+ST[k][1]+'"></i>'+ST[k][0]+'</span>'}).join('')}
function map(el){
  var h='<div></div>'+HRS.map(function(x){return '<div class="h">'+pad(x)+'</div>'}).join('');
  MACH.forEach(function(m){
    h+='<div class="m">'+m[0]+'</div>';
    var row=HOUR_STATUS[m[0]]||[];
    HRS.forEach(function(x,i){var s=row[i]||'none';h+='<div class="c" style="background:'+ST[s][1]+'" title="'+m[0]+', '+pad(x)+':00 - '+ST[s][0]+'"></div>'});
  });
  el.innerHTML=h;
}
legend($('apm-hleg'));legend($('apm-hleg2'));map($('apm-hm'));map($('apm-hm2'));
$('apm-big').addEventListener('click',function(){$('apm-ov').hidden=false;$('apm-x').focus()});
$('apm-x').addEventListener('click',function(){$('apm-ov').hidden=true});
$('apm-ov').addEventListener('click',function(e){if(e.target===$('apm-ov'))$('apm-ov').hidden=true});
document.addEventListener('keydown',function(e){if(e.key==='Escape')$('apm-ov').hidden=true});

var ch={};
function mk(id,cfg){if(ch[id])ch[id].destroy();ch[id]=new Chart($(id),cfg)}
function draw(){
  if(typeof Chart==='undefined')return;
  var ink=css('--muted'),grid=css('--line'),blue=css('--blue'),or=css('--orange'),dk=css('--ink');
  var labels=DAYS.map(function(d){return d+' sen'});
  var base={responsive:true,maintainAspectRatio:false,animation:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return c.dataset.label+': '+fmt(c.parsed.y)+' dona'}}}},
    scales:{x:{grid:{display:false},ticks:{color:ink,maxRotation:0,autoSkip:true,font:{size:12}},border:{color:grid}},y:{beginAtZero:true,grid:{color:grid},border:{display:false},ticks:{color:ink,callback:function(v){return fmt(v)},font:{size:12}},title:{display:true,text:'dona',color:ink}}}};
  mk('apm-daily',{type:'bar',data:{labels:labels,datasets:[{label:'Fakt',data:TOT,backgroundColor:blue,borderRadius:{topLeft:3,topRight:3},maxBarThickness:22}]},options:base});
  mk('apm-shift',{type:'bar',data:{labels:labels,datasets:[{label:'1-smena fakt',data:S1,backgroundColor:blue,borderRadius:{topLeft:3,topRight:3},maxBarThickness:16},{label:'2-smena fakt',data:S2,backgroundColor:or,borderRadius:{topLeft:3,topRight:3},maxBarThickness:16}]},options:base});
  var acc=0,cum=TOT.map(function(v){acc+=v;return acc});
  mk('apm-cum',{type:'line',data:{labels:labels,datasets:[{label:'Yig\'ma fakt',data:cum,borderColor:dk,backgroundColor:dk,borderWidth:2.5,pointRadius:3,tension:0}]},options:base});
  mk('apm-time',{type:'bar',data:{labels:MACH.map(function(m){return m[0]}),datasets:[{label:'Mavjud soat',data:MACH.map(function(){return CAP}),backgroundColor:ink,borderRadius:{topLeft:3,topRight:3},maxBarThickness:26},{label:'Fakt soat',data:MACH.map(function(){return 0}),backgroundColor:blue,borderRadius:{topLeft:3,topRight:3},maxBarThickness:26}]},
    options:Object.assign({},base,{plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return c.dataset.label+': '+c.parsed.y+' soat'}}}},scales:{x:{grid:{display:false},ticks:{color:ink,font:{size:11}},border:{color:grid}},y:{beginAtZero:true,max:24,grid:{color:grid},border:{display:false},ticks:{color:ink,font:{size:12}},title:{display:true,text:'soat',color:ink}}}})});
}
window.__apmRender=draw;
$('apm-mon').addEventListener('toggle',function(){if($('apm-mon').open)setTimeout(draw,30)});
})();
