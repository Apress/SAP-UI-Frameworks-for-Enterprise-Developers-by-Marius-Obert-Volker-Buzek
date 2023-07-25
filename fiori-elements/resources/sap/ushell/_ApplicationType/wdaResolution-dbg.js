// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/util/deepExtend",
    "sap/base/util/ObjectPath",
    "sap/ui/thirdparty/URI",
    "sap/ushell/_ApplicationType/systemAlias",
    "sap/ushell/_ApplicationType/utils"
], function (
    deepExtend,
    ObjectPath,
    URI,
    oSystemAlias,
    oApplicationTypeUtils
) {
    "use strict";

    /**
     * Creates a string containing the final parameters to append to the the
     * final WDA URL. Parameters are compacted if they are too many.
     *
     * @param {object} oParams
     *   The parameters constructed by matching an intent with an inbound.
     *
     * @param {array} aMappedDefaultedParameterNames
     *   The mapped (renamed according to parameter mapping) parameters that
     *   were defaulted -- not contained in the intent, but in the inbound
     *   signature.
     *
     * @return {Promise}
     *   An ES6 promise that resolves with a string representing the parameters
     *   that must be appended to a final WDA URL, or rejects with an error
     *   message.
     *
     * @private
     */
    function constructWDAURLParameters (oParams, aMappedDefaultedParameterNames) {
        return new Promise(function (fnResolve, fnReject) {
            var oEffectiveParameters = deepExtend({}, oParams);

            // construct effective parameters including defaults
            if (aMappedDefaultedParameterNames.length > 0) {
                // This parameter signals the target application what parameters in
                // the URL were defaulted.
                oEffectiveParameters["sap-ushell-defaultedParameterNames"] = [ // enclose in array for URLParsing
                    JSON.stringify(aMappedDefaultedParameterNames)
                ];
            }

            // in the WDA case, the sap-system intent parameter is *not* part of the final url
            delete oEffectiveParameters["sap-system"];

            // compact our intent url parameters if required
            sap.ushell.Container.getServiceAsync("ShellNavigation")
                .then(function (oShellNavigationService) {
                    oShellNavigationService.compactParams(
                        oEffectiveParameters,
                        ["sap-xapp-state", "sap-ushell-defaultedParameterNames", "sap-intent-params", "sap-iframe-hint", "sap-keep-alive", "sap-wd-configId"],
                        undefined /* no Component*/,
                        true /*transient*/
                    )
                        .fail(function (sError) {
                            fnReject(sError);
                        })
                        .done(function (oEffectiveCompactedIntentParams) {
                            // important to extract after compaction to get a potentially modified client
                            var sEffectiveStartupParams = oApplicationTypeUtils.getURLParsing().paramsToString(oEffectiveCompactedIntentParams);
                            fnResolve(sEffectiveStartupParams);
                        });
                })
                .catch(function (sError) {
                    fnReject(sError);
                });
        });
    }


    /**
     * Appends a string of parameters to a URI.
     *
     * @param {object} oURI
     *   A URI object (with or without parameters).
     *
     * @param {string} sUrlParameters
     *   The parameters to be appended to the URI. This string is not
     *   manipulated but just appended to the URL.
     *
     * @returns {string}
     *   A string representing the URI with the given parameters appended.
     *   This method does not remove or override duplicate parameters that may
     *   be already in the given URI object.
     *
     * @private
     */
    function appendParametersToURI (oURI, sUrlParameters) {
        // ASSUMPTION: there are no relevant parameters in the WDA url, but only WDA parameters.
        var sParams = oURI.search();
        if (sUrlParameters) {
            sParams = sParams + ((sParams.indexOf("?") < 0) ? "?" : "&") + sUrlParameters;
        }

        return oURI.search(sParams).toString();
    }

    /**
     * Creates a WDA URI object based on the provided application id and
     * configuration id of a WDA application.
     *
     * <p>
     * It resolves and interpolates sap-system into
     * the URL if it is present among the other input parameter object.
     * </p>
     *
     * @param {string} sApplicationId
     *   The WDA application id
     *
     * @param {string} [sConfigId]
     *   The WDA config id.
     *
     * @param {boolean} [bIsWDAInCompatibilityMode]
     *   Compatibility Mode is defined whethere WDA url is wrapped by NWBC(true) or standalone case (False)
     *
     *
     * @param {object} oOtherParameters
     *   Other parameters to be passed to the WDA application. This must be an object like:
     *   <pre>
     *      {
     *          p1: [v1, v2, ... ],
     *          p2: [v3],
     *          ...
     *      }
     *   </pre>
     * @param {function} [fnExternalSystemAliasResolver]
     *   An external resolver that can be used to resolve the system alias
     *   outside the platform-independent code.
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolves with a WDA URI object
     *
     * @private
     */
    function buildWdaURI (sApplicationId, sConfigId, bIsWDAInCompatibilityMode, oOtherParameters, fnExternalSystemAliasResolver) {
        var sSapSystem,
            sSapSystemDataSrc,
            sUrl,
            oURI,
            sUrlParameters,
            oUrlParameters = deepExtend({}, oOtherParameters);

        // Add config id if provided
        if (sConfigId) {
            oUrlParameters["sap-wd-configId"] = sConfigId;
        }

        // Extract sap-system (should not appear as a parameter!)
        if (oUrlParameters["sap-system"]) {
            sSapSystem = oUrlParameters["sap-system"][0];
            delete oUrlParameters["sap-system"];
        }


        // Extract sap-system-src (should not appear as a parameter!)
        if (oUrlParameters.hasOwnProperty("sap-system-src")) {
            sSapSystemDataSrc = oUrlParameters["sap-system-src"][0];
            delete oUrlParameters["sap-system-src"];
        }


        sUrlParameters = oApplicationTypeUtils.getURLParsing().paramsToString(oUrlParameters);
        if (bIsWDAInCompatibilityMode) {
            sUrl = buildCompatibleWdaURL(sApplicationId, sUrlParameters);
        } else {
            sUrl = buildStandaloneWdaURL(sApplicationId, sUrlParameters);
        }

        oURI = new URI(sUrl);

        return oSystemAlias.spliceSapSystemIntoURI(oURI, oSystemAlias.LOCAL_SYSTEM_ALIAS,
            sSapSystem, sSapSystemDataSrc, "WDA", oSystemAlias.SYSTEM_ALIAS_SEMANTICS.apply, fnExternalSystemAliasResolver);
    }

    function buildCompatibleWdaURL (sApplicationId, sUrlParameters) {
        return "/ui2/nwbc/~canvas;window=app/wda/" + sApplicationId + "/" +
            "?" + sUrlParameters;
    }

    /**
     * Creates a standalone WDA URL according to WDA url format.
     *
     * Documentation says:
     *
     * - When there is a SAP namespace:
     *   <schema>://<host>.<domain>.<extension>:<port>[path-prefix]/webdynpro/<sap-namespace>/<application id>
     *
     * - When the customer specifies a namespace:
     *   <schema>://<host>.<domain>.<extension>:<port>[path-prefix]/<customer-namespace>/webdynpro/<application id>
     *
     * However, we choose to generate URLs in the first form because it's not
     * possible to know whether the namespace prepended to the applicationId
     * comes from the customer or it's an SAP namespace.
     *
     * @param {string} sNamespaceAndApplicationId
     *
     *    The namespace and the application id.
     *
     *    From the backend, any namespace (customer or SAP) comes pre-pended to
     *    the application id.
     *
     * @param {string} sUrlParameters
     *    The URL parameters to append to the WDA URL.
     *
     * @return {string}
     *    The standalone WDA URL
     *
     * @private
     */
    function buildStandaloneWdaURL (sNamespaceAndApplicationId, sUrlParameters) {

        var bNoNamespace = sNamespaceAndApplicationId.indexOf("/") !== 0;
        if (bNoNamespace) {
            sNamespaceAndApplicationId = "sap/" + sNamespaceAndApplicationId;
        }

        return "/webdynpro/" + sNamespaceAndApplicationId + "?" + sUrlParameters;
    }

    /**
     * Creates and returns the resolution result for WDA only.
     *
     * @param {object} oInbound
     *  The inbound of the matched target.
     * @param {string} sFinalWDAURL
     *  The URL to add to the resolutionResult.
     * @param {string} sSapSystem
     *  The sap-system from the matched target.
     * @param {string} sSapSystemDataSrc
     *  The sap-system-src from the matched target.
     *
     * @return {object}
     *  An object that represents the resolution result, like:
     *  <pre>
     *     {
     *        "sap-system": ...,
     *        url: ...,
     *        text: ...,
     *        applicationType: ...
     *     }
     *  </pre>
     *
     * @private
     */
    function createWDAResolutionResult (oInbound, sFinalWDAURL, sSapSystem, sSapSystemDataSrc) {
        var oResolutionResult = {
            "sap-system": sSapSystem,
            url: sFinalWDAURL,
            text: oInbound.title,
            applicationType: "NWBC"
        };

        if (typeof sSapSystemDataSrc === "string") {
            oResolutionResult["sap-system-src"] = sSapSystemDataSrc;
        }

        oApplicationTypeUtils.setSystemAlias(oResolutionResult, oInbound.resolutionResult);

        // propagate properties from the inbound in the resolution result
        ["additionalInformation", "applicationDependencies"].forEach(function (sPropName) {
            if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                oResolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
            }
        });

        oResolutionResult.url = oApplicationTypeUtils.appendParametersToUrl("sap-iframe-hint=" +
            ((oResolutionResult.url.indexOf("/ui2/nwbc/") >= 0) ? "NWBC" : "WDA"), oResolutionResult.url);

        return oResolutionResult;
    }

    function constructFullWDAResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oInboundResolutionResult = ObjectPath.get("inbound.resolutionResult", oMatchingTarget),
            oMappedIntentParamsPlusSimpleDefaults = oMatchingTarget.mappedIntentParamsPlusSimpleDefaults || {};

        var sSapSystem = oInboundResolutionResult.systemAlias;
        if (oMappedIntentParamsPlusSimpleDefaults["sap-system"]) {
            sSapSystem = oMappedIntentParamsPlusSimpleDefaults["sap-system"][0];
        }

        var sSapSystemDataSrc;
        if (oMappedIntentParamsPlusSimpleDefaults["sap-system-src"]) {
            sSapSystemDataSrc = oMappedIntentParamsPlusSimpleDefaults["sap-system-src"][0];
        }

        var oOtherParams = {
            "sap-system": [ sSapSystem ]
        };
        if (typeof sSapSystemDataSrc === "string") {
            oOtherParams["sap-system-src"] = [ sSapSystemDataSrc ];
        }

        var bCompatibilityMode = oInboundResolutionResult["sap.wda"].compatibilityMode;
        if (bCompatibilityMode === undefined) {
            bCompatibilityMode = true;
        }

        return new Promise(function (fnResolve, fnReject) {
            buildWdaURI(
                oInboundResolutionResult["sap.wda"].applicationId,
                oInboundResolutionResult["sap.wda"].configId,
                bCompatibilityMode,
                oOtherParams,
                fnExternalSystemAliasResolver
            ).done(function (oWdaURIWithSystemAlias) {

                var oMappedIntentParamsPlusSimpleDefaults = oMatchingTarget.mappedIntentParamsPlusSimpleDefaults;

                constructWDAURLParameters(oMappedIntentParamsPlusSimpleDefaults, oMatchingTarget.mappedDefaultedParamNames)
                    .then(function (sUrlParameters) {
                        var sFinalWDAURL = appendParametersToURI(oWdaURIWithSystemAlias, sUrlParameters);
                        var sSapSystem = oMappedIntentParamsPlusSimpleDefaults["sap-system"] && oMappedIntentParamsPlusSimpleDefaults["sap-system"][0];
                        var sSapSystemDataSrc = oMappedIntentParamsPlusSimpleDefaults["sap-system-src"] && oMappedIntentParamsPlusSimpleDefaults["sap-system-src"][0];

                        var oResolutionResult = createWDAResolutionResult(oMatchingTarget.inbound, sFinalWDAURL, sSapSystem, sSapSystemDataSrc);

                        fnResolve(oResolutionResult);
                    }, function (sError1) {
                        fnReject(sError1);
                    });

            }).fail(function (sError2) {
                fnReject(sError2);
            });
        });

    }
    function constructWDAResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oInbound = oMatchingTarget.inbound,
            oInboundResolutionResult = oInbound && oInbound.resolutionResult,
            oMappedIntentParamsPlusSimpleDefaults = oMatchingTarget.mappedIntentParamsPlusSimpleDefaults;

        // splice parameters into WDA url
        var oWDAURI = new URI(sBaseUrl);
        var sSapSystem = oMappedIntentParamsPlusSimpleDefaults["sap-system"] && oMappedIntentParamsPlusSimpleDefaults["sap-system"][0];
        var sSapSystemDataSrc = oMappedIntentParamsPlusSimpleDefaults["sap-system-src"] && oMappedIntentParamsPlusSimpleDefaults["sap-system-src"][0];

        return Promise.all([
            (new Promise(function (fnDone, fnReject) {
                oSystemAlias.spliceSapSystemIntoURI(oWDAURI, oInboundResolutionResult.systemAlias, sSapSystem,
                    sSapSystemDataSrc, "WDA", oInboundResolutionResult.systemAliasSemantics || oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied, fnExternalSystemAliasResolver)
                    .fail(fnReject)
                    .done(fnDone);
            })),

            constructWDAURLParameters(oMappedIntentParamsPlusSimpleDefaults, oMatchingTarget.mappedDefaultedParamNames)

        ]).then(function (aResults) {
            var oWDAURIWithSapSystem = aResults[0];
            var sUrlParameters = aResults[1];
            var sFinalWDAURL = appendParametersToURI(oWDAURIWithSapSystem, sUrlParameters);

            var oResolutionResult = createWDAResolutionResult(oInbound, sFinalWDAURL, sSapSystem, sSapSystemDataSrc);

            return oResolutionResult;
        }, function (sError) {
            return Promise.reject(sError);
        });
    }

    function resolveEasyAccessMenuIntentWDA (oIntent, oMatchingTarget, fnExternalSystemAliasResolver, bEnableWdaCompatibilityMode) {
        var sAppId = oIntent.params["sap-ui2-wd-app-id"][0];
        var sConfId = (ObjectPath.get("params.sap-ui2-wd-conf-id", oIntent) || [])[0];

        var oOtherParams = Object.keys(oIntent.params).reduce(function (oResultParams, sParamName) {
            if (sParamName !== "sap-ui2-wd-app-id" && sParamName !== "sap-ui2-wd-conf-id") {
                oResultParams[sParamName] = oIntent.params[sParamName];
            }
            return oResultParams;
        }, {});


        return new Promise(function (fnResolve, fnReject) {
            buildWdaURI(sAppId, sConfId, bEnableWdaCompatibilityMode, oOtherParams /* may include sap-system and/or sap-system-src */, fnExternalSystemAliasResolver)
                .done(function (oURI) {
                    var sSapSystemDataSrc = oIntent.params.hasOwnProperty("sap-system-src") && oIntent.params["sap-system-src"][0];
                    var sSapSystem = oIntent.params.hasOwnProperty("sap-system") && oIntent.params["sap-system"][0];

                    var oResolutionResult = {
                        url: oURI.toString(),
                        applicationType: "NWBC",
                        text: sAppId,
                        additionalInformation: "",
                        "sap-system": sSapSystem
                    };

                    if (typeof sSapSystemDataSrc === "string") {
                        oResolutionResult["sap-system-src"] = sSapSystemDataSrc;
                    }

                    if (oMatchingTarget && oMatchingTarget.inbound && oMatchingTarget.inbound.resolutionResult && oMatchingTarget.inbound.resolutionResult["sap.platform.runtime"]) {
                        oResolutionResult["sap.platform.runtime"] = oMatchingTarget.inbound.resolutionResult["sap.platform.runtime"];
                    }
                    oResolutionResult.url = oApplicationTypeUtils.appendParametersToUrl("sap-iframe-hint=" +
                        ((oResolutionResult.url.indexOf("/ui2/nwbc/") >= 0) ? "NWBC" : "WDA"), oResolutionResult.url);

                    fnResolve(oResolutionResult);
                })
                .fail(function (oError) {
                    fnReject(oError);
                });

        });
    }

    return {
        resolveEasyAccessMenuIntentWDA: resolveEasyAccessMenuIntentWDA,
        constructFullWDAResolutionResult: constructFullWDAResolutionResult,
        constructWDAResolutionResult: constructWDAResolutionResult
    };


}, /* bExport = */ false);
