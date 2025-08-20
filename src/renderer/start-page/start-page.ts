import { Templates, TemplateType, StartPageAction, RecentFile } from '../types'

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
        this.init()
    }

    private async init(): Promise<void> {
        await this.loadVersion()
        this.setupEventListeners()
        this.loadRecentFiles()
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
                    this.openEditorWithFile(result.content, result.fileName)
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

    private openEditorWithFile(content: string, fileName: string): void {
        sessionStorage.setItem('openFile', JSON.stringify({ content, fileName }))
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
        if (!recentList) return

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
          <span class="recent-date">${this.formatDate(file.lastOpened)}</span>
        </div>
      `)
            .join('')

        recentList.querySelectorAll('.recent-item').forEach(item => {
            item.addEventListener('click', () => {
                const path = (item as HTMLElement).dataset.path
                if (path) {
                    this.openRecentFile(path)
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
        // TODO: implement opening recent file logic
        console.log('Opening recent file:', path)
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