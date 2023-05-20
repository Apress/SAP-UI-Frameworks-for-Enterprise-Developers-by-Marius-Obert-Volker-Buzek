// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Fiori20 adapter is not a platform adapter, but a UI adapter.
 *
 * The Fiori20 adapter automatically re-styles old (Fiori 1) applications to match Fiori2 design requirements.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/core/Component",
    "sap/ui/core/UIComponent",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/Fiori20Adapter",
    "sap/ui/thirdparty/hasher",
    "sap/base/util/extend"
], function (
    BaseObject,
    Component,
    UIComponent,
    ResourceModel,
    SapMFiori20Adapter,
    hasher,
    extend
) {
    "use strict";

    var oUIService;

    UIComponent._fnOnInstanceDestroy = function (oComponent) {
        if (oComponent._fioriAdapter) {
            oComponent._fioriAdapter.destroy();
        }
    };

    /**
     * Fetches application information from app-descriptor or metadata
     *
     * @type {Function}
     */
    var AppInfo = BaseObject.extend("AppInfo", {
        constructor: function (oComponent) {
            BaseObject.call(this);
            this._oComponent = oComponent;
        },

        getDefaultTitle: function () {
            var sTitle,
                sResBundle,
                oMetadata = this._oComponent.getMetadata();

            // first possible source
            var oAppInfo = oMetadata.getManifestEntry("sap.app");
            if (oAppInfo && oAppInfo.title) {
                sTitle = oAppInfo.title;
                if (this._isLocalizationKey(sTitle)) {
                    sResBundle = (oAppInfo.i18n || "i18n/i18n.properties");
                    return this._getLocalized(sTitle, sResBundle);
                }
                return sTitle;
            }

            // second possible source
            var oUI5Info = oMetadata.getManifestEntry("sap.ui5");
            if (oUI5Info && oUI5Info.config && oUI5Info.config.resourceBundle && oUI5Info.config.titleResource) {
                sTitle = oUI5Info.config.titleResource;
                sResBundle = oUI5Info.config.resourceBundle;
                return this._getLocalized(sTitle, sResBundle);
            }

            return;
        },

        _getLocalized: function (sText, sResBundle) {
            var oModel = new ResourceModel({
                bundleUrl: sap.ui.require.toUrl(this._oComponent.getMetadata().getComponentName()) + "/" + sResBundle
            });
            return oModel.getResourceBundle().getText(sText.replace(/^{{/, "").replace(/}}$/, ""));
        },

        _isLocalizationKey: function (sTitle) {
            return (sTitle.indexOf("{{") === 0) && (sTitle.indexOf("}}") > 0);
        }
    });

    /**
     * Sets header info (title and navigation hierarchy) to the FLP header via the ShellUIService
     *
     * @type {Function}
     */
    var HeaderInfo = BaseObject.extend("HeaderInfo", {
        constructor: function (oComponent, oConfig, oAppInfo) {
            BaseObject.call(this);
            this._oConfig = oConfig;
            this._oAppInfo = oAppInfo;

            this._aHierarchy = [];
            this._defaultTitle = this._oAppInfo.getDefaultTitle();
            this._oCurrentViewInfo = { oTitleInfo: { text: this._defaultTitle } };
        },

        registerView: function (oViewInfo) {
            if (this._oConfig.bMoveTitle === true) { // disabled by configuration
                if (!oViewInfo.oTitleInfo && oViewInfo.oSubTitleInfo) {
                    oViewInfo.oTitleInfo = oViewInfo.oSubTitleInfo; // subtitle promotion in the absence of title
                }

                this._oCurrentViewInfo = oViewInfo;
                var sTitle = this._oCurrentViewInfo.oTitleInfo ? this._oCurrentViewInfo.oTitleInfo.text : undefined;
                if (sTitle !== oUIService.getTitle()) {
                    oUIService.setTitle(sTitle);
                }
                this._updateHierarchy();
            }

            this._setBackNavigation(oViewInfo.oBackButton, oViewInfo.oAdaptOptions);
        },

        _setBackNavigation: function (oBackButton, oAdaptOptions) {
            if (oAdaptOptions && oAdaptOptions.bHideBackButton === false) { // disabled by configuration
                return;
            }
            var fnBackPress;
            if (oBackButton) {
                fnBackPress = oBackButton.firePress.bind(oBackButton);
            }
            oUIService.setBackNavigation(fnBackPress);
        },

        _updateHierarchy: function () {
            if (this._oConfig.bHierarchy === false) { // disabled by configuration
                return;
            }

            if (!this._oCurrentViewInfo) {
                return;
            }

            var bNew = true,
                sHash = "#" + hasher.getHash();

            for (var i = this._aHierarchy.length - 1; i >= 0; i--) {
                var oEntry = this._aHierarchy[i],
                    bKnownView = (oEntry.id === this._oCurrentViewInfo.sViewId),
                    bKnownHash = (oEntry.intent === sHash);

                if (bKnownView || bKnownHash) {
                    bNew = false;
                    oEntry = this._updateHierarchyEntry(oEntry);
                    this._aHierarchy[i] = oEntry;
                    this._aHierarchy = this._aHierarchy.slice(0, i + 1);
                    if (bKnownView) {
                        oEntry.intent = sHash;
                    }
                    break;
                }
            }

            if (bNew) {
                this._aHierarchy.push(this._createHierarchyEntry());
            }

            var aNewHierarchy = [];
            for (var j = this._aHierarchy.length - 2; j >= 0; j--) {
                aNewHierarchy.push(this._aHierarchy[j]);
            }

            oUIService.setHierarchy(this._deleteUndefinedProperties(aNewHierarchy));
        },

        _createHierarchyEntry: function () {
            var sHash = "#" + hasher.getHash(),
                oEntry = {
                    id: this._oCurrentViewInfo.sViewId,
                    title: this._oCurrentViewInfo.oTitleInfo ? this._oCurrentViewInfo.oTitleInfo.text : this._defaultTitle,
                    subtitle: this._oCurrentViewInfo.oSubTitleInfo ? this._oCurrentViewInfo.oSubTitleInfo.text : undefined,
                    intent: sHash
                };
            return oEntry;
        },

        _updateHierarchyEntry: function (oEntry) {
            oEntry.id = this._oCurrentViewInfo.sViewId;
            oEntry.title = this._oCurrentViewInfo.oTitleInfo ? this._oCurrentViewInfo.oTitleInfo.text : this._defaultTitle;
            oEntry.subtitle = this._oCurrentViewInfo.oSubTitleInfo ? this._oCurrentViewInfo.oSubTitleInfo.text : undefined;
            return oEntry;
        },

        /* ShellUIService validation throws an error if a string field received a falsy (undefined or null) value */
        _deleteUndefinedProperties: function (aObjects) { // TODO: think refactor
            aObjects.forEach(function (oObject) {
                for (var sPropertyName in oObject) {
                    if (oObject.hasOwnProperty(sPropertyName) && !oObject[sPropertyName] && sPropertyName !== "title") {
                        delete oObject[sPropertyName];
                    }
                }
            });
            return aObjects;
        }
    });

    var Fiori20Adapter = BaseObject.extend("sap.ushell.Fiori20Adapter", {
        constructor: function (oComponent, oConfig) {
            BaseObject.call(this);
            this._oComponent = oComponent;
            this._oConfig = oConfig;

            this._oHeaderInfo = new HeaderInfo(oComponent, oConfig, new AppInfo(oComponent));

            if (SapMFiori20Adapter) {
                SapMFiori20Adapter.attachViewChange(this._onViewChange, this);
            }
        },

        init: function () {
            if (!SapMFiori20Adapter) {
                return;
            }

            var oConfig = extend({}, this._oConfig);
            SapMFiori20Adapter.traverse(this._oComponent.getAggregation("rootControl"), oConfig);
        },

        destroy: function () {
            if (SapMFiori20Adapter) {
                SapMFiori20Adapter.detachViewChange(this._onViewChange, this);
            }
        },

        _onViewChange: function (oEvent) {
            this._oHeaderInfo.registerView(oEvent.getParameters());
        }
    });

    Fiori20Adapter.applyTo = function (oControl, oComponent, oConfig, oService) {
        var oOwner = oControl instanceof UIComponent ? oControl : Component.getOwnerComponentFor(oControl);
        if (!oOwner) {
            oOwner = oComponent;
        }

        if (oOwner && !oOwner._fioriAdapter) {
            oUIService = oService;
            oOwner._fioriAdapter = new Fiori20Adapter(oOwner, oConfig);
            oOwner._fioriAdapter.init();
        }
    };

    return Fiori20Adapter;
});
