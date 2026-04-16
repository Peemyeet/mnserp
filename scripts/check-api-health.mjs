#!/usr/bin/env node
/**
 * ทดสอบว่า API รันอยู่และเชื่อม MySQL ได้ — เทียบเท่า GET /api/health
 * ใช้: รัน API อีกเทอร์มินัล (npm run api) แล้วรัน  npm run api:health
 */
const port = Number(process.env.PORT || process.env.MNS_API_PORT) || 8787;
const base =
  process.env.API_HEALTH_URL || `http://127.0.0.1:${port}/api/health`;

async function main() {
  let res;
  try {
    res = await fetch(base, { cache: "no-store" });
  } catch (e) {
    console.error(
      `เรียก ${base} ไม่ได้ — เปิด API ก่อน:\n  npm run api\n\nรายละเอียด: ${e.message}`,
    );
    process.exit(1);
  }
  let body;
  try {
    body = await res.json();
  } catch {
    console.error("คำตอบไม่ใช่ JSON:", res.status, await res.text());
    process.exit(1);
  }
  console.log(JSON.stringify(body, null, 2));
  if (!body.ok) {
    process.exit(2);
  }
  if (!body.db) {
    console.error(
      "\n⚠ db: false — ตรวจ DATABASE_URL (mysql://) ใน server/.env และว่า MySQL รับ connection",
    );
    if (body.message) console.error("   ", body.message);
    process.exit(3);
  }
  console.error("\n✓ ok และ db: true — เชื่อมฐานข้อมูลได้");
  process.exit(0);
}

main();
