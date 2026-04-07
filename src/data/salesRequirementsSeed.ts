/** ตัวอย่างรายการ — ต่อ API จริงได้ภายหลัง */
export type SalesRequirementStatus =
  | "prod_pending"
  | "prod_progress"
  | "manufacturing"
  | "not_ready"
  | "ready";

export type SalesRequirementRow = {
  id: string;
  status: SalesRequirementStatus;
  customerPo: string;
  serviceNo: string;
  jobName: string;
  qtyDone: number;
  qtyTotal: number;
  customerName: string;
  requiredDate: string;
  completionDate: string;
  stockQty: number;
  movedDays: number;
  productionJob: string;
  salesPerson: string;
};

export const SALES_REQUIREMENTS_SEED: SalesRequirementRow[] = [
  {
    id: "1",
    status: "prod_pending",
    customerPo: "TH5605-P219948",
    serviceNo: "MG692935 (S)",
    jobName: "Assy, Cable, Pogo Pin",
    qtyDone: 0,
    qtyTotal: 2,
    customerName: "Western Digital Storage Technologies (Thailand) Ltd.",
    requiredDate: "2026-01-31",
    completionDate: "2026-04-06",
    stockQty: 0,
    movedDays: 76,
    productionJob: "",
    salesPerson: "สมชาย ใจดี",
  },
  {
    id: "2",
    status: "ready",
    customerPo: "TH5606-P220001",
    serviceNo: "MS692203 (S)",
    jobName: "PCB Assembly FIFO",
    qtyDone: 5,
    qtyTotal: 5,
    customerName: "Seagate Technology LLC",
    requiredDate: "2026-03-15",
    completionDate: "2026-04-01",
    stockQty: 12,
    movedDays: 12,
    productionJob: "JOB-9921",
    salesPerson: "สมหญิง รักงาน",
  },
];
