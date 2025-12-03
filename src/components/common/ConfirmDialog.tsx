import React from "react";
import Modal from "./Modal";

interface ConfirmDialogProps {
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  onConfirm,
  onClose,
  loading = false,
}) => {
  return (
    <Modal open title={title} onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="text-sm text-gray-700">{message}</div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
