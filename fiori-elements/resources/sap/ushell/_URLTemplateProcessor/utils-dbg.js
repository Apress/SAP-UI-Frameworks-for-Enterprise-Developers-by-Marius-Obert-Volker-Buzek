// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file Utility functions for modules of <code>URLTemplateProcessor</code>.
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/base/util/deepExtend"
], function (
    deepExtend
) {
    "use strict";

    function hasValue (vValue) {
        return vValue !== null && typeof vValue !== "undefined";
    }

    function removeArrayParameterNotation (oParams) {
        return Object.keys(oParams).reduce(function (o, sParamName) {
            var vParamValue = oParams[sParamName];
            if (Object.prototype.toString.apply(vParamValue) === "[object Array]") {
                o[sParamName] = vParamValue[0];
            } else if (typeof vParamValue === "string") {
                o[sParamName] = vParamValue;
            } else {
                throw new Error("Parameters should be passed as strings or array of strings");
            }
            return o;
        }, {});
    }

    function mergeObject (o1, o2) {
        var o1Clone = deepExtend({}, o1);
        var o2Clone = deepExtend({}, o2);

        return Object.keys(o2Clone).reduce(function (o, sO2Key) {
            o[sO2Key] = o2Clone[sO2Key];
            return o;
        }, o1Clone);
    }

    return {
        mergeObject: mergeObject,
        hasValue: hasValue,
        removeArrayParameterNotation: removeArrayParameterNotation
    };
});
