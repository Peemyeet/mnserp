import { Router } from "express";
import { getPool } from "../db.mjs";

const r = Router();

r.get("/", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 500, 2000);
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const p = getPool();
    const [rows] = await p.query(
      `SELECT cus_id, cus_code, cus_name, cus_contact, cus_tel, contact_tel,
              cus_info, modified, user_id, public
       FROM customer
       ORDER BY cus_id DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
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
    const cus_name = String(body.companyName ?? body.cus_name ?? "").trim();
    if (!cus_name) {
      return res.status(400).json({ ok: false, message: "ต้องระบุชื่อลูกค้า" });
    }
    const cus_contact = String(body.contactName ?? body.cus_contact ?? "").trim();
    const phone = String(body.phone ?? body.cus_tel ?? "").trim();
    const cus_info = String(body.detailNote ?? body.cus_info ?? "").trim();
    const user_id = Number(body.user_id) || 1;

    const y = new Date().getFullYear();
    const stamp = String(Date.now()).slice(-6);
    const cus_code = `C-ERP-${y}-${stamp}`;

    const p = getPool();
    const [ins] = await p.query(
      `INSERT INTO customer (
        cus_code, cus_name, cus_address, cus_umpher, cus_province, cus_zipcode,
        cus_tel, cus_fax, cus_tax, cus_contact, contact_tel, contact_email,
        cus_info, public, modified, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), ?)`,
      [
        cus_code,
        cus_name,
        String(body.cus_address ?? "-").trim(),
        String(body.cus_umpher ?? "-").trim(),
        Number(body.cus_province) || 10,
        String(body.cus_zipcode ?? "10110").trim(),
        phone || "-",
        String(body.cus_fax ?? "-").trim(),
        String(body.cus_tax ?? "-").trim(),
        cus_contact,
        phone,
        String(body.contact_email ?? "").trim(),
        cus_info,
        user_id,
      ]
    );
    const cus_id = ins.insertId;
    const [rows] = await p.query(
      `SELECT cus_id, cus_code, cus_name, cus_contact, cus_tel, contact_tel, cus_info, modified, user_id
       FROM customer WHERE cus_id = ?`,
      [cus_id]
    );
    res.status(201).json({ ok: true, row: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

export default r;
