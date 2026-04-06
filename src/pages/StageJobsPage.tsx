import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { StageJobsTable } from "../components/StageJobsTable";
import { useJobs } from "../context/JobsContext";
import { getStageMeta } from "../data/workflowStages";

export function StageJobsPage() {
  const { stageCode: raw } = useParams<{ stageCode: string }>();
  const code = raw ? decodeURIComponent(raw) : "";
  const meta = getStageMeta(code);
  const { jobs, moveJobToStage } = useJobs();

  if (!meta) {
    return <Navigate to="/" replace />;
  }

  const rows = jobs.filter((j) => j.currentStageCode === code);

  return (
    <>
      <header className="border-b border-slate-200/80 bg-white px-6 py-4 print:border-0">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 print:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับแดชบอร์ด
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 print:text-xl">
          {meta.code}. {meta.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 print:text-slate-600">
          {meta.description}
        </p>
      </header>

      <main className="p-6 print:p-4">
        <StageJobsTable
          jobs={rows}
          currentStageCode={code}
          onMoveJob={moveJobToStage}
        />
      </main>
    </>
  );
}
