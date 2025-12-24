// src/helpers/exportResultPDF.ts
import jsPDF from "jspdf";
import type { MeetingResult } from "../types/MeetingResult";
import logoImg from "../assets/logo-full-one-color.png";

/* ============================
   HELPER: Render Numbered Text
   ============================ */
function renderNumberedSection(
  doc: jsPDF,
  text: string | undefined,
  startX: number,
  startY: number,
  maxWidth: number,
  lineHeight = 14
): number {
  if (!text || !text.trim()) {
    doc.text("-", startX, startY);
    return startY + lineHeight;
  }

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let y = startY;

  const isNumbered = lines.every((l) => /^\d+\.\s+/.test(l));

  // Fallback: normal paragraph
  if (!isNumbered) {
    const split = doc.splitTextToSize(text, maxWidth);
    doc.text(split, startX, y);
    return y + split.length * lineHeight;
  }

  // Proper numbered list
  lines.forEach((line) => {
    const numberMatch = line.match(/^(\d+)\./);
    const numberLabel = numberMatch ? `${numberMatch[1]})` : "•";
    const cleanText = line.replace(/^\d+\.\s*/, "");

    const numberWidth = 20;
    const textX = startX + numberWidth;

    // number
    doc.text(numberLabel, startX, y);

    // wrapped text
    const wrapped = doc.splitTextToSize(cleanText, maxWidth - numberWidth);
    doc.text(wrapped, textX, y);

    y += wrapped.length * lineHeight;
  });

  return y;
}

/* ============================
   MAIN EXPORT FUNCTION
   ============================ */
export async function exportResultPDF(result: MeetingResult) {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 50;
  let y = 50;

  const primaryColor: [number, number, number] = [0, 51, 102];
  const secondaryColor: [number, number, number] = [120, 120, 120];

  /* ---------- LETTERHEAD ---------- */
  try {
    const logoData = await loadImageAsDataUrl(logoImg);
    doc.addImage(logoData, "PNG", marginX, y - 15, 100, 40);
  } catch {
    doc.setFont("helvetica", "bold");
    doc.text("BANK GALUH", marginX, y);
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...secondaryColor);
  const address =
    "Bank Galuh Ciamis\nJl. MR Iwa Kusumasoemantri, Kertasari\nKabupaten Ciamis, Jawa Barat 46211";
  doc.text(address, pageWidth - marginX, y, { align: "right" });

  y += 50;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1.5);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 35;

  /* ---------- TITLE ---------- */
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("MEETING RESULT REPORT", pageWidth / 2, y, { align: "center" });
  y += 35;

  /* ---------- INFO TABLE ---------- */
  const infoRows = [
    ["Result ID:", String(result.id)],
    ["Achievement:", `${result.achievement}%`],
    [
      "Completion Date:",
      new Date(result.targetCompletionDate).toLocaleDateString(),
    ],
    ["Meeting Minute:", result.minute.title],
    [
      "Created At:",
      result.createdAt ? new Date(result.createdAt).toLocaleString() : "-",
    ],
  ];

  doc.setFontSize(10);
  infoRows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, marginX, y);

    doc.setFont("helvetica", "normal");
    const splitValue = doc.splitTextToSize(value, pageWidth - marginX - 160);
    doc.text(splitValue, marginX + 120, y);

    y += splitValue.length * 14 + 4;
  });

  y += 10;
  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 25;

  /* ---------- TARGET ---------- */
  if (y > pageHeight - 150) {
    doc.addPage();
    y = 50;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text("Target", marginX, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);

  y = renderNumberedSection(
    doc,
    result.target,
    marginX,
    y,
    pageWidth - marginX * 2
  );

  y += 25;

  /* ---------- DESCRIPTION / OUTCOME ---------- */
  if (y > pageHeight - 150) {
    doc.addPage();
    y = 50;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text("Result Description & Outcome", marginX, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);

  y = renderNumberedSection(
    doc,
    result.description,
    marginX,
    y,
    pageWidth - marginX * 2
  );

  y += 30;

  /* ---------- SIGNATURE ---------- */
  if (y > pageHeight - 120) {
    doc.addPage();
    y = 50;
  } else {
    y = pageHeight - 140;
  }

  const signatureX = pageWidth - marginX - 150;
  doc.setFontSize(10);
  doc.text(`Ciamis, ${new Date().toLocaleDateString()}`, signatureX, y);

  y += 15;
  doc.text("Notulen,", signatureX, y);

  y += 50;
  doc.line(signatureX, y, signatureX + 130, y);

  y += 12;
  doc.setFont("helvetica", "bold");
  doc.text("Salsabila Putri, R. S.Kom", signatureX, y);

  doc.save(`Result_Report_${result.id}.pdf`);
}

/* ---------- IMAGE LOADER ---------- */
async function loadImageAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
