// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview
 * The Unified Shell's UserDefaultParameterPersistence service provides read and write access
 * to a per-user storage of per-user persisted values.
 *
 * Note:
 * Values may be read-only once per launchpad and storage may be more coarse-grained than on parameter level.
 * Thus inconsistencies with concurrent editing in separate clients might arise.
 *
 * Note: [security, performance]
 * Values are cached client-side (Browser HTTP Cache), if the appropriate cache-busting is used.
 *
 * This is *not* an application facing service, but for Shell Internal usage.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/base/util/ObjectPath",
    "sap/ui/thirdparty/jquery"
], function (
    Log,
    deepExtend,
    ObjectPath,
    jQuery
) {
    "use strict";

    var aValidProperties = [
        "value", // the single value
        "extendedValue", // the extended value
        "noEdit", // boolean, indicates the property should be hidden from editor
        "alwaysAskPlugin", // boolean, indicates when obtaining a parameterValue the plugins will be queried
        "_shellData", // an opaque member which the shell uses to store information (e.g. timestamps etc)
        "pluginData" // an opaque member which plugins can use to store information on it (e.g. timestamps etc)
    ];

    /**
     * The Unified Shell's UserDefaultParameterPersistence service
     * This method MUST be called by the Unified Shell's container only,
     * others MUST call <code>sap.ushell.Container.getServiceAsync("UserDefaultParameterPersistence").then(function (UserDefaultParameterPersistence) {});</code>.
     * Constructs a new instance of the UserDefaultParameterPersistence service.
     *
     * @param {object} oAdapter The service adapter for the UserDefaultParameterPersistence service, as already provided by the container
     * @param {object} oContainerInterface interface
     * @param {string} sParameter Service instantiation
     * @param {object} oConfig Service configuration (not in use)
     * @constructor
     * @class
     * @see sap.ushell.services.Container#getServiceAsync
     * @since 1.32.0
     * @private
     */
    function UserDefaultParameterPersistence (oAdapter/*, oContainerInterface, sParameter, oConfig*/) {
        this._oAdapter = oAdapter;
        this._oData = {};
    }

    UserDefaultParameterPersistence.prototype._cleanseValue = function (oValue) {
        var oResult = deepExtend({}, oValue);

        for (var a in oResult) {
            if (oResult.hasOwnProperty(a) && aValidProperties.indexOf(a) < 0) {
                delete oResult[a];
            }
        }

        return oResult;
    };

    /**
     * Returns a systemContext and defaults to the default systemContext
     * @param {object} [oSystemContext] The systemContext or undefined
     * @returns {Promise<object>} A promise resolving to a systemContext
     *
     * @private
     * @since 1.81.0
     */
    UserDefaultParameterPersistence.prototype._getSystemContextPromise = function (oSystemContext) {
        if (!oSystemContext) {
            Log.warning("UserDefaultParameterPersistence: The systemContext was not provided, using defaultSystemContext as fallback");
            return sap.ushell.Container.getServiceAsync("ClientSideTargetResolution")
                .then(function (oCSTR) {
                    return oCSTR.getSystemContext();
                });
        }
        return Promise.resolve(oSystemContext);
    };

    /**
     * Loads a specific ParameterValue from persistence.
     * The first request will typically trigger loading of all parameters from the backend.
     *
     * @param {string} sParameterName parameter name to be loaded
     * @param {object} [oSystemContext] the used system context
     * @returns {object} A jQuery promise, whose done handler receives as first argument a rich parameter object containing a value,
     *   e.g. <code>{ value : "value" }</code>. Its fail handler receives a message string as first argument.
     * @since 1.32.0
     * @private
     */
    UserDefaultParameterPersistence.prototype.loadParameterValue = function (sParameterName, oSystemContext) {
        var oDeferred = new jQuery.Deferred();

        this._getSystemContextPromise(oSystemContext).then(function (oSystemContext) {
            var sValue = ObjectPath.get([oSystemContext.id, sParameterName], this._oData);

            if (sValue !== undefined) {
                oDeferred.resolve(sValue);
            } else {
                this._oAdapter.loadParameterValue(sParameterName, oSystemContext)
                    .done(function (oValue) {
                        var oCleansedValue = this._cleanseValue(oValue);

                        ObjectPath.set([oSystemContext.id, sParameterName], oCleansedValue, this._oData);

                        Log.debug(
                            "[UserDefaults] Fetched \"" + sParameterName + "\" for SystemContext=" + oSystemContext.id + " from Persistence",
                            JSON.stringify(oCleansedValue, null, 2)
                        );

                        oDeferred.resolve(oCleansedValue);
                    }.bind(this))
                    .fail(oDeferred.reject.bind(this));
            }
        }.bind(this));

        return oDeferred.promise();
    };

    /**
     * Method to save the parameter value to persistence,
     * note that adapters may choose to save the value delayed and return early with a succeeded promise
     *
     * @param {string} sParameterName Parameter name
     * @param {object} oValueObject Parameter value object, contains at least <code>{ value :... }</code>
     * @param {object} [oSystemContext] The used system context
     * @returns {object} A jQuery promise, whose done handler receives no parameters.
     *   Its fail handler receives a message string as first argument.
     * @since 1.32.0
     * @public
     * @alias sap.ushell.services.UserDefaultParameterPersistence#saveParameterValue
     */
    UserDefaultParameterPersistence.prototype.saveParameterValue = function (sParameterName, oValueObject, oSystemContext) {
        var oDeferred = new jQuery.Deferred();
        var oCleansedValueObject;

        this._getSystemContextPromise(oSystemContext).then(function (oSystemContext) {
            if (!oValueObject) {
                return this.deleteParameter(sParameterName, oSystemContext)
                    .done(oDeferred.resolve)
                    .fail(oDeferred.reject);
            }

            oCleansedValueObject = this._cleanseValue(oValueObject);

            if (oValueObject && oValueObject.noStore === true) {
                Log.debug(
                    "[UserDefaults] Skipped Save \"" + sParameterName + "\" for SystemContext=" + oSystemContext.id,
                    "noStore=true"
                );

                return oDeferred.resolve();
            }

            Log.debug(
                "[UserDefaults] Saving \"" + sParameterName + "\" for SystemContext=" + oSystemContext.id + " to Persistence",
                JSON.stringify(oCleansedValueObject, null, 2)
            );

            ObjectPath.set([oSystemContext.id, sParameterName], oCleansedValueObject, this._oData);
            return this._oAdapter.saveParameterValue(sParameterName, oCleansedValueObject, oSystemContext)
                .done(oDeferred.resolve)
                .fail(oDeferred.reject);
        }.bind(this));

        return oDeferred.promise();
    };

    /**
     * Method to delete a parameter value from persistence
     * note that adapters may choose to save the value delayed and return early with a succeeded promise
     *
     * @param {string} sParameterName Parameter name to be deleted
     * @param {object} [oSystemContext] The system context to be used
     * @returns {object} A jQuery promise, whose done handler receives no parameters.
     *   Its fail handler receives a message string as first argument.
     * @since 1.32.0
     * @public
     * @alias sap.ushell.services.UserDefaultParameterPersistence#deleteParameter
     */
    UserDefaultParameterPersistence.prototype.deleteParameter = function (sParameterName, oSystemContext) {
        var oDeferred = new jQuery.Deferred();

        this._getSystemContextPromise(oSystemContext).then(function (oSystemContext) {
            if (this._oData[oSystemContext.id]) {
                Log.debug("[UserDefaults] Deleting \"" + sParameterName + "\" for SystemContext=" + oSystemContext.id + " from Persistence");

                delete this._oData[oSystemContext.id][sParameterName];
            }
            return this._oAdapter.deleteParameter(sParameterName, oSystemContext)
                .done(oDeferred.resolve)
                .fail(oDeferred.reject);
        }.bind(this));

        return oDeferred.promise();
    };

    /**
     * Method to obtain an array of string containing all Stored parameter names
     *
     * @param {object} oSystemContext the system context to be used
     * @returns {promise} A jQuery.Deferred whose first argument of resolve is an array of strings. The strings are sorted.
     * @since 1.32.0
     * @private
     */
    UserDefaultParameterPersistence.prototype.getStoredParameterNames = function (oSystemContext) {
        var oDeferred = new jQuery.Deferred();

        this._getSystemContextPromise(oSystemContext).then(function (oSystemContext) {
            this._oAdapter.getStoredParameterNames(oSystemContext)
                .done(function (aRes) {
                    aRes.sort();
                    oDeferred.resolve(aRes);
                })
                .fail(oDeferred.reject.bind(oDeferred));
        }.bind(this));

        return oDeferred.promise();
    };

    UserDefaultParameterPersistence.hasNoAdapter = false;
    return UserDefaultParameterPersistence;
}, true /* bExport */);
