// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/utils",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log"
], function (utils, jQuery, Log) {
    "use strict";

    /**
     * To be called by the personalization service getPersonalizer method.
     *
     * @class The Unified Shell personalizer providing set get delete
     *        methods to access the persisted personalization data in direct mode.
     *
     * @public
     * @since 1.15.0
     */
    function Personalizer (oService, oAdapter, oPersId, oScope, oComponent) {
        this._sPersContainer = "";
        this._sPersItem = "";
        this._sPersVariant = null;
        this._oAdapter = oAdapter;
        this._oService = oService;
        this._oScope = oScope;
        this._oComponent = oComponent;

        if (!oPersId || !oPersId.container || !oPersId.item ||
                typeof oPersId.container !== "string" || typeof oPersId.item !== "string") {
            throw new utils.Error("Invalid input for oPersId: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        this._sPersContainer = oPersId.container; // prefix is added in container constructor
        this._sPersItem = oPersId.item;
    }

    Personalizer.prototype._getContainer = function (sPersContainer) {
        if (!this._oGetContainerPromise) {
            this._oGetContainerPromise = this._oService.getContainer(sPersContainer, this._oScope, this._oComponent);
        }
        return this._oGetContainerPromise;
    };

    /**
     * Gets a personalization data value.
     *
     * @returns {object}
     *          Promise object which provides the personalization value.
     *          Promise object done function: param {object} oValue JSON
     *          object containing the personalization value. If there is no
     *          personalization data for the item, undefined is returned. Promise
     *          object fail function: param {string} sMessage Error message.
     *
     * @public
     * @since 1.15.0
     */
    Personalizer.prototype.getPersData = function () {
        // async
        var oDeferred = {},
            that = this;

        oDeferred = new jQuery.Deferred();
        this._getContainer(this._sPersContainer)
            .fail(function () {
                // TODO
                oDeferred.reject();
            })
            .done(function (oContainer) {
                oDeferred.resolve(oContainer.getItemValue(that._sPersItem));
            });

        oDeferred.fail(function () {
            Log.error("Fail to get Personalization data for Personalizer container: " + that._sPersContainer);
        });
        return oDeferred.promise();
    };

    /**
     * Sets a personalization data value.
     *
     * @param {object} oValue
     *          JSON object containing the personalization value.
     * @returns {object}
     *          Promise object which returns if the saving was
     *          successful or erroneous. Promise object done function: no
     *          params. Promise object fail function: param {string} sMessage
     *          Error message
     *
     * @public
     * @since 1.15.0
     */
    Personalizer.prototype.setPersData = function (oValue) {
        // async
        var oDeferred = {},
            that = this;

        oDeferred = new jQuery.Deferred();
        this._getContainer(this._sPersContainer)
            .fail(function () {
                // TODO
                oDeferred.reject();
            })
            .done(function (oContainer) {
                oContainer.setItemValue(that._sPersItem, oValue);
                oContainer.save()
                    .fail(function () {
                        // TODO
                        oDeferred.reject();
                    })
                    .done(function () {
                        oDeferred.resolve();
                    });
            });

        oDeferred.fail(function () {
            Log.error("Fail to set Personalization data for Personalizer container: " + that._sPersContainer);
        });
        return oDeferred.promise();
    };
    /**
     * Deletes a personalization data value.
     *
     * @returns {object}
     *          Promise object which returns if the deletion was
     *          successful or erroneous. Promise object done function: no
     *          params. Promise object fail function: param {string} sMessage
     *          Error message.
     *
     * @public
     * @since 1.15.0
     */
    Personalizer.prototype.delPersData = function () {
        // async
        var oDeferred = {},
            that = this,
            oMessagingPromise;

        oDeferred = new jQuery.Deferred();
        this._getContainer(this._sPersContainer)
            .fail(function () {
                // TODO
                oDeferred.reject();
            })
            .done(function (oContainer) {
                oContainer.delItem(that._sPersItem);
                oContainer.save()
                    .fail(function () {
                        // TODO
                        oDeferred.reject();
                    })
                    .done(function () {
                        oDeferred.resolve();
                    });
            });

        oMessagingPromise = oDeferred.promise();
        oMessagingPromise.fail(function () {
            Log.error("Fail to delete Personalization data for Personalizer container: " + this._sPersContainer);
        });
        return oMessagingPromise;
    };

    return Personalizer;
});
