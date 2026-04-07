/** แปลงรหัสขั้น N01 / N17.1 → ws_id ในตาราง workstatus (เลขหลักก่อนจุด) */
export function stageCodeToWsId(code) {
  const s = String(code ?? "").trim();
  const m = /^N(\d+)(?:\.(\d+))?/.exec(s);
  if (!m) return 1;
  const n = parseInt(m[1], 10);
  if (Number.isNaN(n) || n < 1) return 1;
  if (n > 20) return 20;
  return n;
}

/** จากชื่อเช่น "N06. เสนอราคา" → "N06" */
export function wsNameToStageCode(wsName) {
  const s = String(wsName ?? "").trim();
  const m = /^(N\d+(?:\.\d+)?)/.exec(s);
  return m ? m[1] : "N01";
}
