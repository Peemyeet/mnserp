import { Router } from "express";
import { getPool } from "../db.mjs";

const r = Router();

function n(v) {
  if (typeof v === "bigint") return Number(v);
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

async function countOrZero(p, sql) {
  try {
    const [rows] = await p.query(sql);
    return n(rows?.[0]?.c);
  } catch {
    return 0;
  }
}

async function tableExists(p, tableName) {
  try {
    const [rows] = await p.query(
      `SELECT 1 AS x FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1`,
      [tableName],
    );
    return rows.length > 0;
  } catch {
    return false;
  }
}

async function countFirstExistingTable(p, names) {
  for (const t of names) {
    if (!(await tableExists(p, t))) continue;
    const c = await countOrZero(p, `SELECT COUNT(*) AS c FROM \`${t}\``);
    return c;
  }
  return 0;
}

/**
 * จำนวนรายการต่อมุมมองอนุมัติ — จาก MySQL
 * GET /api/approve/counts
 */
r.get("/counts", async (_req, res) => {
  const out = {
    ok: true,
    paymentSummary: 0,
    prNoJob: 0,
    leave: 0,
    vehicle: 0,
    auditPayment: 0,
    createPo: 0,
  };

  let p;
  try {
    p = getPool();
  } catch {
    res.setHeader("Cache-Control", "no-store");
    return res.json(out);
  }

  const jobsPending = await countOrZero(
    p,
    `SELECT COUNT(*) AS c FROM job_data WHERE job_status = 11`,
  );
  const payinPending = await countOrZero(
    p,
    `SELECT COUNT(*) AS c FROM mns_payment_ship_confirm WHERE payment_confirmed = 0`,
  );
  out.paymentSummary = jobsPending + payinPending;

  out.prNoJob = await countOrZero(
    p,
    `SELECT COUNT(*) AS c FROM pr_data WHERE job_id <= 0`,
  );

  out.auditPayment = await countOrZero(
    p,
    `SELECT COUNT(*) AS c FROM bill_order WHERE audit_status = 0`,
  );

  out.createPo = await countOrZero(
    p,
    `SELECT COUNT(*) AS c FROM bill_order WHERE bo_receive = 0 AND audit_status <> 0`,
  );

  out.leave = await countFirstExistingTable(p, [
    "leave_form",
    "form_leave",
    "hr_leave",
    "leave_request",
    "mns_leave",
  ]);

  out.vehicle = await countFirstExistingTable(p, [
    "car_request",
    "vehicle_request",
    "form_car",
    "mns_car",
    "borrow_car",
  ]);

  res.setHeader("Cache-Control", "no-store");
  res.json(out);
});

export default r;
