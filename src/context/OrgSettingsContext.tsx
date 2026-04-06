import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  emptyWarehouses,
  seedChartAccounts,
  seedDepartmentUnits,
  seedDivisions,
} from "../data/orgSettingsSeed";
import type {
  ChartAccountRow,
  DepartmentUnit,
  Division,
  WarehouseKind,
  WarehouseRow,
} from "../types/orgSettings";

type OrgSettingsValue = {
  divisions: Division[];
  addDivision: (d: Omit<Division, "id">) => void;
  updateDivision: (id: string, d: Omit<Division, "id">) => void;
  deleteDivision: (id: string) => void;

  departmentUnits: DepartmentUnit[];
  addDepartmentUnit: (d: Omit<DepartmentUnit, "id">) => void;
  updateDepartmentUnit: (id: string, d: Omit<DepartmentUnit, "id">) => void;
  deleteDepartmentUnit: (id: string) => void;

  chartAccounts: ChartAccountRow[];
  addChartAccount: (r: Omit<ChartAccountRow, "id">) => void;
  updateChartAccount: (id: string, r: Partial<ChartAccountRow>) => void;
  deleteChartAccount: (id: string) => void;

  warehouses: Record<WarehouseKind, WarehouseRow[]>;
  addWarehouse: (kind: WarehouseKind, r: Omit<WarehouseRow, "id">) => void;
  updateWarehouse: (
    kind: WarehouseKind,
    id: string,
    r: Partial<WarehouseRow>
  ) => void;
  deleteWarehouse: (kind: WarehouseKind, id: string) => void;
};

const OrgSettingsContext = createContext<OrgSettingsValue | null>(null);

function newId(p: string) {
  return `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function OrgSettingsProvider({ children }: { children: ReactNode }) {
  const [divisions, setDivisions] = useState<Division[]>(() => [...seedDivisions]);
  const [departmentUnits, setDepartmentUnits] = useState<DepartmentUnit[]>(
    () => [...seedDepartmentUnits]
  );
  const [chartAccounts, setChartAccounts] = useState<ChartAccountRow[]>(
    () => [...seedChartAccounts]
  );
  const [warehouses, setWarehouses] = useState(() => emptyWarehouses());

  const addDivision = useCallback((d: Omit<Division, "id">) => {
    setDivisions((prev) => [
      {
        id: newId("div"),
        name: d.name.trim(),
        details: d.details.trim(),
        teamNote: d.teamNote.trim(),
      },
      ...prev,
    ]);
  }, []);

  const updateDivision = useCallback((id: string, d: Omit<Division, "id">) => {
    setDivisions((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              name: d.name.trim(),
              details: d.details.trim(),
              teamNote: d.teamNote.trim(),
            }
          : x
      )
    );
  }, []);

  const deleteDivision = useCallback((id: string) => {
    setDivisions((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addDepartmentUnit = useCallback((d: Omit<DepartmentUnit, "id">) => {
    setDepartmentUnits((prev) => [
      { id: newId("du"), name: d.name.trim(), details: d.details.trim() },
      ...prev,
    ]);
  }, []);

  const updateDepartmentUnit = useCallback(
    (id: string, d: Omit<DepartmentUnit, "id">) => {
      setDepartmentUnits((prev) =>
        prev.map((x) =>
          x.id === id
            ? { ...x, name: d.name.trim(), details: d.details.trim() }
            : x
        )
      );
    },
    []
  );

  const deleteDepartmentUnit = useCallback((id: string) => {
    setDepartmentUnits((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addChartAccount = useCallback((r: Omit<ChartAccountRow, "id">) => {
    setChartAccounts((prev) => [
      {
        id: newId("coa"),
        code: r.code.trim(),
        name: r.name.trim(),
        category: r.category.trim(),
        accountType: r.accountType.trim() || "บัญชีคุม",
        fixCost: r.fixCost.trim(),
        expenseHistory: r.expenseHistory.trim(),
      },
      ...prev,
    ]);
  }, []);

  const updateChartAccount = useCallback(
    (id: string, r: Partial<ChartAccountRow>) => {
      setChartAccounts((prev) =>
        prev.map((x) => {
          if (x.id !== id) return x;
          const n = { ...x };
          (Object.keys(r) as (keyof ChartAccountRow)[]).forEach((k) => {
            const v = r[k];
            if (v !== undefined)
              (n as Record<string, string>)[k] =
                typeof v === "string" ? v.trim() : String(v);
          });
          return n;
        })
      );
    },
    []
  );

  const deleteChartAccount = useCallback((id: string) => {
    setChartAccounts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addWarehouse = useCallback(
    (kind: WarehouseKind, r: Omit<WarehouseRow, "id">) => {
      setWarehouses((prev) => ({
        ...prev,
        [kind]: [
          {
            id: newId("wh"),
            code: r.code.trim(),
            name: r.name.trim(),
            details: r.details.trim(),
          },
          ...prev[kind],
        ],
      }));
    },
    []
  );

  const updateWarehouse = useCallback(
    (kind: WarehouseKind, id: string, r: Partial<WarehouseRow>) => {
      setWarehouses((prev) => ({
        ...prev,
        [kind]: prev[kind].map((x) => {
          if (x.id !== id) return x;
          return {
            ...x,
            code: r.code !== undefined ? r.code.trim() : x.code,
            name: r.name !== undefined ? r.name.trim() : x.name,
            details: r.details !== undefined ? r.details.trim() : x.details,
          };
        }),
      }));
    },
    []
  );

  const deleteWarehouse = useCallback((kind: WarehouseKind, id: string) => {
    setWarehouses((prev) => ({
      ...prev,
      [kind]: prev[kind].filter((x) => x.id !== id),
    }));
  }, []);

  const value = useMemo(
    () => ({
      divisions,
      addDivision,
      updateDivision,
      deleteDivision,
      departmentUnits,
      addDepartmentUnit,
      updateDepartmentUnit,
      deleteDepartmentUnit,
      chartAccounts,
      addChartAccount,
      updateChartAccount,
      deleteChartAccount,
      warehouses,
      addWarehouse,
      updateWarehouse,
      deleteWarehouse,
    }),
    [
      divisions,
      addDivision,
      updateDivision,
      deleteDivision,
      departmentUnits,
      addDepartmentUnit,
      updateDepartmentUnit,
      deleteDepartmentUnit,
      chartAccounts,
      addChartAccount,
      updateChartAccount,
      deleteChartAccount,
      warehouses,
      addWarehouse,
      updateWarehouse,
      deleteWarehouse,
    ]
  );

  return (
    <OrgSettingsContext.Provider value={value}>
      {children}
    </OrgSettingsContext.Provider>
  );
}

export function useOrgSettings() {
  const ctx = useContext(OrgSettingsContext);
  if (!ctx) throw new Error("useOrgSettings within OrgSettingsProvider");
  return ctx;
}
