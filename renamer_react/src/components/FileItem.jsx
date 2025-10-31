// ===== components/FileItem.jsx =====
import React from 'react';
import { useFileRenamer } from '../context/FileRenamerContext';

export default function FileItem({ file }) {
  const { setFiles } = useFileRenamer();

  const toggleSelected = () => {
    setFiles(prev => prev.map(f => f.name === file.name ? { ...f, selected: !f.selected } : f));
  };

  const statusColors = {
    pending: 'bg-gray-700 text-gray-300',
    processing: 'bg-blue-700 text-blue-300',
    processed: 'bg-green-700 text-green-300',
    failed: 'bg-red-700 text-red-300'
  };

  const statusText = {
    pending: 'Pending',
    processing: 'Processing...',
    processed: '✓ Ready',
    failed: '✗ Failed'
  };

  return (
    <div className="p-4 rounded-lg border transition border-gray-200 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5">
      <div className="flex items-center gap-3">
        <input type="checkbox" checked={file.selected} onChange={toggleSelected} className="w-4 h-4" />
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs opacity-50 mb-1">Original</div>
            <div className="font-medium break-all">{file.name}</div>
          </div>
          <div>
            <div className="text-xs opacity-50 mb-1">New Name</div>
            <div className={`break-all ${file.status === 'processed' ? 'text-green-500 font-medium' : file.status === 'failed' ? 'text-red-500 text-xs' : 'text-gray-500 italic'}`}>
              {file.newName || 'Not processed'}
            </div>
          </div>
        </div>
        <div className={`text-sm px-3 py-1 rounded whitespace-nowrap ${statusColors[file.status]}`}>
          {statusText[file.status]}
        </div>
      </div>
      {file.status === 'processing' && (
        <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse"></div>
        </div>
      )}
    </div>
  );
}