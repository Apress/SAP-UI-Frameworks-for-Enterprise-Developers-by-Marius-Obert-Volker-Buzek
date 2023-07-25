// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/ObjectPath"
], function (ObjectPath) {
    "use strict";

    return getValidTheme;

    function extractThemeDataFromConfig (oUshellConfig) {
        var oContainerAdapterConfig = ObjectPath.get("services.Container.adapter.config", oUshellConfig);
        return {
            sDefaultTheme: ObjectPath.get("userProfile.defaults.theme", oContainerAdapterConfig),
            sPersonalizedTheme: ObjectPath.get("userProfilePersonalization.theme", oContainerAdapterConfig),
            oRangeTheme: ObjectPath.get("userProfile.metadata.ranges.theme", oContainerAdapterConfig)
        };
    }

    function getValidTheme (oUshellConfig) {
        var oThemeData = extractThemeDataFromConfig(oUshellConfig),
            sPersonalizedTheme = oThemeData.sPersonalizedTheme,
            oRangeTheme = oThemeData.oRangeTheme,
            sDefaultTheme = oThemeData.sDefaultTheme;

        if (oThemeData.oRangeTheme) {
            // Range of themes contains boot theme
            if (Object.keys(oRangeTheme).indexOf(sPersonalizedTheme) > -1) {
                var oPersonalizedTheme = oRangeTheme[sPersonalizedTheme] || {};
                return { theme: sPersonalizedTheme, root: oPersonalizedTheme.themeRoot };
            }
            // return DefaultTheme
            var oDefaultTheme = oRangeTheme[sDefaultTheme] || {};
            return {
                theme: sDefaultTheme,
                root: oDefaultTheme.themeRoot
            };
        }
        // stay compatible
        var sAppliedTheme = sPersonalizedTheme || sDefaultTheme;
        return {
            theme: sAppliedTheme, root: ""
        };
    }
});
