// ===== components/AIConfig.jsx =====
import React from 'react';
import { Cpu } from 'lucide-react';
import { useFileRenamer } from '../context/FileRenamerContext';

export default function AIConfig() {
  const { config, setConfig, apiKeys, prompts, setSettingsOpen } = useFileRenamer();
  

  return (
    <div className="bg-white/95 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 shadow-sm backdrop-blur-md p-6 rounded-xl">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Cpu size={20} />
        AI Configuration
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm opacity-70 mb-2">AI Model</label>
          <select value={config.selectedModel} onChange={(e) => setConfig(prev => ({ ...prev, selectedModel: e.target.value }))} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-black border-gray-300 dark:border-gray-700 dark:text-white">
            <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash ⚡</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash 💰</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro 🎯</option>
          </select>
        </div>

        <div>
          <label className="block text-sm opacity-70 mb-2">API Key</label>
          <select value={config.selectedApiKey} onChange={(e) => setConfig(prev => ({ ...prev, selectedApiKey: e.target.value }))} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-black border-gray-300 dark:border-gray-700 dark:text-white mb-2">
            <option value="">Select API Key</option>
            {Object.keys(apiKeys).map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <button onClick={() => setSettingsOpen(true)} className="text-xs text-blue-500 hover:underline">+ Manage API Keys</button>
        </div>

        <div>
          <label className="block text-sm opacity-70 mb-2">Prompt Template</label>
          <select value={config.selectedPrompt} onChange={(e) => { const selected = e.target.value; setConfig(prev => ({ ...prev, selectedPrompt: selected, customPrompt: prompts[selected] || '' })); }} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-black border-gray-300 dark:border-gray-700 dark:text-white mb-2">
            <option value="">Select Prompt</option>
            {Object.keys(prompts).map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <button onClick={() => setSettingsOpen(true)} className="text-xs text-blue-500 hover:underline">+ Manage Prompts</button>
        </div>

        <div>
          <label className="block text-sm opacity-70 mb-2">Custom Prompt</label>
          <textarea value={config.customPrompt} onChange={(e) => setConfig(prev => ({ ...prev, customPrompt: e.target.value }))} rows="6" className="w-full px-3 py-2 rounded-lg border text-sm resize-none bg-white dark:bg-black border-gray-300 dark:border-gray-700 dark:text-white" placeholder="Enter custom AI instructions..." />
        </div>
      </div>
    </div>
  );
}