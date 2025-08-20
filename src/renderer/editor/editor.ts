import * as monaco from 'monaco-editor'
import {
    Templates,
    TemplateType,
    EditorTheme,
    EditorStats,
    EditorContext,
    RecentFile
} from '../types'

// Setup Monaco Editor to make it work with Vite
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

// Setup workers for Monaco Editor
self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'json') {
            return new jsonWorker()
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new cssWorker()
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new htmlWorker()
        }
        if (label === 'typescript' || label === 'javascript') {
            return new tsWorker()
        }
        return new editorWorker()
    }
}

const templates: Templates = {
    javascript: {
        content: `// JavaScript File
console.log('Hello, SourcePad!');

function greet(name) {
    return \`Hello, \${name}!\`;
}

// Your code here...`,
        language: 'javascript',
        fileExtension: 'js'
    },
    typescript: {
        content: `// TypeScript File
console.log('Hello, SourcePad!');

interface User {
    name: string;
    age: number;
}

function greet(user: User): string {
    return \`Hello, \${user.name}! You are \${user.age} years old.\`;
}

const user: User = {
    name: 'Developer',
    age: 25
};

console.log(greet(user));

// Your TypeScript code here...`,
        language: 'typescript',
        fileExtension: 'ts'
    },
    html: {
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <!-- Your HTML here -->
</body>
</html>`,
        language: 'html',
        fileExtension: 'html'
    },
    css: {
        content: `/* CSS Stylesheet */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}

/* Your styles here */`,
        language: 'css',
        fileExtension: 'css'
    },
    python: {
        content: `# Python File
def main() -> None:
    print("Hello, SourcePad!")
    
def greet(name: str) -> str:
    return f"Hello, {name}!"

if __name__ == "__main__":
    main()
    
# Your Python code here...`,
        language: 'python',
        fileExtension: 'py'
    },
    json: {
        content: `{
    "name": "my-project",
    "version": "1.0.0",
    "description": "A new project created in SourcePad",
    "main": "index.js",
    "scripts": {
        "start": "node index.js",
        "dev": "vite",
        "build": "tsc && vite build"
    },
    "keywords": [],
    "author": "",
    "license": "MIT"
}`,
        language: 'json',
        fileExtension: 'json'
    },
    markdown: {
        content: `# Project Title

A brief description of what this project does and who it's for.

## Features

- Feature 1
- Feature 2  
- Feature 3

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`typescript
// Example TypeScript code
interface Config {
    name: string;
    version: string;
}

const config: Config = {
    name: 'my-app',
    version: '1.0.0'
};

console.log(\`App: \${config.name} v\${config.version}\`);
\`\`\`

## Contributing

Pull requests are welcome!

## License

This project is licensed under the MIT License.`,
        language: 'markdown',
        fileExtension: 'md'
    }
}

class EditorManager {
    private editor: monaco.editor.IStandaloneCodeEditor | null = null
    private currentTheme: EditorTheme = 'vs-dark'
    private context: EditorContext = {
        fileName: 'Untitled',
        language: 'javascript',
        content: '',
        isModified: false,
        filePath: undefined
    }

    constructor() {
        this.initializeEditor()
    }

    private async initializeEditor(): Promise<void> {
        try {
            await this.setupMonaco()
            this.createEditor()
            this.setupEventListeners()
            this.loadFromUrlParams()
            this.loadSavedTheme()
            this.updateStats()

            console.log('SourcePad Editor initialized successfully!')
        } catch (error) {
            console.error('Failed to initialize editor:', error)
        }
    }

    private async setupMonaco(): Promise<void> {
        try {
            // Setup TypeScript compiler for Monaco
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.ES2020,
                allowNonTsExtensions: true,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.CommonJS,
                noEmit: true,
                esModuleInterop: true,
                jsx: monaco.languages.typescript.JsxEmit.React,
                reactNamespace: 'React',
                allowJs: true,
                typeRoots: ['node_modules/@types'],
                strict: true,
                noImplicitAny: true,
                strictNullChecks: true,
                strictFunctionTypes: true,
                noImplicitThis: true,
                noImplicitReturns: true
            })

