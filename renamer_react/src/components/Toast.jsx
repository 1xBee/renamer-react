// ===== components/Toast.jsx =====
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useFileRenamer } from '../context/FileRenamerContext';

export default function Toast() {
  const { notification } = useFileRenamer();
  
  if (!notification.visible) return null;

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600'
  };

  const icons = {
    success: <CheckCircle size={24} />,
    error: <XCircle size={24} />,
    warning: <AlertTriangle size={24} />,
    info: <Info size={24} />
  };  

  return (
    <div className={`fixed top-20 right-6 ${colors[notification.type]} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50`}>
      {icons[notification.type]}
      <span>{notification.message}</span>
    </div>
  );
}