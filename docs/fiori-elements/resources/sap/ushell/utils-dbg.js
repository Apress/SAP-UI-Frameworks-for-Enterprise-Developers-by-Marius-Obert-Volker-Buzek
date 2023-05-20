// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file This file contains miscellaneous utility functions.
 * They are for exclusive use within the unified shell unless otherwise noted.
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/ObjectPath",
    "sap/base/util/uid",
    "sap/base/util/UriParameters",
    "sap/ui/Device",
    "sap/ui/thirdparty/jquery",
    "sap/ui/thirdparty/URI",
    "sap/ushell/utils/clone",
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/utils/objectOperations",
    "sap/ushell/utils/type",
    "sap/ui/core/Configuration"
    //"sap/ushell/resources" --> cannot be declared here currently: utils is used very early - before core boot, but resources uses UI5 core.
], function (
    Log,
    ObjectPath,
    UI5Uid,
    UriParameters,
    Device,
    jQuery,
    URI,
    ushellClone,
    urlParsing,
    ushellObjectOperations,
    ushellType,
    Configuration
) {
    "use strict";

    var utils = {};

    utils.isArray = ushellType.isArray;
    utils.isPlainObject = ushellType.isPlainObject;
    utils.isDefined = ushellType.isDefined;
    utils.clone = ushellClone;

    utils.getMember = ushellObjectOperations.getMember;
    utils.updateProperties = ushellObjectOperations.updateProperties;
    utils.getNestedObjectProperty = ushellObjectOperations.getNestedObjectProperty;

    /**
     * Removes duplicated items from the actions array.
     *
     * @param {string[]} aActions List of actions.
     * @returns {string[]} Filtered list of unique actions in case of array or the same object otherwise.
     * @private
     */
    utils.removeDuplicatedActions = function (aActions) {
        if (Array.isArray(aActions)) {
            var aFilteredActions = aActions.reduce(function (aResult, sItem) {
                if (aResult.indexOf(sItem) < 0) {
                    aResult.push(sItem);
                }
                return aResult;
            }, []);
            return aFilteredActions;
        }
        return aActions;
    };

    /**
     * Stores sap system data into local storage.
     *
     * @param {object} oSapSystemData The SAP system data.
     * @param {string} [sSapSystemSrc] The SAP system src.
     */
    utils.storeSapSystemData = function (oSapSystemData, sSapSystemSrc) {
        var sKey,
            oLocalStorage,
            sStringifiedSapSystemData,
            aSystemIds = [oSapSystemData.id];

        if (arguments.length > 1) {
            aSystemIds.unshift(sSapSystemSrc);
        }

        try {
            sStringifiedSapSystemData = JSON.stringify(oSapSystemData);
        } catch (e) {
            Log.error("Cannot stringify and store expanded system data: " + e);
        }

        if (sStringifiedSapSystemData) {
            oLocalStorage = utils.getLocalStorage();

            sKey = utils.generateLocalStorageKey("sap-system-data", aSystemIds);
            oLocalStorage.setItem(sKey, sStringifiedSapSystemData);
        }
    };

    /**
     * Returns the ID and client of the local system in sid format.
     *
     * @returns {string} The local system/client in sid format, e.g. "sid(UR3.120)".
     * @private
     */
    utils.getLocalSystemInSidFormat = function () {
        var oSystem = sap.ushell.Container.getLogonSystem(),
            sSystemName = oSystem.getName(),
            sSystemClient = oSystem.getClient();

        return "sid(" + sSystemName + "." + sSystemClient + ")";
    };

    /**
     * Checks whether the given system is in sid format and matches the local system.
     *
     * @param {string} sSidOrName The sid or name representation of the system alias.
     * @return {boolean} Whether the given system is in sid format and matches the local system.
     * @private
     */
    utils.matchesLocalSid = function (sSidOrName) {
        return utils.getLocalSystemInSidFormat().toLowerCase() === sSidOrName.toLowerCase();
    };

    /**
     * Stores SAP system data into local storage.
     *
     * @param {object} oArgs Might contain the SAP system data ("sap-system") and/or the the SAP system src ("sap-system-src").
     */
    utils.storeSapSystemToLocalStorage = function (oArgs) {
        var oParams = (oArgs || {}).params;

        if (!oParams || !oParams.hasOwnProperty("sap-system")) {
            return;
        }

        if (utils.isPlainObject(oParams["sap-system"])) {
            var oSapSystemData = oParams["sap-system"],
                sSapSystemSrc = oParams["sap-system-src"];

            if (typeof sSapSystemSrc === "string") {
                utils.storeSapSystemData(oSapSystemData, sSapSystemSrc);
                oParams["sap-system-src"] = sSapSystemSrc;
            } else {
                utils.storeSapSystemData(oSapSystemData);
            }

            oParams["sap-system"] = oSapSystemData.id;
        } else if (utils.matchesLocalSid(oParams["sap-system"])) {
            delete oParams["sap-system"];
        }
    };

    /**
     * Allows to safely set a performance mark via native "window.performance" browser API and evaluated by performance test tools.
     *
     * @param {string} sMarkName Name of the performance mark.
     * @param {object} oConfigMarks A configuration object to select the correct mark in case of several measurements for the same ID.
     * @param {boolean} oConfigMarks.bUseUniqueMark Whether to use only one measurement per mark.
     * @param {boolean} oConfigMarks.bUseLastMark Only used if "bUseUniqueMArk" is true.
     *   If true, use the _last_ measurement for a given mark; if falsy, use the first.
     */
    utils.setPerformanceMark = function (sMarkName, oConfigMarks) {
        if (performance && performance.mark) {
            // check if the config object exists and create an empty one if not the case
            if (!oConfigMarks) {
                oConfigMarks = {};
            }
            if (oConfigMarks.bUseUniqueMark) {
                if (oConfigMarks.bUseLastMark) {
                    // use only the new mark, erase any old ones
                    performance.clearMarks(sMarkName);
                } else if (performance.getEntriesByName(sMarkName, "mark").length > 0) {
                    // if a mark exists, ignore subsequent measurements
                    return;
                }
            }
            performance.mark(sMarkName);
        }
    };

    /**
     * Allows to safely set a performance measure via native "window.performance" browser API and evaluated by performance test tools.
     *
     * @param {string} sMeasureName Name of the performance measure.
     * @param {string} sStartingMark Name of the performance mark that starts the measure.
     * @param {string} sEndMark Name of the performance mark that ends the measure.
     */
    utils.setPerformanceMeasure = function (sMeasureName, sStartingMark, sEndMark) {
        if (performance && performance.measure && sStartingMark && sEndMark) {
            performance.measure(sMeasureName, sStartingMark, sEndMark);
        }
    };

    /**
     * Creates an <code>Error</code> object and logs the error message immediately.
     * Class representing an error that is written to the log.
     *
     * @param {string} sMessage The error message.
     * @param {string} [sComponent] The error component to log.
     * @class
     * @private
     * @since 1.15.0
     */
    utils.Error = function (sMessage, sComponent) {
        this.name = "sap.ushell.utils.Error";
        this.message = sMessage;
        Log.error(sMessage, null, sComponent);
    };

    utils.Error.prototype = new Error();

    /**
     * Wrapper for "localStorage.setItem()" including exception handling caused by exceeding storage quota limits
     * or exception is always thrown (safari private browsing mode).
     *
     * @param {string} sKey The key for the storage entry.
     * @param {string} sValue The value for the storage entry.
     * @param {boolean} [bLocalEvent=false] When true, the storage event is also fired for the source window.
     * @since 1.21.2
     * @private
     */
    utils.localStorageSetItem = function (sKey, sValue, bLocalEvent) {
        var oEvent;
        try {
            localStorage.setItem(sKey, sValue);
            if (bLocalEvent) {
                oEvent = document.createEvent("StorageEvent");
                // events are fired only if "setItem()" works
                // to decouple this (for eventing to the same window), provide a wrapper for "localStorage.getItem()" and ".removeItem()"
                oEvent.initStorageEvent("storage", false, false, sKey, "", sValue, "", localStorage);
                dispatchEvent(oEvent);
            }
        } catch (e) {
            Log.warning("Error calling localStorage.setItem(): " + e, null, "sap.ushell.utils");
        }
    };

    /**
     * Getter for <code>localStorage</code> to facilitate testing.
     *
     * @returns {Storage} The local storage instance.
     * @private
     * @since 1.34.0
     */
    utils.getLocalStorage = function () {
        return window.localStorage;
    };

    /**
     * Calls window.localStorage.getItem with sKey as key.
     *
     * @param {string} sKey Key to read the value from local storage.
     * @returns {String} Value from the localStorage.
     * @private
     * @since 1.58.0
     */
    utils.getLocalStorageItem = function (sKey) {
        return window.localStorage.getItem(sKey);
    };

    /**
     * Returns a unique ID based on "sap/base/util/uid".
     *
     * @param {function|object[]} vTestCondition An array of all existing IDs or a function that checks if the new generated ID is unique.
     *   In case of an array, "generateUniqueId" will generate new IDs until it finds a unique one.
     *   In case of a function, it will be called with every generated ID;
     *   the function shall check if the generated ID is unique and shall return true in that case.
     * @returns {string} A unique ID which passed the "fnCheckId" test.
     * @private
     * @since 1.42.0
     */
    utils.generateUniqueId = function (vTestCondition) {
        var sUniqueId,
            aExistingIds,
            fnIsUniqueId;

        if (Array.isArray(vTestCondition)) {
            aExistingIds = vTestCondition;

            fnIsUniqueId = function (sGeneratedId) {
                return aExistingIds.indexOf(sGeneratedId) === -1;
            };
        } else {
            fnIsUniqueId = vTestCondition;
        }

        do {
            sUniqueId = utils._getUid();
        } while (!fnIsUniqueId(sUniqueId)); // accepts falsy values

        return sUniqueId;
    };

    /**
     * Use to generate the uid based on the "sap/base/utils/uid".
     *
     * @returns {string} Generated uid.
     * @private
     */
    utils._getUid = function () {
        return UI5Uid();
    };

    /**
     * No redirect happens for a demo platform logout, but a reload is made to ensure the progress indicator is gone.
     * Used e.g. in ContainerAdapter as part of the local platform.
     *
     * @private
     * @since 1.34.0
     */
    utils.reload = function () {
        location.reload();
    };

    /**
     * Given a link tag (HTML "a") or a window object, calculates the origin (protocol, host, port)
     * especially for cases where the ".origin" property is not present on the DOM Member (IE11).
     *
     * @param {object} oDomObject A location bearing object, e.g. a link-tag DOMObject or a window.
     * @returns {string} The "protocol://host:port". The port might be absent.
     *   Examples: "http://www.sap.com:8080" or "https://uefa.fifa.com".
     * @private
     */
    utils.calculateOrigin = function (oDomObject) {
        var oURI;
        if (oDomObject.origin) {
            return oDomObject.origin;
        }
        if (oDomObject.protocol && oDomObject.hostname) {
            return oDomObject.protocol + "//" + oDomObject.hostname + (oDomObject.port ? ":" + oDomObject.port : "");
        }
        if (oDomObject.href) {
            oURI = new URI(oDomObject.href);
            // beware, URI does not treat ":" as part of the protocol
            return oURI.protocol() + "://" + oURI.hostname() + (oURI.port() ? ":" + oURI.port() : "");
        }
        return undefined;
    };

    /**
     * Exposes a private "epcm" object used for the NWBC for Desktop integration.
     *
     * @return {object} A native browser object.
     * @private
     */
    utils.getPrivateEpcm = function () {
        if (window.external && window.external && typeof window.external.getPrivateEpcm !== "undefined") {
            return window.external.getPrivateEpcm();
        }
        return undefined;
    };

    /**
     * Detects whether the browser can open WebGui applications natively.
     *
     * This is expected to happen from NWBC Version 6 onwards.
     *
     * NWBC exposes a feature bit vector via the "getNwbcFeatureBits" method of the private "epcm" object.
     * This is expected to be a string in hex format representing 4 bits,
     * where the least significant bit represents native navigation capability.
     *
     * For example: "B" = 1011, last bit is 1, therefore native navigation capability is enabled.
     *
     * @return {boolean} Whether the browser can open SapGui applications natively.
     */
    utils.hasNativeNavigationCapability = function () {
        return utils.isFeatureBitEnabled(1);
    };

    /**
     * Determine the shell type considering NWBC
     * Version 6.0+ client case.
     *
     * @return {string}
     *   the shell type ("NWBC" or "FLP"), based on whether NWBC v6.0+
     *   Client is detected.
     */
    utils.getShellType = function () {
        return utils.isFeatureBitEnabled(1) ? "NWBC" : "FLP";
    };

    /**
     * Detects whether NWBC can logout natively.
     *
     * NWBC exposes a feature bit vector via the "getNwbcFeatureBits" method of the private "epcm" object.
     * This is expected to be a string in hex format representing 4 bits,
     * where the second least significant bit represents native logout capability.
     *
     * For example: "B" = 1011, second last bit is 1, therefore native logout capability is enabled.
     *
     * @return {boolean} Whether the browser can logout natively.
     */
    utils.hasNativeLogoutCapability = function () {
        return utils.isFeatureBitEnabled(2);
    };

    /**
     * Detects whether NWBC can accept the navigation mode parameter.
     *
     * NWBC exposes a feature bit vector via the "getNwbcFeatureBits" method of the private "epcm" object.
     * This is expected to be a string in hex format representing 4 bits,
     * where the second most significant bit represents the capability to accept the navigation mode parameter.
     *
     * For example: "B" = 1011, the second most significant is 0,
     * therefore the capability to accept the navigation mode parameter is not enabled.
     *
     * @return {boolean} Whether NWBC can accept the navigation mode parameter.
     */
    utils.hasNavigationModeCapability = function () {
        return utils.isFeatureBitEnabled(4);
    };

    /**
     * Detects whether NWBC can be notified that the Container and its services are ready to be used.
     *
     * NWBC exposes a feature bit vector via the "getNwbcFeatureBits" method of the private "epcm" object.
     * This is expected to be a string in hex format representing 4 bits,
     * where the most significant bit represents the FLP ready notification capability.
     *
     * For example: "B" = 1011, the most significant bit is 1, therefore the FLP ready notification capability is enabled.
     *
     * @return {boolean} Whether NWBC can be notified that the Container and its services are ready to be used.
     */
    utils.hasFLPReadyNotificationCapability = function () {
        return utils.isFeatureBitEnabled(8);
    };

    /**
     * Detects whether NWBC can be notified that the Container and its services are ready to be used
     * and NWBC also supports the using of FLP interface for calling some FLP apis exposed to it via interface.
     *
     * NWBC exposes a feature bit vector via the "getNwbcFeatureBits" method of the private "epcm" object.
     * This is expected to be a string in hex format representing 4 bits,
     * where the most significant bit represents the FLP ready notification capability.
     *
     * For example: "B" = 1011, the most significant bit is 1, therefore the FLP ready notification capability is enabled.
     *
     * @return {boolean} Whether NWBC can be notified that the Container and its services are ready to be used.
     */
    utils.hasFLPReady2NotificationCapability = function () {
        return utils.isFeatureBitEnabled(16);
    };

    /**
     * Determines whether a certain NWBC feature is enabled using the NWBC feature bit vector.
     *
     * @param {number} iFeatureBit The position of the feature bit to check, starting from the rightmost bit of the NWBC feature bit vector.
     * @return {boolean} Whether the feature bit is enabled or not.
     */
    utils.isFeatureBitEnabled = function (iFeatureBit) {
        var sFeaturesHex = "0",
            oPrivateEpcm;

        // try to get the feature version number
        oPrivateEpcm = utils.getPrivateEpcm();
        if (oPrivateEpcm) {
            try {
                sFeaturesHex = oPrivateEpcm.getNwbcFeatureBits();
                Log.debug("Detected epcm getNwbcFeatureBits returned feature bits: " + sFeaturesHex);
            } catch (e) {
                Log.error("failed to get feature bit vector via call getNwbcFeatureBits on private epcm object", e.stack, "sap.ushell.utils");
            }
        }
        return (parseInt(sFeaturesHex, 16) & iFeatureBit) > 0;
    };

    /**
     * Determines whether the given application type is to be embedded in an iframe (like gui or WDA applications).
     *
     * @param {string} sApplicationType The type of the application.
     * @returns {boolean} Whether the ApplicationType is to be rendered embedded into an iframe
     *   and should be able to communicate via postMessage like GUI or WDA applications.
     * @private
     */
    utils.isApplicationTypeEmbeddedInIframe = function (sApplicationType) {
        return sApplicationType === "NWBC" || sApplicationType === "TR" || sApplicationType === "WCF";
    };

    /**
     * Appends a "sap-shell" parameter to the given URL to indicate the FLP version to legacy applications.
     * This method should be called only when it is necessary to add the sap-shell parameter to the URL.
     *
     * @param {string} sUrl The URL to be amended.
     * @param {string} sApplicationType The application type for the given URL.
     * @return {string} The URL where the parameter should be appended to.
     * @private
     */
    utils.appendSapShellParam = function (sUrl, sApplicationType) {
        var sUrlSuffix = sApplicationType === "TR"
            ? ""
            : "-NWBC",
            sVersion = utils.getUi5Version();
        if (sVersion) {
            // we pass it either completely or not at all
            sUrl += sUrl.indexOf("?") >= 0 ? "&" : "?"; // FIXME: This is a bug.
            sUrl += "sap-shell=" + encodeURIComponent("FLP" + sVersion + sUrlSuffix);
        }
        return sUrl;
    };

    function _extractUi5Version (sVersion) {
        var oMatch = /\d+\.\d+\.\d+/.exec(sVersion);
        if (oMatch && oMatch[0]) {
            return oMatch[0];
        }
        return undefined;
    }

    utils.getUi5VersionAsync = function () {
        return new Promise(function (resolve, reject) {
            sap.ui.require(["sap/ui/VersionInfo"], function (VersionInfo) {
                VersionInfo.load().then(
                    function (oVersionInfo) {
                        resolve(_extractUi5Version(oVersionInfo.version));
                    }).catch(function () {
                        Log.error("sap ui version could not be determined, using Configuration.getVersion() (core version) as fallback");
                        resolve(_extractUi5Version(Configuration.getVersion()));
                    });
            });
        });
    };

    utils.getUi5Version = function () {
        var sVersion;

        try { // in the sandbox localhost scenario, "sap.ui.getVersionInfo()" triggers an exception
            sVersion = sap.ui.getVersionInfo().version;
        } catch (e) {
            Log.error("sap ui version could not be determined, using Configuration.getVersion() (core version) as fallback " + e);
            sVersion = Configuration.getVersion();
        }

        return _extractUi5Version(sVersion);
    };

    /**
     * Determines whether the input "oResolvedNavigationTarget" represents a WebGui application that can be navigated natively by the browser.
     *
     * @param {object} oResolvedNavigationTarget The resolution result. Contains at least the "applicationType" property.
     * @returns {boolean} true if the resolution result represents a response which is to be treated by the Fiori Desktop client.
     * @private
     */
    utils.isNativeWebGuiNavigation = function (oResolvedNavigationTarget) {
        var sApplicationType = ObjectPath.get("applicationType", oResolvedNavigationTarget);
        var bNativeNWBCNavigation = ObjectPath.get("appCapabilities.nativeNWBCNavigation", oResolvedNavigationTarget);

        if (this.hasNativeNavigationCapability() && (sApplicationType === "TR" || bNativeNWBCNavigation)) {
            return true;
        }
        return false;
    };

    /**
     * A mapping from arbitrary string (!) keys (including "get" or "hasOwnProperty") to values of any type.
     * Creates an empty map.
     *
     * @class
     * @since 1.15.0
     */
    utils.Map = function () {
        this.entries = {};
    };

    /**
     * Associates the specified value with the specified key in this map.
     * If the map previously contained a mapping for the key, the old value is replaced by the specified value.
     * Returns the old value.
     * Note: It might be a good idea to assert that the old value is <code>undefined</code> in case you expect your keys to be unique.
     *
     * @param {string} sKey Key with which the specified value is to be associated.
     * @param {any} vValue Value to be associated with the specified key.
     * @returns {any} The old value.
     * @since 1.15.0
     */
    utils.Map.prototype.put = function (sKey, vValue) {
        var vOldValue = this.get(sKey);
        this.entries[sKey] = vValue;
        return vOldValue;
    };

    /**
     * Returns <tt>true</tt> if this map contains a mapping for the specified key.
     *
     * @param {string} sKey Key whose presence in this map is to be tested
     * @returns {boolean} true if this map contains a mapping for the specified key.
     * @since 1.15.0
     */
    utils.Map.prototype.containsKey = function (sKey) {
        if (typeof sKey !== "string") {
            throw new utils.Error("Not a string key: " + sKey, "sap.ushell.utils.Map");
        }
        return Object.prototype.hasOwnProperty.call(this.entries, sKey);
    };

    /**
     * Returns the value to which the specified key is mapped, or <code>undefined</code> if this map contains no mapping for the key.
     *
     * @param {string} sKey The key whose associated value is to be returned.
     * @returns {any} The value to which the specified key is mapped, or <code>undefined</code> if this map contains no mapping for the key.
     * @since 1.15.0
     */
    utils.Map.prototype.get = function (sKey) {
        if (this.containsKey(sKey)) {
            return this.entries[sKey];
        }
    };

    /**
     * Returns an array of this map's keys. This array is a snapshot of the map;
     * concurrent modifications of the map while iterating do not influence the sequence.
     *
     * @returns {string[]} This map's keys.
     * @since 1.15.0
     */
    utils.Map.prototype.keys = function () {
        return Object.keys(this.entries);
    };

    /**
     * Removes a key together with its value from the map.
     *
     * @param {string} sKey The map's key to be removed.
     * @since 1.17.1
     */
    utils.Map.prototype.remove = function (sKey) {
        delete this.entries[sKey];
    };

    /**
     * Returns this map's string representation.
     *
     * @returns {string} This map's string representation.
     * @since 1.15.0
     */
    utils.Map.prototype.toString = function () {
        var aResult = ["sap.ushell.utils.Map("];
        aResult.push(JSON.stringify(this.entries));
        aResult.push(")");
        return aResult.join("");
    };

    /**
     * Returns the parameter value of a boolean:
     * - "X", "x", "true", and all casing variations are true;
     * - "false", "", and all casing variations are false;
     * - anything else not specified here returns undefined.
     *
     * @param {string} sParameterName The name of the parameter to look for, case sensitive.
     * @param {string} [sParams] Specified parameter (search string). If omitted, search part of current URL is used.
     * @returns {boolean} true, false, or undefined.
     */
    utils.getParameterValueBoolean = function (sParameterName, sParams) {
        var oUriParameters = UriParameters.fromQuery(sParams || window.location.search),
            aArr = oUriParameters.getAll(sParameterName),
            aTruthy = ["true", "x"],
            aFalsy = ["false", ""],
            sValue;
        if (!aArr || aArr.length === 0) {
            return undefined;
        }
        sValue = aArr[0].toLowerCase();
        if (aTruthy.indexOf(sValue) >= 0) {
            return true;
        }
        if (aFalsy.indexOf(sValue) >= 0) {
            return false;
        }
        return undefined;
    };

    /**
     * Calls the given success handler (a)synchronously.
     * Errors thrown in the success handler are caught and the error message is reported to the error handler;
     * if an error stack is available, it is logged.
     *
     * @param {function ()} fnSuccess Success handler.
     * @param {function (string)} [fnFailure] Error handler. Takes an error message. MUST NOT throw any errors itself.
     * @param {boolean} [bAsync=false] Whether the call shall be asynchronous.
     * @since 1.28.0
     */
    utils.call = function (fnSuccess, fnFailure, bAsync) {
        var sMessage;

        if (bAsync) {
            setTimeout(function () {
                utils.call(fnSuccess, fnFailure, false);
            }, 0);
            return;
        }

        try {
            fnSuccess();
        } catch (e) {
            sMessage = e.message || e.toString();
            Log.error("Call to success handler failed: " + sMessage,
                e.stack, // may be undefined: supported in Chrome, FF; not supported in Safari, IE
                "sap.ushell.utils");
            if (fnFailure) {
                fnFailure(sMessage);
            }
        }
    };

    /**
     * Sets Tiles visibility using the Visibility contract, according to the viewport position.
     */
    utils.handleTilesVisibility = function () {
        utils.getVisibleTiles();
    };

    /**
     * Refreshes visible Dynamic Tiles.
     */
    utils.refreshTiles = function () {
        sap.ui.getCore().getEventBus().publish("launchpad", "refreshTiles");
    };

    /**
     * Sets Tiles as not visible using the Visibility contract.
     * The affected tiles are only the visible tiles according to the viewport position.
     * This action happens immediately with no timers or timeouts.
     *
     * This method is currently used upon navigation (i.e. Shell.controller - openApp) as there is logic running in the background
     * such as OData count calls of the dynamic tiles which are still visible at navigation (as no one had marked it otherwise).
     */
    utils.setTilesNoVisibility = function () {
        sap.ui.getCore().getEventBus().publish("launchpad", "setTilesNoVisibility");
    };

    /**
     * Gets a semantic object-action hash and returns only the action part of it.
     *
     * @param {string} hash Shell hash.
     * @returns {string|boolean} The action part of the semantic object-action hash, or false in case of a syntactically wrong hash.
     */
    utils.getBasicHash = function (hash) {
        if (!utils.validHash(hash)) {
            Log.debug("Utils ; getBasicHash ; Got invalid hash");
            return false;
        }

        var oShellHash = urlParsing.parseShellHash(hash);

        return oShellHash ? oShellHash.semanticObject + "-" + oShellHash.action : hash;
    };

    utils.validHash = function (hash) {
        return (hash && hash.constructor === String && hash.trim() !== "");
    };

    /**
     * Gets the device's form factor. Based on <code>sap.ui.Device.system</code> from SAPUI5.
     *
     * @returns {string} The device's form factor ("desktop", "tablet" or "phone").
     * @since 1.25.1
     */
    utils.getFormFactor = function () {
        var oSystem = Device.system;

        if (oSystem.desktop) {
            return oSystem.SYSTEMTYPE.DESKTOP;
        }
        if (oSystem.tablet) {
            return oSystem.SYSTEMTYPE.TABLET;
        }
        if (oSystem.phone) {
            return oSystem.SYSTEMTYPE.PHONE;
        }
        return undefined;
    };

    /**
     * Iterates over all Tiles and mark each one as visible or non-visible according to the viewport position.
     *
     * @returns {object[]} Tile objects, each one including the flag "isDisplayedInViewPort" indicating its visibility.
     */
    utils.getVisibleTiles = function () {
        var nWindowHeight = document.body.clientHeight,
            oControl = sap.ui.getCore().byId("dashboardGroups"),
            oNavContainer = sap.ui.getCore().byId("viewPortContainer"),
            groupsIndex,
            tilesIndex,
            aElementsInd,
            group,
            groupTiles,
            groupLinks,
            oTile,
            tileDomRef,
            tileOffset,
            tileTop,
            tileBottom,
            shellHdrHeight = jQuery("#shell-hdr").height(),
            aTiles = [],
            aGrpDomElement,
            bIsInDashBoard,
            aVisibleTiles = [],
            oEventBus = sap.ui.getCore().getEventBus(),
            aGroups,
            oElementsByType,
            oElements,
            isDisplayedInViewPort;
        // in case of user move to new tab
        if (window.document.hidden) {
            oEventBus.publish("launchpad", "onHiddenTab");
        }

        if (oControl && oControl.getGroups() && oNavContainer) {
            // verify we are in the dashboard page
            aGrpDomElement = jQuery(oControl.getDomRef());
            bIsInDashBoard = aGrpDomElement ? aGrpDomElement.is(":visible") : false;
            aGroups = oControl.getGroups();

            // loop over all Groups
            for (groupsIndex = 0; groupsIndex < aGroups.length; groupsIndex = groupsIndex + 1) {
                group = aGroups[groupsIndex];
                groupTiles = group.getTiles();
                groupLinks = group.getLinks();

                oElementsByType = [groupTiles, groupLinks];
                for (aElementsInd = 0; aElementsInd < oElementsByType.length; aElementsInd++) {
                    oElements = oElementsByType[aElementsInd];

                    if (oElements) {
                        // loop over all Tiles in the current Group
                        for (tilesIndex = 0; tilesIndex < oElements.length; tilesIndex++) {

                            oTile = oElements[tilesIndex];

                            if (!bIsInDashBoard || window.document.hidden) {
                                // if current state is not dashboard ("Home"), set not visible
                                aTiles.push(oTile);
                            } else {
                                tileDomRef = jQuery(oTile.getDomRef());
                                tileOffset = tileDomRef.offset();

                                if (tileOffset) {
                                    tileTop = tileDomRef.offset().top;
                                    tileBottom = tileTop + tileDomRef.height();

                                    // if the Tile is located above or below the viewport
                                    isDisplayedInViewPort = group.getVisible() && (tileBottom > shellHdrHeight - 300) && (tileTop < nWindowHeight + 300);

                                    if (isDisplayedInViewPort) {
                                        aVisibleTiles.push({
                                            oTile: utils.getTileModel(oTile),
                                            iGroup: groupsIndex,
                                            bIsExtanded: !(tileBottom > shellHdrHeight) || !(tileTop < nWindowHeight)
                                        });
                                    } else if (aVisibleTiles.length > 0) {
                                        oEventBus.publish("launchpad", "visibleTilesChanged", aVisibleTiles);
                                        return aTiles;
                                    }
                                    aTiles.push(oTile);
                                }
                            }
                        }
                    }
                }
            }
        }

        if (aVisibleTiles.length > 0) {
            oEventBus.publish("launchpad", "visibleTilesChanged", aVisibleTiles);
        }

        return aTiles;
    };

    utils.getTileModel = function (ui5TileObject) {
        var bindingContext;
        if (ui5TileObject.isA("sap.ui.integration.widgets.Card")) {
            bindingContext = ui5TileObject.getBindingContext("ushellCardModel");
        } else {
            bindingContext = ui5TileObject.getBindingContext();
        }
        return bindingContext.getObject() ? bindingContext.getObject() : null;
    };

    utils.getTileObject = function (ui5TileObject) {
        var bindingContext;
        if (ui5TileObject.isA("sap.ui.integration.widgets.Card")) {
            bindingContext = ui5TileObject.getBindingContext("ushellCardModel");
        } else {
            bindingContext = ui5TileObject.getBindingContext();
        }
        return bindingContext.getObject() ? bindingContext.getObject().object : null;
    };

    utils.recalculateBottomSpace = function () {
        var jqContainer = jQuery("#dashboardGroups").find(".sapUshellTileContainer:visible"),
            lastGroup = jqContainer.last(),
            headerHeight = jQuery(".sapUshellShellHead > header").height(),
            lastGroupHeight = lastGroup.parent().height(),
            groupTitleMarginTop = parseInt(lastGroup.find(".sapUshellContainerTitle").css("margin-top"), 10),
            groupsContainerPaddingBottom = parseInt(jQuery(".sapUshellDashboardGroupsContainer").css("padding-bottom"), 10),
            nBottomSpace;

        if (jqContainer.length === 1) {
            nBottomSpace = 0;
        } else {
            nBottomSpace = jQuery(window).height() - headerHeight - lastGroupHeight - groupTitleMarginTop - groupsContainerPaddingBottom;
            nBottomSpace = (nBottomSpace < 0) ? 0 : nBottomSpace;
        }

        // add margin to the bottom of the screen in order to allow the lower TileContainer (in case it is chosen) to be shown on the top of the viewport
        jQuery(".sapUshellDashboardGroupsContainer").css("margin-bottom", nBottomSpace + "px");
    };

    utils.calcVisibilityModes = function (oGroup, personalization) {
        var bIsVisibleInNormalMode = true,
            bIsVisibleInActionMode = true,
            aLinks = oGroup.pendingLinks && oGroup.pendingLinks.length ? oGroup.pendingLinks : oGroup.links,
            hasVisibleTiles = utils.groupHasVisibleTiles(oGroup.tiles, aLinks);

        if (!hasVisibleTiles && (!personalization || (oGroup.isGroupLocked) || (oGroup.isDefaultGroup) || Device.system.phone || (Device.system.tablet && !Device.system.desktop))) {
            bIsVisibleInNormalMode = false;
        }

        if (!hasVisibleTiles && !personalization) {
            bIsVisibleInActionMode = false;
        }

        return [bIsVisibleInNormalMode, bIsVisibleInActionMode];
    };

    utils.groupHasVisibleTiles = function (groupTiles, groupLinks) {
        var visibleTilesInGroup = false,
            tileIndex,
            tempTile,
            tiles = !groupTiles ? [] : groupTiles,
            links = !groupLinks ? [] : groupLinks;

        tiles = tiles.concat(links);

        if (!tiles.length) {
            return false;
        }

        for (tileIndex = 0; tileIndex < tiles.length; tileIndex = tileIndex + 1) {
            tempTile = tiles[tileIndex];
            // check if the Tile is visible on the relevant device
            if (tempTile.isTileIntentSupported) {
                visibleTilesInGroup = true;
                break;
            }
        }
        return visibleTilesInGroup;
    };

    /**
     * @param {function} fnFunction The function.
     * @param {array} aArguments The arguments.
     * @param {string[]} aArgumentsNames array of the argument names for non-trivial functions with more than one argument
     * @returns {jQuery.Deferred.promise|function} a promise or a function
     */
    utils.invokeUnfoldingArrayArguments = function (fnFunction, aArguments) {
        var that = this,
            aArgArray,
            oDeferred,
            aPromises,
            aRes,
            thePromise;

        if (!Array.isArray(aArguments[0])) {
            return fnFunction.apply(this, aArguments);
        }

        aArgArray = aArguments[0];
        if (aArgArray.length === 0) {
            return new jQuery.Deferred().resolve([]).promise();
        }

        oDeferred = new jQuery.Deferred();
        aPromises = [];
        aRes = [];
        thePromise = new jQuery.Deferred().resolve();

        aArgArray.forEach(function (nThArgs, iIndex) {
            if (!Array.isArray(nThArgs)) {
                var sErrorMsg = "Expected Array as nTh Argument of multivalue invocation: "
                    + "first Argument must be array of array of arguments: single valued f(p1,p2), f(p1_2,p2_2), f(p1_3,p2_3) : "
                    + "multivalued : f([[p1,p2],[p1_2,p2_2],[p1_3,p2_3]]";
                Log.error(sErrorMsg);
                throw new Error(sErrorMsg);
            }
            // nThArgs is an array of the arguments
            var pr = fnFunction.apply(that, nThArgs),
                pr2 = new jQuery.Deferred();

            pr.done(function () {
                var a = Array.prototype.slice.call(arguments);
                aRes[iIndex] = a;
                pr2.resolve();
            }).fail(pr2.reject.bind(pr2));
            aPromises.push(pr2.promise());
            thePromise = jQuery.when(thePromise, pr2);
        });

        jQuery.when.apply(jQuery, aPromises).done(function () {
            oDeferred.resolve(aRes);
        }).fail(function () {
            oDeferred.reject("failure");
        });

        // invoke directly
        return oDeferred.promise();
    };

    utils._getCurrentDate = function () {
        return new Date();
    };

    utils._convertToUTC = function (date) {
        return Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
            date.getUTCMilliseconds()
        );
    };

    /**
     * Formats the date to easy human readable format.
     * Requires the consuming module to require sap/ushell/resources before usage!
     * @param {string} sCreatedAt a stringified date
     * @returns {string} The formatted date e.g. 'Just now' or '10 minutes ago'
     *
     * @private
     */
    utils.formatDate = function (sCreatedAt) {
        var iCreatedAt,
            iNow,
            iTimeGap,
            iDays,
            iHours,
            iMinutes;

        var ushellResources = sap.ui.require("sap/ushell/resources");
        // Module probe might fail. Consumer has to require the module before usage
        if (!ushellResources) {
            throw new Error("sap/ushell/resources was not required before utils.formatDate usage!");
        }

        iCreatedAt = utils._convertToUTC(new Date(sCreatedAt));
        iNow = utils._convertToUTC(utils._getCurrentDate());
        iTimeGap = iNow - iCreatedAt;
        iDays = parseInt(iTimeGap / (1000 * 60 * 60 * 24), 10);
        if (iDays > 0) {
            if (iDays === 1) {
                return ushellResources.i18n.getText("time_day", iDays);
            }
            return ushellResources.i18n.getText("time_days", iDays);
        }
        iHours = parseInt(iTimeGap / (1000 * 60 * 60), 10);
        if (iHours > 0) {
            if (iHours === 1) {
                return ushellResources.i18n.getText("time_hour", iHours);
            }
            return ushellResources.i18n.getText("time_hours", iHours);
        }
        iMinutes = parseInt(iTimeGap / (1000 * 60), 10);
        if (iMinutes > 0) {
            if (iMinutes === 1) {
                return ushellResources.i18n.getText("time_minute", iMinutes);
            }
            return ushellResources.i18n.getText("time_minutes", iMinutes);
        }
        return ushellResources.i18n.getText("just_now");
    };

    /**
     * Navigates to a given set of given arguments using the sap.ushell.services.CrossApplicationNavigation#toExternal functionality.
     *
     * @param {string} semanticObject The semantic object that should be used as navigation target.
     * @param {string} action  The action that should be used as navigation target.
     * @param {object[]} parameters  The parameters that should be used during the navigation.
     * @returns {Promise<void>} A <code>Promise</code> which resolves once the navigation was triggered. The <code>Promise</code> might never reject or resolve
     * when an error occurs during the navigation.
     */
    utils.toExternalWithParameters = function (semanticObject, action, parameters) {
        return Promise.all([
            sap.ushell.Container.getServiceAsync("URLParsing"),
            sap.ushell.Container.getServiceAsync("CrossApplicationNavigation")
        ]).then(function (aResults) {
            var oURLParsingService = aResults[0];
            var oCrossApplicationNavigationService = aResults[1];
            var oNavigationArguments = {};

            // if "&/" is contained in the action, we need to split it into the action and the appSpecificRoute property,
            // so that it can be appended after the very end of the url after the application parameters.
            var aActionParts = action.split("&/");
            if (aActionParts.length > 1) {
                oNavigationArguments.appSpecificRoute = "&/" + aActionParts[1];
            }

            oNavigationArguments.target = {
                semanticObject: semanticObject,
                action: aActionParts[0]
            };

            // building the parameters object to the navigation action
            // preparing the navigation parameters according to the notification's data
            if (parameters && parameters.length > 0) {
                oNavigationArguments.params = {};
                parameters.forEach(function (oParameter) {
                    oNavigationArguments.params[oParameter.Key] = oParameter.Value;
                });
            }

            // navigate
            return oCrossApplicationNavigationService.toExternal({
                target: {
                    shellHash: oURLParsingService.constructShellHash(oNavigationArguments)
                }
            });
        });
    };

    /**
     * Moves an element (specified by the index) inside of an array to a new index.
     *
     * @param {object[]} aArray The elements.
     * @param {int} nSourceIndex The index of the element which needs to be moved.
     * @param {int} nTargetIndex The index where to element should be moved to.
     * @returns {object[]} The resulting elements after the move.
     * @throws "Incorrect input parameters passed" if no array or an empty array is provided.
     * @throws "Index out of bounds" if "nTargetIndex" or "nSourceIndex" are out of bounds in the array.
     * @since 1.39.0
     * @public
     */
    utils.moveElementInsideOfArray = function (aArray, nSourceIndex, nTargetIndex) {
        if (!utils.isArray(aArray) || nSourceIndex === undefined || nTargetIndex === undefined) {
            throw new Error("Incorrect input parameters passed");
        }
        if (nSourceIndex >= aArray.length || nTargetIndex >= aArray.length || nTargetIndex < 0 || nSourceIndex < 0) {
            throw new Error("Index out of bounds");
        }

        var oElement = aArray.splice(nSourceIndex, 1)[0];
        aArray.splice(nTargetIndex, 0, oElement);
        return aArray;
    };

    /**
     * Changes an input target object by assigning each property of one or more objects to it.
     *
     * @param {object} oTarget The base object.
     * @param {...object} oSource One or more source objects to extend the target with.
     * @returns {object} The extended target object.
     * @private
     */
    utils.shallowMergeObject = function (oTarget /*, ...rest */) {
        return Array.prototype.slice.call(arguments, 1, arguments.length)
            .map(function (oSource) {
                return {
                    sourceObject: oSource,
                    properties: Object.keys(oSource)
                };
            })
            .reduce(function (oResult, oSource) {
                oSource.properties.forEach(function (sProperty) {
                    oResult[sProperty] = oSource.sourceObject[sProperty];
                });
                return oResult;
            }, oTarget);
    };

    /**
     * Returns the current location href (URL).
     *
     * @returns {string} The current href.
     * @private
     */
    utils.getLocationHref = function () {
        return window.location.href;
    };

    /**
     * Returns the current location search.
     *
     * @returns {string} The current location search.
     * @private
     */
    utils.getLocationSearch = function () {
        return window.location.search;
    };

    /**
     * Reloads the current location
     * @private
     */
    utils.windowLocationReload = function () {
        window.location.reload(true /*Firefox-specific: Hard reload*/);
    };

    /**
     * Updates the current location
     *
     * @param {string} url The URL to be assigned as location
     * @private
     */
    utils.windowLocationAssign = function (url) {
        window.location.assign(url);
    };


    /**
     * Generates a key to store or retrieve an item from the storage localStorage or sessionStorage).
     * This key allows to reach the information in the local storage starting from the given ids and prefix.
     * This key should not be parsed to detect prefix and ids.
     *
     * @param {string} sPrefix The key prefix. This prefix may contain #, @, $ characters.
     * @param {string[]} aIds A hierarchy of ids that identify the item to be stored or loaded in/from the storage.
     *   At least one item must be provided in this array when calling this method.
     * @returns {string} The storage key.
     * @private
     */
    utils.generateLocalStorageKey = function (sPrefix, aIds) {
        var iNumIds = aIds.length;
        if (iNumIds === 0) {
            throw new Error("At least one id should be provided when generating the local storage key");
        }

        var sSeparator = "$";
        if (iNumIds === 2) {
            sSeparator = "#";
        } else if (iNumIds > 2) {
            sSeparator = "@" + iNumIds + "@";
        }

        return sPrefix + sSeparator + aIds.join(":");
    };

    /**
     * Combines members of a JavaScript object into a parameter string.
     * Parameters are ordered in an arbitrary manner which might change.
     *
     * @param {object} parameters The parameter object, e.g. <code>{ ABC: [1, "1 2"], DEF: ["4"] }</code>.
     * @param {string} delimiter The parameter delimiter. Default is "&".
     * @param {string} assign The parameter assignment. Default is "=".
     * @returns {string} The result parameter string, e.g. <code>ABC=1&ABC=1%202&DEF=4</code>.
     *   The result is *not* prefixed with a "?". Parameter values are URI encoded.
     * @since 1.63.0
     * @private
     */
    utils.urlParametersToString = function (parameters, delimiter, assign) {
        // Implementation was moved to UrlParsing to resolve circular dependency of modules
        return urlParsing.privparamsToString(parameters, delimiter, assign);
    };

    /**
     * Checks whether the given intent is the configured root intent (apart from its parameters).
     * "#Shell-home" should never be hardcoded as it can be configured.
     *
     * @param {string} sIntent The intent to check, e.g. <code>#Employee-display</code>.
     *   The initial hash fragment is ignored during the check.
     *   For example if <code>#Employee-display</code> matches the root intent, also "Employee-display" does.
     * @returns {boolean} Whether the given intent is the root intent.
     * @throws {Error} When a wrong input parameter is given.
     * @private
     */
    utils.isRootIntent = function (sIntent) {
        if (typeof sIntent !== "string") {
            throw new Error("The given intent must be a string");
        }

        // validate configured intent
        var sRootIntentConfigPath = "renderers.fiori2.componentData.config.rootIntent";
        var sConfiguredIntent = ObjectPath.get(sRootIntentConfigPath, window["sap-ushell-config"]) || "#Shell-home";
        var sRootIntentNoHash = sConfiguredIntent.replace("#", "");
        var sIntentNoHash = sIntent.replace("#", "");
        return sIntentNoHash === "" || sIntentNoHash === sRootIntentNoHash;
    };

    /**
     * Checks whether the given intent is FLP homepage intent (classical or spaces/pages).
     *
     * @param {string} [sIntent] The intent to check, e.g. <code>#Employee-display</code>.
     *    If the intent is empty, the current intent is used for checking.
     * @returns {boolean} Whether the given intent is the FLP home intent.
     * @throws {Error} When a wrong input parameter is given.
     * @private
     */
    utils.isFlpHomeIntent = function (sIntent) {
        if (!sIntent) {
            sIntent = window.location.hash;
            if (!sIntent) {
                sIntent = ObjectPath.get("renderers.fiori2.componentData.config.rootIntent", window["sap-ushell-config"]) || "Shell-home";
            }
        } else if (typeof sIntent !== "string") {
            throw new Error("The given intent must be a string");
        }

        // validate configured intent
        var sIntentNoHash = sIntent.replace("#", "");
        return sIntentNoHash.indexOf("Shell-home") === 0 ||
            sIntentNoHash.indexOf("Launchpad-openFLPPage") === 0 ||
            sIntentNoHash.indexOf("Launchpad-openWorkPage") === 0;
    };

    /**
     * Returns a generated key.
     * This key is suitably random, but it is susceptible to brute force attacks.
     * Storages based on the generated key must not be used for sensitive data.
     *
     * @returns {string} 40 character string consisting of A-Z and 0-9 which can be used as a generated key for personalization container.
     *                   Every invocation returns a new key. Seed of random function is OS Random Seed.
     *
     * @private
     * @since 1.94.0
     */
    utils.generateRandomKey = function () {
        var sChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var sResult = "";
        var aRandomValues = new window.Uint32Array(40);

        window.crypto.getRandomValues(aRandomValues);

        var getRandomAlphaNumeric = function (i) {
            var randomIndex = aRandomValues[i] % sChars.length;
            return sChars[randomIndex];
        };

        while (sResult.length < 40) {
            sResult += getRandomAlphaNumeric(sResult.length);
        }

        return sResult;
    };

    /**
     * Copies text to the clipboard
     * @param {string} sText The text to copy
     * @returns {boolean} whether the copy action was successful or not
     *
     * @private
     * @since 1.100.0
     */
    utils.copyToClipboard = function (sText) {
        var bSuccessful;
        var oTemporaryDomElement = document.createElement("textarea");
        try {
            oTemporaryDomElement.contentEditable = true;
            oTemporaryDomElement.readonly = false;
            oTemporaryDomElement.textContent = sText;
            document.documentElement.appendChild(oTemporaryDomElement);

            oTemporaryDomElement.select();
            document.execCommand("copy");
            bSuccessful = true;
        } catch (oException) {
            bSuccessful = false;
        } finally {
            oTemporaryDomElement.parentNode.removeChild(oTemporaryDomElement);
        }
        return bSuccessful;
    };

    /**
     * Fetches the PersContainer for settings
     * @returns {Promise<object>} Resolves the Personalizer
     *
     * @private
     * @since 1.102.0
     */
    utils._getUserSettingPersContainer = function () {
        return sap.ushell.Container.getServiceAsync("Personalization").then(function (oPersonalizationService) {
            var oPersId = {
                container: "sap.ushell.usersettings.personalization",
                item: "data"
            };

            var oScope = {
                validity: "Infinity",
                keyCategory: oPersonalizationService.constants.keyCategory.GENERATED_KEY,
                writeFrequency: oPersonalizationService.constants.writeFrequency.HIGH,
                clientStorageAllowed: false
            };

            return oPersonalizationService.getPersonalizer(oPersId, oScope);
        });
    };

    /**
     * Calculates whether hideEmptySpaces is enabled by evaluating the user setting.
     * Updates the corresponding config value.
     * @returns {Promise<boolean>} Whether hide empty spaces is enabled
     *
     * @private
     * @since 1.102.0
     */
    utils.getHideEmptySpacesEnabled = function () {
        // Unfortunately it cannot be required since this file is used during/before bootstrap.
        return new Promise(function (resolve) {
            sap.ui.require(["sap/ushell/Config"], function (Config) {
                resolve(Config);
            });
        })
            .then(function (Config) {
                var bHideEmptySpacesEnabled = Config.last("/core/spaces/hideEmptySpaces/enabled");
                if (!bHideEmptySpacesEnabled) {
                    return Promise.resolve(false);
                }

                return utils._getUserSettingPersContainer()
                    .then(function (oPersContainer) {
                        return new Promise(function (resolve, reject) {
                            oPersContainer.getPersData()
                                .done(resolve)
                                .fail(reject);
                        });
                    })
                    .then(function (oUserSettings) {
                        var bUserEnabled = (oUserSettings || {}).hideEmptySpaces !== false;

                        if (Config.last("/core/spaces/hideEmptySpaces/userEnabled") !== bUserEnabled) {
                            Config.emit("/core/spaces/hideEmptySpaces/userEnabled", bUserEnabled);
                        }

                        return bUserEnabled;
                    });
            });
    };

    /**
     * Saves the new value to the PersContainer and updates the config.
     * @param {boolean} bHide Whether the user wants to hide empty spaces
     * @returns {Promise} Resolves after new value was saved
     *
     * @private
     * @since 1.102.0
     */
    utils.setHideEmptySpacesEnabled = function (bHide) {
        // Unfortunately it cannot be required earlier since this file is used during/before bootstrap.
        return new Promise(function (resolve) {
            sap.ui.require(["sap/ushell/Config"], function (Config) {
                resolve(Config);
            });
        })
            .then(function (Config) {
                var bHideEmptySpacesEnabled = Config.last("/core/spaces/hideEmptySpaces/enabled");
                if (!bHideEmptySpacesEnabled) {
                    return Promise.resolve();
                }

                return utils._getUserSettingPersContainer()
                    .then(function (oPersContainer) {
                        return new Promise(function (resolve, reject) {
                            oPersContainer.getPersData()
                                .done(resolve)
                                .fail(reject);
                        })
                            .then(function (oUserSettings) {
                                oUserSettings = oUserSettings || {};
                                var bOldValue = oUserSettings.hideEmptySpaces !== false;

                                if (bOldValue === !!bHide) {
                                    return Promise.resolve();
                                }

                                oUserSettings.hideEmptySpaces = bHide;

                                return new Promise(function (resolve, reject) {
                                    oPersContainer.setPersData(oUserSettings)
                                        .done(resolve)
                                        .fail(reject);
                                }).then(function () {
                                    Config.emit("/core/spaces/hideEmptySpaces/userEnabled", bHide);
                                });
                            });
                    });
            });
    };

    /**
     * Reduces the delay to the valid maximum
     * setTimeout triggers instantly when the maximum is exceeded.
     * @param {int} iDelay the number to sanitize
     * @returns {int} the sanitized delay
     *
     * @since 1.108.0
     * @private
     */
    utils.sanitizeTimeoutDelay = function (iDelay) {
        if (typeof iDelay !== "number") {
            throw new Error("Invalid type! Expected type 'number'.");
        }
        // setTimeout triggers instantly when overflowing the 32bit integer
        var iMaxDelay = 2147483647; // (2^31 − 1)
        return iDelay > iMaxDelay ? iMaxDelay : iDelay;
    };

    return utils;
}, /* bExport= */ false);
