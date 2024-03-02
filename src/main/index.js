import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
const child_process = require('child_process');

const fs = require('fs')
const path = require('path');

let win



function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  win = mainWindow

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const file_directory = app.getPath('desktop')

  ipcMain.on('delete_model', (_child_process, args) => {
    var child = child_process.spawn('ollama', ['rm', args.model], {
      encoding: 'utf8',
      shell: true
    })
    child.stdout.setEncoding('utf8')
    child.on('error', (error) => { console.log("woosp", error) })
    child.stdout.on('data', (data) => {
      win.webContents.send('delete_model_response', data)
    })
    child.on('close', (code) => { console.log("close", code) })

  })

  ipcMain.on('save_chat', (_child_process, args) => {
    const folderPath = path.join(file_directory, args.model)

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath)
    }

    const filePath = path.join(folderPath, args.chat_date + '.txt')

    fs.writeFileSync(filePath, JSON.stringify(args.entry) + '\n', { encoding: 'utf-8', flag: 'a' })
  })

  ipcMain.on('load_chat_history', (_child_process, args) => {
    const folderPath = path.join(file_directory, args.model)

    try {
      var files = fs.readdirSync(folderPath)
      win.webContents.send('loaded_chat_history', files)
    } catch (e) {
      win.webContents.send('loaded_chat_history', [])
    }
  })

  ipcMain.on('delete_history_item', (_child_process, args) => {
    const folderPath = path.join(file_directory, args.model)
    fs.unlinkSync(path.join(folderPath, args.chat_date))
  })

  ipcMain.on('load_chat', async (_child_process, args) => {
    const folderPath = path.join(file_directory, args.model)
    const filePath = path.join(folderPath, args.chat_date)

    const buffer = new Buffer.alloc(1024)

    fs.open(filePath, 'r+', function (err, fd) {
      if (err) {
        return console.error(err)
      }

      fs.read(fd, buffer, 0, buffer.length, 0, function (err, bytes) {
        if (err) {
          console.log(err)
        }

        if (bytes > 0) {
          win.webContents.send('loaded_chat_log', JSON.parse(buffer.slice(0, bytes).toString()))
        }

        fs.close(fd, function (err) {
          if (err) {
            console.log(err)
          }
        })
      })
    })
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
