// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/*
 * This module configures the ui5loader in the way that ushell needs.
 */
(function () {
    "use strict";

    var ui5loader = window.sap && window.sap.ui && window.sap.ui.loader;

    if (!ui5loader) {
        throw new Error("FLP bootstrap: ui5loader is needed, but could not be found");
    }

    var oConfig = {
        // async: false | true could be set here to control the loading behavior.
        // By not setting the loading mode here we let the decision to UI5.
        // This also enables that one can via the URL parameter sap-ui-async=[true|false] switch async loading on/off for testing purposes.
    },
        oScript = document.getElementById("sap-ui-bootstrap"),
        oScriptUrl = oScript && oScript.getAttribute("src"),
        rUrlWithTokenPattern = /^((?:.*\/)?resources\/~\d{14}~\/)/,
        sBaseUrl;

    if (oScriptUrl && rUrlWithTokenPattern.test(oScriptUrl)) {
        // Because ui5loader calculate the default resource url without token we neeed to set the root path explicitly with token
        // Example of the token: ~20180802034800~
        sBaseUrl = rUrlWithTokenPattern.exec(oScriptUrl)[1];
        window["sap-ui-config"] = window["sap-ui-config"] || {};
        window["sap-ui-config"].resourceRoots = window["sap-ui-config"].resourceRoots || {};
        window["sap-ui-config"].resourceRoots[""] = sBaseUrl;
    }

    ui5loader.config(oConfig);
}());
