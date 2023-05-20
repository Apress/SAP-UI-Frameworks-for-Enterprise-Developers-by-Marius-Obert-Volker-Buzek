// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/services/Menu",
    "sap/ushell/appRuntime/ui5/AppRuntimeService"
], function (Menu, AppRuntimeService) {
    "use strict";

    function MenuProxy () {
        Menu.call(this, arguments);

        this.getSpacesPagesHierarchy = function () {
            return new Promise(function (fnResolve) {
                AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.Menu.getSpacesPagesHierarchy").done(fnResolve);
            });
        };
    }

    MenuProxy.prototype = Menu.prototype;
    MenuProxy.hasNoAdapter = Menu.hasNoAdapter;

    return MenuProxy;
});
