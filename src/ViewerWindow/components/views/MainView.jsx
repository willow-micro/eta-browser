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
            ref.current.removeEventListener("ipc-message");
        }

        if (node) {
            // Check if a node is actually passed. Otherwise node would be null.
            // You can now do what you need to, addEventListeners, measure, etc.
            node.addEventListener("ipc-message", (event) => {
                switch (event.channel) {
                    case "DOMDataFromWebViewToViewer":
                        /* console.log(event.args[0].mainElement.coordinates.x + ", " + event.args[0].mainElement.coordinates.y);
                         * console.log(event.args[0].mainElement.tagName);
                         * console.log(event.args[0].mainElement.id);
                         * console.log(event.args[0].mainElement.role);
                         * console.log(event.args[0].mainElement.ariaLabel); */

                        window.viewerIPCSend(
                            "DOMDataFromViewerToMain",
                            event.args[0]
                        );
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
            <webview preload="file:///Users/kawa/Wakayama/2021/HCDLab/electron/eta-browser/src/ViewerWindow/components/views/WebView/DomAnalyzer.js"
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

    const capturer = new Capturer("ETA Browser (Viewer)", "SaveBufferToFile");

    // useState
    const [viewerDestinationURL, setViewerDestinationURL] = useState("");

    // useRef
    const [webViewRefObj, webViewRef] = useHookWithRefCallback();

    // IPC Receive Callbacks
    const onViewerDestinationURL = (event, arg) => {
        setViewerDestinationURL(arg.url);
    };
    const onOpenDevTools = (event, arg) => {
        if (webViewRefObj.current && !webViewRefObj.current.isDevToolsOpened()) {
            webViewRefObj.current.openDevTools();
        }
    };
    const onGazeDataFromMainToViewer = (event, arg) => {
        if (webViewRefObj.current) {
            webViewRefObj.current.send(
                "GazeDataFromViewerToWebView",
                arg
            );
        }
    };
    const onStartAnalysis = (event, arg) => {
        console.log("Start Analysis");
        //capturer.start();
    };
    const onStopAnalysis = (event, arg) => {
        console.log("Stop Analysis");
        //capturer.stop();
    };

    // useEffect
    useEffect(() => {
        // IPC Receive (from Main) Create Listener
        window.viewerIPCOn("ViewerDestinationURL", onViewerDestinationURL);
        window.viewerIPCOn("OpenDevTools", onOpenDevTools);
        window.viewerIPCOn("GazeDataFromMainToViewer", onGazeDataFromMainToViewer);
        window.viewerIPCOn("StartAnalysis", onStartAnalysis);
        window.viewerIPCOn("StopAnalysis", onStopAnalysis);
        // Cleanup
        return () => {
            // IPC Receive (from Main) Remove Listener
            window.viewerIPCRemove("ViewerDestinationURL", onViewerDestinationURL);
            window.viewerIPCRemove("OpenDevTools", onOpenDevTools);
            window.viewerIPCRemove("GazeDataFromMainToViewer", onGazeDataFromMainToViewer);
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


// Function Componentは，宣言とは別途exportする必要がある．
// 同時にexportすると，正しくトランスパイルされない．これは通常のconst定数も同様かと思われる
export default MainView;
