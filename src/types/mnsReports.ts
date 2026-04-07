/** ตอบจาก GET /api/reports/* */
export type SalesReportPayload = {
  ok: boolean;
  sales: {
    lineSeries: { m: string; q: number; n: number }[];
    workgroupJobCounts: { name: string; count: number }[];
    kpi: {
      user_id: number;
      name: string;
      targetBaht: number;
      actualBaht: number;
    }[];
  };
};

export type ProductionReportPayload = {
  ok: boolean;
  production: {
    chart: { name: string; plan: number; actual: number }[];
  };
};

export type PurchaseReportPayload = {
  ok: boolean;
  purchase: {
    trend: { x: string; v: number }[];
    prCount: number;
    orderCount: number;
  };
};

export type AccountingReportPayload = {
  ok: boolean;
  accounting: {
    pie: { name: string; value: number; color: string }[];
    totalPie: number;
    raw: {
      quotaSum: number;
      invoiceCount: number;
      orderCount: number;
      receiveAdvanceSum: number;
      rfqCount: number;
    };
  };
};
