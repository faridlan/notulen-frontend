import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getResult } from "../services/results.service";
import type { MeetingResult } from "../types/MeetingResult";
import { generatePDF } from "../helpers/pdf";

export default function ResultDetail() {
  const { id } = useParams();
  const resultId = Number(id);
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getResult(resultId);
      setResult(data);
      setLoading(false);
    }
    if (!Number.isNaN(resultId)) load();
  }, [resultId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!result) return <div className="p-6">Result not found</div>;

  return (
    <div className="p-6 space-y-4 max-w-xl">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Result #{result.id}</h1>

        <div className="space-x-2">
          <button
            className="px-3 py-1 bg-gray-200 rounded"
            onClick={() => navigate(-1)}
          >
            Back
          </button>

          {/* PDF Export Button */}
          <button
            className="px-3 py-1 bg-red-600 text-white rounded"
            onClick={() =>
              generatePDF("result-pdf", `MeetingResult-${result.id}.pdf`)
            }
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* PDF CONTENT START */}
      <div id="result-pdf" className="bg-white shadow rounded p-4 space-y-4">
        <h2 className="text-xl font-bold mb-2">Meeting Result Report</h2>

        <p>
          <span className="font-semibold">Result ID:</span> {result.id}
        </p>

        <p>
          <span className="font-semibold">Minute:</span>{" "}
          {result.minute.title} (ID: {result.minute.id})
        </p>

        <p>
          <span className="font-semibold">Target:</span> {result.target}
        </p>

        <p>
          <span className="font-semibold">Achievement:</span>{" "}
          {result.achievement}%
        </p>

        <p>
          <span className="font-semibold">Target Completion Date:</span>{" "}
          {new Date(result.targetCompletionDate).toLocaleDateString()}
        </p>

        <div>
          <p className="font-semibold">Description:</p>
          <div className="border rounded p-2 bg-gray-50 whitespace-pre-line">
            {result.description}
          </div>
        </div>
      </div>
      {/* PDF CONTENT END */}

      <button
        className="px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => navigate(`/results/${result.id}/edit`)}
      >
        Edit Result
      </button>
    </div>
  );
}
