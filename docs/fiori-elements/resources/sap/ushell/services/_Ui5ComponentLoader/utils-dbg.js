// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview Helper functions for <code>sap.ushell.services.Ui5ComponentLoader
 *  This is a shell-internal service and no public or application facing API!
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/base/util/UriParameters",
    "sap/ui/core/Component",
    "sap/ui/core/util/AsyncHintsHelper",
    "sap/ui/thirdparty/jquery",
    "sap/ui/thirdparty/URI",
    "sap/ushell/bootstrap/common/common.load.core-min"
], function (
    Log,
    deepExtend,
    UriParameters,
    Component,
    oAsyncHintsHelper,
    jQuery,
    URI,
    CoreMinLoader
) {
    "use strict";

    /**
     * Creates a UI5 component instance asynchronously.
     *
     * @param {object} oComponentProperties
     *  the Ui5 component properties
     * @param {object} oComponentData
     *  the Ui5 component data
     * @returns {jQuery.Deferred.promise}
     *  a jQuery promise which resolves with an instance of
     *  <code>sap.ui.component</code> containing the instantiated
     *  Ui5 component.
     *
     * @private
     */
    function createUi5Component (oComponentProperties, oComponentData) {
        var oDeferred = new jQuery.Deferred();

        oComponentProperties.componentData = oComponentData;
        if (oComponentProperties.manifest === undefined) {
            oComponentProperties.manifest = false;
        } else if (oComponentData.technicalParameters && oComponentData.technicalParameters.hasOwnProperty("sap-ui-fl-version")) {
            // This case is for the Flexible UI team. When this parameter is provided, it should be added to the manifest URL
            if (typeof oComponentProperties.manifest === "string" && oComponentProperties.manifest.length > 0) {
                var oManifestUrl = new URI(oComponentProperties.manifest);
                oManifestUrl.addQuery("version", oComponentData.technicalParameters["sap-ui-fl-version"][0]);
                oComponentProperties.manifest = oManifestUrl.toString();
            }
        }

        Component.create(oComponentProperties).then(function (oComponent) {
            oDeferred.resolve(oComponent);
        }, function (vError) {
            oDeferred.reject(vError);
        });

        return oDeferred.promise();
    }

    function shouldLoadCoreExt (oAppProperties) {
        var bLoadCoreExt = true; /* default */
        if (oAppProperties.hasOwnProperty("loadCoreExt")) {
            bLoadCoreExt = oAppProperties.loadCoreExt;
        }
        return bLoadCoreExt;
    }

    function shouldLoadDefaultDependencies (oAppProperties, oServiceConfig) {
        // default dependencies loading can be skipped explicitly (homepage component use case)
        var bLoadDefaultDependencies = true;
        if (oAppProperties.hasOwnProperty("loadDefaultDependencies")) {
            bLoadDefaultDependencies = oAppProperties.loadDefaultDependencies;
        }

        // or via service configuration (needed for unit tests)
        if (oServiceConfig && oServiceConfig.hasOwnProperty("loadDefaultDependencies")) {
            bLoadDefaultDependencies = bLoadDefaultDependencies && oServiceConfig.loadDefaultDependencies;
        }

        return bLoadDefaultDependencies;
    }

    function constructAppComponentId (oParsedShellHash) {
        var sSemanticObject = oParsedShellHash.semanticObject || null;
        var sAction = oParsedShellHash.action || null;

        if (!sSemanticObject || !sAction) {
            return null;
        }

        return "application-" + sSemanticObject + "-" + sAction + "-component";
    }

    function urlHasParameters (sUrl) {
        return sUrl && sUrl.indexOf("?") >= 0;
    }

    /**
     * Removes the cachebuster token from the given URL if any is present.
     *
     * @param {string} sUrl
     *    The URL to remove the change buster token from
     *
     * @returns {string}
     *    The URL without the cachebuster token. The same URL is returned if no cachebuster token was present in the original URL.
     */
    function removeCacheBusterTokenFromUrl (sUrl) {
        var rCacheBusterToken = new RegExp("[/]~[\\w-]+~[A-Z0-9]?");
        return sUrl.replace(rCacheBusterToken, "");
    }

    function removeParametersFromUrl (sUrl) {
        if (!sUrl) { return sUrl; }

        var iIndex = sUrl.indexOf("?");
        if (iIndex >= 0) {
            return sUrl.slice(0, iIndex);
        }
        return sUrl;
    }

    function logInstantiateComponentError (sApplicationName, sErrorMessage, sErrorStatus, sErrorStackTrace, sComponentProperties) {
        var sErrorReason = "The issue is most likely caused by application " + sApplicationName,
            sAppPropertiesErrorMsg = "Failed to load UI5 component with properties: '" + sComponentProperties + "'.";

        if (sErrorStackTrace) {
            sAppPropertiesErrorMsg += " Error likely caused by:\n" + sErrorStackTrace;
        } else {
            // Error usually appears in the stack trace if the app
            // threw with new Error... but if it didn't we add it here:
            sAppPropertiesErrorMsg += " Error: '" + sErrorMessage + "'";
        }

        if (sErrorStatus === "parsererror") {
            sErrorReason += ", as one or more of its resources could not be parsed";
        }
        sErrorReason += ". Please create a support incident and assign it to the support component of the respective application.";

        Log.error(sErrorReason, sAppPropertiesErrorMsg, sApplicationName);
    }

    /**
     * Returns a map of all search parameters present in the search string of the given URL.
     *
     * @param {string} sUrl
     *   the URL
     * @returns {object}
     *   in member <code>startupParameters</code> <code>map&lt;string, string[]}></code> from key to array of values,
     *   in members <code>sap-xapp-state</code> an array of Cross application Navigation state keys, if present
     *   Note that this key is removed from startupParameters!
     * @private
     */
    function getParameterMap (sUrl) {
        var mParams = UriParameters.fromURL(sUrl || window.location.href).mParams,
            xAppState = mParams["sap-xapp-state"],
            oResult;
        delete mParams["sap-xapp-state"];
        oResult = {
            startupParameters: mParams
        };
        if (xAppState) {
            oResult["sap-xapp-state"] = xAppState;
        }
        return oResult;
    }

    function logAnyApplicationDependenciesMessages (sApplicationDependenciesName, aMessages) {
        if (!Array.isArray(aMessages)) {
            return;
        }

        aMessages.forEach(function (oMessage) {
            var sSeverity = String.prototype.toLowerCase.call(oMessage.severity || "");
            sSeverity = ["trace", "debug", "info", "warning", "error", "fatal"].indexOf(sSeverity) !== -1 ? sSeverity : "error";
            Log[sSeverity](oMessage.text, oMessage.details, sApplicationDependenciesName);
        });
    }

    /**
     * Loads the specified bundle resources asynchronously.
     *
     * @param {String[]} aBundleResources - the resources to be loaded;
     *  must follow the UI5 module definition spec (i.e. w/o .js extension)
     *
     * @returns {Promise} Promise that resolves as soon as all bundle resources are loaded.
     *
     * @private
     */
    function loadBundle (aBundleResources) {
        if (!Array.isArray(aBundleResources)) {
            Log.error("Ui5ComponentLoader: loadBundle called with invalid arguments");
            return null;
        }

        return Promise.all(aBundleResources.map(function (sResource) {
            // since 1.46, multiple calls of sap.ui.loader._.loadJSResourceAsync
            // for the same module will return the same promise,
            // i.e. there is no need to check if the module has been loaded before
            // TODO: sap.ui.loader._.loadJSResourceAsync is private.
            return sap.ui.loader._.loadJSResourceAsync(sResource);
        })).catch(function (vError) {
            Log.error("Ui5ComponentLoader: failed to load bundle resources: [" + aBundleResources.join(", ") + "]");
            return Promise.reject(vError);
        });
    }

    /*
     * Creates a componentProperties object that can be used to instantiate
     * a ui5 component.
     *
     * @returns {object}
     *    The component properties that can be used to instantiate the UI5
     *    component.
     */
    function createComponentProperties (
        bAddCoreExtPreloadBundle,
        bLoadDefaultDependencies,
        bNoCachebusterTokens,
        aWaitForBeforeInstantiation,
        oApplicationDependencies,
        sUi5ComponentName,
        sComponentUrl,
        sAppComponentId,
        aCoreResourcesComplement
    ) {
        // take over all properties of applicationDependencies to enable extensions in server w/o
        // necessary changes in client
        var oComponentProperties = deepExtend({}, oApplicationDependencies);

        // set default library dependencies if no asyncHints defined (apps without manifest)
        // TODO: move fallback logic to server implementation
        if (!oComponentProperties.asyncHints) {
            oComponentProperties.asyncHints = bLoadDefaultDependencies
                ? { libs: ["sap.ca.scfld.md", "sap.ca.ui", "sap.me", "sap.ui.unified"] }
                : {};
        }

        if (bAddCoreExtPreloadBundle) {
            oComponentProperties.asyncHints.preloadBundles =
                oComponentProperties.asyncHints.preloadBundles || [];

            oComponentProperties.asyncHints.preloadBundles =
                oComponentProperties.asyncHints.preloadBundles.concat(aCoreResourcesComplement);
        }

        if (aWaitForBeforeInstantiation) {
            oComponentProperties.asyncHints.waitFor = aWaitForBeforeInstantiation;
        }

        // Use component name from app properties (target mapping) only if no name
        // was provided in the component properties (applicationDependencies)
        // for supporting application variants, we have to differentiate between app ID
        // and component name
        if (!oComponentProperties.name) {
            oComponentProperties.name = sUi5ComponentName;
        }

        if (sComponentUrl) {
            oComponentProperties.url = removeParametersFromUrl(sComponentUrl);
        }

        if (sAppComponentId) {
            oComponentProperties.id = sAppComponentId;
        }

        if (bNoCachebusterTokens && oComponentProperties.asyncHints) {
            oAsyncHintsHelper.modifyUrls(oComponentProperties.asyncHints, removeCacheBusterTokenFromUrl);
        }

        return oComponentProperties;
    }


    /*
     * Creates a componentData object that can be used to instantiate a ui5
     * component.
     */
    function createComponentData (oBaseComponentData, sComponentUrl, oApplicationConfiguration, oTechnicalParameters) {
        var oComponentData = deepExtend({
            startupParameters: {}
        }, oBaseComponentData);

        if (oApplicationConfiguration) {
            oComponentData.config = oApplicationConfiguration;
        }
        if (oTechnicalParameters) {
            oComponentData.technicalParameters = oTechnicalParameters;
        }

        if (urlHasParameters(sComponentUrl)) {
            var oUrlData = getParameterMap(sComponentUrl);

            // pass GET parameters of URL via component data as member
            // startupParameters and as xAppState (to allow blending with
            // other oComponentData usage, e.g. extensibility use case)
            oComponentData.startupParameters = oUrlData.startupParameters;
            if (oUrlData["sap-xapp-state"]) {
                oComponentData["sap-xapp-state"] = oUrlData["sap-xapp-state"];
            }
        }

        return oComponentData;
    }

    return {
        constructAppComponentId: constructAppComponentId,
        getParameterMap: getParameterMap,
        logAnyApplicationDependenciesMessages: logAnyApplicationDependenciesMessages,
        logInstantiateComponentError: logInstantiateComponentError,
        shouldLoadCoreExt: shouldLoadCoreExt,
        shouldLoadDefaultDependencies: shouldLoadDefaultDependencies,
        urlHasParameters: urlHasParameters,
        removeParametersFromUrl: removeParametersFromUrl,
        createUi5Component: createUi5Component,
        loadBundle: loadBundle,
        createComponentProperties: createComponentProperties,
        createComponentData: createComponentData
    };

}, false /* bExport */);
