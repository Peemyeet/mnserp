import { Router } from "express";
import { getPool } from "../db.mjs";

const r = Router();

const BASE_SELECT = `
  SELECT u.user_id, u.fname, u.lname, u.username, u.phonenumber, u.email,
         u.position, u.loginstatus, u.user_gid, u.public,
         g.group_name AS group_name
  FROM user_data u
  LEFT JOIN user_group g ON g.group_id = u.user_gid
  WHERE u.public = 1
  ORDER BY u.user_id DESC
  LIMIT 2000
`;

const EXT_SELECT = `
  SELECT u.user_id, u.fname, u.lname, u.username, u.phonenumber, u.email,
         u.position, u.loginstatus, u.user_gid, u.public,
         u.nickname, u.employment_status, u.company_display,
         u.sick_leave_days, u.vacation_days, u.sales_target_baht,
         g.group_name AS group_name
  FROM user_data u
  LEFT JOIN user_group g ON g.group_id = u.user_gid
  WHERE u.public = 1
  ORDER BY u.user_id DESC
  LIMIT 2000
`;

function mapRow(row, extended) {
  const loginstatus = Number(row.loginstatus) || 0;
  const employment =
    extended && row.employment_status
      ? String(row.employment_status)
      : loginstatus === 1
        ? "บรรจุ"
        : "ทดลองงาน";
  const nickname =
    extended && row.nickname != null && String(row.nickname).trim() !== ""
      ? String(row.nickname)
      : String(row.username ?? "");
  const company =
    extended && row.company_display != null && String(row.company_display).trim() !== ""
      ? String(row.company_display)
      : "ยังไม่ได้ระบุ";
  return {
    user_id: row.user_id,
    fname: String(row.fname ?? "").trim(),
    lname: String(row.lname ?? "").trim(),
    nickname,
    username: String(row.username ?? ""),
    phonenumber: String(row.phonenumber ?? "").trim(),
    email: String(row.email ?? "").trim(),
    position: String(row.position ?? "").trim(),
    loginstatus,
    employment_status: employment,
    company_display: company,
    sick_leave_days: extended
      ? Math.max(0, Number(row.sick_leave_days) || 0)
      : 0,
    vacation_days: extended
      ? Math.max(0, Number(row.vacation_days) || 0)
      : 0,
    sales_target_baht: extended
      ? Math.max(0, Number(row.sales_target_baht) || 0)
      : 0,
    user_gid: Number(row.user_gid) || 1,
    group_name: row.group_name != null ? String(row.group_name) : "",
  };
}

