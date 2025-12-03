/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMinutes, deleteMinute } from "../services/minutes.service";
import type { MeetingMinute } from "../types/MeetingMinute";

import CreateMinuteModal from "../components/CreateMinuteModal";
import EditMinuteModal from "../components/EditMinuteModal";
import ConfirmDialog from "../components/common/ConfirmDialog";

import { useToast } from "../components/common/ToastProvider";
import formatFullDate from "../utils/formatDate";

export default function MinutesList() {
  const [minutes, setMinutes] = useState<MeetingMinute[]>([]);
  const [loading, setLoading] = useState(true);

  // CREATE MODAL
  const [openCreateModal, setOpenCreateModal] = useState(false);

  // EDIT MODAL
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // DELETE MODAL
  const [deleteTarget, setDeleteTarget] = useState<MeetingMinute | null>(null);
  const [deleting, setDeleting] = useState(false);

  // SEARCH
  const [search, setSearch] = useState("");

  // SORT
  const [sortBy, setSortBy] = useState<keyof MeetingMinute>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // PAGINATION
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const navigate = useNavigate();
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const data = await getMinutes();
      setMinutes(data);
    } catch (e) {
      showToast("Failed to load minutes.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // SORTING HANDLER
  function handleSort(field: keyof MeetingMinute) {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  // FILTER + SORT + PAGINATE
  const filtered = useMemo(() => {
    let list = [...minutes];

    // SEARCH filter
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(s) ||
          m.speaker.toLowerCase().includes(s) ||
          m.division.toLowerCase().includes(s)
      );
    }

    // SORT
    list.sort((a, b) => {
      const valA = String(a[sortBy]).toLowerCase();
      const valB = String(b[sortBy]).toLowerCase();

      if (sortOrder === "asc") return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    return list;
  }, [minutes, search, sortBy, sortOrder]);

  // PAGINATION
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);



  // DELETE CONFIRM
  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await deleteMinute(deleteTarget.id);
      showToast("Meeting minute deleted successfully.", "success");

      await load();
    } catch (e) {
      showToast("Failed to delete meeting minute.", "error");
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
        <h1 className="text-2xl font-bold text-gray-800">📄 Meeting Minutes</h1>

        <button
          className="bg-[#005BAA] hover:bg-[#0668C2] text-white px-4 py-2 rounded-lg shadow-md transition"
          onClick={() => setOpenCreateModal(true)}
        >
          + New Minute
        </button>
      </div>

      {/* Search + Filter */}
      <div className="bg-white p-4 rounded-xl shadow border flex flex-col md:flex-row justify-between gap-4">
        <input
          type="text"
          placeholder="Search by title, division, speaker..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded-lg w-full md:w-1/2"
        />
      </div>

      {/* Table Card */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                {[
                  { key: "id", label: "ID" },
                  { key: "title", label: "Title" },
                  { key: "division", label: "Division" },
                  { key: "speaker", label: "Speaker" },
                  { key: "createdAt", label: "Meeting time" },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-2 text-left cursor-pointer select-none hover:text-blue-600"
                    onClick={() => handleSort(col.key as keyof MeetingMinute)}
                  >
                    {col.label}{" "}
                    {sortBy === col.key && (
                      <span className="text-xs">
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                ))}

                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((m) => (
                <tr key={m.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{m.id}</td>
                  <td className="px-4 py-2 font-medium">{m.title}</td>
                  <td className="px-4 py-2">{m.division}</td>
                  <td className="px-4 py-2">{m.speaker}</td>
                  <td className="px-4 py-2"> {formatFullDate(m.createdAt)}</td>

                  <td className="px-4 py-2 space-x-4">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => navigate(`/minutes/${m.id}`)}
                    >
                      View
                    </button>

                    <button
                      className="text-green-600 hover:underline"
                      onClick={() => {
                        setEditId(m.id);
                        setOpenEditModal(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => setDeleteTarget(m)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
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
      <CreateMinuteModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreated={() => {
          showToast("New meeting minute created successfully.", "success");
          load();
        }}
      />

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

      {/* DELETE CONFIRMATION */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Meeting Minute"
          message={
            <div className="space-y-2 text-sm">
              <p>Are you sure you want to delete this meeting minute?</p>

              <div className="bg-gray-50 p-3 rounded border text-sm">
                <p><strong>ID:</strong> {deleteTarget.id}</p>
                <p><strong>Title:</strong> {deleteTarget.title}</p>
                <p><strong>Division:</strong> {deleteTarget.division}</p>
                <p><strong>Speaker:</strong> {deleteTarget.speaker}</p>
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
