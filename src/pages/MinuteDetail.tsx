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
import type { MeetingMinute, MinuteImage } from "../types/MeetingMinute";
import { buildImageUrl } from "../helpers/image";

import ImageLightbox from "../components/ImageLightbox";
import EditMinuteModal from "../components/EditMinuteModal";
import { exportMinutePDF } from "../helpers/exportMinutePDF";
import formatFullDate from "../utils/formatDate";

export default function MinuteDetail() {
  const { id } = useParams();
  const minuteId = Number(id);
  const [minute, setMinute] = useState<MeetingMinute | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Edit modal
  const [openEditModal, setOpenEditModal] = useState(false);

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
    const uploaded = await uploadImages(files);

    await addImagesToMinute(minuteId, uploaded.map((f) => f.url));
    await load();
  }

  async function handleDeleteImage(image: MinuteImage) {
    if (!confirm("Delete this image?")) return;
    await deleteImage(minuteId, image.id);
    await load();
  }

  async function handleReplaceImage(image: MinuteImage, file: File) {
    const uploaded = await uploadImages([file]);
    const url = uploaded[0].url;

    await replaceImage(minuteId, image.id, url);
    await load();
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!minute) return <div className="p-6">Minute not found</div>;

  const images = minute.images || [];

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{minute.title}</h1>

        <div className="space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            onClick={() => navigate(-1)}
          >
            Back
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={() => setOpenEditModal(true)}
          >
            Edit
          </button>

          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            onClick={() => exportMinutePDF(minute, buildImageUrl)}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* MAIN CONTENT (info + notes) */}
      <div id="minute-pdf" className="space-y-6">
        <div className="bg-white rounded-xl shadow p-6 space-y-5">
          {/* Info rows */}
          <div className="space-y-1.5 text-gray-700 text-[15px]">
            <div>
              <span className="font-semibold text-gray-900">Division: </span>
              {minute.division}
            </div>
            <div>
              <span className="font-semibold text-gray-900">Speaker: </span>
              {minute.speaker}
            </div>
            <div>
              <span className="font-semibold text-gray-900">Participants: </span>
              {minute.numberOfParticipants}
            </div>
            <div>
              <span className="font-semibold text-gray-900">Members: </span>
              {minute.members.map((m) => m.name).join(", ")}
            </div>
            <div>
              <span className="font-semibold text-gray-900">Meeting Time: </span>
              {formatFullDate(minute.meetingDate)}
            </div>
            <div>
              <span className="font-semibold text-gray-900">Meeting Type: </span>
              {minute.meetingType.replaceAll("_", " ")}
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2 text-[15px]">
                Summary:
              </p>
              <div className="p-4 bg-gray-50 border rounded-lg text-gray-800 text-[15px]">
                {minute.summary}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="font-semibold text-gray-900 mb-2 text-[15px]">
              Notes:
            </p>
            <div className="p-4 bg-gray-50 border rounded-lg leading-relaxed whitespace-pre-line text-gray-800 text-[15px]">
              {minute.notes}
            </div>
          </div>
        </div>
      </div>

      {/* MANAGE IMAGES */}
      <div className="bg-white rounded-xl shadow p-6 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">Meeting Attendance </h2>

          <label className="text-blue-600 cursor-pointer hover:underline text-sm">
            + Add Images
            <input type="file" multiple className="hidden" onChange={handleAddImages} />
          </label>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="p-2 bg-gray-50 border rounded-lg shadow-sm space-y-2"
              >
                {/* Preview */}
                <img
                  src={buildImageUrl(img.url)}
                  className="h-32 w-full object-cover rounded cursor-pointer hover:opacity-80"
                  onClick={() => {
                    setLightboxIndex(idx);
                    setLightboxOpen(true);
                  }}
                />

                {/* Delete + Replace */}
                <div className="flex justify-between items-center pt-1">
                  <button
                    className="
                      text-xs font-medium 
                      text-red-600 hover:text-red-700
                      border border-red-300 
                      px-2 py-0.5 rounded-md
                      hover:bg-red-50
                    "
                    onClick={() => handleDeleteImage(img)}
                  >
                    Delete
                  </button>

                  <label
                    className="
                      text-xs font-medium 
                      text-blue-600 hover:text-blue-700
                      border border-blue-300 
                      px-2 py-0.5 rounded-md
                      cursor-pointer
                      hover:bg-blue-50
                    "
                  >
                    Replace
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleReplaceImage(img, e.target.files[0])
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      <ImageLightbox
        open={lightboxOpen}
        index={lightboxIndex}
        images={images.map((img) => buildImageUrl(img.url))}
        onClose={() => setLightboxOpen(false)}
        onNext={() => setLightboxIndex((lightboxIndex + 1) % images.length)}
        onPrev={() =>
          setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)
        }
      />

      {/* EDIT MODAL */}
      <EditMinuteModal
        open={openEditModal}
        minuteId={minute.id}
        onClose={() => setOpenEditModal(false)}
        onUpdated={load}
      />
    </div>
  );
}
