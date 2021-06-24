// -*- coding: utf-8-unix -*-
// Electron Main Process Script

// System
const { electron, app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
// User
const menuTemplate = require('./MenuTemplate.js');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

// Make windows object visible from entire the main script
let mainWindow = null;
let viewerWindow = null;


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
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
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
    let viewerURL = arg.url;
    console.log("OpenBrowser URL: " + viewerURL);

    // Make eta browser window
    viewerWindow = new BrowserWindow({
        width: 800,
        height: 600,
        x: mainWindow.getPosition()[0] + 24,
        y: mainWindow.getPosition()[1] + 24,
        webPreferences: {
            // Default value since Electron v12 is false for prevent XSS. But desktopCapturer requires true
            nodeIntegration: true,
            // Default is true, but it should be false because the viewer window have <webview> tag
            // So, Viewer Window CANNOT USE ContextBridge.
            contextIsolation: false, //true,
            // Set preload script
            preload: VIEWER_WINDOW_PRELOAD_WEBPACK_ENTRY,
            // Enable <webview> tag
            nodeIntegrationInSubFrames: true,
            webviewTag: true
        }
    });
    viewerWindow.loadURL(VIEWER_WINDOW_WEBPACK_ENTRY);
    viewerWindow.webContents.openDevTools();
    viewerWindow.on('closed', function() {
        viewerWindow = null;
    });

    // Send Destination URL when the viewer window is ready
    viewerWindow.webContents.once('dom-ready', () => {
        viewerWindow.webContents.send(
            // Channel name
            "ViewerURL",
            // Data
            {
                url: viewerURL
            }
        );
    });

    // Send App Message
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
    viewerWindow.webContents.send(
        // Channel name
        "Start",
        // Data
        {}
    );
});
ipcMain.on("Stop", (event, arg) => {
    console.log("Stop");
    viewerWindow.webContents.send(
        // Channel name
        "Stop",
        // Data
        {}
    );
});
ipcMain.on("SaveBufferToFile", (event, arg) => {
    console.log("SaveBufferToFile");
    const buffer = arg.buffer;
    // Write File
    const filePath = dialog.showSaveDialog(mainWindow, {
        buttonLabel: "Save",
        filters: [
            {
                name: 'WebM Video Format',
                extensions: ["webm"]
            },
        ],
        properties:[
            "createDirectory",
        ]
    }).then(result => {
        if (result.filePath !== undefined) { // Cancelled
            fs.writeFile(result.filePath, buffer, (error) => {
                if (error) {
                    console.log("Error in save desktopCapture");
                    console.log(error);
                    // Send App Message
                    mainWindow.webContents.send(
                        "AppMessage",
                        {
                            message: "キャプチャを保存できません",
                            type: "error"
                        }
                    );
                } else {
                    // Success
                    console.log("Successfully Saved a Captured Video");
                    // Send App Message
                    mainWindow.webContents.send(
                        // Channel name
                        "AppMessage",
                        // Data
                        {
                            message: "キャプチャを保存しました",
                            type: "success"
                        }
                    );
                }
            });
        }
    });
});


ipcMain.on("SendDOMDataFromViewerToMain", (event, arg) => {
    // console.log(arg.coordinates.x + ", " + arg.coordinates.y);
    // console.log(arg.type);
    // console.log(arg.role);
    // console.log(arg.ariaLabel);
    mainWindow.webContents.send(
        // Channel name
        "SendDOMDataFromMainToMainWindow",
        // Data
        arg
    );
});

ipcMain.on("AppMessage", (event, arg) => {
    mainWindow.webContents.send(
        // Channel name
        "AppMessage",
        // Data
        arg
    );
});
