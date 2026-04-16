# Deploy บน Railway (บริการเดียว: เว็บ + API)

## ภาพรวม

- **Build**: ติดตั้ง dependency ราก (รวม dev เพื่อรัน `vite build`) → `npm run build` สร้าง `dist/` → ติดตั้ง `server/`
- **Start**: `node server/index.mjs` — อ่าน `PORT` จาก Railway, เสิร์ฟ `/api/*` และไฟล์ static จาก `dist/` (SPA) ถ้ามี `dist/index.html`

## ตัวแปรสภาพแวดล้อม (ตั้งใน Railway Variables)

| ตัวแปร | จำเป็น | คำอธิบาย |
|--------|--------|----------|
| `DATABASE_URL` | ใช่ | `mysql://USER:PASSWORD@HOST:3306/ชื่อฐาน` (หรือแยก `DB_*` ตาม `server/.env.cpanel.example`) |
| `PORT` | โดยปกติ Railway ตั้งให้ | ไม่ต้องใส่เองถ้าแพลตฟอร์ม inject แล้ว |
| `MNS_API_PORT` | ไม่ | ใช้เฉพาะเครื่อง dev ถ้าไม่มี `PORT` |
| `MNS_STORE_USER_ID` | แนะนำถ้าใช้ POST คลัง | `user_id` จาก `user_data` สำหรับ `POST /api/store/items` |

**หมายเหตุ build**: ถ้า Nixpacks รัน `npm install` แบบ production-only จน build พัง ให้ใช้ `buildCommand` ใน `railway.toml` (มี `--include=dev` อยู่แล้ว) หรือตั้ง `NIXPACKS_NODE_ENV=development` ตามเอกสาร Railway

## MySQL

ใช้ **Railway MySQL plugin** หรือฐานภายนอก แล้วตั้ง `DATABASE_URL` ให้ชี้ไปยังฐานที่ import แล้ว (แนะนำ dump หลัก `mns_pm_2021` — ไฟล์ใหญ่ไม่ได้ commit ใน Git; ดู `database/IMPORT.txt`)

## ทดสอบหลัง deploy

- `GET /api/health` → `ok: true`, `db: true`
- เปิด `/` → หน้าแอป
- `GET /api/server-info` → รายการ endpoint

## GitHub Pages (แยก)

ถ้า build สำหรับ subpath ให้ตั้ง `GITHUB_REPOSITORY` ใน CI หรือ `VITE_BASE=/ชื่อโฟลเดอร์/` ก่อน `vite build` (ดู `vite.config.ts`)
