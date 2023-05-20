// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/services/_AppState/Sequentializer"
], function (Sequentializer) {
    "use strict";

    /**
     * Adapter which is responsible for serializing access to the underlying adapter methods
     *
     * @param {object} oUnderlyingAdapter underlying adapter
     * @private
     * @since 1.28.0
     */
    function SequentializingAdapter (oUnderlyingAdapter) {
        this._oSequentializer = new Sequentializer();
        this._oUnderlyingAdapter = oUnderlyingAdapter;
    }

    /**
     * Method to save an application state (sequentialized)
     * delegating to the underlying adapter, but using a sequentialized implementation
     *
     * @param {string} sKey
     *   Application state key
     * @param {string} sSessionKey
     *   Current session key
     * @param {string} sData
     *   Application state data
     * @param {string} sAppname
     *   Application name
     * @param {string} sComponent
     *   UI5 component name
     *
     * @returns {object} promise
     * @private
     * @since 1.28.0
     */
    SequentializingAdapter.prototype.saveAppState = function (sKey, sSessionKey, sData, sAppname, sComponent, iPersistencyMethod, oPersistencySettings) {
        var fn;
        fn = this._oUnderlyingAdapter.saveAppState.bind(this._oUnderlyingAdapter, sKey, sSessionKey, sData, sAppname, sComponent, iPersistencyMethod, oPersistencySettings);
        return this._oSequentializer.addToQueue(fn);
    };

    /**
     * Method to load an application state
     * delegating directly to the underlying adapter
     *
     * @param {string} sKey
     *   Application state key
     *
     * @returns {object} promise
     *   Resolve handler has args (key, value)
     * @private
     * @since 1.28.0
     */
    SequentializingAdapter.prototype.loadAppState = function (sKey) {
        return this._oUnderlyingAdapter.loadAppState(sKey);
    };

    /**
     * Method to delete an application state
     * delegating directly to the underlying adapter
     *
     * @param {string} sKey
     *   Application state key
     *
     * @returns {object} promise
     *   Resolve handler has args (key, value)
     * @private
     * @since 1.69.0
     */
    SequentializingAdapter.prototype.deleteAppState = function (sKey) {
        if (this._oUnderlyingAdapter && this._oUnderlyingAdapter.deleteAppState) {
            return this._oUnderlyingAdapter.deleteAppState(sKey);
        }
    };

    SequentializingAdapter.prototype.getSupportedPersistencyMethods = function () {
        if (this._oUnderlyingAdapter && this._oUnderlyingAdapter.getSupportedPersistencyMethods) {
            return this._oUnderlyingAdapter.getSupportedPersistencyMethods();
        }
        return [];
    };

    return SequentializingAdapter;
});
