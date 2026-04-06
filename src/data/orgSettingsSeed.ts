import type {
  ChartAccountRow,
  DepartmentUnit,
  Division,
  WarehouseRow,
} from "../types/orgSettings";

export const seedDivisions: Division[] = [
  {
    id: "div-1",
    name: "ผู้ดูแลระบบ/Admin",
    details: "ผู้ดูแลระบบสูงสุด",
    teamNote: "",
  },
  {
    id: "div-2",
    name: "ฝ่ายขาย",
    details: "ดูแลยอดขายของทีมให้ได้ตามเป้าที่กำหนด",
    teamNote: "",
  },
  {
    id: "div-3",
    name: "ฝ่ายจัดหา - จัดซื้อ",
    details: "จัดหาของให้ได้ตามที่ User ต้องการ",
    teamNote: "",
  },
];

export const seedDepartmentUnits: DepartmentUnit[] = [
  { id: "du-1", name: "ขาย", details: "" },
  { id: "du-2", name: "SUPPORT", details: "" },
  { id: "du-3", name: "ออฟฟิศ", details: "" },
];

export const seedChartAccounts: ChartAccountRow[] = [
  {
    id: "coa-1",
    code: "100000",
    name: "สินทรัพย์",
    category: "สินทรัพย์",
    accountType: "บัญชีคุม",
    fixCost: "",
    expenseHistory: "",
  },
  {
    id: "coa-2",
    code: "200000",
    name: "หนี้สินและส่วนของผู้ถือหุ้น",
    category: "หนี้สิน",
    accountType: "บัญชีคุม",
    fixCost: "",
    expenseHistory: "",
  },
  {
    id: "coa-3",
    code: "300000",
    name: "ส่วนของผู้ถือหุ้น",
    category: "ทุน",
    accountType: "บัญชีคุม",
    fixCost: "",
    expenseHistory: "",
  },
  {
    id: "coa-4",
    code: "400000",
    name: "รายได้",
    category: "รายได้",
    accountType: "บัญชีคุม",
    fixCost: "",
    expenseHistory: "",
  },
  {
    id: "coa-5",
    code: "500000",
    name: "ค่าใช้จ่าย",
    category: "ค่าใช้จ่าย",
    accountType: "บัญชีคุม",
    fixCost: "",
    expenseHistory: "",
  },
];

export function emptyWarehouses(): Record<
  "spare" | "production" | "sales",
  WarehouseRow[]
> {
  return {
    spare: [
      {
        id: "wh-s-1",
        code: "WH-SP-01",
        name: "คลังอะไหล่หลัก",
        details: "เก็บอะไหล่ซ่อมทั่วไป",
      },
    ],
    production: [
      {
        id: "wh-p-1",
        code: "WH-PR-01",
        name: "คลังวัตถุดิบผลิต",
        details: "",
      },
    ],
    sales: [
      {
        id: "wh-sl-1",
        code: "WH-SL-01",
        name: "คลังสินค้าพร้อมขาย",
        details: "",
      },
    ],
  };
}
