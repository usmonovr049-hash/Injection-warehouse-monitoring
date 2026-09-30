import openpyxl, re, sys

wb = openpyxl.load_workbook('/tmp/astatka.xlsx', data_only=True)

# ---- code -> model map ----
ref = wb['Mahsulotlar_REF']
code2model = {}
def norm(k):
    k = str(k).strip()
    try:
        f = float(k)
        if f == int(f): return str(int(f))
    except: pass
    return k
r = 2
while ref.cell(r,1).value is not None:
    code = ref.cell(r,5).value
    model = ref.cell(r,3).value
    if code is not None:
        code2model[norm(code)] = model
    r += 1

def model_for(code):
    k = norm(code)
    if k in code2model: return code2model[k]
    if k.startswith('B') and k[1:] in code2model: return code2model[k[1:]]
    return '—'

# ---- n (qator raqami) -> model: kunlik oxirgi varaqning C ("Modeli") ustunidan ----
# Mahsulotlar_REF'da hamma detal yo'q (masalan 102-109 qatorlar), shuning uchun asosiy manba
# shu varaq; REF faqat zaxira sifatida ishlatiladi.
_lt = 31
while f"{_lt:02d}" not in wb.sheetnames: _lt -= 1
N2MODEL = {}
_ws = wb[f"{_lt:02d}"]
for _r in range(4, _ws.max_row + 1):
    _b = _ws.cell(_r, 2).value; _c = _ws.cell(_r, 3).value
    if isinstance(_b, (int, float)) and _c not in (None, ''):
        N2MODEL[int(_b)] = str(_c).strip()

# ---- valid days: largest D where G-vector(D) != G-vector(D+1) ----
def gvec(tab, n=30):
    ws = wb[tab]
    return tuple(ws.cell(r,7).value for r in range(4,4+n))

last_tab = 31
while f"{last_tab:02d}" not in wb.sheetnames: last_tab -= 1
cutoff = 1
for d in range(1, last_tab):
    t1, t2 = f"{d:02d}", f"{d+1:02d}"
    if gvec(t1) != gvec(t2):
        cutoff = d
n_days = cutoff + 1  # day (cutoff+1) is the first day whose data is confirmed real (closing carried in), but we already
# actually: cutoff = last day D with G(D)!=G(D+1) => day D's closeout produced a new G(D+1), so day D itself is real,
# AND day D+1 batch might also be real (it's the day that RECEIVED the new G). We only know D is real for certain;
# D+1 may be in-progress (G set, but its own J/N not yet closed). So valid days = 1..cutoff (that's what changed).
N_DAYS = cutoff
print("last existing tab:", last_tab, "valid days 1..", N_DAYS)

def day_totals(day):
    tab = f"{day:02d}"
    ws = wb[tab]
    prod = 0.0; ship = 0.0; close = 0.0
    r = 4
    while ws.cell(r,2).value is not None:
        g = ws.cell(r,7).value or 0
        j = ws.cell(r,10).value or 0
        n = ws.cell(r,14).value or 0
        prod += j; ship += n; close += (g + j - n)
        r += 1
    return prod, ship, close

TOT_PROD = []; SHIP = []; END = []
for d in range(1, N_DAYS+1):
    p,s,c = day_totals(d)
    TOT_PROD.append(int(p) if p==int(p) else p)
    SHIP.append(int(s) if s==int(s) else s)
    END.append(int(c) if c==int(c) else c)

# ---- per-part daily P/E for parts that will be crit/high (need>0) ----
def part_series(code, days):
    P=[]; E=[]
    for d in range(1, days+1):
        tab = f"{d:02d}"
        ws = wb[tab]
        r = 4
        found=False
        while ws.cell(r,2).value is not None:
            c = ws.cell(r,5).value
            if norm(c) == norm(code):
                g = ws.cell(r,7).value or 0
                j = ws.cell(r,10).value or 0
                n = ws.cell(r,14).value or 0
                P.append(int(j) if j==int(j) else j)
                E.append(int(g+j-n) if (g+j-n)==int(g+j-n) else g+j-n)
                found=True
                break
            r += 1
        if not found:
            P.append(0); E.append(0)
    return P,E

# ---- Plan_Berish rows ----
pb = wb['Plan_Berish']
NEED_TOTAL = pb.cell(2,6).value
PLAN_DATE = pb.cell(2,2).value
# Oy aniqlash uchun ishonchli manba: "01" varag'i G2 katagi (oyning 1-kuni sanasi).
# Plan_Berish B2 sanasi IMPORTRANGE sababli vaqtincha eski oyni ko'rsatishi mumkin.
MONTH_DATE = wb['01'].cell(2,7).value if '01' in wb.sheetnames else None
rows = []
r = 6
while pb.cell(r,1).value is not None:
    code = pb.cell(r,1).value
    name = (pb.cell(r,2).value or '').strip().replace('\n',' ')
    tpa = pb.cell(r,3).value or 0
    stock = pb.cell(r,4).value or 0
    dem = pb.cell(r,5).value or 0
    need = pb.cell(r,6).value or 0
    covers = pb.cell(r,10).value
    prio_raw = (pb.cell(r,11).value or '').strip()
    if prio_raw == 'SHOSHILINCH!': prio='U'
    elif 'yuqori' in prio_raw.lower() or prio_raw.lower()=='high': prio='H'
    else: prio='N'
    covers_s = str(covers) if covers is not None else ''
    if covers_s in ('30+.0','30+'): covers_s='30+'
    rows.append(dict(code=str(code).replace(chr(10),' ') if code is not None else code, name=name, model=N2MODEL.get(len(rows)+1) or model_for(code), tpa=int(tpa) if tpa==int(tpa) else tpa,
                      stock=int(stock) if stock==int(stock) else stock,
                      dem=int(dem) if dem==int(dem) else dem,
                      need=int(need) if need==int(need) else need,
                      covers=covers_s, prio=prio))
    r += 1

# ---- build RAW lines ----
lines=[]
prev_series=None
for i,rw in enumerate(rows,1):
    parts=[str(i), rw['model'], str(rw['tpa']), str(rw['code']), rw['name'].replace('|',' '),
           str(rw['stock']), str(rw['dem']), str(rw['need']), rw['covers'], rw['prio']]
    if rw['prio'] in ('U','H') and rw['need']>0:
        P,E = part_series(rw['code'], N_DAYS)
        parts.append(','.join(str(x) for x in P))
        parts.append(','.join(str(x) for x in E))
    lines.append('|'.join(parts))
RAW = '\n'.join(lines)

mon_lines=[]
for i,rw in enumerate(rows,1):
    mon_lines.append('|'.join([str(i), rw['model'], str(rw['tpa']), str(rw['code']), rw['name'].replace('|',' '),
           str(rw['stock']), str(rw['need']), rw['prio']]))
MON_RAW = '\n'.join(mon_lines)

import json
out = dict(N_DAYS=N_DAYS, NEED_TOTAL=NEED_TOTAL, PLAN_DATE=str(PLAN_DATE), MONTH_DATE=(str(MONTH_DATE) if MONTH_DATE is not None else ''), TOT_PROD=TOT_PROD, SHIP=SHIP, END=END,
           RAW=RAW, MON_RAW=MON_RAW, n_rows=len(rows), crit=sum(1 for r in rows if r['prio']=='U'), high=sum(1 for r in rows if r['prio']=='H'))
with open('/tmp/dash_rebuild.json','w') as f:
    json.dump(out, f, ensure_ascii=False)
print("N_DAYS", N_DAYS, "NEED_TOTAL", NEED_TOTAL, "rows", len(rows), "crit", out['crit'], "high", out['high'])
