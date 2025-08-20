/// <reference types="vite/client" />

declare module 'monaco-editor' {
    export * from 'monaco-editor/esm/vs/editor/editor.api'
}

import { Templates, StartPageManagerType } from '@renderer/types/index'

declare global {
    interface Window {
        electronAPI: {
            saveFile: (content: string, fileName: string) => Promise<string | null>
            openFile: () => Promise<{ content: string; fileName: string } | null>
            showSaveDialog: (defaultPath?: string) => Promise<string | null>
            showOpenDialog: (filters?: FileFilter[]) => Promise<string[] | null>
            getVersion: () => Promise<string>
            onWindowClose: (callback: () => boolean) => void
            closeWindow: () => void
            navigateToEditor: (template?: string) => Promise<void>
            navigateToStart: () => Promise<void>
            onMenuAction: (callback: (action: string) => void) => void
            removeAllListeners: (channel: string) => void
        }
        SourcePad: {
            templates: Templates,
            StartPageManager: StartPageManagerType
        }
    }
}

interface FileFilter {
    name: string
    extensions: string[]
}