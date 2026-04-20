import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  mapDbJobRow,
  parseMnsNumericId,
  type DbJobRow,
} from "../lib/mapMnsDb";
import { useMnsConnection } from "./MnsConnectionContext";
import { mnsFetch } from "../services/mnsApi";
import type { Job, JobInput } from "../types/job";

type DataSource = "live";

type JobsContextValue = {
  jobs: Job[];
  dataSource: DataSource;
  hydrated: boolean;
  /** ข้อความเมื่อโหลด /jobs ล้มเหลว (เช่น ตารางใน DB ไม่ครบ) — ไม่ใช่แค่ “ไม่มีงาน” */
  jobsLoadError: string | null;
  addJob: (input: JobInput) => Promise<void>;
  moveJobToStage: (jobId: string, stageCode: string) => Promise<void>;
};

const JobsContext = createContext<JobsContextValue | null>(null);

export function JobsProvider({ children }: { children: ReactNode }) {
  const conn = useMnsConnection();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dataSource] = useState<DataSource>("live");
  const [hydrated, setHydrated] = useState(false);
  const [jobsLoadError, setJobsLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!conn.ready) return;
    let cancelled = false;
    (async () => {
      try {
        if (!conn.apiOk || !conn.db) {
          setJobs([]);
          setJobsLoadError(null);
          setHydrated(true);
          return;
        }
        const res = await mnsFetch<{ ok: boolean; rows: DbJobRow[] }>(
          "/jobs?limit=400"
        );
        if (cancelled) return;
        if (!res.ok || !Array.isArray(res.rows)) {
          setJobs([]);
          setJobsLoadError("ไม่สามารถอ่านรายการงานได้ (รูปแบบข้อมูลไม่ถูกต้อง)");
          setHydrated(true);
          return;
        }
        setJobsLoadError(null);
        setJobs(res.rows.map(mapDbJobRow));
      } catch (e) {
        setJobs([]);
        const msg =
          e instanceof Error && e.message
            ? e.message
            : "โหลดรายการงานไม่สำเร็จ";
        setJobsLoadError(msg);
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
    },
    []
  );

  const moveJobToStage = useCallback(
    async (jobId: string, stageCode: string) => {
      if (parseMnsNumericId(jobId) != null) {
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
    []
  );

  const value = useMemo(
    () => ({
      jobs,
      dataSource,
      hydrated,
      jobsLoadError,
      addJob,
      moveJobToStage,
    }),
    [jobs, dataSource, hydrated, jobsLoadError, addJob, moveJobToStage]
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
