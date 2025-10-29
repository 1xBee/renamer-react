// ===== components/FileList.jsx =====
import React from 'react';
import { File as FileIcon } from 'lucide-react';
import { useFileRenamer } from '../context/FileRenamerContext';
import FileItem from './FileItem';

export default function FileList() {
  const { files, setFiles, theme } = useFileRenamer();
  const cardClass = theme === 'dark' ? 'bg-gray-900/80 border border-gray-800' : 'bg-white/95 border border-gray-200 shadow-sm';

  const selectAll = () => setFiles(prev => prev.map(f => ({ ...f, selected: true })));
  const clearAll = () => setFiles(prev => prev.map(f => ({ ...f, selected: false })));

  return (
    <div className={`${cardClass} p-6 rounded-xl`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-2">
          <button onClick={selectAll} className="px-3 py-1 text-sm rounded-lg border border-gray-700 hover:bg-gray-700 transition">Select All</button>
          <button onClick={clearAll} className="px-3 py-1 text-sm rounded-lg border border-gray-700 hover:bg-gray-700 transition">Clear All</button>
        </div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileIcon size={20} />
          Files (<span>{files.length}</span>)
        </h2>
      </div>
      
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {files.map((file, index) => <FileItem key={index} file={file} />)}
      </div>
    </div>
  );
}