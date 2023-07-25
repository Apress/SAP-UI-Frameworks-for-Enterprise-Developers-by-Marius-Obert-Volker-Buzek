// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/XMLView",
    "sap/base/Log",
    "sap/ushell/Config",
    "sap/ushell/resources"
], function (
    XMLView,
    Log,
    Config,
    resources
) {
    "use strict";

    function getEntry () {
        var oShellConfig = sap.ushell.Container.getRenderer("fiori2").getShellConfig(),
            bUseSelector = oShellConfig.enableUserImgConsent;

        var sViewId = bUseSelector ? "userAccountSelector" : "userAccountSetting";
        var sComponentNamespace = bUseSelector
            ? "sap.ushell.components.shell.Settings.userAccount.UserAccountSelector"
            : "sap.ushell.components.shell.Settings.userAccount.UserAccountSetting";

        var sIcon = Config.last("/core/shell/model/userImage/account") || "sap-icon://account";
        var oViewInstance;

        var oEntry = {
            id: "userAccountEntry",
            entryHelpID: "userAccountEntry",
            title: resources.i18n.getText("UserAccountFld"),
            valueResult: null,
            contentResult: null,
            icon: sIcon,
            valueArgument: sap.ushell.Container.getUser().getFullName(),
            contentFunc: function () {
                return XMLView.create({
                    id: sViewId,
                    viewName: sComponentNamespace
                }).then(function (oView) {
                    oViewInstance = oView;
                    return oView;
                });
            },
            onSave: function (fnUpdateUserPreferences) {
                if (oViewInstance) {
                    return oViewInstance.getController().onSave(fnUpdateUserPreferences);
                }
                Log.warning("Save operation for user account settings was not executed, because the userAccount view was not initialized");
                return Promise.resolve();

            },
            onCancel: function () {
                if (oViewInstance) {
                    oViewInstance.getController().onCancel();
                    return;
                }
                Log.warning(
                    "Cancel operation for user account settings was not executed, because the userAccount view was not initialized"
                );
            },
            provideEmptyWrapper: true //to hide the header and add custom header instead
        };

        return oEntry;
    }



    return {
        getEntry: getEntry
    };

});
