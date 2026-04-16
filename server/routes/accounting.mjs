import { Router } from "express";
import { getPool } from "../db.mjs";

const r = Router();

function n(v) {
  if (typeof v === "bigint") return Number(v);
  if (v != null && typeof v === "object" && "toString" in v) {
    const x = Number(String(v));
    return Number.isFinite(x) ? x : 0;
  }
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function jsonSafe(obj) {
  return JSON.parse(
    JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? Number(v) : v))
  );
}

/** สรุปตัวเลขหน้างานแผนกบัญชี — MySQL */
r.get("/work-summary", async (_req, res) => {
  const out = {
    ok: true,
    invoice: { count: 0, totalBaht: 0 },
    billNote: { count: 0, totalBaht: 0 },
    receipt: {
      totalCount: 0,
      notDue: { count: 0, baht: 0 },
      overdue: { count: 0, baht: 0 },
    },
    payin: { pendingCount: 0, totalBaht: 0 },
    verify: { count: 0, totalBaht: 0 },
    approvePending: {
      totalCount: 0,
      management: { count: 0, baht: 0 },
      production: { count: 0, baht: 0 },
    },
    unpaidPo: {
      waiting: { count: 0, baht: 0 },
      unpaid: { count: 0, baht: 0 },
      totalCount: 0,
    },
  };

  let p;
  try {
    p = getPool();
  } catch (e) {
    console.warn("accounting work-summary: no pool", e?.message);
    return res.json(out);
  }

  try {
    const [rows] = await p.query(
      `SELECT COUNT(*) AS c FROM bill_invoice WHERE job_id > 0`
    );
    out.invoice.count = n(rows?.[0]?.c);
  } catch (e) {
    console.warn("work-summary invoice count", e.message);
  }

  try {
    const [rows] = await p.query(
      `SELECT COALESCE(SUM(q.grand_total), 0) AS s
       FROM bill_quota q
       INNER JOIN (
         SELECT q2.job_id, MAX(q2.quota_id) AS max_quota_id
         FROM bill_quota q2
         WHERE q2.job_id IN (SELECT DISTINCT job_id FROM bill_invoice WHERE job_id > 0)
         GROUP BY q2.job_id
       ) t ON q.job_id = t.job_id AND q.quota_id = t.max_quota_id`
    );
    out.invoice.totalBaht = n(rows?.[0]?.s);
  } catch (e) {
    console.warn("work-summary invoice sum", e.message);
  }

  try {
    const [rows] = await p.query(
      `SELECT COUNT(*) AS c, COALESCE(SUM(job_amount), 0) AS s
       FROM job_data WHERE job_status = 17`
    );
    out.billNote.count = n(rows?.[0]?.c);
    out.billNote.totalBaht = n(rows?.[0]?.s);
  } catch (e) {
    console.warn("work-summary bill note", e.message);
  }

  function applyReceiptRow(row) {
    if (!row) return;
    out.receipt.totalCount = n(row.total_n);
    out.receipt.notDue.count = n(row.not_due_n);
    out.receipt.notDue.baht = n(row.not_due_amt);
    out.receipt.overdue.count = n(row.overdue_n);
    out.receipt.overdue.baht = n(row.overdue_amt);
  }

  try {
    const [brRows] = await p.query(
      `SELECT
         COUNT(*) AS total_n,
         SUM(CASE
           WHEN br.due_date IS NULL OR br.due_date <= '1900-01-01' OR br.due_date >= CURDATE()
           THEN 1 ELSE 0 END) AS not_due_n,
         COALESCE(SUM(CASE
           WHEN br.due_date IS NULL OR br.due_date <= '1900-01-01' OR br.due_date >= CURDATE()
           THEN COALESCE(br.ad_playment, 0) + COALESCE(br.de_tax, 0)
           ELSE 0
         END), 0) AS not_due_amt,
         SUM(CASE
           WHEN br.due_date > '1900-01-01' AND br.due_date < CURDATE()
           THEN 1 ELSE 0 END) AS overdue_n,
         COALESCE(SUM(CASE
           WHEN br.due_date > '1900-01-01' AND br.due_date < CURDATE()
           THEN COALESCE(br.ad_playment, 0) + COALESCE(br.de_tax, 0)
           ELSE 0
         END), 0) AS overdue_amt
       FROM bill_receiver br`
    );
    const br = brRows?.[0];
    if (n(br?.total_n) > 0) {
      applyReceiptRow(br);
    } else {
      const [roRows] = await p.query(
        `SELECT
           COUNT(*) AS total_n,
           SUM(CASE
             WHEN ro.end_date IS NULL OR ro.end_date <= '1970-01-01' OR ro.end_date >= CURDATE()
             THEN 1 ELSE 0 END) AS not_due_n,
           COALESCE(SUM(CASE
             WHEN ro.end_date IS NULL OR ro.end_date <= '1970-01-01' OR ro.end_date >= CURDATE()
             THEN COALESCE(ro.advance_payment, 0) + COALESCE(ro.tax, 0)
             ELSE 0
           END), 0) AS not_due_amt,
           SUM(CASE
             WHEN ro.end_date > '1970-01-01' AND ro.end_date < CURDATE()
             THEN 1 ELSE 0 END) AS overdue_n,
           COALESCE(SUM(CASE
             WHEN ro.end_date > '1970-01-01' AND ro.end_date < CURDATE()
             THEN COALESCE(ro.advance_payment, 0) + COALESCE(ro.tax, 0)
             ELSE 0
           END), 0) AS overdue_amt
         FROM receive_order ro`
      );
      applyReceiptRow(roRows?.[0]);
    }
  } catch (e) {
    console.warn("work-summary receipt", e.message);
  }

  try {
    const [rows] = await p.query(
      `SELECT COUNT(*) AS c FROM mns_payment_ship_confirm WHERE payment_confirmed = 0`
    );
    out.payin.pendingCount = n(rows?.[0]?.c);
  } catch {
    /* ตารางอาจยังไม่มี */
  }
  out.payin.totalBaht = 0;

  try {
    const [rows] = await p.query(
      `SELECT COUNT(*) AS c,
         COALESCE(SUM(
         CASE
           WHEN NULLIF(TRIM(REGEXP_REPLACE(TRIM(bo.grandtotal), '[^0-9.-]', '')), '') IS NOT NULL
           THEN CAST(NULLIF(TRIM(REGEXP_REPLACE(TRIM(bo.grandtotal), '[^0-9.-]', '')), '') AS DECIMAL(20,4))
           ELSE 0
         END
       ), 0) AS s
       FROM bill_order bo
       WHERE bo.audit_status = 0`
    );
    out.verify.count = n(rows?.[0]?.c);
    out.verify.totalBaht = n(rows?.[0]?.s);
  } catch (e) {
    console.warn("work-summary verify", e.message);
  }

  try {
    const [rows] = await p.query(
      `SELECT
         COUNT(*) AS total_n,
         SUM(CASE WHEN workgroup_id = 9 THEN 1 ELSE 0 END) AS prod_n,
         COALESCE(SUM(CASE WHEN workgroup_id = 9 THEN job_amount ELSE 0 END), 0) AS prod_amt,
         SUM(CASE WHEN workgroup_id <> 9 THEN 1 ELSE 0 END) AS mgmt_n,
         COALESCE(SUM(CASE WHEN workgroup_id <> 9 THEN job_amount ELSE 0 END), 0) AS mgmt_amt
       FROM job_data
       WHERE job_status = 11`
    );
    const row = rows?.[0];
    out.approvePending.totalCount = n(row?.total_n);
    out.approvePending.production.count = n(row?.prod_n);
    out.approvePending.production.baht = n(row?.prod_amt);
    out.approvePending.management.count = n(row?.mgmt_n);
    out.approvePending.management.baht = n(row?.mgmt_amt);
  } catch (e) {
    console.warn("work-summary approve pending", e.message);
  }

  try {
    const [rows] = await p.query(
      `SELECT
         SUM(CASE WHEN bo_receive = 0 AND audit_status = 0 THEN 1 ELSE 0 END) AS wait_n,
         COALESCE(SUM(CASE WHEN bo_receive = 0 AND audit_status = 0 THEN
           COALESCE(CAST(NULLIF(TRIM(REGEXP_REPLACE(TRIM(grandtotal), '[^0-9.-]', '')), '') AS DECIMAL(20,4)), 0)
         ELSE 0 END), 0) AS wait_amt,
         SUM(CASE WHEN bo_receive = 0 AND audit_status <> 0 THEN 1 ELSE 0 END) AS up_n,
         COALESCE(SUM(CASE WHEN bo_receive = 0 AND audit_status <> 0 THEN
           COALESCE(CAST(NULLIF(TRIM(REGEXP_REPLACE(TRIM(grandtotal), '[^0-9.-]', '')), '') AS DECIMAL(20,4)), 0)
         ELSE 0 END), 0) AS up_amt
       FROM bill_order`
    );
    const row = rows?.[0];
    out.unpaidPo.waiting.count = n(row?.wait_n);
    out.unpaidPo.waiting.baht = n(row?.wait_amt);
    out.unpaidPo.unpaid.count = n(row?.up_n);
    out.unpaidPo.unpaid.baht = n(row?.up_amt);
    out.unpaidPo.totalCount =
      out.unpaidPo.waiting.count + out.unpaidPo.unpaid.count;
  } catch (e) {
    console.warn("work-summary unpaid po", e.message);
  }

  res.setHeader("Cache-Control", "no-store");
  res.json(jsonSafe(out));
});

export default r;
