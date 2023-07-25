// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/utils",
    "sap/ushell/services/_Personalization/utils",
    "sap/ushell/services/_Personalization/constants.private",
    "sap/ushell/services/_Personalization/PersonalizationContainerVariantSet",
    "sap/ui/thirdparty/jquery"
], function (utils, personalizationUtils, constants, PersonalizationContainerVariantSet, jQuery) {
    "use strict";

    /**
     * To be called by the personalization service getPersonalizationContainer method.
     *
     * @class The personalization container is the anchor object of the unified shell
     *        personalization in container mode.
     *
     * @public
     * @name sap.ushell.services.PersonalizationContainer
     * @since 1.18.0
     */
    function PersonalizationContainer (oAdapter, sContainerKey) {
        this._sContainerKey = sContainerKey;
        this._oAdapterContainer = {};
        this._aLoadedVariantSetKeys = [];
        this._aLoadedItemKeys = [];
        var oDeferred = {},
            that = this;

        this._init();
        oDeferred = new jQuery.Deferred();
        if (!this._sContainerKey || typeof this._sContainerKey !== "string") {
            throw new utils.Error("Invalid container key: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        // get adapter container & load
        this._oAdapterContainer = oAdapter.getAdapterContainer(this._sContainerKey);
        this.load()
            .fail(function () {
                oDeferred.reject();
            })
            .done(function () {
                oDeferred.resolve(that);
            });
        return oDeferred.promise();
    }

    PersonalizationContainer.prototype._init = function () {
        // resets all member variables of the personalization container
        this._oVariantSetMap = {};
        this._oItemMap = {};
        this._aLoadedVariantSetKeys = [];
        this._aLoadedItemKeys = [];
        this._oVariantSetMap = new utils.Map();
        this._oItemMap = new utils.Map();
    };



    /**
     *
     * (Re)loads the current container data from the underlying storage asynchronously.
     * The current local data is discarded.
     *
     * Returns a promise for the load operation.
     * If another save/load/delete operation is not completed, the  operation may fail!
     * (wait for the other promise).
     *
     * Synchronous read and write operations before the load is done have undefined
     * effects.
     *
     * @name sap.ushell.services.PersonalizationContainer#load
     *
     * @returns {object}
     *          Promise object
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainer.prototype.load = function () {
        var oDeferred = {},
            aItemAndVaraintSetKeys = [],
            aVariantSetKeys = [],
            aItemKeys = [],
            aMigratedItemKeys = [],
            that = this;
        function migrateItemsToPrefix (aItemKeys) {
            // aItemKeys contains prefixed keys and unprefixed keys
            var aNonPrefixKeys = [],
                aPrefixKeys = [];

            aNonPrefixKeys = aItemKeys.filter(function (s) {
                return s.indexOf(constants.S_ITEM_PREFIX) !== 0;
                // match at first character -> index = 0 -> false -> filter out
                // match inside the string -> index > 0 -> true -> keep
                // no match -> index = -1 -> true -> keep
            });
            if (aNonPrefixKeys.length === 0) {
                return aItemKeys;
            }
            aPrefixKeys = aItemKeys.filter(function (s) {
                return s.indexOf(constants.S_ITEM_PREFIX) === 0;
                // match at first character -> index = 0 -> true -> keep
                // match inside the string -> index > 0 -> false -> filter out
                // no match -> index = -1 -> false -> filter out
            });
            aNonPrefixKeys.forEach(function (sItemKey) {
                var oItemValue = {},
                    sPrefixedItemKey = "";
                sPrefixedItemKey = constants.S_ITEM_PREFIX + sItemKey;
                oItemValue = personalizationUtils.clone(that._oAdapterContainer.getItemValue(sItemKey));
                // create a new prefixed item at the container
                that._oAdapterContainer.setItemValue(sPrefixedItemKey, oItemValue);
                    // delete the non prefixed item at the container
                that._oAdapterContainer.delItem(sItemKey);
                if (aPrefixKeys && Array.prototype.indexOf.call(aPrefixKeys, sPrefixedItemKey) === -1) {
                    aPrefixKeys.push(sPrefixedItemKey);
                }
            });
            return aPrefixKeys;
        }

        oDeferred = new jQuery.Deferred();
        if (!this._sContainerKey) {
            throw new utils.Error("Invalid container key: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        // delete local data
        this._init();
        // get adapter container & load
        this._oAdapterContainer.load()
            .fail(function () {
                // TODO
                oDeferred.reject();
            })
            .done(function () {
                aItemAndVaraintSetKeys = that._oAdapterContainer.getItemKeys().splice(0);
                aVariantSetKeys = aItemAndVaraintSetKeys.filter(function (s) {
                    return s.indexOf(constants.S_VARIANT_PREFIX) === 0;
                    // match at first character -> index = 0 -> true -> keep
                    // match inside the string -> index > 0 -> false -> filter out
                    // no match -> index = -1 -> false -> filter out
                });
                aVariantSetKeys.forEach(function (sVariantSetKey) {
                    var oVariantSet = {};
                    oVariantSet = new PersonalizationContainerVariantSet(sVariantSetKey, that._oAdapterContainer);
                    that._oVariantSetMap.put(sVariantSetKey, oVariantSet);
                });
                aItemKeys = aItemAndVaraintSetKeys.filter(function (s) {
                    return s.indexOf(constants.S_VARIANT_PREFIX) !== 0;
                    // match at first character -> index = 0 -> false -> filter out
                    // match inside the string -> index > 0 -> true -> keep
                    // no match -> index = -1 -> true -> keep
                });
                aMigratedItemKeys = migrateItemsToPrefix(aItemKeys);
                aMigratedItemKeys.forEach(function (sItemKey) {
                    that._oItemMap.put(sItemKey, personalizationUtils.clone(that._oAdapterContainer.getItemValue(sItemKey)));
                });
                that._aLoadedVariantSetKeys = that._oVariantSetMap.keys().splice(0);
                that._aLoadedItemKeys = that._oItemMap.keys().splice(0);
                oDeferred.resolve();
            });
        return oDeferred.promise();
    };

    // -- common interface --
    /**
     * Attempts to save the current container data at the underlying storage asynchronously.
     * The current state is serialized.
     *
     * @name sap.ushell.services.PersonalizationContainer#save
     *
     * @returns {object}
     *             Promise object
     *
     * If another save/load/delete operation is not completed, the  operation may fail!
     * (wait for the other promise).
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainer.prototype.save = function () {
        // async
        var oSaveContainer,
            oInnerPromise;
        this._serializeVariantSets();
        this._serializeItems();

        oSaveContainer = new jQuery.Deferred();
        function fnSaveSuccess () {
            oSaveContainer.resolve();
        }
        function fnSaveError () {
            oSaveContainer.reject();
        }
        try {
            oInnerPromise = this._oAdapterContainer.save(); // promise
            oInnerPromise.fail(fnSaveError);
            oInnerPromise.done(fnSaveSuccess);
        } catch (e) {
            oSaveContainer.reject();
        }
        return oSaveContainer.promise();
    };

    // -- item interface --
    /**
     * Returns an array with the keys of direct items in the container.
     *
     * @name sap.ushell.services.PersonalizationContainer#getItemKeys
     *
     * @returns {array}
     *             item keys
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainer.prototype.getItemKeys = function () {
        return this._oItemMap.keys().map(function (sEntry) {
            return sEntry.replace(constants.S_ITEM_PREFIX, "", "");
        });
    };

    /**
     * Returns the value for a direct item from the container.
     *
     * @name sap.ushell.services.PersonalizationContainer#getItemValue
     *
     * @param {string} sItemKey
     *            item key
     * @returns {object}
     *            item value (JSON object). In case the container does not contain a direct item with this key
     * <code>undefined</code> is returned.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainer.prototype.getItemValue = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        return this._oItemMap.get(constants.S_ITEM_PREFIX + sItemKey);
    };

    /**
     * Checks if a specific direct item is contained in the container.
     *
     * @name sap.ushell.services.PersonalizationContainer#containsItem
     *
     * @param {string} sItemKey
     *            item key
     * @returns {boolean}
     *            <tt>true</tt> if the container contains a direct item with the key
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainer.prototype.containsItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        return this._oItemMap.containsKey(constants.S_ITEM_PREFIX + sItemKey);
    };

    /**
     * Sets the value of a direct item in the container.
     * In case the item is already existing its value is overwritten. In case it is not
     * existing a new item with this key and value is created.
     *
     * @name sap.ushell.services.PersonalizationContainer#setItemValue
     *
     * @param {string} sItemKey
     *            item key
     * @param {object} oItemValue
     *            item value (JSON object)
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainer.prototype.setItemValue = function (sItemKey, oItemValue) {
        if (typeof sItemKey !== "string") {
            throw new utils.Error("Parameter value of sItemKey is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        this._oItemMap.put(constants.S_ITEM_PREFIX + sItemKey, oItemValue);
    };

    /**
     *
     * Deletes a direct item from the container.
     * In case the item does not exist, nothing happens.
     *
     * @name sap.ushell.services.PersonalizationContainer#delItem
     *
     * @param {string} sItemKey
     *            item key
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainer.prototype.delItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        if (this.containsItem(sItemKey)) {
            this._oItemMap.remove(constants.S_ITEM_PREFIX + sItemKey);
        }
    };

    PersonalizationContainer.prototype._serializeItems = function () {
        var aItemKeys = [],
            aDiff = [],
            that = this;

        aItemKeys = this._oItemMap.keys();
        aItemKeys.forEach(function (sItemKey) {
            that._oAdapterContainer.setItemValue(sItemKey, personalizationUtils.clone(that._oItemMap.get(sItemKey)));
        });
        aDiff = this._aLoadedItemKeys.filter(function (sItemKey) { return !(aItemKeys.indexOf(sItemKey) > -1); });
        aDiff.forEach(function (sItemKey) {
            that._oAdapterContainer.delItem(sItemKey);
        });
    };

    // -- variant interface --
    /**
     * Returns an array with the keys of the variant sets in the container.
     *
     * @name sap.ushell.services.PersonalizationContainer#getVariantSetKeys
     *
     * @returns {array}
     *             variant set keys
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainer.prototype.getVariantSetKeys = function () {
        var aVariantSetKeys = [],
            aPrefixVariantSetKeys = [];

        aPrefixVariantSetKeys = this._oVariantSetMap.keys();
        aVariantSetKeys = aPrefixVariantSetKeys.map(function (sEntry) {
            return sEntry.replace(constants.S_VARIANT_PREFIX, "", "");
        });
        return aVariantSetKeys;
    };
    /**
     * Checks if a specific variant set is contained in the container.
     *
     * @name sap.ushell.services.PersonalizationContainer#containsVariantSet
     *
     * @param {string} sVariantSetKey
     *            variant set key
     * @returns {boolean}
     *            <tt>true</tt> if the container contains a variant set with the key
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainer.prototype.containsVariantSet = function (sVariantSetKey) {
        return this._oVariantSetMap.containsKey(constants.S_VARIANT_PREFIX
                + sVariantSetKey);
    };
    /**
     *
     * Returns the variant set object from the container.
     *
     * @name sap.ushell.services.PersonalizationContainer#addVariantSet
     *
     * @param {string} sVariantSetKey
     *            variant set key
     * @returns {object}
     *            {@link sap.ushell.services.PersonalizationContainerVariantSet}.
     *            In case the container does not contain a variant set with this key
     *            <code>undefined</code> is returned.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainer.prototype.getVariantSet = function (sVariantSetKey) {
        var sPrefixedVariantSetKey,
            oVariantSet = {};

        sPrefixedVariantSetKey = constants.S_VARIANT_PREFIX + sVariantSetKey;
        oVariantSet = this._oVariantSetMap.get(sPrefixedVariantSetKey);
        return oVariantSet;
    };
    /**
     * Creates a new variant set in the container.
     * In case a variant set with this key is already existing an exception is thrown.
     *
     * @name sap.ushell.services.PersonalizationContainer#addVariantSet
     *
     * @param {string} sVariantSetKey
     *            variant set key
     * @returns {object}
     *            {@link sap.ushell.services.PersonalizationContainerVariantSet}
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainer.prototype.addVariantSet = function (sVariantSetKey) {
        var oEmptyValue = {},
            oVariantSet = {},
            sPrefixedVariantSetKey = "";

        if (this.containsVariantSet(sVariantSetKey)) {
            throw new utils.Error("Container already contains a variant set with key '"
                            + sVariantSetKey
                            + "': sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        sPrefixedVariantSetKey = constants.S_VARIANT_PREFIX + sVariantSetKey;
        oEmptyValue = {
            currentVariant: null,
            variants: {}
        };
        this._oAdapterContainer.setItemValue(sPrefixedVariantSetKey,
                oEmptyValue);

        oVariantSet = new PersonalizationContainerVariantSet(sPrefixedVariantSetKey, this._oAdapterContainer);
        this._oVariantSetMap.put(sPrefixedVariantSetKey, oVariantSet);
        return oVariantSet;
    };

    PersonalizationContainer.prototype._serializeVariantSets = function () {
        var aVariantSetKeys = [],
            aDiff = [],
            that = this;

        aVariantSetKeys = this._oVariantSetMap.keys();
        aVariantSetKeys.forEach(function (sVariantSetKey) {
            var oVariantSet = {},
                oVariantSetData = {};
            oVariantSet = that._oVariantSetMap.get(sVariantSetKey);
            // variant set object was instantiated -> serialize
            oVariantSetData = oVariantSet._serialize();
            that._oAdapterContainer.setItemValue(sVariantSetKey, personalizationUtils.clone(oVariantSetData));
        });
        aDiff = this._aLoadedVariantSetKeys.filter(function (sVariantSetKey) { return !(aVariantSetKeys.indexOf(sVariantSetKey) > -1); });
        aDiff.forEach(function (sVariantSetKey) {
            that._oAdapterContainer.delItem(sVariantSetKey);
        });
    };

    /**
     * Deletes a variant set from the container.
     * In case the variant set does not exist nothing happens.
     *
     * @name sap.ushell.services.PersonalizationContainer#delVariantSet
     *
     * @param {string} sVariantSetKey
     *            variant set key
     *
     * @public
     * @function
     * @since 1.18.0
     */
    // TODO check if deleting a non-existing variant set goes through
    PersonalizationContainer.prototype.delVariantSet = function (sVariantSetKey) {
        var sPrefixedVariantSetKey = "";

        sPrefixedVariantSetKey = constants.S_VARIANT_PREFIX + sVariantSetKey;
        this._oVariantSetMap.remove(sPrefixedVariantSetKey);
        return this._oAdapterContainer.delItem(sPrefixedVariantSetKey);
    };


    return PersonalizationContainer;
});
