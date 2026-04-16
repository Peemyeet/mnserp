export type AuditPendingRow = {
  id: string;
  refDoc: string;
  payType: string;
  vendor: string;
  totalPrice: string;
  dueDate: string;
  company: string;
  attachment: string;
  note: string;
  chat: string;
};

export const AUDIT_PENDING_PLACEHOLDER: AuditPendingRow[] = [
  {
    id: "1",
    refDoc: "—",
    payType: "—",
    vendor: "—",
    totalPrice: "—",
    dueDate: "—",
    company: "—",
    attachment: "—",
    note: "—",
    chat: "—",
  },
];
