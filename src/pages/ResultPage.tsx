// src/pages/ResultPage.tsx
import { useState } from "react";
import ResultForm from "../components/ResultForm";
import ResultList from "../components/ResultList";

export default function ResultPage() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        📊 Meeting Results
      </h1>

      {/* CREATE FORM */}
      <ResultForm onCreated={() => setRefresh((r) => r + 1)} />

      {/* LIST */}
      <ResultList refreshTrigger={refresh} />
    </div>
  );
}
