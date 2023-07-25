// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/StandardListItem",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/ushell/ui/footerbar/AboutButton",
    "sap/ushell/ui/footerbar/ContactSupportButton",
    "sap/ushell/ui/launchpad/ActionItem",
    "sap/ushell/ui/QuickAccess",
    "sap/ushell/EventHub",
    "sap/m/library",
    "sap/base/Log",
    "sap/ui/performance/Measurement",
    "sap/ui/core/ElementMetadata",
    "sap/ui/core/Fragment"
], function (
    Controller,
    JSONModel,
    StandardListItem,
    Config,
    resources,
    AboutButton,
    ContactSupportButton,
    ActionItem,
    QuickAccess,
    EventHub,
    library,
    Log,
    Measurement,
    ElementMetadata,
    Fragment
) {
    "use strict";

    var ListType = library.ListType;
    var ButtonType = library.ButtonType;

    function isActionExist (sActionId) {
        if (!sap.ui.getCore().byId(sActionId)) {
            Log.debug("Could not render ActionItem because it was not created: " + sActionId);
            return false;
        }
        return true;
    }

    return Controller.extend("sap.ushell.components.shell.UserActionsMenu.UserActionsMenu", {
        _aDanglingControl: [],
        _aDoables: [],

        onInit: function () {
            var oConfig = this.getShellConfig();
            this._createActionButtons(oConfig);

            var oUser = sap.ushell.Container.getUser();

            var aCreatedActions = Config.last("/core/shell/model/currentState/actions").filter(isActionExist);
            this.oModel = new JSONModel({
                actions: aCreatedActions,
                userName: oUser.getFullName() || oUser.getId()
            });
            this._aDoables.push(Config.on("/core/shell/model/currentState/actions").do(function (aActions) {
                var aFilteredActions = aActions.filter(isActionExist);
                this.getModel().setProperty("/actions", aFilteredActions);
            }.bind(this)));

            this._aDoables.push(EventHub.on("showUserActionsMenu").do(function (bShow) {
                var oPopover = sap.ui.getCore().byId("sapUshellUserActionsMenuPopover");
                if (oPopover && oPopover.isOpen() || !bShow) {
                    this._toggleUserActionsMenuPopover(false);
                } else {
                    this._toggleUserActionsMenuPopover(true);
                }
            }.bind(this)));
        },

        onExit: function () {
            this._destroyDanglingControls();
            this._aDoables.forEach(function (oDoable) {
                oDoable.off();
            });
            this._aDanglingControl = [];
            this._aDoables = [];

            var oPopover = sap.ui.getCore().byId("sapUshellUserActionsMenuPopover");
            if (oPopover) {
                oPopover.destroy();
            }
        },

        getModel: function () {
            return this.oModel;
        },

        _createActionButtons: function (oConfig) {
            var bEnableHelp = Config.last("/core/extension/enableHelp");

            var bEnableAbout = Config.last("/core/shell/enableAbout");
            if (bEnableAbout) {
                this._createAboutButton(bEnableHelp);
            }

            if (!oConfig.moveAppFinderActionToShellHeader && Config.last("/core/catalog/enabled")) {
                this._createAppFinderButton(oConfig, bEnableHelp);
            }

            //in case the user setting button should move to the shell header, it was already created by header
            //otherwise, create it as an actionItem for UserActionsMenu
            if (!oConfig.moveUserSettingsActionToShellHeader) {
                this._createSettingsButton(bEnableHelp);
            }

            // Only when the contact support button has to be shown in the UserActionsMenu
            if (!oConfig.moveContactSupportActionToShellHeader) {
                this._createSupportTicketButton(bEnableHelp);
            }

            if (oConfig.enableRecentActivity && Config.last("/core/shell/model/currentState/showRecentActivity")) {
                this._createRecentActivitiesButton();
                this._createFrequentActivitiesButton();
            }

            if (!oConfig.disableSignOut) {
                this._createLogoutButton();
            }
        },

        _createAppFinderButton: function (oConfig, bEnableHelp) {
            if (sap.ui.getCore().byId("openCatalogBtn")) {
                return;
            }

            var oOpenCatalogItem = new ActionItem("openCatalogBtn", {
                text: resources.i18n.getText("open_appFinderBtn"),
                icon: "sap-icon://sys-find",
                visible: !oConfig.disableAppFinder,
                actionType: "action",
                press: function () {
                    Measurement.start("FLP:AppFinderLoadingStartToEnd", "AppFinderLoadingStartToEnd", "FLP");
                    sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavigator) {
                        oCrossAppNavigator.toExternal({ target: { semanticObject: "Shell", action: "appfinder" } });
                    });
                }
            });
            if (bEnableHelp) {
                oOpenCatalogItem.addStyleClass("help-id-openCatalogActionItem"); // xRay help ID
            }
            this._addDanglingControl(oOpenCatalogItem);
        },

        _createAboutButton: function (bEnableHelp) {
            var sId = "aboutBtn";
            if (!sap.ui.getCore().byId(sId)) {
                var oAboutButton = new AboutButton(sId);
                if (bEnableHelp) {
                    oAboutButton.addStyleClass("help-id-" + sId); // xRay help ID
                }
                this._addDanglingControl(oAboutButton);
                this.getRenderer().showActionButton(sId, false);
            }
        },

        _createSettingsButton: function (bEnableHelp) {
            var sId = "userSettingsBtn";
            if (!sap.ui.getCore().byId(sId)) {
                var oUserPrefButton = new ActionItem(sId, {
                    tooltip: resources.i18n.getText("ControlKey") + " + " + resources.i18n.getText("CommaKey"),
                    text: resources.i18n.getText("userSettings"),
                    icon: "sap-icon://action-settings",
                    press: function () {
                        EventHub.emit("openUserSettings", Date.now());
                    }
                });
                if (bEnableHelp) {
                    oUserPrefButton.addStyleClass("help-id-loginDetails"); // xRay help ID
                }
                this._addDanglingControl(oUserPrefButton);
            }
        },

        _createSupportTicketButton: function (bEnableHelp) {
            //Create button on demand
            Config.on("/core/extension/SupportTicket").do(function (bConfigured) {
                // 1) false and no button : do nothing
                // 2) false and the button exists: probably visible, set visibility to false
                // 3) true: create the button and set visibility to true
                var sId = "ContactSupportBtn";
                var oContactSupport = sap.ui.getCore().byId(sId);
                if (bConfigured && !oContactSupport) {
                    oContactSupport = new ContactSupportButton(sId);
                    this._addDanglingControl(oContactSupport);
                    if (bEnableHelp) {
                        oContactSupport.addStyleClass("help-id-contactSupportBtn"); // xRay help ID
                    }
                }
                if (bConfigured) {
                    this.getRenderer().showActionButton(sId);
                } else {
                    this.getRenderer().hideActionButton(sId);
                }
            }.bind(this));
        },

        _createRecentActivitiesButton: function () {
            var sId = "recentActivitiesBtn";

            Config.on("/core/shell/model/enableTrackingActivity").do(function (bEnableTrackingActivity) {
                if (bEnableTrackingActivity) {
                    var oRecentActivitiesBtn = sap.ui.getCore().byId(sId);
                    if (!oRecentActivitiesBtn) {
                        oRecentActivitiesBtn = new ActionItem(sId, {
                            text: resources.i18n.getText("recentActivities"),
                            icon: "sap-icon://customer-history",
                            press: function () {
                                QuickAccess.openQuickAccessDialog("recentActivityFilter", "userActionsMenuHeaderButton");
                            }
                        });
                        this._addDanglingControl(oRecentActivitiesBtn);
                    }
                    this.getRenderer().showActionButton(sId, false);
                } else {
                    this.getRenderer().hideActionButton(sId, false);
                }
            }.bind(this));
        },

        _createFrequentActivitiesButton: function () {
            var sId = "frequentActivitiesBtn";

            Config.on("/core/shell/model/enableTrackingActivity").do(function (bEnableTrackingActivity) {
                if (bEnableTrackingActivity) {
                    var oFrequentActivitiesBtn = sap.ui.getCore().byId(sId);
                    if (!oFrequentActivitiesBtn) {
                        oFrequentActivitiesBtn = new ActionItem(sId, {
                            text: resources.i18n.getText("frequentActivities"),
                            icon: "sap-icon://activity-individual",
                            tooltip: resources.i18n.getText("frequentActivitiesTooltip"),
                            press: function () {
                                QuickAccess.openQuickAccessDialog("frequentlyUsedFilter", "userActionsMenuHeaderButton");
                            }
                        });
                        this._addDanglingControl(oFrequentActivitiesBtn);
                    }
                    this.getRenderer().showActionButton(sId, false);
                } else {
                    this.getRenderer().hideActionButton(sId, false);
                }
            }.bind(this));
        },

        _createLogoutButton: function () {
            var sId = "logoutBtn";
            if (sap.ui.getCore().byId(sId)) {
                return;
            }
            var oLogoutBtn = new ActionItem(sId, {
                visible: true,
                type: ButtonType.Transparent,
                icon: "sap-icon://log",
                text: resources.i18n.getText("signoutBtn_title"),
                press: this.logout
            });
            this._addDanglingControl(oLogoutBtn);
            this.getRenderer().showActionButton(sId, false);
        },

        logout: function () {
            sap.ui.require(["sap/m/MessageBox", "sap/ushell/ui/launchpad/LoadingDialog"],
                function (MessageBox, LoadingDialog) {
                    var oLoading = new LoadingDialog({ text: "" }),
                        bShowLoadingScreen = true,
                        bIsLoadingScreenShown = false,
                        oLogoutDetails = {};

                    sap.ushell.Container.getGlobalDirty().done(function (dirtyState) {
                        bShowLoadingScreen = false;
                        if (bIsLoadingScreenShown === true) {
                            oLoading.exit();
                            oLoading = new LoadingDialog({ text: "" });
                        }

                        var _getLogoutDetails = function () {
                            var oResourceBundle = resources.i18n;

                            if (dirtyState === sap.ushell.Container.DirtyState.DIRTY) {
                                // show warning only if it is sure that there are unsaved changes
                                oLogoutDetails.message = oResourceBundle.getText("unsaved_data_warning_popup_message");
                                oLogoutDetails.icon = MessageBox.Icon.WARNING;
                                oLogoutDetails.messageTitle = oResourceBundle.getText("unsaved_data_warning_popup_title");
                            } else {
                                // show 'normal' logout confirmation in all other cases, also if dirty state could not be determined
                                oLogoutDetails.message = oResourceBundle.getText("signoutConfirmationMsg");
                                oLogoutDetails.icon = MessageBox.Icon.QUESTION;
                                oLogoutDetails.messageTitle = oResourceBundle.getText("signoutMsgTitle");
                            }

                            return oLogoutDetails;
                        };

                        oLogoutDetails = _getLogoutDetails(dirtyState);
                        MessageBox.show(oLogoutDetails.message, oLogoutDetails.icon,
                            oLogoutDetails.messageTitle, [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                            function (oAction) {
                                if (oAction === MessageBox.Action.OK) {
                                    oLoading.openLoadingScreen();
                                    oLoading.showAppInfo(resources.i18n.getText("beforeLogoutMsg"), null);
                                    sap.ushell.Container.logout();
                                }
                            }, ElementMetadata.uid("confirm"));
                    });
                    if (bShowLoadingScreen === true) {
                        oLoading.openLoadingScreen();
                        bIsLoadingScreenShown = true;
                    }
                }
            );
        },

        _addDanglingControl: function (oControl) {
            this._aDanglingControl.push(oControl);
        },

        _destroyDanglingControls: function () {
            if (this._aDanglingControl) {
                this._aDanglingControl.forEach(function (oControl) {
                    if (oControl.destroyContent) {
                        oControl.destroyContent();
                    }
                    oControl.destroy();
                });
            }
        },

        /**
         * Method to open or close the UserActionsMenu popover
         *
         * @param {boolean} bShow flag to open or cloase UserActionsMenu popover
         *
         * @private
         */
        _toggleUserActionsMenuPopover: function (bShow) {
            if (!this.oPopover) {
                Fragment.load({
                    name: "sap.ushell.components.shell.UserActionsMenu.UserActionsMenuPopover",
                    type: "XML",
                    controller: this
                }).then(function (popover) {
                    this.oPopover = popover;
                    this.oPopover.setModel(this.getModel());
                    this._toggleUserActionsMenuPopover(bShow);
                }.bind(this));
            } else if (bShow) {
                this.oPopover.getModel().refresh(true); // force refresh by reopen because the visibility of actions may change
                this.oPopover.openBy(sap.ui.getCore().byId("userActionsMenuHeaderButton"));
            } else {
                this.oPopover.close();
                if (window.document.activeElement && window.document.activeElement.id !== "userActionsMenuHeaderButton") {
                    window.document.getElementById("userActionsMenuHeaderButton").focus();
                }
            }
        },

        userActionsMenuPopoverItemFactory: function (sId, oContext) {
            var oActionItem = sap.ui.getCore().byId(oContext.getObject());

            return new StandardListItem({
                id: sId + "-" + oActionItem.getId(),
                icon: oActionItem.getIcon(),
                tooltip: oActionItem.getTooltip(),
                iconInset: true,
                title: oActionItem.getText(),
                visible: oActionItem.getVisible(),
                type: ListType.Active,
                customData: [{ //used for opa test
                    key: "actionItemId",
                    value: oActionItem.getId()
                }],
                press: function () {
                    if (oActionItem) {
                        oActionItem.firePress();
                        EventHub.emit("showUserActionsMenu", false);
                    }
                }
            }).addStyleClass("sapUshellUserActionsMenuActionItem");
        },
        getRenderer: function () {
            if (!this._oRenderer) {
                this._oRenderer = sap.ushell.Container.getRenderer("fiori2");
            }
            return this._oRenderer;
        },

        getShellConfig: function () {
            return this.getRenderer().getShellConfig();
        }
    });
});
