// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file Exposes utility methods for ClientSideTargetResolution.
 *
 * This is a dependency of ClientSideTargetResolution.
 * Interfaces exposed by this module may change at any time without notice.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/util/deepExtend"
], function (
    deepExtend
) {
    "use strict";

    /**
     * When multiple parameters are renamed to the same parameter via renameTo,
     * the parameter that was explicitly passed in the intent must have priority, all others should be removed.
     *
     * This method finds parameters that are dominated by a non-defaulted (note, NOT necessarily required) parameter.
     *
     * @param {object} oIntentParamsPlusAllDefaults Intent params with defaults map.
     * @param {string[]} aDefaultedParamNames Defaulted Parameter names.
     * @param {object} oParameterDominatorMap See {@link _constructParameterDominatorMap}.
     * @return {object} An object with dominated default parameters that must be deleted:
     * <pre>
     *   {
     *     defaultParam6: true, // value is always true
     *     dominatedParam13: true,
     *     ...
     *   };
     * </pre>
     */
    function findDominatedDefaultParameters (oIntentParamsPlusAllDefaults, aDefaultedParamNames, oParameterDominatorMap) {
        var oDominatedDefaultParameters = {};
        aDefaultedParamNames.forEach(function (sDefaultParamName) {
            var aDominators = oParameterDominatorMap[sDefaultParamName].dominatedBy;
            var bDominatorFound = aDominators.some(function (sDominator) {
                var bDominatorInIntentOrDefault = !!oIntentParamsPlusAllDefaults[sDominator];
                var bDominatorIsNotCurrentParam = sDominator !== sDefaultParamName;
                var bDominatorIsNotDefaultParam = aDefaultedParamNames.indexOf(sDominator) === -1;
                return bDominatorInIntentOrDefault && bDominatorIsNotDefaultParam && bDominatorIsNotCurrentParam;
            });
            if (bDominatorFound) {
                oDominatedDefaultParameters[sDefaultParamName] = true;
            }
        });
        return oDominatedDefaultParameters;
    }

    /**
     * Construct a map that allows to detect which parameters of a given parameter set would be affected if a parameter renaming took place.
     *
     * When a parameter is renamed to an already existing parameter name,
     * the existing parameter name is said to be "dominated" by the parameter that was renamed.
     *
     * @param {object} oParameters An object containing the input parameters to analyze.
     *   <pre>
     *   {
     *     A: { renameTo: "ANew" },
     *     B: { renameTo: "ANew" },
     *     C: {}
     *     D: { renameTo: "C" },
     *     E: {}
     *   }
     *   </pre>
     * @return {object} The parameter dominator map. An object like:
     *   <pre>
     *   { A: { renameTo: "ANew", dominatedBy: ["A", "B"] },
     *   { B: { renameTo: "ANew", dominatedBy: ["A", "B"] },
     *   { C: { renameTo: "C", dominatedBy: ["C", "D"] },
     *   { D: { renameTo: "C", dominatedBy: ["C", "D"] },
     *   { E: { renameTo: "E", dominatedBy: ["E"] }
     *   </pre>
     */
    function constructParameterDominatorMap (oParameters) {
        var oDominatorMap = {},
            oRenameMap = {};

        Object.keys(oParameters).forEach(function (sKey) {
            var sRenameTo = oParameters[sKey].renameTo || sKey;
            oRenameMap[sRenameTo] = oRenameMap[sRenameTo] || {
                renameTo: sRenameTo,
                dominatedBy: []
            };
            oRenameMap[sRenameTo].dominatedBy.push(sKey);
            oRenameMap[sRenameTo].dominatedBy = oRenameMap[sRenameTo].dominatedBy.sort();
            oDominatorMap[sKey] = oRenameMap[sRenameTo];
        });
        return oDominatorMap;
    }

    /**
     * Deletes keys from an object based on a given filter function.
     *
     * @param {object} oObject The object to be filtered (modified in place).
     * @param {object} fnFilterFunction The filter function to decide which keys to delete.
     * @param {boolean} bInPlace Modifies the the given object in place.
     * @returns {object} The filtered object.
     * @private
     */
    function filterObjectKeys (oObject, fnFilterFunction, bInPlace) {
        var oObjectToFilter = bInPlace ? oObject : deepExtend({}, oObject);
        Object.keys(oObjectToFilter).forEach(function (sKey) {
            if (fnFilterFunction(sKey) === false) {
                delete oObjectToFilter[sKey];
            }
        });
        return oObjectToFilter;
    }

    /**
     * Filters parameters of an object based on a given condition.
     *
     * @param {object} oObject The object to filter.
     * @param {function} fnFilter The filter function.
     * @return {object} The object filtered based on the filter function.
     *   This is a new object, but the values assigned to the keys are not cloned from the original object.
     * @private
     */
    function filterObject (oObject, fnFilter) {
        var oFiltered;
        oFiltered = Object.keys(oObject).reduce(function (oFiltered, sKey) {
            var vValue = oObject[sKey];
            if (fnFilter(sKey, vValue)) {
                oFiltered[sKey] = vValue; // TODO: clone the value here.
            }
            return oFiltered;
        }, {});
        return oFiltered;
    }

    /**
     * Checks whether the parameters of an inbound signature matches certain filter options.
     *
     * @param {object} oInboundSignatureParameters The inbound signature parameters member.
     * @param {object[]} aParsedParametersWithOptions An array of parameters parsed via
     *   <code>sap.ushell.services.CrossApplicationNavigation.utils#parseGetLinksParameters</code>. This is an array like:
     *   <pre>
     *   [
     *     {
     *       name: "p1",
     *       value: "v1",
     *       options: { required: true }
     *     }, {
     *       name: "p1",
     *       value: "v1",
     *       options: { required: false }
     *     }
     *   ]
     *   </pre>
     *   Supported options are explained in the public documentation of the
     *   <code>sap.ushell.services.CrossApplicationNavigation</code> public service.
     * @return {boolean} Whether the inbound signature conforms to the parameter filter options.
     */
    function inboundSignatureMeetsParameterOptions (oInboundSignatureParameters, aParsedParametersWithOptions) {
        // Check each parameter as defined by the options.
        // Start from the options and not from the parameters because it is less likely to have many entries.
        // The operation could be slow if many options are specified.
        return aParsedParametersWithOptions.every(function (oParsedParameterWithOptions) {
            var oInboundParameterValue,
                oOptions,
                sParameterName;

            sParameterName = oParsedParameterWithOptions.name;
            oOptions = oParsedParameterWithOptions.options;
            oInboundParameterValue = oInboundSignatureParameters[sParameterName];

            return Object.keys(oOptions).every(function (sOptionName) {
                var vOptionValue = oOptions[sOptionName];
                if (sOptionName === "required") {
                    return !!(oInboundParameterValue || {}).required === vOptionValue;
                }
                return false;
            });
        });
    }

    /**
     * Extracts the parameters given in the array from the given object and returns them in an new object.
     * If a parameter is extracted, it is also removed from the object.
     *
     * @param {string[]} aParamsToExtract An array of Parameters passed to determine what parameters are meant to be extracted.
     * @param {object} oWithParameters The object the parameters should be extracted from.
     * @return {object} An object containing the extracted parameters.
     */
    function extractParameters (aParamsToExtract, oWithParameters) {
        var oExtractedParameters = {};
        aParamsToExtract.forEach(function (sParameter) {
            if (oWithParameters[sParameter]) {
                oExtractedParameters[sParameter] = oWithParameters[sParameter];
                delete oWithParameters[sParameter];
            }
        });
        return oExtractedParameters;
    }

    return {
        inboundSignatureMeetsParameterOptions: inboundSignatureMeetsParameterOptions,
        filterObjectKeys: filterObjectKeys,
        filterObject: filterObject,
        constructParameterDominatorMap: constructParameterDominatorMap,
        findDominatedDefaultParameters: findDominatedDefaultParameters,
        extractParameters: extractParameters
    };
});
