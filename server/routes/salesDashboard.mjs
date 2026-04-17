import { Router } from "express";
import { getPool, isMissingColumnError } from "../db.mjs";

const r = Router();

/**
 * GET /api/sales/stage-counts
 * รวมจำนวนงานตาม job_status (N01..N20) จาก job_data
 */
r.get("/stage-counts", async (_req, res) => {
  try {
    const p = getPool();
    const [rows] = await p.query(
      `SELECT job_status, COUNT(*) AS c
       FROM job_data
       WHERE job_status BETWEEN 1 AND 20
       GROUP BY job_status`
    );
    const byStatus = Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [i + 1, 0])
    );
    for (const row of rows ?? []) {
      const ws = Number(row.job_status);
      if (Number.isInteger(ws) && ws >= 1 && ws <= 20) {
        byStatus[ws] = Number(row.c) || 0;
      }
    }
    res.json({ ok: true, byStatus });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

/**
 * GET /api/sales/dashboard?username=
 * แดชบอร์ดรายผู้ใช้ฝ่ายขาย: งานที่ต้องทำ (สเตจเสนอราคา 1–6) กับ งานค้าง (7–17, 20 ที่ยังไม่ปิด)
 * + KPI เป้า/ยอดจริงจาก bill_quota / user_data
 */
r.get("/dashboard", async (req, res) => {
  try {
    const username = String(req.query.username ?? "").trim().toLowerCase();
    if (!username) {
      return res.status(400).json({
        ok: false,
        message: "ต้องระบุ username",
      });
    }

    const p = getPool();
    const [[urow]] = await p.query(
      `SELECT user_id,
              TRIM(CONCAT(COALESCE(fname,''), ' ', COALESCE(lname,''))) AS fullname
       FROM user_data
       WHERE LOWER(username) = ?
       LIMIT 1`,
      [username]
    );

    if (!urow?.user_id) {
      return res.json({
        ok: true,
        mnsUserId: null,
        displayName: null,
        kpi: null,
        jobsTodo: [],
        jobsBacklog: [],
      });
    }

    const uid = Number(urow.user_id);
    const displayName = String(urow.fullname ?? "").trim() || null;

    const jobSelect = `
      SELECT j.job_id, j.service_id, j.product_name, j.modified, j.job_status,
             c.cus_name AS customer_name,
             w.ws_name
      FROM job_data j
      LEFT JOIN customer c ON c.cus_id = j.customer_id
      LEFT JOIN workstatus w ON w.ws_id = j.job_status
      WHERE (j.sale_id = ? OR j.user_id = ?)
        AND j.job_status NOT IN (18, 19)
    `;

    const [todoRows] = await p.query(
      `${jobSelect}
        AND j.job_status >= 1 AND j.job_status <= 6
       ORDER BY j.modified ASC
       LIMIT 80`,
      [uid, uid]
    );

    const [backlogRows] = await p.query(
      `${jobSelect}
        AND j.job_status >= 7
        AND (j.job_status <= 17 OR j.job_status = 20)
       ORDER BY j.modified ASC
       LIMIT 80`,
      [uid, uid]
    );

    const KPI_WITH_TARGET = `
      SELECT u.user_id,
             TRIM(CONCAT(COALESCE(u.fname,''), ' ', COALESCE(u.lname,''))) AS fullname,
             COALESCE(a.actual_baht, 0) AS actual_baht,
             CASE
               WHEN COALESCE(u.sales_target_baht, 0) > 0 THEN u.sales_target_baht
               WHEN COALESCE(a.actual_baht, 0) > 0 THEN GREATEST(a.actual_baht * 1.12, 50000)
               ELSE 0
             END AS target_baht
      FROM user_data u
      LEFT JOIN (
        SELECT user_id, SUM(grand_total) AS actual_baht
        FROM bill_quota
        GROUP BY user_id
      ) a ON a.user_id = u.user_id
      WHERE u.user_id = ?
      LIMIT 1`;

    const KPI_LEGACY = `
      SELECT b.user_id,
             TRIM(CONCAT(COALESCE(u.fname,''), ' ', COALESCE(u.lname,''))) AS fullname,
             SUM(b.grand_total) AS actual_baht,
             GREATEST(SUM(b.grand_total) * 1.12, 50000) AS target_baht
      FROM bill_quota b
      INNER JOIN user_data u ON u.user_id = b.user_id
      WHERE b.user_id = ?
      GROUP BY b.user_id, u.fname, u.lname`;

    let kpiRow = null;
    try {
      const [rows] = await p.query(KPI_WITH_TARGET, [uid]);
      kpiRow = rows?.[0] ?? null;
    } catch (e) {
      if (isMissingColumnError(e)) {
        const [rows] = await p.query(KPI_LEGACY, [uid]);
        kpiRow = rows?.[0] ?? null;
      } else {
        throw e;
      }
    }

    const kpi =
      kpiRow != null
        ? {
            targetBaht: Math.round(Number(kpiRow.target_baht) || 0),
            actualBaht: Math.round(Number(kpiRow.actual_baht) || 0),
            name:
              String(kpiRow.fullname ?? "").trim() ||
              displayName ||
              `ผู้ใช้ ${uid}`,
          }
        : null;

    const mapJob = (row) => ({
      job_id: row.job_id,
      service_id: row.service_id,
      product_name: row.product_name,
      modified: row.modified,
      job_status: row.job_status,
      customer_name: row.customer_name,
      ws_name: row.ws_name,
    });

    res.json({
      ok: true,
      mnsUserId: uid,
      displayName,
      kpi,
      jobsTodo: (todoRows ?? []).map(mapJob),
      jobsBacklog: (backlogRows ?? []).map(mapJob),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

export default r;
