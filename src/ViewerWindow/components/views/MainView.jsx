// System
import React, { useCallback, useState, useRef, useEffect } from 'react';
const fs = require('fs');
const { desktopCapturer } = require('electron');
// User


// Objects for Desktop Capturing
let streamRecorder = null;
let recordedChunks = [];

const handleCaptureStream = (captureStream) => {
    console.log("handleCaptureStream");
    streamRecorder = new MediaRecorder(captureStream);
    streamRecorder.ondataavailable = (event) => {
        recordedChunks.push(event.data);
    };
    streamRecorder.onstop = (event) => {
        // Create Blob
        const captureBlob = new Blob(recordedChunks, {type: 'video/webm'});
        recordedChunks = [];
        // Setup FileReader
        const fileReader = new FileReader();
        fileReader.onload = () => {
            // Create Buffer from Binary
            const binary = fileReader.result;
            let binaryArray = new Uint8Array(binary);
            let buffer = new Buffer(binary.byteLength);
            for (let i = 0; i < binaryArray.byteLength; i = (i+1)|0) { // Optimized for V8 Engine
                buffer[i] = binaryArray[i];
            }
            // Write File
            const filename = "./test.webm";
            fs.writeFile(filename, buffer, (error) => {
                if (error) {
                    console.log("Error in save desktopCapture");
                    console.log(error);
                    // Send App Message
                    window.viewerIPCSend(
                        "AppMessage",
                        {
                            message: "キャプチャを保存できません",
                            type: "error"
                        }
                    );
                } else {
                    // Success
                    console.log("Successfully Saved a Captured Video");
                    // Send App Message
                    window.viewerIPCSend(
                        // Channel name
                        "AppMessage",
                        // Data
                        {
                            message: "キャプチャを保存しました",
                            type: "success"
                        }
                    );
                }
            });
        };
        // Execute FileReader
        fileReader.readAsArrayBuffer(captureBlob);
        // Close streamRecorder
        streamRecorder = null;
    };
    streamRecorder.start();
};

const handleCaptureStreamError = (error) => {
    console.log("Error in start desktopCapture");
    console.log(error);
    // Send App Message
    window.viewerIPCSend(
        // Channel name
        "AppMessage",
        // Data
        {
            message: "キャプチャを開始できません",
            type: "error"
        }
    );
};


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
        // Start Desktop Capturing
        desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
            for (const source of sources) {
                if (source.name === "ETA Browser (Viewer)") {
                    navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: source.id,
                                minWidth: 1024,
                                maxWidth: 2560,
                                minHeight: 720,
                                maxHeight: 1600
                            }
                        }
                    }).then((stream) => { handleCaptureStream(stream) })
                             .catch((error) => { handleCaptureStreamError(error) });
                }
            }
        });
    });
    window.viewerIPCOn("Stop", (event, arg) => {
        console.log("Stop");
        // Stop Desktop Capturing
        streamRecorder.stop();
        streamRecorder = null;
    });

    // JSX
    return (
        <WebView url={viewerUrl} ref={webViewEl} />
    );
};


// Function Componentは，宣言とは別途exportする必要がある．
// 同時にexportすると，正しくトランスパイルされない．これは通常のconst定数も同様かと思われる
export default MainView;
