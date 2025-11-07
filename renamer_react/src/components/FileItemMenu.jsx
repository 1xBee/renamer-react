// ===== components/FileItemMenu.jsx =====
import React, { useRef, useEffect } from 'react';
import { MoreVertical, Play, Edit2, FileCheck, Trash2 } from 'lucide-react';

export default function FileItemMenu({ 
  file, 
  menuOpen, 
  setMenuOpen, 
  onProcess, 
  onEdit, 
  onRename, 
  onRemove 
}) {
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen, setMenuOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
      >
        <MoreVertical size={18} />
      </button>
      
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              onProcess();
              setMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left text-sm"
          >
            <Play size={16} />
            Process this file
          </button>
          
          <button
            onClick={() => {
              onEdit();
              setMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left text-sm"
          >
            <Edit2 size={16} />
            Edit name
          </button>
          
          {file.status === 'processed' && (
            <button
              onClick={() => {
                onRename();
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left text-sm"
            >
              <FileCheck size={16} />
              Rename now
            </button>
          )}
          
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
          
          <button
            onClick={() => {
              onRemove();
              setMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition text-left text-sm"
          >
            <Trash2 size={16} />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}