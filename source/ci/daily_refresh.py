#!/usr/bin/env python3
"""Kunlik avtomatik yangilash — GitHub Actions orqali, Claude/token ishtirokisiz.

Bu skript source/REFRESH_INSTRUCTIONS.md'da hujjatlashtirilgan qo'lda bajarilgan jarayonni
(Google Sheets'dan yuklash -> rebuild/apply/archive/snapshot/APM -> build_login -> Playwright
tekshiruvi -> nashr) ketma-ket, xavfsizlik qoidalariga rioya qilib avtomatlashtiradi:

  - XAVFLI (apply_dash_update.py / rebuild_apm.py)ni hech qachon majburlamaydi — chiqsa,
    tegishli qismni (Tahlil yoki APM) o'tkazib yuboradi va GitHub Issue ochadi.
  - SANA QOIDASI: Kunlik_Panel sanasi kutilgandan 2+ kun farq qilsa, Tahlil/Kirim-Chiqim
    nashrini o'tkazib yuboradi (APM mustaqil davom etadi).
  - "Plan berilganmi" ✗ bo'lsa, KEEP_PLAN rejimida ishlaydi (kunlik ishlab chiqarish/jo'natish
    yangilanadi, reja/ustuvorlik oxirgi ishonchli nashrdan saqlanadi) — hech qachon nashrni
    shu sabab bilan to'xtatmaydi (13.10.2026, Rustam tasdiqlagan qoida).
  - Playwright tekshiruvisiz (source/ci/verify.js) HECH QACHON nashr qilmaydi.
  - Muzlatilgan (frozen) oy ma'lumotiga HECH QACHON tegmaydi (bu allaqachon apply_dash_update.py
    va rebuild_apm.py ichida XAVFLI sifatida qo'riqlangan).

Muvaffaqiyatli yakunlansa: index.html + source/ fayllari push qilinishi uchun
GITHUB_OUTPUT'ga should_push=true yozadi (haqiqiy commit/push ishi workflow YAML'da).
Muammo chiqsa: push qilmaydi, GitHub Issue ochadi, REFRESH_INSTRUCTIONS.md'ga qisqa yozadi,
va baribir exit code 0 bilan tugaydi (bu BIZNES qoidasi bo'yicha "to'xtash", skript o'zi
ishlamay qolgani emas — shuning uchun job "failed" deb belgilanmaydi, ammo push bo'lmaydi).
"""
import datetime as dt
import json
import os
import shutil
import subprocess
import sys
import urllib.request
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gdrive  # noqa: E402
import kunlik_panel  # noqa: E402

CI_DIR = os.path.dirname(os.path.abspath(__file__))
SOURCE_DIR = os.path.dirname(CI_DIR)
REPO_DIR = os.path.dirname(SOURCE_DIR)
TASHKENT = ZoneInfo('Asia/Tashkent')

ASTATKA_FILE_ID = '1BJJXwxWtqL6Xtokhk97GkIfY5TQ9_eJBlWK-hFguyIg'  # "Oktabr ASTATKA"
ZYT_FILE_ID = '1I4GbqRL-r9_0pDiIL0hQatOSv_dAriYT5XbMr5K8Vv4'  # "Zaxira Yetish Tahlili (IMM Grafik)"

ASTATKA_PATH = '/tmp/astatka.xlsx'  # rebuild_dash.py'da hardcoded yo'l
ZYT_PATH = '/tmp/zyt.xlsx'


def log(*a):
    print(*a, flush=True)


def set_output(name, value):
    gh_out = os.environ.get('GITHUB_OUTPUT')
    if gh_out:
        with open(gh_out, 'a', encoding='utf-8') as f:
            f.write(f'{name}={value}\n')


