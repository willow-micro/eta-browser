// -*- coding: utf-8-unix -*-
// ETA-Browser
// Electron Main Process Script

///////////////////////////////////////////////////////////////////////////////
//                                   Import                                  //
///////////////////////////////////////////////////////////////////////////////
// System /////////////////////////////////////////////////////////////////////
const { electron, app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { format } = require('@fast-csv/format');
const ws = require('ws');
// User ///////////////////////////////////////////////////////////////////////
const menuTemplate = require('./MenuTemplate.js');
const Timekeeper = require('./Timekeeper.js');
const WSEventID = require('./WSEventID.js');

// Handle creating/removing shortcuts on Windows when installing/uninstalling //
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

///////////////////////////////////////////////////////////////////////////////
//                              Global variables                             //
///////////////////////////////////////////////////////////////////////////////
/// Global flags
let isRecording = false;
let isViewerAvailable = false;
let isWebSocketConnected = false;
/// Config data
let configs = null;
/// Make windows object visible from entire the main script
let mainWindow = null;
let viewerWindow = null;
/// Timekeeper for timestamps
const timekeeper = new Timekeeper();
/// CSV Format Stream
let csvFormatStream = null;
let csvSaveStream = null;
let csvDestinationPath = "";
/// Desktop Capture
let captureSaveStream = null;
let captureDestinationPath = "";
let isCaptureSaveStreamActive = false;
// WebSocket client instance
let websocket = null;


///////////////////////////////////////////////////////////////////////////////
//                           Create the main window                          //
///////////////////////////////////////////////////////////////////////////////
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

    // Set menu template
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // When the main window is closed, back it to a null object.
    mainWindow.on('closed', function() {
        mainWindow = null;
        websocket = null;
    });
};


///////////////////////////////////////////////////////////////////////////////
//                                App handlers                               //
///////////////////////////////////////////////////////////////////////////////
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

///////////////////////////////////////////////////////////////////////////////
//                                IPC handlers                               //
///////////////////////////////////////////////////////////////////////////////
// Open viewer window /////////////////////////////////////////////////////////
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
        isViewerAvailable = false;
        // Close ws
        if (websocket !== null) {
            websocket = null;
            isWebSocketConnected = false;
        }
    });

    // Send Destination URL when the viewer window is ready
    viewerWindow.webContents.once('dom-ready', () => {
        viewerWindow.webContents.send("InitializeViewerFromMain", {
            url: arg.browserURL,
            configs: arg.configs
        });
        mainWindow.webContents.send("AppMessage", {
            message: "コンテンツを開きました",
            type: "info"
        });
        isViewerAvailable = true;
    });

    configs = arg.configs;

    // Start ws client
    console.log("StartWSClient: " + arg.webSocketURL);
    // Open websocket client
    InitializeWSClient(arg.webSocketURL);
});

// Open CSV path modal ////////////////////////////////////////////////////////
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

// Open capture video path modal //////////////////////////////////////////////
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

// Add capture video data chunk to the stream /////////////////////////////////
ipcMain.on("CaptureDataChunkFromViewerToMain", (event, arg) => {
    if (isCaptureSaveStreamActive) {
        // Convert to Buffer from Uint8Array
        const buffer = Buffer.from(arg.uint8Array);
        // Write a buffer to the fs writable stream
        captureSaveStream.write(buffer);
    }
});

// End capturing //////////////////////////////////////////////////////////////
ipcMain.on("CaptureEndedInViewer", (event, arg) => {
    // Capture Cleanup
    captureSaveStream.end();
    captureSaveStream = null;
});

// Start analysis /////////////////////////////////////////////////////////////
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

// Stop analysis //////////////////////////////////////////////////////////////
ipcMain.on("StopAnalysis", (event, arg) => {
    viewerWindow.webContents.send("StopAnalysis", {}); // Thru
    console.log(`Analysis ended with ${ timekeeper.getElapsedTime() } [ms].`);
    timekeeper.stopCounting();
    isRecording = false;
    // CSV Cleanup
    csvFormatStream.end();
    csvFormatStream = null;
    csvSaveStream = null;
});

