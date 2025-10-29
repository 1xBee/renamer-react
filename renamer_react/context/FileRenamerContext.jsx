// ===== context/FileRenamerContext.jsx =====
import React, { createContext, useContext, useState, useEffect } from 'react';

const FileRenamerContext = createContext();

export const useFileRenamer = () => {
  const context = useContext(FileRenamerContext);
  if (!context) throw new Error('useFileRenamer must be used within FileRenamerProvider');
  return context;
};

export const FileRenamerProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [config, setConfig] = useState({
    selectedModel: 'gemini-2.0-flash-exp',
    selectedApiKey: '',
    selectedPrompt: '',
    customPrompt: ''
  });
  
  const [apiKeys, setApiKeys] = useState({});
  const [prompts, setPrompts] = useState({});
  const [notification, setNotification] = useState({ visible: false, message: '', type: 'info' });
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, message: '', callback: null });
  const [onboarding, setOnboarding] = useState({ visible: false, currentStep: 0 });

  const stats = {
    total: files.length,
    processed: files.filter(f => f.status === 'processed').length,
    pending: files.filter(f => f.status === 'pending').length,
    failed: files.filter(f => f.status === 'failed').length
  };

  useEffect(() => {
    const stored = localStorage.getItem('aiFileRenamerPro');
    if (stored) {
      const data = JSON.parse(stored);
      setTheme(data.theme || 'light');
      setApiKeys(data.apiKeys || {});
      setPrompts(data.prompts || {});
      setConfig(prev => ({
        ...prev,
        selectedModel: data.selectedModel || 'gemini-2.0-flash-exp',
        customPrompt: data.customPrompt || ''
      }));
    }
    
    if (Object.keys(prompts).length === 0) {
      setPrompts({
        'Invoice Renamer': 'Extract the invoice number and date from this document. Format the filename as: INV[NUMBER]_[YYYYMMDD]',
        'Receipt Organizer': 'Find the store name and purchase date. Format as: [STORE]_[YYYYMMDD]',
        'Delivery Tracker': 'Locate the delivery number and date. Format as: [YYYYMMDD]_delivery_[NUMBER]',
        'Contract Documents': 'Extract client/company name and contract date. Format as: Contract_[NAME]_[YYYYMMDD]',
        'Medical Records': 'Find patient name and document date. Format as: [LASTNAME]_[FIRSTNAME]_[YYYYMMDD]'
      });
    }

    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setTimeout(() => setOnboarding({ visible: true, currentStep: 0 }), 500);
    }
  }, []);

  useEffect(() => {
    const data = { theme, apiKeys, prompts, selectedModel: config.selectedModel, customPrompt: config.customPrompt };
    localStorage.setItem('aiFileRenamerPro', JSON.stringify(data));
  }, [theme, apiKeys, prompts, config.selectedModel, config.customPrompt]);

  const showNotification = (message, type = 'info') => {
    setNotification({ visible: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 3000);
  };

  const selectFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker({ mode: 'read' });
      setDirectoryHandle(handle);
      await loadFiles(handle);
      setFolderName(handle.name);
      setMobileMenuOpen(false);
    } catch (error) {
      if (error.name !== 'AbortError') {
        showNotification('Failed to select folder', 'error');
      }
    }
  };

  const loadFiles = async (handle) => {
    const supportedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'txt', 'doc', 'docx'];
    const newFiles = [];
    
    for await (const entry of handle.values()) {
      if (entry.kind === 'file') {
        const ext = entry.name.split('.').pop().toLowerCase();
        if (supportedExtensions.includes(ext)) {
          newFiles.push({
            handle: entry,
            name: entry.name,
            newName: '',
            status: 'pending',
            selected: true,
            error: ''
          });
        }
      }
    }
    setFiles(newFiles);
  };

  const processFiles = async () => {
    if (!config.selectedApiKey) {
      showNotification('Please select an API key', 'warning');
      return;
    }
    if (!config.customPrompt.trim()) {
      showNotification('Please enter a prompt', 'warning');
      return;
    }

    const selectedFiles = files.filter(f => f.selected);
    if (selectedFiles.length === 0) {
      showNotification('Please select at least one file', 'warning');
      return;
    }

    setIsProcessing(true);
    showNotification(`Processing ${selectedFiles.length} file(s)...`, 'info');
    await Promise.all(selectedFiles.map(file => processFile(file)));
    setIsProcessing(false);
    
    const failed = files.filter(f => f.status === 'failed').length;
    if (failed === 0) {
      showNotification('Processing complete!', 'success');
    } else {
      showNotification(`Processing complete with ${failed} error(s)`, 'warning');
    }
  };

  const processFile = async (file) => {
    setFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'processing' } : f));

    try {
      const apiKey = apiKeys[config.selectedApiKey];
      const newName = await callAI(file, config.customPrompt, apiKey, config.selectedModel);
      setFiles(prev => prev.map(f => f.name === file.name ? { ...f, newName, status: 'processed' } : f));
    } catch (error) {
      setFiles(prev => prev.map(f => f.name === file.name ? { ...f, newName: error.message, status: 'failed' } : f));
    }
  };

  const callAI = async (file, prompt, apiKey, model) => {
    const fileHandle = await directoryHandle.getFileHandle(file.name);
    const fileObject = await fileHandle.getFile();
    const ext = file.name.split('.').pop().toLowerCase();
    
    const fullPrompt = prompt + "\n\nDo not include any explanation, only return the filename without extension.";
    const base64Data = await fileToBase64(fileObject);
    
    let mimeType = 'text/plain';
    if (ext === 'pdf') mimeType = 'application/pdf';
    else if (['jpg', 'jpeg'].includes(ext)) mimeType = 'image/jpeg';
    else if (ext === 'png') mimeType = 'image/png';
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: fullPrompt },
            { inline_data: { mime_type: mimeType, data: base64Data } }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || response.statusText);
    }

    const data = await response.json();
    let newName = data.candidates[0].content.parts[0].text.trim();
    newName = newName.replace(/```/g, '').replace(/\n/g, '').trim();
    
    if (!newName.endsWith(`.${ext}`)) {
      newName = `${newName}.${ext}`;
    }
    
    return newName;
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const renameFiles = async () => {
    try {
      const permission = await directoryHandle.requestPermission({ mode: 'readwrite' });
      if (permission !== 'granted') {
        showNotification('Write permission denied', 'error');
        return;
      }

      const processedFiles = files.filter(f => f.status === 'processed');
      let successCount = 0;

      for (const file of processedFiles) {
        try {
          const handle = await directoryHandle.getFileHandle(file.name);
          await handle.move(file.newName);
          successCount++;
        } catch (error) {
          setFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'failed', error: 'Rename failed' } : f));
        }
      }

      showNotification(`Successfully renamed ${successCount} file(s)!`, 'success');
      await loadFiles(directoryHandle);
    } catch (error) {
      showNotification('Error during renaming: ' + error.message, 'error');
    }
  };

  const value = {
    theme, setTheme, mobileMenuOpen, setMobileMenuOpen, settingsOpen, setSettingsOpen,
    folderName, files, setFiles, isProcessing, config, setConfig, apiKeys, setApiKeys,
    prompts, setPrompts, stats, notification, confirmDialog, setConfirmDialog,
    onboarding, setOnboarding, showNotification, selectFolder, processFiles, renameFiles, directoryHandle
  };

  return <FileRenamerContext.Provider value={value}>{children}</FileRenamerContext.Provider>;
};