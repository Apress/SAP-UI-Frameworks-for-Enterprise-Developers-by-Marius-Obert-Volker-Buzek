// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/*
 * This module provides a function for loading and execute the bootstrap extension.
 */
sap.ui.define([
    "sap/base/util/ObjectPath"
], function (ObjectPath) {
    "use strict";

    function loadBootstrapExtension (oUShellConfig) {

        var sPath = ObjectPath.get("bootstrap.extensionModule", oUShellConfig);
        if (!sPath || typeof sPath !== "string") {
            return;
        }
        sPath = sPath.replace(/\./g, "/");
        sap.ui.require([sPath], function (oExtensionModule) {
            if (oExtensionModule && typeof oExtensionModule === "function") {
                oExtensionModule();
            }
        });
    }
    return loadBootstrapExtension;
});
