/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMinutes } from "../services/minutes.service";
import { getResults } from "../services/results.service";

import type { MeetingMinute } from "../types/MeetingMinute";
import type { MeetingResult } from "../types/MeetingResult";

import formatFullDate from "../utils/formatDate";

export default function Dashboard() {
  const [minutes, setMinutes] = useState<MeetingMinute[]>([]);
  const [results, setResults] = useState<MeetingResult[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    const m = await getMinutes();
    const r = await getResults();
    setMinutes(m);
    setResults(r);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard Summary</h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardCard
          title="Total Meeting Minutes"
          value={minutes.length}
        />

        <DashboardCard
          title="Total Meeting Results"
          value={results.length}
        />
      </div>

      {/* RECENT ACTIVITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Minutes */}
        <div className="bg-white rounded-xl shadow p-6 border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Recent Meeting Minutes
          </h2>

          {minutes.slice(0, 5).map((m) => (
            <div
              key={m.id}
              className="border-b py-2 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{m.title}</p>
                <p className="text-sm text-gray-600">{formatFullDate(m.createdAt)}</p>
              </div>

              <button
                className="text-blue-600 hover:underline text-sm"
                onClick={() => navigate(`/minutes/${m.id}`)}
              >
                View
              </button>
            </div>
          ))}

          {minutes.length === 0 && (
            <p className="text-gray-500 italic">No meeting minutes yet.</p>
          )}
        </div>

        {/* Recent Results */}
        <div className="bg-white rounded-xl shadow p-6 border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Recent Meeting Results
          </h2>

          {results.slice(0, 5).map((r) => (
            <div
              key={r.id}
              className="border-b py-2 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{r.target}</p>
                <p className="text-sm text-gray-600">
                  Achievement: {r.achievement}%
                </p>
              </div>

              <button
                className="text-blue-600 hover:underline text-sm"
                onClick={() => navigate(`/results/${r.id}`)}
              >
                View
              </button>
            </div>
          ))}

          {results.length === 0 && (
            <p className="text-gray-500 italic">No results yet.</p>
          )}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white rounded-xl shadow p-6 border space-y-4">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Quick Actions</h2>

        <div className="flex flex-wrap gap-3">
          <button
            className="px-4 py-2 bg-[#005BAA] hover:bg-[#0668C2] text-white rounded-lg"
            onClick={() => navigate("/minutes")}
          >
            View All Minutes
          </button>

          <button
            className="px-4 py-2 bg-[#005BAA] hover:bg-[#0668C2] text-white rounded-lg"
            onClick={() => navigate("/results")}
          >
            View All Results
          </button>

        </div>
      </div>
    </div>
  );
}

/* ===== Reusable Card Component ===== */
function DashboardCard({
  title,
  value
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border flex flex-col">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold mt-2 text-[#005BAA]">{value}</p>
    </div>
  );
}
