// ===== components/ConfirmDialog.jsx =====
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useFileRenamer } from '../context/FileRenamerContext';

export default function ConfirmDialog() {
  const { confirmDialog, setConfirmDialog } = useFileRenamer();

  if (!confirmDialog.visible) return null;

  const handleConfirm = () => {
    if (confirmDialog.callback) confirmDialog.callback();
    setConfirmDialog({ visible: false, message: '', callback: null });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-xl max-w-md w-11/12 mx-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-yellow-500" size={32} />
          <h2 className="text-2xl font-bold">Confirm Rename</h2>
        </div>
        <p className="mb-6 opacity-70">{confirmDialog.message}</p>
        <div className="flex gap-3">
          <button onClick={() => setConfirmDialog({ visible: false, message: '', callback: null })} className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition">
            Cancel
          </button>
          <button onClick={handleConfirm} className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition">
            Rename Files
          </button>
        </div>
      </div>
    </div>
  );
}