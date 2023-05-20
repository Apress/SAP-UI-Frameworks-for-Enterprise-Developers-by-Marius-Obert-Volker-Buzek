// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/core/mvc/View",
    "sap/esh/search/ui/i18n"

], function (UIComponent, View, i18n) {
    "use strict";

    return {
        isSearchFieldExpandedByDefault: function () {
            var shellHeader = sap.ui.getCore().byId("shell-header") || { isExtraLargeState: function () { return false; } };
            var shellCtrl = sap.ushell.Container.getRenderer("fiori2").getShellController();
            var shellView = shellCtrl.getView();
            var shellConfig = (shellView.getViewData() ? shellView.getViewData().config : {}) || {};
            return shellConfig.openSearchAsDefault || shellHeader.isExtraLargeState();
        }
    };

});
