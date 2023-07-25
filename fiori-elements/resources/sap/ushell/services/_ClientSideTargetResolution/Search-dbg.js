// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview
 *
 * Exposes methods to perform ClientSideTargetResolution search algorithm.
 *
 * <p>This is a dependency of ClientSideTargetResolution.  Interfaces exposed
 * by this module may change at any time without notice.</p>
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/ushell/services/_ClientSideTargetResolution/Utils",
    "sap/ushell/services/_ClientSideTargetResolution/VirtualInbounds",
    "sap/ushell/services/_ClientSideTargetResolution/Formatter",
    "sap/ushell/TechnicalParameters",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery"
], function (oUshellUtils, oUtils, oVirtualInbounds, oFormatter, oTechnicalParameters, Log, jQuery) {
    "use strict";

    // Latter entries give a certain technology a higher precedence
    var A_TECHNOLOGY_PRIORITY = [undefined, "GUI", "WDA", "UI5" /* comes first */ ];

    /**
     * Transform a matching result into a string for tie-breaking during sort.
     *
     * @param {object} oMatchResult
     *    The match result
     * @param {boolean} bIncludeFieldNames
     *    Whether to include the name of the field being serialized in the
     *    output string. This option should be used for debugging purposes
     *    only.
     *
     * @returns {string}
     *    The serialized match result
     *
     * @see {@link #_getMatchingInbounds}
     * @private
     */
    function serializeMatchingResult (oMatchResult, bIncludeFieldNames) {
        var oResolutionResult = oMatchResult.inbound.resolutionResult;
        if (!oResolutionResult) {
            return "";
        }

        return [
            "applicationType",
            "ui5ComponentName",
            "url",
            "additionalInformation",
            "text"
        ].map(function (sKey) {
            if (bIncludeFieldNames) {
                return oResolutionResult.hasOwnProperty(sKey) ? sKey + ":" + oResolutionResult[sKey] : "";
            }
            return oResolutionResult.hasOwnProperty(sKey) ? oResolutionResult[sKey] : "";
        }).join("");
    }

    /**
     * Sorts match results deterministically, using the priority string in the
     * match result and an integer sap-priority if present.
     *
     * @param {object[]} aMatchResults
     *    The matching results
     *
     * @private
     */
    function sortMatchingResultsDeterministic (aMatchResults) {
        // deterministic sorting
        return aMatchResults.sort(function (oMatchResult1, oMatchResult2) {
            if ((oMatchResult1["sap-priority"] || 0) - (oMatchResult2["sap-priority"] || 0) !== 0) {
                return -((oMatchResult1["sap-priority"] || 0) - (oMatchResult2["sap-priority"] || 0));
            }
            if (oMatchResult1.priorityString < oMatchResult2.priorityString) {
                return 1;
            }
            if (oMatchResult1.priorityString > oMatchResult2.priorityString) {
                return -1;
            }

            // make it deterministic
            var sSerializedResult1 = serializeMatchingResult(oMatchResult1);
            var sSerializedResult2 = serializeMatchingResult(oMatchResult2);

            if (sSerializedResult1 < sSerializedResult2) {
                return 1;
            } else if (sSerializedResult1 > sSerializedResult2) {
                return -1;
            }

            return 0; // Must return 0 for IE/Edge, BCP: 1880596257
        });
    }

    /**
     * Extract an integer value from a parameter "sap-priority" if present
     * among the intent parameters, and adds it to the passed mutated
     * object.
     *
     * @param {object} oIntentParams
     *    The intent parameters that may contain the "sap-priority" to be
     *    parsed.
     * @param {object} oMutated
     *    The mutated object to write the parsed "sap-priority" parameter
     *    to.
     *
     * @private
     */
    function extractSapPriority (oIntentParams, oMutated) {
        var iSapPriority;
        if (oIntentParams && oIntentParams["sap-priority"] && oIntentParams["sap-priority"][0]) {
            iSapPriority = parseInt(oIntentParams["sap-priority"][0], 10);
            if (!isNaN(iSapPriority)) {
                oMutated["sap-priority"] = iSapPriority;
            }
        }
        return;
    }

    /**
     * Checks that a value matches a filter.
     *
     * @param {string} sValue
     *    Filter value to test, may be undefined or string
     * @param {object} oFilter
     *    Filter object as defined in app descriptor input signature, may
     *    be undefined.
     * @param {object} oKnownReferenceIn
     *    The set of known reference values. See {@link #matchIntentToInbounds}
     * @param {object} oMissingReferenceOut
     *    The set of missing references. See {@link #matchIntentToInbounds}
     *
     * @returns {boolean}
     *    Match result
     *
     * @private
     */
    function matchesFilter (sValue, oFilter, oKnownReferenceIn, oMissingReferenceOut) {
        var sFilterValue;

        if (!oFilter) {
            return true; // no filter -> match
        }
        if (!sValue && sValue !== "") {
            return false;
        }

        sFilterValue = oFilter.value;

        if (oFilter.format === "reference") {
            // potentially remove these inbounds already in adapter
            if (/UserDefault\.extended\./.test(sFilterValue)) {
                Log.error("Illegal inbound: extended user default '" + sFilterValue + "' used as filter");
                return false;
            }
            // if we have this value, check if it matches...
            if (oKnownReferenceIn.hasOwnProperty(sFilterValue)) {
                return sValue === oKnownReferenceIn[sFilterValue];
            }

            // ...or save reference if found for the first time
            oMissingReferenceOut[sFilterValue] = true;

            return true;
        }
        if (oFilter.format === "value" || oFilter.format === "plain" || oFilter.format === undefined) {
            return sValue === oFilter.value;

        } else if (oFilter.format === "regexp") {
            return !!sValue.match("^" + oFilter.value + "$");

        }
            Log.error("Illegal oFilter format");
            return false;

    }

    /**
     * An internal helper that serves as a getter of the technology of a
     * given matched target.
     *
     * @param {object} oMatchResult
     *   The matched target.
     *
     * @returns {string}
     *   The technology of the given matched target.
     */
    function getTechnology (oMatchResult) {
        return oMatchResult.inbound &&
            oMatchResult.inbound.resolutionResult &&
            oMatchResult.inbound.resolutionResult["sap.ui"] &&
            oMatchResult.inbound.resolutionResult["sap.ui"].technology;
    }

    /**
     * An internal helper that serves as a getter of the app id of a
     * given matched target.
     *
     * @param {object} oMatchResult
     *   The matched target.
     *
     * @returns {string}
     *   The app id of the given matched target.
     */
    function getAppId (oMatchResult) {
        return oMatchResult.inbound &&
            oMatchResult.inbound.resolutionResult &&
            oMatchResult.inbound.resolutionResult.appId;
    }


    /**
     * Construct the effective parameter list. This is the union of:
     * <ul>
     *   <li>Intent parameters minus the sap-ushell-defaultedParameterNames
     *   if present (it's a output only reserved parameter).</li>
     *   <li>Any inbound parameter with a known (resolved reference
     *   or plain value) <code>defaultValue</code> specified.</li>
     * </ul>
     *
     * <p>Reference default values will not be part of the effective parameter
     * list if their value is yet to be determined.</p>
     *
     * @param {object} oIntentParams
     *    Intent parameter object (not modified!)
     * @param {object} oSignatureParams
     *    Signature structure
     * @param {object} oKnownReferenceIn
     *    The input user default reference object. See {@link #match}
     * @param {string[]} aMissingReferenceIfMatch
     *    Parameters that should be added as missing parameters in case the match is successful
     * @param {string[]} aDefaultedParamNames
     *    Output array of parameters that were not present in the signature
     *
     * @returns {object}
     *    The effective parameter list.
     * <p>
     * NOTE: may be a shallow copy of actual parameter arrays!
     * </p>
     *
     * @private
     * @since 1.32.0
     */
    function addDefaultParameterValues (oIntentParams, oSignatureParams, oKnownReferenceIn, aMissingReferenceIfMatch, aDefaultedParamNames) {
        var oIntentParamsPlusDefaults = {},
            oDefaultedParameters = {}; // keeps unique entries

        // add the intent parameters first (exclude the sap-ushell-defaultedParamNames)
        Object.keys(oIntentParams).forEach(function (sParamName) {
            // this parameter is output only, and must be ignored during resolveHashFragment
            if (sParamName !== "sap-ushell-defaultedParameterNames") {
                oIntentParamsPlusDefaults[sParamName] = oIntentParams[sParamName];
            }
        });

        if (!oSignatureParams) {
            return oIntentParamsPlusDefaults;
        }

        // add default parameters on top
        Object.keys(oSignatureParams).forEach(function (sParamName) {
            var oTmSignatureParam = oSignatureParams[sParamName],
                sTmSignatureParamDefaultValue,
                bValueKnown = false;

            if (!oIntentParamsPlusDefaults[sParamName] && oTmSignatureParam.hasOwnProperty("defaultValue")) {

                if (oTmSignatureParam.defaultValue.format &&
                    oTmSignatureParam.defaultValue.format === "reference") {

                    // is there a known value for this reference?
                    sTmSignatureParamDefaultValue = oTmSignatureParam.defaultValue.value;
                    if (oKnownReferenceIn.hasOwnProperty(sTmSignatureParamDefaultValue)) {
                        // Simple user defaults
                        if (typeof oKnownReferenceIn[sTmSignatureParamDefaultValue] === "string") {
                            // ... user default value was found
                            oIntentParamsPlusDefaults[sParamName] = [oKnownReferenceIn[sTmSignatureParamDefaultValue]];
                            bValueKnown = true;
                        } else if (typeof oKnownReferenceIn[sTmSignatureParamDefaultValue] === "object") {
                            // Extended user defaults
                            oIntentParamsPlusDefaults[sParamName] = oKnownReferenceIn[sTmSignatureParamDefaultValue];
                            bValueKnown = true;
                        }
                        // else discard this default parameter
                    } else {
                        // ... no user default value found
                        oIntentParamsPlusDefaults[sParamName] = [oTmSignatureParam.defaultValue]; // NOTE: ref

                        aMissingReferenceIfMatch.push(oTmSignatureParam.defaultValue.value);
                    }
                } else {
                    oIntentParamsPlusDefaults[sParamName] = [oTmSignatureParam.defaultValue.value];
                    bValueKnown = true;
                }

                // Important, only add known values!
                if (bValueKnown) {
                    oDefaultedParameters[sParamName] = true;
                }
            }
        });

        Object.keys(oDefaultedParameters).sort().forEach(function (sParam) {
            aDefaultedParamNames.push(sParam);
        });

        return oIntentParamsPlusDefaults;
    }

    /**
     * Extract and prepare early resolution result.
     *
     * @param {object} oMatchResult
     *   An object representing a match result
     * @param {object} oInbound
     *   The inbound
     * @private
     *
     */
    function constructEarlyResolutionResult (oMatchResult, oInbound) {
        oMatchResult.resolutionResult = {
            contentProviderId: oInbound.contentProviderId
        };
        if (oInbound && oInbound.resolutionResult && oInbound.resolutionResult.hasOwnProperty("sap.platform.runtime")) {
            oMatchResult.resolutionResult["sap.platform.runtime"] = oInbound.resolutionResult["sap.platform.runtime"];
        }
        // here we fill a map of all oNewAppStateMembers
        // to identify the relevant names to retrieve
        Object.keys(oMatchResult.intentParamsPlusAllDefaults).slice(0).forEach(function (sName) {
            if (!Array.isArray(oMatchResult.intentParamsPlusAllDefaults[sName])) {
                if (!oMatchResult.resolutionResult.oNewAppStateMembers) {
                    oMatchResult.resolutionResult.oNewAppStateMembers = {};
                }
                oMatchResult.resolutionResult.oNewAppStateMembers[sName] = oMatchResult.intentParamsPlusAllDefaults[sName];
            }
        });
    }

    /**
     * Update oMissingReferenceOut (containing filter user defaults)
     * with any default parameters that were found during defaulting.
     *
     * @param {array} aReferenceIfMatch
     *     The user default references that must be added to
     *     <code>oUserDefaultRefsOut</code> if the match occurred
     * @param {object} oMissingReferenceOut
     *     The user default references required to perform a
     *     non-approximate matching
     *
     * @private
     *
     */
    function addFoundParametersToRefs (aReferenceIfMatch, oMissingReferenceOut) {
        aReferenceIfMatch.forEach(function (sRefValue) {
            oMissingReferenceOut[sRefValue] = true;
        });
    }

    /**
     * Returns a number that indicates whether the "sap-ui-tech-hint"
     * parameter in a matched target matches the value of the
     * "sap-ui-tech-hint" URL parameter.
     *
     *
     * @param {object} oMatchResult
     *   The matching target.
     *
     * @returns {number}
     *   Matching can occur at different levels, depending whether the a
     *   default or required parameter has matched. Therefore the result is
     *   manyfold, as follows:
     *
     *   <ul>
     *   <li><b>2</b>: the "sap-ui-tech-hint" parameter matched a required parameter</li>
     *   <li><b>1</b>: the "sap-ui-tech-hint" parameter matched a default parameter</li>
     *   <li><b>0</b>: the "sap-ui-tech-hint" parameter did not match.
     *   </ul>
     *
     * @private
     */
    function calculateTechnologyMatch (oMatchResult) {
        var sTechHintParamValue = oMatchResult.intentParamsPlusAllDefaults["sap-ui-tech-hint"] && oMatchResult.intentParamsPlusAllDefaults["sap-ui-tech-hint"][0];

        var bIsDefault = oMatchResult.defaultedParamNames && (oMatchResult.defaultedParamNames.indexOf("sap-ui-tech-hint") >= 0);

        if (sTechHintParamValue && getTechnology(oMatchResult) === sTechHintParamValue) {
            // matches!
            return bIsDefault ? 1 : 2;
        }
        return 0;
    }

    /**
     * Returns a number that indicates whether the "appId"
     * parameter in a matched target matches the value of the
     * "sap-ui-app-id-hint" URL parameter.
     *
     *
     * @param {object} oMatchResult
     *   The matching target.
     *
     * @returns {number}
     *   An integer representing the match result.
     *
     *   <ul>
     *   <li><b>1</b>: the "sap-ui-app-id-hint" parameter matched </li>
     *   <li><b>0</b>: the "sap-ui-app-id-hint" parameter did not match.
     *   </ul>
     *
     * @private
     */
    function isAppIdMatch (oMatchResult) {
        var sAppIdHintParamValue = oMatchResult.intentParamsPlusAllDefaults["sap-ui-app-id-hint"] && oMatchResult.intentParamsPlusAllDefaults["sap-ui-app-id-hint"][0];
        if (sAppIdHintParamValue && (sAppIdHintParamValue === getAppId(oMatchResult))) {
            return 1;
        }
        return 0;
    }

    function createSortString (oMatchResult, oMatchingInboundStats) {
        function addLeadingZeros (iNumber) {
            var s = "000" + iNumber;
            return s.substr(s.length - 3);
        }
        return [
            /*
             * General idea: the inbound that fits best to the
             * intent has priority.
             *
             * NOTE1: when it comes to the digits, we later sort from large
             *        to small. So a higher number 005 has precedence over
             *        a lower number 003.
             *
             * NOTE2: all intent parameters are matching the inbound at
             *        this point.
             *
             * Terminology:
             *
             * - Required parameter: a parameter that appears in the Inbound
             *   signature with the flag "required = true".
             *
             * - Filter parameter: a parameter that appears in the Inbound
             *   signature in the form "filter: { value: ... }" or
             *   "filter: {}".
             *
             * - Default parameter: a parameter that appears in the Inbound
             *   signature in the form "defaultValue: { value: ... }" or
             *   "defaultValue: {}".
             *
             * - Defaulted parameter: a default parameter with a specified
             *   value that will be added to the intent parameter if match
             *   occurred.
             *
             * - Free parameter: a parameter of the Inbound
             *   signature that is not an intent parameter.
             *
             * NOTE: a certain parameter can specify
             * filter/default/required at the same time. E.g., {
             *    "param": {
             *       required: true,
             *       filter: {}, // param must exist
             *       defaultValue: {
             *          value: "apple" // will be defaulted to "apple" if not specified
             *       }
             *    }
             *
             * }
             */

            /*
             * AppIdmatch: whether the app with the id is explicitly specified
             * and matches (1) or not (0)
             *
             */
            "AIDM=" + isAppIdMatch(oMatchResult),
            /*
             * Current content provider: whether the sap-app-origin-hint matches
             * the contentProviderId from the inbound (1) or not (0)
             *
             */
            "CURCP=" + (oMatchingInboundStats.isCurrentContentProvider ? "1" : "0"),
            /*
             * Exact SemanticObject matches have priority
             *
             * g: generic  x: explicit/exact semantic object (NOTE: "x" > "g")
             */
            oMatchResult.genericSO ? "g" : "x",
            /**
             * Techmatch: whether the technology is explicitly specified
             * and matches (1) or not (0)
             *
             */
            "TECM=" + calculateTechnologyMatch(oMatchResult),
            /**
             * Number of matching parameters.
             *
             * Number of inbound parameters that match the intent. For
             * filter parameters, the corresponding intent parameter must
             * have a matching value specified.
             */
            "MTCH=" + addLeadingZeros(oMatchingInboundStats.countMatchingParams),
            /*
             * Number of matching required parameters.
             *
             * Number inbound parameters that match the intent and
             * are required.
             */
            "MREQ=" + addLeadingZeros(oMatchingInboundStats.countMatchingRequiredParams),
            /*
             * Number of Matching filter parameters.
             *
             * Number inbound parameters that match the intent and specify
             * a filter value.
             */
            "NFIL=" + addLeadingZeros(oMatchingInboundStats.countMatchingFilterParams),
            /*
             * Number of Defaulted parameters
             *
             * Inbound parameters that are not part of the intent
             * but specify a default value (defaulted parameters).
             */
            "NDEF=" + addLeadingZeros(oMatchingInboundStats.countDefaultedParams),
            /*
             * Number of Potentially matching parameters
             *
             * Intent parameters that can potentially match the inbound.
             */
            "POT=" + addLeadingZeros(oMatchingInboundStats.countPotentiallyMatchingParams),
            /*
             * Reverse number of inbound parameters that were not found in
             * the intent (free parameters).
             */
            "RFRE=" + addLeadingZeros(999 - oMatchingInboundStats.countFreeInboundParams),
            /*
             * Technology preference
             */
            "TECP=" + getTechnologyPriority(oMatchResult)
        ].join(" ");
    }



    /**
     * Returns the priority of the technology specified in the given
     * matched target.
     *
     * @param {object} oMatchResult
     *   The match result.
     *
     * @returns {number}
     *   An integer representing the priority of a the technology in the
     *   given matched target. The higher the number, the more priority has
     *   the technology.
     *
     * @private
     */
    function getTechnologyPriority (oMatchResult) {
        var sTechnology = getTechnology(oMatchResult);
        var iPriority = A_TECHNOLOGY_PRIORITY.indexOf(sTechnology);

        return Math.max(0, iPriority);
    }

    /**
     * Checks whether additional intent parameter (plus defaults) conform
     * to the signature expectation regarding additionalParameters.
     *
     * @param {object} oInbound
     *    The inbound
     * @param {object} oIntentParamsPlusDefaults
     *    The intent parameters (plus defaults)
     *
     * @returns {boolean}
     *    Whether additional intent parameters conform to the signature
     *    expectations.
     *
     * @private
     */
    function checkAdditionalParameters (oInbound, oIntentParamsPlusDefaults) {
        var bAdditionalParametersMatchExpectation = false;

        if (oInbound.signature.additionalParameters === "allowed" ||
            oInbound.signature.additionalParameters === "ignored") {

            return true;
        }

        if (oInbound.signature.additionalParameters === "notallowed" ||
            oInbound.signature.additionalParameters === undefined) {

            bAdditionalParametersMatchExpectation =
                Object.keys(oIntentParamsPlusDefaults).every(function (sParamName) {
                    return !((!oInbound.signature.parameters[sParamName] && sParamName.indexOf("sap-") !== 0));
                });

        } else {
            Log.error("Unexpected value of inbound for signature.additionalParameters");
        }

        return bAdditionalParametersMatchExpectation;
    }

    /**
     * Matches an intent to a set of inbounds.
     *
     * @param {object} oIntent
     *    The parsed shell hash representing an intent.<br />
     *    <br />
     *    NOTE: this method treats the semantic object/action/formFactor
     *    inside the intent literally, as any other semantic
     *    object/action/formFactor string. It is possible, however, to
     *    specify wildcards for semantic object action and formFactor by
     *    setting them to undefined.
     *    <br />
     *    NOTE: if sap-ui-tech-hint[0] is present and
     *    oIntent.treatTechHintAsFilter is truthy, only
     *    inbounds with matching technology are considered
     *
     * @param {array} aInbounds
     *    List of inbound items
     * @param {object} oKnownReferences
     *    An input parameter used during the matching procedure to resolve
     *    reference values of defaults and filters.
     * @param {function} fnContentProviderLoader
     *    The function to get list providers with the list of compatible data origins
     * @param {boolean} bDebugEnabled
     *    Whether should include debugging information
     * @returns {jQuery.Deferred.Promise}
     *
     * A jQuery promise, that always resolves to the following match result
     * structure:
     *
     * <pre>
     *    {
     *        missingReferences: {},
     *        matchResults: [],
     *        noMatchReasons: {}  // filled when debugging is enabled
     *    }
     * </pre>
     *
     */
    function match (oIntent, aInbounds, oKnownReferences, fnContentProviderLoader, bDebugEnabled) {

        function collectDebugInformation (oNoMatchReasons, oMatchResult, oInbound) {
            var sInbound = oFormatter.formatInbound(oInbound);
            oNoMatchReasons[sInbound] = oMatchResult.noMatchReason
                + (oMatchResult.noMatchDebug ? "| DEBUG: " + oMatchResult.noMatchDebug : "");
        }

        var oContentProviderDeferred = fnContentProviderLoader ? fnContentProviderLoader() : new jQuery.Deferred().resolve(null).promise();
        return oContentProviderDeferred.then(function (oContentProviderLookup) {
            var oMatchResults = aInbounds.reduce(function (oResult, oInbound) {
                var sContentProviderId = oInbound.contentProviderId || "";

                var oReferences = oKnownReferences[sContentProviderId] || {};
                if (!oResult.missingReferences[sContentProviderId]) {
                    oResult.missingReferences[sContentProviderId] = {};
                }

                var oMatchResult = matchOne(
                    oIntent,
                    oInbound,
                    oReferences,
                    oResult.missingReferences[sContentProviderId], // it's augmented
                    oContentProviderLookup ? oContentProviderLookup[sContentProviderId] : null
                );

                if (oMatchResult.matches) {
                    oResult.matchResults.push(oMatchResult);
                } else if (bDebugEnabled) {
                    // collect some debugging information
                    collectDebugInformation(oResult.noMatchReasons, oMatchResult, oInbound);
                }

                return oResult;

            }, { // the result
                matchResults: [],
                noMatchReasons: {},
                missingReferences: {}
            });

            return jQuery.when(oMatchResults);
        });

    }

    function matchParameterSignature (oInboundSignatureParameters, oIntentParamsPlusAllDefaults, oIntentParams, aDefaultedParameterNames, oKnownReferenceIn, oMissingReferencesOut) {
        var bSignatureMatches = Object.keys(oInboundSignatureParameters).every(function (sParameterName) {

            var aValues = oIntentParamsPlusAllDefaults[sParameterName],
                sValue = aValues && aValues[0],
                oSignature = oInboundSignatureParameters[sParameterName];

            if (oSignature.required && (sValue === null || sValue === undefined)) {
                // no required parameter present -> fatal
                return false;
            }

            if (oSignature.filter) {

                if (!matchesFilter(sValue, oSignature.filter, oKnownReferenceIn, oMissingReferencesOut)) {
                    // filter does not match -> fatal
                    return false;
                }
            }

            return true;
        });

        return bSignatureMatches;
    }

    /**
     * @typedef {object} InboundStats Inbound statistic based on the intent parameters
     * @property {number} countDefaultedParams Number of the default parameters without technical parameters
     * @property {number} countMatchingParams Number of inbound parameters that match the intent
     * @property {number} countMatchingRequiredParams Number inbound parameters that match the intent and are required.
     * @property {number} countMatchingFilterParams Number inbound parameters that match the intent and specify a filter value.
     * @property {number} countFreeInboundParams Number inbound parameters were not found in the intent
     * @property {number} countPotentiallyMatchingParams Number of intent parameters that can potentially match the inbound.
     * @property {boolean} isCurrentContentProvider Only true if sap-app-origin-hint intent parameter matches contentProviderId from the inbound
     */

    /**
     * Generate inbound statistic which is used for the creation of priorityString
     *
     * @param {object} oInbound inbound
     * @param {object} oIntentParamsPlusAllDefaults intent parameters with default parameters
     * @param {object} oIntentParams intent parameters without default parameters
     * @param {array} aDefaultedParameterNames list of the default parameters
     * @param {boolean} bAdditionalParametersIgnored true if the additional parameters are ignored
     *
     * @returns {InboundStats} Inbound statistic based on the intent parameters
     */
    function generateMatchingInboundStats (oInbound, oIntentParamsPlusAllDefaults, oIntentParams, aDefaultedParameterNames, bAdditionalParametersIgnored) {
        var oInboundSignatureParameters = oInbound.signature.parameters,
            countMatchingParams = 0,
            countMatchingRequiredParams = 0,
            countMatchingFilterParams = 0,
            countFreeInboundParams = 0,
            bIsCurrentContentProvider = false,
            oStats = {};

        function isNotTechnicalParameter (sParameterName) {
            return !oTechnicalParameters.isTechnicalParameter(sParameterName);
        }

        var aIntentParamsWithoutTechnicalParameters = Object.keys(oIntentParams).filter(isNotTechnicalParameter);
        var aDefaultedParameterNamesWithoutTechnicalParameters = aDefaultedParameterNames.filter(isNotTechnicalParameter);

        Object.keys(oInboundSignatureParameters)
            .filter(isNotTechnicalParameter)
            .forEach(function (sParameterName) {
                var aValues = oIntentParamsPlusAllDefaults[sParameterName],
                    sValue = aValues && aValues[0],
                    oSignature = oInboundSignatureParameters[sParameterName],
                    bIsIntentParameter = oIntentParams.hasOwnProperty(sParameterName);

                if (bIsIntentParameter) {
                    ++countMatchingParams;

                    if (oSignature.filter) {
                        ++countMatchingFilterParams;
                    }

                    if (oSignature.required) {
                        ++countMatchingRequiredParams;
                    }
                } else if (sValue === null || sValue === undefined) {
                    ++countFreeInboundParams;
                }
            });


        if (bAdditionalParametersIgnored) {
            // count is reduced in case of ignored additional parameters
            oStats.countPotentiallyMatchingParams = aIntentParamsWithoutTechnicalParameters.filter(function (sIntentParam) {
                return oInboundSignatureParameters.hasOwnProperty(sIntentParam);
            }).length;
        } else {
            oStats.countPotentiallyMatchingParams = aIntentParamsWithoutTechnicalParameters.length;
        }

        if (oIntentParams && oIntentParams["sap-app-origin-hint"] && (oIntentParams["sap-app-origin-hint"][0] || oIntentParams["sap-app-origin-hint"][0] === "")) {
            var sAppContentProviderId = oIntentParams["sap-app-origin-hint"][0];
            bIsCurrentContentProvider = sAppContentProviderId === oInbound.contentProviderId;
        }

        oStats.countDefaultedParams = aDefaultedParameterNamesWithoutTechnicalParameters.length;
        oStats.countMatchingParams = countMatchingParams;
        oStats.countMatchingRequiredParams = countMatchingRequiredParams;
        oStats.countMatchingFilterParams = countMatchingFilterParams;
        oStats.countFreeInboundParams = countFreeInboundParams;
        oStats.isCurrentContentProvider = bIsCurrentContentProvider;

        return oStats;
    }

    /**
     * Perform matching between an intent and the given inbound. The
     * matching procedure takes into account references (to user default
     * values) in filters and default values.<br />
     *
     * <ul>
     *   <li>An inbound with a filter reference (to a user default)
     *     is matched against a given intent if the intent specifies the
     *     filter (name) among its parameters. Otherwise a match does
     *     not occur.
     *   </li>
     *   <li>An inbound with a default reference (to a user default)
     *     is matched as if such default value was not specified in the
     *     inbound signature.
     *   </li>
     * </ul>
     *
     * Any reference value involved in the match will be listed in the
     * "missingReferences" member of the result object. When the match is
     * successful, this indicates that the returned result is a "potential"
     * match. To obtain a final result, this method must be called again with
     * resolved references (supplied via the oKnownReferenceIn parameter).
     *
     * @param {object} oIntent
     *    The parsed shell hash representing an intent.<br />
     *    <br />
     *    NOTE: this method treats the semantic object/action/formFactor
     *    inside the intent literally, as any other semantic
     *    object/action/formFactor string. It is possible, however, to
     *    specify wildcards for semantic object action and formFactor by
     *    setting them to undefined.
     *    <br />
     *    NOTE: if sap-ui-tech-hint[0] is present and
     *    oIntent.treatTechHintAsFilter is truthy, only
     *    inbounds with matching technology are considered
     *
     * @param {object} oInbound
     *    An inbound
     * @param {object} oKnownReferenceIn
     *    An input parameter used during the matching procedure to resolve
     *    reference values of defaults and filters.
     * @param {object} oMissingReferencesOut object to collect missing reference
     * @param {object} [oSupportedDataOrigin] contain all supported data origin for content provider of the inbound
     * @returns {object}
     *    the match result. When a match occurs, this is an object like:
     *
     * <pre>
     *    {
     *        matches: {boolean},
     *        genericSO: {boolean},
     *        inbound: {object},
     *        intentParamsPlusAllDefaults: {object},
     *        resolutionResult: {object},
     *        missingReferences: {object}  // always returned
     *    }
     * </pre>
     *
     * When no matching occurs, the returned object looks like:
     * <pre>
     *    {
     *        missingReferences: {object},  // always returned
     *        matches: false,
     *        matchesVirtualInbound: false,
     *        noMatchReason: "...",
     *        noMatchDebug: "...",     // interpret this in combination with noMatchReason
     *        inbound: {object},
     *        [one or more count* keys]: {number}
     *    }
     * </pre>
     *
     * The missingReferences member contains references to default values that
     * must be resolved. This is not an array for optimization reasons, for
     * example, when providing unique user default values across multiple calls
     * of this method or for quickly finding out when a reference value was
     * already missing in a previous call.
     *
     * The missingReferences object has the form
     *
     * <pre>
     *     {
     *        "UserDefault.Value1": true, // never false (key is not present in case)
     *        "UserDefault.Value2": true
     *        ...
     *     }
     * </pre>
     *
     * @private
     * @since 1.32.0
     */
    function matchOne (oIntent, oInbound, oKnownReferenceIn, oMissingReferencesOut, oSupportedDataOrigin) {
        var oMatchResult = {
                inbound: oInbound
            };

        function fnNoMatch (oResult, sReason, sDebugInfo) {
            oResult.matches = false;
            oResult.noMatchReason = sReason;
            oResult.noMatchDebug = sDebugInfo;
            return oResult;
        }

        function fnMatch (oResult) {
            oResult.matches = true;
            oResult.matchesVirtualInbound = oVirtualInbounds.isVirtualInbound(oInbound);
            oResult.parsedIntent = oIntent;
            return oResult;
        }

        // test the semantic object
        var bIsGenericSemanticObject = oInbound.semanticObject === "*";
        oMatchResult.genericSO = bIsGenericSemanticObject;

        var bSemanticObjectMatches = oIntent.semanticObject === undefined
            || oIntent.semanticObject === oInbound.semanticObject
            || bIsGenericSemanticObject;

        if (!bSemanticObjectMatches) {
            return fnNoMatch(oMatchResult, "Semantic object \"" + oIntent.semanticObject + "\" did not match");
        }

        var bActionMatches = oIntent.action === undefined || oIntent.action === oInbound.action;
        if (!bActionMatches) {
            return fnNoMatch(oMatchResult, "Action \"" + oIntent.action + "\" did not match");
        }

        var bFormFactorMatches = !oInbound.deviceTypes || oIntent.formFactor === undefined || oInbound.deviceTypes[oIntent.formFactor];
        if (!bFormFactorMatches) {
            return fnNoMatch(oMatchResult, "Form factor \"" + oIntent.formFactor + "\" did not match",
                "Inbound: [" + Object.keys(oInbound.deviceTypes)
                .filter(function (sKey) {
                    return !!oInbound.deviceTypes[sKey];
                })
                .join(", ") + "]");
        }

        // test for sap-ui-tech-hint as filter
        var sTechHint = oIntent.params && oIntent.params["sap-ui-tech-hint"] && oIntent.params["sap-ui-tech-hint"][0];
        if (oIntent.treatTechHintAsFilter && sTechHint) {
            var sInboundTech = getTechnology({
                inbound: oInbound
            });
            if (sInboundTech !== sTechHint) {
                return fnNoMatch(oMatchResult, "Tech Hint as filter \"" + sTechHint + "\" did not match",
                    "Inbound: [" + sInboundTech + "]");
            }
        }

        // An array like: [{ refValue: <string>}, ... ] later used to
        // augment oMissingReferences *if* a match occurs.
        var aReferenceIfMatch = [],
            aDefaultedParamNames = [],
            oIntentParams = oIntent.params || {};

        // Expand default values into intent parameters
        var oIntentParamsPlusAllDefaults = addDefaultParameterValues(
            oIntentParams,
            oInbound.signature && oInbound.signature.parameters,
            oKnownReferenceIn,
            aReferenceIfMatch,
            aDefaultedParamNames
        );

        var sSapSystem = oIntentParamsPlusAllDefaults["sap-system"] && oIntentParamsPlusAllDefaults["sap-system"][0],
            sAppOrigin = oIntentParamsPlusAllDefaults["sap-app-origin"] && oIntentParamsPlusAllDefaults["sap-app-origin"][0],
            sInboundContentProviderId = oInbound.contentProviderId;
        //Test navigation to the given content provider
        if (sAppOrigin && sAppOrigin !== sInboundContentProviderId) {
            return fnNoMatch(oMatchResult, "Contetn provider as filter \"" + sAppOrigin + "\" did not match",
                    "Inbound: [" + sInboundContentProviderId + "]");
        }
        //Test that sap-system and content provider is compatible
        if (sSapSystem && typeof sInboundContentProviderId === "string" && oSupportedDataOrigin && !oSupportedDataOrigin[sSapSystem]) {
            return fnNoMatch(
                oMatchResult,
                "Data origin \"" + sSapSystem + "\" is not compatible with the content provider \"" + sInboundContentProviderId + "\"",
                "Inbound: [" + Object.keys(oSupportedDataOrigin).join(", ") + "]");
        }

        oMatchResult.intentParamsPlusAllDefaults = oIntentParamsPlusAllDefaults;
        oMatchResult.defaultedParamNames = aDefaultedParamNames;

        // extractSapPriority
        extractSapPriority(oIntentParamsPlusAllDefaults, oMatchResult);

        // check whether the parameter signature matches
        var bSignatureMatches = matchParameterSignature(
            oInbound.signature.parameters,
            oIntentParamsPlusAllDefaults,
            oIntentParams,
            aDefaultedParamNames,
            oKnownReferenceIn,
            oMissingReferencesOut
        );

        if (!bSignatureMatches) {
            return fnNoMatch(oMatchResult, "Inbound parameter signature did not match",
                oFormatter.formatInboundSignature(oInbound.signature));
        }

        // If multiple parameters map onto the same parameter with renameTo,
        // a value which was explicitly passed dominates all other values
        // we remove the spurious defaulted values.
        var oParameterDominatorMap = oUtils.constructParameterDominatorMap(oInbound.signature.parameters);

        var oDominatedDefaultParametersToRemove = oUtils.findDominatedDefaultParameters(
            oIntentParamsPlusAllDefaults, aDefaultedParamNames, oParameterDominatorMap
        );

        var aDefaultedParameterNamesWithoutDominatedParams =
            aDefaultedParamNames.filter(function (sDefaultedParam) {
                return !oDominatedDefaultParametersToRemove[sDefaultedParam];
            });

        var oIntentParamsPlusAllDefaultsWithoutDominatedParams =
            oUtils.filterObjectKeys(oIntentParamsPlusAllDefaults, function (sDefaultedParam) {
                return !oDominatedDefaultParametersToRemove[sDefaultedParam]; // keep condition
            });

        if (!checkAdditionalParameters(oInbound, oIntentParamsPlusAllDefaultsWithoutDominatedParams)) {
            return fnNoMatch(oMatchResult, "Additional parameters not allowed",
                oFormatter.formatInboundSignature(oInbound.signature));
        }

        var bAdditionalParametersIgnored = oInbound.signature.additionalParameters === "ignored";
        if (bAdditionalParametersIgnored) {
            oUtils.filterObjectKeys(oIntentParamsPlusAllDefaultsWithoutDominatedParams, function (sKey) {
                if (sKey.indexOf("sap-") === 0) {
                    return true; // keep sap params
                }
                if (oInbound.signature.parameters.hasOwnProperty(sKey)) {
                    return true; // keep parameters in the Inbound signature
                }
                return false;
            }, true /* bInPlace */);
        }

        var oMatchingInboundStats = generateMatchingInboundStats(
            oInbound,
            oIntentParamsPlusAllDefaults,
            oIntentParams,
            aDefaultedParamNames,
            bAdditionalParametersIgnored
        );

        constructEarlyResolutionResult(oMatchResult, oInbound);
        oMatchResult.intentParamsPlusAllDefaults = oIntentParamsPlusAllDefaultsWithoutDominatedParams;
        oMatchResult.defaultedParamNames = aDefaultedParameterNamesWithoutDominatedParams;
        oMatchResult.priorityString = createSortString(oMatchResult, oMatchingInboundStats);
        addFoundParametersToRefs(aReferenceIfMatch, oMissingReferencesOut);

        return fnMatch(oMatchResult);
    }

    return {
        match: match,
        matchOne: matchOne,
        sortMatchingResultsDeterministic: sortMatchingResultsDeterministic,
        matchesFilter: matchesFilter,
        checkAdditionalParameters: checkAdditionalParameters,
        addDefaultParameterValues: addDefaultParameterValues,
        extractSapPriority: extractSapPriority,
        serializeMatchingResult: serializeMatchingResult
    };
});
