import { Router } from "express";
import { getPool, isMissingColumnError, isMissingTableError } from "../db.mjs";
import { ensureLookupTables } from "../lib/ensureLookupTables.mjs";

const r = Router();

const MONTH_TH = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const PERIODS = new Set(["day", "month", "quarter", "year"]);

function parseSalesPeriod(req) {
  const raw = String(req.query.period ?? "month").toLowerCase();
  return PERIODS.has(raw) ? raw : "month";
}

function parseSalesYear(req) {
  const y = parseInt(String(req.query.year ?? ""), 10);
  if (!Number.isNaN(y) && y >= 1990 && y <= 2100) return y;
  return new Date().getFullYear();
}

function parseFilterUserId(req) {
  const v = parseInt(String(req.query.filterUserId ?? ""), 10);
  if (!Number.isNaN(v) && v > 0) return v;
  return null;
}

/** รีพอร์ตฝ่ายขาย — จาก bill_quota, job_data, user_data (MySQL) */
r.get("/sales", async (req, res) => {
  try {
    const p = getPool();
    await ensureLookupTables(p);
    const period = parseSalesPeriod(req);
    const year = parseSalesYear(req);
    const filterUid = parseFilterUserId(req);

    let monthly;
    if (period === "day") {
      const [rows] = await p.query(
        `SELECT DATE(b.quota_date) AS d, SUM(b.grand_total) AS total, COUNT(*) AS n
         FROM bill_quota b
         WHERE b.quota_date IS NOT NULL AND b.quota_date > '1900-01-01'
           AND b.quota_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
           ${filterUid == null ? "" : " AND b.user_id = ?"}
         GROUP BY DATE(b.quota_date)
         ORDER BY d ASC`,
        filterUid == null ? [] : [filterUid]
      );
      monthly = rows;
    } else if (period === "month") {
      const [rows] = await p.query(
        `SELECT YEAR(b.quota_date) AS y, MONTH(b.quota_date) AS m,
                SUM(b.grand_total) AS total, COUNT(*) AS n
         FROM bill_quota b
         WHERE b.quota_date IS NOT NULL AND b.quota_date > '1900-01-01'
           AND YEAR(b.quota_date) = ?
           ${filterUid == null ? "" : " AND b.user_id = ?"}
         GROUP BY YEAR(b.quota_date), MONTH(b.quota_date)
         ORDER BY y ASC, m ASC`,
        filterUid == null ? [year] : [year, filterUid]
      );
      monthly = rows;
    } else if (period === "quarter") {
      const [rows] = await p.query(
        `SELECT YEAR(b.quota_date) AS y, QUARTER(b.quota_date) AS q,
                SUM(b.grand_total) AS total, COUNT(*) AS n
         FROM bill_quota b
         WHERE b.quota_date IS NOT NULL AND b.quota_date > '1900-01-01'
           AND YEAR(b.quota_date) = ?
           ${filterUid == null ? "" : " AND b.user_id = ?"}
         GROUP BY YEAR(b.quota_date), QUARTER(b.quota_date)
         ORDER BY y ASC, q ASC`,
        filterUid == null ? [year] : [year, filterUid]
      );
      monthly = rows;
    } else {
      const y0 = year - 4;
      const [rows] = await p.query(
        `SELECT YEAR(b.quota_date) AS y, SUM(b.grand_total) AS total, COUNT(*) AS n
         FROM bill_quota b
         WHERE b.quota_date IS NOT NULL AND b.quota_date > '1900-01-01'
           AND YEAR(b.quota_date) BETWEEN ? AND ?
           ${filterUid == null ? "" : " AND b.user_id = ?"}
         GROUP BY YEAR(b.quota_date)
         ORDER BY y ASC`,
        filterUid == null ? [y0, year] : [y0, year, filterUid]
      );
      monthly = rows;
    }

    let lineSeries = [];
    if (period === "day") {
      lineSeries = (monthly ?? []).map((row) => {
        const d = row.d;
        const dt = d instanceof Date ? d : new Date(d);
        const label = `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;
        return {
          m: label,
          q: Number(row.total) || 0,
          n: Number(row.n) || 0,
        };
      });
    } else if (period === "month") {
      lineSeries = (monthly ?? []).map((row) => ({
        m: `${MONTH_TH[(row.m ?? 1) - 1] ?? row.m}${String(row.y ?? "").slice(2)}`,
        q: Number(row.total) || 0,
        n: Number(row.n) || 0,
      }));
    } else if (period === "quarter") {
      lineSeries = (monthly ?? []).map((row) => ({
        m: `Q${row.q ?? 1}/${String(row.y ?? "").slice(2)}`,
        q: Number(row.total) || 0,
        n: Number(row.n) || 0,
      }));
    } else {
      lineSeries = (monthly ?? []).map((row) => ({
        m: String(row.y ?? ""),
        q: Number(row.total) || 0,
        n: Number(row.n) || 0,
      }));
    }

    const fetchWorkgroupRows = async (joinWorkgroupTable) => {
      const wgExpr = joinWorkgroupTable
        ? "COALESCE(wg.wg_name, CONCAT('WG ', CAST(j.workgroup_id AS CHAR)))"
        : "CONCAT('WG ', CAST(j.workgroup_id AS CHAR))";
      const wgJoin = joinWorkgroupTable
        ? "LEFT JOIN workgroup wg ON wg.wg_id = j.workgroup_id"
        : "";
      const wgGroup = joinWorkgroupTable
        ? "GROUP BY j.workgroup_id, wg.wg_name"
        : "GROUP BY j.workgroup_id";

      if (period === "day") {
        const [rows] = await p.query(
          `SELECT ${wgExpr} AS wg_name, j.workgroup_id, COUNT(*) AS cnt
           FROM job_data j
           ${wgJoin}
           WHERE j.recive_job IS NOT NULL AND j.recive_job > '1900-01-01'
             AND j.recive_job >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
             ${filterUid == null ? "" : " AND (j.sale_id = ? OR j.user_id = ?)"}
           ${wgGroup}
           ORDER BY cnt DESC`,
          filterUid == null ? [] : [filterUid, filterUid]
        );
        return rows;
      }
      if (period === "month") {
        const [rows] = await p.query(
          `SELECT ${wgExpr} AS wg_name, j.workgroup_id, COUNT(*) AS cnt
           FROM job_data j
           ${wgJoin}
           WHERE j.recive_job IS NOT NULL AND j.recive_job > '1900-01-01'
             AND YEAR(j.recive_job) = ?
             ${filterUid == null ? "" : " AND (j.sale_id = ? OR j.user_id = ?)"}
           ${wgGroup}
           ORDER BY cnt DESC`,
          filterUid == null ? [year] : [year, filterUid, filterUid]
        );
        return rows;
      }
      if (period === "quarter") {
        const [rows] = await p.query(
          `SELECT ${wgExpr} AS wg_name, j.workgroup_id, COUNT(*) AS cnt
           FROM job_data j
           ${wgJoin}
           WHERE j.recive_job IS NOT NULL AND j.recive_job > '1900-01-01'
             AND YEAR(j.recive_job) = ?
             ${filterUid == null ? "" : " AND (j.sale_id = ? OR j.user_id = ?)"}
           ${wgGroup}
           ORDER BY cnt DESC`,
          filterUid == null ? [year] : [year, filterUid, filterUid]
        );
        return rows;
      }
      const y0 = year - 4;
      const [rows] = await p.query(
        `SELECT ${wgExpr} AS wg_name, j.workgroup_id, COUNT(*) AS cnt
         FROM job_data j
         ${wgJoin}
         WHERE j.recive_job IS NOT NULL AND j.recive_job > '1900-01-01'
           AND YEAR(j.recive_job) BETWEEN ? AND ?
           ${filterUid == null ? "" : " AND (j.sale_id = ? OR j.user_id = ?)"}
         ${wgGroup}
         ORDER BY cnt DESC`,
        filterUid == null ? [y0, year] : [y0, year, filterUid, filterUid]
      );
      return rows;
    };

    let wgRows;
    try {
      wgRows = await fetchWorkgroupRows(true);
    } catch (e) {
      if (!isMissingTableError(e)) throw e;
      wgRows = await fetchWorkgroupRows(false);
    }

    const saleVsRepair = (wgRows ?? []).map((row) => ({
      name: String(row.wg_name ?? "").slice(0, 24),
      count: Number(row.cnt) || 0,
    }));

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
      WHERE u.public = 1
        AND (
          COALESCE(u.sales_target_baht, 0) > 0
          OR COALESCE(a.actual_baht, 0) > 0
        )
      ORDER BY COALESCE(a.actual_baht, 0) DESC
      LIMIT 80`;

    const KPI_LEGACY = `
      SELECT b.user_id,
             TRIM(CONCAT(COALESCE(u.fname,''), ' ', COALESCE(u.lname,''))) AS fullname,
             SUM(b.grand_total) AS actual_baht,
             GREATEST(SUM(b.grand_total) * 1.12, 50000) AS target_baht
      FROM bill_quota b
      INNER JOIN user_data u ON u.user_id = b.user_id
      GROUP BY b.user_id, u.fname, u.lname
      HAVING SUM(b.grand_total) > 0
      ORDER BY actual_baht DESC
      LIMIT 40`;

    let kpiAll;
    try {
      const [rows] = await p.query(KPI_WITH_TARGET);
      kpiAll = rows;
    } catch (e) {
      if (isMissingColumnError(e)) {
        const [rows] = await p.query(KPI_LEGACY);
        kpiAll = rows;
      } else {
        throw e;
      }
    }

    const username = String(req.query.username ?? "").trim().toLowerCase();
    let kpiRows = kpiAll ?? [];
    if (username) {
      const [one] = await p.query(
        `SELECT user_id FROM user_data WHERE LOWER(username) = ? LIMIT 1`,
        [username]
      );
      const uid = one?.[0]?.user_id;
      if (uid != null) {
        kpiRows = (kpiAll ?? []).filter((x) => Number(x.user_id) === Number(uid));
      }
    }
    if (filterUid != null) {
      kpiRows = (kpiRows ?? []).filter((x) => Number(x.user_id) === Number(filterUid));
    }

    const kpi = (kpiRows ?? []).map((row) => ({
      user_id: row.user_id,
      name: String(row.fullname ?? "").trim() || `ผู้ใช้ ${row.user_id}`,
      targetBaht: Math.round(Number(row.target_baht) || 0),
      actualBaht: Math.round(Number(row.actual_baht) || 0),
    }));

    res.json({
      ok: true,
      sales: {
        lineSeries,
        workgroupJobCounts: saleVsRepair,
        kpi,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

/** รีพอร์ตฝ่ายผลิต — นับงานตาม workgroup */
r.get("/production", async (req, res) => {
  try {
    const p = getPool();
    const [rows] = await p.query(
      `SELECT COALESCE(wg.wg_name, CONCAT('WG ', CAST(j.workgroup_id AS CHAR))) AS name,
              COUNT(*) AS cnt
       FROM job_data j
       LEFT JOIN workgroup wg ON wg.wg_id = j.workgroup_id
       GROUP BY j.workgroup_id, wg.wg_name
       ORDER BY cnt DESC`
    );
    const chart = (rows ?? []).map((row, i) => {
      const cnt = Number(row.cnt) || 0;
      return {
        name: String(row.name ?? "").slice(0, 22) || `รายการ ${i + 1}`,
        actual: cnt,
        plan: Math.max(1, Math.ceil(cnt * 1.12)),
      };
    });
    res.json({ ok: true, production: { chart } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

/** รีพอร์ตจัดซื้อ — ใบสั่งซื้อรายเดือน + จำนวน PR */
r.get("/purchase", async (req, res) => {
  try {
    const p = getPool();
    const [monthly] = await p.query(
      `SELECT DATE_FORMAT(bo_date, '%Y-%m') AS ym, COUNT(*) AS cnt
       FROM bill_order
       WHERE bo_date IS NOT NULL AND bo_date > '1900-01-01'
       GROUP BY DATE_FORMAT(bo_date, '%Y-%m')
       ORDER BY ym ASC
       LIMIT 36`
    );
    const trend = (monthly ?? []).map((row) => ({
      x: String(row.ym ?? ""),
      v: Number(row.cnt) || 0,
    }));
    const [[prc]] = await p.query(`SELECT COUNT(*) AS n FROM pr_data`);
    const [[boc]] = await p.query(`SELECT COUNT(*) AS n FROM bill_order`);
    res.json({
      ok: true,
      purchase: {
        trend,
        prCount: Number(prc?.n) || 0,
        orderCount: Number(boc?.n) || 0,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

/** รีพอร์ตบัญชี — สรุปมูลค่าจากตารางเอกสาร */
r.get("/accounting", async (req, res) => {
  try {
    const p = getPool();
    const [[quota]] = await p.query(
      `SELECT COALESCE(SUM(grand_total), 0) AS s FROM bill_quota WHERE grand_total > -1e15`
    );
    const [[inv]] = await p.query(`SELECT COUNT(*) AS n FROM bill_invoice`);
    const [[bo]] = await p.query(`SELECT COUNT(*) AS n FROM bill_order`);
    const [[recv]] = await p.query(
      `SELECT COALESCE(SUM(advance_payment), 0) AS s FROM receive_order`
    );
    const [[rfq]] = await p.query(`SELECT COUNT(*) AS n FROM rfq`);

    const quotaSum = Math.max(0, Number(quota?.s) || 0);
    const recvSum = Math.max(0, Number(recv?.s) || 0);
    const invN = Math.max(0, Number(inv?.n) || 0);
    const boN = Math.max(0, Number(bo?.n) || 0);
    const rfqN = Math.max(0, Number(rfq?.n) || 0);

    const pie = [
      { name: "ยอดใบเสนอราคา (รวม)", value: quotaSum, color: "#6366f1" },
      { name: "ใบแจ้งหนี้ (จำนวน×100k)", value: invN * 100000, color: "#f97316" },
      { name: "ใบสั่งซื้อ (จำนวน×50k)", value: boN * 50000, color: "#14b8a6" },
      { name: "เงินล่วงหน้า (รับของ)", value: recvSum, color: "#22c55e" },
      { name: "คำขอใบเสนอราคา (จำนวน×10k)", value: rfqN * 10000, color: "#ec4899" },
    ].filter((x) => x.value > 0);

    const totalPie = pie.reduce((a, b) => a + b.value, 0) || 1;

    res.json({
      ok: true,
      accounting: {
        pie,
        totalPie,
        raw: {
          quotaSum,
          invoiceCount: invN,
          orderCount: boN,
          receiveAdvanceSum: recvSum,
          rfqCount: rfqN,
        },
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

export default r;
