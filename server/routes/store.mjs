import { Router } from "express";
import { getPool } from "../db.mjs";

const r = Router();

/** แยกมุมมองคลังจากหมวด store_category (legacy) */
const WAREHOUSE_KIND = new Set(["spare", "production", "sales"]);

function parseLimit(raw) {
  const n = parseInt(String(raw ?? ""), 10);
  if (Number.isNaN(n) || n < 1) return 400;
  return Math.min(n, 2000);
}

/**
 * GET /api/store/items?warehouse=spare|production|sales&limit=500
 * ดึง store_data + ชื่อหมวด — spare=หมวดอะไหล่/อุปกรณ์, sales=หมวดพร้อมขาย, production=แผ่น PCB รอผลิต
 */
r.get("/items", async (req, res) => {
  const kind = String(req.query.warehouse ?? "spare").toLowerCase();
  if (!WAREHOUSE_KIND.has(kind)) {
    return res.status(400).json({
      ok: false,
      message: "warehouse ต้องเป็น spare | production | sales",
    });
  }
  const limit = parseLimit(req.query.limit);

  let categoryFilter = "";
  if (kind === "sales") {
    categoryFilter = "AND s.category = 67";
  } else if (kind === "production") {
    categoryFilter = "AND s.category = 71";
  } else {
    categoryFilter = "AND s.category NOT IN (67, 71, 75)";
  }

  try {
    const p = getPool();
    const [rows] = await p.query(
      `SELECT s.s_id, s.category, s.s_store, s.s_locker, s.s_floor, s.s_box, s.s_no,
              s.s_name, s.s_model, s.s_brand, s.coach, s.info, s.s_num, s.s_unit, s.s_price,
              s.modified,
              c.category_name AS category_name,
              pc.category_name AS parent_category_name
       FROM store_data s
       LEFT JOIN store_category c ON c.category_id = s.category
       LEFT JOIN store_category pc ON pc.category_id = c.parent
       WHERE s.public = 1
         ${categoryFilter}
       ORDER BY s.s_id DESC
       LIMIT ?`,
      [limit]
    );

    const spareRows = (rows ?? []).map((row) => {
      const loc = [row.s_store, row.s_locker, row.s_floor, row.s_box]
        .map((x) => String(x ?? "").trim())
        .filter(Boolean)
        .join(" / ");
      return {
        id: String(row.s_id),
        mnsPartNo: String(row.s_no ?? "").trim(),
        partNo: String(row.s_model ?? "").trim(),
        description: String(row.s_name ?? "").trim(),
        qty: Number(row.s_num) || 0,
        location: loc || "—",
        category: String(row.category_name ?? "").trim() || `หมวด ${row.category}`,
        subCategory: String(row.parent_category_name ?? "").trim() || "—",
      };
    });

    const stockRows = (rows ?? []).map((row) => {
      const loc = [row.s_store, row.s_locker, row.s_floor, row.s_box]
        .map((x) => String(x ?? "").trim())
        .filter(Boolean)
        .join(" / ");
      const coach = String(row.coach ?? "").trim();
      const info = String(row.info ?? "").trim();
      return {
        id: String(row.s_id),
        mnsPartNo: String(row.s_no ?? "").trim(),
        partNo: String(row.s_model ?? "").trim() || String(row.s_name ?? "").trim(),
        description: String(row.s_name ?? "").trim(),
        partNoWd: "",
        partNoSeagate: String(row.s_brand ?? "").trim(),
        qty: Number(row.s_num) || 0,
        remark: coach || info.slice(0, 200),
        processingQty: 0,
        location: loc || "—",
      };
    });

    res.json({
      ok: true,
      warehouse: kind,
      count: kind === "spare" ? spareRows.length : stockRows.length,
      spareParts: kind === "spare" ? spareRows : undefined,
      stockParts: kind !== "spare" ? stockRows : undefined,
    });
  } catch (e) {
    console.error("store/items", e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

function defaultCategoryForKind(kind) {
  if (kind === "sales") return 67;
  if (kind === "production") return 71;
  return 63;
}

/**
 * GET /api/store/categories?warehouse=spare|production|sales
 */
r.get("/categories", async (req, res) => {
  const kind = String(req.query.warehouse ?? "spare").toLowerCase();
  if (!WAREHOUSE_KIND.has(kind)) {
    return res.status(400).json({
      ok: false,
      message: "warehouse ต้องเป็น spare | production | sales",
    });
  }
  let where = "public = 1";
  if (kind === "sales") where += " AND category_id = 67";
  else if (kind === "production") where += " AND category_id = 71";
  else where += " AND category_id NOT IN (67, 71, 75)";

  try {
    const p = getPool();
    const [rows] = await p.query(
      `SELECT category_id AS id, category_name AS name, parent AS parent_id
       FROM store_category
       WHERE ${where}
       ORDER BY category_name ASC
       LIMIT 500`
    );
    res.json({ ok: true, rows: rows ?? [] });
  } catch (e) {
    console.error("store/categories", e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

/**
 * POST /api/store/items
 * body: { warehouse, categoryId?, partNo (s_no), name (s_name), model?, qty?, store?, locker?, floor?, box?, info? }
 */
r.post("/items", async (req, res) => {
  const kind = String(req.body?.warehouse ?? "spare").toLowerCase();
  if (!WAREHOUSE_KIND.has(kind)) {
    return res.status(400).json({
      ok: false,
      message: "warehouse ต้องเป็น spare | production | sales",
    });
  }

  let categoryId = parseInt(String(req.body?.categoryId ?? ""), 10);
  if (Number.isNaN(categoryId) || categoryId <= 0) {
    categoryId = defaultCategoryForKind(kind);
  }

  const s_no = String(req.body?.partNo ?? "").trim();
  const s_name = String(req.body?.name ?? "").trim();
  if (!s_no || !s_name) {
    return res.status(400).json({
      ok: false,
      message: "ต้องระบุรหัสสินค้า (partNo) และชื่อ (name)",
    });
  }

  const s_model = String(req.body?.model ?? "").trim();
  const s_num = Math.max(0, parseInt(String(req.body?.qty ?? 0), 10) || 0);
  const s_store = String(req.body?.store ?? "").trim();
  const s_locker = String(req.body?.locker ?? "").trim();
  const s_floor = String(req.body?.floor ?? "").trim();
  const s_box = String(req.body?.box ?? "").trim();
  const info = String(req.body?.info ?? "").trim();

  const userId = parseInt(String(process.env.MNS_STORE_USER_ID ?? "1"), 10) || 1;

  try {
    const p = getPool();
    const [[mx]] = await p.query(
      `SELECT COALESCE(MAX(s_id), 0) + 1 AS next_id FROM store_data`
    );
    const nextId = Number(mx?.next_id) || 1;

    const [[dup]] = await p.query(`SELECT COUNT(*) AS c FROM store_data WHERE s_no = ?`, [
      s_no,
    ]);
    if (Number(dup?.c) > 0) {
      return res.status(409).json({
        ok: false,
        message: `รหัส ${s_no} มีใน store_data แล้ว`,
      });
    }

    await p.query(
      `INSERT INTO store_data (
        s_id, category, s_store, s_locker, s_floor, s_box, s_no, s_name, s_sn, s_model, s_brand,
        coach, info, s_num, s_unit, s_price, s_market, s_img, public, modified, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', ?, '', '', ?, ?, '', 0, 0, '', 1, NOW(), ?)`,
      [
        nextId,
        categoryId,
        s_store,
        s_locker,
        s_floor,
        s_box,
        s_no,
        s_name,
        s_model,
        info,
        s_num,
        userId,
      ]
    );

    res.json({ ok: true, s_id: nextId, message: "บันทึกรายการคลังแล้ว" });
  } catch (e) {
    console.error("store/items POST", e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

export default r;
