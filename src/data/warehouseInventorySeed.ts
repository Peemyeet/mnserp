/** ประเภทแถวคลัง — ข้อมูลมาจาก GET /api/store/items เท่านั้น */
export type SparePartRow = {
  id: string;
  mnsPartNo: string;
  partNo: string;
  description: string;
  qty: number;
  location: string;
  category: string;
  subCategory: string;
};

export type StockPartRow = {
  id: string;
  mnsPartNo: string;
  partNo: string;
  description: string;
  partNoWd: string;
  partNoSeagate: string;
  qty: number;
  remark: string;
  processingQty: number;
  location: string;
};
