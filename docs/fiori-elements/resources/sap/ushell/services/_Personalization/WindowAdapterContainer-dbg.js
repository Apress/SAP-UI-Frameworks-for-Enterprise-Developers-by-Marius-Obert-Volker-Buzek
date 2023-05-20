// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/utils",
    "sap/ushell/services/_Personalization/utils",
    "sap/ui/thirdparty/jquery"
], function (utils, personalizationUtils, jQuery) {
    "use strict";

    // --- Container for storage with window validity, data is stored in sap.ushell.services.Personalization.WindowValidityPersistence  ---
    function WindowAdapterContainer (sContainerKey, oScope, oBackendContainer, WindowAdapter) {
        this._oBackendContainer = oBackendContainer;
        this._oItemMap = new utils.Map();
        this._sContainerKey = sContainerKey;
        this.WindowAdapter = WindowAdapter;
    }

    function clear (oContainer) {
        var i,
            keys = oContainer.getItemKeys();
        for (i = 0; i < keys.length; i = i + 1) {
            oContainer.delItem(keys[i]);
        }
    }

    WindowAdapterContainer.prototype.load = function () {
        var oDeferred = new jQuery.Deferred(),
            i,
            keys,
            that = this;
        //Check if found in window object
        if (this.WindowAdapter.prototype.data[this._sContainerKey]) {
            //load data from window
            this._oItemMap.entries = personalizationUtils.clone(this.WindowAdapter.prototype.data[this._sContainerKey]);

            if (this._oBackendContainer) {
                clear(this._oBackendContainer);

                //Copy all items to the backend container
                keys = this.getItemKeys();
                for (i = 0; i < keys.length; i = i + 1) {
                    this._oBackendContainer.setItemValue(keys[i], this._oItemMap.get(keys[i]));
                }
            }
            oDeferred.resolve();
        } else if (this._oBackendContainer) { // attempt load data from front-end server
            this._oBackendContainer.load().done(function () {
                //copy received data from oAdapter into this._oItemMap.entries
                keys = that._oBackendContainer.getItemKeys();
                for (i = 0; i < keys.length; i = i + 1) {
                    that.setItemValue(keys[i], that._oBackendContainer.getItemValue(keys[i]));
                }
                //store immediately in the window variable so that the second load is satisfied from the window
                this.WindowAdapter.prototype.data[that._sContainerKey] = personalizationUtils.clone(that._oItemMap.entries);
                oDeferred.resolve();
            }.bind(this)).fail(function (sMsg) {
                oDeferred.reject(sMsg);
            });
        } else {
            this.WindowAdapter.prototype.data[this._sContainerKey] = {};
            oDeferred.resolve();
        }
        return oDeferred.promise();
    };

    WindowAdapterContainer.prototype.save = function () {
        var oDeferred = new jQuery.Deferred();
        this.WindowAdapter.prototype.data[this._sContainerKey] = personalizationUtils.clone(this._oItemMap.entries);
        if (this._oBackendContainer) {
            this._oBackendContainer.save().done(function () {
                oDeferred.resolve();
            }).fail(function (sMsg) {
                oDeferred.reject(sMsg);
            });
        } else {
            oDeferred.resolve();
        }
        return oDeferred.promise();
    };

    WindowAdapterContainer.prototype.getItemKeys = function () {
        return this._oItemMap.keys();
    };

    WindowAdapterContainer.prototype.containsItem = function (sItemKey) {
        this._oItemMap.containsKey(sItemKey);
    };

    WindowAdapterContainer.prototype.getItemValue = function (sItemKey) {
        return this._oItemMap.get(sItemKey);
    };

    WindowAdapterContainer.prototype.setItemValue = function (sItemKey, oItemValue) {
        this._oItemMap.put(sItemKey, oItemValue);
        if (this._oBackendContainer) {
            this._oBackendContainer.setItemValue(sItemKey, oItemValue);
        }
    };

    WindowAdapterContainer.prototype.delItem = function (sItemKey) {
        this._oItemMap.remove(sItemKey);
        if (this._oBackendContainer) {
            this._oBackendContainer.delItem(sItemKey);
        }
    };

    return WindowAdapterContainer;
});
