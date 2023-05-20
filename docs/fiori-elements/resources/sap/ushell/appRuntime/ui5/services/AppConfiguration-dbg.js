// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/m/library",
    "sap/ui/core/IconPool",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/ushell/EventHub",
    "sap/ushell/appRuntime/ui5/renderers/fiori2/RendererExtensions",
    "sap/ushell/resources",
    "sap/ushell/services/AppConfiguration"
], function (
    ObjectPath,
    mobileLibrary,
    IconPool,
    AppRuntimeService,
    EventHub,
    RendererExtensions,
    resources,
    AppConfiguration
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    function AppConfigurationProxy () {
        var aIdsOfAddedButtons = [];

        var vGetFullWidthParamFromManifest = false;
        ObjectPath.set("sap.ushell.services.AppConfiguration", this);
        AppConfiguration.constructor.call(this);

        EventHub.on("appWidthChange").do(function (bValue) {
            var oBody = document.body;
            oBody.classList.toggle("sapUiSizeCompact", bValue);
            oBody.classList.toggle("sapUShellApplicationContainerLimitedWidth", !bValue);
            oBody.classList.toggle("sapUShellApplicationContainer", !bValue);
        });

        this.setApplicationFullWidth = function (bValue) {
            if (vGetFullWidthParamFromManifest === true || vGetFullWidthParamFromManifest === "true") {
                EventHub.emit("appWidthChange", bValue);
            } else {
                AppRuntimeService.sendMessageToOuterShell(
                    "sap.ushell.services.AppConfiguration.setApplicationFullWidth", {
                    bValue: bValue
                });
            }
        };

        this.setFullWidthFromManifest = function (sVal) {
            vGetFullWidthParamFromManifest = sVal;
        };

        this.addApplicationSettingsButtons = function (aButtons) {
            for (var i = 0; i < aButtons.length; i++) {
                var oCurrentButton = aButtons[i];
                oCurrentButton.setIcon(oCurrentButton.getIcon() || IconPool.getIconURI("customize"));
                // in case the button has the text "Settings" we change it to "App Setting" in order prevent name collision
                if (resources.i18n.getText("userSettings") === oCurrentButton.getProperty("text")) {
                    oCurrentButton.setProperty("text", resources.i18n.getText("userAppSettings"));
                }
                oCurrentButton.setType(ButtonType.Unstyled);
            }

            RendererExtensions.removeOptionsActionSheetButton(aIdsOfAddedButtons, "app").done(function () {
                aIdsOfAddedButtons = aButtons;
                RendererExtensions.addOptionsActionSheetButton(aIdsOfAddedButtons, "app");
            });
        };
    }

    return new AppConfigurationProxy();
}, true);
