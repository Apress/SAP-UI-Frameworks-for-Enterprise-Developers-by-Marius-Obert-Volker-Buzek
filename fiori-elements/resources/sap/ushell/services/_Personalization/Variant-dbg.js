// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/utils",
    "sap/ushell/services/_Personalization/utils"
], function (utils, personalizationUtils) {
    "use strict";

    /**
     * To be instantiated via Personalization.VariantSet  add / get Variant only
     *
     * @class The personalization variant contains personalization data.
     *        It is used in the personalization container mode.
     *
     * @public
     * @name sap.ushell.services.Personalization.Variant
     * @since 1.22.0
     */
    function Variant (oVariantSet, sVariantKey,
            sVariantName) {
        if (typeof sVariantKey !== "string") {
            throw new utils.Error("Parameter value of sVariantKey is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        if (typeof sVariantName !== "string") {
            throw new utils.Error("Parameter value of sVariantName is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        this._oVariantSet = oVariantSet;
        this._sVariantKey = sVariantKey;
        this._sVariantName = sVariantName;
    }

    /**
     * Returns the key of this variant.
     * @name sap.ushell.services.Personalization.Variant#getVariantKey
     * @returns {string}
     *             variant key.
     *
     * @public
     * @function
     * @since 1.22.0
     */
    Variant.prototype.getVariantKey = function () {
        return this._sVariantKey;
    };

    /**
     * Returns the name of this variant.
     * @name sap.ushell.services.Personalization.Variant#getVariantName
     * @returns {string}
     *             variant name.
     *
     * @public
     * @function
     * @since 1.22.0
     */
    Variant.prototype.getVariantName = function () {
        return this._sVariantName;
    };

    /**
     * Sets the name of the variant.
     *
     * In case a variant with <code>sVariantName</code> is already existing in the corresponding variant set an exception is thrown.
     *
     * @name sap.ushell.services.Personalization.Variant#setVariantName
     * @param {string} sVariantName
     *          variant name
     *
     * @public
     * @function
     * @since 1.24.0
     */
    Variant.prototype.setVariantName = function (sVariantName) {
        var oVariantSetData = this._oVariantSet._getVariantSet(),
            oVariantData;

        if (typeof sVariantName !== "string") {
            throw new utils.Error("Parameter value of sVariantName is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        if (this._oVariantSet.getVariantKeyByName(sVariantName) !== undefined) {
            throw new utils.Error("Variant with name '" + sVariantName
                    + "' already exists in variant set '"
                    + this._oVariantSet._sVariantSetKey
                    + "': sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }

        if (Object.prototype.hasOwnProperty.call(oVariantSetData, "variants") && Object.prototype.hasOwnProperty.call(oVariantSetData.variants, this._sVariantKey)) {
            oVariantData = oVariantSetData.variants[this._sVariantKey];
            oVariantData.name = sVariantName;
            this._sVariantName = sVariantName;
            this._oVariantSet._serialize();
        } else {
            throw new utils.Error("Variant does not longer exist", " " /* Empty string for missing component information */);
        }
    };

    /**
     * Returns the value for an item in this variant.
     * @name sap.ushell.services.Personalization.Variant#getItemValue
     * @param {string} sItemKey
     *            item key
     * @returns {object}
     *            item value (JSON object). In case the variant does not contain an item with this key
     *            <code>undefined</code> is returned.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    Variant.prototype.getItemValue = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        var vd = this._oVariantSet._getVariantSet().variants[this._sVariantKey].variantData;
        return Object.prototype.hasOwnProperty.call(vd, sItemKey) && personalizationUtils.clone(vd[sItemKey]);
    };

    /**
     * Sets the value for an item in this variant.
     * @name sap.ushell.services.Personalization.Variant#setItemValue
     * @param {string} sItemKey
     *            item key
     * @param {object}
     *            item value (JSON object)
     *
     * @public
     * @function
     * @since 1.18.0
     */
    Variant.prototype.setItemValue = function (sItemKey, oItemValue) {
        if (typeof sItemKey !== "string") {
            throw new utils.Error("Parameter value of sItemKey is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        var vd,
            variant = this._oVariantSet._getVariantSet().variants && this._oVariantSet._getVariantSet().variants[this._sVariantKey];
        if (!variant) {
            throw new utils.Error("Variant does not longer exist", " " /* Empty string for missing component information */);
        }
        if (!variant.variantData) {
            variant.variantData = {};
        }
        vd = variant.variantData;
        vd[sItemKey] = personalizationUtils.clone(oItemValue);
        this._oVariantSet._serialize();
    };

    /**
     * Checks if a specific item is contained in this variant.
     * @name sap.ushell.services.Personalization.Variant#containsItem
     * @param {string} sItemKey
     *            item key
     * @returns {boolean}
     *            <tt>true</tt> if the variant contains an item with the key
     *
     * @public
     * @function
     * @since 1.18.0
     */
    Variant.prototype.containsItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        var vd = this.oAccess.variantSet._getVariantSet().variants[this._sVariantKey].variantData;
        return Object.prototype.hasOwnProperty.call(vd, sItemKey);
    };

    /**
     * Returns an array with the keys of all items in this variant.
     * @name sap.ushell.services.Personalization.Variant#getItemKeys
     * @returns {array}
     *            item keys
     *
     * @public
     * @function
     * @since 1.22.0
     */
    Variant.prototype.getItemKeys = function () {
        var vd = this._oVariantSet._getVariantSet().variants[this._sVariantKey].variantData,
            sItemKey,
            oItemKeys = [];
        for (sItemKey in vd) {
            if (Object.prototype.hasOwnProperty.call(vd, sItemKey)) {
                oItemKeys.push(sItemKey);
            }
        }
        oItemKeys.sort();
        return oItemKeys;
    };

    /**
     * Deletes an item from this variant.
     * In case the item does not exist, nothing happens.
     * @name sap.ushell.services.Personalization.Variant#delItem
     * @param {string} sItemKey
     *            item key
     *
     * @public
     * @function
     * @since 1.22.0
     */
    Variant.prototype.delItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        var vd = this._oVariantSet._getVariantSet().variants[this._sVariantKey].variantData;
        delete vd[sItemKey];
        this._oVariantSet._serialize();
    };

    return Variant;
});
