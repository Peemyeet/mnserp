import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** โหลด `server/.env` — override เพื่อไม่ให้ตัวแปรเชลล์ว่างทับค่าในไฟล์ */
config({ path: path.join(__dirname, ".env"), override: true });

const {
  MNS_DB_HOST = "127.0.0.1",
  MNS_DB_PORT = "3306",
  MNS_DB_USER = "root",
  MNS_DB_PASSWORD = "",
  MNS_DB_NAME = "db_mns",
} = process.env;

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: MNS_DB_HOST,
      port: Number(MNS_DB_PORT),
      user: MNS_DB_USER,
      password: MNS_DB_PASSWORD,
      database: MNS_DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
    });
  }
  return pool;
}

export async function pingDb() {
  const p = getPool();
  const [rows] = await p.query("SELECT 1 AS ok");
  return rows?.[0]?.ok === 1;
}
