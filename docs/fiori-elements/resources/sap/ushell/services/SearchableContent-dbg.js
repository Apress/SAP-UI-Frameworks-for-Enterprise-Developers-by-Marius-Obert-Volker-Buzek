// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview This module exposes the searchable content.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/Config",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readApplications",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readPages",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readUtils",
    "sap/base/util/values",
    "sap/ushell/library",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readVisualizations",
    "sap/base/Log",
    "sap/ushell/utils/UrlParsing"
], function (
    Config,
    readApplications,
    readPages,
    readUtils,
    objectValues,
    ushellLibrary,
    readVisualizations,
    Log,
    urlParsing
) {
    "use strict";

    // shortcut for sap.ushell.DisplayFormat
    var DisplayFormat = ushellLibrary.DisplayFormat;

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getServiceAsync("SearchableContent").then(function (SearchableContent) {});</code>.
     * Constructs a new instance of the searchable content service.
     *
     * @namespace sap.ushell.services.SearchableContent
     *
     * @constructor
     * @class
     * @see {@link sap.ushell.services.Container#getServiceAsync}
     * @since 1.77.0
     *
     * @private
     * @ui5-restricted sap.esh.search.ui
     */
    var SearchableContent = function () { };
    SearchableContent.COMPONENT_NAME = "sap/ushell/services/SearchableContent";

    /**
     * @typedef appData
     * @type {object}
     * @property {string} id
     * @property {string} title
     * @property {string} subtitle
     * @property {string} icon
     * @property {string} info
     * @property {string[]} keywords
     *    Search key words
     * @property {object} target
     *    Same format as in CDM RT schema in visualization/vizConfig/sap.flp/target.
     * @property {vizData[]} visualizations
     *    List of tiles etc.
     */

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
     * Collects and returns all apps
     * @returns {Promise<appData[]>} A list of appData.
     *
     * @since 1.77.0
     * @private
     * @ui5-restricted sap.esh.search.ui
     */
    SearchableContent.prototype.getApps = function () {
        if (Config.last("/core/spaces/enabled")) {
            return this._getPagesAppData()
                .then(this._filterGetApps);
        }
        return this._getLaunchPageAppData()
            .then(this._filterGetApps)
            .then(function (aApps) {
                Log.debug("SearchableContent@getApps in classic mode found " + aApps.length + " apps");
                return aApps;
            })
            .catch(function (oError) {
                Log.error("SearchableContent@getApps in classic mode failed", oError);
                return Promise.reject(oError);
            });
    };

    /**
     * Filters duplicates and appData with empty vizData
     * @param {appData[]} aAppData An array of appData
     * @returns {appData[]} The filtered array of appData
     *
     * @since 1.77.0
     * @private
     */
    SearchableContent.prototype._filterGetApps = function (aAppData) {
        aAppData.forEach(function (oAppData) {
            // remove duplicates
            var aVisualizations = oAppData.visualizations;
            var aUniqueProperties = [];
            oAppData.visualizations = [];
            aVisualizations.forEach(function (oViz) {
                var sUniqueProperties = JSON.stringify({
                    title: oViz.title,
                    subtitle: oViz.subtitle,
                    icon: oViz.icon,
                    vizType: oViz.vizType
                });
                if (aUniqueProperties.indexOf(sUniqueProperties) === -1) {
                    oAppData.visualizations.push(oViz);
                    aUniqueProperties.push(sUniqueProperties);
                }
            });
        });

        return aAppData.filter(function (oAppData) {
            // remove apps without visualization
            return oAppData.visualizations.length > 0;
        });
    };

    /**
     * Collects all appData occurrences within the classic homepage scenario
     * @returns {Promise<appData[]>} An array of appData
     *
     * @since 1.77.0
     * @private
     */
    SearchableContent.prototype._getLaunchPageAppData = function () {
        return sap.ushell.Container.getServiceAsync("LaunchPage")
            .then(function (oLaunchPageService) {
                this._oLaunchPageService = oLaunchPageService;
                return this._collectLaunchPageTiles();
            }.bind(this))
            .then(function (aResults) {
                var aCatalogTiles = aResults[0];
                var aGroupTiles = aResults[1];
                var aTiles = aCatalogTiles.concat(aGroupTiles);
                return Promise.all(aTiles.map(function (oTile) {
                    var bIsCatalogTile = aCatalogTiles.includes(oTile);
                    var oTileData = {
                        tileId: null,
                        tile: oTile
                    };
                    var sPreviewTitle;

                    try {
                        if (bIsCatalogTile) {
                            oTileData.tileId = this._oLaunchPageService.getCatalogTileId(oTile);
                        } else {
                            oTileData.tileId = this._oLaunchPageService.getTileId(oTile);
                        }
                        sPreviewTitle = this._oLaunchPageService.getCatalogTilePreviewTitle(oTile); // should work for catalogTiles and groupTiles
                    } catch (oError) {
                        Log.error("Could not get search data from tile " + oTileData.tileId, oError);
                    }

                    // Some tiles (e.g. SSB) need to have their view instantiated to return any tile properties
                    if (!sPreviewTitle) {
                        return new Promise(function (resolve, reject) {
                            if (bIsCatalogTile) {
                                this._oLaunchPageService.getCatalogTileViewControl(oTile)
                                    .done(resolve)
                                    .fail(reject);
                            } else {
                                this._oLaunchPageService.getTileView(oTile)
                                    .done(resolve)
                                    .fail(reject);
                            }
                        }.bind(this))
                            .then(function (oTileView) {
                                oTileData.view = oTileView;
                                return oTileData;
                            })
                            .catch(function (oError) {
                                Log.error("Could not get search data from tile " + oTileData.tileId, oError);
                                return oTileData;
                            });
                    }

                    return Promise.resolve(oTileData);
                }.bind(this)));
            }.bind(this))
            .then(function (aTileData) {
                var oAppData = {};
                var aVizData = aTileData
                    .map(function (oTileData) {
                        try {
                            return this._buildVizDataFromLaunchPageTile(oTileData.tile);
                        } catch (oError) {
                            Log.error("Could not get search data from tile " + oTileData.tileId, oError);
                            return null;
                        }
                    }.bind(this))
                    .filter(function (oVizData) {
                        return oVizData;
                    });

                // we need to delete the tile views after we are done with extracting the data
                aTileData.forEach(function (oTileData) {
                    var oTileView = oTileData.view;
                    if (oTileView) {
                        if (!oTileView.destroy) {
                            Log.error("The tile with id '" + oTileData.tileId + "' does not implement mandatory function destroy");
                        } else {
                            oTileView.destroy();
                        }
                    }
                });

                aVizData.forEach(function (oVizData) {
                    var sTarget = oVizData.targetURL;
                    if (sTarget) {
                        if (oAppData[sTarget]) {
                            oAppData[sTarget].visualizations.push(oVizData);
                        } else {
                            oAppData[sTarget] = this._buildAppDataFromViz(oVizData);
                        }
                    }
                }.bind(this));
                return objectValues(oAppData);
            }.bind(this));
    };

    /**
     * Collects catalog and group tiles from the LaunchPage service
     * @returns {Promise<object[]>} Resolves an array of LaunchPage tiles
     *
     * @since 1.77.0
     * @private
     */
    SearchableContent.prototype._collectLaunchPageTiles = function () {
        var oGroupTilesPromise = this._oLaunchPageService.getGroups().then(function (aGroups) {
            return aGroups.reduce(function (oTilesPromise, oGroup) {
                return Promise.all([
                    oTilesPromise,
                    this._oLaunchPageService.getGroupTilesForSearch(oGroup)
                ]).then(function (aTileResults) {
                    var aTiles = aTileResults[0];
                    var aGroupTiles = aTileResults[1];
                    return aTiles.concat(aGroupTiles);
                });
            }.bind(this), Promise.resolve([]));
        }.bind(this));

        var oCatalogTilesPromise = this._oLaunchPageService.getCatalogs().then(function (aCatalogs) {
            return aCatalogs.reduce(function (oTilesPromise, oGroup) {
                return Promise.all([
                    oTilesPromise,
                    this._oLaunchPageService.getCatalogTiles(oGroup)
                ]).then(function (aTileResults) {
                    var aTiles = aTileResults[0];
                    var aCatalogTiles = aTileResults[1];
                    return aTiles.concat(aCatalogTiles);
                });
            }.bind(this), Promise.resolve([]));
        }.bind(this));

        return Promise.all([
            oCatalogTilesPromise,
            oGroupTilesPromise
        ]);
    };

    /**
     * Collects all appData occurrences within the pages scenario
     * @returns {Promise<appData[]>} An array of appData
     *
     * @since 1.77.0
     * @private
     */
    SearchableContent.prototype._getPagesAppData = function () {
        var oAppData;
        var oSite;

        return sap.ushell.Container.getServiceAsync("CommonDataModel")
            .then(function (oCdmService) {
                return Promise.all([
                    oCdmService.getAllPages({ personalizedPages: true }),
                    oCdmService.getApplications(),
                    oCdmService.getVisualizations(),
                    oCdmService.getVizTypes(),
                    sap.ushell.Container.getServiceAsync("ClientSideTargetResolution")
                ]);
            })
            .then(function (aResult) {
                var aPages = aResult[0];
                var oApplications = aResult[1];
                var oVisualizations = aResult[2];
                var oVizTypes = aResult[3];
                var oCSTRService = aResult[4];

                oSite = {
                    applications: oApplications,
                    visualizations: oVisualizations,
                    vizTypes: oVizTypes
                };
                oAppData = {};

                this._applyCdmVisualizations(oSite, oAppData);
                this._applyCdmPages(oSite, aPages, oAppData);
                return this._filterAppDataByIntent(oAppData, oCSTRService);
            }.bind(this))
            .then(function () {
                this._applyCdmApplications(oSite, oAppData);

                return objectValues(oAppData);
            }.bind(this));
    };

    /**
     * Manipulates the map of appData by filtering the entries out which don't have a valid intent
     * or aren't urls
     * @param {object} oAppData The map of appData
     * @param {object} oCSTRService The ClientSideTargetResolution service
     * @returns {Promise<void>} Promise which resolves after the filtering is done
     *
     * @since 1.78.0
     * @private
     */
    SearchableContent.prototype._filterAppDataByIntent = function (oAppData, oCSTRService) {
        var aIntentTargetPromises = Object.keys(oAppData).map(function (sIntent) {
            return urlParsing.isIntentUrlAsync(sIntent)
                .then(function (bIsIntent) {
                    return bIsIntent ? sIntent : null;
                });
        });
        return Promise.all(aIntentTargetPromises)
            .then(function (aAllIntents) {
                var aIntentTargets = aAllIntents.filter(function (vIntent) {
                    return !!vIntent;
                });
                if (aIntentTargets.length === 0) {
                    return;
                }
                return new Promise(function (resolve, reject) {
                    oCSTRService.isIntentSupported(aIntentTargets)
                        .then(function (oSupported) {
                            Object.keys(oSupported).forEach(function (sTarget) {
                                if (!oSupported[sTarget].supported && oAppData[sTarget]) {
                                    delete oAppData[sTarget];
                                }
                            });
                        })
                        .always(resolve);
                });
            });
    };

    /**
     * Manipulates the map of appData by adding all applications
     * @param {object} oSite The cdm site containing at least applications and visualizations
     * @param {object} oAppData The map of appData
     *
     * @since 1.77.0
     * @private
     */
    SearchableContent.prototype._applyCdmApplications = function (oSite, oAppData) {
        Object.keys(oAppData).forEach(function (sKey) {
            try {
                var aVisualizations = oAppData[sKey].visualizations;

                var oVisualization = aVisualizations.find(function (oVizData) {
                    return oVizData.target.appId && oVizData.target.inboundId;
                });

                if (oVisualization) {
                    var oApp = oSite.applications[oVisualization.target.appId];
                    var oInbound = readApplications.getInbound(oApp, oVisualization.target.inboundId);
                    oAppData[sKey] = this._buildAppDataFromAppAndInbound(oApp, oInbound);
                    oAppData[sKey].visualizations = aVisualizations;
                    oAppData[sKey].target = aVisualizations[0].target;
                } else {
                    oAppData[sKey] = this._buildAppDataFromViz(aVisualizations[0]);
                    oAppData[sKey].visualizations = aVisualizations;
                    oAppData[sKey].target = aVisualizations[0].target;
                }
            } catch (oError) {
                Log.error("Could not get search data from application " + sKey, oError);
            }
        }.bind(this));
    };

    /**
     * Manipulates the map of appData by adding visualizations from the cdm site
     * @param {object} oSite The cdm site containing at least applications and visualizations
     * @param {object} oAppData The map of appData
     *
     * @since 1.78.0
     * @private
     */
    SearchableContent.prototype._applyCdmVisualizations = function (oSite, oAppData) {
        Object.keys(oSite.visualizations).forEach(function (sKey) {
            try {
                var oVizReference = {
                    vizId: sKey,
                    // the search should display only standard tiles if possible, never flat tiles or links
                    // some tiles might only support standardWide and not standard. this is handled by getVizData
                    displayFormatHint: DisplayFormat.Standard
                };
                var oVizData = readUtils.getVizData(oSite, oVizReference /*, oSystemContext*/);
                this._changeVizType(oVizData);

                var sTarget = oVizData.targetURL;
                oVizData.preview = true;

                if (sTarget) {
                    if (oAppData[sTarget]) {
                        oAppData[sTarget].visualizations.push(oVizData);
                    } else {
                        oAppData[sTarget] = {
                            visualizations: [
                                oVizData
                            ]
                        };
                    }
                }
            } catch (oError) {
                Log.error("Could not get search data from visualization " + sKey, oError);
            }
        }.bind(this));
    };

    /**
     * Manipulates the map of appData by adding all visualizations from the pages
     * @param {object} oSite The cdm site containing at least applications and visualizations
     * @param {object[]} aPages The list of pages
     * @param {object} oAppData The map of appData
     *
     * @since 1.77.0
     * @private
     */
    SearchableContent.prototype._applyCdmPages = function (oSite, aPages, oAppData) {
        aPages.forEach(function (oPage) {
            var aVizReferences = readPages.getVisualizationReferences(oPage);
            aVizReferences.forEach(function (oVizReference) {
                try {
                    // the search should display only standard tiles if possible, never flat tiles or links
                    // some tiles might only support standardWide and not standard. this is handled by getVizData
                    if (oVizReference.displayFormatHint && oVizReference.displayFormatHint !== DisplayFormat.Standard) {
                        // this service processes the original personalized CDM data. without the clone, changing the
                        // display format would affect the tiles on the pages. A shallow copy is sufficient here.
                        oVizReference = Object.assign({}, oVizReference);
                        oVizReference.displayFormatHint = DisplayFormat.Standard;
                    }

                    var oVizData = readUtils.getVizData(oSite, oVizReference /*, oSystemContext*/);
                    this._changeVizType(oVizData);

                    var sTarget = oVizData.targetURL;

                    oVizData.preview = true;

                    if (sTarget) {
                        if (oAppData[sTarget]) {
                            oAppData[sTarget].visualizations.push(oVizData);
                        } else {
                            oAppData[sTarget] = {
                                visualizations: [
                                    oVizData
                                ]
                            };
                        }
                    }
                } catch (oError) {
                    Log.error("Could not get search data from vizReference " + oVizReference.id, oError);
                }
            }.bind(this));
        }.bind(this));
    };

    /**
     * There is no preview mode for custom tiles on CDM. To prevent those tiles from
     * loading dynamic content, the tiles are transformed into static tiles.
     * @param {object} oVizData A tile's data
     *
     * @since 1.93.0
     * @private
     */
    SearchableContent.prototype._changeVizType = function (oVizData) {
        if (oVizData._instantiationData.platform === "CDM" &&
            !readVisualizations.isStandardVizType(oVizData.vizType)) {
            oVizData.vizType = "sap.ushell.StaticAppLauncher";
            oVizData._instantiationData.vizType = {
                "sap.ui5": {
                    componentName: "sap.ushell.components.tiles.cdm.applauncher"
                }
            };
        }
    };

    /**
     * Constructs an appData object based on an application and inbound
     * @param {object} oApp An application
     * @param {object} oInb An inbound
     * @returns {appData} The appData object
     *
     * @since 1.77.0
     * @private
     */
    SearchableContent.prototype._buildAppDataFromAppAndInbound = function (oApp, oInb) {
        return {
            id: readApplications.getId(oApp),
            title: oInb.title || readApplications.getTitle(oApp),
            subtitle: oInb.subTitle || readApplications.getSubTitle(oApp),
            icon: oInb.icon || readApplications.getIcon(oApp),
            info: oInb.info || readApplications.getInfo(oApp),
            keywords: oInb.keywords || readApplications.getKeywords(oApp),
            visualizations: []
        };
    };

    /**
     * Constructs an appData object based on vizData
     * @param {vizData} oVizData The vizData object
     * @returns {appData} The appData object
     *
     * @since 1.77.0
     * @private
     */
    SearchableContent.prototype._buildAppDataFromViz = function (oVizData) {
        return {
            id: oVizData.vizId,
            title: oVizData.title,
            subtitle: oVizData.subtitle,
            icon: oVizData.icon,
            info: oVizData.info,
            keywords: oVizData.keywords,
            target: oVizData.target,
            visualizations: [
                oVizData
            ]
        };
    };

    /**
     * Constructs an vizData object based on a LaunchPage tile
     * @param {object} oLaunchPageTile A LaunchPage tile
     * @returns {vizData} The vizData object
     *
     * @since 1.77.0
     * @private
     */
    SearchableContent.prototype._buildVizDataFromLaunchPageTile = function (oLaunchPageTile) {
        var oVizData;

        // Filter all tiles that cannot be launched due to a missing target
        if (this._oLaunchPageService.getCatalogTileTargetURL(oLaunchPageTile) &&
            this._oLaunchPageService.isTileIntentSupported(oLaunchPageTile)) {
            oVizData = {
                id: this._oLaunchPageService.getTileId(oLaunchPageTile)
                    || this._oLaunchPageService.getCatalogTileId(oLaunchPageTile),
                vizId: this._oLaunchPageService.getCatalogTileId(oLaunchPageTile)
                    || this._oLaunchPageService.getTileId(oLaunchPageTile)
                    || "",
                vizType: "",
                title: this._oLaunchPageService.getCatalogTilePreviewTitle(oLaunchPageTile)
                    || this._oLaunchPageService.getCatalogTileTitle(oLaunchPageTile)
                    || this._oLaunchPageService.getTileTitle(oLaunchPageTile)
                    || "",
                subtitle: this._oLaunchPageService.getCatalogTilePreviewSubtitle(oLaunchPageTile)
                    || "",
                icon: this._oLaunchPageService.getCatalogTilePreviewIcon(oLaunchPageTile)
                    || "sap-icon://business-objects-experience",
                info: this._oLaunchPageService.getCatalogTilePreviewInfo(oLaunchPageTile)
                    || "",
                keywords: this._oLaunchPageService.getCatalogTileKeywords(oLaunchPageTile)
                    || [],
                target: {
                    type: "URL",
                    url: this._oLaunchPageService.getCatalogTileTargetURL(oLaunchPageTile)
                },
                targetURL: this._oLaunchPageService.getCatalogTileTargetURL(oLaunchPageTile)
            };

            // This is basically a test if this is an ABAP LaunchPage tile, which is not very clean.
            // On ABAP the tiles and especially custom tiles can be displayed properly in the search
            // as they offer a preview mode.
            if (oLaunchPageTile.getChip) {
                oVizData._instantiationData = {
                    platform: "LAUNCHPAGE",
                    launchPageTile: oLaunchPageTile
                };
            } else {
                // On CDM there is no preview mode for tiles, therefore the search only displays static tiles
                oVizData._instantiationData = {
                    platform: "CDM",
                    vizType: {
                        "sap.ui5": {
                            componentName: "sap.ushell.components.tiles.cdm.applauncher"
                        }
                    }
                };
            }
        }

        return oVizData;
    };

    SearchableContent.hasNoAdapter = true;
    return SearchableContent;
}, /*export=*/ true);
