// ===== components/FileItem.jsx =====
import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Play, Edit2, FileCheck, Trash2 } from 'lucide-react';
import { useFileRenamer } from '../context/FileRenamerContext';

export default function FileItem({ file }) {
  const { setFiles, processSingleFile, renameSingleFile, removeFile, updateFileName } = useFileRenamer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  const toggleSelected = () => {
    setFiles(prev => prev.map(f => f.name === file.name ? { ...f, selected: !f.selected } : f));
  };

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
  }, [menuOpen]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditValue(file.newName || file.name);
    setIsEditing(true);
    setMenuOpen(false);
  };

  const handleSaveEdit = () => {
    if (editValue.trim()) {
      updateFileName(file.name, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const statusColors = {
    pending: 'bg-gray-700 text-gray-300',
    processing: 'bg-blue-700 text-blue-300',
    processed: 'bg-green-700 text-green-300',
    failed: 'bg-red-700 text-red-300'
  };

  const statusText = {
    pending: 'Pending',
    processing: 'Processing...',
    processed: '✓ Ready',
    failed: '✗ Failed'
  };

  return (
    <div className="p-4 rounded-lg border transition border-gray-200 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5">
      <div className="flex items-center gap-3">
        <input type="checkbox" checked={file.selected} onChange={toggleSelected} className="w-4 h-4" />
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs opacity-50 mb-1">Original</div>
            <div className="font-medium break-all">{file.name}</div>
          </div>
          <div>
            <div className="text-xs opacity-50 mb-1">New Name</div>
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveEdit}
                  className="flex-1 px-2 py-1 rounded border border-blue-500 bg-white dark:bg-gray-800 text-sm"
                />
              </div>
            ) : (
              <div className={`break-all ${file.status === 'processed' ? 'text-green-500 font-medium' : file.status === 'failed' ? 'text-red-500 text-xs' : 'text-gray-500 italic'}`}>
                {file.newName || 'Not processed'}
              </div>
            )}
          </div>
        </div>
        <div className={`text-sm px-3 py-1 rounded whitespace-nowrap ${statusColors[file.status]}`}>
          {statusText[file.status]}
        </div>
        
        {/* Three-dot menu */}
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
                  processSingleFile(file);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left text-sm"
              >
                <Play size={16} />
                Process this file
              </button>
              
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left text-sm"
              >
                <Edit2 size={16} />
                Edit name
              </button>
              
              {file.status === 'processed' && (
                <button
                  onClick={() => {
                    renameSingleFile(file);
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
                  removeFile(file.name);
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
      </div>
      {file.status === 'processing' && (
        <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse"></div>
        </div>
      )}
    </div>
  );
}