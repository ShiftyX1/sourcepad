const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(function(childItemName) {
            copyRecursiveSync(
                path.join(src, childItemName),
                path.join(dest, childItemName)
            );
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

const monacoSrc = path.join(__dirname, '..', 'node_modules', 'monaco-editor', 'min');
const monacoDest = path.join(__dirname, '..', 'ui', 'monaco-editor');

if (!fs.existsSync(monacoDest)) {
    fs.mkdirSync(monacoDest, { recursive: true });
}

try {
    copyRecursiveSync(monacoSrc, monacoDest);
    console.log('Monaco Editor files copied successfully!');
} catch (error) {
    console.error('Error copying Monaco Editor files:', error);
}