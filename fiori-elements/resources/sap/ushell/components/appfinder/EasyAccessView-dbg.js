// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/m/SplitApp",
    "sap/ushell/resources"
], function (
    View,
    SplitApp,
    resources
) {
    "use strict";

    return View.extend("sap.ushell.components.appfinder.EasyAccessView", {
        BUSY_INDICATOR_DELAY: 1000,

        createContent: function (oController) {
            this.oResourceBundle = resources.i18n;

            this.setModel(this.getViewData().easyAccessSystemsModel, "easyAccessSystemsModel");
            this.setModel(this.getViewData().subHeaderModel, "subHeaderModel");
            this.setModel(this.getViewData().parentComponent.getModel());

            /*
             * Initialize split app master view.
             */
            this.pHierarchyFolders = View.create({
                viewName: "module:sap/ushell/components/appfinder/HierarchyFoldersView",
                height: "100%",
                viewData: {
                    navigateHierarchy: this.oController.navigateHierarchy.bind(oController),
                    easyAccessSystemsModel: this.getModel("easyAccessSystemsModel"),
                    subHeaderModel: this.getModel("subHeaderModel")
                }
            }).then(function (HierarchyFolders) {
                this.hierarchyFolders = HierarchyFolders;

                this.hierarchyFolders.setBusyIndicatorDelay(this.BUSY_INDICATOR_DELAY);
                this.hierarchyFolders.addStyleClass("sapUshellHierarchyFolders");

                return HierarchyFolders;
            }.bind(this));

            var oViewData = this.getViewData();

            /*
             * Initialize split app details view.
             */
            this.pHierarchyApps = View.create({
                id: this.getId() + "hierarchyApps",
                viewName: "module:sap/ushell/components/appfinder/HierarchyAppsView",
                height: "100%",
                viewData: {
                    navigateHierarchy: this.oController.navigateHierarchy.bind(oController),
                    menuName: oViewData.menuName
                }
            }).then(function (HierarchyApps) {
                this.hierarchyApps = HierarchyApps;
                this.hierarchyApps.setBusyIndicatorDelay(this.BUSY_INDICATOR_DELAY);

                return HierarchyApps;
            }.bind(this));


            /*
             * Setup split app
             */
            this.splitApp = new SplitApp();

            Promise.all([
                this.pHierarchyFolders,
                this.pHierarchyApps
            ]).then(function (Views) {
                this.splitApp.addMasterPage(Views[0]);
                this.splitApp.addDetailPage(Views[1]);
                this.splitApp.setInitialMaster(Views[0]);
                this.splitApp.setInitialDetail(Views[1]);
            }.bind(this));

            return this.splitApp;
        },

        getControllerName: function () {
            return "sap.ushell.components.appfinder.EasyAccess";
        }
    });
});
