import type { WorkflowStageMeta } from "./workflowStages";
import { workflowStageDefinitions } from "./workflowStages";

export type SummaryStat = {
  id: string;
  label: string;
  value: number;
  hint: string;
  accent: "violet" | "teal" | "amber" | "rose";
};

/** สำหรับรายการขั้นตอน + จำนวนที่คำนวณจากงานจริง */
export type WorkflowStage = WorkflowStageMeta & { count: number };

export type { WorkflowStageMeta };

export { workflowStageDefinitions };

export function buildSummaryStats(jobs: {
  length: number;
  filter: (p: (j: { currentStageCode: string }) => boolean) => { length: number };
}): SummaryStat[] {
  const total = jobs.length;
  const inReceive = jobs.filter((j) => j.currentStageCode === "N01").length;
  const assigned = total - inReceive;
  const cancelled = jobs.filter((j) =>
    ["N19", "CL"].includes(j.currentStageCode)
  ).length;

  return [
    {
      id: "total",
      label: "JOB ทั้งหมด",
      value: total,
      hint: "จำนวนงานในระบบทั้งหมด",
      accent: "violet",
    },
    {
      id: "assigned",
      label: "จ่ายงานแล้ว",
      value: assigned,
      hint: "ออกจากขั้นรับงานแล้ว (มอบหมาย/ดำเนินการต่อ)",
      accent: "teal",
    },
    {
      id: "unassigned",
      label: "ยังไม่จ่ายงาน",
      value: inReceive,
      hint: "อยู่ที่ขั้นรับงาน (N01)",
      accent: "amber",
    },
    {
      id: "cancelled",
      label: "ยกเลิก/คืนงาน",
      value: cancelled,
      hint: "ยกเลิก-คืนงานหรือเคลม",
      accent: "rose",
    },
  ];
}

export function buildWorkflowStagesWithCounts(
  jobs: { currentStageCode: string }[]
): WorkflowStage[] {
  return workflowStageDefinitions.map((d) => ({
    ...d,
    count: jobs.filter((j) => j.currentStageCode === d.code).length,
  }));
}
