// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/components/shell/Search/ESearch",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Component",
    "sap/ushell/utils",
    "sap/base/util/ObjectPath"
], function (ESearch, UIComponent, Component, Utils, ObjectPath) {
    "use strict";

    return UIComponent.extend("sap.ushell.components.shell.Search.Component", {
        metadata: {
            manifest: "json",
            library: "sap.ushell"
        },

        createContent: function () {
            var that = this;
            var bIsSearchCEPEnabled = ObjectPath.get("sap-ushell-config.services.SearchCEP") !== undefined;
            // check that search is enabled
            var oShellCtrl = sap.ushell.Container.getRenderer("fiori2").getShellController(),
                oShellView = oShellCtrl.getView(),
                oShellConfig = (oShellView.getViewData() ? oShellView.getViewData().config : {}) || {};
            var bSearchEnable = (oShellConfig.enableSearch !== false);
            if (!bSearchEnable) {
                sap.ui.getCore().getEventBus().publish("shell", "searchCompLoaded", { delay: 0 });
                return;
            }

            sap.ushell.Container.getFLPPlatform().then(function (sPlatform) {
                if (sPlatform === "MYHOME" || (sPlatform === "cFLP" && bIsSearchCEPEnabled === true)) {
                    Component.create({
                        manifest: false,
                        name: "sap.ushell.components.shell.SearchCEP"
                    });
                } else {
                    ESearch.createContent(that);
                    sap.ui.getCore().getEventBus().publish("shell", "searchCompLoaded", { delay: 0 });
                }
                Utils.setPerformanceMark("FLP -- search component is loaded");
            });
        },

        exit: function () {
            ESearch.exit();
        }
    });
});
