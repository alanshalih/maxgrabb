'use strict'

import { app, protocol, BrowserWindow, ipcMain, clipboard   } from 'electron'
const low = require('lowdb')
const path = require('path');
const FileSync = require('lowdb/adapters/FileSync')
var adapter = {};
var db = {};
adapter.alltab = new FileSync('alltab.json')
db.alltab = low(adapter.alltab)
db.alltab.defaults({ tabs : [] }).write()

import {
  createProtocol,
  /* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600, webPreferences: {
    webviewTag : true,
    // Use pluginOptions.nodeIntegration, leave this alone
    // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
    nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
  } })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('tabs', (event, arg) => {
  var tabs = db.alltab.get('tabs')
  .value();

tabs.forEach(item=>{
  adapter[item.id] = new FileSync(item.id+'.json')
  db[item.id] = low(adapter[item.id]);
  db[item.id].defaults({
    lists : [],
    contacts : [],
    campaigns : []
  }).write();
})

  event.returnValue = tabs;
})

ipcMain.on('add-tabs', (event, arg) => {



  db.alltab.get('tabs')
  .push(arg)
  .write()

  var item = arg;

  adapter[item.id] = new FileSync(item.id+'.json')
  db[item.id] = low(adapter[item.id]);
  db[item.id].defaults({
    lists : [],
    contacts : [],
    campaigns : []
  }).write();


  event.returnValue = 'OK';

  
})

ipcMain.on('close-tab', (event, arg) => {



  db.alltab.get('tabs')
  .remove(arg)
  .write()


  event.returnValue = 'OK';

  
})

ipcMain.on('lists', (event, arg) => {

  
  var lists = db[arg.id].get('lists')
  .value()

  event.returnValue = lists;

  
})

ipcMain.on('add-list', (event, arg) => {

  
  var list = db[arg.id].get('lists')
  .push(arg.data)
  .write()

  event.returnValue = 'OK';

  
})

ipcMain.on('add-contact', (event, arg) => {

  
  var list = db[arg.id].get('contacts')
  .push(arg.data)
  .write()

  event.returnValue = 'OK';

  
})

ipcMain.on('get-list', (event, arg) => {

  
  var list = db[arg.id].get('lists')
  .find({id : arg.params.id})
  .value()

  event.returnValue = list;

  
})

ipcMain.on('update-list', (event, arg) => {

  
  var list = db[arg.tab_id].get('lists')
  .find({id : arg.list_id})
  .assign({ total : arg.total })
  .write()

  event.returnValue = 'OK';

  
})

ipcMain.on('contacts', (event, arg) => {

  
  var contacts = db[arg.id].get('contacts')
  .filter({list_id : arg.params.id})
  .value()

  event.returnValue = contacts;

  
})


app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }

  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
