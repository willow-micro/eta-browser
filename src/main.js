// -*- coding: utf-8-unix -*-
// Electron Main Process Script

// System
const { electron, app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { format } = require('@fast-csv/format');
// User
const menuTemplate = require('./MenuTemplate.js');
const Timekeeper = require('./Timekeeper.js');
let isRecording = false;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

// Make windows object visible from entire the main script
let mainWindow = null;
let viewerWindow = null;

// Timekeeper for timestamps
const timekeeper = new Timekeeper();
// CSV Format Stream
let csvFormatStream = null;
let csvSaveStream = null;
let csvDestinationPath = "";
// Desktop Capture
let captureDestinationPath = "";

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
    let viewerDestinationURL = arg.url;
    console.log("OpenBrowser URL: " + viewerDestinationURL);

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
        // Tell main window the browser is closed
        mainWindow.webContents.send(
            // Channel name
            "ViewerClosed",
            // Data
            {}
        );
        if (isRecording) {
            timekeeper.stopCounting();
            isRecording = false;
            csvFormatStream.end();
            csvFormatStream = null;
            csvSaveStream = null;
        }
    });

    // Send Destination URL when the viewer window is ready
    viewerWindow.webContents.once('dom-ready', () => {
        viewerWindow.webContents.send(
            // Channel name
            "ViewerDestinationURL",
            // Data
            {
                url: viewerDestinationURL
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

ipcMain.on("RequestCsvDestinationPath", (event, arg) => {
    const filePath = dialog.showSaveDialog(mainWindow, {
        buttonLabel: "Save",
        filters: [
            {
                name: 'Comma Separated Values',
                extensions: ["csv"]
            },
        ],
        properties:[
            "createDirectory",
        ]
    }).then(result => {
        if (!result.canceled) { // If Cancelled, skip it
            // Store CSV path
            csvDestinationPath = result.filePath;
            // Respond CSV Path
            mainWindow.webContents.send(
                // Channel name
                "RespondCsvDestinationPath",
                // Data
                {
                    path: csvDestinationPath
                }
            );
            // If capture path is not specified, use same path as csv for it
            // Viewer has same behavior on it
            if (captureDestinationPath === "") {
                captureDestinationPath = result.filePath.substr(0, result.filePath.lastIndexOf(".")) + ".webm";
            }
        }
    });
});
ipcMain.on("RequestCaptureDestinationPath", (event, arg) => {
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
        if (!result.canceled) { // If Cancelled, skip it
            // Store capture path
            captureDestinationPath = result.filePath;
            // Respond capture path
            mainWindow.webContents.send(
                // Channel name
                "RespondCaptureDestinationPath",
                // Data
                {
                    path: captureDestinationPath
                }
            );
            // If csv path is not specified, use same path as capture for it
            // Viewer has same behavior on it
            if (csvDestinationPath === "") {
                csvDestinationPath = result.filePath.substr(0, result.filePath.lastIndexOf(".")) + ".csv";
            }
        }
    });
});


ipcMain.on("SaveBufferToFile", (event, arg) => {
    console.log("SaveBufferToFile");
    const buffer = arg.buffer;
    // Write File
    fs.writeFile(captureDestinationPath, buffer, (error) => {
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
});

ipcMain.on("StartAnalysis", (event, arg) => {
    console.log("Start Analysis");
    viewerWindow.webContents.send(
        // Channel name
        "StartAnalysis",
        // Data
        {}
    );
    timekeeper.startCounting();
    isRecording = true;
    csvFormatStream = format({
        headers: true
    });
    csvSaveStream = fs.createWriteStream(csvDestinationPath);
    csvFormatStream.pipe(csvSaveStream);
});
ipcMain.on("StopAnalysis", (event, arg) => {
    console.log("Stop Analysis");
    viewerWindow.webContents.send(
        // Channel name
        "StopAnalysis",
        // Data
        {}
    );
    console.log(`Analysis ended with ${ timekeeper.getElapsedTime() }ms.`);
    timekeeper.stopCounting();
    isRecording = false;
    csvFormatStream.end();
    csvFormatStream = null;
    csvSaveStream = null;
});


ipcMain.on("DOMDataFromViewerToMain", (event, arg) => {
    mainWindow.webContents.send(
        // Channel name
        "DOMDataFromMainToMainWindow",
        // Data
        arg
    );
    if (isRecording) {
        csvFormatStream.write({
            Time: timekeeper.getElapsedTime(),
            X: arg.coordinates.x,
            Y: arg.coordinates.y,
            MainElemIsTarget: arg.mainElement.isTarget,
            ParentElemIsTarget: arg.parentElement.isTarget,
            MainElemTagName: arg.mainElement.tagName,
            ParentElemTagName: arg.parentElement.tagName,
            MainElemId: arg.mainElement.id,
            ParentElemId: arg.parentElement.id,
            MainElemRole: arg.mainElement.role,
            ParentElemRole: arg.parentElement.role,
            MainElemAriaLabel: arg.mainElement.ariaLabel,
            ParentElemAriaLabel: arg.parentElement.ariaLabel,
            ElemPath: arg.elemPath,
            ElemPathAll: arg.elemPathAll
        });
    }
});

ipcMain.on("AppMessage", (event, arg) => {
    mainWindow.webContents.send(
        // Channel name
        "AppMessage",
        // Data
        arg
    );
});
