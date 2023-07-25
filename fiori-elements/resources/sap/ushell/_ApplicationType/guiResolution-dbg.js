// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/ui/thirdparty/URI",
    "sap/ushell/_ApplicationType/systemAlias",
    "sap/ushell/_ApplicationType/utils",
    "sap/ushell/services/_ClientSideTargetResolution/ParameterMapping",
    "sap/ushell/services/_ClientSideTargetResolution/Utils"
], function (
    Log,
    deepExtend,
    URI,
    oSystemAlias,
    oApplicationTypeUtils,
    oParameterMapping,
    oCSTRUtils
) {
    "use strict";

    /**
     * removes properties of an object
     * @param {*} oObject
     *   Object that is modified and that has its properties deleted
     * @param {array} aKeysToRemove The keys of properties to be removed
     */
    function removeObjectKey (oObject, aKeysToRemove) {
        aKeysToRemove.forEach(function (sKeyToRemove) {
            delete oObject[sKeyToRemove];
        });
    }

    function isRequiredParameter (sParameterName, oInbound) {
        return oInbound && oInbound.signature && oInbound.signature && oInbound.signature.parameters
            && oInbound.signature.parameters[sParameterName]
            && oInbound.signature.parameters[sParameterName].required === true;
    }

    /**
     * Returns the name of parameters that should not appear in a WebGUI URL.
     *
     * @param {object} oEffectiveParameters
     *    The array that contains of parameters possibly including parameter DYNP_OKCODE
     *    which might be mandatory, indicating that the first screen to be skipped
     *
     * @param {object} oInbound
     *    The inbound of the matching target
     *
     * @returns {array}
     *    The name parameters from <code>oEffectiveParameters</code> that
     *    should not be included in a WebGUI URL.
     */
    function getUnnecessaryWebguiParameters (oEffectiveParameters, oInbound) {
        var bIsRequired = isRequiredParameter("DYNP_OKCODE", oInbound)
            || isRequiredParameter("DYNP_NO1ST", oInbound);

        var aBusinessParameters = [];

        if (bIsRequired) {
            return [];
        }

        var oBusinessParameters = getWebguiBusinessParameters(oEffectiveParameters);

        function upperCaseString (s) {
            return s.toUpperCase();
        }

        var aNormalizedBusinessParameters = Object.keys(oBusinessParameters)
            .map(upperCaseString)
            .sort();

        // checks if 2 arrays of strings are equal, the arrays are assumed to be sorted
        function arraysEqual (aArray1, aArray2) {
            if (aArray1.length !== aArray2.length) {
                return false;
            }

            return aArray1.every(function (vUnused, iIdx) {
                return aArray1[iIdx] === aArray2[iIdx];
            });
        }

        // check unnecessary parameter combinations
        if (arraysEqual(["DYNP_NO1ST","DYNP_OKCODE"], aNormalizedBusinessParameters)
            || arraysEqual(["DYNP_OKCODE"], aNormalizedBusinessParameters)
            || arraysEqual(["DYNP_NO1ST"], aNormalizedBusinessParameters)
        ) {
            aBusinessParameters = Object.keys(oBusinessParameters);
        }

        return aBusinessParameters;
    }

    /**
     * Finds and returns webgui business parameters.
     *
     * @param {object} oParams
     *   set of WebGUI parameters
     *
     * @return {object}
     *   the set of business parameters
     *
     * @private
     */
    function getWebguiBusinessParameters (oParams) {
        var oBusinessParameters = oCSTRUtils.filterObject(oParams, isWebguiBusinessParameter);
        return oBusinessParameters;
    }

    /**
     * Tells whether the given parameter is a Webgui business parameter
     * This method has a polimorphic signature: it can be called with one or two arguments.
     * If called with one argument both the name and the parameter value
     * should be passed, separated by "=". The first "=" will be treated as
     * parameter separator. Otherwise two parameters (name, value) can be passed.
     *
     * NOTE: the method determines whether the value is passed based on how
     * many arguments are passed.
     *
     * @param {string} sName
     *   A parameter name or a name=value string.
     * @param {string} [sValue]
     *   An optional parameter value to be used in combination with the
     *   name specified in <code>sNameMaybeValue</code>.
     *
     * @returns {boolean}
     *   Whether the given parameter is a Webgui business parameter.
     *
     * @private
     */
    function isWebguiBusinessParameter (sName, sValue) {
        var aNameValue;
        // handle case in which sName is in the form "name=value"
        if (arguments.length === 1) {
            aNameValue = sName.split(/[=](.+)?/); // split on first "="
            if (aNameValue.length > 1) {
                return isWebguiBusinessParameter.apply(null, aNameValue);
            }
        }

        return !(
            sName.indexOf("sap-") === 0 ||
            sName.indexOf("saml") === 0 ||
            sName.charAt(0) === "~"
        );
    }


    function generateTRResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oInbound = oMatchingTarget.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult,
            oPromise;

        if (
            !(!oInbound ||
            !oResolutionResult ||
            !(oResolutionResult["sap.gui"]) ||
            !(oResolutionResult.applicationType === "TR"))
        ) {
            oPromise = constructFullWebguiResolutionResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
        } else if (
            !(!oInbound ||
                !oResolutionResult ||
                !(oResolutionResult.applicationType === "TR") ||
                !(oResolutionResult.url.indexOf("/~canvas;") >= 0) ||
                !(oResolutionResult.url.indexOf("app/transaction/APB_LPD_CALL_") === -1)) //check no WRAPPED transaction
        ) {
            oPromise = constructWebguiNowrapResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
        } else if (
            !(!oInbound ||
                !oResolutionResult ||
                !(oResolutionResult.applicationType === "TR") ||
                !(oResolutionResult.url.indexOf("/~canvas;") >= 0) ||
                !(oResolutionResult.url.indexOf("app/transaction/APB_LPD_CALL_") >= 0)) // check WRAPPED transaction
        ) {
            oPromise = constructWebguiWrapResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
        } else if (
            !(// a native webgui URL
                !oInbound ||
                !oResolutionResult ||
                !(oResolutionResult.applicationType === "TR") ||
                !(oResolutionResult.url.indexOf("/its/webgui") >= 0) ||
                !(oResolutionResult.url.indexOf("APB_LPD_CALL_") === -1) // a non wrapped URL
            )
        ) {
            oPromise = constructNativeWebguiNowrapResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
        } else if (
            !(// a native webgui URL
                !oInbound ||
                !oResolutionResult ||
                !(oResolutionResult.applicationType === "TR") ||
                !(oResolutionResult.url.indexOf("/its/webgui") >= 0) ||
                !(oResolutionResult.url.indexOf("APB_LPD_CALL_") !== -1) // a WRAPPED URL
            )
        ) {
            oPromise = constructNativeWebguiWrapResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
        }

        if (oPromise) {
            return oPromise.then(function (oResult) {
                if (oResult.url) {
                    oResult.url = oApplicationTypeUtils.appendParametersToUrl("sap-iframe-hint=GUI", oResult.url);
                }
                return oResult;
            });
        }
        throw new Error("Cannot generate TR resolution result");
    }


    /**
     * Creates a native webgui URL given the a resolution result "from" nothing (but either a
     * Shell-startURL intent or a  appdescriptor information
     * like Shell-startGUI or Shell-startWDA.
     *
     * @param {string} sTcode
     *   The transaction code to use, must not be empty
     *
     * @param {string} sSapSystem
     *   A sap system as a string
     *
     * @param {string} sSapSystemDataSrc
     *   The name of the system that contains data about the system alias.
     *
     * @param {Function} fnExternalSystemAliasResolver
     *   The alias resolver for remote system names.
     *
     * @returns {jQuery.Deferred.promise}
     *   A promise that resolved with the URI object
     *
     * @private
     */
    function buildNativeWebGuiURI (sTcode, sSapSystem, sSapSystemDataSrc, fnExternalSystemAliasResolver) {
        var sUrl, oURI;
        sTcode = encodeURIComponent(sTcode);
        sUrl = "/gui/sap/its/webgui?%7etransaction=" + sTcode + "&%7enosplash=1";
        oURI = new URI(sUrl);
        return oSystemAlias.spliceSapSystemIntoURI(oURI, oSystemAlias.LOCAL_SYSTEM_ALIAS, sSapSystem, sSapSystemDataSrc,
            "NATIVEWEBGUI", oSystemAlias.SYSTEM_ALIAS_SEMANTICS.apply, fnExternalSystemAliasResolver);
    }


    /**
     * Interpolates the parameters into the given query using transaction
     * interpolation format.
     *
     * The method tries to interpolate the given parameters into the
     * <code>P_OBJECT</code> query parameter if present in the query
     * string.  Otherwise the <code>P_OBJECT</code> parameter is added to
     * the query string.
     *
     * <p>Contrarily to standard URLs, the parameter must be injected into the
     * query parameter double escaped (via encodeURIComponent) and with
     * the nonstandard delimiters passed as input.
     *
     * <p >For example, when using '&' and '=' as delimiters, given the
     * query string <code>A=B&P_OBJECT=</code>
     * and the parameter object
     * <pre>
     * {
     *    B: ["C"],
     *    C: ["D"]
     * }
     * </pre>, the interpolated query string
     * <code>A=B&P_OBJECT=B%2521C%2525C%2521D</code> is returned.
     *
     * <p>
     * IMPORTANT: the <code>P_OBJECT</code> parameter can take maximum 132
     * characters in its value. In case the given parameters form a string
     * that is longer than 132 characters (unescaped), the string will be
     * splitted over multiple <code>P_OBJx</code> parameters that are added
     * to the URL.
     * <br />
     * For example, the method may return the following interpolated query:
     * <code>P_OBJ1=rest_of_p_object_value&P_OBJ2=...&P_OBJECT=...some_long_value...</code>
     * </p>
     *
     * @param {string} sQuery
     *   The query string to interpolate the parameters into
     * @param {object} oParamsToInject
     *   An object indicating the parameters that need to be interpolated.
     * @param {string} sQueryParamDelimiter
     *   The delimiter used to separate parameters and values in <code>sQuery</code>. E.g., "&"
     * @param {string} sQueryParamAssignDelimiter
     *   The delimiter used to separate assignments of a value to a parameter in <code>sQuery</code>. E.g., "="
     *
     * @return {string}
     *   The interpolated query string.
     */
    function injectEffectiveParametersIntoWebguiPobjectParam (sQuery, oParamsToInject,
                                                              sQueryParamDelimiter, sQueryParamAssignDelimiter) {
        var sInjectedParams,
            sPobjectPlusDelimiter = "P_OBJECT" + sQueryParamAssignDelimiter,
            iMaxGUIParamLength = 132;

        // NOTE: the result of privparamsToString does not encode
        //       delimiters, hence we pass them encoded.
        var sParamsToInject = oApplicationTypeUtils.getURLParsing().privparamsToString(
            oParamsToInject,
            "%25", // a.k.a. "%", instead of &
            "%21" // a.k.a. "!", instead of =
        );

        if (!sParamsToInject) {
            return sQuery;
        }

        // Parse away existing parameters in P_OBJECT
        var sParamsToInjectPrefix = "";
        amendGuiParam("P_OBJECT", sQuery, sQueryParamDelimiter, sQueryParamAssignDelimiter,
            function (sParamNameAndValueDoubleEncoded) {
            var sParamValueDoubleEncoded = sParamNameAndValueDoubleEncoded.replace(sPobjectPlusDelimiter, "");
            sParamsToInjectPrefix = decodeURIComponent(sParamValueDoubleEncoded);
            if (sParamsToInjectPrefix.length > 0) {
                sParamsToInjectPrefix = sParamsToInjectPrefix + "%25";
            }

            return sPobjectPlusDelimiter; // just leave the P_OBJECT= placeholder if found
        });
        sParamsToInject = sParamsToInjectPrefix + sParamsToInject;

        // Generate the injected parameters
        var oParamsSections = {
            pObjX: "",
            pObject: ""
        };
        sParamsToInject
            .match(new RegExp(".{1," + iMaxGUIParamLength + "}", "g"))
            .map(function (sParamGroupEncoded) {
                return encodeURIComponent(sParamGroupEncoded);
            })
            .forEach(function (sParamGroupDoubleEncoded, iGroupIdx) {
                // parameter name should be P_OBJECT or P_OBJx for further parameters
                var sParamName = "P_OBJECT";
                var sParamSection = "pObject";
                if (iGroupIdx > 0) {
                    sParamName = "P_OBJ" + iGroupIdx;
                    sParamSection = "pObjX";
                }

                var sSectionDelimiter = oParamsSections[sParamSection].length === 0 ? "" : sQueryParamDelimiter;

                oParamsSections[sParamSection] = oParamsSections[sParamSection] + sSectionDelimiter + sParamName
                    + sQueryParamAssignDelimiter + sParamGroupDoubleEncoded;
            });

        sInjectedParams = [oParamsSections.pObjX, oParamsSections.pObject]
            .filter(function (sParamSection) {
                return sParamSection.length > 0;
            })
            .join(sQueryParamDelimiter);

        // Place the injected params in the right place in the query
        var oAmendResult = amendGuiParam("P_OBJECT", sQuery, sQueryParamDelimiter,
            sQueryParamAssignDelimiter, function (sFoundParamNameAndValue) {
            return sInjectedParams;
        });

        if (oAmendResult.found) {
            return oAmendResult.query;
        }

        // amendment not performed: just append the concatenation
        return sQuery + (sQuery.length === 0 ? "" : sQueryParamDelimiter) + sInjectedParams;
    }

    /**
     * Amends a specified GUI param through a given callback function.
     *
     * @param {string} sTargetParamName
     *   The target WebGui parameter to find
     * @param {string} sQuery
     *   The query string to find the parameter in
     * @param {string} sQueryParamDelimiter
     *   The delimiter used to separate parameters and values in <code>sQuery</code>. E.g., "&"
     * @param {string} sQueryParamAssignDelimiter
     *   The delimiter used to separate assignments of a value to a parameter in <code>sQuery</code>. E.g., "="
     * @param {function} fnAmend
     *   A callback used to amend the <code>sTargetParamName</code>
     *   parameter of the query string. It is a function that should return
     *   the value to assign to the target parameter in the query string,
     *   should this target parameter be present.
     *   <p>When this function returns <code>undefined</code>, the target
     *   parameter will be removed from the query string</p>
     *
     * @return {object}
     *   An object representing the result of the amend operation. It is like:
     *   <pre>
     *   {
     *      found: <boolean> // whether the target parameter was found
     *      query: <string>  // the amended query string or the original
     *                       // query string if the target parameter was not found
     *   }
     *   </pre>
     */
    function amendGuiParam (sTargetParamName, sQuery, sQueryParamDelimiter, sQueryParamAssignDelimiter, fnAmend) {
        var bFound = false,
            sParamSearchPrefix = sTargetParamName + sQueryParamAssignDelimiter; // Param=

        var sAmendedQuery = sQuery
            .split(sQueryParamDelimiter)
            .map(function (sParam) {

                if (sParam.indexOf(sParamSearchPrefix) !== 0) {
                    return sParam;
                }

                bFound = true;

                return fnAmend(sParam);
            })
            .filter(function (sParam) {
                return typeof sParam !== "undefined";
            })
            .join(sQueryParamDelimiter);

        return {
            found: bFound,
            query: sAmendedQuery
        };
    }


    function constructNativeWebguiWrapResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oInbound = oMatchingTarget.inbound,
            oInboundResolutionResult = oInbound && oInbound.resolutionResult,
            oResolutionResult = {};

        // splice parameters into Webgui url
        var oWebguiURI = new URI(sBaseUrl);

        // construct effective parameters
        /*
        /* NOTE: do not include defaultedParameterNames for wrapped URLs,
         * as they may cause a crash the called application.
         */
        var oEffectiveParameters = deepExtend({}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        var sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];
        var sSapSystemDataSrc = oEffectiveParameters["sap-system-src"] && oEffectiveParameters["sap-system-src"][0];

        // in the Webgui case, the sap-system intent parameter is *not* part of the final url
        oResolutionResult["sap-system"] = sSapSystem;
        delete oEffectiveParameters["sap-system"];

        // in the Webgui case, the sap-system-src intent parameter is *not* part of the final url
        if (typeof sSapSystemDataSrc === "string") {
            oResolutionResult["sap-system-src"] = sSapSystemDataSrc;
            delete oEffectiveParameters["sap-system-src"];
        }

        return new Promise(function (fnResolve, fnReject) {
            oSystemAlias.spliceSapSystemIntoURI(oWebguiURI, oInboundResolutionResult.systemAlias, sSapSystem,
                sSapSystemDataSrc, "NATIVEWEBGUI",
                oInboundResolutionResult.systemAliasSemantics
                || oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied, fnExternalSystemAliasResolver)
                .fail(fnReject)
                .done(function (oWebguiURI) {
                    // Reconstruct the final url
                    // ASSUMPTION: there are no relevant parameters in the Webgui url, but only Webgui parameters.

                    var sParams = oWebguiURI.search(); // Webgui parameters
                    var sParamsInterpolated = sParams
                        .split("&")
                        .map(function (sQueryParam) {
                            // interpolate effective parameter in the correct place within the ~transaction parameter

                            var sInterpolatedQueryParam;
                            if (sQueryParam.indexOf("?%7etransaction") === 0 ||
                                sQueryParam.indexOf("%7etransaction") === 0) { // found transaction

                                // treat transaction as if it was a query parameter
                                sInterpolatedQueryParam = injectEffectiveParametersIntoWebguiPobjectParam(
                                    sQueryParam,
                                    oEffectiveParameters,
                                    "%3b", // parameter separator -> ";"
                                    "%3d" // parameter assign delimiter -> "="
                                );
                                return sInterpolatedQueryParam;
                            }

                            return sQueryParam;
                        })
                        .join("&");

                    oWebguiURI.search(sParamsInterpolated);

                    // propagate properties from the inbound in the resolution result
                    ["additionalInformation", "applicationDependencies"].forEach(function (sPropName) {
                        if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                            oResolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
                        }
                    });
                    oResolutionResult.url = oWebguiURI.toString();
                    oResolutionResult.text = oInbound.title;
                    oResolutionResult.applicationType = "TR"; // Triggers Native navigation
                    oApplicationTypeUtils.setSystemAlias(oResolutionResult, oInbound.resolutionResult);

                    fnResolve(oResolutionResult);
                });
        });
    }
    function constructFullWebguiResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oInbound = oMatchingTarget.inbound,
            oInboundResolutionResult = oInbound && oInbound.resolutionResult,
            oMappedIntentParamsPlusSimpleDefaults = oMatchingTarget.mappedIntentParamsPlusSimpleDefaults || {};

        var sSapSystem = oInboundResolutionResult.systemAlias;
        if (oMappedIntentParamsPlusSimpleDefaults["sap-system"]) {
            sSapSystem = oMappedIntentParamsPlusSimpleDefaults["sap-system"][0];
        }

        var sSapSystemDataSrc;
        if (oMappedIntentParamsPlusSimpleDefaults["sap-system-src"]) {
            sSapSystemDataSrc = oMappedIntentParamsPlusSimpleDefaults["sap-system-src"][0];
        }

        return new Promise(function (fnResolve, fnReject) {
            buildNativeWebGuiURI(oInbound.resolutionResult["sap.gui"].transaction, sSapSystem, sSapSystemDataSrc,
                fnExternalSystemAliasResolver).done(function (oURIWithSystemAlias) {
                oParameterMapping.mapParameterNamesAndRemoveObjects(oMatchingTarget);
                var oResolutionResult = blendParamsIntoNativeWebGUI(oMatchingTarget.inbound,
                    oMatchingTarget.mappedIntentParamsPlusSimpleDefaults, oURIWithSystemAlias);
                if (oResolutionResult && oMatchingTarget.inbound && oMatchingTarget.inbound.resolutionResult
                    && oMatchingTarget.inbound.resolutionResult["sap.platform.runtime"]) {
                    oResolutionResult["sap.platform.runtime"]
                        = oMatchingTarget.inbound.resolutionResult["sap.platform.runtime"];
                }

                oResolutionResult["sap-system"] = sSapSystem;
                oApplicationTypeUtils.setSystemAlias(oResolutionResult, oInbound.resolutionResult);

                fnResolve(oResolutionResult);
            }).fail(fnReject);
        });
    }
    function constructWebguiWrapResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oInbound = oMatchingTarget.inbound,
            oInboundResolutionResult = oInbound && oInbound.resolutionResult;

        var oResolutionResult = {};

        // splice parameters into Webgui url
        var oWebguiURI = new URI(sBaseUrl);

        // construct effective parameters

        /*
        /* NOTE: do not include defaultedParameterNames for wrapped URLs,
         * as they may cause a crash the called application.
         */
        var oEffectiveParameters = deepExtend({}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        var sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];
        var sSapSystemDataSrc = oEffectiveParameters["sap-system-src"] && oEffectiveParameters["sap-system-src"][0];

        // in the Webgui case, the sap-system intent parameter is *not* part of the final url
        oResolutionResult["sap-system"] = sSapSystem;
        delete oEffectiveParameters["sap-system"];

        if (typeof sSapSystemDataSrc === "string") {
            oResolutionResult["sap-system-src"] = sSapSystemDataSrc;
            delete oEffectiveParameters["sap-system-src"];
        }

        return new Promise(function (fnResolve, fnReject) {
            oSystemAlias.spliceSapSystemIntoURI(oWebguiURI, oInboundResolutionResult.systemAlias, sSapSystem,
                sSapSystemDataSrc, "WEBGUI", oInboundResolutionResult.systemAliasSemantics
                || oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied, fnExternalSystemAliasResolver)
                .fail(fnReject)
                .done(function (oWebguiURI) {
                    // Reconstruct the final url
                    // ASSUMPTION: there are no relevant parameters in the Webgui url, but only Webgui parameters.
                    var sParams = oWebguiURI.search(); // Webgui parameters

                    // Inject effective startup param
                    sParams = injectEffectiveParametersIntoWebguiPobjectParam(sParams, oEffectiveParameters,
                        "&", "=");

                    oWebguiURI.search(sParams);

                    // propagate properties from the inbound in the resolution result
                    ["additionalInformation", "applicationDependencies"].forEach(function (sPropName) {
                        if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                            oResolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
                        }
                    });

                    oResolutionResult.url = oWebguiURI.toString();
                    oResolutionResult.text = oInbound.title;
                    oResolutionResult.applicationType = "NWBC";
                    oApplicationTypeUtils.setSystemAlias(oResolutionResult, oInbound.resolutionResult);

                    fnResolve(oResolutionResult);
                });
        });
    }
    function constructWebguiNowrapResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oInbound = oMatchingTarget.inbound,
            oInboundResolutionResult = oInbound && oInbound.resolutionResult;

        var oResolutionResult = {};

        // splice parameters into Webgui url
        var oWebguiURI = new URI(sBaseUrl);

        // construct effective parameters excluding defaults (!)
        var oEffectiveParameters = deepExtend({}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        var sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];
        var sSapSystemDataSrc = oEffectiveParameters["sap-system-src"] && oEffectiveParameters["sap-system-src"][0];

        // in the Webgui case, the sap-system intent parameter is *not* part of the final url
        oResolutionResult["sap-system"] = sSapSystem;
        delete oEffectiveParameters["sap-system"];

        if (typeof sSapSystemDataSrc === "string") {
            oResolutionResult["sap-system-src"] = sSapSystemDataSrc;
            delete oEffectiveParameters["sap-system-src"];
        }

        var aUnneccessaryParameters = getUnnecessaryWebguiParameters(oEffectiveParameters, oInbound || {});
        removeObjectKey(oEffectiveParameters, aUnneccessaryParameters);

        return new Promise(function (fnResolve, fnReject) {
            oSystemAlias.spliceSapSystemIntoURI(oWebguiURI, oInboundResolutionResult.systemAlias, sSapSystem,
                sSapSystemDataSrc, "WEBGUI", oResolutionResult.systemAliasSemantics
                || oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied, fnExternalSystemAliasResolver)
                .fail(fnReject)
                .done(function (oWebguiURI) {
                    // important to extract here to get a potentially modified client
                    var sEffectiveStartupParams
                        = oApplicationTypeUtils.getURLParsing().paramsToString(oEffectiveParameters);

                    // Reconstruct the final url
                    // ASSUMPTION: there are no relevant parameters in the Webgui url, but only Webgui parameters.
                    var sParams = oWebguiURI.search(); // Webgui parameters
                    if (sEffectiveStartupParams) {
                        // append effective parameters to Webgui URL
                        sParams = sParams + ((sParams.indexOf("?") < 0) ? "?" : "&") + sEffectiveStartupParams;
                    }
                    oWebguiURI.search(sParams);

                    // propagate properties from the inbound in the resolution result
                    ["additionalInformation", "applicationDependencies"].forEach(function (sPropName) {
                        if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                            oResolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
                        }
                    });
                    oResolutionResult.url = oWebguiURI.toString();
                    oResolutionResult.text = oInbound.title;
                    oResolutionResult.applicationType = "NWBC";
                    oApplicationTypeUtils.setSystemAlias(oResolutionResult, oInbound.resolutionResult);

                    fnResolve(oResolutionResult);
                });
        });

    }
    function constructNativeWebguiNowrapResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        var oInbound = oMatchingTarget.inbound,
            oResolutionResult = oInbound && oInbound.resolutionResult,
            oForbiddenParameters = {
                "sap-wd-run-sc": true,
                "sap-wd-auto-detect": true,
                "sap-ep-version": true,
                "sap-system": true,
                "sap-system-src": true
            };

        // splice parameters into Webgui url
        var oWebguiURI = new URI(sBaseUrl);

        // construct effective parameters
        /*
        /* NOTE: do not include defaultedParameterNames for wrapped URLs,
         * as they may cause a crash the called application.
         */
        var oEffectiveParameters = deepExtend({}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        var sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];
        var sSapSystemDataSrc = oEffectiveParameters["sap-system-src"] && oEffectiveParameters["sap-system-src"][0];

        // remove "forbidden" parameters
        Object.keys(oEffectiveParameters).forEach(function (sParamName) {
            if (oForbiddenParameters[sParamName.toLowerCase()]) {
                delete oEffectiveParameters[sParamName];
            }
        });

        return new Promise(function (fnResolve, fnReject) {
            oSystemAlias.spliceSapSystemIntoURI(oWebguiURI, oResolutionResult.systemAlias, sSapSystem,
                sSapSystemDataSrc, "NATIVEWEBGUI", oResolutionResult.systemAliasSemantics
                || oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied, fnExternalSystemAliasResolver)
                .fail(fnReject)
                .done(function (oWebguiURI) {
                    var oResolutionResult = blendParamsIntoNativeWebGUI(oMatchingTarget.inbound,
                        oMatchingTarget.mappedIntentParamsPlusSimpleDefaults, oWebguiURI);

                    fnResolve(oResolutionResult);
                });
        });

    }

    /**
     * blends parameters of oMatchingTarget into the oWebguiURI,
     * then sets the altered URI constructing a resolution result in oMatchingTarget
     *
     * @param {object} oInbound
     *   The original inbound
     *
     * @param {object} oMappedIntentParamsPlusSimpleDefaults
     *   The set of mapped parameters including simple default parameters
     *
     * @param {function} oWebguiURI
     *   A (native) WebGui URI Object
     *
     * @returns {object} oResolutionResult
     *
     * Note: the method mutates oWebguiURI
     * @private
     */
    function blendParamsIntoNativeWebGUI (oInbound, oMappedIntentParamsPlusSimpleDefaults, oWebguiURI) {
        var oForbiddenParameters = {
                "sap-wd-run-sc": true,
                "sap-wd-auto-detect": true,
                "sap-ep-version": true,
                "sap-system": true
            };

        var oResolutionResult = {};

        // construct effective parameters
        /*
        /* NOTE: do not include defaultedParameterNames for wrapped URLs,
         * as they may cause a crash the called application.
         */
        var oEffectiveParameters = deepExtend({}, oMappedIntentParamsPlusSimpleDefaults);
        var sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];
        var sSapSystemDataSrc = oEffectiveParameters["sap-system-src"] && oEffectiveParameters["sap-system-src"][0];
        // before deleting forbidden parameters, back-up sap-system and sap-system-src
        oResolutionResult["sap-system"] = sSapSystem;
        if (typeof sSapSystemDataSrc === "string") {
            oResolutionResult["sap-system-src"] = sSapSystemDataSrc;
        }

        // remove "forbidden" parameters
        Object.keys(oEffectiveParameters).forEach(function (sParamName) {
            if (oForbiddenParameters[sParamName.toLowerCase()]) {
                delete oEffectiveParameters[sParamName];
            }
        });

        var aUnneccessaryParameters = getUnnecessaryWebguiParameters(oEffectiveParameters, oInbound || {});
        removeObjectKey(oEffectiveParameters, aUnneccessaryParameters);

        var oEffectiveParametersToAppend = getWebguiNonBusinessParameters(oEffectiveParameters);
        removeObjectKey(oEffectiveParameters, Object.keys(oEffectiveParametersToAppend));

        // Reconstruct the final url
        // ASSUMPTION: there are no relevant parameters in the Webgui url, but only Webgui parameters.

        var sParams = oWebguiURI.search(); // Webgui parameters
        var sParamsInterpolated = sParams
            .split("&")
            .map(function (sQueryParam) {
                var aNonBusinessParam;
                // interpolate effective parameter in the correct
                // place within the ~transaction parameter

                if (!isWebguiBusinessParameter(sQueryParam)) { // non-business parameters go in the end
                    // we need name = value
                    if (sQueryParam.indexOf("=") >= 0) {

                        aNonBusinessParam = sQueryParam.split("=");
                        if (!oEffectiveParametersToAppend.hasOwnProperty(aNonBusinessParam[0])) {
                            // effective parameters have precedence
                            oEffectiveParametersToAppend[
                                aNonBusinessParam[0] // name
                            ] = aNonBusinessParam[1]; // value
                        }

                    } else {
                        Log.error(
                            "Found no '=' separator of Webgui non-business parameter. Parameter will be skipped.",
                            "'" + sQueryParam + "'",
                            "sap.ushell.services.ClientSideTargetResolution"
                        );
                    }

                    return undefined; // do not append the parameter
                }

                var sInterpolatedQueryParam;
                if (sQueryParam.indexOf("?%7etransaction") === 0 ||
                    sQueryParam.indexOf("%7etransaction") === 0) { // found transaction

                    // treat transaction as if it was a query parameter
                    sInterpolatedQueryParam = injectEffectiveParametersIntoWebguiQueryParam(
                        sQueryParam,
                        oEffectiveParameters,
                        "%3b", // parameter separator -> ";"
                        "%3d" // parameter assign delimiter -> "="
                    );
                    return sInterpolatedQueryParam;
                }
                return sQueryParam;
            })
            .filter(function (sParam) {
                return typeof sParam !== "undefined";
            }) // remove skipped parameters
            .join("&");

        // append non business parameters
        var sEffectiveParamsToAppend =
            oApplicationTypeUtils.getURLParsing().paramsToString(oEffectiveParametersToAppend);
        sParamsInterpolated = [
            sParamsInterpolated,
            sEffectiveParamsToAppend.replace("~", "%7e") // encodeURIComponent escapes all characters except:
            // alphabetic, decimal digits, - _ . ! ~ * ' ( )'
        ].join("&");

        oWebguiURI.search(sParamsInterpolated);

        // propagate properties from the inbound in the resolution result
        ["additionalInformation", "applicationDependencies", "sap.platform.runtime"].forEach(function (sPropName) {
            if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                oResolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
            }
        });
        oResolutionResult.url = oWebguiURI.toString();
        oResolutionResult.text = oInbound.title;
        oResolutionResult.applicationType = "TR"; // Triggers native navigation
        oApplicationTypeUtils.setSystemAlias(oResolutionResult, oInbound.resolutionResult);

        return oResolutionResult;
    }

    /**
     * Finds and returns webgui non-business parameters.
     *
     * @param {object} oParams
     *   set of WebGUI parameters
     *
     * @return {object}
     *   the set of non-business parameters
     *
     * @private
     */
    function getWebguiNonBusinessParameters (oParams) {
        var oNonBusinessParams;

        oNonBusinessParams = oCSTRUtils.filterObject(oParams, function (sKey, sVal) {
            return !isWebguiBusinessParameter(sKey, sVal);
        });

        return oNonBusinessParams;
    }

    /**
     * Parses Native Webgui query parameter
     *
     * @param {string} sTransactionQueryParam
     *   The full ~transaction query parameter with or without question
     *   mark. E.g., <code>?%7etransaction=*SU01%20p1%3d%3bP2=v2</code>
     *
     * @returns {object}
     *   An object containing the parsed parts of the URL parameter
     *
     * @private
     */
    function parseWebguiTransactionQueryParam (sTransactionQueryParam) {
        var sTransactionValueRe = "^(.+?)(%20|(%20)(.+))?$",
            reTransactionValue = new RegExp(sTransactionValueRe, "i"),
            sTransactionValue,
            oParsed = {
                hasParameters: null, // whether actual parameters are passed to the transaction
                transactionParamName: "", // ?%7etransaction or %7etransaction
                transactionCode: "", // SU01 or *SU01
                parameters: [] // { name: ..., value: ... }
            };

        var aParamNameValues = sTransactionQueryParam.split("=");

        if (aParamNameValues.length > 2) {
            return {
                "error": "Found more than one assignment ('=') in the transaction query parameter",
                "details": "Only one '=' sign is expected in " + sTransactionQueryParam
            };
        }

        if (aParamNameValues.length < 2 || typeof aParamNameValues[1]
            === "undefined" || aParamNameValues[1].length === 0) {
            return {
                "error": "The transaction query parameter must specify at least the transaction name",
                "details": "Got " + sTransactionQueryParam + " instead."
            };
        }

        oParsed.transactionParamName = aParamNameValues[0];
        sTransactionValue = aParamNameValues[1];

        var aMatch = sTransactionValue.match(reTransactionValue);
        if (!aMatch) {
            return {
                "error": "Cannot parse ~transaction query parameter value.",
                "details": sTransactionValue + " should match /" + sTransactionValueRe + "/"
            };
        }

        oParsed.transactionCode = aMatch[1];
        if (aMatch[2] && aMatch[2] !== "%20") { // if !== "%20" -> matches (%20)(.+)
            // must parse parameters
            var sTransactionParams = aMatch[4] || "";
            sTransactionParams
                .split("%3b") // i.e., "="
                .forEach(function (sNameAndValue) {
                    var aNameAndValue = sNameAndValue.split("%3d"),
                        sParamName = aNameAndValue[0];

                    if (sParamName && typeof sParamName === "string" && sParamName.length > 0) { // no empty names
                        oParsed.parameters.push({
                            name: sParamName,
                            value: aNameAndValue[1]
                        });
                    }
                });
        }

        // post parsing adjustments

        // detect whether the transaction name had a '*' or if the * was
        // added because of parameters.
        // NOTE: **SU01 would be a valid tcode
        oParsed.hasParameters = false;
        if (oParsed.parameters.length > 0) {
            oParsed.hasParameters = true;

            // must remove the starting "*" from the transaction code if
            // any is found (was added because of parameters).
            oParsed.transactionCode = oParsed.transactionCode.replace(/^[*]/, "");
        }

        return oParsed;
    }


    /**
     * Interpolates the given parameters into the webgui ~transaction parameter.
     *
     * The method tries to intepolate the given parameters after the
     * transaction code present in the given ~transaction parameter.
     *
     * <p>For example, given the query string
     * <code>?%7etransaction=SU01</code>
     *
     * and the parameter object
     * <pre>
     * {
     *    B: ["C"],
     *    C: ["D"]
     * }
     * </pre>, the following string is returned:
     * <code>?%7etransaction=*SU01%20B%3dC%3bC%3dD</code
     *
     * @param {string} sTransactionQueryParam
     *   The whole ~transaction parameter. Must start with "?%7etransaction" or "%7etransaction".
     *   For example <ul
     *   <li><code>%7etransaction=*SU01%20AAAA%3d4321</code> (with AAAA=4321 parameter)</li>
     *   <li><code>?%7etransaction=SU01</code> (no parameters)</li>
     *   </ul>
     * @param {object} oParamsToInject
     *   An object ating the parameters that need to be interpolated
     *   into <code>sTransactionQueryParam</code>.
     *
     * @return {string}
     *   The interpolated ~transaction parameter (the leading ? is
     *   preserved if passed).  The transaction code will have the form
     *   <code>*[CODE]%20[PARAMETERS]]</code> only when the transaction
     *   will be called with parameters, otherwise the format would be
     *   <code>[CODE]</code>.
     */
    function injectEffectiveParametersIntoWebguiQueryParam (sTransactionQueryParam, oParamsToInject) {
        var oParsedTransactionQueryParam = parseWebguiTransactionQueryParam(sTransactionQueryParam);
        if (oParsedTransactionQueryParam.error) {
            Log.error(
                oParsedTransactionQueryParam.error,
                oParsedTransactionQueryParam.details,
                "sap.ushell.services.ClientSideTargetResolution"
            );
            return sTransactionQueryParam;
        }

        // Inject parameters
        var aParametersFinal = oParsedTransactionQueryParam.parameters.map(function (oParameter) {
            return oParameter.name.toUpperCase() + "%3d" + oParameter.value;
        });

        //extract the DYNP_SKIP_SEL_SCREEN parameter that indicates whether to
        // show the selection screen even if parameters are sent
        var sDybpSkipSelScreen,
            bAllwaysShowSelScreen = true;
        if (oParamsToInject.hasOwnProperty("DYNP_SKIP_SEL_SCREEN")) {
            sDybpSkipSelScreen = oParamsToInject["DYNP_SKIP_SEL_SCREEN"];
            delete oParamsToInject["DYNP_SKIP_SEL_SCREEN"];
            if (sDybpSkipSelScreen[0] === "" ||
                sDybpSkipSelScreen[0] === " " ||
                sDybpSkipSelScreen[0] === "0" ||
                sDybpSkipSelScreen[0] === 0 ||
                (sDybpSkipSelScreen[0] && sDybpSkipSelScreen[0].toLowerCase() === "false")) {
                bAllwaysShowSelScreen = false;
            }
        }

        // Turn all names upper case
        var oParamsToInjectUpperCase = {};
        Object.keys(oParamsToInject).forEach(function (sKey) {
            oParamsToInjectUpperCase[sKey.toUpperCase()] = oParamsToInject[sKey];
        });
        // NOTE: privparamsToString treats delimiters verbatim and encodes
        //       the parameters if necessary.
        //       Therefore we pass the delimiters already encoded!
        //
        var sParamsToInject = oApplicationTypeUtils.getURLParsing().privparamsToString(
            oParamsToInjectUpperCase,
            "%3b", // parameters delimiter
            "%3d" // assigment
        );
        if (sParamsToInject) {
            aParametersFinal.push(sParamsToInject);
        }

        // Note: do not rely on oParsedTransactionQueryParam as we may
        // still have injected parameters here.
        var bHasParameters = aParametersFinal.length > 0;

        return oParsedTransactionQueryParam.transactionParamName + "=" +
            (bHasParameters && bAllwaysShowSelScreen ? "*" : "") +
            oParsedTransactionQueryParam.transactionCode + (bHasParameters ? "%20" : "") + aParametersFinal.join("%3b");
    }

    /**
     * Produces a resolution result "from" nothing (but either a
     * Shell-startURL intent or a  appdescriptor information
     * like Shell-startGUI or Shell-startWDA.
     *
     * @param {object} oIntent
     *   The intent to be resolved. It must have semantic object action #Shell-startGUI
     *   If is assumed to have a sap-system and sap-ui2-tcode parameter
     *
     * @param {object} oMatchingTarget
     *   The matching target, an oInbound.resolutionResult["sap.platform.runtime"] member will be propagated
     *
     *   a System Alias in the TM will not be used
     * @returns {Promise}
     *   A promise that resolved with the Matching Target(!) amended with the resolution result generated from
     *   the given intent, or rejects with an error message.
     *
     * @private
     */
    function resolveEasyAccessMenuIntentWebgui (oIntent, oMatchingTarget, fnExternalSystemAliasResolver) {
        return new Promise(function (fnResolve, fnReject) {
            var sSapSystemDataSrc;
            if (oIntent.params["sap-system-src"]) {
                sSapSystemDataSrc = oIntent.params["sap-system-src"][0];
            }
            var sSapSystem = oIntent.params["sap-system"] ? oIntent.params["sap-system"][0] : undefined;
            var sSapTcode = oIntent.params["sap-ui2-tcode"] ? oIntent.params["sap-ui2-tcode"][0] : undefined;

            buildNativeWebGuiURI( sSapTcode, sSapSystem, sSapSystemDataSrc, fnExternalSystemAliasResolver)
                .done(function (oURI) {
                    delete oMatchingTarget.intentParamsPlusAllDefaults["sap-ui2-tcode"];
                    // rename Parameters
                    oParameterMapping.mapParameterNamesAndRemoveObjects(oMatchingTarget);
                    var oResolutionResult = blendParamsIntoNativeWebGUI(oMatchingTarget.inbound,
                        oMatchingTarget.mappedIntentParamsPlusSimpleDefaults, oURI);
                    if (oResolutionResult && oMatchingTarget.inbound && oMatchingTarget.inbound.resolutionResult
                        && oMatchingTarget.inbound.resolutionResult["sap.platform.runtime"]) {
                        oResolutionResult["sap.platform.runtime"] =
                            oMatchingTarget.inbound.resolutionResult["sap.platform.runtime"];
                    }
                    oResolutionResult["sap-system"] = sSapSystem;
                    oResolutionResult.text = sSapTcode;
                    oResolutionResult.url = oApplicationTypeUtils.appendParametersToUrl("sap-iframe-hint=GUI", oResolutionResult.url);
                    fnResolve(oResolutionResult);
                })
                .fail(function (sError) {
                    fnReject(sError);
                });
        });
    }


    return {
        generateTRResolutionResult: generateTRResolutionResult,
        resolveEasyAccessMenuIntentWebgui: resolveEasyAccessMenuIntentWebgui,

        // for testing
        injectEffectiveParametersIntoWebguiQueryParam: injectEffectiveParametersIntoWebguiQueryParam,
        injectEffectiveParametersIntoWebguiPobjectParam: injectEffectiveParametersIntoWebguiPobjectParam,
        amendGuiParam: amendGuiParam,
        parseWebguiTransactionQueryParam: parseWebguiTransactionQueryParam,
        getWebguiNonBusinessParameters: getWebguiNonBusinessParameters,
        getWebguiBusinessParameters: getWebguiBusinessParameters,
        isWebguiBusinessParameter: isWebguiBusinessParameter,
        buildNativeWebGuiURI: buildNativeWebGuiURI,
        constructFullWebguiResolutionResult: constructFullWebguiResolutionResult
    };



}, /* bExport = */ false);
