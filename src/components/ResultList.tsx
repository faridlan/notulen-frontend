/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResults, deleteResult } from "../services/results.service";
import type { MeetingResult } from "../types/MeetingResult";

import ConfirmDialog from "./common/ConfirmDialog";
import EditResultModal from "./EditResultModal";
import { useToast } from "./common/ToastProvider";
import { summarizeNumberedText } from "../helpers/summaryText";

/* ===== helpers ===== */
function getMonthName(month: number) {
  return new Date(2024, month - 1).toLocaleString("id-ID", {
    month: "long",
  });
}

const formatSimpleDate = (dateString: string) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

interface Props {
  refreshTrigger: number;
}

export default function ResultList({ refreshTrigger }: Props) {
  const [results, setResults] = useState<MeetingResult[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [fromYear, setFromYear] = useState<number | "all">("all");
  const [fromMonth, setFromMonth] = useState<number | "all">("all");
  const [toYear, setToYear] = useState<number | "all">("all");
  const [toMonth, setToMonth] = useState<number | "all">("all");

  const [sortBy, setSortBy] = useState<keyof MeetingResult>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [deleteTarget, setDeleteTarget] = useState<MeetingResult | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const data = await getResults();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load meeting results.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [refreshTrigger]);

  const years = useMemo(
    () =>
      Array.from(
        new Set(results.map((r) => new Date(r.targetCompletionDate).getFullYear()))
      ).sort((a, b) => b - a),
    [results]
  );

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  function handleSort(field: keyof MeetingResult) {
    if (sortBy === field) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  const filtered = useMemo(() => {
    return results
      .filter((r) => {
        const s = search.toLowerCase();
        const matchesSearch =
          !s ||
          r.minute.title.toLowerCase().includes(s) ||
          r.description?.toLowerCase().includes(s);

        const targetDate = new Date(r.targetCompletionDate);
        let matchesDate = true;

        if (fromYear !== "all" && fromMonth !== "all") {
          const fromDate = new Date(fromYear, fromMonth - 1);
          matchesDate = targetDate >= fromDate;
        }

        if (toYear !== "all" && toMonth !== "all") {
          const toDate = new Date(toYear, toMonth);
          matchesDate = matchesDate && targetDate <= toDate;
        }

        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        const valA = String(a[sortBy] ?? "").toLowerCase();
        const valB = String(b[sortBy] ?? "").toLowerCase();
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [results, search, fromYear, fromMonth, toYear, toMonth, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteResult(deleteTarget.id);
      showToast("Meeting result deleted successfully.", "success");
      await load();
    } catch {
      showToast("Failed to delete meeting result.", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  if (loading) return <div className="p-6">Loading meeting results...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      {/* 1. SEARCH & FILTER SECTION (Identical to MinuteList) */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-xl font-semibold">📋 Meeting Results</h2>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search meeting or description..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="border rounded-lg px-3 py-2 w-full md:w-80 text-sm"
            />
            <button
              onClick={() => {
                setSearch(""); setFromYear("all"); setFromMonth("all");
                setToYear("all"); setToMonth("all"); setPage(1);
              }}
              className="px-3 py-2 text-sm border border-[#005BAA] text-[#005BAA] rounded-lg hover:bg-[#005BAA] hover:text-white transition"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm bg-gray-50 border rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">From</span>
            <select
              value={fromMonth}
              onChange={(e) => setFromMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="border rounded-lg px-3 py-2 bg-white min-w-[140px]"
            >
              <option value="all">Month</option>
              {months.map((m) => <option key={m} value={m}>{getMonthName(m)}</option>)}
            </select>
            <span className="text-gray-300 font-semibold">|</span>
            <select
              value={fromYear}
              onChange={(e) => setFromYear(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="border rounded-lg px-3 py-2 bg-white min-w-[90px]"
            >
              <option value="all">Year</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <span className="font-semibold text-gray-400">→</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">To</span>
            <select
              value={toMonth}
              onChange={(e) => setToMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="border rounded-lg px-3 py-2 bg-white min-w-[140px]"
            >
              <option value="all">Month</option>
              {months.map((m) => <option key={m} value={m}>{getMonthName(m)}</option>)}
            </select>
            <span className="text-gray-300 font-semibold">|</span>
            <select
              value={toYear}
              onChange={(e) => setToYear(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="border rounded-lg px-3 py-2 bg-white min-w-[90px]"
            >
              <option value="all">Year</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 2. TABLE SECTION (Fixed overflow and behavior) */}
      <div className="overflow-x-auto">
        {/* Removed 'table-fixed', added 'min-w-[800px]' to prevent squashing */}
        <table className="w-full text-sm border border-gray-200 rounded-lg min-w-[800px]">
          <thead className="bg-gray-100 border-b">
            <tr>
              {[
                { key: "id", label: "ID", className: "w-16" },
                { key: "meeting", label: "Meeting & Target", className: "" },
                { key: "achievement", label: "Achievement", className: "w-32" },
                { key: "targetCompletionDate", label: "Target Completion", className: "w-44" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key as keyof MeetingResult)}
                  className={`px-4 py-2 text-left cursor-pointer hover:text-blue-600 ${col.className}`}
                >
                  {col.label}
                  {sortBy === col.key && (
                    <span className="text-xs ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}
                </th>
              ))}
              <th className="px-4 py-2 w-40 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500 italic">No results found.</td>
              </tr>
            ) : (
              paginated.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{r.id}</td>
                  <td className="px-4 py-2">
                    <div className="font-medium">{r.minute.title}</div>
                    <div className="text-xs text-gray-500 italic">
                      1. {summarizeNumberedText(r.target)}
                    </div>
                  </td>
                  <td className="px-4 py-2">{r.achievement}%</td>
                  <td className="px-4 py-2 text-xs text-gray-600 whitespace-nowrap">
                    {formatSimpleDate(r.targetCompletionDate)}
                  </td>
                  <td className="px-4 py-2 space-x-3 whitespace-nowrap">
                    <button onClick={() => navigate(`/results/${r.id}`)} className="text-blue-600 hover:underline text-xs font-semibold">VIEW</button>
                    <button onClick={() => { setEditId(r.id); setOpenEditModal(true); }} className="text-green-600 hover:underline text-xs font-semibold">EDIT</button>
                    <button onClick={() => setDeleteTarget(r)} className="text-red-600 hover:underline text-xs font-semibold">DELETE</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 3. PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-sm pt-2">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
          <span>Page <strong>{page}</strong> of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      )}

      {/* MODALS remain same... */}
      <EditResultModal open={openEditModal} resultId={editId} onClose={() => setOpenEditModal(false)} onUpdated={() => { showToast("Updated.", "success"); load(); }} />
      {deleteTarget && (
        <ConfirmDialog title="Delete" loading={deleting} onConfirm={confirmDelete} onClose={() => !deleting && setDeleteTarget(null)}
          message={<p className="text-sm">Delete result for <strong>{deleteTarget.minute.title}</strong>?</p>}
        />
      )}
    </div>
  );
}