def run(cmd, cwd=None, env=None):
    log('>>>', ' '.join(cmd), f'(cwd={cwd})' if cwd else '')
    r = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True)
    if r.stdout:
        log(r.stdout.strip())
    if r.returncode != 0:
        if r.stderr:
            log(r.stderr.strip())
        raise RuntimeError((r.stderr or r.stdout or 'noma\'lum xato').strip().splitlines()[-1])
    return r


def create_issue(title, body):
    token = os.environ.get('GITHUB_TOKEN')
    repo = os.environ.get('GITHUB_REPOSITORY')
    if not token or not repo:
        log('(GitHub Issue ochib bo\'lmadi — token/repo muhit o\'zgaruvchisi yo\'q)')
        log(title)
        log(body)
        return
    url = f'https://api.github.com/repos/{repo}/issues'
    payload = json.dumps({'title': title, 'body': body, 'labels': ['kunlik-yangilash-ogohlantirish']}).encode()
    req = urllib.request.Request(
        url,
        data=payload,
        method='POST',
        headers={
            'Authorization': f'Bearer {token}',
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'daily-refresh-bot',
            'Content-Type': 'application/json',
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            log('GitHub Issue ochildi, status', resp.status)
    except Exception as e:  # noqa: BLE001 - best-effort notification
        log('GitHub Issue ochishda xato:', e)


def append_log(summary_lines):
    path = os.path.join(SOURCE_DIR, 'REFRESH_INSTRUCTIONS.md')
    now = dt.datetime.now(TASHKENT).strftime('%d.%m.%Y %H:%M')
    text = f"\n**Avtomatik yangilash ({now} mahalliy, GitHub Actions, Claude/token ishtirokisiz):** "
    text += ' '.join(summary_lines) + '\n'
    with open(path, 'a', encoding='utf-8') as f:
        f.write(text)


def run_playwright_check():
    login_html = os.path.join(SOURCE_DIR, 'quyish-login.html')
    baseline = os.path.join(CI_DIR, 'frozen_baseline.json')
    env = os.environ.copy()
    node_modules = os.path.join(CI_DIR, 'node_modules')
    r = subprocess.run(
        ['node', os.path.join(CI_DIR, 'verify.js'), login_html, baseline],
        cwd=CI_DIR,
        env=env,
        capture_output=True,
        text=True,
    )
    log(r.stdout)
    if r.returncode != 0:
        log(r.stderr)
        return False, (r.stdout + '\n' + r.stderr).strip()
    return True, r.stdout


def main():
    problems = []
    tahlil_ok = False
    apm_ok = False
    summary = []

    log('--- Manba jadvallarni yuklab olish (ochiq havola / service account) ---')
    gdrive.export_xlsx(ASTATKA_FILE_ID, ASTATKA_PATH)
    gdrive.export_xlsx(ZYT_FILE_ID, ZYT_PATH)

    panel = kunlik_panel.read(ZYT_PATH)
    drift = kunlik_panel.date_drift_days(panel)
    log('Kunlik_Panel:', panel, '| sana farqi (kun):', drift)

    # ---- 1-3: Tahlil / Ombor / Kirim-Chiqim ----
    if drift is not None and drift >= 2:
        msg = (
            f"SANA ANOMALIYASI: Kunlik_Panel 'Sana:' = {panel['sana']}, kutilgan ishlab "
            f"chiqarish-kuni ~{kunlik_panel.expected_production_date()} (farq {drift} kun, "
            f"2 kundan ko'p). SANA QOIDASIga ko'ra Tahlil/Ombor/Kirim-Chiqim nashri "
            f"O'TKAZIB YUBORILDI — qo'lda tekshirish kerak."
        )
        problems.append(msg)
        summary.append("Tahlil/Ombor o'tkazib yuborildi (sana anomaliyasi).")
    else:
        plan_ok = kunlik_panel.is_ok(panel.get('plan'))
        quyish_open = os.path.join(SOURCE_DIR, 'quyish-open.html')
        env = os.environ.copy()
        if not plan_ok:
            env['KEEP_PLAN'] = quyish_open
            log("Plan berilganmi != OK -> KEEP_PLAN rejimi yoqildi.")
        try:
            run(['python3', 'rebuild_dash.py'], cwd=SOURCE_DIR, env=env)
            run(['python3', 'apply_dash_update.py', 'quyish-open.html', '/tmp/dash_rebuild.json'], cwd=SOURCE_DIR)
            run(['python3', 'archive_kirim_month.py', 'quyish-open.html', ASTATKA_PATH, 'all'], cwd=SOURCE_DIR)
            run(['python3', 'bake_kirim_snapshot.py', 'quyish-open.html', ASTATKA_PATH], cwd=SOURCE_DIR)
            tahlil_ok = True
            summary.append(
                "Tahlil/Ombor/Kirim-Chiqim yangilandi"
                + (" (KEEP_PLAN rejimida, Plan berilganmi hali ✗)" if not plan_ok else "")
                + "."
            )
        except RuntimeError as e:
            problems.append(f"TAHLIL/OMBOR XATOLIGI — NASHR QILINMADI: {e}")
            summary.append("Tahlil/Ombor o'tkazib yuborildi (xato, pastda).")

    # ---- 3c: APM — mustaqil, Tahlil holatidan qat'i nazar ----
    try:
        run(['python3', 'rebuild_apm.py', 'apm/apm.js', ZYT_PATH], cwd=SOURCE_DIR)
        apm_ok = True
        summary.append('APM yangilandi.')
    except RuntimeError as e:
        problems.append(f"APM XATOLIGI — YANGILANMADI: {e}")
        summary.append("APM o'tkazib yuborildi (xato, pastda).")

    if not tahlil_ok and not apm_ok:
        finish(problems, summary, pushed=False)
        return

    # ---- 4: login build (har doim, joriy holatni aks ettirish uchun) ----
    try:
        run(['node', 'build_login.js'], cwd=SOURCE_DIR)
    except RuntimeError as e:
        problems.append(f"build_login.js XATOLIGI: {e}")
        finish(problems, summary, pushed=False)
        return

    # ---- 5: Playwright — hech qachon ko'r-ko'rona nashr qilma ----
    ok, pw_out = run_playwright_check()
    if not ok:
        problems.append(f"PLAYWRIGHT TEKSHIRUVI MUVAFFAQIYATSIZ — NASHR QILINMADI:\n{pw_out}")
        finish(problems, summary, pushed=False)
        return
    summary.append('Playwright tekshiruvi o\'tdi.')

    # ---- 6-7: nashr (fayllarni joyiga qo'yish; commit/push workflow YAML'da) ----
    shutil.copy(os.path.join(SOURCE_DIR, 'quyish-login.html'), os.path.join(REPO_DIR, 'index.html'))
    summary.append('Nashr qilindi (GitHub Pages).')
    append_log(summary)
    finish(problems, summary, pushed=True)


def finish(problems, summary, pushed):
    set_output('should_push', 'true' if pushed else 'false')
    if problems:
        today = dt.datetime.now(TASHKENT).strftime('%d.%m.%Y %H:%M')
        title = f"Kunlik yangilash: e'tibor talab qiladi ({today} mahalliy)"
        body = '\n\n'.join(problems) + (
            "\n\n---\n(Avtomatik GitHub Actions ishga tushirish, Claude ishtirokisiz. "
            "Hech narsa majburiy ravishda nashr qilinmadi/o'zgartirilmadi.)"
        )
        create_issue(title, body)
        log('=== MUAMMO(LAR) ===')
        for p in problems:
            log('-', p)
    else:
        log('Muammo yo\'q.', ' '.join(summary))
    # Har doim exit 0: bu biznes-qoida bo'yicha "nashr qilinmadi" holati, skript ishdan
    # chiqishi emas — job "failed" bo'lib ko'rinmasligi kerak, Issue buning o'rnini bosadi.
    sys.exit(0)


if __name__ == '__main__':
    main()
