// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/services/_AppState/LimitedBuffer",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery"
], function (LimitedBuffer, Log, jQuery) {
    "use strict";

    var WINDOW_APPSTATE_CAPACITY = 500;
    var CROSS_ORIGIN_EXCEPTION_ERROR_CODE = 18;

    /**
     * Adapter which is responsible for the storing the application state
     * in the JavaScript window object.
     * The data is stored in sap.ushell.services.AppState.WindowAdapter.prototype.data
     *
     * @param {string} oServiceInstance
     *            Current service instance
     * @param {object} oBackendAdapter
     *            BackendAdapter -> may be undefined
     * @param {object} oConfig
     *   a configuration object which may contain initial appstate data in
     *   the format:
     * <pre>
     *    {initialAppState : { <Key> : JSON.stringify(<content>) ,
     *                         <Key2> : JSON.stringify(<content>)
     * </pre>
     * @private
     * @since 1.28.0
     */
    function WindowAdapter (/* args... */) {
        this._init.apply(this, arguments);
    }

    WindowAdapter.prototype._init = function (oServiceInstance, oBackendAdapter, oConfig) {
        var oInitialAppStates = oConfig && oConfig.config && oConfig.config.initialAppStates || {};
        var oInitialAppStatesPromise = oConfig && oConfig.config && oConfig.config.initialAppStatesPromise;
        this._oServiceInstance = oServiceInstance;
        this._oBackendAdapter = oBackendAdapter;
        // prepare window storage
        if (!WindowAdapter.prototype.data) {
            WindowAdapter.prototype.data = new LimitedBuffer(WINDOW_APPSTATE_CAPACITY);
        }
        if (oInitialAppStatesPromise) {
            oInitialAppStatesPromise.then(function (oInitialAppStates) {
                if (typeof oInitialAppStates === "object") {
                    // register all initial keys
                    Object.keys(oInitialAppStates).forEach(function (sKey) {
                        WindowAdapter.prototype.data.addAsHead(sKey, oInitialAppStates[sKey]);
                    });
                }
            });
        }
        // register all initial keys
        Object.keys(oInitialAppStates).forEach(function (sKey) {
            WindowAdapter.prototype.data.addAsHead(sKey, oInitialAppStates[sKey]);
        });
    };

    /**
     * Method to save an application state in the window object.
     * If a backend adapter is defined, the application state
     * will be also saved in the backend system.
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
     * @param {boolean} bTransient
     *   whether the data should be only stored within the window
     *
     * @returns {object} promise
     * @private
     * @since 1.28.0
     */
    WindowAdapter.prototype.saveAppState = function (sKey, sSessionKey, sData, sAppname, sComponent, bTransient, iPersistencyMethod, oPersistencySettings) {
        this.sComponent = sComponent;
        var oDeferred = new jQuery.Deferred();
        // save application state in the window object (key and data)
        WindowAdapter.prototype.data.addAsHead(sKey, sData, iPersistencyMethod, oPersistencySettings);
        // save application state via backend adapter if available and not transient!
        if (this._oBackendAdapter && !bTransient) {
            return this._oBackendAdapter.saveAppState(sKey, sSessionKey, sData, sAppname, sComponent, iPersistencyMethod, oPersistencySettings);
        }
        oDeferred.resolve();
        return oDeferred.promise();
    };

    /**
     * Method to check if AppState is transient
     *
     * @param {string} sKey
     *   Application state key
     *
     * @returns {boolean}
     * @private
     */
    WindowAdapter.prototype._checkIfTransient = function (sKey) {
        return sKey.startsWith("TAS");
    };

    /**
     * Method to load an application state from the window object.
     * If the respective application state is not found there,
     * and the application was opened by a explace navigation,
     * the application state will be loaded from the opening FLP window object,
     * if that is also not available it will be loaded from the backend system.
     *
     * @param {string} sKey
     *   Application state key
     *
     * @returns {object} promise
     * @private
     * @since 1.28.0
     */
    WindowAdapter.prototype.loadAppState = function (sKey) {
        var oDeferred = new jQuery.Deferred(),
            appStateFromWindow = WindowAdapter.prototype.data.getByKey(sKey);

        if (appStateFromWindow) {
            setTimeout(function () {
                oDeferred.resolve(sKey, appStateFromWindow.value, appStateFromWindow.persistencyMethod, appStateFromWindow.persistencySettings);
            }, 0);
            return oDeferred.promise();
        }
        /*
            We need to do this with a synchronous method because async calls to the opener
            will not be handled until the opening window/tab is focused.
            In most cases this would lead to the AppState not being loaded at all.

            Note: This needs to be done in a try-catch to avoid errors due to mismatching origin of the opener.
            A common case where this happens is when the FLP is opened from a BCP incident. In that case
            the browser throws a Security exception due to cross origin requests as it is not allowed
            to access any properties of a cross-origin window.opener!
        */
        try {
            if (window.opener && window.opener.sap && window.opener.sap.ushell) {
                var oAppStateFromParentWindow = window.opener.sap.ui.require("sap/ushell/services/AppState").WindowAdapter.prototype.data.getByKey(sKey);

                if (oAppStateFromParentWindow) {
                    oDeferred.resolve(sKey, oAppStateFromParentWindow.value);
                    return oDeferred.promise();
                }
            }
        } catch (error) {
            if (error.code === CROSS_ORIGIN_EXCEPTION_ERROR_CODE) {
                Log.warning("AppState.js - loadAppState: Opener is not of the same origin and cannot be used for AppState resolving.");
            } else {
                Log.warning("AppState.js - loadAppState: Opener is a FLP but AppState could not get resolved from there.");
            }
        }
        // load application state via backend adapter if available
        // if transient, return and avoid unnecessary backend request
        if (this._oBackendAdapter && !this._checkIfTransient(sKey)) {
            this._oBackendAdapter.loadAppState(sKey).done(function (sKey, sData, persistencyMethod, persistencySettings) {
                // save application state in the window object (key and data)
                WindowAdapter.prototype.data.addAsHead(sKey, sData);
                oDeferred.resolve(sKey, sData, persistencyMethod, persistencySettings);
            }).fail(oDeferred.reject.bind(oDeferred));
            return oDeferred.promise();
        }
        oDeferred.reject("AppState.js - loadAppState: Application State could not be loaded");
        return oDeferred.promise();
    };

    /**
     * Method to delete an application state in the window object.
     * If a backend adapter is defined, the application state
     * will be also deleted in the backend system.
     *
     * @param {string} sKey
     *   Application state key
     *
     * @returns {object} promise
     * @private
     * @since 1.28.0
     */
    WindowAdapter.prototype.deleteAppState = function (sKey) {
        var oDeferred = new jQuery.Deferred();
        // delete application state in the window object (key and data)
        WindowAdapter.prototype.data.deleteByKey(sKey);
        // delete application state via backend adapter if available and not transient!
        if (this._oBackendAdapter && this._oBackendAdapter.deleteAppState && !this._checkIfTransient(sKey)) {
            return this._oBackendAdapter.deleteAppState(sKey);
        }
        oDeferred.resolve();
        return oDeferred.promise();
    };

    WindowAdapter.prototype.getSupportedPersistencyMethods = function () {
        if (this._oBackendAdapter && this._oBackendAdapter.getSupportedPersistencyMethods) {
            return this._oBackendAdapter.getSupportedPersistencyMethods();
        }
        return [];
    };

    return WindowAdapter;
});
