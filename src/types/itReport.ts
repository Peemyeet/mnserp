export type ItReportRow = {
  id: string;
  queueId: string;
  status: string;
  openDate: string;
  subject: string;
  details: string;
  attachments: string;
  link: string;
  reporter: string;
  assignee: string;
  priority: string;
  workDate: string;
  dueDate: string;
  /** แผนก — ใช้ประเภทคลังตามที่กำหนด */
  department: string;
};
