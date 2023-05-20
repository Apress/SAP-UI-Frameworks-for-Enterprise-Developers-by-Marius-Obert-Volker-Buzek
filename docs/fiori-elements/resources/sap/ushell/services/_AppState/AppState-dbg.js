// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
"sap/base/Log",
"sap/ui/thirdparty/jquery"
], function (Log, jQuery) {
    "use strict";

    /**
     * Container for an application state
     * @param {object} oServiceInstance
     *   Ignored
     * @param {string} sKey
     *   Application state key
     * @param {boolean} bModifiable
     *   Distinguishes whether an application state is modifiable or not
     * @param {string} sData
     *   Application state data
     * @param {string} sAppName The frontend component name.
     * @param {string} sACHComponent The application component (e.g. CA-UI2-INT-FE).
     * @param {boolean} bTransient Indicates that data should only be stored in the window object.
     * @param {string} sPersistencyMethod See sap/ushell/services/_AppState/AppStatePersistencyMethod for possible values.
     *                                    Support depends on the used platform.
     * @param {object} oPersistencySettings
     *  collect supplemental information needed for the persistency method
     *
     * @private
     */
    function AppState (oServiceInstance, sKey, bModifiable, sData, sAppName, sACHComponent, bTransient, sPersistencyMethod, oPersistencySettings) {
        this._oServiceInstance = oServiceInstance;
        this._sKey = sKey;
        this._sData = sData;
        this._sAppName = sAppName;
        this._sACHComponent = sACHComponent;
        this._bTransient = bTransient;
        this._bModifiable = bModifiable;
        this._sPersistencyMethod = sPersistencyMethod;
        this._oPersistencySettings = oPersistencySettings;

        if (this._bModifiable) {
            this.setData = function (oData) {
                try {
                    this._sData = JSON.stringify(oData);
                } catch (e) {
                    Log.error("Data can not be serialized", "sap.ushell.services.AppState.AppState");
                    this._sData = undefined;
                }
            };
            this.save = save.bind(this);
            this.delete = deleteState.bind(this);
        }
    }

    function save () {
        var oDeferred = new jQuery.Deferred();
        this._oServiceInstance._saveAppState(this._sKey, this._sData, this._sAppName, this._sACHComponent,
            this._bTransient, this._sPersistencyMethod, this._oPersistencySettings).done(function () {
            oDeferred.resolve();
        }).fail(function (sMsg) {
            oDeferred.reject(sMsg);
        });
        return oDeferred.promise();
    }

    function deleteState () {
        var oDeferred = new jQuery.Deferred();
        this._oServiceInstance._deleteAppState(this._sKey).done(function () {
            oDeferred.resolve();
        }).fail(function (sMsg) {
            oDeferred.reject(sMsg);
        });
        return oDeferred.promise();
    }

    /**
     * Method to get the data of an application state
     *
     * @returns {object} Application state data
     * @private
     * @since 1.28.0
     */
    AppState.prototype.getData = function () {
        var o;
        if (this._sData === undefined || this._sData === "") {
            return undefined;
        }
        try {
            o = JSON.parse(this._sData);
        } catch (ex) {
            Log.error("Could not parse [" + this._sData + "]" + ex);
        }
        return o;
    };

    /**
     * Method to get the application state Persistency Method
     *
     * @returns {string} Application state Persistency Method
     * @private
     * @since 1.67.0
     */
    AppState.prototype.getPersistencyMethod = function () {
        return this._sPersistencyMethod;
    };

    /**
     * Method to get the application state Persistency Settings
     *
     * @returns {string} Application state Persistency Settings
     * @private
     * @since 1.67.0
     */
    AppState.prototype.getPersistencySettings = function () {
        return this._oPersistencySettings;
    };

    /**
     * Method to get the application state key
     *
     * @returns {string} Application state key
     * @private
     * @since 1.28.0
     */
    AppState.prototype.getKey = function () {
        return this._sKey;
    };

    return AppState;
});
