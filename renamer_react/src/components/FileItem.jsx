// ===== components/FileItem.jsx =====
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useFileRenamer } from '../context/FileRenamerContext';
import FileItemMenu from './FileItemMenu';

export default function FileItem({ file }) {
  const { setFiles, processSingleFile, renameSingleFile, removeFile, updateFileName } = useFileRenamer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);

  const toggleSelected = () => {
    setFiles(prev => prev.map(f => f.name === file.name ? { ...f, selected: !f.selected } : f));
  };

  // Auto-expand if there's an error
  useEffect(() => {
    if (file.status === 'failed') {
      setIsExpanded(true);
    }
  }, [file.status]);

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

  // Determine reasoning section color and background based on rating or error
  const getReasoningStyle = () => {
    if (file.status === 'failed') {
      return {
        color: 'text-red-400',
        bg: 'bg-red-400/10'
      };
    }
    
    if (file.rating === 3) {
      return {
        color: 'text-green-400',
        bg: 'bg-green-400/10'
      };
    }
    
    if (file.rating === 2) {
      return {
        color: 'text-orange-400',
        bg: 'bg-orange-400/10'
      };
    }
    
    if (file.rating === 1) {
      return {
        color: 'text-red-300',
        bg: 'bg-red-300/10'
      };
    }
    
    return null;
  };

  const reasoningStyle = getReasoningStyle();
  const hasReasoning = file.reasoning || file.status === 'failed';

  console.log(file);

  return (
    <div className="rounded-lg border transition border-gray-200 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center justify-center">
            <input type="checkbox" checked={file.selected} onChange={toggleSelected} className="w-4 h-4 mb-1" />
            {hasReasoning && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            )}
          </div>
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
                <div className={`break-all ${
                  file.status === 'processed' 
                    ? 'text-green-500 font-medium' 
                    : file.status === 'failed' 
                    ? 'text-gray-500 italic' 
                    : 'text-gray-500 italic'
                }`}>
                  {file.status === 'failed' ? 'Not processed' : (file.newName || 'Not processed')}
                </div>
              )}
            </div>
          </div>
          
          <div className={`text-sm px-3 py-1 rounded whitespace-nowrap ${statusColors[file.status]}`}>
            {statusText[file.status]}
          </div>
          
          {/* Three-dot menu */}
          <FileItemMenu
            file={file}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            onProcess={() => processSingleFile(file)}
            onEdit={handleEdit}
            onRename={() => renameSingleFile(file)}
            onRemove={() => removeFile(file.name)}
          />
        </div>
        
        {file.status === 'processing' && (
          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse"></div>
          </div>
        )}
      </div>
      
      {/* Expandable reasoning section */}
      {isExpanded && hasReasoning && reasoningStyle && (
        <div className={`px-4 pb-4 ${reasoningStyle.bg}`}>
          <div className={`font-mono text-sm ${reasoningStyle.color} py-2 px-3 rounded`}>
            {file.status === 'failed' ? file.newName : file.reasoning}
          </div>
        </div>
      )}
    </div>
  );
}