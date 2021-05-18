// -*- coding: utf-8-unix -*-
// <webview> Preload Script inside the viewer window
//
// Analyze DOM Tree inside the webview
//
// Unsafe IPC because of no ContextBridge:
// "contextIsolation: false"
// for <webview> tag

const { ipcRenderer } = require('electron');


let previousCorrdinates = {
    x: 0,
    y: 0
};


document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMAnalyzer was loaded.");
    ipcRenderer.on("SendDataFromViewerToWebView", (event, arg) => {
        console.log("Data for webview: " + arg.data);
    });
});

// Mousemove
document.addEventListener('mousemove', (event) => {
    if (Math.abs(previousCorrdinates.x - event.clientX) > 20 ||
        Math.abs(previousCorrdinates.y - event.clientY) > 20) {
        let elem = document.elementFromPoint(event.clientX, event.clientY);
        console.log("type: " + elem.tagName);
        console.log("id: " + elem.id);
        console.log("content: " + elem.innerHTML);
        ipcRenderer.sendToHost(
            "SendDOMDataFromWebViewToViewer",
            {
                coordinates: {
                    x: event.clientX,
                    y: event.clientY
                },
                type: elem.tagName,
                id: elem.id,
                content: elem.innerHTML
            }
        );
        previousCorrdinates.x = event.clientX;
        previousCorrdinates.y = event.clientY;
    }
});