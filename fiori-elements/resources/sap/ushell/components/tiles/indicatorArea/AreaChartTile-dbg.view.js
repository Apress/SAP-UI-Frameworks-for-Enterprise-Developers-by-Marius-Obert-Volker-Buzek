// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Area Chart Tile
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/ui/core/mvc/JSView", // Do not remove
    "sap/ushell/components/tiles/indicatorTileUtils/oData4Analytics", // Do not remove
    "sap/ushell/components/tiles/indicatorTileUtils/smartBusinessUtil", // Do not remove
    "sap/suite/ui/microchart/AreaMicroChartItem",
    "sap/suite/ui/microchart/AreaMicroChartPoint",
    "sap/suite/ui/microchart/AreaMicroChartLabel",
    "sap/m/library",
    "sap/suite/ui/microchart/AreaMicroChart",
    "sap/m/GenericTile",
    "sap/ui/model/json/JSONModel"
    // "sap/ushell/components/tiles/sbtilecontent" // do not migrate
], function (
    JSView,
    odata4analytics,
    smartBusinessUtil,
    AreaMicroChartItem,
    AreaMicroChartPoint,
    AreaMicroChartLabel,
    MobileLibrary,
    AreaMicroChart,
    GenericTile,
    JSONModel
    // sbtilecontent // do not migrate
) {
    "use strict";

    // shortcut for sap.m.LoadState
    var LoadState = MobileLibrary.LoadState;

    sap.ui.getCore().loadLibrary("sap.suite.ui.microchart");

    sap.ui.jsview("sap.ushell.components.tiles.indicatorArea.AreaChartTile", {
        getControllerName: function () {
            return "sap.ushell.components.tiles.indicatorArea.AreaChartTile";
        },

        createContent: function (/*oController*/) {
            this.setHeight("100%");
            this.setWidth("100%");
            var header = "Lorem ipsum";
            var subheader = "Lorem ipsum";
            var Size = MobileLibrary.Size;

            var titleObj = sap.ushell.components.tiles.indicatorTileUtils.util.getTileTitleSubtitle(
                this.getViewData().chip);
            if (titleObj.title && titleObj.subTitle) {
                header = titleObj.title;
                subheader = titleObj.subTitle;
            }
            var buildChartItem = function (sName) {
                return new AreaMicroChartItem({
                    color: "Good",
                    points: {
                        path: "/" + sName + "/data",
                        template: new AreaMicroChartPoint({
                            x: "{day}",
                            y: "{balance}"

                        })
                    }
                });
            };

            var buildMACLabel = function (sName) {
                return new AreaMicroChartLabel({
                    label: "{/" + sName + "/label}",
                    color: "{/" + sName + "/color}"
                });
            };

            var oGenericTileData = {
                subheader: subheader,
                header: header,
                footerNum: "",
                footerComp: "",
                scale: "",
                unit: "",
                value: 8888,
                size: "Auto",
                frameType: "OneByOne",
                state: LoadState.Loading
            };

            this.oNVConfContS = new AreaMicroChart({
                width: "{/width}",
                height: "{/height}",
                size: Size.Responsive,
                target: buildChartItem("target"),
                innerMinThreshold: buildChartItem("innerMinThreshold"),
                innerMaxThreshold: buildChartItem("innerMaxThreshold"),
                minThreshold: buildChartItem("minThreshold"),
                maxThreshold: buildChartItem("maxThreshold"),
                chart: buildChartItem("chart"),
                minXValue: "{/minXValue}",
                maxXValue: "{/maxXValue}",
                minYValue: "{/minYValue}",
                maxYValue: "{/maxYValue}",
                firstXLabel: buildMACLabel("firstXLabel"),
                lastXLabel: buildMACLabel("lastXLabel"),
                firstYLabel: buildMACLabel("firstYLabel"),
                lastYLabel: buildMACLabel("lastYLabel"),
                minLabel: buildMACLabel("minLabel"),
                maxLabel: buildMACLabel("maxLabel")
            });

            this.oNVConfS = new sap.ushell.components.tiles.sbtilecontent({
                unit: "{/unit}",
                size: "{/size}",
                footer: "{/footerNum}",
                content: this.oNVConfContS
            });

            this.oGenericTile = new GenericTile({
                subheader: "{/subheader}",
                frameType: "{/frameType}",
                size: "{/size}",
                header: "{/header}",
                tileContent: [this.oNVConfS]
            });

            var oGenericTileModel = new JSONModel();
            oGenericTileModel.setData(oGenericTileData);
            this.oGenericTile.setModel(oGenericTileModel);

            return this.oGenericTile;
        }
    });
}, /* bExport= */ true);
