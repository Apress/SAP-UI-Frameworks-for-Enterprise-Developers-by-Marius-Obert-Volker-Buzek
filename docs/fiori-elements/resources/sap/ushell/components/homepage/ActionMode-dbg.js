// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Tile action mode implementation.
 *
 * In tile action mode the user can launch an action associated with a tile.
 * The mode is launched when clicking on the Edit button in the user menu.
 *
 * Tile action mode can be activated only from the launchpad. it is not accessible from the catalog or from an application.
 * When the mode is active and the user clicks on a tile - the tile's corresponding actions are presented in an action sheet
 *  and the user can click/launch any of them.
 *
 * Every user action (e.g. menu buttons, drag-and-drop) except for clicking a tile - stops/deactivates the action mode.
 *
 * This module Contains the following:
 *  - Constructor function that creates action mode activation buttons
 *  - Activation handler
 *  - Deactivation handler
 *  - Rendering tile action menu
 *
 * @version 1.113.0
 */
/**
 * @namespace
 * @name sap.ushell.components.homepage.ActionMode
 * @since 1.26.0
 * @private
 */
sap.ui.define([
    "sap/base/Log",
    "sap/m/Button",
    "sap/m/library",
    "sap/m/Popover",
    "sap/m/Text",
    "sap/ui/core/Core",
    "sap/ushell/components/HomepageManager",
    "sap/ushell/resources",
    "sap/ushell/utils/WindowUtils"
], function (
    Log,
    Button,
    mobileLibrary,
    Popover,
    Text,
    Core,
    HomepageManager,
    resources,
    WindowUtils
) {
    "use strict";

    // shortcut for sap.m.PlacementType
    var PlacementType = mobileLibrary.PlacementType;

    /* global hasher */

    /**
     * Constructor function
     * Creates action mode activation buttons:
     *  1. A new button in the user menu
     *  2. A floating button
     */
    var ActionMode = function () {
        this.oEventBus = Core.getEventBus();

        this.init = function (oModel) {
            this.oModel = oModel;
        };
    };

    /**
     * Activation handler of Tile actions mode ("Edit Mode").
     *
     * Performs the following actions:
     * - Sets the feature's model property to indicate that the feature is activated
     * - Registers deactivation click handler, called when the user clicks outside of a tile
     * - Adds the cover DIV to all tiles adding the mode's grey opacity and click handler for opening the actions menu
     * - Disables drag capability on tiles
     * - Changes the appearance of the floating activation button
     */
    ActionMode.prototype._activate = function () {
        this.oModel.setProperty("/tileActionModeActive", true);
        this.aOrigHiddenGroupsIds = this.getHomepageManager().getCurrentHiddenGroupIds(this.oModel);
        var oDashboardGroups = Core.byId("dashboardGroups");
        oDashboardGroups.addLinksToUnselectedGroups();

        // Change action mode button display in the user actions menu
        var oTileActionsButton = Core.byId("ActionModeBtn");
        if (oTileActionsButton) {
            oTileActionsButton.setText(resources.i18n.getText("exitEditMode"));
            // only available if the action mode button is in the shell header
            if (oTileActionsButton.setSelected) {
                oTileActionsButton.setSelected(true);
            }
        }
        this.oEventBus.publish("launchpad", "actionModeActive");
    };

    /**
     * Deactivation handler of tile actions mode
     *
     * Performs the following actions:
     * - Unregisters the deactivation click handler
     * - Sets the feature's model property to indicate that the feature is deactivated
     * - Enables drag capability on tiles
     * - Destroys the tile actions menu control
     * - Removed the cover DIV from to all the tiles
     * - Adds the cover DIV to all tiles adding the mode's grey opacity and click handler for opening the actions menu
     * - Changes the appearance of the floating activation button
     */
    ActionMode.prototype._deactivate = function () {
        this.oModel.setProperty("/tileActionModeActive", false);
        this.oEventBus.publish("launchpad", "actionModeInactive", this.aOrigHiddenGroupsIds);

        var tileActionsMenu = Core.byId("TileActions");
        if (tileActionsMenu !== undefined) {
            tileActionsMenu.destroy();
        }

        // Change action mode button display in the user actions menu
        var oTileActionsButton = Core.byId("ActionModeBtn");
        if (oTileActionsButton) {
            oTileActionsButton.setText(resources.i18n.getText("activateEditMode"));
            // only available if the action mode button is in the shell header
            if (oTileActionsButton.setSelected) {
                oTileActionsButton.setSelected(false);
            }
        }
    };

    ActionMode.prototype.toggleActionMode = function (oModel, sSource, dashboardGroups) {
        dashboardGroups = dashboardGroups || [];

        var visibleGroups = dashboardGroups.filter(function (group) {
            return group.getVisible();
        });

        var oData = {
            group: visibleGroups[oModel.getProperty("/topGroupInViewPortIndex")],
            restoreLastFocusedTile: true
        };

        if (oModel.getProperty("/tileActionModeActive")) {
            this._deactivate();

            // if the TileContainer header was focused, we need to restore focus to the closest tile
            var oLastFocusedHeaderElement = document.querySelector(".sapUshellTileContainerHeader[tabindex='0']");
            if (oLastFocusedHeaderElement) {
                var oTileContainerElement = oLastFocusedHeaderElement.closest("sapUshellTileContainer");
                if (oTileContainerElement) {
                    oData.restoreLastFocusedTileContainerById = oTileContainerElement.getAttribute("id");
                }
            }
        } else {
            this._activate();
        }

        this.oEventBus.publish("launchpad", "scrollToGroup", oData);
    };

    /**
     * Apply action/edit mode CSS classes on a group.
     * This function is called when in edit/action mode and tiles were dragged,
     *  since the group is being re-rendered and the dashboard is still in action/edit mode
     *
     * @param {object} oGroup Group that should be placed in edit mode
     */
    ActionMode.prototype.activateGroupEditMode = function (oGroup) {
        var aGroupContentElements = oGroup.getDomRef().getElementsByClassName("sapUshellTileContainerContent");

        for (var i = 0; i < aGroupContentElements.length; i++) {
            aGroupContentElements[i].classList.add("sapUshellTileContainerEditMode");
        }
    };

    ActionMode.prototype.getHomepageManager = function () {
        if (!this.oHomepageManager) {
            this.oHomepageManager = HomepageManager.prototype.getInstance();
        }
        return this.oHomepageManager;
    };

    ActionMode.prototype._filterActions = function (aActions, oTileControl) {
        var oTileModel = oTileControl.getModel();
        var sGroupBindingPath = oTileControl.getParent().getBindingContext().getPath();
        if (oTileModel.getProperty(sGroupBindingPath + "/isGroupLocked")) {
            // edit (personalization) actions should not be displayed in locked Groups,
            // but actions defined in FLPD should be kept (e.g. Dynamic & Static Tiles can have settings actions)
            [
                "tileSettingsBtn",
                "linkSettingsBtn",
                "ConvertToTile",
                "ConvertToLink",
                "moveTile_action"
            ].forEach(function (sActionKey) {
                aActions = aActions.filter(function (oAction) {
                    return (oAction.id !== sActionKey);
                });
            });
        }
        if (this.getHomepageManager().getPersonalizableGroups().length < 2) {
            // the "Move" action should not be displayed if there are less than 2 personalizable Groups
            aActions = aActions.filter(function (oAction) {
                return (oAction.id !== "moveTile_action");
            });
        }
        return aActions;
    };

    /**
     * Opens the tile menu, presenting the tile's actions
     *
     * Performs the following actions:
     * - Returning the clicked tile to its original appearance
     * - Tries to get an existing action sheet in case actions menu was already opened during this session of action mode
     * - If this is the first time the user opens actions menu during this session of action mode - lazy creation a new action sheet
     * - Gets the Tile's actions from the LaunchPage service and creates buttons accordingly; invalid actions are discarded
     * - Open the action sheet by the clicked tile
     *
     * @param {sap.ui.base.Event} oEvent Tile press action event.
     * @private
     */
    ActionMode.prototype._openActionsMenu = function (oEvent) {
        var oTileControl = oEvent.getSource();
        var oTile = oTileControl.getBindingContext().getObject().object;
        var aActions = this.getHomepageManager().getTileActions(oTile);
        aActions = this._filterActions(aActions, oTileControl);

        var aTileActionLayerDivSelectedElements = document.getElementsByClassName("sapUshellTileActionLayerDivSelected");
        for (var i = 0; i < aTileActionLayerDivSelectedElements.length; i++) {
            aTileActionLayerDivSelectedElements[i].classList.remove("sapUshellTileActionLayerDivSelected");
        }

        var aCoverDivs = oTileControl.getDomRef().getElementsByClassName("sapUshellTileActionLayerDiv");
        for (var j = 0; j < aCoverDivs.length; j++) {
            aCoverDivs[j].classList.add("sapUshellTileActionLayerDivSelected");
        }

        var aActionButtons = [];

        aActions.forEach(function (oAction) {
            if (!oAction.press && !oAction.targetURL) {
                Log.warning("Invalid Tile action discarded: " + JSON.stringify(oAction));
                return;
            }
            aActionButtons.push(new Button({
                text: oAction.text,
                icon: oAction.icon,
                press: this._handleActionPress.bind(this, oAction, oTileControl)
            }));
        }.bind(this));

        if (aActionButtons.length === 0) {
            this._openNoActionsPopover(oEvent);
            return;
        }

        // for tiles, actions menu is opened by "more" icon; for links, there is an action button not controlled by the FLP.
        // for links, we first try to access the "more" button and open the action sheet by it.
        var oActionSheetTarget = oTileControl.getActionSheetIcon ? oTileControl.getActionSheetIcon() : undefined;
        if (!oActionSheetTarget) {
            var oMoreAction = Core.byId(oTileControl.getId() + "-action-more");
            oActionSheetTarget = (oMoreAction || oTileControl);
        }

        var oActionSheet = Core.byId("TileActions");
        if (!oActionSheet) {
            sap.ui.require(["sap/m/ActionSheet"], function (ActionSheet) {
                oActionSheet = new ActionSheet("TileActions", {
                    placement: PlacementType.VerticalPreferedBottom,
                    afterClose: function () {
                        var aSelectedElements = document.getElementsByClassName("sapUshellTileActionLayerDivSelected");
                        for (var k = 0; k < aSelectedElements.length; k++) {
                            aSelectedElements[k].classList.remove("sapUshellTileActionLayerDivSelected");
                        }
                        var oEventBus = Core.getEventBus();
                        oEventBus.publish("dashboard", "actionSheetClose", oTileControl);
                    }
                });
                this._openActionSheet(oActionSheet, aActionButtons, oActionSheetTarget);
            }.bind(this));
        } else {
            this._openActionSheet(oActionSheet, aActionButtons, oActionSheetTarget);
        }
    };

    /*
     * Opens the Action Sheet on the given target with the provided buttons.
     */
    ActionMode.prototype._openActionSheet = function (oActionSheet, aButtons, oTarget) {
        aButtons = aButtons || [];
        oActionSheet.destroyButtons();
        aButtons.forEach(function (oButton) {
            oActionSheet.addButton(oButton);
        });
        oActionSheet.openBy(oTarget);
    };

    ActionMode.prototype._openNoActionsPopover = function (oEvent) {
        var oTileControl = oEvent.getSource();
        new Popover({
            placement: PlacementType.Bottom,
            showHeader: false,
            content: new Text({ text: resources.i18n.getText("tileHasNoActions") })
        }).addStyleClass("sapUiContentPadding").openBy(oTileControl);
    };

    /**
     * Press handler of an action in a Tile's action sheet.
     * This handling is platform-specific (i.e. not all platforms call this method).
     *
     * @param {object} oAction The pressed action in the Tile's action sheet.
     * @param {string} oAction.icon An icon code.
     * @param {string} oAction.text A text.
     * @param {function} [oAction.press] A callback function to handle the press.
     * @param {string} [oAction.targetURL] Either a hash (intent) or a full URL to navigate to.
     *   If both a "press" and a "targetURL" are provided, "targetURL" is ignored.
     *   If neither a "press" nor a "targetURL" are provided, nothing happens (the action is invalid and should not be displayed).
     * @param {sap.ui.core.Control} oTileControl The Tile that owns the action.
     * @private
     */
    ActionMode.prototype._handleActionPress = function (oAction, oTileControl) {
        if (oAction.press) {
            oAction.press(oTileControl);
        } else if (oAction.targetURL) {
            if (oAction.targetURL.indexOf("#") === 0) {
                hasher.setHash(oAction.targetURL);
            } else {
                WindowUtils.openURL(oAction.targetURL, "_blank");
            }
        }
    };

    return new ActionMode();
}, /* bExport= */ true);
