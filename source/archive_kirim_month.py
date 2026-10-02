"""
Oy yakunida Kirim/Chiqim yozuvlarini sahifaga ABADIY arxivlash.

Jadval yangi oyga o'tkazilganda "AppSheet_Kirim" varag'i tozalanishi mumkin. Shundan oldin (yoki
arxivlangan oy nusxasi faylidan) shu skript o'sha oy yozuvlarini quyish-open.html ichidagi
<template id="kirim-arch"> ga qo'shadi. Sahifa jonli yozuvlar bilan arxivni birlashtiradi
(takrorlar olib tashlanadi), shuning uchun eski oy yozuvlari hech qachon yo'qolmaydi.

Ishlatilishi:
    python3 archive_kirim_month.py quyish-open.html ASTATKA.xlsx 2026-09   # bitta oy
    python3 archive_kirim_month.py quyish-open.html ASTATKA.xlsx all       # varaqdagi barcha yozuvlar (kunlik yangilashda)

Mavjud arxivga QO'SHADI (ustidan yozmaydi), takror yozuvlarni qo'shmaydi.
"""
import sys, re, csv, io, datetime, html
import openpyxl

def cell(v):
    if v is None: return ''
    if isinstance(v, datetime.datetime): return (v + datetime.timedelta(microseconds=500000)).replace(microsecond=0).strftime('%d/%m/%Y %H:%M:%S')  # Google kabi yaxlitlash
    if isinstance(v, datetime.date): return v.strftime('%d/%m/%Y')
    if isinstance(v, float) and v == int(v): return str(int(v))
    return str(v)

def month_of(ts):
    m = re.match(r'(\d{1,2})[/.](\d{1,2})[/.](\d{4})', ts)
    if m: return '%s-%02d' % (m.group(3), int(m.group(2)))
    m = re.match(r'(\d{4})-(\d{1,2})', ts)
    return '%s-%02d' % (m.group(1), int(m.group(2))) if m else ''

def main():
    html_path, xlsx_path, month = sys.argv[1], sys.argv[2], sys.argv[3]
    ws = openpyxl.load_workbook(xlsx_path, data_only=True)['AppSheet_Kirim']
    rows = [[cell(v) for v in r] for r in ws.iter_rows(values_only=True)]
    header, data = rows[0], [r for r in rows[1:] if any(r) and month_of(r[0]) == month]
    src = open(html_path, encoding='utf-8').read()
    pat = re.compile(r'<template id="kirim-arch"([^>]*)>(.*?)</template>', re.S)
    m = pat.search(src)
    if not m: raise SystemExit('kirim-arch bloki topilmadi — hech narsa o\'zgartirilmadi')
    old = html.unescape(m.group(2)).strip()
    existing = list(csv.reader(io.StringIO(old))) if old else []
    if existing and existing[0] != header:
        # sarlavha o'zgargan bo'lsa ham eski yozuvlarni yo'qotmaymiz: ustun nomlari bo'yicha moslaymiz
        idx = {h: i for i, h in enumerate(existing[0])}
        existing = [header] + [[r[idx[h]] if h in idx and idx[h] < len(r) else '' for h in header] for r in existing[1:]]
    body = existing[1:] if existing else []
    keys = {tuple(r) for r in body}
    added = 0
    for r in data:
        if tuple(r) not in keys: body.append(r); keys.add(tuple(r)); added += 1
    buf = io.StringIO(); w = csv.writer(buf, quoting=csv.QUOTE_ALL, lineterminator='\n')
    w.writerow(header); [w.writerow(r) for r in body]
    months = sorted({month_of(r[0]) for r in body if month_of(r[0])})
    block = '<template id="kirim-arch" data-label="%s">%s</template>' % (', '.join(months), html.escape(buf.getvalue(), quote=False))
    src = src[:m.start()] + block + src[m.end():]
    open(html_path, 'w', encoding='utf-8').write(src)
    print('OK: %s oyidan %d ta yangi yozuv arxivlandi (arxivda jami %d ta, oylar: %s)' % (month, added, len(body), ', '.join(months)))

if __name__ == '__main__':
    main()
