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

/** คลังอะไหล่ — ตัวอย่างตามหน้าจออ้างอิง */
export const SPARE_PARTS_SEED: SparePartRow[] = [
  {
    id: "1",
    mnsPartNo: "076011-0020",
    partNo: "OHJAIN RELAY",
    description: "OHJAIN RELAY MAN 24V 4-NAP 61404001",
    qty: 0,
    location: "///",
    category: "Relay",
    subCategory: "Through Hole",
  },
];

/** คลังผลิต */
export const PRODUCTION_STOCK_SEED: StockPartRow[] = [
  {
    id: "1",
    mnsPartNo: "2200 uF 50 V",
    partNo: "2200 uF 50 V",
    description: "ร้านค้า Digikey",
    partNoWd: "2200 uF 50 V",
    partNoSeagate: "2200 uF 50 V",
    qty: 20,
    remark: "",
    processingQty: 0,
    location: "///",
  },
];

/** คลังขาย */
export const SALES_STOCK_SEED: StockPartRow[] = [
  {
    id: "1",
    mnsPartNo: "2200 uF 50 V",
    partNo: "2200 uF 50 V",
    description: "ร้านค้า Digikey",
    partNoWd: "2200 uF 50 V",
    partNoSeagate: "2200 uF 50 V",
    qty: 20,
    remark: "",
    processingQty: 0,
    location: "///",
  },
];
