// ===== context/FileRenamerContext.jsx =====
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { userSettingsAPI, apiKeysAPI, promptsAPI } from '../services/api';

const FileRenamerContext = createContext();

export const useFileRenamer = () => {
  const context = useContext(FileRenamerContext);
  if (!context) throw new Error('useFileRenamer must be used within FileRenamerProvider');
  return context;
};

export const FileRenamerProvider = ({ children }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
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
  
  const [notification, setNotification] = useState({ visible: false, message: '', type: 'info' });
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, message: '', callback: null });
  const [onboarding, setOnboarding] = useState({ visible: false, currentStep: 0 });

  // ===== React Query: Fetch User Settings =====
  const { data: userSettings } = useQuery({
    queryKey: ['userSettings', user?.id],
    queryFn: () => userSettingsAPI.get(user.id),
    enabled: !!user,
  });

  // ===== React Query: Fetch API Keys =====
  const { data: apiKeysData = [] } = useQuery({
    queryKey: ['apiKeys', user?.id],
    queryFn: () => apiKeysAPI.getAll(user.id),
    enabled: !!user,
  });

  // ===== React Query: Fetch Prompts =====
  const { data: promptsData = [] } = useQuery({
    queryKey: ['prompts', user?.id],
    queryFn: () => promptsAPI.getAll(user.id),
    enabled: !!user,
  });

  // Convert API keys array to object format
  const apiKeys = apiKeysData.reduce((acc, key) => {
    acc[key.key_name] = key.key_value;
    return acc;
  }, {});

  // Convert prompts array to object format
  const prompts = promptsData.reduce((acc, prompt) => {
    acc[prompt.prompt_name] = prompt.prompt_text;
    return acc;
  }, {});

  // ===== Mutations =====
  const settingsMutation = useMutation({
    mutationFn: (settings) => userSettingsAPI.upsert(user.id, settings),
    onSuccess: () => {
      queryClient.invalidateQueries(['userSettings', user?.id]);
    },
  });

  const addApiKeyMutation = useMutation({
    mutationFn: ({ name, value }) => apiKeysAPI.create(user.id, name, value),
    onSuccess: () => {
      queryClient.invalidateQueries(['apiKeys', user?.id]);
      showNotification('API key saved', 'success');
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: (keyId) => apiKeysAPI.delete(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries(['apiKeys', user?.id]);
      showNotification('API key deleted', 'info');
    },
  });

  const addPromptMutation = useMutation({
    mutationFn: ({ name, value }) => promptsAPI.create(user.id, name, value),
    onSuccess: () => {
      queryClient.invalidateQueries(['prompts', user?.id]);
      showNotification('Prompt saved', 'success');
    },
  });

  const deletePromptMutation = useMutation({
    mutationFn: (promptId) => promptsAPI.delete(promptId),
    onSuccess: () => {
      queryClient.invalidateQueries(['prompts', user?.id]);
      showNotification('Prompt deleted', 'info');
    },
  });

  // ===== Load user settings into state =====
  useEffect(() => {
    if (userSettings) {
      setTheme(userSettings.theme || 'light');
      setConfig({
        selectedModel: userSettings.selected_model || 'gemini-2.0-flash-exp',
        selectedApiKey: userSettings.selected_api_key || '',
        selectedPrompt: userSettings.selected_prompt || '',
        customPrompt: userSettings.custom_prompt || '',
      });
    }
  }, [userSettings]);

  // ===== Save settings when they change =====
  useEffect(() => {
    if (user) {
      const saveSettings = async () => {
        await settingsMutation.mutateAsync({
          theme,
          selectedModel: config.selectedModel,
          selectedApiKey: config.selectedApiKey,
          selectedPrompt: config.selectedPrompt,
          customPrompt: config.customPrompt,
        });
      };
      
      const debounce = setTimeout(saveSettings, 500);
      return () => clearTimeout(debounce);
    }
  }, [theme, config, user]);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const stats = {
    total: files.length,
    processed: files.filter(f => f.status === 'processed').length,
    pending: files.filter(f => f.status === 'pending').length,
    failed: files.filter(f => f.status === 'failed').length
  };

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

  const processSingleFile = async (file) => {
    if (!config.selectedApiKey) {
      showNotification('Please select an API key', 'warning');
      return;
    }
    if (!config.customPrompt.trim()) {
      showNotification('Please enter a prompt', 'warning');
      return;
    }

    showNotification('Processing file...', 'info');
    await processFile(file);
    
    const updatedFile = files.find(f => f.name === file.name);
    if (updatedFile?.status === 'failed') {
      showNotification('Processing failed', 'error');
    } else {
      showNotification('File processed successfully!', 'success');
    }
  };

  const renameSingleFile = async (file) => {
    if (file.status !== 'processed') {
      showNotification('File must be processed first', 'warning');
      return;
    }

    try {
      const permission = await directoryHandle.requestPermission({ mode: 'readwrite' });
      if (permission !== 'granted') {
        showNotification('Write permission denied', 'error');
        return;
      }

      const handle = await directoryHandle.getFileHandle(file.name);
      await handle.move(file.newName);
      showNotification(`Successfully renamed to ${file.newName}!`, 'success');
      await loadFiles(directoryHandle);
    } catch (error) {
      setFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'failed', error: 'Rename failed' } : f));
      showNotification('Failed to rename file: ' + error.message, 'error');
    }
  };

  const removeFile = (fileName) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
    showNotification('File removed from list', 'info');
  };

  const updateFileName = (fileName, newName) => {
    setFiles(prev => prev.map(f => 
      f.name === fileName 
        ? { ...f, newName, status: 'processed' } 
        : f
    ));
    showNotification('Filename updated', 'success');
  };

  // Helper functions for Settings component
  const addApiKey = async (name, value) => {
    await addApiKeyMutation.mutateAsync({ name, value });
  };

  const deleteApiKey = async (name) => {
    const key = apiKeysData.find(k => k.key_name === name);
    if (key) await deleteApiKeyMutation.mutateAsync(key.id);
  };

  const addPrompt = async (name, value) => {
    await addPromptMutation.mutateAsync({ name, value });
  };

  const deletePrompt = async (name) => {
    const prompt = promptsData.find(p => p.prompt_name === name);
    if (prompt) await deletePromptMutation.mutateAsync(prompt.id);
  };

  const value = {
    theme, setTheme, mobileMenuOpen, setMobileMenuOpen, settingsOpen, setSettingsOpen,
    folderName, files, setFiles, isProcessing, config, setConfig, 
    apiKeys, prompts, stats, notification, confirmDialog, setConfirmDialog,
    onboarding, setOnboarding, showNotification, selectFolder, processFiles, renameFiles, directoryHandle,
    processSingleFile, renameSingleFile, removeFile, updateFileName,
    addApiKey, deleteApiKey, addPrompt, deletePrompt, apiKeysData, promptsData
  };

  return <FileRenamerContext.Provider value={value}>{children}</FileRenamerContext.Provider>;
};