import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSeedCustomers } from "../data/customersSeed";
import { mapDbCustomerRow, type DbCustomerRow } from "../lib/mapMnsDb";
import { useMnsConnection } from "./MnsConnectionContext";
import { mnsFetch } from "../services/mnsApi";
import type { Customer, CustomerInput } from "../types/customer";

type DataSource = "seed" | "mysql";

type CustomersContextValue = {
  customers: Customer[];
  /** โหลดจาก seed หรือ MySQL */
  dataSource: DataSource;
  /** โหลดครั้งแรกเสร็จแล้ว */
  hydrated: boolean;
  addCustomer: (input: CustomerInput) => Promise<void>;
  updateCustomer: (
    id: string,
    patch: Partial<Pick<Customer, "customerType">>
  ) => void;
};

const CustomersContext = createContext<CustomersContextValue | null>(null);

function nextCustomerCode(existing: Customer[]) {
  const nums = existing
    .map((c) => {
      const m = c.customerCode.match(/C(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => n > 0);
  const next = (nums.length ? Math.max(...nums) : 12019) + 1;
  return `C${String(next).padStart(7, "0")}`;
}

export function CustomersProvider({ children }: { children: ReactNode }) {
  const conn = useMnsConnection();
  const [customers, setCustomers] = useState<Customer[]>(() =>
    createSeedCustomers()
  );
  const [dataSource, setDataSource] = useState<DataSource>("seed");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!conn.ready) return;
    let cancelled = false;
    (async () => {
      try {
        if (!conn.apiOk || !conn.db) {
          setHydrated(true);
          return;
        }
        const res = await mnsFetch<{ ok: boolean; rows: DbCustomerRow[] }>(
          "/customers?limit=800"
        );
        if (cancelled) return;
        if (!res.ok || !Array.isArray(res.rows)) {
          setHydrated(true);
          return;
        }
        setCustomers(res.rows.map(mapDbCustomerRow));
        setDataSource("mysql");
      } catch {
        /* ใช้ seed */
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conn.ready, conn.apiOk, conn.db]);

  const addCustomer = useCallback(
    async (input: CustomerInput) => {
      if (dataSource === "mysql") {
        const res = await mnsFetch<{ row: DbCustomerRow }>("/customers", {
          method: "POST",
          body: JSON.stringify({
            companyName: input.companyName.trim(),
            contactName: input.contactName.trim(),
            phone: input.phone.trim(),
            detailNote: input.detailNote?.trim(),
          }),
        });
        setCustomers((prev) => [mapDbCustomerRow(res.row), ...prev]);
        return;
      }

      setCustomers((prev) => {
        const row: Customer = {
          id: `cust-${Date.now()}`,
          customerCode: nextCustomerCode(prev),
          companyName: input.companyName.trim(),
          contactName: input.contactName.trim(),
          phone: input.phone.trim(),
          salesPersonName: input.salesPersonName.trim(),
          customerType: input.customerType.trim(),
          region: input.region.trim(),
          frequency: input.frequency ?? 0,
          grade: (input.grade ?? "B").trim() || "B",
          detailNote: input.detailNote?.trim() || undefined,
        };
        return [row, ...prev];
      });
    },
    [dataSource]
  );

  const updateCustomer = useCallback(
    (id: string, patch: Partial<Pick<Customer, "customerType">>) => {
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
      );
    },
    []
  );

  const value = useMemo(
    () => ({
      customers,
      dataSource,
      hydrated,
      addCustomer,
      updateCustomer,
    }),
    [customers, dataSource, hydrated, addCustomer, updateCustomer]
  );

  return (
    <CustomersContext.Provider value={value}>
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomers() {
  const ctx = useContext(CustomersContext);
  if (!ctx) throw new Error("useCustomers within CustomersProvider");
  return ctx;
}
