const templates = {
    javascript: {
        content: `// JavaScript File
console.log('Hello, SourcePad!');

function greet(name) {
    return \`Hello, \${name}!\`;
}

// Your code here...`,
        language: 'javascript'
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
        language: 'html'
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
        language: 'css'
    },
    python: {
        content: `# Python File
def main():
    print("Hello, SourcePad!")
    
def greet(name):
    return f"Hello, {name}!"

if __name__ == "__main__":
    main()
    
# Your Python code here...`,
        language: 'python'
    },
    json: {
        content: `{
    "name": "my-project",
    "version": "1.0.0",
    "description": "A new project created in SourcePad",
    "main": "index.js",
    "scripts": {
        "start": "node index.js"
    },
    "keywords": [],
    "author": "",
    "license": "MIT"
}`,
        language: 'json'
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

\`\`\`javascript
// Example code
console.log('Hello, World!');
\`\`\`

## Contributing

Pull requests are welcome!

## License

This project is licensed under the MIT License.`,
        language: 'markdown'
    }
};

let editor;
let currentTheme = 'vs-dark';
let currentFileName = 'Untitled';

function initializeEditor() {
    require.config({ paths: { 'vs': './monaco-editor/vs' } });

    require(['vs/editor/editor.main'], function () {
        const urlParams = new URLSearchParams(window.location.search);
        const templateName = urlParams.get('template');
        
        let initialContent = '// Welcome to SourcePad!\n// Start typing your code here...';
        let initialLanguage = 'javascript';
        
        if (templateName && templates[templateName]) {
            const template = templates[templateName];
            initialContent = template.content;
            initialLanguage = template.language;
            currentFileName = `Untitled.${getFileExtension(templateName)}`;
        }

        try {
            const storedContent = sessionStorage.getItem('sourcepad.open.content');
            const storedFilename = sessionStorage.getItem('sourcepad.open.filename');
            if (storedContent !== null) {
                initialContent = storedContent;
                if (storedFilename) {
                    const ext = storedFilename.split('.').pop().toLowerCase();
                    const lang = getLanguageByExtension(ext);
                    initialLanguage = lang;
                    currentFileName = storedFilename;
                }

                sessionStorage.removeItem('sourcepad.open.content');
                sessionStorage.removeItem('sourcepad.open.filename');
            }
        } catch (err) {
            console.warn('Could not access sessionStorage for incoming file:', err);
        }

        editor = monaco.editor.create(document.getElementById('editor'), {
            value: initialContent,
            language: initialLanguage,
            theme: currentTheme,
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
            quickSuggestions: true,
            wordBasedSuggestions: true
        });

        updateLanguageSelect(initialLanguage);
        updateFileName(currentFileName);
        
        setupEventListeners();
        
        updateStats();
        
        console.log('SourcePad Editor initialized successfully!');
    });
}

function getFileExtension(templateName) {
    const extensions = {
        javascript: 'js',
        typescript: 'ts', 
        html: 'html',
        css: 'css',
        python: 'py',
        json: 'json',
        markdown: 'md'
    };
    return extensions[templateName] || 'txt';
}

function setupEventListeners() {
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    document.getElementById('language').addEventListener('change', (e) => {
        const language = e.target.value;
        monaco.editor.setModelLanguage(editor.getModel(), language);
        updateFileExtension(language);
    });
    
    document.getElementById('saveBtn').addEventListener('click', saveFile);
    
    document.getElementById('openBtn').addEventListener('click', openFile);
    
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    editor.onDidChangeModelContent(() => {
        updateStats();
    });
    
    editor.onDidChangeCursorPosition(() => {
        updateCursorPosition();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, saveFile);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO, openFile);
}

function updateLanguageSelect(language) {
    document.getElementById('language').value = language;
}

function updateFileName(fileName) {
    currentFileName = fileName;
    document.getElementById('fileName').textContent = fileName;
}

function updateFileExtension(language) {
    const baseName = currentFileName.split('.')[0];
    const newFileName = `${baseName}.${getFileExtension(language)}`;
    updateFileName(newFileName);
}

function updateStats() {
    const content = editor.getValue();
    const lines = content.split('\n').length;
    const characters = content.length;
    
    document.getElementById('lineCount').textContent = `Lines: ${lines}`;
    document.getElementById('charCount').textContent = `Characters: ${characters}`;
}

function updateCursorPosition() {
    const position = editor.getPosition();
    document.getElementById('cursorPosition').textContent = 
        `Ln ${position.lineNumber}, Col ${position.column}`;
}

function toggleTheme() {
    const themeBtn = document.getElementById('themeToggle');
    
    if (currentTheme === 'vs-dark') {
        currentTheme = 'vs-light';
        themeBtn.textContent = '☀️ Light';
        document.body.classList.add('light-theme');
    } else {
        currentTheme = 'vs-dark';
        themeBtn.textContent = '🌙 Dark';
        document.body.classList.remove('light-theme');
    }
    
    monaco.editor.setTheme(currentTheme);
}

function saveFile() {
    const content = editor.getValue();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log(`File saved: ${currentFileName}`);
}

function openFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js,.ts,.html,.css,.py,.json,.md,.txt,.xml,.yaml,.yml,.sql';
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                editor.setValue(content);
                
                const extension = file.name.split('.').pop().toLowerCase();
                const language = getLanguageByExtension(extension);
                
                monaco.editor.setModelLanguage(editor.getModel(), language);
                updateLanguageSelect(language);
                updateFileName(file.name);
                
                console.log(`File opened: ${file.name}`);
            };
            reader.readAsText(file);
        }
    });
    
    input.click();
}

function getLanguageByExtension(extension) {
    const languages = {
        'js': 'javascript',
        'ts': 'typescript',
        'html': 'html',
        'htm': 'html',
        'css': 'css',
        'py': 'python',
        'json': 'json',
        'md': 'markdown',
        'xml': 'xml',
        'yaml': 'yaml',
        'yml': 'yaml',
        'sql': 'sql'
    };
    return languages[extension] || 'plaintext';
}

document.addEventListener('DOMContentLoaded', initializeEditor);