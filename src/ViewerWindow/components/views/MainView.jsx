// System
import React, { useCallback, useState, useRef } from 'react';
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
                    case "SendDOMDataFromWebViewToViewer":
                        console.log(event.args[0].coordinates.x + ", " + event.args[0].coordinates.y);
                        console.log(event.args[0].tagName);
                        console.log(event.args[0].id);
                        console.log(event.args[0].role);
                        console.log(event.args[0].ariaLabel);

                        window.viewerIPCSend(
                            "SendDOMDataFromViewerToMain",
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
        // Attension: Preload attribute needs absolute path
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
    const [viewerUrl, setViewerUrl] = useState("");

    // useRef
    const [webViewRefObj, webViewRef] = useHookWithRefCallback();

    // useEffect


    // IPC Message Rx (from Main)
    window.viewerIPCOn("ViewerURL", (event, arg) => {
        console.log(arg.url);
        setViewerUrl(arg.url);
    });
    window.viewerIPCOn("OpenDevTools", (event, arg) => {
        console.log("OpenDevTools");
        if (webViewRefObj.current && !webViewRefObj.current.isDevToolsOpened()) {
            webViewRefObj.current.openDevTools();
        }
    });
    window.viewerIPCOn("SendDataFromViewerToWebView", (event, arg) => {
        console.log("Data for webview: " + arg.data);
        if (webViewRefObj.current) {
            webViewRefObj.current.send(
                "SendDataFromViewerToWebView",
                {
                    data: arg.data
                }
            );
        }
    });
    window.viewerIPCOn("Start", (event, arg) => {
        console.log("Start");
        capturer.start();
    });
    window.viewerIPCOn("Stop", (event, arg) => {
        console.log("Stop");
        capturer.stop();
    });

    // JSX
    return (
        <WebView url={ viewerUrl } ref={ webViewRef } />
    );
};


// Function Componentは，宣言とは別途exportする必要がある．
// 同時にexportすると，正しくトランスパイルされない．これは通常のconst定数も同様かと思われる
export default MainView;
