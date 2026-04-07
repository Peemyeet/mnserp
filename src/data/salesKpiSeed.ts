/** ตัวอย่าง KPI รายคน — ต่อ API จริงได้ภายหลัง */
export type SalesPersonKpiRow = {
  id: string;
  /** ผูกกับ `PmUser.id` จากระบบล็อกอิน */
  linkedUserId: string;
  name: string;
  /** เป้าหมาย บาท */
  targetBaht: number;
  /** ยอดที่ทำได้แล้ว บาท */
  actualBaht: number;
};

export const SALES_KPI_SEED: SalesPersonKpiRow[] = [
  {
    id: "1",
    linkedUserId: "pm-u-2",
    name: "พนักงานขาย",
    targetBaht: 2_500_000,
    actualBaht: 2_650_000,
  },
  {
    id: "2",
    linkedUserId: "pm-u-7",
    name: "สมหญิง รักงาน",
    targetBaht: 1_800_000,
    actualBaht: 1_440_000,
  },
  {
    id: "3",
    linkedUserId: "pm-u-8",
    name: "วิชัย ขยัน",
    targetBaht: 3_000_000,
    actualBaht: 2_970_000,
  },
  {
    id: "4",
    linkedUserId: "pm-u-9",
    name: "นภา สดใส",
    targetBaht: 1_200_000,
    actualBaht: 890_000,
  },
];
