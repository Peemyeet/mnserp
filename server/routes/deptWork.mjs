import { Router } from "express";
import { getPool } from "../db.mjs";

const r = Router();

function n(v) {
  if (typeof v === "bigint") return Number(v);
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

/**
 * ช่วงอายุงาน (วัน) จากวันที่รับงาน recive_job
 */
function ageBandSql(alias = "j") {
  return `
    SUM(CASE WHEN DATEDIFF(CURDATE(), ${alias}.recive_job) > 60 THEN 1 ELSE 0 END) AS b61,
    SUM(CASE WHEN DATEDIFF(CURDATE(), ${alias}.recive_job) BETWEEN 41 AND 60 THEN 1 ELSE 0 END) AS b41560,
    SUM(CASE WHEN DATEDIFF(CURDATE(), ${alias}.recive_job) BETWEEN 21 AND 40 THEN 1 ELSE 0 END) AS b2140,
    SUM(CASE WHEN DATEDIFF(CURDATE(), ${alias}.recive_job) BETWEEN 1 AND 20 THEN 1 ELSE 0 END) AS b120
  `;
}

/** ฝ่ายผลิต — นับจาก job_data + workgroup (9=ผลิต, 7=ซ่อม, 8=โปรเจค) */
r.get("/production-summary", async (_req, res) => {
  const out = {
    ok: true,
    production: {
      jobCount: 0,
      planCount: 0,
      bands: { b61: 0, b41560: 0, b2140: 0, b120: 0 },
    },
    repair: {
      internalCount: 0,
      productionRepairCount: 0,
      bands: { b61: 0, b41560: 0, b2140: 0, b120: 0 },
      failedTestCount: 0,
    },
    project: {
      jobCount: 0,
      bands: { b61: 0, b41560: 0, b2140: 0, b120: 0 },
    },
  };

  let p;
  try {
    p = getPool();
  } catch {
    return res.json(out);
  }

  const baseJob = `recive_job IS NOT NULL AND recive_job > '1900-01-01'`;

  try {
    const [[row9]] = await p.query(
      `SELECT COUNT(*) AS c,
              SUM(CASE WHEN job_status < 14 THEN 1 ELSE 0 END) AS plan_c,
              ${ageBandSql("j")}
       FROM job_data j WHERE j.workgroup_id = 9 AND ${baseJob}`
    );
    out.production.jobCount = n(row9?.c);
    out.production.planCount = n(row9?.plan_c);
    out.production.bands = {
      b61: n(row9?.b61),
      b41560: n(row9?.b41560),
      b2140: n(row9?.b2140),
      b120: n(row9?.b120),
    };
  } catch (e) {
    console.warn("production-summary wg9", e.message);
  }

  try {
    const [[row7]] = await p.query(
      `SELECT COUNT(*) AS c,
              ${ageBandSql("j")}
       FROM job_data j WHERE j.workgroup_id = 7 AND ${baseJob}`
    );
    out.repair.internalCount = n(row7?.c);
    out.repair.bands = {
      b61: n(row7?.b61),
      b41560: n(row7?.b41560),
      b2140: n(row7?.b2140),
      b120: n(row7?.b120),
    };
  } catch (e) {
    console.warn("production-summary wg7", e.message);
  }

  try {
    const [[row9r]] = await p.query(
      `SELECT COUNT(*) AS c FROM job_data j
       WHERE j.workgroup_id = 9 AND ${baseJob}
         AND j.job_status IN (14, 15, 16)`
    );
    out.repair.productionRepairCount = n(row9r?.c);
  } catch (e) {
    console.warn("production-summary repair wg9", e.message);
  }

  try {
    const [[fail]] = await p.query(
      `SELECT COUNT(*) AS c FROM job_data WHERE workgroup_id = 7 AND job_status = 20`
    );
    out.repair.failedTestCount = n(fail?.c);
  } catch (e) {
    console.warn("production-summary failed", e.message);
  }

  try {
    const [[row8]] = await p.query(
      `SELECT COUNT(*) AS c,
              ${ageBandSql("j")}
       FROM job_data j WHERE j.workgroup_id = 8 AND ${baseJob}`
    );
    out.project.jobCount = n(row8?.c);
    out.project.bands = {
      b61: n(row8?.b61),
      b41560: n(row8?.b41560),
      b2140: n(row8?.b2140),
      b120: n(row8?.b120),
    };
  } catch (e) {
    console.warn("production-summary wg8", e.message);
  }

  res.json(out);
});

/** จัดซื้อ — จาก bill_order, job_data, pr_data */
r.get("/purchase-summary", async (_req, res) => {
  const out = {
    ok: true,
    storefront: { hasPo: 0, noPo: 0 },
    openPo: { normal: 0, express: 0, urgent: 0 },
    overdue: { prod: 0, repair: 0, dev: 0, tools: 0 },
    waiting: { normal: 0, express: 0, urgent: 0 },
  };

  let p;
  try {
    p = getPool();
  } catch {
    return res.json(out);
  }

  try {
    const [[sf]] = await p.query(
      `SELECT
         SUM(CASE WHEN TRIM(COALESCE(ref_po, '')) != '' THEN 1 ELSE 0 END) AS has_po,
         SUM(CASE WHEN TRIM(COALESCE(ref_po, '')) = '' THEN 1 ELSE 0 END) AS no_po
       FROM bill_order
       WHERE bo_date IS NOT NULL AND bo_date > '1900-01-01'`
    );
    out.storefront.hasPo = n(sf?.has_po);
    out.storefront.noPo = n(sf?.no_po);
  } catch (e) {
    console.warn("purchase-summary storefront", e.message);
  }

  try {
    const [[open]] = await p.query(
      `SELECT
         SUM(CASE WHEN bo_receive = 0 THEN 1 ELSE 0 END) AS open_n,
         SUM(CASE WHEN bo_receive = 0 AND (
           LOWER(COALESCE(bo_cardit,'')) LIKE '%ด่วน%'
           OR LOWER(COALESCE(bo_info,'')) LIKE '%ด่วน%'
           OR LOWER(COALESCE(bo_cardit,'')) LIKE '%urgent%'
         ) THEN 1 ELSE 0 END) AS urgent_n,
         SUM(CASE WHEN bo_receive = 0
           AND NOT (
             LOWER(COALESCE(bo_cardit,'')) LIKE '%ด่วน%'
             OR LOWER(COALESCE(bo_info,'')) LIKE '%ด่วน%'
             OR LOWER(COALESCE(bo_cardit,'')) LIKE '%urgent%'
           )
           AND (
             LOWER(COALESCE(bo_cardit,'')) LIKE '%express%'
             OR LOWER(COALESCE(bo_info,'')) LIKE '%express%'
           ) THEN 1 ELSE 0 END) AS express_n
       FROM bill_order
       WHERE bo_date IS NOT NULL AND bo_date > '1900-01-01'`
    );
    const openN = n(open?.open_n);
    const urgentN = n(open?.urgent_n);
    const expressN = n(open?.express_n);
    out.openPo.urgent = urgentN;
    out.openPo.express = expressN;
    out.openPo.normal = Math.max(0, openN - urgentN - expressN);
  } catch (e) {
    console.warn("purchase-summary openPo", e.message);
  }

  try {
    const [rows] = await p.query(
      `SELECT j.workgroup_id AS wg, COUNT(*) AS c
       FROM bill_order b
       INNER JOIN job_data j ON j.job_id = b.job_id
       WHERE b.bo_receive = 0
         AND b.send_date IS NOT NULL AND b.send_date > '1900-01-01'
         AND b.send_date < CURDATE()
       GROUP BY j.workgroup_id`
    );
    for (const row of rows ?? []) {
      const wg = n(row.wg);
      const c = n(row.c);
      if (wg === 9) out.overdue.prod += c;
      else if (wg === 7) out.overdue.repair += c;
      else if (wg === 8) out.overdue.dev += c;
      else if (wg === 11) out.overdue.tools += c;
    }
  } catch (e) {
    console.warn("purchase-summary overdue", e.message);
  }

  try {
    const [[wait]] = await p.query(
      `SELECT COUNT(*) AS c FROM job_data WHERE job_status = 7`
    );
    out.waiting.normal = n(wait?.c);
  } catch (e) {
    console.warn("purchase-summary waiting", e.message);
  }

  res.json(out);
});

export default r;
