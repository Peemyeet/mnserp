export type PurchaseReqStatus =
  | "prod_pending"
  | "prod_doing"
  | "prod_progress"
  | "not_ready"
  | "ready";

export type PurchaseRequirementRow = {
  id: string;
  status: PurchaseReqStatus;
  customerPo: string;
  serviceNo: string;
  jobName: string;
  qtyDone: number;
  qtyTotal: number;
  customerName: string;
  requiredDate: string;
  completionDate: string;
  stockQty: number;
  daysSinceMove: number;
  productionJob: string;
  salesPerson: string;
};

export const PURCHASE_REQUIREMENTS_SEED: PurchaseRequirementRow[] = [
  {
    id: "1",
    status: "prod_pending",
    customerPo: "TH5605-P219948",
    serviceNo: "MG692935 (S)",
    jobName: "Assy, Cable, Pogo Pin",
    qtyDone: 0,
    qtyTotal: 2,
    customerName:
      "Western Digital Storage Technologies (Thailand) Ltd. (สำนักงานใหญ่)",
    requiredDate: "2026-01-31",
    completionDate: "2026-04-06",
    stockQty: 0,
    daysSinceMove: 76,
    productionJob: "",
    salesPerson: "เจริญ ศิลาโสลา",
  },
  {
    id: "2",
    status: "prod_doing",
    customerPo: "6000139271",
    serviceNo: "MS692203 (S)",
    jobName: "COML_PCB, COMPUTER FIFO PCB, Assembly",
    qtyDone: 0,
    qtyTotal: 5,
    customerName: "Seagate Technology (Thailand) Ltd",
    requiredDate: "2026-02-15",
    completionDate: "",
    stockQty: 0,
    daysSinceMove: 82,
    productionJob: "",
    salesPerson: "สมชาย ใจดี",
  },
  {
    id: "3",
    status: "not_ready",
    customerPo: "PO-88421",
    serviceNo: "MS691100 (S)",
    jobName: "Bracket, Mount, CNC",
    qtyDone: 1,
    qtyTotal: 3,
    customerName: "บริษัท ตัวอย่าง จำกัด",
    requiredDate: "2026-03-01",
    completionDate: "2026-04-01",
    stockQty: 2,
    daysSinceMove: 45,
    productionJob: "JOB-P-102",
    salesPerson: "วิภา รุ่งเรือง",
  },
];

export const PURCHASE_REQ_OPEN_COUNT = PURCHASE_REQUIREMENTS_SEED.length;
