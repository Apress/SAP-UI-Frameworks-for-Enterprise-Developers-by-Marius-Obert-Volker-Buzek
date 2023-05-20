// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview A module that is responsible for initializing the dashboard UIActions (i.e. drag and drop) of groups and tiles.<br>
 * Extends <code>sap.ui.base.Object</code><br>
 * Exposes the public function <code>initializeUIActions</code>
 *
 * @version 1.113.0
 * @name sap.ushell.components.homepage.DashboardUIActions
 * @since 1.35.0
 * @private
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/ui/base/Object",
    "sap/ui/core/Configuration",
    "sap/ui/Device",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Layout"
], function (
    Log,
    deepExtend,
    baseObject,
    Configuration,
    Device,
    jQuery,
    Layout
) {
    "use strict";

    var DashboardUIActions = baseObject.extend("sap.ushell.components.homepage.DashboardUIActions", {
        metadata: {
            publicMethods: ["initializeUIActions"]
        },

        constructor: function (/*sId, mSettings*/) {
            this.aTabBarItemsLocation = [];

            // Make this class only available once
            if (DashboardUIActions.fnDashboardUIActionsGetter && DashboardUIActions.fnDashboardUIActionsGetter()) {
                return DashboardUIActions.fnDashboardUIActionsGetter();
            }
            DashboardUIActions.fnDashboardUIActionsGetter = (function (value) {
                return function () {
                    return value;
                };
            }(this.getInterface()));

            this.oTileUIActions = undefined;
            this.oLinkUIActions = undefined;
            this.oGroupUIActions = undefined;
            this.oController = undefined;
            this.UIActionsInitialized = false;

            // Enabling and disabling drag and drop of groups (groupsUIAction) depends of activation and activation of ActionMode
            sap.ui.getCore().getEventBus().subscribe("launchpad", "actionModeActive", this._enableGroupUIActions, this);
            sap.ui.getCore().getEventBus().subscribe("launchpad", "actionModeInactive", this._disableGroupUIActions, this);
        },

        destroy: function () {
            sap.ui.getCore().getEventBus().unsubscribe("launchpad", "actionModeActive", this._enableGroupUIActions, this);
            sap.ui.getCore().getEventBus().unsubscribe("launchpad", "actionModeInactive", this._disableGroupUIActions, this);
            DashboardUIActions.fnDashboardUIActionsGetter = undefined;
            this.oGroupUIActions = null;
            this.oTileUIActions = null;
            this.oLinkUIActions = null;
        },

        /**
         * Creating UIAction objects for tiles and groups in order to allow dashboard drag and drop actions
         *
         * @param {object} The DashboardContent.controller instance
         *
         * @since 1.35
         *
         * @private
         */
        initializeUIActions: function (oController) {
            this.oController = oController;
            // If TabBar mode active - calculate TabBar items position
            if (oController.getView().getModel().getProperty("/homePageGroupDisplay") === "tabs") {
                this._fillTabBarItemsArray();
            }

            var iPageWidth = jQuery("#sapUshellDashboardPage").width();
            var sDashboardGroupsWrapperId = oController.getView().sDashboardGroupsWrapperId,
                bActionModeActive,
                bRightToLeft = Configuration.getRTL(),

                // Object that contains the common attributed required of the creation of oTileUIActions and oGroupUIActions in Win8 use-case
                oCommonUIActionsDataForWin8 = {
                    containerSelector: "#dashboardGroups",
                    wrapperSelector: sDashboardGroupsWrapperId ? "#" + sDashboardGroupsWrapperId : undefined, // The id of the <section> that wraps dashboardGroups div: #__page0-cont
                    rootSelector: "#shell"
                },
                // Object that contains the common attributed required of the creation of oTileUIActions and oGroupUIActions, including Win8 attributes
                oCommonUIActionsData = deepExtend({}, oCommonUIActionsDataForWin8, {
                    switchModeDelay: 1000,
                    isTouch: oController.getView().isTouch,
                    isCombi: oController.getView().isCombi,
                    debug: false
                }),
                oLinkUIActionsData = {
                    draggableSelector: ".sapUshellLinkTile",
                    placeHolderClass: "sapUshellLinkTile-placeholder",
                    cloneClass: "sapUshellLinkTile-clone",
                    endCallback: this._handleLinkDrop.bind(this),
                    dragCallback: this._handleStartDragTile.bind(this),
                    onBeforeCreateClone: this._onBeforeCreateLinkClone.bind(this),
                    dragAndScrollCallback: this._handleTileDragMove.bind(this),
                    endDragAndScrollCallback: this._handleTileDragAndScrollContinuation.bind(this),
                    moveTolerance: oController.getView().isTouch || oController.getView().isCombi ? 10 : 3,
                    isLayoutEngine: true,
                    disabledDraggableSelector: "sapUshellLockedTile", //check licked links
                    onDragStartUIHandler: this._markDisableGroups.bind(this),
                    onDragEndUIHandler: this._endUIHandler.bind(this),
                    offsetLeft: bRightToLeft ? iPageWidth : -iPageWidth,
                    defaultMouseMoveHandler: function () { }
                },
                oTileUIActionsData = {
                    draggableSelector: ".sapUshellTile",
                    draggableSelectorExclude: ".sapUshellPlusTile",
                    placeHolderClass: "sapUshellTile-placeholder",
                    cloneClass: "sapUshellTile-clone",
                    deltaTop: -44,
                    scrollContainerSelector: undefined, // @TODO remove this
                    endCallback: this._handleTileDrop.bind(this),
                    dragCallback: this._handleStartDragTile.bind(this),
                    dragAndScrollCallback: this._handleTileDragMove.bind(this),
                    endDragAndScrollCallback: this._handleTileDragAndScrollContinuation.bind(this),
                    moveTolerance: oController.getView().isTouch || oController.getView().isCombi ? 10 : 3,
                    isLayoutEngine: true,
                    disabledDraggableSelector: "sapUshellLockedTile",
                    onDragStartUIHandler: this._markDisableGroups.bind(this),
                    onDragEndUIHandler: this._endUIHandler.bind(this),
                    offsetLeft: bRightToLeft ? iPageWidth : -iPageWidth,
                    defaultMouseMoveHandler: function () { }
                },
                oGroupUIActionsData = {
                    draggableSelector: ".sapUshellDashboardGroupsContainerItem:not(.sapUshellDisableDragAndDrop)",
                    draggableSelectorBlocker: ".sapUshellTilesContainer-sortable, .sapUshellTileContainerBeforeContent, .sapUshellTileContainerAfterContent",
                    draggableSelectorExclude: ".sapUshellHeaderActionButton",
                    placeHolderClass: "sapUshellDashboardGroupsContainerItem-placeholder",
                    cloneClass: "sapUshellDashboardGroupsContainerItem-clone",
                    startCallback: this._handleGroupsUIStart.bind(this),
                    endCallback: this._handleGroupDrop.bind(this),
                    dragCallback: this._handleGroupStartDrag.bind(this),
                    moveTolerance: oController.getView().isTouch || oController.getView().isCombi ? 10 : 0.1,
                    isLayoutEngine: false,
                    isVerticalDragOnly: true,
                    draggableElement: ".sapUshellTileContainerHeader"
                };

            // Creating the sap.ushell.UIActions objects for tiles and groups
            if (oController.getView().oDashboardGroupsBox.getGroups().length) {
                if (oController.getView().getModel().getProperty("/personalization")) {
                    sap.ui.require(["sap/ushell/UIActions"], function (UIActions) {
                        sap.ushell.Container.getServiceAsync("LaunchPage").then(function (oLaunchPageService) {
                            // Disable the previous instances of UIActions
                            this._disableTileUIActions();
                            this._disableGroupUIActions();
                            this._disableLinkUIActions();

                            // Create and enable tiles UIActions
                            this.oTileUIActions = new UIActions(deepExtend({}, oCommonUIActionsData, oTileUIActionsData)).enable();
                            // Create groups UIActions, enabling happens according to ActionMode
                            this.oGroupUIActions = new UIActions(deepExtend({}, oCommonUIActionsData, oGroupUIActionsData));

                            if (oLaunchPageService.isLinkPersonalizationSupported()) {
                                this.oLinkUIActions = new UIActions(deepExtend({}, oCommonUIActionsData, oLinkUIActionsData)).enable();
                            }

                            bActionModeActive = oController.getView().getModel().getProperty("/tileActionModeActive");
                            if (bActionModeActive) {
                                this.oGroupUIActions.enable();
                            }
                        }.bind(this));
                    }.bind(this));
                }
            }
        },

        _enableGroupUIActions: function () {
            if (this.oGroupUIActions) {
                this.oGroupUIActions.enable();
            }
        },

        disableAllDashboardUiAction: function () {
            this._disableTileUIActions();
            this._disableLinkUIActions();
            this._disableGroupUIActions();

        },

        _disableTileUIActions: function () {
            if (this.oTileUIActions) {
                this.oTileUIActions.disable();
            }
        },

        _disableLinkUIActions: function () {
            if (this.oLinkUIActions) {
                this.oLinkUIActions.disable();
            }
        },

        _disableGroupUIActions: function () {
            if (this.oGroupUIActions) {
                this.oGroupUIActions.disable();
            }
        },

        // ****************************************************************************************
        // *************************** Tile UIActions functions - Begin ***************************

        _handleTileDragMove: function (cfg) {
            if (!cfg.isScrolling) {
                Layout.getLayoutEngine().moveDraggable(cfg.moveX, cfg.moveY, this.aTabBarItemsLocation);
            }
        },

        _handleTileDragAndScrollContinuation: function (moveY) {
            var oAnchorBarOffset = jQuery("#anchorNavigationBar").offset(),
                iAnchorBarOffsetTop = oAnchorBarOffset ? oAnchorBarOffset.top : 0;

            if (moveY < iAnchorBarOffsetTop) {
                Layout.getLayoutEngine()._cancelLongDropTimmer();
            }
            return Layout.getLayoutEngine()._isTabBarCollision(moveY);
        },

        _fillTabBarItemsArray: function () {
            var aItemElements = document.getElementsByClassName("sapUshellAnchorItem");
            var index;
            var iBasicWidthUnit = 10;
            var iTempIndex = 0;
            var iTempIndex_;
            var aTabBarItemsBasic = [];

            for (index = 0; index < aItemElements.length; index++) {
                var oItem = aItemElements[index];
                var oItemMeasures = oItem.getBoundingClientRect();

                aTabBarItemsBasic[index] = oItemMeasures.width;
            }
            for (index = 0; index < aItemElements.length; index++) {
                var oItemWidth = aTabBarItemsBasic[index];
                if (oItemWidth === 0) {
                    continue;
                }
                var iNumOfBasicUnits = Math.round(oItemWidth / iBasicWidthUnit);
                for (iTempIndex_ = iTempIndex; iTempIndex_ < iTempIndex + iNumOfBasicUnits; iTempIndex_++) {
                    this.aTabBarItemsLocation[iTempIndex_] = index;
                }
                iTempIndex = iTempIndex_;
            }
        },

        _preventTextSelection: function () {
            //Prevent selection of text on tiles and groups
            if (window.getSelection) {
                var selection = window.getSelection();
                // fix IE9 issue (CSS 1580181391)
                try {
                    selection.removeAllRanges();
                } catch (e) {
                    // continue regardless of error
                }
            }
        },

        /**
         *
         * @param ui : tile DOM reference
         * @private
         */
        _handleStartDragTile: function (evt, tileElement) {
            this._preventTextSelection();

            Layout.getLayoutEngine().layoutStartCallback(tileElement);
            Layout.initDragMode();

            // Prevent the tile to be launched after drop
            var aLinkElements = tileElement.querySelectorAll("a");
            for (var i = 0; i < aLinkElements.length; i++) {
                aLinkElements[i].removeAttribute("href");
            }
            this.oController._handleDrag.call(this.oController, evt, tileElement);
            sap.ui.getCore().getEventBus().publish("launchpad", "sortableStart");
        },

        _onBeforeCreateLinkClone: function (evt, LinkElement) {
            //we need to save the link bounding rects before uiactions.js create a clone because after it oLink.getBoundingRects will return zero offsets
            Layout.getLayoutEngine().saveLinkBoundingRects(LinkElement);
        },

        _handleLinkDrop: function (evt, tileElement, oAdditionalParams) {
            var deferred = jQuery.Deferred(),
                oPromise;

            if (Layout.isTabBarActive()) {
                Layout.tabBarTileDropped();
            }

            if (oAdditionalParams && oAdditionalParams.clone) {
                jQuery(oAdditionalParams.clone).css({
                    opacity: 0
                });
            }

            if (Device.desktop) {
                document.body.classList.remove("sapUshellDisableUserSelect"); // check if we need this
            }
            if (Layout.getLayoutEngine().isLinkIntersected() || Layout.getLayoutEngine().isOriginalAreaChanged()) {
                oPromise = this.oController._handleDrop.call(this.oController, evt, tileElement);
            }

            if (oPromise) {
                oPromise.then(function () {
                    var oDashboardGroupsElement = document.getElementById("dashboardGroups");
                    var aHiddenPlusTileElements = oDashboardGroupsElement && oDashboardGroupsElement.getElementsByClassName("sapUshellHidePlusTile");
                    for (var i = 0; i < aHiddenPlusTileElements.length; i++) {
                        aHiddenPlusTileElements[i].classList.remove("sapUshellHidePlusTile");
                    }
                    setTimeout(function () {
                        deferred.resolve();
                    }, 0);
                });
            } else {
                setTimeout(function () {
                    deferred.resolve();
                }, 0);
            }

            return deferred.promise();
        },

        /**
         *
         * @param ui : tile DOM reference
         * @private
         */
        _handleTileDrop: function (evt, tileElement, oAdditionalParams) {
            if (Layout.getLayoutEngine().isOriginalAreaChanged()) {
                return this._handleTileToLinkDrop(evt, tileElement, oAdditionalParams);
            }
            return this._handleTileToTileDrop(evt, tileElement, oAdditionalParams);
        },

        _handleTileToLinkDrop: function (evt, tileElement, oAdditionalParams) {
            return this._handleLinkDrop(evt, tileElement, oAdditionalParams);
        },

        _handleTileToTileDrop: function (evt, tileElement, oAdditionalParams) {
            var $Clone;
            var oHoveredTabBarItem;
            var oTabBarDraggedTile;

            var handleTileDropInternal = function (evt, tileElement) {
                Layout.endDragMode();
                var oDashboardGroupsElement = document.getElementById("dashboardGroups");
                var aHiddenPlusTileElements = oDashboardGroupsElement && oDashboardGroupsElement.getElementsByClassName("sapUshellHidePlusTile");
                for (var i = 0; i < aHiddenPlusTileElements.length; i++) {
                    aHiddenPlusTileElements[i].classList.remove("sapUshellHidePlusTile");
                }
                this.oController._handleDrop(this.oController, evt, tileElement);
                if (Device.desktop) {
                    document.body.classList.remove("sapUshellDisableUserSelect");
                }
            };

            oHoveredTabBarItem = jQuery(".sapUshellTabBarHoverOn");
            oHoveredTabBarItem.removeClass("sapUshellTabBarHoverOn");

            oTabBarDraggedTile = jQuery(".sapUshellTileDragOpacity");
            oTabBarDraggedTile.removeClass("sapUshellTileDragOpacity");

            if (Layout.isTabBarActive()) {
                Layout.tabBarTileDropped();
            }

            // In tab bar mode, when the tile is dropped on an anchor tab bar item.
            // In this case the tile should not flow back to the source group
            var oDeferred;
            if (Layout.isTabBarActive() && Layout.isOnTabBarElement()) {
                if (oAdditionalParams && oAdditionalParams.clone) {
                    oDeferred = jQuery.Deferred();
                    $Clone = jQuery(oAdditionalParams.clone);
                    $Clone.css("display", "none");
                    setTimeout(function () {
                        oDeferred.resolve();
                        handleTileDropInternal.call(this, evt, tileElement);
                    }.bind(this), 0);
                    return oDeferred.promise();
                }
                handleTileDropInternal.apply(this, arguments);
            }

            if (oAdditionalParams && oAdditionalParams.clone) {
                oDeferred = jQuery.Deferred();
                $Clone = jQuery(oAdditionalParams.clone);
                setTimeout(function () {
                    oDeferred.resolve();
                    handleTileDropInternal.call(this, evt, tileElement);
                }.bind(this), 0);
                return oDeferred.promise();
            }

            setTimeout(function () {
                handleTileDropInternal.call(this, evt, tileElement);
            }.bind(this), 0);
        },

        _getTileTopOffset: function (oTile, position, dashboardScrollTop) {
            var i = 0,
                iTileTopOffset = i + dashboardScrollTop;

            iTileTopOffset += oTile.closest(".sapUshellDashboardGroupsContainerItem").position().top;
            iTileTopOffset += position.top;
            return iTileTopOffset;
        },

        //During drag action, locked groups should be mark with a locked icon and group opacity should be changed to grayish
        _markDisableGroups: function () {
            if (this.oController.getView().getModel()) {
                this.oController.getView().getModel().setProperty("/isInDrag", true);
            }
        },

        //once d&d ends, restore locked groups appearance and remove locked icons and grayscale
        _endUIHandler: function () {
            Layout.endDragMode();

            if (this.oController.getView().getModel()) {
                this.oController.getView().getModel().setProperty("/isInDrag", false);
            }
        },

        // **************************** Tile UIActions functions - End ****************************
        // ****************************************************************************************
        // *************************** Group UIActions functions - Begin **************************

        _handleGroupStartDrag: function (evt, ui) {
            this.oTileUIActions.disable();
            if (this.oLinkUIActions) {
                this.oLinkUIActions.disable();
            }
            var groupContainerClone = jQuery(".sapUshellDashboardGroupsContainerItem-clone"),
                groupContainerCloneTitle = groupContainerClone.find(".sapUshellContainerTitle"),
                titleHeight = groupContainerCloneTitle.height(),
                titleWidth = groupContainerCloneTitle.width(),
                groupsTop,
                groupPlaceholder,
                groupClone,
                scrollY,
                bRightToLeft = Configuration.getRTL();

            if (!Device.system.phone) {
                groupContainerClone.find(".sapUshellTileContainerEditMode").offset({
                    top: this.oGroupUIActions.getMove().y - titleHeight,
                    left: bRightToLeft ? jQuery("#sapUshellDashboardPage").width() + this.oGroupUIActions.getMove().x + titleWidth :
                        this.oGroupUIActions.getMove().x - (titleWidth / 2)
                });
                jQuery(".sapUshellTileContainerBeforeContent").addClass("sapUshellTileContainerHidden");
            } else {
                jQuery(".sapUshellTilesContainer-sortable").addClass("sapUshellTileContainerRemoveContent");
                jQuery(".sapUshellLineModeContainer").addClass("sapUshellTileContainerRemoveContent");
                jQuery(".sapUshellTileContainerBeforeContent").addClass("sapUshellTileContainerRemoveContent");
                jQuery(".sapUshellContainerHeaderActions").addClass("sapUshellTileContainerHidden");
            }
            jQuery(".sapUshellTileContainerAfterContent").addClass("sapUshellTileContainerRemoveContent");
            jQuery(ui).find(".sapUshellContainerHeaderActions").addClass("sapUshellTileContainerHidden");

            this.oController.getView().getModel().setProperty("/isInDrag", true);
            jQuery(ui).attr("startPos", jQuery(ui).index());

            Log.info("startPos - " + jQuery(ui).index());
            setTimeout(function () {
                sap.ui.getCore().getEventBus().publish("launchpad", "sortableStart");
            }, 0);

            //scroll to group
            groupsTop = jQuery("#dashboardGroups").offset().top;
            groupPlaceholder = jQuery(".sapUshellDashboardGroupsContainerItem-placeholder").offset().top;
            groupClone = jQuery(".sapUshellDashboardGroupsContainerItem-clone").offset().top;
            scrollY = groupPlaceholder - groupsTop - groupClone;
            jQuery(".sapUshellDashboardView section").css({ scrollTop: scrollY });
        },

        _handleGroupsUIStart: function (evt, ui) {
            jQuery(ui).find(".sapUshellTileContainerContent").css("outline-color", "transparent");
        },

        _handleGroupDrop: function (evt, ui) {
            var oBus = sap.ui.getCore().getEventBus(),
                jQueryObj = jQuery(ui),
                firstChildId = jQuery(jQueryObj.children()[0]).attr("id"),
                oGroup = sap.ui.getCore().byId(firstChildId),
                oDashboardGroups = sap.ui.getCore().byId("dashboardGroups"),
                oData = { group: oGroup, groupChanged: false, focus: false },
                nNewIndex = jQueryObj.index();

            jQueryObj.startPos = window.parseInt(jQueryObj.attr("startPos"), 10);
            oDashboardGroups.removeAggregation("groups", oGroup, true);
            oDashboardGroups.insertAggregation("groups", oGroup, nNewIndex, true);

            this._handleGroupMoved(evt, { item: jQueryObj });
            jQueryObj.removeAttr("startPos");
            sap.ui.getCore().getEventBus().publish("launchpad", "sortableStop");

            // avoid tile to be clicked after group was dropped
            setTimeout(function () {
                jQuery(".sapUshellContainerHeaderActions").removeClass("sapUshellTileContainerHidden");
                jQuery(".sapUshellTileContainerBeforeContent").removeClass("sapUshellTileContainerHidden");
                jQuery(".sapUshellTileContainerBeforeContent").removeClass("sapUshellTileContainerRemoveContent");
                jQuery(".sapUshellTileContainerAfterContent").removeClass("sapUshellTileContainerRemoveContent");
                jQuery(".sapUshellTilesContainer-sortable").removeClass("sapUshellTileContainerRemoveContent");
                jQuery(".sapUshellLineModeContainer").removeClass("sapUshellTileContainerRemoveContent");
            }, 0);

            window.setTimeout(jQuery.proxy(oBus.publish, oBus, "launchpad", "scrollToGroup", oData), 1);
            this.oTileUIActions.enable();
            if (this.oLinkUIActions) {
                this.oLinkUIActions.enable();
            }
        },

        _handleGroupMoved: function (evt, ui) {
            var fromIndex = ui.item.startPos,
                toIndex = ui.item.index(),
                oModel = this.oController.getView().getModel();

            if (toIndex !== -1) {
                this.oController._publishAsync("launchpad", "moveGroup", {
                    fromIndex: fromIndex,
                    toIndex: toIndex
                });
                setTimeout(function () {
                    oModel.setProperty("/isInDrag", false);
                }, 100);
            }
        },

        // **************************** Group UIActions functions - End ****************************
        // *****************************************************************************************

        _setController: function (oController) {
            this.oController = oController;
        }
    });

    return DashboardUIActions;
});
