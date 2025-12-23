/* eslint-disable @typescript-eslint/no-unused-vars */
import jsPDF from "jspdf";
import type { MeetingMinute } from "../types/MeetingMinute";
import formatFullDate from "../utils/formatDate";
import logoImg from "../assets/logo-full-one-color.png";

export async function exportMinutePDF(
  minute: MeetingMinute,
  resolveImageUrl: (url: string) => string
) {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 50; // Standard corporate margin
  let y = 50;

  const primaryColor: [number, number, number] = [0, 51, 102]; // Dark Navy Blue
  const secondaryColor: [number, number, number] = [100, 100, 100];

  // ---------- 1. LETTERHEAD ----------
  try {
    // Convert logo to base64 so it's ready for the PDF
    const logoData = await loadImageAsDataUrl(logoImg);
    // Parameters: image, type, x, y, width, height
    doc.addImage(logoData, "PNG", marginX, y - 15, 100, 40);
  } catch (error) {
    console.error("Logo failed to load", error);
    doc.setFont("helvetica", "bold");
    doc.text("COMPANY NAME", marginX, y);
  }

  // Company Address (Right Aligned)
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...secondaryColor);
  const address =
    "Bank Galuh Ciamis\nJl. MR Iwa Kusumasoemantri, Kertasari\nKabupaten Ciamis, Jawa Barat 46211";
  doc.text(address, pageWidth - marginX, y, { align: "right" });

  y += 50;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1.5);
  doc.line(marginX, y, pageWidth - marginX, y); // Decorative line
  y += 35;

  // ---------- 2. REPORT TITLE ----------
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("NOTULEN RAPAT", pageWidth / 2, y, { align: "center" });
  y += 30;

  // ---------- 3. INFO SECTION (Table Style) ----------
  const infoData = [
    ["Title:", minute.title],
    ["Meeting Date:", formatFullDate(minute.meetingDate)],
    ["Division:", minute.division],
    ["Speaker:", minute.speaker],
    ["Participants:", String(minute.numberOfParticipants)],
    ["Members:", minute.members?.map((m) => m.name).join(", ") || "-"],
  ];

  doc.setFontSize(10);
  infoData.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, marginX, y);
    doc.setFont("helvetica", "normal");

    // Wrap text for long member lists
    const splitValue = doc.splitTextToSize(value, pageWidth - marginX - 150);
    doc.text(splitValue, marginX + 100, y);
    y += splitValue.length * 14 + 4;
  });

  y += 10;
  doc.setDrawColor(230, 230, 230);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 25;

  // ---------- 4. SUMMARY & NOTES ----------
  const sections = [
    { title: "Summary", content: minute.summary },
    { title: "Discussion Notes", content: minute.notes },
  ];

  sections.forEach((section) => {
    // Check for page overflow
    if (y > pageHeight - 150) {
      doc.addPage();
      y = 50;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text(section.title, marginX, y);
    y += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    const splitContent = doc.splitTextToSize(
      section.content || "-",
      pageWidth - marginX * 2
    );
    doc.text(splitContent, marginX, y);
    y += splitContent.length * 14 + 25;
  });

  // ---------- 5. SIGNATURE SECTION ----------
  // Ensure signature isn't cut off
  if (y > pageHeight - 120) {
    doc.addPage();
    y = 50;
  } else {
    y = pageHeight - 130; // Position near bottom
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

  // ---------- 6. IMAGES (Separate Page) ----------
  const images = minute.images || [];
  if (images.length > 0) {
    doc.addPage();
    y = 50;
    doc.setFontSize(14);
    doc.text("Documentation / Attachments", marginX, y);
    y += 30;

    const imgWidth = 220;
    const imgHeight = 150;

    for (let i = 0; i < images.length; i++) {
      const col = i % 2;
      const xPos = marginX + col * (imgWidth + 20);

      // New page if next row exceeds height
      if (y + imgHeight > pageHeight - 50) {
        doc.addPage();
        y = 50;
      }

      try {
        const dataUrl = await loadImageAsDataUrl(
          resolveImageUrl(images[i].url)
        );
        doc.addImage(dataUrl, "JPEG", xPos, y, imgWidth, imgHeight);
      } catch (e) {
        doc.rect(xPos, y, imgWidth, imgHeight);
        doc.text("Image N/A", xPos + 10, y + 20);
      }

      if (col === 1) y += imgHeight + 20; // Move to next row after 2 images
    }
  }

  doc.save(`Minute_Report_${minute.id}.pdf`);
}

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
