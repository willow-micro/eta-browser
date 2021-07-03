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
let configs = null;

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
let captureSaveStream = null;
let captureDestinationPath = "";
let isCaptureSaveStreamActive = false;

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
ipcMain.on("OpenViewer", (event, arg) => {
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
        mainWindow.webContents.send("ViewerClosed", {});
        if (isRecording) {
            timekeeper.stopCounting();
            isRecording = false;
            // Cleanup CSV
            csvFormatStream.end();
            csvFormatStream = null;
            csvSaveStream = null;
            // Cleanup CAPTURE
            captureSaveStream.end();
            captureSaveStream = null;
        }
    });

    // Send Destination URL when the viewer window is ready
    viewerWindow.webContents.once('dom-ready', () => {
        viewerWindow.webContents.send("InitializeViewerFromMain", {
            url: arg.url,
            configs: arg.configs
        });
        mainWindow.webContents.send("AppMessage", {
            message: "コンテンツを開きました",
            type: "info"
        });
    });

    configs = arg.configs;
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
            "createDirectory"
        ]
    }).then(result => {
        if (!result.canceled) { // If Cancelled, skip it
            // Store CSV path
            csvDestinationPath = result.filePath;
            // Respond CSV Path
            mainWindow.webContents.send("RespondCsvDestinationPath", {
                path: csvDestinationPath
            });

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
            "createDirectory"
        ]
    }).then(result => {
        if (!result.canceled) { // If Cancelled, skip it
            // Store capture path
            captureDestinationPath = result.filePath;
            // Respond capture path
            mainWindow.webContents.send("RespondCaptureDestinationPath", {
                path: captureDestinationPath
            });

            // If csv path is not specified, use same path as capture for it
            // Viewer has same behavior on it
            if (csvDestinationPath === "") {
                csvDestinationPath = result.filePath.substr(0, result.filePath.lastIndexOf(".")) + ".csv";
            }
        }
    });
});


ipcMain.on("CaptureDataChunkFromViewerToMain", (event, arg) => {
    if (isCaptureSaveStreamActive) {
        // Convert to Buffer from Uint8Array
        const buffer = Buffer.from(arg.uint8Array);
        // Write a buffer to the fs writable stream
        captureSaveStream.write(buffer);
    }
});

ipcMain.on("CaptureEndedInViewer", (event, arg) => {
    // Capture Cleanup
    captureSaveStream.end();
    captureSaveStream = null;
});

// Start / Stop Analysis
ipcMain.on("StartAnalysis", (event, arg) => {
    viewerWindow.webContents.send("StartAnalysis", {}); // Thru
    timekeeper.startCounting();
    isRecording = true;
    // CSV Setup
    csvFormatStream = format({
        headers: true
    });
    csvSaveStream = fs.createWriteStream(csvDestinationPath);
    csvSaveStream.on("finish", () => {
        mainWindow.webContents.send("AppMessage", {
            message: "CSVを保存しました",
            type: "success"
        });
    });
    csvSaveStream.on("error", () => {
        mainWindow.webContents.send("AppMessage", {
            message: "CSVを記録中にエラーが発生しました",
            type: "error"
        });
    });
    csvFormatStream.pipe(csvSaveStream);
    // Capture Setup
    captureSaveStream = fs.createWriteStream(captureDestinationPath);
    isCaptureSaveStreamActive = true;
    captureSaveStream.on("finish", () => {
        mainWindow.webContents.send("AppMessage", {
            message: "画面キャプチャを保存しました",
            type: "success"
        });
    });
    captureSaveStream.on("error", () => {
        // After 'error', no further events other than 'close' should be emitted (including 'error' events)
        mainWindow.webContents.send("AppMessage", {
            message: "画面キャプチャを記録中にエラーが発生しました",
            type: "error"
        });
    });
    captureSaveStream.on("close", () => {
        isCaptureSaveStreamActive = false;
    });
});
ipcMain.on("StopAnalysis", (event, arg) => {
    viewerWindow.webContents.send("StopAnalysis", {}); // Thru
    console.log(`Analysis ended with ${ timekeeper.getElapsedTime() } [ms].`);
    timekeeper.stopCounting();
    isRecording = false;
    // CSV Cleanup
    csvFormatStream.end();
    csvFormatStream = null;
    csvSaveStream = null;
    // Wait for capture cleanup until the capturing finishes
});

// DOMData Thru and Store to CSV
ipcMain.on("DOMDataFromViewerToMain", (event, arg) => {
    mainWindow.webContents.send("DOMDataFromMainToMainWindow", arg);
    if (isRecording && configs) {
        let csvWriteHashArray = [];
        if (configs.generalDataCollection.timestamp) {
            csvWriteHashArray.push(["Timestamp[ms]", timekeeper.getElapsedTime()]);
        }
        if (configs.generalDataCollection.coordinates) {
            csvWriteHashArray.push(["X", arg.coordinates.x]);
            csvWriteHashArray.push(["Y", arg.coordinates.y]);
        }
        if (configs.generalDataCollection.overlapAll) {
            csvWriteHashArray.push(["Element Overlap (All)", arg.elemOverlapAll]);
        }
        if (configs.generalDataCollection.overlapFiltered) {
            csvWriteHashArray.push(["Element Overlap (Filtered)", arg.elemOverlapFiltered]);
        }
        arg.leafSideElementData.map((elementData, index) => {
            csvWriteHashArray.push([`LeafSideElem(${index + 1}): TagName`, elementData["tagName"]]);
            configs.elementDataCollection.attributes.map((attribute) => {
                csvWriteHashArray.push([`LeafSideElem(${index + 1}): ${attribute}`, elementData[attribute]]);
            });
        });
        arg.rootSideElementData.map((elementData, index) => {
            csvWriteHashArray.push([`RootSideElem(-${index + 1}): TagName`, elementData["tagName"]]);
            configs.elementDataCollection.attributes.map((attribute) => {
                csvWriteHashArray.push([`RootSideElem(-${index + 1}): ${attribute}`, elementData[attribute]]);
            });
        });
        csvFormatStream.write(csvWriteHashArray);
    }
});

// AppMessage Thru
ipcMain.on("AppMessage", (event, arg) => {
    mainWindow.webContents.send("AppMessage", arg);
});
