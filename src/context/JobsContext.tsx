import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSeedJobs } from "../data/jobsSeed";
import {
  mapDbJobRow,
  parseMnsNumericId,
  type DbJobRow,
} from "../lib/mapMnsDb";
import { useMnsConnection } from "./MnsConnectionContext";
import { mnsFetch } from "../services/mnsApi";
import type { Job, JobInput } from "../types/job";

type DataSource = "seed" | "mysql";

type JobsContextValue = {
  jobs: Job[];
  dataSource: DataSource;
  hydrated: boolean;
  addJob: (input: JobInput) => Promise<void>;
  moveJobToStage: (jobId: string, stageCode: string) => Promise<void>;
};

const JobsContext = createContext<JobsContextValue | null>(null);

function newId() {
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function JobsProvider({ children }: { children: ReactNode }) {
  const conn = useMnsConnection();
  const [jobs, setJobs] = useState<Job[]>(() => createSeedJobs());
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
        const res = await mnsFetch<{ ok: boolean; rows: DbJobRow[] }>(
          "/jobs?limit=400"
        );
        if (cancelled) return;
        if (!res.ok || !Array.isArray(res.rows)) {
          setHydrated(true);
          return;
        }
        setJobs(res.rows.map(mapDbJobRow));
        setDataSource("mysql");
      } catch {
        /* seed */
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conn.ready, conn.apiOk, conn.db]);

  const addJob = useCallback(
    async (input: JobInput) => {
      if (dataSource === "mysql") {
        const custRes = await mnsFetch<{ rows: { cus_id: number; cus_name: string }[] }>(
          "/customers?limit=2000"
        );
        const match = custRes.rows.find(
          (r) =>
            (r.cus_name ?? "").trim().toLowerCase() ===
            input.customerName.trim().toLowerCase()
        );
        if (!match) {
          throw new Error(
            "ไม่พบลูกค้าชื่อนี้ในฐานข้อมูล — กรุณาใช้ชื่อตรงกับที่ลงทะเบียน หรือเพิ่มลูกค้าที่ตั้งค่าก่อน"
          );
        }
        const created = await mnsFetch<{ row: DbJobRow }>("/jobs", {
          method: "POST",
          body: JSON.stringify({
            customer_id: match.cus_id,
            product_name: input.jobName,
            job_po: input.customerPO,
            currentStageCode: input.currentStageCode,
            serviceNumber: input.serviceNumber.trim(),
            info: `บันทึกจาก ERP web: ${input.serviceNumber}`,
          }),
        });
        setJobs((prev) => [mapDbJobRow(created.row), ...prev]);
        return;
      }

      const row: Job = {
        ...input,
        id: newId(),
        enteredStageAt: new Date().toISOString(),
      };
      setJobs((prev) => [row, ...prev]);
    },
    [dataSource]
  );

  const moveJobToStage = useCallback(
    async (jobId: string, stageCode: string) => {
      if (dataSource === "mysql" && parseMnsNumericId(jobId) != null) {
        try {
          await mnsFetch(`/jobs/${jobId}/stage`, {
            method: "PATCH",
            body: JSON.stringify({ stageCode }),
          });
        } catch (e) {
          console.error(e);
        }
      }
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                currentStageCode: stageCode,
                enteredStageAt: new Date().toISOString(),
              }
            : j
        )
      );
    },
    [dataSource]
  );

  const value = useMemo(
    () => ({
      jobs,
      dataSource,
      hydrated,
      addJob,
      moveJobToStage,
    }),
    [jobs, dataSource, hydrated, addJob, moveJobToStage]
  );

  return (
    <JobsContext.Provider value={value}>{children}</JobsContext.Provider>
  );
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobs must be used within JobsProvider");
  return ctx;
}
