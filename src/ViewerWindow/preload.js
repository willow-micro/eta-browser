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

// IPC Receive (from Main) Create Listener
window.viewerIPCOn = (channel, func) => {
    electron.ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
};

// IPC Receive (from Main) Remove Listener
window.viewerIPCRemove = (channel, func) => {
    electron.ipcRenderer.removeListener(channel, (event, ...args) => func(event, ...args));
};
