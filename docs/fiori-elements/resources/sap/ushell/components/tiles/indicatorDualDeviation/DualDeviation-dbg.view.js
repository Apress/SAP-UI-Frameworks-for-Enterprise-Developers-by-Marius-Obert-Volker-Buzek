// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Dual Deviation Tile
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/ui/core/mvc/JSView", // Do not remove
    "sap/ca/ui/model/format/NumberFormat", // Do not remove
    "sap/ui/model/analytics/odata4analytics", // Do not remove
    "sap/ushell/components/tiles/indicatorTileUtils/smartBusinessUtil", // Do not remove
    "sap/m/library",
    "sap/m/NumericContent",
    "sap/m/TileContent",
    "sap/suite/ui/microchart/BulletMicroChartData",
    "sap/suite/ui/microchart/BulletMicroChart",
    "sap/m/GenericTile",
    "sap/ui/model/json/JSONModel"
], function (
    JSView,
    NumberFormat,
    odata4analytics,
    smartBusinessUtil,
    mobileLibrary,
    NumericContent,
    TileContent,
    BulletMicroChartData,
    BulletMicroChart,
    GenericTile,
    JSONModel
) {
    "use strict";

    // shortcut for sap.m.Size
    var Size = mobileLibrary.Size;

    // shortcut for sap.m.LoadState
    var LoadState = mobileLibrary.LoadState;

    sap.ui.getCore().loadLibrary("sap.suite.ui.microchart");

    sap.ui.jsview("tiles.indicatorDualDeviation.DualDeviation", {
        getControllerName: function () {
            return "tiles.indicatorDualDeviation.DualDeviation";
        },
        createContent: function () {
            var that = this;
            this.setHeight("100%");
            this.setWidth("100%");
            var header = "Lorem ipsum";
            var subheader = "Lorem ipsum";
            var titleObj = sap.ushell.components.tiles.indicatorTileUtils.util.getTileTitleSubtitle(this.getViewData().chip);
            if (titleObj.title && titleObj.subTitle) {
                header = titleObj.title;
                subheader = titleObj.subTitle;
            }
            var deviationTileData = {
                subheader: subheader,
                header: header,
                footerNum: "",
                footerComp: "",
                frameType: "TwoByOne",
                state: LoadState.Loading,
                scale: ""
                // actual: { value: 120, color: sap.m.ValueColor.Good},
                // targetValue: 100,
                // thresholds: [
                //              { value: 0, color: sap.m.ValueColor.Error },
                //              { value: 50, color: sap.m.ValueColor.Critical },
                //              { value: 150, color: sap.m.ValueColor.Critical },
                //              { value: 200, color: sap.m.ValueColor.Error }
                //              ],
                // showActualValue: true,
                // showTargetValue: true
            };

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

            var oBCDataTmpl = new BulletMicroChartData({
                value: "{value}",
                color: "{color}"
            });

            that.oBCTmpl = new BulletMicroChart({
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

            var oNVConfS = new TileContent({
                unit: "{/unit}",
                size: "{/size}",
                footer: "{/footerNum}",
                content: that.oBCTmpl
            });

            that.oGenericTile = new GenericTile({
                subheader: "{/subheader}",
                frameType: "{/frameType}",
                size: "{/size}",
                header: "{/header}",
                tileContent: [that.oNumericTile, oNVConfS]
            });

            var oGenericTileModel = new JSONModel();
            oGenericTileModel.setData(deviationTileData);
            that.oGenericTile.setModel(oGenericTileModel);

            return that.oGenericTile;
        }
    });
}, /* bExport= */ true);
