import { Router } from "express";
import { getPool } from "../db.mjs";

const r = Router();

/** ตารางที่อ้างถึงใน legacy PHP — ใช้ตรวจ capability เท่านั้น ไม่สร้าง/แก้ schema */
const LEGACY_TABLE_GROUPS = {
  billReceivePhp: [
    "bill_receive",
    "bill_receive_list",
    "billing_note",
    "plan_bill_receive",
    "plan_bill_receive_list",
    "plan_billing_note",
    "img_receive",
  ],
  storePartPhp: ["store_data", "store_category"],
  storePartPhpOptional: ["img_store"],
  /** json_report_sale.php — แท็บ 1 / 4 / bill_duedate (โซ่บิลเต็ม) */
  reportSaleJsonPhp: [
    "bill_payin",
    "bill_payin_list",
    "bill_receive",
    "bill_receive_list",
    "billing_note",
    "billing_note_list",
    "bill_invoice",
    "bill_invoice_list",
    "bill_delivery",
    "bill_quota",
    "job_data",
    "profile",
    "customer",
    "img_get_money",
  ],
  /** แท็บ 2 (ใบเสนอราคา) และแท็บ 3 (PO) ใช้แค่ชุดนี้ — มีใน db_mns.sql โดยมาก */
  reportSaleJsonTab2And3: ["bill_quota", "job_data", "customer"],
  dbMnsDumpCore: ["customer", "job_data", "sparepart", "bill_order"],
};

r.get("/health", async (_req, res) => {
  try {
    const p = getPool();
    await p.query("SELECT 1");
    res.json({ ok: true, db: true });
  } catch (e) {
    res.json({ ok: true, db: false, message: String(e.message) });
  }
});

r.get("/workstatus", async (_req, res) => {
  try {
    const p = getPool();
    const [rows] = await p.query(
      "SELECT ws_id, ws_name, list FROM workstatus WHERE public = 1 ORDER BY list ASC"
    );
    res.json({ ok: true, rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

r.get("/stats", async (_req, res) => {
  try {
    const p = getPool();
    const [[c]] = await p.query("SELECT COUNT(*) AS n FROM customer");
    const [[j]] = await p.query("SELECT COUNT(*) AS n FROM job_data");
    const [[s]] = await p.query("SELECT COUNT(*) AS n FROM sparepart");
    res.json({
      ok: true,
      counts: {
        customer: c?.n ?? 0,
        job_data: j?.n ?? 0,
        sparepart: s?.n ?? 0,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

/**
 * อ่านอย่างเดียว: ตาราง legacy มีในฐานปัจจุบันหรือไม่ (INFORMATION_SCHEMA)
 * ใช้ตัดสินใจก่อน implement โมดูล PHP ใน Node — ไม่แตะข้อมูล
 */
r.get("/legacy-tables", async (_req, res) => {
  try {
    const p = getPool();
    const allNames = [
      ...new Set(Object.values(LEGACY_TABLE_GROUPS).flat()),
    ];
    const ph = allNames.map(() => "?").join(",");
    const [rows] = await p.query(
      `SELECT TABLE_NAME AS name FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (${ph})`,
      allNames,
    );
    const present = new Set(rows.map((r) => r.name));
    const groups = {};
    for (const [key, names] of Object.entries(LEGACY_TABLE_GROUPS)) {
      groups[key] = names.map((name) => ({
        name,
        present: present.has(name),
      }));
    }
    const billReceivePhpReady = LEGACY_TABLE_GROUPS.billReceivePhp.every((n) =>
      present.has(n),
    );
    const storePartPhpReady = LEGACY_TABLE_GROUPS.storePartPhp.every((n) =>
      present.has(n),
    );
    const reportSaleJsonFullChain = LEGACY_TABLE_GROUPS.reportSaleJsonPhp.every(
      (n) => present.has(n),
    );
    const reportSaleTab2And3Ready =
      LEGACY_TABLE_GROUPS.reportSaleJsonTab2And3.every((n) => present.has(n));
    res.json({
      ok: true,
      groups,
      ready: {
        billReceivePhpModule: billReceivePhpReady,
        storePartPhpModule: storePartPhpReady,
        reportSaleJsonFullChain,
        reportSaleJsonTab2And3: reportSaleTab2And3Ready,
      },
      optionalPresent: {
        img_store: present.has("img_store"),
      },
      hint:
        "bill_receiver ใน db_mns.sql ไม่ใช่ bill_receive ของ PHP — ดู database/legacy-php-module-map.txt",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

export default r;
