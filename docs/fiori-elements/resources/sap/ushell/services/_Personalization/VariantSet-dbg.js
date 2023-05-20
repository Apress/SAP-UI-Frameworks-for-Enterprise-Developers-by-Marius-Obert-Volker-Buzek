// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/utils", "sap/ushell/services/_Personalization/constants.private", "sap/ushell/services/_Personalization/PersonalizationContainerVariant", "sap/ushell/services/_Personalization/Variant"], function (utils, constants, PersonalizationContainerVariant, Variant) {
    "use strict";

    /**
     * A VariantSet is a class representing a collection of
     * Variants (identified by a key and name)
     * and a member variable indicating the
     * "current variable"
     *
     * When manipulating the underlying data, additional constraints are enforced.
     *
     * To be called by the personalization container.
     *
     * @class The personalization variant set contains variants of personalization data.
     *        It is used in the personalization container mode.
     *
     * @public
     * @name sap.ushell.services.Personalization.VariantSet
     * @since 1.22.0
     */
    function VariantSet (sVariantSetKey, oContextContainer) {
        var sVariantKey,
            sVariantName,
            oVariantNameMap = new utils.Map(),
            oVariantMap = new utils.Map(),
            oVariantData,
            oVariant;
        this._oContextContainer = oContextContainer;
        this._sVariantSetKey = sVariantSetKey;
        this._oVariantSetData = this._oContextContainer._getItemValueInternal(constants.S_VARIANT_PREFIX, this._sVariantSetKey);

        if (!Object.prototype.hasOwnProperty.call(this._oVariantSetData, "currentVariant")) {
            throw new utils.Error("Corrupt variant set data: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
            // TODO variant set name + container
        }
        if (Object.prototype.hasOwnProperty.call(this._oVariantSetData, "variants")) {
            for (sVariantKey in this._oVariantSetData.variants) {
                if (Object.prototype.hasOwnProperty.call(this._oVariantSetData.variants, sVariantKey)) {
                    sVariantName = this._oVariantSetData.variants[sVariantKey].name;
                    oVariantData = this._oVariantSetData.variants[sVariantKey].variantData;
                    if (oVariantNameMap.containsKey(sVariantName)) {
                        throw new utils.Error("Variant name already exists: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
                        // TODO skip? log instead error
                    } else {
                        oVariantNameMap.put(sVariantName, sVariantKey);
                        oVariant = new PersonalizationContainerVariant(sVariantKey,
                                sVariantName, oVariantData);
                        oVariantMap.put(sVariantKey, oVariant);
                    }
                }
            }
        } else {
            throw new utils.Error("Corrupt variant set data: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        return this;
    }

    VariantSet.prototype._getVariantSet = function () {
        return this._oVariantSetData;
    };

    VariantSet.prototype._serialize = function () {
        this._oContextContainer._setItemValueInternal(constants.S_VARIANT_PREFIX, this._sVariantSetKey, this._oVariantSetData);
    };

    /**
     * Returns the current variant key.
     * @name sap.ushell.services.Personalization.VariantSet#getCurrentVariantKey
     * @returns {string}
     *             current variant key. In case the current variant was never set <code>null</code> is returned.
     *
     * @public
     * @function
     * @since 1.22.0
     */
    VariantSet.prototype.getCurrentVariantKey = function () {
        return this._getVariantSet().currentVariant;
    };

    /**
     * Sets the current variant key.
     * @name sap.ushell.services.Personalization.VariantSet#setCurrentVariantKey
     * @param {string} sVariantKey
     *            There is no validity check for the variant key.
     *
     * @public
     * @function
     * @since 1.22.0
     */
    VariantSet.prototype.setCurrentVariantKey = function (sVariantKey) {
        this._getVariantSet().currentVariant = sVariantKey;
        this._serialize();
    };

    /**
     * Returns an array with the keys of the variants in the variant set.
     * @name sap.ushell.services.Personalization.VariantSet#getVariantKeys
     * @returns {array}
     *             variant keys
     *
     * @public
     * @function
     * @since 1.22.0
     */
    VariantSet.prototype.getVariantKeys = function () {
        var oVariantMap = new utils.Map(),
            oVariantSetData = this._getVariantSet(this._sVariantSetKey),
            sVariantKey;
        if (Object.prototype.hasOwnProperty.call(oVariantSetData, "variants")) {
            for (sVariantKey in oVariantSetData.variants) {
                if (Object.prototype.hasOwnProperty.call(oVariantSetData.variants, sVariantKey)) {
                    oVariantMap.put(sVariantKey, "dummy");
                }
            }
        } else {
            throw new utils.Error("Corrupt variant set data: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        return oVariantMap.keys();
    };

    VariantSet.prototype.getVariantNamesAndKeys = function () {
        var oVariantNameMap = new utils.Map(),
            oVariantMap = new utils.Map(),
            oVariantSetData = this._getVariantSet(this._sVariantSetKey),
            sVariantKey,
            sVariantName;
        if (Object.prototype.hasOwnProperty.call(oVariantSetData, "variants")) {
            for (sVariantKey in oVariantSetData.variants) {
                if (Object.prototype.hasOwnProperty.call(oVariantSetData.variants, sVariantKey)) {
                    sVariantName = oVariantSetData.variants[sVariantKey].name;
                    // oVariantData = oVariantSetData.variants[sVariantKey].variantData;
                    if (oVariantNameMap.containsKey(sVariantName)) {
                        throw new utils.Error("Variant name already exists: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
                        // TODO skip? log instead error
                    } else {
                        oVariantNameMap.put(sVariantName, sVariantKey);
                    }
                    oVariantMap.put(sVariantKey, "dummy");
                }
            }
        } else {
            throw new utils.Error("Corrupt variant set data: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        return oVariantNameMap.entries;
    };

    /**
     * Returns a variant object.
     * @name sap.ushell.services.Personalization.VariantSet#getVariant
     * @param {string} sVariantKey
     *            variant key
     * @returns {object}
     *            {@link sap.ushell.services.PersonalizationContainerVariant}.
     *            In case the variant set does not contain a variant with this key
     *            <code>undefined</code> is returned.
     *
     * @public
     * @function
     * @since 1.22.0
     */
    VariantSet.prototype.getVariant = function (sVariantKey) {
        if (typeof sVariantKey !== "string") {
            return undefined;
        }
        var oVariantSetData = this._getVariantSet(this._sVariantSetKey),
            sVariantName,
            oVariant,
            oVariantData;
        if (Object.prototype.hasOwnProperty.call(oVariantSetData, "variants") && Object.prototype.hasOwnProperty.call(oVariantSetData.variants, sVariantKey)) {
            sVariantName = oVariantSetData.variants[sVariantKey].name;
            oVariantData = oVariantSetData.variants[sVariantKey].variantData;

            oVariant = new Variant(this,
                sVariantKey, sVariantName, oVariantData);
            return oVariant;
        }
        return undefined;
    };

    /**
     * Returns the variant key corresponding to a variant name.
     * @name sap.ushell.services.Personalization.VariantSet#getVariantKeyByName
     * @param {string} sVariantName
     *            variant name
     * @returns {string}
     *            variant key. In case the variant set does not contain a variant with this name
     *            <code>undefined</code> is returned.
     *
     * @public
     * @function
     * @since 1.22.0
     */
    VariantSet.prototype.getVariantKeyByName = function (sVariantName) {
        if (typeof sVariantName !== "string") {
            return undefined;
        }
        var oVariantSetData = this._getVariantSet(this._sVariantSetKey),
            sVariantKey;
        if (Object.prototype.hasOwnProperty.call(oVariantSetData, "variants")) {
            for (sVariantKey in oVariantSetData.variants) {
                if (Object.prototype.hasOwnProperty.call(oVariantSetData.variants, sVariantKey)) {
                    if (sVariantName === oVariantSetData.variants[sVariantKey].name) {
                        return sVariantKey;
                    }
                }
            }
        } else {
            throw new utils.Error("Corrupt variant set data: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        return undefined;
    };

    /**
     * Checks if a specific variant is contained in the variant set.
     * @name sap.ushell.services.Personalization.VariantSet#containsVariant
     * @param {string} sVariantKey
     *            variant key
     * @returns {boolean}
     *            <tt>true</tt> if the variant set contains a variant with the key
     *
     * @public
     * @function
     * @since 1.22.0
     */
    VariantSet.prototype.containsVariant = function (sVariantKey) {
        var oVariantSetData = this._getVariantSet();
        if (typeof sVariantKey !== "string") {
            return undefined;
        }
        return Object.prototype.hasOwnProperty.call(oVariantSetData, "variants") && Object.prototype.hasOwnProperty.call(oVariantSetData.variants, sVariantKey);
    };

    /**
     * Creates a new variant in the variant set.
     * In case a variant with this name is already existing an exception is thrown.
     * @name sap.ushell.services.Personalization.VariantSet#addVariant
     * @param {string} sVariantSetName
     *            variant set name
     * @returns {object}
     *            {@link sap.ushell.services.PersonalizationContainerVariant}
     *
     * @public
     * @function
     * @since 1.22.0
     */
    VariantSet.prototype.addVariant = function (sVariantName) {
        var aKeys = [],
            iMaxKey = 0,
            sVariantKey = "",
            oVariant = {};

        aKeys = this.getVariantKeys();
        // generate a new "unique" key not yet present in aKeys
        iMaxKey = parseInt(aKeys.sort(function (a, b) {
            return a - b;
        }).reverse()[0], 10); // get the highest key; in case of an empty
                              // variant set -> NaN
        sVariantKey = isNaN(iMaxKey) ? "0" : (iMaxKey + 1).toString();
            // tested for up to 1 mio variants
        if (aKeys.indexOf(sVariantKey) >= 0) {
            throw new utils.Error("Variant key '" + sVariantKey
                    + "' already exists in variant set" + this._sVariantSetKey
                    + "': sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        if (typeof sVariantName !== "string") {
            throw new utils.Error("Parameter value of sVariantName is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        if (this.getVariantKeyByName(sVariantName) !== undefined) {
            throw new utils.Error("Variant name '" + sVariantName
                    + "' already exists in variant set '"
                    + this._sVariantSetKey + "' (Old key: '"
                    + this.getVariantKeyByName(sVariantName) + "' New key: '"
                    + sVariantKey + "') ': sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        oVariant = new Variant(
            this,
            sVariantKey,
            sVariantName
        );
        this._getVariantSet(this._sVariantSetKey).variants[sVariantKey] = {
            name : sVariantName,
            variantData : {}
        };
        this._serialize();
        return oVariant;
    };



    /**
     * Deletes a variant from the variant set.
     * In case the variant does not exist nothing happens.
     * @name sap.ushell.services.Personalization.VariantSet#delVariant
     * @param {string} sVariantKey
     *            variant key
     *
     * @public
     * @function
     * @since 1.22.0
     */
    VariantSet.prototype.delVariant = function (sVariantKey) {
        var oVariantSetData;
        if (typeof sVariantKey !== "string") {
            return undefined;
        }
        oVariantSetData = this._getVariantSet();
        if (oVariantSetData && oVariantSetData.variants) {
            delete this._oVariantSetData.variants[sVariantKey];
        }
        this._serialize();
    };

    return VariantSet;
});
