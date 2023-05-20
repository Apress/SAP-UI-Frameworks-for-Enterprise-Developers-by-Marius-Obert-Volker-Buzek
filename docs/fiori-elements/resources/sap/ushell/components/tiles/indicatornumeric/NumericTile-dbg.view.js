// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Numeric Tile
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/ui/core/mvc/JSView", // Do not remove
    "sap/ui/model/analytics/odata4analytics", // Do not remove
    "sap/ushell/components/tiles/indicatorTileUtils/smartBusinessUtil", // Do not remove
    "sap/m/library",
    "sap/m/NumericContent",
    "sap/m/GenericTile",
    "sap/ui/model/json/JSONModel"
    // "sap/ushell/components/tiles/sbtilecontent" // do not migrate
], function (
    JSView,
    odata4analytics,
    smartBusinessUtil,
    mobileLibrary,
    NumericContent,
    GenericTile,
    JSONModel
    // sbtilecontent // do not migrate
) {
    "use strict";

    // shortcut for sap.m.DeviationIndicator
    var DeviationIndicator = mobileLibrary.DeviationIndicator;

    // shortcut for sap.m.ValueColor
    var ValueColor = mobileLibrary.ValueColor;

    // shortcut for sap.m.LoadState
    var LoadState = mobileLibrary.LoadState;

    sap.ui.getCore().loadLibrary("sap.suite.ui.commons");

    sap.ui.jsview("sap.ushell.components.tiles.indicatornumeric.NumericTile", {
        getControllerName: function () {
            return "sap.ushell.components.tiles.indicatornumeric.NumericTile";
        },
        createContent: function () {
            var header = "Lorem ipsum";
            var subheader = "Lorem ipsum";

            var titleObj = sap.ushell.components.tiles.indicatorTileUtils.util.getTileTitleSubtitle(this.getViewData().chip);
            if (titleObj.title && titleObj.subTitle) {
                header = titleObj.title;
                subheader = titleObj.subTitle;
            }
            var oGenericTileData = {
                subheader: subheader,
                header: header,
                footerNum: "",
                footerComp: "",
                scale: "",
                unit: "",
                value: "",
                size: "Auto",
                frameType: "OneByOne",
                state: LoadState.Loading,
                valueColor: ValueColor.Neutral,
                indicator: DeviationIndicator.None,
                title: "",
                footer: "",
                description: ""
            };

            this.oNVConfContS = new NumericContent({
                value: "{/value}",
                scale: "{/scale}",
                unit: "{/unit}",
                indicator: "{/indicator}",
                valueColor: "{/valueColor}",
                size: "{/size}",
                formatterValue: true,
                truncateValueTo: 5,
                nullifyValue: false
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
