import jsPDF from "jspdf";
import type { MeetingMinute } from "../types/MeetingMinute";
import formatFullDate from "../utils/formatDate";
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
  const marginX = 50;
  let y = 50;

  const primaryColor: [number, number, number] = [0, 51, 102];
  const secondaryColor: [number, number, number] = [100, 100, 100];

  /* ---------- LETTERHEAD ---------- */
  try {
    const logoData = await loadImageAsDataUrl(logoImg);
    doc.addImage(logoData, "PNG", marginX, y - 15, 100, 40);
  } catch {
    doc.setFont("helvetica", "bold");
    doc.text("COMPANY NAME", marginX, y);
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
  doc.text("NOTULEN RAPAT", pageWidth / 2, y, { align: "center" });
  y += 30;

  /* ---------- INFO TABLE ---------- */
  const infoData = [
    ["Title:", minute.title],
    ["Meeting Date:", formatFullDate(minute.meetingDate)],
    ["Division:", minute.division],
    ["Speaker:", minute.speaker || "-"],
    ["Participants:", String(minute.numberOfParticipants)],
    ["Members:", minute.members?.map((m) => m.name).join(", ") || "-"],
  ];

  doc.setFontSize(10);
  infoData.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, marginX, y);

    doc.setFont("helvetica", "normal");
    const splitValue = doc.splitTextToSize(value, pageWidth - marginX - 150);
    doc.text(splitValue, marginX + 100, y);
    y += splitValue.length * 14 + 4;
  });

  y += 10;
  doc.setDrawColor(230, 230, 230);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 25;

  /* ---------- SUMMARY & NOTES ---------- */
  const sections = [
    { title: "Summary", content: minute.summary },
    { title: "Discussion Notes", content: minute.notes },
  ];

  sections.forEach((section) => {
    if (y > pageHeight - 150) {
      doc.addPage();
      y = 50;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text(section.title, marginX, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);

    y = renderNumberedSection(
      doc,
      section.content,
      marginX,
      y,
      pageWidth - marginX * 2
    );

    y += 25;
  });

  /* ---------- SIGNATURE ---------- */
  if (y > pageHeight - 120) {
    doc.addPage();
    y = 50;
  } else {
    y = pageHeight - 130;
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

  /* ---------- IMAGES ---------- */
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

      if (y + imgHeight > pageHeight - 50) {
        doc.addPage();
        y = 50;
      }

      try {
        const dataUrl = await loadImageAsDataUrl(
          resolveImageUrl(images[i].url)
        );
        doc.addImage(dataUrl, "JPEG", xPos, y, imgWidth, imgHeight);
      } catch {
        doc.rect(xPos, y, imgWidth, imgHeight);
        doc.text("Image N/A", xPos + 10, y + 20);
      }

      if (col === 1) y += imgHeight + 20;
    }
  }

  doc.save(`Minute_Report_${minute.id}.pdf`);
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
