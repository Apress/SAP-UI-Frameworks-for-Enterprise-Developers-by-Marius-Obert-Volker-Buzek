// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([], function () {
    "use strict";
    var sUserSettingsErrorDialogTarget = "sapUshellSettingsDialog/";
    var oMessageManager = sap.ui.getCore().getMessageManager();

    return {
        addMessage: addMessage,
        filterMessagesToDisplay: filterMessagesToDisplay,
        removeErrorMessages: removeErrorMessages
    };

    /**
     * Add a message to the MessageManager with the correct target
     *
     * @param {sap.ui.core.message.Message} message The message to be added
     * @private
     */
    function addMessage (message) {
        message.setTargets([sUserSettingsErrorDialogTarget]);
        oMessageManager.addMessages(message);
    }

    /**
     * Filter messages of the MessageManager based on the target
     *
     * @returns {array} An array of messages to be displayed
     * @private
     */
    function filterMessagesToDisplay () {
        return oMessageManager.getMessageModel().getData().filter(function (oMessage) {
            return oMessage.getTarget() && oMessage.getTarget().indexOf(sUserSettingsErrorDialogTarget) === 0;
        });
    }

    /**
     * Remove messages from the MessageManager based on the target
     *
     * @private
     */
    function removeErrorMessages () {
        oMessageManager.getMessageModel().getData().forEach(function (oMessage) {
            if (oMessage.getTarget() && oMessage.getTarget().indexOf(sUserSettingsErrorDialogTarget) === 0) {
                oMessageManager.removeMessages(oMessage);
            }
        });
    }
});
