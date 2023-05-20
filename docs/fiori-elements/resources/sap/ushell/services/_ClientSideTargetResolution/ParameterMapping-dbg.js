// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log"
], function (Log) {
    "use strict";

    /**
     * Creates a member <code>mappedIntentParamsPlusSimpleDefaults</code>
     * in the given <code>oMatchingTarget</code>, which contains the
     * re-mapped parameters based on the mappings provided in the
     * signature.
     *
     * <p>The member is added to <code>oMatchingTarget</code> as it is not clear whether
     * we also want to modify the original sap-ushell-defaultedParameter names collection.</p>
     *
     * <p>NOTE: only simple parameters are re-mapped, complex parameters
     * are not part of the
     * <code>mappedIntentParamsPlusSimpleDefaults</code>.</p>
     *
     * @param {object} oMatchingTarget
     *   The mutated matching target object
     *
     * @private
     */
    function mapParameterNamesAndRemoveObjects (oMatchingTarget) {
        var oNewParameters = {},
            oOldParamsPlusAllDefaults = oMatchingTarget.intentParamsPlusAllDefaults;

        Object.keys(oOldParamsPlusAllDefaults).sort().forEach(function (sParamName) {
            var sRenameTo = getRenameParameterName(sParamName, oMatchingTarget.inbound.signature, oOldParamsPlusAllDefaults[sParamName]);

            if (Array.isArray(oMatchingTarget.intentParamsPlusAllDefaults[sParamName])) {
                if (oNewParameters[sRenameTo]) {
                    Log.error("collision of values during parameter mapping : \"" + sParamName + "\" -> \"" + sRenameTo + "\"");
                } else {
                    oNewParameters[sRenameTo] = oMatchingTarget.intentParamsPlusAllDefaults[sParamName];
                }
            }
        });
        oMatchingTarget.mappedIntentParamsPlusSimpleDefaults = oNewParameters;
    }

    /**
     * Retrieves the renamed parameter of a given parameter from the
     * signature object.
     *
     * @param {string} sParamName
     *   The parameter name
     * @param {object} oSignature
     *   The signature object that may contain a mapping for
     *   <code>sParamName</code>
     * @param {array} aParamValue
     *   The value of <code>sParamName</code> into an array (as one
     *   parameter may have multiple values).
     *
     * @returns {string}
     *   The renamed parameter for <code>sParamName</code> if present in
     *   the given signature object, or <code>sParamName</code> otherwise.
     *
     *   <p>NOTE: the aParamValue must be present and passed in the form of
     *   an array, otherwise <code>sParamName</code> will be returned even
     *   if a renamed parameter exists in the signature.</p>
     *
     * @private
     */
    function getRenameParameterName (sParamName, oSignature, aParamValue) {
        if (!aParamValue || !Array.isArray(aParamValue)) {
            return sParamName;
        }
        if (oSignature && oSignature.parameters && oSignature.parameters[sParamName] && oSignature.parameters[sParamName].renameTo) {
            return oSignature.parameters[sParamName].renameTo;
        }

        return sParamName;
    }

    return {
        mapParameterNamesAndRemoveObjects: mapParameterNamesAndRemoveObjects,
        getRenameParameterName: getRenameParameterName
    };
});
