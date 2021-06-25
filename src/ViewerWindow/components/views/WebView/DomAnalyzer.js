// -*- coding: utf-8-unix -*-
// <webview> Preload Script inside the viewer window
//
// Analyze DOM Tree inside the webview
//
// Unsafe IPC because of no ContextBridge:
// "contextIsolation: false"
// for <webview> tag

const { ipcRenderer } = require('electron');
const { debounce } = require('throttle-debounce');

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMAnalyzer was loaded.");
    //// IPC Receive (from Main) Create Listener
    // ipcRenderer.on("SendGazeDataFromViewerToWebView", (event, arg) => {
    //     console.log("Received Gaze Data: " + arg.data);
    // });
});

// Mousemove event
// Debounce with 150ms
document.addEventListener('mousemove', debounce(150, false, (event) => {
    let elem = document.elementFromPoint(event.clientX, event.clientY);

    console.log("type: " + elem.tagName);
    console.log("id: " + elem.id);
    console.log("role: " + elem.getAttribute("role"));
    console.log("aria-label: " + elem.ariaLabel);

    ipcRenderer.sendToHost(
        "SendDOMDataFromWebViewToViewer",
        {
            coordinates: {
                x: event.clientX,
                y: event.clientY
            },
            tagName: elem.tagName,
            id: elem.id,
            role: elem.getAttribute("role"),
            ariaLabel: elem.ariaLabel
        });
}));
