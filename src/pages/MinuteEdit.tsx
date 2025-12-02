/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMinute, updateMinute } from "../services/minutes.service";
import type { MeetingMinute } from "../types/MeetingMinute";

export default function MinuteEdit() {
  const { id } = useParams();
  const minuteId = Number(id);
  const [form, setForm] = useState({
    division: "",
    title: "",
    notes: "",
    speaker: "",
    numberOfParticipants: 0,
    members: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const minute = await getMinute(minuteId);
      setForm({
        division: minute.division,
        title: minute.title,
        notes: minute.notes,
        speaker: minute.speaker,
        numberOfParticipants: minute.numberOfParticipants,
        members: minute.members.map(m => m.name).join(", "),
      });
      setLoading(false);
    }
    if (!Number.isNaN(minuteId)) load();
  }, [minuteId]);

  async function handleSave() {
    setSaving(true);
    try {
      const data: Partial<MeetingMinute> = {
        division: form.division,
        title: form.title,
        notes: form.notes,
        speaker: form.speaker,
        numberOfParticipants: form.numberOfParticipants,
        members: form.members
          .split(",")
          .map(name => ({ name: name.trim() }))
          .filter(m => m.name),
      };
      await updateMinute(minuteId, data);
      alert("Updated!");
      navigate(`/minutes/${minuteId}`);
    } catch (e: any) {
      alert(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Edit Meeting Minute</h1>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Division</label>
          <input
            className="border rounded w-full px-3 py-2"
            value={form.division}
            onChange={e => setForm({ ...form, division: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="border rounded w-full px-3 py-2"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            className="border rounded w-full px-3 py-2"
            rows={4}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Speaker</label>
          <input
            className="border rounded w-full px-3 py-2"
            value={form.speaker}
            onChange={e => setForm({ ...form, speaker: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Participants
          </label>
          <input
            type="number"
            className="border rounded w-full px-3 py-2"
            value={form.numberOfParticipants}
            onChange={e =>
              setForm({
                ...form,
                numberOfParticipants: Number(e.target.value),
              })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Members (comma separated)
          </label>
          <input
            className="border rounded w-full px-3 py-2"
            value={form.members}
            onChange={e => setForm({ ...form, members: e.target.value })}
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
