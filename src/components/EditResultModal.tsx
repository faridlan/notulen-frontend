/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import Modal from "./common/Modal";
import { getResult, updateResult } from "../services/results.service";
import type { MeetingResult } from "../types/MeetingResult";
import { useToast } from "./common/ToastProvider";
import { validateResult, type ResultForm } from "../utils/validateResult";

interface Props {
  open: boolean;
  resultId: number | null;
  onClose: () => void;
  onUpdated: () => void;
}

const EditResultModal: React.FC<Props> = ({
  open,
  resultId,
  onClose,
  onUpdated,
}) => {
  const { showToast } = useToast();

  const [form, setForm] = useState<ResultForm>({
    minuteId: null,
    target: "",
    achievement: 0,
    targetCompletionDate: "",
    description: "",
  });

  const [linkedMinute, setLinkedMinute] = useState<MeetingResult["minute"] | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing result
  useEffect(() => {
    async function load() {
      if (!resultId) return;

      setLoading(true);
      try {
        const r = await getResult(resultId);

        setForm({
          minuteId: r.minute.id,
          target: r.target,
          achievement: r.achievement,
          targetCompletionDate: r.targetCompletionDate
            ? r.targetCompletionDate.slice(0, 10)
            : "",
          description: r.description,
        });

        setLinkedMinute(r.minute);
      } catch (err: any) {
        showToast(err.message || "Failed to load result.", "error");
      } finally {
        setLoading(false);
      }
    }

    if (open) {
      load();
    }
  }, [open, resultId, showToast]);

  async function handleSave() {
    if (!resultId) return;

    const error = validateResult(form);
    if (error) {
      showToast(error, "error");
      return;
    }

    try {
      setSaving(true);

      await updateResult(resultId, {
        target: form.target.trim(),
        achievement: form.achievement,
        targetCompletionDate: new Date(
          form.targetCompletionDate
        ).toISOString(),
        description: form.description.trim(),
      });

      showToast("Result updated successfully!", "success");
      onUpdated();
      onClose();
    } catch (err: any) {
      showToast(err.message || "Failed to update result", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Meeting Result"
      maxWidth="max-w-xl"
    >
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {/* Linked minute info (read-only) */}
          {linkedMinute && (
            <div className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 space-y-1">
              <p>
                <span className="font-semibold">Meeting Minute:</span>{" "}
                {linkedMinute.title} (ID: {linkedMinute.id})
              </p>
              <button
                className="text-blue-600 hover:underline text-xs"
                onClick={() =>
                  window.open(`/minutes/${linkedMinute.id}`, "_blank")
                }
              >
                Open meeting minute in new tab
              </button>
            </div>
          )}

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

          {/* Achievement + date */}
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
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
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

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg w-full disabled:opacity-60 hover:bg-green-700"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default EditResultModal;
