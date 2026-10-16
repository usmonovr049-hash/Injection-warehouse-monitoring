"""'Kunlik_Panel' varag'ini (zyt.xlsx ichida) o'qib, SANA QOIDASI va Plan_Berish
ishonchlilik tekshiruvlarini avtomatlashtirish uchun.

Hujjatlashtirilgan tartib (source/REFRESH_INSTRUCTIONS.md, "ENG MUHIM — SANA QOIDASI",
12-13.10.2026 Rustam tasdiqlagan): Kunlik_Panel A1='...', F1=Sana (datetime). Status
qatorlari A ustunida ("Fakt kiritilganmi:", "Chiqim kiritilganmi:", "Plan berilganmi
(Berilgan_Plan):", "IMM_Fact to'ldirilganmi:"), qiymati esa C ustunida ("✓ ..." yoki
"✗ Hali yo'q" / "—").
"""
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

import openpyxl

TASHKENT = ZoneInfo('Asia/Tashkent')

_LABELS = {
    'fakt': 'Fakt kiritilganmi',
    'chiqim': 'Chiqim kiritilganmi',
    'plan': 'Plan berilganmi',
    'imm': "IMM_Fact",
}


def read(xlsx_path: str) -> dict:
    wb = openpyxl.load_workbook(xlsx_path, data_only=True)
    kp = wb['Kunlik_Panel']
    out = {'sana': kp['F1'].value, 'fakt': None, 'chiqim': None, 'plan': None, 'imm': None}
    for row in kp.iter_rows(min_row=1, max_row=20, max_col=4):
        a = row[0].value
        if not a:
            continue
        a = str(a)
        for key, needle in _LABELS.items():
            if out[key] is None and needle in a:
                out[key] = row[2].value
    return out


def is_ok(value) -> bool:
    return value is not None and str(value).strip().startswith('✓')  # '✓'


def expected_production_date(now: datetime | None = None) -> date:
    """Ish kuni 08:00dan ertangi ~07:00/08:00gacha davom etadi, shuning uchun
    kutilgan ishlab chiqarish-kun sanasi = (hozirgi mahalliy vaqt - 8 soat)."""
    now = now or datetime.now(TASHKENT)
    return (now - timedelta(hours=8)).date()


def date_drift_days(panel: dict, now: datetime | None = None) -> int | None:
    sana = panel.get('sana')
    if sana is None:
        return None
    actual = sana.date() if hasattr(sana, 'date') else None
    if actual is None:
        return None
    return abs((actual - expected_production_date(now)).days)
