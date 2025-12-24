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
            <option>Rapat Per Bagian</option>
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
  placeholder={`Use numbered points if needed:\n1. Key discussion\n2. Conclusion`}
  value={form.summary}
  onChange={(e) =>
    setForm({ ...form, summary: e.target.value })
  }
  onKeyDown={(e) => handleAutoNumbering(e, "summary")}
/>

<p className="text-xs text-gray-500 mt-1">
  Tip: Press <strong>Enter</strong> after <strong>1.</strong> to auto-create next point
</p>
          </div>

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
  Supports numbered points (1., 2., 3.) — auto continues on Enter
</p>
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
