"""
Kunlik avtomatik yangilash: dash_rebuild.json (rebuild_dash.py natijasi) ni
quyish-open.html ichidagi MONTHS[] massiviga qo'yadi.

Ishlatilishi:
    python3 apply_dash_update.py quyish-open.html dash_rebuild.json

Nima qiladi:
  1. Birinchi skriptdagi (Ombor monitori) "const RAW=`...`;" blokini MON_RAW bilan
     har doim yangilaydi (bu blok har doim "joriy" holatni ko'rsatadi, oy tushunchasi yo'q).
  2. Ikkinchi skriptdagi "const MONTHS=[ ... ]" massiyasini topadi:
       - Agar oxirgi (eng so'nggi) element id si yangi ma'lumotning oy id (masalan
         "2026-10") bilan bir xil bo'lsa — o'sha elementni yangilaydi (RAW/DAYS/
         TOT_PROD/SHIP/END/NEED_TOTAL/planDate), frozen:false qoladi.
       - Aks holda (oy almashgan) — oxirgi elementni frozen:true qilib "muzlatadi"
         (endi umuman o'zgarmaydi) va massiv oxiriga yangi, frozen:false element
         qo'shadi. Eski oylar hech qachon o'chirilmaydi yoki ustidan yozilmaydi.
  3. Faylni joyida qayta yozadi.

MUHIM: bu skript FAQAT MONTHS massiyasini va MON RAW blokini o'zgartiradi.
U "Kirim/Chiqim" skriptiga (fayl oxiridagi, "AppSheet_Kirim varag'i" izohli
blok) va build_login.js ga TEGMAYDI — ular alohida, statik infratuzilma bo'lib,
kunlik yangilanishga muhtoj emas (Kirim/Chiqim o'zi jonli, brauzerda ishlaydi).
"""
import json, re, sys, datetime

UZ_MONTHS = {
    1:('Yanvar','yan'), 2:('Fevral','fev'), 3:('Mart','mar'), 4:('Aprel','apr'),
    5:('May','may'), 6:('Iyun','iyun'), 7:('Iyul','iyul'), 8:('Avgust','avg'),
    9:('Sentabr','sen'), 10:('Oktabr','okt'), 11:('Noyabr','noy'), 12:('Dekabr','dek'),
}

def month_meta(plan_date_str):
    """plan_date_str: PLAN_DATE ustidan str() qilingan qiymat, masalan
    '2026-09-30 00:00:00' yoki '2026-09-30'."""
    d = None
    for fmt in ('%Y-%m-%d %H:%M:%S', '%Y-%m-%d'):
        try:
            d = datetime.datetime.strptime(plan_date_str[:19], fmt)
            break
        except ValueError:
            continue
    if d is None:
        raise ValueError('PLAN_DATE parse qilib bo\'lmadi: ' + repr(plan_date_str))
    label, short = UZ_MONTHS[d.month]
    return {
        'id': '%04d-%02d' % (d.year, d.month),
        'label': label,
        'monShort': short,
        'monNum': '%02d' % d.month,
        'planDate': '%02d.%02d' % (d.day, d.month),
    }

def js_num_array(lst):
    return '[' + ','.join(str(x) for x in lst) + ']'

