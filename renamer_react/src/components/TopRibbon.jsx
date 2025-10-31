// ===== components/TopRibbon.jsx =====
import React from 'react';
import { Folder, Settings, Moon, Sun, HelpCircle, Menu } from 'lucide-react';
import { useFileRenamer } from '../context/FileRenamerContext';

export default function TopRibbon() {
  const { theme, setTheme, setMobileMenuOpen, setSettingsOpen, setOnboarding } = useFileRenamer();

  return (
    <div className="sticky top-0 z-40 p-4 backdrop-blur-md bg-gray-50/95 dark:bg-gray-950/95 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(prev => !prev)} className="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            <Menu size={20} />
          </button>
          <Folder className="text-blue-500" size={28} />
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent hidden sm:block">
            AI File Renamer Pro
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setOnboarding({ visible: true, currentStep: 0 })} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            <HelpCircle size={20} />
          </button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}