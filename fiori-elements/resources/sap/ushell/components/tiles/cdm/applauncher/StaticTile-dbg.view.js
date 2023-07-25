// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/m/GenericTile",
    "sap/m/ImageContent",
    "sap/m/TileContent"
], function (View, GenericTile, ImageContent, TileContent) {
    "use strict";

    return View.extend("sap.ushell.components.tiles.cdm.applauncher.StaticTile", {
        getControllerName: function () {
            return "sap.ushell.components.tiles.cdm.applauncher.StaticTile";
        },
        createContent: function (oController) {
            this.setHeight("100%");
            this.setWidth("100%");

            //Return the GenericTile if it already exists instead of creating a new one
            if (this.getContent().length === 1) {
                return this.getContent()[0];
            }

            return new GenericTile({
                mode: "{/properties/mode}",
                header: "{/properties/title}",
                scope: "{/properties/scope}",
                subheader: "{/properties/subtitle}",
                size: "Auto",
                sizeBehavior: "{/properties/sizeBehavior}",
                frameType: "{/properties/frameType}",
                wrappingType: "{/properties/wrappingType}",
                url: {
                    path: "/properties/targetURL",
                    formatter: oController._getLeanUrl.bind(oController)
                },
                tileContent: new TileContent({
                    size: "Auto",
                    footer: "{/properties/info}",
                    content: new ImageContent({ src: "{/properties/icon}" })
                }),
                press: [oController.onPress, oController],
                additionalTooltip: "{/properties/contentProviderLabel}"
            });
        }
    });
});
