// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/ObjectPath"
], function (Log, ObjectPath) {
    "use strict";

    var DYNAMIC_BASE_CHIP_ID = "X-SAP-UI2-CHIP:/UI2/DYNAMIC_APPLAUNCHER",
        STATIC_BASE_CHIP_ID = "X-SAP-UI2-CHIP:/UI2/STATIC_APPLAUNCHER";

    var chipsUtils = {};

    /**
     * Get preview title for a catalog tile.
     *
     * @param {sap.ui2.ChipInstance} oCatalogTile the catalog tile
     * @returns {string} the preview title for the catalog tile's underlying application as provided via the "preview" contract
     * @since 1.88.0
     */
    chipsUtils.getCatalogTilePreviewTitle = function (oCatalogTile) {
        var sAppLauncherTitle = chipsUtils.getBagText(oCatalogTile, "tileProperties", "display_title_text");
        return sAppLauncherTitle || (!oCatalogTile.isStub() && oCatalogTile.getContract("preview")
            && oCatalogTile.getContract("preview").getPreviewTitle())
            || undefined;
    };

    /**
     * Get preview subtitle for a catalog tile.
     *
     * @param {sap.ui2.ChipInstance} oCatalogTile the catalog tile
     * @returns {string} the preview subtitle for the catalog tile's underlying application as provided via the "preview" contract
     * @since 1.88.0
     */
    chipsUtils.getCatalogTilePreviewSubtitle = function (oCatalogTile) {
        var sAppLauncherSubTitle = chipsUtils.getBagText(oCatalogTile, "tileProperties", "display_subtitle_text");
        return sAppLauncherSubTitle || (!oCatalogTile.isStub() && oCatalogTile.getContract("preview")
            && oCatalogTile.getContract("preview").getPreviewSubtitle())
            || undefined;
    };

    /**
     * Get preview icon for a catalog tile.
     *
     * @param {sap.ui2.ChipInstance} oCatalogTile the catalog tile
     * @returns {string} the preview icon for the catalog tile's underlying application as provided via the "preview" contract
     * @since 1.88.0
     */
    chipsUtils.getCatalogTilePreviewIcon = function (oCatalogTile) {
        var sAppLauncherIcon = chipsUtils._getConfigurationProperty(oCatalogTile, "tileConfiguration", "display_icon_url");

        return sAppLauncherIcon || (!oCatalogTile.isStub() && oCatalogTile.getContract("preview")
            && oCatalogTile.getContract("preview").getPreviewIcon())
            || undefined;
    };

    /**
     * Get navigation target URL for a catalog tile.
     *
     * @param {sap.ui2.ChipInstance} oCatalogTile the catalog tile
     * @returns {string} the target URL for the catalog tile's underlying application as provided via the "preview" contract
     * @since 1.88.0
     */
    chipsUtils.getCatalogTileTargetURL = function (oCatalogTile) {
        var sAppLauncherTarget = chipsUtils._getConfigurationProperty(oCatalogTile, "tileConfiguration", "navigation_target_url");
        return sAppLauncherTarget || (!oCatalogTile.isStub() && oCatalogTile.getContract("preview")
            && oCatalogTile.getContract("preview").getTargetUrl())
            || undefined;
    };

    /**
     * Get numberUnit for a catalog tile.
     *
     * @param {sap.ui2.ChipInstance} oCatalogTile the catalog tile
     * @returns {string} the numberUnit for the catalog tile provided via the tileConfiguration
     * @since 1.88.0
     */
    chipsUtils.getCatalogTileNumberUnit = function (oCatalogTile) {
        return chipsUtils._getConfigurationProperty(oCatalogTile, "tileConfiguration", "display_number_unit");
    };

    /**
     * Returns the catalog tile info
     *
     * @param {object} oCatalogTile The catalog tile
     * @returns {string} The catalog tile info
     * @since 1.88.0
     */
    chipsUtils.getCatalogTilePreviewInfo = function (oCatalogTile) {
        return chipsUtils.getBagText(oCatalogTile.getChip(), "tileProperties", "display_info_text");
    };

    /**
     * Returns the catalog tile's size in the format <code>1x1</code> or <code>1x2</code>.
     *
     * @param {sap.ui2.ChipInstance} oCatalogTile the catalog tile
     * @returns {string} the size
     * @since 1.88.0
     */
    chipsUtils.getCatalogTileSize = function (oCatalogTile) {
        return chipsUtils.getTileSize(oCatalogTile);
    };

    /**
     * Returns the indicator data source url
     *
     * @param {object} oCatalogTile The catalog tile
     * @returns {object} The catalog tile indicator data source
     * @since 1.88.0
     */
    chipsUtils.getCatalogTilePreviewIndicatorDataSource = function (oCatalogTile) {
        var oIndicatorDataSource;
        var oTileConfiguration = chipsUtils._getAppLauncherTileConfiguration(oCatalogTile);
        if (chipsUtils._isAppLauncher(oCatalogTile) && oTileConfiguration && oTileConfiguration.service_url) {
            oIndicatorDataSource = {
                path: oTileConfiguration.service_url,
                refresh: oTileConfiguration.service_refresh_interval
            };
        }
        return oIndicatorDataSource;
    };

    /**
     * Checks if oChip has a configuration parameter with ID sConfigParameterId. Its value must be a stringified
     * JSON object. If that object contains a property named sPropertyName, it's value will be returned.
     * This method is save: In case the value cannot be read due to any reason undefined is returned.
     *
     * @param {object} oChip CHIP potentially containing the the configuration parameter and property and property name
     * @param {string} sConfigParameterId Configuration parameter ID to check for.
     *   The value must be a stringified JSON otherwise the method will return undefined
     * @param {string} sPropertyName Name of the property which is expected on the parsed object value from sConfigParameterId
     * @returns {string} Value for sPropertyName, or undefined if not found or an error occurred (e.g. due to failed parsing)
     * @private
     * @see sap.ushell_abap.pbServices.ui2.ChipInstance#getConfigurationParameter
     * @since 1.88.0
     */
    chipsUtils._getConfigurationProperty = function (oChip, sConfigParameterId, sPropertyName) {
        var sTileConfig,
            oTileConfig;

        try {
            sTileConfig = oChip.getConfigurationParameter(sConfigParameterId);
            oTileConfig = JSON.parse(sTileConfig);
        } catch (e) {
            // most likely this is not a static or dynamic applauncher
            return;
        }

        if (oTileConfig[sPropertyName] !== undefined) { // also consider falsy values
            return oTileConfig[sPropertyName];
        }
    };

    /**
     * Checks if oChip has a bag with ID sBagId and if that bag contains a text with the name.
     * If so, the value for that text is returned. If not, undefined is returned.
     * The bag will not be created, in case it does not exist (calling getBag directly would do)!
     *
     * @param {object} oChip CHIP potentially containing the bag
     * @param {string} sBagId Bag ID to check for
     * @param {string} sTextName Text name to check for
     * @returns {string} Value for sTextName, or undefined if not found
     * @private
     * @see sap.ushell_abap.pbServices.ui2.ChipInstance#getBag
     * @see sap.ushell_abap.pbServices.ui2.ChipInstance#getBagIds
     * @see sap.ushell_abap.pbServices.ui2.Bag#getText
     * @see sap.ushell_abap.pbServices.ui2.Bag#getTextNames
     * @since 1.88.0
     */
    chipsUtils.getBagText = function (oChip, sBagId, sTextName) {
        // calling getBag directly, will create the bag if it does not exist yet!
        if (oChip.getBagIds().indexOf(sBagId) > -1 &&
            oChip.getBag(sBagId).getTextNames().indexOf(sTextName) > -1) {
            return oChip.getBag(sBagId).getText(sTextName);
        }
    };

    /**
     * Returns the tile size in the format <code>1x1</code> or <code>1x2</code>.
     *
     * @param {sap.ushell_abap.pbServices.ui2.ChipInstance} oTile the tile
     * @returns {string} the tile size
     * @since 1.88.0
     */
    chipsUtils.getTileSize = function (oTile) {
        var row = (!oTile.isStub() && oTile.getConfigurationParameter("row")) || "1",
            col = (!oTile.isStub() && oTile.getConfigurationParameter("col")) || "1";
        return row + "x" + col;
    };

    /**
     * Returns the tile configuration of the given (app launcher) CHIP instance.
     * It logs an error message if the tile configuration cannot be parsed.
     *
     * @param {sap.ushell_abap.pbServices.ui2.ChipInstance} oChipInstance must not be a stub anymore. Also it's CHIP must not be a stub anymore.
     * @returns {object} the tile configuration
     * @since 1.88.0
     */
    chipsUtils._getAppLauncherTileConfiguration = function (oChipInstance) {
        var oParsedTileConfiguration,
            sConfigParam = oChipInstance.getConfigurationParameter("tileConfiguration");
        try {
            oParsedTileConfiguration = JSON.parse(sConfigParam || "{}");
        } catch (oEx) {
            Log.error("Tile with ID '" + oChipInstance.getId() +
                "' has a corrupt configuration containing a 'tileConfiguration' value '" + sConfigParam +
                "' which could not be parsed. If present, a (stringified) JSON is expected as value.",
                oEx.message,
                "sap.ushell_abap.adapters.abap.LaunchPageAdapter"
            );
            return {}; // the FLP must react robust on broken single tiles
        }
        return oParsedTileConfiguration;
    };

    /**
     * Tells whether the given CHIP instance is a static or dynamic app launcher
     * @param {sap.ushell_abap.pbServices.ui2.ChipInstance} oChipInstance must not be a stub anymore. Also it's CHIP must not be a stub anymore.
     * @returns {boolean} true if the chip is a static or dynamic app launcher
     * @since 1.88.0
     */
    chipsUtils._isAppLauncher = function (oChipInstance) {
        var sBaseChipId = oChipInstance.getChip().getBaseChipId();
        return sBaseChipId === DYNAMIC_BASE_CHIP_ID || sBaseChipId === STATIC_BASE_CHIP_ID;
    };

    /**
     * The function returns the parsed tile configuration of the provided simplified chip.
     *
     * @param {object} oSimplifiedChip
     *  A simplified version of the sap.ushell_abap.pbServices.ui2.ChipInstance.
     *  The object structure of the simplified chip model can be viewed in the "simplifiedChipModel.md" document in the FLP core-concepts GitHub repository.
     *
     * @since 1.90.0
     * @returns {object} Tile configuration object
     * @private
     */
    chipsUtils.getTileConfigurationFromSimplifiedChip = function (oSimplifiedChip) {
        var oTileConfiguration;
        try {
            oTileConfiguration = JSON.parse(oSimplifiedChip.configuration.tileConfiguration);
        } catch (oError) {
            oTileConfiguration = {};
        }

        return oTileConfiguration;
    };

    /**
     * The function returns the navigation target URL from the tile configuration of the provided simplified chip.
     *
     * @param {object} oSimplifiedChip
     *  A simplified version of the sap.ushell_abap.pbServices.ui2.ChipInstance.
     *  The object structure of the simplified chip model can be viewed in the "simplifiedChipModel.md" document in the FLP core-concepts GitHub repository.
     * @param {object} URLParsing The URLParsing service
     *
     * @since 1.90.0
     * @returns {(string|undefined)} Navigation target URL
     * @private
     */
    chipsUtils.getTargetUrlFromSimplifiedChip = function (oSimplifiedChip, URLParsing) {
        var oCustomTileTarget = this.getCustomTileTargetFromSimplified(oSimplifiedChip);
        if (oCustomTileTarget) {
            return "#" + URLParsing.constructShellHash(oCustomTileTarget);
        }

        var oTileConfiguration = this.getTileConfigurationFromSimplifiedChip(oSimplifiedChip);
        return oTileConfiguration.navigation_target_url;
    };

    /**
     * The function gets the service URL as well as the refresh interval from the tile configuration
     * of the provided simplified chip and returns it as an indicator data source object.
     *
     * @param {object} oSimplifiedChip
     *  A simplified version of the sap.ushell_abap.pbServices.ui2.ChipInstance.
     *  The object structure of the simplified chip model can be viewed in the "simplifiedChipModel.md" document in the FLP core-concepts GitHub repository.
     *
     * @since 1.90.0
     * @returns {(object|undefined)} Indicator data source containing the path & refresh value.
     * @private
     */
    chipsUtils.getIndicatorDataSourceFromSimplifiedChip = function (oSimplifiedChip) {
        var oTileConfiguration = this.getTileConfigurationFromSimplifiedChip(oSimplifiedChip);

        var sServiceUrl = oTileConfiguration.service_url;

        if (!sServiceUrl) {
            return undefined;
        }

        return {
            path: sServiceUrl,
            refresh: oTileConfiguration.service_refresh_interval
        };
    };

    /**
     * The function returns the tile size in string format (e.g: "1x2") from the tile configuration of the provided simplified chip.
     *
     * @param {object} oSimplifiedChip
     *  A simplified version of the sap.ushell_abap.pbServices.ui2.ChipInstance.
     *  The object structure of the simplified chip model can be viewed in the "simplifiedChipModel.md" document in the FLP core-concepts GitHub repository.
     *
     * @since 1.90.0
     * @returns {string} Tile size in string format (e.g: "1x2"). Default is "1x1".
     * @private
     */
    chipsUtils.getTileSizeFromSimplifiedChip = function (oSimplifiedChip) {
        var oConfiguration = oSimplifiedChip.configuration;
        var sRow = oConfiguration.row || 1;
        var sCol = oConfiguration.col || 1;

        return sRow + "x" + sCol;
    };

    /**
     * The function returns the display number unit from the tile configuration of the provided simplified chip.
     *
     * @param {object} oSimplifiedChip
     *  A simplified version of the sap.ushell_abap.pbServices.ui2.ChipInstance.
     *  The object structure of the simplified chip model can be viewed in the "simplifiedChipModel.md" document in the FLP core-concepts GitHub repository.
     *
     * @since 1.90.0
     * @returns {(string|undefined)} The display number unit.
     * @private
     */
    chipsUtils.getNumberUnitFromSimplifiedChip = function (oSimplifiedChip) {
        var oTileConfiguration = this.getTileConfigurationFromSimplifiedChip(oSimplifiedChip);
        return oTileConfiguration.display_number_unit;
    };

    /**
     * The function returns the info from the tile configuration of the provided simplified chip.
     *
     * @param {object} oSimplifiedChip
     *  A simplified version of the sap.ushell_abap.pbServices.ui2.ChipInstance.
     *  The object structure of the simplified chip model can be viewed in the "simplifiedChipModel.md" document in the FLP core-concepts GitHub repository.
     *
     * @since 1.90.0
     * @returns {(string|undefined)} The info.
     * @private
     */
    chipsUtils.getInfoFromSimplifiedChip = function (oSimplifiedChip) {
        var oTileProperties = oSimplifiedChip.bags.tileProperties;

        return oTileProperties && oTileProperties.texts.display_info_text;
    };

    /**
     * The function returns the keywords from the tile configuration of the provided simplified chip.
     *
     * @param {object} oSimplifiedChip
     *  A simplified version of the sap.ushell_abap.pbServices.ui2.ChipInstance.
     *  The object structure of the simplified chip model can be viewed in the "simplifiedChipModel.md" document in the FLP core-concepts GitHub repository.
     *
     * @since 1.96.0
     * @returns {(string[])} The keywords.
     * @private
     */
    chipsUtils.getKeywordsFromSimplifiedChip = function (oSimplifiedChip) {
        var oTileProperties = oSimplifiedChip.bags.tileProperties;
        var sKeywordsText = oTileProperties && oTileProperties.texts.display_search_keywords;

        if (sKeywordsText) {
            return sKeywordsText.trim().split(/\s*,\s*/g);
        }

        return [];
    };

    /**
    * The function checks the chipId of the provided simplified chip to determine if it is a custom tile.
    *
    * @param {object} oSimplifiedChip
    *  A simplified version of the sap.ushell_abap.pbServices.ui2.ChipInstance.
    *  The object structure of the simplified chip model can be viewed in the "simplifiedChipModel.md" document in the FLP core-concepts GitHub repository.
    *
    * @since 1.90.0
    * @returns {boolean} True if the tile is a custom tile.
    * @private
    */
    chipsUtils.isCustomTileFromSimplifiedChip = function (oSimplifiedChip) {
        var sChipId = oSimplifiedChip.chipId;
        return sChipId !== DYNAMIC_BASE_CHIP_ID && sChipId !== STATIC_BASE_CHIP_ID;
    };

    /**
     * Creates a chip instance out of a simplified chip, adds bag data to it and finally loads it.
     *
     * @param {object} oSimplifiedChip
     * A simplified chip which is used to create a new chip instance.
     *
     * @since 1.91.0
     * @returns {Promise<object>} The newly created chip instance.
     * @private
     */
    chipsUtils.loadChipInstanceFromSimplifiedChip = function (oSimplifiedChip) {
        var oBags = oSimplifiedChip.bags;
        var oRawData = {
            chipId: oSimplifiedChip.chipId,
            // string is expected
            configuration: oSimplifiedChip.configuration ? JSON.stringify(oSimplifiedChip.configuration) : "{}"
        };

        return sap.ushell.Container.getServiceAsync("PageBuilding")
            .then(function (oPageBuildingService) {
                var oFactory = oPageBuildingService.getFactory();
                var oChipInstance = oFactory.createChipInstance(oRawData);

                this.addBagDataToChipInstance(oChipInstance, oBags);
                return new Promise(function (resolve, reject) {
                    oChipInstance.load(resolve, reject);
                })
                    .then(function () {
                        return oChipInstance;
                    });
            }.bind(this));
    };

    /**
     * Adds bag data to the chip instance.
     *
     * @param {object} oChipInstance chip instance
     * @param {object} [oBags] information about the chip
     * @since 1.91.0
     * @private
     */
    chipsUtils.addBagDataToChipInstance = function (oChipInstance, oBags) {
        if (!oBags) {
            return;
        }

        var sPropertyId;

        for (var sBagId in oBags) {
            var oBagData = oBags[sBagId];
            var oBag = oChipInstance.getBag(sBagId);

            try {
                for (sPropertyId in oBagData.properties) {
                    oBag.setProperty(sPropertyId, oBagData.properties[sPropertyId]);
                }
                for (sPropertyId in oBagData.texts) {
                    oBag.setText(sPropertyId, oBagData.texts[sPropertyId]);
                }
            } catch (oError) {
                Log.error("chipsUtils.addBagDataToChipInstance: " + oError.toString());
            }
        }
    };

    /**
     * Returns the target for specific custom tiles.
     * @param {object} oSimplifiedChip The SimplifiedChip
     *
     * @returns {object} The target in the URLParsing.constructShellHash format
     *
     * @private
     * @since 1.92.0
     */
    chipsUtils.getCustomTileTargetFromSimplified = function (oSimplifiedChip) {
        // News tile
        if (oSimplifiedChip.chipId === "X-SAP-UI2-CHIP:/UI2/AR_SRVC_NEWS") {
            return {
                target: {
                    semanticObject: "NewsFeed",
                    action: "displayNewsList"
                }
            };
        }

        // see also ABAP LaunchPageAdapter -> getCustomTileConfiguration()

        // Smart Business tile
        var oTileConfiguration = JSON.parse(oSimplifiedChip.configuration.tileConfiguration || "{}");
        var oTileProperties = JSON.parse(oTileConfiguration.TILE_PROPERTIES || "{}");
        if (oTileProperties.semanticObject && oTileProperties.semanticAction) {
            return {
                target: {
                    semanticObject: oTileProperties.semanticObject,
                    action: oTileProperties.semanticAction
                },
                params: {
                    EvaluationId: [oTileProperties.evaluationId]
                }
            };
        }

        return null;
    };

    return chipsUtils;

}, /* bExport= */ true);
