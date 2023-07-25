// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Dual Tile
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/ui/core/mvc/JSView", // Do not remove
    "sap/ushell/components/tiles/indicatorTileUtils/oData4Analytics", // Do not remove
    "sap/ushell/components/tiles/indicatorTileUtils/smartBusinessUtil", // Do not remove
    "sap/ushell/components/tiles/sbtilecontent",
    "sap/m/NumericContent",
    "sap/suite/ui/microchart/ComparisonMicroChartData",
    "sap/suite/ui/microchart/ComparisonMicroChart",
    "sap/suite/ui/microchart/AreaMicroChartItem",
    "sap/suite/ui/microchart/AreaMicroChartPoint",
    "sap/suite/ui/microchart/AreaMicroChartLabel",
    "sap/suite/ui/microchart/AreaMicroChart",
    "sap/suite/ui/microchart/BulletMicroChartData",
    "sap/suite/ui/microchart/BulletMicroChart",
    "sap/m/library",
    "sap/m/GenericTile",
    "sap/ui/model/json/JSONModel"
], function (
    JSView,
    oData4Analytics,
    smartBusinessUtil,
    sbtilecontent,
    NumericContent,
    ComparisonMicroChartData,
    ComparisonMicroChart,
    AreaMicroChartItem,
    AreaMicroChartPoint,
    AreaMicroChartLabel,
    AreaMicroChart,
    BulletMicroChartData,
    BulletMicroChart,
    mobileLibrary,
    GenericTile,
    JSONModel
) {
    "use strict";

    // shortcut for sap.m.Size
    var Size = mobileLibrary.Size;

    sap.ui.getCore().loadLibrary("sap.suite.ui.microchart");

    sap.ui.jsview("sap.ushell.components.tiles.indicatorDual.DualTile", {
        getControllerName: function () {
            return "sap.ushell.components.tiles.indicatorDual.DualTile";
        },
        createContent: function () {
            this.setHeight("100%");
            this.setWidth("100%");

            var that = this;
            that.oGenericTileData = {};
            sap.ushell.components.tiles.indicatorTileUtils.util.getParsedChip(
                that.getViewData().chip.configuration.getParameterValueAsString("tileConfiguration"), that.getViewData().chip.preview.isEnabled(), function (config) {
                    that.oConfig = config;
                });
            that.tileType = that.oConfig.TILE_PROPERTIES.tileType;

            that.oNumericContent = new NumericContent({
                value: "{/value}",
                scale: "{/scale}",
                unit: "{/unit}",
                indicator: "{/indicator}",
                size: "{/size}",
                formatterValue: "{/isFormatterValue}",
                truncateValueTo: 5,
                valueColor: "{/valueColor}",
                nullifyValue: false
            });

            that.oLeftTileContent = new sap.ushell.components.tiles.sbtilecontent({
                unit: "{/unit}",
                size: "{/size}",
                footer: "{/footerNum}",
                content: that.oNumericContent
            });

            var oCmprsData;

            switch (that.tileType) {
                case "DT-CM":
                    oCmprsData = new ComparisonMicroChartData({
                        title: "{title}",
                        value: "{value}",
                        color: "{color}",
                        displayValue: "{displayValue}"
                    });

                    that.oComparisionContent = new ComparisonMicroChart({
                        size: "{/size}",
                        scale: "{/scale}",
                        data: {
                            template: oCmprsData,
                            path: "/data"
                        }
                    });

                    that.oRightContent = new sap.ushell.components.tiles.sbtilecontent({
                        unit: "{/unit}",
                        size: "{/size}",
                        footer: "{/footerNum}",
                        content: that.oComparisionContent
                    });
                    break;

                case "DT-CT":
                    oCmprsData = new ComparisonMicroChartData({
                        title: "{title}",
                        value: "{value}",
                        color: "{color}",
                        displayValue: "{displayValue}"
                    });

                    that.oContributionContent = new ComparisonMicroChart({
                        size: "{/size}",
                        scale: "{/scale}",
                        data: {
                            template: oCmprsData,
                            path: "/data"
                        }
                    });

                    that.oRightContent = new sap.ushell.components.tiles.sbtilecontent({
                        unit: "{/unit}",
                        size: "{/size}",
                        footer: "{/footerNum}",
                        content: that.oContributionContent
                    });
                    break;

                case "DT-TT":
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
                    var areaChart = new AreaMicroChart({
                        width: "{/width}",
                        height: "{/height}",
                        size: "{/size}",
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

                    that.oRightContent = new sap.ushell.components.tiles.sbtilecontent({
                        unit: "{/unit}",
                        size: "{/size}",
                        content: areaChart
                    });
                    break;

                case "DT-AT":
                    var oBCDataTmpl = new BulletMicroChartData({
                        value: "{value}",
                        color: "{color}"
                    });

                    var oBChart = new BulletMicroChart({
                        size: Size.Auto,
                        scale: "{/scale}",
                        actual: {
                            value: "{/actual/value}",
                            color: "{/actual/color}"
                        },
                        targetValue: "{/targetValue}",
                        actualValueLabel: "{/actualValueLabel}",
                        targetValueLabel: "{/targetValueLabel}",
                        thresholds: {
                            template: oBCDataTmpl,
                            path: "/thresholds"
                        },
                        state: "{/state}",
                        showActualValue: "{/showActualValue}",
                        showTargetValue: "{/showTargetValue}"
                    });

                    that.oRightContent = new sap.ushell.components.tiles.sbtilecontent({
                        unit: "{/unit}",
                        size: "{/size}",
                        footer: "{/footerNum}",
                        content: oBChart
                    });
                    break;
            }

            that.oGenericTile = new GenericTile({
                subheader: "{/subheader}",
                frameType: "TwoByOne",
                size: "{/size}",
                header: "{/header}",
                tileContent: [that.oLeftTileContent, that.oRightContent]
            });

            that.oGenericTileModel = new JSONModel();
            that.oGenericTileModel.setData(that.oGenericTileData);
            that.oGenericTile.setModel(that.oGenericTileModel);

            return that.oGenericTile;
        }
    });
}, /* bExport= */ true);
