// ===== components/TopRibbon.jsx =====
import React from 'react';
import { Folder, Settings, Moon, Sun, HelpCircle, Menu, LogOut } from 'lucide-react';
import { useFileRenamer } from '../context/FileRenamerContext';
import { useAuthStore } from '../stores/authStore';

export default function TopRibbon() {
  const { theme, setTheme, setMobileMenuOpen, setSettingsOpen, setOnboarding } = useFileRenamer();
  const { signOut, user } = useAuthStore();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut();
    }
  };

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
          {user && (
            <div className="hidden sm:block text-sm opacity-70 px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
              {user.email}
            </div>
          )}
          
          <button onClick={() => setOnboarding({ visible: true, currentStep: 0 })} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700" title="Help">
            <HelpCircle size={20} />
          </button>
          
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700" title="Toggle theme">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700" title="Settings">
            <Settings size={20} />
          </button>
          
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}