            // Setup JavaScript
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.ES2020,
                allowNonTsExtensions: true,
                allowJs: true,
                checkJs: false
            })

            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: false,
                noSyntaxValidation: false
            })

            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: false,
                noSyntaxValidation: false
            })

            // For production build only we check that workers are fine
            if (!import.meta.env.DEV) {
                // If the main worker setup fails use fallback
                try {
                    new editorWorker()
                } catch (error) {
                    console.warn('Worker import failed, using fallback configuration:', error)
                    // TODO: Implement fallback configuration
                    //   setupMonacoEnvironmentFallback()
                }
            }
        } catch (error) {
            console.error('Failed to setup Monaco:', error)
            // TODO: Implement fallback configuration
            //   setupMonacoEnvironmentFallback()
        }
    }

    private createEditor(): void {
        const editorElement = document.getElementById('editor')
        if (!editorElement) {
            throw new Error('Editor container not found')
        }

        const urlParams = new URLSearchParams(window.location.search)
        const templateName = urlParams.get('template') as TemplateType | null

        let initialContent = '// Welcome to SourcePad!\n// Start typing your code here...'
        let initialLanguage = 'javascript'
        let initialFilePath: string | undefined = undefined

        const openFileData = sessionStorage.getItem('openFile')
        if (openFileData) {
            try {
                const { content, fileName, filePath } = JSON.parse(openFileData)
                initialContent = content
                initialLanguage = this.getLanguageByExtension(this.getFileExtension(fileName))
                this.context.fileName = fileName
                initialFilePath = filePath
                sessionStorage.removeItem('openFile') // Очищаем после использования
            } catch (error) {
                console.error('Failed to parse open file data:', error)
            }
        } else if (templateName && templates[templateName]) {
            const template = templates[templateName]
            initialContent = template.content
            initialLanguage = template.language
            this.context.fileName = `Untitled.${template.fileExtension}`
        }

        this.context.language = initialLanguage
        this.context.content = initialContent
        this.context.filePath = initialFilePath

        this.editor = monaco.editor.create(editorElement, {
            value: initialContent,
            language: initialLanguage,
            theme: this.currentTheme,
            automaticLayout: true,
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            cursorStyle: 'line',
            mouseWheelZoom: true,
            minimap: {
                enabled: true
            },
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
                other: true,
                comments: true,
                strings: true
            },
            wordBasedSuggestions: 'allDocuments',
            parameterHints: {
                enabled: true
            },
            formatOnPaste: true,
            formatOnType: true,
            autoIndent: 'full',
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            bracketPairColorization: {
                enabled: true
            },
            guides: {
                bracketPairs: true,
                indentation: true
            },
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'mouseover',
            unfoldOnClickAfterEndOfLine: false,
            contextmenu: true,
            scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                arrowSize: 11,
                useShadows: false,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                verticalScrollbarSize: 12,
                horizontalScrollbarSize: 12
            }
        })

        this.updateLanguageSelect(initialLanguage)
        this.updateFileName(this.context.fileName)
        this.updateLanguageStatus(initialLanguage)
    }

    private setupEventListeners(): void {
        if (!this.editor) return

        const backBtn = document.getElementById('backBtn')
        backBtn?.addEventListener('click', async () => {
            if (this.context.isModified) {
                const shouldLeave = confirm('У вас есть несохраненные изменения. Покинуть редактор?')
                if (!shouldLeave) return
            }

            const isElectronDev = window.location.protocol === 'http:' && window.location.hostname === 'localhost'
            const isElectronProd = window.electronAPI && window.location.protocol === 'file:'

            if (isElectronProd) {
                try {
                    await window.electronAPI.navigateToStart()
                } catch (error) {
                    console.error('Failed to navigate to start page:', error)
                }
            } else if (isElectronDev) {
                window.location.href = 'http://localhost:5173/src/renderer/start-page/index.html'
            } else {
                window.location.href = '../start-page/index.html'
            }
        })

        const languageSelect = document.getElementById('language') as HTMLSelectElement
        languageSelect?.addEventListener('change', (e) => {
            const language = (e.target as HTMLSelectElement).value
            if (this.editor) {
                monaco.editor.setModelLanguage(this.editor.getModel()!, language)
                this.context.language = language
                this.updateFileExtension(language)
                this.updateLanguageStatus(language)
            }
        })

        document.getElementById('saveBtn')?.addEventListener('click', () => this.saveFile())
        document.getElementById('saveAsBtn')?.addEventListener('click', () => this.saveFileAs())
        document.getElementById('openBtn')?.addEventListener('click', () => this.openFile())

        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme())

        this.editor.onDidChangeModelContent(() => {
            this.context.content = this.editor!.getValue()
            this.context.isModified = true
            this.updateStats()
            this.updateFileName(this.context.fileName)
        })

        this.editor.onDidChangeCursorPosition(() => {
            this.updateCursorPosition()
        })

        if (!window.electronAPI) {
            window.addEventListener('beforeunload', (e) => {
                if (this.context.isModified) {
                    e.preventDefault()
                    e.returnValue = ''
                }
            })
        }

        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => this.saveFile())
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS, () => this.saveFileAs())
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO, () => this.openFile())
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyN, () => this.newFile())

        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP, () => {
            this.editor?.getAction('editor.action.quickCommand')?.run()
        })

        if (window.electronAPI) {
            window.electronAPI.onWindowClose(() => {
                if (this.context.isModified) {
                    const shouldClose = confirm('У вас есть несохраненные изменения. Закрыть приложение без сохранения?')
                    return shouldClose
                }
                return true
            })
        }
    }

    private loadFromUrlParams(): void {
        const urlParams = new URLSearchParams(window.location.search)
        const templateName = urlParams.get('template') as TemplateType | null

        if (templateName && templates[templateName]) {
            const template = templates[templateName]
            this.context.fileName = `Untitled.${template.fileExtension}`
            this.updateFileName(this.context.fileName)
        }
    }

    private loadSavedTheme(): void {
        const saved = localStorage.getItem('editorTheme') as EditorTheme
        if (saved && (saved === 'vs-dark' || saved === 'vs-light')) {
            this.currentTheme = saved
            if (this.editor) {
                monaco.editor.setTheme(this.currentTheme)
            }

            const themeBtn = document.getElementById('themeToggle')
            if (themeBtn) {
                if (this.currentTheme === 'vs-light') {
                    themeBtn.textContent = '☀️ Light'
                    document.body.classList.add('light-theme')
                } else {
                    themeBtn.textContent = '🌙 Dark'
                    document.body.classList.remove('light-theme')
                }
            }
        }
    }

    private updateLanguageSelect(language: string): void {
        const languageSelect = document.getElementById('language') as HTMLSelectElement
        if (languageSelect) {
            languageSelect.value = language
        }
    }

    private updateFileName(fileName: string): void {
        this.context.fileName = fileName
        const fileNameElement = document.getElementById('fileName')
        if (fileNameElement) {
            fileNameElement.textContent = fileName + (this.context.isModified ? ' •' : '')
        }
    }

    private updateFileExtension(language: string): void {
        const baseName = this.context.fileName.split('.')[0]
        const extension = this.getExtensionByLanguage(language)
        const newFileName = `${baseName}.${extension}`
        this.updateFileName(newFileName)
    }

    private updateStats(): void {
        if (!this.editor) return

        const content = this.editor.getValue()
        const stats: EditorStats = {
            lines: content.split('\n').length,
            characters: content.length,
            words: content.trim() ? content.trim().split(/\s+/).length : 0
        }

        const lineCountElement = document.getElementById('lineCount')
        const charCountElement = document.getElementById('charCount')
        const wordCountElement = document.getElementById('wordCount')

        if (lineCountElement) lineCountElement.textContent = `Lines: ${stats.lines}`
        if (charCountElement) charCountElement.textContent = `Characters: ${stats.characters}`
        if (wordCountElement) wordCountElement.textContent = `Words: ${stats.words}`
    }

    private updateCursorPosition(): void {
        if (!this.editor) return

        const position = this.editor.getPosition()
        if (position) {
            const cursorPositionElement = document.getElementById('cursorPosition')
            if (cursorPositionElement) {
                cursorPositionElement.textContent = `Ln ${position.lineNumber}, Col ${position.column}`
            }
        }
    }

    private updateLanguageStatus(language: string): void {
        const languageStatusElement = document.getElementById('languageStatus')
        if (languageStatusElement) {
            languageStatusElement.textContent = this.getLanguageDisplayName(language)
        }
    }

    private getLanguageDisplayName(language: string): string {
        const displayNames: Record<string, string> = {
            'javascript': 'JavaScript',
            'typescript': 'TypeScript',
            'html': 'HTML',
            'css': 'CSS',
            'scss': 'SCSS',
            'less': 'Less',
            'python': 'Python',
            'json': 'JSON',
            'markdown': 'Markdown',
            'xml': 'XML',
            'yaml': 'YAML',
            'sql': 'SQL',
            'plaintext': 'Plain Text'
        }
        return displayNames[language] || language.toUpperCase()
    }

    private toggleTheme(): void {
        const themeBtn = document.getElementById('themeToggle')
        if (!themeBtn || !this.editor) return

        if (this.currentTheme === 'vs-dark') {
            this.currentTheme = 'vs-light'
            themeBtn.textContent = '☀️ Light'
            document.body.classList.add('light-theme')
        } else {
            this.currentTheme = 'vs-dark'
            themeBtn.textContent = '🌙 Dark'
            document.body.classList.remove('light-theme')
        }

        monaco.editor.setTheme(this.currentTheme)

        localStorage.setItem('editorTheme', this.currentTheme)
    }

    private async saveFile(): Promise<void> {
        if (!this.editor) return

        const content = this.editor.getValue()

        try {
            if (window.electronAPI) {
                if (this.context.filePath) {
                    const result = await window.electronAPI.saveExistingFile(content, this.context.filePath)
                    if (result) {
                        this.context.isModified = false
                        this.updateFileName(this.context.fileName)
                        this.showNotification(`Файл сохранен: ${this.context.fileName}`, 'success')
                        console.log(`File saved: ${this.context.fileName}`)
                    }
                } else {
                    await this.saveFileAs()
                }
            } else {
                this.saveFileAsBrowser(content)
            }
        } catch (error) {
            console.error('Failed to save file:', error)
            this.showNotification('Ошибка при сохранении файла', 'error')
        }
    }

    private async saveFileAs(): Promise<void> {
        if (!this.editor) return

        const content = this.editor.getValue()

        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.saveFileAs(content, this.context.filePath)
                if (result) {
                    this.context.filePath = result
                    const newFileName = result.split('/').pop() || 'Untitled'
                    this.context.fileName = newFileName
                    this.context.isModified = false
                    
                    const extension = this.getFileExtension(newFileName)
                    const language = this.getLanguageByExtension(extension)
                    if (language !== this.context.language) {
                        this.context.language = language
                        monaco.editor.setModelLanguage(this.editor.getModel()!, language)
                        this.updateLanguageSelect(language)
                        this.updateLanguageStatus(language)
                    }
                    
                    this.updateFileName(newFileName)
                    this.addToRecentFiles(result, newFileName)
                    this.showNotification(`Файл сохранен как: ${newFileName}`, 'success')
                    console.log(`File saved as: ${newFileName}`)
                }
            } else {
                this.saveFileAsBrowser(content)
            }
        } catch (error) {
            console.error('Failed to save file as:', error)
            this.showNotification('Ошибка при сохранении файла', 'error')
        }
    }

    private saveFileAsBrowser(content: string): void {
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = this.context.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(url)

        this.context.isModified = false
        this.updateFileName(this.context.fileName)
        this.showNotification(`Файл сохранен: ${this.context.fileName}`, 'success')
    }

    private async openFile(): Promise<void> {
        try {
            if (this.context.isModified) {
                const shouldDiscard = confirm('У вас есть несохраненные изменения. Открыть новый файл?')
                if (!shouldDiscard) return
            }

            if (window.electronAPI) {
                const result = await window.electronAPI.openFile()
                if (result && this.editor) {
                    this.loadFileContent(result.content, result.fileName, result.filePath)
                }
            } else {
                this.openFileFromBrowser()
            }
        } catch (error) {
            console.error('Failed to open file:', error)
            this.showNotification('Ошибка при открытии файла', 'error')
        }
    }

    private openFileFromBrowser(): void {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.js,.jsx,.ts,.tsx,.html,.css,.scss,.sass,.less,.py,.json,.md,.txt,.xml,.yaml,.yml,.sql'

        input.addEventListener('change', (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file && this.editor) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    const content = e.target?.result as string
                    this.loadFileContent(content, file.name)
                }
                reader.readAsText(file)
            }
        })

        input.click()
    }

    private loadFileContent(content: string, fileName: string, filePath?: string): void {
        if (!this.editor) return

        this.editor.setValue(content)

        const extension = this.getFileExtension(fileName)
        const language = this.getLanguageByExtension(extension)

        monaco.editor.setModelLanguage(this.editor.getModel()!, language)
        this.updateLanguageSelect(language)
        this.updateFileName(fileName)
        this.updateLanguageStatus(language)

        this.context = {
            fileName,
            language,
            content,
            isModified: false,
            filePath
        }

        if (filePath) {
            this.addToRecentFiles(filePath, fileName)
        }

        this.showNotification(`Файл открыт: ${fileName}`, 'success')
        console.log(`File opened: ${fileName}`)
    }

    private newFile(): void {
        if (!this.editor) return

        if (this.context.isModified) {
            const shouldDiscard = confirm('У вас есть несохраненные изменения. Создать новый файл?')
            if (!shouldDiscard) return
        }

        this.editor.setValue('// New file\n')
        this.context = {
            fileName: 'Untitled.js',
            language: 'javascript',
            content: '// New file\n',
            isModified: false,
            filePath: undefined
        }

        monaco.editor.setModelLanguage(this.editor.getModel()!, 'javascript')
        this.updateLanguageSelect('javascript')
        this.updateFileName('Untitled.js')
        this.updateLanguageStatus('javascript')
    }

    private addToRecentFiles(filePath: string, fileName: string): void {
        try {
            const recentFiles = JSON.parse(localStorage.getItem('recentFiles') || '[]')
            const newFile = {
                path: filePath,
                name: fileName,
                lastOpened: new Date(),
                language: this.context.language
            }
            
            const filtered = recentFiles.filter((file: RecentFile) => file.path !== filePath)

            filtered.unshift(newFile)

            const limited = filtered.slice(0, 10)

            localStorage.setItem('recentFiles', JSON.stringify(limited))
        } catch (error) {
            console.error('Failed to save to recent files:', error)
        }
    }

    private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
        // Simple notifications
        // We can replace this with a more advanced library in the future
        const notification = document.createElement('div')
        notification.textContent = message
        notification.style.cssText = `
      position: fixed;
      top: 50px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      color: white;
      font-size: 14px;
      z-index: 1000;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      transition: opacity 0.3s ease;
    `

        document.body.appendChild(notification)

        setTimeout(() => {
            notification.style.opacity = '0'
            setTimeout(() => {
                document.body.removeChild(notification)
            }, 300)
        }, 3000)
    }

    private getFileExtension(fileName: string): string {
        return fileName.split('.').pop()?.toLowerCase() || 'txt'
    }

    private getExtensionByLanguage(language: string): string {
        const extensions: Record<string, string> = {
            'javascript': 'js',
            'typescript': 'ts',
            'html': 'html',
            'css': 'css',
            'scss': 'scss',
            'sass': 'sass',
            'less': 'less',
            'python': 'py',
            'json': 'json',
            'markdown': 'md',
            'xml': 'xml',
            'yaml': 'yaml',
            'sql': 'sql'
        }
        return extensions[language] || 'txt'
    }

    private getLanguageByExtension(extension: string): string {
        const languages: Record<string, string> = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'html': 'html',
            'htm': 'html',
            'css': 'css',
            'scss': 'scss',
            'sass': 'sass',
            'less': 'less',
            'py': 'python',
            'json': 'json',
            'md': 'markdown',
            'markdown': 'markdown',
            'xml': 'xml',
            'yaml': 'yaml',
            'yml': 'yaml',
            'sql': 'sql'
        }
        return languages[extension] || 'plaintext'
    }

    // Public methods for external access
    public getEditor(): monaco.editor.IStandaloneCodeEditor | null {
        return this.editor
    }

    public getContext(): EditorContext {
        return { ...this.context }
    }

    public setContent(content: string): void {
        if (this.editor) {
            this.editor.setValue(content)
            this.context.content = content
            this.context.isModified = true
            this.updateFileName(this.context.fileName)
        }
    }

    public insertText(text: string): void {
        if (this.editor) {
            const selection = this.editor.getSelection()
            const range = new monaco.Range(
                selection?.startLineNumber || 1,
                selection?.startColumn || 1,
                selection?.endLineNumber || 1,
                selection?.endColumn || 1
            )

            this.editor.executeEdits('insert-text', [{
                range,
                text
            }])
        }
    }

    public formatDocument(): void {
        if (this.editor) {
            this.editor.getAction('editor.action.formatDocument')?.run()
        }
    }

    public dispose(): void {
        if (this.editor) {
            this.editor.dispose()
            this.editor = null
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const editorManager = new EditorManager()

        ; (window as any).editorManager = editorManager
        ; (window as any).monaco = monaco
})

export { EditorManager, templates }