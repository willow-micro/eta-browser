// System
import React, { useState, useEffect } from 'react';
// User

// Main Component
const MainView = () => {

    // useState
    const [viewerUrl, setViewerUrl] = useState("");


    // useEffect


    // IPC Message Rx (from Main)
    window.viewerIPCOn("ViewerURL", (event, arg) => {
        console.log(arg.url);
        setViewerUrl(arg.url);
    });


    // JSX
    return (
        <React.Fragment>
          {/* WebView */}
          {( viewerUrl !== "" ) && <webview src={viewerUrl} style={{ height: '100%', width: '100%' }} />}
        </React.Fragment>
    );
};


// Function Componentは，宣言とは別途exportする必要がある．
// 同時にexportすると，正しくトランスパイルされない．これは通常のconst定数も同様かと思われる
export default MainView;
