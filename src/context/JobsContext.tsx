import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSeedJobs } from "../data/jobsSeed";
import type { Job, JobInput } from "../types/job";

type JobsContextValue = {
  jobs: Job[];
  addJob: (input: JobInput) => void;
  moveJobToStage: (jobId: string, stageCode: string) => void;
};

const JobsContext = createContext<JobsContextValue | null>(null);

function newId() {
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(() => createSeedJobs());

  const addJob = useCallback((input: JobInput) => {
    const row: Job = {
      ...input,
      id: newId(),
      enteredStageAt: new Date().toISOString(),
    };
    setJobs((prev) => [row, ...prev]);
  }, []);

  const moveJobToStage = useCallback((jobId: string, stageCode: string) => {
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
  }, []);

  const value = useMemo(
    () => ({ jobs, addJob, moveJobToStage }),
    [jobs, addJob, moveJobToStage]
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
