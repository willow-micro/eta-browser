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
const getXPath = require('get-xpath');
const WSEventID = require('./WSEventID.js');

let configs = null;
let isWaitingForFixationEnded = false;

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMAnalyzer was loaded.");
    //// IPC Receive (from Main) Create Listener
    ipcRenderer.on("InitializeWebViewFromViewer", (event, arg) => {
        configs = arg.configs;
        console.log(configs);
        isWaitingForFixationEnded = false;
    });
    ipcRenderer.on("EyeDataFromViewerToWebView", (event, arg) => {
        console.log("Received Eye Data. EventID: " + arg.id);

        const eventID = arg.id;
        const dataCount = arg.n;

        switch (eventID) {
        case WSEventID.FixationStarted: {
            console.log("FixationStarted");
            console.log(arg.data);
            var elementXPathList = new Array(dataCount);
            for (var i = 0; i < dataCount; i++) {
                const element = getSingleElementAt(arg.data[i].x, arg.data[i].y);
                if (element == null) {
                    return;
                }
                elementXPathList[i] = getXPath(element);
            }
            const majorityXPath = getMajorityElement(elementXPathList);
            const majorityIndex = elementXPathList.indexOf(majorityXPath);
            console.log("majority: " + majorityIndex + " (" + majorityXPath + ")");
            if (configs && majorityXPath !== "") {
                sendDomDataAt(eventID, arg.data[majorityIndex].x, arg.data[majorityIndex].y, arg.data[majorityIndex].time);
                isWaitingForFixationEnded = true;
            }
            break;
        }
        case WSEventID.FixationEnded: {
            console.log("FixationEnded");
            if (configs && isWaitingForFixationEnded) {
                sendDomDataAt(eventID, arg.data[0].x, arg.data[0].y, arg.data[0].time);
                isWaitingForFixationEnded = false;
            }
            break;
        }
        case WSEventID.LFHFComputed: {
            console.log("LFHFComputed");
            break;
        }
        default: {
            break;
        }
        }
    });
});

// Get the deepest element at specified position if exist
function getSingleElementAt(xPos, yPos) {
    // const viewerX = xPos - window.screenX;
    // const viewerY = yPos - window.screenY;
    const viewerX = xPos - (window.screen.width / 4);
    const viewerY = yPos - (window.screen.height / 4);
    const element = document.elementsFromPoint(viewerX, viewerY)[0];
    if (element == null || element == undefined) {
        return null;
    }
    return element;
}

// Get the majority element from an array
// Using Boyer–Moore majority vote algorithm
function getMajorityElement(list) {
    let candidate = null;
    let count = 0;
    list.forEach((element, index) => {
        if (count === 0) {
            candidate = element;
        }
        if (element === candidate) {
            count++;
        } else {
            count--;
        }
    });
    return candidate;
}

// Get DOM data and Send it
function sendDomDataAt(eventID, xPos, yPos, serverTime) {
    // const viewerX = xPos - window.screenX;
    // const viewerY = yPos - window.screenY;
    const viewerX = xPos - (window.screen.width / 4);
    const viewerY = yPos - (window.screen.height / 4);

    // Get Elements (Array): Deeper Elements First
    const elements = document.elementsFromPoint(viewerX, viewerY);

    // Filtering Elements with configs
    const filteredElements = elements.filter(element => {
        // TagName is matched
        if (configs.filterTagNames.includes(element.tagName.toLowerCase())) {
            return true;
        }
        // Has specified attributes
        for (let i = 0; i < configs.filterAttributes.length; i++) {
            if (element.hasAttribute(configs.filterAttributes[i])) {
                return true;
            }
        }
        return false;
    });

    // Coordinates
    let coordinates = null;
    if (configs.generalDataCollection.coordinates) {
        coordinates = {
            x: xPos,
            y: yPos
        };
    }
    // Element Overlap (All)
    let elemOverlapAll = null;
    if (configs.generalDataCollection.overlapAll) {
        elemOverlapAll = "";
        for (var i = 0; i < elements.length; i++) {
            elemOverlapAll += elements[i].tagName.toLowerCase();
            if (i < elements.length - 1) {
                elemOverlapAll += " < ";
            }
        }
    }
    // Element Overlap (Filtered)
    let elemOverlapFiltered = null;
    if (configs.generalDataCollection.overlapFiltered) {
        elemOverlapFiltered = ""
        if (filteredElements.length > 0) {
            for (var i = 0; i < filteredElements.length; i++) {
                elemOverlapFiltered += filteredElements[i].tagName.toLowerCase();
                if (i < filteredElements.length - 1) {
                    elemOverlapFiltered += " < ";
                }
            }
        }
    }
    // Leaf Side Elements from Filtered Elements
    let leafSideElementData = null;
    if (configs.adoptRange.leaf > 0) {
        leafSideElementData = new Array(configs.adoptRange.leaf);
        for (let i = 0; i < configs.adoptRange.leaf; i++) {
            let elementData = {};
            // tagName
            if (configs.elementDataCollection.tagName) {
                if (i < filteredElements.length) {
                    elementData["tagName"] = filteredElements[i].tagName.toLowerCase();
                } else {
                    elementData["tagName"] = "";
                }
            }
            // Attributes
            for (let j = 0; j < configs.elementDataCollection.attributes.length; j++) {
                if (i < filteredElements.length) {
                    elementData[configs.elementDataCollection.attributes[j]] = filteredElements[i].getAttribute(configs.elementDataCollection.attributes[j]);
                } else {
                    elementData[configs.elementDataCollection.attributes[j]] = "";
                }
            }
            leafSideElementData[i] = elementData;
        }
    }
    // Root Side Elements from Filtered Elements
    let rootSideElementData = null;
    if (configs.adoptRange.root > 0) {
        rootSideElementData = new Array(configs.adoptRange.root);
        for (let i = 0; i < configs.adoptRange.root; i++) {
            let elementData = {};
            // tagName
            if (configs.elementDataCollection.tagName) {
                if (i < filteredElements.length) {
                    elementData["tagName"] = filteredElements[filteredElements.length - 1 - i].tagName.toLowerCase();
                } else {
                    elementData["tagName"] = "";
                }
            }
            // Attributes
            for (let j = 0; j < configs.elementDataCollection.attributes.length; j++) {
                if (i < filteredElements.length) {
                    elementData[configs.elementDataCollection.attributes[j]] = filteredElements[filteredElements.length - 1 - i].getAttribute(configs.elementDataCollection.attributes[j]);
                } else {
                    elementData[configs.elementDataCollection.attributes[j]] = "";
                }
            }
            rootSideElementData[i] = elementData;
        }
    }

    // Send DOM Data
    ipcRenderer.sendToHost("DOMDataFromWebViewToViewer", {
        eventID: eventID,
        coordinates: coordinates,
        elemOverlapAll: elemOverlapAll,
        elemOverlapFiltered: elemOverlapFiltered,
        leafSideElementData: leafSideElementData,
        rootSideElementData: rootSideElementData,
        serverTime: serverTime
    });
}

// Mousemove event
// Debounce with 150ms
// document.addEventListener('mousemove', debounce(150, false, (event) => {
//     accessDom(event.clientX, event.clientY);
// }));
