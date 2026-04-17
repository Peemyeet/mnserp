/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL ของ API project manager — ตั้งแล้วระบบจะ POST `/auth/login` เพื่อยืนยันผู้ใช้ */
  readonly VITE_PM_API_BASE_URL?: string;
  /** Base ของ API (ค่าเริ่มต้น `/api` — Vite proxy ไปที่พอร์ต 8787 ตอน dev) */
  readonly VITE_MNS_API_BASE?: string;
  /** โฮสต์ PHP PM2021 สำหรับ /api/v1/users/*.php (ไม่มี trailing slash) */
  readonly VITE_PM2021_API_BASE?: string;
  /** ปลายทาง proxy `/api` ตอน `npm run dev` (ค่าเริ่มต้น http://127.0.0.1:8787) */
  readonly VITE_API_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
