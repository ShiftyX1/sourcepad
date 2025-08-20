export interface CodeTemplate {
    content: string
    language: string
    fileExtension: string
}

export type TemplateType =
    | 'javascript'
    | 'typescript'
    | 'html'
    | 'css'
    | 'python'
    | 'json'
    | 'markdown'

export interface Templates {
    [key: string]: CodeTemplate
}

export type StartPageAction = 'new' | 'open' | 'folder'

export interface LanguageInfo {
    id: string
    name: string
    extensions: string[]
    icon?: string
    color?: string
}

export type EditorTheme = 'vs-dark' | 'vs-light' | 'hc-black'

export interface EditorStats {
    lines: number
    characters: number
    words: number
}

export interface CursorPosition {
    line: number
    column: number
}

export interface RecentFile {
    path: string
    name: string
    lastOpened: Date
    language?: string
}

export interface AppSettings {
    theme: EditorTheme
    fontSize: number
    tabSize: number
    wordWrap: boolean
    minimap: boolean
    lineNumbers: boolean
    autoSave: boolean
}

export interface FileOperation {
    type: 'save' | 'open' | 'new'
    success: boolean
    filePath?: string
    error?: string
}

export interface EditorContext {
    fileName: string
    language: string
    content: string
    isModified: boolean
    filePath?: string
}

export interface StartPageManagerType {
    new(): StartPageManagerInstance
}

export interface StartPageManagerInstance {
    crutch(): void
}