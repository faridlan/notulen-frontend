/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getMinute,
  addImagesToMinute,
  deleteImage,
  replaceImage,
} from "../services/minutes.service";
import { uploadImages } from "../services/upload.service";
import { generatePDF } from "../helpers/pdf";
import type { MeetingMinute, MinuteImage } from "../types/MeetingMinute";
import { buildImageUrl } from "../helpers/image";

export default function MinuteDetail() {
  const { id } = useParams();
  const minuteId = Number(id);
  const [minute, setMinute] = useState<MeetingMinute | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const data = await getMinute(minuteId);
      setMinute(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isNaN(minuteId)) {
      load();
    }
  }, [minuteId]);

  async function handleAddImages(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const res = await uploadImages(files);
    await addImagesToMinute(minuteId, res.map(f => f.url));
    await load();
  }

  async function handleDeleteImage(image: MinuteImage) {
    if (!confirm("Delete this image?")) return;
    await deleteImage(minuteId, image.id);
    await load();
  }

  async function handleReplaceImage(image: MinuteImage, file: File) {
    const res = await uploadImages([file]);
    const url = res[0].url;
    await replaceImage(minuteId, image.id, url);
    await load();
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!minute) return <div className="p-6">Minute not found</div>;

  return (
    <div className="p-6 space-y-6">
      {/* HEADER + PDF BUTTON */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{minute.title}</h1>

        <div className="space-x-2">
          <button
            className="px-3 py-1 bg-gray-200 rounded"
            onClick={() => navigate(-1)}
          >
            Back
          </button>

          <button
            className="px-3 py-1 bg-red-600 text-white rounded"
            onClick={() =>
              generatePDF("minute-pdf", `${minute.title}-report.pdf`)
            }
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* PDF CONTENT START */}
      <div id="minute-pdf" className="space-y-6">
        {/* INFO CARD */}
        <div className="bg-white shadow rounded p-4 space-y-2">
          <p>
            <span className="font-semibold">Division:</span> {minute.division}
          </p>
          <p>
            <span className="font-semibold">Speaker:</span> {minute.speaker}
          </p>
          <p>
            <span className="font-semibold">Participants:</span>{" "}
            {minute.numberOfParticipants}
          </p>
          <p>
            <span className="font-semibold">Notes:</span>
          </p>
          <p className="whitespace-pre-line border rounded p-2 bg-gray-50">
            {minute.notes}
          </p>
          <p>
            <span className="font-semibold">Members:</span>{" "}
            {minute.members.map(m => m.name).join(", ")}
          </p>
        </div>

        {/* IMAGES INCLUDED IN PDF */}
        <div className="bg-white shadow rounded p-4 space-y-3">
          <h2 className="text-lg font-semibold">Images</h2>

          {(!minute.images || minute.images.length === 0) && (
            <p className="text-gray-500 text-sm">No images yet.</p>
          )}

          {minute.images && minute.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {minute.images.map(img => (
                <img
                  key={img.id}
                  src={img.url}
                  alt="Meeting"
                  className="w-full h-32 object-cover rounded border"
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* PDF CONTENT END */}

      {/* IMAGE MANAGEMENT SECTION */}
      <div className="bg-white shadow rounded p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Manage Images</h2>
          <label className="text-sm text-blue-600 cursor-pointer">
            + Add Images
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleAddImages}
            />
          </label>
        </div>

        {minute.images && minute.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {minute.images.map(img => (
              <div key={img.id} className="border rounded p-2 space-y-2">
                <img
                  key={img.id}
                  src={buildImageUrl(img.url)}
                  crossOrigin="anonymous"
                  alt="Meeting"
                  className="w-full h-32 object-cover rounded"
                />
                <div className="flex justify-between items-center text-xs">
                  <button
                    className="text-red-600"
                    onClick={() => handleDeleteImage(img)}
                  >
                    Delete
                  </button>

                  <label className="text-blue-600 cursor-pointer">
                    Replace
                    <input
                      type="file"
                      className="hidden"
                      onChange={e => {
                        if (!e.target.files?.[0]) return;
                        handleReplaceImage(img, e.target.files[0]);
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => navigate(`/minutes/${minute.id}/edit`)}
      >
        Edit Minute
      </button>
    </div>
  );
}
