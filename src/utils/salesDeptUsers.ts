/** กลุ่ม user_group ที่เกี่ยวกับฝ่ายขาย (ตาม db_mns ตัวอย่าง) */
export const SALES_GROUP_IDS = new Set([2, 7, 17]);

export function isSalesDeptUser(row: {
  user_gid?: number;
  group_name?: string;
}): boolean {
  const gid = Number(row.user_gid) || 0;
  if (SALES_GROUP_IDS.has(gid)) return true;
  const gn = String(row.group_name ?? "").toLowerCase();
  return gn.includes("ขาย") || gn.includes("sale");
}
