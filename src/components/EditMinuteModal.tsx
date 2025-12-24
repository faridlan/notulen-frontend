import React, { useEffect, useState } from "react";
import Modal from "./common/Modal";
import { getMinute, updateMinute } from "../services/minutes.service";
import TagInput from "./TagInput";
import { useToast } from "./common/ToastProvider";
import { validateMinute } from "../utils/validateMinute";

interface Props {
  open: boolean;
  minuteId: number | null;
  onClose: () => void;
  onUpdated: () => void;
}

const EditMinuteModal: React.FC<Props> = ({
  open,
  minuteId,
  onClose,
  onUpdated,
}) => {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    division: "",
    title: "",
    meetingDate: "",
    meetingType: "RAPAT_PENGURUS" as string,
    summary: "",
    notes: "",
    speaker: "",
    numberOfParticipants: 0,
    members: [] as string[],
    images: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* LOAD EXISTING DATA */
  useEffect(() => {
    async function load() {
      if (!minuteId) return;

      setLoading(true);
      const minute = await getMinute(minuteId);

      setForm({
        division: minute.division,
        title: minute.title,
        meetingDate: minute.meetingDate.slice(0, 16), // for datetime-local
        meetingType: minute.meetingType,
        summary: minute.summary || "",
        notes: minute.notes,
        speaker: minute.speaker,
        numberOfParticipants: minute.numberOfParticipants,
        members: minute.members.map((m) => m.name),
        images: minute.images?.map((img) => img.url) || [],
      });

      setLoading(false);
    }

    if (open) load();
  }, [open, minuteId]);

  /* SAVE */
  async function handleSave() {
    if (!minuteId) return;

    const error = validateMinute(form);
    if (error) {
      showToast(error, "error");
      return;
    }

    try {
      setSaving(true);

      await updateMinute(minuteId, {
        division: form.division,
        title: form.title,
        meetingDate: form.meetingDate,
        meetingType: form.meetingType,
        summary: form.summary,
        notes: form.notes,
        speaker: form.speaker,
        numberOfParticipants: form.numberOfParticipants,
        members: form.members.map((name) => ({ name })),
      });

      showToast("Minute updated!", "success");
      onUpdated();
      onClose();
    } catch {
      showToast("Update failed", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleAutoNumbering(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  field: "summary" | "notes"
) {
  if (e.key !== "Enter") return;

  const value = form[field];
  const lines = value.split("\n");
  const lastLine = lines[lines.length - 1];

  const match = lastLine.match(/^(\d+)\.\s+/);
  if (!match) return;

  e.preventDefault();

  const nextNumber = Number(match[1]) + 1;
  const newValue = value + `\n${nextNumber}. `;

  setForm((prev) => ({
    ...prev,
    [field]: newValue,
  }));
}


  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Meeting Minute"
      maxWidth="max-w-xl"
    >
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {/* Division */}
          <div>
            <label className="block text-sm font-medium mb-1">Division</label>
            <input
              className={`border rounded w-full px-3 py-2 ${
                !form.division.trim() ? "border-red-500" : ""
              }`}
              value={form.division}
              onChange={(e) =>
                setForm({ ...form, division: e.target.value })
              }
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              className={`border rounded w-full px-3 py-2 ${
                !form.title.trim() ? "border-red-500" : ""
              }`}
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />
          </div>

          {/* Meeting Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Meeting Date
            </label>
            <input
              type="datetime-local"
              className="border rounded w-full px-3 py-2"
              value={form.meetingDate}
              onChange={(e) =>
                setForm({ ...form, meetingDate: e.target.value })
              }
            />
          </div>

          {/* Meeting Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Meeting Type
            </label>
            <select
              className="border rounded w-full px-3 py-2"
              value={form.meetingType}
              onChange={(e) =>
                setForm({
                  ...form,
                  meetingType: e.target.value as string,
                })
              }
            >
              <option value="Rapat Pengurus">Rapat Pengurus</option>
              <option value="Rapat Direksi">Rapat Direksi</option>
              <option value="Rapat Divisi">Rapat Divisi</option>
              <option value="Rapat Semua Pegawai">
                Rapat Semua Pegawai
              </option>
            </select>
          </div>

          {/* Summary */}
<div>
  <label className="block text-sm font-medium mb-1">Summary</label>
  <textarea
    rows={3}
    className="border rounded w-full px-3 py-2"
    placeholder={`Use numbered points:\n1. Main outcome\n2. Key decision`}
    value={form.summary}
    onChange={(e) =>
      setForm({ ...form, summary: e.target.value })
    }
    onKeyDown={(e) => handleAutoNumbering(e, "summary")}
  />
  <p className="text-xs text-gray-500 mt-1">
    Press <strong>Enter</strong> after <strong>1.</strong> to continue numbering
  </p>
</div>

          {/* Notes */}
<div>
  <label className="block text-sm font-medium mb-1">Notes</label>
  <textarea
    rows={4}
    className="border rounded w-full px-3 py-2"
    placeholder={`Example:\n1. Opening\n2. Discussion\n3. Action items`}
    value={form.notes}
    onChange={(e) =>
      setForm({ ...form, notes: e.target.value })
    }
    onKeyDown={(e) => handleAutoNumbering(e, "notes")}
  />
  <p className="text-xs text-gray-500 mt-1">
    Auto continues numbered list on Enter
  </p>
</div>

          {/* Speaker */}
          <div>
            <label className="block text-sm font-medium mb-1">Speaker</label>
            <input
              className="border rounded w-full px-3 py-2"
              value={form.speaker}
              onChange={(e) =>
                setForm({ ...form, speaker: e.target.value })
              }
            />
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Number of Participants
            </label>
            <input
              type="number"
              className={`border rounded w-full px-3 py-2 ${
                form.numberOfParticipants <= 0 ? "border-red-500" : ""
              }`}
              value={form.numberOfParticipants}
              onChange={(e) =>
                setForm({
                  ...form,
                  numberOfParticipants: Number(e.target.value),
                })
              }
            />
          </div>

          {/* MEMBERS */}
          <TagInput
            label="List Participants (Members)"
            value={form.members}
            onChange={(members) =>
              setForm({ ...form, members })
            }
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded w-full disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default EditMinuteModal;
