// -*- coding: utf-8-unix -*-
// Electron Main Process Script

// System
const { electron, app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
// User
const menuTemplate = require('./MenuTemplate.js');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

// Make windows object visible from entire the main script
let mainWindow = null;
let etaBrowserWindow = null;

// Create the main window
const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            // Default value since Electron v12 (ContextBridge required for IPC)
            nodeIntegration: false,
            contextIsolation: true,
            // Set preload script
            preload: __dirname + '/preload.js'
        }
    });

    // Set template
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // When the main window is closed, back it to a null object.
    mainWindow.on('closed', function() {
        mainWindow = null;
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// IPC Message Rx (from Renderer)
ipcMain.on("OpenBrowser", (event, arg) => {
    // Get URL
    let etaBrowserURL = arg.url;
    console.log("OpenBrowser URL: " + etaBrowserURL);

    // Make eta browser window
    etaBrowserWindow = new BrowserWindow({
        width: 800,
        height: 600
    });
    etaBrowserWindow.loadURL(etaBrowserURL);
    etaBrowserWindow.webContents.openDevTools();
    etaBrowserWindow.on('closed', function() {
        etaBrowserWindow = null;
    });

    // Send Message
    mainWindow.webContents.send(
        // Channel name
        "AppMessage",
        // Data
        {
            message: "コンテンツを開きました",
            type: "info"
        }
    );

});

ipcMain.on("Start", (event, arg) => {
    console.log("Start");
});
