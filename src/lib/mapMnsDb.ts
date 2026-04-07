import type { Customer } from "../types/customer";
import type { Job } from "../types/job";
import { wsNameToStageCode } from "./stageCode";

export type DbCustomerRow = {
  cus_id: number;
  cus_code: string;
  cus_name: string;
  cus_contact: string;
  cus_tel: string;
  contact_tel: string;
  cus_info: string;
  modified: string;
  user_id: number;
};

export function mapDbCustomerRow(row: DbCustomerRow): Customer {
  return {
    id: `mns-${row.cus_id}`,
    customerCode: row.cus_code ?? "",
    companyName: row.cus_name ?? "",
    contactName: row.cus_contact ?? "",
    phone: (row.contact_tel || row.cus_tel || "").trim() || "-",
    salesPersonName: "",
    customerType: "จากฐานข้อมูล",
    region: "",
    frequency: 0,
    grade: "B",
    detailNote: row.cus_info?.trim() || undefined,
  };
}

export type DbJobRow = {
  job_id: number;
  service_id: string;
  product_name: string;
  job_po: string;
  job_quotation?: string;
  job_status: number;
  modified: string;
  customer_id?: number;
  customer_name: string | null;
  ws_name: string | null;
  sn?: string | null;
  sale_id?: number | null;
  engeneer_id?: number | null;
  sales_name?: string | null;
  engineer_name?: string | null;
  recive_job?: string | null;
  send_job?: string | null;
};

export function mapDbJobRow(row: DbJobRow): Job {
  const mod = row.modified as string | Date;
  const entered =
    mod instanceof Date
      ? mod.toISOString()
      : typeof mod === "string" && mod.length > 0
        ? new Date(mod.replace(" ", "T")).toISOString()
        : new Date().toISOString();
  return {
    id: `mns-${row.job_id}`,
    serviceNumber: row.service_id ?? "",
    jobName: row.product_name ?? "",
    customerName: row.customer_name?.trim() || "-",
    customerPO: (row.job_po ?? "").trim() || "-",
    currentStageCode: wsNameToStageCode(row.ws_name ?? undefined),
    enteredStageAt: entered,
  };
}

export function parseMnsNumericId(id: string): number | null {
  if (id.startsWith("mns-")) {
    const n = Number(id.slice(4));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
