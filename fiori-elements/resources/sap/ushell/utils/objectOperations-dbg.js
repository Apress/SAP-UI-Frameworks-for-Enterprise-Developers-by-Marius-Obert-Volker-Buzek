// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview This file contains miscellaneous utility
 * functions for shortcut operations on plain objects.
 *
 * They are for exclusive use within the unified shell unless
 * otherwise noted.
 */
sap.ui.define([

], function () {
    "use strict";

    var objectOperations = {};

    /**
     * Allows to access a member with names containing a dot represented as '|'
     * @param {object} oObject a javascript object
     * @param {string} sAccessPath  an accesss path, e.g. sap|flp.type representing  o["sap.flp"].type
     * @returns {any} the value of the member or undefined if access path not found
     * @since 1.40.0
     * @private
     */
    objectOperations.getMember = function (oObject, sAccessPath) {
        var oPathSegments = sAccessPath.split("."),
            oNextObject = oObject;
        if (!oObject) {
            return undefined;
        }
        oPathSegments.forEach(function (sSegment) {
            if (typeof oNextObject !== "object") {
                return undefined;
            }
            oNextObject = oNextObject[sSegment.replace(/[|]/g, ".")];
        });
        return oNextObject;
    };

    /**
     * Updates only already existing properties of object
     * @param {object} oTarget object to update
     * @param {object} oSource set of properties to apply
     */
    objectOperations.updateProperties = function (oTarget, oSource) {
        Object.keys(oTarget).forEach(function (sPropertyName) {
            if (oSource.hasOwnProperty(sPropertyName)) {
                oTarget[sPropertyName] = oSource[sPropertyName];
            }
        });
    };

    /**
     * Returns a property value of an object contained in the array <code>aObjects</code>.
     * The path to the potentially nested property is specified by <code>oAccessPath</code>.
     * Subsequent objects are analyzed only if the desired property has not yet been found.
     *
     * Returns the default <code>oDefault</code> if specified, or <code>undefined</code> if there is no such property in any object.
     *
     * @param  {object[]} aObjects an array of objects
     * @param  {string|array} oAccessPath one or more access paths to nested properties as string or array.
     *   E.g. "sap|flp.type" giving access to property o["sap.flp"].type of object o.
     *   A bar '|' is used to signal a dot in the property name.
     * @param  {Object} [oDefault] default value
     * @returns {any} the value of the desired property, or the default value if the desired property is not defined in any object of <code>aObjects</code>.
     *   <code>undefined</code> is taken as default value if not explicitly specified.
     * @private
     */
    objectOperations.getNestedObjectProperty = function (aObjects, oAccessPath, oDefault) {
        // Check inputs
        // ... Mandatory parameters are provided and parameter types are okay
        var MISSING_OR_INVALID_PARAMETER = "Missing or invalid parameter";
        if (!aObjects || !Array.isArray(aObjects) || aObjects.length == 0 || !oAccessPath) {
            throw new Error(MISSING_OR_INVALID_PARAMETER);
        }
        // ... Access path array has an entry for each object
        if (Array.isArray(oAccessPath) && oAccessPath.length != aObjects.length) {
            throw new Error(MISSING_OR_INVALID_PARAMETER);
        }

        // Build an array with an access paths for each object
        var aAccessPaths = oAccessPath;
        if (!Array.isArray(oAccessPath)) {
            aAccessPaths = Array.apply(null, Array(aObjects.length)).map(function () { return oAccessPath; });
        }

        // Retrieve nested property for each object and take the first one found
        var oNestedObjectProperty = aObjects.reduce(function (oMatch, oObject, iIndex) {
            if (oMatch !== undefined) {
                return oMatch;
            }
            return this.getMember(oObject, aAccessPaths[iIndex]);
        }.bind(this), undefined);

        // Return undefined or given default value if nothing found
        return (oNestedObjectProperty != undefined) ? oNestedObjectProperty : oDefault;
    };

    return objectOperations;

}, false /* bExport */);
