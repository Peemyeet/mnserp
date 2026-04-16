/** ประเภทแถว KPI — ข้อมูลจริงมาจาก GET /api/reports/sales เท่านั้น */
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

export const SALES_KPI_SEED: SalesPersonKpiRow[] = [];
