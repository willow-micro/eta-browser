// -*- coding: utf-8-unix -*-
// Electron desktopCapturer's wrapper with Node.js EventEmitter

// System
// Actually this is Unsafe, requires to make nodeIntegration true.
const { desktopCapturer } = require('electron');
const { EventEmitter } = require("events");

// User


class Capturer extends EventEmitter {
    constructor(bitRate = 2500000, timeslice = NaN) {
        super();

        // Variables for Desktop Capturing
        this.mediaRecorder = null;

        // Callbacks for DesktopCapturer
        //// Retrieve getUserMedia stream
        this.handleCaptureStream = (captureStream) => {
            // Initialize MediaRecorder
            this.mediaRecorder = new MediaRecorder(captureStream, {
                mimeType: 'video/webm',
                videoBitsPerSecond: bitRate
            });
            // Get data chunks
            // [getUserMedia] -> stream -> [MediaRecorder] -> Blob -> ArrayBuffer -> Uint8Array -> [IPC] -> Buffer -> [WriteStream(fs)]
            this.mediaRecorder.ondataavailable = (event) => {
                // Convert to ArrayBuffer from Blob
                event.data.arrayBuffer().then(arrayBuffer => {
                    // Convert to Uint8Array from ArrayBuffer
                    const uint8Array = new Uint8Array(arrayBuffer);
                    this.emit("available", uint8Array);
                });
            };
            // When capturing stops
            this.mediaRecorder.onstop = (event) => {
                // Attension: ondataavailable is automatically called after stop() called
                // Close mediaRecorder
                this.mediaRecorder = null;
                this.emit("stop", null);
            };
            // Start MediaRecorder
            if (Number.isInteger(timeslice)) {
                this.mediaRecorder.start(timeslice); // Specify timeslice[ms]
            } else {
                this.mediaRecorder.start();
            }
            this.emit("start", null);
        };
        //// Error handling
        this.handleCaptureStreamError = (error) => {
            this.emit("error", error);
        };
    }

    // Start / Stop Capturing Method
    // Start Desktop Capturing
    startForWindow(targetTitle, minWidth, maxWidth, minHeight, maxHeight){
        desktopCapturer.getSources({ types: ['window'] }).then(async sources => {
            for (const source of sources) {
                if (source.name === targetTitle) {
                    navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: source.id,
                                minWidth: minWidth,
                                maxWidth: maxWidth,
                                minHeight: minHeight,
                                maxHeight: maxHeight
                            }
                        }
                    })
                        .then((stream) => { this.handleCaptureStream(stream) })
                        .catch((error) => { this.handleCaptureStreamError(error) });
                }
            }
        });
    }

    startForScreen(screenIndex, minWidth, maxWidth, minHeight, maxHeight){
        desktopCapturer.getSources({ types: ['screen'] }).then(async sources => {
            navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: sources[screenIndex].id,
                        minWidth: minWidth,
                        maxWidth: maxWidth,
                        minHeight: minHeight,
                        maxHeight: maxHeight
                    }
                }
            })
                .then((stream) => { this.handleCaptureStream(stream) })
                .catch((error) => { this.handleCaptureStreamError(error) });
        });
    }

    // Stop Desktop Capturing
    stop(){
        this.mediaRecorder.stop();
        this.mediaRecorder = null;
    }
}

export default Capturer;
