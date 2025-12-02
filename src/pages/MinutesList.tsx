import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMinutes, deleteMinute } from "../services/minutes.service";
import type { MeetingMinute } from "../types/MeetingMinute";

export default function MinutesList() {
  const [minutes, setMinutes] = useState<MeetingMinute[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const data = await getMinutes();
      setMinutes(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Soft delete this meeting minute?")) return;
    await deleteMinute(id);
    await load();
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Meeting Minutes</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => navigate("/minutes/create")}
        >
          + New Minute
        </button>
      </div>

      {minutes.length === 0 ? (
        <p className="text-gray-500">No meeting minutes yet.</p>
      ) : (
        <table className="min-w-full border bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">ID</th>
              <th className="border px-3 py-2 text-left">Title</th>
              <th className="border px-3 py-2 text-left">Division</th>
              <th className="border px-3 py-2 text-left">Speaker</th>
              <th className="border px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {minutes.map(m => (
              <tr key={m.id}>
                <td className="border px-3 py-2">{m.id}</td>
                <td className="border px-3 py-2">{m.title}</td>
                <td className="border px-3 py-2">{m.division}</td>
                <td className="border px-3 py-2">{m.speaker}</td>
                <td className="border px-3 py-2 space-x-2">
                  <button
                    className="text-blue-600 underline"
                    onClick={() => navigate(`/minutes/${m.id}`)}
                  >
                    View
                  </button>
                  <button
                    className="text-green-600 underline"
                    onClick={() => navigate(`/minutes/${m.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 underline"
                    onClick={() => handleDelete(m.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
