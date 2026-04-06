/** วางบิลแล้ว (รอเก็บเงิน) — ยังไม่เลยกำหนด / รอเก็บ */
export type BilledWaitingReceiptRow = {
  id: string;
  billNo: string;
  date: string;
  customer: string;
  dueDate: string;
  qty: number;
  grandTotal: string;
  company: string;
  remark: string;
};

/** แท็บใบเสร็จรับเงิน */
export type CashReceiptRow = {
  id: string;
  receiptNo: string;
  date: string;
  customer: string;
  billNoteNo: string;
  dueDate: string;
  qty: number;
  totalPrice: string;
  totalDiscount: string;
  priceAfterDisc: string;
  tax: string;
  grandTotal: string;
  company: string;
  hasAttachment: boolean;
  salesPerson: string;
};

export const BILLED_WAITING_NOT_DUE_SAMPLE: BilledWaitingReceiptRow[] = [
  {
    id: "1",
    billNo: "BLG-6900004",
    date: "2026-02-02",
    customer: "Western Digital Storage Technologies (Thailand) Ltd.",
    dueDate: "2026-05-05",
    qty: 1,
    grandTotal: "16,500.00",
    company: "บริษัท มนต์สุรีย์ กรุ๊ป จำกัด",
    remark: "",
  },
  {
    id: "2",
    billNo: "BLS-6900001",
    date: "2026-02-10",
    customer: "Seagate Technology (Thailand) Ltd.",
    dueDate: "2026-05-19",
    qty: 5,
    grandTotal: "280,000.00",
    company: "บริษัท มนต์สุรีย์ กรุ๊ป จำกัด",
    remark: "",
  },
  {
    id: "3",
    billNo: "BLG-6900012",
    date: "2026-02-15",
    customer: "บริษัท เทคโนโลยี เอ็มเอ็นเอส จำกัด",
    dueDate: "2026-06-01",
    qty: 4,
    grandTotal: "42,800.00",
    company: "บริษัท มนต์สุรีย์ กรุ๊ป จำกัด",
    remark: "",
  },
  {
    id: "4",
    billNo: "BLG-6900020",
    date: "2026-03-01",
    customer: "Western Digital Storage Technologies (Thailand) Ltd.",
    dueDate: "2026-06-15",
    qty: 2,
    grandTotal: "95,200.00",
    company: "บริษัท มนต์สุรีย์ กรุ๊ป จำกัด",
    remark: "",
  },
  {
    id: "5",
    billNo: "BLG-6500100",
    date: "2025-08-01",
    customer: "บริษัท ตัวอย่าง ค้างเก็บ จำกัด",
    dueDate: "2025-10-01",
    qty: 1,
    grandTotal: "12,000.00",
    company: "บริษัท มนต์สุรีย์ กรุ๊ป จำกัด",
    remark: "",
  },
];

export const CASH_RECEIPT_SAMPLE: CashReceiptRow[] = [
  {
    id: "r1",
    receiptNo: "RE6063176",
    date: "2026-03-08",
    customer: "Seagate Technology (Thailand) Ltd.",
    billNoteNo: "BL6063205",
    dueDate: "0000-00-00",
    qty: 2,
    totalPrice: "50,000.00",
    totalDiscount: "0.00",
    priceAfterDisc: "50,000.00",
    tax: "3,500.00",
    grandTotal: "53,500.00",
    company: "บริษัท มณีบูรณ์ ซัพพลาย จำกัด",
    hasAttachment: false,
    salesPerson: "สมชาย ใจดี",
  },
  {
    id: "r2",
    receiptNo: "RE6063177",
    date: "2026-03-09",
    customer: "Western Digital Storage Technologies (Thailand) Ltd.",
    billNoteNo: "IV6063252",
    dueDate: "0000-00-00",
    qty: 1,
    totalPrice: "128,000.00",
    totalDiscount: "2,000.00",
    priceAfterDisc: "126,000.00",
    tax: "8,820.00",
    grandTotal: "134,820.00",
    company: "บริษัท มณีบูรณ์ ซัพพลาย จำกัด",
    hasAttachment: true,
    salesPerson: "วิภา รุ่งเรือง",
  },
];
