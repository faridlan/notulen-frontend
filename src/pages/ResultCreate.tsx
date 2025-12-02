/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createResult } from "../services/results.service";
import { getMinutes } from "../services/minutes.service";
import type { MeetingMinute } from "../types/MeetingMinute";

export default function ResultCreate() {
  const [minutes, setMinutes] = useState<MeetingMinute[]>([]);
  const [loadingMinutes, setLoadingMinutes] = useState(true);

  const [form, setForm] = useState({
    minuteId: 0,
    target: "",
    achievement: 0,
    targetCompletionDate: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Load all meeting minutes for the dropdown
  useEffect(() => {
    async function load() {
      try {
        const data = await getMinutes();
        setMinutes(data);
        if (data.length > 0) {
          setForm((f) => ({ ...f, minuteId: data[0].id })); // default select first
        }
      } finally {
        setLoadingMinutes(false);
      }
    }

    load();
  }, []);

  async function handleCreate() {
    try {
      setSaving(true);

      await createResult({
        minuteId: form.minuteId,
        target: form.target,
        achievement: form.achievement,
        targetCompletionDate: new Date(
          form.targetCompletionDate
        ).toISOString(),
        description: form.description,
      });

      alert("Created!");
      navigate("/results");
    } catch (e: any) {
      alert(e.message || "Create failed");
    } finally {
      setSaving(false);
    }
  }

  if (loadingMinutes) return <div className="p-6">Loading minutes...</div>;

  return (
    <div className="p-6 space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Create Meeting Result</h1>

      <div className="space-y-3">
        {/* Dropdown for minuteId */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Meeting Minute</label>
          <select
            className="border rounded w-full px-3 py-2"
            value={form.minuteId}
            onChange={(e) =>
              setForm({ ...form, minuteId: Number(e.target.value) })
            }
          >
            {minutes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} (ID: {m.id})
              </option>
            ))}
          </select>
        </div>

        {/* Target */}
        <div>
          <label className="block text-sm font-medium mb-1">Target</label>
          <input
            className="border rounded w-full px-3 py-2"
            value={form.target}
            onChange={(e) => setForm({ ...form, target: e.target.value })}
          />
        </div>

        {/* Achievement */}
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

        {/* Completion Date */}
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

        {/* Description */}
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
          onClick={handleCreate}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {saving ? "Saving..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
