import { contextBridge, ipcRenderer } from 'electron'

// Types for API
interface ElectronAPI {
  // File operations
  saveFile: (content: string, fileName: string) => Promise<string | null>
  saveFileAs: (content: string, currentFilePath?: string) => Promise<string | null>
  saveExistingFile: (content: string, filePath: string) => Promise<string | null>
  openFile: () => Promise<{ content: string; fileName: string; filePath: string } | null>

  // Dialogs
  showSaveDialog: (defaultPath?: string) => Promise<string | null>
  showOpenDialog: (filters?: FileFilter[]) => Promise<string[] | null>

  // Application settings
  getVersion: () => Promise<string>

  // Window events
  onWindowClose: (callback: () => boolean) => void
  closeWindow: () => void

  // Navigation in production mode
  navigateToEditor: (template?: string) => Promise<void>
  navigateToStart: () => Promise<void>

  // Application events
  onMenuAction: (callback: (action: string) => void) => void
  removeAllListeners: (channel: string) => void
}

interface FileFilter {
  name: string
  extensions: string[]
}

// Define API for renderer process
const electronAPI: ElectronAPI = {
  saveFile: (content: string, fileName: string) => 
    ipcRenderer.invoke('save-file', content, fileName),
  
  saveFileAs: (content: string, currentFilePath?: string) => 
    ipcRenderer.invoke('save-file-as', content, currentFilePath),
  
  saveExistingFile: (content: string, filePath: string) => 
    ipcRenderer.invoke('save-existing-file', content, filePath),
  
  openFile: () => 
    ipcRenderer.invoke('open-file'),
  
  showSaveDialog: (defaultPath?: string) => 
    ipcRenderer.invoke('show-save-dialog', defaultPath),
  
  showOpenDialog: (filters?: FileFilter[]) => 
    ipcRenderer.invoke('show-open-dialog', filters),
  
  getVersion: () => 
    ipcRenderer.invoke('get-version'),
  
  onWindowClose: (callback: () => boolean) => {
    ipcRenderer.on('window-close-request', (_event) => {
      const shouldClose = callback()
      ipcRenderer.send('window-close-response', shouldClose)
    })
  },
  
  closeWindow: () => {
    ipcRenderer.send('close-window')
  },
  
  navigateToEditor: (template?: string) => 
    ipcRenderer.invoke('navigate-to-editor', template),
  
  navigateToStart: () => 
    ipcRenderer.invoke('navigate-to-start'),
  
  onMenuAction: (callback: (action: string) => void) => {
    ipcRenderer.on('menu-action', (_event, action) => callback(action))
  },
  
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}