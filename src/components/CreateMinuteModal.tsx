/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Modal from "./common/Modal";
import { createMinute, addImagesToMinute } from "../services/minutes.service";
import { uploadImages } from "../services/upload.service";
import FileUploader from "./FileUploader";
import TagInput from "./TagInput";
import { useToast } from "./common/ToastProvider";
import { validateMinute } from "../utils/validateMinute";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void; 
}

export default function CreateMinuteModal({ open, onClose, onCreated }: Props) {
  const { showToast } = useToast();

  const [form, setForm] = useState({
  division: "",
  title: "",
  meetingDate: "",
  meetingType: "Rapat Pengurus" as string,
  summary: "",
  notes: "",
  speaker: "",
  numberOfParticipants: 0,
  members: [] as string[],
  images: [] as string[],

  });

  const [, setUploadedUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

async function handleCreate() {
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

    await addImagesToMinute(minute.id, form.images);

    showToast("Minute created successfully!", "success");
    onCreated();
    onClose();
  } catch (err: any) {
    showToast(err.message || "Failed to create", "error");
  } finally {
    setSaving(false);
  }
}


async function handleFiles(files: File[]) {
  try {
    const res = await uploadImages(files);

    const urls = res.map((f) => f.url);

    setUploadedUrls(urls);
    setForm((prev) => ({ ...prev, images: urls })); // <─ ADD THIS
  } catch {
    showToast("Upload failed", "error");
  }
}


  return (
    <Modal open={open} onClose={onClose} title="Create New Meeting Minute" maxWidth="max-w-2xl">
      <div className="space-y-4">
        
        {/* Meeting Date */}
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

        {/* Division */}
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

        {/* Title */}
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
        
        {/* Meeting Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Meeting Type</label>
          <select
            className="border rounded w-full px-3 py-2"
            value={form.meetingType}
            onChange={(e) =>
              setForm({ ...form, meetingType: e.target.value as any })
            }
          >
            <option value="Rapat Pengurus">Rapat Pengurus</option>
            <option value="Rapat Direksi">Rapat Direksi</option>
            <option value="Rapat Divisi">Rapat Divisi</option>
            <option value="Rapat Semua Pegawai">Rapat Semua Pegawai</option>
          </select>
        </div>

        {/* Notes */}
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

        {/* Summary */}
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

        {/* Speaker */}
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

        {/* Participants */}
        <div>
          <label className="block text-sm font-medium mb-1">Number of Participants</label>
          <input
            type="number"
            className={`border rounded w-full px-3 py-2 ${
              form.numberOfParticipants <= 0 ? "border-red-500" : ""
            }`}
            value={form.numberOfParticipants}
            onChange={(e) =>
              setForm({ ...form, numberOfParticipants: Number(e.target.value) })
            }
          />
        </div>

        {/* Members using TAG INPUT */}
        <TagInput
          label="List Participants (Members)"
          value={form.members}
          onChange={(members) => setForm({ ...form, members })}
        />

        {/* Upload Images */}
        <div className={`${form.images.length === 0 ? "border border-red-500 rounded p-2" : ""}`}>
          <FileUploader onUpload={handleFiles} />
        </div>

        {/* Submit */}
        <button
          onClick={handleCreate}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
        >
          {saving ? "Saving..." : "Create Minute"}
        </button>
      </div>
    </Modal>
  );
}
