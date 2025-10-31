// ===== components/ActionButtons.jsx =====
import React from 'react';
import { PlayCircle, CheckCircle } from 'lucide-react';
import { useFileRenamer } from '../context/FileRenamerContext';

export default function ActionButtons() {
  const { processFiles, isProcessing, stats, setConfirmDialog, renameFiles } = useFileRenamer();
  const canRename = stats.processed > 0;

  const showRenameConfirmation = () => {
    setConfirmDialog({
      visible: true,
      message: `You are about to rename ${stats.processed} file(s). This action cannot be undone. Are you sure?`,
      callback: renameFiles
    });
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 shadow-sm p-4 rounded-xl">
      <div className="flex gap-3 flex-col sm:flex-row">
        <button onClick={processFiles} disabled={isProcessing} className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">
          <PlayCircle size={20} />
          Process Files
        </button>
        <button onClick={showRenameConfirmation} disabled={!canRename} className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">
          <CheckCircle size={20} />
          Rename Files
        </button>
      </div>
    </div>
  );
}