// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/appRuntime/ui5/AppRuntimePostMessage",
    "sap/ushell/appRuntime/ui5/AppRuntimeService"
], function (AppRuntimePostMessage, AppRuntimeService) {
    "use strict";

    function AppRuntimePostMessageAPI () {
        this.getHandlers = function () {
            return AppRuntimePostMessage.getHandlers();
        };

        this.registerCommHandlers = function (oCommunication) {
            var aInboundsActions = AppRuntimePostMessage.registerCommHandlers(oCommunication);

            // Communication Handlers updated, call ServiceSubscribe aInboundsActions
            AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.appLifeCycle.subscribe", aInboundsActions);
        };

        this.registerCommunicationHandler = function (sKey, oCommunicationEntry) {
            var aInboundsActions = AppRuntimePostMessage.registerCommunicationHandler(sKey, oCommunicationEntry);

            // Communication Handlers updated, call ServiceSubscribe aInboundsActions
            AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.appLifeCycle.subscribe", aInboundsActions);
        };

        this._getPostMesageInterface = function (sServiceName, sInterface) {
            return AppRuntimePostMessage._getPostMesageInterface(sServiceName, sInterface);
        };
    }

    return new AppRuntimePostMessageAPI();
});
