import { useState } from "react";
import { createMinute, addImagesToMinute } from "../services/minutes.service";
import { uploadImages } from "../services/upload.service";
import FileUploader from "./FileUploader";
import TagInput from "./TagInput";
import { useToast } from "./common/ToastProvider";
import { validateMinute } from "../utils/validateMinute";

interface Props {
  onCreated: () => void;
}

export default function MinuteForm({ onCreated }: Props) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [form, setForm] = useState({
    division: "",
    title: "",
    meetingDate: "",
    meetingType: "Rapat Pengurus",
    summary: "",
    notes: "",
    speaker: "",
    numberOfParticipants: 0,
    members: [] as string[],
    images: [] as string[],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const error = validateMinute(form);
    if (error) {
      showToast(error, "error");
      return;
    }

    try {
      setSaving(true);

      const minute = await createMinute({
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

      if (form.images.length > 0) {
        await addImagesToMinute(minute.id, form.images);
      }

      showToast("Meeting minute created successfully!", "success");
      onCreated();

      setForm({
        division: "",
        title: "",
        meetingDate: "",
        meetingType: "Rapat Pengurus",
        summary: "",
        notes: "",
        speaker: "",
        numberOfParticipants: 0,
        members: [],
        images: [],
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleFiles(files: File[]) {
    const uploaded = await uploadImages(files);
    setForm((prev) => ({
      ...prev,
      images: uploaded.map((f) => f.url),
    }));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow space-y-6"
    >
      <h2 className="text-xl font-semibold">➕ Create Meeting Minute</h2>

      {/* BASIC INFO */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Meeting Date</label>
          <input
            type="datetime-local"
            className="border rounded w-full px-3 py-2"
            value={form.meetingDate}
            onChange={(e) =>
              setForm({ ...form, meetingDate: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Meeting Type</label>
          <select
            className="border rounded w-full px-3 py-2"
            value={form.meetingType}
            onChange={(e) =>
              setForm({ ...form, meetingType: e.target.value })
            }
          >
            <option>Rapat Pengurus</option>
            <option>Rapat Direksi</option>
            <option>Rapat Divisi</option>
            <option>Rapat Semua Pegawai</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Division</label>
          <input
            className="border rounded w-full px-3 py-2"
            value={form.division}
            onChange={(e) => setForm({ ...form, division: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="border rounded w-full px-3 py-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
      </div>

      {/* PARTICIPANTS */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Speaker</label>
          <input
            className="border rounded w-full px-3 py-2"
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
            className="border rounded w-full px-3 py-2"
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

      <TagInput
        label="Participants"
        value={form.members}
        onChange={(members) => setForm({ ...form, members })}
      />

      {/* ADVANCED TOGGLE */}
      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="text-sm text-[#005BAA] hover:underline"
      >
        {showAdvanced ? "Hide advanced options ▲" : "Show advanced options ▼"}
      </button>

      {/* ADVANCED SECTION */}
      {showAdvanced && (
        <div className="space-y-4 border-t pt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Summary</label>
            <textarea
              rows={3}
              className="border rounded w-full px-3 py-2"
              value={form.summary}
              onChange={(e) =>
                setForm({ ...form, summary: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              rows={4}
              className="border rounded w-full px-3 py-2"
              value={form.notes}
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value })
              }
            />
          </div>

          <FileUploader onUpload={handleFiles} />
        </div>
      )}

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={saving}
        className="w-full px-4 py-2 bg-[#005BAA] hover:bg-[#0668C2] text-white rounded-lg disabled:opacity-50"
      >
        {saving ? "Saving..." : "Create Minute"}
      </button>
    </form>
  );
}
