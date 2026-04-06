import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSeedCustomers } from "../data/customersSeed";
import type { Customer, CustomerInput } from "../types/customer";

type CustomersContextValue = {
  customers: Customer[];
  addCustomer: (input: CustomerInput) => void;
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
  const [customers, setCustomers] = useState<Customer[]>(() =>
    createSeedCustomers()
  );

  const addCustomer = useCallback((input: CustomerInput) => {
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
  }, []);

  const updateCustomer = useCallback(
    (id: string, patch: Partial<Pick<Customer, "customerType">>) => {
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
      );
    },
    []
  );

  const value = useMemo(
    () => ({ customers, addCustomer, updateCustomer }),
    [customers, addCustomer, updateCustomer]
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
