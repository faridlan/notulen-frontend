import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import type { MeetingMinute } from "../../types/MeetingMinute";

export interface MinuteFormValues {
  division: string;
  title: string;
  notes: string;
  speaker: string;
  numberOfParticipants: number;
  members: string; // comma separated for UI
}

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: MeetingMinute | null;
  onSubmit: (values: MinuteFormValues) => Promise<void>;
}

const MinuteFormModal: React.FC<Props> = ({ open, onClose, initial, onSubmit }) => {
  const [form, setForm] = useState<MinuteFormValues>({
    division: "",
    title: "",
    notes: "",
    speaker: "",
    numberOfParticipants: 0,
    members: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        division: initial.division,
        title: initial.title,
        notes: initial.notes,
        speaker: initial.speaker,
        numberOfParticipants: initial.numberOfParticipants,
        members: initial.members.map((m) => m.name).join(", "),
      });
    } else {
      setForm({
        division: "",
        title: "",
        notes: "",
        speaker: "",
        numberOfParticipants: 0,
        members: "",
      });
    }
  }, [initial, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Meeting Minute" : "Create Meeting Minute"}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Division</label>
            <input
              className="border rounded-lg px-3 py-2 w-full text-sm"
              value={form.division}
              onChange={(e) => setForm({ ...form, division: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Speaker</label>
            <input
              className="border rounded-lg px-3 py-2 w-full text-sm"
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
              className="border rounded-lg px-3 py-2 w-full text-sm"
              value={form.numberOfParticipants}
              onChange={(e) =>
                setForm({
                  ...form,
                  numberOfParticipants: Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="border rounded-lg px-3 py-2 w-full text-sm"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            className="border rounded-lg px-3 py-2 w-full text-sm"
            rows={4}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Members (comma separated)
          </label>
          <input
            className="border rounded-lg px-3 py-2 w-full text-sm"
            value={form.members}
            onChange={(e) => setForm({ ...form, members: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-1.5 rounded-lg bg-[#005BAA] text-white text-sm hover:bg-[#0668C2] disabled:opacity-60"
          >
            {saving ? "Saving..." : initial ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MinuteFormModal;
