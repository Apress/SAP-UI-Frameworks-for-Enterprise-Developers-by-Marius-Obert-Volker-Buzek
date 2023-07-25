// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/Device",
    "sap/ui/core/Component",
    "sap/ui/core/Core",
    "sap/ui/core/CustomData",
    "sap/ui/core/IconPool",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/library",
    "sap/ushell/resources",
    "sap/ushell/ui/shell/ShellHeadItem",
    "sap/ui/core/Configuration"
], function (
    Device,
    Component,
    Core,
    CustomData,
    IconPool,
    Config,
    EventHub,
    ushellLibrary,
    resources,
    ShellHeadItem,
    Configuration
) {
    "use strict";

    // shortcut for sap.ushell.AppTitleState
    var AppTitleState = ushellLibrary.AppTitleState;

    // shortcut for sap.ushell.FloatingNumberType
    var FloatingNumberType = ushellLibrary.FloatingNumberType;

    var aCreatedControlIds = [];

    return Component.extend("sap.ushell.components.shell.PostLoadingHeaderEnhancement.Component", {
        metadata: {
            library: "sap.ushell"
        },
        init: function () {
            var oShellConfig = sap.ushell.Container.getRenderer("fiori2").getShellConfig();

            aCreatedControlIds.push(this._createBackButton());
            aCreatedControlIds.push(this._createOverflowButton());

            if (oShellConfig.moveAppFinderActionToShellHeader && Config.last("/core/catalog/enabled") && !oShellConfig.disableAppFinder) {
                aCreatedControlIds.push(this._createAppFinderButton());
            }

            if (oShellConfig.moveContactSupportActionToShellHeader) {
                this._createSupportButton().then(function (sBtnId) {
                    aCreatedControlIds.push(sBtnId);
                });
            }

            this._createShellNavigationMenu(oShellConfig);

            var oShellHeader = Core.byId("shell-header");
            oShellHeader.updateAggregation("headItems");
            oShellHeader.updateAggregation("headEndItems");
        },

        _createBackButton: function () {
            var sBackButtonIcon = Configuration.getRTL() ? "feeder-arrow" : "nav-back";
            var oBackButton = new ShellHeadItem({
                id: "backBtn",
                tooltip: resources.i18n.getText("backBtn_tooltip"),
                ariaLabel: resources.i18n.getText("backBtn_tooltip"),
                icon: IconPool.getIconURI(sBackButtonIcon),
                press: function () {
                    EventHub.emit("navigateBack", Date.now());
                }
            });
            return oBackButton.getId();
        },

        _createOverflowButton: function () {
            var oShellModel = sap.ushell.Container.getRenderer("fiori2").getShellController().getModel();
            var oEndItemsOverflowBtn = new ShellHeadItem({
                id: "endItemsOverflowBtn",
                tooltip: {
                    path: "/notificationsCount",
                    formatter: function (notificationsCount) {
                        return this.tooltipFormatter(notificationsCount);
                    }
                },
                ariaLabel: resources.i18n.getText("shellHeaderOverflowBtn_tooltip"),
                ariaHaspopup: "dialog",
                icon: "sap-icon://overflow",
                floatingNumber: "{/notificationsCount}",
                floatingNumberMaxValue: Device.system.phone ? 99 : 999, // according to the UX specification
                floatingNumberType: FloatingNumberType.OverflowButton,
                press: function (oEvent) {
                    EventHub.emit("showEndItemOverflow", oEvent.getSource().getId(), true);
                }
            });
            oEndItemsOverflowBtn.setModel(oShellModel);
            return oEndItemsOverflowBtn.getId();
        },

        _createAppFinderButton: function () {
            var oOpenCatalogButton = new ShellHeadItem({
                id: "openCatalogBtn",
                text: resources.i18n.getText("open_appFinderBtn"),
                tooltip: resources.i18n.getText("open_appFinderBtn"),
                icon: "sap-icon://sys-find",
                press: function () {
                    sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCAN) {
                        oCAN.toExternal({
                            target: {
                                semanticObject: "Shell",
                                action: "appfinder"
                            }
                        });
                    });
                }
            });
            if (Config.last("/core/extension/enableHelp")) {
                oOpenCatalogButton.addStyleClass("help-id-openCatalogActionItem"); // xRay help ID
            }
            return oOpenCatalogButton.getId();
        },

        _createSupportButton: function () {
            return new Promise(function (fnResolve) {
                sap.ui.require(["sap/ushell/ui/footerbar/ContactSupportButton"], function (ContactSupportButton) {
                    var sButtonName = "ContactSupportBtn";
                    var oSupportButton = Core.byId(sButtonName);
                    if (!oSupportButton) {
                        // Create an ActionItem from UserActionsMenu (ContactSupportButton)
                        // in order to to take its text and icon
                        // and fire the press method when the shell header item is pressed,
                        // but don't render this control
                        var oTempButton = new ContactSupportButton("tempContactSupportBtn", {
                            visible: true
                        });

                        var sIcon = oTempButton.getIcon();
                        var sText = oTempButton.getText();
                        oSupportButton = new ShellHeadItem({
                            id: sButtonName,
                            icon: sIcon,
                            tooltip: sText,
                            text: sText,
                            ariaHaspopup: "dialog",
                            press: function () {
                                oTempButton.firePress();
                            }
                        });
                    }
                    fnResolve(sButtonName);
                });
            });
        },

        _createShellNavigationMenu: function (oShellConfig) {
            return new Promise(function (resolve) {
                sap.ui.require([
                    "sap/m/StandardListItem",
                    "sap/ushell/ui/shell/NavigationMiniTile",
                    "sap/ushell/ui/shell/ShellNavigationMenu"
                ], function (StandardListItem, NavigationMiniTile, ShellNavigationMenu) {
                    var sMenuId = "shellNavigationMenu";

                    var oHierarchyTemplateFunction = function (sId, oContext) {
                        var sIcon = oContext.getProperty("icon") || "sap-icon://circle-task-2",
                            sTitle = oContext.getProperty("title"),
                            sSubtitle = oContext.getProperty("subtitle"),
                            sIntent = oContext.getProperty("intent");

                        var oListItem = (new StandardListItem({
                            type: "Active", // Use string literal to avoid dependency from sap.m.library
                            title: sTitle,
                            description: sSubtitle,
                            icon: sIcon,
                            wrapping: true,
                            customData: [new CustomData({
                                key: "intent",
                                value: sIntent
                            })],
                            press: function () {
                                if (sIntent && sIntent[0] === "#") {
                                    EventHub.emit("navigateFromShellApplicationNavigationMenu", sIntent, true);
                                }
                            }
                        })).addStyleClass("sapUshellNavigationMenuListItems");

                        return oListItem;
                    };

                    var oRelatedAppsTemplateFunction = function (sId, oContext) {
                        // default icon behavior
                        var sIcon = oContext.getProperty("icon"),
                            sTitle = oContext.getProperty("title"),
                            sSubtitle = oContext.getProperty("subtitle"),
                            sIntent = oContext.getProperty("intent");
                        return new NavigationMiniTile({
                            title: sTitle,
                            subtitle: sSubtitle,
                            icon: sIcon,
                            intent: sIntent,
                            press: function () {
                                var sTileIntent = this.getIntent();
                                if (sTileIntent && sTileIntent[0] === "#") {
                                    EventHub.emit("navigateFromShellApplicationNavigationMenu", sTileIntent, true);
                                }
                            }
                        });
                    };

                    var oShellNavigationMenu = new ShellNavigationMenu(sMenuId, {
                        title: "{/application/title}",
                        description: "{/title}",
                        icon: "{/application/icon}",
                        showRelatedApps: oShellConfig.appState !== "lean",
                        items: {
                            path: "/application/hierarchy",
                            factory: oHierarchyTemplateFunction.bind(this)
                        },
                        miniTiles: {
                            path: "/application/relatedApps",
                            factory: oRelatedAppsTemplateFunction.bind(this)
                        },
                        visible: {
                            path: "/ShellAppTitleState",
                            formatter: function (oCurrentState) {
                                return oCurrentState === AppTitleState.ShellNavMenu;
                            }
                        }
                    });

                    var oShellHeader = Core.byId("shell-header");
                    oShellNavigationMenu.setModel(oShellHeader.getModel());

                    var oShellAppTitle = Core.byId("shellAppTitle");
                    if (oShellAppTitle) {
                        oShellAppTitle.setNavigationMenu(oShellNavigationMenu);
                    }
                    aCreatedControlIds.push(sMenuId);

                    resolve(oShellNavigationMenu);
                }.bind(this));
            });
        },

        exit: function () {
            aCreatedControlIds.forEach(function (sControl) {
                var oControl = Core.byId(sControl);
                if (oControl) {
                    oControl.destroy();
                }
            });
            aCreatedControlIds = [];
        }
    });
});
