/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMinutes, deleteMinute } from "../services/minutes.service";
import type { MeetingMinute } from "../types/MeetingMinute";

import EditMinuteModal from "./EditMinuteModal";
import ConfirmDialog from "./common/ConfirmDialog";
import { useToast } from "./common/ToastProvider";
import formatFullDate from "../utils/formatDate";

/* ===== helpers ===== */
function getMonthName(month: number) {
  return new Date(2024, month - 1).toLocaleString("id-ID", {
    month: "long",
  });
}

interface Props {
  refreshTrigger: number;
}

export default function MinuteList({ refreshTrigger }: Props) {
  const [minutes, setMinutes] = useState<MeetingMinute[]>([]);
  const [loading, setLoading] = useState(true);

  // EDIT MODAL
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // DELETE MODAL
  const [deleteTarget, setDeleteTarget] = useState<MeetingMinute | null>(null);
  const [deleting, setDeleting] = useState(false);

  // SEARCH
  const [search, setSearch] = useState("");

  // DATE FILTER
  const [fromYear, setFromYear] = useState<number | "all">("all");
  const [fromMonth, setFromMonth] = useState<number | "all">("all");
  const [toYear, setToYear] = useState<number | "all">("all");
  const [toMonth, setToMonth] = useState<number | "all">("all");

  // SORT
  const [sortBy, setSortBy] = useState<keyof MeetingMinute>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // PAGINATION
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const navigate = useNavigate();
  const { showToast } = useToast();

  /* ===== LOAD DATA ===== */
  async function load() {
    setLoading(true);
    try {
      const data = await getMinutes();
      setMinutes(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load meeting minutes.", "error");
      setMinutes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [refreshTrigger]);

  /* ===== DERIVED OPTIONS ===== */
  const years = useMemo(
    () =>
      Array.from(
        new Set(minutes.map((m) => new Date(m.meetingDate).getFullYear()))
      ).sort((a, b) => b - a),
    [minutes]
  );

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  /* ===== SORT HANDLER ===== */
  function handleSort(field: keyof MeetingMinute) {
    if (sortBy === field) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  /* ===== FILTER + SORT ===== */
  const filtered = useMemo(() => {
    return minutes
      .filter((m) => {
        // 🔍 SEARCH (keep all fields)
        const s = search.toLowerCase();
        const matchesSearch =
          !s ||
          m.title.toLowerCase().includes(s) ||
          m.division.toLowerCase().includes(s) ||
          m.meetingType?.toLowerCase().includes(s) ||
          m.speaker?.toLowerCase().includes(s);

        // 📅 DATE RANGE
        const meetingDate = new Date(m.meetingDate);

        let matchesDate = true;

        if (fromYear !== "all" && fromMonth !== "all") {
          const fromDate = new Date(fromYear, fromMonth - 1);
          matchesDate = meetingDate >= fromDate;
        }

        if (toYear !== "all" && toMonth !== "all") {
          const toDate = new Date(toYear, toMonth);
          matchesDate = matchesDate && meetingDate <= toDate;
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
  }, [
    minutes,
    search,
    fromYear,
    fromMonth,
    toYear,
    toMonth,
    sortBy,
    sortOrder,
  ]);

  /* ===== PAGINATION ===== */
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* ===== DELETE ===== */
  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await deleteMinute(deleteTarget.id);
      showToast("Meeting minute deleted successfully.", "success");
      await load();
    } catch {
      showToast("Failed to delete meeting minute.", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  if (loading) return <div className="p-6">Loading meeting minutes...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      {/* SEARCH + FILTER */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-xl font-semibold">📋 Meeting Minutes</h2>

          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search title, division, type, speaker..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="border rounded-lg px-3 py-2 w-full md:w-80 text-sm"
            />

            <button
              onClick={() => {
                setSearch("");
                setFromYear("all");
                setFromMonth("all");
                setToYear("all");
                setToMonth("all");
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-[#005BAA] text-[#005BAA] rounded-lg hover:bg-[#005BAA] hover:text-white transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* DATE FILTER */}
        {/* DATE RANGE FILTER */}
        <div className="flex flex-wrap items-center gap-4 text-sm bg-gray-50 border rounded-xl px-4 py-3">
          {/* FROM */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">From</span>

            <select
              value={fromMonth}
              onChange={(e) =>
                setFromMonth(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="border rounded-lg px-3 py-2 bg-white min-w-[140px]"
            >
              <option value="all">Month</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))}
            </select>

            <span className="text-gray-300 font-semibold">|</span>

            <select
              value={fromYear}
              onChange={(e) =>
                setFromYear(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="border rounded-lg px-3 py-2 bg-white min-w-[90px]"
            >
              <option value="all">Year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* ARROW */}
          <span className="font-semibold text-gray-400">→</span>

          {/* TO */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">To</span>

            <select
              value={toMonth}
              onChange={(e) =>
                setToMonth(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="border rounded-lg px-3 py-2 bg-white min-w-[140px]"
            >
              <option value="all">Month</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))}
            </select>

            <span className="text-gray-300 font-semibold">|</span>

            <select
              value={toYear}
              onChange={(e) =>
                setToYear(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="border rounded-lg px-3 py-2 bg-white min-w-[90px]"
            >
              <option value="all">Year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>


      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 border-b">
            <tr>
              {[
                { key: "id", label: "ID" },
                { key: "title", label: "Title" },
                { key: "division", label: "Division" },
                { key: "meetingType", label: "Type" },
                { key: "speaker", label: "Speaker" },
                { key: "meetingDate", label: "Date" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() =>
                    handleSort(col.key as keyof MeetingMinute)
                  }
                  className="px-4 py-2 text-left cursor-pointer hover:text-blue-600"
                >
                  {col.label}
                  {sortBy === col.key && (
                    <span className="text-xs ml-1">
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-500 italic">
                  No meeting minutes found.
                </td>
              </tr>
            ) : (
              paginated.map((m) => (
                <tr key={m.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{m.id}</td>
                  <td className="px-4 py-2 font-medium">{m.title}</td>
                  <td className="px-4 py-2">{m.division}</td>
                  <td className="px-4 py-2">{m.meetingType}</td>
                  <td className="px-4 py-2">{m.speaker || "—"}</td>
                  <td className="px-4 py-2">
                    {formatFullDate(m.meetingDate)}
                  </td>
                  <td className="px-4 py-2 space-x-3">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => navigate(`/minutes/${m.id}`)}
                    >
                      VIEW
                    </button>
                    <button
                      className="text-green-600 hover:underline"
                      onClick={() => {
                        setEditId(m.id);
                        setOpenEditModal(true);
                      }}
                    >
                      EDIT
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => setDeleteTarget(m)}
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span>
            Page <strong>{page}</strong> of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* EDIT MODAL */}
      <EditMinuteModal
        open={openEditModal}
        minuteId={editId}
        onClose={() => setOpenEditModal(false)}
        onUpdated={() => {
          showToast("Meeting minute updated successfully.", "success");
          load();
        }}
      />

      {/* DELETE CONFIRM */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Meeting Minute"
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => !deleting && setDeleteTarget(null)}
          message={
            <div className="space-y-2 text-sm">
              <p>Are you sure you want to delete this meeting minute?</p>
              <div className="bg-gray-50 p-3 rounded border">
                <p>
                  <strong>Title:</strong> {deleteTarget.title}
                </p>
                <p>
                  <strong>Division:</strong> {deleteTarget.division}
                </p>
                <p>
                  <strong>Type:</strong> {deleteTarget.meetingType}
                </p>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
