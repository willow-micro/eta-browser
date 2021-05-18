// System
import React, { useState, useRef, useEffect } from 'react';
// User


// Sub Component
const WebView = React.forwardRef((props, ref) => {
    return (
        <React.Fragment>
          {/* WebView */}
          {
              ( props.url !== "" ) && <webview ref={ref}
                                               src={props.url}
                                               preload="file://./WebView/DomAnalyzer.js"
                                               style={{ height: '100%', width: '100%' }} />
          }
        </React.Fragment>
    )
});

// Main Component
const MainView = () => {

    // useState
    const [viewerUrl, setViewerUrl] = useState("");

    // useRef
    const webViewEl = useRef(null);

    // useEffect
    useEffect(() => {
    });


    // IPC Message Rx (from Main)
    window.viewerIPCOn("ViewerURL", (event, arg) => {
        console.log(arg.url);
        setViewerUrl(arg.url);
    });
    window.viewerIPCOn("OpenDevTools", (event, arg) => {
        console.log("OpenDevTools");
        if (viewerUrl !== "") {
            webViewEl.current.openDevTools();
        }
    });


    // JSX
    return (
        <WebView url={viewerUrl} ref={webViewEl} />
    );
};


// Function Componentは，宣言とは別途exportする必要がある．
// 同時にexportすると，正しくトランスパイルされない．これは通常のconst定数も同様かと思われる
export default MainView;
