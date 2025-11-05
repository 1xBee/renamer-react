// ===== App.jsx =====
import React from 'react';
import { FileRenamerProvider } from './context/FileRenamerContext';
import TopRibbon from './components/TopRibbon';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import Toast from './components/Toast';
import SettingsModal from './components/SettingsModal';
import ConfirmDialog from './components/ConfirmDialog';
import OnboardingModal from './components/OnboardingModal';

export default function App() {
  return (
    <FileRenamerProvider>
      <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] text-[#1e293b] dark:from-[#000000] dark:to-[#0a0a0a] dark:text-[#fafafa]">
        <Toast />
        <TopRibbon />
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Sidebar />
            <MainPanel />
          </div>
        </div>
        <SettingsModal />
        <ConfirmDialog />
        <OnboardingModal />
      </div>
    </FileRenamerProvider>
  );
}