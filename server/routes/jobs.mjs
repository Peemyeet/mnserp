import { Router } from "express";
import { getPool } from "../db.mjs";
import { stageCodeToWsId, wsNameToStageCode } from "../lib/stage.mjs";

const r = Router();

r.get("/", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 300, 1000);
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const wsFilter = parseInt(String(req.query.job_status ?? req.query.ws ?? ""), 10);
    const saleFilter = parseInt(String(req.query.sale_id ?? ""), 10);
    const p = getPool();
    const cond = [];
    const qparams = [];
    if (!Number.isNaN(wsFilter) && wsFilter > 0) {
      cond.push("j.job_status = ?");
      qparams.push(wsFilter);
    }
    if (!Number.isNaN(saleFilter) && saleFilter > 0) {
      cond.push("j.sale_id = ?");
      qparams.push(saleFilter);
    }
    const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";
    const [rows] = await p.query(
      `SELECT j.job_id, j.service_id, j.product_name, j.job_po, j.job_status,
              j.job_quotation, j.modified, j.customer_id, j.recive_job, j.send_job, j.sn,
              j.sale_id, j.engeneer_id,
              c.cus_name AS customer_name,
              w.ws_name,
              TRIM(CONCAT(COALESCE(us.fname,''), ' ', COALESCE(us.lname,''))) AS sales_name,
              TRIM(CONCAT(COALESCE(ue.fname,''), ' ', COALESCE(ue.lname,''))) AS engineer_name
       FROM job_data j
       LEFT JOIN customer c ON c.cus_id = j.customer_id
       LEFT JOIN workstatus w ON w.ws_id = j.job_status
       LEFT JOIN user_data us ON us.user_id = j.sale_id
       LEFT JOIN user_data ue ON ue.user_id = j.engeneer_id
       ${where}
       ORDER BY j.job_id DESC
       LIMIT ? OFFSET ?`,
      [...qparams, limit, offset]
    );
    res.json({ ok: true, rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

r.post("/", async (req, res) => {
  try {
    const body = req.body ?? {};
    const customer_id = Number(body.customer_id ?? body.customerId);
    if (!customer_id) {
      return res.status(400).json({ ok: false, message: "ต้องระบุ customer_id (cus_id)" });
    }
    const product_name = String(body.productName ?? body.product_name ?? "").trim();
    if (!product_name) {
      return res.status(400).json({ ok: false, message: "ต้องระบุชื่องาน/สินค้า" });
    }
    const job_po = String(body.customerPO ?? body.job_po ?? "").trim() || "-";
    const profile_id = Number(body.profile_id) || 1;
    const jk = String(body.jobKind ?? "").toLowerCase();
    const explicitWg = Number(body.workgroup_id);
    const workgroup_id =
      explicitWg ||
      (jk === "sale" ? 3 : jk === "repair" ? 7 : 7);
    const sale_id = Number(body.sale_id ?? body.saleId) || 1;
    const engeneer_id = Number(body.engeneer_id) || 1;
    const job_status = stageCodeToWsId(body.currentStageCode ?? body.job_status ?? "N01");
    const user_id = Number(body.user_id) || 1;

    const service_id =
      String(body.serviceNumber ?? body.service_id ?? "").trim() ||
      `MNSERP${Date.now().toString(36).toUpperCase()}`;

    const p = getPool();
    const [[maxNo]] = await p.query(
      "SELECT COALESCE(MAX(job_no), 0) + 1 AS n FROM job_data WHERE profile_id = ?",
      [profile_id]
    );
    const job_no = maxNo?.n ?? 1;

    const normDate = (v) => {
      const t = String(v ?? "").slice(0, 10);
      return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : null;
    };
    const todayStr = new Date().toISOString().slice(0, 10);
    const recive_job = normDate(body.recive_job) ?? todayStr;
    const send_job = normDate(body.send_job ?? body.sendJob) ?? recive_job;

    let info = String(body.info ?? "").trim();
    const companyLabel = String(body.company_label ?? body.companyLabel ?? "").trim();
    if (companyLabel) {
      info = info ? `${companyLabel}\n${info}` : companyLabel;
    }

    const [ins] = await p.query(
      `INSERT INTO job_data (
        profile_id, job_no, customer_id, service_id, product_name, model, brand, sn,
        job_amount, info, recive_job, send_job, job_condition,
        workgroup_id, sale_id, engeneer_id, job_status,
        job_po, job_quotation, job_invoice, job_delivery, img1, img2, public, modified, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), ?)`,
      [
        profile_id,
        job_no,
        customer_id,
        service_id,
        product_name,
        String(body.model ?? "").trim(),
        String(body.brand ?? "").trim(),
        String(body.sn ?? "").trim(),
        Number(body.job_amount ?? body.qty ?? body.quantity) || 0,
        info,
        recive_job,
        send_job,
        String(body.job_condition ?? "").trim(),
        workgroup_id,
        sale_id,
        engeneer_id,
        job_status,
        job_po,
        "",
        "",
        "",
        "",
        "",
        user_id,
      ]
    );
    const job_id = ins.insertId;
    const [rows] = await p.query(
      `SELECT j.job_id, j.service_id, j.product_name, j.job_po, j.job_status, j.modified,
              c.cus_name AS customer_name, w.ws_name
       FROM job_data j
       LEFT JOIN customer c ON c.cus_id = j.customer_id
       LEFT JOIN workstatus w ON w.ws_id = j.job_status
       WHERE j.job_id = ?`,
      [job_id]
    );
    res.status(201).json({ ok: true, row: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

r.patch("/:jobId/stage", async (req, res) => {
  try {
    let raw = String(req.params.jobId ?? "");
    if (raw.startsWith("mns-")) raw = raw.slice(4);
    const jobId = Number(raw);
    const code = String(req.body?.stageCode ?? "").trim();
    if (!jobId || !code) {
      return res.status(400).json({ ok: false, message: "jobId / stageCode" });
    }
    const ws = stageCodeToWsId(code);
    const p = getPool();
    await p.query(
      "UPDATE job_data SET job_status = ?, modified = NOW() WHERE job_id = ?",
      [ws, jobId]
    );
    const [rows] = await p.query(
      `SELECT j.job_id, j.service_id, j.product_name, j.job_po, j.job_status, j.modified,
              c.cus_name AS customer_name, w.ws_name
       FROM job_data j
       LEFT JOIN customer c ON c.cus_id = j.customer_id
       LEFT JOIN workstatus w ON w.ws_id = j.job_status
       WHERE j.job_id = ?`,
      [jobId]
    );
    res.json({ ok: true, row: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

export { wsNameToStageCode };

export default r;
