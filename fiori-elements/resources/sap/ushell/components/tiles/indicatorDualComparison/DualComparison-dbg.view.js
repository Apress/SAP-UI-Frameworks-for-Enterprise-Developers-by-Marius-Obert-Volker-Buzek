// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Dual Comparison Tile
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/ui/core/mvc/JSView", // Do not remove
    "sap/ca/ui/model/format/NumberFormat", // Do not remove
    "sap/ui/model/analytics/odata4analytics", // Do not remove
    "sap/ushell/components/tiles/indicatorTileUtils/smartBusinessUtil", // Do not remove
    "sap/m/NumericContent",
    "sap/m/TileContent",
    "sap/suite/ui/microchart/ComparisonMicroChartData",
    "sap/suite/ui/microchart/ComparisonMicroChart",
    "sap/m/GenericTile",
    "sap/ui/model/json/JSONModel"
], function (
    JSView,
    NumberFormat,
    odata4analytics,
    smartBusinessUtil,
    NumericContent,
    TileContent,
    ComparisonMicroChartData,
    ComparisonMicroChart,
    GenericTile,
    JSONModel
) {
    "use strict";

    sap.ui.getCore().loadLibrary("sap.suite.ui.microchart");

    sap.ui.jsview("tiles.indicatorDualComparison.DualComparison", {
        getControllerName: function () {
            return "tiles.indicatorDualComparison.DualComparison";
        },

        createContent: function () {
            this.setHeight("100%");
            this.setWidth("100%");

            var that = this;

            that.oGenericTileData = {};

            that.oNumericContent = new NumericContent({
                value: "{/value}",
                scale: "{/scale}",
                unit: "{/unit}",
                indicator: "{/indicator}",
                size: "{/size}",
                formatterValue: true,
                truncateValueTo: 6,
                valueColor: "{/valueColor}"
            });

            that.oNumericTile = new TileContent({
                unit: "{/unit}",
                size: "{/size}",
                footer: "{/footerNum}",
                content: that.oNumericContent
            });

            that.oCmprsDataTmpl = new ComparisonMicroChartData({
                title: "{title}",
                value: "{value}",
                color: "{color}",
                displayValue: "{displayValue}"
            });

            that.oCmprsChrtTmpl = new ComparisonMicroChart({
                size: "{/size}",
                scale: "{/scale}",
                data: {
                    template: that.oCmprsDataTmpl,
                    path: "/data"
                }
            });

            that.oComparisonTile = new TileContent({
                unit: "{/unit}",
                size: "{/size}",
                footer: "{/footerComp}",
                content: that.oCmprsChrtTmpl
            });

            that.oGenericTile = new GenericTile({
                subheader: "{/subheader}",
                frameType: "{/frameType}",
                size: "{/size}",
                header: "{/header}",
                tileContent: [that.oNumericTile, that.oComparisonTile]
            });

            that.oGenericTileModel = new JSONModel();
            that.oGenericTileModel.setData(that.oGenericTileData);
            that.oGenericTile.setModel(that.oGenericTileModel);

            return that.oGenericTile;
        }
    });
}, /* bExport= */ true);
