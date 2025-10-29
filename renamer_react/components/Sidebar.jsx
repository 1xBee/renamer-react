// ===== components/Sidebar.jsx =====
import React from 'react';
import { useFileRenamer } from '../context/FileRenamerContext';
import AIConfig from './AIConfig';
import FolderSelect from './FolderSelect';
import StatsPanel from './StatsPanel';

export default function Sidebar() {
  const { mobileMenuOpen, theme } = useFileRenamer();

  return (
    <>
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" />}
      <div className={`fixed lg:relative top-[72px] lg:top-0 left-0 bottom-0 w-80 lg:w-auto z-50 lg:z-auto overflow-y-auto p-4 lg:p-0 transition-transform duration-300 space-y-4 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <AIConfig />
        <FolderSelect />
        <StatsPanel />
      </div>
    </>
  );
}