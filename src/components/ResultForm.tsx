/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Select from "react-select";
import { createResult } from "../services/results.service";
import { getMinutes } from "../services/minutes.service";
import type { MeetingMinute } from "../types/MeetingMinute";
import { useToast } from "./common/ToastProvider";
import {
  validateResult,
  type ResultForm as FormType,
} from "../utils/validateResult";

interface Props {
  onCreated: () => void;
}

export default function ResultForm({ onCreated }: Props) {
  const { showToast } = useToast();

  const [form, setForm] = useState<FormType>({
    minuteId: null,
    target: "",
    achievement: 0,
    targetCompletionDate: "",
    description: "",
  });

  const [minutes, setMinutes] = useState<MeetingMinute[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMinutes()
      .then(setMinutes)
      .catch(() => showToast("Failed to load meeting minutes", "error"));
  }, []);

  const minuteOptions = minutes.map((m) => ({
    value: m.id,
    label: `${m.title} (ID: ${m.id})`,
  }));

  const selectedMinute =
    form.minuteId != null
      ? minutes.find((m) => m.id === form.minuteId) || null
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const error = validateResult(form);
    if (error) {
      showToast(error, "error");
      return;
    }

    try {
      setSaving(true);

      await createResult({
        minuteId: form.minuteId!,
        target: form.target.trim(),
        achievement: form.achievement,
        targetCompletionDate: new Date(
          form.targetCompletionDate
        ).toISOString(),
        description: form.description.trim(),
      });

      showToast("Result created successfully!", "success");
      onCreated();

      setForm({
        minuteId: null,
        target: "",
        achievement: 0,
        targetCompletionDate: "",
        description: "",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-5 rounded-xl shadow space-y-4"
    >
      <h2 className="text-lg font-semibold">➕ Add Meeting Result</h2>

      {/* Minute selector */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Link to Meeting Minute
        </label>

        <Select
          isSearchable
          isClearable
          options={minuteOptions}
          placeholder="Select meeting minute..."
          value={
            minuteOptions.find((o) => o.value === form.minuteId) || null
          }
          onChange={(opt) =>
            setForm({ ...form, minuteId: opt ? opt.value : null })
          }
        />

        {selectedMinute && (
          <div className="mt-2 text-xs bg-gray-50 border rounded-lg p-2 grid grid-cols-2 gap-1">
            <p>
              <strong>Title:</strong> {selectedMinute.title}
            </p>
            <p>
              <strong>Division:</strong> {selectedMinute.division}
            </p>
            <p>
              <strong>Speaker:</strong> {selectedMinute.speaker}
            </p>
          </div>
        )}
      </div>

      {/* Target + Achievement INLINE */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Target</label>
          <input
            className={`border rounded w-full px-3 py-2 text-sm ${
              !form.target.trim() ? "border-red-500" : ""
            }`}
            value={form.target}
            onChange={(e) =>
              setForm({ ...form, target: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Achievement %
          </label>
          <input
            type="number"
            min={0}
            max={100}
            className={`border rounded w-full px-3 py-2 text-sm ${
              form.achievement < 0 || form.achievement > 100
                ? "border-red-500"
                : ""
            }`}
            value={form.achievement}
            onChange={(e) =>
              setForm({
                ...form,
                achievement: Number(e.target.value),
              })
            }
          />
        </div>
      </div>

      {/* Date + Description */}
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Completion Date
          </label>
          <input
            type="date"
            className={`border rounded w-full px-3 py-2 text-sm ${
              !form.targetCompletionDate ? "border-red-500" : ""
            }`}
            value={form.targetCompletionDate}
            onChange={(e) =>
              setForm({
                ...form,
                targetCompletionDate: e.target.value,
              })
            }
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            rows={2}
            className={`border rounded w-full px-3 py-2 text-sm ${
              !form.description.trim() ? "border-red-500" : ""
            }`}
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button
          disabled={saving}
        className="w-full px-4 py-2 bg-[#005BAA] hover:bg-[#0668C2] text-white rounded-lg disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add Result"}
        </button>
      </div>
    </form>
  );
}
