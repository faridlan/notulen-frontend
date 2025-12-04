import jsPDF from "jspdf";
import type { MeetingResult } from "../types/MeetingResult";

export async function exportResultPDF(result: MeetingResult) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let y = 40;

  const blue: [number, number, number] = [0, 91, 170];

  // HEADER
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...blue);
  doc.text("Meeting Result Report", marginX, y);

  y += 12;
  doc.setDrawColor(...blue);
  doc.line(marginX, y, pageWidth - marginX, y);

  // TITLE
  y += 28;
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(result.target, marginX, y);

  // META INFO
  y += 26;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);

  const info = [
    `Result ID: ${result.id}`,
    `Achievement: ${result.achievement}%`,
    `Target Completion Date: ${new Date(
      result.targetCompletionDate
    ).toLocaleDateString()}`,
    `Meeting Minute: ${result.minute.title} (ID: ${result.minute.id})`,
    result.createdAt
      ? `Created At: ${new Date(result.createdAt).toLocaleString()}`
      : "",
  ];

  const usableWidth = pageWidth - marginX * 2;

  info.forEach((line) => {
    if (!line) return;
    const wrapped = doc.splitTextToSize(line, usableWidth);
    doc.text(wrapped, marginX, y);
    y += wrapped.length * 14;
  });

  // SEPARATOR
  y += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 20;

  // DESCRIPTION
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...blue);
  doc.text("Description", marginX, y);

  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);

  const descriptionLines = doc.splitTextToSize(
    result.description || "-",
    usableWidth
  );

  const maxY = doc.internal.pageSize.getHeight() - 40;
  if (y + descriptionLines.length * 14 > maxY) {
    doc.addPage();
    y = 40;
  }

  doc.text(descriptionLines, marginX, y);

  doc.save(`Result-${result.id}.pdf`);
}
