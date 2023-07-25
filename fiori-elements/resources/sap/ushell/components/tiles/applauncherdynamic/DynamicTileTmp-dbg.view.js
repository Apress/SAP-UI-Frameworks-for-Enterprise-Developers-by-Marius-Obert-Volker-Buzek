// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * This copy of the DynamicTile.view is needed for compatibility reasons until the changes to applauncher_dynamic.chip.xml have been delivered.
 * Afterwards this file can be used in all scenarios and DynamicTile.view.js can be replaced by it.
 */
sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/m/GenericTile",
    "sap/m/TileContent",
    "sap/m/library",
    "sap/m/NumericContent",
    "sap/ushell/components/tiles/applauncherdynamic/DynamicTile.controller" // Controller needs to be loaded
], function (
    View,
    GenericTile,
    TileContent,
    mobileLibrary,
    NumericContent
) {
    "use strict";

    // shortcut for sap.m.ValueColor
    var ValueColor = mobileLibrary.ValueColor;

    return View.extend("sap.ushell.components.tiles.applauncherdynamic.DynamicTile", {
        getControllerName: function () {
            return "sap.ushell.components.tiles.applauncherdynamic.DynamicTile";
        },

        createContent: function () {
            this.setHeight("100%");
            this.setWidth("100%");

            return this.getTileControl();
        },

        getTileControl: function () {
            var oController = this.getController();

            //Return the GenericTile if it already exists instead of creating a new one
            if (this.getContent().length === 1) {
                return this.getContent()[0];
            }

            return new GenericTile({
                mode: "{/mode}",
                header: "{/data/display_title_text}",
                subheader: "{/data/display_subtitle_text}",
                size: "Auto",
                sizeBehavior: "{/sizeBehavior}",
                wrappingType: "{/wrappingType}",
                url: {
                    parts: ["/targetURL", "/nav/navigation_target_url"],
                    formatter: oController.formatters.leanURL
                },
                tileContent: [new TileContent({
                    size: "Auto",
                    footer: "{/data/display_info_text}",
                    footerColor: {
                        path: "/data/display_info_state",
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
                    unit: "{/data/display_number_unit}",
                    //We'll utilize NumericContent for the "Dynamic" content.
                    content: [new NumericContent({
                        scale: "{/data/display_number_factor}",
                        value: "{/data/display_number_value}",
                        truncateValueTo: 5, //Otherwise, The default value is 4.
                        indicator: "{/data/display_state_arrow}",
                        valueColor: {
                            path: "/data/display_number_state",
                            formatter: function (sState) {
                                if (!sState || sState === "Neutral" || !ValueColor[sState]) {
                                    return ValueColor.None;
                                }
                                return sState;
                            }
                        },
                        icon: "{/data/display_icon_url}",
                        width: "100%",
                        withMargin: false
                    })]
                })],
                press: [oController.onPress, oController]
            });
        },

        getMode: function () {
            return this.getModel().getProperty("/mode");
        }
    });
});
