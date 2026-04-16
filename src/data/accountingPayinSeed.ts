/** แท็บ รายการที่ค้างอยู่ (ใบเสร็จรับเงิน) */
export type PayinPendingRow = {
  id: string;
  receiptNo: string;
  date: string;
  customer: string;
  billNo: string;
  dueDate: string;
  qty: number;
  totalPrice: string;
  totalDiscount: string;
  priceAfterDisc: string;
  tax: string;
  grandTotal: string;
  company: string;
  note: string;
};

/** แท็บ ใบยืนยันการรับเงิน */
export type PayinConfirmRow = {
  id: string;
  payInNo: string;
  date: string;
  customer: string;
  qty: number;
  totalPrice: string;
  totalDiscount: string;
  priceAfterDisc: string;
  tax: string;
  grandTotal: string;
  company: string;
  /** แสดงสถานะปุ่มยืนยัน */
  confirmed: boolean;
};

/** แท็บ รับเงินเรียบร้อย */
export type PayinDoneRow = {
  id: string;
  payInNo: string;
  date: string;
  customer: string;
  qty: number;
  totalPrice: string;
  totalDiscount: string;
  priceAfterDisc: string;
  tax: string;
  grandTotal: string;
  actualReceived: string;
  company: string;
  withholdingFile: string;
  hasAttachment: boolean;
};

/** ตัวอย่างแถวว่าง — ตารางโชว์โครงสร้างเหมือนสกรีนช็อต */
export const PAYIN_PENDING_SAMPLE: PayinPendingRow[] = [
  {
    id: "p0",
    receiptNo: "—",
    date: "—",
    customer: "—",
    billNo: "—",
    dueDate: "—",
    qty: 0,
    totalPrice: "—",
    totalDiscount: "—",
    priceAfterDisc: "—",
    tax: "—",
    grandTotal: "—",
    company: "—",
    note: "",
  },
];

export const PAYIN_CONFIRM_SAMPLE: PayinConfirmRow[] = [
  {
    id: "c0",
    payInNo: "—",
    date: "—",
    customer: "—",
    qty: 0,
    totalPrice: "—",
    totalDiscount: "—",
    priceAfterDisc: "—",
    tax: "—",
    grandTotal: "—",
    company: "—",
    confirmed: false,
  },
];

export const PAYIN_DONE_SAMPLE: PayinDoneRow[] = [
  {
    id: "d1",
    payInNo: "REG063157",
    date: "2021-10-16",
    customer: "บริษัท ดับเบิล ยูพี โซลูชั่น จำกัด (สำนักงานใหญ่)",
    qty: 1,
    totalPrice: "3,000.00",
    totalDiscount: "0.00",
    priceAfterDisc: "3,000.00",
    tax: "210.00",
    grandTotal: "3,210.00",
    actualReceived: "3,210.00",
    company: "บริษัท มณีสถิตย์ กรุ๊ป จำกัด",
    withholdingFile: "ไม่มีไฟล์แนบ",
    hasAttachment: false,
  },
];
