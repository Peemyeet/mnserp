export function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function toCsvRow(cells: string[]) {
  return cells
    .map((c) => `"${c.replace(/"/g, '""')}"`)
    .join(",");
}