r.get("/groups", async (_req, res) => {
  try {
    const p = getPool();
    const [rows] = await p.query(
      `SELECT group_id, group_name FROM user_group WHERE public = 1 ORDER BY group_name ASC`
    );
    res.json({ ok: true, rows: rows ?? [] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

r.get("/", async (_req, res) => {
  try {
    const p = getPool();
    let extended = true;
    let raw;
    try {
      const [rows] = await p.query(EXT_SELECT);
      raw = rows;
    } catch (e) {
      if (e.code === "ER_BAD_FIELD_ERROR") {
        extended = false;
        const [rows] = await p.query(BASE_SELECT);
        raw = rows;
      } else {
        throw e;
      }
    }
    const rows = (raw ?? []).map((row) => mapRow(row, extended));
    res.json({ ok: true, rows, extendedColumns: extended });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

r.patch("/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!userId) {
      return res.status(400).json({ ok: false, message: "userId ไม่ถูกต้อง" });
    }
    const body = req.body ?? {};
    const fname = String(body.fname ?? "").trim();
    const lname = String(body.lname ?? "").trim();
    const nickname = String(body.nickname ?? "").trim();
    const phonenumber = String(body.phonenumber ?? "").trim() || "-";
    const position = String(body.position ?? "").trim() || "-";
    const user_gid = Math.max(1, Number(body.user_gid) || 1);
    const employment_status = String(body.employment_status ?? "บรรจุ").trim();
    const loginstatus =
      employment_status === "บรรจุ" || employment_status === "ประจำ" ? 1 : 0;
    const company_display = String(body.company_display ?? "").trim();
    const sick_leave_days = Math.max(0, Number(body.sick_leave_days) || 0);
    const vacation_days = Math.max(0, Number(body.vacation_days) || 0);
    const sales_target_baht = Math.max(
      0,
      Number(body.sales_target_baht ?? body.salesTargetBaht) || 0
    );

    if (!fname || !lname) {
      return res.status(400).json({ ok: false, message: "ต้องระบุชื่อและนามสกุล" });
    }

    const p = getPool();
    const paramsHr = [
      fname,
      lname,
      nickname,
      phonenumber,
      position,
      user_gid,
      employment_status || "ทดลองงาน",
      company_display,
      sick_leave_days,
      vacation_days,
      loginstatus,
      userId,
    ];
    try {
      await p.query(
        `UPDATE user_data SET
           fname = ?, lname = ?, nickname = ?, phonenumber = ?, position = ?, user_gid = ?,
           employment_status = ?, company_display = ?, sick_leave_days = ?, vacation_days = ?,
           sales_target_baht = ?, loginstatus = ?, lastupdate = NOW()
         WHERE user_id = ? AND public = 1`,
        [
          fname,
          lname,
          nickname,
          phonenumber,
          position,
          user_gid,
          employment_status || "ทดลองงาน",
          company_display,
          sick_leave_days,
          vacation_days,
          sales_target_baht,
          loginstatus,
          userId,
        ]
      );
    } catch (e) {
      if (e.code === "ER_BAD_FIELD_ERROR") {
        try {
          await p.query(
            `UPDATE user_data SET
               fname = ?, lname = ?, nickname = ?, phonenumber = ?, position = ?, user_gid = ?,
               employment_status = ?, company_display = ?, sick_leave_days = ?, vacation_days = ?,
               loginstatus = ?, lastupdate = NOW()
             WHERE user_id = ? AND public = 1`,
            paramsHr
          );
        } catch (e2) {
          if (e2.code === "ER_BAD_FIELD_ERROR") {
            await p.query(
              `UPDATE user_data SET
                 fname = ?, lname = ?, phonenumber = ?, position = ?, user_gid = ?,
                 loginstatus = ?, lastupdate = NOW()
               WHERE user_id = ? AND public = 1`,
              [fname, lname, phonenumber, position, user_gid, loginstatus, userId]
            );
          } else {
            throw e2;
          }
        }
      } else {
        throw e;
      }
    }

    const EXT_ONE = `
      SELECT u.user_id, u.fname, u.lname, u.username, u.phonenumber, u.email,
             u.position, u.loginstatus, u.user_gid, u.public,
             u.nickname, u.employment_status, u.company_display,
             u.sick_leave_days, u.vacation_days, u.sales_target_baht,
             g.group_name AS group_name
      FROM user_data u
      LEFT JOIN user_group g ON g.group_id = u.user_gid
      WHERE u.user_id = ? LIMIT 1`;
    const BASE_ONE = `
      SELECT u.user_id, u.fname, u.lname, u.username, u.phonenumber, u.email,
             u.position, u.loginstatus, u.user_gid, u.public,
             g.group_name AS group_name
      FROM user_data u
      LEFT JOIN user_group g ON g.group_id = u.user_gid
      WHERE u.user_id = ? LIMIT 1`;

    let row;
    let extended = true;
    try {
      const [[r]] = await p.query(EXT_ONE, [userId]);
      row = r;
    } catch (e) {
      if (e.code === "ER_BAD_FIELD_ERROR") {
        extended = false;
        const [[r]] = await p.query(BASE_ONE, [userId]);
        row = r;
      } else {
        throw e;
      }
    }

    if (!row) {
      return res.status(404).json({ ok: false, message: "ไม่พบผู้ใช้" });
    }

    res.json({ ok: true, row: mapRow(row, extended) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

r.delete("/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!userId) {
      return res.status(400).json({ ok: false, message: "userId ไม่ถูกต้อง" });
    }
    if (userId === 1) {
      return res
        .status(400)
        .json({ ok: false, message: "ไม่สามารถลบผู้ดูแลระบบหลัก (user_id = 1)" });
    }
    const p = getPool();
    await p.query(`UPDATE user_data SET public = 0, lastupdate = NOW() WHERE user_id = ?`, [
      userId,
    ]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: String(e.message) });
  }
});

export default r;
