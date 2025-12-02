import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResults, deleteResult } from "../services/results.service";
import type { MeetingResult } from "../types/MeetingResult";

export default function ResultsList() {
  const [results, setResults] = useState<MeetingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const data = await getResults();
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Soft delete this result?")) return;
    await deleteResult(id);
    await load();
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meeting Results</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => navigate("/results/create")}
        >
          + New Result
        </button>
      </div>

      {results.length === 0 ? (
        <p className="text-gray-500">No results yet.</p>
      ) : (
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">ID</th>
                <th className="border px-4 py-2 text-left">Target</th>
                <th className="border px-4 py-2 text-left">Achievement</th>
                <th className="border px-4 py-2 text-left">Meeting Minute</th>
                <th className="border px-4 py-2 text-left">Created</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{r.id}</td>

                  <td className="border px-4 py-2 max-w-xs">
                    <span className="font-medium truncate inline-block">
                      {r.target}
                    </span>
                  </td>

                  <td className="border px-4 py-2">{r.achievement}%</td>

                  {/* Meeting Minute */}
                  <td className="border px-4 py-2">
                    <button
                      className="text-blue-600 underline"
                      onClick={() => navigate(`/minutes/${r.minute.id}`)}
                    >
                      {r.minute.title} (ID: {r.minute.id})
                    </button>
                  </td>

                  {/* created date */}
                  <td className="border px-4 py-2 text-sm text-gray-600">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleString()
                      : "—"}
                  </td>

                  <td className="border px-4 py-2 space-x-3">
                    <button
                      className="text-blue-600 underline"
                      onClick={() => navigate(`/results/${r.id}`)}
                    >
                      View
                    </button>
                    <button
                      className="text-green-600 underline"
                      onClick={() => navigate(`/results/${r.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 underline"
                      onClick={() => handleDelete(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
