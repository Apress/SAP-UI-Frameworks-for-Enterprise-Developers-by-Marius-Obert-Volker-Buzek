// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/services/_Personalization/constants",
    "sap/ui/fl/apply/api/UI2PersonalizationApplyAPI",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery"
], function (
    oConstants,
    UI2PersonalizationApplyAPI,
    Log,
    jQuery
) {
    "use strict";

    function rectifyKey (sContainerKey) {
        var sCONTAINER_KEY_PREFIX = "sap.ushell.personalization#";
        if (sContainerKey.substring(0, sCONTAINER_KEY_PREFIX.length) !== sCONTAINER_KEY_PREFIX) {
            Log.error("Unexpected ContainerKey " + sContainerKey);
            return sContainerKey;
        }
        var sKey = sContainerKey.substring(sCONTAINER_KEY_PREFIX.length);
        sKey = sKey.split("#")[0];
        return sKey;
    }

    AppVariantAdapterContainer.prototype._determineCategory = function (oScope) {
        if (!oScope) {
            return "U";
        }
        if (oScope.keyCategory && oScope.keyCategory === oConstants.keyCategory.FIXED_KEY &&
                oScope.writeFrequency && oScope.writeFrequency === oConstants.writeFrequency.LOW &&
                    oScope.clientStorageAllowed && oScope.clientStorageAllowed === true) {
            return "P";
        }
        return "U";
    };

    AppVariantAdapterContainer.prototype.getMap = function () {
        return {
            category: this._category,
            service: this._oService,
            changedKeys: this._oChangedKeys,
            component: this._oComponent,
            deletedKeys: this._oDeletedKeys,
            container: this._aJSONContainer,
            scope: this._oScope,
            appName: this._sAppName,
            appVarId: this._sAppVarId,
            appVersion: this._sAppVersion,
            containerKey: this._sContainerKey
        };
    };

    function AppVariantAdapterContainer (sContainerKey, oService, oScope, sAppName) {
        this._oService = oService;
        this._oScope = oScope;

        this._sAppVarId = oScope.appVarId;
        this._sAppVersion = oScope.appVersion;
        this._oComponent = oScope.component;

        this._sContainerKey = rectifyKey(sContainerKey);
        this._sAppName = sAppName || "";

        //Determine category resulting out of possible scope flag combinations
        this._category = this._determineCategory(oScope);

        this._aJSONContainer = [];
        this._oChangedKeys = {};
        this._oDeletedKeys = {};
    }

    /**
     * Resets the container item values to initial (retaining key, validity, etc!)
     */
    AppVariantAdapterContainer.prototype._reset = function () {
        this._aJSONContainer = [];
    };

    // loads data from backend, when done, oPropertyBag contains the items
    AppVariantAdapterContainer.prototype.load = function () {
        var oDeferred = new jQuery.Deferred();

        sap.ui.getCore().loadLibrary("sap/ui/fl", { async: true })
            .then(function () {
                // "sap/ui/flp" library finished bootstrapping. Now UI2PersonalizationApplyAPI can be used.
                return UI2PersonalizationApplyAPI.load({
                    selector: this._oComponent,
                    containerKey: this._sContainerKey
                });
            }.bind(this))
            .then(function (oContainer) {
                this._aJSONContainer = oContainer || [];
                oDeferred.resolve(oContainer);
            }.bind(this))
            .catch(function (sErrorMessage) {
                Log.warning(sErrorMessage);
                // load errors are ok (at least 404), return empty(!) container
                this._reset();
                oDeferred.reject(sErrorMessage);
            }.bind(this));

        return oDeferred.promise();
    };

    AppVariantAdapterContainer.prototype.save = function () {
        var aPromises = [];

        var oDeferred = new jQuery.Deferred();
        sap.ui.require(["sap/ui/fl/write/api/UI2PersonalizationWriteAPI"], function (UI2PersonalizationWriteAPI) {
            Object.keys(this._oChangedKeys).forEach(function (sItemKey) {
                var oItem = this._oChangedKeys[sItemKey];
                var mPropertyBag = Object.assign({
                        selector: this._oComponent
                    },
                    oItem
                );
                aPromises.push(UI2PersonalizationWriteAPI.create(mPropertyBag));
            }, this);
            Object.keys(this._oDeletedKeys).forEach(function (sItemKey) {
                aPromises.push(UI2PersonalizationWriteAPI.deletePersonalization({
                    selector: this._oComponent,
                    containerKey: this._sContainerKey,
                    itemName: sItemKey
                }));
            }, this);
            Promise.all(aPromises).then(function (oResult) {
                this._oChangedKeys = {};
                this._oDeletedKeys = {};
                oDeferred.resolve();
            }.bind(this), function (oError) {
                oDeferred.reject(oError);
            });
        }.bind(this));

        return oDeferred.promise();
    };

    AppVariantAdapterContainer.prototype.del = function () {
        var oDeferred = new jQuery.Deferred();
        sap.ui.require(["sap/ui/fl/write/api/UI2PersonalizationWriteAPI"], function (UI2PersonalizationWriteAPI) {
            this.load()
                .then(function () {
                    var aPromises = [];
                    this._aJSONContainer.forEach(function (oItem) {
                        aPromises.push(UI2PersonalizationWriteAPI.deletePersonalization({
                            selector: this._oComponent,
                            containerKey: this._sContainerKey,
                            itemName: oItem.itemName
                        }));
                    }, this);
                    Promise.all(aPromises).then(function (oResult) {
                        oDeferred.resolve();
                    }, function (oError) {
                        oDeferred.reject(oError);
                    });
                }.bind(this));
        }.bind(this));

        return oDeferred.promise();
    };

    AppVariantAdapterContainer.prototype.getItemKeys = function () {
        var res = [];
        // collect item names from types
        this._aJSONContainer.forEach(function (oMember) {
            if (oMember.category === "V") {
                res.push("VARIANTSET#" + oMember.itemName);
            } else if (oMember.category === "I") {
                res.push("ITEM#" + oMember.itemName);
            }
        });
        return res;
    };

    AppVariantAdapterContainer.prototype.containsItem = function (sItemKey) {
        return this.getItemKeys().indexOf(sItemKey) >= 0;
    };

    /*
     * Find item index by internal true key
     */
    AppVariantAdapterContainer.prototype._findItemIndex = function (sItemId, sCategory) {
        var i;
        for (i = 0; i < this._aJSONContainer.length; i = i + 1) {
            if (this._aJSONContainer[i].itemName === sItemId && this._aJSONContainer[i].category === sCategory) {
                return i;
            }
        }
        return undefined;
    };

    /*
     * Locates an item for the key sItemKey which is prefixed by the type,
     * returns  { index : nr,  TrueItemKey : truekey,  containerProperty : }
     * either trueKey xor containerProperty is set.
     * index is filled iff it is a present item
     */
    AppVariantAdapterContainer.prototype._locateItem = function (sItemKey) {
        var res = { index: -1};

        // Remove prefix, mapping into category,
        // Strip prefix from itemkey and truncate to 40 effective characters
        if (sItemKey.indexOf("ITEM#") === 0) {
            res.trueItemKey = sItemKey.substring("ITEM#".length, "ITEM#".length + 40);
            res.category = "I";
        } else if (sItemKey.indexOf("VARIANTSET#") === 0) {
            res.trueItemKey = sItemKey.substring("VARIANTSET#".length, "VARIANTSET#".length + 40);
            res.category = "V";
        } else if (sItemKey.indexOf("ADMIN#") !== 0) {
            Log.error("Unknown itemkey prefix" + sItemKey);
        }
        res.index = this._findItemIndex(res.trueItemKey, res.category);
        return res;
    };

    AppVariantAdapterContainer.prototype.getItemValue = function (sItemKey) {
        var sItemValue = "",
            oItemValue,
            oItemRef = this._locateItem(sItemKey);
        if (oItemRef.index >= 0) {
            sItemValue = this._aJSONContainer[oItemRef.index].content;
            oItemValue = sItemValue;
        }
        return oItemValue;
    };


    /**
     * set oItemValue under sItemKey
     * returns undefined
     */
    AppVariantAdapterContainer.prototype.setItemValue = function (sItemKey, oItemValue) {
        var oItemRef = this._locateItem(sItemKey);
        var oItem;
        if (oItemRef.index >= 0) {
            oItem = this._aJSONContainer[oItemRef.index];
            oItem.content = oItemValue;
        } else {
            // not yet present
            oItem = {
                reference: this._sAppVarId,
                content: oItemValue,
                itemName: oItemRef.trueItemKey,
                category: oItemRef.category,
                containerKey: this._sContainerKey,
                containerCategory: this._category
            };
            this._aJSONContainer.push(oItem);
        }
        this._oChangedKeys[oItemRef.trueItemKey] = oItem;
        delete this._oDeletedKeys[oItemRef.trueItemKey];
    };

    /**
     * delete (1st) item with key sItemKey
     */
    AppVariantAdapterContainer.prototype.delItem = function (sItemKey) {
        var oItemRef = this._locateItem(sItemKey);
        if (oItemRef.index >= 0) {
            this._aJSONContainer.splice(oItemRef.index, 1);
            this._oDeletedKeys[oItemRef.trueItemKey] = true;
            return;
        }
    };

    var AppVariantPersonalizationAdapter = function () {};

    AppVariantPersonalizationAdapter.prototype.getAdapterContainer = function (sContainerKey, oScope, sAppName) {
        return new AppVariantAdapterContainer(sContainerKey, this, oScope, sAppName);
    };

    AppVariantPersonalizationAdapter.prototype.delAdapterContainer = function (sContainerKey, oScope) {
        return this.getAdapterContainer(sContainerKey, oScope).del();
    };

    return AppVariantPersonalizationAdapter;
});
