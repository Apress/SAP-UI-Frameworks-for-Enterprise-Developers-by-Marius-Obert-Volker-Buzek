// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/core/mvc/View",
    "sap/esh/search/ui/i18n",
    "sap/base/util/ObjectPath"
], function (UIComponent, View, i18n, ObjectPath) {
    "use strict";

    return UIComponent.extend("sap/ushell/renderers/fiori2/search/searchComponent", {
        metadata: {
            manifest: "json",
            library: "sap.ushell",
            interfaces: ["sap.ui.core.IAsyncContentCreation"],
            config: {
                title: i18n.getText("searchAppTitle"),
                compactContentDensity: true,
                cozyContentDensity: true
            }
        },
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
        },
        createContent: function () {
            var sViewName;
            var bIsSearchCEPEnabled = ObjectPath.get("sap-ushell-config.services.SearchCEP") !== undefined,
                sPlatform = sap.ushell.Container.getFLPPlatform(true),
                bIsCEPStandard = bIsSearchCEPEnabled === true && sPlatform === "cFLP";

            if (bIsCEPStandard === true) {
                sViewName = "module:sap/ushell/renderers/fiori2/search/searchComponent/view/CEPSearchApp.view";
            } else {
                sViewName = "module:sap/ushell/renderers/fiori2/search/searchComponent/view/SearchApp.view";
            }
            return View.create({
                id: "searchContainerApp",
                viewName: sViewName
            });
        }
    });
});
