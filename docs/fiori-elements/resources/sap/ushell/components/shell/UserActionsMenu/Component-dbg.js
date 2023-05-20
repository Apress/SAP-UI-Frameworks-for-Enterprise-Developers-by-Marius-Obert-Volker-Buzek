// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ushell/components/applicationIntegration/AppLifeCycle",
    "sap/ushell/Config",
    "sap/ushell/components/shell/UserActionsMenu/UserActionsMenu.controller"
], function (
    UIComponent,
    AppLifeCycle,
    Config,
    UserActionsMenuController
) {
    "use strict";

    var _oRenderer;
    // Shortcut to sap.ushell.Container.getRenderer("fiori2")
    function _renderer () {
        if (!_oRenderer) {
            _oRenderer = sap.ushell.Container.getRenderer("fiori2");
        }
        return _oRenderer;
    }

    // UserActionsMenu Component
    return UIComponent.extend("sap.ushell.components.shell.UserActionsMenu.Component", {

        metadata: {
            version: "1.113.0",
            library: "sap.ushell",
            dependencies: {
                libs: ["sap.m"]
            }
        },

        createContent: function () {
            this._bIsUserActionsMenuCreated = false;

            this.oUserActionsMenuController = new UserActionsMenuController();
            this.oUserActionsMenuController.onInit();

            var that = this;

            // In state blank when no Action Items do not display UserActionsMenu.
            AppLifeCycle.getElementsModel().createTriggers([{
                fnRegister: function () {
                    if (!that.oActionsDoable) {
                        that.oActionsDoable = Config.on("/core/shell/model/currentState/actions").do(function (aActions) {
                            if (aActions && aActions.length > 0) {
                                _renderer().showHeaderEndItem(["userActionsMenuHeaderButton"], true);
                            } else {
                                _renderer().hideHeaderEndItem(["userActionsMenuHeaderButton"], true);
                            }
                        });
                    }
                },
                fnUnRegister: function () {
                    if (!that.oActionsDoable) {
                        that.oActionsDoable.off();
                        that.oActionsDoable = null;
                    }
                }
            }], false, ["blank-home", "blank"]);

            sap.ui.getCore().getEventBus().publish("shell", "userActionsMenuCompLoaded", { delay: 0 });
        },

        exit: function () {
            if (this.oActionsDoable) {
                this.oActionsDoable.off();
            }
            this.oEventListener.off();
            this.oUserActionsMenuController.onExit();
        }
    });

});
