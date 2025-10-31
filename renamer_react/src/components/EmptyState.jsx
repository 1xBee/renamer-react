// ===== components/EmptyState.jsx =====
import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState() {

  return (
    <div className="bg-white/95 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 shadow-sm p-12 rounded-xl text-center opacity-50">
      <FolderOpen size={80} className="mx-auto mb-4 opacity-50" />
      <div className="text-lg mb-2">Select a folder to get started</div>
      <div className="text-sm opacity-70">Click the folder icon or use the sidebar</div>
    </div>
  );
}