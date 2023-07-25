// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "./UserRecentsBase",
    "sap/ui/thirdparty/jquery"
], function (UserRecentsBase, jQuery) {
    "use strict";

    /**
     * @constructor
     * @private
     */
    var RecentsList = UserRecentsBase.extend("sap.ushell.services.RecentsList");

    RecentsList.prototype._updateIfAlreadyIn = function (oItem, iTimestampNow) {
        return this.aRecents.some(function (oRecentEntry) {
            var bFound;

            if (this._compareItems(oRecentEntry.oItem, oItem)) {
                oRecentEntry.oItem = oItem;
                oRecentEntry.iTimestamp = iTimestampNow;
                oRecentEntry.iCount = oRecentEntry.iCount + 1;
                bFound = true;
            } else {
                bFound = false;
            }

            return bFound;
        }.bind(this));
    };

    RecentsList.prototype._insertNew = function (oItem, iTimestampNow) {
        var oNewEntry = {
            oItem: oItem,
            iTimestamp: iTimestampNow,
            iCount: 1
        };

        if (this.aRecents.length === this.iMaxItems) {
            this.aRecents.sort(UserRecentsBase._itemSorter);
            this.aRecents.pop();
        }

        this.aRecents.push(oNewEntry);
    };

    RecentsList.prototype.clearAllActivities = function () {
        return this._save([]);
    };

    RecentsList.prototype.newItem = function (oItem) {
        var oDeferred = new jQuery.Deferred();
        var iTimestampNow = Date.now();
        var bAlreadyIn;

        this._load()
            .done(function (aLoadedRecents) {
                this.aRecents = aLoadedRecents || [];

                bAlreadyIn = this._updateIfAlreadyIn(oItem, iTimestampNow);
                if (!bAlreadyIn) {
                    this._insertNew(oItem, iTimestampNow);
                }

                this._save(this.aRecents)
                    .done(function () {
                        oDeferred.resolve();
                    })
                    .fail(function () {
                        oDeferred.reject();
                    });
            }.bind(this));

        return oDeferred.promise();
    };

    RecentsList.prototype.getRecentItems = function () {
        var oDeferred = new jQuery.Deferred();

        this._load()
            .done(function (aLoadedRecents) {
                aLoadedRecents = aLoadedRecents || [];
                aLoadedRecents.sort(UserRecentsBase._itemSorter);
                this.aRecents = aLoadedRecents.slice(0, this.iMaxItems);
                oDeferred.resolve(jQuery.map(this.aRecents, function (oRecentEntry) {
                    return oRecentEntry.oItem;
                }));
            }.bind(this));

        return oDeferred.promise();
    };

    return RecentsList;
});
