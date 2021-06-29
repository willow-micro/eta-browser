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
    // ipcRenderer.on("GazeDataFromViewerToWebView", (event, arg) => {
    //     console.log("Received Gaze Data: " + arg.data);
    // });
});

// Mousemove event
// Debounce with 150ms
document.addEventListener('mousemove', debounce(150, false, (event) => {
    // Deeper Elements First
    const elements = document.elementsFromPoint(event.clientX, event.clientY);

    // Serach for Sectioning Contents and WAI-ARIA Contents
    const targetTagNames = ["address", "article", "aside", "footer", "header", "h1", "h2", "h3", "h4", "h5", "h6", "main", "nav", "section"];
    const targetAttributes = ["role", "aria-label"];
    const filteredElements = elements.filter(element => {
        // TagName is matched
        if (targetTagNames.includes(element.tagName)) {
            return true;
        }
        // Has specified attributes
        for (let i = 0; i < targetAttributes.length; i++) {
            if (element.hasAttribute(targetAttributes[i])) {
                return true;
            }
        }
        return false;
    });

    // The Deepest Matched Element
    console.log("type: " + filteredElements[0].tagName);
    console.log("id: " + filteredElements[0].id);
    console.log("role: " + filteredElements[0].getAttribute("role"));
    console.log("aria-label: " + filteredElements[0].ariaLabel);

    ipcRenderer.sendToHost(
        "DOMDataFromWebViewToViewer",
        {
            coordinates: {
                x: event.clientX,
                y: event.clientY
            },
            tagName: filteredElements[0].tagName,
            id: filteredElements[0].id,
            role: filteredElements[0].getAttribute("role"),
            ariaLabel: filteredElements[0].ariaLabel
        });
}));
