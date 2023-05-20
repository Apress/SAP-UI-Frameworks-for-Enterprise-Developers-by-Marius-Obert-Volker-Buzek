// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define(function () {
    "use strict";

    var History = function () {
        this._history = [];
        this.backwards = false;
        this._historyPosition = -1;
        this._virtual = {};
    };

    History.prototype.hashChange = function (newHash/*, oldHash*/) {
        var historyIndex = this._history.indexOf(newHash);

        // new history entry
        if (historyIndex === -1) {
            // new item and there where x back navigations before - remove all the forward items from the history
            if (this._historyPosition + 1 < this._history.length) {
                this._history = this._history.slice(0, this._historyPosition + 1);
            }

            this._history.push(newHash);

            this._historyPosition += 1;
            this.backwards = false;
            this.forwards = false;
        } else {
            // internalNavigation
            this.backwards = this._historyPosition > historyIndex;
            this.forwards = this._historyPosition < historyIndex;

            this._historyPosition = historyIndex;
        }
    };

    History.prototype.pop = function () {
        var sLastHistory;
        if (this._history.length > 0) {
            sLastHistory = this._history.pop();
            this._historyPosition--;
        }
        return sLastHistory;
    };

    History.prototype.isVirtualHashchange = function (newHash, oldHash) {
        // the old hash was flagged as virtual
        return this._virtual.hasOwnProperty(oldHash) &&
            // the new Hash is the current One
            this.getCurrentHash() === newHash &&
            // the history has forward entries
            this._history.length - 1 > this._historyPosition &&
            // the old hash was the hash in the forward history direction
            this._history[this._historyPosition + 1] === oldHash;
    };

    History.prototype.setVirtualNavigation = function (hash) {
        this._virtual[hash] = true;
    };

    History.prototype.getCurrentHash = function () {
        return this._history[this._historyPosition] || null;
    };

    History.prototype.getHashIndex = function (hash) {
        return this._history.indexOf(hash);
    };

    History.prototype.getHistoryLength = function () {
        return this._history.length;
    };

    return History;
}, /* bExport= */ true);
