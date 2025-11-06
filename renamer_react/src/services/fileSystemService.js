// ===== services/fileSystemService.js =====

/**
 * Check if a file or folder exists in the directory
 * @param {FileSystemDirectoryHandle} directoryHandle
 * @param {string} name
 * @returns {Promise<boolean>}
 */
const entryExists = async (directoryHandle, name) => {
  try {
    await directoryHandle.getFileHandle(name);
    return true;
  } catch {
    try {
      await directoryHandle.getDirectoryHandle(name);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Generate next available name for a file if duplicates exist
 * @param {FileSystemDirectoryHandle} directoryHandle
 * @param {string} baseName
 * @param {string} extension
 * @returns {Promise<string>}
 */
const getNextAvailableFileName = async (directoryHandle, baseName, extension) => {
  const regex = new RegExp(`^${baseName}\\((\\d+)\\)\\.${extension}$`);
  let highest = 1; // first duplicate will be (2)

  for await (const entry of directoryHandle.values()) {
    const match = entry.name.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > highest) highest = num;
    }
  }

  return `${baseName}(${highest + 1}).${extension}`;
};

/**
 * Safely rename a file, checking for conflicts first
 * @param {FileSystemDirectoryHandle} directoryHandle - The directory handle
 * @param {string} oldName - Current file name
 * @param {string} newName - Desired new file name
 * @param {'error'|'auto-increment'} mode - How to handle duplicates
 * @throws {Error} If file exists (mode='error') or permission denied
 */
export const safeRenameFile = async (directoryHandle, oldName, newName, mode = 'auto-increment') => {
  // Request write permission
  const permission = await directoryHandle.requestPermission({ mode: 'readwrite' });
  if (permission !== 'granted') throw new Error('Write permission denied');

  // Split base name and extension
  const lastDot = newName.lastIndexOf('.');
  const baseName = lastDot !== -1 ? newName.slice(0, lastDot) : newName;
  const extension = lastDot !== -1 ? newName.slice(lastDot + 1) : '';

  // Handle duplicates
  if (await entryExists(directoryHandle, newName)) {
    if (mode === 'error') throw new Error('File or folder already exists');
    if (mode === 'auto-increment') {
      newName = await getNextAvailableFileName(directoryHandle, baseName, extension);
    }
  }

  // Perform the rename using move()
  const handle = await directoryHandle.getFileHandle(oldName);
  await handle.move(newName);
};


/**
 * Load files from a directory
 * @param {FileSystemDirectoryHandle} directoryHandle - The directory handle
 * @returns {Promise<Array>} - Array of file objects
 */
export const loadFilesFromDirectory = async (directoryHandle) => {
  const supportedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'txt', 'doc', 'docx'];
  const files = [];
  
  for await (const entry of directoryHandle.values()) {
    if (entry.kind === 'file') {
      const ext = entry.name.split('.').pop().toLowerCase();
      if (supportedExtensions.includes(ext)) {
        files.push({
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
  
  return files;
};

/**
 * Convert file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 encoded file data
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Get MIME type from file extension
 * @param {string} extension - File extension (with or without dot)
 * @returns {string} - MIME type string
 */
export const getMimeType = (extension) => {
  const ext = extension.toLowerCase().replace('.', '');
  if (ext === 'pdf') return 'application/pdf';
  if (['jpg', 'jpeg'].includes(ext)) return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  return 'text/plain';
};

/**
 * Get file extension from filename
 * @param {string} fileName - The filename
 * @returns {string} - File extension without dot
 */
export const getFileExtension = (fileName) => {
  return fileName.split('.').pop().toLowerCase();
};

/**
 * Ensure filename has correct extension
 * @param {string} fileName - The filename to check
 * @param {string} extension - The required extension
 * @returns {string} - Filename with correct extension
 */
export const ensureExtension = (fileName, extension) => {
  const ext = extension.toLowerCase().replace('.', '');
  if (!fileName.endsWith(`.${ext}`)) {
    return `${fileName}.${ext}`;
  }
  return fileName;
};

/**
 * Request permission for a directory
 * @param {FileSystemDirectoryHandle} directoryHandle - The directory handle
 * @param {string} mode - Permission mode ('read' or 'readwrite')
 * @returns {Promise<boolean>} - True if granted, false otherwise
 */
export const requestDirectoryPermission = async (directoryHandle, mode = 'readwrite') => {
  try {
    const permission = await directoryHandle.requestPermission({ mode });
    return permission === 'granted';
  } catch (error) {
    console.error('Permission request failed:', error);
    return false;
  }
};