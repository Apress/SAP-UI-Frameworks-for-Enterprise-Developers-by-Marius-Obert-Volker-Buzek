// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview This file contains functionality to check and operate on
 * types.
 *
 * This functionality is not public and is to be imported in the scope of the
 * unified shell code only.
 */

sap.ui.define([
], function () {
    "use strict";

    /**
     * Tells whether the given value is an array.
     *
     * @param {object} v
     *   any value
     * @returns {boolean}
     *   <code>true</code> if and only if the given value is an array
     * @private
     * @since 1.34.0
     */
    function isArray (v) {
        // see Crockford page 61
        return Object.prototype.toString.apply(v) === "[object Array]";
    }

    /**
     * Tells whether the given value is a plain object.
     *
     * @param {object} v
     *   any value
     *
     * @returns {boolean}
     *   <code>true</code> if and only if the given value is an Object
     * @private
     */
    function isPlainObject (v) {
        return Object.prototype.toString.apply(v) === "[object Object]";
    }

    /**
     * Decides whether a value is defined or undefined.
     *
     * @param {variant} v
     *   Any value
     *
     * @return {boolean}
     *   Whether the passed value is defined
     *
     * @private
     */
    function isDefined (v) {
        return typeof v !== "undefined";
    }

    return {
        isArray: isArray,
        isPlainObject: isPlainObject,
        isDefined: isDefined
    };

}, false /* bExport */);
