// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview Helper for accessing visualization data for the 'CDM' platform.
 *
 * TODO: Simplify function names
 *
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/base/util/ObjectPath"
], function (
    utils,
    ObjectPath
) {
    "use strict";

    var readVisualizations = {};

    /* ***** Access to visualizations ***** */

    /**
     * Returns the map of visualizations.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @returns {object}
     *      an object containing all visualizations as properties (property name
     *      is the vizId, property value is the visualizations data)
     */
    readVisualizations.getMap = function (oSite) {
        return oSite.visualizations;
    };

    /**
     * Returns the visualization with the given ID.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @param {string} sId
     *      ID of the visualization to be returned
     *  @returns {object}
     *      the visualization with the specified ID or undefined if not present
     */
    readVisualizations.get = function (oSite, sId) {
        return ObjectPath.get(["visualizations", sId], oSite);
    };

    /* ***** Access to visualization types ***** */

    /**
     * Returns the map of visualization types.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @returns {object}
     *      an object containing all visualization types as properties (property name
     *      is the vizTypeId, property value is the visualization type data)
     */
    readVisualizations.getTypeMap = function (oSite) {
        return oSite.vizTypes;
    };

    /**
     * Returns the visualization type with the given ID.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @param {string} sId
     *      ID of the visualization type to be returned
     *  @returns {object}
     *      the visualization type with the specified ID or undefined if not present
     */
    readVisualizations.getType = function (oSite, sId) {
        return ObjectPath.get(["vizTypes", sId], oSite);
    };

    /**
     * Returns the visualization type ID.
     *
     *  @param {object} oVisualization
     *      Visualization
     *  @returns {string}
     *      the visualization type ID or undefined if not present
     */
    readVisualizations.getTypeId = function (oVisualization) {
        return ObjectPath.get("vizType", oVisualization || {});
    };

    /**
     * Returns whether the visualization type is a standard visualization type
     *
     *  @param {string} sVizType
     *      Visualization Type
     *  @returns {boolean}
     *      true if it is a standard visualization type, false if it is a custom visualization type
     *
     *  @since 1.78
     *  @private
     */
    readVisualizations.isStandardVizType = function (sVizType) {
        return sVizType === "sap.ushell.StaticAppLauncher" || sVizType === "sap.ushell.DynamicAppLauncher";
    };

    /**
     * Returns the displayFormats supported by the vizType
     * @param {object} oVizType The vizType
     *
     * @returns {string[]} An array of displayFormats supported by the vizType or undefined
     *
     * @private
     * @since 1.90.0
     */
    readVisualizations.getSupportedDisplayFormats = function (oVizType) {
        return ObjectPath.get(["sap.flp", "vizOptions", "displayFormats", "supported"], oVizType || {});
    };

    /**
     * Returns the displayFormats supported by the vizType
     * @param {object} oVizType The vizType
     *
     * @returns {string} The displayFormats of the vizType or undefined
     *
     * @private
     * @since 1.90.0
     */
    readVisualizations.getDefaultDisplayFormat = function (oVizType) {
        return ObjectPath.get(["sap.flp", "vizOptions", "displayFormats", "default"], oVizType || {});
    };

    /**
     * Returns the tileSize of the vizType
     * @param {object} oVizType The vizType
     *
     * @returns {string} The tileSize of the vizType or undefined
     *
     * @private
     * @since 1.90.0
     */
     readVisualizations.getTileSize = function (oVizType) {
        return ObjectPath.get(["sap.flp", "tileSize"], oVizType || {});
    };

    /* ***** Access to visualization config and its attributes ***** */

    /**
     * Returns the configuration of the visualization
     *
     * @param {object} oVisualization
     *      Visualization
     * @returns {object}
     *      the visualization config or undefined if not present
     */
    readVisualizations.getConfig = function (oVisualization) {
        return ObjectPath.get("vizConfig", oVisualization || {});
    };

    /**
     * Returns the visualization's target
     * which is located inside its configuration
     *
     *  @param {object} oVisualization
     *      Visualization
     *  @returns {object}
     *      the visualization's target or undefined if not present
     */
    readVisualizations.getTarget = function (oVisualization) {
        var oVizConfig = this.getConfig(oVisualization);
        return ObjectPath.get(["sap.flp", "target"], oVizConfig || {});
    };

    /**
     * Returns the visualization's target app ID
     * which is located inside its configuration
     *
     *  @param {object} oVisualization
     *      Visualization
     *  @returns {string}
     *      the visualization's app ID or undefined if not present
     */
    readVisualizations.getAppId = function (oVisualization) {
        var oTarget = this.getTarget(oVisualization);
        return ObjectPath.get("appId", oTarget || {});
    };

    /**
     * Returns the visualization's target inbound ID
     * which is located inside its configuration
     *
     * @param {object} oVisualization
     *      Visualization
     *  @returns {string}
     *      the visualization's inbound ID or undefined if not present
     *
     * @since 1.74.0
     * @private
     */
    readVisualizations.getInboundId = function (oVisualization) {
        var oTarget = this.getTarget(oVisualization);
        return ObjectPath.get("inboundId", oTarget || {});
    };

    /**
     * Returns the outbound for a visualization. Appends the parameter sap-ui-app-id-hint
     * to the parameter list.
     *
     *  @param {object} oVisualization
     *      Visualization
     *  @param {object} oInbound
     *      Inbound
     *  @returns {object}
     *      The outbound based on the visualization and the inbound
     */
    readVisualizations.getOutbound = function (oVisualization, oInbound) {
        var oOutbound = {
            semanticObject: oInbound.semanticObject,
            action: oInbound.action,
            parameters: this.getTarget(oVisualization).parameters || {}
        };

        oOutbound.parameters["sap-ui-app-id-hint"] = {
            value: {
                format: "plain",
                value: this.getAppId(oVisualization)
            }
        };
        return oOutbound;
    };


    /**
     * Checks whether a visualization starts an external URL.
     *
     *  @param {object} oVisualization
     *      Visualization
     *  @returns {boolean}
     *      Returns whether the visualization starts an external URL
     */
    readVisualizations.startsExternalUrl = function (oVisualization) {
        var oTarget = this.getTarget(oVisualization);
        return oTarget && oTarget.type === "URL";
    };

    /* ***** Access to site application descriptor ***** */

    /**
     * Returns the app descriptor with the given app ID.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @param {string} sId
     *      ID of the app descriptor to be returned
     *  @returns {object}
     *      the app descriptor with the specified ID or undefined if not present
     */
    readVisualizations.getAppDescriptor = function (oSite, sId) {
        return ObjectPath.get(["applications", sId], oSite);
    };

    /* ***** Access to CDM-evaluated properties ***** */

    /**
     * Returns the keyword array
     * which is evaluated on the basis of the CDM parts
     *
     * @param {object[]} aCdmParts
     *      A fixed list containing the Tile, the VizConfig, the Inbound, and the App.
     * @returns {string[]}
     *      the evaluated keyword array or undefined if not present
     *
     * @since 1.74.0
     * @private
     */
    readVisualizations.getKeywords = function (aCdmParts) {
        var aClonedCdmParts = utils.clone(aCdmParts); // do not modify input parameter
        aClonedCdmParts.splice(2, 1); // Inbound
        aClonedCdmParts.splice(0, 1); // Tile
        return utils.getNestedObjectProperty(
            aClonedCdmParts,
            ["sap|app.tags.keywords", "sap|app.tags.keywords"]);
    };

    /**
     * Returns the title
     * which is evaluated on the basis of the CDM parts
     *
     * @param {object[]} aCdmParts
     *      A fixed list containing the Tile, the VizConfig, the Inbound, and the App.
     * @returns {string}
     *      the evaluated title or undefined if not present
     *
     * @since 1.74.0
     * @private
     */
    readVisualizations.getTitle = function (aCdmParts) {
        return utils.getNestedObjectProperty(
            aCdmParts,
            ["title", "sap|app.title", "title", "sap|app.title"]);
    };

    /**
     * Returns the subtitle
     * which is evaluated on the basis of the CDM parts
     *
     * @param {object[]} aCdmParts
     *      A fixed list containing the Tile, the VizConfig, the Inbound, and the App.
     * @returns {string}
     *      the evaluated subtitle or undefined if not present
     *
     * @since 1.74.0
     * @private
     */
    readVisualizations.getSubTitle = function (aCdmParts) {
        return utils.getNestedObjectProperty(
            aCdmParts,
            ["subTitle", "sap|app.subTitle", "subTitle", "sap|app.subTitle"]);
    };

    /**
     * Returns the icon
     * which is evaluated on the basis of the CDM parts
     *
     * @param {object[]} aCdmParts
     *      A fixed list containing the Tile, the VizConfig, the Inbound, and the App.
     * @returns {string}
     *      the evaluated icon or undefined if not present
     *
     * @since 1.74.0
     * @private
     */
    readVisualizations.getIcon = function (aCdmParts) {
        return utils.getNestedObjectProperty(
            aCdmParts,
            ["icon", "sap|ui.icons.icon", "icon", "sap|ui.icons.icon"]);
    };

    /**
     * Returns the numberUnit
     * which is evaluated on the basis of the CDM parts
     *
     * @param {object[]} aCdmParts
     *      A fixed list containing the Tile, the VizConfig, the Inbound, and the App.
     * @returns {string}
     *      the evaluated numberUnit or undefined if not present
     *
     * @since 1.84.0
     * @private
     */
    readVisualizations.getNumberUnit = function (aCdmParts) {
        var aClonedCdmParts = utils.clone(aCdmParts); // do not modify input parameter
        aClonedCdmParts.splice(2, 2); // Inbound + App
        return utils.getNestedObjectProperty(
            aClonedCdmParts,
            ["numberUnit", "sap|flp.numberUnit"]);
    };

    /**
     * Returns the info
     * which is evaluated on the basis of the CDM parts
     *
     * @param {object[]} aCdmParts
     *      A fixed list containing the Tile, the VizConfig, the Inbound, and the App.
     * @returns {string}
     *      the evaluated info or undefined if not present
     *
     * @since 1.74.0
     * @private
     */
    readVisualizations.getInfo = function (aCdmParts) {
        return utils.getNestedObjectProperty(
            aCdmParts,
            ["info", "sap|app.info", "info", "sap|app.info"]);
    };

    /**
     * Returns the shorttitle
     * which is evaluated on the basis of the CDM parts
     *
     * @param {object[]} aCdmParts
     *      A fixed list containing the Tile, the VizConfig, the Inbound, and the App.
     * @returns {string}
     *      the evaluated shorttitle or undefined if not present
     *
     * @since 1.74.0
     * @private
     */
    readVisualizations.getShortTitle = function (aCdmParts) {
        var aClonedCdmParts = utils.clone(aCdmParts); // do not modify input parameter
        aClonedCdmParts.splice(0, 1); // Tile
        return utils.getNestedObjectProperty(
            aClonedCdmParts,
            ["sap|app.shortTitle", "shortTitle", "sap|app.shortTitle"]);
    };


    /**
     * Returns the instantiation data
     * This data can be supplied by platforms that don't expose their content via CDM natively
     *
     * @param {object} oVisualization
     *      a visualization
     * @returns {object}
     *      the instantiation data or undefined if not present
     *
     * @since 1.78.0
     * @private
     */
    readVisualizations.getInstantiationData = function (oVisualization) {
        return ObjectPath.get(["vizConfig", "sap.flp", "_instantiationData"], oVisualization);
    };

    /**
     * Returns the indicatorDataSource
     * @param {object} oVisualization The visualization
     * @returns {object} The indicatorDataSource or undefined if not present
     *
     * @since 1.78.0
     * @private
     */
    readVisualizations.getIndicatorDataSource = function (oVisualization) {
        return ObjectPath.get([ "vizConfig", "sap.flp", "indicatorDataSource" ], oVisualization);
    };

    /**
     * Returns the data source

     * @param {object[]} aCdmParts
     *      A fixed list containing the Tile, the VizConfig, the Inbound, and the App.
     * @param {string} sDataSourceId
     *      The ID of the data source to be returned
     * @returns {object} The data source or undefined if not present
     *
     * @since 1.84.0
     * @private
     */
    readVisualizations.getDataSource = function (aCdmParts, sDataSourceId) {
        var aClonedCdmParts = utils.clone(aCdmParts); // do not modify input parameter
        aClonedCdmParts.splice(2, 1); // Inbound
        aClonedCdmParts.splice(0, 1); // Tile

        var oDataSources = utils.getNestedObjectProperty(
            aClonedCdmParts,
            ["sap|app.dataSources", "sap|app.dataSources"])
            || {};

        return oDataSources[sDataSourceId];
    };

    /**
     * Returns the chip config from the viz reference.
     * @param {object} oVizReference The VizReference
     * @returns {object} chip config  or undefined if not present
     * @since 1.91.0
     */
    readVisualizations.getChipConfigFromVizReference = function (oVizReference) {
        return ObjectPath.get(["vizConfig", "sap.flp", "chipConfig"], oVizReference);
    };

    return readVisualizations;

}, /* bExport = */ false);
