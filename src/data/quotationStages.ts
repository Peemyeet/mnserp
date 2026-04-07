/** ขั้นเวิร์กโฟลว์เสนอราคา — สอดคล้อง workstatus N01–N05 ใน db_mns */

export const QUOTATION_STAGE_SLUGS = [
  "receive",
  "check",
  "sales-info",
  "spare-price",
  "price-done",
] as const;

export type QuotationStageSlug = (typeof QUOTATION_STAGE_SLUGS)[number];

export type QuotationColumnFlags = {
  movedDays: boolean;
  serviceNo: boolean;
  jobName: boolean;
  sn: boolean;
  engineer: boolean;
  sales: boolean;
  customer: boolean;
  quotationCTA: boolean;
  manage: boolean;
  chat: boolean;
};

export type QuotationStageDef = {
  slug: QuotationStageSlug;
  wsId: number;
  titleTh: string;
  titleEn: string;
  path: string;
  columns: QuotationColumnFlags;
};

const col = (
  partial: Partial<QuotationColumnFlags> & { movedDays?: boolean }
): QuotationColumnFlags => ({
  movedDays: partial.movedDays ?? true,
  serviceNo: partial.serviceNo ?? true,
  jobName: partial.jobName ?? true,
  sn: partial.sn ?? false,
  engineer: partial.engineer ?? false,
  sales: partial.sales ?? false,
  customer: partial.customer ?? true,
  quotationCTA: partial.quotationCTA ?? false,
  manage: partial.manage ?? false,
  chat: partial.chat ?? true,
});

export const QUOTATION_STAGES: QuotationStageDef[] = [
  {
    slug: "receive",
    wsId: 1,
    titleTh: "รับงาน",
    titleEn: "Receive job",
    path: "/dept/sales/quotation/receive",
    columns: col({ engineer: false, sales: false }),
  },
  {
    slug: "check",
    wsId: 2,
    titleTh: "ตรวจเช็ค",
    titleEn: "Receive job",
    path: "/dept/sales/quotation/check",
    columns: col({ engineer: true, sales: true }),
  },
  {
    slug: "sales-info",
    wsId: 3,
    titleTh: "ขอข้อมูลฝ่ายขาย",
    titleEn: "Sale information",
    path: "/dept/sales/quotation/sales-info",
    columns: col({ sn: true, engineer: true, sales: true, manage: true }),
  },
  {
    slug: "spare-price",
    wsId: 4,
    titleTh: "หาราคาอะไหล่",
    titleEn: "Sale",
    path: "/dept/sales/quotation/spare-price",
    columns: col({ engineer: true, sales: true }),
  },
  {
    slug: "price-done",
    wsId: 5,
    titleTh: "ราคาเสร็จสิ้น",
    titleEn: "Price complete",
    path: "/dept/sales/quotation/price-done",
    columns: col({
      engineer: true,
      sales: true,
      quotationCTA: true,
      manage: true,
    }),
  },
];

const bySlug = new Map(QUOTATION_STAGES.map((s) => [s.slug, s]));

export function getQuotationStage(
  slug: string | undefined
): QuotationStageDef | null {
  if (!slug) return null;
  return bySlug.get(slug as QuotationStageSlug) ?? null;
}

export function isQuotationSlug(s: string): s is QuotationStageSlug {
  return bySlug.has(s as QuotationStageSlug);
}
