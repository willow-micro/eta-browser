// -*- coding: utf-8-unix -*-
// Electron Preload Script

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
        send: (data) => {
            ipcRenderer.send("msg_render_to_main", data);
        }
    }
);
