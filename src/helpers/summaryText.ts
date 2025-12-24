export function summarizeNumberedText(text: string, maxLength = 60): string {
  if (!text) return "";

  // Split lines
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return "";

  // Take first line
  let first = lines[0];

  // Remove leading numbering: "1. xxx"
  first = first.replace(/^\d+\.\s*/, "");

  // Truncate
  if (first.length > maxLength) {
    return first.slice(0, maxLength) + "...";
  }

  return first;
}
