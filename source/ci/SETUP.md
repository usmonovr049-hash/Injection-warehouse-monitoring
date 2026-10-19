# GitHub Actions orqali to'liq avtomatik kunlik yangilash

**19.10.2026'da yangilandi:** hozircha **hech qanday qo'lda sozlash shart emas** — pastda
tasvirlangan "service account" usuli endi FAQAT ixtiyoriy/zaxira variant. Sabab: ikkala
manba Google Sheets fayli ("Oktabr ASTATKA" va "Zaxira Yetish Tahlili") allaqachon "Anyone
with the link — Viewer" (havola orqali kiruvchi har kim ko'ra oladi) qilib ulashilgan
ekan — shuning uchun `source/ci/gdrive.py` ularni hech qanday kalit/token kerak bo'lmagan
ochiq eksport havolasi (`.../export?format=xlsx`) orqali o'qiydi. Workflow (`.github/workflows/daily-refresh.yml`)
allaqachon shu holatda ishlashga tayyor — hech kim hech narsa qilishi shart emas.

Bu sozlashdan keyin kunlik yangilash **Claude/token ishtirokisiz**, to'liq bepul (GitHub
Actions'ning bepul limiti ichida) avtomatik ishlaydi: har kuni 10:30da (Asia/Tashkent)
Google Sheets'dan ma'lumot olib, tekshirib (Playwright), GitHub Pages'ga (`index.html`)
nashr qiladi.

**Muhim cheklov:** Claude Artifact (`claude.ai/artifact/BZmDuP4C1RRMriXbNkEvJ5`) havolasini
faqat Claude o'zi nashr qila oladi — GitHub Actions u yerga yuklay olmaydi. Shuning uchun bu
sozlashdan keyin faqat **GitHub Pages** nusxasi har kuni avtomatik yangilanadi.

**Xavfsizlik eslatmasi:** "Anyone with the link" degani — bu havolani bilgan har qanday
odam (hatto Google hisobisiz) shu ikki manba jadvalni (faqat shu ikkitasini, butun saytni
emas) ko'ra oladi, degani. Bu hozircha o'zingiz (Rustam) tomonidan shunday sozlangan holat —
agar buni xavfsizroq qilish kerak bo'lsa (jadvallarni yopiq qilib, o'rniga quyidagi
"service account" usulini yoqish), pastdagi ixtiyoriy bosqichlarni bajaring.

## (Ixtiyoriy, xavfsizroq alternativa) Service account bilan ishlash

Agar kelajakda ikkita manba jadvalni "Anyone with the link"dan olib tashlab yopiq qilmoqchi
bo'lsangiz, avtomatlashtirish buzilmasligi uchun quyidagi bosqichlarni BIR MARTA bajaring
(10-15 daqiqa) — bular Claude bajara olmaydigan, albatta sizning shaxsiy Google/GitHub
hisobingiz orqali qilinadigan qadamlar:

### 1-qadam: Google Cloud'da "service account" yaratish

1. https://console.cloud.google.com ga kiring (Google hisobingiz bilan, Sheets'lar
   joylashgan hisob).
2. Yangi loyiha (project) yarating (yoki mavjudini tanlang) — masalan nomi
   "uzkoram-dashboard".
3. Chap menyudan **APIs & Services -> Library** ga o'ting, qidiruvga "Google Drive API"
   deb yozing, uni ochib **Enable** tugmasini bosing.
4. **APIs & Services -> Credentials** ga o'ting -> **Create Credentials -> Service
   account**. Nomini xohlagancha qo'ying (masalan "dashboard-refresh"), **Create and
   Continue** -> **Done** (rol/permission so'ralsa, hech narsa tanlamasdan o'tkazib
   yuborish mumkin — bu service account faqat o'zingiz bo'lishgan Sheets'larga kirishi
   kerak, boshqa hech narsaga emas).
5. Yaratilgan service account'ni oching, **Keys** bo'limiga o'ting -> **Add Key -> Create
   new key -> JSON** -> **Create**. Bir JSON fayl kompyuteringizga yuklanadi — buni
   ehtiyotlik bilan saqlang (bu parolga teng, hech kimga yubormang).
