const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const results = {};
  const consoleErrors = [];

  async function freshPage() {
    const page = await browser.newPage();
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', err => consoleErrors.push('pageerror: ' + err.message));
    return page;
  }

  async function login(page, user, pass) {
    const fileUrl = 'file://' + path.resolve('quyish-login.html');
    await page.goto(fileUrl);
    await page.fill('#u', user);
    await page.fill('#p', pass);
    await page.click('#go');
    await page.waitForSelector('#app:not([hidden])', { timeout: 10000 });
  }

  // ---- Admin login: check Tahlil paneli (dash) + Kirim/Chiqim ----
  {
    const page = await freshPage();
    await login(page, 'admin', 'uz123456');
    await page.waitForTimeout(500);
    const errAfterLogin = await page.$eval('#err', el => el.textContent).catch(() => '');
    results.loginErr = errAfterLogin;

    // switch to Tahlil paneli tab
    await page.click('#tab-dash');
    await page.waitForTimeout(1200);
    const kpisDefault = await page.$eval('#kpis', el => el.innerText).catch(e => 'ERROR:' + e.message);
    results.kpisDefault = kpisDefault;

    // Apply September filter 2026-09-01..2026-09-30
    await page.fill('#dx-f-from', '2026-09-01');
    await page.fill('#dx-f-to', '2026-09-30');
    await page.click('#dx-f-apply');
    await page.waitForTimeout(1200);
    const kpisSep = await page.$eval('#kpis', el => el.innerText).catch(e => 'ERROR:' + e.message);
    results.kpisSep = kpisSep;

    // switch to Kirim/Chiqim tab
    await page.click('#tab-log');
    await page.waitForTimeout(1000);
    const logVisible = await page.$eval('#v-log', el => !el.hidden).catch(() => false);
    results.logTabVisible = logVisible;

    // switch to admin panel tab to make sure it loads without error
    await page.click('#tab-admin');
    await page.waitForTimeout(800);
    const adminVisible = await page.$eval('#v-admin', el => !el.hidden).catch(() => false);
    results.adminTabVisible = adminVisible;

    await page.close();
  }

  // ---- ombor login: check monitor view loads ----
  {
    const page = await freshPage();
    await login(page, 'ombor', 'uz123456');
    await page.waitForTimeout(800);
    const monVisible = await page.$eval('#v-mon', el => !el.hidden).catch(e => 'ERROR:' + e.message);
    results.omborMonVisible = monVisible;
    const hasDashTab = await page.$('#tab-dash');
    results.omborHasDashTab = !!hasDashTab;
    await page.close();
  }

  // ---- apm login: check reja/fakt tab ----
  {
    const page = await freshPage();
    await login(page, 'apm', 'uz123456');
    await page.waitForTimeout(800);
    const apmVisible = await page.$('#tab-apm');
    results.apmHasApmTab = !!apmVisible;
    await page.close();
  }

  results.consoleErrors = consoleErrors;
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
