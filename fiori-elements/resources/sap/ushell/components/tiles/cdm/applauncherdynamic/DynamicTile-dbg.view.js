// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/m/GenericTile",
    "sap/m/TileContent",
    "sap/m/NumericContent",
    "sap/m/library"
], function (
    View,
    GenericTile,
    TileContent,
    NumericContent,
    mobileLibrary
) {
    "use strict";

    // shortcut for sap.m.ValueColor
    var ValueColor = mobileLibrary.ValueColor;

    return View.extend("sap.ushell.components.tiles.cdm.applauncherdynamic.DynamicTile", {
        getControllerName: function () {
            return "sap.ushell.components.tiles.cdm.applauncherdynamic.DynamicTile";
        },
        createContent: function (oController) {
            this.setHeight("100%");
            this.setWidth("100%");

            //Return the GenericTile if it already exists instead of creating a new one
            if (this.getContent().length === 1) {
                return this.getContent()[0];
            }

            return new GenericTile({
                size: "Auto",
                header: "{/properties/title}",
                scope: "{/properties/scope}",
                subheader: "{/properties/subtitle}",
                sizeBehavior: "{/properties/sizeBehavior}",
                frameType: "{/properties/frameType}",
                wrappingType: "{/properties/wrappingType}",
                url: {
                    parts: ["/properties/targetURL"],
                    formatter: oController.formatters && oController.formatters.leanURL
                },
                tileContent: new TileContent({
                    size: "Auto",
                    footer: "{/properties/info}",
                    footerColor: {
                        path: "/properties/infoState",
                        formatter: function (sFooterColor) {
                            if (sFooterColor === "Positive") {
                                sFooterColor = ValueColor.Good;
                            }
                            if (sFooterColor === "Negative") {
                                sFooterColor = ValueColor.Error;
                            }

                            if (!ValueColor[sFooterColor]) {
                                sFooterColor = ValueColor.Neutral;
                            }

                            return sFooterColor;
                        }
                    },
                    unit: "{/properties/number_unit}",
                    content: new NumericContent({
                        truncateValueTo: 5,
                        scale: "{/properties/number_factor}",
                        value: "{/properties/number_value}",
                        indicator: "{/properties/number_state_arrow}",
                        valueColor: {
                            path: "/properties/number_value_state",
                            formatter: function (sState) {
                                if (!sState || sState === "Neutral" || !ValueColor[sState]) {
                                    return ValueColor.None;
                                }
                                return sState;
                            }
                        },
                        icon: "{/properties/icon}",
                        withMargin: false,
                        width: "100%"
                    })
                }),
                additionalTooltip: "{/properties/contentProviderLabel}",
                press: [ oController.onPress, oController ]
            });
        }
    });
});
