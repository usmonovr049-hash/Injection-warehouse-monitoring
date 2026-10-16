"""Google Drive'dagi manba jadvallarni (service account orqali) xlsx qilib eksport qilish.

GitHub Actions muhitida GOOGLE_SERVICE_ACCOUNT_JSON sir (secret) orqali ishlaydi — bu
Google Cloud'da yaratilgan service account'ning to'liq JSON kaliti. Ikkita manba jadval
("Oktabr ASTATKA" va "Zaxira Yetish Tahlili / Kunlik_Panel") shu service account emailiga
"Viewer" sifatida bo'lishilgan bo'lishi kerak — aks holda 403 xato chiqadi.
Batafsil: source/ci/SETUP.md.
"""
import io
import json
import os

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'


def _service():
    raw = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON')
    if not raw:
        raise SystemExit(
            "GOOGLE_SERVICE_ACCOUNT_JSON sir (secret) topilmadi. GitHub repo "
            "Settings -> Secrets and variables -> Actions'da sozlangan bo'lishi kerak "
            "(qarang: source/ci/SETUP.md)."
        )
    info = json.loads(raw)
    creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    return build('drive', 'v3', credentials=creds, cache_discovery=False)


def export_xlsx(file_id: str, dest_path: str) -> None:
    """Google Sheets faylini (file_id) xlsx formatida dest_path'ga yuklab saqlaydi."""
    svc = _service()
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
                    f"403 ruxsat xatosi fileId={file_id} uchun — bu jadval service "
                    f"account emailiga 'Viewer' sifatida bo'lishilmagan bo'lishi mumkin "
                    f"(qarang: source/ci/SETUP.md)."
                ) from e
            raise
    with open(dest_path, 'wb') as f:
        f.write(buf.getvalue())
