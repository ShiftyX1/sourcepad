import { Templates, TemplateType, StartPageAction, RecentFile } from '../types'
import { themeManager, Theme, THEMES } from '../utils/theme'

const templates: Templates = {
    javascript: {
        content: `console.log('Hello, SourcePad!');

function greet(name: string): string {
    return \`Hello, \${name}!\`;
}

// Your code here...`,
        language: 'javascript',
        fileExtension: 'js'
    },
    typescript: {
        content: `console.log('Hello, SourcePad!');

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

class StartPageManager {
    private recentFiles: RecentFile[] = []

    constructor() {
        document.documentElement.setAttribute('data-theme', themeManager.getCurrentTheme())
        this.init()
    }

    private async init(): Promise<void> {
        await this.loadVersion()
        this.setupEventListeners()
        this.setupTheme()
        this.loadRecentFiles()
    }

    private setupTheme(): void {
        const themeToggle = document.getElementById('themeToggle')
        const themeIcon = document.getElementById('themeIcon')
        const themeText = document.getElementById('themeText')

        if (themeToggle && themeIcon && themeText) {
            const updateThemeUI = (theme: Theme) => {
                const config = THEMES[theme]
                themeIcon.textContent = config.icon
                themeText.textContent = config.displayName
            }

            updateThemeUI(themeManager.getCurrentTheme())

            themeToggle.addEventListener('click', () => {
                themeManager.toggleTheme()
            })

            themeManager.subscribe(updateThemeUI)
        }
    }

    private async loadVersion(): Promise<void> {
        try {
            if (window.electronAPI) {
                const version = await window.electronAPI.getVersion()
                const versionElement = document.getElementById('version')
                if (versionElement) {
                    versionElement.textContent = `v${version}`
                }
            }
        } catch (error) {
            console.error('Failed to load version:', error)
        }
    }

    private setupEventListeners(): void {
        document.querySelectorAll('.action-item').forEach(item => {
            const button = item as HTMLButtonElement
            button.addEventListener('click', () => {
                const action = button.dataset.action as StartPageAction
                this.handleAction(action)
            })
        })

        document.querySelectorAll('.template-item').forEach(item => {
            const button = item as HTMLButtonElement
            button.addEventListener('click', () => {
                const templateName = button.dataset.template as TemplateType
                this.openEditor(templateName)
            })
        })

        const clearRecentBtn = document.getElementById('clearRecentBtn')
        clearRecentBtn?.addEventListener('click', () => {
            if (this.recentFiles.length > 0) {
                const confirm = window.confirm('Are you sure you want to clear all recent files?')
                if (confirm) {
                    this.clearAllRecentFiles()
                }
            }
        })

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault()
                        this.openEditor()
                        break
                    case 'o':
                        e.preventDefault()
                        this.handleAction('open')
                        break
                }
            }
        })
    }

    private handleAction(action: StartPageAction): void {
        switch (action) {
            case 'new':
                this.openEditor()
                break
            case 'open':
                this.openFileDialog()
                break
            case 'folder':
                this.openFolderDialog()
                break
        }
    }

    private async openEditor(templateName?: TemplateType): Promise<void> {
        const isElectronDev = window.location.protocol === 'http:' && window.location.hostname === 'localhost'
        const isElectronProd = window.electronAPI && window.location.protocol === 'file:'

        if (isElectronProd) {
            try {
                await window.electronAPI.navigateToEditor(templateName || undefined)
            } catch (error) {
                console.error('Failed to navigate to editor:', error)
            }
        } else if (isElectronDev) {
            const params = new URLSearchParams()
            if (templateName && templates[templateName]) {
                params.set('template', templateName)
            }
            const url = `http://localhost:5173/src/renderer/editor/index.html${params.toString() ? '?' + params.toString() : ''}`
            window.location.href = url
        } else {
            const params = new URLSearchParams()
            if (templateName && templates[templateName]) {
                params.set('template', templateName)
            }
            const url = `../editor/index.html${params.toString() ? '?' + params.toString() : ''}`
            window.location.href = url
        }
    }

    private async openFileDialog(): Promise<void> {
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.openFile()
                if (result) {
                    this.openEditorWithFile(result.content, result.fileName, result.filePath)
                }
            }
        } catch (error) {
            console.error('Failed to open file:', error)
        }
    }

    private openFolderDialog(): void {
        // TODO: Implement open folder logic
        console.log('Open folder dialog - to be implemented')
    }

    private openEditorWithFile(content: string, fileName: string, filePath?: string): void {
        sessionStorage.setItem('openFile', JSON.stringify({ content, fileName, filePath }))
        this.openEditor()
    }

    private loadRecentFiles(): void {
        try {
            const stored = localStorage.getItem('recentFiles')
            if (stored) {
                this.recentFiles = JSON.parse(stored)
                this.renderRecentFiles()
            }
        } catch (error) {
            console.error('Failed to load recent files:', error)
        }
    }

    private renderRecentFiles(): void {
        const recentList = document.getElementById('recentList')
        const clearRecentBtn = document.getElementById('clearRecentBtn')
        
        if (!recentList) return

        if (clearRecentBtn) {
            clearRecentBtn.style.display = this.recentFiles.length > 0 ? 'block' : 'none'
        }

        if (this.recentFiles.length === 0) {
            recentList.innerHTML = `
        <div class="empty-message">
          <span class="empty-text">No recent files</span>
        </div>
      `
            return
        }

        recentList.innerHTML = this.recentFiles
            .slice(0, 10)
            .map(file => `
        <div class="recent-item" data-path="${file.path}">
          <div class="recent-info">
            <span class="recent-name">${file.name}</span>
            <span class="recent-path">${file.path}</span>
          </div>
          <div class="recent-actions">
            <span class="recent-date">${this.formatDate(file.lastOpened)}</span>
            <button class="recent-remove" data-path="${file.path}" title="Remove from recent files">×</button>
          </div>
        </div>
      `)
            .join('')

        recentList.querySelectorAll('.recent-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!(e.target as HTMLElement).classList.contains('recent-remove')) {
                    const path = (item as HTMLElement).dataset.path
                    if (path) {
                        this.openRecentFile(path)
                    }
                }
            })
        })

        recentList.querySelectorAll('.recent-remove').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation()
                const path = (button as HTMLElement).dataset.path
                if (path) {
                    this.removeFromRecentFiles(path)
                }
            })
        })
    }

    private formatDate(date: Date): string {
        const now = new Date()
        const diff = now.getTime() - new Date(date).getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days === 0) return 'Today'
        if (days === 1) return 'Yesterday'
        if (days < 7) return `${days} days ago`

        return new Date(date).toLocaleDateString()
    }

    private async openRecentFile(path: string): Promise<void> {
        try {
            if (window.electronAPI) {
                this.showLoadingIndicator(`Opening ${path.split('/').pop()}...`)
                
                const result = await window.electronAPI.readFileByPath(path)
                if (result) {
                    this.updateRecentFileTime(path)
                    this.openEditorWithFile(result.content, result.fileName, result.filePath)
                } else {
                    this.removeFromRecentFiles(path)
                    this.showNotification(`File not found: ${path}`, 'error')
                    console.warn(`File not found: ${path}`)
                }
            }
        } catch (error) {
            console.error('Failed to open recent file:', error)
            this.removeFromRecentFiles(path)
            this.showNotification('Failed to open file', 'error')
        } finally {
            this.hideLoadingIndicator()
        }
    }

    private updateRecentFileTime(path: string): void {
        try {
            const fileIndex = this.recentFiles.findIndex(file => file.path === path)
            if (fileIndex !== -1) {
                this.recentFiles[fileIndex].lastOpened = new Date()
                const file = this.recentFiles.splice(fileIndex, 1)[0]
                this.recentFiles.unshift(file)
                localStorage.setItem('recentFiles', JSON.stringify(this.recentFiles))
                this.renderRecentFiles()
            }
        } catch (error) {
            console.error('Failed to update recent file time:', error)
        }
    }

    private removeFromRecentFiles(path: string): void {
        try {
            this.recentFiles = this.recentFiles.filter(file => file.path !== path)
            localStorage.setItem('recentFiles', JSON.stringify(this.recentFiles))
            this.renderRecentFiles()
            this.showNotification('File removed from recent files', 'info')
        } catch (error) {
            console.error('Failed to remove from recent files:', error)
        }
    }

    private clearAllRecentFiles(): void {
        try {
            this.recentFiles = []
            localStorage.setItem('recentFiles', JSON.stringify(this.recentFiles))
            this.renderRecentFiles()
            this.showNotification('All recent files cleared', 'info')
        } catch (error) {
            console.error('Failed to clear recent files:', error)
        }
    }

    private showLoadingIndicator(message: string): void {
        const indicator = document.createElement('div')
        indicator.id = 'loadingIndicator'
        indicator.innerHTML = `
            <div class="loading-backdrop">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <span class="loading-message">${message}</span>
                </div>
            </div>
        `
        indicator.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
        `
        document.body.appendChild(indicator)
    }

    private hideLoadingIndicator(): void {
        const indicator = document.getElementById('loadingIndicator')
        if (indicator) {
            document.body.removeChild(indicator)
        }
    }

    private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
        const notification = document.createElement('div')
        notification.textContent = message
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            z-index: 1001;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: opacity 0.3s ease;
        `

        document.body.appendChild(notification)

        setTimeout(() => {
            notification.style.opacity = '0'
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification)
                }
            }, 300)
        }, 3000)
    }

    public crutch(): void {
        // TODO: implement crutch logic
        console.log('Crutch method called')
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new StartPageManager()
})

// Global availability
;(window as Window).SourcePad = {
    templates,
    StartPageManager
}