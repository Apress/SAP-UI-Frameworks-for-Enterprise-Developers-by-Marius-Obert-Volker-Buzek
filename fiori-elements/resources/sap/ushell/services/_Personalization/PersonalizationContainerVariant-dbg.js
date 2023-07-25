// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/utils"
], function (utils) {
    "use strict";

    /**
     * To be called by the personalization variant set.
     *
     * @class The personalization variant contains personalization data.
     *        It is used in the personalization container mode.
     *
     * @public
     * @name sap.ushell.services.PersonalizationContainerVariant
     * @since 1.18.0
     */
    function PersonalizationContainerVariant (sVariantKey,
            sVariantName, oVariantData) {
        if (typeof sVariantKey !== "string") {
            throw new utils.Error("Parameter value of sVariantKey is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        if (typeof sVariantName !== "string") {
            throw new utils.Error("Parameter value of sVariantName is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        if (oVariantData && typeof oVariantData !== "object") {
            throw new utils.Error("Parameter value of sVariantName is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        this._oVariantKey = sVariantKey;
        this._oVariantName = sVariantName;
        this._oItemMap = new utils.Map();
        this._oItemMap.entries = oVariantData || {}; // check if oVariantData
        // is a JSON object
    };

    /**
     * Returns the key of this variant.
     * @name sap.ushell.services.PersonalizationContainerVariant#getVariantKey
     * @returns {string}
     *             variant key.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariant.prototype.getVariantKey = function () {
        return this._oVariantKey;
    };

    /**
     * Returns the name of this variant.
     * @name sap.ushell.services.PersonalizationContainerVariant#getVariantName
     * @returns {string}
     *             variant name.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariant.prototype.getVariantName = function () {
        return this._oVariantName;
    };

    /**
     * Returns the value for an item in this variant.
     * @name sap.ushell.services.PersonalizationContainerVariant#getItemValue
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
    PersonalizationContainerVariant.prototype.getItemValue = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        return this._oItemMap.get(sItemKey);
    };

    /**
     * Sets the value for an item in this variant.
     * @name sap.ushell.services.PersonalizationContainerVariant#setItemValue
     * @param {string} sItemKey
     *            item key
     * @param {object}
     *            item value (JSON object)
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariant.prototype.setItemValue = function (sItemKey, oItemValue) {
        if (typeof sItemKey !== "string") {
            throw new utils.Error("Parameter value of sItemKey is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        return this._oItemMap.put(sItemKey, oItemValue);
    };

    /**
     * Checks if a specific item is contained in this variant.
     * @name sap.ushell.services.PersonalizationContainerVariant#containsItem
     * @param {string} sItemKey
     *            item key
     * @returns {boolean}
     *            <tt>true</tt> if the variant contains an item with the key
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariant.prototype.containsItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        return this._oItemMap.containsKey(sItemKey);
    };

    /**
     * Returns an array with the keys of all items in this variant.
     * @name sap.ushell.services.PersonalizationContainerVariant#getItemKeys
     * @returns {array}
     *            item keys
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariant.prototype.getItemKeys = function () {
        return this._oItemMap.keys();
    };

    /**
     * Deletes an item from this variant.
     * In case the item does not exist, nothing happens.
     * @name sap.ushell.services.PersonalizationContainerVariant#delItem
     *
     * @param {string} sItemKey
     *            item key
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariant.prototype.delItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        return this._oItemMap.remove(sItemKey);
    };

    PersonalizationContainerVariant.prototype._serialize = function () {
        var aItemKeys = [],
            oVariantData = {},
            oItemsData = {},
            that = this;

        oVariantData.name = this.getVariantName();
        aItemKeys = this._oItemMap.keys();
        aItemKeys.forEach(function (sItemKey) {
            oItemsData[sItemKey] = that.getItemValue(sItemKey);
        });
        oVariantData.variantData = oItemsData;
        return oVariantData;
    };

    return PersonalizationContainerVariant;

});
