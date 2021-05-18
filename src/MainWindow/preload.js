// -*- coding: utf-8-unix -*-
// Electron Preload Script

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
    "api",
    {
        // IPC Message Tx (to Main)
        send: (channel, data) => {
            ipcRenderer.send(channel, data);
        },
        // IPC Receive (from Main)
        on: (channel, func) => {
            ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
        }
    }
);
