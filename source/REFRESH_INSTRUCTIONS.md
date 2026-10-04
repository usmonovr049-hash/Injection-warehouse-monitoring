# Kunlik yangilash yo'riqnomasi (Tahlil paneli)

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

3b. Kirim/Chiqim zaxira nusxasi (02.10.2026'dan): `python3 source/bake_kirim_snapshot.py quyish-open.html /tmp/astatka.xlsx`
   — AppSheet_Kirim varag'ini sahifadagi `<template id="kirim-snap">` blokiga joylaydi. claude.ai artifact
   sahifasi ba'zan Google Sheets'ga ulana olmaydi; shunda Kirim/Chiqim shu nusxani ko'rsatadi. Bu skript faqat
   shu template blokiga tegadi (Kirim/Chiqim skriptining o'ziga emas). Xato bersa — nashrni to'xtatmang,
   faqat session xulosasida ayting.

   Nashr: Artifact'ni `capabilities` parametrisiz nashr qiling (saqlangan `{db, downloads}` ruxsatlari
   avtomatik saqlanadi; `downloads` — Excel'ga yuklash tugmasi uchun kerak).

4. `node build_login.js` — quyish-login.html'ni qayta quradi (parollar o'zgarmaydi: barchasi
   "uz123456", pastki registrda). Agar kelajakda `quyish-open.html`ga YANGI (to'rtinchi,
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
