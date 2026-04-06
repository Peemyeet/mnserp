import type { WarehouseKind } from "../types/orgSettings";

export const ALL_WAREHOUSE_KINDS: WarehouseKind[] = [
  "spare",
  "production",
  "sales",
];

export const WAREHOUSE_NAV_ITEMS: {
  id: WarehouseKind;
  labelTh: string;
  labelEn: string;
}[] = [
  { id: "spare", labelTh: "คลังอะไหล่", labelEn: "Spare parts warehouse" },
  { id: "production", labelTh: "คลังผลิต", labelEn: "Production warehouse" },
  { id: "sales", labelTh: "คลังขาย", labelEn: "Sales warehouse" },
];

export function isWarehouseKind(s: string): s is WarehouseKind {
  return s === "spare" || s === "production" || s === "sales";
}
