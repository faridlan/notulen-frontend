/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResults, deleteResult } from "../services/results.service";
import type { MeetingResult } from "../types/MeetingResult";
import ConfirmDialog from "./common/ConfirmDialog";
import { useToast } from "./common/ToastProvider";
import formatFullDate from "../utils/formatDate";
import EditResultModal from "./EditResultModal";

interface Props {
  refreshTrigger: number;
}

export default function ResultList({ refreshTrigger }: Props) {
  const [results, setResults] = useState<MeetingResult[]>([]);
  const [loading, setLoading] = useState(true);

  // delete
  const [deleteTarget, setDeleteTarget] = useState<MeetingResult | null>(null);
  const [deleting, setDeleting] = useState(false);

  // search + sort + pagination
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof MeetingResult>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

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

  function handleSort(field: keyof MeetingResult) {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  const filtered = useMemo(() => {
    let list = [...results];

    // SEARCH
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.target.toLowerCase().includes(s) ||
          r.description?.toLowerCase().includes(s) ||
          r.minute.title.toLowerCase().includes(s)
      );
    }

    // SORT
    list.sort((a, b) => {
      const rawA = a[sortBy] as any;
      const rawB = b[sortBy] as any;

      const valA =
        typeof rawA === "number" ? rawA : String(rawA || "").toLowerCase();
      const valB =
        typeof rawB === "number" ? rawB : String(rawB || "").toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [results, search, sortBy, sortOrder]);

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

  if (loading) return <div className="p-6">Loading results...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-xl font-semibold">📋 Meeting Results</h2>

        <input
          type="text"
          placeholder="Search target, description, meeting..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg px-3 py-2 w-full md:w-72 text-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 border-b">
            <tr>
              {[
                { key: "id", label: "ID" },
                { key: "target", label: "Target" },
                { key: "achievement", label: "Achievement (%)" },
                { key: "createdAt", label: "Created" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() =>
                    handleSort(col.key as keyof MeetingResult)
                  }
                  className="px-4 py-2 text-left cursor-pointer hover:text-blue-600 select-none"
                >
                  {col.label}
                  {sortBy === col.key && (
                    <span className="text-xs ml-1">
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}

              <th className="px-4 py-2 text-left">Meeting</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-4 text-center text-gray-500 italic"
                >
                  No results found.
                </td>
              </tr>
            ) : (
              paginated.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{r.id}</td>
                  <td className="px-4 py-2 font-medium">{r.target}</td>
                  <td className="px-4 py-2">{r.achievement}%</td>
                  <td className="px-4 py-2 text-xs text-gray-600">
                    {formatFullDate(r.createdAt)}
                  </td>

                  <td className="px-4 py-2">
                    <button
                      onClick={() =>
                        navigate(`/minutes/${r.minute.id}`)
                      }
                      className="text-blue-600 hover:underline"
                    >
                      {r.minute.title}
                    </button>
                  </td>

                  <td className="px-4 py-2 space-x-3">
                    <button
                      onClick={() => navigate(`/results/${r.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        setEditId(r.id);
                        setOpenEditModal(true);
                      }}
                      className="text-green-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(r)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

      {/* DELETE CONFIRM */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Meeting Result"
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => !deleting && setDeleteTarget(null)}
          message={
            <div className="space-y-1 text-sm">
              <p>Are you sure you want to delete this result?</p>
              <div className="bg-gray-50 border p-2 rounded">
                <p>
                  <strong>Target:</strong> {deleteTarget.target}
                </p>
                <p>
                  <strong>Meeting:</strong>{" "}
                  {deleteTarget.minute.title}
                </p>
              </div>
            </div>
          }
        />
      )}

      {/* EDIT MODAL */}
        <EditResultModal
          open={openEditModal}
          resultId={editId}
          onClose={() => setOpenEditModal(false)}
          onUpdated={() => {
            showToast("Meeting result updated successfully.", "success");
            load();
          }}
        />
    </div>
  );
}
