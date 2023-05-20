// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "./common.read.ui5theme.from.config",
    "sap/base/util/ObjectPath",
    "sap/base/Log"
], function (getUi5Theme, ObjectPath, Log) {
    "use strict";

    function setThemesInUserInfoAdapter (oUshellConfig) {
        var oThemeRange = ObjectPath.get("services.Container.adapter.config.userProfile.metadata.ranges.theme", oUshellConfig);
        if (!oThemeRange) {
            return;
        }
        // creates path
        ObjectPath.create("services.UserInfo.adapter.config.themes", oUshellConfig);

        oUshellConfig.services.UserInfo.adapter.config.themes = Object.keys(oThemeRange).map(function (key) {
            return {
                "id": key,
                "name": oThemeRange[key].displayName,
                "root": oThemeRange[key].themeRoot
            };
        });
    }

    /**
     * Configures UI5 theme based on the shell configuration.
     *
     * @param {object} oUshellConfig The ushell configuration.
     *
     * @private
     */
    function configureUi5Theme (oUshellConfig) {

        var oContainerAdapterConfig = ObjectPath.get("services.Container.adapter.config", oUshellConfig),
            oValidTheme = getUi5Theme(oUshellConfig);

        setThemesInUserInfoAdapter(oUshellConfig);


        // does personalized or standard theme exists
        if (oValidTheme.theme) {
            oContainerAdapterConfig.userProfile.defaults.bootTheme = oValidTheme;
        } else {
            var sDefaultTheme = ObjectPath.get("userProfile.defaults.theme", oContainerAdapterConfig),
                sPersonalizedTheme = ObjectPath.get("userProfilePersonalization.theme", oContainerAdapterConfig);
            Log.error("No valid boot theme could be determined: personalizedTheme = '" + sPersonalizedTheme +
                "' default theme = '" + sDefaultTheme + "'", null,
                "common.configure.ui5theme"
            );
        }
    }

    return configureUi5Theme;
});
