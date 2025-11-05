// ===== components/Sidebar.jsx =====
import React from 'react';
import { X } from 'lucide-react';
import { useFileRenamer } from '../context/FileRenamerContext';
import AIConfig from './AIConfig';
import FolderSelect from './FolderSelect';
import StatsPanel from './StatsPanel';

export default function Sidebar() {
  const { mobileMenuOpen, setMobileMenuOpen } = useFileRenamer();

  return (
    <>
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div className={`fixed lg:relative top-[72px] lg:top-0 left-0 bottom-0 w-80 lg:w-auto z-50 lg:z-auto overflow-y-auto pt-10 px-4 pb-4 lg:p-0 transition-transform duration-300 space-y-4 ${mobileMenuOpen ? 'translate-x-0 bg-gray-50 dark:bg-gray-950' : '-translate-x-full lg:translate-x-0 lg:bg-transparent'}`}>
        {/* Close button - only visible on mobile */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close menu"
          hidden={!mobileMenuOpen}
        >
          <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>

        <AIConfig />
        <FolderSelect />
        <StatsPanel />
      </div>
    </>
  );
}