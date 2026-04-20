import mysql from "mysql2/promise";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ไม่ override ค่าที่ตั้งใน process.env แล้ว (เช่น prisma-with-db-env ใส่ mysql จำลองก่อน import)
config({ path: path.join(__dirname, ".env"), override: false });

/** @type {import("mysql2/promise").Pool | undefined} */
let pool;

/**
 * ประกอบ mysql:// จาก (ลำดับรองรับแบบแยกส่วน):
 *   • Railway MySQL: MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT
 *   • cPanel / ทั่วไป: DB_HOST, DB_DATABASE, DB_USERNAME|DB_USER, DB_PASSWORD, DB_PORT
 * DATABASE_URL ใช้ได้เฉพาะที่ขึ้นต้นด้วย mysql:// — ค่าอื่นจะถูกข้าม (ใช้ MYSQL* / DB_* แทน)
 */
export function buildMysqlDatabaseUrl() {
  const enc = encodeURIComponent;

  const fromRailway = (() => {
    const host = process.env.MYSQLHOST?.trim();
    const database = process.env.MYSQLDATABASE?.trim();
    const user = process.env.MYSQLUSER;
    const password = process.env.MYSQLPASSWORD ?? "";
    const port = process.env.MYSQLPORT?.trim() || "3306";
    if (host && database && user !== undefined && user !== null) {
      return `mysql://${enc(String(user))}:${enc(String(password))}@${host}:${port}/${enc(database)}`;
    }
    return null;
  })();

  const host = process.env.DB_HOST?.trim();
  const database =
    process.env.DB_DATABASE?.trim() || process.env.DB_NAME?.trim();
  const user = process.env.DB_USERNAME ?? process.env.DB_USER;
  const password = process.env.DB_PASSWORD ?? "";
  const port = process.env.DB_PORT?.trim() || "3306";
  const fromDbParts =
    host && database && user !== undefined && user !== null
      ? `mysql://${enc(String(user))}:${enc(String(password))}@${host}:${port}/${enc(database)}`
      : null;

  /** Railway มาก่อน DB_* ถ้ามีทั้งคู่ (บน Railway มักมีแค่ MYSQL*) */
  const fromDiscrete = fromRailway ?? fromDbParts;

  const direct = process.env.DATABASE_URL?.trim();
  if (direct) {
    const lower = direct.toLowerCase();
    if (lower.startsWith("mysql:")) {
      return direct;
    }
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[db] DATABASE_URL ไม่ใช่ mysql:// — ข้ามค่านี้ ใช้ MYSQL* / DB_* หรือแก้เป็น mysql:// เท่านั้น",
      );
    }
  }
  return fromDiscrete;
}

function createPool() {
  const urlStr = buildMysqlDatabaseUrl();
  if (!urlStr) {
    const raw = process.env.DATABASE_URL?.trim() ?? "";
    const nonMysqlUrl = raw !== "" && !raw.toLowerCase().startsWith("mysql:");
    throw new Error(
      nonMysqlUrl
        ? "ใช้ MySQL เท่านั้น — ลบหรือแก้ DATABASE_URL ให้เป็น mysql:// หรือใช้ MYSQLHOST, MYSQLDATABASE, MYSQLUSER, MYSQLPASSWORD (Railway — ดู server/.env.example)"
        : "ยังไม่ได้ตั้ง MySQL — ใส่ DATABASE_URL=mysql://... หรือ MYSQLHOST+MYSQLDATABASE+MYSQLUSER+MYSQLPASSWORD (+MYSQLPORT) หรือ DB_* (ดู server/.env.example)",
    );
  }
  const u = new URL(urlStr);
  const database = u.pathname.replace(/^\//, "").split("?")[0];
  if (!database) {
    throw new Error("connection ต้องมีชื่อฐานข้อมูลหลัง /");
  }
  return mysql.createPool({
    host: u.hostname,
    port: Number(u.port) || 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database,
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true,
  });
}

/**
 * คืนค่าแบบเดียวกับ mysql2 pool.query: [rows, fields]
 */
export function getPool() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

/** MySQL: ER_BAD_FIELD_ERROR เมื่อไม่มีคอลัมน์ */
export function isMissingColumnError(err) {
  const c = err?.code;
  return c === "ER_BAD_FIELD_ERROR" || c === "42703";
}
