import type { ItTicket } from "../types/itTicket";

/** แผนก ขาย — ว่าง (แสดงเป็นแถวขีด) */
export const IT_TICKETS_SALES: ItTicket[] = [];

/** แผนก SUPPORT — นายกิตติสุระ ปั้นแก้ว */
export const IT_TICKETS_SUPPORT: ItTicket[] = [
  {
    id: "s1",
    reporter: "นายกิตติสุระ ปั้นแก้ว",
    subject: "pop up background",
    status: "ว่าง",
    priority: "ว่าง",
    dueDate: "0000-00-00",
  },
  {
    id: "s2",
    reporter: "นายกิตติสุระ ปั้นแก้ว",
    subject: "ปรับขนาดหน้าจอแบบอัตโนมัติ",
    status: "ว่าง",
    priority: "ว่าง",
    dueDate: "0000-00-00",
  },
  {
    id: "s3",
    reporter: "นายกิตติสุระ ปั้นแก้ว",
    subject: "หน้าสมัครผู้ใช้งานใหม่",
    status: "ว่าง",
    priority: "ว่าง",
    dueDate: "0000-00-00",
  },
  {
    id: "s4",
    reporter: "นายกิตติสุระ ปั้นแก้ว",
    subject: "มี js (datatable) ทับ ชื่อ ฟอร์ม ทับกับ script",
    status: "ว่าง",
    priority: "ว่าง",
    dueDate: "0000-00-00",
  },
];

/** แผนก ออฟฟิศ — นายกิตติสุระ เห็นแก้ว */
export const IT_TICKETS_OFFICE: ItTicket[] = [
  {
    id: "o1",
    reporter: "นายกิตติสุระ เห็นแก้ว",
    subject: "เปลี่ยนแปลง Flow",
    status: "ว่าง",
    priority: "ว่าง",
    dueDate: "0000-00-00",
  },
  {
    id: "o2",
    reporter: "นายกิตติสุระ เห็นแก้ว",
    subject: "หน้าตั้งเจ้าหนี้ สามารถแบ่งงวดชำระเงินได้",
    status: "ว่าง",
    priority: "ว่าง",
    dueDate: "0000-00-00",
  },
  {
    id: "o3",
    reporter: "นายกิตติสุระ เห็นแก้ว",
    subject: "ตั้งเจ้าหนี้",
    status: "ว่าง",
    priority: "ว่าง",
    dueDate: "0000-00-00",
  },
  {
    id: "o4",
    reporter: "นายกิตติสุระ เห็นแก้ว",
    subject: "หัก ณ ที่จ่าย ทีละรายการ",
    status: "ว่าง",
    priority: "ว่าง",
    dueDate: "0000-00-00",
  },
  {
    id: "o5",
    reporter: "นายกิตติสุระ เห็นแก้ว",
    subject: "ข้อมูล สมุดบัญชีรับ 2023 โชว์ไม่ตรง",
    status: "ว่าง",
    priority: "ว่าง",
    dueDate: "0000-00-00",
  },
  {
    id: "o6",
    reporter: "นายกิตติสุระ เห็นแก้ว",
    subject: "กรองประเภทค่าใช้จ่าย",
    status: "ขอข้อมูลเพิ่มเติม",
    priority: "ด่วนมาก",
    dueDate: "0000-00-00",
  },
];

/** แผนก ผลิต */
export const IT_TICKETS_PRODUCTION: ItTicket[] = [
  {
    id: "p1",
    reporter: "นายกิตติสุระ เห็นแก้ว",
    subject: "file Import รอบที่2 ข้อมูลไม่ตรง",
    status: "ว่าง",
    priority: "ว่าง",
    dueDate: "0000-00-00",
  },
  {
    id: "p2",
    reporter: "นายกิตติสุระ เห็นแก้ว",
    subject: "ประวัติเข้า-ออกคลัง ไม่โชว์ข้อมูล",
    status: "รอทดสอบ",
    priority: "ด่วน",
    dueDate: "2023-02-03",
  },
  {
    id: "p3",
    reporter: "นายกิตติสุระ เห็นแก้ว",
    subject: "กรองข้อมูลฝ่ายช่างของแต่ละคน",
    status: "กำลังดำเนินการ",
    priority: "ด่วน",
    dueDate: "2023-03-21",
  },
  {
    id: "p4",
    reporter: "นายกิตติสุระ เห็นแก้ว",
    subject: "คลังผลิต/ขาย",
    status: "ว่าง",
    priority: "ว่าง",
    dueDate: "0000-00-00",
  },
  {
    id: "p5",
    reporter: "นายกิตติสุระ เห็นแก้ว",
    subject: "เพิ่ม category แล้วไม่โชว์ในช่องค้นหา",
    status: "ว่าง",
    priority: "ไม่ด่วน",
    dueDate: "0000-00-00",
  },
];

/** ข้อมูล Pie Dashboard IT (เปอร์เซ็นต์ตามภาพ) */
export const IT_PIE_SLICES = [
  { name: "ออฟฟิศ", value: 40, color: "#14b8a6" },
  { name: "SUPPORT", value: 33.3, color: "#f97316" },
  { name: "ผลิต", value: 26.7, color: "#2563eb" },
];

/** Legend ครบ 6 หมวด (ที่เหลือ 0%) */
export const IT_PIE_LEGEND_FULL = [
  { name: "ออฟฟิศ", pct: 40.0, color: "#14b8a6" },
  { name: "SUPPORT", pct: 33.3, color: "#f97316" },
  { name: "ผลิต", pct: 26.7, color: "#2563eb" },
  { name: "ขาย", pct: 0, color: "#ef4444" },
  { name: "บริหาร", pct: 0, color: "#9333ea" },
  { name: "บริการ", pct: 0, color: "#ec4899" },
];
