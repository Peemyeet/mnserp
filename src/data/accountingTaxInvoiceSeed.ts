export type TaxInvoiceRow = {
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
  hasAttachment: boolean;
  salesPerson: string;
};

export type DeliveryPendingRow = {
  id: string;
  dayStatus: string;
  deliveryNo: string;
  poNo: string;
  serviceNo: string;
  company: string;
  qty: number;
  deliveryDate: string;
  totalPrice: string;
  tax: string;
  grandTotal: string;
  remark: string;
  salesPerson: string;
};

export const TAX_INVOICE_SAMPLE: TaxInvoiceRow[] = [
  {
    id: "1",
    invoiceNo: "IVS063131",
    date: "2024-06-12",
    poNo: "PO-2024-0891",
    customer: "Seagate Technology (Thailand) Ltd.",
    dueDate: "2024-07-12",
    qty: 120,
    priceAfterDisc: "32,000.00",
    tax: "2,240.00",
    grandTotal: "34,240.00",
    company: "บริษัท มณีบูรณ์ ซัพพลาย จำกัด",
    hasAttachment: false,
    salesPerson: "สมชาย ใจดี",
  },
  {
    id: "2",
    invoiceNo: "IVS063132",
    date: "2024-06-14",
    poNo: "PO-2024-0902",
    customer: "บริษัท อีเลคทรอนิคส์ ซอร์ส จำกัด",
    dueDate: "2024-07-01",
    qty: 48,
    priceAfterDisc: "18,500.00",
    tax: "1,295.00",
    grandTotal: "19,795.00",
    company: "บริษัท มณีบูรณ์ ซัพพลาย จำกัด",
    hasAttachment: true,
    salesPerson: "วิภา รุ่งเรือง",
  },
];

export const DELIVERY_PENDING_SAMPLE: DeliveryPendingRow[] = [
  {
    id: "1",
    dayStatus: "เปิดมาแล้ว : เลยเวลามาแล้ว 1117 วัน",
    deliveryNo: "MNS-TS-66031094",
    poNo: "",
    serviceNo: "MNSGR65112265",
    company: "บริษัท มณีสูรย์ กรุ๊ป จำกัด",
    qty: 4,
    deliveryDate: "2023-03-16",
    totalPrice: "125,000.00",
    tax: "8,750.00",
    grandTotal: "133,750.00",
    remark: "",
    salesPerson: "ประเสริฐ วงศ์ใหญ่",
  },
  {
    id: "2",
    dayStatus: "เปิดมาแล้ว : 45 วัน",
    deliveryNo: "MNS-TS-66031102",
    poNo: "PO-66021",
    serviceNo: "MNSGR65113001",
    company: "บริษัท เทคโนโลยี เอ็มเอ็นเอส จำกัด",
    qty: 2,
    deliveryDate: "2024-05-01",
    totalPrice: "42,300.00",
    tax: "2,961.00",
    grandTotal: "45,261.00",
    remark: "",
    salesPerson: "นภา สุขใจ",
  },
];
