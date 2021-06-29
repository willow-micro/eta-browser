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
        if (targetTagNames.includes(element.tagName.toLowerCase())) {
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


    // Element path (ARIA only)
    let elemPath = "";
    // Element path (All)
    let elemPathAll = "";
    if (filteredElements.length > 0) {
        for (var i = 0; i < filteredElements.length; i++) {
            elemPath += filteredElements[i].tagName.toLowerCase();
            if (i < filteredElements.length - 1) {
                elemPath += " < ";
            }
        }
    }
    for (var i = 0; i < elements.length; i++) {
        elemPathAll += elements[i].tagName.toLowerCase();
        if (i < elements.length - 1) {
            elemPathAll += " < ";
        }
    }

    if (filteredElements.length >= 2) {
        // There is Main and Parent target elements (and more)
        ipcRenderer.sendToHost(
            "DOMDataFromWebViewToViewer",
            {
                coordinates: {
                    x: event.clientX,
                    y: event.clientY
                },
                mainElement: {
                    isTarget: true,
                    tagName: filteredElements[0].tagName.toLowerCase(),
                    id: filteredElements[0].id,
                    role: filteredElements[0].getAttribute("role"),
                    ariaLabel: filteredElements[0].ariaLabel
                },
                parentElement: {
                    isTarget: true,
                    tagName: filteredElements[1].tagName.toLowerCase(),
                    id: filteredElements[1].id,
                    role: filteredElements[1].getAttribute("role"),
                    ariaLabel: filteredElements[1].ariaLabel
                },
                elemPath: elemPath.toLowerCase(),
                elemPathAll: elemPathAll.toLowerCase()
            });
    } else if (filteredElements.length === 1) {
        // There is a Main target element only
        ipcRenderer.sendToHost(
            "DOMDataFromWebViewToViewer",
            {
                coordinates: {
                    x: event.clientX,
                    y: event.clientY
                },
                mainElement: {
                    isTarget: true,
                    tagName: filteredElements[0].tagName.toLowerCase(),
                    id: filteredElements[0].id,
                    role: filteredElements[0].getAttribute("role"),
                    ariaLabel: filteredElements[0].ariaLabel
                },
                parentElement: {
                    isTarget: false,
                    tagName: null,
                    id: null,
                    role: null,
                    ariaLabel: null
                },
                elemPath: elemPath.toLowerCase(),
                elemPathAll: elemPathAll.toLowerCase()
            });
    } else {
        // There is No target element, so send info about non-filtered elements (if exist)
        if (elements.length >= 2) {
            ipcRenderer.sendToHost(
                "DOMDataFromWebViewToViewer",
                {
                    coordinates: {
                        x: event.clientX,
                        y: event.clientY
                    },
                    mainElement: {
                        isTarget: false,
                        tagName: elements[0].tagName.toLowerCase(),
                        id: elements[0].id,
                        role: elements[0].getAttribute("role"),
                        ariaLabel: elements[0].ariaLabel
                    },
                    parentElement: {
                        isTarget: false,
                        tagName: elements[1].tagName.toLowerCase(),
                        id: elements[1].id,
                        role: elements[1].getAttribute("role"),
                        ariaLabel: elements[1].ariaLabel
                    },
                    elemPath: elemPath.toLowerCase(),
                    elemPathAll: elemPathAll.toLowerCase()
                });
        } else if (elements.length === 1) {
            ipcRenderer.sendToHost(
                "DOMDataFromWebViewToViewer",
                {
                    coordinates: {
                        x: event.clientX,
                        y: event.clientY
                    },
                    mainElement: {
                        isTarget: false,
                        tagName: elements[0].tagName.toLowerCase(),
                        id: elements[0].id,
                        role: elements[0].getAttribute("role"),
                        ariaLabel: elements[0].ariaLabel
                    },
                    parentElement: {
                        isTarget: false,
                        tagName: null,
                        id: null,
                        role: null,
                        ariaLabel: null
                    },
                    elemPath: elemPath,
                    elemPathAll: elemPathAll
                });
        } else {
            ipcRenderer.sendToHost(
                "DOMDataFromWebViewToViewer",
                {
                    coordinates: {
                        x: event.clientX,
                        y: event.clientY
                    },
                    mainElement: {
                        isTarget: false,
                        tagName: null,
                        id: null,
                        role: null,
                        ariaLabel: null
                    },
                    parentElement: {
                        isTarget: false,
                        tagName: null,
                        id: null,
                        role: null,
                        ariaLabel: null
                    },
                    elemPath: elemPath.toLowerCase(),
                    elemPathAll: elemPathAll.toLowerCase()
                });
        }
    }
}));
