// ===== App.jsx =====
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { FileRenamerProvider } from './context/FileRenamerContext';

// Core UI
import TopRibbon from './components/TopRibbon';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';

// Utility & Modals
import Toast from './components/Toast';
import SettingsModal from './components/SettingsModal';
import ConfirmDialog from './components/ConfirmDialog';
import OnboardingModal from './components/OnboardingModal';
import LoginPopup from './components/LoginPopup';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppContent() {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  // Show spinner while auth is checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm opacity-70">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login popup if not authenticated
  if (!user) return <LoginPopup />;

  // Main app when logged in
  return (
    <FileRenamerProvider>
      <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] text-[#1e293b] dark:from-[#000000] dark:to-[#0a0a0a] dark:text-[#fafafa]">
        <Toast />
        <TopRibbon />
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Layout from version 2 */}
            <Sidebar />
            <MainPanel />
          </div>
        </div>

        {/* Global Modals */}
        <SettingsModal />
        <ConfirmDialog />
        <OnboardingModal />
      </div>
    </FileRenamerProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
