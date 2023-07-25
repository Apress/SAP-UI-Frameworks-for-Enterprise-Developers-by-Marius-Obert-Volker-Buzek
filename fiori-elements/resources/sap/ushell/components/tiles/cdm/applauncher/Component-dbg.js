// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/UIComponent"
], function (XMLView, UIComponent) {
    "use strict";

    return UIComponent.extend("sap.ushell.components.tiles.cdm.applauncher.Component", {
        metadata: {
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        // create content
        createContent: function () {
            // take tile configuration from manifest - if exists
            // take tile personalization from component properties - if exists
            // merging the tile configuration and tile personalization
            var oComponentData = this.getComponentData();
            var oP13n = oComponentData.properties.tilePersonalization || {};

            // adding sap-system to configuration
            var oStartupParams = oComponentData.startupParameters;
            if (oStartupParams && oStartupParams["sap-system"]) {
                //sap-system is always an array. we take the first value
                oP13n["sap-system"] = oStartupParams["sap-system"][0];
            }
            return XMLView.create({
                viewName: "sap.ushell.components.tiles.cdm.applauncher.StaticTile",
                viewData: {
                    properties: oComponentData.properties,
                    configuration: oP13n
                }
            }).then(function (oView) {
                this._oController = oView.getController();
                oView.getContent()[0].bindTileContent({
                    path: "/properties",
                    factory: this._oController._getTileContent.bind(this._oController)
                });
                return oView;
            }.bind(this));
        },

        // interface to be provided by the tile
        tileSetVisualProperties: function (oNewVisualProperties) {
            if (this._oController) {
                this._oController.updatePropertiesHandler(oNewVisualProperties);
            }
        },

        // interface to be provided by the tile
        tileRefresh: function () {
            // empty implementation. currently static tile has no need in referesh handler logic
        },

        // interface to be provided by the tile
        tileSetVisible: function (bIsVisible) {
            // empty implementation. currently static tile has no need in visibility handler logic
        },

        /**
         * Interface to be provided by the tile
         *
         * @param {boolean} bEditable Boolean indicating if the tile should be in edit mode.
         */
        tileSetEditMode: function (bEditable) {
            if (this._oController) {
                this._oController.editModeHandler(bEditable);
            }
        },

        exit: function () {
            this._oController = null;
        }
    });
});
