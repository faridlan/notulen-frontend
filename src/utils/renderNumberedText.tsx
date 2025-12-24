export function renderNumberedText(text?: string) {
  if (!text) return null;

  const lines = text.split("\n").filter(Boolean);

  const isNumbered = lines.every((l) => /^\d+\.\s+/.test(l));

  if (!isNumbered) {
    return (
      <div className="whitespace-pre-line">
        {text}
      </div>
    );
  }

  return (
    <ol className="list-decimal pl-6 space-y-1">
      {lines.map((line, i) => (
        <li key={i}>
          {line.replace(/^\d+\.\s+/, "")}
        </li>
      ))}
    </ol>
  );
}
