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

let configs = null;

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMAnalyzer was loaded.");
    //// IPC Receive (from Main) Create Listener
    ipcRenderer.on("InitializeWebViewFromViewer", (event, arg) => {
        configs = arg.configs;
        console.log(configs);
    });
    ipcRenderer.on("GazeDataFromViewerToWebView", (event, arg) => {
        console.log("Received Gaze Data");
        console.log(arg);
        const dataCount = arg.length;
        const xPathList = arg.map(data => {
            const viewerX = data.x - window.screenX;
            const viewerY = data.y - window.screenY;
            const element = document.elementsFromPoint(viewerX, viewerY)[0];
            if (element != null && element != undefined) {
                return getXPath(element);
            } else {
                return "";
            }
        });
        console.log(xPathList);
        const majorityXPath = getMajorityElement(xPathList);
        const majorityDataIndex = xPathList.indexOf(majorityXPath);
        console.log("Majority: " + majorityDataIndex + " (" + majorityXPath + ")");

        // If configs are available, send dom data
        if (configs && majorityXPath !== "") {
            const targetViewerX = arg[majorityDataIndex].x - window.screenX;
            const targetViewerY = arg[majorityDataIndex].y - window.screenY;
            sendDomDataAt(targetViewerX, targetViewerY);
        }
    });
});

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
function sendDomDataAt(xPos, yPos) {
    // Get Elements (Array): Deeper Elements First
    const elements = document.elementsFromPoint(xPos, yPos);

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
        leafSideElementData = [];
        for (let i = 0; i < configs.adoptRange.leaf; i++) {
            // If the index is overflow
            if (i >= filteredElements.length) {
                break;
            }
            let elementData = {};
            // tagName
            if (configs.elementDataCollection.tagName) {
                elementData["tagName"] = filteredElements[i].tagName.toLowerCase();
            }
            // Attributes
            for (let j = 0; j < configs.elementDataCollection.attributes.length; j++) {
                elementData[configs.elementDataCollection.attributes[j]] = filteredElements[i].getAttribute(configs.elementDataCollection.attributes[j]);
            }
            leafSideElementData.push(elementData);
        }
    }
    // Root Side Elements from Filtered Elements
    let rootSideElementData = null;
    if (configs.adoptRange.root > 0) {
        rootSideElementData = [];
        for (let i = 0; i < configs.adoptRange.root; i++) {
            // If the index is overflow
            if (i >= filteredElements.length) {
                break;
            }
            let elementData = {};
            // tagName
            if (configs.elementDataCollection.tagName) {
                elementData["tagName"] = filteredElements[filteredElements.length - 1 - i].tagName.toLowerCase();
            }
            // Attributes
            for (let j = 0; j < configs.elementDataCollection.attributes.length; j++) {
                elementData[configs.elementDataCollection.attributes[j]] = filteredElements[filteredElements.length - 1 - i].getAttribute(configs.elementDataCollection.attributes[j]);
            }
            rootSideElementData.push(elementData);
        }
    }

    console.log(leafSideElementData[0]["tagName"]);

    // Send DOM Data
    ipcRenderer.sendToHost("DOMDataFromWebViewToViewer", {
        coordinates: coordinates,
        elemOverlapAll: elemOverlapAll,
        elemOverlapFiltered: elemOverlapFiltered,
        leafSideElementData: leafSideElementData,
        rootSideElementData: rootSideElementData
    });
}

// Mousemove event
// Debounce with 150ms
// document.addEventListener('mousemove', debounce(150, false, (event) => {
//     accessDom(event.clientX, event.clientY);
// }));
