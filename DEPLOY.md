# คู่มือ Deploy แบบละเอียด (ERP MNS)

เอกสารนี้รวม **เส้นทาง deploy หลัก** และสิ่งที่ต้องทำก่อน–หลัง deploy โปรเจกต์นี้คือ **React (Vite) + API Node (Express) + MySQL** — รันด้วยคำสั่ง `npm run build` แล้ว `node server/index.mjs` เสิร์ฟทั้งหน้าเว็บและ `/api/*` (ดู `railway.toml`)

---

## ส่วน 0 — สิ่งที่ต้องเข้าใจก่อน

| ส่วน | ที่อยู่ใน repo | หมายเหตุ |
|------|----------------|----------|
| หน้าเว็บ (SPA) | โฟลเดอร์ `dist/` หลัง `npm run build` | ไม่ commit `dist/` — build บนเซิร์ฟเวอร์หรือ CI |
| API | `server/index.mjs` | อ่าน MySQL จาก env (รายละเอียดด้านล่าง) |
| เวอร์ชัน Node | `package.json` → `engines.node` เป็น **>=22** | อ่าน `CPANEL-NODE.txt`, ไฟล์ `.nvmrc` = `22` |
| ฐานข้อมูล | MySQL — ต้อง **import SQL** ก่อนแอปจะใช้งานได้จริง | ลำดับไฟล์ใน `database/IMPORT.txt` |

**แยกจากแอป Node:** โฟลเดอร์ `api-new/` และ `api/v1/` เป็น **PHP** สำหรับโฮสต์ cPanel / PM2021 — อัปโหลดและตั้งค่า DB ฝั่ง PHP ตามคู่มือในโฟลเดอร์นั้น (ไม่ใช่ส่วนของ `npm start`)

---

## ส่วน 1 — เตรียมก่อน Deploy (ทุกแพลตฟอร์ม)

### 1.1 เครื่องมือที่ควรมี

- บัญชี Git (GitHub/GitLab) ถ้า deploy แบบดึงจาก repo
- เครื่องมือเชื่อม MySQL (phpMyAdmin, DBeaver, หรือ `mysql` CLI) สำหรับ import

### 1.2 เตรียมฐานข้อมูล MySQL

1. สร้างฐานข้อมูลใหม่ โดยใช้ charset **utf8mb4** (ใน cPanel: MySQL® Databases → Create Database)
2. สร้าง user และผูกสิทธิ์ **ALL PRIVILEGES** กับฐานนั้น
3. **Import ไฟล์ SQL** (เลือกอย่างใดอย่างหนึ่ง — อ่านรายละเอียดเพิ่มใน `database/IMPORT.txt`):
   - **แนะนำ:** `database/mns_pm_2021.sql` → ฐานชื่อ `mns_pm_2021` (หรือชื่อที่คุณสร้าง แต่ต้องให้ตรงกับค่า `DB_DATABASE` / `MYSQLDATABASE`)
   - **ชุดเบา:** `database/db_mns.sql` แล้วตามด้วย `database/database.sql`

4. (ทางเลือก) รัน migration เสริมใน `database/migrations/mysql/` ตามลำดับใน `database/IMPORT.txt`

### 1.3 ตัวแปรสภาพแวดล้อม (สรุป)

แอปอ่านการเชื่อม MySQL ตาม `server/db.mjs`:

1. ถ้ามี `DATABASE_URL` ที่ขึ้นต้น `mysql://` → ใช้ก่อน  
2. ไม่มีหรือไม่ใช่ mysql → ใช้ **`MYSQL*`** (แบบ Railway) หรือ **`DB_*`** (แบบ cPanel)

ตัวอย่างไฟล์ env:

- ทั่วไป / Railway: `server/.env.example`
- cPanel แบบแยกฟิลด์: `server/.env.cpanel.example` → คัดลอกเป็น `server/.env` บนเซิร์ฟเวอร์

**พอร์ต API:** ถ้าโฮสต์ส่ง `PORT` (เช่น Railway) แอปจะฟังพอร์ตนั้น — ไม่ส่งให้ตั้ง `MNS_API_PORT` (ค่าเริ่มต้นใน dev คือ `8787`)

---

## ส่วน 2 — Deploy บน Railway (แนะนำ)

