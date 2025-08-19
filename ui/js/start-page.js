const templates = {
    javascript: {
        content: `console.log('Hello, SourcePad!');

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
</body>
</html>`,
        language: 'html'
    },
    css: {
        content: `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}`,
        language: 'css'
    },
    python: {
        content: `def main():
    print("Hello, SourcePad!")
    
def greet(name):
    return f"Hello, {name}!"

if __name__ == "__main__":
    main()`,
        language: 'python'
    },
    json: {
        content: `{
    "name": "my-project",
    "version": "1.0.0",
    "description": "A new project",
    "main": "index.js",
    "scripts": {
        "start": "node index.js"
    },
    "author": "",
    "license": "MIT"
}`,
        language: 'json'
    },
    markdown: {
        content: `# Project Title

A brief description of your project.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`javascript
console.log('Hello, World!');
\`\`\``,
        language: 'markdown'
    }
};

function openEditor(template = null) {
    const params = new URLSearchParams();
    
    if (template) {
        params.set('template', template);
    }
    
    const url = `editor.html${params.toString() ? '?' + params.toString() : ''}`;
    window.location.href = url;
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.action-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.dataset.action;
            
            switch(action) {
                case 'new':
                    openEditor();
                    break;
                case 'open':
                    // TODO: Реализовать диалог открытия файла
                    console.log('Open file dialog');
                    break;
                case 'folder':
                    // TODO: Реализовать открытие папки
                    console.log('Open folder dialog');
                    break;
            }
        });
    });
    
    document.querySelectorAll('.template-item').forEach(item => {
        item.addEventListener('click', function() {
            const templateName = this.dataset.template;
            openEditor(templateName);
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'n':
                    e.preventDefault();
                    openEditor();
                    break;
                case 'o':
                    e.preventDefault();
                    console.log('Open file shortcut');
                    break;
            }
        }
    });
    
    loadRecentFiles();
});

function loadRecentFiles() {
    // TODO: Реализовать сохранение и загрузку недавних файлов
    const recentList = document.getElementById('recentList');
    console.log('Loading recent files...');
}

window.SourcePad = {
    templates,
    openEditor
};