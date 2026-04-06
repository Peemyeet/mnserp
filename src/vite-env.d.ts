/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL ของ API project manager — ตั้งแล้วระบบจะ POST `/auth/login` เพื่อยืนยันผู้ใช้ */
  readonly VITE_PM_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
