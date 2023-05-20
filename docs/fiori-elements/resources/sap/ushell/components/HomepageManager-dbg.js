// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ui/core/Core",
    "sap/ui/base/Object",
    "sap/ui/Device",
    "sap/ui/model/Filter",
    "sap/ushell/ui/launchpad/TileState",
    "sap/ushell/components/_HomepageManager/PagingManager",
    "sap/ushell/components/_HomepageManager/DashboardLoadingManager",
    "sap/ushell/EventHub",
    "sap/ushell/Config",
    "sap/ushell/utils",
    "sap/ushell/resources",
    "sap/ushell/components/DestroyHelper",
    "sap/ushell/components/GroupsHelper",
    "sap/ushell/components/MessagingHelper",
    "sap/m/GenericTile",
    "sap/m/SelectDialog",
    "sap/m/StandardListItem",
    "sap/ushell/components/_HomepageManager/PersistentPageOperationAdapter",
    "sap/ushell/components/_HomepageManager/TransientPageOperationAdapter",
    "sap/ui/model/FilterOperator",
    "sap/m/library",
    "sap/ui/model/Context",
    "sap/m/MessageToast",
    "sap/base/Log",
    "sap/base/util/extend",
    "sap/ui/performance/Measurement",
    "sap/ushell/Config"
], function (
    jQuery,
    Core,
    BaseObject,
    Device,
    Filter,
    TileState,
    PagingManager,
    DashboardLoadingManager,
    oEventHub,
    oShellConfig,
    oUtils,
    oResources,
    oDestroyHelper,
    oGroupsHelper,
    oMessagingHelper,
    GenericTile,
    SelectDialog,
    StandardListItem,
    PersistentPageOperationAdapter,
    TransientPageOperationAdapter,
    FilterOperator,
    mobileLibrary,
    Context,
    MessageToast,
    Log,
    extend,
    Measurement,
    Config
) {
    "use strict";

    // shortcut for sap.m.GenericTileScope
    var GenericTileScope = mobileLibrary.GenericTileScope;

    var analyticsConstants = {
        PERSONALIZATION: "FLP: Personalization",
        RENAME_GROUP: "FLP: Rename Group",
        MOVE_GROUP: "FLP: Move Group",
        DELETE_GROUP: "FLP: Delete Group",
        RESET_GROUP: "FLP: Reset Group",
        DELETE_TILE: "FLP: Delete Tile",
        ADD_TILE: "FLP: Add Tile",
        MOVE_TILE: "FLP: Move Tile"
    };

    var aDoables = [];

    var oHomepageManagerInstance;
    var oHomepageManager = BaseObject.extend("sap.ushell.components.HomepageManager", {
        metadata: {
            publicMethods: [
                "getModel",
                "getDashboardView",
                "loadPersonalizedGroups",
                "resetGroupsOnFailure",
                "addGroupToModel",
                "addTileToGroup",
                "deleteTilesFromGroup"
            ]
        },
        analyticsConstants: analyticsConstants, // for usage in qUnits

        constructor: function (sId, mSettings) {
            // make this class only available once
            if (oHomepageManagerInstance) {
                if (!oHomepageManagerInstance.view) {
                    oHomepageManagerInstance.setDashboardView(mSettings.view);
                }
                return oHomepageManagerInstance;
            }

            this.oServiceLoadingPromise = sap.ushell.Container.getServiceAsync("LaunchPage")
                .then(function (oLaunchPageService) {
                    this.oPageBuilderService = oLaunchPageService;
                    // add Remove action for all tiles
                    this.oPageBuilderService.registerTileActionsProvider(this._addFLPActionsToTile.bind(this));
                    this.oPageOperationAdapter = PersistentPageOperationAdapter.getInstance(oLaunchPageService);
                    this.bLinkPersonalizationSupported = this.oPageOperationAdapter.isLinkPersonalizationSupported();
                }.bind(this));

            // when the core theme changes, it's required to calculate again, which tiles are visible. In case of
            // dynamic tiles, a request should be triggered. In some cases it can happen, that the tile visibility
            // is calculated before the initial theme is applied. Also these cases are covered, when we react to the theme changed event.
            Core.attachThemeChanged(oUtils.handleTilesVisibility);

            // eslint-disable-next-line consistent-this
            oHomepageManagerInstance = this;

            this.oModel = mSettings.model;
            this.oRouter = mSettings.router;
            this.oDashboardView = mSettings.view;
            this.oSortableDeferred = new jQuery.Deferred();
            this.oSortableDeferred.resolve();
            this.registerEvents();
            this.tileViewUpdateQueue = [];
            this.tileViewUpdateTimeoutID = 0;
            this.tileUuid = null;
            this.bIsGroupsModelLoading = false;
            this.bIsGroupsRequestPending = false;
            this.segmentsStore = [];
            this.bIsFirstSegment = true;
            this.bIsFirstSegmentViewLoaded = false;
            this.aGroupsFrame = null;
            this.iMinNumOfTilesForBlindLoading = this.oModel.getProperty("/optimizeTileLoadingThreshold") || 100;
            this.bIsScrollModeAccordingKPI = false;
            this.oGroupNotLockedFilter = new Filter("isGroupLocked", FilterOperator.EQ, false);
            this.oDashboardLoadingManager = new DashboardLoadingManager("loadingManager", {
                oDashboardManager: this
            });
            // get 'home' view from the router
            if (this.oRouter) {
                var oTarget = this.oRouter.getTarget("home");
                oTarget.attachDisplay(function (oEvent) {
                    this.oDashboardView = oEvent.getParameter("view");
                }.bind(this));
            }
            // Workaround:
            // Event hub emits event when we register. It emits value 'false' and without the workaround it would trigger
            // loading of the content again. So we keep the value when we register.

            var bEnableTransientMode = oShellConfig.last("/core/home/enableTransientMode");
            aDoables.push(oShellConfig.on("/core/home/enableTransientMode").do(
                function (bNewEnableTransientMode) {
                    if (bEnableTransientMode === bNewEnableTransientMode) {
                        return;
                    }
                    bEnableTransientMode = bNewEnableTransientMode;
                    this._changeMode(bNewEnableTransientMode);
                }.bind(this)
            ));

            this.oModel.bindProperty("/tileActionModeActive").attachChange(this._changeLinksScope.bind(this));

            this._aRequestQueue = [];
            this._bRequestRunning = false;

            return undefined;
        },

        _addRequest: function (fRequest) {
            this._aRequestQueue.push(fRequest);
            if (!this._bRequestRunning) {
                this._bRequestRunning = true;
                this._aRequestQueue.shift()();
            }
        },

        _checkRequestQueue: function () {
            if (this._aRequestQueue.length === 0) {
                this._bRequestRunning = false;
            } else {
                this._aRequestQueue.shift()();
            }
        },

        _requestFailed: function () {
            this._aRequestQueue = [];
            this._bRequestRunning = false;
        },

        isBlindLoading: function () {
            var homePageGroupDisplay = oShellConfig.last("/core/home/homePageGroupDisplay");
            if ((homePageGroupDisplay === undefined || homePageGroupDisplay === "scroll") && this.bIsScrollModeAccordingKPI) {
                Log.info("isBlindLoading reason IsScrollModeAccordingKPI and IsScrollMode: true");
                return true;
            }
            if (this.oModel.getProperty("/tileActionModeActive")) {
                Log.info("isBlindLoading reason TileActionModeActive : true");
                return true;
            }
            return false;
        },

        createMoveActionDialog: function (sId) {
            var oMoveDialog = new SelectDialog(sId, {
                title: oResources.i18n.getText("moveTileDialog_title"),
                rememberSelections: false,
                // search: a search handler is attached by the calling function
                contentWidth: "400px",
                contentHeight: "auto",
                confirm: function (oEvent) {
                    var aContexts = oEvent.getParameter("selectedContexts");
                    this.publishMoveActionEvents(aContexts, sId);
                }.bind(this),
                cancel: function () {
                    var oCurrentlyFocusedTile = document.querySelector(".sapUshellTile[tabindex=\"0\"]");
                    if (oCurrentlyFocusedTile) {
                        oCurrentlyFocusedTile.focus();
                    }
                },
                items: {
                    path: "/groups",
                    // filters: filtering is done by the calling function
                    template: new StandardListItem({
                        title: "{title}"
                    })
                }
            });
            return oMoveDialog;
        },

        publishMoveActionEvents: function (aContexts, sSource) {
            var oEventBus = Core.getEventBus();
            if (aContexts.length) {
                var stileType = this.tileType === "link" ? "links" : "tiles";
                var sGroupId = aContexts[0].getObject().groupId;
                var oEventData = {
                    sTileId: this.tileUuid,
                    sToItems: stileType,
                    sFromItems: stileType,
                    sTileType: stileType,
                    toGroupId: aContexts[0].getObject().groupId,
                    toIndex: aContexts[0].getObject()[this.tileType === "link" ? "links" : "tiles"].length,
                    source: sSource
                };

                if (Device.system.desktop) {
                    sap.ui.require(["sap/ushell/components/ComponentKeysHandler"], function (ComponentKeysHandler) {
                        ComponentKeysHandler.getInstance().then(function (ComponentKeysHandlerInstance) {
                            oEventData.callBack = ComponentKeysHandlerInstance.callbackSetFocus.bind(ComponentKeysHandlerInstance);
                            oEventBus.publish("launchpad", "scrollToGroup", { groupId: sGroupId });
                            oEventBus.publish("launchpad", "movetile", oEventData);
                        });
                    });
                } else {
                    oEventBus.publish("launchpad", "scrollToGroup", { groupId: sGroupId });
                    oEventBus.publish("launchpad", "movetile", oEventData);
                }
            }
        },

        _changeLinksScope: function (oEvent) {
            var that = this;
            if (this.bLinkPersonalizationSupported) {
                var bIsTileActionModeActive = oEvent.getSource().getValue();
                this.oModel.getProperty("/groups").forEach(function (oGroup, index) {
                    if (!oGroup.isGroupLocked) {
                        that._changeGroupLinksScope(oGroup, bIsTileActionModeActive ? "Actions" : "Display");
                    }
                });
            }
        },

        _changeGroupLinksScope: function (oGroup, scope) {
            var that = this;

            oGroup.links.forEach(function (oLink, index) {
                that._changeLinkScope(oLink.content[0], scope);
            });
        },

        _changeLinkScope: function (oLink, scope) {
            var oLinkView;
            if (oLink.getScope) {
                oLinkView = oLink;
            } else if (oLink.getContent) { // hack for demo content
                oLinkView = oLink.getContent()[0];
            }

            // if LinkPersonalization is supported by platform, then the link must support personalization
            if (this.bLinkPersonalizationSupported && oLinkView && oLinkView.setScope) {
                oLinkView.setScope(scope);
            }
        },

        registerEvents: function () {
            var oEventBus = Core.getEventBus();
            oEventBus.subscribe("launchpad", "addBookmarkTile", this._createBookmark, this);
            oEventBus.subscribe("launchpad", "tabSelected", this.getSegmentTabContentViews, this);
            oEventBus.subscribe("sap.ushell.services.Bookmark", "bookmarkTileAdded", this._addBookmarkToModel, this);
            oEventBus.subscribe("sap.ushell.services.Bookmark", "catalogTileAdded", this._refreshGroupInModel, this);
            oEventBus.subscribe("sap.ushell.services.Bookmark", "bookmarkTileDeleted", this.loadPersonalizedGroups, this);
            oEventBus.subscribe("launchpad", "loadDashboardGroups", this.loadPersonalizedGroups, this);
            oEventBus.subscribe("launchpad", "createGroupAt", this._createGroupAt, this);
            oEventBus.subscribe("launchpad", "deleteGroup", this._deleteGroup, this);
            oEventBus.subscribe("launchpad", "resetGroup", this._resetGroup, this);
            oEventBus.subscribe("launchpad", "changeGroupTitle", this._changeGroupTitle, this);
            oEventBus.subscribe("launchpad", "moveGroup", this._moveGroup, this);
            oEventBus.subscribe("launchpad", "deleteTile", this._deleteTile, this);
            oEventBus.subscribe("launchpad", "movetile", this._moveTile, this);
            oEventBus.subscribe("launchpad", "sortableStart", this._sortableStart, this);
            oEventBus.subscribe("launchpad", "sortableStop", this._sortableStop, this);
            oEventBus.subscribe("launchpad", "dashboardModelContentLoaded", this._modelLoaded, this);
            oEventBus.subscribe("launchpad", "convertTile", this._convertTile, this);
        },

        _changeMode: function (bTransientMode) {
            var aGroups = this.getModel().getProperty("/groups");
            if (bTransientMode) {
                this.oPageOperationAdapter = TransientPageOperationAdapter.getInstance();
                // remove all references to server object
                var aTransformedGroupModel = this.oPageOperationAdapter.transformGroupModel(aGroups);
                this.getModel().setProperty("/groups", aTransformedGroupModel);
            } else {
                this.oPageOperationAdapter = PersistentPageOperationAdapter.getInstance();
                oDestroyHelper.destroyFLPAggregationModels(aGroups);
                // reset group model
                this.getModel().setProperty("/groups", []);
                this.loadPersonalizedGroups();
            }
        },

        _addFLPActionsToTile: function (oTile) {
            var aActions = [];
            if (oShellConfig.last("/core/shell/enablePersonalization")) {
                var bLinkPersonalizationSupportedForTile = this.bLinkPersonalizationSupported
                    && this.oPageOperationAdapter.isLinkPersonalizationSupported(oTile);
                aActions.push(this._getMoveTileAction(oTile));

                if (bLinkPersonalizationSupportedForTile) {
                    aActions.push(this._getConvertTileAction(oTile));
                }
            }
            return aActions;
        },

        /**
         * @returns {object[]} Returns the personalizable Groups
         * @private
         * @since 1.107.0
         */
        getPersonalizableGroups: function () {
            var aGroups = this.getModel().getProperty("/groups");
            return aGroups.filter(function (oGroup) {
                return !oGroup.isGroupLocked;
            });
        },

        _getConvertTileAction: function (oTile) {
            var oEventBus = Core.getEventBus();
            var sTileType = this.oPageOperationAdapter.getTileType(oTile);
            var sKey = ((sTileType === "tile") ? "ConvertToLink" : "ConvertToTile");
            return {
                id: sKey,
                text: oResources.i18n.getText(sKey),
                press: function (oSourceTile) {
                    var oConvertInfo = { tile: oSourceTile };

                    if (Device.system.desktop) {
                        sap.ui.require(["sap/ushell/components/ComponentKeysHandler"], function (ComponentKeysHandler) {
                            ComponentKeysHandler.getInstance().then(function (ComponentKeysHandlerInstance) {
                                oConvertInfo.callBack = ComponentKeysHandlerInstance.callbackSetFocus.bind(ComponentKeysHandlerInstance);
                                oEventBus.publish("launchpad", "convertTile", oConvertInfo);
                            });
                        });
                    } else {
                        oEventBus.publish("launchpad", "convertTile", oConvertInfo);
                    }
                }
            };
        },

        _getMoveTileAction: function (oTile) {
            var sKey = "moveTile_action";
            return {
                id: sKey,
                text: oResources.i18n.getText(sKey),
                press: function (oPressedTile) {
                    this.tileType = this.oPageOperationAdapter.getTileType(oTile);
                    var bIsTile = (this.tileType === "tile");
                    this.tileUuid = this.getModelTileById(this.oPageOperationAdapter.getTileId(oTile), (bIsTile ? "tiles" : "links")).uuid;
                    var sGroupId = oPressedTile.getParent().getProperty("groupId");
                    var oSameGroupFilter = new Filter("groupId", FilterOperator.NE, sGroupId);
                    var fnSearchHandler = function (oEvent) {
                        var sValue = oEvent.getParameter("value");
                        var oFilter = new Filter("title", FilterOperator.Contains, sValue);
                        var oBinding = oEvent.getSource().getBinding("items");
                        oBinding.filter([oFilter, this.oGroupNotLockedFilter, oSameGroupFilter]);
                    }.bind(this);

                    var oMoveDialog = (bIsTile ? this.moveTileDialog : this.moveLinkDialog);
                    if (!oMoveDialog) {
                        oMoveDialog = this.createMoveActionDialog("move" + this.tileType + "Dialog");
                        oMoveDialog.setModel(this.oModel);
                        if (bIsTile) {
                            this.moveTileDialog = oMoveDialog;
                        } else {
                            this.moveLinkDialog = oMoveDialog;
                        }
                    } else {
                        oMoveDialog.detachSearch(oMoveDialog._searchHandler);
                    }
                    oMoveDialog.getBinding("items").filter([this.oGroupNotLockedFilter, oSameGroupFilter]);
                    oMoveDialog.attachSearch(fnSearchHandler);
                    oMoveDialog._searchHandler = fnSearchHandler;
                    oMoveDialog.open();
                }.bind(this)
            };
        },

        _handleTileAppearanceAnimation: function (oSourceTile) {
            if (!oSourceTile) {
                return;
            }
            var pfx = ["webkit", ""];
            function prefixedEvent (element, type) {
                for (var i = 0; i < pfx.length; i++) {
                    type = type.toLowerCase();
                    oSourceTile.attachBrowserEvent(pfx[i] + type, function (oEvent) {
                        if (oEvent.originalEvent && oEvent.originalEvent.animationName === "sapUshellTileEntranceAnimation") {
                            oSourceTile.removeStyleClass("sapUshellTileEntrance");
                        }
                    }, false);
                }
            }
            prefixedEvent(oSourceTile, "AnimationEnd");
            oSourceTile.addStyleClass("sapUshellTileEntrance");
        },

        destroy: function () {
            var oEventBus = Core.getEventBus();
            oEventBus.unsubscribe("launchpad", "addBookmarkTile", this._createBookmark, this);
            oEventBus.unsubscribe("launchpad", "loadDashboardGroups", this.loadPersonalizedGroups, this);
            oEventBus.unsubscribe("launchpad", "createGroupAt", this._createGroupAt, this);
            oEventBus.unsubscribe("launchpad", "deleteGroup", this._deleteGroup, this);
            oEventBus.unsubscribe("launchpad", "resetGroup", this._resetGroup, this);
            oEventBus.unsubscribe("launchpad", "changeGroupTitle", this._changeGroupTitle, this);
            oEventBus.unsubscribe("launchpad", "moveGroup", this._moveGroup, this);
            oEventBus.unsubscribe("launchpad", "deleteTile", this._deleteTile, this);
            oEventBus.unsubscribe("launchpad", "movetile", this._moveTile, this);
            oEventBus.unsubscribe("launchpad", "sortableStart", this._sortableStart, this);
            oEventBus.unsubscribe("launchpad", "sortableStop", this._sortableStop, this);
            oEventBus.unsubscribe("launchpad", "dashboardModelContentLoaded", this._modelLoaded, this);
            Core.detachThemeChanged(oUtils.handleTilesVisibility);

            aDoables.forEach(function (oDoable) {
                oDoable.off();
            });

            PersistentPageOperationAdapter.destroy();
            TransientPageOperationAdapter.destroy();

            oHomepageManagerInstance = undefined;
            BaseObject.prototype.destroy.apply(this, arguments);
        },

        _sortableStart: function () {
            this.oSortableDeferred = new jQuery.Deferred();
        },

        _createBookmark: function (sChannelId, sEventId, oData) {
            var tileGroup = oData.group ? oData.group.object : "";

            delete oData.group;

            function addBookmark () {
                sap.ushell.Container.getServiceAsync("Bookmark").then(function (oBookmarkService) {
                    oBookmarkService.addBookmark(oData, tileGroup)
                        .always(this._checkRequestQueue.bind(this))
                        .done(function () {
                            // the tile is added to our model in "_addBookmarkToModel" here we just show the success toast.
                            oMessagingHelper.showLocalizedMessage("tile_created_msg");
                        })
                        .fail(function (sMsg) {
                            Log.error(
                                "Failed to add bookmark",
                                sMsg,
                                "sap.ushell.ui.footerbar.AddBookmarkButton"
                            );
                            oMessagingHelper.showLocalizedError("fail_to_add_tile_msg");
                        });
                }.bind(this));
            }

            this._addRequest(addBookmark.bind(this));
        },

        /*
         * Add a bookmark to a dashboard group.
         * If no group is specified then the bookmark is added to the default group.
         * This function will be called also if an application used the bookmark service directly to add a bookmark.
         * the bookmark service publishes an event so that we will be able to update the model.
         * This method doesn't display a success toast since the application should show success or failure messages
         */
        _addBookmarkToModel: function (sChannelId, sEventId, oData) {
            var oTile = oData.tile;
            var oGroup = oData.group;

            if (!oData || !oTile) {
                this.bIsGroupsModelDirty = true;
                if (!this.bGroupsModelLoadingInProcess) {
                    this._handleBookmarkModelUpdate();
                }
                return;
            }

            // If no group was specified then the target group is the default one.
            if (!oGroup) {
                var aGroups = this.getModel().getProperty("/groups");
                for (var iIndex = 0; iIndex < aGroups.length; iIndex++) {
                    if (aGroups[iIndex].isDefaultGroup === true) {
                        oGroup = aGroups[iIndex].object;
                        break;
                    }
                }
            }

            // The create bookmark popup should not contain the locked groups anyway,
            // so this call not suppose to happen for a target locked group (we may as well always send false)
            var indexOfGroup = this._getIndexOfGroupByObject(oGroup);
            var targetGroup = this.oModel.getProperty("/groups/" + indexOfGroup);
            var newTile = this.oPageOperationAdapter.getPreparedTileModel(oTile, targetGroup.isGroupLocked);
            this.getTileView(newTile);

            // The function calcVisibilityModes requires the group from the model
            targetGroup.tiles.push(newTile);
            targetGroup.visibilityModes = oUtils.calcVisibilityModes(targetGroup, true);
            var iNumTiles = targetGroup.tiles.length;
            this._updateModelWithTileView(indexOfGroup, iNumTiles);

            this.oModel.setProperty("/groups/" + indexOfGroup, targetGroup);
        },

        _refreshGroupInModel: function (sChannelId, sEventId, sGroupId) {
            var that = this;

            this.oPageOperationAdapter.refreshGroup(sGroupId).then(
                function (oGroupModel) {
                    if (!oGroupModel) {
                        return;
                    }
                    var indexOfGroup = that._getIndexOfGroupByObject(oGroupModel.object);

                    oGroupModel.visibilityModes = oUtils.calcVisibilityModes(oGroupModel.object, true);
                    that.oModel.setProperty("/groups/" + indexOfGroup, oGroupModel);

                    // The old group tiles are lost, get the tile views
                    if (oGroupModel.tiles) {
                        oGroupModel.tiles.forEach(function (tile) {
                            that.getTileView(tile);
                        });
                    }
                }
            );
        },

        _sortableStop: function () {
            this.oSortableDeferred.resolve();
        },

        _handleAfterSortable: function (fFunc) {
            return function () {
                var outerArgs = Array.prototype.slice.call(arguments);
                this.oSortableDeferred.done(function () {
                    fFunc.apply(null, outerArgs);
                });
            }.bind(this);
        },

        /*
         * oData should have the following parameters:
         * title
         * location
         */
        _createGroupAt: function (sChannelId, sEventId, oData) {
            var newGroupIndex = parseInt(oData.location, 10);
            var aGroups = this.oModel.getProperty("/groups");
            var oGroup = this.oPageOperationAdapter.getPreparedGroupModel(null, false, newGroupIndex === aGroups.length, oData);
            var oModel = this.oModel;
            var i;

            oGroup.index = newGroupIndex;

            aGroups.splice(newGroupIndex, 0, oGroup);
            for (i = 0; i < aGroups.length - 1; i++) {
                aGroups[i].isLastGroup = false;
            }

            // set new groups index
            for (i = newGroupIndex + 1; i < aGroups.length; i++) {
                aGroups[i].index++;
            }
            oModel.setProperty("/groups", aGroups);
        },

        _getIndexOfGroupByObject: function (oServerGroupObject) {
            var aGroups = this.oModel.getProperty("/groups");
            return this.oPageOperationAdapter.getIndexOfGroup(aGroups, oServerGroupObject);
        },

        getTileActions: function (oTile) {
            return this.oPageOperationAdapter.getTileActions(oTile);
        },

        addTileToGroup: function (sGroupPath, oTile) {
            var sTilePath = sGroupPath + "/tiles";
            var oGroup = this.oModel.getProperty(sGroupPath);
            var iNumTiles = this.oModel.getProperty(sTilePath).length;

            // Locked groups cannot be added with tiles,
            // so the target group will not be locked, however just for safety we will check the target group locking state
            var isGroupLocked = this.oModel.getProperty(sGroupPath + "/isGroupLocked");
            var personalization = this.oModel.getProperty("/personalization");

            oGroup.tiles[iNumTiles] = this.oPageOperationAdapter.getPreparedTileModel(oTile, isGroupLocked);
            this.getTileView(oGroup.tiles[iNumTiles]);
            oGroup.visibilityModes = oUtils.calcVisibilityModes(oGroup, personalization);
            this._updateModelWithTileView(oGroup.index, iNumTiles);
            this.oModel.setProperty(sGroupPath, oGroup);
        },

        /**
         * Adds the tiles in the array of catalog tile ids to the given group
         *
         * @param {object} oGroup The group to which the tiles are added
         * @param {string[]} aCatalogTileIds Array of catalog tile ids
         */
        addTilesToGroupByCatalogTileId: function (oGroup, aCatalogTileIds) {
            var oGroupContext = oGroup.getBindingContext();

            for (var i = 0; i < aCatalogTileIds.length; i++) {
                this.addTileToGroupByCatalogTileId(oGroupContext.sPath, aCatalogTileIds[i]);
            }
        },

        addTileToGroupByCatalogTileId: function (sGroupPath, sCatalogTileId) {
            if (!oShellConfig.last("/core/home/enableTransientMode")) {
                return;
            }

            var oTileModel = this.oPageOperationAdapter.getTileModelByCatalogTileId(sCatalogTileId);

            if (!oTileModel) {
                return;
            }
            this.oDashboardLoadingManager.setTileResolved(oTileModel);
            var iNumTiles = this.oModel.getProperty(sGroupPath + "/tiles").length;
            var oGroupModel = this.oModel.getProperty(sGroupPath);
            oGroupModel.tiles[iNumTiles] = oTileModel;
            this.oModel.setProperty(sGroupPath, oGroupModel);
        },

        _getPathOfTile: function (sTileId) {
            var aGroups = this.oModel.getProperty("/groups");

            for (var nGroupIndex = 0; nGroupIndex < aGroups.length; ++nGroupIndex) {
                var oGroup = aGroups[nGroupIndex];
                var aTiles = oGroup.tiles;
                var aLinks = oGroup.links;

                for (var nTileIndex = 0; nTileIndex < aTiles.length; ++nTileIndex) {
                    if (aTiles[nTileIndex].uuid === sTileId) {
                        return "/groups/" + nGroupIndex + "/tiles/" + nTileIndex;
                    }
                }
                for (var nLinkIndex = 0; nLinkIndex < aLinks.length; ++nLinkIndex) {
                    if (aLinks[nLinkIndex].uuid === sTileId) {
                        return "/groups/" + nGroupIndex + "/links/" + nLinkIndex;
                    }
                }
            }

            return null;
        },

        // see http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
        _moveInArray: function (aArray, nFromIndex, nToIndex) {
            if (nToIndex >= aArray.length) {
                var k = nToIndex - aArray.length;
                while ((k--) + 1) {
                    aArray.push(undefined);
                }
            }
            aArray.splice(nToIndex, 0, aArray.splice(nFromIndex, 1)[0]);
        },

        _updateGroupIndices: function (aArray) {
            for (var k = 0; k < aArray.length; k++) {
                aArray[k].index = k;
            }
        },

        /*
         * oData should have the following parameters
         * groupId
         */
        _deleteGroup: function (sChannelId, sEventId, oData) {
            var oModel = this.oModel;
            var sGroupId = oData.groupId;
            var aGroups = oModel.getProperty("/groups");
            var nGroupIndex = oGroupsHelper.getIndexOfGroup(aGroups, sGroupId);
            var bIsLast = aGroups.length - 1 === nGroupIndex;

            var nextSelectedItemIndex = bIsLast ? nGroupIndex - 1 : nGroupIndex;
            oDestroyHelper.destroyFLPAggregationModel(oModel.getProperty("/groups/" + nGroupIndex));
            // remove deleted group from the model
            var oDeletedGroupModel = aGroups.splice(nGroupIndex, 1)[0];

            if (bIsLast) {
                oModel.setProperty("/groups/" + nextSelectedItemIndex + "/isLastGroup", bIsLast);
            }

            oModel.setProperty("/groups", aGroups);
            this._updateGroupIndices(aGroups);

            if (nextSelectedItemIndex >= 0) {
                window.setTimeout(function () {
                    Core.getEventBus().publish("launchpad", "scrollToGroup", {
                        groupId: oModel.getProperty("/groups")[nextSelectedItemIndex].groupId
                    });
                }, 200);
            }

            function deleteGroup () {
                this.oPageOperationAdapter.deleteGroup(oDeletedGroupModel).then(
                    function () {
                        oMessagingHelper.showLocalizedMessage("group_deleted_msg", [oDeletedGroupModel.title]);
                        this._checkRequestQueue();
                    }.bind(this),
                    function () {
                        this._resetGroupsOnFailure("fail_to_delete_group_msg");
                    }.bind(this)
                );
            }

            this._addRequest(deleteGroup.bind(this));
        },

        /*
         * oData should have the following parameters
         * groupId
         */
        _resetGroup: function (sChannelId, sEventId, oData) {
            var that = this;
            var sGroupId = oData.groupId;
            var oModel = this.oModel;
            var aGroups = oModel.getProperty("/groups");
            var nGroupIndex = oGroupsHelper.getIndexOfGroup(aGroups, sGroupId);
            var bDefaultGroup = that.oModel.getProperty("/groups/indexOfDefaultGroup") === nGroupIndex;
            var oGroupModel = oModel.getProperty("/groups/" + nGroupIndex);

            oModel.setProperty("/groups/" + nGroupIndex + "/sortable", false);

            function resetGroup () {
                that.oPageOperationAdapter.resetGroup(oGroupModel, bDefaultGroup).then(
                    function (oResetedObject) {
                        that._handleAfterSortable(function (sGroupId, oOldGroupModel, oResetedGroupModel) {
                            var aGroups = that.oModel.getProperty("/groups");
                            var nGroupIndex = oGroupsHelper.getIndexOfGroup(aGroups, sGroupId);

                            that._loadGroup(nGroupIndex, oResetedGroupModel || oOldGroupModel);
                            oMessagingHelper.showLocalizedMessage("group_reset_msg", [oOldGroupModel.title]);
                            that.oModel.setProperty("/groups/" + nGroupIndex + "/sortable", true);

                            var oGroupControl = Core.byId("dashboardGroups").getGroupControlByGroupId(sGroupId);
                            var oLinks = oGroupControl.getBindingContext().getObject().links;

                            if (oLinks && oLinks.length && !oGroupControl.getIsGroupLocked()) {
                                that._changeGroupLinksScope(
                                    oGroupControl.getBindingContext().getObject(),
                                    that.oModel.getProperty("/tileActionModeActive")
                                        ? GenericTileScope.Actions : GenericTileScope.Display
                                );
                            }

                            if (oGroupControl) {
                                oGroupControl.rerender();
                                oEventHub.emit("updateGroups", Date.now());
                                oUtils.handleTilesVisibility();
                            }
                        })(sGroupId, oGroupModel, oResetedObject);
                        that._checkRequestQueue();
                    }, function () {
                        that._resetGroupsOnFailure("fail_to_reset_group_msg");
                    }
                );
            }
            this._addRequest(resetGroup);
        },

        /*
         * oData should have the following parameters
         * fromIndex
         * toIndex
         */
        _moveGroup: function (sChannelId, sEventId, oData) {
            if (isNaN(oData.fromIndex)) {
                // workaround: when renaming and moving groups quickly, "fromIndex" can be "NaN" (probably due to "setTimeout" usages)
                return;
            }

            var iFromIndex = oData.fromIndex;
            var iToIndex = oData.toIndex;
            var oModel = this.oModel;
            var aGroups = oModel.getProperty("/groups");
            var bActionMode = oModel.getProperty("/tileActionModeActive");
            var that = this;

            // Fix the indices to support hidden groups
            if (!bActionMode) {
                iFromIndex = this._adjustFromGroupIndex(iFromIndex, aGroups);
            }

            // Move var definition after fixing the from index.
            var oGroup = aGroups[iFromIndex];
            var sGroupId = oGroup.groupId;
            // Fix the to index accordingly
            if (!bActionMode) {
                iToIndex = this._adjustToGroupIndex(iToIndex, aGroups, sGroupId);
            }

            var oDestinationGroup = aGroups[iToIndex];
            this._moveInArray(aGroups, iFromIndex, iToIndex);
            this._updateGroupIndices(aGroups);
            for (var i = 0; i < aGroups.length - 1; i++) {
                aGroups[i].isLastGroup = false;
            }
            aGroups[aGroups.length - 1].isLastGroup = true;
            oModel.setProperty("/groups", aGroups);

            function moveGroup () {
                aGroups = oModel.getProperty("/groups"); //Update aGroups. Can be change before callback
                var oGroup = oModel.getProperty(oGroupsHelper.getModelPathOfGroup(aGroups, sGroupId));
                if (!oGroup.object) {
                    return;
                }

                that.oPageOperationAdapter.getOriginalGroupIndex(oDestinationGroup, aGroups).then(
                    function (iIndexTo) {
                        var oIndicesInModel = {
                            iFromIndex: iFromIndex,
                            iToIndex: iToIndex
                        };
                        return that.oPageOperationAdapter.moveGroup(oGroup, iIndexTo, oIndicesInModel);
                    }
                ).then(
                    that._checkRequestQueue.bind(that),
                    function () {
                        that._resetGroupsOnFailure("fail_to_move_group_msg");
                    }
                );
            }

            this._addRequest(moveGroup);
        },

        /*
         * toIndex - The index in the UI of the required group new index. (it is not including the group itself)
         * groups - The list of groups in the model (including hidden and visible groups)
         * The function returns the new index to be used in the model - since there might be hidden groups that should be taken in account
         */
        _adjustToGroupIndex: function (toIndex, groups, groupId) {
            var visibleCounter = 0;
            var bIsGroupIncluded = false;
            var i = 0;
            // In order to get the new index, count all groups (visible+hidden) up to the new index received from the UI.
            for (i = 0; i < groups.length && visibleCounter < toIndex; i++) {
                if (groups[i].isGroupVisible) {
                    if (groups[i].groupId === groupId) {
                        bIsGroupIncluded = true;
                    } else {
                        visibleCounter++;
                    }
                }
            }
            if (bIsGroupIncluded) {
                return i - 1;
            }
            return i;
        },

        _adjustFromGroupIndex: function (index, groups) {
            var visibleGroupsCounter = 0;
            for (var i = 0; i < groups.length; i++) {
                if (groups[i].isGroupVisible) {
                    visibleGroupsCounter++;
                }
                if (visibleGroupsCounter === index + 1) {
                    return i;
                }
            }
            // Not suppose to happen, but if not found return the input index
            return index;
        },

        /*
         * oData should have the following parameters
         * groupId
         * newTitle
         */
        _changeGroupTitle: function (sChannelId, sEventId, oData) {
            var that = this;
            var sNewTitle = oData.newTitle;
            var aGroups = this.oModel.getProperty("/groups");
            var sModelGroupId = oData.groupId;
            var nGroupIndex = oGroupsHelper.getIndexOfGroup(aGroups, sModelGroupId);
            var bDefaultGroup = that.oModel.getProperty("/groups/indexOfDefaultGroup") === nGroupIndex;
            var oGroupModel = this.oModel.getProperty("/groups/" + nGroupIndex);
            var sOldTitle = oGroupModel.title;

            this.oModel.setProperty("/groups/" + nGroupIndex + "/title", sNewTitle);

            function addGroup () {
                var oAddGroupPromise;
                if (oGroupModel.isLastGroup) {
                    oAddGroupPromise = that.oPageOperationAdapter.addGroupAt(oGroupModel, undefined, bDefaultGroup);
                } else {
                    var oNextGroup = that.oModel.getProperty("/groups")[nGroupIndex + 1];
                    // groups can be sorted in PageAdapter and have different order compare to the model
                    // For this reason we need firstly get the correct index of the next group and then add new group before it.
                    oAddGroupPromise = that.oPageOperationAdapter.getOriginalGroupIndex(oNextGroup, aGroups).then(
                        function (iIndex) {
                            return that.oPageOperationAdapter.addGroupAt(oGroupModel, iIndex, bDefaultGroup);
                        }
                    );
                }

                oAddGroupPromise.then(
                    function (oNewPreparedGroupModel) {
                        // Theoretically can be case that the server is slow and user start the dnd tiles.
                        that._handleAfterSortable(function (sGroupId, oNewGroupModel) {
                            // group model can be changed
                            var aUpdatedGroups = that.oModel.getProperty("/groups");
                            var iGroupIndex = oGroupsHelper.getIndexOfGroup(aUpdatedGroups, sGroupId);
                            var oOldGroupModel = aUpdatedGroups[iGroupIndex];

                            // The group might be already further personalized therefore update all properties
                            // but the tiles and the links. Otherwise the tiles which were already added to model get removed
                            // BCP: 2030578465
                            Object.keys(oNewGroupModel).forEach(function (sKey) {
                                if (sKey === "tiles" || sKey === "links") {
                                    return;
                                }
                                oOldGroupModel[sKey] = oNewGroupModel[sKey];
                            });
                            that.oModel.refresh();

                            that._checkRequestQueue();
                        })(sModelGroupId, oNewPreparedGroupModel);
                    }, function () {
                        that._resetGroupsOnFailure("fail_to_create_group_msg");
                    }
                );
            }

            function renameGroup () {
                this.oPageOperationAdapter.renameGroup(oGroupModel, sNewTitle, sOldTitle).then(
                    function () {
                        that._checkRequestQueue();
                    }, function () {
                        that._resetGroupsOnFailure("fail_to_rename_group_msg");
                    }
                );
            }

            // Check, if the group has already been persisted
            if (!oGroupModel.object) {
                this._checkRequestQueue();
                // Add the group in the backend.
                this._addRequest(addGroup.bind(this));
            } else {
                // Rename the group in the backend.
                // model is already changed - it only has to be made persistent in the backend
                this._addRequest(renameGroup.bind(this));
            }
        },

        /**
         * Add the group to the end of groups model
         *
         * @param {Object} oGroup The group object
         * @returns {Object} The group context
         */
        addGroupToModel: function (oGroup) {
            var oGroupModel = this.oPageOperationAdapter.getPreparedGroupModel(oGroup, false, true, { isRendered: true });
            var aGroups = this.oModel.getProperty("/groups");
            var nGroupIndex = aGroups.length; //push new group at the end of list

            if (nGroupIndex > 0) {
                aGroups[nGroupIndex - 1].isLastGroup = false;
            }
            oGroupModel.index = nGroupIndex;
            aGroups.push(oGroupModel);
            this.oModel.setProperty("/groups/", aGroups);

            var oContextGroup = new Context(this.oModel, "/groups/" + nGroupIndex);
            return oContextGroup;
        },

        /*
         * Dashboard
         * oData should have the following parameters
         * tileId
         * groupId
         */
        _deleteTile: function (sChannelId, sEventId, oData) {
            var sTileId = oData.tileId;
            var aGroups = this.oModel.getProperty("/groups");
            var sItems = oData.items || "tiles";

            function deleteTile (group, tileModel) {
                this.oPageOperationAdapter.removeTile(group, tileModel)
                    .then(this._checkRequestQueue.bind(this), this._resetGroupsOnFailure.bind(this, "fail_to_remove_tile_msg"));
            }

            /**
             * Focuses the next logical tile or link in a group.
             * As the "plus tile" is always available if personalization is possible,
             * this will be focused if the aggregation of the tile/link is empty.
             *
             * @param {number} tileIndex the index of the tile in the group model
             * @param {object} group the group model object containing the tile
             * @param {string} tileType determines the aggregation, the tile was in (tiles or links)
             */
            function focusNextTile (tileIndex, group, tileType) {
                var oDashboardGroups = Core.byId("dashboardGroups");
                var oGroupControl = oDashboardGroups.getGroupControlByGroupId(group.groupId);
                var oNextTile;

                if (tileType === "tiles") {
                    if (tileIndex + 1 === group[tileType].length) {
                        oNextTile = oGroupControl.oPlusTile;
                    }
                    // the tiles aggregation already behaves correctly in all other cases.
                } else {
                    var aLinks = oGroupControl.getLinks();

                    if (tileIndex + 1 === aLinks.length) {
                        if (aLinks.length === 1) {
                            oNextTile = oGroupControl.oPlusTile;
                        } else {
                            oNextTile = aLinks[tileIndex - 1];
                        }
                    } else {
                        oNextTile = aLinks[tileIndex + 1];
                    }
                }
                if (oNextTile) {
                    sap.ui.require(["sap/ushell/components/ComponentKeysHandler"], function (ComponentKeysHandler) {
                        ComponentKeysHandler.getInstance().then(function (ComponentKeysHandlerInstance) {
                            ComponentKeysHandlerInstance.moveScrollDashboard(oNextTile.$());
                        });
                    });
                }
            }

            for (var nGroupIndex = 0; nGroupIndex < aGroups.length; ++nGroupIndex) {
                var oGroup = aGroups[nGroupIndex];
                for (var nTileIndex = 0; nTileIndex < oGroup[sItems].length; ++nTileIndex) {
                    var oTmpTile = oGroup[sItems][nTileIndex];
                    if (oTmpTile.uuid === sTileId) {
                        if (Device.system.desktop) {
                            focusNextTile(nTileIndex, oGroup, sItems);
                        }
                        // Remove tile from group.
                        oDestroyHelper.destroyTileModel(this.oModel.getProperty("/groups/" + nGroupIndex + "/" + sItems + "/" + nTileIndex));
                        var oTileModel = oGroup[sItems].splice(nTileIndex, 1)[0];
                        var personalization = this.oModel.getProperty("/personalization");

                        oGroup.visibilityModes = oUtils.calcVisibilityModes(oGroup, personalization);
                        this.oModel.setProperty("/groups/" + nGroupIndex, oGroup);
                        this._addRequest(deleteTile.bind(this, oGroup, oTileModel));
                        oUtils.handleTilesVisibility();
                        return;
                    }
                }
            }
        },

        /**
         * Remove tiles from the group model
         *
         * @param {String} sGroupId Id of the group, where tiles should be removed
         * @param {Array} aRemovedTilesIds Array of the tile uuids to remove
         */
        deleteTilesFromGroup: function (sGroupId, aRemovedTilesIds) {
            var aGroups = this.oModel.getProperty("/groups");
            var iGroupIndex = oGroupsHelper.getIndexOfGroup(aGroups, sGroupId);
            var oGroup = this.oModel.getProperty("/groups/" + iGroupIndex);
            var aFilteredTiles = [];

            ["tiles", "links"].forEach(function (sAttribute) {
                aFilteredTiles = oGroup[sAttribute].filter(function (oTile) {
                    if (aRemovedTilesIds.indexOf(oTile.uuid) < 0) {
                        return true;
                    }
                    return false;
                });
                oGroup[sAttribute] = aFilteredTiles;
            });

            oGroup.visibilityModes = oUtils.calcVisibilityModes(oGroup, true);
            this.oModel.setProperty("/groups/" + iGroupIndex, oGroup);
        },

        _getGroupIndex: function (sId) {
            var aGroups = this.oModel.getProperty("/groups");
            var oGroupInfo = this._getNewGroupInfo(aGroups, sId);
            if (oGroupInfo) {
                return oGroupInfo.newGroupIndex;
            }
            return undefined;
        },

        _convertTile: function (sChannelId, sEventId, oData) {
            var oSourceTile = oData.tile ? oData.tile : oData;
            var nGroupIndex = oData.srcGroupId ? this._getGroupIndex(oData.srcGroupId) : undefined;
            var oSourceGroup = oData.srcGroupId
                ? this.oModel.getProperty("/groups/" + nGroupIndex)
                : oSourceTile.getParent().getBindingContext().getObject();
            var aTileBindingContext = oSourceTile.getBindingContext().sPath.split("/");
            var oTileModel = oSourceTile.getBindingContext().getObject();
            var sOldType = aTileBindingContext[aTileBindingContext.length - 2];
            var sTileId = oTileModel.uuid;
            var curTileIndex = parseInt(aTileBindingContext[aTileBindingContext.length - 1], 10);
            var newTileIndex = oData.toIndex !== undefined ? oData.toIndex : undefined;
            var bActionMode = this.oModel.getProperty("/tileActionModeActive");
            var newGroupIndex = oData.toGroupId ? this._getGroupIndex(oData.toGroupId) : oSourceGroup.index;
            var oTargetGroup = oData.toGroupId ? this.oModel.getProperty("/groups/" + newGroupIndex) : oSourceGroup;
            var that = this;

            var oIndexInfo = this._getIndexForConvert(sOldType, curTileIndex, newTileIndex, oSourceGroup, oTargetGroup);
            var sourceInfo = {
                tileIndex: curTileIndex,
                groupIndex: nGroupIndex,
                group: oSourceGroup
            };

            function convertTile () {
                // setting a flag on the Tile's object to disable opening the Tile's action until backend requests finish (see DashboardContent.view)
                oTileModel.tileIsBeingMoved = true;
                var oResultPromise = this.oPageOperationAdapter.moveTile(
                    oTileModel,
                    oIndexInfo,
                    oSourceGroup,
                    oTargetGroup,
                    (sOldType === "links") ? "tile" : "link"
                );

                oResultPromise.then(function (oNewTileInfo) {
                    // we call to _handleAfterSortable to handle the case in which convertTile is called by dragAndDrop flow
                    that._handleAfterSortable(function (sTileId, oNewTileInfo) {
                        var sTilePath = that._getPathOfTile(sTileId);
                        var oView = oNewTileInfo.content;

                        // If we cannot find the tile, it might have been deleted -> Check!
                        if (sTilePath) {
                            if (sOldType === "tiles") { // it means we convert to link
                                that._attachLinkPressHandlers(oView);
                                that._changeLinkScope(oView, bActionMode ? "Actions" : "Display");
                            }

                            if (oSourceGroup === oTargetGroup) {
                                MessageToast.show(oResources.i18n.getText("PageRuntime.Message.VisualizationConverted"));
                            } else {
                                MessageToast.show(oResources.i18n.getText("PageRuntime.Message.VisualizationMovedAndConverted"));
                            }

                            var oTargetGroupInfo = {
                                tileIndex: newTileIndex,
                                groupIndex: newGroupIndex,
                                group: oTargetGroup
                            };
                            var tileInfo = {
                                tile: oTileModel,
                                view: oView,
                                type: sOldType,
                                tileObj: oNewTileInfo.object
                            };
                            // setting a flag on the Tile's object to disable opening the Tile's action until backend requests finish (see DashboardContent.view)
                            oTileModel.tileIsBeingMoved = true;
                            that.replaceTileViewAfterConvert(sourceInfo, oTargetGroupInfo, tileInfo);
                            oEventHub.emit("updateGroups", Date.now());
                            oUtils.handleTilesVisibility();
                            if (oData.callBack) {
                                oData.callBack(oView);
                            }
                        }
                    })(sTileId, oNewTileInfo);
                    that._checkRequestQueue();
                }, function () {
                    that._handleAfterSortable(that._resetGroupsOnFailure.bind(that))("fail_to_move_tile_msg");
                });
            }
            this._addRequest(convertTile.bind(this));
        },

        replaceTileViewAfterConvert: function (oSourceInfo, oDstInfo, oTileInfo) {
            // get the old view from tile's model
            var oTile = oTileInfo.tile;
            var oldViewContent = oTile.content;
            // first we set new view, new tile object and new Id. And reset the move-scenario flag
            oTile.tileIsBeingMoved = false;
            oTile.content = [oTileInfo.view];
            oTile.object = oTileInfo.tileObj;
            oTile.originalTileId = this.oPageOperationAdapter.getTileId(oTileInfo.tileObj);

            // fix the tile position in the model and insert the converted tile\link to the group
            oSourceInfo.group[oTileInfo.type].splice(oSourceInfo.tileIndex, 1);
            if (oDstInfo.tileIndex !== undefined) {
                oDstInfo.group[oTileInfo.type === "tiles" ? "links" : "tiles"].splice(oDstInfo.tileIndex, 0, oTile);
            } else {
                oDstInfo.group[oTileInfo.type === "tiles" ? "links" : "tiles"].push(oTile);
            }

            this.oModel.setProperty("/groups/" + oDstInfo.groupIndex, oDstInfo.group);
            this.oModel.setProperty("/groups/" + oSourceInfo.groupIndex, oSourceInfo.group);

            // handle animation
            if (oTileInfo.type === "links") {
                this._handleTileAppearanceAnimation(oTile.content[0].getParent());
            } else {
                this._handleTileAppearanceAnimation(oTile.content[0]);
            }

            if (oldViewContent && oldViewContent[0]) {
                oldViewContent[0].destroy();
            }
        },

        /*
         * sType: the type of the tile (lineMode/ContentMode) before the convert action
         */
        _getIndexForConvert: function (sType, curTileIndex, newTileIndexInShellModel, oGroup, oDstGroup) {
            var nNewTileIndex;
            if (sType === "tiles") {
                // If we convert ContentMode-tile to link
                // then we want to enter the new link to the end of the array or to provided newTileIndex
                if (newTileIndexInShellModel !== undefined) {
                    nNewTileIndex = oDstGroup[sType].length + newTileIndexInShellModel;
                } else {
                    nNewTileIndex = oDstGroup[sType].length + oDstGroup.links.length;
                }
                if (oGroup.groupId === oDstGroup.groupId) {
                    nNewTileIndex--;
                }
            } else {
                // If we convert link to ContentMode-tile then we want to enter the new tile after the the last ContentMode-tile
                nNewTileIndex = newTileIndexInShellModel || oGroup.tiles.length;
                curTileIndex += oGroup.tiles.length;
            }
            return { tileIndex: curTileIndex, newTileIndex: nNewTileIndex };
        },

        _getIndexForMove: function (sType, curTileIndex, newTileIndexInShellModel, oDstGroup, oSourceGroup) {
            var nNewTileIndex;
            if (sType === "tiles") {
                // case move tile
                nNewTileIndex = newTileIndexInShellModel !== undefined ? newTileIndexInShellModel : oDstGroup[sType].length;
            } else {
                // case move link
                if (newTileIndexInShellModel !== undefined) {
                    nNewTileIndex = oDstGroup.tiles.length + newTileIndexInShellModel;
                } else {
                    nNewTileIndex = oDstGroup.tiles.length + oDstGroup.links.length;
                }
                curTileIndex += oSourceGroup.tiles.length;
            }
            return { tileIndex: curTileIndex, newTileIndex: nNewTileIndex };
        },

        _getTileInfo: function (aGroups, sTileId, sItems) {
            for (var nTmpGroupIndex = 0; nTmpGroupIndex < aGroups.length; ++nTmpGroupIndex) {
                var oTmpGroup = aGroups[nTmpGroupIndex];
                for (var nTmpTileIndex = 0; nTmpTileIndex < oTmpGroup[sItems].length; ++nTmpTileIndex) {
                    var oTmpTile = oTmpGroup[sItems][nTmpTileIndex];
                    if (oTmpTile.uuid === sTileId) {
                        // the order is oTile, nTileIndex, oOldGroup, nOldGroupIndex
                        return {
                            oTile: oTmpTile,
                            tileIndex: nTmpTileIndex,
                            oGroup: oTmpGroup,
                            groupIndex: nTmpGroupIndex
                        };
                    }
                }
            }

            return;
        },

        // should be considered to improve by inserting the logic into _getTileInfo function
        _getNewGroupInfo: function (aGroups, sNewGroupId) {
            for (var nTmpGroupIndex = 0; nTmpGroupIndex < aGroups.length; ++nTmpGroupIndex) {
                var oTmpGroup = aGroups[nTmpGroupIndex];
                if (oTmpGroup.groupId === sNewGroupId) {
                    // order is oNewGroup, nNewGroupIndex
                    return {
                        oNewGroup: oTmpGroup,
                        newGroupIndex: nTmpGroupIndex
                    };
                }
            }

            return;
        },

        /*
         * oData should have the following parameters:
         * fromGroupId
         * toGroupId
         * fromIndex
         * toIndex can be null => append as last tile in group
         */
        _moveTile: function (sChannelId, sEventId, oData) {
            var nNewIndex = oData.toIndex;
            var sNewGroupId = oData.toGroupId;
            var sTileId = oData.sTileId;
            var sSource = oData.source;
            var sType = oData.sTileType === "tiles" || oData.sTileType === "tile" ? "tile" : "link";
            var sToItems = oData.sToItems;
            var sFromItems = oData.sFromItems;
            var bActionMode = this.oModel.getProperty("/tileActionModeActive");
            var aGroups = this.oModel.getProperty("/groups");
            var oTileInfo = this._getTileInfo(aGroups, sTileId, sFromItems);
            var oGroupInfo = this._getNewGroupInfo(aGroups, sNewGroupId);
            var that = this;

            var bIsLastTileMovingOverPlusButton = (oTileInfo.tileIndex === oGroupInfo.oNewGroup.tiles.length - 1) && (nNewIndex >= oGroupInfo.oNewGroup.tiles.length);
            if ((oTileInfo.tileIndex === nNewIndex || bIsLastTileMovingOverPlusButton) && (oTileInfo.oGroup.groupId === oGroupInfo.oNewGroup.groupId)) {
                return; // aborting because the action is not a real move
            }

            // When moving a tile to the group it is already in (using the move dialog), there is no change
            if (oTileInfo.oGroup.groupId === oGroupInfo.oNewGroup.groupId
                && (sSource === "movetileDialog" || nNewIndex === null || sSource === "movelinkDialog")
            ) {
                if (oData.callBack && oTileInfo.oTile && oTileInfo.oTile.content && oTileInfo.oTile.content.length) {
                    oData.callBack(oTileInfo.oTile.content[0]);
                }
                return;
            }
            if (sType === "link") {
                oTileInfo.oTile.content[0].addStyleClass("sapUshellZeroOpacity");
            }

            // When a tile is dragged into an empty group, the Plus-Tiles in the empty list cause
            // the new index to be off by one, i.e. 1 instead of 0, which causes an error.
            // This is a generic check which sanitizes the values if necessary.
            if (sType === "tile" && sToItems === "tiles") {
                if (nNewIndex && nNewIndex > oGroupInfo.oNewGroup[sToItems].length) {
                    nNewIndex = oGroupInfo.oNewGroup[sToItems].length;
                }
            }
            if (oTileInfo.oGroup.groupId === sNewGroupId && sToItems === sFromItems) {
                if (nNewIndex === null || nNewIndex === undefined) {
                    // moved over group list to same group
                    oTileInfo.oGroup[sToItems].splice(oTileInfo.tileIndex, 1);
                    // Tile is appended. Set index accordingly.
                    nNewIndex = oTileInfo.oGroup[sToItems].length;
                    // append as last item
                    oTileInfo.oGroup[sToItems].push(oTileInfo.oTile);
                } else {
                    nNewIndex = this._adjustTileIndex(nNewIndex, oTileInfo.oTile, oTileInfo.oGroup, sToItems);
                    this._moveInArray(oTileInfo.oGroup[sToItems], oTileInfo.tileIndex, nNewIndex);
                }

                this.oModel.setProperty("/groups/" + oTileInfo.groupIndex + "/" + sToItems, oTileInfo.oGroup[sToItems]);
            } else {
                // remove from old group
                var personalization = this.oModel.getProperty("/personalization");
                oTileInfo.oGroup[sFromItems].splice(oTileInfo.tileIndex, 1);
                oTileInfo.oGroup.visibilityModes = oUtils.calcVisibilityModes(oTileInfo.oGroup, personalization);
                this.oModel.setProperty("/groups/" + oTileInfo.groupIndex + "/" + sFromItems, oTileInfo.oGroup[sFromItems]);

                // add to new group
                if (nNewIndex === null || nNewIndex === undefined) {
                    // Tile is appended. Set index accordingly.
                    nNewIndex = oGroupInfo.oNewGroup[sToItems].length;
                    // append as last item
                    oGroupInfo.oNewGroup[sToItems].push(oTileInfo.oTile);
                } else {
                    nNewIndex = this._adjustTileIndex(nNewIndex, oTileInfo.oTile, oGroupInfo.oNewGroup, sToItems);
                    oGroupInfo.oNewGroup[sToItems].splice(nNewIndex, 0, oTileInfo.oTile);
                }
                oGroupInfo.oNewGroup.visibilityModes = oUtils.calcVisibilityModes(oGroupInfo.oNewGroup, personalization);
                this.oModel.setProperty("/groups/" + oGroupInfo.newGroupIndex + "/" + sToItems, oGroupInfo.oNewGroup[sToItems]);
            }

            // recalculate the associated groups for catalog tiles
            oEventHub.emit("updateGroups", Date.now());
            // recalculate the visibility of the Tiles
            oUtils.handleTilesVisibility();

            // change in backend
            function moveTile () {
                var oSourceGroup = this.oModel.getProperty("/groups/" + oTileInfo.groupIndex);
                var oTargetGroup = this.oModel.getProperty("/groups/" + oGroupInfo.newGroupIndex);
                var oIndexInfo = this._getIndexForMove(sFromItems, oTileInfo.tileIndex, nNewIndex, oGroupInfo.oNewGroup, oSourceGroup);

                // setting a flag on the Tile's object to disable opening the Tile's action until backend requests finish (see DashboardContent.view)
                oTileInfo.oTile.tileIsBeingMoved = true;
                this.oPageOperationAdapter.moveTile(
                    oTileInfo.oTile,
                    oIndexInfo,
                    oSourceGroup,
                    oTargetGroup,
                    sType
                ).then(function (oNewTileInfo) {
                    var sTilePath = that._getPathOfTile(sTileId);
                    if (sTilePath) {
                        that.oModel.setProperty(sTilePath + "/object", oNewTileInfo.object);
                        that.oModel.setProperty(sTilePath + "/originalTileId", oNewTileInfo.originalTileId);

                        var oldViewContent = that.oModel.getProperty(sTilePath + "/content");
                        var oView = oNewTileInfo.content;

                        // set the new view
                        if (sToItems === "links") {
                            that._changeLinkScope(oView, bActionMode ? "Actions" : "Display");
                            that._attachLinkPressHandlers(oView);
                            that._handleTileAppearanceAnimation(oView);
                            oTileInfo.oTile.content = [oView];
                            that.oModel.setProperty(sTilePath, extend({}, oTileInfo.oTile));
                            that.oModel.setProperty(
                                "/groups/" + oGroupInfo.newGroupIndex + "/" + sToItems,
                                that.oModel.getProperty("/groups/" + oGroupInfo.newGroupIndex + "/" + sToItems)
                            );
                        } else {
                            that.oModel.setProperty(sTilePath + "/content", [oView]);
                        }

                        // destroy the old view
                        if (oldViewContent && oldViewContent[0]) {
                            var origOnAfterRendering = oView.onAfterRendering;
                            oView.onAfterRendering = function () {
                                origOnAfterRendering.apply(this);
                                oldViewContent[0].destroy();
                                oView.onAfterRendering = origOnAfterRendering;
                            };
                        }

                        // reset the move-scenario flag
                        that.oModel.setProperty(sTilePath + "/tileIsBeingMoved", false);
                        if (oData.callBack) {
                            oData.callBack(oView);
                        }

                        MessageToast.show(oResources.i18n.getText("PageRuntime.Message.VisualizationMoved"));
                    }
                    that._checkRequestQueue();
                }, function () {
                    that._resetGroupsOnFailure("fail_to_move_tile_msg");
                });
            }
            this._addRequest(moveTile.bind(this));
        },

        // Adjust the moved-tile new index according to the visible+hidden tiles
        _adjustTileIndex: function (newLocationIndex, oTile, newGroup, sItems) {
            var visibleCounter = 0;
            var bIsTileIncluded = false;
            var i = 0;
            // In order to get the new index, count all tiles (visible+hidden) up to the new index received from the UI.
            for (i = 0; i < newGroup[sItems].length && visibleCounter < newLocationIndex; i++) {
                if (newGroup[sItems][i].isTileIntentSupported) {
                    if (newGroup[sItems][i] === oTile) {
                        bIsTileIncluded = true;
                    } else {
                        visibleCounter++;
                    }
                }
            }
            if (bIsTileIncluded) {
                return i - 1;
            }
            return i;
        },

        // should not be exposed
        getModel: function () {
            return this.oModel;
        },

        getDashboardView: function () {
            return this.oDashboardView;
        },

        setDashboardView: function (oDashboardView) {
            this.oDashboardView = oDashboardView;
            return this;
        },

        setTileVisible: function (oTileModel, bVisible) {
            this.oPageOperationAdapter.setTileVisible(oTileModel.object, bVisible);
        },

        refreshTile: function (oTileModel) {
            this.oPageOperationAdapter.refreshTile(oTileModel.object);
        },

        /**
         * Function to update the settings of the HomepageManager.
         * This allows us to adjust settings we might not know yet after the constructor was called.
         *
         * @param {Object} oSettings The new settings
         * @private
         */
        updateSettings: function (oSettings) {
            this.oModel = oSettings.model || this.oModel;
            this.oConfig = oSettings.config || this.oConfig;
            this.oRouter = oSettings.router || this.oRouter;
            this.oDashboardView = oSettings.view || this.oDashboardView;
        },

        /**
         * Helper function to reset groups after a backend failure
         *
         * @param {string} sMsgId id of the localized string
         * @param {Array} aParameters parameters array
         */
        _resetGroupsOnFailure: function (sMsgId, aParameters) {
            this._requestFailed();
            oMessagingHelper.showLocalizedError(sMsgId, aParameters);
            // need to reset flag, because loading group will retrigger
            this.bStartLoadRemainSegment = false;
            this.loadPersonalizedGroups();
            this.oModel.updateBindings(true);
        },

        resetGroupsOnFailure: function () {
            this._resetGroupsOnFailure.apply(this, arguments);
        },

        _bindSegment: function (aGroups, segment) {
            for (var segIndex = 0; segIndex < segment.length; segIndex++) {
                var oSegGroup = segment[segIndex];
                var groupIndex = oSegGroup.index;
                var oGrp = aGroups[groupIndex];
                if (oGrp) {
                    oGrp.isRendered = true;
                    oGrp.tiles = oGrp.tiles.concat(oSegGroup.tiles);
                    oGrp.links = oGrp.links.concat(oSegGroup.links);
                }
            }

            return aGroups;
        },

        createGroupsModelFrame: function (aGroups, personalization) {
            var aCloneGroups = [];
            var fnCreateFlatGroupClone = function (oGroup) {
                var clnGroup = extend({}, oGroup);
                clnGroup.tiles = [];
                clnGroup.pendingLinks = [];
                clnGroup.links = [];
                return clnGroup;
            };

            for (var iGroupIndex = 0; iGroupIndex < aGroups.length; iGroupIndex++) {
                var oOrgGroup = aGroups[iGroupIndex];
                aCloneGroups[iGroupIndex] = fnCreateFlatGroupClone(oOrgGroup);
                // group variable setup.
                aCloneGroups[iGroupIndex].isRendered = false;
                aCloneGroups[iGroupIndex].visibilityModes = oUtils.calcVisibilityModes(oOrgGroup, personalization);
            }

            return aCloneGroups;
        },

        _splitGroups: function (aGroups, iFirstVisibleGroupIndex) {
            var tempSegment = [];
            var segmentHeight = 0;
            var bIsTabsMode = this.oModel.getProperty("/homePageGroupDisplay") === "tabs";
            var bEnablePersonalization = this.oModel.getProperty("/personalization");
            var iCurrentSegmentSize = 0;

            var maxSegmentSize = 500;

            for (var iGroupIndex = 0; iGroupIndex < aGroups.length; iGroupIndex++) {
                var oGroup = aGroups[iGroupIndex];
                tempSegment.push(oGroup);

                if (!this.segmentsStore.length) {
                    // Calculate the group height (value in percentage) for the first visible segment only
                    segmentHeight += this.PagingManager.getGroupHeight(oGroup, iFirstVisibleGroupIndex === iGroupIndex, bEnablePersonalization);
                } else {
                    // Calculate segment size based on the maximal number of tiles
                    iCurrentSegmentSize += oGroup.tiles.length + oGroup.links.length;
                }

                // There is smaller segment for the first visible group in tab mode.
                // Also set flag for loading the views if there is no blind loading
                if (bIsTabsMode && !this.segmentsStore.length && segmentHeight > 0) {
                    tempSegment.loadTilesView = true;
                    this.segmentsStore.push(tempSegment);
                    tempSegment = [];
                    segmentHeight = 0;
                }
                // First segment - check visible height (value in percentage), other segments - check size (number of tiles)
                if (segmentHeight >= 1 || iCurrentSegmentSize >= maxSegmentSize) {
                    this.segmentsStore.push(tempSegment);
                    tempSegment = [];
                    segmentHeight = 0;
                    iCurrentSegmentSize = 0;
                }
            }

            if (tempSegment.length) {
                this.segmentsStore.push(tempSegment);
            }
        },

        /**
         * Bind tiles and links from the first segment of segmentStore into group model.
         *
         * @param {object} [modelGroups] The group model to process
         * @returns {object} The group model with bound tiles and links from the first segment.
         *   If segmentStore is empty, return the input model without changes.
         */
        _processSegment: function (modelGroups) {
            var groupSegment = this.segmentsStore.shift();

            if (!groupSegment) {
                return modelGroups;
            }

            if (this.isBlindLoading() === false) {
                // set loadTilesView for the first segment for tabs mode
                if (this.oModel.getProperty("/homePageGroupDisplay") !== "tabs" || groupSegment.loadTilesView) {
                    this.getSegmentContentViews(groupSegment);
                }
            }
            modelGroups = this._bindSegment(modelGroups, groupSegment);
            return modelGroups;
        },

        getSegmentContentViews: function (groupSegment) {
            var nTilesIndex;
            var oSegmentTile;

            for (var nGroupSegmentIndex = 0; nGroupSegmentIndex < groupSegment.length; nGroupSegmentIndex++) {
                var oSegmentGroup = groupSegment[nGroupSegmentIndex];
                for (nTilesIndex = 0; nTilesIndex < oSegmentGroup.tiles.length; nTilesIndex++) {
                    oSegmentTile = oSegmentGroup.tiles[nTilesIndex];
                    if (oSegmentTile.isTileIntentSupported) {
                        this.getTileView(oSegmentTile);
                    }
                }

                for (nTilesIndex = 0; nTilesIndex < oSegmentGroup.links.length; nTilesIndex++) {
                    oSegmentTile = oSegmentGroup.links[nTilesIndex];
                    if (oSegmentTile.isTileIntentSupported) {
                        this.getTileView(oSegmentTile, oSegmentGroup.index);
                    }
                }
            }
            this.bIsFirstSegmentViewLoaded = true;
        },

        getSegmentTabContentViews: function (sChannelId, sEventId, iProcessTileViewSegmentsForGroup) {
            var nTilesIndex;
            var oSegmentTile;
            var iSegmentsGroup = iProcessTileViewSegmentsForGroup.iSelectedGroup;
            var oGroup = this.oModel.getProperty("/groups/" + iSegmentsGroup);

            for (nTilesIndex = 0; nTilesIndex < oGroup.tiles.length; nTilesIndex++) {
                oSegmentTile = oGroup.tiles[nTilesIndex];

                if (oSegmentTile.isTileIntentSupported) {
                    this.getTileView(oSegmentTile);
                }
            }

            for (nTilesIndex = 0; nTilesIndex < oGroup.links.length; nTilesIndex++) {
                oSegmentTile = oGroup.links[nTilesIndex];
                if (oSegmentTile.isTileIntentSupported) {
                    this.getTileView(oSegmentTile, iSegmentsGroup);
                }
            }
        },

        /**
         * Prevent calling loadPersonalizedGroups while model is still loading.
         */
        _handleBookmarkModelUpdate: function () {
            this.bIsGroupsModelDirty = false;
            this.bGroupsModelLoadingInProcess = true;
            this.loadPersonalizedGroups();
        },

        _modelLoaded: function () {
            this.bGroupsModelLoadingInProcess = false;
            if (this.bIsGroupsModelDirty) {
                this._handleBookmarkModelUpdate();
            }
        },

        /**
         * Event handler for first segment is loaded.
         *
         * @private
         */
        handleFirstSegmentLoaded: function () {
            // Only groups from the first segment are completely loaded
            // Frames of the remain groups are copied to the model because:
            // 1) To show the AnchorNavigationBar with all groups
            // 2) Avoid rerendering of the DashboardContainer if there are > 2 segments (avoid "jumping" of the page)
            var aGroupModel = this.oModel.getProperty("/groups");

            if (this.aGroupsFrame) {
                Array.prototype.push.apply(aGroupModel, this.aGroupsFrame);
                this.aGroupsFrame = null;
            }
            this._initializeAnchorNavigationBar();
            // don't need to execute _processRemainingSegments, because segments was loaded when appfinder started
            if (!this.bStartLoadRemainSegment) {
                this._processRemainingSegments();
            }
        },

        /**
         * Initialize the AnchorNavigationBar so it can be rendered.
         *
         * @private
         */
        _initializeAnchorNavigationBar: function () {
            var oDashboardView = oHomepageManagerInstance.getDashboardView();
            var oAnchorItemTemplate = oDashboardView.getAnchorItemTemplate();
            this.oDashboardView.oAnchorNavigationBar.bindAggregation("groups", {
                path: "/groups",
                template: oAnchorItemTemplate
            });
        },

        /**
         * Manage that all tiles and links from segments will be bound to the group model.
         * The processing for each segment is executed by timeout.
         * The timeout can be configured in sap-ushell-config. The default timeout - 100ms.
         * When all segments are handled, dashboard model finished loading event is published.
         *
         * @private
         */
        _processRemainingSegments: function () {
            var aUpdatedGroupModel;

            if (this.segmentsStore.length > 0) {
                window.setTimeout(function () {
                    aUpdatedGroupModel = this._processSegment(this.oModel.getProperty("/groups"));
                    this.oModel.setProperty("/groups", aUpdatedGroupModel);
                    this.bIsFirstSegment = false;
                    this._processRemainingSegments();
                }.bind(this), 0);
            } else {
                //publish event dashboard model finished loading.
                this.bIsGroupsModelLoading = false;
                this._updateModelWithTileView(0, 0);
                oUtils.handleTilesVisibility();
                Core.getEventBus().publish("launchpad", "dashboardModelContentLoaded");
                //update pin in the AppFinder
                oEventHub.emit("updateGroups", Date.now());
            }
        },

        /**
         * Check if the first segment view has not been loaded in tabs mode.
         * If this is the case initialize the tiles and send the event.
         * This can happen if the FLP is loaded in a hidden browser tab in tabs mode.
         *
         * BCP: 002075129400008403532021
         * @private
         */
        tabsModeVisibilityChanged: function () {
            if (this.bIsFirstSegmentViewLoaded === false && this.oModel.getProperty("/homePageGroupDisplay") === "tabs") {
                this.oDashboardLoadingManager.manageTilesView();
                this.bIsFirstSegmentViewLoaded = true;
                oEventHub.emit("firstSegmentCompleteLoaded", true);
            }
        },

        /**
         * Set all groups to the model
         * segmentation is used to apply all groups to the model:
         * first set only set visible groups to the model
         * @param {Array} aGroups
         *      The array containing all groups (including the default group).
         */
        _setGroupModel: function (aGroups) {
            if (this.bIsGroupsModelLoading) {
                Log.info("Skip set the group model, because the group model is still loading");
                return;
            }

            var i = 0;
            var indexOfDefaultGroup;
            var iGroupsInModel = 0;
            var numberOfVisibleTiles = 0;
            var numberOfVisibleGroup = 0;
            var iFirstVisibleGroup = null;
            var aPreparedGroupModel = [];

            this.bIsGroupsModelLoading = true;
            try {
                iGroupsInModel = this.oModel.getProperty("/groups").length;
            } catch (err) {
                // can be that groups is not defined in model
            }

            for (i = aGroups.length; i < iGroupsInModel; ++i) {
                oDestroyHelper.destroyFLPAggregationModel(this.oModel.getProperty("/groups/" + i));
            }

            if (!this.PagingManager) {
                var iAvailableWidth = jQuery("#dashboardGroups").width();
                if (!iAvailableWidth) {
                    iAvailableWidth = window.innerWidth;
                }

                var iAvailableHeight = jQuery("#sapUshellDashboardPage-cont").height();
                if (iAvailableHeight < 100) {
                    iAvailableHeight = window.innerHeight;
                }
                this.PagingManager = new PagingManager("dashboardPaging", {
                    supportedElements: {
                        tile: { className: "sapUshellTile" },
                        link: { className: "sapUshellLinkTile" }
                    },
                    containerHeight: iAvailableHeight,
                    containerWidth: iAvailableWidth
                });
            }

            aGroups.forEach(function (oGroup) {
                if (oGroup.isGroupVisible) {
                    // Hidden tilesAndLinks not calculate for the bIsScrollModeAccordingKPI
                    numberOfVisibleTiles += oGroup.tiles.length;
                }
            });

            // Check if blind loading should be activated
            this.bIsScrollModeAccordingKPI = numberOfVisibleTiles > this.iMinNumOfTilesForBlindLoading;

            this.aGroupsFrame = this.createGroupsModelFrame(aGroups, this.oModel.getProperty("/personalization"));
            for (i = 0; i < this.aGroupsFrame.length; i++) {
                if (this.aGroupsFrame[i].isGroupVisible && this.aGroupsFrame[i].visibilityModes[0]) {
                    if (iFirstVisibleGroup === null) {
                        iFirstVisibleGroup = i;
                        this.aGroupsFrame[i].isGroupSelected = true;
                        this.oModel.setProperty("/iSelectedGroup", i);
                    }
                    numberOfVisibleGroup++;
                    if (numberOfVisibleGroup > 1) {
                        this.aGroupsFrame[iFirstVisibleGroup].showGroupHeader = false;
                        break;
                    }
                }
            }

            this._splitGroups(aGroups, iFirstVisibleGroup);
            var iFirstSegmentSize = this.segmentsStore[0]
                ? this.segmentsStore[0].length
                : 0;
            var aFirstSegmentFrame = this.aGroupsFrame.splice(0, iFirstSegmentSize);

            Measurement.start("FLP:DashboardManager._processSegment", "_processSegment", "FLP");
            // remain frames will be added to the model in handleFirstSegmentLoaded,
            // because we want to reduce the time of the loading of the first visible groups
            aPreparedGroupModel = this._processSegment(aFirstSegmentFrame);

            // save default group index

            aGroups.every(function (oGroup, iGroupIndex) {
                if (oGroup.isDefaultGroup) {
                    indexOfDefaultGroup = iGroupIndex;
                    return false;
                }
                return true;
            });
            aPreparedGroupModel.indexOfDefaultGroup = indexOfDefaultGroup;

            if (this.oModel.getProperty("/homePageGroupDisplay") === "tabs") {
                var oDashboardView = this.getDashboardView();
                if (oDashboardView) { // oDashboardView may be not yet available if the AppFinder opens at start
                    var oDashboardGroupsBox = oDashboardView.oDashboardGroupsBox;
                    var oGroupsBinding = oDashboardGroupsBox.getBinding("groups");
                    if (oGroupsBinding) {
                        oGroupsBinding.filter([oDashboardView.oFilterSelectedGroup]);
                    }
                }
            }

            Measurement.end("FLP:DashboardManager._processSegment");

            this.oModel.setProperty("/groups", aPreparedGroupModel);
            this.aGroupModel = aPreparedGroupModel;
            // start to load other segments when first segment was completely loaded (placeholders and static views)
            if (this.oDashboardView) { //Homepage start
                oEventHub.once("firstSegmentCompleteLoaded")
                    .do(function () {
                        // the first segment has been loaded and rendered; this is valid with and without blind-loading
                        oUtils.setPerformanceMark("FLP-TTI-Homepage", { bUseUniqueMark: true });
                    })
                    .do(this.handleFirstSegmentLoaded.bind(this));
            } else { // AppFinder started
                /*
                By default only visible groups loaded in the first segment. It is done in order to
                improve the performance and show first groups earlier as possible. But, AppFinder
                is still bind to the group model and required all groups to correctly show the popover and
                pin buttons are active.
                For the cases different from homepage, we don't wait "firstSegmentCompleteLoaded" event and
                start to load remain segment.
                */
                setTimeout(function () {
                    Array.prototype.push.apply(this.aGroupModel, this.aGroupsFrame);
                    this.aGroupsFrame = null;
                    this.bStartLoadRemainSegment = true;
                    this._processRemainingSegments();
                }.bind(this), 0);
            }

            // Tiles loaded with views when there is no blind-loading
            // In this case the first segment is loaded after setting the model
            if (this.bIsFirstSegmentViewLoaded) {
                oEventHub.emit("firstSegmentCompleteLoaded", true);
            }

            Measurement.end("FLP:DashboardManager.loadGroupsFromArray");
        },

        getPreparedGroupModel: function () {
            return this.aGroupModel;
        },

        /**
         * Update the group in the model
         * @param {Integer} nIndex
         *      The index at which the group should be added. 0 is reserved for the default group.
         * @param {Object} oNewGroupModel
         *      The prepared group model
         */
        _loadGroup: function (nIndex, oNewGroupModel) {
            var that = this;
            var sGroupPath = "/groups/" + nIndex;
            var oOldGroupModel = that.oModel.getProperty(sGroupPath);
            var bIsLast = oOldGroupModel.isLastGroup;
            var sOldGroupId = oOldGroupModel.groupId;

            oDestroyHelper.destroyFLPAggregationModel(oOldGroupModel);

            // If the group already exists, keep the id. The backend-handlers relay on the id staying the same.
            if (sOldGroupId) {
                oNewGroupModel.groupId = sOldGroupId;
            }
            // If the server is slow and group can become the last by user actions
            oNewGroupModel.isLastGroup = bIsLast;
            oNewGroupModel.index = nIndex;
            oNewGroupModel.isRendered = true;
            this.oModel.setProperty(sGroupPath, oNewGroupModel);
        },

        _hasPendingLinks: function (aModelLinks) {
            for (var i = 0; i < aModelLinks.length; i++) {
                if (aModelLinks[i].content[0] === undefined) {
                    return true;
                }
            }
            return false;
        },

        _addModelToTileViewUpdateQueue: function (sTileUUID, oTileView) {
            // add the tile view to the update queue
            this.tileViewUpdateQueue.push({ uuid: sTileUUID, view: oTileView });
        },

        _updateModelWithTileView: function (startGroup, startTile) {
            var that = this;

            /*
            in order to avoid many updates to the model we wait to allow
            other tile update to accumulate in the queue.
            therefore we clear the previous call to update the model
            and create a new one
            */
            if (this.tileViewUpdateTimeoutID) {
                clearTimeout(this.tileViewUpdateTimeoutID);
            }
            this.tileViewUpdateTimeoutID = window.setTimeout(function () {
                that.tileViewUpdateTimeoutID = undefined;
                // wait to update until the personalization operation is done to avoid rendering the tiles during D&D operation
                that.oSortableDeferred.done(function () {
                    that._updateModelWithTilesViews(startGroup, startTile);
                });
            }, 50);
        },

        _updateGroupModelWithTilesViews: function (aTiles, startTile, handledUpdatesIndex, isLink) {
            var stTile = startTile || 0;

            for (var j = stTile; j < aTiles.length; j = j + 1) {
                // group tiles loop - get the tile model
                var oTileModel = aTiles[j];
                for (var q = 0; q < this.tileViewUpdateQueue.length; q++) {
                    // updated tiles view queue loop - check if the current tile was updated
                    var oUpdatedTile = this.tileViewUpdateQueue[q];
                    if (oTileModel.uuid === oUpdatedTile.uuid) {
                        // mark tileViewUpdate index for removal oUpdatedTile from tileViewUpdateQueue.
                        handledUpdatesIndex.push(q);
                        if (oUpdatedTile.view) {
                            // if view is provided, then we destroy the current content (TileState control) and set the tile view.
                            // in case of link, we do not have a loading link and therefore we don't destroy it
                            if (isLink) {
                                oTileModel.content = [oUpdatedTile.view];
                            } else {
                                oTileModel.content[0].destroy();
                                oTileModel.content = [oUpdatedTile.view];
                            }
                            this.oDashboardLoadingManager.setTileResolved(oTileModel);

                            // in some cases tile size can be different then the initial value, therefore we read and set the size again
                            var sSize = this.oPageOperationAdapter.getTileSize(oTileModel.object);
                            var bLong = ((sSize !== null) && (sSize === "1x2")) || false;
                            if (oTileModel.long !== bLong) {
                                oTileModel.long = bLong;
                            }
                        } else {
                            // some error on getTileView, therefore we set the state to 'Failed'
                            oTileModel.content[0].setState("Failed");
                        }
                        break;
                    }
                }
            }
        },

        _updateModelWithTilesViews: function (startGroup, startTile) {
            var aGroups = this.oModel.getProperty("/groups");
            var stGroup = startGroup || 0;
            var handledUpdatesIndex = [];

            if (!aGroups || this.tileViewUpdateQueue.length === 0) {
                return;
            }

            /*
            go over the tiles in the model and search for tiles to update.
            tiles are identified using uuid
            */
            for (var i = stGroup; i < aGroups.length; i = i + 1) {
                //group loop - get the groups tiles
                this._updateGroupModelWithTilesViews(aGroups[i].tiles, startTile, handledUpdatesIndex);
                if (aGroups[i].links) {
                    this._updateGroupModelWithTilesViews(aGroups[i].links, startTile, handledUpdatesIndex, true);
                    if (aGroups[i].pendingLinks.length > 0) {
                        if (!aGroups[i].links) {
                            aGroups[i].links = [];
                        }
                        aGroups[i].links = aGroups[i].links.concat(aGroups[i].pendingLinks);
                        aGroups[i].pendingLinks = [];
                    }
                }
            }

            // clear the handled updates from the tempTileViewUpdateQueue and set the model
            var tempTileViewUpdateQueue = []; var tileViewUpdateQueueIndex;
            for (tileViewUpdateQueueIndex = 0; tileViewUpdateQueueIndex < this.tileViewUpdateQueue.length; tileViewUpdateQueueIndex++) {
                if (handledUpdatesIndex.indexOf(tileViewUpdateQueueIndex) === -1) {
                    tempTileViewUpdateQueue.push(this.tileViewUpdateQueue[tileViewUpdateQueueIndex]);
                }
            }
            this.tileViewUpdateQueue = tempTileViewUpdateQueue;

            this.oModel.setProperty("/groups", aGroups);
        },

        getModelTileById: function (sId, sItems) {
            var aGroups = this.oModel.getProperty("/groups");
            var oModelTile;
            var bFound = false;
            aGroups.every(function (oGroup) {
                oGroup[sItems].every(function (oTile) {
                    if (oTile.uuid === sId || oTile.originalTileId === sId) {
                        oModelTile = oTile;
                        bFound = true;
                    }
                    return !bFound;
                });
                return !bFound;
            });
            return oModelTile;
        },

        _attachLinkPressHandlers: function (oView) {
            var oEventBus = Core.getEventBus();
            var oTileView = oView.attachPress ? oView : oView.getContent()[0]; // a hack to support demoContent
            oTileView.attachPress(function (oEvent) {
                var bTileBeingMoved = oView.getBindingContext().getObject().tileIsBeingMoved;
                if (!bTileBeingMoved && this.getScope && this.getScope() === "Actions") {
                    switch (oEvent.getParameters().action) {
                        case "Press":
                            var sState = oView.getState ? oView.getState() : "";
                            if (sState !== "Failed") {
                                var oActionMode = sap.ui.require("sap/ushell/components/homepage/ActionMode");

                                if (oActionMode) {
                                    oActionMode._openActionsMenu(oEvent);
                                } else {
                                    Log.error("Race condition occurred! - sap/ushell/components/homepage/ActionMode was not required in time.");
                                }
                            }
                            break;
                        case "Remove":
                            var tileUuid = oView.getBindingContext().getObject().uuid;
                            oEventBus.publish("launchpad", "deleteTile", { tileId: tileUuid, items: "links" });
                            break;
                        default: break;
                    }
                } else {
                    oEventBus.publish("launchpad", "dashboardTileLinkClick");
                }
            });
        },

        handleDisplayModeChange: function (sNewDisplayModel) {
            this.oModel.setProperty("/homePageGroupDisplay", sNewDisplayModel);
            switch (sNewDisplayModel) {
                case "scroll":
                    this._handleDisplayModeChangeToScroll();
                    break;
                case "tabs":
                    this._handleDisplayModeChangeToTabs();
                    break;
                //no default
            }
        },

        _handleDisplayModeChangeToTabs: function () {
            var iSelectedGroup = this.oModel.getProperty("/iSelectedGroup");
            var aGroups = this.oModel.getProperty("/groups");

            this.oDashboardLoadingManager.manageTilesView();

            if (aGroups.length > 0) {
                // update selected group based on selected anchor item
                for (var i = 0; i < aGroups.length; i++) {
                    this.oModel.setProperty("/groups/" + i + "/isGroupSelected", false);
                }

                this.oModel.setProperty("/groups/" + iSelectedGroup + "/isGroupSelected", true);
            }
        },

        _handleDisplayModeChangeToScroll: function () {
            if (this.isBlindLoading()) {
                return;
            }

            var aGroups = this.oModel.getProperty("/groups");
            var aLinks = [];
            var j;

            for (var i = 0; i < aGroups.length; i++) {
                var oGroup = aGroups[i];
                var aTiles = oGroup.tiles || [];
                for (j = 0; j < aTiles.length; j++) {
                    var oTile = aTiles[j];
                    if (oTile.content.length === 0) {
                        this.getTileView(oTile, i);
                    }
                }
                aLinks = oGroup.links || [];
                // need to update all link views
                for (j = 0; j < aLinks.length; j++) {
                    this.getTileView(aLinks[j], i);
                }
            }
            this.oModel.refresh(false);

            var iSelectedGroupIndex = this.oModel.getProperty("/iSelectedGroup");

            if (iSelectedGroupIndex) {
                setTimeout(function () {
                    Core.getEventBus().publish("launchpad", "scrollToGroup", {
                        groupId: aGroups[iSelectedGroupIndex].groupId
                    });
                }, 100);
            }
        },

        getTileViewsFromArray: function (aRequestTileViews) {
            var that = this;

            if (aRequestTileViews.length === 0) {
                return;
            }
            aRequestTileViews.forEach(function (oRequestTileView) {
                that.getTileView(oRequestTileView.oTile, oRequestTileView.iGroup);
            });
            // trigger to refresh binding.
            // It is skipped for standard tiles in getTileView and done once here (performance reason)
            // Refreshing for custom tiles is in getTileView after promise is resolved
            this.oModel.refresh(false);
            if (this.bIsFirstSegmentViewLoaded === false) {
                this.bIsFirstSegmentViewLoaded = true;
                oEventHub.emit("firstSegmentCompleteLoaded", true);
            }
        },

        /**
         * Triggers the loading of a tile, link or card
         *
         * @param {object} tileOrCard The tile, link or card
         * @param {int} groupPosition The group position
         * @private
         */
        getTileView: function (tileOrCard, groupPosition) {
            var sType = this.oPageOperationAdapter.getTileType(tileOrCard.object);

            if (this.oDashboardLoadingManager.isTileViewRequestIssued(tileOrCard)) {
                // No need to get the tile view, the request was already issued.
                return;
            }
            this.oDashboardLoadingManager.setTileInProgress(tileOrCard);
            this.oPageOperationAdapter.setTileVisible(tileOrCard.object, false);
            if (sType === "card") {
                this._loadCardData(tileOrCard);
            } else {
                this._loadTileData(tileOrCard, groupPosition, sType);
            }
        },

        /**
         * Triggers the loading of the manifest for a card
         *
         * @param {object} card The card that needs to be loaded
         * @private
         */
        _loadCardData: function (card) {
            var oCard = Core.byId(card.controlId);

            if (oCard && oCard.setManifest && this.isBlindLoading()) {
                oCard.setManifest(card.manifest);
            }
            card.content = [card.manifest];
            this.oDashboardLoadingManager.setTileResolved(card);
        },

        getCurrentHiddenGroupIds: function (oModel) {
            return this.oPageOperationAdapter.getCurrentHiddenGroupIds(oModel);
        },

        /**
         * Loads the model data and enriches a tile, link or card on the homepage via bound properties
         *
         * @param {object} tile The tile or card
         * @param {int} groupPosition The group position
         * @param {string} tileType The actual type of the tile, link or card
         * @private
         */
        _loadTileData: function (tile, groupPosition, tileType) {
            var that = this;
            var oDfd = this.oPageOperationAdapter.getTileView(tile);
            var oGroupLinks;
            var fUpdateModelWithView = this._addModelToTileViewUpdateQueue;
            var oTileView;
            var bNeedRefreshLinks = false;
            var sTileUUID = tile.uuid;
            var bSkipModelUpdate = false;

            // The Deferred is already resolved for standard tiles.
            // The goal is to update the model for standard tiles in one place in order to trigger invalidation once.
            // Dynamic tiles will update the model when the Deferred is resolved.
            if (oDfd.state() === "resolved") {
                bSkipModelUpdate = true;
            }

            // Register done and fail handlers for the getTileView API.
            oDfd.done(function (oView) {
                // Set the value of the target when the view is valid and make sure it is not a custom tile
                if (oView.oController && oView.oController.navigationTargetUrl && !tile.isCustomTile) {
                    tile.target = oView.oController.navigationTargetUrl;
                }

                oTileView = oView;

                // In CDM content, the tile's view should have this function
                if (oTileView.getComponentInstance) {
                    Measurement.average("FLP:getComponentInstance", "get info for navMode", "FLP1");
                    var oCompData = oTileView.getComponentInstance().getComponentData();

                    if (oCompData && oCompData.properties) {
                        tile.navigationMode = oCompData.properties.navigationMode;
                    }

                    Measurement.end("FLP:getComponentInstance");
                }

                that.oDashboardLoadingManager.setTileResolved(tile);
                var sMode = oView.getMode ? oView.getMode() : "ContentMode";

                // If the tileType is link and the personalization is supported by the platform, the the link must support personalization
                if (that.bLinkPersonalizationSupported && sMode === "LineMode") {
                    that._attachLinkPressHandlers(oTileView);

                    if (groupPosition >= 0) {
                        var aGroups = that.oModel.getProperty("/groups");

                        if (aGroups[groupPosition]) {
                            tile.content = [oTileView];
                            oGroupLinks = that.oModel.getProperty("/groups/" + groupPosition + "/links");
                            that.oModel.setProperty("/groups/" + groupPosition + "/links", []);
                            that.oModel.setProperty("/groups/" + groupPosition + "/links", oGroupLinks);
                        }
                    }
                } else if (that.isBlindLoading()) {
                    if (tile.content && tile.content.length > 0) {
                        tile.content[0].destroy();
                    }

                    tile.content = [oTileView];

                    if (groupPosition >= 0 && !bSkipModelUpdate) {
                        that.oModel.refresh(false);
                    }
                }

                if (that.isBlindLoading()) {
                    // in some cases tile size can be different then the initial value therefore we read and set the size again
                    var sSize = that.oPageOperationAdapter.getTileSize(tile.object);
                    var bLong = sSize === "1x2";
                    if (tile.long !== bLong) {
                        tile.long = bLong;
                    }
                } else if (sMode === "LineMode") {
                    tile.content = [oTileView];

                    if (bNeedRefreshLinks) {
                        oGroupLinks = that.oModel.getProperty("/groups/" + groupPosition + "/links");
                        that.oModel.setProperty("/groups/" + groupPosition + "/links", []);
                        that.oModel.setProperty("/groups/" + groupPosition + "/links", oGroupLinks);
                    }
                } else if (tile.content.length === 0) {
                    tile.content = [oTileView];
                } else {
                    fUpdateModelWithView.apply(that, [sTileUUID, oTileView]);
                    that._updateModelWithTileView(0, 0);
                }
            });

            oDfd.fail(function () {
                if (that.oPageOperationAdapter.getTileType(tile.object) === "link" && that.bLinkPersonalizationSupported) {
                    // In case call is synchronize we set the view with 'TileState' control with 'Failed' status
                    oTileView = that.oPageOperationAdapter.getFailedLinkView(tile);
                    that._attachLinkPressHandlers(oTileView);
                } else {
                    oTileView = new TileState({ state: "Failed" });
                }
                tile.content = [oTileView];
            });

            if (!oTileView) {
                if (that.oPageOperationAdapter.getTileType(tile.object) === "link") {
                    bNeedRefreshLinks = true;
                    oTileView = new GenericTile({
                        mode: "LineMode"
                    });
                } else {
                    oTileView = new TileState();
                }
                tile.content = [oTileView];
            }
        },

        loadLibraryForCardModuleIfNeeded: function () {
            if (Config.last("/core/home/featuredGroup/enable")) {
                return Core.loadLibrary("sap.ui.integration", { async: true });
            }
            return Promise.resolve();
        },
        /*
         * Load all user groups from the backend. (Triggered on initial page load.)
         */
        loadPersonalizedGroups: function () {
            var that = this;
            var oDeferred = new jQuery.Deferred();

            if (this.bIsGroupsRequestPending) {
                Log.info("loadPersonalizedGroups was skipped because there is already a pending request.");
                oDeferred.reject();
                return oDeferred.promise();
            }
            this.bIsGroupsRequestPending = true;

            this.oServiceLoadingPromise
                .then(that.loadLibraryForCardModuleIfNeeded)
                .then(function () {
                    return that.oPageOperationAdapter.getPage();
                })
                .then(function (aGroups) {
                    that._setGroupModel(aGroups);
                    that.bIsGroupsRequestPending = false;
                    oDeferred.resolve();
                })
                .catch(function (vError) {
                    Log.error("Loading of personalized groups failed.", vError, "sap.ushell.components.HomepageManager");
                    oMessagingHelper.showLocalizedError("fail_to_load_groups_msg");
                    that.bIsGroupsRequestPending = false;
                });

            Measurement.start("FLP:DashboardManager.loadPersonalizedGroups", "loadPersonalizedGroups", "FLP");

            return oDeferred.promise();
        }
    });

    oHomepageManager.prototype.getInstance = function () {
        return oHomepageManagerInstance;
    };

    return oHomepageManager;
});