// Receive DOM Data ///////////////////////////////////////////////////////////
ipcMain.on("DOMDataFromViewerToMain", (event, arg) => {
    mainWindow.webContents.send("DOMDataFromMainToMainWindow", arg);
    if (isRecording && configs && csvFormatStream && csvSaveStream) {
        let csvWriteHashArray = [];
        csvWriteHashArray.push(["EventID", arg.eventID]);
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
        for (var index = 0; index < configs.adoptRange.leaf; index++) {
            csvWriteHashArray.push([`LeafSideElem(${index + 1}): TagName`, arg.leafSideElementData[index]["tagName"]]);
            configs.elementDataCollection.attributes.map((attribute) => {
                csvWriteHashArray.push([`LeafSideElem(${index + 1}): ${attribute}`, arg.leafSideElementData[index][attribute]]);
            });
        }
        for (var index = 0; index < configs.adoptRange.root; index++) {
            csvWriteHashArray.push([`RootSideElem(-${index + 1}): TagName`, arg.rootSideElementData[index]["tagName"]]);
            configs.elementDataCollection.attributes.map((attribute) => {
                csvWriteHashArray.push([`RootSideElem(-${index + 1}): ${attribute}`, arg.rootSideElementData[index][attribute]]);
            });
        }
        csvWriteHashArray.push(["LFHF", 0.0]);
        csvFormatStream.write(csvWriteHashArray);
    }
});

// Thru app messages //////////////////////////////////////////////////////////
ipcMain.on("AppMessage", (event, arg) => {
    mainWindow.webContents.send("AppMessage", arg);
});

