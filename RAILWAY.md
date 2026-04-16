# คู่มือ Deploy บน Railway + MySQL (แบบละเอียด — อ่านทีละขั้น)

เอกสารนี้อธิบายแบบ **มือใหม่**: Railway คืออะไร ต้องกดอะไรบ้าง แล้วแอป ERP นี้เชื่อม MySQL ยังไง

---

## 1) คำศัพท์สั้นๆ

| คำ | ความหมาย |
|----|-----------|
| **Project** | โฟลเดอร์บน Railway ที่รวมบริการต่างๆ (เว็บ + ฐานข้อมูล) |
| **Service** | กล่องหนึ่งกล่องในโปรเจกต์ เช่น “เว็บแอป” หรือ “MySQL” |
| **Variables** | ตัวแปรสภาพแวดล้อม (เช่นรหัสผ่านฐานข้อมูล) ที่แอปอ่านตอนรัน |
| **Deploy** | ดึงโค้ดจาก GitHub มา build แล้วสั่งรันเซิร์ฟเวอร์ |

โปรเจกต์นี้ใช้ **บริการเดียวสำหรับเว็บ**: build หน้า React แล้วให้ `server/index.mjs` เสิร์ฟทั้ง **หน้าเว็บ** และ **API** (`/api/...`) พร้อมกัน — ตั้งค่าไว้ใน `railway.toml` แล้ว

---

## 2) สิ่งที่คุณต้องมีก่อนเริ่ม

