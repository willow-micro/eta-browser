// -*- coding: utf-8-unix -*-
// Electron Preload Script
//
// Unsafe IPC because of no ContextBridge:
// "contextIsolation: false"
// for <webview> tag

const { ipcRenderer } = require("electron");

// IPC Message Tx (to Main)
window.viewerIPCSend = (channel, data) => {
    ipcRenderer.send(channel, data);
};

// IPC Receive (from Main)
window.viewerIPCOn = (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
};
