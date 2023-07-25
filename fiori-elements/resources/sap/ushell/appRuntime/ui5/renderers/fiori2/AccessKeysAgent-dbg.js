// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/appRuntime/ui5/AppRuntimeService"
], function (AppRuntimeService) {
    "use strict";

    var AccessKeysAgent = function () {
        this.init = function () {
            document.addEventListener("keydown", function (oEvent) {
                var bDelegate = false,
                    postBody;

                if (oEvent.altKey && !oEvent.ctrlKey && !oEvent.shiftKey) {
                    if (oEvent.keyCode === 65 || // ALT + A
                        oEvent.keyCode === 70 || // ALT + F
                        oEvent.keyCode === 72 || // ALT + H
                        oEvent.keyCode === 77 || // ALT + M
                        oEvent.keyCode === 78 || // ALT + N
                        oEvent.keyCode === 83) { // ALT + S
                        bDelegate = true;
                    }
                } else if (oEvent.ctrlKey && !oEvent.altKey && !oEvent.shiftKey) {
                    if (oEvent.keyCode === 188 || // CTRL + COMMA
                        oEvent.keyCode === 112 || // CTRL + F1
                        oEvent.keyCode === 83) {  // CTRL + S
                        bDelegate = true;
                    }
                } else if (oEvent.ctrlKey && oEvent.shiftKey && !oEvent.altKey) {
                    if (oEvent.keyCode === 70) {  // CTRL + SHIFT + F
                        bDelegate = true;
                    }
                }

                if (bDelegate) {
                    postBody = {
                        altKey: oEvent.altKey,
                        ctrlKey: oEvent.ctrlKey,
                        shiftKey: oEvent.shiftKey,
                        keyCode: oEvent.keyCode,
                        key: oEvent.key
                    };
                    if (oEvent.keyCode === 188) {
                        postBody.key = ",";
                    }

                    AppRuntimeService.sendMessageToOuterShell(
                        "sap.ushell.services.ShellUIService.processHotKey",
                        postBody);
                }
            }.bind(this), true);
        };
    };

    return new AccessKeysAgent();
}, /* bExport= */ true);
