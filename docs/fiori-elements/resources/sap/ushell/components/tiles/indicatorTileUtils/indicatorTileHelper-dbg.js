// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Indicator Tile Helper
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
(function () {
    "use strict";

    jQuery.sap.declare("sap.ushell.components.tiles.indicatorTileUtils.indicatorTileHelper");

    sap.ushell.components.tiles.indicatorTileUtils.indicatorTileHelper = function (tile) {
        this.tile = tile;
    };

    sap.ushell.components.tiles.indicatorTileUtils.indicatorTileHelper.prototype.setErrorState = function () {
        this.getTile().setState(sap.suite.ui.commons.LoadState.Failed);
    };

    sap.ushell.components.tiles.indicatorTileUtils.indicatorTileHelper.prototype.setLoadingState = function () {
        this.getTile().setState(sap.suite.ui.commons.LoadState.Loading);
    };

    sap.ushell.components.tiles.indicatorTileUtils.indicatorTileHelper.prototype.setLoadedState = function () {
        this.getTile().setState(sap.suite.ui.commons.LoadState.Loaded);
    };

    sap.ushell.components.tiles.indicatorTileUtils.indicatorTileHelper.prototype.setTrendDown = function () {
        this.getTile().setIndicator(sap.suite.ui.commons.DeviationIndicator.Down);
    };

    sap.ushell.components.tiles.indicatorTileUtils.indicatorTileHelper.prototype.setTrendUp = function () {
        this.getTile().setIndicator(sap.suite.ui.commons.DeviationIndicator.Up);
    };

    sap.ushell.components.tiles.indicatorTileUtils.indicatorTileHelper.prototype.setTrendNeutral = function () {
        this.getTile().setIndicator(sap.suite.ui.commons.DeviationIndicator.None);
    };

    sap.ushell.components.tiles.indicatorTileUtils.indicatorTileHelper.prototype.setThresholdGood = function () {
    };

    sap.ushell.components.tiles.indicatorTileUtils.indicatorTileHelper.prototype.setThresholdBad = function () {
    };

    sap.ushell.components.tiles.indicatorTileUtils.indicatorTileHelper.prototype.setThresholdCritical = function () {
    };

    sap.ushell.components.tiles.indicatorTileUtils.indicatorTileHelper.prototype.setThresholdNeutral = function () {
    };

    sap.ushell.components.tiles.indicatorTileUtils.indicatorTileHelper.prototype.calculateThreshold = function (/*actualValue, variantValue, improvementDirection*/) {
    };

    sap.ushell.components.tiles.indicatorTileUtils.indicatorTileHelper.prototype.setTile = function (tile) {
        this.tile = tile;
    };

    sap.ushell.components.tiles.indicatorTileUtils.indicatorTileHelper.prototype.getTile = function () {
        return this.tile;
    };
}());
