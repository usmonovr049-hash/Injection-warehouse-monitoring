"""Google Drive'dagi manba jadvallarni xlsx qilib eksport qilish — Claude/token ishtirokisiz.

Ikki usul bilan ishlaydi (hech qanday qo'lda sozlash shart emas bo'lgan yo'l BIRINCHI
tanlanadi):

1. OCHIQ HAVOLA (standart, hozircha ishlatiladi): agar GOOGLE_SERVICE_ACCOUNT_JSON sir
   o'rnatilmagan bo'lsa, jadvalning ochiq eksport havolasidan (`.../export?format=xlsx`)
   hech qanday autentifikatsiyasiz yuklab olinadi. Bu FAQAT jadval "Anyone with the
   link" (havola orqali kiruvchi har kim) — "Viewer" qilib ulashilgan bo'lsa ishlaydi.
   19.10.2026'da tekshirilgan holat: ikkala manba jadval ("Oktabr ASTATKA" va "Zaxira
   Yetish Tahlili") allaqachon shu tarzda ulashilgan — shuning uchun bu usul hozircha
   HECH QANDAY QO'SHIMCHA SOZLASHSIZ ishlaydi.

2. SERVICE ACCOUNT (ixtiyoriy, qo'shimcha xavfsizlik uchun): agar kelajakda jadvallar
   "Anyone with the link" dan olib tashlansa (ya'ni yopiq qilinsa), GOOGLE_SERVICE_ACCOUNT_JSON
   sirni source/ci/SETUP.md bo'yicha sozlang — shunda bu skript avtomatik shu usulga o'tadi.

Ikkala holatda ham Claude sessiyasi/tokeni ishtirok etmaydi — bu sof GitHub Actions ichida
ishlaydi.
"""
import io
import json
import os
import urllib.error
import urllib.request

XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
EXPORT_URL = 'https://docs.google.com/spreadsheets/d/{file_id}/export?format=xlsx'


def _export_via_public_link(file_id: str, dest_path: str) -> None:
    url = EXPORT_URL.format(file_id=file_id)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (daily-refresh-bot)'})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            raise SystemExit(
                f"{e.code} ruxsat xatosi fileId={file_id} (ochiq havola) uchun — bu jadval "
                "endi 'Anyone with the link - Viewer' qilib bo'lishilmagan bo'lishi mumkin. "
                "GOOGLE_SERVICE_ACCOUNT_JSON sirni sozlang (source/ci/SETUP.md) yoki jadval "
                "ulashish huquqini tekshiring."
            ) from e
        raise
    # Agar jadval ochiq bo'lmasa, Google ko'pincha login/xato HTML sahifasini qaytaradi —
    # buni aniq xato bilan bildiramiz (xlsx fayllar har doim "PK" bayt-juftligi bilan boshlanadi).
    if data[:2] != b'PK':
        raise SystemExit(
            f"fileId={file_id} ochiq havola orqali xlsx sifatida yuklanmadi (javob xlsx emas — "
            "ehtimol jadval 'Anyone with the link' qilib ulashilmagan). "
            "GOOGLE_SERVICE_ACCOUNT_JSON sirni sozlang yoki jadval ulashish huquqini tekshiring "
            "(source/ci/SETUP.md)."
        )
    with open(dest_path, 'wb') as f:
        f.write(data)


def _export_via_service_account(file_id: str, dest_path: str) -> None:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseDownload

    raw = os.environ['GOOGLE_SERVICE_ACCOUNT_JSON']
    info = json.loads(raw)
    creds = service_account.Credentials.from_service_account_info(
        info, scopes=['https://www.googleapis.com/auth/drive.readonly']
    )
    svc = build('drive', 'v3', credentials=creds, cache_discovery=False)
    request = svc.files().export_media(fileId=file_id, mimeType=XLSX_MIME)
    buf = io.BytesIO()
    downloader = MediaIoBaseDownload(buf, request)
    done = False
    while not done:
        try:
            _, done = downloader.next_chunk()
        except Exception as e:
            msg = str(e)
            if '403' in msg or 'PERMISSION_DENIED' in msg.upper():
                raise SystemExit(
                    f"403 ruxsat xatosi fileId={file_id} (service account) uchun — bu jadval "
                    "service account emailiga 'Viewer' sifatida bo'lishilmagan bo'lishi mumkin "
                    "(qarang: source/ci/SETUP.md)."
                ) from e
            raise
    with open(dest_path, 'wb') as f:
        f.write(buf.getvalue())


def export_xlsx(file_id: str, dest_path: str) -> None:
    """Google Sheets faylini (file_id) xlsx formatida dest_path'ga yuklab saqlaydi.

    GOOGLE_SERVICE_ACCOUNT_JSON sir o'rnatilgan bo'lsa — shu orqali (eng ishonchli, jadval
    ulashish holatidan mustaqil). Aks holda — ochiq eksport havolasi orqali (hech qanday
    kalit/token kerak emas; qarang: shu fayl boshidagi izoh).
    """
    if os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON'):
        _export_via_service_account(file_id, dest_path)
    else:
        _export_via_public_link(file_id, dest_path)
