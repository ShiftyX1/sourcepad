import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync } from 'fs'

const isDev = process.env.NODE_ENV === 'development'

interface WindowConfig {
    width: number
    height: number
    webPreferences: {
        nodeIntegration: boolean
        contextIsolation: boolean
        preload?: string
    }
}

let mainWindow: BrowserWindow | null = null
let isQuitting = false
let windowCloseCallback: ((shouldClose: boolean) => void) | null = null

function createWindow(): void {
    const windowConfig: WindowConfig = {
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: join(__dirname, '../preload/preload.js')
        }
    }

    mainWindow = new BrowserWindow(windowConfig)

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173/src/renderer/start-page/index.html')
        mainWindow.webContents.openDevTools()
    } else {
        // In production, load the built files
        // Correct path for the built application
        const startPagePath = join(__dirname, '../renderer/src/renderer/start-page/index.html')
        console.log('Loading start page from:', startPagePath)
        mainWindow.loadFile(startPagePath)
    }

    // Navigation handling between pages
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl)

        if (isDev && parsedUrl.origin !== 'http://localhost:5173') {
            event.preventDefault()
        } else if (!isDev) {
            // In production, only allow file:// protocol
            if (parsedUrl.protocol !== 'file:') {
                event.preventDefault()
            }
        }
    })

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    mainWindow.on('close', (event) => {
        if (isQuitting) {
            return
        }
        event.preventDefault()

        mainWindow?.webContents.send('window-close-request')

        windowCloseCallback = (shouldClose: boolean) => {
            if (shouldClose) {
                if (process.platform === 'darwin' && !isQuitting) {
                    mainWindow?.hide()
                } else {
                    isQuitting = true
                    mainWindow?.destroy()
                }
            }
            windowCloseCallback = null
        }
    })
}

