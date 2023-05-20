// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Harvey Ball Tile
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.require([
    "sap/ca/ui/model/format/NumberFormat", // Do not remove
    "sap/ui/model/analytics/odata4analytics", // Do not remove
    "sap/ushell/components/tiles/indicatorTileUtils/smartBusinessUtil", // Do not remove
    "sap/suite/ui/commons/HarveyBallMicroChart",
    "sap/suite/ui/commons/HarveyBallMicroChartItem",
    "sap/suite/ui/commons/TileContent",
    "sap/suite/ui/commons/GenericTile"
], function (
    NumberFormat,
    odata4analytics,
    smartBusinessUtil,
    HarveyBallMicroChart,
    HarveyBallMicroChartItem,
    TileContent,
    GenericTile
) {
    "use strict";

    sap.ui.getCore().loadLibrary("sap.suite.ui.commons");

    sap.ui.jsview("tiles.indicatorHarveyBall.HarveyBallTile", {
        getControllerName: function () {
            //return "tiles.indicatorHarveyBall.HarveyBallTile"; // comment to prevent the tile from loading
        },

        createContent: function (/*oController*/) {
            var microChart = new HarveyBallMicroChart({
                total: "{/value}",
                size: "{/size}",
                totalLabel: "{/totalLabel}",
                items: [new HarveyBallMicroChartItem({
                    fraction: "{/fractionValue}",
                    fractionLabel: "{/fractionLabel}",
                    color: "{/color}"
                })]
            });

            var tileContent = new TileContent({
                size: "{/size}",
                content: microChart
            });

            this.oTile = new GenericTile({
                subheader: "{/subheader}",
                frameType: "{/frameType}",
                size: "{/size}",
                header: "{/header}",
                tileContent: [tileContent]
            });
            //return this.oTile; // comment to prevent the tile from loading
        }
    });
});
