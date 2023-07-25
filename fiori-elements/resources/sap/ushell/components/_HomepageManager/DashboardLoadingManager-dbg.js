// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/deepExtend",
    "sap/ui/base/Object",
    "sap/ui/performance/Measurement"
], function (
    deepExtend,
    BaseObject,
    Measurement
) {
    "use strict";

    var DashboardLoadingManager = BaseObject.extend("sap.ushell.components._HomepageManager.DashboardLoadingManager", {
        metadata: {},

        constructor: function (sId, mSettings) {
            var oEventBus = sap.ui.getCore().getEventBus();

            this.currentVisibleTiles = [];
            this.aRefreshTiles = [];
            this.oBusyIndicatorTiles = {};
            this.oActiveDynamicTiles = {};
            this.oResolvedTiles = {};
            this.oInProgressTiles = {};
            this.oDashboardManager = mSettings.oDashboardManager;

            oEventBus.subscribe("launchpad", "visibleTilesChanged", this._onVisibilityChanged, this);
            oEventBus.subscribe("launchpad", "dashboardTileClick", this._addTileToRefreshArray, this);
            oEventBus.subscribe("launchpad", "refreshTiles", this._refreshTiles, this);
            oEventBus.subscribe("launchpad", "setTilesNoVisibility", this._setTilesNoVisibility, this);
            oEventBus.subscribe("launchpad", "onHiddenTab", this._setTilesNoVisibility, this);
        },

        _onVisibilityChanged: function (sChannelId, sEventId, aVisibleTiles) {
            this.currentVisibleTiles = aVisibleTiles;
            if (this.oDashboardManager.isBlindLoading()) {
                this.manageTilesView();
            }

            this.oDashboardManager.tabsModeVisibilityChanged();

            this.manageBusyIndicatorTiles();
            this.manageDynamicTiles();
        },

        manageDynamicTiles: function () {
            Measurement.average("DashboardLoadingManagerActiveDynamicTile", "Manage Active Dynamic Tiles", "FLP_SHELL");

            var oTile;
            var oTileObject;
            var oNewActiveDynamicTiles = {};
            var oCloneActiveTiles = deepExtend({}, this.oActiveDynamicTiles);

            //handle old dynamic tiles (that not exist in the visible tile that will be handle next in loop
            for (var index = 0; index < this.currentVisibleTiles.length; index++) {
                var oVisTile = this.currentVisibleTiles[index];
                if (!oVisTile.bIsExtanded) {
                    delete oCloneActiveTiles[oVisTile.oTile.uuid];
                }
            }

            for (var oKey in oCloneActiveTiles) {
                oTile = this.oActiveDynamicTiles[oKey];
                oTileObject = oTile.object;
                this.oDashboardManager.setTileVisible(oTile, false);
            }
            // handle visible  dynamic tiles
            for (var iVisibleTileIndex = 0; iVisibleTileIndex < this.currentVisibleTiles.length; iVisibleTileIndex++) {
                var oVisObj = this.currentVisibleTiles[iVisibleTileIndex];
                if (!oVisObj.bIsExtanded) {
                    oTile = oVisObj.oTile;
                    //refresh only the tiles that are not part of the active dynamic tiles and handled
                    oTileObject = oTile.object;
                    if (this.oActiveDynamicTiles[oTile.uuid] === undefined && oTileObject) {
                        this.oDashboardManager.setTileVisible(oTile, true);
                    }
                    oNewActiveDynamicTiles[oTile.uuid] = oTile;
                }
            }

            this.oActiveDynamicTiles = oNewActiveDynamicTiles;
            Measurement.end("DashboardLoadingManagerActiveDynamicTile");
        },

        isTileViewRequestIssued: function (oTile) {
            if (this.oInProgressTiles[oTile.uuid] === undefined && this.oResolvedTiles[oTile.uuid] === undefined) {
                return false;
            }
            return true;
        },

        manageBusyIndicatorTiles: function () {
            Measurement.average("DashboardLoadingManagerBusyIndicators", "Manage Busy Indicators on Tiles", "FLP_SHELL");

            var iVisibleTileIndex,
                oCurrentKey,
                oCurrentTile,
                oOtherBusyIndicatorTile,
                aRemoveBusyIndicator = [],
                bIsInVisibleTile,
                aAddBusyIndicator = [];

            //remove busy indicators.
            //this.oBusyIndicatorTiles - this.currentVisibleTiles
            for (oCurrentKey in this.oBusyIndicatorTiles) {
                bIsInVisibleTile = true;
                oOtherBusyIndicatorTile = this.oBusyIndicatorTiles[oCurrentKey];
                if (this.oResolvedTiles[oCurrentKey] === undefined) {
                    for (var i = 0; i < this.currentVisibleTiles.length; i++) {
                        if (this.currentVisibleTiles[i].oTile.uuid === oOtherBusyIndicatorTile.oTile.uuid) {
                            bIsInVisibleTile = false;
                            break;
                        }
                    }

                    if (bIsInVisibleTile) {
                        aRemoveBusyIndicator.push(oOtherBusyIndicatorTile);
                    }
                }
            }

            //calculate busy indicators.
            //this.currentVisibleTiles - this.oBusyIndicatorTiles - this.oResolvedTiles
            for (iVisibleTileIndex = 0; iVisibleTileIndex < this.currentVisibleTiles.length; iVisibleTileIndex++) {
                oCurrentTile = this.currentVisibleTiles[iVisibleTileIndex];
                if (this.oBusyIndicatorTiles[oCurrentTile.oTile.uuid] === undefined && this.oResolvedTiles[oCurrentTile.oTile.uuid] === undefined) {
                    aAddBusyIndicator.push(oCurrentTile);
                }
            }

            //manage remove busy indicator.
            for (iVisibleTileIndex = 0; iVisibleTileIndex < aRemoveBusyIndicator.length; iVisibleTileIndex++) {
                oCurrentTile = aRemoveBusyIndicator[iVisibleTileIndex];
                //set tile view to none.
                if (oCurrentTile.oTile.content[0] && oCurrentTile.oTile.content[0].setState) {
                    if (oCurrentTile.oTile.content[0].getState) {
                        if (oCurrentTile.oTile.content[0].getState() !== "Failed") {
                            oCurrentTile.oTile.content[0].setState();
                        }
                    } else {
                        oCurrentTile.oTile.content[0].setState();
                    }
                }
                //update this.oBusyIndicatorTiles.
                delete this.oBusyIndicatorTiles[oCurrentTile.oTile.uuid];
            }

            //manage add busy indicator.
            for (iVisibleTileIndex = 0; iVisibleTileIndex < aAddBusyIndicator.length; iVisibleTileIndex++) {
                oCurrentTile = aAddBusyIndicator[iVisibleTileIndex];
                //set tile view to busy.
                if (oCurrentTile.oTile.content[0] && oCurrentTile.oTile.content[0].setState) {
                    if (oCurrentTile.oTile.content[0].getState) {
                        if (oCurrentTile.oTile.content[0].getState() !== "Failed") {
                            oCurrentTile.oTile.content[0].setState("Loading");
                        }
                    } else {
                        oCurrentTile.oTile.content[0].setState("Loading");
                    }
                }
                //update this.oBusyIndicatorTiles.
                this.oBusyIndicatorTiles[oCurrentTile.oTile.uuid] = oCurrentTile;
            }

            Measurement.end("DashboardLoadingManagerBusyIndicators");
        },

        setTileInProgress: function (oTile) {
            this.oInProgressTiles[oTile.uuid] = oTile;
        },

        setTileResolved: function (oTile) {
            delete this.oInProgressTiles[oTile.uuid];
            this.oResolvedTiles[oTile.uuid] = oTile;
        },

        _addTileToRefreshArray: function (sChannelId, sEventId, oData) {
            this.aRefreshTiles.push(oData.uuid);
        },

        _refreshTiles: function () {
            for (var iVisibleTileIndex = 0; iVisibleTileIndex < this.currentVisibleTiles.length; iVisibleTileIndex++) {
                var oTile = this.currentVisibleTiles[iVisibleTileIndex].oTile;
                var tileObject = oTile.object;
                if (tileObject) {
                    for (var iRefreshTilesIndex = 0; iRefreshTilesIndex < this.aRefreshTiles.length; iRefreshTilesIndex++) {
                        if (oTile.uuid === this.aRefreshTiles[iRefreshTilesIndex]) {
                            this.aRefreshTiles.splice(iRefreshTilesIndex, 1);
                            this.oDashboardManager.setTileVisible(oTile, true);
                            this.oDashboardManager.refreshTile(oTile);
                            break;
                        }
                    }
                }
            }
        },

        _setTilesNoVisibility: function () {
            for (var iVisibleTileIndex = 0; iVisibleTileIndex < this.currentVisibleTiles.length; iVisibleTileIndex++) {
                var oTile = this.currentVisibleTiles[iVisibleTileIndex].oTile;
                var tileObject = oTile.object;
                if (tileObject) {
                    this.oDashboardManager.setTileVisible(oTile, false);
                }
                delete this.oActiveDynamicTiles[oTile.uuid];
            }
        },

        manageTilesView: function () {
            var iVisibleTileIndex,
                oCurrentTile,
                aRequestTileView = [];

            for (iVisibleTileIndex = 0; iVisibleTileIndex < this.currentVisibleTiles.length; iVisibleTileIndex++) {
                oCurrentTile = this.currentVisibleTiles[iVisibleTileIndex];

                if (this.oInProgressTiles[oCurrentTile.oTile.uuid] === undefined && this.oResolvedTiles[oCurrentTile.oTile.uuid] === undefined) {
                    aRequestTileView.push(oCurrentTile);
                }
            }

            this.oDashboardManager.getTileViewsFromArray(aRequestTileView);
        }
    });

    return DashboardLoadingManager;
});
