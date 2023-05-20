// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/services/LaunchPage",
    "sap/ushell/appRuntime/ui5/AppRuntimeService"
], function (LaunchPage, AppRuntimeService) {
    "use strict";

    function LaunchPageProxy (oContainerInterface, sParameters, oServiceConfiguration) {
        LaunchPage.call(this, oContainerInterface, sParameters, oServiceConfiguration);

        this.getGroupsForBookmarks = function () {
            return AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.LaunchPage.getGroupsForBookmarks");
        };
    }

    LaunchPageProxy.prototype = LaunchPage.prototype;
    LaunchPageProxy.hasNoAdapter = LaunchPage.hasNoAdapter;

    return LaunchPageProxy;
});
