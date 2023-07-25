// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/appRuntime/ui5/AppRuntimeService"
], function (AppRuntimeService) {
    "use strict";

    var oClients = {};

    var MessageBrokerProxy = function () {};

    MessageBrokerProxy.prototype.connect = function (sClientId) {
        return new Promise(function (fnResolve, fnReject) {
            AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.MessageBroker", {
                channelId: "sap.ushell.MessageBroker",
                clientId: sClientId,
                messageName: "connect"
            }).then(function (oResponse) {
                if (oResponse.status === "accepted") {
                    fnResolve(oResponse.activeClients);
                } else {
                    fnReject();
                }
            });
        });
    };

    MessageBrokerProxy.prototype.disconnect = function (sClientId) {
        delete oClients[sClientId];
        AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.MessageBroker", {
            channelId: "sap.ushell.MessageBroker",
            clientId: sClientId,
            messageName: "disconnect"
        });
    };

    MessageBrokerProxy.prototype.subscribe = function (
        sClientId,
        aSubscribedChannels,
        fnMessageCallback,
        fnClientConnectionCallback
    ) {
        return new Promise(function (fnResolve, fnReject) {
            oClients[sClientId] = {
                fnMessageCallback: fnMessageCallback,
                fnClientConnectionCallback: fnClientConnectionCallback
            };

            AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.MessageBroker", {
                channelId: "sap.ushell.MessageBroker",
                clientId: sClientId,
                messageName: "subscribe",
                subscribedChannels: aSubscribedChannels
            }).then(function (oResponse) {
                if (oResponse.status === "accepted") {
                    fnResolve();
                    if (oResponse.activeClients) {
                        setTimeout(function () {
                            oResponse.activeClients.foreach(function (oClient) {
                                fnClientConnectionCallback("clientSubscribed", oClient.clientId, oClient.channels);
                            });
                        }, 1);
                    }
                } else {
                    fnReject();
                }
            });
        });
    };

    MessageBrokerProxy.prototype.unsubscribe = function (sClientId, aUnsubscribedChannels) {
        return new Promise(function (fnResolve, fnReject) {
            AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.MessageBroker", {
                channelId: "sap.ushell.MessageBroker",
                clientId: sClientId,
                messageName: "unsubscribe",
                subscribedChannels: aUnsubscribedChannels
            }).then(function (oResponse) {
                if (oResponse.status === "accepted") {
                    fnResolve();
                } else {
                    fnReject();
                }
            });
        });
    };

    MessageBrokerProxy.prototype.publish = function (
        sChannelId,
        sClientId,
        sMessageId,
        sMessageName,
        aTargetClientIds,
        data
    ) {
        AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.MessageBroker", {
            clientId: sClientId,
            channelId: sChannelId,
            targetClientIds: aTargetClientIds,
            messageName: sMessageName,
            data: data
        }, sMessageId);
    };

    MessageBrokerProxy.prototype.addAcceptedOrigin = function (sOrigin) {
        //should be empty in AppRuntime
    };

    MessageBrokerProxy.prototype.removeAcceptedOrigin = function (sOrigin) {
        //should be empty in AppRuntime
    };

    MessageBrokerProxy.prototype.getAcceptedOrigins = function () {
        //should be empty in AppRuntime
    };

    MessageBrokerProxy.prototype.getAcceptedOrigins = function () {
        //should be empty in AppRuntime
    };

    MessageBrokerProxy.prototype.handleMessage = function (oBody) {
        return new Promise(function (fnResolve, fnReject) {
            if (oBody.channelId === "sap.ushell.MessageBroker") {
                if (oBody.messageName === "clientSubscribed" || oBody.messageName === "clientUnsubscribed") {
                    Object.keys(oClients).forEach(function (sClientId) {
                        oClients[sClientId].fnClientConnectionCallback(oBody.messageName, oBody.clientId, oBody.channels);
                    });
                }
            }
            fnResolve({
                "_noresponse_": true
            });
            return;
        });
    };

    MessageBrokerProxy.hasNoAdapter = true;
    return MessageBrokerProxy;
}, false);