คู่มือย่อยแบบละเอียดทีละหน้าจออยู่ที่ **`RAILWAY.md`** — สรุปลำดับดังนี้:

1. **สร้างโปรเจกต์** → Deploy from GitHub → เลือก repo นี้  
2. **Root บริการ** = ราก repo (มี `package.json` + `railway.toml`)  
3. **เพิ่ม MySQL** ในบริการเดียวกัน  
4. **แชร์ตัวแปร MySQL** ไปที่บริการเว็บ: `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`  
5. ตรวจว่า **Build** = `npm install --include=dev && npm run build && npm install --prefix server` และ **Start** = `node server/index.mjs` (ตรงกับ `railway.toml` หรือลบ override ใน Dashboard)  
6. รอ deploy สำเร็จ  
7. **Import SQL** เข้า MySQL บน Railway (ผ่าน client ชี้ host จาก Variables)  
8. ทดสอบ `https://<โดเมน>/api/health` ต้องได้ `ok: true` และ **`db: true`**

ถ้าใช้ Prisma กับตารางขยาย: จากรากโปรเจกต์ `npm run db:generate` / `npm run db:push` หลังตั้ง env ให้ `server/` อ่านได้ (ดู `RAILWAY.md` หัวข้อ Prisma)

---

## ส่วน 3 — Deploy บน cPanel (Node.js + MySQL)

ขั้นตอนนี้เหมาะกับโฮสต์ที่มี **Setup Node.js App** / **Node.js Selector** และ MySQL ในที่เดียวกัน ชื่อเมนูอาจต่างกันตามผู้ให้บริการ

### 3.1 นำโค้ดขึ้นโฮสต์

เลือกอย่างใดอย่างหนึ่ง:

- **Git:** ใน cPanel ใช้ “Git™ Version Control” clone repo ไปยังโฟลเดอร์ที่ต้องการ (เช่น `~/erp-mns` หรือใต้ `public_html` ตามนโยบายโฮสต์)  
- **ZIP:** อัปโหลดไฟล์ zip แล้วแตกไฟล์ใน File Manager

**สำคัญ:** โฟลเดอร์ที่รันแอปต้องมี `package.json` ที่รากโปรเจกต์นี้ (ไม่ใช่แค่โฟลเดอร์ `server/` อย่างเดียว) เพราะคำสั่ง build รันที่ราก

### 3.2 สร้างฐานข้อมูลและ import

ทำตาม **ส่วน 1.2** หรือสรุปสั้นใน `database/CPANEL-COPY-PASTE.txt`:

1. cPanel → **MySQL® Databases** → สร้างฐาน + user → ผูกสิทธิ์  
2. **phpMyAdmin** → เลือกฐาน → Import ไฟล์ SQL ตามที่เลือกไว้

### 3.3 สร้างไฟล์ `server/.env`

1. คัดลอก `server/.env.cpanel.example` เป็น **`server/.env`** (บนเซิร์ฟเวอร์ — อย่า commit ไฟล์นี้)  
2. แก้ค่าให้ตรงกับ cPanel:

   - `DB_HOST` (มักเป็น `localhost`)  
   - `DB_PORT` (มัก `3306`)  
   - `DB_DATABASE`  
   - `DB_USERNAME`  
   - `DB_PASSWORD`  

3. ถ้าโฮสต์กำหนดพอร์ตแอปให้อัตโนมัติ อาจต้องใส่ `PORT=...` ตามที่แผงบอก — ไม่ต้องแก้โค้ด

### 3.4 ติดตั้ง Node.js Application

1. เปิด **Setup Node.js application** (หรือเมนูเทียบเท่า)  
2. เลือก **Node.js เวอร์ชัน 22.x** (สอดคล้อง `CPANEL-NODE.txt`)  
3. **Application root** = โฟลเดอร์ที่มี `package.json` รากโปรเจกต์  
4. **Application URL** = โดเมนหรือ subdomain ที่ต้องการเปิดแอป (เช่น `erp.example.com`)  
5. **Application startup file** — ตามที่แผงรองรับ:
   - ถ้าให้ใส่สคริปต์โดยตรง: ใช้ `server/index.mjs`  
   - ถ้าให้รันผ่าน npm: ใช้คำสั่ง start จาก `package.json` คือ **`npm start`** (ซึ่งรัน `node server/index.mjs`)

