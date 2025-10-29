// ===== components/MainPanel.jsx =====
import React from 'react';
import FileList from './FileList';
import EmptyState from './EmptyState';
import ActionButtons from './ActionButtons';
import { useFileRenamer } from '../context/FileRenamerContext';

export default function MainPanel() {
  const { files } = useFileRenamer();

  return (
    <div className="lg:col-span-2 space-y-4">
      {files.length > 0 && <ActionButtons />}
      {files.length > 0 ? <FileList /> : <EmptyState />}
    </div>
  );
}