// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Comparison Tile
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/ui/core/mvc/JSView", // Do not remove
    "sap/ui/model/analytics/odata4analytics", // Do not remove
    "sap/ushell/components/tiles/indicatorTileUtils/smartBusinessUtil", // Do not remove
    "sap/m/library",
    "sap/suite/ui/microchart/BulletMicroChartData",
    "sap/suite/ui/microchart/BulletMicroChart",
    "sap/m/GenericTile",
    "sap/ui/model/json/JSONModel"
    // "sap/ushell/components/tiles/sbtilecontent" // do not migrate
], function (
    JSView,
    odata4analytics,
    smartBusinessUtil,
    MobileLibrary,
    BulletMicroChartData,
    BulletMicroChart,
    GenericTile,
    JSONModel
    // sbtilecontent // do not migrate
) {
    "use strict";

    // shortcut for sap.m.Size
    var Size = MobileLibrary.Size;

    // shortcut for sap.m.LoadState
    var LoadState = MobileLibrary.LoadState;

    sap.ui.getCore().loadLibrary("sap.suite.ui.microchart");

    sap.ui.jsview("sap.ushell.components.tiles.indicatordeviation.DeviationTile", {
        getControllerName: function () {
            return "sap.ushell.components.tiles.indicatordeviation.DeviationTile";
        },
        createContent: function (/*oController*/) {
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
                frameType: "OneByOne",
                state: LoadState.Loading,
                scale: ""
            };

            var oBCDataTmpl = new BulletMicroChartData({
                value: "{value}",
                color: "{color}"
            });

            this.oBCTmpl = new BulletMicroChart({
                size: Size.Responsive,
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

            this.oNVConfS = new sap.ushell.components.tiles.sbtilecontent({
                unit: "{/unit}",
                size: "{/size}",
                footer: "{/footerNum}",
                content: this.oBCTmpl
            });

            this.oGenericTile = new GenericTile({
                subheader: "{/subheader}",
                frameType: "{/frameType}",
                size: "{/size}",
                header: "{/header}",
                tileContent: [this.oNVConfS]
            });

            var oGenericTileModel = new JSONModel();
            oGenericTileModel.setData(deviationTileData);
            this.oGenericTile.setModel(oGenericTileModel);

            return this.oGenericTile;
        }
    });
}, /* bExport= */ true);
