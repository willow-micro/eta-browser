// -*- coding: utf-8-unix -*-
// Electron Preload Script
//
// Unsafe IPC because of no ContextBridge:
// "contextIsolation: false"
// for <webview> tag

const electron = require("electron");

// IPC Message Tx (to Main)
window.viewerIPCSend = (channel, data) => {
    electron.ipcRenderer.send(channel, data);
};

// IPC Receive (from Main)
window.viewerIPCOn = (channel, func) => {
    electron.ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
};