function setupIPC(): void {
    ipcMain.on('window-close-response', (_, shouldClose: boolean) => {
        if (windowCloseCallback) {
            windowCloseCallback(shouldClose)
        }
    })

    ipcMain.on('close-window', () => {
        isQuitting = true
        mainWindow?.close()
    })

    ipcMain.handle('get-version', () => {
        return app.getVersion()
    })
    ipcMain.handle('navigate-to-editor', (_, template?: string) => {
        if (mainWindow) {
            const editorPath = join(__dirname, '../renderer/src/renderer/editor/index.html')
            let url = `file://${editorPath}`

            if (template) {
                url += `?template=${template}`
            }

            console.log('Navigating to editor:', url)
            mainWindow.loadURL(url)
        }
    })

    ipcMain.handle('navigate-to-start', () => {
        if (mainWindow) {
            const startPath = join(__dirname, '../renderer/src/renderer/start-page/index.html')
            const url = `file://${startPath}`

            console.log('Navigating to start:', url)
            mainWindow.loadURL(url)
        }
    })

    ipcMain.handle('save-file', async (_, content: string, fileName: string) => {
        try {
            const result = await dialog.showSaveDialog(mainWindow!, {
                defaultPath: fileName,
                filters: [
                    { name: 'All Files', extensions: ['*'] },
                    { name: 'JavaScript', extensions: ['js', 'jsx'] },
                    { name: 'TypeScript', extensions: ['ts', 'tsx'] },
                    { name: 'HTML', extensions: ['html', 'htm'] },
                    { name: 'CSS', extensions: ['css', 'scss', 'sass', 'less'] },
                    { name: 'Python', extensions: ['py'] },
                    { name: 'JSON', extensions: ['json'] },
                    { name: 'Markdown', extensions: ['md', 'markdown'] },
                    { name: 'Text', extensions: ['txt'] }
                ]
            })

            if (!result.canceled && result.filePath) {
                writeFileSync(result.filePath, content, 'utf8')
                return result.filePath
            }
            return null
        } catch (error) {
            console.error('Error saving file:', error)
            return null
        }
    })

    ipcMain.handle('save-file-as', async (_, content: string, currentFilePath?: string) => {
        try {
            const result = await dialog.showSaveDialog(mainWindow!, {
                defaultPath: currentFilePath,
                filters: [
                    { name: 'All Files', extensions: ['*'] },
                    { name: 'JavaScript', extensions: ['js', 'jsx'] },
                    { name: 'TypeScript', extensions: ['ts', 'tsx'] },
                    { name: 'HTML', extensions: ['html', 'htm'] },
                    { name: 'CSS', extensions: ['css', 'scss', 'sass', 'less'] },
                    { name: 'Python', extensions: ['py'] },
                    { name: 'JSON', extensions: ['json'] },
                    { name: 'Markdown', extensions: ['md', 'markdown'] },
                    { name: 'Text', extensions: ['txt'] }
                ]
            })

            if (!result.canceled && result.filePath) {
                writeFileSync(result.filePath, content, 'utf8')
                return result.filePath
            }
            return null
        } catch (error) {
            console.error('Error saving file as:', error)
            return null
        }
    })

    ipcMain.handle('save-existing-file', async (_, content: string, filePath: string) => {
        try {
            writeFileSync(filePath, content, 'utf8')
            return filePath
        } catch (error) {
            console.error('Error saving existing file:', error)
            return null
        }
    })

    ipcMain.handle('open-file', async () => {
        try {
            const result = await dialog.showOpenDialog(mainWindow!, {
                properties: ['openFile'],
                filters: [
                    { name: 'All Files', extensions: ['*'] },
                    { name: 'JavaScript', extensions: ['js', 'jsx'] },
                    { name: 'TypeScript', extensions: ['ts', 'tsx'] },
                    { name: 'HTML', extensions: ['html', 'htm'] },
                    { name: 'CSS', extensions: ['css', 'scss', 'sass', 'less'] },
                    { name: 'Python', extensions: ['py'] },
                    { name: 'JSON', extensions: ['json'] },
                    { name: 'Markdown', extensions: ['md', 'markdown'] },
                    { name: 'Text', extensions: ['txt'] }
                ]
            })

            if (!result.canceled && result.filePaths.length > 0) {
                const filePath = result.filePaths[0]
                const content = readFileSync(filePath, 'utf8')
                const fileName = filePath.split('/').pop() || 'Untitled'
                return { content, fileName, filePath }
            }
            return null
        } catch (error) {
            console.error('Error opening file:', error)
            return null
        }
    })

    ipcMain.handle('show-save-dialog', async (_, defaultPath?: string) => {
        try {
            const result = await dialog.showSaveDialog(mainWindow!, {
                defaultPath,
                filters: [
                    { name: 'All Files', extensions: ['*'] },
                    { name: 'JavaScript', extensions: ['js', 'jsx'] },
                    { name: 'TypeScript', extensions: ['ts', 'tsx'] },
                    { name: 'HTML', extensions: ['html', 'htm'] },
                    { name: 'CSS', extensions: ['css', 'scss', 'sass', 'less'] },
                    { name: 'Python', extensions: ['py'] },
                    { name: 'JSON', extensions: ['json'] },
                    { name: 'Markdown', extensions: ['md', 'markdown'] },
                    { name: 'Text', extensions: ['txt'] }
                ]
            })

            return result.canceled ? null : result.filePath
        } catch (error) {
            console.error('Error showing save dialog:', error)
            return null
        }
    })

    ipcMain.handle('show-open-dialog', async (_, filters?: { name: string; extensions: string[] }[]) => {
        try {
            const result = await dialog.showOpenDialog(mainWindow!, {
                properties: ['openFile'],
                filters: filters || [
                    { name: 'All Files', extensions: ['*'] }
                ]
            })

            return result.canceled ? null : result.filePaths
        } catch (error) {
            console.error('Error showing open dialog:', error)
            return null
        }
    })

    ipcMain.handle('read-file-by-path', async (_, filePath: string) => {
        try {
            const content = readFileSync(filePath, 'utf8')
            const fileName = filePath.split('/').pop() || 'Untitled'
            return { content, fileName, filePath }
        } catch (error) {
            console.error('Error reading file by path:', error)
            return null
        }
    })
}

app.whenReady().then(() => {
    setupIPC()
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        } else if (mainWindow) {
            mainWindow.show()
        }
    })
})

app.on('window-all-closed', () => {
    // On macOS, applications usually remain active even when all windows are closed
    if (process.platform !== 'darwin') {
        isQuitting = true
        app.quit()
    }
})

app.on('before-quit', () => {
    console.log('Application is preparing to quit...')
    isQuitting = true
})

app.on('will-quit', () => {
    console.log('Application is quitting...')
    isQuitting = true
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    } else if (mainWindow.isMinimized()) {
        mainWindow.restore()
    } else {
        mainWindow.show()
    }
})

process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...')
    isQuitting = true
    app.quit()
})

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...')
    isQuitting = true
    app.quit()
})

process.on('exit', (code) => {
    console.log(`Process exiting with code: ${code}`)
})

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
    isQuitting = true
    app.quit()
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    isQuitting = true
    app.quit()
})