6. ในหน้าแอป Node มักมีปุ่ม **Run NPM Install** — กดให้ติดตั้ง dependencies รากก่อน  
7. เปิด **Terminal** ใน cPanel (หรือ SSH) ไปที่ **รากโปรเจกต์** แล้วรันตามลำดับ:

   ```bash
   npm install
   npm run build
   npm install --prefix server
   ```

8. **Restart** แอป Node ในแผง cPanel

### 3.5 ตรวจสอบหลัง Deploy (cPanel)

1. เปิด `https://<โดเมนที่ตั้ง>/` — ควรเห็นหน้าแอป  
2. เปิด `https://<โดเมนที่ตั้ง>/api/health` — ต้องได้ JSON `ok: true` และ **`db: true`**  
3. ถ้า `db: false` — ตรวจ `server/.env`, สิทธิ์ user MySQL, และว่า import SQL สำเร็จหรือไม่

### 3.6 แอป Node กับ PHP (PM2021) บนโดเมนเดียวกัน

- **API Node** อยู่ที่ path เดียวกับโดเมนแอป (`/api/...`)  
- **PHP ใหม่** วางใต้ `public_html/api-new/` (ดู `api-new/.htaccess`, `_cors.php`)  
- ถ้า React ต้องเรียก PHP ข้ามพอร์ต/โดเมน ให้ตั้ง **`VITE_PM2021_API_BASE`** ตอน build (ดู `.env.example`) แล้ว build ใหม่

---

## ส่วน 4 — GitHub Pages (เฉพาะ static)

โปรเจกต์มี workflow deploy หน้าเว็บแบบ static — **ไม่รวม API Node** บน Pages

1. ตั้งค่า GitHub Repo → **Settings** → **Pages** → Build: **GitHub Actions**  
2. Workflow ใช้ Node จาก **`.nvmrc`** (สาย 22)  
3. ถ้า deploy เป็น subpath ให้ตั้ง `VITE_BASE` หรือ `GITHUB_REPOSITORY` ตามที่อธิบายใน `RAILWAY.md` ท้ายเอกสารและใน `vite.config.ts`  
4. **API ต้องอยู่โฮสต์อื่น** (เช่น Railway หรือ subdomain ที่รัน `npm start`) แล้วตั้ง **`VITE_MNS_API_BASE`** ให้ชี้ URL นั้นก่อน `npm run build` ใน CI (ปรับ workflow ให้ส่ง env นี้ถ้าจำเป็น)

---

## ส่วน 5 — Checklist หลัง Deploy ทุกแบบ

| ลำดับ | การตรวจ | คาดหวัง |
|--------|----------|----------|
| 1 | `GET /api/health` | `ok: true`, `db: true` |
| 2 | เปิด `/` | SPA โหลด ไม่ใช่หน้าว่างจาก error build |
| 3 | ลองล็อกอิน / ฟีเจอร์ที่อ่าน DB | ไม่ error 500 จากการเชื่อมต่อ |
| 4 | (ถ้าแยกโดเมน API กับหน้าเว็บ) | ตั้ง CORS ที่ API หรือ reverse proxy ให้ origin ตรงกับหน้าเว็บ |

---

## ส่วน 6 — เมื่อมีปัญหา (สรุป)

| อาการ | แนวทาง |
|--------|--------|
| Build fail | ดู log: ต้องมี devDependencies ตอน build (`railway.toml` ใช้ `npm install --include=dev`) |
| `/api/health` แต่ `db: false` | ตรวจ env MySQL ที่บริการที่รัน Node; ชื่อฐาน/user/pass/host |
| หน้าเว็บ 404 ทุก path | โปรเจกต์นี้ใช้ SPA — เซิร์ฟเวอร์ต้องส่ง `index.html` สำหรับ path ย่อย (โค้ดใน `server/index.mjs` จัดการแล้วเมื่อรันจาก `npm start`) |
| รัน Node บน cPanel แล้วแอปไม่ขึ้น | ตรวจ path ราก, startup file, และว่า `npm run build` รันบนเซิร์ฟเวอร์แล้ว |

เอกสารเพิ่มเติม: **`RAILWAY.md`** · **`database/IMPORT.txt`** · **`CPANEL-NODE.txt`** · **`database/CPANEL-COPY-PASTE.txt`**
