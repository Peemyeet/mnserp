/** คำอธิบายขั้นตอน — ไม่มีตัวเลข (นับจากงานในระบบจริง) */
export type WorkflowStageMeta = {
  code: string;
  title: string;
  description: string;
};

export const workflowStageDefinitions: WorkflowStageMeta[] = [
  {
    code: "N01",
    title: "รับงาน",
    description: "บันทึกข้อมูลงานที่เข้ามา",
  },
  {
    code: "N02",
    title: "ออกแบบตรวจเช็ค",
    description: "หัวหน้าช่างมอบหมายงานตรวจสอบ ออกแบบ หรือผลิต",
  },
  {
    code: "N03",
    title: "ขอข้อมูลเพิ่มเติมฝ่ายขาย",
    description: "ช่างขอรายละเอียดเพิ่มจากฝ่ายขาย",
  },
  { code: "N04", title: "หาราคาอะไหล่", description: "ขอและกรอกราคาอะไหล่" },
  {
    code: "N05",
    title: "หาราคาเสร็จสิ้น",
    description: "รวบรวมราคาอะไหล่ครบแล้ว",
  },
  {
    code: "N06",
    title: "รอเสนอราคา",
    description: "เตรียมเอกสารใบเสนอราคาให้ลูกค้า",
  },
  {
    code: "N07",
    title: "รอ PO ลูกค้า",
    description: "ส่งใบเสนอราคาแล้ว รอลูกค้าอนุมัติ/PO",
  },
  {
    code: "N08",
    title: "PO มาแล้ว",
    description: "ลูกค้าอนุมัติซ่อม/งานแล้ว",
  },
  {
    code: "N09",
    title: "เปิด PR",
    description: "ขออนุมัติซื้ออะไหล่ (ใบขอซื้อ)",
  },
  {
    code: "N10",
    title: "เปิด PO จัดซื้อ",
    description: "PR อนุมัติแล้ว เปิด PO สั่งซื้อสินค้า",
  },
  {
    code: "N11",
    title: "รอบัญชีชำระเงิน",
    description:
      "กรอกเลข PO / I-money แล้ว รอบัญชีชำระ (เงินสด เช็ค โอน เครดิต)",
  },
  {
    code: "N12",
    title: "รอรับของ (อะไหล่)",
    description: "ชำระเงินแล้ว สั่งจากซัพพลายเออร์ รอของเข้า",
  },
  {
    code: "N13",
    title: "ของมาแล้ว",
    description: "ซัพพลายส่งของแล้ว คลังรับของ ช่างเบิกได้",
  },
  {
    code: "N14",
    title: "ดำเนินการผลิต (อะไหล่มาครบ)",
    description: "ช่างได้รับอะไหล่ครบแล้ว กำลังดำเนินการ",
  },
  {
    code: "N15",
    title: "ซ่อมเสร็จแล้ว",
    description: "ช่างซ่อม/ผลิตเสร็จแล้ว",
  },
  {
    code: "N16",
    title: "ส่งของเทส",
    description: "ฝ่ายขายนำงานไปทดสอบให้ลูกค้า (อ้างอิงใบส่งของ)",
  },
  {
    code: "N17",
    title: "รอเก็บเงิน",
    description: "กรอกเลขบิลและใบกำกับภาษี",
  },
  {
    code: "N17.1",
    title: "เก็บเงินเรียบร้อย",
    description: "เก็บเงินเรียบร้อย",
  },
  { code: "WH", title: "เข้าคลัง", description: "เก็บของเข้าคลัง" },
  {
    code: "N18",
    title: "ปิดงาน",
    description: "กรอกเลขใบเสร็จ (งานสิ้นสุด)",
  },
  {
    code: "N19",
    title: "ยกเลิก-คืนงาน",
    description: "ลูกค้าไม่ซ่อมหรือครบกำหนด (อ้างอิงใบส่งคืน)",
  },
  { code: "CL", title: "เคลม", description: "สถานะแจ้งเคลม" },
  { code: "N16.1", title: "ทดสอบไม่ผ่าน", description: "ผลทดสอบไม่ผ่าน" },
  { code: "N16.2", title: "ทดสอบผ่าน", description: "ผลทดสอบผ่าน" },
];

const stageByCode = new Map(
  workflowStageDefinitions.map((s) => [s.code, s])
);

export function getStageMeta(code: string): WorkflowStageMeta | undefined {
  return stageByCode.get(code);
}
