// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Fragment",
    "sap/ushell/Config",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/ui/footerbar/ContactSupportButton"
], function (
    Fragment,
    Config,
    JSONModel,
    ContactSupportButton
) {
    "use strict";

    var oController = {
        /**
         * Handle ContactSupportButton-Press
         *
         * @private
         */
        handleContactSupportButtonPress: function () {
            var oContactSupport = new ContactSupportButton();
            oContactSupport.showContactSupportDialog();
            oContactSupport.destroy();
        }
    };

    /**
     * Load the fragment and create the MessagePopover
     *
     * @returns {Promise} Promise to load the fragment and set the model
     * @protected
     */
    function create () {
        var oButtonStatesModel = new JSONModel({
            contactSupportBtnEnable: sap.ushell.Container && Config.last("/core/extension/SupportTicket")
        });
        return Fragment.load({
            name: "sap.ushell.components.shell.Settings.UserSettingsErrorMessagePopover",
            controller: oController
        }).then(function (oMessagePopover) {
            oMessagePopover.setModel(oButtonStatesModel, "buttonStates");
            return oMessagePopover;
        });
    }

    return { create: create };
});
