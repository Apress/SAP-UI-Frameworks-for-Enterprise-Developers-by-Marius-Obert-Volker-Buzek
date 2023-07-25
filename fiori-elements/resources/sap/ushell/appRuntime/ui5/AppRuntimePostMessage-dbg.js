// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/deepExtend",
    "sap/ushell/components/applicationIntegration/application/PostMessageAPIInterface"
], function (deepExtend, PostMessageAPIInterface) {
    "use strict";

    var oAPIs = {};

    function AppRuntimePostMessage () {
        this.getHandlers = function () {
            return oAPIs;
        };

        this.registerCommHandlers = function (oCommunication) {
            var aInboundsActions = [];

            Object.keys(oCommunication).forEach(function (sKey) {
                var oCommunicationEntry = oCommunication[sKey];

                if (oCommunicationEntry.oServiceCalls) {
                    Object.keys(oCommunicationEntry.oServiceCalls).forEach(function (key) {
                        aInboundsActions.push({
                            action: key,
                            service: sKey
                        });
                    });
                }
            });

            deepExtend(oAPIs, oCommunication);

            return aInboundsActions;
        };

        this.registerCommunicationHandler = function (sKey, oCommunicationEntry) {
            var oCommObject = oAPIs[sKey],
                aInboundsActions = [];

            if (!oCommObject) {
                oCommObject = oAPIs[sKey] = { oServiceCalls: {} };
            }

            if (oCommunicationEntry.oServiceCalls) {
                Object.keys(oCommunicationEntry.oServiceCalls).forEach(function (key) {
                    oCommObject.oServiceCalls[key] = oCommunicationEntry.oServiceCalls[key];
                    aInboundsActions.push({
                        action: key,
                        service: sKey
                    });
                });
            }

            return aInboundsActions;
        };

        this.registerCommunicationHandlers = function (oCommunicationHandler) {
            var that = this;

            Object.keys(oCommunicationHandler).forEach(function (sKey) {
                that.registerCommunicationHandler(sKey, oCommunicationHandler[sKey]);
            });
        };

        this._getPostMesageInterface = function (sServiceName, sInterface) {
            var oCommHandlerService = oAPIs[sServiceName],
                oInterface;

            if (oCommHandlerService && oCommHandlerService.oRequestCalls && oCommHandlerService.oRequestCalls[sInterface]) {
                oInterface = oCommHandlerService.oRequestCalls[sInterface];
            }

            return oInterface;
        };
    }

    var oAppRuntimePostMessage = new AppRuntimePostMessage();
    PostMessageAPIInterface.init(false, oAppRuntimePostMessage.registerCommunicationHandlers.bind(oAppRuntimePostMessage));

    return oAppRuntimePostMessage;
});
