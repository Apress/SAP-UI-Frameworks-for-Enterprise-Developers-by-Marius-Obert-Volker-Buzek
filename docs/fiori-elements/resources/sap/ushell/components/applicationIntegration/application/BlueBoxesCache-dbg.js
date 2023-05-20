// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/thirdparty/URI",
    "sap/base/Log"
], function (URI, Log) {
    "use strict";

    var oCacheStorage = {};

    function init () {
        oCacheStorage = {};
    }

    function getSize () {
        return Object.keys(oCacheStorage).length;
    }

    function add (sUrl, oIframe) {
        var sKey = getBlueBoxCacheKey(sUrl);
        oCacheStorage[sKey] = oIframe;
    }

    function remove (sUrl) {
        var sKey = getBlueBoxCacheKey(sUrl);
        if (oCacheStorage[sKey]) {
            delete oCacheStorage[sKey];
        }
    }

    function get (sUrl) {
        if (sUrl === undefined || getSize() === 0) {
            return undefined;
        }
        var sKey = getBlueBoxCacheKey(sUrl);

        return (sKey !== undefined ? oCacheStorage[sKey] : undefined);
    }

    function getById (sId) {
        for (var sKey in oCacheStorage) {
            if (oCacheStorage.hasOwnProperty(sKey)) {
                var oEntry = oCacheStorage[sKey];

                if (oEntry.sId === sId) {
                    return oEntry;
                }
            }
        }

        return undefined;
    }

    function getBlueBoxCacheKey (sUrl) {
        var oUri,
            sOrigin,
            oParams,
            sIframeHint = "",
            sUI5Version = "",
            sKeepAlive = "",
            sTestUniqueId = "",
            sBlueBoxCacheKey;

        //special cases
        if (sUrl === undefined || sUrl === "" || sUrl === "../") {
            return sUrl;
        }

        try {
            oUri = new URI(sUrl);
            if (sUrl.charAt(0) === "/") {
                sOrigin = window.location.origin;
            } else {
                sOrigin = oUri.origin();
            }
            if (sOrigin === undefined || sOrigin === "") {
                sOrigin = oUri.path();
                if (sOrigin === undefined || sOrigin === "") {
                    sOrigin = sUrl;
                }
            }
            oParams = oUri.query(true);
            if (oParams["sap-iframe-hint"]) {
                sIframeHint = "@" + oParams["sap-iframe-hint"];
            }
            if (oParams["sap-ui-version"]) {
                sUI5Version = "@" + oParams["sap-ui-version"];
            }
            if ((sIframeHint === "@GUI" || sIframeHint === "@WDA" || sIframeHint === "@WCF") && oParams["sap-keep-alive"]) {
                sKeepAlive = "@" + oParams["sap-keep-alive"] + "-" + sUrl.split("#")[0];
            }
            if (oParams["sap-testcflp-iframeid"]) {
                sTestUniqueId = "@" + oParams["sap-testcflp-iframeid"];
            }
        } catch (ex) {
            Log.error(
                "URL '" + sUrl + "' can not be parsed: " + ex,
                "sap.ushell.components.applicationIntegration.application.BlueBoxHandler"
            );
            sOrigin = sUrl;
        }

        sBlueBoxCacheKey = sOrigin + sIframeHint + sUI5Version + sKeepAlive + sTestUniqueId;

        return sBlueBoxCacheKey;
    }

    return {
        init: init,
        getSize: getSize,
        add: add,
        remove: remove,
        get: get,
        getById: getById,
        getBlueBoxCacheKey: getBlueBoxCacheKey
    };
}, /* bExport= */ false);
