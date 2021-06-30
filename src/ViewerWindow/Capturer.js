// -*- coding: utf-8-unix -*-
// Utilities for Desktop Capturing, for ViewerWindow

// System
// This is Unsafe, requires to make nodeIntegration true.
const { desktopCapturer } = require('electron');

// User

class Capturer {
    constructor(bitRate, windowTitle, blobReceiveChannel) {
        // Variables for Desktop Capturing
        this.targetWindowTitle = windowTitle;
        this.blobReceiveChannel = blobReceiveChannel;
        this.mediaRecorder = null;
        this.bitRate = bitRate;

        // Callbacks for DesktopCapturer
        //// Retrieve getUserMedia stream
        this.handleCaptureStream = (captureStream) => {
            // Initialize MediaRecorder
            this.mediaRecorder = new MediaRecorder(captureStream, {
                mimeType: 'video/webm',
                videoBitsPerSecond: this.bitRate
            });

            // Get blob chunks
            this.mediaRecorder.ondataavailable = (event) => {
                const blobChunk = event.data;
                // Create Blob (a part of)
                //const blob = new Blob(arg.blobChunk, { type: 'video/webm' });

                // Convert to ArrayBuffer from Blob
                blobChunk.arrayBuffer().then(arrayBuffer => {
                    // Convert to Uint8Array from ArrayBuffer
                    const uint8Array = new Uint8Array(arrayBuffer);
                    // Send a buffer
                    window.viewerIPCSend(this.blobReceiveChannel, {
                        uint8Array: uint8Array
                    });
                });
            };

            // When capturing stops
            this.mediaRecorder.onstop = (event) => {
                // Attension: ondataavailable is automatically called after stop() called
                // Close mediaRecorder
                this.mediaRecorder = null;
            };

            // Start MediaRecorder
            this.mediaRecorder.start(1000); // Blob chunks timeslice: 1000[ms]

            // Send App Message
            window.viewerIPCSend("AppMessage", {
                message: "キャプチャを開始しました",
                type: "success"
            });
        };

        //// Error handling
        this.handleCaptureStreamError = (error) => {
            console.log(error);
            // Send App Message
            window.viewerIPCSend("AppMessage", {
                message: "キャプチャを開始できません",
                type: "error"
            });
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
                    })
                        .then((stream) => { this.handleCaptureStream(stream) })
                        .catch((error) => { this.handleCaptureStreamError(error) });
                }
            }
        });
    }

    // Stop Desktop Capturing
    stop(){
        this.mediaRecorder.stop();
        this.mediaRecorder = null;
    }
}

export default Capturer;
