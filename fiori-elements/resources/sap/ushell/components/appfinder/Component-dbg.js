// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/components/CatalogsManager",
    "sap/ushell/resources",
    "sap/ushell/Config",
    "sap/ushell/bootstrap/common/common.load.model",
    "sap/ushell/components/SharedComponentUtils",
    "sap/base/util/UriParameters"
], function (
    UIComponent,
    hasher,
    CatalogsManager,
    resources,
    Config,
    oModelWrapper,
    oSharedComponentUtils,
    UriParameters
) {
    "use strict";

    return UIComponent.extend("sap.ushell.components.appfinder.Component", {

        metadata: {
            interfaces: ["sap.ui.core.IAsyncContentCreation"],
            manifest: "json",
            library: "sap.ushell"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            // model instantiated by the model wrapper
            this.oModel = oModelWrapper.getModel();
            this.setModel(this.oModel);

            // Model defaults are set now --- let`s continue.

            var sHash,
                mParameters,
                oComponentConfig;
            var bPersonalizationActive = Config.last("/core/shell/enablePersonalization");

            if (bPersonalizationActive) {
                // trigger the reading of the homepage group display personalization
                // this is also needed when the app finder starts directly as the tab mode disables
                // the blind loading which is already prepared in the homepage manager
                oSharedComponentUtils.getEffectiveHomepageSetting("/core/home/homePageGroupDisplay", "/core/home/enableHomePageSettings");
            }

            this.oCatalogsManager = new CatalogsManager("dashboardMgr", {
                model: this.oModel
            });

            this.setModel(resources.i18nModel, "i18n");

            oSharedComponentUtils.toggleUserActivityLog();
            //handle direct navigation with the old catalog intent format
            sHash = hasher.getHash();

            Promise.all([
                sap.ushell.Container.getServiceAsync("ShellNavigation"),
                sap.ushell.Container.getServiceAsync("URLParsing")
            ]).then(function (aServices) {
                var oShellNavigation = aServices[0];
                var oUrlParsing = aServices[1];
                var oShellHash = oUrlParsing.parseShellHash(sHash);
                if (oShellHash && oShellHash.semanticObject === "shell" && oShellHash.action === "catalog") {
                    mParameters = this.parseOldCatalogParams(sHash);
                    oComponentConfig = this.getMetadata().getConfig();

                    oShellNavigation.toExternal({
                        target: {
                            semanticObject: oComponentConfig.semanticObject,
                            action: oComponentConfig.action
                        }
                    });

                    this.getRouter().navTo("catalog", {
                        filters: JSON.stringify(mParameters)
                    });
                }
            }.bind(this));
        },

        parseOldCatalogParams: function (sUrl) {
            var mParameters = UriParameters.fromURL(sUrl).mParams;
            var sValue,
                sKey;

            for (sKey in mParameters) {
                if (mParameters.hasOwnProperty(sKey)) {
                    sValue = mParameters[sKey][0];
                    mParameters[sKey] = sValue.indexOf("/") !== -1 ? encodeURIComponent(sValue) : sValue;
                }
            }
            return mParameters;
        },

        destroy: function () {
            UIComponent.prototype.destroy.apply(this);

            this.oCatalogsManager.destroy();
        }
    });

});
