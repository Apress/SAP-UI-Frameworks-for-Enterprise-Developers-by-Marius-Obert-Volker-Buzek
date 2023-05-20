// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/base/Object",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery"
], function (BaseObject, Log, jQuery) {
    "use strict";

    var PERSONALIZATION_CONTAINER = "sap.ushell.services.UserRecents";

    /**
     * Base class for all helper classes.
     * @constructor
     * @private
     */
    var UserRecentsBase = BaseObject.extend("sap.ushell.services.UserRecentsBase", {
        constructor: function (personalizationItemName, maxItems, compareItems) {
            this.aRecents = [];
            this.iMaxItems = maxItems;

            this._oPersonalizerPromise = sap.ushell.Container.getServiceAsync("Personalization")
                .then(function (PersonalizationService) {
                    return PersonalizationService.getPersonalizer({
                        container: PERSONALIZATION_CONTAINER,
                        item: personalizationItemName
                    });
                });

            this._compareItems = compareItems;
        }
    });

    UserRecentsBase.prototype._load = function () {
        var oDeferred = new jQuery.Deferred();

        this._oPersonalizerPromise
            .then(function (oPersonalizer) {
                oPersonalizer.getPersData()
                    .done(oDeferred.resolve)
                    .fail(oDeferred.reject);
            })
            .catch(function (error) {
                Log.error("Personalization service does not work:");
                Log.error(error.name + ": " + error.message);

                oDeferred.reject(error);
            });

        return oDeferred.promise();
    };

    UserRecentsBase.prototype._save = function (aList) {
        var oDeferred = new jQuery.Deferred();

        this._oPersonalizerPromise
            .then(function (oPersonalizer) {
                oPersonalizer.setPersData(aList)
                    .done(oDeferred.resolve)
                    .fail(oDeferred.reject);
            })
            .catch(function (error) {
                Log.error("Personalization service does not work:");
                Log.error(error.name + ": " + error.message);

                oDeferred.reject(error);
            });

        return oDeferred.promise();
    };

    UserRecentsBase._itemSorter = function (oItem1, oItem2) {
        return oItem2.iTimestamp - oItem1.iTimestamp;
    };

    return UserRecentsBase;
});
