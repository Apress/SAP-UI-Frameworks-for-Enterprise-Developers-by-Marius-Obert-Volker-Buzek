// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/ui/core/UIComponent",
    "sap/ushell/bootstrap/common/common.load.model",
    "sap/ushell/components/HomepageManager",
    "sap/ushell/components/SharedComponentUtils",
    "sap/ushell/Config",
    "sap/ushell/resources"
], function (
    View,
    UIComponent,
    oModelWrapper,
    HomepageManager,
    oSharedComponentUtils,
    Config,
    resources
) {
    "use strict";

    return UIComponent.extend("sap.ushell.components.homepage.Component", {
        metadata: {
            manifest: "json",
            library: "sap.ushell",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        init: function () {
            // model instantiated by the model wrapper
            this.oModel = oModelWrapper.getModel();
            this.setModel(this.oModel);

            // This needs to be called _after_ the model is created
            UIComponent.prototype.init.apply(this, arguments);

            return this.rootControlLoaded().then(function (oView) {
                this.oDashboardView = oView;

                // TODO: Please remove all 'NewHomepageManager' references after complete alignment!
                var oDashboardMgrData = {
                    model: this.oModel,
                    view: this.oDashboardView
                };
                this.oHomepageManager = new HomepageManager("dashboardMgr", oDashboardMgrData);

                this.setModel(resources.i18nModel, "i18n");

                sap.ui.getCore().getEventBus().subscribe("sap.ushell.services.UsageAnalytics", "usageAnalyticsStarted", function () {
                    sap.ui.require(["sap/ushell/components/homepage/FLPAnalytics"]);
                });

                oSharedComponentUtils.toggleUserActivityLog();

                // don't use the returned promise but register to the config change
                // for future config changes
                oSharedComponentUtils.getEffectiveHomepageSetting("/core/home/homePageGroupDisplay", "/core/home/enableHomePageSettings");
                Config.on("/core/home/homePageGroupDisplay").do(function (sNewDisplayMode) {
                    this.oHomepageManager.handleDisplayModeChange(sNewDisplayMode);
                }.bind(this));

                oSharedComponentUtils.getEffectiveHomepageSetting("/core/home/sizeBehavior", "/core/home/sizeBehaviorConfigurable");
                Config.on("/core/home/sizeBehavior").do(function (sSizeBehavior) {
                    var oModel = this.oHomepageManager.getModel();

                    oModel.setProperty("/sizeBehavior", sSizeBehavior);
                }.bind(this));
            }.bind(this));
        },

        createContent: function () {
            return View.create({
                viewName: "module:sap/ushell/components/homepage/DashboardContent.view"
            });
        },

        exit: function () {
            this.oHomepageManager.destroy();
        }
    });
});
