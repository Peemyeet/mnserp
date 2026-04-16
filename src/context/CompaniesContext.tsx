import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Company, CompanyInput } from "../types/company";

type CompaniesContextValue = {
  companies: Company[];
  addCompany: (input: CompanyInput) => void;
  updateCompany: (id: string, patch: Partial<CompanyInput>) => void;
  deleteCompany: (id: string) => void;
};

const CompaniesContext = createContext<CompaniesContextValue | null>(null);

export function CompaniesProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);

  const addCompany = useCallback((input: CompanyInput) => {
    setCompanies((prev) => [
      {
        id: `co-${Date.now()}`,
        storeName: input.storeName.trim(),
        details: input.details.trim(),
        manager: input.manager.trim(),
      },
      ...prev,
    ]);
  }, []);

  const updateCompany = useCallback(
    (id: string, patch: Partial<CompanyInput>) => {
      setCompanies((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          return {
            ...c,
            storeName:
              patch.storeName !== undefined
                ? patch.storeName.trim()
                : c.storeName,
            details:
              patch.details !== undefined ? patch.details.trim() : c.details,
            manager:
              patch.manager !== undefined ? patch.manager.trim() : c.manager,
          };
        })
      );
    },
    []
  );

  const deleteCompany = useCallback((id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({ companies, addCompany, updateCompany, deleteCompany }),
    [companies, addCompany, updateCompany, deleteCompany]
  );

  return (
    <CompaniesContext.Provider value={value}>
      {children}
    </CompaniesContext.Provider>
  );
}

export function useCompanies() {
  const ctx = useContext(CompaniesContext);
  if (!ctx) throw new Error("useCompanies within CompaniesProvider");
  return ctx;
}
