import { Router } from "express";
import { getPool } from "../db.mjs";

const r = Router();

function norm(s) {
  return String(s ?? "").trim().toLowerCase();
}

function inferRoleAndDept(row) {
  const group = norm(row.group_name);
  const position = norm(row.position);
  const isAdmin =
    Number(row.admin ?? 0) === 1 ||
    Number(row.user_id ?? 0) === 1 ||
    group.includes("admin") ||
    group.includes("ผู้ดูแลระบบ");
  if (isAdmin) return { roleCode: "ADMIN", departmentCode: "HQ" };

  if (
    group.includes("บัญชี") ||
    group.includes("การเงิน") ||
    position.includes("บัญชี") ||
    position.includes("การเงิน")
  ) {
    return { roleCode: "ACCOUNTING", departmentCode: "ACCOUNTING" };
  }
  if (
    group.includes("จัดหา") ||
    group.includes("จัดซื้อ") ||
    group.includes("buyer") ||
    position.includes("จัดหา") ||
    position.includes("จัดซื้อ")
  ) {
    return { roleCode: "PURCHASE", departmentCode: "PURCHASE" };
  }
  if (
    group.includes("ผลิต") ||
    group.includes("ซ่อม") ||
    group.includes("ช่าง") ||
    position.includes("ผลิต") ||
    position.includes("ซ่อม") ||
    position.includes("ช่าง")
  ) {
    return { roleCode: "PRODUCTION", departmentCode: "PRODUCTION" };
  }
  if (
    group.includes("ขาย") ||
    group.includes("sale") ||
    position.includes("ขาย") ||
    position.includes("sale")
  ) {
    return { roleCode: "SALES", departmentCode: "SALES" };
  }
  return { roleCode: null, departmentCode: null };
}

r.post("/login", async (req, res) => {
  try {
    const username = String(req.body?.username ?? "").trim();
    const password = String(req.body?.password ?? "");
    if (!username || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "ต้องระบุ username และ password" });
    }

    const p = getPool();
    const [[row]] = await p.query(
      `SELECT u.user_id, u.username, u.password, u.fname, u.lname, u.email,
              u.position, u.user_gid, u.admin, g.group_name
       FROM user_data u
       LEFT JOIN user_group g ON g.group_id = u.user_gid
       WHERE LOWER(u.username) = LOWER(?) AND u.public = 1
       LIMIT 1`,
      [username]
    );

    if (!row) {
      return res
        .status(401)
        .json({ ok: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    // legacy MNS เก็บรหัสผ่านใน user_data.password
    if (String(row.password ?? "") !== password) {
      return res
        .status(401)
        .json({ ok: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    const fullName = `${String(row.fname ?? "").trim()} ${String(
      row.lname ?? ""
    ).trim()}`.trim();
    const inferred = inferRoleAndDept(row);

    res.json({
      ok: true,
      user: {
        id: String(row.user_id),
        pmUserId: String(row.user_id),
        username: String(row.username ?? username),
        displayNameTh: fullName || String(row.username ?? username),
        email: row.email != null ? String(row.email) : null,
        roleCode: inferred.roleCode,
        departmentCode: inferred.departmentCode,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

export default r;