///////////////////////////////////////////////////////////////////////////////
//                                 WebSocket                                 //
///////////////////////////////////////////////////////////////////////////////
// Initialize a websocket instance
const InitializeWSClient = (path) => {
    // Init ///////////////////////////////////////////////////////////////////
    websocket = new ws.WebSocket(path, {
        perMessageDeflate: false
    });
    // Handlers ///////////////////////////////////////////////////////////////
    websocket.on("open", () => {
        console.log("connected to ws server");
        mainWindow.webContents.send("AppMessage", {
            message: "データサーバに接続しました",
            type: "info"
        });
        isWebSocketConnected = true;
    });
    websocket.on("close", () => {
        console.log("disconnected to ws server");
        mainWindow.webContents.send("AppMessage", {
            message: "データサーバを切断しました",
            type: "info"
        });
        isWebSocketConnected = false;
    });
    websocket.on("error", () => {
        console.log("error with ws server");
        mainWindow.webContents.send("AppMessage", {
            message: "データサーバに接続できません",
            type: "error"
        });
        isWebSocketConnected = false;
    });
    websocket.on("message", (msg) => {
        const messageStr = msg.toString();
        const messageArray = messageStr.split(",");

        // Check
        if (messageStr[0] !== 'e') {
            console.log("Message received via WebSocket has no event id");
            return;
        }

        // Debug
        //console.log("received from ws server:");
        //console.log(messageArray); // Content
        //console.log("CurrentUnixTime: " + Date.now()); // UnixTime (Electron)

        // Switch with WSEventID
        const eventID = parseInt(messageArray[0].substring(1), 10);
        if (eventID === NaN) {
            console.log("Received WSEventID is NaN");
            return;
        }
        // Parse messages from TobiiSBETServer
        switch (eventID) {
        case WSEventID.FixationStarted: {
            // FixationStarted event //////////////////////////////////////////
            const dataCount = parseInt(messageArray[1].substring(1), 10);
            if (dataCount === NaN) {
                console.log("Received dataCount is NaN");
                return;
            } else {
                console.log("ConsecutiveDataCount: " + dataCount);
            }
            const parsedDataArray = new Array(dataCount);
            for (var dataNumber = 0; dataNumber < dataCount; dataNumber++) {
                const unixTimeStr = messageArray[2 + dataNumber * 3].substring(1);
                const unixTime = parseInt(unixTimeStr, 10);
                if (unixTime === NaN) {
                    console.log("Received unixTime is NaN");
                    return;
                }
                const screenXStr = messageArray[3 + dataNumber * 3].substring(1);
                const screenX = parseInt(screenXStr, 10);
                if (screenX === NaN) {
                    console.log("Received screenX is NaN");
                    return;
                }
                const screenYStr = messageArray[4 + dataNumber * 3].substring(1);
                const screenY = parseInt(screenYStr, 10);
                if (screenY === NaN) {
                    console.log("Received screenY is NaN");
                    return;
                }
                const parsedData = {
                    time: unixTime,
                    x: screenX,
                    y: screenY
                };
                parsedDataArray[dataNumber] = parsedData;
            }

            // Send to viewer if necessary
            if (isViewerAvailable) {
                viewerWindow.webContents.send("EyeDataFromMainToViewer", {
                    id: eventID,
                    n: dataCount,
                    data: parsedDataArray
                });
            }
            break;
        }
        case WSEventID.FixationEnded: {
            // FixationEnded event ////////////////////////////////////////////
            const parsedDataArray = new Array(1);
            const unixTimeStr = messageArray[1].substring(1);
            const unixTime = parseInt(unixTimeStr, 10);
            if (unixTime === NaN) {
                console.log("Received unixTime is NaN");
                return;
            }
            const screenXStr = messageArray[2].substring(1);
            const screenX = parseInt(screenXStr, 10);
            if (screenX === NaN) {
                console.log("Received screenX is NaN");
                return;
            }
            const screenYStr = messageArray[3].substring(1);
            const screenY = parseInt(screenYStr, 10);
            if (screenY === NaN) {
                console.log("Received screenY is NaN");
                return;
            }
            const parsedData = {
                time: unixTime,
                x: screenX,
                y: screenY
            };
            parsedDataArray[0] = parsedData;
            // Send to viewer if necessary
            if (isViewerAvailable) {
                viewerWindow.webContents.send("EyeDataFromMainToViewer", {
                    id: eventID,
                    n: 1,
                    data: parsedDataArray
                });
            }
            break;
        }
        case WSEventID.LFHFComputed: {
            // LFHFComputed event /////////////////////////////////////////////
            const unixTimeStr = messageArray[1].substring(1);
            const unixTime = parseInt(unixTimeStr, 10);
            if (unixTime === NaN) {
                console.log("Received unixTime is NaN");
                return;
            }
            const lfhfStr = messageArray[2].substring(1);
            const lfhf = parseFloat(lfhfStr); // F3
            if (lfhf === NaN) {
                console.log("Received lfhf is NaN");
                return;
            }
            // const parsedDataArray = [];
            // const parsedData = {
            //     time: unixTime,
            //     lfhf: lfhf
            // };
            // parsedDataArray.push(parsedData);
            // // Send to viewer if necessary
            // if (isViewerAvailable) {
            //     viewerWindow.webContents.send("EyeDataFromMainToViewer", {
            //         id: eventID,
            //         n: 1,
            //         data: parsedDataArray
            //     });
            // }
            // Write to csv
            if (isRecording && configs && csvFormatStream && csvSaveStream) {
                let csvWriteHashArray = [];
                csvWriteHashArray.push(["EventID", eventID]);
                if (configs.generalDataCollection.timestamp) {
                    csvWriteHashArray.push(["Timestamp[ms]", timekeeper.getElapsedTime()]);
                }
                if (configs.generalDataCollection.coordinates) {
                    csvWriteHashArray.push(["X", 0]);
                    csvWriteHashArray.push(["Y", 0]);
                }
                if (configs.generalDataCollection.overlapAll) {
                    csvWriteHashArray.push(["Element Overlap (All)", ""]);
                }
                if (configs.generalDataCollection.overlapFiltered) {
                    csvWriteHashArray.push(["Element Overlap (Filtered)", ""]);
                }
                for (var index = 0; index < configs.adoptRange.leaf; index++) {
                    csvWriteHashArray.push([`LeafSideElem(${index + 1}): TagName`, ""]);
                    configs.elementDataCollection.attributes.map((attribute) => {
                        csvWriteHashArray.push([`LeafSideElem(${index + 1}): ${attribute}`, ""]);
                    });
                }
                for (var index = 0; index < configs.adoptRange.root; index++) {
                    csvWriteHashArray.push([`RootSideElem(-${index + 1}): TagName`, ""]);
                    configs.elementDataCollection.attributes.map((attribute) => {
                        csvWriteHashArray.push([`RootSideElem(-${index + 1}): ${attribute}`, ""]);
                    });
                }
                csvWriteHashArray.push(["LFHF", lfhf]);
                csvFormatStream.write(csvWriteHashArray);
            }
            break;
        }
        default: {
            console.log("Received WSEventID is unknown");
            break;
        }
        }
    });
};
