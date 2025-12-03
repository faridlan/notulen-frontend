// src/helpers/exportMinutePdf.ts
import jsPDF from "jspdf";
import type { MeetingMinute } from "../types/MeetingMinute";

/**
 * Generate a clean, minimalist corporate-style PDF
 * for a Meeting Minute (no screenshots, pure vector text).
 */
export async function exportMinutePDF(
  minute: MeetingMinute,
  resolveImageUrl: (url: string) => string
) {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let y = 40;

  const blue: [number, number, number] = [0, 91, 170];

  // ---------- HEADER ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...blue);
  doc.text("Meeting Minutes Report", marginX, y);

  // underline
  y += 12;
  doc.setDrawColor(...blue);
  doc.setLineWidth(1);
  doc.line(marginX, y, pageWidth - marginX, y);

  // ---------- TITLE ----------
  y += 24;
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(minute.title, marginX, y);

  // ---------- META INFO ----------
  doc.setFontSize(11);
  y += 22;

  const infoLines = [
    `Division: ${minute.division}`,
    `Speaker: ${minute.speaker}`,
    `Participants: ${minute.numberOfParticipants}`,
    `Members: ${
      minute.members && minute.members.length > 0
        ? minute.members.map((m) => m.name).join(", ")
        : "-"
    }`,
  ];

  const usableWidth = pageWidth - marginX * 2;

  infoLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, usableWidth);
    doc.text(wrapped, marginX, y);
    y += wrapped.length * 14; // line height
  });

  // small separator
  y += 8;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 18;

  // ---------- NOTES SECTION ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...blue);
  doc.text("Notes", marginX, y);

  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);

  const notesLines = doc.splitTextToSize(minute.notes || "-", usableWidth);

  // if notes too long, start a new page gracefully
  const maxY = doc.internal.pageSize.getHeight() - 60;
  if (y + notesLines.length * 14 > maxY) {
    doc.addPage();
    y = 40;
  }

  doc.text(notesLines, marginX, y);
  y += notesLines.length * 14 + 10;

  // ---------- IMAGES SECTION ----------
  const images = minute.images || [];
  if (images.length > 0) {
    // new page for images
    doc.addPage();
    y = 40;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...blue);
    doc.text("Images", marginX, y);

    y += 16;

    // layout: 2 images per row
    const innerWidth = pageWidth - marginX * 2;
    const gap = 12;
    const colWidth = (innerWidth - gap) / 2;
    const imgHeight = 140;
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const col = i % 2;
      const rowY = y + Math.floor(i / 2) * (imgHeight + 30);
      const x = marginX + col * (colWidth + gap);

      // if out of space, new page
      if (rowY + imgHeight > pageHeight - 60) {
        doc.addPage();
        y = 40;
      }

      const url = resolveImageUrl(img.url);

      try {
        const dataUrl = await loadImageAsDataUrl(url);
        doc.addImage(dataUrl, "JPEG", x, rowY, colWidth, imgHeight);
      } catch {
        // if image fails, just draw a placeholder box
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.5);
        doc.rect(x, rowY, colWidth, imgHeight);
        doc.setFontSize(9);
        doc.text("Image load failed", x + 10, rowY + 20);
      }
    }
  }

  doc.save(`${minute.title || "meeting-minute"}-report.pdf`);
}

/**
 * Helper: load remote image URL into base64 DataURL
 * so jsPDF can embed it.
 */
async function loadImageAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url, { mode: "cors" });
  const blob = await res.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
}
