/** เอกสารภายใต้ อนุมัติรายการจ่าย — เรียง 1–5 ตามที่กำหนด */
export type ApprovalDocKind =
  | "pr-no-job"
  | "leave"
  | "vehicle"
  | "audit-payment"
  | "create-po";

export const APPROVAL_DOC_CATEGORIES: {
  id: ApprovalDocKind;
  order: number;
  labelTh: string;
  labelEn: string;
  /** gradient การ์ด — badge ใช้เฉพาะหน้าเอกสาร (สร้าง); จำนวนรออนุมัติมาจาก API */
  cardClass: string;
  badge: number;
}[] = [
  {
    id: "pr-no-job",
    order: 1,
    labelTh: "รายการ PR ไม่มี JOB",
    labelEn: "PR without JOB",
    cardClass: "from-teal-500 to-teal-600",
    badge: 0,
  },
  {
    id: "leave",
    order: 2,
    labelTh: "ใบลา",
    labelEn: "Leave",
    cardClass: "from-amber-400 to-orange-500",
    badge: 0,
  },
  {
    id: "vehicle",
    order: 3,
    labelTh: "ใบเบิกรถ",
    labelEn: "Vehicle request",
    cardClass: "from-rose-500 to-red-600",
    badge: 0,
  },
  {
    id: "audit-payment",
    order: 4,
    labelTh: "ตรวจสอบรายการจ่าย",
    labelEn: "Check payment items",
    cardClass: "from-violet-500 to-purple-600",
    badge: 0,
  },
  {
    id: "create-po",
    order: 5,
    labelTh: "ทำใบสั่งซื้อ",
    labelEn: "Create purchase order",
    cardClass: "from-indigo-500 to-blue-600",
    badge: 0,
  },
];
