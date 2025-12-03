export default function PDFReportFrame({
  children,
  title = "MEETING RESULT REPORT",
  logo = "/logo.png", // you can change or remove
}: {
  children: React.ReactNode;
  title?: string;
  logo?: string;
}) {
  return (
    <div
      className="p-8 max-w-3xl mx-auto bg-white text-gray-900"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 border-b pb-4 mb-6">
        {logo && (
          <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
        )}
        <div>
          <h1 className="text-xl font-bold">Company Name</h1>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="space-y-6">{children}</div>

      {/* FOOTER */}
      <div className="border-t pt-4 mt-10 text-xs text-gray-500 text-center">
        Generated on: {new Date().toLocaleString()}
      </div>
    </div>
  );
}
