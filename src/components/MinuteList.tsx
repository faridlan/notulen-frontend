/* eslint-disable react-hooks/exhaustive-deps */
 
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMinutes, deleteMinute } from "../services/minutes.service";
import type { MeetingMinute } from "../types/MeetingMinute";

import EditMinuteModal from "./EditMinuteModal";
import ConfirmDialog from "./common/ConfirmDialog";
import { useToast } from "./common/ToastProvider";
import formatFullDate from "../utils/formatDate";

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

  // SORT HANDLER
  function handleSort(field: keyof MeetingMinute) {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  // FILTER + SORT
  const filtered = useMemo(() => {
    let list = [...minutes];

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(s) ||
          m.division.toLowerCase().includes(s) ||
          m.speaker?.toLowerCase().includes(s) ||
          m.meetingType?.toLowerCase().includes(s)
      );
    }

    list.sort((a, b) => {
      const valA = String(a[sortBy] ?? "").toLowerCase();
      const valB = String(b[sortBy] ?? "").toLowerCase();

      if (sortOrder === "asc") return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    return list;
  }, [minutes, search, sortBy, sortOrder]);

  // PAGINATION
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // DELETE
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
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row justify-between gap-3">
        <h2 className="text-xl font-semibold">📋 All Meeting Minutes</h2>

        <input
          type="text"
          placeholder="Search title, division, speaker, meeting type..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg px-3 py-2 w-full md:w-72 text-sm"
        />
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
                { key: "meetingType", label: "Meeting Type" },
                { key: "speaker", label: "Speaker" },
                { key: "meetingDate", label: "Meeting Date" },
              ].map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2 text-left cursor-pointer hover:text-blue-600"
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
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-4 text-center text-gray-500 italic"
                >
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-sm pt-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page <strong>{page}</strong> of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
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
          message={
            <div className="space-y-2 text-sm">
              <p>Are you sure you want to delete this meeting minute?</p>
              <div className="bg-gray-50 p-3 rounded border">
                <p><strong>Title:</strong> {deleteTarget.title}</p>
                <p><strong>Division:</strong> {deleteTarget.division}</p>
                <p><strong>Meeting Type:</strong> {deleteTarget.meetingType}</p>
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
