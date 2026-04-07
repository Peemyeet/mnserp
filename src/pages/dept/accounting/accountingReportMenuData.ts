import type { IncomeExpenseSubView } from "./IncomeExpenseReportPanels";

export type MenuSubItem = {
  id: string;
  titleTh: string;
  titleEn: string;
  iconWrap: string;
  iconClass: string;
};

export type ReportSectionKey =
  | "income-expense"
  | "ar-ap"
  | "ledger"
  | "tax"
  | "financial"
  | "commission"
  | "statement";

export type ActiveAccountingReport =
  | { section: "income-expense"; itemId: IncomeExpenseSubView }
  | { section: Exclude<ReportSectionKey, "income-expense">; itemId: string };

export const incomeExpenseSubs: {
  id: IncomeExpenseSubView;
  titleTh: string;
  titleEn: string;
  iconWrap: string;
  iconClass: string;
}[] = [
  {
    id: "real",
    titleTh: "รับ - จ่าย ( จริง )",
    titleEn: "( Real )",
    iconWrap: "bg-violet-100",
    iconClass: "text-violet-600",
  },
  {
    id: "plan",
    titleTh: "รับ - จ่าย ( แผน )",
    titleEn: "( Plan )",
    iconWrap: "bg-orange-100",
    iconClass: "text-orange-600",
  },
  {
    id: "result",
    titleTh: "รับ - จ่าย ( ผล )",
    titleEn: "( Result )",
    iconWrap: "bg-teal-100",
    iconClass: "text-teal-600",
  },
];

export const accountingReportSubMenus: Record<
  Exclude<ReportSectionKey, "income-expense">,
  { label: string; items: MenuSubItem[] }
> = {
  tax: {
    label: "ภาษี",
    items: [
      {
        id: "withholding",
        titleTh: "หัก ณ ที่จ่าย",
        titleEn: "With Holding",
        iconWrap: "bg-violet-100",
        iconClass: "text-violet-600",
      },
      {
        id: "sales",
        titleTh: "ภาษีขาย",
        titleEn: "Tax sale",
        iconWrap: "bg-teal-100",
        iconClass: "text-teal-600",
      },
      {
        id: "purchase",
        titleTh: "ภาษีซื้อ",
        titleEn: "List Tax Purchase",
        iconWrap: "bg-orange-100",
        iconClass: "text-orange-600",
      },
    ],
  },
  "ar-ap": {
    label: "สรุปรายการลูกหนี้ / เจ้าหนี้",
    items: [
      {
        id: "ar",
        titleTh: "รายการลูกหนี้ค้างรับ",
        titleEn: "Accounts Receivable Payable System",
        iconWrap: "bg-rose-100",
        iconClass: "text-rose-600",
      },
      {
        id: "ap",
        titleTh: "รายการเจ้าหนี้ค้างจ่าย",
        titleEn: "Payables Payable System",
        iconWrap: "bg-orange-100",
        iconClass: "text-orange-600",
      },
      {
        id: "payment-summary",
        titleTh: "สรุปรายการจ่าย",
        titleEn: "Accounting Pay Success",
        iconWrap: "bg-teal-100",
        iconClass: "text-teal-600",
      },
    ],
  },
  ledger: {
    label: "สมุดบัญชี",
    items: [
      {
        id: "income-summary",
        titleTh: "สรุปบัญชีรับ",
        titleEn: "Accounts Receivable Summary",
        iconWrap: "bg-rose-100",
        iconClass: "text-rose-600",
      },
      {
        id: "five-books",
        titleTh: "สมุดบัญชี 5 เล่ม",
        titleEn: "Journal (5 books)",
        iconWrap: "bg-violet-100",
        iconClass: "text-violet-600",
      },
    ],
  },
  financial: {
    label: "งบการเงิน",
    items: [
      {
        id: "cashflow-v2",
        titleTh: "Cashflow V2",
        titleEn: "Report Cashflow",
        iconWrap: "bg-violet-100",
        iconClass: "text-violet-600",
      },
      {
        id: "trial-balance",
        titleTh: "งบทดลอง",
        titleEn: "System",
        iconWrap: "bg-orange-100",
        iconClass: "text-orange-600",
      },
    ],
  },
  commission: {
    label: "คอมมิชชั่น",
    items: [
      {
        id: "main",
        titleTh: "คอมมิชชั่น",
        titleEn: "Commission",
        iconWrap: "bg-violet-100",
        iconClass: "text-violet-600",
      },
    ],
  },
  statement: {
    label: "Statement",
    items: [
      {
        id: "system",
        titleTh: "ระบบ Statement",
        titleEn: "Statement System",
        iconWrap: "bg-teal-100",
        iconClass: "text-teal-600",
      },
    ],
  },
};

export function incomeExpenseLabel(view: IncomeExpenseSubView): string {
  if (view === "real") return "มุมมองจริง (ยืนยันการรับเงิน)";
  if (view === "plan") return "มุมมองแผน (สรุปรายการ)";
  return "มุมมองผลลัพธ์ (กราฟไตรมาศ)";
}

export function findSubMenuItem(
  section: Exclude<ReportSectionKey, "income-expense">,
  itemId: string
): MenuSubItem | undefined {
  return accountingReportSubMenus[section].items.find((i) => i.id === itemId);
}

export function activeReportTitle(active: ActiveAccountingReport): {
  sectionLabel: string;
  itemTitleTh: string;
  itemTitleEn: string;
  breadcrumb: string;
} {
  if (active.section === "income-expense") {
    const row = incomeExpenseSubs.find((s) => s.id === active.itemId)!;
    return {
      sectionLabel: "แผนรับจ่าย",
      itemTitleTh: row.titleTh,
      itemTitleEn: row.titleEn,
      breadcrumb: `แผนรับจ่าย — ${incomeExpenseLabel(active.itemId)}`,
    };
  }
  const section = accountingReportSubMenus[active.section];
  const item = findSubMenuItem(active.section, active.itemId);
  return {
    sectionLabel: section.label,
    itemTitleTh: item?.titleTh ?? active.itemId,
    itemTitleEn: item?.titleEn ?? "",
    breadcrumb: `${section.label} — ${item?.titleTh ?? active.itemId}`,
  };
}
