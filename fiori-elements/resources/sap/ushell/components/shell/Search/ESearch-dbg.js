// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/resources",
    "sap/ui/core/IconPool",
    "sap/ui/core/routing/HashChanger",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/renderers/fiori2/search/util"
], function (resources, IconPool, HashChanger, jQuery, util) {
    "use strict";

    var bDoExit = false;

    var loadSearchShellHelper = function (oComponent) {
        if (!oComponent._searchShellHelperPromise) {
            oComponent._searchShellHelperPromise = new Promise(function (resolve) {
                sap.ui.getCore().loadLibrary("sap.esh.search.ui", { async: true }).then(function () {
                    sap.ui.require([
                        "sap/esh/search/ui/SearchShellHelperAndModuleLoader",
                        "sap/esh/search/ui/SearchShellHelper"
                    ], function (SearchShellHelperAndModuleLoader, searchShellHelper) {
                        searchShellHelper.init();
                        resolve(searchShellHelper);
                    });
                });
            });
        }
        return oComponent._searchShellHelperPromise;
    };

    function createContent (oComponent) {
        bDoExit = true;

        // create search Icon
        var oSearchConfig = {
            id: "sf",
            tooltip: "{i18n>openSearchBtn}",
            text: "{i18n>searchBtn}",
            ariaLabel: "{i18n>openSearchBtn}",
            icon: IconPool.getIconURI("search"),
            visible: true,
            showSeparator: false,
            press: function (event) {
                loadSearchShellHelper(oComponent).then(function (searchShellHelper) {
                    searchShellHelper.onShellSearchButtonPressed(event);
                });
            }
        };
        var oShellSearchBtn = sap.ushell.Container.getRenderer("fiori2")
            .addHeaderEndItem("sap.ushell.ui.shell.ShellHeadItem", oSearchConfig, true, false);
        if (util.isSearchFieldExpandedByDefault()) {
            oShellSearchBtn.setVisible(false);
        }
        oShellSearchBtn.setModel(resources.i18nModel, "i18n");

        // auto expand search field
        if (util.isSearchFieldExpandedByDefault()) {
            loadSearchShellHelper(oComponent).then(function (searchShellHelper) {
                if (searchShellHelper.expandSearch) {
                    // auto expand
                    searchShellHelper.expandSearch();
                } else {
                    // outdated elisa version -> just make button visible for manual expansion
                    oShellSearchBtn.setVisible(true);
                }
            });
        }

        // register hash change handler for tracking navigation
        oComponent.oHashChanger = HashChanger.getInstance();
        oComponent.oHashChanger.attachEvent("shellHashChanged", function (sShellHash) {
            var hashChangeInfo = sShellHash.mParameters;
            setTimeout(function () {
                sap.ui.getCore().loadLibrary("sap.esh.search.ui", { async: true }).then(function () {
                    sap.ui.require([
                        "sap/esh/search/ui/HashChangeHandler"
                    ], function (HashChangeHandler) {
                        HashChangeHandler.handle(hashChangeInfo);
                    });
                });
            }, 6000);
        });

        // accessibility
        oShellSearchBtn.addEventDelegate({
            onAfterRendering: function () {
                jQuery("#sf").attr("aria-pressed", false);
            }
        });
    }

    function exit () {
        if (bDoExit) {
            sap.ushell.Container.getRenderer("fiori2").hideHeaderEndItem("sf");
            var oSearchButton = sap.ui.getCore().byId("sf");
            if (oSearchButton) {
                oSearchButton.destroy();
            }
        }
    }

    return {
        createContent: createContent,
        exit: exit
    };
});
