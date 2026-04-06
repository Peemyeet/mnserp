export type Division = {
  id: string;
  name: string;
  details: string;
  /** คอลัมน์ลูกทีม */
  teamNote: string;
};

export type DepartmentUnit = {
  id: string;
  name: string;
  details: string;
};

export type ChartAccountRow = {
  id: string;
  code: string;
  name: string;
  category: string;
  accountType: string;
  fixCost: string;
  expenseHistory: string;
};

export type WarehouseKind = "spare" | "production" | "sales";

export type WarehouseRow = {
  id: string;
  code: string;
  name: string;
  details: string;
};
