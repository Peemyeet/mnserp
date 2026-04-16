/**
 * โหลด server/.env แล้วตั้ง DATABASE_URL จาก DB_* (หรือใช้ mysql:// ที่มีอยู่)
 * ให้ Prisma รันได้บน cPanel โดยไม่ต้องซ้ำ DATABASE_URL
 *
 *   node scripts/prisma-with-db-env.mjs generate
 *   node scripts/prisma-with-db-env.mjs validate
 *   node scripts/prisma-with-db-env.mjs db push
 *   node scripts/prisma-with-db-env.mjs migrate deploy
 *
 * จาก server: npm run prisma -- migrate deploy   (อย่าใช้ npx prisma ตรงๆ ถ้ามีแค่ DB_* ไม่มี DATABASE_URL)
 */
import { execSync } from "child_process";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.join(__dirname, "..");
config({ path: path.join(serverDir, ".env"), override: true });

/** มี mysql:// หรือ DB_* ครบสำหรับประกอบ URL จริง */
function hasMysqlEnv() {
  const d = process.env.DATABASE_URL?.trim();
  if (d?.toLowerCase().startsWith("mysql:")) return true;
  const host = process.env.DB_HOST?.trim();
  const database = process.env.DB_DATABASE?.trim();
  const user = process.env.DB_USERNAME ?? process.env.DB_USER;
  return !!(host && database && user !== undefined && user !== null);
}

const sub = process.argv.slice(2);
if (!sub.length) sub.push("generate");
const cmd = (sub[0] || "").toLowerCase();
/** generate / validate / format ไม่ต้องมี DB จริง — ใช้ URL จำลองได้ */
const offlineSafe = ["generate", "validate", "format"].includes(cmd);

if (offlineSafe && !hasMysqlEnv()) {
  process.env.DATABASE_URL =
    "mysql://prisma_generate:unused@127.0.0.1:3306/prisma_generate_only";
  console.info(
    '[prisma] ไม่มี MySQL ใน .env — ใช้ URL จำลองสำหรับ "' +
      sub.join(" ") +
      '" เท่านั้น (ไม่เชื่อมต่อฐาน)\n' +
      "         คำสั่ง db push / migrate ต้องตั้ง DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD หรือ DATABASE_URL=mysql://...",
  );
}

const { buildMysqlDatabaseUrl } = await import("../db.mjs");
const url = buildMysqlDatabaseUrl();
if (!url) {
  console.error(
    "ไม่พบการตั้งค่า MySQL — ใส่ DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD ใน server/.env\n" +
      "หรือ DATABASE_URL=mysql://... (ดู server/.env.cpanel.example)",
  );
  process.exit(1);
}
process.env.DATABASE_URL = url;

execSync(`npx prisma ${sub.join(" ")}`, {
  stdio: "inherit",
  cwd: serverDir,
  env: process.env,
  shell: true,
});
