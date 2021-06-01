// System
import React, { useCallback, useState, useRef, useEffect } from 'react';
// User
import Capturer from '../../Capturer.js';

// Sub Component
const WebView = React.forwardRef((props, ref) => {
    return (
        <React.Fragment>
          {/* WebView */}
          {/* See: Preload attribute needs absolute path */}
          {
              ( props.url !== "" ) && <webview preload="file:///Users/kawa/Wakayama/2021/HCDLab/electron/eta-browser/src/ViewerWindow/components/views/WebView/DomAnalyzer.js"
                                               ref={ref}
                                               src={props.url}
                                               style={{ height: '100%', width: '100%' }}
                                               nodeintegration="true"
                                               nodeintegrationinsubframes="true" />
          }
        </React.Fragment>
    )
});


// Main Component
const MainView = () => {

    const capturer = new Capturer("ETA Browser (Viewer)", "SaveBufferToFile");

    // useState
    const [viewerUrl, setViewerUrl] = useState("");

    // useRef
    const webViewEl = useRef(null);

    // useEffect
    useEffect(() => {
        if (webViewEl && webViewEl.current) {
            webViewEl.current.addEventListener("ipc-message", (event) => {
                switch (event.channel) {
                    case "SendDOMDataFromWebViewToViewer":
                        console.log(event.args[0].coordinates.x + ", " + event.args[0].coordinates.y);
                        console.log(event.args[0].type);
                        console.log(event.args[0].id);
                        console.log(event.args[0].className);
                        console.log(event.args[0].content);
                        console.log(event.args[0].role);
                        console.log(event.args[0].ariaLabel);

                        window.viewerIPCSend(
                            "SendDOMDataFromViewerToMain",
                            //event.args[0]
                            {
                                type: event.args[0].type,
                                id: event.args[0].id,
                                className: event.args[0].className,
                                role: event.args[0].role,
                                ariaLabel: event.args[0].ariaLabel
                            }
                        );
                        break;
                    default:
                        console.log("ch: " + event.channel + ", args: " + event.args);
                }
            });

            return () => {
                webViewEl.current.removeEventListener("ipc-message");
            }
        }
    });


    // IPC Message Rx (from Main)
    window.viewerIPCOn("ViewerURL", (event, arg) => {
        console.log(arg.url);
        setViewerUrl(arg.url);
    });
    window.viewerIPCOn("OpenDevTools", (event, arg) => {
        console.log("OpenDevTools");
        if (webViewEl && webViewEl.current && !webViewEl.current.isDevToolsOpened()) {
            webViewEl.current.openDevTools();
        }
    });
    window.viewerIPCOn("SendDataFromViewerToWebView", (event, arg) => {
        console.log("Data for webview: " + arg.data);
        if (webViewEl && webViewEl.current) {
            webViewEl.current.send(
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
        <WebView url={viewerUrl} ref={webViewEl} />
    );
};


// Function Componentは，宣言とは別途exportする必要がある．
// 同時にexportすると，正しくトランスパイルされない．これは通常のconst定数も同様かと思われる
export default MainView;
