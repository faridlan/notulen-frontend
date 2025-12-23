import { useState } from "react";
import MinuteForm from "../components/MinuteForm";
import MinuteList from "../components/MinuteList";

export default function MinutesPage() {
  const [refresh, setRefresh] = useState(0);
  const triggerRefresh = () => setRefresh((r) => r + 1);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 space-y-6">
      <h1 className="text-3xl font-bold">📄 Meeting Minutes</h1>

      {/* CREATE FORM */}
      <MinuteForm onCreated={triggerRefresh} />

      {/* LIST */}
      <MinuteList refreshTrigger={refresh} />
    </div>
  );
}
