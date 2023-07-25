// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/services/UserInfo",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/base/util/ObjectPath"
], function (UserInfo, AppRuntimeService, ObjectPath) {
    "use strict";

    function UserInfoProxy (oAdapter, oContainerInterface) {
        UserInfo.call(this, oAdapter, oContainerInterface);

        this.getThemeList = function () {
            return AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.UserInfo.getThemeList");
        };

        this.updateUserPreferences = function () {
            return AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.UserInfo.updateUserPreferences", {
                language: sap.ushell.Container.getUser().getLanguage()
            });
        };

        this.getLanguageList = function () {
            return AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.UserInfo.getLanguageList");
        };
    }

    ObjectPath.set("sap.ushell.services.UserInfo", UserInfoProxy);

    UserInfoProxy.prototype = UserInfo.prototype;
    UserInfoProxy.hasNoAdapter = UserInfo.hasNoAdapter;

    return UserInfoProxy;
});
