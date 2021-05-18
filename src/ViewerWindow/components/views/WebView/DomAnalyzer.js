// -*- coding: utf-8-unix -*-
// <webview> Preload Script inside the viewer window
//
// Analyze DOM Tree inside the webview
//
// Unsafe IPC because of no ContextBridge:
// "contextIsolation: false"
// for <webview> tag

console.log("webview opened.");
