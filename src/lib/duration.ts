/** แสดงระยะเวลาอยู่ในขั้นปัจจุบัน (คร่าวๆ) */
export function formatTimeInStage(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return "-";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "ไม่ถึง 1 นาที";
  if (minutes < 60) return `${minutes} นาที`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} ชม.`;
  const days = Math.floor(hours / 24);
  return `${days} วัน`;
}
