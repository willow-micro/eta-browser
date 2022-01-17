// System
import React, { useCallback, useState, useRef, useEffect } from 'react';
// User
import Capturer from '../../Capturer.js';


// Use callback ref instread of useEffect and useRef normally
// Because useEffect does not work with ref changes properly
// See (official): https://ja.reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
// See: https://medium.com/@teh_builder/ref-objects-inside-useeffect-hooks-eb7c15198780
function useHookWithRefCallback() {
    // "ref" is in the useHookWithRefCallback function object
    // So you can specify cleanup processes
    const ref = useRef(null);
    // Callback ref
    const setRef = useCallback((node) => {
        if (ref.current) {
            // Make sure to cleanup any events/references added to the last instance
            ref.current.removeEventListener("ipc-message", null);
        }

        if (node) {
            // Check if a node is actually passed. Otherwise node would be null.
            // You can now do what you need to, addEventListeners, measure, etc.
            node.addEventListener("ipc-message", (event) => {
                switch (event.channel) {
                    case "DOMDataFromWebViewToViewer":
                        window.viewerIPCSend("DOMDataFromViewerToMain", event.args[0]);
                        break;
                    default:
                        console.log("ch: " + event.channel + ", args: " + event.args);
                }
            });
        }

        // Save a reference to the node
        ref.current = node
    }, []);

    return [ ref, setRef ];
}


// Sub Component
const WebView = React.forwardRef((props, ref) => {
    if (props.url === "") {
        return (null);
    } else {
        // Attension: Preload attribute needs absolute path on the development computer
        return (
            <webview preload="file:///Users/noka/Workspace/Node/eta-browser/src/ViewerWindow/components/views/WebView/DomAnalyzer.js"
                     ref={ ref }
                     src={ props.url }
                     style={ { height: '100%', width: '100%' } }
                     nodeintegration="true"
                     nodeintegrationinsubframes="true" />
        );
    }
});

// Main Component
const MainView = () => {
    // Configs (read only)
    let configs = null;

    // Create capturer
    const capturer = new Capturer(2000000, 1000);   // bit rate [bps], data retrieve timeslice [ms]
    capturer.on("start", () => {
        window.viewerIPCSend("AppMessage", {
            message: "キャプチャを開始しました",
            type: "info"
        });
    });
    capturer.on("available", (data) => {
        // Send a buffer
        window.viewerIPCSend("CaptureDataChunkFromViewerToMain", {
            uint8Array: data
        });
    });
    capturer.on("error", (error) => {
        window.viewerIPCSend("AppMessage", {
            message: "キャプチャを開始できません",
            type: "error"
        });
    });
    capturer.on("stop", () => {
        window.viewerIPCSend("CaptureEndedInViewer", {});
    });


    // React Hooks useState
    const [viewerDestinationURL, setViewerDestinationURL] = useState("");


    // React Hooks useRef
    const [webViewRefObj, webViewRef] = useHookWithRefCallback();


    // IPC Receive Callbacks
    const onInitializeViewerFromMain = (event, arg) => {
        setViewerDestinationURL(arg.url);
        configs = arg.configs;
    };
    const onOpenDevTools = (event, arg) => {
        if (webViewRefObj.current && !webViewRefObj.current.isDevToolsOpened()) {
            webViewRefObj.current.openDevTools();
        }
    };
    const onEyeDataFromMainToViewer = (event, arg) => {
        if (webViewRefObj.current) {
            webViewRefObj.current.send("EyeDataFromViewerToWebView", arg);
        }
    };
    const onStartAnalysis = (event, arg) => {
        if (webViewRefObj.current && configs) {
            webViewRefObj.current.send("InitializeWebViewFromViewer", {
                configs: configs
            });
            console.log("Start Analysis");
            console.log(configs);
            capturer.start("ETA Browser (Viewer)", 800, 2560, 600, 1600);   // title, min width, max width, min height, max height
        }
    };
    const onStopAnalysis = (event, arg) => {
        console.log("Stop Analysis");
        capturer.stop();
    };


    // React Hooks useEffect
    //// IPC Effect
    useEffect(() => {
        // IPC Receive (from Main) Create Listener
        window.viewerIPCOn("InitializeViewerFromMain", onInitializeViewerFromMain);
        window.viewerIPCOn("OpenDevTools", onOpenDevTools);
        window.viewerIPCOn("EyeDataFromMainToViewer", onEyeDataFromMainToViewer);
        window.viewerIPCOn("StartAnalysis", onStartAnalysis);
        window.viewerIPCOn("StopAnalysis", onStopAnalysis);
        // Cleanup
        return () => {
            // IPC Receive (from Main) Remove Listener
            window.viewerIPCRemove("InitializeViewerFromMain", onInitializeViewerFromMain);
            window.viewerIPCRemove("OpenDevTools", onOpenDevTools);
            window.viewerIPCRemove("EyeDataFromMainToViewer", onEyeDataFromMainToViewer);
            window.viewerIPCRemove("StartAnalysis", onStartAnalysis);
            window.viewerIPCRemove("StopAnalysis", onStopAnalysis);
            // Stop the capturer
            capturer.stop();
        };
    }, []);


    // JSX
    return (
        <WebView url={ viewerDestinationURL } ref={ webViewRef } />
    );
};


export default MainView;
