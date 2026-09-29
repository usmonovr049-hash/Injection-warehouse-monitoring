# Kunlik yangilash yo'riqnomasi (Tahlil paneli)

Bu papka "Quyish paneli" tizimining manba kodi. Kunlik avtomatik yangilanish shu bosqichlar orqali amalga oshiriladi:

1. Google Drive orqali "Sentabr ASTATKA" jadvalini yuklab oling:
   fileId = `1BJJXwxWtqL6Xtokhk97GkIfY5TQ9_eJBlWK-hFguyIg`
   mcp__Google_Drive__download_file_content(fileId, exportMimeType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
   Natijani base64'dan .xlsx faylga oching (masalan /tmp/astatka.xlsx).

2. `python3 rebuild_dash.py` ni ishga tushiring (avval /tmp/astatka.xlsx yo'lini script ichida
   tekshiring) — bu /tmp/dash_rebuild.json'ni yaratadi: N_DAYS, NEED_TOTAL, TOT_PROD, SHIP, END,
   RAW (Tahlil paneli uchun, P/E massivlari bilan), MON_RAW (Ombor monitori uchun, soddaroq).

   Muhim: bu skript "valid days" ni avtomatik aniqlaydi — kunlik "01".."31" varaqlaridagi
   "Kun boshiga qoldiq" ustunini solishtirib, oxirgi haqiqiy to'ldirilgan kunni topadi
   (G-vektor ketma-ket kunlar orasida farq qiladimi tekshiriladi). Demak N_DAYS har kuni
   o'zgarishi mumkin — bu normal.

3. `quyish-open.html` ichida IKKITA "const RAW=`...`;" bloki bor:
   - Birinchisi (mon skriptida, oldida "// n|model|detal raqami|nomi|qoldiq|kerak..." izohi bor)
     — MON_RAW bilan almashtiriladi (8 maydon: n|model|tpa|code|name|stock|need|prio).
   - Ikkinchisi (dash skriptida, oldida "// n|model|IMM, t|code|name|stock|demand|need|covers|
     priority..." izohi bor) — RAW bilan almashtiriladi (10-12 maydon).
   XATO QILMASLIK UCHUN: ikkalasini aniq shu izoh matnlari orqali toping, birinchi
   topilganini emas (bu xato allaqachon bir marta yuz bergan — ehtiyot bo'ling).
   Bundan tashqari: `const DAYS=Array.from({length:N},...)`, `const TOT_PROD=[...]`,
   `const NEED_TOTAL=N;`, `const SHIP=[...]`, `const END=[...]` — hammasini yangi qiymatlar
   bilan almashtiring. Matn yorliqlari ("1-28 sentabr", "29.09 rejasi" kabi) ham N_DAYS va
   bugungi sanaga mos yangilansin (bir nechta joyda takrorlanadi, grep bilan qidiring).

4. `node build_login.js` — quyish-login.html'ni qayta quradi (parollar o'zgarmaydi: barchasi
   "uz123456", pastki registrda).

5. Playwright bilan tekshiring (ombor/admin/apm hisoblari bilan kirib, xatosiz ekanini va
   KPI/qatorlar sonini tasdiqlang) — productiondagi raqamlarni ko'r-ko'rona nashr qilmang.

6. Ikkala joyga joylashtiring:
   - Claude Artifact: url=https://claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5,
     file_path=quyish-login.html (avval shu url'ni "read" qiling — "viewed" bo'lishi kerak).
   - GitHub Pages: shu repo (usmonovr049-hash/Injection-warehouse-monitoring), fayl "index.html"
     (repo ildizida), branch "main".

Eslatma: "Plan_Berish" varag'i har kuni yangilanadi (ustuvorlik/kerak/necha kunga yetadi) —
bu har doim ishonchli. Kunlik "01".."31" varaqlari esa jamoa tomonidan har kuni qo'lda
to'ldiriladi — ba'zan kechikishi mumkin (masalan bugun hali to'ldirilmagan bo'lishi mumkin).
Shuning uchun N_DAYS ba'zan bir necha kun o'zgarmasligi mumkin, bu xato emas.
