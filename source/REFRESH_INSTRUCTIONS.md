# Kunlik yangilash yo'riqnomasi (Tahlil paneli)

**PAROL (15.10.2026'dan): barcha hisoblar (ombor/admin/apm) uchun `uk123456` (Uk123456; kirishda kichik harfga o'giriladi). Eski uz123456 endi ishlamaydi.**

Bu papka "Quyish paneli" tizimining manba kodi. Kunlik avtomatik yangilanish shu bosqichlar
orqali amalga oshiriladi. **30.09.2026'da tizim ko'p oylik arxivni qo'llab-quvvatlaydigan
qilib qayta qurildi (`MONTHS[]` massivi) va yangi "Kirim/Chiqim" jurnali qo'shildi — pastdagi
3-4-bosqichlar shunga mos yangilangan, eski (bitta oylik, flat const'lar) usulni ENDI
QO'LLAMANG.**

1. Google Drive orqali "Sentabr ASTATKA" jadvalini yuklab oling:
   fileId = `1BJJXwxWtqL6Xtokhk97GkIfY5TQ9_eJBlWK-hFguyIg`
   mcp__Google_Drive__download_file_content(fileId, exportMimeType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
   Natijani base64'dan .xlsx faylga oching (masalan /tmp/astatka.xlsx).

   Eslatma: fayl nomi hamon "Sentabr ASTATKA" bo'lsa ham, Rustam aytishicha bu fayl
   OKTABR va undan keyingi oylar uchun ham asosiy (joriy) fayl bo'lib qolaveradi — u
   sentabrni alohida nusxaga arxivlagan. fileId O'ZGARMAYDI, faqat ichidagi oy o'zgaradi.
   Shuning uchun "qaysi oy" ekanini fayl nomidan emas, balki Plan_Berish varag'idagi
   sanadan (pastda) aniqlang — bu avtomatik, sizga qo'lda hech narsa qilish shart emas.

2. `python3 rebuild_dash.py` ni ishga tushiring (avval /tmp/astatka.xlsx yo'lini script ichida
   tekshiring) — bu /tmp/dash_rebuild.json'ni yaratadi: N_DAYS, NEED_TOTAL, PLAN_DATE, TOT_PROD,
   SHIP, END, RAW (Tahlil paneli uchun, P/E massivlari bilan), MON_RAW (Ombor monitori uchun,
   soddaroq), n_rows.

   Muhim: bu skript "valid days" ni avtomatik aniqlaydi — kunlik "01".."31" varaqlaridagi
   "Kun boshiga qoldiq" ustunini solishtirib, oxirgi haqiqiy to'ldirilgan kunni topadi
   (G-vektor ketma-ket kunlar orasida farq qiladimi tekshiriladi). Demak N_DAYS har kuni
   o'zgarishi mumkin — bu normal. Oy boshida (masalan 1-oktabrda, "01" varag'i hali bo'sh
   yoki faqat bir necha qator to'ldirilgan bo'lsa) N_DAYS juda kichik yoki 0 bo'lishi mumkin
   — bu ham normal, xato emas.

3. `python3 apply_dash_update.py quyish-open.html /tmp/dash_rebuild.json` ni ishga tushiring.
   Bu skript avtomatik ravishda:
   - Ombor monitori uchun MON RAW blokini har doim yangilaydi.
   - Tahlil paneli skriptidagi `const MONTHS=[...]` massivini yangilaydi:
     * Agar oxirgi element hali ham JORIY oy bo'lsa (masalan bugun ham sentabr) — o'sha
       elementni yangi raqamlar bilan almashtiradi, `frozen:false` qoladi.
     * Agar oy almashgan bo'lsa (masalan kecha sentabr edi, bugun oktabr) — oxirgi elementni
       `frozen:true` qilib abadiy MUZLATADI (bundan keyin hech qachon o'zgarmaydi — bu
       o'tgan oyning yakuniy arxiv nusxasi) va massiv oxiriga YANGI oy uchun `frozen:false`
       element qo'shadi. Oldingi oylar hech qachon o'chirilmaydi yoki qayta yozilmaydi —
       shu tufayli sayt UI'sida chap paneldagi "Boshlanish/Tugash sana" orqali istalgan o'tgan
       oyni (yoki bir necha oyni birga) ko'rish mumkin.
   Qaysi oy ekanini skript "01" varag'ining G2 katagidagi sanadan (MONTH_DATE, oyning 1-kuni)
   chiqaradi; bo'lmasa Plan_Berish sanasidan (PLAN_DATE). Ikkalasi turli oyni ko'rsatsa,
   OGOHLANTIRISH chiqadi va "01" varag'i olinadi. Skript ishlagach, konsolga nima qilinganini
   chiqaradi ("Mavjud oy yangilandi" yoki "YANGI OY boshlandi") — buni tekshiring.

   HIMOYALAR (01.10.2026'dan oldin qo'shildi) — skript quyidagi holatlarda HECH NARSANI
   O'ZGARTIRMAY "XAVFLI: ..." xatosi bilan to'xtaydi:
     * yangi ma'lumot muzlatilgan (o'tgan) oyga tegishli ko'rinsa;
     * yangi ma'lumot oyi oxirgi oydan oldinroq bo'lsa;
     * bir xil oy uchun kunlar soni kamaysa (masalan 29 → 2) — bu odatda fayl yangi oyga
       o'tkazilgan-u, "01" varag'idagi sana hali yangilanmaganini bildiradi.
   Bunday xato chiqsa: NASHR QILMANG. Sababini tekshiring ("01"!G2 sanasi, Plan_Berish B2),
   bu yerga qisqa eslatma yozing va foydalanuvchiga ayting. Sentabr (yoki boshqa o'tgan oy)
   ma'lumotini hech qachon yangi oy raqamlari bilan ustidan yozmang.

   ESKI USUL (ENDI ISHLATMANG): ilgari `quyish-open.html` ichida IKKITA alohida
   "const RAW=`...`;" bloki bor edi va ularni qo'lda/regex bilan almashtirish kerak edi —
   bu juda xatoga moyil edi (bir marta ikkalasi aralashtirilib yuborilgan). Endi buning
   o'rniga shu skript ishlatiladi. `quyish-open.html`da hamon "AppSheet_Kirim varag'i"
   izohli UCHINCHI bir skript bor (fayl oxirida, "Kirim/Chiqim" jurnali) — BUNGA
   apply_dash_update.py HECH QACHON TEGMAYDI va sizga ham tegishning HOJATI yo'q: u
   brauzerda o'zi jonli ishlaydi (AppSheet_Kirim varag'idan to'g'ridan-to'g'ri CSV o'qiydi,
   hech qanday build/deploy kerak emas).

3a. Kirim/Chiqim ARXIVI (02.10.2026'dan, har kuni): `python3 source/archive_kirim_month.py quyish-open.html /tmp/astatka.xlsx all`
   — AppSheet_Kirim'dagi barcha yozuvlarni sahifadagi `<template id="kirim-arch">` ga QO'SHADI (o'chirmaydi,
   takrorlarni qo'shmaydi). Sababi: oy almashganda foydalanuvchi AppSheet_Kirim'ni tozalashi mumkin; arxiv
   bo'lmasa o'tgan oy yozuvlari panel'dan yo'qoladi. Sahifa arxiv + jonli yozuvlarni birlashtiradi.
   Arxivdan hech qachon yozuv o'chirmang. Sentabr 2026 yozuvlari 02.10.2026'da qo'lda arxivlangan.

   Oy almashishi (02.10.2026 11:40 da BAJARILDI): fayl "Oktabr ASTATKA", birinchi kun varag'i "01.10.2026" deb
   qayta nomlangan (rebuild_dash.py endi "01", "01.10.2026" kabi nomlarni o'zi topadi). Sentabr frozen:true,
   oktabr qo'shilgan. Kunlik varaqlardagi "№" ustuni oktabrda 1..118 (ikki raqam tashlab ketilgan), "31" va
   Plan_Berish esa 1..116 — bu muammo emas: kunlik hisoblar detal raqami/qator bo'yicha, jonli qoldiq "31"
   bo'yicha olinadi. Plan_Berish'da yangi ustuvorlik "O'rta" paydo bo'ldi — panelda 'M' ("O'rta") sifatida
   ko'rsatiladi. Ombor monitori/Tahlil jonli qoldig'i
   "31" varag'ida hamma qoldiq 0 bo'lsa uni e'tiborsiz qoldiradi (yangi oy varag'i hali to'ldirilmagan).

3c. APM bo'limi — ALOHIDA SHART (12.10.2026'dan): APM "Oktabr ASTATKA"/Kunlik_Panel/Plan_Berish'ga BOG'LIQ EMAS.
   Kunlik_Panel sanasi orqada yoki "Plan berilganmi ✗" bo'lib, ombor/Tahlil nashri o'tkazib yuborilsa ham, APM'ni
   baribir yangilang: zyt.xlsx'ni yuklab, rebuild_apm.py'ni ishga tushiring, build_login.js bilan quring va nashr qiling
   (ombor/Tahlil ma'lumotiga tegmasdan — faqat apm.js o'zgaradi). Sabab: 10-12.10 da butun nashr o'tkazib yuborilgani
   uchun APM 8.10 da qolib ketgan edi, holbuki "Fakt"da 9 va 10.10 tayyor edi. rebuild_apm.py o'zi xavfsiz: faqat fakt/reja
   kiritilgan kunlarni oladi, kunlar kamaysa to'xtaydi, Berilgan_Plan'da reja yo'q kunning IMM nusxasini saqlamaydi.

3c-bis. APM bo'limi (09.10.2026'dan, har kuni): manba "Zaxira Yetish Tahlili (IMM Grafik)" jadvali,
   fileId `1I4GbqRL-r9_0pDiIL0hQatOSv_dAriYT5XbMr5K8Vv4` — xlsx qilib yuklab /tmp/zyt.xlsx ga saqlang (javob katta,
   tool-results fayldan base64'ni o'qing), so'ng: `python3 source/rebuild_apm.py source/apm/apm.js /tmp/zyt.xlsx`
   (build_login.js apm/ papkasini o'qiydi — ishchi nusxangizda apm/apm.js ni ishlating). Skript faqat apm.js ichidagi
   `// APM_DATA_START ... // APM_DATA_END` blokini yangilaydi: joriy oy kunlik fakt/smena/reja va shu kungi IMM yuklamasi
   (IMM kunlik nusxalari yig'ilib boradi — IMM_Yuklama har kuni ustidan yoziladi, shuning uchun har kuni ishga tushirish
   muhim). Oy almashganda oldingi oyni muzlatadi. "XAVFLI" bilan to'xtasa — APM'ni o'tkazib yuboring, qolganini nashr
   qilsa bo'ladi, session xulosasida ayting. Ilgari APM qo'lda kiritilgan statik sentabr ma'lumoti edi va shu sababli
   oktabrga o'tmay qolgan edi (09.10.2026 da tuzatildi).

3b. Kirim/Chiqim zaxira nusxasi (02.10.2026'dan): `python3 source/bake_kirim_snapshot.py quyish-open.html /tmp/astatka.xlsx`
   — AppSheet_Kirim varag'ini sahifadagi `<template id="kirim-snap">` blokiga joylaydi. claude.ai artifact
   sahifasi ba'zan Google Sheets'ga ulana olmaydi; shunda Kirim/Chiqim shu nusxani ko'rsatadi. Bu skript faqat
   shu template blokiga tegadi (Kirim/Chiqim skriptining o'ziga emas). Xato bersa — nashrni to'xtatmang,
   faqat session xulosasida ayting.

   Nashr: Artifact'ni `capabilities` parametrisiz nashr qiling (saqlangan `{db, downloads}` ruxsatlari
   avtomatik saqlanadi; `downloads` — Excel'ga yuklash tugmasi uchun kerak).

4. `node build_login.js` — quyish-login.html'ni qayta quradi (parollar o'zgarmaydi: barchasi
   "uk123456", pastki registrda). Agar kelajakda `quyish-open.html`ga YANGI (to'rtinchi,
   beshinchi...) `<script>` blok qo'shsangiz, `build_login.js` ichidagi `scripts[N]`
   indekslarini ham yangilashni unutmang (apm/admin akkauntlari uchun) — bu haqda
   build_login.js boshidagi izohlarni o'qing. Hozirgi holat: scripts[0]=mon, [1]=dash,
   [2]=tab-almashtirish (ishlatilmaydi), [3]=jonli qoldiq sync, [4]=Kirim/Chiqim sync.

5. Playwright bilan tekshiring (ombor/admin/apm hisoblari bilan kirib, xatosiz ekanini,
   KPI/qatorlar sonini, va agar oy yangi bo'lsa — chap paneldagi Boshlanish/Tugash sanani o'tgan
   oyga qo'yib "Qo'llash" bosilganda o'sha oyning KPI/grafiklari ko'rinishini tasdiqlang) — productiondagi raqamlarni ko'r-ko'rona nashr qilmang.
   Eslatma: Tahlil paneli 30.09.2026'da yangi dizaynga o'tgan (chap filtr paneli, KPI kartalar,
   segmentli trend grafigi, reyting ro'yxatlari, donut). Oy tugmalari va "Davr" filtri endi YO'Q (foydalanuvchi so'rovi bilan olib
   tashlangan) — oy sana oralig'i (#dx-f-from/#dx-f-to) orqali tanlanadi. Ma'lumot tuzilmasi (MONTHS[]) o'zgarmagan.

6. Ikkala joyga joylashtiring:
   - Claude Artifact: url=https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5,
     file_path=quyish-login.html (avval shu url'ni "read" qiling — "viewed" bo'lishi kerak).
     Agar "newer version" xatosi chiqsa — boshqa sessiya (masalan shu kunlik vazifaning
     o'zi, yoki foydalanuvchi bilan ishlayotgan boshqa suhbat) allaqachon yangiroq versiya
     nashr qilgan bo'lishi mumkin: o'sha versiyani o'qing, undagi ma'lumot o'zgarishlarini
     (masalan yangilangan RAW/TOT_PROD raqamlari) o'z natijangizga qo'shib (merge qilib)
     qaytadan nashr qiling — hech qachon o'zingizning eski nusxangizni ustidan majburan
     yozmang.
   - GitHub Pages: shu repo (usmonovr049-hash/Injection-warehouse-monitoring), fayl
     "index.html" (repo ildizida) = qayta qurilgan quyish-login.html, branch "main". Shu bilan
     birga `source/quyish-open.html` va (agar o'zgargan bo'lsa) `source/build_login.js`ni ham
     shu papkaga qo'shib commit qiling — keyingi kunlik ishga tushirish shu fayllardan
     boshlanadi.

Eslatma: Kunlik "01".."31" varaqlari jamoa tomonidan har kuni qo'lda to'ldiriladi — ba'zan
kechikishi mumkin (masalan bugun hali to'ldirilmagan bo'lishi mumkin). Shuning uchun N_DAYS
ba'zan bir necha kun o'zgarmasligi mumkin, bu xato emas.

ENG MUHIM — SANA QOIDASI (12.10.2026, Rustam tasdiqladi, quyidagi barcha eski "sana orqada" izohlaridan USTUN):
Kunlik_Panel "Sana:" ishlab chiqarish kunini ko'rsatadi, kalendar kunini emas. Ish kuni smenalar bo'yicha 08:00 dan
ertangi 07:00/08:00 gacha davom etadi, shuning uchun ertalabki tekshiruvda (07:47 da) sana KECHAGI kun bo'lishi —
NORMAL holat, anomaliya emas. Kutilgan sana = (Toshkent vaqti − 8 soat) ning sanasi. Faqat sana shundan 2+ kun
orqada yoki oldinda bo'lsagina anomaliya deb hisoblang.
  - "Sana = kecha" + "Plan berilganmi ✓" → bu kechagi yopilgan kun, ISHONCHLI — odatdagidek nashr qiling
    (ilgari bu "xavfli kombinatsiya" deb yozilgan edi — endi bu qoida BEKOR).
  - "Plan berilganmi ✗" → Plan_Berish'ning kerak/ustuvorlik ustunlariga ishonmang, LEKIN NASHRNI O'TKAZMANG (13.10.2026,
    Rustam: "kunlarni avtomatik yangila"): `KEEP_PLAN=quyish-open.html python3 rebuild_dash.py` bilan quring — kunlik
    ishlab chiqarish/jo'natish/qoldiq va kunlar soni yangilanadi, kerak/ustuvorlik/NEED_TOTAL/planDate esa oxirgi
    nashr qilingan (ishonchli) yozuvdan olinadi. Keyin odatdagidek apply_dash_update, 3a/3b/3c, build, nashr.
    Plan ✓ bo'lganda KEEP_PLAN'siz quring (yangi reja olinadi). Vazifa kuniga ikki marta ishlaydi (07:47 va 12:47). Yakshanba/dam olish kunlari reja kiritilmasligi odatiy — buni xato deb
    xabar qilmang.
  - "Sana orqada" sababli hech qachon PushNotification yubormang va qayta tekshiruv rejalashtirmang.

MUHIM (30.09.2026'da topilgan muammo): "Plan_Berish" varag'i ILGARI "har doim ishonchli"
deb yozilgan edi — bu NOTO'G'RI ekan, tuzatildi. Sabab: "Sentabr ASTATKA"dagi Plan_Berish
o'zi hisoblamaydi — u boshqa jadvaldan IMPORTRANGE orqali ko'chiradi:
manba fileId = `1I4GbqRL-r9_0pDiIL0hQatOSv_dAriYT5XbMr5K8Vv4`
("Zaxira Yetish Tahlili (IMM Grafik) last rev1"), varaq "Plan_Berish", oralig'i A6:L121.
Bu manba jadvalda avtomatik kunlik trigger bor ("Kunlik_Panel" varag'i, "Sana" katakchasi
Balans!AJ1'dan) — sana kun bo'yicha almashganda, o'sha kunning REJASI HALI TUZILMAGAN bo'ladi
("Kunlik_Panel"dagi "Plan berilganmi (Berilgan_Plan): Hali yo'q" holatida), va shu daqiqada
Plan_Berish'dagi HAMMA qatorlar vaqtinchalik "Kerak emas" / kerak=0 ko'rsatadi — garchi
haqiqiy zaxira hali ham kam/tugagan bo'lsa ham! Bu holat 30.09 ertalab soat ~03:50 UTC atrofida
kuzatildi: bir necha daqiqa oldin yuklab olingan faylda 17 ta SHOSHILINCH / 16 144 dona
yetishmovchilik bor edi (29.09 kunining yopiq holatiga asoslangan haqiqiy hisob), keyingi
yuklab olishda esa BARCHA 116 qator "Kerak emas" ko'rsatdi — garchi "Joriy qoldiq" (zaxira)
ustuni bir xil (o'zgarmagan) qolgan bo'lsa ham. Demak "Kerak emas"ning bu vaqtinchalik
ko'rinishi ZAXIRA tiklanganidan emas, balki kunlik REJA HALI TUZILMAGANIDAN edi.

Shuning uchun KEYINGI safar yangilashdan oldin albatta tekshiring:
1. Manba jadval (`1I4GbqRL-r9_0pDiIL0hQatOSv_dAriYT5XbMr5K8Vv4`)dagi "Kunlik_Panel" varag'ini
   o'qing (mcp__Google_Drive__read_file_content bilan — bu tez va yengil, butun faylni
   yuklab olish shart emas). "Sana:" bugungi kunga mos va "Plan berilganmi (Berilgan_Plan):"
   qatori "✓ Kiritilgan" ekanini tasdiqlang.
2. Agar "Plan berilganmi" hali "✗ Hali yo'q" bo'lsa — Plan_Berish'dagi raqamlarga ISHONMANG
   (ular 0/Kerak emas yoki eski kunning qoldiq keshi bo'lishi mumkin). Nashr qilishni
   to'xtating, va bir necha soatdan keyin (jamoa kunlik reja bosqichini bajargach) qayta
   urinib ko'ring — buni foydalanuvchiga aytib qo'ying, chunki bu ularning qo'lda bajaradigan
   ish jarayoniga bog'liq.
3. Ikki marta ketma-ket yuklab olib solishtiring (bir necha soniya farq bilan) — agar
   natijalar mos kelmasa (masalan NEED_TOTAL keskin farq qilsa), bu IMPORTRANGE beqarorligi
   yoki kunlik trigger o'tish jarayonida ekanini bildiradi; shunday holatda ham nashr qilmang.

**Eslatma (02.10.2026'da kuzatilgan holat):** "Plan berilganmi (Berilgan_Plan)" qiymati
har doim "✗ Hali yo'q" shaklida bo'lishi shart emas — ba'zan shunchaki "—" (tire) ko'rinishida
chiqadi, va shu bilan birga "Fakt kiritilganmi:" qatorida "#NUM!" xatosi bo'ladi. Bu ham xuddi
"Hali yo'q" bilan bir xil holat: Plan_Berish'dagi BARCHA 116 qator "Kerak emas" / kerak=0
ko'rsatadi (ikki marta ketma-ket yuklab solishtirilganda ham bir xil, aynan bir xil fayl
hajmi — demak bu IMPORTRANGE beqarorligi emas, balki kunlik reja hali tuzilmagan degani).
Shu kuni "01" varag'i G2'si ham hali SENTABR (2026-09-01)ni ko'rsatardi (Plan_Berish B2 esa
2026-10-01) — ya'ni kunlik "01".."31" varaqlari ham sentabrning 30- va keyingi kunlariga
hali yetib bormagan edi (oxirgi haqiqiy kun N_DAYS=29, saytdagi joriy qiymat bilan bir xil —
demak yangilash uchun yangi kun ma'lumoti ham yo'q edi). XULOSA: "Plan berilganmi" ustuni
aniq "✓ Kiritilgan" bo'lmaguncha, NEED_TOTAL=0 yoki barcha qatorlar "Kerak emas" bo'lsa —
bu signal, nashr qilmang, hatto N_DAYS saytdagidan farqlanmasa ham.

**Eslatma (03.10.2026, soat ~02:50 UTC / ~07:50 mahalliy, kunlik avtomatik vazifa):**
Manba jadval (`1I4GbqRL-r9_0pDiIL0hQatOSv_dAriYT5XbMr5K8Vv4`, "Kunlik_Panel" varag'i) tekshirildi:
Sana = 2026-10-03, "Fakt kiritilganmi: ✗ Hali yo'q", "Chiqim kiritilganmi: ✓ Kiritilgan",
"Plan berilganmi (Berilgan_Plan): ✗ Hali yo'q", "IMM_Fact to'ldirilganmi: ✗ Hali yo'q".
Bu aynan yuqorida tasvirlangan "reja hali tuzilmagan" holati — shuning uchun bu kunlik ishga
tushirishda Oktabr ASTATKA yuklab olinmadi, rebuild_dash.py/apply_dash_update.py ISHGA
TUSHIRILMADI va HECH NARSA qayta nashr qilinmadi (Artifact ham, GitHub Pages ham eski holida
qoldi). Kirim/Chiqim arxivlash (3a/3b) ham shu safar o'tkazib yuborildi — chunki butun
kunlik oqim bitta nashrga birlashtirilgan va qisman (faqat arxiv) nashr qilish keyinroq
chalkashlikka olib kelishi mumkin. Avtomatik qayta urinish ~4 soatdan keyin rejalashtirildi.

**Davomi (03.10.2026, ~06:53 UTC / ~11:53 mahalliy):** Qayta tekshirildi — "Fakt kiritilganmi"
endi "✓ Kiritilgan" bo'lgan, lekin "Plan berilganmi (Berilgan_Plan)" hamon "✗ Hali yo'q".
Nashr yana o'tkazib yuborildi, ~3 soatdan keyin uchinchi tekshiruv rejalashtirildi.

**Davomi (03.10.2026, ~09:55 UTC / ~14:55 mahalliy) — G'AYRIODDIY HOLAT:** Uchinchi tekshiruvda
"Sana:" katakchasi (A1/F1) kutilmaganda **2026-10-04**ni ko'rsatdi (haqiqiy mahalliy vaqt hali
2026-10-03 kunduzi edi) — ya'ni manba jadvalning kunlik avto-trigger sanasi (Balans!AJ1) real
kalendar kunidan BIR KUN OLDINGA o'tib ketgan, va shu bilan birga 2026-10-03 kuni uchun
"Plan berilganmi" hech qachon "✓ Kiritilgan" bo'lib ko'rinmadi — "Fakt kiritilganmi" va
"Chiqim kiritilganmi" ham yangi (10-04 sanali) holatda yana "✗ Hali yo'q"ga qaytib tushdi.
Bu avvalgi ikki holatdan (MUHIM bo'limida yozilgan) farqli — bu safar muammo Plan_Berish'ning
IMPORTRANGE/trigger beqarorligida emas, balki manba jadvalning kunlik sana-trigger mexanizmida
bo'lishi mumkin (ehtimol vaqt mintaqasi noto'g'ri sozlangan yoki kecha kun TUGATILMAGAN holda
avtomatik keyingisiga o'tgan). Natijada 2026-10-03 kuni uchun hech qachon ishonchli Plan_Berish
ma'lumoti olinmadi — shu kunlik nashr butunlay o'tkazib yuborildi. Bu holat foydalanuvchiga
PushNotification orqali xabar qilindi (g'ayrioddiy, ularning e'tiborini talab qiladi) va keyingi
qayta urinishlar to'xtatildi — ertangi standart kunlik vazifa (CRON_TZ=Asia/Tashkent 07:47) o'zi
yangi kun bilan qaytadan boshlaydi. Agar bu holat takrorlansa, manba jadvalning kunlik
trigger skriptini (qaysi vaqt mintaqasida ishlayotganini) tekshirish kerak bo'ladi.

**04.10.2026, ~02:49 UTC / ~07:49 mahalliy (standart kunlik vazifa, CRON_TZ=Asia/Tashkent 07:47):**
Kunlik_Panel sanasi endi to'g'ri — "Sana:" = 2026-10-04, ya'ni kechagi (03.10.2026) sana-trigger
g'ayrioddiyligi o'z-o'zidan tuzalgan (qo'shimcha tekshirish shart emas, hozircha). Lekin "Fakt
kiritilganmi", "Chiqim kiritilganmi", "Plan berilganmi (Berilgan_Plan)" va "IMM_Fact
to'ldirilganmi" — to'rttasi ham "✗ Hali yo'q". Bu kunning eng boshida (ertalab ~07:49 mahalliy)
odatiy holat — jamoa hali kunlik rejани kiritmagan. MUHIM bo'limiga ko'ra Plan_Berish'ga
ishonib bo'lmaydi, shuning uchun Oktabr ASTATKA yuklab olinmadi va hech narsa (Artifact, GitHub
Pages) qayta nashr qilinmadi. ~4 soatdan keyin (taxminan 06:49 UTC / ~11:49 mahalliy) shu sessiya
o'zi qayta tekshiradi (send_later orqali rejalashtirilgan).

**Davomi (04.10.2026, ~06:52 UTC / ~11:52 mahalliy):** Qayta tekshirildi (send_later orqali
o'z-o'ziga rejalashtirilgan eslatma bilan) — sana hamon to'g'ri (2026-10-04), lekin "Fakt
kiritilganmi / Chiqim kiritilganmi / Plan berilganmi (Berilgan_Plan) / IMM_Fact to'ldirilganmi"
hali ham to'rttasi ham "✗ Hali yo'q" (02.10-03.10'dagi "reja hali tuzilmagan" naqshiga mos,
g'ayrioddiy emas). Nashr yana o'tkazib yuborildi. Yana ~3 soatdan keyin (taxminan 09:52 UTC /
~14:52 mahalliy) uchinchi tekshiruv rejalashtirildi (02.10-03.10'dagi naqshga mos, kuniga
ko'pi bilan 3 marta).

**Davomi (04.10.2026, ~09:56 UTC / ~14:56 mahalliy) — SANA-TRIGGER ANOMALIYASI TAKRORLANDI:**
Uchinchi (oxirgi) tekshiruvda "Sana:" katakchasi (Kunlik_Panel A1/F1) **2026-10-05**ni ko'rsatdi —
haqiqiy UTC vaqt hali 2026-10-04 09:56 edi (konteyner soatiga ko'ra tasdiqlandi). Bu AYNAN
03.10.2026'da ~09:55 UTC/~14:55 mahalliyda kuzatilgan xuddi shu anomaliya — xuddi shu kunlik vaqt
oynasida IKKINCHI marta takrorlandi. Demak bu tasodifiy emas, balki manba jadvalning kunlik
sana-trigger mexanizmida (Balans!AJ1, "Kunlik_Panel" sanasini belgilaydi) tizimli muammo bo'lishi
ehtimoli katta — ehtimol ~14:55 mahalliy atrofida ishga tushadigan kunlik trigger skripti
vaqt mintaqasini noto'g'ri hisoblab, "ertangi" sanaga o'tib ketadi. Yangi (10-05) sanada ham
Fakt/Chiqim/Plan/IMM_Fact hammasi "✗ Hali yo'q" — kutilganidek. Bugungi (04.10.2026) uchun hech
narsa (Oktabr ASTATKA, Artifact, GitHub Pages) nashr qilinmadi/o'zgartirilmadi, va bugun uchun
yangi send_later yuborilmadi (ertangi standart kunlik vazifa, CRON_TZ=Asia/Tashkent 07:47, yangi
kun bilan davom etadi). Foydalanuvchiga PushNotification orqali xabar qilindi, chunki bu endi
IKKI marta ketma-ket takrorlangan tizimli belgi — manba jadvalning "Kunlik_Panel" sanasini
belgilaydigan Apps Script/trigger vaqt mintaqasini (ehtimol ~14:55 Toshkent atrofida ishga
tushib, kunni oldinga siljitadi) tekshirish tavsiya etiladi.

**05.10.2026, ~02:49 UTC / ~07:49 mahalliy (standart kunlik vazifa, CRON_TZ=Asia/Tashkent 07:47):**
Kunlik_Panel sanasi bugun TO'G'RI — "Sana:" = 2026-10-05 (04.10'dagi ikki marta takrorlangan
sana-trigger anomaliyasi bugun YO'Q, o'z-o'zidan tuzalgan ko'rinadi, qo'shimcha tekshirish
shart emas hozircha). Lekin "Fakt kiritilganmi", "Chiqim kiritilganmi", "Plan berilganmi
(Berilgan_Plan)" va "IMM_Fact to'ldirilganmi" — to'rttasi ham "✗ Hali yo'q" (02.10-04.10'dagi
ertalabki odatiy naqshga mos, g'ayrioddiy emas). MUHIM bo'limiga ko'ra Plan_Berish'ga hali
ishonib bo'lmaydi, shuning uchun Oktabr ASTATKA yuklab olinmadi va hech narsa (Artifact, GitHub
Pages) qayta nashr qilinmadi. ~4 soatdan keyin (taxminan 06:49 UTC / ~11:49 mahalliy) shu sessiya
o'zi qayta tekshiradi (send_later orqali rejalashtirilgan). Bu kunning odatiy boshlanishi bo'lgani
uchun foydalanuvchiga PushNotification yuborilmadi (g'ayrioddiy belgi yo'q).

**Davomi (05.10.2026, ~06:54 UTC / ~11:54 mahalliy):** Ikkinchi tekshiruv (send_later orqali
o'z-o'ziga rejalashtirilgan eslatma bilan) — sana hamon to'g'ri (2026-10-05, anomaliya yo'q), lekin
Fakt/Chiqim/Plan/IMM_Fact to'rttasi ham hamon "✗ Hali yo'q" (bir kun oldingi faylga aynan bir xil
baza64 hajmi — IMPORTRANGE beqarorligi emas, shunchaki reja hali tuzilmagan). Nashr yana
o'tkazib yuborildi. Bugungi uchinchi (oxirgi) tekshiruv ~3 soatdan keyin (taxminan 09:54 UTC /
~14:54 mahalliy) rejalashtirildi (kuniga ko'pi bilan 3 marta naqshiga mos).

**Davomi (05.10.2026, ~10:03 UTC / ~15:03 mahalliy) — SANA-TRIGGER ANOMALIYASI UCHINCHI MARTA
TAKRORLANDI:** Uchinchi (oxirgi) tekshiruvda "Sana:" katakchasi (Kunlik_Panel A1/F1) **2026-10-06**ni
ko'rsatdi — haqiqiy UTC vaqt hali 2026-10-05 10:03 edi (konteyner soatiga ko'ra tasdiqlangan, mahalliy
~15:03 Toshkent). Bu 03.10 (~14:55 mahalliy) va 04.10 (~14:56 mahalliy) kunlarida kuzatilgan xuddi
shu anomaliya — UCHINCHI marta, va UCHALASI HAM ~14:55-15:03 Toshkent vaqti oralig'ida sodir bo'lgan.
Bu endi tasodif emas, balki manba jadvalning kunlik sana-trigger mexanizmida (Balans!AJ1, "Kunlik_Panel"
sanasini belgilaydi) ANIQ TIZIMLI MUAMMO ekanini tasdiqlaydi — ehtimol ~15:00 Toshkent atrofida
ishga tushadigan kunlik trigger skripti vaqt mintaqasini noto'g'ri hisoblab, "ertangi" sanaga o'tib
ketadi. Yangi (10-06) sanada ham Fakt/Chiqim/Plan/IMM_Fact hammasi "✗ Hali yo'q". Bugungi (05.10.2026)
uchun hech narsa (Oktabr ASTATKA, Artifact, GitHub Pages) nashr qilinmadi/o'zgartirilmadi. Bu bugungi
UCHINCHI (oxirgi) tekshiruv bo'lgani uchun bugun uchun yangi send_later yuborilmadi — ertangi standart
kunlik vazifa (CRON_TZ=Asia/Tashkent 07:47) o'zi yangi kun bilan davom etadi. Foydalanuvchiga
PushNotification orqali xabar qilindi, chunki bu endi UCHINCHI marta ketma-ket (xuddi shu ~15:00
Toshkent vaqt oynasida) takrorlangan tizimli belgi — manba jadvalning "Kunlik_Panel" sanasini
belgilaydigan Apps Script/trigger vaqt mintaqasini tekshirish qat'iy tavsiya etiladi.

**06.10.2026, ~02:48 UTC / ~07:48 mahalliy (standart kunlik vazifa, CRON_TZ=Asia/Tashkent 07:47):**
Kunlik_Panel sanasi bugun TO'G'RI — "Sana:" = 2026-10-06 (05.10'dagi uchinchi marta takrorlangan
sana-trigger anomaliyasi bugun YO'Q, konteyner vaqti ham 2026-10-06 02:48 UTC bilan mos — qo'shimcha
tekshirish shart emas hozircha). Lekin "Fakt kiritilganmi", "Chiqim kiritilganmi", "Plan berilganmi
(Berilgan_Plan)" va "IMM_Fact to'ldirilganmi" — to'rttasi ham "✗ Hali yo'q" (02.10-05.10'dagi ertalabki
odatiy naqshga mos, g'ayrioddiy emas). MUHIM bo'limiga ko'ra Plan_Berish'ga hali ishonib bo'lmaydi,
shuning uchun Oktabr ASTATKA yuklab olinmadi, rebuild_dash.py/apply_dash_update.py ishga tushirilmadi
va hech narsa (Artifact, GitHub Pages) qayta nashr qilinmadi. Kirim/Chiqim arxivlash (3a/3b) ham shu
safar o'tkazib yuborildi (butun kunlik oqim bitta nashrga birlashtirilgan). ~4 soatdan keyin (taxminan
06:48 UTC / ~11:48 mahalliy) shu sessiya o'zi qayta tekshiradi (send_later orqali rejalashtirilgan).
Bu kunning odatiy boshlanishi bo'lgani uchun foydalanuvchiga PushNotification yuborilmadi (g'ayrioddiy
belgi yo'q — sana-trigger bugun to'g'ri ishladi).

**Davomi (06.10.2026, ~06:54 UTC / ~11:54 mahalliy):** Ikkinchi tekshiruv (send_later orqali
o'z-o'ziga rejalashtirilgan eslatma bilan) — sana hamon to'g'ri (2026-10-06, anomaliya yo'q). "Fakt
kiritilganmi" va "Chiqim kiritilganmi" endi "✓ Kiritilgan" bo'lgan (03.10'dagi naqshga mos — bular
odatda "Plan berilganmi"dan oldin kiritiladi), lekin "Plan berilganmi (Berilgan_Plan)" va "IMM_Fact
to'ldirilganmi" hamon ikkalasi ham "✗ Hali yo'q". MUHIM bo'limiga ko'ra "Plan berilganmi" aniq
"✓ Kiritilgan" bo'lmaguncha Plan_Berish'dagi raqamlarga ishonib bo'lmaydi, shuning uchun nashr yana
o'tkazib yuborildi (Oktabr ASTATKA yuklab olinmadi, hech narsa o'zgartirilmadi). Bugungi uchinchi
(oxirgi) tekshiruv ~3 soatdan keyin (taxminan 09:54 UTC / ~14:54 mahalliy) rejalashtirildi (kuniga
ko'pi bilan 3 marta naqshiga mos — 03-05.10'da aynan shu soat oralig'ida sana-trigger anomaliyasi
uch marta kuzatilgani uchun bu tekshiruvda ham sanaga alohida e'tibor berilади).

**Davomi (06.10.2026, ~09:59 UTC / ~14:59 mahalliy) — SANA-TRIGGER ANOMALIYASI TO'RTINCHI MARTA
KETMA-KET TAKRORLANDI:** Bugungi uchinchi (oxirgi) tekshiruvda "Sana:" katakchasi (Kunlik_Panel A1/F1)
**2026-10-07**ni ko'rsatdi — haqiqiy UTC vaqt hali 2026-10-06 09:59 edi (konteyner soatiga ko'ra
tasdiqlangan, mahalliy ~14:59 Toshkent). Bu 03.10 (~14:55), 04.10 (~14:56) va 05.10 (~15:03) kunlarida
kuzatilgan xuddi shu anomaliya — TO'RTINCHI marta ketma-ket, va TO'RTTASI HAM ~14:55-15:03 Toshkent
vaqti oralig'ida sodir bo'lgan. Bu endi shubhasiz manba jadvalning kunlik sana-trigger mexanizmida
(Balans!AJ1, "Kunlik_Panel" sanasini belgilaydi) DOIMIY TAKRORLANADIGAN TIZIMLI MUAMMO — har kuni
~15:00 Toshkent atrofida ishga tushadigan kunlik trigger skripti kunni ertangiga siljitib yuboradi.
Yangi (10-07) sanada ham Fakt/Chiqim/Plan/IMM_Fact hammasi "✗ Hali yo'q". Bugungi (06.10.2026) uchun
hech narsa (Oktabr ASTATKA, Artifact, GitHub Pages) nashr qilinmadi/o'zgartirilmadi. Bu bugungi
UCHINCHI (oxirgi) tekshiruv bo'lgani uchun bugun uchun yangi send_later yuborilmadi — ertangi standart
kunlik vazifa (CRON_TZ=Asia/Tashkent 07:47) o'zi yangi kun bilan davom etadi. Foydalanuvchiga
PushNotification orqali xabar qilindi, chunki bu endi TO'RTINCHI marta ketma-ket (har safar aynan shu
~15:00 Toshkent vaqt oynasida) takrorlangan tizimli belgi — manba jadvalning "Kunlik_Panel" sanasini
belgilaydigan Apps Script/trigger vaqt mintaqasini (ehtimol UTC+6 yoki boshqa noto'g'ri offset bilan
ishlab, Toshkent kechqurunida "ertangi kun"ga o'tib ketadi) albatta tekshirish va tuzatish kerak —
avtomatik qayta urinishlar buni o'zidan hal qila olmaydi, chunki muammo manba tomonida.

**07.10.2026, ~02:49 UTC / ~07:49 mahalliy (standart kunlik vazifa, CRON_TZ=Asia/Tashkent 07:47):**
Kunlik_Panel sanasi bugun TO'G'RI — "Sana:" = 2026-10-07 (06.10'dagi to'rtinchi marta ketma-ket
takrorlangan sana-trigger anomaliyasi bugun YO'Q, konteyner vaqti ham 2026-10-07 02:49 UTC bilan
mos — qo'shimcha tekshirish shart emas hozircha, chunki bu tekshiruv ertalab bo'ldi, anomaliya esa
doim ~14:55-15:03 mahalliy atrofida kuzatilgan). Lekin "Fakt kiritilganmi", "Chiqim kiritilganmi",
"Plan berilganmi (Berilgan_Plan)" va "IMM_Fact to'ldirilganmi" — to'rttasi ham "✗ Hali yo'q"
(02.10-06.10'dagi ertalabki odatiy naqshga mos, g'ayrioddiy emas). MUHIM bo'limiga ko'ra
Plan_Berish'ga hali ishonib bo'lmaydi, shuning uchun Oktabr ASTATKA yuklab olinmadi,
rebuild_dash.py/apply_dash_update.py ishga tushirilmadi va hech narsa (Artifact, GitHub Pages)
qayta nashr qilinmadi. Kirim/Chiqim arxivlash (3a/3b) ham shu safar o'tkazib yuborildi (butun
kunlik oqim bitta nashrga birlashtirilgan). ~4 soatdan keyin (taxminan 06:49 UTC / ~11:49 mahalliy)
shu sessiya o'zi qayta tekshiradi (send_later orqali rejalashtirilgan). Bu kunning odatiy
boshlanishi bo'lgani uchun foydalanuvchiga PushNotification yuborilmadi (g'ayrioddiy belgi yo'q —
sana-trigger bugun to'g'ri ishladi).

**Davomi (07.10.2026, ~06:53 UTC / ~11:53 mahalliy):** Ikkinchi tekshiruv (send_later orqali
o'z-o'ziga rejalashtirilgan eslatma bilan) — sana hamon to'g'ri (2026-10-07, anomaliya yo'q).
"Fakt kiritilganmi" endi "✓ Kiritilgan" bo'lgan, lekin "Chiqim kiritilganmi", "Plan berilganmi
(Berilgan_Plan)" va "IMM_Fact to'ldirilganmi" hamon uchtasi ham "✗ Hali yo'q". MUHIM bo'limiga
ko'ra "Plan berilganmi" aniq "✓ Kiritilgan" bo'lmaguncha Plan_Berish'dagi raqamlarga ishonib
bo'lmaydi, shuning uchun nashr yana o'tkazib yuborildi (Oktabr ASTATKA yuklab olinmadi, hech
narsa o'zgartirilmadi). Bugungi uchinchi (oxirgi) tekshiruv ~3 soatdan keyin (taxminan 09:53 UTC
/ ~14:53 mahalliy) rejalashtirildi (kuniga ko'pi bilan 3 marta naqshiga mos — 03-06.10'da aynan
shu soat oralig'ida sana-trigger anomaliyasi to'rt marta kuzatilgani uchun bu tekshiruvda ham
sanaga alohida e'tibor beriladi).

**Davomi (07.10.2026, ~09:57 UTC / ~14:57 mahalliy) — SANA-TRIGGER ANOMALIYASI BESHINCHI MARTA
KETMA-KET TAKRORLANDI:** Bugungi uchinchi (oxirgi) tekshiruvda "Sana:" katakchasi (Kunlik_Panel
A1/F1) **2026-10-08**ni ko'rsatdi — haqiqiy UTC vaqt hali 2026-10-07 09:57 edi (konteyner soatiga
ko'ra tasdiqlangan, mahalliy ~14:57 Toshkent). Bu 03.10 (~14:55), 04.10 (~14:56), 05.10 (~15:03)
va 06.10 (~14:59) kunlarida kuzatilgan xuddi shu anomaliya — BESHINCHI marta ketma-ket, va
BESHTASI HAM ~14:55-15:03 Toshkent vaqti oralig'ida sodir bo'lgan. Bu safar qo'shimcha, ilgari
kuzatilmagan belgi ham bor edi: "Bugun MINUSga tushadiganlar" 0 tadan 31 taga sakrab ketdi va
"ENG USTUVOR 10 DETAL" ro'yxatidagi BARCHA qatorlar "Ustuvorlik: SHOSHILINCH!" va "Necha kunga
yetadi: 0" ko'rsatdi (avval "Yuqori"/"1 kun" edi, "Kerak (dona)" raqamlari ham kattalashgan) —
bu, oldingi kunlardagi "hammasi Kerak emas" holatiga teskari, lekin xuddi shunday ishonchsiz:
tizim "yangi kun (08.10) boshlandi, hali plan yo'q" deb hisoblab, zaxirani noldan hisoblayotganga
o'xshaydi. "Plan berilganmi (Berilgan_Plan)" (yangi, noto'g'ri 08.10 sanasida) "✗ Hali yo'q", shuning
uchun bu raqamlarga ham ishonib bo'lmaydi. Bugungi (07.10.2026) uchun hech narsa (Oktabr ASTATKA,
Artifact, GitHub Pages) nashr qilinmadi/o'zgartirilmadi. Bu bugungi UCHINCHI (oxirgi) tekshiruv
bo'lgani uchun bugun uchun yangi send_later yuborilmadi — ertangi standart kunlik vazifa
(CRON_TZ=Asia/Tashkent 07:47) o'zi yangi kun bilan davom etadi. Foydalanuvchiga PushNotification
orqali xabar qilindi — bu endi BESHINCHI marta ketma-ket (har safar aynan shu ~15:00 Toshkent vaqt
oynasida) takrorlangan tizimli belgi, ustiga ustak bu safar Plan_Berish qiymatlari ham yangi
(noto'g'ri) tomonga (haddan tashqari shoshilinch) siljidi — manba jadvalning "Kunlik_Panel" sanasini
belgilaydigan Apps Script/trigger vaqt mintaqasini zudlik bilan tekshirish va tuzatish tavsiya
etiladi, chunki besh kunlik barqaror naqsh buni tasodif emasligini tasdiqlaydi.

**08.10.2026, ~02:48 UTC / ~07:48 mahalliy (standart kunlik vazifa, CRON_TZ=Asia/Tashkent 07:47) —
YANGI TUR ANOMALIYA (ORQAGA SILJISH):** Kunlik_Panel tekshirildi: "Sana:" katakchasi (A1/F1)
**2026-10-07**ni ko'rsatdi — ya'ni haqiqiy bugungi kundan (2026-10-08) BIR KUN ORQADA, konteyner
vaqti 2026-10-08 02:48 UTC bilan tasdiqlangan holda. Bu ilgari besh marta kuzatilgan anomaliyadan
(sana ~15:00 Toshkentda OLDINGA, ertangi kunga siljiydi) FARQLI yo'nalish: bu safar ertalabki
tekshiruvda sana haqiqiy kundan ORQADA qoldi, holbuki oldingi kunlarning har birida (02.10-07.10)
ertalabki tekshiruvda sana har doim TO'G'RI (bugungi kun bilan mos) edi. Ehtimoliy izoh: 07.10 kuni
~14:57 mahalliyda sana anomal ravishda 2026-10-08'ga sakrab ketgan edi (beshinchi marta); so'ng
kechqurun/tun davomida manba trigger normal yo'l bilan sanani "to'g'irlashga" harakat qilib,
haqiqiy 07.10 kuni uchun mo'ljallangan qiymatni yozgan bo'lishi mumkin (ya'ni ikki marta ketma-ket
yangilanish — biri anomal oldinga, keyin "normal" trigger o'zining hali 07.10 deb hisoblagan
qiymatini yozib qo'ygan) — bu taxmin, tasdiqlanmagan. Natija bir xil: Kunlik_Panel sanasiga bugun
ham ishonib bo'lmaydi. Holat ustunlari: "Fakt kiritilganmi: ✓ Kiritilgan", "Chiqim kiritilganmi:
✓ Kiritilgan", "Plan berilganmi (Berilgan_Plan): ✗ Hali yo'q", "IMM_Fact to'ldirilganmi: ✗ Hali
yo'q" — "Plan berilganmi" baribir "✗ Hali yo'q" bo'lgani uchun (sana to'g'ri bo'lganida ham) MUHIM
bo'limiga ko'ra bugun uchun hech narsa (Oktabr ASTATKA, rebuild, Kirim/Chiqim arxiv, Artifact,
GitHub Pages) nashr qilinmadi/o'zgartirilmadi — oddiy ertalabki "reja hali tuzilmagan" holati bilan
bir xil xulosaga olib keladi, shuning uchun bu safar foydalanuvchiga alohida PushNotification
yuborilmadi (sana-anomaliyaning yo'nalishi yangi bo'lsa-da, oqibat — nashrni kechiktirish —
o'zgarmadi; agar kunning keyingi tekshiruvlarida ham sana beqaror bo'lib qolaversa yoki nashrga
to'sqinlik davom etsa, bu albatta qayd etiladi). ~4 soatdan keyin (taxminan 06:48 UTC / ~11:48
mahalliy) shu sessiya o'zi qayta tekshiradi (send_later orqali rejalashtirilgan).

**Davomi (08.10.2026, ~06:53 UTC / ~11:53 mahalliy) — SANA "YOPISHIB QOLGAN" (yangi, jiddiyroq
holat):** Ikkinchi tekshiruv. "Plan berilganmi (Berilgan_Plan)" ENDI "✓ Berilgan" ko'rsatadi ("Fakt"
va "Chiqim" ham ✓, faqat "IMM_Fact to'ldirilganmi" hamon "✗ Hali yo'q") — ya'ni sirtdan qarasa nashr
qilish mumkin bo'lib ko'rinadi. LEKIN sana katakchasi (Kunlik_Panel F1, va manba Balans!AJ1, va
Plan_Berish!B2 — uchtasi ham) hamon **2026-10-07**ni ko'rsatmoqda — haqiqiy bugungi kun 2026-10-08
(konteyner vaqti 06:53 UTC = ~11:53 Toshkent bilan tasdiqlangan). Demak sana birinchi tekshiruvdan
(~07:48 mahalliy, shunda ham 10-07 edi) buyon 4 soatdan ortiq **O'ZGARMAGAN** — bu ilgari besh marta
kuzatilgan "soat ~15:00da oldinga sakrash so'ngra ertasi kuni o'z-o'zidan to'g'rilanish" naqshidan
TUBDAN FARQLI: bu safar sana ertalabdan beri butunlay YOPISHIB QOLGAN (kechagi 10-07da muzlagan),
va — eng muhimi — "Plan berilganmi" belgisi SHU muzlagan (noto'g'ri) sana uchun "✓" bo'lib qoldi.
Ya'ni Plan_Berish'dagi raqamlar aslida 07.10 kuni uchun berilgan rejaga tegishli bo'lishi mumkin,
08.10 uchun emas — tashqi ko'rinishda "tayyor" signal bersa ham. MUHIM bo'limiga ko'ra bu holatda
ham Plan_Berish'ga ISHONIB BO'LMAYDI (sana bugungi kun bilan mos emas), shuning uchun Oktabr
ASTATKA yuklab olinmadi va hech narsa (rebuild, arxiv, Artifact, GitHub Pages) nashr
qilinmadi/o'zgartirilmadi. Bu — "Plan berilganmi: ✓" holati sana noto'g'ri bo'lgan paytda birinchi
marta kuzatilgani va sana "jump" emas balki "frozen" ko'rinishi sababli — foydalanuvgaga
PushNotification orqali xabar qilindi (ilgarigi besh martalik "oldinga sakrash" naqshidan farqli,
yangi va potentsial xavfliroq belgi: manba jadval sanasi butunlay to'xtab qolgan bo'lishi mumkin).
Bugungi uchinchi (oxirgi) tekshiruv ~3-4 soatdan keyin (taxminan 09:53-10:53 UTC / ~14:53-15:53
mahalliy) rejalashtirildi — aynan shu vaqt oynasida ilgari besh marta sana-anomaliyasi kuzatilgani
uchun bu tekshiruvda sanaga alohida e'tibor beriladi.

**Davomi (08.10.2026, ~10:27 UTC / ~15:27 mahalliy) — UCHINCHI TEKSHIRUV: SANA O'ZI TO'G'IRLANDI,
KUNLIK YANGILASH BAJARILDI:** Sana endi **2026-10-08** bilan mos (Kunlik_Panel F1, Balans!AJ1,
Plan_Berish!B2 — uchtasi ham) — kechagi "yopishib qolgan" holat o'z-o'zidan tuzalgan (qo'shimcha
aralashuv shart bo'lmadi). "Plan berilganmi: ✓ Berilgan", ikki marta ketma-ket yuklab solishtirilganda
NEED_TOTAL=45637 barqaror chiqdi — Plan_Berish!F2 bilan ham mos. Shuning uchun to'liq kunlik
yangilash bajarildi:
- Oktabr ASTATKA yuklandi; `rebuild_dash.py`: N_DAYS=7, NEED_TOTAL=45637, 116 qator, crit=0, high=32.
- `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 7 kun, kerak=45637" — XAVFLI xato yo'q.
- `archive_kirim_month.py ... all`: **bitta haqiqiy dastur xatosi topildi va tuzatildi** — skript
  `month=="all"` holatini hech qachon alohida ko'rib chiqmagan edi (`month_of(r[0]) == month` sharti
  "all" satriga hech qachon teng kelmaydi), shuning uchun 02.10'dan beri har kungi "all" bilan
  chaqiruv aslida HECH QACHON yangi yozuv qo'shmagan (arxivda hamon faqat 02.10'da qo'lda qo'shilgan
  4 ta sentabr yozuvi bor edi). Skriptga `if month=='all': barcha qatorlar olinadi` degan maxsus holat
  qo'shildi. AMALIYOTDA buning ta'siri HOZIRCHA NOL: "AppSheet_Kirim" varag'ining o'zi (Oktabr ASTATKA
  faylida) hozircha sarlavhadan boshqa hech qanday qator-ma'lumotga ega emas (Google Drive'ning o'z
  "table range" metadatasi ham A1:AK1 deb ko'rsatadi) — bu 02.10'dan beri shunday (o'sha kungi birinchi
  bake_kirim_snapshot natijasi ham faqat sarlavha edi). Ya'ni jamoa Kirim/Chiqim jurnalini hali
  to'ldirmagan (yoki boshqa sababga ko'ra bo'sh) — bu kod xatosi emas, operatsion holat; agar/qachon
  jurnal to'ldirilsa, endi tuzatilgan skript uni to'g'ri arxivlaydi.
- `bake_kirim_snapshot.py`: OK, 0 ta yozuv (yuqoridagi sabab bilan bir xil), vaqt belgisi yangilandi.
- `node build_login.js`: muvaffaqiyatli, parollar o'zgarmadi (barchasi "uk123456").
- Playwright tekshiruvi (`source/playwright_check.js`, kelajakda qayta ishlatish uchun repo'da
  qoldirildi): barcha uch hisob (ombor/admin/apm) login xatosiz ishladi; ombor hisobida Tahlil
  paneli tabi YO'Q (to'g'ri, kutilgandek); Oktabr KPI: Jami qoldiq 134 513/116 detal, Shoshilinch
  yetishmovchilik 0, Tugagan detallar 32 (0 tasi shoshilinch), Ishlab chiqarildi 62 911 (1-7 okt),
  Jo'natildi 48 743. Sentabr filtri (2026-09-01..2026-09-30) qo'llanganda: Ishlab chiqarildi
  **646 593 dona, 1-29 sen** — talab qilingan tekshiruv qiymati bilan AYNAN mos, sentabr o'zgarmagan
  holda tasdiqlandi. Konsol xatolari faqat tarmoq/CDN bloklanishi edi (`ERR_TUNNEL_CONNECTION_FAILED`
  — Chart.js/boshqa CDN so'rovlari sandboxda bloklangan, kutilgan holat), ilova mantig'ida xato yo'q.
- Claude Artifact (https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5): o'qildi (viewed), so'ng
  `quyish-login.html` bilan `capabilities`siz nashr qilindi — "newer version" xatosi chiqmadi, eski
  db/downloads ruxsatlari saqlanib qoldi.
- GitHub Pages: `index.html` (= yangi `quyish-login.html`), `source/quyish-open.html` va
  `source/archive_kirim_month.py` (bug fix) shu commitda push qilindi; `source/playwright_check.js`
  ham repo'ga qo'shildi (kelajakdagi kunlik Playwright tekshiruvlari uchun qayta ishlatiladigan skript).

Xulosa: bugun (08.10.2026) kunlik yangilash MUVAFFAQIYATLI yakunlandi — 7 kunlik oktabr ma'lumoti
bilan (uchinchi tekshiruvda, sana o'zi tuzalgandan keyin). Ertangi standart kunlik vazifa
(CRON_TZ=Asia/Tashkent 07:47) odatdagidek davom etadi.

**09.10.2026, ~02:48 UTC / ~07:48 mahalliy (standart kunlik vazifa, CRON_TZ=Asia/Tashkent 07:47) —
SANA YANA ORQADA (IKKINCHI MARTA KETMA-KET):** Manba jadval (`1I4GbqRL-r9_0pDiIL0hQatOSv_dAriYT5XbMr5K8Vv4`,
"Kunlik_Panel" varag'i) tekshirildi. Texnik eslatma: bu safar `mcp__Google_Drive__read_file_content`
haqiqiy katak qiymatlarini QAYTARMADI (fayl juda katta — 30+ varaq — faqat range metadata chiqdi);
shuning uchun to'liq fayl `download_file_content` (xlsx) bilan yuklab olindi va openpyxl bilan
Kunlik_Panel o'qildi — kelajakda read_file_content ishlamasa shu usul ishlatilsin.

Natija: "Sana:" katakchasi (A1/F1) **2026-10-08**ni ko'rsatdi — haqiqiy bugungi kun 2026-10-09
(konteyner vaqti 02:48 UTC bilan tasdiqlangan), ya'ni yana BIR KUN ORQADA. Bu AYNAN 08.10.2026
ertalabki birinchi tekshiruvda kuzatilgan "orqaga siljish" naqshi — endi IKKINCHI marta KETMA-KET
(ikki kun ketma-ket ertalab). Holat ustunlari: "Fakt kiritilganmi: ✓ Kiritilgan", "Chiqim
kiritilganmi: ✓ Kiritilgan", "Plan berilganmi (Berilgan_Plan): ✓ Berilgan", "IMM_Fact
to'ldirilganmi: ✗ Hali yo'q". Bu AYNAN 08.10'ning ikkinchi tekshiruvida ("sana yopishib qolgan")
kuzatilgan xavfli kombinatsiya bilan bir xil: "Plan berilganmi" ✓ ko'rinadi, LEKIN sana
muzlagan/orqada bo'lgani uchun bu raqamlar aslida KECHAGI (08.10) kuniga tegishli bo'lishi mumkin,
bugungi (09.10) kunga emas — garchi 08.10 kuni kechqurun (~15:27 mahalliyda) allaqachon
muvaffaqiyatli nashr qilingan bo'lsa ham (7 kunlik ma'lumot bilan). MUHIM bo'limiga ko'ra bu
holatda Plan_Berish'ga ISHONIB BO'LMAYDI (sana bugungi kun bilan mos emas), shuning uchun Oktabr
ASTATKA yuklab olinmadi va hech narsa (rebuild, Kirim/Chiqim arxiv, Artifact, GitHub Pages) nashr
qilinmadi/o'zgartirilmadi. Foydalanuvchiga PushNotification orqali xabar qilindi — "sana orqada +
Plan ✓" xavfli kombinatsiyasi endi IKKINCHI marta ketma-ket kuzatildi, manba jadvalning kunlik
trigger skripti (Balans!AJ1) ishga tushish vaqti/vaqt mintaqasini tekshirish tavsiya etiladi.
~4 soatdan keyin (taxminan 06:48 UTC / ~11:48 mahalliy) shu sessiya o'zi qayta tekshiradi
(send_later orqali rejalashtirilgan).

**Davomi (09.10.2026, ~06:53 UTC / ~11:53 mahalliy):** Ikkinchi tekshiruv (send_later orqali
o'z-o'ziga rejalashtirilgan eslatma bilan) — "Sana:" katakchasi hamon **2026-10-08** (haqiqiy
bugungi kun 2026-10-09, konteyner vaqti 06:53 UTC bilan tasdiqlangan) — ya'ni birinchi tekshiruvdan
(~02:48 UTC) buyon 4 soatdan ortiq O'ZGARMAGAN, 08.10'da kuzatilgan "sana yopishib qolgan" holatiga
o'xshash. "Fakt kiritilganmi: ✓", "Chiqim kiritilganmi: ✓", "Plan berilganmi (Berilgan_Plan): ✓
Berilgan", "IMM_Fact to'ldirilganmi: ✗ Hali yo'q" — birinchi tekshiruv bilan AYNAN bir xil (o'zgarish
yo'q). MUHIM bo'limiga ko'ra sana bugungi kun bilan mos emasligi sababli Plan_Berish'ga hamon
ISHONIB BO'LMAYDI, shuning uchun Oktabr ASTATKA yuklab olinmadi va hech narsa nashr
qilinmadi/o'zgartirilmadi. Bu ertalabki tekshiruv bilan bir xil holat (yangi ma'lumot yo'q) bo'lgani
uchun qo'shimcha PushNotification yuborilmadi. Bugungi uchinchi (oxirgi) tekshiruv ~3-4 soatdan keyin
(taxminan 10:00-10:53 UTC / ~15:00-15:53 mahalliy) rejalashtirildi — aynan shu vaqt oynasida ilgari
bir necha marta sana-anomaliyasi/tuzalishi kuzatilgani uchun bu tekshiruvda ham sanaga alohida
e'tibor beriladi.

**Davomi (09.10.2026, ~10:13 UTC / ~15:13 mahalliy) — UCHINCHI TEKSHIRUV: SANA O'ZI TO'G'IRLANDI,
KUNLIK YANGILASH BAJARILDI:** Sana endi **2026-10-09** bilan mos (Kunlik_Panel F1) — "Fakt
kiritilganmi: ✓", "Chiqim kiritilganmi: ✓", "Plan berilganmi: ✓ Berilgan", "IMM_Fact
to'ldirilganmi: ✓ To'ldirilgan" (to'rttasi ham ✓ — bu haftaning eng yaxshi holati). Oktabr ASTATKA
ikki marta ketma-ket yuklab solishtirildi — Plan_Berish!B2=2026-10-09, F2 (Jami kerakli dona)=41432
ikkalasida ham bir xil, barqaror. Shuning uchun to'liq kunlik yangilash bajarildi:
- `rebuild_dash.py`: N_DAYS=8 (1-8 okt), NEED_TOTAL=41432, 116 qator, crit=0, high=19 — XAVFLI xato
  yo'q.
- `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 8 kun, kerak=41432" — XAVFLI xato yo'q.
- `archive_kirim_month.py ... all`: 0 ta yangi yozuv (AppSheet_Kirim hamon faqat sarlavha — jamoa
  jurnalni hali to'ldirmagan, 02.10'dan beri bir xil holat, kod xatosi emas). Arxivda hamon 4 ta
  sentabr yozuvi.
- `bake_kirim_snapshot.py`: OK, 0 ta yozuv, vaqt belgisi yangilandi.
- `node build_login.js`: muvaffaqiyatli, parollar o'zgarmadi.
- Playwright tekshiruvi (`source/playwright_check.js`): barcha hisoblar xatosiz login qildi; Oktabr
  KPI (1-8 okt filtri): Jami qoldiq 121 363/116 detal, Shoshilinch yetishmovchilik 0, Tugagan
  detallar 31 (0 shoshilinch), Ishlab chiqarildi 87 123, Jo'natildi 86 105. Sentabr filtri
  (2026-09-01..2026-09-30): Ishlab chiqarildi **646 593 dona, 1-29 sen** — talab qilingan tekshiruv
  qiymati bilan AYNAN mos, sentabr o'zgarmagan holda tasdiqlandi. Konsol xatolari faqat CDN
  bloklanishi (ERR_TUNNEL_CONNECTION_FAILED, kutilgan, ilova mantig'ida xato yo'q).
- Claude Artifact (https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5): o'qildi (viewed), so'ng
  `quyish-login.html` bilan `capabilities`siz nashr qilindi (Version 47) — "newer version" xatosi
  chiqmadi.
- GitHub Pages: `index.html` va `source/quyish-open.html` shu commitda push qilinadi.

Xulosa: bugun (09.10.2026) kunlik yangilash MUVAFFAQIYATLI yakunlandi — 8 kunlik oktabr ma'lumoti
bilan (uchinchi tekshiruvda, sana ertalabki ikki tekshiruvda orqada bo'lgandan keyin o'z-o'zidan
to'g'irlangach). Bu safar sana-anomaliyasi (orqaga siljish) ikkinchi kun ketma-ket birinchi va
ikkinchi tekshiruvda kuzatilgan bo'lsa ham, uchinchi (kechqurungi) tekshiruvda yana muvaffaqiyatli
tuzalgani kuzatildi — bu 08.10'dagi naqshga mos ("ertalab orqada, kech tushgacha o'zi tuzaladi").
Ertangi standart kunlik vazifa (CRON_TZ=Asia/Tashkent 07:47) odatdagidek davom etadi.

**10.10.2026, ~02:51 UTC / ~07:51 mahalliy (standart kunlik vazifa, CRON_TZ=Asia/Tashkent 07:47) —
SANA YANA ORQADA (UCHINCHI MARTA KETMA-KET XAVFLI KOMBINATSIYA):** Manba jadval
(`1I4GbqRL-r9_0pDiIL0hQatOSv_dAriYT5XbMr5K8Vv4`) xlsx qilib yuklab olindi (`read_file_content` bu
safar ham faqat range-metadata qaytardi — katta fayl, 30+ varaq — shuning uchun `download_file_content`
+ openpyxl ishlatildi, 09.10'dagi eslatmaga mos). Natija: Kunlik_Panel F1 ("Sana:") = **2026-10-09**,
Balans!AJ1 = 2026-10-09, Plan_Berish!B2 = 2026-10-09 — uchtasi ham bir xil, lekin haqiqiy bugungi kun
2026-10-10 (konteyner vaqti 02:51 UTC bilan tasdiqlangan) — ya'ni yana BIR KUN ORQADA. Holat ustunlari:
"Fakt kiritilganmi: ✓ Kiritilgan", "Chiqim kiritilganmi: ✓ Kiritilgan", "Plan berilganmi
(Berilgan_Plan): ✓ Berilgan", "IMM_Fact to'ldirilganmi: ✓ To'ldirilgan" — to'rttasi ham ✓. Bu AYNAN
08.10 (ikkinchi tekshiruv) va 09.10 (birinchi tekshiruv)da kuzatilgan "sana orqada + Plan ✓" xavfli
kombinatsiyasi — endi UCHINCHI marta (bu aniq kombinatsiya bo'yicha), lekin bu safar hatto IMM_Fact
ham ✓ (avvalgi ikki holatda IMM_Fact hali "✗ Hali yo'q" edi) — ya'ni manba jadval o'zi kechagi (09.10)
kunni "to'liq yopilgan" deb hisoblamoqda, bugungi (10.10) kun uchun esa hali umuman mavjud emas.
Plan_Berish!F2 (Jami kerakli dona) = 44125 — bu raqam 09.10 kuniga tegishli bo'lishi mumkin, 10.10
uchun emas. MUHIM bo'limiga ko'ra bu holatda Plan_Berish'ga ISHONIB BO'LMAYDI (sana bugungi kun bilan
mos emas), shuning uchun Oktabr ASTATKA yuklab olinmadi va hech narsa (rebuild_dash, apply_dash_update,
Kirim/Chiqim arxiv/snapshot, APM, Artifact, GitHub Pages) nashr qilinmadi/o'zgartirilmadi — butun
kunlik oqim bitta nashrga birlashtirilgani uchun qisman nashr qilinmadi. Foydalanuvgaga PushNotification
orqali xabar qilindi — bu "sana orqada + Plan/IMM_Fact ✓" xavfli kombinatsiyasi endi UCHINCHI marta
(va eng to'liq ✓ holatda) kuzatildi, manba jadvalning kunlik sana-trigger mexanizmi (Balans!AJ1)
hamon tuzatilmagan ko'rinadi. ~4 soatdan keyin (taxminan 06:51 UTC / ~11:51 mahalliy) shu sessiya
o'zi qayta tekshiradi (send_later orqali rejalashtirilgan, 08.10-09.10'dagi naqshga mos).

**Davomi (10.10.2026, ~06:53 UTC / ~11:53 mahalliy):** Ikkinchi tekshiruv (send_later orqali
o'z-o'ziga rejalashtirilgan eslatma bilan) — "Sana:" katakchasi (Kunlik_Panel F1, Balans!AJ1,
Plan_Berish!B2 — uchtasi ham) hamon **2026-10-09** (haqiqiy bugungi kun 2026-10-10, konteyner vaqti
06:53 UTC bilan tasdiqlangan) — ya'ni birinchi tekshiruvdan (~02:51 UTC) buyon 4 soatdan ortiq
O'ZGARMAGAN, 08.10/09.10'da kuzatilgan "sana yopishib qolgan" holatiga mos. Fakt/Chiqim/Plan/IMM_Fact
to'rttasi ham hamon ✓ (birinchi tekshiruv bilan bir xil), lekin Plan_Berish!F2 (Jami kerakli dona)
43696 ga o'zgardi (birinchi tekshiruvda 44125 edi) — ya'ni "muzlagan" sanaga qaramay, ortidagi
hisob-kitob hamon biroz siljib turibdi (statik keshlanган emas). Bu MUHIM bo'limiga ko'ra sanaga
ishonib bo'lmasligini o'zgartirmaydi, shuning uchun Oktabr ASTATKA yuklab olinmadi va hech narsa
nashr qilinmadi/o'zgartirilmadi. Ertalabki tekshiruv bilan bir xil holat (faqat ichki raqam ozgina
siljigan, sana hamon noto'g'ri) bo'lgani uchun qo'shimcha PushNotification yuborilmadi. Bugungi
uchinchi (oxirgi) tekshiruv ~4 soatdan keyin (taxminan 10:53 UTC / ~15:53 mahalliy) rejalashtirildi —
aynan shu vaqt oynasida ilgari bir necha marta sana-anomaliyasi/tuzalishi kuzatilgani uchun bu
tekshiruvda ham sanaga alohida e'tibor beriladi.

**Davomi (10.10.2026, ~10:57 UTC / ~15:57 mahalliy) — UCHINCHI (OXIRGI) TEKSHIRUV: SANA O'ZI
TO'G'IRLANDI, LEKIN BUGUNGI REJA HALI YO'Q:** Sana endi **2026-10-10** bilan mos (Kunlik_Panel F1,
Balans!AJ1, Plan_Berish!B2 — uchtasi ham) — ertalabki/tushdagi "09.10'da yopishib qolgan" holat
aynan shu (~15:57 mahalliy) vaqt oynasida o'z-o'zidan tuzalgan (ilgarigi bir necha martalik naqshga
mos). LEKIN "Plan berilganmi (Berilgan_Plan)" endi "✗ Hali yo'q" (Fakt/Chiqim/IMM_Fact uchtasi ham
✓) — sana to'g'irlangach tizim bugungi (10.10) kun uchun rejani hali tuzmagan holatga qaytdi (sana
kecha 09.10'da "muzlab" turganda ko'rsatilgan ✓ aslida 09.10 kuniga tegishli bo'lgani, 10.10 uchun
umuman yangi reja bo'lmagani endi tasdiqlandi). MUHIM bo'limiga ko'ra "Plan berilganmi" aniq
"✓ Berilgan" bo'lmaguncha Plan_Berish'dagi raqamlarga (F2=43667) ishonib bo'lmaydi, shuning uchun
Oktabr ASTATKA yuklab olinmadi va hech narsa (rebuild, Kirim/Chiqim arxiv/snapshot, APM, Artifact,
GitHub Pages) nashr qilinmadi/o'zgartirilmadi.

**Bugungi (10.10.2026) kun xulosasi:** uch marta tekshirildi (02:51, 06:53, 10:57 UTC) — birinchi
ikkisida sana 09.10'da "yopishib qolgan" edi (xavfli "sana orqada + Plan ✓" kombinatsiyasi, bu aniq
kombinatsiya bo'yicha UCHINCHI marta ketma-ket, PushNotification birinchi tekshiruvda yuborildi),
uchinchisida sana tuzaldi-yu, endi bugungi reja hali tuzilmagan ("Plan berilganmi: ✗") holatiga
o'tdi. Natijada BUGUN HECH NARSA (Artifact, GitHub Pages) nashr qilinmadi/o'zgartirilmadi — saytda
hamon 09.10.2026'da nashr qilingan 8 kunlik (1-8 okt) holat qolmoqda. Bu bugungi OXIRGI tekshiruv
bo'lgani uchun bugun uchun yangi send_later yuborilmadi — ertangi standart kunlik vazifa
(CRON_TZ=Asia/Tashkent 07:47) yangi kun bilan davom etadi. Foydalanuvchiga yakuniy PushNotification
yuborildi.

**11.10.2026, ~02:48 UTC / ~07:48 mahalliy (standart kunlik vazifa, CRON_TZ=Asia/Tashkent 07:47) —
SANA YANA ORQADA:** Manba jadval (`1I4GbqRL-r9_0pDiIL0hQatOSv_dAriYT5XbMr5K8Vv4`) xlsx qilib yuklab
olindi (`download_file_content` + openpyxl, oldingi kunlardagi usul bilan — `read_file_content` bu
safar ham faqat range-metadata qaytargan bo'lardi, shuning uchun to'g'ridan-to'g'ri xlsx ishlatildi).
Natija: Kunlik_Panel F1 ("Sana:") = **2026-10-10** — haqiqiy bugungi kun 2026-10-11 (konteyner vaqti
02:48 UTC bilan tasdiqlangan), ya'ni yana BIR KUN ORQADA (08-10.10'dagi ertalabki "orqaga siljish"
naqshiga mos). Holat ustunlari: "Fakt kiritilganmi: ✓ Kiritilgan", "Chiqim kiritilganmi:
✓ Kiritilgan", "Plan berilganmi (Berilgan_Plan): ✗ Hali yo'q", "IMM_Fact to'ldirilganmi:
✓ To'ldirilgan". Bu safar "Plan berilganmi" ✗ bo'lgani uchun (xavfli "sana orqada + Plan ✓"
kombinatsiyasi EMAS — faqat oddiy "reja hali tuzilmagan" holati, sana orqada bo'lsa ham), MUHIM
bo'limiga ko'ra ham sana mosligi, ham "Plan berilganmi: ✓" talab qilinganidan kelib chiqib,
Plan_Berish'ga ishonib bo'lmaydi. Shuning uchun Oktabr ASTATKA yuklab olinmadi va hech narsa
(rebuild_dash, apply_dash_update, Kirim/Chiqim arxiv/snapshot, APM, Artifact, GitHub Pages) nashr
qilinmadi/o'zgartirilmadi — saytda hamon 09.10.2026'da nashr qilingan 8 kunlik (1-8 okt) holat
qolmoqda (bu endi IKKINCHI kun ketma-ket yangilanmay qolgan holat — 10.10 ham o'tkazib yuborilgan
edi). Bu oddiy ertalabki "reja hali tuzilmagan" holati (xavfli ✓ kombinatsiyasi emas) bo'lgani uchun
foydalanuvchiga alohida PushNotification yuborilmadi. ~4 soatdan keyin (taxminan 06:48 UTC / ~11:48
mahalliy) shu sessiya o'zi qayta tekshiradi (send_later orqali rejalashtirilgan).

Eslatma (repo gigienasi): bugungi tekshiruvda avvalgi sessiyaning oxirgi hujjat-commiti (10.10.2026
kun xulosasi) local repo'da "detached HEAD"da qolib, main branch'ga hali birlashtirilmagan holatda
topildi (origin/main'da esa bor edi — faqat local klonning "main" ref'i eskirgan edi). Fast-forward
merge bilan tuzatildi, ma'lumot yo'qolmadi; bu safar hech qanday push kerak bo'lmadi (origin allaqachon
yangilangan edi).

**Davomi (11.10.2026, ~06:52 UTC / ~11:52 mahalliy):** Ikkinchi tekshiruv (send_later orqali
o'z-o'ziga rejalashtirilgan eslatma bilan) — Kunlik_Panel F1 ("Sana:") hamon **2026-10-10** (haqiqiy
bugungi kun 2026-10-11, konteyner vaqti 06:52 UTC bilan tasdiqlangan) — ya'ni birinchi tekshiruvdan
(~02:48 UTC) buyon 4 soatdan ortiq O'ZGARMAGAN, 08-10.10'da bir necha marta kuzatilgan "sana yopishib
qolgan" holatiga mos. "Plan berilganmi (Berilgan_Plan)" ham hamon "✗ Hali yo'q" (Fakt/Chiqim/IMM_Fact
uchtasi ✓, birinchi tekshiruv bilan bir xil — o'zgarish yo'q). Xavfli "sana orqada + Plan ✓"
kombinatsiyasi EMAS, shuning uchun MUHIM bo'limiga ko'ra Plan_Berish'ga hamon ishonib bo'lmaydi va
Oktabr ASTATKA yuklab olinmadi, hech narsa nashr qilinmadi/o'zgartirilmadi. Birinchi tekshiruv bilan
bir xil (yangi ma'lumot yo'q) holat bo'lgani uchun qo'shimcha PushNotification yuborilmadi. Bugungi
uchinchi (oxirgi) tekshiruv ~3-4 soatdan keyin (taxminan 09:52-10:52 UTC / ~14:52-15:52 mahalliy)
rejalashtirildi — bu bugun ikkinchi kun ketma-ket (10.10 ham o'tkazib yuborilgan) nashr qilinmay
qolish xavfi borligi uchun uchinchi tekshiruv natijasi, baribir chiqmasa, albatta PushNotification
bilan xabar qilinadi.

**Davomi (11.10.2026, ~10:45 UTC / ~15:45 mahalliy) — UCHINCHI (OXIRGI) TEKSHIRUV: SANA O'ZI
TO'G'IRLANDI, LEKIN BUGUNGI REJA UMUMAN HALI BOSHLANMAGAN:** Kunlik_Panel F1 ("Sana:") endi
**2026-10-11** bilan mos (ertalabki/tushdagi "10.10'da yopishib qolgan" holat aynan shu
(~15:45 mahalliy) vaqt oynasida o'z-o'zidan tuzalgan — 08-10.10'dagi naqshga mos). LEKIN bu safar
sana to'g'irlangandan keyin "Fakt kiritilganmi", "Chiqim kiritilganmi" VA "Plan berilganmi
(Berilgan_Plan)" — uchtasi ham "✗ Hali yo'q" (faqat "IMM_Fact to'ldirilganmi" ✓, bu kechagi 10.10
kuniga tegishli bo'lishi mumkin). Plan_Berish!B2=2026-10-11 (to'g'ri sana), F2=43368 — lekin
"Plan berilganmi" ✗ bo'lgani uchun MUHIM bo'limiga ko'ra bu raqamga ISHONIB BO'LMAYDI. Shuning uchun
Oktabr ASTATKA yuklab olinmadi va hech narsa (rebuild, Kirim/Chiqim arxiv/snapshot, APM, Artifact,
GitHub Pages) nashr qilinmadi/o'zgartirilmadi.

**Bugungi (11.10.2026) kun xulosasi:** uch marta tekshirildi (02:48, 06:52, 10:45 UTC) — birinchi
ikkisida sana 10.10'da "yopishib qolgan" edi va Plan ✗ edi; uchinchisida sana tuzaldi (2026-10-11),
lekin bugungi kun uchun Fakt/Chiqim/Plan uchtasi ham hali umuman kiritilmagan ("reja hali
boshlanmagan" — bu 10.10'ning uchinchi tekshiruvida kuzatilgan "Plan hali yo'q" holatidan ham bir
qadam ortda, chunki bu safar Fakt/Chiqim ham ✗). Natijada BUGUN HAM HECH NARSA (Artifact, GitHub
Pages) nashr qilinmadi/o'zgartirilmadi — saytda hamon 09.10.2026'da nashr qilingan 8 kunlik (1-8 okt)
holat qolmoqda. Bu ENDI IKKI KUN KETMA-KET (10.10 va 11.10) to'liq o'tkazib yuborilgan kunlik nashr —
foydalanuvchiga PushNotification orqali xabar qilindi, chunki bu e'tiborga arzigulik: manba
jadvalning kunlik ish oqimi (jamoa tomonidan Fakt/Chiqim/Plan kiritish) so'nggi ikki kunda odatdagidan
sezilarli kech qolmoqda yoki umuman bajarilmagan bo'lishi mumkin. Bu bugungi OXIRGI tekshiruv bo'lgani
uchun yangi send_later yuborilmadi — ertangi standart kunlik vazifa (CRON_TZ=Asia/Tashkent 07:47)
yangi kun bilan davom etadi.

**12.10.2026, ~02:49 UTC / ~07:49 mahalliy (standart kunlik vazifa, CRON_TZ=Asia/Tashkent 07:47) —
SANA YANA ORQADA (BESHINCHI KUN KETMA-KET ERTALAB):** Manba jadval
(`1I4GbqRL-r9_0pDiIL0hQatOSv_dAriYT5XbMr5K8Vv4`) xlsx qilib yuklab olindi (`download_file_content` +
openpyxl bilan — oldingi kunlardagi tajribaga ko'ra `read_file_content` bu hajmdagi fayl uchun faqat
range-metadata qaytaradi). Natija: Kunlik_Panel F1 ("Sana:") = **2026-10-11** — haqiqiy bugungi kun
2026-10-12 (konteyner vaqti 02:48 UTC bilan tasdiqlangan), ya'ni yana BIR KUN ORQADA (08-11.10'dagi
ertalabki "orqaga siljish" naqshiga mos — endi BESHINCHI kun ketma-ket ertalabki tekshiruvda sana
orqada). Holat ustunlari: "Fakt kiritilganmi: ✗ Hali yo'q", "Chiqim kiritilganmi: ✗ Hali yo'q", "Plan
berilganmi (Berilgan_Plan): ✗ Hali yo'q", "IMM_Fact to'ldirilganmi: ✓ To'ldirilgan". Bu xavfli "sana
orqada + Plan ✓" kombinatsiyasi EMAS (Plan ✗) — oddiy ertalabki "reja hali tuzilmagan" holati, sana
orqada bo'lsa ham. MUHIM bo'limiga ko'ra Plan_Berish'ga ishonib bo'lmaydi, shuning uchun Oktabr
ASTATKA yuklab olinmadi va hech narsa (rebuild_dash, apply_dash_update, Kirim/Chiqim arxiv/snapshot,
APM, Artifact, GitHub Pages) nashr qilinmadi/o'zgartirilmadi — saytda hamon 09.10.2026'da nashr
qilingan 8 kunlik (1-8 okt) holat qolmoqda. Bu endi UCHINCHI kun ketma-ket (10.10, 11.10 to'liq
o'tkazib yuborilgan, 12.10 ham hozircha shunday boshlandi) nashr qilinmay qolish xavfi. Oddiy
ertalabki holat (xavfli kombinatsiya emas, va ikki kunlik umumiy o'tkazib yuborilish allaqachon
11.10 oxirida xabar qilingan) bo'lgani uchun bu tekshiruvda alohida PushNotification yuborilmadi —
lekin agar bugun kech tushgacha ham nashr qilinmasa, bu UCH KUN KETMA-KET bo'ladi va albatta xabar
qilinadi. ~4 soatdan keyin (taxminan 06:49 UTC / ~11:49 mahalliy) shu sessiya o'zi qayta tekshiradi
(send_later orqali rejalashtirilgan, 08-11.10'dagi naqshga mos).

**Davomi (12.10.2026, ~04:03 UTC / ~09:03 mahalliy) — foydalanuvchi so'rovi bilan qo'lda qayta
tekshirildi:** Manba jadval yana yuklab olindi — holat o'zgarmagan: Kunlik_Panel F1 hamon
**2026-10-11** (haqiqiy bugungi kun 2026-10-12), "Fakt kiritilganmi: ✓", "Chiqim kiritilganmi: ✓",
"Plan berilganmi (Berilgan_Plan): ✗ Hali yo'q" (birinchi tekshiruvdan farqi — Fakt/Chiqim endi ✓
bo'lgan, lekin Plan hamon ✗). Plan_Berish!B2=2026-10-11, F2=44626 — sana bugungi kun bilan mos
emasligi VA "Plan berilganmi" ✗ bo'lgani sababli, MUHIM bo'limiga ko'ra bu raqamlarga ishonib
bo'lmaydi. Shuning uchun hali ham Oktabr ASTATKA yuklab olinmadi va hech narsa (rebuild, arxiv,
APM, Artifact, GitHub Pages) nashr qilinmadi/o'zgartirilmadi. Avval rejalashtirilgan ~06:52 UTC
send_later qayta tekshiruv o'z holicha qoladi.

**Davomi (12.10.2026, ~06:54 UTC / ~11:54 mahalliy) — IKKINCHI rejalashtirilgan tekshiruv (send_later
orqali):** Manba jadval yana tekshirildi — holat birinchi tekshiruvdan (~02:49 UTC) buyon TO'LIQ
O'ZGARMAGAN: Kunlik_Panel F1 ("Sana:") hamon **2026-10-11** (haqiqiy bugungi kun 2026-10-12, 4
soatdan ortiq "yopishib qolgan" — 08-11.10'da bir necha marta kuzatilgan naqshga mos), "Fakt
kiritilganmi: ✓", "Chiqim kiritilganmi: ✓", "Plan berilganmi (Berilgan_Plan): ✗ Hali yo'q" hamon
(soat 04:03'dagi qo'lda tekshiruv bilan bir xil). Plan_Berish!F2 bu safar 42370 (04:03'da 44626 edi —
"muzlagan" sanaga qaramay ichki hisob biroz siljigan, avvalgi kunlarda kuzatilgan naqshga mos). MUHIM
bo'limiga ko'ra "Plan berilganmi" ✓ bo'lmaguncha ishonib bo'lmaydi, shuning uchun Oktabr ASTATKA
yuklab olinmadi va hech narsa nashr qilinmadi/o'zgartirilmadi. Bu birinchi tekshiruv bilan bir xil
(yangi anomaliya yo'q) holat bo'lgani uchun qo'shimcha PushNotification yuborilmadi. Bugungi
UCHINCHI (oxirgi) tekshiruv ~4 soatdan keyin (taxminan 10:54 UTC / ~15:54 mahalliy) rejalashtirildi —
aynan shu vaqt oynasida ilgari bir necha marta sana-anomaliyasi/tuzalishi kuzatilgani uchun bu
tekshiruvda ham sanaga alohida e'tibor beriladi. Agar uchinchi tekshiruvda ham nashr qilib
bo'lmasa, bu 10.10, 11.10, 12.10 — UCH KUN KETMA-KET to'liq o'tkazib yuborilgan nashr bo'ladi va
foydalanuvchiga PushNotification orqali albatta xabar qilinadi.

**Davomi (12.10.2026, ~06:54-07:10 UTC) — FOYDALANUVCHI "qayta qil" DEB SO'RAGANDAN KEYIN:
PARALLEL SESSIYA BILAN BIRLASHTIRILDI, YUQORIDAGI UCHINCHI TEKSHIRUV ENDI KERAK EMAS:** `git push`
"fast-forward emas" xatosi bilan rad etildi — origin/main'da uchta yangi commit topildi (boshqa
sessiya, Opus 5.5, ~04:10-04:23 UTC): (1) APM endi Kunlik_Panel/Plan_Berish shartiga BOG'LIQ EMAS
(yangi 3c bo'limi), (2) **ENG MUHIM — SANA QOIDASI: Rustam shaxsan tasdiqladi — Kunlik_Panel sanasi
ishlab chiqarish kunini bildiradi (smena 08:00-ertangi 07:00/08:00), ertalab KECHAGI sananing
ko'rsatilishi NORMAL, anomaliya EMAS** — shuning uchun yuqoridagi barcha "sana orqada/yopishib
qolgan/anomaliya" deb yozilgan eslatmalar (03.10-12.10) ENDI ESKIRGAN deb hisoblansin: ular "sana
= kecha + Plan ✓" holatini xato ravishda xavfli kombinatsiya deb yozgan edi — bu qoida BEKOR
qilindi. Yangi qoida: "Plan berilganmi ✗" bo'lsagina ombor/Tahlil nashri o'tkaziladi (APM baribir
nashr qilinadi), va sana-lag sababli endi hech qachon PushNotification/qayta-tekshiruv
rejalashtirilmaydi. Shu qoida asosida o'sha sessiya allaqachon BUGUNGI (12.10) kunlik yangilashni
BAJARGAN: Tahlil 1-10 okt (NEED_TOTAL=42370, 10 kun — oxirgi ishonchli yopilgan kun, chunki 11-kun
uchun Plan hamon ✗), APM 10.10'gacha, ikkala manzilga (GitHub Pages `index.html`, Claude Artifact —
version 1791779006, ~04:23 UTC) nashr qilingan. Men `git merge` bilan bu commitlarni o'z
tariximga birlashtirdim va push qildim (conflict yo'q edi). Tekshirdim: `node build_login.js`
mahalliy qayta qurilgan fayl committed `index.html` bilan mazmunan bir xil (faqat AES tasodifiy
salt farq qiladi); `python3 source/rebuild_apm.py` ENG YANGI manba (zyt, 06:54 UTC yuklangan) bilan
qayta ishga tushirilganda ABSOLUT bir xil natija berdi (diff yo'q) — ya'ni APM uchun ham yangi
ma'lumot yo'q, hech narsa o'tkazib yuborilmagan. `playwright_check.js` orqali tasdiqladim: Oktabr
(1-10 okt) KPI — Jami qoldiq 128 637/116 detal, Shoshilinch 0, Tugagan 34, Ishlab chiqarildi
140 084, Jo'natildi 131 792; Sentabr filtri (2026-09-01..2026-09-30): Ishlab chiqarildi
**646 593, 1-29 sen** — talab qilingan qiymat bilan AYNAN mos, sentabr o'zgarmagan. Konsol
xatolari faqat CDN bloklanishi (kutilgan). XULOSA: bugungi (12.10.2026) kunlik yangilash
YAKUNLANGAN hisoblanadi (parallel sessiya tomonidan, men tomonimdan tasdiqlandi/birlashtirildi) —
qo'shimcha ish shart emas. Yuqorida (06:54'da) rejalashtirilgan ~10:54 UTC uchinchi tekshiruv
send_later bekor qilindi (`delete_trigger`) — yangi SANA QOIDASIga ko'ra sana-lag sababli qayta
tekshiruv endi kerak emas, va "Plan ✗" o'zi ham (dam olish kuni/kechikish bo'lishi mumkin) yakshanba
kabi oddiy holat bo'lib, standart ertangi kunlik vazifa (CRON_TZ=Asia/Tashkent 07:47) buni o'zi
davom ettiradi. PushNotification yuborilmadi — na eski (endi bekor qilingan) sana-lag sababi, na
yangi qoida bo'yicha buning hojati yo'q.

**13.10.2026, ~02:49 UTC / ~07:49 mahalliy (standart kunlik vazifa, CRON_TZ=Asia/Tashkent 07:47) —
MUVAFFAQIYATLI YANGILANDI (YANGI SANA QOIDASI BO'YICHA BIRINCHI TO'LIQ AVTOMATIK KUN):** Manba jadval
(`1I4GbqRL-r9_0pDiIL0hQatOSv_dAriYT5XbMr5K8Vv4`) xlsx qilib yuklab olindi (`download_file_content` +
openpyxl). Kunlik_Panel F1 ("Sana:") = **2026-10-12** — kutilgan sana (Toshkent vaqti − 8 soat =
2026-10-12) bilan AYNAN mos, demak anomaliya emas. Holat: "Fakt kiritilganmi: ✗", "Chiqim
kiritilganmi: ✗", "Plan berilganmi (Berilgan_Plan): ✓ Berilgan", "IMM_Fact to'ldirilganmi:
✓ To'ldirilgan". 12.10'da Rustam tasdiqlagan YANGI SANA QOIDASIga ko'ra "Sana = kecha" + "Plan ✓"
ISHONCHLI — Fakt/Chiqim ✗ bo'lishi bu qoidaga ta'sir qilmaydi (qoida faqat sana mosligi + Plan
holatiga qarab qaror beradi). Plan_Berish!B2=2026-10-12, F2=57934 — ikkalasi Kunlik_Panel bilan mos.
Shuning uchun to'liq kunlik yangilash bajarildi:
- Oktabr ASTATKA yuklandi (`1BJJXwxWtqL6Xtokhk97GkIfY5TQ9_eJBlWK-hFguyIg`).
- `rebuild_dash.py`: N_DAYS=10 (1-10 okt, kunlik "01".."31" varaqlari 12.10'dagi bilan bir xil —
  jamoa hali 11-12-kun ma'lumotini kiritmagan, bu xato emas), NEED_TOTAL=57934, 116 qator, crit=1,
  high=30.
- `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 10 kun, kerak=57934" — XAVFLI xato yo'q.
- `archive_kirim_month.py ... all`: 0 ta yangi yozuv (AppSheet_Kirim hamon faqat sarlavha, 02.10'dan
  beri bir xil holat — kod xatosi emas). Arxivda hamon 4 ta sentabr yozuvi.
- `bake_kirim_snapshot.py`: OK, 0 ta yozuv, vaqt belgisi yangilandi.
- APM (3c): `rebuild_apm.py source/apm/apm.js /tmp/zyt.xlsx` — "Mavjud oy yangilandi: 12 kun, fakt
  140084, reja 89057 (4 kun), IMM kunlari: 8,12" — XAVFLI xato yo'q. 11-12-kun fakti hali 0 (hali
  kiritilmagan), lekin 12-kun uchun reja (23635 dona) va IMM nusxasi mavjud bo'lgani uchun skript
  ularni qo'shdi — bu normal (fakt keyinroq to'ldirilganda o'zi yangilanadi).
- `node build_login.js`: muvaffaqiyatli, parollar o'zgarmadi.
- Playwright tekshiruvi (`source/playwright_check.js` + vaqtinchalik APM tekshiruvi, keyin
  o'chirildi — repo'da saqlanmadi): barcha uch hisob xatosiz login qildi; Oktabr KPI (1-10 okt):
  Jami qoldiq 128 637/116 detal, Shoshilinch yetishmovchilik 2 dona/1 detal, Tugagan detallar 34
  (1 tasi shoshilinch), Ishlab chiqarildi 140 084, Jo'natildi 131 792. Sentabr filtri
  (2026-09-01..2026-09-30): Ishlab chiqarildi **646 593 dona, 1-29 sen** — talab qilingan qiymat
  bilan AYNAN mos, sentabr o'zgarmagan. APM "Oy" ro'yxatida "Oktabr 2026 (joriy)" va "Sentabr 2026
  (yakunlangan)" ikkalasi bor; kun ro'yxati 01.10-12.10'gacha boradi; 12-kun (so'nggi) uchun Fakt=0
  (kutilgan, hali kiritilmagan), Reja=23635 to'g'ri ko'rsatildi. Konsol xatolari faqat CDN
  bloklanishi (ERR_TUNNEL_CONNECTION_FAILED, kutilgan).
- Claude Artifact (https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5): o'qildi (viewed, versiya
  1791779006-8f2b — 12.10'dagi bilan bir xil, "newer version" muammosi yo'q), so'ng
  `quyish-login.html` bilan `capabilities`siz nashr qilindi (Version 50, 1791860048-d0dd).
- GitHub Pages: `index.html`, `source/quyish-open.html` va `source/apm/apm.js` shu commitda push
  qilinadi.

Xulosa: bugun (13.10.2026) kunlik yangilash MUVAFFAQIYATLI yakunlandi — 10 kunlik oktabr ma'lumoti
(1-10 okt) va APM 12 kun (1-12 okt, 11-12 fakt hali kutilmoqda) bilan, BIRINCHI tekshiruvda (12.10'da
tasdiqlangan yangi sana qoidasi tufayli — "sana=kecha+Plan✓" endi ishonchli deb hisoblanadi, qo'shimcha
tekshiruv/send_later kerak bo'lmadi). PushNotification yuborilmadi (muammo yo'q).

**Davomi (13.10.2026, ~07:03 UTC / ~12:03 mahalliy) — foydalanuvchi so'rovi bilan qo'lda qayta
tekshirildi, FAQAT APM YANGILANDI:** Manba jadval yana tekshirildi. Kunlik_Panel F1 ("Sana:") endi
**2026-10-13** — bugungi haqiqiy kun bilan mos (kutilgan sana = Toshkent vaqti − 8 soat = 2026-10-13,
anomaliya yo'q). "Fakt kiritilganmi: ✓", "Chiqim kiritilganmi: ✓", "Plan berilganmi (Berilgan_Plan):
✗ Hali yo'q", "IMM_Fact to'ldirilganmi: ✓". MUHIM bo'limiga ko'ra "Plan berilganmi" ✗ bo'lgani uchun
Plan_Berish'ga (B2=2026-10-13, F2=58444) hamon ishonib bo'lmaydi — shuning uchun Oktabr ASTATKA
QAYTA YUKLANMADI va ombor/Tahlil (rebuild_dash, apply_dash_update, Kirim/Chiqim arxiv/snapshot)
o'tkazib yuborildi (saytda hamon bugungi ertalabki 1-10 okt holati qoladi). LEKIN APM (3c) qoidasiga
ko'ra bu Plan_Berish holatidan mustaqil — shuning uchun APM baribir yangilandi:
`rebuild_apm.py source/apm/apm.js /tmp/zyt.xlsx` (ertalabkidan yangiroq nusxa) — "Mavjud oy
yangilandi: 12 kun, fakt 162448 (ertalab 140084 edi — 11/12-kun fakti endi kiritilgan), reja 89057
(4 kun)" — XAVFLI xato yo'q. `node build_login.js` muvaffaqiyatli. Playwright: dash/Sentabr KPI'lari
ertalabkidan o'zgarmagan (140 084 / 1-10 okt; 646 593 / 1-29 sen — tasdiqlandi), APM kun ro'yxati
01-12.10'gacha, 12-kun (dush) uchun Fakt=22 474 (avval 0 edi), Reja=23 635, bajarilish 95% — to'g'ri
ko'rsatildi. Claude Artifact o'qildi (versiya ertalabkidagi bilan bir xil, 1791860048-d0dd — "newer
version" muammosi yo'q), so'ng qayta nashr qilindi (Version 51, 1791875150-a267) — faqat apm.js
o'zgargani uchun dash/Kirim-Chiqim qismlari ertalabki holatida qoldi. GitHub Pages: `index.html` va
`source/apm/apm.js` shu commitda push qilinadi. Muammo yo'q, PushNotification yuborilmadi.

## Kirim/Chiqim jurnali (30.09.2026'da qo'shildi)

Yangi "Kirim/Chiqim" tab (admin va apm akkauntlarida, ombor'da yo'q) — "AppSheet_Kirim"
varag'idagi har bir alohida ishlab chiqarish/jo'natish yozuvini (vaqt, ishchi, IMM, qolip,
izoh bilan) ko'rsatadi. Bu butunlay client-side, jonli (brauzer to'g'ridan-to'g'ri CSV
o'qiydi, xuddi "31" varag'idagi qoldiq kabi) — kunlik avtomatik yangilash bu qismga
UMUMAN TEGMAYDI va tegishi ham shart emas. Agar kelajakda bu varaqning ustun tartibi
o'zgarsa (masalan yangi ustun qo'shilsa), `quyish-open.html` fayli oxiridagi (izohi
"Kirim/Chiqim jurnali: Sentabr ASTATKA" bo'lgan) skriptdagi `DEST` massivi va ustun
indekslarini (0-based, "27 Brigadir,29 IMM,30 Qolip" kabi izohlangan) qo'lda yangilash
kerak bo'ladi.

**Davomi (13.10.2026, ~07:50-08:00 UTC / ~12:50-13:00 mahalliy) — UCHINCHI TEKSHIRUV (standart
kunlik vazifa, 12:47 mahalliy slot), MUSTAQIL QAYTA HISOBLASH BOSHQA SESSIYA NATIJASINI TASDIQLADI:**
Manba jadvallar (zyt.xlsx, Oktabr ASTATKA) yana yuklab olindi. Kunlik_Panel F1 ("Sana:") =
**2026-10-13** (bugungi kun bilan mos, anomaliya yo'q). Holat: "Fakt: ✓", "Chiqim: ✓", "Plan
berilganmi (Berilgan_Plan): ✗ Hali yo'q", "IMM_Fact: ✓". 12.10'da tasdiqlangan YANGI SANA
QOIDASIga ko'ra Plan ✗ bo'lgani uchun NASHR O'TKAZILMAYDI — o'rniga `KEEP_PLAN=quyish-open.html
python3 rebuild_dash.py` bilan quring (kerak/ustuvorlik/NEED_TOTAL oxirgi ishonchli nashrdan
saqlanadi, kunlar/ishlab chiqarish/jo'natish/qoldiq yangilanadi). Natija: N_DAYS=12 (1-12 okt),
NEED_TOTAL=57934 (o'zgarmadi, KEEP_PLAN), crit=1, high=30 — XAVFLI xato yo'q.

Push paytida origin/main'da ALLAQACHON aynan shu natija (1-12 okt, KEEP_PLAN, NEED_TOTAL=57934)
borligi aniqlandi — boshqa sessiya (ehtimol xuddi shu 12:47 mahalliy jadvali bo'yicha, bir necha
daqiqa oldin) buni allaqachon bajargan va commit c24da07 bilan push qilgan edi ("Tahlil 1-12 okt;
KEEP_PLAN rejimi..."). Mustaqil ravishda qaytadan hisoblangan natija (rebuild_dash.py + KEEP_PLAN)
BAYT-BA-BAYT bir xil chiqdi (MONTHS massividagi 2026-10 blokining bitta harfi ham farq qilmadi) —
bu ikkita mustaqil hisoblashning bir xil manba ma'lumotidan bir xil natijaga kelishini tasdiqlaydi,
xato emas. APM (`rebuild_apm.py`) ham bir xil natija berdi (fakt 162448, 12 kun, IMM 8,12-kunlar) —
apm.js butunlay o'zgarmadi (diff yo'q).

Playwright (`playwright_check.js` + qo'shimcha APM tekshiruvi): barcha hisoblar xatosiz login
qildi. Oktabr KPI (1-12 okt): Jami qoldiq 116 933/116 detal, Shoshilinch yetishmovchilik 2 dona/1
detal, Tugagan detallar 34 (1 shoshilinch), Ishlab chiqarildi 162 448, Jo'natildi 164 860. Sentabr
filtri (2026-09-01..2026-09-30): Ishlab chiqarildi **646 593 dona, 1-29 sen** — talab qilingan
qiymat bilan AYNAN mos, sentabr o'zgarmagan. APM: "Oy" ro'yxatida "Oktabr 2026 (joriy)" va
"Sentabr 2026 (yakunlangan)"; kun ro'yxati 01-12.10; 12-kun (dush) Fakt=22 474, Reja=23 635,
bajarilish 95% — to'g'ri. Konsol xatolari faqat CDN bloklanishi (kutilgan).

Claude Artifact (https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5): o'qildi (viewed, versiya
1791875372-79d6 — boshqa sessiyaning oxirgi nashri bilan bir xil ma'lumot), so'ng
`quyish-login.html` bilan `capabilities`siz qayta nashr qilindi (Version 53, 1791878080-5f18) —
"newer version" xatosi chiqmadi. Mazmunan o'zgarish yo'q (bir xil ma'lumot, faqat yangi shifrlash
tuzi), lekin Kirim/Chiqim zaxira nusxasi (`bake_kirim_snapshot.py`) vaqt belgisi yangilandi
(12:52 mahalliy, 0 ta yozuv — AppSheet_Kirim hamon faqat sarlavha, 02.10'dan beri bir xil holat).

GitHub: `index.html` va `source/quyish-open.html` (faqat kirim-snap vaqt belgisi + login shifrlash
tuzi farqi) commit qilindi va `main`ga push qilindi (git CLI orqali, proxy avtomatik autentifikatsiya
qildi — bu usul GitHub MCP serverining katta fayllar uchun token-limit xatosiga muqobil sifatida
ishlatildi). `source/apm/apm.js` push qilinmadi, chunki o'zgarish yo'q edi.

Xulosa: bugun (13.10.2026) uchinchi tekshiruv ham MUVAFFAQIYATLI — avvalgi (parallel) sessiya
natijasi mustaqil tasdiqlandi, Kirim/Chiqim zaxirasi va Artifact versiyasi yangilandi. Muammo yo'q,
PushNotification yuborilmadi.

**14.10.2026, ~02:49 UTC / ~07:49 mahalliy (standart kunlik vazifa, CRON_TZ=Asia/Tashkent 07:47) —
MUVAFFAQIYATLI YANGILANDI (BIRINCHI TEKSHIRUVDA):** Manba jadval (`1I4GbqRL-r9_0pDiIL0hQatOSv_dAriYT5XbMr5K8Vv4`)
xlsx qilib yuklab olindi (`download_file_content` + openpyxl). Kunlik_Panel F1 ("Sana:") = **2026-10-13**
— kutilgan sana (Toshkent vaqti − 8 soat = 2026-10-13) bilan AYNAN mos, anomaliya emas. Holat: "Fakt
kiritilganmi: ✓", "Chiqim kiritilganmi: ✓", "Plan berilganmi (Berilgan_Plan): ✓ Berilgan", "IMM_Fact
to'ldirilganmi: ✓ To'ldirilgan" — to'rttasi ham ✓, bu haftaning eng toza holati. 12.10'da tasdiqlangan
SANA QOIDASIga ko'ra "Sana = kecha" + "Plan ✓" ISHONCHLI, shuning uchun to'liq kunlik yangilash
(KEEP_PLAN'siz) bajarildi:
- Oktabr ASTATKA yuklandi (`1BJJXwxWtqL6Xtokhk97GkIfY5TQ9_eJBlWK-hFguyIg`).
- `rebuild_dash.py`: N_DAYS=13 (1-13 okt), NEED_TOTAL=58507 (Plan_Berish!F2 bilan mos), 116 qator,
  crit=0, high=33 — XAVFLI xato yo'q.
- `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 13 kun, kerak=58507" — XAVFLI xato yo'q.
- `archive_kirim_month.py ... all`: AppSheet_Kirim'da ENDI birinchi marta haqiqiy yozuv paydo bo'ldi
  (02.10'dan beri bo'sh edi) — 1 ta yangi yozuv arxivlandi (arxivda jami 5 ta: 4 sentabr + 1 oktabr).
- `bake_kirim_snapshot.py`: OK, 1 ta yozuv, vaqt belgisi yangilandi (14.10.2026 07:50).
- APM (3c): `rebuild_apm.py source/apm/apm.js /tmp/zyt.xlsx` — "Mavjud oy yangilandi: 13 kun, fakt
  162448 (o'zgarmadi — 13-kun fakti hali manba jadvalda 0), reja 117487 (5 kun), IMM kunlari: 8,12,13"
  — XAVFLI xato yo'q.
- `node build_login.js`: muvaffaqiyatli, parollar o'zgarmadi.
- Playwright tekshiruvi (`source/playwright_check.js` + vaqtinchalik APM tekshiruvi, repo'da
  saqlanmadi): barcha uch hisob xatosiz login qildi; Oktabr KPI (1-13 okt): Jami qoldiq 116 870/116
  detal, Shoshilinch yetishmovchilik 0, Tugagan detallar 34, Ishlab chiqarildi 162 448, Jo'natildi
  164 923. Sentabr filtri (2026-09-01..2026-09-30): Ishlab chiqarildi **646 593 dona, 1-29 sen** —
  talab qilingan qiymat bilan AYNAN mos, sentabr o'zgarmagan. APM: "Oy" ro'yxatida "Oktabr 2026
  (joriy)" va "Sentabr 2026 (yakunlangan)" ikkalasi bor; kun ro'yxati 01.10-13.10'gacha; so'nggi
  ishonchli kun (12.10, dush) Fakt=22 474, Reja=23 635, bajarilish 95% — to'g'ri ko'rsatildi. Konsol
  xatolari faqat CDN bloklanishi (ERR_TUNNEL_CONNECTION_FAILED, kutilgan).
- Claude Artifact (https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5): o'qildi (viewed, versiya
  1791878080-5f18 — 13.10'dagi oxirgi nashr bilan bir xil, "newer version" muammosi yo'q), so'ng
  `quyish-login.html` bilan `capabilities`siz qayta nashr qilindi (Version 54, 1791946377-7d9d).
- GitHub: `index.html`, `source/quyish-open.html` va `source/apm/apm.js` shu commitda push qilinadi.

Xulosa: bugun (14.10.2026) kunlik yangilash MUVAFFAQIYATLI yakunlandi — BIRINCHI tekshiruvda, 13
kunlik oktabr ma'lumoti (1-13 okt) bilan. Kirim/Chiqim jurnali 02.10'dan beri birinchi marta haqiqiy
yozuv oldi (1 ta). Muammo yo'q, PushNotification yuborilmadi.

**Davomi (14.10.2026, ~09:31-09:35 UTC+5 / ~04:31-04:35 UTC) — foydalanuvchi so'rovi bilan qayta
tekshirildi:** Manba jadvallar ikkinchi marta (va NEED_TOTAL uchun uchinchi marta, ketma-ket) qayta
yuklab olindi. Kunlik_Panel sanasi/holati o'zgarmagan (2026-10-13, to'rttasi ham ✓). Plan_Berish!F2
birinchi tekshiruvdagi 58507'dan 56935'ga siljigan edi — ikki marta ketma-ket (bir necha daqiqa farq
bilan) qayta yuklab solishtirilganda ikkalasida ham bir xil 56935 chiqdi (barqarorlashgan, IMPORTRANGE
beqarorligi emas — kunlik hisob tabiiy siljishi, ilgari ko'p marta kuzatilgan). Shuning uchun
`rebuild_dash.py`/`apply_dash_update.py` yangilangan qiymat (kerak=56935, 13 kun, XAVFLI xato yo'q)
bilan qayta ishga tushirildi. Muhimroq topilma — APM uchun manba (zyt.xlsx) qayta yuklanganda 13-kun
FAKTI endi kiritilgan edi (soat 07:49'dagi birinchi tekshiruvda hali yo'q edi): `rebuild_apm.py` fakt
162448 → 191509'ga oshdi (13 kun, IMM kunlari 8,12,13, XAVFLI xato yo'q), APM "bir kunlik ma'lumot"
default endi 13.10.2026 (fakt 29 061, reja 28 430, bajarilish 102%) ko'rsatadi. `archive_kirim_month.py`:
0 ta yangi yozuv (birinchi tekshiruvdagi 1 ta yozuv allaqachon arxivda, takror qo'shilmadi — dedup
ishladi). `node build_login.js` muvaffaqiyatli. Playwright: Oktabr KPI (1-13 okt) Ishlab chiqarildi
162 448 → 191 509, Jo'natildi 164 923 → 190 597 ga yangilandi; Sentabr filtri hamon aniq **646 593
dona, 1-29 sen** — o'zgarmagan. Claude Artifact o'qildi (versiya 1791946377-7d9d — birinchi
tekshiruvdagi nashr bilan bir xil, "newer version" muammosi yo'q), so'ng qayta nashr qilindi (Version
55, 1791952518-1a4d). GitHub: `index.html`, `source/quyish-open.html`, `source/apm/apm.js` shu
commitda push qilinadi.

Xulosa: qayta tekshiruv FOYDALI bo'ldi — birinchi (07:49) nashrdan keyin jamoa 13-kun fakti/chiqimini
kiritgan edi, shuning uchun ikkinchi nashr aniqroq (yangiroq) raqamlar bilan chiqdi. Muammo yo'q,
PushNotification yuborilmadi.

**Davomi (14.10.2026, ~07:49-08:00 UTC / ~12:49-13:00 mahalliy, kunlik vazifaning ikkinchi
(12:47 mahalliy) slotidagi tekshiruvi):** Manba jadvallar (zyt.xlsx, Oktabr ASTATKA) qayta
yuklab olindi. Kunlik_Panel F1 ("Sana:") = **2026-10-14** — kutilgan sana (Toshkent vaqti bilan
mos, anomaliya yo'q) bilan AYNAN mos. Holat: "Fakt kiritilganmi: ✓", "Chiqim kiritilganmi: ✓",
"Plan berilganmi (Berilgan_Plan): ✓ Berilgan", "IMM_Fact to'ldirilganmi: ✓ To'ldirilgan" —
to'rttasi ham ✓ (birinchi tekshiruv — 04:35 UTC — bilan bir xil toza holat). SANA QOIDASIga ko'ra
to'liq kunlik yangilash (KEEP_PLAN'siz) bajarildi:
- `rebuild_dash.py`: N_DAYS=13 (1-13 okt, "14" varag'i allaqachon mavjud, lekin G-vektor hali
  kunlik yopilishni tasdiqlamagan — bu normal), NEED_TOTAL=43835 (birinchi tekshiruvdagi 56935'dan
  pastroq — kunlik reja/zaxira tabiiy siljishi, IMPORTRANGE beqarorligi emas), 116 qator, crit=0,
  high=34 — XAVFLI xato yo'q.
- `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 13 kun, kerak=43835" — XAVFLI xato yo'q.
- `archive_kirim_month.py ... all`: 0 ta yangi yozuv (birinchi tekshiruvdagi 1 ta yozuv allaqachon
  arxivda, takror qo'shilmadi — dedup ishladi; arxivda jami 5 ta: 4 sentabr + 1 oktabr).
- `bake_kirim_snapshot.py`: OK, 1 ta yozuv, vaqt belgisi yangilandi (14.10.2026 12:52).
- APM (3c): `rebuild_apm.py source/apm/apm.js /tmp/zyt.xlsx` — "Mavjud oy yangilandi: 14 kun, fakt
  191019, reja 147980 (6 kun), IMM kunlari: 8,12,13,14" — XAVFLI xato yo'q. "14" kuni endi IMM
  nusxasi/reja bilan qo'shildi (manba jadvalda kun ilgarilab ketgani uchun bosh dash hali 13 kunda
  qolsa ham, APM mustaqil ravishda 14 kunga o'tdi — bu normal, APM Plan_Berish/Kunlik_Panel'ga
  bog'liq emas).
- `node build_login.js`: muvaffaqiyatli, parollar o'zgarmadi.
- Playwright tekshiruvi (`playwright_check.js` + vaqtinchalik APM tekshiruvi, repo'da saqlanmadi):
  barcha uch hisob (ombor/admin/apm) xatosiz login qildi. Oktabr KPI (1-13 okt): Jami qoldiq
  119 767/116 detal, Shoshilinch yetishmovchilik 0, Tugagan detallar 32, Ishlab chiqarildi
  191 019, Jo'natildi 190 597. Sentabr filtri (2026-09-01..2026-09-30): Ishlab chiqarildi
  **646 593 dona, 1-29 sen** — talab qilingan qiymat bilan AYNAN mos, sentabr o'zgarmagan. APM:
  "Oy" ro'yxatida "Oktabr 2026 (joriy)" va "Sentabr 2026 (yakunlangan)" ikkalasi bor; kun ro'yxati
  01.10-14.10'gacha boradi; standart "bir kunlik ma'lumot" so'nggi IMM-nusxali kun (13.10, sesh)ni
  ko'rsatadi: Fakt 28 571 (1-sm 11 266, 2-sm 17 305), Reja 28 430, bajarilish 100% — to'g'ri. IMM
  yuklamasi jadvali (10 IMM) to'g'ri ko'rsatildi. Konsol xatolari yo'q (sahifa xatosi yo'q), faqat
  CDN bloklanishi (kutilgan, pageerror emas).
- Claude Artifact: o'qildi (viewed, versiya 1791952518-1a4d — birinchi tekshiruvdagi oxirgi nashr
  bilan bir xil, "newer version" muammosi yo'q), so'ng `quyish-login.html` bilan `capabilities`siz
  qayta nashr qilindi (Version 56, 1791964427-2905).
- GitHub: `index.html`, `source/quyish-open.html` va `source/apm/apm.js` shu commitda push
  qilinadi.

Xulosa: bugungi ikkinchi tekshiruv (12:47 mahalliy slot) MUVAFFAQIYATLI — Tahlil 13 kunlik
(1-13 okt, kerak=43835, tabiiy siljigan) va APM 14 kunlik (1-14 okt, fakt 191019) ma'lumot bilan.
Muammo yo'q, PushNotification yuborilmadi.

**15.10.2026, ~02:53 UTC / ~07:53 mahalliy (standart kunlik vazifa, CRON_TZ=Asia/Tashkent 07:47) —
BIRINCHI TEKSHIRUV:** Kunlik_Panel F1 ("Sana:") = 2026-10-15 (bugungi kun bilan mos). Holat:
"Plan berilganmi (Berilgan_Plan): ✗ Hali yo'q" (Fakt/Chiqim/IMM_Fact holati alohida tekshirilmagan,
lekin natija ko'rsatadiki ular ✓ bo'lgan). SANA QOIDASIga ko'ra Plan ✗ bo'lgani uchun KEEP_PLAN
rejimida yangilandi: Tahlil 1-13 okt (kerak=43835, o'zgarmadi), APM 14 kun (fakt 191019). Shundan
keyin, alohida so'rov bilan, barcha hisoblar uchun parol "uk123456" ga o'zgartirildi (eski
"uz123456" endi ishlamaydi) — bu REFRESH_INSTRUCTIONS.md boshidagi PAROL qatoriga yozildi.

**Davomi (15.10.2026, ~07:49-07:54 UTC / ~12:49-12:54 mahalliy) — IKKINCHI TEKSHIRUV (12:47 mahalliy
slot):** Manba jadvallar (zyt.xlsx, Oktabr ASTATKA) qayta yuklab olindi. Kunlik_Panel F1 ("Sana:")
hamon 2026-10-15 (bugungi kun bilan mos, anomaliya yo'q). Holat: "Fakt: ✓", "Chiqim: ✓", "Plan
berilganmi (Berilgan_Plan): ✗ Hali yo'q" (birinchi tekshiruv bilan bir xil), "IMM_Fact: ✓".
Plan_Berish!B2=2026-10-15 (sana mos), F2=41941 — lekin Plan ✗ bo'lgani uchun SANA QOIDASIga ko'ra
bu raqamga ishonib bo'lmaydi. Shuning uchun `KEEP_PLAN=source/quyish-open.html python3
source/rebuild_dash.py` bilan quring (kerak=43835 o'zgarmadi, oxirgi ishonchli rejadan saqlandi).
Natija: N_DAYS 13→14 (1-14 okt, "14" varag'i endi yopilgan ko'rinadi), 116 qator, crit=0, high=34 —
XAVFLI xato yo'q. `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 14 kun, kerak=43835".
`archive_kirim_month.py ... all`: 0 ta yangi yozuv (arxivda jami 5 ta: 4 sentabr + 1 oktabr).
`bake_kirim_snapshot.py`: OK, 1 ta yozuv, vaqt belgisi yangilandi (15.10.2026 12:52). APM (3c):
`rebuild_apm.py source/apm/apm.js /tmp/zyt.xlsx` — "Mavjud oy yangilandi: 14 kun, fakt 191019→218134
(13/14-kun fakti endi to'liq kiritilgan), reja 147980 (6 kun), IMM kunlari: 8,12,13,14" — XAVFLI
xato yo'q. `node build_login.js` (source/ ichida) muvaffaqiyatli, parollar o'zgarmadi (uk123456).
Playwright (`playwright_check.js` + vaqtinchalik APM tekshiruvi, repo'da saqlanmadi): barcha uch
hisob (ombor/admin/apm) xatosiz login qildi. Oktabr KPI (1-14 okt): Jami qoldiq 120 461/116 detal,
Shoshilinch yetishmovchilik 0, Tugagan detallar 27, Ishlab chiqarildi 218 134, Jo'natildi 217 018.
Sentabr filtri (2026-09-01..2026-09-30): Ishlab chiqarildi **646 593 dona, 1-29 sen** — talab
qilingan qiymat bilan AYNAN mos, sentabr o'zgarmagan. APM: "Oy" ro'yxatida "Oktabr 2026 (joriy)" va
"Sentabr 2026 (yakunlangan)" ikkalasi bor; kun ro'yxati 01.10-14.10'gacha; so'nggi IMM-nusxali kun
(14.10, chor) Fakt 27 115, Reja 30 493, bajarilish 89% — to'g'ri ko'rsatildi. Konsol xatolari faqat
CDN bloklanishi (ERR_TUNNEL_CONNECTION_FAILED, kutilgan). Claude Artifact
(https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5): o'qildi (viewed, versiya 1792033964-9e6f —
"newer version" muammosi yo'q), so'ng `quyish-login.html` bilan `capabilities`siz qayta nashr
qilindi (Version 59, 1792050831-178c). GitHub: `index.html`, `source/quyish-open.html` va
`source/apm/apm.js` shu commitda push qilindi (remote URL repo nomi katta harfga
"Injection-warehouse-monitoring" ga o'zgargani uchun `git remote set-url` bilan yangilandi).

Xulosa: bugungi ikkinchi tekshiruv (12:47 mahalliy slot) MUVAFFAQIYATLI — Tahlil 14 kunlik
(1-14 okt, kerak=43835, o'zgarmadi) va APM 14 kunlik (1-14 okt, fakt 218134, oshdi) ma'lumot bilan.
Muammo yo'q, PushNotification yuborilmadi.

**16.10.2026, ~02:49 UTC / ~07:49 mahalliy (standart kunlik vazifa, CRON_TZ=Asia/Tashkent 07:47):**
Manba jadval (`1I4GbqRL-r9_0pDiIL0hQatOSv_dAriYT5XbMr5K8Vv4`, "Kunlik_Panel" varag'i) xlsx qilib
yuklab tekshirildi. Kunlik_Panel F1 ("Sana:") = **2026-10-16** — kutilgan sana (bugungi kun) bilan
AYNAN mos, anomaliya emas. Holat: "Fakt kiritilganmi: ✗", "Chiqim kiritilganmi: ✗", "Plan berilganmi
(Berilgan_Plan): ✗ Hali yo'q", "IMM_Fact to'ldirilganmi: ✓ To'ldirilgan" — odatiy ertalabki naqshga
mos (02.10-15.10'dagi ko'p ertalabki tekshiruvlar bilan bir xil). MUHIM bo'limiga ko'ra Plan_Berish'ga
hali ishonib bo'lmaydi, shuning uchun Oktabr ASTATKA yuklanmadi, rebuild_dash.py/apply_dash_update.py
ishga tushirilmadi, Kirim/Chiqim arxivlash (3a/3b) ham o'tkazib yuborildi — Tahlil paneli/Ombor
monitori va Kirim/Chiqim bo'yicha hech narsa o'zgarmadi (eski holida qoldi).

APM (3c) — ALOHIDA SHART bo'yicha baribir yangilandi: zyt.xlsx qayta yuklab olindi (`rebuild_apm.py
source/apm/apm.js /tmp/zyt.xlsx` — "Mavjud oy yangilandi: 15 kun, fakt 218134 (o'zgarmadi — 15-kun
fakti hali manba jadvalda 0), reja 171750 (7 kun), IMM kunlari: 8,12,13,14" — XAVFLI xato yo'q).
`node build_login.js` muvaffaqiyatli, parollar o'zgarmadi (uk123456). Playwright (`playwright_check.js`
+ vaqtinchalik APM tekshiruvi, repo'da saqlanmadi): barcha uch hisob (ombor/admin/apm) xatosiz login
qildi. Oktabr KPI (hamon 1-14 okt, o'zgarmagan): Jami qoldiq 120 461/116 detal, Shoshilinch
yetishmovchilik 0, Tugagan detallar 27, Ishlab chiqarildi 218 134, Jo'natildi 217 018. Sentabr filtri
(2026-09-01..2026-09-30): Ishlab chiqarildi **646 593 dona, 1-29 sen** — talab qilingan qiymat bilan
AYNAN mos, sentabr o'zgarmagan. APM: "Oy" ro'yxatida "Oktabr 2026 (joriy)" va "Sentabr 2026
(yakunlangan)" ikkalasi bor; kun ro'yxati endi 01.10-15.10'gacha (15 kun); standart "bir kunlik
ma'lumot" so'nggi IMM-nusxali kun (14.10, chor)ni ko'rsatadi: Fakt 27 115, Reja 30 493, bajarilish
89% — 15.10'dagi nashr bilan bir xil, to'g'ri. Konsol xatolari faqat CDN bloklanishi (kutilgan).
Claude Artifact (https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5): o'qildi (viewed, versiya
1792050831-178c — 15.10'dagi oxirgi nashr bilan bir xil, "newer version" muammosi yo'q), so'ng
`quyish-login.html` bilan `capabilities`siz qayta nashr qilindi (Version 60, 1792119047-a34d).
GitHub: `index.html` va `source/apm/apm.js` shu commitda push qilinadi (faqat APM o'zgargani uchun
`source/quyish-open.html` bu safar o'zgarmadi).

Xulosa: bugungi birinchi tekshiruv MUVAFFAQIYATLI — faqat APM yangilandi (15 kunlik, 1-15 okt, fakt
218134, o'zgarmadi), Tahlil/Kirim-Chiqim Plan ✗ sababli o'tkazib yuborildi (odatiy ertalabki holat).
Muammo yo'q, PushNotification yuborilmadi. ~4 soatdan keyin (taxminan 06:49 UTC / ~11:49 mahalliy)
shu sessiya o'zi qayta tekshiradi (send_later orqali rejalashtirilgan).

**Davomi (16.10.2026, ~04:11-04:19 UTC / ~09:11-09:19 mahalliy) — foydalanuvchi so'rovi bilan qayta
tekshirildi ("qayta bajaring"):** Manba jadval qayta yuklab olindi. Kunlik_Panel sanasi hamon to'g'ri
(2026-10-16). Holat: "Fakt kiritilganmi" va "Chiqim kiritilganmi" endi ikkalasi ham "✓ Kiritilgan"
bo'lgan (07:49'dagi tekshiruvda ikkalasi ham ✗ edi), lekin "Plan berilganmi (Berilgan_Plan)" hamon
"✗ Hali yo'q". MUHIM bo'limiga ko'ra Plan_Berish'ga hali ishonib bo'lmaydi, shuning uchun Tahlil
paneli/Ombor monitori/Kirim-Chiqim yana o'tkazib yuborildi (o'zgarmadi). APM esa ALOHIDA SHART
bo'yicha yana yangilandi: `rebuild_apm.py` — "Mavjud oy yangilandi: 15 kun, fakt 218134→245645
(15-kun fakti endi to'liq kiritilgan), reja 171750 (7 kun), IMM kunlari: 8,12,13,14" — XAVFLI xato
yo'q. `node build_login.js` muvaffaqiyatli. Playwright: dash KPI hamon 1-14 okt (o'zgarmagan, kutilgan
— Tahlil bu safar ham tegilmadi), Sentabr filtri hamon 646 593 dona (o'zgarmagan). APM kun ro'yxati
hamon 01.10-15.10 (standart "bir kunlik ma'lumot" hamon 14.10, chor — 15-kun uchun hali IMM nusxasi
yo'q, Plan ✗ bo'lgani uchun kutilgan). Claude Artifact qayta nashr qilindi (Version 61, 1792123964-f980,
"newer version" muammosi yo'q). GitHub: `index.html` va `source/apm/apm.js` shu commitda push qilinadi.

Xulosa: APM yana yangilandi (fakt 218134→245645), Tahlil/Kirim-Chiqim Plan ✗ sababli hamon o'tkazib
yuborilgan. Muammo yo'q, PushNotification yuborilmadi.

**Davomi (16.10.2026, ~06:52-07:02 UTC / ~11:52-12:02 mahalliy, kunlik vazifaning ikkinchi (12:47
mahalliy) slotidagi tekshiruvi):** Manba jadval ikki marta ketma-ket qayta yuklab solishtirildi —
NEED_TOTAL=40593 va PLAN_DATE=2026-10-16 ikkalasida ham bir xil chiqdi (IMPORTRANGE beqarorligi
emas). Kunlik_Panel F1 ("Sana:") = 2026-10-16 (bugungi kun bilan AYNAN mos). Holat: "Fakt: ✓",
"Chiqim: ✓", "Plan berilganmi (Berilgan_Plan): ✓ Berilgan" (ertalabki ✗'dan o'zgargan!), "IMM_Fact:
✓". SANA QOIDASIga ko'ra bu ishonchli — to'liq kunlik yangilash (KEEP_PLAN'siz) bajarildi:
- Oktabr ASTATKA yuklandi. `rebuild_dash.py`: N_DAYS 14→15 (1-15 okt), NEED_TOTAL=40593 (Plan_Berish
  bilan mos), 116 qator, crit=1, high=15 — XAVFLI xato yo'q.
- `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 15 kun, kerak=40593" — XAVFLI xato yo'q.
- `archive_kirim_month.py ... all`: 0 ta yangi yozuv (arxivda jami 5 ta, o'zgarmadi).
- `bake_kirim_snapshot.py`: OK, 1 ta yozuv, vaqt belgisi yangilandi (16.10.2026 11:54).
- APM (3c): `rebuild_apm.py` — "Mavjud oy yangilandi: 16 kun, fakt 245645 (o'zgarmadi — 16-kun fakti
  hali 0), reja 188581 (8 kun), IMM kunlari: 8,12,13,14,16" — XAVFLI xato yo'q.
- `node build_login.js` muvaffaqiyatli, parollar o'zgarmadi.
- Playwright: barcha uch hisob xatosiz login qildi. Oktabr KPI (1-15 okt): Jami qoldiq 122 147/116
  detal, Shoshilinch yetishmovchilik 92 dona/1 detal, Tugagan detallar 27, Ishlab chiqarildi 245 645
  (APM fakt bilan mos), Jo'natildi 242 843. Sentabr filtri (2026-09-01..2026-09-30): Ishlab chiqarildi
  **646 593 dona, 1-29 sen** — AYNAN mos, o'zgarmagan. APM kun ro'yxati 01.10-16.10'gacha.
- Claude Artifact: o'qildi (viewed, "newer version" muammosi yo'q), qayta nashr qilindi (Version 62,
  1792133725-2180). GitHub: `index.html`, `source/quyish-open.html` va `source/apm/apm.js` shu
  commitda push qilinadi.

Xulosa: Plan ertalabki ✗'dan ✓'ga o'tgach, to'liq kunlik yangilash MUVAFFAQIYATLI bajarildi — Tahlil
15 kunlik (1-15 okt, kerak=40593), APM 16 kunlik (1-16 okt, fakt 245645). Muammo yo'q, PushNotification
yuborilmadi.

**Davomi (16.10.2026, ~07:50-08:02 UTC / ~12:50-13:02 mahalliy) — standart kunlik vazifaning
ikkinchi (12:47 mahalliy) slotidagi mustaqil tekshiruvi, boshqa (11:52-12:02 mahalliy) sessiya
natijasini TASDIQLADI:** Manba jadvallar (zyt.xlsx, Oktabr ASTATKA) qayta yuklab olindi. Kunlik_Panel
F1 ("Sana:") = 2026-10-16 (bugungi kun bilan AYNAN mos). Holat: "Fakt: ✓", "Chiqim: ✓", "Plan
berilganmi (Berilgan_Plan): ✓ Berilgan", "IMM_Fact: ✓". Plan_Berish!B2=2026-10-16, F2=40593 — bu
~1 soat oldin (11:52-12:02 slotida) push qilingan commit 5637a01'dagi bilan AYNAN bir xil (manba
ma'lumot shu oraliqda o'zgarmagan). SANA QOIDASIga ko'ra ishonchli — to'liq kunlik yangilash
(KEEP_PLAN'siz) bajarildi:
- `rebuild_dash.py`: N_DAYS=15 (1-15 okt, o'zgarmadi), NEED_TOTAL=40593 (o'zgarmadi), 116 qator,
  crit=1, high=15 — XAVFLI xato yo'q.
- `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 15 kun, kerak=40593" — XAVFLI xato yo'q.
- `archive_kirim_month.py ... all`: 0 ta yangi yozuv (arxivda jami 5 ta, o'zgarmadi).
- `bake_kirim_snapshot.py`: OK, 1 ta yozuv, vaqt belgisi yangilandi (16.10.2026 12:53).
- APM (3c): `rebuild_apm.py source/apm/apm.js /tmp/zyt.xlsx` — "Mavjud oy yangilandi: 16 kun, fakt
  245645 (o'zgarmadi), reja 188495 (8 kun, 11:52 slotidagi 188581'dan arzimas siljish — tabiiy,
  IMPORTRANGE beqarorligi emas), IMM kunlari: 8,12,13,14,16" — XAVFLI xato yo'q.
- `node build_login.js`: muvaffaqiyatli, parollar o'zgarmadi (uk123456).
- Playwright (kengaytirilgan vaqtinchalik tekshiruv script, repo'da saqlanmadi — npm orqali
  playwright@1.56.0 o'rnatildi, chunki sandbox'dagi chromium-1194 build eski playwright@1.48 bilan
  mos kelmadi/"Old Headless mode" xatosi berdi): barcha uch hisob (ombor/admin/apm) xatosiz login
  qildi. Oktabr KPI (1-15 okt): Jami qoldiq 122 147/116 detal, Shoshilinch yetishmovchilik 92
  dona/1 detal, Tugagan detallar 27, Ishlab chiqarildi 245 645, Jo'natildi 242 843 — 11:52
  slotidagi bilan bir xil. Sentabr filtri (2026-09-01..2026-09-30): Ishlab chiqarildi **646 593
  dona, 1-29 sen** — AYNAN mos, sentabr o'zgarmagan. APM: "Oy" ro'yxatida "Oktabr 2026 (joriy)" va
  "Sentabr 2026 (yakunlangan)" ikkalasi bor; kun ro'yxati 01.10-16.10'gacha; standart "bir kunlik
  ma'lumot" 15.10.2026 (pay)ni ko'rsatadi: Fakt 27 511 (1-sm 15 636, 2-sm 11 875), Reja 23 770,
  bajarilish 116% — to'g'ri. Konsol xatolari faqat CDN bloklanishi (ERR_TUNNEL_CONNECTION_FAILED,
  kutilgan), pageerror yo'q.
- Claude Artifact (https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5): o'qildi (viewed, versiya
  1792133725-2180 — 11:52 slotidagi oxirgi nashr bilan bir xil, "newer version" muammosi yo'q),
  so'ng `quyish-login.html` bilan `capabilities`siz qayta nashr qilindi (Version 63,
  1792137320-a395).
- GitHub: `index.html`, `source/quyish-open.html` va `source/apm/apm.js` commit a0ae587 bilan
  `main`ga push qilindi (git CLI orqali, proxy avtomatik autentifikatsiya qildi; fast-forward
  5637a01..a0ae587, konflikt yo'q).

Xulosa: bu safar ikkinchi mustaqil tekshiruv ham MUVAFFAQIYATLI — avvalgi (parallel) sessiya
natijasini (Tahlil 1-15 okt kerak=40593, APM fakt 245645) tasdiqladi, APM rejasi arzimas siljidi
(188581→188495) va Kirim/Chiqim zaxirasi/Artifact versiyasi yangilandi. Muammo yo'q, PushNotification
yuborilmadi.

**Davomi (16.10.2026, ~09:35-09:37 UTC / ~14:35-14:37 mahalliy) — foydalanuvchi (Rustam)
to'g'ridan-to'g'ri so'rovi bilan ("do it again") uchinchi mustaqil tekshiruv, kunlik standart
jadvaldan tashqari, + shu bilan birga foydalanuvchi so'rovi bo'yicha kunlik vazifa vaqti
o'zgartirildi:** Repo allaqachon yangilangan edi (`git pull --ff-only` → "Already up to date",
HEAD commit 40f4d8a). Manba jadvallar (zyt.xlsx, Oktabr ASTATKA) yana qayta yuklab olindi.
Kunlik_Panel holati o'zgarmagan: barcha 4 bayroq ✓ ("Fakt", "Chiqim", "Plan berilganmi",
"IMM_Fact"), Plan_Berish!B2=2026-10-16, F2=40593 — 12:50 slotidagi bilan AYNAN bir xil. To'liq
pipeline yana bajarildi:
- `rebuild_dash.py`: N_DAYS=15, NEED_TOTAL=40593, 116 qator — o'zgarmadi, XAVFLI yo'q.
- `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 15 kun, kerak=40593" — XAVFLI yo'q.
- `archive_kirim_month.py ... all`: 0 ta yangi yozuv (jami 5 ta, o'zgarmadi).
- `bake_kirim_snapshot.py`: vaqt belgisi yangilandi (16.10.2026 14:37).
- `rebuild_apm.py`: "Mavjud oy yangilandi: 16 kun, fakt 245645 (o'zgarmadi), reja 209257 (8 kun,
  188495'dan tabiiy siljidi — IMPORTRANGE jonli yangilanishi, haqiqiy anomaliya emas), IMM
  kunlari: 8,12,13,14,16" — XAVFLI yo'q.
- `node build_login.js`: muvaffaqiyatli, parollar o'zgarmadi (uk123456).
- Playwright (`/home/claude/pw-test/check.js`, playwright@1.56.0): barcha uch hisob xatosiz login
  qildi, Oktabr KPI 12:50 slotidagi bilan bir xil, **Sentabr (frozen): 646 593 dona, 1-29 sen —
  yana bir bor AYNAN mos, o'zgarmagan**. Pageerror yo'q, faqat kutilgan CDN bloklanish xatolari.
- Claude Artifact: o'qildi (versiya 1792137320-a395 — 12:50 slotidagi oxirgi nashr bilan bir xil,
  konflikt yo'q), so'ng qayta nashr qilindi (Version 64, 1792143481-c212).
- GitHub: `index.html`, `source/quyish-open.html`, `source/apm/apm.js` commit f49c319 bilan
  `main`ga push qilindi (git CLI, fast-forward 40f4d8a..f49c319, konflikt yo'q). Diff juda kichik
  (3 qator) — bu real ma'lumot o'zgarmaganini tasdiqlaydi.

**Rejalashtirilgan vazifa vaqti o'zgartirildi:** Foydalanuvchi so'rovi bo'yicha kunlik avtomatik
yangilash vazifasi (`trig_015Bzr4R8BbxmKVe3rW7YTtX`, "Tahlil paneli - kunlik yangilash") avvalgi
kuniga ikki marta (07:47 va 12:47, Asia/Tashkent) ishlashdan — har kuni ertalab soat 10:30da
(Asia/Tashkent) bir marta ishlashga o'tkazildi. Yangi cron: `CRON_TZ=Asia/Tashkent 30 10 * * *`.

Xulosa: uchinchi mustaqil tekshiruv ham MUVAFFAQIYATLI, hech qanday real o'zgarish yo'q (faqat APM
rejasi tabiiy siljidi va Kirim/Chiqim vaqt belgisi yangilandi). Muammo yo'q, PushNotification
yuborilmadi (kunlik vazifa muvaffaqiyatli, flag qilinadigan hech nima topilmadi).

**17.10.2026, ~05:37-05:45 UTC / ~10:37-10:45 mahalliy (yangi bir martalik jadval, CRON_TZ=Asia/Tashkent
30 10 * * *, bugundan kuchga kirdi):** Repo allaqachon clone qilingan edi (HEAD=0879b16, oldingi
kundagi GitHub Actions avtomatlashtirish commiti — bu commit kunlik vazifani GitHub Actions'ga
o'tkazadi, LEKIN Claude'ning eski kunlik vazifasi (trig_015Bzr4R8BbxmKVe3rW7YTtX) commit izohiga ko'ra
"hozircha zahira sifatida" ishlab turishi kerak — shuning uchun bu sessiya odatdagidek to'liq pipelineni
bajardi). GitHub Actions ("Kunlik avtomatik yangilash", .github/workflows/daily-refresh.yml, cron 05:30
UTC) tekshirildi: workflow repo'da mavjud va "active", lekin bugungi ishga tushirish tekshirilgan vaqtda
(05:37 UTC, jadvaldan ~7 daqiqa keyin) ro'yxatda YO'Q EDI (list_workflow_runs → total_count=0) — ya'ni
Action hali hech qachon ishga tushmagan (birinchi marta kecha 12:05 UTC'da qo'shilgan, GitHub'da yangi
scheduled workflow'lar ba'zan birinchi marotaba kechikishi/o'tkazib yuborilishi odatiy). Shuning uchun
bu kunlik zahira ishga tushirish AYNI MUHIM bo'lib qoldi.

Manba jadval (Kunlik_Panel) tekshirildi: Sana=2026-10-17 (bugungi kun bilan mos), Fakt ✓, Chiqim ✓,
Plan berilganmi ✗ Hali yo'q (odatiy ertalabki holat), IMM_Fact ✓. SANA QOIDASIga ko'ra KEEP_PLAN rejimida
yangilandi:
- `rebuild_dash.py` (KEEP_PLAN=quyish-open.html): N_DAYS 15→16 (1-16 okt), NEED_TOTAL=40593 (oxirgi
  ishonchli rejadan saqlandi, o'zgarmadi), 116 qator, crit=1, high=15 — XAVFLI xato yo'q.
- `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 16 kun, kerak=40593" — XAVFLI xato yo'q.
- `archive_kirim_month.py ... all`: 0 ta yangi yozuv (arxivda jami 5 ta, o'zgarmadi).
- `bake_kirim_snapshot.py`: OK, 1 ta yozuv, vaqt belgisi yangilandi (17.10.2026 10:40).
- APM (3c): `rebuild_apm.py source/apm/apm.js /tmp/zyt.xlsx` — "Mavjud oy yangilandi: 16 kun, fakt
  245645→280377 (16-kun fakti endi to'liq kiritilgan), reja 209257 (8 kun, o'zgarmadi), IMM kunlari:
  8,12,13,14,16" — XAVFLI xato yo'q.
- `node build_login.js`: muvaffaqiyatli, parollar o'zgarmadi (uk123456).
- Playwright (`playwright_check.js` + vaqtinchalik APM tekshiruvi, repo'da saqlanmadi, playwright@1.56.0
  global /opt/npm-tools orqali, chromium-1194): barcha uch hisob (ombor/admin/apm) xatosiz login qildi,
  pageerror yo'q (faqat kutilgan CDN/tunnel bloklanish xatolari). Oktabr KPI (1-16 okt): Jami qoldiq
  137 386/116 detal, Shoshilinch yetishmovchilik 92 dona/1 detal, Tugagan detallar 28, Ishlab chiqarildi
  280 377, Jo'natildi 262 336 (APM fakt bilan mos). Sentabr filtri (2026-09-01..2026-09-30): Ishlab
  chiqarildi **646 593 dona, 1-29 sen** — AYNAN mos, sentabr o'zgarmagan. APM: "Oy" ro'yxatida "Oktabr
  2026 (joriy)" va "Sentabr 2026 (yakunlangan)" ikkalasi bor; kun ro'yxati 01.10-16.10'gacha; standart
  "bir kunlik ma'lumot" so'nggi IMM-nusxali kun (16.10, jum)ni ko'rsatadi: Fakt 34 732 (1-sm 15 481,
  2-sm 19 251), Reja 37 507, bajarilish 93% — dash TOT_PROD[16]=34732 bilan mos, to'g'ri.
- Claude Artifact (https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5): o'qildi (viewed, versiya
  1792143481-c212 — 16.10'dagi oxirgi nashr bilan bir xil, "newer version" muammosi yo'q), so'ng
  `quyish-login.html` bilan `capabilities`siz qayta nashr qilindi (Version 65, 1792215803-e720).
- GitHub: `index.html`, `source/quyish-open.html` va `source/apm/apm.js` push qilinadi.

Xulosa: bugungi (yangi kunlik 10:30 jadval bo'yicha) yangilash MUVAFFAQIYATLI — Tahlil 16 kunlik
(1-16 okt, kerak=40593, KEEP_PLAN — plan hali berilmagan) va APM 16 kunlik (1-16 okt, fakt 280377)
ma'lumot bilan. GitHub Actions avtomatlashtirish hali birinchi marta ishga tushmagan (kuzatilmoqda,
zahira vazifasi davom etmoqda). Muammo yo'q, PushNotification yuborilmadi.

**18.10.2026, ~05:40-05:49 UTC / ~10:40-10:49 mahalliy (standart kunlik vazifa):** Kunlik_Panel
tekshirildi: Sana=2026-10-18 (bugungi kun bilan mos), "Fakt kiritilganmi: ✗ Hali yo'q", "Chiqim
kiritilganmi: ✗ Hali yo'q", "Plan berilganmi (Berilgan_Plan): ✗ Hali yo'q", "IMM_Fact
to'ldirilganmi: ✓ To'ldirilgan" — odatiy ertalabki holat. SANA QOIDASIga ko'ra (13.10.2026,
Rustam tasdiqlagan) "Plan berilganmi ✗" bo'lsa ham nashr o'TKAZILMAYDI — KEEP_PLAN rejimida
davom etildi:
- `KEEP_PLAN=quyish-open.html python3 rebuild_dash.py`: N_DAYS=16 (1-16 okt, o'zgarmadi — "01"..
  "31" varaqlari hali 17/18-oktabrni to'ldirmagan), NEED_TOTAL=40593 (oxirgi ishonchli nashrdan
  saqlandi) — XAVFLI xato yo'q.
- `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 16 kun, kerak=40593" — XAVFLI yo'q.
- `archive_kirim_month.py ... all`: 0 ta yangi yozuv (arxivda jami 5 ta, o'zgarmadi).
- `bake_kirim_snapshot.py`: OK, 1 ta yozuv, vaqt belgisi yangilandi (18.10.2026 10:42).
- APM (3c, Kunlik_Panel holatidan mustaqil): `rebuild_apm.py apm/apm.js /tmp/zyt.xlsx` — "Mavjud
  oy yangilandi: 16 kun, fakt 280377 (o'zgarmadi), reja 209257 (8 kun, o'zgarmadi), IMM kunlari:
  8,12,13,14,16" — XAVFLI yo'q (17/18-okt uchun ham hali yangi fakt/IMM kiritilmagan).
- `node build_login.js`: muvaffaqiyatli, parollar o'zgarmadi (uk123456).
- Playwright (`source/ci/verify.js` + vaqtinchalik APM tekshiruvi, playwright@1.56.0, global
  /opt/npm-tools + /opt/pw-browsers orqali): barcha uch hisob (ombor/admin/apm) xatosiz login
  qildi, pageerror yo'q (faqat kutilgan CDN/tunnel bloklanish xatolari). Oktabr KPI (1-16 okt):
  Jami qoldiq 137 386/116 detal, Shoshilinch yetishmovchilik 92/1 detal, Tugagan detallar 28,
  Ishlab chiqarildi 280 377, Jo'natildi 262 336 — 17.10 bilan bir xil (haqiqiy o'zgarish yo'q).
  Sentabr filtri (2026-09-01..2026-09-30): Ishlab chiqarildi **646 593 dona, 1-29 sen** — AYNAN
  mos, frozen oy o'zgarmagan. APM: "Oy" ro'yxatida "Oktabr 2026 (joriy)" va "Sentabr 2026
  (yakunlangan)" ikkalasi bor; standart kun 16.10 (jum): Fakt 34 732 (1-sm 15 481, 2-sm 19 251),
  Reja 37 507, bajarilish 93% — dash bilan mos.
- Claude Artifact (https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5): o'qildi (versiya
  1792215803-e720 — 17.10'dagi oxirgi nashr bilan bir xil, "newer version" muammosi yo'q), so'ng
  `quyish-login.html` bilan `capabilities`siz qayta nashr qilindi (Version 66, 1792302277-1587).
- GitHub Actions avtomatlashtirish (.github/workflows/daily-refresh.yml, 0879b16 bilan qo'shilgan):
  birinchi (va yagona) ishga tushirishi 17.10.2026 09:33 UTC'da bo'lgan (jadvaldan ~4 soat kech —
  yangi scheduled workflow uchun odatiy kechikish) va **MUVAFFAQIYATSIZ tugagan**: sabab —
  `GOOGLE_SERVICE_ACCOUNT_JSON` sir (secret) repo Settings → Secrets and variables → Actions'da
  hali sozlanmagan (source/ci/SETUP.md'da tasvirlangan bir martalik sozlash bajarilmagan). Bugungi
  (18.10) 05:30 UTC jadvali bo'yicha hali yangi ishga tushirish yo'q (tekshirilgan vaqtda, 05:4x
  UTC). Demak GitHub Actions hali ishlamayapti — bu kunlik Claude vazifasi hamon ASOSIY (zahira
  emas, haqiqiy) ishlash usuli. Foydalanuvchiga buni sozlash kerakligi aytildi.
- GitHub: `index.html`, `source/quyish-open.html`, `source/apm/apm.js` va shu yozuv main branch'ga
  push qilinadi.

Xulosa: bugungi yangilash MUVAFFAQIYATLI — Tahlil 16 kunlik (KEEP_PLAN, kerak=40593) va APM 16
kunlik (fakt 280377) ma'lumot bilan, real o'zgarish yo'q (jamoa hali 17/18-oktabr ma'lumotini
kiritmagan). Muammo: GitHub Actions avtomatlashtirish GOOGLE_SERVICE_ACCOUNT_JSON siri yo'qligi
sababli hali bir marta muvaffaqiyatsiz ishlagan — foydalanuvchi buni sozlashi kerak (source/ci/SETUP.md),
aks holda bu kunlik Claude vazifasi davom etishi kerak bo'ladi. PushNotification yuborilmadi (kunlik
nashr muvaffaqiyatli, lekin GitHub Actions muammosi session xulosasida aytiladi).

**19.10.2026, ~05:40-05:46 UTC / ~10:40-10:46 mahalliy (standart kunlik vazifa, CRON_TZ=Asia/Tashkent
30 10 * * *):** Manba jadval (Kunlik_Panel) tekshirildi: Sana=2026-10-19 (bugungi kun bilan AYNAN mos,
anomaliya yo'q), "Fakt kiritilganmi: ✗ Hali yo'q", "Chiqim kiritilganmi: ✗ Hali yo'q", "Plan berilganmi
(Berilgan_Plan): ✓ Berilgan", "IMM_Fact to'ldirilganmi: ✓ To'ldirilgan". SANA QOIDASIga ko'ra "Plan
berilganmi ✓" ishonchli — to'liq kunlik yangilash (KEEP_PLAN'siz) bajarildi:
- `rebuild_dash.py`: N_DAYS 16→17 (1-17 okt), NEED_TOTAL 40593→54656 (yangi ishonchli Plan_Berish'dan),
  116 qator, crit=2, high=25 — XAVFLI xato yo'q.
- `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 17 kun, kerak=54656" — XAVFLI xato yo'q.
- `archive_kirim_month.py ... all`: 0 ta yangi yozuv (arxivda jami 5 ta, o'zgarmadi).
- `bake_kirim_snapshot.py`: OK, 1 ta yozuv, vaqt belgisi yangilandi (19.10.2026 10:43).
- APM (3c): `rebuild_apm.py apm/apm.js /tmp/zyt.xlsx` — "Mavjud oy yangilandi: 19 kun, fakt
  280377→309269 (17/18-kun fakti endi to'liq kiritilgan), reja 212771 (9 kun), IMM kunlari:
  8,12,13,14,16,19" — XAVFLI xato yo'q. APM standart "bir kunlik ma'lumot" so'nggi haqiqiy fakt kuni
  (17.10, shan)ni ko'rsatadi (18/19-kun fakti hali 0) — apm.js'dagi fillDays() mantiqiga mos, kutilgan.
- `node build_login.js`: muvaffaqiyatli, parollar o'zgarmadi (uk123456).
- Playwright (`source/ci/verify.js` + vaqtinchalik APM tekshiruvi, playwright@1.56.0 global
  /opt/npm-tools + /opt/pw-browsers orqali): barcha uch hisob (ombor/admin/apm) xatosiz login qildi,
  pageerror yo'q (faqat kutilgan CDN/tunnel bloklanish xatolari). Oktabr KPI (1-17 okt): Jami qoldiq
  154 726/116 detal, Shoshilinch yetishmovchilik 184 dona/2 detal, Tugagan detallar 25, Ishlab
  chiqarildi 309 269 (APM fakt bilan mos, TOT_PROD yig'indisi bilan tasdiqlangan), Jo'natildi 273 888.
  Sentabr filtri (2026-09-01..2026-09-30): Ishlab chiqarildi **646 593 dona, 1-29 sen** — AYNAN mos,
  sentabr o'zgarmagan. APM: "Oy" ro'yxatida "Oktabr 2026 (joriy)" va "Sentabr 2026 (yakunlangan)"
  ikkalasi bor; kun ro'yxati 01.10-19.10'gacha.
- Claude Artifact (https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5): o'qildi (viewed, versiya
  1792302277-1587 — 18.10'dagi oxirgi nashr bilan bir xil, "newer version" muammosi yo'q), so'ng
  `quyish-login.html` bilan `capabilities`siz qayta nashr qilindi (Version 67, 1792388725-83d0).
- GitHub Actions avtomatlashtirish (.github/workflows/daily-refresh.yml): hamon
  `GOOGLE_SERVICE_ACCOUNT_JSON` siri sozlanmagani sababli ishlamayapti (18.10'dagi holat bilan bir
  xil) — bu kunlik Claude vazifasi hamon ASOSIY ishlash usuli.
- GitHub: `index.html`, `source/quyish-open.html` va `source/apm/apm.js` shu yozuv bilan birga main
  branch'ga push qilinadi.

Xulosa: bugungi yangilash MUVAFFAQIYATLI — Tahlil 17 kunlik (1-17 okt, kerak=54656, yangi ishonchli
Plan) va APM 19 kunlik (fakt 309269) ma'lumot bilan. Muammo yo'q (GitHub Actions sir muammosi
oldingi kunlardan beri ma'lum, o'zgarmagan). PushNotification yuborilmadi.

**Davomi (19.10.2026, ~10:20-10:22 UTC / ~15:20-15:22 mahalliy) — foydalanuvchi (Rustam)
to'g'ridan-to'g'ri so'rovi bilan ("do it again") ikkinchi mustaqil tekshiruv:** Manba jadvallar
(zyt.xlsx, Oktabr ASTATKA) qayta yuklab olindi. Kunlik_Panel holati o'zgarmagan: Sana=2026-10-19,
"Fakt: ✗", "Chiqim: ✗", "Plan berilganmi: ✓ Berilgan", "IMM_Fact: ✓" — ~05:40 UTC'dagi birinchi
tekshiruv bilan AYNAN bir xil. To'liq pipeline yana bajarildi:
- `rebuild_dash.py`: N_DAYS=17, NEED_TOTAL=54656 — o'zgarmadi, XAVFLI yo'q.
- `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 17 kun, kerak=54656" — XAVFLI yo'q.
- `archive_kirim_month.py ... all`: 0 ta yangi yozuv (jami 5 ta, o'zgarmadi).
- `bake_kirim_snapshot.py`: vaqt belgisi yangilandi (19.10.2026 15:21).
- `rebuild_apm.py`: "Mavjud oy yangilandi: 19 kun, fakt 309269 (o'zgarmadi), reja 212771 (9 kun,
  o'zgarmadi), IMM kunlari: 8,12,13,14,16,19" — apm.js fayli bayt-bayt bir xil chiqdi (git diff'da
  ko'rinmadi) — manba ma'lumot bu ~5 soat ichida o'zgarmagan.
- `node build_login.js`: muvaffaqiyatli, parollar o'zgarmadi.
- Playwright (`source/ci/verify.js`): barcha uch hisob xatosiz login qildi, pageerror yo'q, Oktabr
  KPI va Sentabr (646 593, 1-29 sen) 05:40'dagi bilan bir xil.
- Claude Artifact: o'qildi (versiya 1792388725-83d0 — oldingi oxirgi nashr bilan bir xil, konflikt
  yo'q), qayta nashr qilindi (Version 68, 1792405348-4620).
- GitHub: `index.html` va `source/quyish-open.html` push qilindi (faqat Kirim/Chiqim snapshot vaqt
  belgisi va planDate 18.10→19.10 o'zgardi — real ma'lumot bir xil, `source/apm/apm.js` o'zgarmagani
  uchun bu safar commitga kiritilmadi).

Xulosa: ikkinchi mustaqil tekshiruv ham MUVAFFAQIYATLI, real o'zgarish yo'q (manba ma'lumot bir xil
qoldi). Muammo yo'q, PushNotification yuborilmadi.

**19.10.2026 (~11:55 mahalliy) — GitHub Actions avtomatlashtirish: haqiqiy sinov natijasi (Claude/token ishtirokisiz):**
Rustamning ruxsati bilan ("tokendan tashqari ishlashni ham boshlash kerak") `source/ci/gdrive.py`
qayta yozildi — endi GOOGLE_SERVICE_ACCOUNT_JSON sir o'rnatilmagan bo'lsa, ikkala manba jadvalni
hech qanday kalit/tokensiz, ochiq eksport havolasi (`.../export?format=xlsx`) orqali yuklab oladi
(sabab: ikkala jadval `get_file_permissions` orqali tekshirilganda allaqachon "Anyone with the
link — Viewer" ekani aniqlandi). Kod push qilindi (commit c20cd0a) va workflow qo'lda 2 marta
ishga tushirildi (`workflow_dispatch`, run #39247688553, 2 urinish) — haqiqiy natija:

- "Oktabr ASTATKA" (fileId 1BJJXwxWtqL6...) — ochiq havola orqali MUVAFFAQIYATLI yuklandi,
  hech qanday sozlash kerak emas edi.
- "Zaxira Yetish Tahlili (IMM Grafik)" (fileId 1I4GbqRL...) — ikkala urinishda ham 401 xatosi
  bilan muvaffaqiyatsiz tugadi, garchi `get_file_permissions` bu faylda ham xuddi shunday
  "anyone"/"reader" ruxsati borligini ko'rsatsa ham. Eng ehtimolli sabab: Google Sheets'ning
  alohida sozlamasi — "Disable download, print, and copy for commenters and viewers"
  (ko'ruvchilar uchun yuklab olish/chop etish/nusxalashni taqiqlash) — bu sozlama shu bitta
  faylda yoqilgan bo'lishi mumkin (umumiy "havola orqali ko'rish" ruxsatidan ALOHIDA sozlama,
  Drive API orqali o'qib/o'zgartirib bo'lmaydi — faqat Sheets/Drive veb-interfeysida, fayl
  egasi tomonidan).

Xulosa: avtomatlashtirish YARIM ishlayapti — bitta jadval uchun to'liq tayyor, ikkinchisi uchun
Rustamning bitta qo'lda qadami kerak (pastga qarang). Shuning uchun GitHub Actions workflow
hozircha hali ham muvaffaqiyatsiz tugaydi va Claude'ning kunlik zahira vazifasi (10:30, Asia/Tashkent)
albatta davom etishi kerak — hali o'chirilmasin.

**Keyingi qadam (Rustam uchun, ~10 soniya):** "Zaxira Yetish Tahlili (IMM Grafik) last rev1"
jadvalini oching -> **Share** tugmasi -> yuqori o'ngdagi tishli g'ildirak (Advanced/Settings)
-> agar "Disable the option for commenters and viewers to download, print and copy this file"
belgilangan bo'lsa, belgisini OLIB TASHLANG -> saqlang. Shundan keyin Claude workflow'ni qayta
ishga tushirib tasdiqlaydi. Agar bu sozlamani xavfsizlik nuqtai nazaridan o'zgartirmoqchi
bo'lmasangiz, muqobil yo'l: `source/ci/SETUP.md` bo'yicha to'liq service-account sozlashni
bajarish (bu usul bu cheklovdan mustaqil ishlaydi).

**20.10.2026, ~05:40-05:46 UTC / ~10:40-10:46 mahalliy (standart kunlik vazifa):** Manba jadval
(Kunlik_Panel) tekshirildi: Sana=2026-10-20 (bugungi kun bilan AYNAN mos, anomaliya yo'q). Holat:
"Fakt kiritilganmi: ✓", "Chiqim kiritilganmi: ✓", "Plan berilganmi (Berilgan_Plan): ✓ Berilgan",
"IMM_Fact to'ldirilganmi: ✓ To'ldirilgan" — barcha to'rt bayroq ✓. SANA QOIDASIga ko'ra ishonchli —
to'liq kunlik yangilash (KEEP_PLAN'siz) bajarildi:
- `rebuild_dash.py`: N_DAYS 17→19 (1-19 okt), NEED_TOTAL 54656→47144 (yangi ishonchli Plan_Berish'dan),
  116 qator, crit=1, high=23 — XAVFLI xato yo'q.
- `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 19 kun, kerak=47144" — XAVFLI xato yo'q.
- `archive_kirim_month.py ... all`: 0 ta yangi yozuv (arxivda jami 5 ta, o'zgarmadi).
- `bake_kirim_snapshot.py`: OK, 1 ta yozuv, vaqt belgisi yangilandi (20.10.2026 10:42).
- APM (3c): `rebuild_apm.py apm/apm.js /tmp/zyt.xlsx` — "Mavjud oy yangilandi: 20 kun, fakt
  309269→333364 (19-kun fakti endi to'liq kiritilgan), reja 238253 (10 kun), IMM kunlari:
  8,12,13,14,16,19,20" — XAVFLI xato yo'q.
- `node build_login.js`: muvaffaqiyatli, parollar o'zgarmadi (uk123456).
- Playwright (`source/ci/verify.js` + vaqtinchalik APM tekshiruvi): barcha uch hisob (ombor/admin/apm)
  xatosiz login qildi, pageerror yo'q (faqat kutilgan CDN/tunnel bloklanish xatolari). Oktabr KPI
  (1-19 okt): Jami qoldiq 156 786/116 detal, Shoshilinch yetishmovchilik 224 dona/1 detal, Tugagan
  detallar 24, Ishlab chiqarildi 333 364 (APM fakt bilan mos), Jo'natildi 295 923. Sentabr filtri
  (2026-09-01..2026-09-30): Ishlab chiqarildi **646 593 dona, 1-29 sen** — AYNAN mos, sentabr
  o'zgarmagan. APM: "Oy" ro'yxatida "Oktabr 2026 (joriy)" va "Sentabr 2026 (yakunlangan)" ikkalasi
  bor; kun ro'yxati 01.10-20.10'gacha; standart "bir kunlik ma'lumot" so'nggi IMM-nusxali kun
  (19.10, dush)ni ko'rsatadi: Fakt 24 095, Reja 27 736, bajarilish 87% — dash bilan mos.
- Claude Artifact (https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5): o'qildi (viewed, versiya
  1792405348-4620 — 19.10'dagi oxirgi nashr bilan bir xil, "newer version" muammosi yo'q), so'ng
  `quyish-login.html` bilan `capabilities`siz qayta nashr qilindi (Version 69, 1792475041-076c).
- GitHub Actions avtomatlashtirish: hamon faqat "Oktabr ASTATKA" uchun ochiq havola orqali
  ishlaydi; "Zaxira Yetish Tahlili" jadvali uchun Rustamning bitta qadami (yoki SETUP.md) hali
  bajarilmagan (19.10'dagi holat bilan bir xil) — bu kunlik Claude vazifasi hamon ASOSIY usul.
- GitHub: `index.html`, `source/quyish-open.html` va `source/apm/apm.js` shu yozuv bilan birga
  main branch'ga push qilindi.

Xulosa: bugungi yangilash MUVAFFAQIYATLI — Tahlil 19 kunlik (1-19 okt, kerak=47144, yangi ishonchli
Plan) va APM 20 kunlik (fakt 333364) ma'lumot bilan. Muammo yo'q (GitHub Actions sir/ruxsat muammosi
oldingi kunlardan beri ma'lum, o'zgarmagan). PushNotification yuborilmadi.

**21.10.2026, ~05:40-05:46 UTC / ~10:40-10:46 mahalliy (standart kunlik vazifa):** Manba jadval
(Kunlik_Panel) tekshirildi: Sana=2026-10-21 (bugungi kun bilan AYNAN mos, anomaliya yo'q). Holat:
"Fakt kiritilganmi: ✓", "Chiqim kiritilganmi: ✓", "Plan berilganmi (Berilgan_Plan): ✗ Hali yo'q",
"IMM_Fact to'ldirilganmi: ✓ To'ldirilgan". SANA QOIDASIga ko'ra "Plan berilganmi ✗" bo'lgani uchun
Plan_Berish'ning kerak/ustuvorlik ustunlariga ishonilmadi, LEKIN nashr o'tkazib yuborilmadi — KEEP_PLAN
rejimida to'liq kunlik yangilash bajarildi:
- `KEEP_PLAN=quyish-open.html python3 rebuild_dash.py`: N_DAYS 19→20 (1-20 okt), NEED_TOTAL oxirgi
  nashrdan saqlanib qoldi (47144, 0 ta detal topilmadi), 116 qator, crit=1, high=23 — XAVFLI xato yo'q.
- `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 20 kun, kerak=47144" — XAVFLI xato yo'q.
- `archive_kirim_month.py ... all`: 0 ta yangi yozuv (arxivda jami 5 ta, o'zgarmadi).
- `bake_kirim_snapshot.py`: OK, 1 ta yozuv, vaqt belgisi yangilandi (21.10.2026 10:43).
- APM (3c): `rebuild_apm.py apm/apm.js /tmp/zyt.xlsx` — "Mavjud oy yangilandi: 20 kun, fakt
  333364→358904 (20-kun fakti endi to'liq kiritilgan), reja 261913 (10 kun), IMM kunlari:
  8,12,13,14,16,19,20" — XAVFLI xato yo'q.
- `node build_login.js`: muvaffaqiyatli, parollar o'zgarmadi (uk123456).
- Playwright (`source/ci/verify.js` + vaqtinchalik APM tekshiruvi): barcha uch hisob (ombor/admin/apm)
  xatosiz login qildi, pageerror yo'q (faqat kutilgan CDN/tunnel bloklanish xatolari). Oktabr KPI
  (1-20 okt): Jami qoldiq 156 961/116 detal, Shoshilinch yetishmovchilik 224 dona/1 detal, Tugagan
  detallar 20, Ishlab chiqarildi 358 904 (APM fakt bilan mos), Jo'natildi 321 288. Sentabr filtri
  (2026-09-01..2026-09-30): Ishlab chiqarildi **646 593 dona, 1-29 sen** — AYNAN mos, sentabr
  o'zgarmagan. APM: "Oy" ro'yxatida "Oktabr 2026 (joriy)" va "Sentabr 2026 (yakunlangan)" ikkalasi
  bor; kun ro'yxati 01.10-20.10'gacha; standart "bir kunlik ma'lumot" so'nggi IMM-nusxali kun
  (20.10, sesh)ni ko'rsatadi: Fakt 25 540, Reja 24 920, bajarilish 102% — dash bilan mos.
- Claude Artifact (https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5): o'qildi (viewed, versiya
  1792475041-076c — 20.10'dagi oxirgi nashr bilan bir xil, "newer version" muammosi yo'q), so'ng
  `quyish-login.html` bilan `capabilities`siz qayta nashr qilindi (Version 70, 1792561517-8f9f).
- GitHub Actions avtomatlashtirish: hamon faqat "Oktabr ASTATKA" uchun ochiq havola orqali
  ishlaydi; "Zaxira Yetish Tahlili" jadvali uchun Rustamning bitta qadami (yoki SETUP.md) hali
  bajarilmagan (20.10'dagi holat bilan bir xil) — bu kunlik Claude vazifasi hamon ASOSIY usul.
- GitHub: `index.html`, `source/quyish-open.html` va `source/apm/apm.js` shu yozuv bilan birga
  main branch'ga push qilinadi.

Xulosa: bugungi yangilash MUVAFFAQIYATLI — Tahlil 20 kunlik (1-20 okt, kerak=47144 KEEP_PLAN'dan, Plan
hali kiritilmagan) va APM 20 kunlik (fakt 358904) ma'lumot bilan. Muammo yo'q (GitHub Actions
sir/ruxsat muammosi oldingi kunlardan beri ma'lum, o'zgarmagan). PushNotification yuborilmadi.

**22.10.2026, ~05:43-05:50 UTC / ~10:43-10:50 mahalliy (standart kunlik vazifa):** Manba jadval
(Kunlik_Panel) tekshirildi: Sana=2026-10-22 (bugungi kun bilan AYNAN mos, anomaliya yo'q). Holat:
"Fakt kiritilganmi: ✓", "Chiqim kiritilganmi: ✓", "Plan berilganmi (Berilgan_Plan): ✗ Hali yo'q",
"IMM_Fact to'ldirilganmi: ✓ To'ldirilgan". SANA QOIDASIga ko'ra "Plan berilganmi ✗" bo'lgani uchun
Plan_Berish'ning kerak/ustuvorlik ustunlariga ishonilmadi, LEKIN nashr o'tkazib yuborilmadi — KEEP_PLAN
rejimida to'liq kunlik yangilash bajarildi:
- `KEEP_PLAN=quyish-open.html python3 rebuild_dash.py`: N_DAYS 20→21 (1-21 okt), NEED_TOTAL oxirgi
  nashrdan saqlanib qoldi (47144, 0 ta detal topilmadi), 116 qator, crit=1, high=23 — XAVFLI xato yo'q.
- `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 21 kun, kerak=47144" — XAVFLI xato yo'q.
- `archive_kirim_month.py ... all`: 0 ta yangi yozuv (arxivda jami 5 ta, o'zgarmadi).
- `bake_kirim_snapshot.py`: OK, 1 ta yozuv, vaqt belgisi yangilandi (22.10.2026 10:44).
- APM (3c): `rebuild_apm.py apm/apm.js /tmp/zyt.xlsx` — "Mavjud oy yangilandi: 21 kun, fakt
  358904→385032 (21-kun fakti endi to'liq kiritilgan), reja 292938 (11 kun), IMM kunlari:
  8,12,13,14,16,19,20" — XAVFLI xato yo'q.
- `node build_login.js`: muvaffaqiyatli, parollar o'zgarmadi (uk123456).
- Playwright (`source/ci/verify.js` + vaqtinchalik APM tekshiruvi, playwright@ /opt/npm-tools +
  /opt/pw-browsers orqali): barcha uch hisob (ombor/admin/apm) xatosiz login qildi, pageerror yo'q
  (faqat kutilgan CDN/tunnel bloklanish xatolari). Oktabr KPI (1-21 okt): Jami qoldiq 149 537/116
  detal, Shoshilinch yetishmovchilik 224 dona/1 detal, Tugagan detallar 19, Ishlab chiqarildi
  385 032 (APM fakt bilan mos), Jo'natildi 354 840. Sentabr filtri (2026-09-01..2026-09-30): Ishlab
  chiqarildi **646 593 dona, 1-29 sen** — AYNAN mos, sentabr o'zgarmagan. APM: "Oy" ro'yxatida
  "Oktabr 2026 (joriy)" va "Sentabr 2026 (yakunlangan)" ikkalasi bor; kun ro'yxati 01.10-21.10'gacha;
  standart "bir kunlik ma'lumot" so'nggi fakt kuni (21.10, chor)ni ko'rsatadi: Fakt 26 128 (1-sm
  14 518, 2-sm 11 610), Reja 31 025, bajarilish 84% — dash bilan mos.
- Claude Artifact (https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5): o'qildi (viewed, versiya
  1792561517-8f9f — 21.10'dagi oxirgi nashr bilan bir xil, "newer version" muammosi yo'q), so'ng
  `quyish-login.html` bilan `capabilities`siz qayta nashr qilindi (Version 71, 1792647958-fb42).
- GitHub Actions avtomatlashtirish: bugungi (05:30 UTC) ishga tushirish hali ro'yxatda yo'q
  (tekshirilgan vaqtda); oxirgi (21.10) ishga tushirish hamon muvaffaqiyatsiz — "Zaxira Yetish
  Tahlili" jadvali uchun Rustamning bitta qadami (yoki SETUP.md) hali bajarilmagan (19-21.10'dagi
  holat bilan bir xil) — bu kunlik Claude vazifasi hamon ASOSIY usul.
- GitHub: `index.html`, `source/quyish-open.html`, `source/apm/apm.js` va shu yozuv bilan birga
  main branch'ga push qilinadi.

Xulosa: bugungi yangilash MUVAFFAQIYATLI — Tahlil 21 kunlik (1-21 okt, kerak=47144 KEEP_PLAN'dan, Plan
hali kiritilmagan) va APM 21 kunlik (fakt 385032) ma'lumot bilan. Muammo yo'q (GitHub Actions
sir/ruxsat muammosi oldingi kunlardan beri ma'lum, o'zgarmagan). PushNotification yuborilmadi.

**23.10.2026, ~05:40-05:46 UTC / ~10:40-10:46 mahalliy (standart kunlik vazifa):** Manba jadval
(Kunlik_Panel) tekshirildi: Sana=2026-10-23 (bugungi kun bilan AYNAN mos, anomaliya yo'q). Holat:
"Fakt kiritilganmi: ✓", "Chiqim kiritilganmi: ✓", "Plan berilganmi (Berilgan_Plan): ✗ Hali yo'q",
"IMM_Fact to'ldirilganmi: ✓ To'ldirilgan". SANA QOIDASIga ko'ra "Plan berilganmi ✗" bo'lgani uchun
Plan_Berish'ning kerak/ustuvorlik ustunlariga ishonilmadi, LEKIN nashr o'tkazib yuborilmadi — KEEP_PLAN
rejimida to'liq kunlik yangilash bajarildi:
- `KEEP_PLAN=quyish-open.html python3 rebuild_dash.py`: N_DAYS 21→22 (1-22 okt), NEED_TOTAL oxirgi
  nashrdan saqlanib qoldi (47144, 0 ta detal topilmadi), 116 qator, crit=1, high=23 — XAVFLI xato yo'q.
- `apply_dash_update.py`: "Mavjud oy (2026-10) yangilandi: 22 kun, kerak=47144" — XAVFLI xato yo'q.
- `archive_kirim_month.py ... all`: 0 ta yangi yozuv (arxivda jami 5 ta, o'zgarmadi).
- `bake_kirim_snapshot.py`: OK, 1 ta yozuv, vaqt belgisi yangilandi (23.10.2026 10:43).
- APM (3c): `rebuild_apm.py apm/apm.js /tmp/zyt.xlsx` — "Mavjud oy yangilandi: 22 kun, fakt
  385032→417727 (22-kun fakti endi to'liq kiritilgan), reja 328051 (12 kun), IMM kunlari:
  8,12,13,14,16,19,20" — XAVFLI xato yo'q.
- `node build_login.js`: muvaffaqiyatli, parollar o'zgarmadi (uk123456).
- Playwright (`source/ci/verify.js` + vaqtinchalik APM tekshiruvi, playwright@ /opt/npm-tools +
  /opt/pw-browsers orqali): barcha uch hisob (ombor/admin/apm) xatosiz login qildi, pageerror yo'q
  (faqat kutilgan CDN/tunnel bloklanish xatolari). Oktabr KPI (1-22 okt): Jami qoldiq 154 597/116
  detal, Shoshilinch yetishmovchilik 224 dona/1 detal, Tugagan detallar 18, Ishlab chiqarildi
  417 727 (APM fakt bilan mos), Jo'natildi 382 475. Sentabr filtri (2026-09-01..2026-09-30): Ishlab
  chiqarildi **646 593 dona, 1-29 sen** — AYNAN mos, sentabr o'zgarmagan. APM: "Oy" ro'yxatida
  "Oktabr 2026 (joriy)" va "Sentabr 2026 (yakunlangan)" ikkalasi bor; kun ro'yxati 01.10-22.10'gacha;
  standart "bir kunlik ma'lumot" so'nggi fakt kuni (22.10, pay)ni ko'rsatadi: Fakt 32 695 (1-sm
  16 341, 2-sm 16 354), Reja 35 113, bajarilish 93% — dash bilan mos.
- Claude Artifact (https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5): o'qildi (viewed, versiya
  1792647958-fb42 — 22.10'dagi oxirgi nashr bilan bir xil, "newer version" muammosi yo'q), so'ng
  `quyish-login.html` bilan `capabilities`siz qayta nashr qilindi (Version 72, 1792734305-65e6).
- GitHub Actions avtomatlashtirish: bugungi (05:30 UTC) ishga tushirish tekshirilgan vaqtda (05:45
  UTC) hali ro'yxatda yo'q edi (oldingi kunlarda bo'lgani kabi kechikish bilan ishga tushishi
  mumkin); oxirgi (22.10) ishga tushirish hamon muvaffaqiyatsiz — "Zaxira Yetish Tahlili" jadvali
  uchun Rustamning bitta qadami (yoki SETUP.md) hali bajarilmagan (19-22.10'dagi holat bilan bir
  xil) — bu kunlik Claude vazifasi hamon ASOSIY usul.
- GitHub: `index.html`, `source/quyish-open.html`, `source/apm/apm.js` va shu yozuv bilan birga
  main branch'ga push qilinadi.

Xulosa: bugungi yangilash MUVAFFAQIYATLI — Tahlil 22 kunlik (1-22 okt, kerak=47144 KEEP_PLAN'dan, Plan
hali kiritilmagan) va APM 22 kunlik (fakt 417727) ma'lumot bilan. Muammo yo'q (GitHub Actions
sir/ruxsat muammosi oldingi kunlardan beri ma'lum, o'zgarmagan). PushNotification yuborilmadi.
