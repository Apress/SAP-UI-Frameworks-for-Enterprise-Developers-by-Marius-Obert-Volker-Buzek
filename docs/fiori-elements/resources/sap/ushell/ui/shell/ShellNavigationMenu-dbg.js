// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * Provides control sap.ushell.ui.shell.ShellNavigationMenu
 */
sap.ui.define([
    "sap/base/Log",
    "sap/m/FlexBox",
    "sap/m/Bar",
    "sap/ui/core/Icon",
    "sap/m/Title",
    "sap/m/Label",
    "sap/m/List",
    "sap/m/VBox",
    "sap/ui/core/Control",
    "sap/ui/core/Core",
    "sap/ui/Device",
    "sap/ui/thirdparty/jquery",
    "sap/ui/events/KeyCodes",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources"
], function (
    Log,
    FlexBox,
    Bar,
    Icon,
    Title,
    Label,
    List,
    VBox,
    Control,
    Core,
    Device,
    jQuery,
    KeyCodes,
    ushellLibrary,
    resources
) {
    "use strict";

    var ShellNavigationMenu = Control.extend("sap.ushell.ui.shell.ShellNavigationMenu", {
        metadata: {
            library: "sap.ushell",
            properties: {
                title: { type: "string", group: "Misc", defaultValue: null },
                description: { type: "string", group: "Misc", defaultValue: null },
                icon: { type: "sap.ui.core.URI", group: "Appearance", defaultValue: null },
                showRelatedApps: { type: "boolean", defaultValue: true }
            },
            aggregations: {
                items: { type: "sap.m.ListItem", group: "Misc", defaultValue: null, singularName: "item" },

                // Mini-Tiles aggregation is currently limited to 9 items, as decided by UX
                miniTiles: { type: "sap.ushell.ui.shell.NavigationMiniTile", group: "Misc", defaultValue: null, singularName: "miniTile" }
            },
            events: {}
        },
        renderer: {
            apiVersion: 2,

            render: function (oRm, oControl) {
                var aMiniTiles;

                oRm.openStart("div", oControl);
                oRm.openEnd();

                oRm.renderControl(oControl.oTitleBar);

                if (oControl.oItemsList) {
                    // hierarchy list items
                    oRm.renderControl(oControl.oItemsList);
                }

                // render the text-bar-tab control only in case we have mini-tiles (related apps)
                if (oControl.getShowRelatedApps()) {
                    aMiniTiles = oControl.getMiniTiles();
                    if (aMiniTiles && aMiniTiles.length > 0) {
                        oRm.renderControl(oControl.oRelatedAppsVbox);
                    }
                }
                oRm.close("div");
            }
        }
    });

    /************************************** Start: Keyboard Navigation **************************************/

    var KeyboardNavigation = function (oMiniTilesBox) {
        this.init(oMiniTilesBox);
    };

    KeyboardNavigation.prototype.init = function (oMiniTilesBox) {
        this.keyCodes = KeyCodes;
        this.jqElement = oMiniTilesBox.$();
        this.jqElement.on("keydown.keyboardNavigation", this.keydownHandler.bind(this));
    };

    KeyboardNavigation.prototype.destroy = function () {
        if (this.jqElement) {
            this.jqElement.off(".keyboardNavigation");
        }
        delete this.jqElement;
    };

    KeyboardNavigation.prototype.keydownHandler = function (e) {
        switch (e.keyCode) {
            case this.keyCodes.ARROW_UP:
                this.upDownHandler(e, true);
                break;
            case this.keyCodes.ARROW_DOWN:
                this.upDownHandler(e, false);
                break;
            case this.keyCodes.ARROW_LEFT:
                this.leftRightHandler(e, false);
                break;
            case this.keyCodes.ARROW_RIGHT:
                this.leftRightHandler(e, true);
                break;
            case this.keyCodes.HOME:
                this.homeEndHandler(e, true);
                break;
            case this.keyCodes.END:
                this.homeEndHandler(e, false);
                break;
            case this.keyCodes.PAGE_UP:
                // PageUp acts as Home
                this.homeEndHandler(e, true);
                break;
            case this.keyCodes.PAGE_DOWN:
                // PageDown acts as End
                this.homeEndHandler(e, false);
                break;
            case this.keyCodes.TAB:
                if (e && e.shiftKey) {
                    this._setItemFocus(e, jQuery("#sapUshellNavHierarchyItems li:[tabindex='0']"));
                } else {
                    this._setItemFocus(e, jQuery("#allMyAppsButton"));
                }
                break;
            default:
                break;
        }
    };

    KeyboardNavigation.prototype.upDownHandler = function (e, isUp) {
        // implement
        var jqFocused = jQuery(document.activeElement);
        if (!jqFocused.hasClass("sapUshellNavMiniTile")) {
            return false;
        }

        /**
         * as the structure of the content is
         * FlexBox  -
         *          - FlexItem (no tab index) -> miniTile (tab index)
         *              .
         *              .
         *              .
         *          - FlexItem (no tab index) -> miniTile (tab index)
         *
         * And we focus on the inner mini tile object, we must go up (by calling .parent())
         * 2 times in order to gain reference to the parent container of all items
         * in order to calculate the indexes correctly
         */
        var jqParent = jqFocused.parent().parent();
        var currentItemIndex = jqFocused.parent().index();
        var jqParentItems = jqParent.children();
        var nextIndex;

        // up/down navigates between rows, so we must add / subtract 3 from the index
        // as there are always 3 tiles in a row (maximum)
        if (isUp) {
            nextIndex = currentItemIndex - 3;
            if (nextIndex < 0) {
                nextIndex += 9;
            }
        } else {
            nextIndex = (currentItemIndex + 3) % jqParentItems.length;
        }

        var nextFocus = jqParentItems[nextIndex].children[0];
        this._setItemFocus(e, jQuery(nextFocus));
    };

    KeyboardNavigation.prototype.leftRightHandler = function (e, isRight) {
        var fName = isRight ? "next" : "prev",
            currentItem,
            nextItem,
            nextItemIndex,
            jqParent,
            nextFocusIndex,
            nextFocus,
            jqFocused = jQuery(document.activeElement);

        if (!jqFocused.hasClass("sapUshellNavMiniTile")) {
            return false;
        }

        // Each tile rendered within a Flex-Item which DO NOT HAVE tab-index. (only the inner Mini-tile container has tabindex)
        // therefore if we trigger next/prev() selectors directly on the inner div (which is the mini-tile)
        // we will not find the next one.
        // We must go one level up (by parent()) afterwards, run the selector and the actual item to focus on
        // it the inner div (as explained before), therefore the next item for focus resides under children() selector
        currentItem = jqFocused.parent();

        // see what is the index of the item we have when using jQuery selector next/previous item
        nextItem = currentItem[fName]();
        nextItemIndex = nextItem.index();

        // take reference to the parent (FlexBox) of the current item( As the current item is the Flex-Item which contains the current fqFocused element )
        // to see how many children it has
        jqParent = currentItem.parent();

        // if the nextItemIndex equals to -1 this means that next item calculated by calling next/previous on current item
        // does not exist. this means we need to recalculate the index to be circular
        // (either first tile or last tile - depending of the direction left/right)
        if (nextItemIndex === -1) {
            // calculating the index of the next item to focus on
            nextFocusIndex = isRight ? 0 : jqParent.children().length - 1;
        } else {
            // as a default,  assume that the next focused item is of index of the next item found
            nextFocusIndex = nextItemIndex;
        }

        // take the respective child of the parent element (by the index calculated) and look at its children[0] as
        // this is the flex-item and we need its mini-tile to focus on
        nextFocus = jqParent.children()[nextFocusIndex].children[0];
        if (!nextFocus) {
            return false;
        }

        this._setItemFocus(e, jQuery(nextFocus));
    };

    /* Home/End switch from the first to last mini-tile */
    KeyboardNavigation.prototype.homeEndHandler = function (e, isHome) {
        var fName = isHome ? "first" : "last";
        var jqFocused = jQuery(document.activeElement);
        if (!jqFocused.hasClass("sapUshellNavMiniTile")) {
            return false;
        }
        e.preventDefault();
        var nextFocus = this.jqElement.find(".sapUshellNavMiniTile")[fName]();
        this._setItemFocus(e, nextFocus);
    };

    KeyboardNavigation.prototype._setItemFocus = function (e, jqItemTo) {
        e.preventDefault();
        e.stopImmediatePropagation();

        jQuery(".sapUshellNavMiniTile").attr("tabindex", -1);
        jqItemTo.attr("tabindex", 0);
        jqItemTo.focus();
    };

    KeyboardNavigation.prototype.setFocusToLastFocusedMiniTile = function (e) {
        var jqLastVisitedMiniTile = jQuery(".sapUshellNavMiniTile[tabindex='0']");

        // if we found last-visited mini tils
        if (jqLastVisitedMiniTile && jqLastVisitedMiniTile[0]) {
            // set focus to it
            this._setItemFocus(e, jQuery(jqLastVisitedMiniTile));
        } else {
            // set focus to first mini-tile available
            this._setItemFocus(e, jQuery(jQuery(".sapUshellNavMiniTile")[0]));
        }
    };

    /************************************** Shell Navigation Menu **************************************/

    ShellNavigationMenu.prototype.init = function () {
    };

    ShellNavigationMenu.prototype._createItemsList = function () {
        // hierarchy items list
        this.oItemsList = new List("sapUshellNavHierarchyItems");
    };

    ShellNavigationMenu.prototype._createMiniTilesBox = function () {
        // mini tiles box
        this.oMiniTilesBox = new FlexBox("sapUshellNavRelatedAppsFlexBox", {justifyContent: "Center"});
    };

    /*
    before open method:
    this is done from performance reasons, to lazy-load the non-necessary resources
    */
    ShellNavigationMenu.prototype._beforeOpen = function () {
        // only if this is first time (e.g. not initialized yet)
        if (!this.bInitialized) {
            // inner application title
            this.oTitle = new Title("navMenuInnerTitle", {
                level: "H1"
            });
            this.oIconControl = new Icon();
            this.oTitleBar = new Bar("navMenuTitleBar", {contentLeft: [this.oIconControl, this.oTitle]});

            // related-apps title
            this.oRelatedAppsTitle = new Label("sapUshellRelatedAppsLabel", {
                text: resources.i18n.getText("shellNavMenu_relatedApps")
            });

            if (!this.oMiniTilesBox) {
                this._createMiniTilesBox();
            }
            // related apps box
            this.oRelatedAppsVbox = new VBox("sapUshellRelatedAppsItems", {
                items: [this.oRelatedAppsTitle, this.oMiniTilesBox]
            });

            // extend inner controls for Acc reasons
            this._extendInnerControlsForAccKeyboard();

            // set as initialized
            this.bInitialized = true;
        }
        this.oTitle.setText(this.getTitle());
        this.oIconControl.setSrc(this.getIcon() || "sap-icon://folder");
    };

    ShellNavigationMenu.prototype._afterOpen = function () {
        /*
            initialize the keyboard-navigation inner module
            for the mini-tiles grid (flexBox)
            ONLY in case we run in desktop
            */
        if (Device.system.desktop) {
            // initializing keyboard navigation
            if (this.keyboardNavigation) {
                this.keyboardNavigation.destroy();
            }
            this.keyboardNavigation = new KeyboardNavigation(this.oMiniTilesBox);
        }
    };

    ShellNavigationMenu.prototype._extendInnerControlsForAccKeyboard = function () {
        // extend the inner controls for accessibility keyboard scenario
        if (Device.system.desktop) {
            // hierarchy items list
            this.oItemsList.addEventDelegate({
                // on tab next (Tab)
                onsaptabnext: function (e) {
                    if (jQuery(".sapUshellNavMiniTile").length) {
                        // focus last visited mini tile
                        this.keyboardNavigation.setFocusToLastFocusedMiniTile(e);
                    } else {
                        var oAllMyAppsBtn = Core.byId("allMyAppsButton");

                        this.keyboardNavigation._setItemFocus(e, jQuery((oAllMyAppsBtn.getDomRef())));
                    }
                }.bind(this)
            });
        }
    };

    /*
        * methods for overriding default behavior of the aggregation management by the infrastructure,
        * in order to delegate the aggregation controls to an inner control which should render them instead
        *  (the related-apps flex-box items aggregation)
        */
    ShellNavigationMenu.prototype.getMiniTiles = function () {
        if (this.oMiniTilesBox) {
            return this.oMiniTilesBox.getItems();
        }
        return [];
    };
    ShellNavigationMenu.prototype.insertMiniTile = function (oMiniTile, iIndex) {
        if (!this.oMiniTilesBox) {
            this._createMiniTilesBox();
        }
        this.oMiniTilesBox.insertItem(oMiniTile, iIndex);
        return this;
    };
    ShellNavigationMenu.prototype.addMiniTile = function (oMiniTile) {
        if (!this.oMiniTilesBox) {
            this._createMiniTilesBox();
        }
        if (this.oMiniTilesBox.getItems().length < 9) {
            this.oMiniTilesBox.addItem(oMiniTile);
        } else {
            Log.warning("ShellNavigationMenu.addMiniTile - miniTiles aggregation is already at maximum size of 9 elements " +
                "- current item was not added.");
        }
        return this;
    };
    ShellNavigationMenu.prototype.removeMiniTile = function (iIndex) {
        if (this.oMiniTilesBox) {
            this.oMiniTilesBox.removeItem(iIndex);
        }
        return this;
    };
    ShellNavigationMenu.prototype.removeAllMiniTiles = function () {
        if (this.oMiniTilesBox) {
            this.oMiniTilesBox.removeAllItems();
        }
        return this;
    };
    ShellNavigationMenu.prototype.destroyMiniTiles = function () {
        if (this.oMiniTilesBox) {
            this.oMiniTilesBox.destroyItems();
        }
        return this;
    };
    ShellNavigationMenu.prototype.indexOfMiniTile = function (oMiniTile) {
        if (this.oMiniTilesBox) {
            return this.oMiniTilesBox.indexOfItem(oMiniTile);
        }
        return -1;
    };

    /*
        * methods for overriding default behavior of the aggregation management by the infrastructure,
        * in order to delegate the aggregation controls to an inner control which should render them instead
        *  (the items-list items aggregation)
        */
    ShellNavigationMenu.prototype.getItems = function () {
        if (this.oItemsList) {
            return this.oItemsList.getItems();
        }
        return [];
    };

    ShellNavigationMenu.prototype.insertItem = function (oHierarchyItem, iIndex) {
        if (!this.oItemsList) {
            this._createItemsList();
        }
        // add accessibility properties to the hierarchy list item according to spec
        oHierarchyItem = this._extendHierarchyItemForAcc(oHierarchyItem);
        this.oItemsList.insertItem(oHierarchyItem, iIndex);
        return this;
    };

    ShellNavigationMenu.prototype.addItem = function (oHierarchyItem) {
        if (!this.oItemsList) {
            this._createItemsList();
        }
        // add accessibility properties to the hierarchy list item according to spec
        oHierarchyItem = this._extendHierarchyItemForAcc(oHierarchyItem);
        this.oItemsList.addItem(oHierarchyItem);
        return this;
    };

    ShellNavigationMenu.prototype.removeItem = function (iIndex) {
        if (this.oItemsList) {
            this.oItemsList.removeItem(iIndex);
        }
        return this;
    };
    ShellNavigationMenu.prototype.removeAllItems = function () {
        if (this.oItemsList) {
            this.oItemsList.removeAllItems();
        }
        return this;
    };
    ShellNavigationMenu.prototype.destroyItems = function () {
        if (this.oItemsList) {
            this.oItemsList.destroyItems();
        }
        return this;
    };
    ShellNavigationMenu.prototype.indexOfItem = function (oHierarchyItem) {
        if (this.oItemsList) {
            return this.oItemsList.indexOfItem(oHierarchyItem);
        }
        return -1;
    };

    // add accessibility properties to the hierarchy list item according to spec
    ShellNavigationMenu.prototype._extendHierarchyItemForAcc = function (oItem) {
        // add support for navigation by 'space' for the hierarchy list item
        if (Device.system.desktop) {
            oItem.addEventDelegate({
                // on tab previous (Shift Tab)
                onsapspace: function (e) {
                    this.firePress();
                }.bind(oItem)
            });
        }

        return oItem;
    };

    // destroy all private inner controls
    ShellNavigationMenu.prototype.exit = function () {
        if (this.oItemsList) {
            this.oItemsList.destroy();
        }
        if (this.oMiniTilesBox) {
            this.oMiniTilesBox.destroy();
        }

        if (this.bInitialized) {
            this.oTitleBar.destroy();
            this.oRelatedAppsVbox.destroy();
            this.oRelatedAppsTitle.destroy();
        }
        // keyboard navigation should be destroyed only in case initialized
        // (see _afterOpen method)
        if (this.keyboardNavigation) {
            this.keyboardNavigation.destroy();
        }
    };

    ShellNavigationMenu.prototype.onAfterRendering = function () {
        jQuery("#sapUshellAppTitlePopover-intHeader").css("height", 0);

        // Adjust accessibility attributes - list of hierarchy items (List)
        var jqHierarchyUL = jQuery("#sapUshellNavHierarchyItems ul");
        jqHierarchyUL.attr("role", "menu");
        jqHierarchyUL.attr("aria-label", resources.i18n.getText("ShellNavigationMenu_HierarchyItemsAriaLabel"));
        jQuery("#sapUshellNavHierarchyItems li").attr("role", "menuitem"); // list items are not allowed inside of a group

        // Adjust accessibility attributes - box of related apps (VBox)
        var jqMiniTilesBox = jQuery("#sapUshellNavRelatedAppsFlexBox");
        jqMiniTilesBox.attr("role", "list");
        jqMiniTilesBox.attr("aria-labelledBy", "sapUshellRelatedAppsLabel");

        // Adjust accessibility attributes setsize and position in set for mini tiles
        var jqMiniTiles = jQuery(".sapUshellNavMiniTile");
        for (var i = 0; i < jqMiniTiles.length; i++) {
            jQuery(jqMiniTiles[i]).attr("aria-setsize", jqMiniTiles.length);
            jQuery(jqMiniTiles[i]).attr("aria-posinset", i + 1);
        }
    };

    return ShellNavigationMenu;
});
