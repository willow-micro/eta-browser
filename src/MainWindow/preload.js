// -*- coding: utf-8-unix -*-
// Electron Preload Script

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
    "api",
    {
        // IPC Send (to Main)
        send: (channel, data) => {
            ipcRenderer.send(channel, data);
        },
        // IPC Receive (from Main): Create Listener
        on: (channel, func) => {
            ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
        },
        // IPC Receive (from Main): Remove Listener
        remove: (channel, func) => {
            ipcRenderer.removeListener(channel, (event, ...args) => func(event, ...args));
        }
    }
);
