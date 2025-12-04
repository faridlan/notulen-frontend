/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Modal from "./common/Modal";
import Select from "react-select";

import { createResult } from "../services/results.service";
import { getMinutes } from "../services/minutes.service";
import type { MeetingMinute } from "../types/MeetingMinute";

import { useToast } from "./common/ToastProvider";
import { validateResult, type ResultForm } from "../utils/validateResult";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface MinuteOption {
  value: number;
  label: string;
  minute: MeetingMinute;
}

export default function CreateResultModal({ open, onClose, onCreated }: Props) {
  const { showToast } = useToast();

  const [form, setForm] = useState<ResultForm>({
    minuteId: null,
    target: "",
    achievement: 0,
    targetCompletionDate: "",
    description: "",
  });

  const [minutes, setMinutes] = useState<MeetingMinute[]>([]);
  const [loadingMinutes, setLoadingMinutes] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load minutes when modal opens
  useEffect(() => {
    async function loadMinutes() {
      try {
        setLoadingMinutes(true);
        const data = await getMinutes();
        setMinutes(data);
      } catch (err: any) {
        showToast(err.message || "Failed to load meeting minutes", "error");
      } finally {
        setLoadingMinutes(false);
      }
    }

    if (open) {
      loadMinutes();
    }
  }, [open, showToast]);

  const minuteOptions: MinuteOption[] = minutes.map((m) => ({
    value: m.id,
    label: `${m.title} (ID: ${m.id})`,
    minute: m,
  }));

  const selectedMinute =
    form.minuteId != null
      ? minutes.find((m) => m.id === form.minuteId) || null
      : null;

  async function handleCreate() {
    const error = validateResult(form);
    if (error) {
      showToast(error, "error");
      return;
    }

    try {
      setSaving(true);

      await createResult({
        minuteId: form.minuteId as number,
        target: form.target.trim(),
        achievement: form.achievement,
        targetCompletionDate: new Date(
          form.targetCompletionDate
        ).toISOString(),
        description: form.description.trim(),
      });

      showToast("Result created successfully!", "success");
      onCreated();
      onClose();
      // reset form
      setForm({
        minuteId: null,
        target: "",
        achievement: 0,
        targetCompletionDate: "",
        description: "",
      });
    } catch (err: any) {
      showToast(err.message || "Failed to create result", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Meeting Result"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Meeting minute selection */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Link to Meeting Minute
          </label>

          <Select
            isSearchable
            isClearable
            options={minuteOptions}
            isLoading={loadingMinutes}
            placeholder="Search & select meeting minute..."
            value={
              minuteOptions.find((opt) => opt.value === form.minuteId) || null
            }
            onChange={(opt) =>
              setForm({
                ...form,
                minuteId: opt ? (opt as MinuteOption).value : null,
              })
            }
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor:
                  !form.minuteId && !loadingMinutes ? "#ef4444" : "#d1d5db",
                boxShadow: state.isFocused
                  ? "0 0 0 1px rgba(37,99,235,0.6)"
                  : "none",
                "&:hover": {
                  borderColor: state.isFocused ? "#2563eb" : "#9ca3af",
                },
                borderRadius: "0.5rem",
                minHeight: "42px",
                fontSize: "0.875rem",
              }),
              menu: (base) => ({
                ...base,
                zIndex: 30,
                fontSize: "0.875rem",
              }),
            }}
          />

          {/* small preview */}
          {selectedMinute && (
            <div className="mt-2 text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 space-y-1">
              <p>
                <span className="font-semibold">Title:</span>{" "}
                {selectedMinute.title}
              </p>
              <p>
                <span className="font-semibold">Division:</span>{" "}
                {selectedMinute.division}
              </p>
              <p>
                <span className="font-semibold">Speaker:</span>{" "}
                {selectedMinute.speaker}
              </p>
            </div>
          )}
        </div>

        {/* Target */}
        <div>
          <label className="block text-sm font-medium mb-1">Target</label>
          <input
            className={`border rounded w-full px-3 py-2 ${
              !form.target.trim() ? "border-red-500" : ""
            }`}
            value={form.target}
            onChange={(e) => setForm({ ...form, target: e.target.value })}
          />
        </div>

        {/* Achievement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Achievement (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              className={`border rounded w-full px-3 py-2 ${
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

          {/* Target Completion Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Target Completion Date
            </label>
            <input
              type="date"
              className={`border rounded w-full px-3 py-2 ${
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
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className={`border rounded w-full px-3 py-2 ${
              !form.description.trim() ? "border-red-500" : ""
            }`}
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleCreate}
          disabled={saving}
          className="px-4 py-2 bg-[#005BAA] hover:bg-[#0668C2] text-white rounded-lg disabled:opacity-50"
        >
          {saving ? "Saving..." : "Create Result"}
        </button>
      </div>
    </Modal>
  );
}
