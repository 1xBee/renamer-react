// ===== components/FolderSelect.jsx =====
import React from 'react';
import { Folder, FolderOpen } from 'lucide-react';
import { useFileRenamer } from '../context/FileRenamerContext';

export default function FolderSelect() {
  const { selectFolder, folderName, theme } = useFileRenamer();
  const cardClass = theme === 'dark' ? 'bg-gray-900/80 border border-gray-800 backdrop-blur-md' : 'bg-white/95 border border-gray-200 shadow-sm backdrop-blur-md';

  return (
    <div className={`${cardClass} p-6 rounded-xl`}>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Folder size={20} />
        Folder Selection
      </h2>
      <div onClick={selectFolder} className="border-2 border-dashed border-gray-500 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition">
        <FolderOpen size={48} className="mx-auto mb-3 opacity-50" />
        <div className="font-medium mb-1">Click to select folder</div>
        <div className="text-xs opacity-50">or drag and drop here</div>
      </div>
      <div className="mt-3 text-sm opacity-70 text-center">{folderName || 'No folder selected'}</div>
    </div>
  );
}