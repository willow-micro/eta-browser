// -*- coding: utf-8-unix -*-
// Electron Preload Script

const { ipcRenderer } = require('electron');


window.MyIPCSend = (msg) => {
    ipcRenderer.send("msg_render_to_main", msg);
}
