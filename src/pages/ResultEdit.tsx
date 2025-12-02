/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getResult, updateResult } from "../services/results.service";

export default function ResultEdit() {
  const { id } = useParams();
  const resultId = Number(id);

  const [result, setResult] = useState<any>(null); // <-- ADD THIS

  const [form, setForm] = useState({
    target: "",
    achievement: 0,
    targetCompletionDate: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const r = await getResult(resultId);
      setResult(r);   // <-- STORE THE RESULT
      setForm({
        target: r.target,
        achievement: r.achievement,
        targetCompletionDate: r.targetCompletionDate.slice(0, 10),
        description: r.description,
      });
      setLoading(false);
    }
    if (!Number.isNaN(resultId)) load();
  }, [resultId]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateResult(resultId, {
        target: form.target,
        achievement: form.achievement,
        targetCompletionDate: new Date(form.targetCompletionDate).toISOString(),
        description: form.description,
      });
      alert("Updated!");
      navigate(`/results/${resultId}`);
    } catch (e: any) {
      alert(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!result) return <div className="p-6">Result not found</div>; // <-- GUARD

  return (
    <div className="p-6 space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Edit Meeting Result</h1>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Meeting:</span>{" "}
            {result.minute.title} (ID: {result.minute.id})
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Target</label>
          <input
            className="border rounded w-full px-3 py-2"
            value={form.target}
            onChange={(e) => setForm({ ...form, target: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Achievement (%)</label>
          <input
            type="number"
            className="border rounded w-full px-3 py-2"
            value={form.achievement}
            onChange={(e) =>
              setForm({ ...form, achievement: Number(e.target.value) })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Target Completion Date
          </label>
          <input
            type="date"
            className="border rounded w-full px-3 py-2"
            value={form.targetCompletionDate}
            onChange={(e) =>
              setForm({ ...form, targetCompletionDate: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="border rounded w-full px-3 py-2"
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
