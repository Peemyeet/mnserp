let ensureOncePromise = null;

const WORKSTATUS_SEED = [
  [1, "N01. รับงาน", "บันทึกข้อมูลงานที่รับเข้าบริษัท", 1, 1, 2],
  [2, "N02. ออกแบบตรวจเช็ค", "หัวหน้าช่างเลือกผู้รับผิดชอบงานนั้น(เลือกช่าง) และช่างที่ได้รับมอบหมายดำเนินการตรวจเช็ค, ออกแบบ, ผลิต", 2, 1, 2],
  [3, "N03. ขอข้อมูลเพิ่มเติมฝ่ายขาย", "ทางช่างขอข้อมูลเพิ่มเติมจาก SALE ในงานที่อาจจะติดปัญหา", 3, 1, 2],
  [4, "N04. หาราคาอะไหล่", "ทางช่างขออะไหล่ กรอกข้อมูลครบถ้วน (หาราคาอะไหล่)", 4, 1, 2],
  [5, "N05. หาราคาเสร็จสิ้น", "หาราคาอะไหล่ครบถ้วนทุกรายการเรียบร้อย", 5, 1, 2],
  [6, "N06. เสนอราคา", "จัดทำเอกสารใบเสนอราคาให้ทางลูกค้าแล้ว", 6, 1, 0],
  [7, "N07. รอ PO ลูกค้า", "เสนอราคาแล้ว รอลูกค้าพิจารณาว่าต้องการซ่อมหรือไม่", 7, 1, 0],
  [8, "N08. PO มาแล้ว", "ลูกค้าอนุมัติซ่อมแล้ว", 8, 1, 0],
  [9, "N09. เปิด PR ", "ขออนุมัติซื้ออะไหล่ ( เอกสาร )", 9, 1, 0],
  [10, "N10. เปิด PO จัดซื้อ", "ได้รับการอนุมัติ PR แล้ว เปิด PO สั่งซื้อสินค้า", 10, 1, 0],
  [11, "N11. รอบัญชีชำระเงิน", "ใส่เลข PO I-money เรียบร้อยแล้ว (รอทางบัญชีทำขั้นตอนการจ่ายเงิน เงินสด, เช็ค, โอน, เครดิต)", 11, 1, 0],
  [12, "N12. รอรับของ(อะไหล่)", "บัญชีชำระเงินเรียบร้อยแล้ว สั่งของกับ Supplier เรียบร้อย", 12, 1, 0],
  [13, "N13. ของมาแล้ว ", "สินค้าที่สั่งกับ Supplier ดำเนินการส่งของแล้ว (Stroe ทำใบรับสินค้า)", 13, 1, 0],
  [14, "N14. ดำเนินการผลิต(อะไหล่มาครบ)", "ช่างได้รับอะไหล่เรียบร้อยแล้ว", 14, 1, 0],
  [15, "N15. ซ่อมเสร็จแล้ว", "ช่างดำเนินการซ่อม ผลิต เรียบร้อย", 15, 1, 0],
  [16, "N16. ส่งของเทส", "ช่างซ่อมเสร็จ Sale นำงานไปเทสให้ลูกค้า (ต้องมีเอกสารใบส่งของอ้างอิง)", 16, 1, 0],
  [17, "N17. รอเก็บเงิน", "ใส่เลขที่เอกสารวางบิลและเลขที่เอกสารใบกำกับภาษี", 17, 1, 0],
  [18, "N18. ปิดงาน", "ใส่เลขที่เอกสารใบเสร็จรับเงิน (จบงาน)", 18, 1, 0],
  [19, "N19. ยกเลิก-คืนงาน", "ลูกค้าไม่ซ่อมหรือถึงกำหนดคืนงาน (ต้องมีเลขที่เอกสารใบส่งของคืนอ้างอิง)", 19, 1, 0],
  [20, "เครม", "ไม่ผ่าน", 20, 1, 0],
];

const WORKGROUP_SEED = [
  [3, "งานขาย", "ซื้อสินค้าและขายออกไป", 1, 1, 0],
  [7, "งานซ่อม", "งานซ่อมทุกชนิด", 3, 1, 2],
  [8, "งานโปรเจค", "COPY และ วิจัย", 4, 1, 19],
  [9, "งานผลิต", "ผลิตสินค้า", 5, 1, 19],
  [10, "งานออกแบบ", "เขียนแบบ", 6, 1, 0],
  [11, "งานสโตร์", "หาอะไหล่เข้าสโตร์ พร้อมขาย", 7, 1, 0],
];

async function ensureWorkstatusTable(p) {
  await p.query(
    `CREATE TABLE IF NOT EXISTS workstatus (
      ws_id INT(11) NOT NULL,
      ws_name VARCHAR(200) NOT NULL,
      info TEXT NOT NULL,
      list SMALLINT NOT NULL DEFAULT 0,
      public INT(11) NOT NULL DEFAULT 1,
      modified DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      user_id INT(11) NOT NULL DEFAULT 0,
      PRIMARY KEY (ws_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  );
  await p.query(
    `INSERT INTO workstatus (ws_id, ws_name, info, list, public, user_id)
     VALUES ?
     ON DUPLICATE KEY UPDATE
       ws_name = VALUES(ws_name),
       info = VALUES(info),
       list = VALUES(list),
       public = VALUES(public),
       user_id = VALUES(user_id)`,
    [WORKSTATUS_SEED]
  );
}

async function ensureWorkgroupTable(p) {
  await p.query(
    `CREATE TABLE IF NOT EXISTS workgroup (
      wg_id INT(11) NOT NULL,
      wg_name VARCHAR(200) NOT NULL,
      info TEXT NOT NULL,
      list SMALLINT NOT NULL DEFAULT 0,
      public INT(11) NOT NULL DEFAULT 1,
      modified DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      user_id INT(11) NOT NULL DEFAULT 0,
      PRIMARY KEY (wg_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  );
  await p.query(
    `INSERT INTO workgroup (wg_id, wg_name, info, list, public, user_id)
     VALUES ?
     ON DUPLICATE KEY UPDATE
       wg_name = VALUES(wg_name),
       info = VALUES(info),
       list = VALUES(list),
       public = VALUES(public),
       user_id = VALUES(user_id)`,
    [WORKGROUP_SEED]
  );
}

export async function ensureLookupTables(p) {
  if (!ensureOncePromise) {
    ensureOncePromise = (async () => {
      await ensureWorkstatusTable(p);
      await ensureWorkgroupTable(p);
    })().catch((e) => {
      ensureOncePromise = null;
      throw e;
    });
  }
  return ensureOncePromise;
}
