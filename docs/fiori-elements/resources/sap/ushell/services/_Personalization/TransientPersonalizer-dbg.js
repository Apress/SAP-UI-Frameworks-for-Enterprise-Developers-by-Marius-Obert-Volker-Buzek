// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
"sap/ui/thirdparty/jquery"
], function (jQuery) {
    "use strict";

    /**
     * To be called by the personalization service getTransientPersonalizer method.
     *
     * @class The transient personalizer shall be used
     *        in container mode for table personalization.
     *
     * @public
     * @name sap.ushell.services.TransientPersonalizer
     * @since 1.18.0
     */
    function TransientPersonalizer () {
        this._oValue = undefined;
    }

    /**
     * Gets a personalization data value.
     *
     * @name sap.ushell.services.TransientPersonalizer#getPersData
     *
     * @returns {object}
     *          Promise object which provides the personalization
     *          value. Promise object done function: param {object} oValue JSON
     *          object containing the personalization value. If there is no
     *          personalization data for the item, undefined is returned.
     *          Promise object fail function ins never triggered.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    TransientPersonalizer.prototype.getPersData = function () {
        var oDeferred;

        oDeferred = new jQuery.Deferred();
        oDeferred.resolve(this._oValue);
        return oDeferred.promise();
    };

    /**
     * Sets a personalization data value.
     *
     * @name sap.ushell.services.TransientPersonalizer#setPersData
     *
     * @param {object} oValue
     *          JSON object containing the personalization value.
     * @returns {object}
     *          Promise object which returns if the saving was
     *          successful or erroneous. Promise object done function: no
     *          params. Promise fail function ins never triggered.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    TransientPersonalizer.prototype.setPersData = function (oValue) {
        var oDeferred;

        oDeferred = new jQuery.Deferred();
        this._oValue = oValue;
        oDeferred.resolve();
        return oDeferred.promise();
    };

    /**
     * Deletes a personalization data value.
     *
     * @name sap.ushell.services.TransientPersonalizer#delPersData
     *
     * @returns {object}
     *          Promise object which returns if the deletion was
     *          successful or erroneous. Promise object done function: no
     *          params. Promise object fail function ins never triggered.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    TransientPersonalizer.prototype.delPersData = function () {
        var oDeferred;

        oDeferred = new jQuery.Deferred();
        this._oValue = undefined;
        oDeferred.resolve();
        return oDeferred.promise();
    };

    /**
     * Synchronously sets a personalization data value.
     *
     * @name sap.ushell.services.TransientPersonalizer#setValue
     *
     * @param {object} oValue
     *            JSON object containing the personalization value.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    TransientPersonalizer.prototype.setValue = function (oValue) {
        this._oValue = oValue;
    };

    /**
     * Synchronously gets a personalization data value.
     *
     * @name sap.ushell.services.TransientPersonalizer#getValue
     *
     * @returns {object}
     *            JSON object containing the personalization value.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    TransientPersonalizer.prototype.getValue = function () {
        return this._oValue;
    };

    return TransientPersonalizer;

});
