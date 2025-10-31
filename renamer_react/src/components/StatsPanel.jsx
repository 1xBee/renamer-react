// ===== components/StatsPanel.jsx =====
import React from 'react';
import { BarChart2 } from 'lucide-react';
import { useFileRenamer } from '../context/FileRenamerContext';

export default function StatsPanel() {
  const { stats } = useFileRenamer();

  return (
    <div className="bg-white/95 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 shadow-sm backdrop-blur-md p-6 rounded-xl">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart2 size={20} />
        Statistics
      </h2>
      <div className="space-y-3 text-sm">
        <div>
          <div className="flex justify-between mb-1">
            <span className="opacity-70">Total Files:</span>
            <span className="font-semibold">{stats.total}</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="opacity-70">Processed:</span>
            <span className="font-semibold text-green-500">{stats.processed}</span>
          </div>
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600" style={{ width: `${stats.total > 0 ? (stats.processed / stats.total * 100) : 0}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="opacity-70">Pending:</span>
            <span className="font-semibold text-yellow-500">{stats.pending}</span>
          </div>
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500" style={{ width: `${stats.total > 0 ? (stats.pending / stats.total * 100) : 0}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="opacity-70">Failed:</span>
            <span className="font-semibold text-red-500">{stats.failed}</span>
          </div>
        </div>
      </div>
    </div>
  );
}