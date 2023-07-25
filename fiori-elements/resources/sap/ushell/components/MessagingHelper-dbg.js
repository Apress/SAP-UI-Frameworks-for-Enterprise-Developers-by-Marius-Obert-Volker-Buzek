// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/resources"
], function (resources) {
    "use strict";

    return {
        getLocalizedText: getLocalizedText,
        showLocalizedError: showLocalizedError,
        showLocalizedErrorHelper: showLocalizedErrorHelper,
        showLocalizedMessage: showLocalizedMessage
    };

    /**
     * Return translated text.
     * @param {String} sMsgId
     *      Id of the text that is to be translated.
     * @param {Array} aParams
     *      Array of parameters to be included in the resulted string instead of place holders.
     *
     * @return {String} Translated text
     */
    function getLocalizedText (sMsgId, aParams) {
        return resources.i18n.getText(sMsgId, aParams);
    }

    /**
     * Shows a localized message in the Message-Toast.
     * @param {string} sMsgId
     *      The localization id of the message
     * @param {object} oParams
     *      Additional parameters for the Message Toast showing the message. Can be undefined.
     * @param {sap.ushell.services.Message.Type} [iType=sap.ushell.services.Message.Type.INFO]
     *      The message type (optional)
     */
    function showLocalizedMessage (sMsgId, oParams, iType) {
        sap.ushell.Container.getServiceAsync("Message").then(function (oMessageService) {
            oMessageService.show(iType || oMessageService.Type.INFO, getLocalizedText(sMsgId, oParams), oParams);
        });
    }

    /**
     * Shows a localized error message in the Message-Toast.
     * @param {string} sMsgId
     *      The localization id of the message
     * @param {object} oParams
     *      Additional parameters for the Message Toast showing the message. Can be undefined.
     *
     */
    function showLocalizedError (sMsgId, oParams) {
        sap.ushell.Container.getServiceAsync("Message").then(function (oMessageService) {
            oMessageService.show(oMessageService.Type.ERROR, getLocalizedText(sMsgId, oParams), oParams);
        });
    }

    /**
     * A wrapper for showLocalizedError to reduce boilerplate code in error handling.
     * @param {string} sMsgId
     *      The localization id of the message
     * @param {object} oParams
     *      Additional parameters for the Message Toast showing the message. Can be undefined.
     * @returns {Function}
     *      A function that will call _showLocalizedError with the given parameters.
     */
    function showLocalizedErrorHelper (sMsgId, oParams) {
        return function () {
            showLocalizedError(sMsgId, oParams);
        };
    }
});
