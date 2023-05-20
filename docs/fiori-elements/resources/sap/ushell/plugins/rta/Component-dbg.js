// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/plugins/BaseRTAPlugin",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/CheckConditions",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/Renderer"
], function (
    BaseRTAPlugin,
    CheckConditions,
    Renderer
) {
    "use strict";

    function checkKeyUser () {
        return new Promise(function (resolve) {
            sap.ui.require([
                "sap/ui/fl/write/api/FeaturesAPI"
            ], function (
                FeaturesAPI
            ) {
                resolve(FeaturesAPI.isKeyUser());
            });
        });
    }

    var RTAPlugin = BaseRTAPlugin.extend("sap.ushell.plugins.rta.Component", {
        sType: "rta",
        metadata: {
            manifest: "json",
            library: "sap.ushell"
        },

        init: function () {
            var oConfig = {
                sComponentName: "sap.ushell.plugins.rta",
                layer: "CUSTOMER",
                developerMode: false,
                id: "RTA_Plugin_ActionButton",
                text: "RTA_BUTTON_TEXT",
                icon: "sap-icon://wrench",
                visible: true,
                checkRestartRTA: true
            };
            BaseRTAPlugin.prototype.init.call(this, oConfig);
            this._oPluginPromise = this._oPluginPromise.then(function () {
                return Promise.all([
                    CheckConditions.checkUI5App(),
                    checkKeyUser(),
                    CheckConditions.checkDesktopDevice()
                ]);
            })
            .then(function (aResults) {
                var bButtonIsVisible = this.mConfig.visible && aResults[0] && aResults[1] && aResults[2];
                return Renderer.createActionButton(this, this._onAdapt.bind(this), bButtonIsVisible);
            }.bind(this));
        }
    });

    return RTAPlugin;
}, true /* bExport */);
