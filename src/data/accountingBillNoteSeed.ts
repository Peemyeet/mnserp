/** แท็บ: รายการที่ค้างอยู่ (ใบกำกับภาษี) — รอทำใบวางบิล */
export type BillNotePendingInvoiceRow = {
  id: string;
  invoiceNo: string;
  date: string;
  poNo: string;
  customer: string;
  dueDate: string;
  qty: number;
  priceAfterDisc: string;
  tax: string;
  grandTotal: string;
  company: string;
};

/** แท็บ: ใบวางบิล */
export type BillNoteListRow = {
  id: string;
  billNo: string;
  date: string;
  customer: string;
  dueDate: string;
  qty: number;
  grandTotal: string;
  company: string;
  hasAttachment: boolean;
  salesPerson: string;
};

/** แถวว่างตัวอย่าง (ทุกช่องเป็น —) */
export const BILL_NOTE_PENDING_PLACEHOLDER: BillNotePendingInvoiceRow[] = [
  {
    id: "p1",
    invoiceNo: "—",
    date: "—",
    poNo: "—",
    customer: "—",
    dueDate: "—",
    qty: 0,
    priceAfterDisc: "—",
    tax: "—",
    grandTotal: "—",
    company: "—",
  },
];

export const BILL_NOTE_LIST_SAMPLE: BillNoteListRow[] = [
  {
    id: "1",
    billNo: "BLG063195",
    date: "2024-06-10",
    customer: "Seagate Technology (Thailand) Ltd.",
    dueDate: "2024-07-10",
    qty: 3,
    grandTotal: "25,894.00",
    company: "บริษัท มณีบูรณ์ ซัพพลาย จำกัด",
    hasAttachment: false,
    salesPerson: "สมชาย ใจดี",
  },
  {
    id: "2",
    billNo: "BLG063196",
    date: "2024-06-11",
    customer: "บริษัท อีเลคทรอนิคส์ ซอร์ส จำกัด",
    dueDate: "2024-06-25",
    qty: 12,
    grandTotal: "182,400.00",
    company: "บริษัท มณีบูรณ์ ซัพพลาย จำกัด",
    hasAttachment: true,
    salesPerson: "วิภา รุ่งเรือง",
  },
];
