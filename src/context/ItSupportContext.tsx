import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ItReportRow } from "../types/itReport";
import type { PmUser } from "../types/pmUser";

function newQueueId() {
  return `Q-${Date.now().toString().slice(-8)}`;
}

type ItSupportContextValue = {
  rows: ItReportRow[];
  unreadRows: ItReportRow[];
  patchRow: (id: string, patch: Partial<ItReportRow>) => void;
  submitProblem: (input: { subject: string; details: string }, user: PmUser) => void;
  unreadSubmissionCount: number;
  markSubmissionRead: (id: string) => void;
  markAllSubmissionsRead: () => void;
};

const ItSupportContext = createContext<ItSupportContextValue | null>(null);

export function ItSupportProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<ItReportRow[]>([]);
  const [unreadIds, setUnreadIds] = useState<Set<string>>(() => new Set());

  const patchRow = useCallback((id: string, patch: Partial<ItReportRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }, []);

  const submitProblem = useCallback(
    (input: { subject: string; details: string }, user: PmUser) => {
      const id = `it-u-${Date.now()}`;
      const openDate = new Date().toISOString().slice(0, 10);
      const row: ItReportRow = {
        id,
        queueId: newQueueId(),
        status: "รอ IT รับเรื่อง",
        openDate,
        subject: input.subject.trim(),
        details: input.details.trim(),
        attachments: "",
        link: "-",
        reporter: user.displayNameTh,
        assignee: "ว่าง",
        priority: "ด่วน",
        workDate: "",
        dueDate: "",
        department: user.departmentCode ?? "—",
      };
      setRows((prev) => [row, ...prev]);
      setUnreadIds((u) => new Set(u).add(id));
    },
    []
  );

  const markSubmissionRead = useCallback((id: string) => {
    setUnreadIds((u) => {
      const n = new Set(u);
      n.delete(id);
      return n;
    });
  }, []);

  const markAllSubmissionsRead = useCallback(() => {
    setUnreadIds(new Set());
  }, []);

  const unreadSubmissionCount = unreadIds.size;

  const unreadRows = useMemo(
    () => rows.filter((r) => unreadIds.has(r.id)),
    [rows, unreadIds]
  );

  const value = useMemo(
    () => ({
      rows,
      unreadRows,
      patchRow,
      submitProblem,
      unreadSubmissionCount,
      markSubmissionRead,
      markAllSubmissionsRead,
    }),
    [
      rows,
      unreadRows,
      patchRow,
      submitProblem,
      unreadSubmissionCount,
      markSubmissionRead,
      markAllSubmissionsRead,
    ]
  );

  return (
    <ItSupportContext.Provider value={value}>
      {children}
    </ItSupportContext.Provider>
  );
}

export function useItSupport() {
  const ctx = useContext(ItSupportContext);
  if (!ctx) {
    throw new Error("useItSupport must be used within ItSupportProvider");
  }
  return ctx;
}
