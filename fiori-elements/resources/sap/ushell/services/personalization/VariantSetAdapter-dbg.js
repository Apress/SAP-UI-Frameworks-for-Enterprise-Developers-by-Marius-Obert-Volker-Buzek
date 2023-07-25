// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/services/_Personalization/constants.private",
    "sap/ushell/services/_Personalization/utils",
    "sap/ushell/services/_Personalization/VariantSet"
], function (constants, utils, VariantSet) {
    "use strict";
    /**
     * VariantSetAdapter
     * amends ContextContainer with functionality to
     *
     * Example: An application has two types of variants.
     * Variant type 1 contains filter values for a query, which are stored in item 1 of
     * the variant, and personalization data for a table, which are stored in item 2
     * of the variant.
     * Variant type 2 contains a setting (item 3) that is independent of
     * the filtering and the table settings. It might be used for a different
     * screen than the variants of type 1.
     * In this example you would have 2 variant sets, one for each variant type.
     *
     *  @param {object} oContextContainer Context
     *
     * @class
     * @classdesc
     * Wrapper object to expose a variant interface on a ContextContainer object obtained from the Peronalization service:
     * <pre>
     * getContainer(...).done( function(oContainer) {
     *   that.oVariantSetContainer = new VariantSetAdapater(oContainer);
     * });
     * </pre>
     *
     * @public
     * @alias sap.ushell.services.personalization.VariantSetAdapter
     * @since 1.18.0
     */
    function VariantSetAdapter (oContextContainer) {
        this._oContextContainer = oContextContainer;
    }

    VariantSetAdapter.prototype.save = function () {
        return this._oContextContainer.save();
    };

    /**
     * Returns an array with the keys of the variant sets in the container.
     * @name sap.ushell.services.Personalization.VariantSetAdapter#getVariantSetKeys
     * @returns {array}
     *             variant set keys
     *
     * @public
     * @function
     * @since 1.18.0
     */
    VariantSetAdapter.prototype.getVariantSetKeys = function () {
        var aPrefixVariantSetKeys = this._oContextContainer._getInternalKeys(),
            aVariantSetKeys = [];
        aVariantSetKeys = aPrefixVariantSetKeys.map(function (sEntry) {
            return sEntry.replace(constants.S_VARIANT_PREFIX, "", "");
        });
        return aVariantSetKeys;
    };
    /**
     * Checks if a specific variant set is contained in the container.
     * @name sap.ushell.services.Personalization.VariantSetAdapter#containsVariantSet
     * @param {string} sVariantSetKey
     *            variant set key
     * @returns {boolean}
     *            <tt>true</tt> if the container contains a variant set with the key
     *
     * @public
     * @function
     * @since 1.18.0
     */
    VariantSetAdapter.prototype.containsVariantSet = function (sVariantSetKey) {
        return this.getVariantSetKeys().indexOf(sVariantSetKey) >= 0;
    };

    /**
     * Returns the variant set object from the container.
     * @name sap.ushell.services.Personalization.VariantSetAdapter#getVariantSet
     * @param {string} sVariantSetKey
     *            variant set key
     *            The string length is restricted to 40 characters
     * @returns {object}
     *            {@link ontainerVariantSet}.
     *            In case the container does not contain a variant set with this key
     *            <code>undefined</code> is returned.
     *
     * @public
     * @function
     * @since 1.22.0
     */
    VariantSetAdapter.prototype.getVariantSet = function (sVariantSetKey) {
        var oVariantSet = this._oContextContainer._getItemValueInternal(constants.S_VARIANT_PREFIX, sVariantSetKey);
        if (!oVariantSet) {
            return undefined;
        }
        return new VariantSet(sVariantSetKey, this._oContextContainer);
    };
    /**
     * Creates a new variant set in the container.
     * In case a variant set with this key is already existing an exception is thrown.
     * @name sap.ushell.services.Personalization.VariantSetAdapter#addVariantSet
     * @param {string} sVariantSetKey
     *            variant set key
     * @returns {object}
     *            {@link ontainerVariantSet}
     *
     * @public
     * @function
     * @since 1.22.0
     */
    VariantSetAdapter.prototype.addVariantSet = function (sVariantSetKey) {
        var oEmptyValue = {},
            oVariantSet = {};

        if (this.containsVariantSet(sVariantSetKey)) {
            throw new utils.Error("Container already contains a variant set with key '"
                            + sVariantSetKey
                            + "': sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        oEmptyValue = {
            currentVariant: null,
            variants: {}
        };
        this._oContextContainer._setItemValueInternal(constants.S_VARIANT_PREFIX, sVariantSetKey,
                oEmptyValue);
        oVariantSet = new VariantSet(sVariantSetKey, this._oContextContainer);
        return oVariantSet;
    };

    /**
     * Deletes a variant set from the container.
     * In case the variant set does not exist nothing happens.
     * @name sap.ushell.services.Personalization.VariantSetAdapter#delVariantSet
     * @param {string} sVariantSetKey
     *            variant set key
     *
     * @public
     * @function
     * @since 1.22.0
     */
    // TODO check if deleting a non-existing variant set goes through
    VariantSetAdapter.prototype.delVariantSet = function (sVariantSetKey) {
        this._oContextContainer._delItemInternal(constants.S_VARIANT_PREFIX, sVariantSetKey);
    };

    return VariantSetAdapter;
});
