// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Helper for accessing the read utils for the 'CDM' platform.
 *
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readVisualizations",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readApplications",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readHome",
    "sap/ushell/adapters/cdm/v3/utilsCdm",
    "sap/ushell/Config",
    "sap/base/util/deepClone",
    "sap/base/util/isPlainObject",
    "sap/base/util/ObjectPath",
    "sap/base/util/deepExtend",
    "sap/base/util/isEmptyObject",
    "sap/ushell/library"
], function (
    readVisualizations,
    readApplications,
    readHome,
    utilsCdm,
    Config,
    deepClone,
    isPlainObject,
    ObjectPath,
    deepExtend,
    isEmptyObject,
    ushellLibrary
) {
    "use strict";

    var readUtils = {};

    // shortcut for sap.ushell.DisplayFormat
    var DisplayFormat = ushellLibrary.DisplayFormat;

    /**
     * @typedef vizData
     * @type {object}
     * @property {string} id
     * @property {string} vizId
     * @property {string} vizType
     * @property {string} title
     * @property {string} subtitle
     * @property {string} icon
     * @property {string} info
     * @property {string[]} keywords
     *    Search key words
     * @property {object} target
     *    Same format as in CDM RT schema in visualization/vizConfig/sap.flp/target.
     * @property {object} _instantiationData
     *    Platform-specific data for instantiation
     */

    /**
     * Returns the vizData for a vizReference
     * which is evaluated on the basis of the CDM parts
     *
     * @param {object} oSite The cdm site object
     * @param {object} oVizReference A reference to a visualization
     * @param {object} oSystemContext The system context
     * @returns {vizData} The vizData with default values
     *
     * @since 1.78.0
     * @private
     */
    readUtils.getVizData = function (oSite, oVizReference, oSystemContext) {
        if (oVizReference.isBookmark && oVizReference.url) {
            // convert old bookmarks to new
            oVizReference = deepClone(oVizReference);
            oVizReference.subTitle = oVizReference.subtitle;
            oVizReference.target = utilsCdm.toTargetFromHash(oVizReference.url);
        }

        var aCdmParts = this.getCdmParts(oSite, oVizReference);
        var oVizConfig = aCdmParts && aCdmParts[1] || {};
        var oApp = aCdmParts && aCdmParts[3] || {};
        var oViz = readVisualizations.get(oSite, readHome.getTileVizId(oVizReference)) || {};
        var oVizData = {
            id: readHome.getTileId(oVizReference),
            vizId: readHome.getTileVizId(oVizReference) || "",
            vizType: oVizReference.vizType || readVisualizations.getTypeId(oViz) || "",
            vizConfig: deepExtend({}, oVizConfig, oVizReference.vizConfig),
            title: readVisualizations.getTitle(aCdmParts) || "",
            subtitle: readVisualizations.getSubTitle(aCdmParts) || "",
            icon: readVisualizations.getIcon(aCdmParts) || "",
            keywords: readVisualizations.getKeywords(aCdmParts) || [],
            info: readVisualizations.getInfo(aCdmParts) || "",
            target: oVizReference.target || readVisualizations.getTarget(oViz) || {},
            indicatorDataSource: this._getIndicatorDataSource(oVizReference, oViz, oSystemContext),
            isBookmark: oVizReference.isBookmark || false,
            contentProviderId: oVizReference.contentProviderId || readApplications.getContentProviderId(oApp) || "",
            displayFormatHint: oVizReference.displayFormatHint,
            numberUnit: readVisualizations.getNumberUnit(aCdmParts),
            _instantiationData: readVisualizations.getInstantiationData(oViz)
        };
        oVizData.target = this.harmonizeTarget(oVizData.target);
        oVizData.targetURL = utilsCdm.toHashFromVizData(oVizData, oSite.applications);

        if (oVizData.indicatorDataSource) {
            if (oVizData.indicatorDataSource.dataSource) {
                oVizData.dataSource = readVisualizations.getDataSource(aCdmParts, oVizData.indicatorDataSource.dataSource);
            } else if (oVizReference.isBookmark && oVizReference.dataSource) {
                // for bookmarks there is no key/value mapping of the bookmark
                oVizData.dataSource = oVizReference.dataSource;
            }
        }

        if (oVizReference.isBookmark) {
            this._addBookmarkInstantiationData(oVizData, oSite);
        }

        if (!oVizData._instantiationData || !Object.keys(oVizData._instantiationData)) {
            oVizData._instantiationData = {
                platform: "CDM",
                vizType: readVisualizations.getType(oSite, oVizData.vizType)
            };
        }

        this._evaluateDisplayFormat(oVizData, oSite);

        return oVizData;
    };

    /**
     * Returns the indicator data source with or without prefix depending on provided parameters
     *
     * @param {object} oVizRef the vizReference
     * @param {object} oViz the visualization
     * @param {object} oSystemContext the system context
     *
     * @returns {object} the indicatorDataSource
     *
     * @since 1.90.0
     * @private
     */
    readUtils._getIndicatorDataSource = function (oVizRef, oViz, oSystemContext) {
        if (oVizRef.indicatorDataSource && oVizRef.indicatorDataSource.path) {
            if (oVizRef.contentProviderId && oSystemContext) {
                oVizRef.indicatorDataSource.path = oSystemContext.getFullyQualifiedXhrUrl(oVizRef.indicatorDataSource.path);
            }
            return oVizRef.indicatorDataSource;
        }
        return readVisualizations.getIndicatorDataSource(oViz);
    };

    /**
     * Returns the vizReference for a vizData
     * which is used for saving the tile to the site
     *
     * @param {vizData} oVizData The vizData
     * @returns {object} The vizReference
     *
     * @since 1.78.0
     * @private
     */
    readUtils.getVizRef = function (oVizData) {
        var oVizRef = {
            id: oVizData.id,
            vizId: oVizData.vizId,
            title: oVizData.title,
            subTitle: oVizData.subtitle,
            icon: oVizData.icon,
            keywords: oVizData.keywords,
            info: oVizData.info,
            target: oVizData.target,
            indicatorDataSource: oVizData.indicatorDataSource,
            dataSource: oVizData.dataSource,
            contentProviderId: oVizData.contentProviderId,
            displayFormatHint: oVizData.displayFormatHint,
            numberUnit: oVizData.numberUnit
        };

        // we always want to save without prefix so we reset here in case it is needed
        if (oVizRef.indicatorDataSource && oVizRef.indicatorDataSource.originalPath) {
            oVizRef.indicatorDataSource.path = oVizRef.indicatorDataSource.originalPath;
            delete oVizRef.indicatorDataSource.originalPath;
        }

        if (oVizData.isBookmark) {
            oVizRef.isBookmark = oVizData.isBookmark;

            // only save the vizType and vizConfig for custom bookmarks
            if (oVizData.vizConfig !== undefined && !isEmptyObject(oVizData.vizConfig)) {
                oVizRef.vizType = oVizData.vizType;
                if (oVizData.cdmVizType) {
                    oVizRef.vizType = oVizData.cdmVizType;
                }
                oVizRef.vizConfig = oVizData.vizConfig;
            }
        }

        return oVizRef;
    };

    /**
     * Returns an array based on a group tile
     * which contains the cdm parts containing the information about the tile
     *
     * @param {object} oSite A CDM Site
     * @param {object} oTile A tile
     * @returns {object[]} A fixed list containing the tile, the vizConfig, the inbound, and the app.
     *
     * @since 1.78.0
     * @private
     */
    readUtils.getCdmParts = function (oSite, oTile) {
        var oViz = readVisualizations.get(oSite, readHome.getTileVizId(oTile)) || {};
        var oVizConfig = readVisualizations.getConfig(oViz);
        var oApp = readVisualizations.getAppDescriptor(oSite, readVisualizations.getAppId(oViz));
        var oInbound = readApplications.getInbound(oApp, readVisualizations.getInboundId(oViz));
        return [oTile, oVizConfig, oInbound, oApp];
    };

    /**
     * Converts target parameters from array to object structure if needed.
     * The array format is often used FLP internal while the object format is used
     * for CDM navigation targets as found in visualizations or bookmarks.
     *
     * Example for the array format:
     * <pre>
     *  [
     *      {
     *          name: "a",
     *          value: "b"
     *      }
     *  ]
     * </pre>
     *
     * Example for the object format:
     * <pre>
     *  {
     *      a: {
     *          value: {
     *              format: "plain",
     *              value "b"
     *          }
     *      }
     *  }
     * </pre>
     *
     * @param {object} oTarget The target of a visualization or vizReference
     * @returns {object} The target with parameters in object format
     *
     * @since 1.80.0
     * @private
     */
    readUtils.harmonizeTarget = function (oTarget) {
        var oParameters = oTarget.parameters;

        if (!oParameters || isPlainObject(oParameters)) {
            return oTarget;
        }

        var oParametersOut = {};
        oParameters.forEach(function (oParam) {
            if (oParametersOut[oParam.name]) {
                if (!Array.isArray(oParametersOut[oParam.name].value.value)) {
                    oParametersOut[oParam.name].value.value = [oParametersOut[oParam.name].value.value];
                }

                oParametersOut[oParam.name].value.value.push(oParam.value);
            } else {
                oParametersOut[oParam.name] = {
                    value: {
                        value: oParam.value,
                        format: "plain"
                    }
                };
            }
        });

        oTarget.parameters = oParametersOut;
        return oTarget;
    };

    /**
     * Evaluates and applies the displayFormatHint and supportedDisplayFormats in-place to the vizData
     * @param {object} oVizData The vizData
     * @param {object} oSite The cdm site
     *
     * @private
     * @since 1.90.0
     */
    readUtils._evaluateDisplayFormat = function (oVizData, oSite) {
        var sDisplayFormatHint = oVizData.displayFormatHint;
        var oVizType = readVisualizations.getType(oSite, oVizData.vizType);
        var sTileSize = readVisualizations.getTileSize(oVizType);

        // Set standard fallback displayFormat to StandardWide for 1x2 tiles
        var sStandardDisplayFormat = sTileSize === "1x2" ? DisplayFormat.StandardWide : DisplayFormat.Standard;
        var aDefaultDisplayFormats = [sStandardDisplayFormat, DisplayFormat.Compact];

        // get displayFormats and apply fallback values
        oVizData.supportedDisplayFormats = readVisualizations.getSupportedDisplayFormats(oVizType) || aDefaultDisplayFormats;
        var sDefaultDisplayFormat = readVisualizations.getDefaultDisplayFormat(oVizType) || sStandardDisplayFormat;

        // displayFormatHint is not supported or undefined
        if (oVizData.supportedDisplayFormats.indexOf(sDisplayFormatHint) === -1) {
            oVizData.displayFormatHint = sDefaultDisplayFormat;
        }
    };

    /**
     * Adds properties to the vizData of a bookmark, which are required for the instantiation
     * @param {vizData} oVizData The vizData of the bookmark
     * @param {object} oSite A CDM site
     *
     * @since 1.82.0
     * @private
     */
    readUtils._addBookmarkInstantiationData = function (oVizData, oSite) {
        if (oVizData.vizType) {
            var oVizType = readVisualizations.getType(oSite, oVizData.vizType);
            var sVizTypeType = ObjectPath.get(["sap.app", "type"], oVizType || {});

            if (oVizType && sVizTypeType !== "chipVizType") {
                oVizData._instantiationData = {
                    platform: "CDM",
                    vizType: oVizType
                };
            } else {
                // uses the chip as fallback
                var oChipConfig = readVisualizations.getChipConfigFromVizReference(oVizData);
                oVizData._instantiationData = {
                    platform: "ABAP",
                    chip: deepClone(oChipConfig),
                    simplifiedChipFormat: true
                };
                oVizData.cdmVizType = oVizData.vizType;
                oVizData.vizType = oChipConfig.chipId;
            }
        } else if (oVizData.indicatorDataSource && oVizData.indicatorDataSource.path) {
            // Dynamic tile bookmark
            oVizData.vizType = "sap.ushell.DynamicAppLauncher";
        } else {
            // Static tile bookmark
            oVizData.vizType = "sap.ushell.StaticAppLauncher";
        }
    };

    /**
     * Fetches the ids of the vizTypes referenced in the bookmark
     * @param {object} oBookmark The bookmark data
     * @returns {string[]} An array of vizTypeIds
     *
     * @since 1.91.0
     * @private
     */
    readUtils.getBookmarkVizTypeIds = function (oBookmark) {
        // standard bookmarks don't define any vizType
        var aIds = [
            "sap.ushell.StaticAppLauncher",
            "sap.ushell.DynamicAppLauncher"
        ];

        // vizTypes are only available for custom bookmarks
        var sCdmVizType = oBookmark.vizType;
        if (sCdmVizType && !aIds.includes(sCdmVizType)) {
            aIds.push(sCdmVizType);
        }

        var oChipConfig = readVisualizations.getChipConfigFromVizReference(oBookmark);
        var sChipId = oChipConfig && oChipConfig.chipId;
        if (sChipId && !aIds.includes(sChipId)) {
            aIds.push(sChipId);
        }

        return aIds;
    };

    return readUtils;
});
