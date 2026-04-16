import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function safeFilename(ref: string): string {
  const s = ref.replace(/[^\w\-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  return s.slice(0, 80) || "expense-claim";
}

const CANVAS_OPTS = {
  scale: 2,
  useCORS: true,
  logging: false,
  backgroundColor: "#ffffff",
} as const;

export async function exportClaimCardToJpeg(
  element: HTMLElement,
  displayRef: string,
): Promise<void> {
  const canvas = await html2canvas(element, CANVAS_OPTS);
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/jpeg", 0.92);
  a.download = `${safeFilename(displayRef)}.jpg`;
  a.click();
}

/** PDF หลายหน้าเมื่อฟอร์มสูงกว่า A4 (ยึดความกว้างเต็มกรอบ) */
export async function exportClaimCardToPdf(
  element: HTMLElement,
  displayRef: string,
): Promise<void> {
  const canvas = await html2canvas(element, CANVAS_OPTS);
  const imgData = canvas.toDataURL("image/jpeg", 0.88);
  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const contentW = pageW - margin * 2;
  const contentH = pageH - margin * 2;
  const imgW = canvas.width;
  const imgH = canvas.height;
  const scaledH = (imgH * contentW) / imgW;

  let yPrinted = 0;
  let isFirst = true;
  while (yPrinted < scaledH) {
    if (!isFirst) {
      pdf.addPage();
    }
    isFirst = false;
    const sliceTop = yPrinted;
    pdf.addImage(
      imgData,
      "JPEG",
      margin,
      margin - sliceTop,
      contentW,
      scaledH,
    );
    yPrinted += contentH;
  }

  pdf.save(`${safeFilename(displayRef)}.pdf`);
}