6. Service account'ning email manzilini nusxalab oling — JSON faylning ichida
   `"client_email": "...@...iam.gserviceaccount.com"` qatorida, yoki Google Cloud
   sahifasida ko'rinadi.

### 2-qadam: ikkita manba jadvalni service account bilan bo'lishish (va "Anyone with the link"ni o'chirish)

Ikkita Google Sheets faylini oching va har birida **Share** (Bo'lishish) tugmasini bosib,
1-qadamdagi service account email manzilini **Viewer** (Ko'ruvchi) huquqi bilan qo'shing,
so'ng "Anyone with the link" qatorini o'chirib, "Restricted" qilib qo'ying:

1. "Oktabr ASTATKA" (fileId `1BJJXwxWtqL6Xtokhk97GkIfY5TQ9_eJBlWK-hFguyIg`)
2. "Zaxira Yetish Tahlili (IMM Grafik)" (fileId `1I4GbqRL-r9_0pDiIL0hQatOSv_dAriYT5XbMr5K8Vv4`)

(Fayl havolasi: `https://docs.google.com/spreadsheets/d/<fileId>/edit`)

### 3-qadam: JSON kalitni GitHub repo siriga (secret) qo'shish

1. GitHub'da repo'ga o'ting: `usmonovr049-hash/Injection-warehouse-monitoring`
2. **Settings -> Secrets and variables -> Actions -> New repository secret**
3. Nomi: `GOOGLE_SERVICE_ACCOUNT_JSON`
4. Qiymati: 1-qadamda yuklab olingan JSON faylning **to'liq matnini** ochib, hammasini
   nusxalab shu yerga joylashtiring (butun faylni, `{` dan `}` gacha).
5. **Add secret** tugmasini bosing.

Bu sir qo'shilgan zahoti `gdrive.py` avtomatik ravishda ochiq havola o'rniga shu service
account'ga o'tadi (kod o'zgartirish shart emas).

### 4-qadam: tekshirish

1. Repo'da **Actions** bo'limiga o'ting, chap tomonda "Kunlik avtomatik yangilash"
   workflow'ni tanlang.
2. **Run workflow** tugmasi bilan qo'lda bir marta ishga tushiring.
3. Ishga tushirish tugagach, natijani ko'ring: agar yashil ✓ bo'lsa va `index.html`
   yangilangan bo'lsa — hammasi to'g'ri sozlangan. Agar xato chiqsa, log'larni o'qing —
   odatda 403 xatosi 2-qadam bajarilmaganini bildiradi.

## Keyinchalik eslab qolish kerak bo'lgan ikki narsa

- **Oy almashganda** (masalan noyabr boshlanib, oktabr "frozen" bo'lganda):
  `source/ci/frozen_baseline.json` faylini yangi oy va uning yakuniy "Ishlab chiqarildi"
  soniga yangilang — aks holda Playwright tekshiruvi eski (oktabr) songa qarab xato
  beradi. Bu bir qatorli tahrir.
- **Muammo chiqsa** (XAVFLI, sana anomaliyasi, Playwright xatosi, yoki manba jadval
  "Anyone with the link"dan olib tashlangani uchun 401/403): nashr qilinmaydi va repo'da
  avtomatik GitHub Issue ochiladi ("kunlik-yangilash-ogohlantirish" belgisi bilan) — shu
  orqali bilib olasiz.

## Claude'ning kunlik vazifasi haqida

Hozircha Claude'ning eski kunlik vazifasi (har kuni 10:30, Asia/Tashkent) ham ishlab
turadi — bu zahira (backup) sifatida qoldirildi, GitHub Actions ishlayotganini bir necha
kun tasdiqlagandan keyin uni o'chirib qo'yish mumkin, token tejash uchun (19.10.2026,
Rustam: "tokendan tashqari ishlashni ham boshlash kerak" — shu sababli endi service
account kerak bo'lmaydigan ochiq-havola usuliga o'tildi, bir martalik GCP sozlash shart
emas).
