// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/UIComponent"
], function (XMLView, UIComponent) {
    "use strict";

    return UIComponent.extend("sap.ushell.components.tiles.cdm.applauncherdynamic.Component", {
        metadata: {
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        // create content
        createContent: function () {
            // take tile configuration from manifest - if exists
            // take tile personalization from component properties - if exists
            // merging the tile configuration and tile personalization
            var oComponentData = this.getComponentData();
            var oProperties = oComponentData.properties || {};
            var oP13n = oProperties.tilePersonalization || {};

            // adding indicator-data source properties to configuration
            var oIndicatorDataSource = oProperties.indicatorDataSource;
            if (oIndicatorDataSource && oIndicatorDataSource.path) {
                oP13n.serviceUrl = oIndicatorDataSource.path;
                oP13n.serviceRefreshInterval = oIndicatorDataSource.refresh;
            }

            // adding sap-system to configuration
            var oStartupParams = oComponentData.startupParameters;
            if (oStartupParams && oStartupParams["sap-system"] && oStartupParams["sap-system"][0]) {
                //sap-system is always an array. we take the first value
                oP13n["sap-system"] = oStartupParams["sap-system"][0];
            }

            /**
             * in case service url is not an absolute path and data source is provided, we assume this is a relative path to the provided datasource
             * and we need to apply the sap-system as well if exist
             */
            if (oP13n.serviceUrl && oP13n.serviceUrl.charAt(0) !== "/" && oProperties.dataSource && oProperties.dataSource.uri) {
                //first take the service url
                var sServiceUrl = oProperties.dataSource.uri;
                //if system is provided we need to add it making sure we strip the ending '/' if exist
                if (oP13n["sap-system"]) {
                    if (sServiceUrl.charAt(sServiceUrl.length - 1) === "/") {
                        sServiceUrl = sServiceUrl.slice(0, sServiceUrl.length - 1);
                    }
                    sServiceUrl += ";o=" + oP13n["sap-system"];
                }
                //making sure that the url has a '/' at the end
                if (sServiceUrl.charAt(sServiceUrl.length - 1) !== "/") {
                    sServiceUrl += "/";
                }
                //then we add the path to the specific entity (at this point we know its a relative path)
                sServiceUrl += oP13n.serviceUrl;
                oP13n.serviceUrl = sServiceUrl;
            }

            return XMLView.create({
                viewName: "sap.ushell.components.tiles.cdm.applauncherdynamic.DynamicTile",
                viewData: {
                    properties: oProperties,
                    configuration: oP13n
                }
            }).then(function (oView) {
                this._oController = oView.getController();
                this._oController.visibleHandler(this.bIsVisible);
                return oView;
            }.bind(this));
        },

        // interface to be provided by the tile
        tileSetVisualProperties: function (oNewVisualProperties) {
            if (this._oController) {
                this._oController.updateVisualPropertiesHandler(oNewVisualProperties);
            }
        },

        // interface to be provided by the tile
        tileRefresh: function () {
            if (this._oController) {
                this._oController.refreshHandler();
            }
        },

        // interface to be provided by the tile
        tileSetVisible: function (bIsVisible) {
            if (this._oController) {
                this._oController.visibleHandler(bIsVisible);
            } else {
                this.bIsVisible = bIsVisible;
            }
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
