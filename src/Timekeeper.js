// -*- coding: utf-8-unix -*-
// Utilities for Measuring time, etc.

// System

// User

class Timekeeper {
    constructor() {
        // Variables
        this.startTime = null;
    }

    // Start
    startCounting() {
        this.startTime = Date.now();
    }

    // Stop
    stopCounting() {
        this.startTime = null;
    }

    // Get Elapsed Time (ms)
    getElapsedTime() {
        if (this.startTime === null) {
            throw "Timekeeper.getElapsedTime() was called, but it is not started."
            return NaN;
        } else {
            return Date.now() - this.startTime;
        }
    }

    // Get Elapsed Time (s)
    getElapsedTimeSec() {
        if (this.startTime === null) {
            throw "Timekeeper.getElapsedTimeSec() was called, but it is not started."
            return NaN;
        } else {
            return Math.floor((Date.now() - this.startTime) / 1000);
        }
    }
}

module.exports = Timekeeper;
