/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getResults, deleteResult } from "../services/results.service";
import type { MeetingResult } from "../types/MeetingResult";

import CreateResultModal from "../components/CreateResultModal";
import EditResultModal from "../components/EditResultModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useToast } from "../components/common/ToastProvider";
import formatFullDate from "../utils/formatDate";

export default function ResultsList() {
  const [results, setResults] = useState<MeetingResult[]>([]);
  const [loading, setLoading] = useState(true);

  // CREATE MODAL
  const [openCreateModal, setOpenCreateModal] = useState(false);

  // EDIT MODAL
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // DELETE MODAL
  const [deleteTarget, setDeleteTarget] = useState<MeetingResult | null>(null);
  const [deleting, setDeleting] = useState(false);

  // SEARCH + SORT + PAGINATION
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof MeetingResult>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const navigate = useNavigate();
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const data = await getResults();
      setResults(data);
    } catch (e) {
      showToast("Failed to load results.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.target.toLowerCase().includes(s) ||
          r.description.toLowerCase().includes(s) ||
          r.minute.title.toLowerCase().includes(s)
      );
    }

    // Only sort by simple fields
    list.sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      if (sortBy === "minute") {
        // not used - just in case
        valA = a.minute.title.toLowerCase();
        valB = b.minute.title.toLowerCase();
      } else {
        const rawA = a[sortBy] as any;
        const rawB = b[sortBy] as any;
        valA = typeof rawA === "number" ? rawA : String(rawA || "").toLowerCase();
        valB = typeof rawB === "number" ? rawB : String(rawB || "").toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [results, search, sortBy, sortOrder]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await deleteResult(deleteTarget.id);
      showToast("Meeting result deleted successfully.", "success");
      await load();
    } catch (e) {
      showToast("Failed to delete meeting result.", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">📊 Meeting Results</h1>

        <button
          className="bg-[#005BAA] hover:bg-[#0668C2] text-white px-4 py-2 rounded-lg shadow-md transition"
          onClick={() => setOpenCreateModal(true)}
        >
          + New Result
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow border flex flex-col md:flex-row justify-between gap-4">
        <input
          type="text"
          placeholder="Search by target, description, meeting title..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded-lg w-full md:w-1/2"
        />
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
                    className="px-4 py-2 text-left cursor-pointer select-none hover:text-blue-600"
                    onClick={() =>
                      handleSort(col.key as keyof MeetingResult)
                    }
                  >
                    {col.label}{" "}
                    {sortBy === col.key && (
                      <span className="text-xs">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                ))}
                <th className="px-4 py-2 text-left">Meeting Minute</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{r.id}</td>

                  <td className="px-4 py-2 max-w-xs">
                    <span className="font-medium line-clamp-2">
                      {r.target}
                    </span>
                  </td>

                  <td className="px-4 py-2">{r.achievement}%</td>

                  <td className="px-4 py-2 text-gray-600 text-xs">
                    {r.createdAt ? formatFullDate(r.createdAt) : "—"}
                  </td>

                  {/* Meeting Minute link */}
                  <td className="px-4 py-2 text-sm">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => navigate(`/minutes/${r.minute.id}`)}
                    >
                      {r.minute.title} (ID: {r.minute.id})
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-2 space-x-3">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => navigate(`/results/${r.id}`)}
                    >
                      View
                    </button>
                    <button
                      className="text-green-600 hover:underline"
                      onClick={() => {
                        setEditId(r.id);
                        setOpenEditModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => setDeleteTarget(r)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-4 text-center text-gray-500 italic"
                  >
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100"
          >
            Prev
          </button>

          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>

      {/* CREATE MODAL */}
      <CreateResultModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreated={load}
      />

      {/* EDIT MODAL */}
      <EditResultModal
        open={openEditModal}
        resultId={editId}
        onClose={() => setOpenEditModal(false)}
        onUpdated={load}
      />

      {/* DELETE CONFIRMATION */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Meeting Result"
          message={
            <div className="space-y-2 text-sm">
              <p>Are you sure you want to delete this meeting result?</p>

              <div className="bg-gray-50 p-3 rounded border text-sm">
                <p>
                  <strong>ID:</strong> {deleteTarget.id}
                </p>
                <p>
                  <strong>Target:</strong> {deleteTarget.target}
                </p>
                <p>
                  <strong>Achievement:</strong> {deleteTarget.achievement}%
                </p>
                <p>
                  <strong>Meeting:</strong> {deleteTarget.minute.title} (ID:{" "}
                  {deleteTarget.minute.id})
                </p>
              </div>
            </div>
          }
          loading={deleting}
          onConfirm={confirmDelete}
          onClose={() => !deleting && setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
