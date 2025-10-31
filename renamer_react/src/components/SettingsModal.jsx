// ===== components/SettingsModal.jsx =====
import React, { useState } from 'react';
import { Settings, Key, Edit3, Plus, Edit2, Trash2, CheckSquare } from 'lucide-react';
import { useFileRenamer } from '../context/FileRenamerContext';

export default function SettingsModal() {
  const { settingsOpen, setSettingsOpen, apiKeys, setApiKeys, prompts, setPrompts, showNotification, config, setConfig } = useFileRenamer();
  const [newApiKey, setNewApiKey] = useState({ name: '', value: '' });
  const [newPrompt, setNewPrompt] = useState({ name: '', value: '' });

  if (!settingsOpen) return null;

  const addApiKey = () => {
    if (newApiKey.name && newApiKey.value) {
      setApiKeys(prev => ({ ...prev, [newApiKey.name]: newApiKey.value }));
      showNotification(`API key "${newApiKey.name}" saved`, 'success');
      setNewApiKey({ name: '', value: '' });
    }
  };

  const deleteApiKey = (name) => {
    const updated = { ...apiKeys };
    delete updated[name];
    setApiKeys(updated);
    showNotification(`API key "${name}" deleted`, 'info');
  };

  const editApiKey = (name) => {
    setNewApiKey({ name, value: apiKeys[name] });
  };

  const addPrompt = () => {
    if (newPrompt.name && newPrompt.value) {
      setPrompts(prev => ({ ...prev, [newPrompt.name]: newPrompt.value }));
      showNotification(`Prompt "${newPrompt.name}" saved`, 'success');
      setNewPrompt({ name: '', value: '' });
    }
  };

  const deletePrompt = (name) => {
    const updated = { ...prompts };
    delete updated[name];
    setPrompts(updated);
    showNotification(`Prompt "${name}" deleted`, 'info');
  };

  const editPrompt = (name) => {
    setNewPrompt({ name, value: prompts[name] });
  };

  const usePrompt = (name) => {
    setConfig(prev => ({ ...prev, selectedPrompt: name, customPrompt: prompts[name] }));
    setSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-xl max-w-2xl w-11/12 mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings size={24} />
            Settings
          </h2>
          <button onClick={() => setSettingsOpen(false)} className="text-2xl opacity-50 hover:opacity-100">×</button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Key size={20} />
              API Keys
            </h3>
            <div className="space-y-2 mb-3">
              {Object.keys(apiKeys).map(name => (
                <div key={name} className="flex items-center justify-between p-3 rounded-lg border border-gray-300 dark:border-gray-700">
                  <span className="font-medium">{name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => editApiKey(name)} className="text-blue-500 hover:text-blue-600">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteApiKey(name)} className="text-red-500 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
              <input value={newApiKey.name} onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))} type="text" placeholder="Key name..." className="flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-black border-gray-300 dark:border-gray-700 dark:text-white" />
              <input value={newApiKey.value} onChange={(e) => setNewApiKey(prev => ({ ...prev, value: e.target.value }))} type="password" placeholder="API key..." className="flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-black border-gray-300 dark:border-gray-700 dark:text-white" />
              <button onClick={addApiKey} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Edit3 size={20} />
              Prompt Templates
            </h3>
            <div className="space-y-2 mb-3">
              {Object.keys(prompts).map(name => (
                <div key={name} className="flex items-center justify-between p-3 rounded-lg border border-gray-300 dark:border-gray-700">
                  <span className="font-medium">{name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => usePrompt(name)} className="text-blue-500 hover:text-blue-600">
                      <CheckSquare size={16} />
                    </button>
                    <button onClick={() => editPrompt(name)} className="text-purple-500 hover:text-purple-600">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deletePrompt(name)} className="text-red-500 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <input value={newPrompt.name} onChange={(e) => setNewPrompt(prev => ({ ...prev, name: e.target.value }))} type="text" placeholder="Prompt name..." className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-black border-gray-300 dark:border-gray-700 dark:text-white" />
              <textarea value={newPrompt.value} onChange={(e) => setNewPrompt(prev => ({ ...prev, value: e.target.value }))} rows="4" placeholder="Prompt text..." className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-black border-gray-300 dark:border-gray-700 dark:text-white resize-none" />
              <button onClick={addPrompt} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center justify-center gap-2">
                <Plus size={20} />
                Add Prompt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}