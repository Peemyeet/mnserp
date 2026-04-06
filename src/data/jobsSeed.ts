import type { Job } from "../types/job";

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/** ข้อมูลตัวอย่าง — งานจริงเพิ่มได้ที่หน้าฝ่ายขาย */
export function createSeedJobs(): Job[] {
  const rows: Omit<Job, "id" | "enteredStageAt">[] = [
    {
      serviceNumber: "SV-2026-00421",
      jobName: "ซ่อมไดรฟ์มอเตอร์ 75kW",
      customerName: "บริษัท เอ็ม เอ็น เอส จำกัด",
      customerPO: "PO-MNS-10492",
      currentStageCode: "N01",
    },
    {
      serviceNumber: "SV-2026-00422",
      jobName: "ตรวจเช็คเพลาและลูกปืน",
      customerName: "หจก. พี แอนด์ เอส",
      customerPO: "-",
      currentStageCode: "N02",
    },
    {
      serviceNumber: "SV-2026-00408",
      jobName: "ประกอบชุดอินเวอร์เตอร์",
      customerName: "บริษัท เทคโนโลยีล้ำยุค",
      customerPO: "PO-TK-8821",
      currentStageCode: "N05",
    },
    {
      serviceNumber: "SV-2026-00391",
      jobName: "เสนอราคาซ่อมหม้อแปลง",
      customerName: "โรงงานน้ำตาลภาคกลาง",
      customerPO: "-",
      currentStageCode: "N07",
    },
    {
      serviceNumber: "SV-2026-00388",
      jobName: "รับงานติดตั้งเซนเซอร์",
      customerName: "บริษัท ออโต้พาร์ท จำกัด",
      customerPO: "PO-AP-2201",
      currentStageCode: "N08",
    },
    {
      serviceNumber: "SV-2026-00370",
      jobName: "ขออนุมัติซื้ออะไหล่ชุดซีล",
      customerName: "บริษัท ซี.เอ็น.ซี. จำกัด",
      customerPO: "PO-CNC-7712",
      currentStageCode: "N09",
    },
    {
      serviceNumber: "SV-2026-00355",
      jobName: "ผลิตชิ้นส่วนสแตนเลส",
      customerName: "หจก. สยามชลประทาน",
      customerPO: "PO-SC-0098",
      currentStageCode: "N14",
    },
    {
      serviceNumber: "SV-2026-00340",
      jobName: "ซ่อมมอเตอร์พร้อมส่งมอบ",
      customerName: "บริษัท วี.ไอ.พี. จำกัด",
      customerPO: "PO-VIP-3310",
      currentStageCode: "N15",
    },
    {
      serviceNumber: "SV-2026-00322",
      jobName: "ออกบิลงานซ่อมปั๊ม",
      customerName: "บริษัท น้ำดี จำกัด",
      customerPO: "PO-ND-1203",
      currentStageCode: "N17",
    },
    {
      serviceNumber: "SV-2026-00290",
      jobName: "เก็บเงินงานซ่อมเกียร์",
      customerName: "บริษัท ล้านนา อินดัสทรี",
      customerPO: "PO-LN-8844",
      currentStageCode: "N17.1",
    },
    {
      serviceNumber: "SV-2026-00271",
      jobName: "ปิดงานตรวจรับมอเตอร์",
      customerName: "บริษัท เอเชีย เพาเวอร์",
      customerPO: "PO-APW-5566",
      currentStageCode: "N18",
    },
    {
      serviceNumber: "SV-2026-00250",
      jobName: "ลูกค้าไม่ซ่อม — คืนชิ้นส่วน",
      customerName: "หจก. เมืองทอง",
      customerPO: "-",
      currentStageCode: "N19",
    },
    {
      serviceNumber: "SV-2026-00233",
      jobName: "ทดสอบผ่าน — ส่งมอบลูกค้า",
      customerName: "บริษัท ไทย มีทอล",
      customerPO: "PO-TM-4410",
      currentStageCode: "N16.2",
    },
  ];

  return rows.map((r, i) => ({
    ...r,
    id: `job-${i + 1}`,
    enteredStageAt: daysAgoIso((i % 5) + 1),
  }));
}