def main():
    html_path, json_path = sys.argv[1], sys.argv[2]
    data = json.load(open(json_path, encoding='utf-8'))
    src = open(html_path, encoding='utf-8').read()
    meta = month_meta(data['PLAN_DATE'])
    # Oy id "01" varag'idagi sanadan olinadi (ishonchliroq); planDate yorlig'i esa Plan_Berish'dan.
    md = data.get('MONTH_DATE') or ''
    if md:
        m2 = month_meta(md)
        if m2['id'] != meta['id']:
            print('OGOHLANTIRISH: Plan_Berish sanasi (%s) va "01" varag\'i sanasi (%s) turli oyda. Oy sifatida "01" varag\'i olinadi.' % (meta['id'], m2['id']))
        for k in ('id', 'label', 'monShort', 'monNum'):
            meta[k] = m2[k]

    # sanity checks before touching anything
    assert data['N_DAYS'] >= 1
    assert len(data['TOT_PROD']) == data['N_DAYS'] == len(data['SHIP']) == len(data['END'])
    assert data['RAW'].count('\n') + 1 == data['MON_RAW'].count('\n') + 1 == data['n_rows']

    # 1) MON RAW block (first script) — always overwritten, no month concept
    mon_start = src.index('const RAW=`') + len('const RAW=`')
    mon_end = src.index('`;', mon_start)
    old_mon_lines = src[mon_start:mon_end].count('\n') + 1
    if old_mon_lines != data['n_rows']:
        raise AssertionError('MON RAW qator soni mos kelmadi: eski %d, yangi %d' % (old_mon_lines, data['n_rows']))
    src = src[:mon_start] + data['MON_RAW'] + src[mon_end:]

    # 2) MONTHS array — locate it
    months_key = 'const MONTHS=['
    ms = src.index(months_key)
    me = src.index('\n];', ms)  # MONTHS array is followed by "\n];" per template below
    months_block = src[ms:me + 3]

    # find all id:'YYYY-MM' occurrences to know existing months, in order
    ids_in_order = re.findall(r"id:'(\d{4}-\d{2})'", months_block)
    if not ids_in_order:
        raise AssertionError('MONTHS massivida hech qanday oy topilmadi')
    last_id = ids_in_order[-1]

    def new_entry_js(frozen):
        return ("{id:'%s',label:'%s',monShort:'%s',monNum:'%s',planDate:'%s',frozen:%s,\n"
                "   NEED_TOTAL:%s,\n"
                "   DAYS:Array.from({length:%d},(_,i)=>i+1),\n"
                "   TOT_PROD:%s,\n"
                "   SHIP:%s,\n"
                "   END:%s,\n"
                "   RAW:`%s`}") % (
            meta['id'], meta['label'], meta['monShort'], meta['monNum'], meta['planDate'],
            'true' if frozen else 'false',
            data['NEED_TOTAL'], data['N_DAYS'],
            js_num_array(data['TOT_PROD']), js_num_array(data['SHIP']), js_num_array(data['END']),
            data['RAW'],
        )

    # Eski (muzlatilgan) oy ma'lumotini yangi ma'lumot bilan almashtirishga hech qachon yo'l qo'ymaslik
    if meta['id'] in ids_in_order[:-1]:
        raise AssertionError('XAVFLI: %s oyi allaqachon muzlatilgan. Yangi ma\'lumot eski oyga tegishli ko\'rinadi — hech narsa o\'zgartirilmadi.' % meta['id'])
    if meta['id'] < last_id:
        raise AssertionError('XAVFLI: yangi ma\'lumot oyi (%s) oxirgi oydan (%s) oldin — hech narsa o\'zgartirilmadi.' % (meta['id'], last_id))

    if last_id == meta['id']:
        # Himoya: fayl yangi oyga o'tkazilgan-u, lekin sana hali eski oyni ko'rsatayotgan bo'lsa,
        # kunlar soni keskin kamayadi. Bunday holatda eski oyni ustidan yozmaymiz.
        last_block = months_block[months_block.rindex("{id:'" + last_id + "'"):]
        mlen = re.search(r'DAYS:Array\.from\(\{length:(\d+)\}', last_block)
        old_days = int(mlen.group(1)) if mlen else 0
        if data['N_DAYS'] < old_days:
            raise AssertionError('XAVFLI: %s uchun kunlar soni %d dan %d ga kamaydi. Ehtimol jadval yangi oyga o\'tkazilgan, '
                                 'lekin "01" varag\'idagi sana yangilanmagan. Hech narsa o\'zgartirilmadi.' % (last_id, old_days, data['N_DAYS']))
        # same month as the last entry: replace that entry in place, keep frozen:false
        # locate the last "{id:'<last_id>' ... }" object within months_block
        entry_start = months_block.rindex("{id:'" + last_id + "'")
        # find matching closing "}" for this object: it ends right before either ",\n  {id:" of
        # a following entry, or the closing "\n];" of the array. Since this is the LAST entry,
        # it ends at the last "}" before "\n];".
        entry_end = months_block.rindex('}') + 1
        old_entry = months_block[entry_start:entry_end]
        new_entry = new_entry_js(frozen=False)
        months_block_new = months_block[:entry_start] + new_entry + months_block[entry_end:]
        print('Mavjud oy (%s) yangilandi: %d kun, kerak=%s' % (meta['id'], data['N_DAYS'], data['NEED_TOTAL']))
    else:
        # month rollover: freeze the previous last entry, append a new one
        # flip the LAST occurrence of "frozen:false" to "frozen:true" (belongs to the last entry)
        idx = months_block.rindex('frozen:false')
        months_block_frozen = months_block[:idx] + 'frozen:true' + months_block[idx + len('frozen:false'):]
        # insert new entry before the closing "\n];"
        close_idx = months_block_frozen.rindex('\n];')
        new_entry = new_entry_js(frozen=False)
        months_block_new = (months_block_frozen[:close_idx] + ',\n  ' + new_entry +
                             months_block_frozen[close_idx:])
        print('YANGI OY boshlandi: %s -> %s muzlatildi, %s qo\'shildi (%d kun, kerak=%s)' % (
            last_id, last_id, meta['id'], data['N_DAYS'], data['NEED_TOTAL']))

    src = src[:ms] + months_block_new + src[me + 3:]
    open(html_path, 'w', encoding='utf-8').write(src)
    print('OK: %s yangilandi (%s, %d qator)' % (html_path, meta['id'], data['n_rows']))

if __name__ == '__main__':
    main()
