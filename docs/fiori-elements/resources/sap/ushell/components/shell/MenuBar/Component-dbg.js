// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ushell/Config"
], function (UIComponent, Config) {
    "use strict";

    return UIComponent.extend("sap.ushell.components.shell.MenuBar.Component", {
        metadata: {
            manifest: "json",
            library: "sap.ushell"
        },
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            this.oInitPromise = new Promise(function (resolve, reject) {
                this.fnResolve = resolve;
            }.bind(this));

            Config.on("/core/spaces/myHome/userEnabled").do(function () {
                sap.ushell.Container.getServiceAsync("Menu")
                    .then(function (oMenuService) {
                        return Promise.all([
                            oMenuService.isMenuEnabled(),
                            oMenuService.getMenuModel()
                        ]);
                    })
                    .then(function (aResults) {
                        var oComponentContainer;
                        var bIsEnabled = aResults[0];
                        var oMenuModel = aResults[1];

                        this.setModel(oMenuModel, "menu");

                        if (bIsEnabled) {
                            oComponentContainer = sap.ui.getCore().byId("menuBarComponentContainer");
                        }
                        if (oComponentContainer) {
                            oComponentContainer.setComponent(this);
                        }

                        this.fnResolve();
                    }.bind(this));
            }.bind(this));

            if (sap.ushell.Container.getRenderer().getCurrentCoreView() !== "home") {
                this.setVisible(false);
            }
        },

        /**
         * Toggles menu visibility. In some scenarios, the menu is always visible and this function has no effect.
         * @param {boolean} bVisible Menu visibility.
         *
         * @private
         * @since 1.85.0
         */
        setVisible: function (bVisible) {
            bVisible = bVisible || Config.last("/core/menu/visibleInAllStates"); // visibleInAllStates:true has priority
            sap.ui.getCore().byId("menuBarComponentContainer").setVisible(!!bVisible);
        }
    });
});
