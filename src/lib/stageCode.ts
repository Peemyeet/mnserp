/** สอดคล้องกับ server/lib/stage.mjs — แปลงชื่อสถานะจากตาราง workstatus */
export function wsNameToStageCode(wsName: string | null | undefined): string {
  const s = String(wsName ?? "").trim();
  const m = /^(N\d+(?:\.\d+)?)/.exec(s);
  return m ? m[1] : "N01";
}
