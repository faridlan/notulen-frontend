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
    notes: "",
    speaker: "",
    numberOfParticipants: 0,
    members: [] as string[],
    images: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!minuteId) return;

      setLoading(true);
      const minute = await getMinute(minuteId);

      setForm({
        division: minute.division,
        title: minute.title,
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

  return (
    <Modal open={open} onClose={onClose} title="Edit Meeting Minute" maxWidth="max-w-xl">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">Division</label>
            <input
                className={`border rounded w-full px-3 py-2 ${
    !form.division.trim() ? "border-red-500" : ""
  }`}
              value={form.division}
              onChange={(e) => setForm({ ...form, division: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
                className={`border rounded w-full px-3 py-2 ${
    !form.division.trim() ? "border-red-500" : ""
  }`}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
                className={`border rounded w-full px-3 py-2 ${
    !form.division.trim() ? "border-red-500" : ""
  }`}
              rows={4}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Speaker</label>
            <input
                className={`border rounded w-full px-3 py-2 ${
    !form.division.trim() ? "border-red-500" : ""
  }`}
              value={form.speaker}
              onChange={(e) => setForm({ ...form, speaker: e.target.value })}
            />
          </div>

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

          {/* MEMBERS TAG INPUT */}
          <TagInput
            label="List Participants (Members)"
            value={form.members}
            onChange={(members) => setForm({ ...form, members })}
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
