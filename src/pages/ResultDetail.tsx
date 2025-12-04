/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getResult } from "../services/results.service";
import type { MeetingResult } from "../types/MeetingResult";

import EditResultModal from "../components/EditResultModal";
import formatFullDate from "../utils/formatDate";
import { exportResultPDF } from "../helpers/exportResultPDF";

export default function ResultDetail() {
  const { id } = useParams();
  const resultId = Number(id);

  const [result, setResult] = useState<MeetingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [openEditModal, setOpenEditModal] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getResult(resultId);
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isNaN(resultId)) load();
  }, [resultId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!result) return <div className="p-6">Result not found</div>;

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Result: {result.target}
        </h1>

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
            onClick={() => exportResultPDF(result)}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* ---- MAIN CONTENT ---- */}
      <div id="result-pdf" className="space-y-6">
        <div className="bg-white rounded-xl shadow p-6 space-y-5">
          {/* Info Section */}
          <div className="space-y-1.5 text-gray-700 text-[15px]">
            <div>
              <span className="font-semibold text-gray-900">Result ID: </span>
              {result.id}
            </div>

            <div>
              <span className="font-semibold text-gray-900">Target: </span>
              {result.target}
            </div>

            <div>
              <span className="font-semibold text-gray-900">Achievement: </span>
              {result.achievement}%
            </div>

            <div>
              <span className="font-semibold text-gray-900">
                Target Completion Date:{" "}
              </span>
              {formatFullDate(result.targetCompletionDate)}
            </div>

            <div>
              <span className="font-semibold text-gray-900">
                Linked Meeting Minute:{" "}
              </span>
              {result.minute.title} (ID: {result.minute.id})
            </div>

            <button
              className="text-blue-600 hover:underline text-sm ml-1"
              onClick={() => navigate(`/minutes/${result.minute.id}`)}
            >
              Open meeting minute
            </button>

            {result.createdAt && (
              <div>
                <span className="font-semibold text-gray-900">
                  Created At:{" "}
                </span>
                {formatFullDate(result.createdAt)}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="font-semibold text-gray-900 mb-2 text-[15px]">
              Description:
            </p>

            <div className="p-4 bg-gray-50 border rounded-lg leading-relaxed whitespace-pre-line text-gray-800 text-[15px]">
              {result.description}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <EditResultModal
        open={openEditModal}
        resultId={result.id}
        onClose={() => setOpenEditModal(false)}
        onUpdated={load}
      />
    </div>
  );
}
