/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMinute, addImagesToMinute } from "../services/minutes.service";
import { uploadImages } from "../services/upload.service";
import FileUploader from "../components/FileUploader";

export default function MinuteCreate() {
  const [form, setForm] = useState({
    division: "",
    title: "",
    notes: "",
    speaker: "",
    numberOfParticipants: 0,
    members: "",
  });

  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function handleCreate() {
    try {
      setSaving(true);
      const minute = await createMinute({
        division: form.division,
        title: form.title,
        notes: form.notes,
        speaker: form.speaker,
        numberOfParticipants: form.numberOfParticipants,
        members: form.members
          .split(",")
          .map(name => ({ name: name.trim() }))
          .filter(m => m.name),
      });

      if (uploadedUrls.length > 0) {
        await addImagesToMinute(minute.id, uploadedUrls);
      }

      alert("Created!");
      navigate(`/minutes/${minute.id}`);
    } catch (e: any) {
      alert(e.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  async function handleFiles(files: File[]) {
    try {
  const response = await uploadImages(files);

  // extract only the URL strings
  const urls = response.map((f) => f.url);

  setUploadedUrls(urls);
    } catch (e: any) {
      alert(e.message || "Upload failed");
    }
  }

  return (
    <div className="p-6 space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Create Meeting Minute</h1>

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
            placeholder="Alice, Bob"
            value={form.members}
            onChange={e => setForm({ ...form, members: e.target.value })}
          />
        </div>

        <FileUploader onUpload={handleFiles} />

        <button
          onClick={handleCreate}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {saving ? "Saving..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
