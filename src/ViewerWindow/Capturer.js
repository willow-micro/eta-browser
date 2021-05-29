// -*- coding: utf-8-unix -*-
// Utilities for Desktop Capturing, for ViewerWindow

// System
// This is Unsafe, requires to make nodeIntegration true.
const fs = require('fs');
const { desktopCapturer } = require('electron');

// User

class Capturer {
    constructor(windowTitle) {
        // Variables for Desktop Capturing
        this.targetWindowTitle = windowTitle;
        this.streamRecorder = null;
        this.recordedChunks = [];

        // Callbacks for DesktopCapturer
        this.handleCaptureStream = (captureStream) => {
            this.streamRecorder = new MediaRecorder(captureStream);
            this.streamRecorder.ondataavailable = (event) => {
                this.recordedChunks.push(event.data);
            };
            this.streamRecorder.onstop = (event) => {
                // Create Blob
                const captureBlob = new Blob(this.recordedChunks, {type: 'video/webm'});
                this.recordedChunks = [];
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
                this.streamRecorder = null;
            };
            this.streamRecorder.start();
            // Send App Message
            window.viewerIPCSend(
                // Channel name
                "AppMessage",
                // Data
                {
                    message: "キャプチャを開始しました",
                    type: "success"
                }
            );
        };

        this.handleCaptureStreamError = (error) => {
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
    }

    // Start / Stop Capturing Method
    // Start Desktop Capturing
    start(){
        desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
            for (const source of sources) {
                if (source.name === this.targetWindowTitle) {
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
                    }).then((stream) => { this.handleCaptureStream(stream) })
                        .catch((error) => { this.handleCaptureStreamError(error) });
                }
            }
        });
    }

    // Stop Desktop Capturing
    stop(){
        this.streamRecorder.stop();
        this.streamRecorder = null;
    }
}

export default Capturer;
