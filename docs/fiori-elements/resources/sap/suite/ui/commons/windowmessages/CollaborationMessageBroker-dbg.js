sap.ui.define([
    "sap/base/Log"
], function(Log) {
    "use strict";

    var oCollaborationMessageBroker;
    var oLogger = Log.getLogger("sap.suite.ui.commons.windowmessages.CollaborationMessageBroker");

    function CollaborationMessageBroker(oProviderConfiguration) {
        oLogger.info("CollaborationMessageBroker instance is created");
        var CLIENT_ID = "sap-suite-ui-commons-collaboration-message-broker";
        var CHANNEL_ID = "collaboration-channel";
        var MSG_NAME = "get-provider-config";
        var aSubscribedChannels = [
            {
                channelId: CHANNEL_ID,
                version: "1.0"
            }
        ];

        // Callback method which is triggered when a someone fires a Message is posted for the MSG_CHANNEL_ID_PROVIDER
        // and MSG_CLIENT_ID. Method will publish a message to the requesting client ID on the MSG_CHANNEL_ID_CONSUMER.
        var fnMessageCallback = function(sClientId, sChannelId, sMessageName) {
            oLogger.info("Message Received from CLIENT_ID: " + sClientId + " on CHANNEL_ID: " + sChannelId);

            //verify that the message sent is the one we support
            if (sMessageName === MSG_NAME) {
                sap.ushell.Container.getServiceAsync("MessageBroker").then(function (oMessageBrokerService) {
                    var sResponseData = JSON.stringify(oProviderConfiguration);
                    oMessageBrokerService.publish(CHANNEL_ID, CLIENT_ID,
                        Date.now().toString(), MSG_NAME, [sClientId], sResponseData).then(function() {
                            oLogger.info("Configuration published successfully to CLIENT_ID: " + sClientId + " on CHANNEL_ID: "
                                + CHANNEL_ID + " DATA: " + sResponseData);
                        });
                });
            } else {
                oLogger.info("Message: '" + sMessageName + "' is not supported");
            }
        };

        if (sap.ushell && sap.ushell.Container) {
            sap.ushell.Container.getServiceAsync("MessageBroker").then(function (oMessageBrokerService) {
                oMessageBrokerService.connect(CLIENT_ID).then(function() {
                    oLogger.info("Client ID: " + CLIENT_ID + " is connected successfully");
                    oMessageBrokerService.subscribe(CLIENT_ID, aSubscribedChannels, fnMessageCallback, Function.prototype);
                });
            });
        }
    }

    return {
        /**
         * Method start the CollaborationMessageBroker in case it is not started else does nothing
         * @param {Object} oProviderConfiguration Should contain the configuration object which needs to be provided
         * @returns {void}
         */
        startInstance: function(oProviderConfiguration) {
            oLogger.info("CollaborationMessageBroker=>startInstance method is being called");
            if (!oCollaborationMessageBroker) {
                oCollaborationMessageBroker = new CollaborationMessageBroker(oProviderConfiguration);
            }
        }
    };
});