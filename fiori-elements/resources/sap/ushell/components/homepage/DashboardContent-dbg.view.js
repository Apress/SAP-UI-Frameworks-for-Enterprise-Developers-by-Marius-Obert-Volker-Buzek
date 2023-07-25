// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Fiori launchpad main view. The view includes a <code>sap.m.page</code>
 * with a header of type <code>sap.ushell.ui.launchpad.AnchorNavigationBar</code>
 * and content of type <code>sap.ushell.ui.launchpad.DashboardGroupsContainer</code>.
 *
 * @version 1.113.0
 * @name sap.ushell.components.homepage.DashboardContent.view
 * @private
 */
sap.ui.define([
    "sap/m/library",
    "sap/ui/core/library",
    "sap/m/Page",
    "sap/ui/core/Component",
    "sap/ui/core/mvc/View",
    "sap/ui/Device",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/components/homepage/DashboardGroupsBox",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/AnchorItem",
    "sap/ushell/ui/launchpad/AnchorNavigationBar",
    "sap/ushell/utils",
    "sap/ushell/components/homepage/DashboardContent.controller", // controller must be preloaded
    "sap/ushell/components/homepage/ActionMode"
], function (
    mobileLibrary,
    coreLibrary,
    Page,
    Component,
    View,
    Device,
    Filter,
    FilterOperator,
    jQuery,
    DashboardGroupsBox,
    Config,
    EventHub,
    resources,
    AnchorItem,
    AnchorNavigationBar,
    utils,
    DashboardContentController,
    ActionMode
) {
    "use strict";

    // shortcut for sap.ui.core.AccessibleLandmarkRole
    var AccessibleLandmarkRole = coreLibrary.AccessibleLandmarkRole;

    return View.extend("sap.ushell.components.homepage.DashboardContent", {
        /*
         * Creating the content of the main dashboard view.
         * The view is basically a sap.m.Page control that contains:
         *  - AnchorNavigationBar as header.
         *  - DashboardGroupsBox that contains the groups and tiles as content.
         *  - Bar in the footer if edit mode is enabled.
         */
        createContent: function (oController) {
            this.oModel = this.getController().getOwnerComponent().getModel();

            var bEnablePersonalization = this.oModel.getProperty("/personalization");
            var bEnableTileActionsIcon = this.oModel.getProperty("/enableTileActionsIcon");

            this.isCombi = Device.system.combi;
            this.isTouch = this.isCombi ? false : (Device.system.phone || Device.system.tablet);
            this.parentComponent = Component.getOwnerComponentFor(this);
            this.addStyleClass("sapUshellDashboardView");
            this.oRenderer = sap.ushell.Container.getRenderer("fiori2");
            this.bIsHomeIntentRootIntent = utils.isFlpHomeIntent(this.oRenderer.getShellConfig().rootIntent);

            sap.ui.getCore().getEventBus().subscribe("launchpad", "actionModeInactive", this._handleEditModeChange, this);
            sap.ui.getCore().getEventBus().subscribe("launchpad", "actionModeActive", this._handleEditModeChange, this);
            sap.ui.getCore().getEventBus().subscribe("launchpad", "contentRefresh", this._onDashboardShown, this);
            sap.ui.getCore().getEventBus().subscribe("launchpad", "dashboardModelContentLoaded", this._onDashboardShown, this);

            /**
             * In order to save performance we delay the actionmode, the footer creation and the overflow of the anchorBar
             * till core-ext file has been loaded.
             */
            this.oDoable = EventHub.once("CoreResourcesComplementLoaded").do(function () {
                this.oAnchorNavigationBar.setOverflowEnabled(true);

                if (bEnablePersonalization || bEnableTileActionsIcon) {
                    sap.ui.require(["sap/ushell/components/homepage/ActionMode"], function (ActionMode) {
                        ActionMode.init(this.oModel);
                    }.bind(this));
                }
                if (bEnablePersonalization) {
                    this._createFooter();
                    this._createActionModeButton();
                }
            }.bind(this));
            this.oFilterSelectedGroup = new Filter("isGroupSelected", FilterOperator.EQ, true);

            this.oRenderer.getRouter().getRoute("home").attachMatched(this._onHomeNavigation, this);

            this.oAnchorNavigationBar = this._getAnchorNavigationBar(oController);

            var oDashboardGroupsBoxModule = new DashboardGroupsBox();
            // Create the DashboardGroupsBox object that contains groups and tiles
            this.oDashboardGroupsBox = oDashboardGroupsBoxModule.createGroupsBox(oController, this.oModel);

            this.oPage = new Page("sapUshellDashboardPage", {
                customHeader: this.oAnchorNavigationBar,
                landmarkInfo: {
                    headerRole: AccessibleLandmarkRole.Navigation,
                    headerLabel: resources.i18n.getText("Dashboard.Page.Header.AriaLabel"),
                    contentRole: AccessibleLandmarkRole.Region,
                    contentLabel: resources.i18n.getText("Dashboard.Page.Content.AriaLabel"),
                    rootRole: AccessibleLandmarkRole.None
                },
                floatingFooter: true,
                content: [ this.oDashboardGroupsBox ]
            });

            this.oPage.addEventDelegate({
                onAfterRendering: function () {
                    var oDomRef = this.getDomRef();
                    var oScrollableElement = oDomRef.getElementsByTagName("section");

                    jQuery(oScrollableElement[0]).off("scrollstop", oController.handleDashboardScroll);
                    jQuery(oScrollableElement[0]).on("scrollstop", oController.handleDashboardScroll);
                }.bind(this)
            });

            return this.oPage;
        },

        getAnchorItemTemplate: function () {
            var that = this;
            var oAnchorItemTemplate = new AnchorItem({
                index: "{index}",
                title: "{title}",
                groupId: "{groupId}",
                defaultGroup: "{isDefaultGroup}",
                helpId: "{helpId}",
                selected: false,
                isGroupRendered: "{isRendered}",
                visible: {
                    parts: ["/tileActionModeActive", "isGroupVisible", "visibilityModes"],
                    formatter: function (tileActionModeActive, isGroupVisible, visibilityModes) {
                        // Empty groups should not be displayed when personalization is off or
                        // if they are locked or default group not in action mode
                        if (!visibilityModes[tileActionModeActive ? 1 : 0]) {
                            return false;
                        }
                        return isGroupVisible || tileActionModeActive;
                    }
                },
                locked: "{isGroupLocked}",
                isGroupDisabled: {
                    parts: ["isGroupLocked", "/isInDrag", "/homePageGroupDisplay"],
                    formatter: function (bIsGroupLocked, bIsInDrag, sAnchorbarMode) {
                        return bIsGroupLocked && bIsInDrag && sAnchorbarMode === "tabs";
                    }
                },
                press: function (oEvent) {
                    that.oAnchorNavigationBar.handleAnchorItemPress(oEvent);
                }
            });

            oAnchorItemTemplate.attachBrowserEvent("focus", function () {
                this.setNavigationBarItemsVisibility();
            }.bind(this.oAnchorNavigationBar));

            return oAnchorItemTemplate;
        },

        _getAnchorNavigationBar: function (oController) {
            var oAnchorNavigationBar = new AnchorNavigationBar("anchorNavigationBar", {
                selectedItemIndex: "{/topGroupInViewPortIndex}",
                itemPress: [function (oEvent) {
                    this._handleAnchorItemPress(oEvent);
                }, oController],
                overflowEnabled: false // we will enable the overflow once coreExt will be loaded!!!
            });

            if (Device.system.desktop) {
                sap.ui.require(["sap/ushell/components/ComponentKeysHandler"], function (ComponentKeysHandler) {
                    ComponentKeysHandler.getInstance().then(function (ComponentKeysHandlerInstance) {
                        oAnchorNavigationBar.addEventDelegate({
                            onBeforeFastNavigationFocus: function (oEvent) {
                                if (jQuery(".sapUshellAnchorItem").is(":visible")) {
                                    oEvent.preventDefault();
                                    ComponentKeysHandlerInstance.goToSelectedAnchorNavigationItem();
                                }
                            },
                            onsapenter: function (oEvent) {
                                oEvent.srcControl.getDomRef().click();
                            },
                            onsapspace: function (oEvent) {
                                oEvent.srcControl.getDomRef().click();
                            },
                            onsaptabnext: function () {
                                // If the OverflowButton is not visible, jump to the last visited Tile
                                if (!sap.ui.getCore().byId("sapUshellAnchorBarOverflowButton").getVisible()) {
                                    ComponentKeysHandlerInstance.goToLastVisitedTile();
                                }
                            }
                        });
                    });
                });
            }

            oAnchorNavigationBar.addStyleClass("sapContrastPlus");

            return oAnchorNavigationBar;
        },

        _actionModeButtonPress: function () {
            this.oDashboardGroupsBox.getBinding("groups").filter([]); // replace model filter inorder to show hidden groups
            var dashboardGroups = this.oDashboardGroupsBox.getGroups();
            ActionMode.toggleActionMode(this.oModel, "Menu Item", dashboardGroups);
            this._updateAnchorNavigationBarVisibility();
            if (this.oModel.getProperty("/homePageGroupDisplay") === "tabs") {
                if (this.oModel.getProperty("/tileActionModeActive")) { // To edit mode
                    // find the selected group
                    var aGroups = this.oModel.getProperty("/groups"),
                        selectedGroup;
                    for (var i = 0; i < aGroups.length; i++) {
                        if (aGroups[i].isGroupSelected) {
                            selectedGroup = i;
                            break;
                        }
                    }
                    // scroll to selected group
                    this.getController()._scrollToGroup("launchpad", "scrollToGroup", {
                        group: {
                            getGroupId: function () {
                                return aGroups[selectedGroup].groupId;
                            }
                        },
                        groupChanged: false,
                        focus: true
                    });
                } else { // To non-edit mode
                    this.getController()._deactivateActionModeInTabsState();
                }
            }
        },

        /**
         * Creates the action mode button based on the shell config.
         *
         * @private
         * @since 1.86.0
         */
        _createActionModeButton: function () {
            var oActionButtonObjectData = {
                id: "ActionModeBtn",
                text: resources.i18n.getText("activateEditMode"),
                icon: "sap-icon://edit",
                press: this._actionModeButtonPress.bind(this)
            };
            var bMoveEditButtonToShellHeader = this.oRenderer.getShellConfig().moveEditHomePageActionToShellHeader;
            if (bMoveEditButtonToShellHeader) {
                this._createActionModeButtonInHeader(oActionButtonObjectData);
            } else {
                this._createActionModeButtonInUserMenu(oActionButtonObjectData);
            }
        },

        /**
         * Creates the action mode button in the shell header.
         *
         * @param {object} oActionButtonObjectData the button property
         *
         * @private
         * @since 1.86.0
         */
        _createActionModeButtonInHeader: function (oActionButtonObjectData) {
            sap.ui.require(["sap/ushell/ui/shell/ShellHeadItem"], function (ShellHeadItem) {
                this.oTileActionsButton = new ShellHeadItem(oActionButtonObjectData);
                if (Config.last("/core/extension/enableHelp")) {
                    this.oTileActionsButton.addStyleClass("help-id-ActionModeBtn"); // xRay help ID
                }
                if (!this.bIsHomeIntentRootIntent) {
                    this.oRenderer.showHeaderEndItem(this.oTileActionsButton.getId(), true);
                } else {
                    this.oRenderer.showHeaderEndItem(this.oTileActionsButton.getId(), false, ["home"]);
                }
            }.bind(this));
        },

        /**
         * Creates the action mode button in the user menu.
         *
         * @param {object} oActionButtonObjectData the button property
         *
         * @private
         * @since 1.86.0
         */
        _createActionModeButtonInUserMenu: function (oActionButtonObjectData) {
            var oAddActionButtonParameters = {
                controlType: "sap.ushell.ui.launchpad.ActionItem",
                oControlProperties: oActionButtonObjectData,
                bIsVisible: true,
                aStates: ["home"]
            };

            if (!this.bIsHomeIntentRootIntent) {
                oAddActionButtonParameters.aStates = null;
                oAddActionButtonParameters.bCurrentState = true;
            }

            this.oRenderer.addUserAction(oAddActionButtonParameters).done(function (oActionButton) {
                this.oTileActionsButton = oActionButton;
                // if xRay is enabled
                if (Config.last("/core/extension/enableHelp")) {
                    this.oTileActionsButton.addStyleClass("help-id-ActionModeBtn");// xRay help ID
                }
            }.bind(this));

        },

        _handleEditModeChange: function () {
            if (this.oTileActionsButton) {
                this.oTileActionsButton.toggleStyleClass("sapUshellAcionItemActive");
            }
        },

        _createFooter: function () {
            sap.ui.require([
                "sap/m/Bar",
                "sap/m/Button",
                "sap/m/ToolbarSpacer"
            ], function (Bar, Button, ToolbarSpacer) {
                this.oPage.setFooter(new Bar("sapUshellDashboardFooter", {
                    visible: "{/tileActionModeActive}",
                    contentRight: [
                        new ToolbarSpacer(),
                        new Button("sapUshellDashboardFooterDoneBtn", {
                            type: mobileLibrary.ButtonType.Emphasized,
                            text: resources.i18n.getText("closeEditMode"),
                            tooltip: resources.i18n.getText("exitEditMode"),
                            press: this._actionModeButtonPress.bind(this)
                        })
                    ]
                }));
            }.bind(this));
        },

        _onDashboardShown: function () {
            var bInDashboard = this.oRenderer && this.oRenderer.getCurrentCoreView() === "home";

            if (bInDashboard) {
                if (!Device.system.phone) {
                    this.oRenderer.showRightFloatingContainer(false);
                }

                this._updateAnchorNavigationBarVisibility();

                this.getController().resizeHandler();
                utils.refreshTiles();
                if (Device.system.desktop) {
                    var sTagName = document.activeElement ? document.activeElement.tagName : "";
                    if (sTagName !== "INPUT" && sTagName !== "TEXTAREA") {
                        // only change the focus while not renaming a tile
                        sap.ui.require(["sap/ushell/components/ComponentKeysHandler"], function (ComponentKeysHandler) {
                            ComponentKeysHandler.getInstance().then(function (ComponentKeysHandlerInstance) {
                                ComponentKeysHandlerInstance.goToLastVisitedTile();
                            });
                        });
                    }
                }
                if (EventHub.last("firstSegmentCompleteLoaded")) {
                    EventHub.emit("CloseFesrRecord", Date.now());
                }
            }
        },

        _onHomeNavigation: function () {
            this._onDashboardShown();
            if (!this.bIsHomeIntentRootIntent) {
                if (this.oRenderer.getShellConfig().moveEditHomePageActionToShellHeader) {
                    this.oRenderer.showHeaderEndItem(this.oTileActionsButton.getId(), true);
                } else {
                    this.oRenderer.showActionButton(this.oTileActionsButton.getId(), true);
                }
            }
        },

        _updateAnchorNavigationBarVisibility: function () {
            var bOldVisible = this.oPage.getShowHeader(),
                bActionModeActive = this.getModel().getObject("/tileActionModeActive"),
                aVisibleGroups = this.getModel().getProperty("/groups").filter(function (oGroup) {
                    // Check for group's visibility AND - depending on the ActionMode - the visiblityMode
                    // (see ushell/utils.calcVisibilityModes() for details of visibilityModes)
                    if (bActionModeActive) {
                        return oGroup.isGroupVisible && oGroup.visibilityModes[1];
                    }
                    return oGroup.isGroupVisible && oGroup.visibilityModes[0];

                }),
                bVisible = aVisibleGroups.length > 1;

            this.oPage.setShowHeader(bVisible);

            if (bVisible && !bOldVisible) {
                var aGroups = this.getModel().getProperty("/groups"),
                    iSelectedGroup = this.getModel().getProperty("/iSelectedGroup");

                for (var i = 0; i < aVisibleGroups.length; i++) {
                    if (aVisibleGroups[i].getGroupId && aVisibleGroups[i].getGroupId() === aGroups[iSelectedGroup].groupId) {
                        this.oAnchorNavigationBar.setSelectedItemIndex(i);
                        break;
                    }
                }
            }
        },

        getControllerName: function () {
            return "sap.ushell.components.homepage.DashboardContent";
        },

        exit: function () {
            View.prototype.exit.apply(this, arguments);

            if (this.oAnchorNavigationBar) {
                this.oAnchorNavigationBar.destroy();
            }
            if (this.oTileActionsButton) {
                this.oTileActionsButton.destroy();
            }

            if (this.oDoable) {
                this.oDoable.off();
            }

            if (this.oPage) {
                this.oPage.destroy();
            }

            sap.ui.getCore().getEventBus().unsubscribe("launchpad", "actionModeInactive", this._handleEditModeChange, this);
            sap.ui.getCore().getEventBus().unsubscribe("launchpad", "actionModeActive", this._handleEditModeChange, this);
            sap.ui.getCore().getEventBus().unsubscribe("launchpad", "contentRefresh", this._onDashboardShown, this);
            sap.ui.getCore().getEventBus().unsubscribe("launchpad", "dashboardModelContentLoaded", this._onDashboardShown, this);
        }
    });
});
