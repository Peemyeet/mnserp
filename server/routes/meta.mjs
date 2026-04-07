import { Router } from "express";
import { getPool } from "../db.mjs";

const r = Router();

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

export default r;
