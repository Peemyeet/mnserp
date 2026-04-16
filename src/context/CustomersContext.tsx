import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { mapDbCustomerRow, type DbCustomerRow } from "../lib/mapMnsDb";
import { useMnsConnection } from "./MnsConnectionContext";
import { mnsFetch } from "../services/mnsApi";
import type { Customer, CustomerInput } from "../types/customer";

type DataSource = "live";

type CustomersContextValue = {
  customers: Customer[];
  /** บันทึกผ่าน API/ฐานข้อมูลเท่านั้น */
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

export function CustomersProvider({ children }: { children: ReactNode }) {
  const conn = useMnsConnection();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dataSource] = useState<DataSource>("live");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!conn.ready) return;
    let cancelled = false;
    (async () => {
      try {
        if (!conn.apiOk || !conn.db) {
          setCustomers([]);
          setHydrated(true);
          return;
        }
        const res = await mnsFetch<{ ok: boolean; rows: DbCustomerRow[] }>(
          "/customers?limit=800"
        );
        if (cancelled) return;
        if (!res.ok || !Array.isArray(res.rows)) {
          setCustomers([]);
          setHydrated(true);
          return;
        }
        setCustomers(res.rows.map(mapDbCustomerRow));
      } catch {
        setCustomers([]);
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
    },
    []
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