1. บัญชี [Railway](https://railway.com)
2. โค้ดอยู่บน GitHub แล้ว (เช่น repo `mnserp`)
3. (แนะนำ) ไฟล์ SQL สำหรับ import โครง ERP — ดูคำแนะนำใน `database/IMPORT.txt` (ไฟล์ `db_mns.sql` / `database.sql` ฯลฯ)

---

## 3) ขั้นตอนบน Railway — ทำตามลำดับนี้

### ขั้น A: สร้างโปรเจกต์และดึงโค้ดจาก GitHub

1. เข้า Railway → กด **New Project**
2. เลือก **Deploy from GitHub** (หรือคำใกล้เคียง)
3. ถ้ายังไม่เคยเชื่อม GitHub ให้ทำตามหน้าจอให้ Railway เข้าถึง repo ของคุณ
4. เลือก repository ของโปรเจกต์ ERP นี้
5. Railway จะสร้าง **Service** แรกให้อัตโนมัติ (มักชื่อตาม repo) — นี่คือ **เว็บแอป** ที่จะ build + run

**สำคัญ:** Root ของบริการควรเป็น **รากโปรเจกต์** (โฟลเดอร์ที่มี `package.json` และ `railway.toml`) ไม่ใช่โฟลเดอร์ย่อยลึกลงไป

### ขั้น B: เพิ่มฐานข้อมูล MySQL

1. ในโปรเจกต์เดียวกัน กด **New** หรือ **+**
2. เลือก **Database** → **Add MySQL** (หรือ **MySQL**)
3. รอสักครู่จนสถานะพร้อม (provision เสร็จ)

ตอนนี้คุณมี **2 บริการ**: (1) เว็บแอป (2) MySQL

### ขั้น C: ให้ “เว็บแอป” รู้ค่าเชื่อม MySQL (ตัวแปร MYSQL*)

แอปของเราอ่านชื่อตัวแปรแบบนี้ (ตรงกับที่ Railway มักให้กับ MySQL):

- `MYSQLHOST`
- `MYSQLPORT` (ถ้าไม่มี แอปถือว่าเป็น `3306`)
- `MYSQLDATABASE`
- `MYSQLUSER`
- `MYSQLPASSWORD`

**วิธีที่ง่ายที่สุด (แนะนำ): ใช้ Variable Reference**

1. คลิกที่ **บริการ MySQL** (ไม่ใช่เว็บ)
2. เปิดแท็บ **Variables** (หรือ **Connect** — แล้วหาส่วนที่บอกว่าให้ share ไป service อื่น)
3. มองหาปุ่มแบบ **Add Reference** / **Share to** / **Connect to service** (ชื่อใน UI อาจเปลี่ยนตามเวอร์ชัน Railway)
4. เลือก **บริการเว็บแอป** ของคุณเป็นปลายทาง
5. ให้แน่ใจว่าบริการเว็บได้รับตัวแปรครบชุดด้านบน (โดยเฉพาะ `MYSQLHOST`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`)

**ถ้าไม่มีปุ่ม Reference:** เปิด MySQL → คัดลอกค่าแต่ละตัวแปรจากแท็บ Variables แล้วไปวางที่ **บริการเว็บ** → **Variables** → **New Variable** ชื่อให้ตรงทุกตัว

**ทำไมต้องวางที่ “เว็บแอป”:** เพราะคำสั่งรันคือ `node server/index.mjs` รันที่บริการเว็บ — มันอ่าน `process.env` ของบริการตัวเองเท่านั้น ไม่อ่าน env ของ MySQL โดยอัตโนมัติ

### ขั้น D: ตรวจ Build / Start (โปรเจกต์นี้ตั้งไว้แล้ว)

ไฟล์ `railway.toml` กำหนดแล้วว่า:

- **Build:** `npm install --include=dev && npm run build && npm install --prefix server`
- **Start:** `node server/index.mjs`

ถ้าใน Dashboard มีการ override ค่า build/start ให้ตรงกับนี้หรือลบ override ออกเพื่อให้ใช้จาก repo

### ขั้น E: กด Deploy แล้วรอ

1. ที่บริการเว็บ → แท็บ **Deployments** ดู log
2. ถ้า build ผ่าน จะเห็น URL ของบริการ (หรือตั้งโดเมนเองใน **Settings**)

### ขั้น F: ใส่ข้อมูลลง MySQL (สำคัญมาก — ไม่ทำแล้ว `/api/health` อาจ `db: false`)

MySQL ใหม่มัก **ว่าง** — แอป ERP ต้องการตารางเดิมจาก SQL

1. เปิด `database/IMPORT.txt` ใน repo อ่านลำดับที่แนะนำ
2. วิธี import บน Railway ทำได้หลายแบบ เช่น:
   - ใช้ **MySQL client** บนเครื่องคุณ ชี้ host/port/user/pass ตามค่าใน Variables ของ MySQL แล้ว `mysql ... < ไฟล์.sql`
   - หรือใช้เครื่องมือ GUI (TablePlus, DBeaver) เชื่อมด้วยค่าเดียวกัน

ลำดับที่สมเหตุสมผล: **import SQL หลักของ ERP ก่อน** → ถ้าใช้ตารางที่ Prisma ดูแล ค่อยรัน migration (ดูข้อ 5)

### ขั้น G: ทดสอบว่าใช้ได้

เปิดเบราว์เซอร์แทนที่โดเมนของคุณ:

1. `https://<โดเมนของคุณ>/api/health`  
   - ต้องการ `ok: true` และ **`db: true`** ถึงจะถือว่าเชื่อม MySQL สำเร็จ
2. เปิด `/` ควรเห็นหน้าแอป
3. `https://<โดเมนของคุณ>/api/server-info` ดูรายการ endpoint

---

## 4) แอปเลือกใช้ค่าเชื่อมต่อยังไง (ไม่ต้องเข้าใจโค้ดก็ได้)

โค้ดใน `server/db.mjs` ประกอบ URL ให้อัตโนมัติ ลำดับความสำคัญคือ:

1. ถ้ามี `DATABASE_URL` ที่ขึ้นต้นด้วย `mysql://` → **ใช้ค่านี้ก่อน**
2. ถ้าไม่มี หรือมี `postgresql://` ค้างจากโปรเจกต์เก่า → ใช้ **`MYSQL*`** ถ้าครบ ไม่ก็ใช้ **`DB_*`** (แบบ cPanel)

**อย่าใส่ `DATABASE_URL=postgresql://...` ค้าง** ถ้าไม่มี `MYSQL*` หรือ `mysql://` แอปจะเชื่อม MySQL ไม่ได้

---

## 5) Prisma / ตารางส่วนขยาย (ถ้าคุณใช้งานส่วนนี้)

Prisma อ่าน `DATABASE_URL` จากสคริปต์ `server/scripts/prisma-with-db-env.mjs` ซึ่งจะประกอบ URL จาก **`MYSQL*` หรือ `DB_*`** เหมือนแอปหลัก

จากโฟลเดอร์รากโปรเจกต์ (ที่มี `package.json` หลัก — สคริปต์นี้เรียก `server` ให้อัตโนมัติ):

```bash
npm run db:migrate:deploy
```

หรือถ้า `cd server` แล้ว:

```bash
npm run db:migrate:deploy
```

(ต้องมี `MYSQL*` หรือ `DATABASE_URL=mysql://...` ใน `server/.env` บนเครื่อง หรือ export ก่อนรันคำสั่ง)

---

## 6) ออกแบบฐานข้อมูล ERP (ภาพรวมใน repo นี้)

| โมดูล | หน้าที่หลัก | อ้างอิงใน repo |
|--------|--------------|----------------|
| ผู้ใช้ / สิทธิ์ | ล็อกอิน, กลุ่มผู้ใช้ | SQL ใน `database/db_mns.sql`, `database/database.sql` |
| ลูกค้า / งาน | ลูกค้า, job, workflow | API `/api/customers`, `/api/jobs` |
| คลัง | สต็อก | `/api/store/*` |
| บัญชี | เอกสารบัญชี (บางส่วน) | `server/routes/accounting.mjs` |
| ชำระเงิน / ใบส่งของ | ตารางขยาย | `server/prisma/schema.prisma` |

รายละเอียด import ลำดับไฟล์ SQL อ่านใน `database/IMPORT.txt`

---

## 7) เวลามีปัญหา (เช็คลิสต์)

| อาการ | สิ่งที่ตรวจ |
|--------|-------------|
| Build ไม่ผ่าน | ดู log ว่า `npm run build` error อะไร; โปรเจกต์นี้ต้อง `npm install --include=dev` ตอน build (มีใน `railway.toml`) |
| `/api/health` ได้แต่ `db: false` | บริการเว็บไม่มี `MYSQL*` ครบ / host ผิด / ยังไม่ import ตารางจน query health พัง |
| Error เรื่อง PostgreSQL | ลบ `DATABASE_URL` แบบ `postgresql://` ออกจาก Variables ของบริการเว็บ หรือแทนที่ด้วย `mysql://` |
| หน้าเว็บว่าง 404 | ยัง build ไม่ได้หรือ `dist/` ไม่ถูกสร้าง — ดู build log |

---

## GitHub Pages (แยกจาก Railway)

ถ้า build สำหรับ subpath ให้ตั้ง `GITHUB_REPOSITORY` ใน CI หรือ `VITE_BASE=/ชื่อโฟลเดอร์/` ก่อน `vite build` (ดู `vite.config.ts`)
