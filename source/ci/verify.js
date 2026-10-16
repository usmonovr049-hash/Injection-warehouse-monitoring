// Nashr qilishdan OLDIN majburiy Playwright tekshiruvi (hech qachon ko'r-ko'rona nashr qilma).
// Ishlatilishi: node verify.js <quyish-login.html yo'li> <frozen_baseline.json yo'li>
// Chiqish: stdout'ga JSON natija, exit code 0 = hammasi OK, 1 = muammo bor (nashr qilinmasin).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const TARGET = process.argv[2];
const BASELINE_PATH = process.argv[3];

if (!TARGET || !BASELINE_PATH) {
  console.error('FOYDALANISH: node verify.js <quyish-login.html> <frozen_baseline.json>');
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const results = {};
  const consoleErrors = [];
  const pageErrors = [];
  const problems = [];
  let ok = true;

  async function freshPage() {
    const page = await browser.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));
    return page;
  }

  async function login(page, user, pass) {
    await page.goto('file://' + path.resolve(TARGET));
    await page.fill('#u', user);
    await page.fill('#p', pass);
    await page.click('#go');
    await page.waitForSelector('#app:not([hidden])', { timeout: 15000 });
  }

  // Tab almashtirish ba'zan birinchi urinishda ishlamaydi (sahifa JS listener'lari
  // hali ulanmagan bo'lishi mumkin, ayniqsa sekin/CI muhitda) — shuning uchun
  // belgilangan vaqtga ko'r-ko'rona kutish o'rniga, haqiqiy holatni (view ko'rinishi)
  // kutib, kerak bo'lsa bosishni qayta uriniladi.
  async function selectTab(page, tabSelector, viewSelector) {
    let lastErr = null;
    for (let i = 0; i < 6; i++) {
      await page.click(tabSelector);
      try {
        await page.waitForSelector(viewSelector + ':not([hidden])', { timeout: 2000 });
        return;
      } catch (e) {
        lastErr = e;
      }
    }
    throw new Error(`${tabSelector} bosilgandan keyin ${viewSelector} ko'rinmadi: ${lastErr && lastErr.message}`);
  }

  // ---- admin: Tahlil paneli + muzlatilgan oy tekshiruvi + Kirim/Chiqim + admin tab ----
  {
    const page = await freshPage();
    try {
      await login(page, 'admin', 'uk123456');
      await selectTab(page, '#tab-dash', '#v-dash');
      await page.waitForSelector('#kpis', { timeout: 5000 });
      await page.waitForTimeout(500); // KPI raqamlari hisoblanishi uchun qisqa qo'shimcha vaqt
      results.kpisDefault = await page.$eval('#kpis', (el) => el.innerText);

      await page.fill('#dx-f-from', baseline.from);
      await page.fill('#dx-f-to', baseline.to);
      await page.click('#dx-f-apply');
      await page.waitForTimeout(1500);
      const kpisFrozen = await page.$eval('#kpis', (el) => el.innerText);
      results.kpisFrozen = kpisFrozen;

      const m = kpisFrozen.match(/ISHLAB CHIQARILDI\s*([\d\s]+)/i);
      const got = m ? parseInt(m[1].replace(/\D/g, ''), 10) : null;
      results.frozenTotal = got;
      if (got !== baseline.expected_total) {
        ok = false;
        problems.push(
          `MUZLATILGAN OY (${baseline.month_id}) RAQAMI MOS KELMADI: kutilgan ` +
            `${baseline.expected_total}, olingan ${got} — NASHR QILINMAYDI.`
        );
      }

      await selectTab(page, '#tab-log', '#v-log');
      results.logTabVisible = true;

      await selectTab(page, '#tab-admin', '#v-admin');
      results.adminTabVisible = true;
    } catch (e) {
      ok = false;
      problems.push('ADMIN TEKSHIRUVI XATOSI: ' + e.message);
    }
    await page.close();
  }

  // ---- ombor: monitor ko'rinishi, Tahlil tab yo'qligi ----
  {
    const page = await freshPage();
    try {
      await login(page, 'ombor', 'uk123456');
      await page.waitForSelector('#v-mon:not([hidden])', { timeout: 5000 });
      results.omborMonVisible = true;
      results.omborHasDashTab = !!(await page.$('#tab-dash'));
    } catch (e) {
      ok = false;
      problems.push('OMBOR TEKSHIRUVI XATOSI: ' + e.message);
    }
    await page.close();
  }

  // ---- apm: APM tab mavjudligi va ochilishi ----
  {
    const page = await freshPage();
    try {
      await login(page, 'apm', 'uk123456');
      results.apmHasApmTab = !!(await page.$('#tab-apm'));
      await selectTab(page, '#tab-apm', '#v-apm');
      results.apmVisible = true;
    } catch (e) {
      ok = false;
      problems.push('APM TEKSHIRUVI XATOSI: ' + e.message);
    }
    await page.close();
  }

  if (pageErrors.length) {
    ok = false;
    problems.push('PAGEERROR (haqiqiy xato): ' + pageErrors.join(' | '));
  }

  results.consoleErrors = consoleErrors;
  results.pageErrors = pageErrors;
  results.ok = ok;
  results.problems = problems;

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
  process.exit(ok ? 0 : 1);
})().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
