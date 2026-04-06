/** งานหนึ่งรายการ — ฝ่ายขายเป็นผู้กรอกข้อมูลหลัก ทุกขั้น N อ่านจากชุดเดียวกัน */
export type Job = {
  id: string;
  serviceNumber: string;
  jobName: string;
  customerName: string;
  customerPO: string;
  /** รหัสขั้นตอนปัจจุบัน เช่น N01 */
  currentStageCode: string;
  /** เวลาเข้าขั้นปัจจุบัน (ISO) — ใช้คำนวณระยะเวลาอยู่ขั้นนี้ */
  enteredStageAt: string;
};

export type JobInput = Omit<Job, "id" | "enteredStageAt">;
