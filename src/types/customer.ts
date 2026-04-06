export type Customer = {
  id: string;
  customerCode: string;
  companyName: string;
  contactName: string;
  phone: string;
  salesPersonName: string;
  customerType: string;
  region: string;
  frequency: number;
  grade: string;
  detailNote?: string;
};

/** ฟอร์มเพิ่มลูกค้า — ระบบสร้างรหัสลูกค้าให้อัตโนมัติ */
export type CustomerInput = {
  companyName: string;
  contactName: string;
  phone: string;
  salesPersonName: string;
  customerType: string;
  region: string;
  grade?: string;
  frequency?: number;
  detailNote?: string;
};
