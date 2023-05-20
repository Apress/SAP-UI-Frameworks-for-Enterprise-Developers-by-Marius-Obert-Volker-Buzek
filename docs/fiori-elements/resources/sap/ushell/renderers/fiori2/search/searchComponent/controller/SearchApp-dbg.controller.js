// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/esh/search/ui/SearchShellHelper", "sap/esh/search/ui/SearchShellHelperAndModuleLoader", "../../util"
], function (
    Controller, SearchShellHelper, dummy, util
) {
    "use strict";

    var isOutdatedElisa = !SearchShellHelper.collapseSearch;

    return Controller.extend("sap/ushell/renderers/fiori2/search/searchComponent/SearchApp", {

        onInit: function () {
            // this.oShellNavigation = sap.ushell.Container.getService("ShellNavigation");
            sap.ushell.Container.getServiceAsync("ShellNavigation").then(function (service) {
                this.oShellNavigation = service;
                this.oShellNavigation.hashChanger.attachEvent("hashChanged", this.hashChanged);
            }.bind(this));

            if (SearchShellHelper.oSearchFieldGroup === undefined) {
                SearchShellHelper.init();
            }
            if (isOutdatedElisa) {
                SearchShellHelper.setSearchState("EXP_S");
            } else {
                SearchShellHelper.expandSearch();
            }

        },

        hashChanged: function () {
            var model = sap.esh.search.ui.getModelSingleton({}, "flp");
            model.parseURL();
        },

        onExit: function () {
            this.oShellNavigation.hashChanger.detachEvent("hashChanged", this.hashChanged);

            // destroy TablePersoDialog when exit search app to avoid to create same-id-TablePersoDialog triggered by oTablePersoController.active() in SearchCompositeControl.js
            var tablePersoController = this.oView.getContent()[0].oTablePersoController;
            if (tablePersoController && tablePersoController.getTablePersoDialog && tablePersoController.getTablePersoDialog()) {
                tablePersoController.getTablePersoDialog().destroy();
            }

            if (SearchShellHelper.resetModel) {
                SearchShellHelper.resetModel();
            }

            if (isOutdatedElisa) {
                if (SearchShellHelper.getDefaultOpen() !== true) {
                    if (SearchShellHelper.setSearchStateSync) {
                        SearchShellHelper.setSearchStateSync("COL");
                    } else {
                        SearchShellHelper.setSearchState("COL");
                    }
                } else {
                    SearchShellHelper.setSearchState("EXP");
                }
            } else {
                // eslint-disable-next-line no-lonely-if
                if (!util.isSearchFieldExpandedByDefault()) {
                    SearchShellHelper.collapseSearch();
                } else {
                    SearchShellHelper.expandSearch();
                }
            }

            if (this.oView.getContent()[0].oSearchPage.oFacetDialog) {
                this.oView.getContent()[0].oSearchPage.oFacetDialog.destroy();
            }
        }
    });

});

