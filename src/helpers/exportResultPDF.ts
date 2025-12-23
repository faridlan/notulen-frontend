/* eslint-disable @typescript-eslint/no-unused-vars */
// src/helpers/exportResultPDF.ts
import jsPDF from "jspdf";
import type { MeetingResult } from "../types/MeetingResult";
// 1. IMPORT YOUR LOGO
import logoImg from "../assets/logo-full-one-color.png";

/**
 * Generate a professional corporate Meeting Result PDF
 */
export async function exportResultPDF(result: MeetingResult) {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 50;
  let y = 50;

  const primaryColor: [number, number, number] = [0, 51, 102]; // Navy Blue
  const secondaryColor: [number, number, number] = [120, 120, 120];

  // ---------- 1. LETTERHEAD ----------
  try {
    const logoData = await loadImageAsDataUrl(logoImg);
    doc.addImage(logoData, "PNG", marginX, y - 15, 100, 40);
  } catch (error) {
    doc.setFont("helvetica", "bold");
    doc.text("BANK GALUH", marginX, y);
  }

  // Right-aligned Corporate Address
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

  // ---------- 2. DOCUMENT TITLE ----------
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("MEETING RESULT REPORT", pageWidth / 2, y, { align: "center" });
  y += 35;

  // ---------- 3. RESULT INFO TABLE ----------
  const infoLabels = [
    ["Target Item:", result.target],
    ["Result ID:", String(result.id)],
    ["Achievement:", `${result.achievement}%`],
    [
      "Completion Date:",
      new Date(result.targetCompletionDate).toLocaleDateString(),
    ],
    ["Related Minute:", result.minute.title],
    [
      "Report Created:",
      result.createdAt ? new Date(result.createdAt).toLocaleString() : "-",
    ],
  ];

  doc.setFontSize(10);
  infoLabels.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text(label, marginX, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const splitValue = doc.splitTextToSize(value, pageWidth - marginX - 160);
    doc.text(splitValue, marginX + 110, y);

    y += splitValue.length * 14 + 5;
  });

  y += 10;
  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 30;

  // ---------- 4. DESCRIPTION / OUTCOME ----------
  // Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text("Result Description & Outcome", marginX, y);
  y += 18;

  // Content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  const splitDesc = doc.splitTextToSize(
    result.description || "-",
    pageWidth - marginX * 2
  );

  // Check if description causes page overflow
  if (y + splitDesc.length * 14 > pageHeight - 150) {
    doc.addPage();
    y = 60;
  }

  doc.text(splitDesc, marginX, y);
  y += splitDesc.length * 14 + 40;

  // ---------- 5. SIGNATURE SECTION ----------
  // Position it at the bottom of the page
  if (y > pageHeight - 150) {
    doc.addPage();
    y = 60;
  } else {
    y = pageHeight - 140;
  }

  const signatureX = pageWidth - marginX - 150;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Ciamis, ${new Date().toLocaleDateString()}`, signatureX, y);

  y += 15;
  doc.text("Notulen,", signatureX, y);

  y += 50; // Space for physical signature
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(signatureX, y, signatureX + 130, y); // Signature line

  y += 12;
  doc.setFont("helvetica", "bold");
  doc.text("Salsabila Putri, R. S.Kom", signatureX, y);

  doc.save(`Result_Report_${result.id}.pdf`);
}

/**
 * Utility to load image to Base64
 */
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
