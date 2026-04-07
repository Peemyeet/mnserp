/**
 * สร้างฐาน db_mns + import database/db_mns.sql + (ถ้ามี) migration HR
 * อ่านค่าจาก server/.env — ต้องใส่ MNS_DB_PASSWORD ให้ตรงกับ MySQL ก่อนรัน
 *
 *   npm run db:setup
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env");
// ให้ค่าใน server/.env ทับตัวแปรที่ตั้งไว้ในเชลล์ (มิฉะนั้น MNS_DB_PASSWORD= ว่างจะทำให้ได้ using password: NO)
config({ path: envPath, override: true });

const host = process.env.MNS_DB_HOST ?? "127.0.0.1";
const port = Number(process.env.MNS_DB_PORT) || 3306;
const user = process.env.MNS_DB_USER ?? "root";
const password = process.env.MNS_DB_PASSWORD ?? "";
const dbRaw = (process.env.MNS_DB_NAME ?? "db_mns").replace(/[^a-zA-Z0-9_]/g, "");
const db = dbRaw || "db_mns";

const repoRoot = path.resolve(__dirname, "..", "..");
const dumpPath = path.join(repoRoot, "database", "db_mns.sql");
const migrationPaths = [
  path.join(repoRoot, "database", "migrations", "001_user_hr_extend.sql"),
  path.join(repoRoot, "database", "migrations", "002_sales_target_baht.sql"),
];

function isDupColumnError(e) {
  return (
    e?.code === "ER_DUP_FIELDNAME" ||
    e?.errno === 1060 ||
    String(e?.message ?? "").includes("Duplicate column")
  );
}

async function main() {
  if (!fs.existsSync(dumpPath)) {
    console.error("ไม่พบไฟล์:", dumpPath);
    process.exit(1);
  }

  if (!password) {
    console.error("MNS_DB_PASSWORD ว่าง — ใส่รหัสผ่าน root ของ MySQL ในไฟล์นี้แล้วรันใหม่:");
    console.error(" ", envPath);
    console.error(
      "(ค่า mns_dev_root ใช้กับ Docker เท่านั้น — MySQL ติดตั้งจาก installer ต้องใช้รหัสที่ตั้งในขั้น Configure)"
    );
    process.exit(1);
  }

  console.log(`เชื่อมต่อ MySQL ${host}:${port} เป็น ${user} ...`);

  let baseConn;
  try {
    baseConn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });
  } catch (e) {
    console.error("เชื่อมต่อไม่ได้:", e.message);
    console.error("ตรวจสอบ: รหัสใน server/.env ตรงกับ root ของ MySQL บนเครื่องหรือไม่");
    console.error("ไฟล์:", envPath);
    process.exit(1);
  }

  console.log("สร้างฐานข้อมูล", db, "...");
  await baseConn.query(
    `CREATE DATABASE IF NOT EXISTS \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await baseConn.end();

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database: db,
    multipleStatements: true,
  });

  console.log("กำลัง import db_mns.sql (อาจใช้เวลาหลายนาที)...");
  const sql = fs.readFileSync(dumpPath, "utf8");
  try {
    await conn.query(sql);
  } catch (e) {
    console.error("Import ล้มเหลว:", e.message);
    if (String(e.message).includes("max_allowed_packet")) {
      console.error(
        "ลองเพิ่ม max_allowed_packet ใน my.cnf หรือรัน: mysql -u root -p < database/db_mns.sql"
      );
    }
    await conn.end();
    process.exit(1);
  }

  for (const migrationPath of migrationPaths) {
    if (!fs.existsSync(migrationPath)) continue;
    const base = path.basename(migrationPath);
    console.log(`รัน migration ${base} ...`);
    try {
      const mig = fs.readFileSync(migrationPath, "utf8");
      await conn.query(mig);
      console.log(`  ${base} สำเร็จ`);
    } catch (e) {
      if (isDupColumnError(e)) {
        console.log(`  ข้าม ${base} (คอลัมน์มีอยู่แล้ว)`);
      } else {
        console.warn(`  ${base}:`, e.message);
      }
    }
  }

  await conn.end();
  console.log("");
  console.log("เสร็จแล้ว — ทดสอบ: npm run api แล้วเปิด http://127.0.0.1:8787/api/health");
  console.log("หรือรันครบ: npm run dev:all");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
