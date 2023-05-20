// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview This file contains miscellaneous utility functions.
 */
sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/ushell/utils",
    "sap/ushell/utils/UrlParsing"
], function (ObjectPath, utils, urlParsing) {
    "use strict";

    var ManifestPropertyHelper = {
        PLACEHOLDERS: {
            TITLE: "<title>",
            SUBTITLE: "<subtitle>",
            ICON: "<icon>",
            SEARCH_KEYWORDS: "<keywords>",
            SEMANTIC_OBJECT: "<semantic object>",
            ACTION: "<action>",
            PARAMETERS: "<parameters>",
            TARGET_URL: "<target URL>"
        },

        /**
         * Extracts card data from a card manifest.
         *
         * @param {object} manifest The card manifest
         * @returns {object} Extracted card data, ready to be put into bags
         */
        extractCardData: function (manifest) {
            var oAction = this._getNavigationAction(manifest),
                sTileConfiguration,
                oSemanticParameters,
                sSemanticParameters,
                sSemanticObject,
                sSemanticAction,
                sTargetUrl,
                bUseSemanticObject,
                aSearchKeywords = ObjectPath.get(["sap.app", "tags", "keywords"], manifest),
                sSearchKeywords;

            if (oAction) {
                sSemanticObject = ObjectPath.get(["parameters", "intentSemanticObject"], oAction);
                sSemanticAction = ObjectPath.get(["parameters", "intentAction"], oAction);
                sTargetUrl = ObjectPath.get(["parameters", "url"], oAction);
                oSemanticParameters = ObjectPath.get(["parameters", "intentParameters"], oAction);
            }

            if (oSemanticParameters) {
                sSemanticParameters = utils.urlParametersToString(oSemanticParameters);
            }

            if (sTargetUrl) {
                bUseSemanticObject = false;
            } else if (sSemanticObject && sSemanticAction) {
                bUseSemanticObject = true;
                sTargetUrl = "#" + sSemanticObject + "-" + sSemanticAction;
                if (sSemanticParameters) {
                    sTargetUrl += "?" + sSemanticParameters;
                }
            }

            sTileConfiguration = JSON.stringify({
                display_icon_url: ObjectPath.get(["sap.card", "header", "icon", "src"], manifest),
                navigation_semantic_object: sSemanticObject,
                navigation_semantic_action: sSemanticAction,
                navigation_semantic_parameters: sSemanticParameters,
                navigation_use_semantic_object: bUseSemanticObject,
                navigation_target_url: sTargetUrl
            });

            if (sTileConfiguration === "{}") {
                sTileConfiguration = undefined;
            }

            if (aSearchKeywords) {
                sSearchKeywords = aSearchKeywords.join(",");
            }

            return {
                bagProperties: {
                    display_title_text: ObjectPath.get(["sap.card", "header", "title"], manifest),
                    display_subtitle_text: ObjectPath.get(["sap.card", "header", "subTitle"], manifest),
                    display_search_keywords: sSearchKeywords
                },
                tileConfiguration: sTileConfiguration,
                manifest: this._replaceDataWithPlaceholders(manifest)
            };
        },

        /**
         * Merges card data into a card manifest.
         *
         * @param {object} manifest The card manifest
         * @param {object} cardData The card data
         * @returns {object} A copy of the manifest with merged card data
         */
        mergeCardData: function (manifest, cardData) {
            var oManifest = JSON.parse(JSON.stringify(manifest)),
                oNavigationAction = this._getNavigationAction(oManifest),
                aSearchKeywords;

            if (cardData.display_title_text) {
                ObjectPath.set(["sap.card", "header", "title"], cardData.display_title_text, oManifest);
            }

            if (cardData.display_subtitle_text) {
                ObjectPath.set(["sap.card", "header", "subTitle"], cardData.display_subtitle_text, oManifest);
            }

            if (cardData.display_search_keywords) {
                aSearchKeywords = cardData.display_search_keywords.split(",");
                ObjectPath.set(["sap.app", "tags", "keywords"], aSearchKeywords, oManifest);
            }

            if (cardData.display_icon_url) {
                ObjectPath.set(["sap.card", "header", "icon", "src"], cardData.display_icon_url, oManifest);
            }

            if (cardData.navigation_semantic_object) {
                ObjectPath.set(["parameters", "intentSemanticObject"], cardData.navigation_semantic_object, oNavigationAction);
            } else if (cardData.navigation_target_url) {
                // navigation_target_url is always filled, either with the intent hash or with a URL
                // however, the manifest property is only filled if it is a URL
                ObjectPath.set(["parameters", "url"], cardData.navigation_target_url, oNavigationAction);
            }

            if (cardData.navigation_semantic_action) {
                ObjectPath.set(["parameters", "intentAction"], cardData.navigation_semantic_action, oNavigationAction);
            }

            if (cardData.navigation_semantic_parameters_as_object) {
                ObjectPath.set(["parameters", "intentParameters"], cardData.navigation_semantic_parameters_as_object, oNavigationAction);
            }

            return oManifest;
        },

        /**
         * Extracts properties that can be translated from a CHIP instance bag
         *
         * @param {sap.ushell_abap.pbServices.ui2.Bag} bag A CHIP instance bag
         * <pre>
         * @returns {object} The translated properties. Example: {
         *      display_title_text: "I am a translated title",
         *      display_subtitle_text: "Some subtitle",
         *      display_search_keywords: "The search keywords"
         *  }
         * </pre>
         * @private
         */
        getTranslatablePropertiesFromBag: function (bag) {
            var oTranslatableProperties = {},
                aTextNames;

            if (bag && bag.getText && bag.getTextNames) {
                aTextNames = bag.getTextNames();

                aTextNames.forEach(function (sProperty) {
                    oTranslatableProperties[sProperty] = bag.getText(sProperty);
                });
            }

            return oTranslatableProperties;
        },

        /**
         * Retrieves the card manifest's extracted data from the CHIP instance.
         *
         * @param {sap.ushell_abap.pbServices.ui2.ChipInstance} chipInstance A card CHIP instance
         * @returns {object} The card data
         * @private
         */
        getCardData: function (chipInstance) {
            var oTilePropertiesBag,
                oBagProperties,
                sTileConfiguration,
                oCardData;

            if (chipInstance.bag) {
                oTilePropertiesBag = chipInstance.bag.getBag("tileProperties");
            } else {
                oTilePropertiesBag = chipInstance.getBag("tileProperties");
            }

            if (chipInstance.configuration) {
                sTileConfiguration = chipInstance.configuration.getParameterValueAsString("tileConfiguration");
            } else {
                sTileConfiguration = chipInstance.getConfigurationParameter("tileConfiguration");
            }

            oBagProperties = this.getTranslatablePropertiesFromBag(oTilePropertiesBag);
            oCardData = JSON.parse(sTileConfiguration || "{}");

            if (oCardData.navigation_semantic_parameters) {
                // eslint-disable-next-line camelcase
                oCardData.navigation_semantic_parameters_as_object = this._parseParameters(oCardData.navigation_semantic_parameters);
            }

            Object.keys(oBagProperties).forEach(function (key) {
                oCardData[key] = oBagProperties[key];
            });

            return oCardData;
        },

        /**
         * Parses the navigation parameters.
         *
         * @param {string} parameters The navigation parameters
         * @returns {object} The navigation parameters
         * @private
         */
        _parseParameters: function (parameters) {
            var oParameters = urlParsing.parseParameters("?" + parameters);

            // the service returns arrays for the values in case there are multiple values for the same URL parameter
            // however, we support only one value per parameter
            Object.keys(oParameters).forEach(function (key) {
                oParameters[key] = oParameters[key][0];
            });

            return oParameters;
        },

        /**
         * Replaces card manifest properties that are stored in the CHIP instance with a placeholder
         * so that they are not stored redundantly.
         *
         * @param {object} manifest The card manifest
         * @returns {object} A copy of the manifest with placeholders
         */
        _replaceDataWithPlaceholders: function (manifest) {
            var oManifest = JSON.parse(JSON.stringify(manifest)),
                oNavigationAction = this._getNavigationAction(oManifest);

            if (ObjectPath.get(["sap.card", "header", "title"], oManifest)) {
                ObjectPath.set(["sap.card", "header", "title"], this.PLACEHOLDERS.TITLE, oManifest);
            }

            if (ObjectPath.get(["sap.card", "header", "subTitle"], oManifest)) {
                ObjectPath.set(["sap.card", "header", "subTitle"], this.PLACEHOLDERS.SUBTITLE, oManifest);
            }

            if (ObjectPath.get(["sap.app", "tags", "keywords"], oManifest)) {
                ObjectPath.set(["sap.app", "tags", "keywords"], this.PLACEHOLDERS.SEARCH_KEYWORDS, oManifest);
            }

            if (ObjectPath.get(["sap.card", "header", "icon", "src"], oManifest)) {
                ObjectPath.set(["sap.card", "header", "icon", "src"], this.PLACEHOLDERS.ICON, oManifest);
            }

            if (ObjectPath.get(["parameters", "intentSemanticObject"], oNavigationAction)) {
                ObjectPath.set(["parameters", "intentSemanticObject"], this.PLACEHOLDERS.SEMANTIC_OBJECT, oNavigationAction);
            }

            if (ObjectPath.get(["parameters", "intentAction"], oNavigationAction)) {
                ObjectPath.set(["parameters", "intentAction"], this.PLACEHOLDERS.ACTION, oNavigationAction);
            }

            if (ObjectPath.get(["parameters", "url"], oNavigationAction)) {
                ObjectPath.set(["parameters", "url"], this.PLACEHOLDERS.TARGET_URL, oNavigationAction);
            }

            if (ObjectPath.get(["parameters", "intentParameters"], oNavigationAction)) {
                ObjectPath.set(["parameters", "intentParameters"], this.PLACEHOLDERS.PARAMETERS, oNavigationAction);
            }

            return oManifest;
        },

        /**
         * Retrieves the reference to the manifest's navigation action that contains the navigation target.
         *
         * @param {object} manifest The card's manifest
         * @returns {object} The navigation action
         * @private
         */
        _getNavigationAction: function (manifest) {
            var aActions = ObjectPath.get(["sap.card", "header", "actions"], manifest),
                oAction;

            if (aActions) {
                for (var i = 0; i < aActions.length; i++) {
                    oAction = aActions[i];
                    if (oAction.type === "Navigation") {
                        return oAction;
                    }
                }
            }

            return null;
        }
    };

    return ManifestPropertyHelper;
});
