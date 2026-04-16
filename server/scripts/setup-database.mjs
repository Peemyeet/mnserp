/**
 * คำแนะนำตั้งค่าฐานข้อมูล MySQL (เช่น cPanel / เครื่อง local)
 *
 *   npm run db:setup
 *
 * ฐานหลัก: import database/mns_pm_2021.sql (หรือชุดเบา database/db_mns.sql) + migration ใน database/migrations/mysql/
 */
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { buildMysqlDatabaseUrl } from "../db.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.join(__dirname, "..");
config({ path: path.join(serverDir, ".env"), override: true });

async function main() {
  const url = buildMysqlDatabaseUrl();
  if (!url) {
    console.error(
      "ไม่พบการตั้งค่า MySQL — ใส่ DATABASE_URL=mysql://... หรือ DB_HOST + DB_DATABASE + DB_USERNAME + DB_PASSWORD ใน server/.env",
    );
    console.error("ดู: server/.env.example และ server/.env.cpanel.example");
    process.exit(1);
  }
  console.log("โปรเจกต์ใช้ MySQL โดยตรง — ไม่มี Prisma migrate บน API");
  console.log("");
  console.log("ขั้นตอนแนะนำ:");
  console.log("  1) สร้างฐานข้อมูลใน cPanel / MySQL");
  console.log("  2) Import database/mns_pm_2021.sql (แนะนำ) หรือ database/db_mns.sql ผ่าน phpMyAdmin / mysql CLI");
  console.log("  3) รันทีละไฟล์ใน database/migrations/mysql/ ถ้าต้องการคอลัมน์เสริม");
  console.log("  4) ใส่ DATABASE_URL ใน server/.env แล้วรัน npm run api");
  console.log("");
  console.log("ดูรายละเอียดอัปโหลด cPanel: database/CPANEL-MYSQL.txt");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
