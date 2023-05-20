// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Base of Unified Shell's LaunchPageAdapter for the 'CDM' platform - Version 3 (V3)
 *   and StaticGroupsContainer for Featured Group
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readHome",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readVisualizations",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readUtils",
    "sap/m/GenericTile",
    "sap/ui/core/ComponentContainer",
    "sap/ushell/adapters/cdm/_LaunchPage/uri.transform",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/navigationMode",
    "sap/ushell/resources",
    "sap/ushell/utils",
    "sap/ushell/adapters/cdm/v3/utilsCdm",
    "sap/base/util/Version",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/isPlainObject",
    "sap/base/util/isEmptyObject",
    "sap/base/util/ObjectPath",
    "sap/base/util/deepExtend",
    "sap/base/util/deepClone",
    "sap/base/Log",
    "sap/ushell/UI5ComponentType"
], function (
    oReadHomePageUtils,
    oReadVisualization,
    readUtils,
    GenericTile,
    ComponentContainer,
    fnUriTransform,
    Config,
    oEventHub,
    navigationMode,
    oResources,
    oUshellUtils,
    oUtilsCdm,
    Version,
    jQuery,
    isPlainObject,
    isEmptyObject,
    ObjectPath,
    deepExtend,
    deepClone,
    Log,
    UI5ComponentType
) {
    "use strict";

    var oLogger = Log.getLogger("sap/ushell/adapters/cdm/LaunchPageAdapter");
    var oLogLevel = Log.Level;
    var STATIC_TILE_COMPONENT_NAME = "sap.ushell.components.tiles.cdm.applauncher";
    var DYNAMIC_TILE_COMPONENT_NAME = "sap.ushell.components.tiles.cdm.applauncherdynamic";

    /**
     * Constructs for the AdapterBase which serves as a base class for LaunchPageAdapter(CDM3)
     * and StaticGroupAdapter
     * @param {object} oUnused
     *     the system served by the adapter
     * @param {string} sParameter
     *     parameter as string (legacy, was used before oAdapterConfiguration was added)
     * @param {object} oAdapterConfiguration
     *     configuration for the adapter.
     *
     * @class
     *
     * @constructor
     * @experimental Since 1.65.0
     * @since 1.65.0
     * @private
     */
    function AdapterBase (oUnused, sParameter, oAdapterConfiguration) {
        this.oAdapterConfiguration = oAdapterConfiguration;
        this._mResolvedTiles = {};
        this._mCatalogTilePromises = {};
        this._mFailedResolvedCatalogTiles = {};
        this._mFailedResolvedTiles = {};

        this.TileType = {
            Tile: "tile",
            Link: "link",
            Card: "card"
        };
    }

    /**
     * Returns the groups of the user. These group objects can be passed into all
     * functions expecting a group.
     *
     * The first group in this list is considered the default group.
     *
     * @returns {jQuery.Promise}
     *  A promise that is always resolved. In case of success the array consists
     *  of group objects. In case the groups could not be loaded the array is empty.
     */
    AdapterBase.prototype.getGroups = function () {
        var oDeferred = new jQuery.Deferred();

        this._ensureLoaded()
            .done(function (aGroups) {
                oUshellUtils.setPerformanceMark("FLP - homepage groups processed");
                oDeferred.resolve(aGroups);
            })
            .fail(function () {
                // resolve with an empty array in case no groups could be loaded
                oDeferred.resolve([]);
            });
        return oDeferred.promise();
    };

    /**
     * Ensures that all items (tiles and links) for all groups returned by the CDM site
     * or the featured group static site are resolved. Furthermore, the default group is
     * set. If the default group does not yet exist, it is created.
     * For featured group sta
     * @returns {jQuery.Promise}
     *  A promise which will be always resolved. In case all items (tiles and links)
     *  of all groups could be loaded using ClientSideTargetResolution the array
     *  contains the group objects. If the resolution does not go as expected,
     *  the promise is rejected.
     *
     * @private
     */
    AdapterBase.prototype._ensureLoaded = function () {
        var that = this;

        // bundle multiple requests running in parallel
        if (this._ensureLoadedDeferred) {
            return this._ensureLoadedDeferred.promise();
        }

        var oDeferred = new jQuery.Deferred();
        this._ensureLoadedDeferred = oDeferred;

        this._getSiteData()
            .done(function (oSite) {
                // Ensure site has expected CDM format
                if (!that.isSiteSupported(oSite)) {
                    throw new Error("Invalid CDM site version: Check the configuration of the launchpage adapter and the version of the FLP site");
                }

                var aItemPromises = [];
                var aGroups = oReadHomePageUtils.getGroupsArrayFromSite(oSite);
                aGroups = that._addDefaultGroup(aGroups, oSite);

                aGroups.forEach(function (oGroup) {
                    // resolve the tile intents already now, as methods like getGroupTiles
                    // or getTileTitle are synchronously called
                    aItemPromises = that._ensureGroupItemsResolved(oGroup, oSite).concat(aItemPromises); // TODO split method as well
                });

                // wait for resolving of all items
                // Note: _allPromisesDone does never reject. Therefore no fail handler is required.
                that._allPromisesDone(aItemPromises)
                    .done(function () {
                        that._ensureLoadedDeferred.resolve(aGroups);
                        // ensure that following _ensureLoaded calls get resolved with a new parameter
                        // (otherwise it will be resolved with the "cached" groups)
                        delete that._ensureLoadedDeferred;

                        that._logTileResolutionFailures(that._mFailedResolvedTiles);
                    });
            })
            .fail(function (sErrorMessage0) {
                oLogger.error("Delivering homepage groups failed - " + sErrorMessage0);
                that._ensureLoadedDeferred.resolve([]);
                // ensure that following _ensureLoaded calls get resolved with a new parameter
                delete that._ensureLoadedDeferred;
            });

        return oDeferred.promise();
    };

    /**
     * Resolves items (tiles and links) for a given group.
     *
     * @param {object} oGroup
     *  Group for which the items should be resolved
     * @param {object} oSite
     *  The corresponding site object
     *
     * @returns {jQuery.promise[]}
     *  An array of jQuery promises each belonging to a respective item.
     *
     * @private
     */
    AdapterBase.prototype._ensureGroupItemsResolved = function (oGroup, oSite) {
        var aPromises = [];
        var aResolvedTilesPromises;
        var aResolvedLinksPromises;

        // Tiles
        if (oGroup.payload && oGroup.payload.tiles) {
            aResolvedTilesPromises = this._ensureGroupTilesResolved(oGroup.payload.tiles, oSite);
            Array.prototype.push.apply(aPromises, aResolvedTilesPromises);
        }

        // Links
        if (oGroup.payload && oGroup.payload.links) {
            aResolvedLinksPromises = this._ensureGroupLinksResolved(oGroup.payload.links, oSite);
            Array.prototype.push.apply(aPromises, aResolvedLinksPromises);
        }

        return aPromises;
    };

    /**
     * Resolves the given group tiles.
     *
     * @param {object[]} aGroupTiles
     *  Array of tiles which should be resolved
     * @param {object} oSite
     *  The corresponding site object
     *
     * @returns {jQuery.Promise[]}
     *  An array of jQuery promises each belonging to a respective tile.
     *
     * @private
     */
    AdapterBase.prototype._ensureGroupTilesResolved = function (aGroupTiles, oSite) {
        return (aGroupTiles || []).map(function (oTile, iIndex) {
            return this._resolveGroupTile(oTile, oSite)
                .then(function (oResolvedTileOutcome) {
                    oResolvedTileOutcome.isLink = false;

                    return oResolvedTileOutcome;
                });
        }, this);
    };

    /**
     * Resolves the given group links.
     *
     * @param {object[]} aGroupLinks
     *  Array of links which should be resolved
     * @param {object} oSite
     *  The corresponding site object
     * @returns {jQuery.Promise[]}
     *  An array of jQuery promises each belonging to a respective link.
     *
     * @private
     */
    AdapterBase.prototype._ensureGroupLinksResolved = function (aGroupLinks, oSite) {
        return (aGroupLinks || []).map(function (oLink) {
            return this._resolveGroupTile(oLink, oSite)
                .then(function (oResolvedLinkOutcome) {
                    oResolvedLinkOutcome.isLink = true;

                    return oResolvedLinkOutcome;
                });
        }, this);
    };

    /**
     * Resolves the target app for a given group tile within a given site
     * <p>
     * Since CDM2.0, resolution is usually done by appId. Only in the following
     * cases, the tile is resolved by its target intent:
     * <ol>
     *      <li>bookmark tiles</li>
     *      <li>external URL launcher tiles - no app reference possible;
     *          model should be changed for this scenario</li>
     * </ol>
     *
     * @param {object} oTile
     *  Group tile
     * @param {object} oSite
     *  The corresponding site object
     *
     * @returns {jQuery.Promise}
     *  In case of success, the done handler is called with the respective
     *  tile UI. In case of failure a respective error message is passed
     *  to the fail handler which will be called in this case.
     */
    AdapterBase.prototype._resolveGroupTile = function (oTile, oSite) {
        var mSuccessCache = this._mResolvedTiles;
        var mFailureCache = this._mFailedResolvedTiles;
        var oResultPromise;

        function updateCaches (oResolvedTile) {
            mSuccessCache[oTile.id] = oResolvedTile;

            if (mFailureCache[oTile.id]) {
                delete mFailureCache[oTile.id];
            }

            return oResolvedTile;
        }

        function isUrlLauncherTile (oTile) {
            var oTarget = oTile.target;

            return oTarget
                && oTarget.semanticObject === "Shell"
                && oTarget.action === "launchURL";
        }

        if (mSuccessCache[oTile.id]) {
            return (new jQuery.Deferred())
                .resolve(mSuccessCache[oTile.id])
                .promise();
        }

        if (oTile.target && oTile.target.url) {
            // URL launcher tile (so far this can be in bookmark case,
            // but we want to make simple URL launcher tiles always like that
            oResultPromise = jQuery.when(this._getTileForUrl(oTile));
        } else if (oTile.isBookmark && oTile.vizType === undefined) {
            // at least for now, we resolve bookmark tiles by intent
            oResultPromise = this._resolveTileByIntent(oTile, oSite);
        } else if (isUrlLauncherTile(oTile)) {
            // TODO: CDM 2.0: remove temporary fallback logic for "Shell-launchURL"
            // tiles (should rather be implemented as above)
            oResultPromise = this._resolveTileByIntent(oTile, oSite);
        } else {
            // in any other case, we resolve by appId
            oResultPromise = this._resolveTileByVizId(oTile, oSite);
        }

        var oDeferred = new jQuery.Deferred();

        oResultPromise.done(function (oResolvedTile) {
            oDeferred.resolve(updateCaches(oResolvedTile));
        }).fail(function (vFailureInfo) {
            mFailureCache[oTile.id] = vFailureInfo;
            oDeferred.reject(vFailureInfo);
        });

        return oDeferred.promise();
    };

    /**
     * Calculates data and target app for a given group tile using its visualization.
     * Here the visualizations "target" attribute and its configuration ("vizConfig")
     * is used.
     *
     * @param {object} oTile
     *  Group tile
     * @param {object} oSite
     *  The corresponding site object
     *
     * @returns {jQuery.Promise}
     *  In case of success, the done handler is called with the respective
     *  tileResolutionResult. In case of failure a respective error message is passed
     *  to the fail handler which will be called in this case.
     */
    AdapterBase.prototype._resolveTileByVizId = function (oTile, oSite) {
        var oVisualization;
        var sVisualizationId;
        var oVisualizationType;
        var sVisualizationTypeId;
        var sAppId;
        var oAppDescriptor;
        var oInboundResult;
        var oMapped;
        var sNavigationMode;
        var oApp;
        var sHash;
        var oOutbound;
        var sExternalUrl;

        // Reject tile resolution
        function reject (iLogLevel, sMessage) {
            return new jQuery.Deferred()
                .reject({
                    logLevel: iLogLevel,
                    message: sMessage
                })
                .promise();
        }

        var oDeferred = new jQuery.Deferred();

        // Check inputs
        if (!isPlainObject(oSite)) {
            return reject(oLogLevel.ERROR, "Cannot resolve tile: oSite must be an object");
        }
        if (!isPlainObject(oTile)) {
            return reject(oLogLevel.ERROR, "Cannot resolve tile: oTile must be an object");
        }

        // Get visualization and type
        sVisualizationId = oTile.vizId;

        oVisualization = deepClone(oReadVisualization.get(oSite, sVisualizationId || "") || {});

        sVisualizationTypeId = oTile.vizType || oReadVisualization.getTypeId(oVisualization);
        oVisualizationType = oReadVisualization.getType(oSite, sVisualizationTypeId);
        if (!oVisualizationType) {
            return reject(oLogLevel.ERROR, "Cannot resolve tile '" + oTile.id + "': no visualization type found for vizTypeId '" + sVisualizationTypeId + "'");
        }

        // Resolve tile via app id in visualization target
        sAppId = oReadVisualization.getAppId(oVisualization);

        if (sAppId) {
            // Read its target app descriptor and inbound
            oAppDescriptor = oReadVisualization.getAppDescriptor(oSite, sAppId);
            if (!oAppDescriptor) {
                return reject(oLogLevel.INFO, "Tile '" + oTile.id + "' filtered from result: no app descriptor found for appId '" + sAppId + "' (dangling app reference)");
            }

            oInboundResult = oReadHomePageUtils.getInbound(oAppDescriptor, oReadVisualization.getTarget(oVisualization).inboundId);
            if (!oInboundResult) {
                return reject(oLogLevel.ERROR, "Cannot resolve tile '" + oTile.id + "': app '" + sAppId + "' has no navigation inbound");
            }

            // Extract tile information from inbound
            oMapped = oUtilsCdm.mapOne(oInboundResult.key, oInboundResult.inbound, oAppDescriptor, oVisualization, oVisualizationType, oSite);

            var sApplicationType = oMapped.resolutionResult.applicationType;
            var sAdditionalInformation = oMapped.resolutionResult.additionalInformation;
            var oEnableInPlaceForClassicUIsConfig = Config.last("/core/navigation/enableInPlaceForClassicUIs");
            var bIsApplicationTypeConfiguredInPlace = oEnableInPlaceForClassicUIsConfig ? oEnableInPlaceForClassicUIsConfig[sApplicationType] : false;
            sNavigationMode = navigationMode.computeNavigationModeForHomepageTiles(sApplicationType, sAdditionalInformation, bIsApplicationTypeConfiguredInPlace);

            oOutbound = oReadVisualization.getOutbound(oVisualization, oInboundResult.inbound);
            sHash = this._toHashFromOutbound(oOutbound);
        } else {
            // Resolve tile via visualization's configuration
            // Merge groupTile.vizConfig and visualization.vizConfig into visualization for further processing
            oVisualization.vizConfig = deepExtend({}, oVisualization.vizConfig, oTile.vizConfig);

            oMapped = oUtilsCdm.mapOne(undefined, undefined, undefined, oVisualization, oVisualizationType, oSite);

            if (oReadVisualization.startsExternalUrl(oVisualization)) {
                sExternalUrl = oUshellUtils.getMember(oVisualization.vizConfig, "sap|flp.target.url");
            }
        }

        // Navigation mode, show as link
        oApp = oMapped.tileResolutionResult;
        oApp.navigationMode = sNavigationMode;
        oApp.isLink = false;

        // Device check
        if (!this._isFormFactorSupported(oApp)) {
            return reject(oLogLevel.INFO, "Tile '" + oTile.id + "' filtered from result: form factor not supported");
        }

        if (sExternalUrl || sHash) {
            oDeferred.resolve({
                tileResolutionResult: oApp,
                tileIntent: sExternalUrl || sHash
            });
        } else {
            if (oTile.target) {
                var oTarget = deepClone(oTile.target);
                sHash = oUtilsCdm.toHashFromTarget(readUtils.harmonizeTarget(oTarget));
            }
            oDeferred.resolve({
                tileResolutionResult: oApp,
                tileIntent: sHash
            });
        }

        return oDeferred.promise();
    };

    /**
     * Checks wether the given app supports the current form factor
     *
     * @param {object} oAppDescriptor
     *  an app descriptor
     *
     * @returns {boolean}
     *  true, if the form factor is supported, false otherwise
     */
    AdapterBase.prototype._isFormFactorSupported = function (oAppDescriptor) {
        var sCurrentFormFactor = oUshellUtils.getFormFactor();

        return oReadHomePageUtils.supportsFormFactor(oAppDescriptor, sCurrentFormFactor);
    };

    /**
     * Extracts the first inbound from the given app descriptor
     *
     * TODO: CDM2.0: ensure "first inbound" is deterministic (sort inbounds!)
     *
     * @param {object} oAppDescriptor
     *  an app descriptor
     * @param {string} sId
     *  an app descriptor
     *
     * @returns {object} oResult
     *  a wrapper for the first inbound from the app descriptor or undefined if no inbounds
     *  are specified
     * @returns {object} oResult.key
     *  the key of the first inbound
     * @returns {object} oResult.inbound
     *  the first inbound object
     */
    AdapterBase.prototype._getFirstInbound = function (oAppDescriptor) {
        var sFirstInboundKey = Object.keys(oAppDescriptor["sap.app"].crossNavigation.inbounds).shift();
        var oInbound = oAppDescriptor["sap.app"].crossNavigation.inbounds[sFirstInboundKey];

        return {
            key: sFirstInboundKey,
            inbound: oInbound
        };
    };

    /**
     * Resolves the target app for a given group tile by its navigation intent within a given site
     *
     * @param {object} oTile
     *  Group tile
     *
     * @returns {jQuery.Promise}
     *  In case of success, the done handler is called with the respective
     *  tileResolutionResult. In case of failure a respective error message is passed
     *  to the fail handler which will be called in this case.
     */
    AdapterBase.prototype._resolveTileByIntent = function (oTile) {
        var sHash = this._prepareTileHash(oTile);

        return this._getTileFromHash(sHash);
    };

    /**
     * Works similar to jQuery.Deferred.when except for:
     * <ul>
     *    <li> does not stop as soon as the first promise has failed</li>
     *    <li>always resolves, even if some promise(s) failed</li>
     *    <li>does not return the original array with promises in another
     *        state it rather replaces the result array with a new array of
     *        promises.</li>
     * </ul>
     *
     * @param {jQuery.Promise[]} aPromises
     *  Array of promises. The array may be empty.
     * @returns {jQuery.Promise}
     *  A promise which will be resolved in any case, success or failure.
     *
     * @private
     */
    AdapterBase.prototype._allPromisesDone = function (aPromises) {
        var oDeferred = new jQuery.Deferred();

        if (aPromises.length === 0) {
            oDeferred.resolve([]);
        } else {
            // "replace" aPromises with an array of promises which will always resolve.
            var aNoneFailingPromises = aPromises.map(function (oPromise) {
                var oDeferredAlways = new jQuery.Deferred();
                oPromise.always(oDeferredAlways.resolve.bind(oDeferredAlways));
                return oDeferredAlways.promise();
            });
            // This jQuery.Deferred.when call will never fail, as all promises will always be resolved.
            // This is needed because jQuery.when will otherwise abort on the first fail and will
            // not wait for the remaining promises.
            jQuery.when.apply(this, aNoneFailingPromises).done(function () {
                var aArgs = Array.prototype.slice.call(arguments);
                oDeferred.resolve(aArgs);
            });
        }
        return oDeferred.promise();
    };

    /**
     * Logs collected failure messages for resolved tiles in a single log message per log level.
     *
     * @param {object} oFailedResolvedTiles - map of tiles that could not be resolved
     *
     * @private
     */
    AdapterBase.prototype._logTileResolutionFailures = function (oFailedResolvedTiles) {
        var oMessagesByLogLevel = {};

        if (!oFailedResolvedTiles) {
            return;
        }

        Object.keys(oLogLevel).filter(function (sLevelKey) {
            var iLevel = oLogLevel[sLevelKey];
            return iLevel >= oLogLevel.FATAL && iLevel <= oLogLevel.ALL;
        }).forEach(function (sLevelKey) {
            oMessagesByLogLevel[oLogLevel[sLevelKey]] = "";
        });

        Object.keys(oFailedResolvedTiles).forEach(function (sKey) {
            var oFailureInfo = oFailedResolvedTiles[sKey];
            if (oFailureInfo.logLevel) {
                oMessagesByLogLevel[oFailureInfo.logLevel] =
                    oMessagesByLogLevel[oFailureInfo.logLevel].concat(oFailureInfo.message).concat("\n");
            }
        });

        if (oMessagesByLogLevel[oLogLevel.FATAL]) {
            oLogger.fatal(oMessagesByLogLevel[oLogLevel.FATAL]);
        }
        if (oMessagesByLogLevel[oLogLevel.ERROR]) {
            oLogger.error(oMessagesByLogLevel[oLogLevel.ERROR]);
        }
        if (oMessagesByLogLevel[oLogLevel.WARNING]) {
            oLogger.warning(oMessagesByLogLevel[oLogLevel.WARNING]);
        }
        if (oMessagesByLogLevel[oLogLevel.INFO]) {
            oLogger.info(oMessagesByLogLevel[oLogLevel.INFO]);
        }
        if (oMessagesByLogLevel[oLogLevel.DEBUG]) {
            oLogger.debug(oMessagesByLogLevel[oLogLevel.DEBUG]);
        }
        if (oMessagesByLogLevel[oLogLevel.TRACE]) {
            oLogger.trace(oMessagesByLogLevel[oLogLevel.TRACE]);
        }
    };

    /**
     * Checks whether a given title is valid string.
     *
     * @param {string} sTitle
     *  Title
     * @returns {boolean}
     *  Indicates whether a string is valid or not.
     *
     * @private
     */
    AdapterBase.prototype._isValidTitle = function (sTitle) {
        return typeof sTitle === "string" && sTitle;
    };

    /**
     * Tells if the group is preset, meaning that the group was not added by the user but by an admin
     * (assigned group).
     * @param {object} oGroup
     *  Group to be checked
     * @return {boolean}
     *  true if the group is preset (assigned by admin), false if added by the user.
     *
     * @private
     */
    AdapterBase.prototype._isGroupPreset = function (oGroup) {
        return oReadHomePageUtils.isGroupPreset(oGroup);
    };

    /**
     * Tells if the group is locked, meaning that the user is not able to do modifications.
     * @param {object} oGroup
     * Group to be checked
     * @return {boolean}
     *  true if the group is locked.
     *
     * @private
     */
    AdapterBase.prototype._isGroupLocked = function (oGroup) {
        return oReadHomePageUtils.isGroupLocked(oGroup);
    };

    /**
     * Returns the title for a given group
     *
     * @param {object} oGroup
     *  Group object
     * @returns {string}
     *  Title for a given group
     */
    AdapterBase.prototype.getGroupTitle = function (oGroup) {
        return oReadHomePageUtils.getGroupTitle(oGroup);
    };

    /**
     * Returns the ID of a given group
     *
     * @param {object} oGroup
     *  Group object
     * @returns {string}
     *  Group ID
     */
    AdapterBase.prototype.getGroupId = function (oGroup) {
        return oReadHomePageUtils.getGroupId(oGroup);
    };

    /**
     * Checks if a given group is visible
     *
     * @param {object} oGroup
     *  Group object
     * @returns {boolean}
     *  The return value is <code>true</code> if the given group is visible,
     *  and <code>false</code> if it is not visible.
     */
    AdapterBase.prototype.isGroupVisible = function (oGroup) {
        return oReadHomePageUtils.isGroupVisible(oGroup);
    };

    /**
     * Returns the title for a given tile
     *
     * @param {object} oTile
     *  Tile object
     * @returns {string}
     *  The tile's title
     */
    AdapterBase.prototype.getTileTitle = function (oTile) {
        return oReadHomePageUtils.getTileTitle(this._mResolvedTiles, oTile);
    };

    /**
     * Returns the content provider id for a given tile
     *
     * @param oTile
     *  Tile object
     * @returns {string|undefined} The content provider id for a given tile - can be undefined
     */
    AdapterBase.prototype.getTileContentProviderId = function (oTile) {
        return oReadHomePageUtils.getContentProviderId(oTile);
    };

    /**
     * Returns the subtitle for a given tile
     *
     * @param {object} oTile
     *  Tile object
     * @returns {string}
     *  The tile's subtitle
     *
     *  @private
     */
    AdapterBase.prototype.getTileSubtitle = function (oTile) {
        return oReadHomePageUtils.getTileSubtitle(this._mResolvedTiles, oTile);
    };

    /**
     * Returns the icon for a given tile
     *
     * @param {object} oTile
     *  Tile object
     * @returns {string}
     *  The tile's icon string
     *
     *  @private
     */
    AdapterBase.prototype.getTileIcon = function (oTile) {
        return oReadHomePageUtils.getTileIcon(this._mResolvedTiles, oTile);
    };

    /**
     * Returns the description for a given tile
     *
     * @param {object} oTile
     *  Tile object
     * @returns {string}
     *  The tile's description string
     *
     *  @private
     */
    AdapterBase.prototype.getTileInfo = function (oTile) {
        return oReadHomePageUtils.getTileInfo(this._mResolvedTiles, oTile);
    };

    /**
     * Returns the indicator data source uri for a given tile
     * together with the underlying data source, if given.
     *
     * Remark:
     *
     * In case in the site info a relative path has been specified for the
     * indicator data source or its related datasource uri, the path/uri given
     * gets transformed. It then can be applied by the tile implementation
     * on the current html page.
     *
     * The transformation is needed because the relative specifications refer
     * to the component uri, which is taken at runtime from the corresponding segment
     * "sap.platform.runtime".componentProperties.url of the site info.
     *
     * @param {object} oTile
     *  Tile object
     * @returns {object}
     *  The returned object will be empty if no indicatorDataSource exists,
     *  or it will have one of the following structures:
     *  <pre>
     *  {
     *     dataSource : {
     *          // structure as entry in segment sap.app/datasources of site info
     *          "uri" : "/sap/opu/odata/snce/SRV/",
     *          "type" : "OData",
     *          "settings" : {
     *              // ...
     *          }
     *      },
     *      indicatorDataSource : {
     *          // relative path:
     *          "path" : "Foo$filter=startswith(lastName, 'A') eq true",
     *          "refresh" : 10
     *      },
     *  }
     *  </pre>
     *  OR
     *  <pre>
     *  {
     *      indicatorDataSource : {
     *          // absolute path:
     *          "path" : "/sap/opu/odata/snce/SRV/Foo$filter=startswith(lastName, 'A') eq true",
     *          "refresh" : 10
     *      },
     *  }
     *  </pre>
     *
     *  Example with a relative data source uri:
     *  <pre>
     *  {
     *     dataSource : {
     *          "uri" : "odata/snce/SRV/",
     *          "type" : "OData",
     *          "settings" : {
     *              // ...
     *          }
     *      },
     *      indicatorDataSource : {
     *          "path" : "Foo$filter=startswith(lastName, 'A') eq true",
     *          "refresh" : 10
     *      },
     *  }
     *  </pre>
     *
     *  @private
     */
    AdapterBase.prototype.getTileIndicatorDataSource = function (oTile) {
        // TODO works in all cases? e.g. for tiles added via addTile?
        var oResolvedTile = this._mResolvedTiles[oTile.id];
        var oResult = {};

        // Reuse explicit information set by the user via bookmark service
        if (oTile.indicatorDataSource) {
            oResult.indicatorDataSource = deepExtend({}, oTile.indicatorDataSource);
            if (oTile.dataSource) {
                oResult.dataSource = deepExtend({}, oTile.dataSource);
            }

            return oResult;
        }

        if (!oResolvedTile) {
            return oResult;
        }

        // Respond with ...
        var oResolutionResult = oResolvedTile.tileResolutionResult;
        if (oResolutionResult.indicatorDataSource) {
            // ... indicator data source
            oResult.indicatorDataSource = deepExtend({}, oResolutionResult.indicatorDataSource);

            // ... and related data source (if given)
            if (oResolutionResult.indicatorDataSource.hasOwnProperty("dataSource")) {
                var sDataSourceName = oResolutionResult.indicatorDataSource.dataSource;
                var oDataSources = oResolutionResult.dataSources;
                if (oDataSources && oDataSources.hasOwnProperty(sDataSourceName)) {
                    oResult.dataSource = deepExtend({}, oDataSources[sDataSourceName]);
                } else {
                    Log.warning("datasource referenced but not found for tile: " + oResolvedTile.tileIntent);
                }
            }

            // Relative URI paths in DataSource and IndicatorDatasource must relate to the component URL, no the HTML page
            // bust as the tile is not aware of the (application's) component URL, the mentioned paths need to be adopted.
            // BCP: 1880246066
            if (oUshellUtils.getMember(oResolutionResult, "runtimeInformation.componentProperties.url")) {
                var sPathIndicatorDataSource = oUshellUtils.getMember(oResult, "indicatorDataSource.path");
                var sUriDataSource = oUshellUtils.getMember(oResult, "dataSource.uri");
                var sUrlComponent = oUshellUtils.getMember(oResolutionResult, "runtimeInformation.componentProperties.url");
                var oTransformed =
                    fnUriTransform(sPathIndicatorDataSource, sUriDataSource, sUrlComponent, this.getWindowLocationHref());

                if (!oTransformed.error) {
                    if (sPathIndicatorDataSource) {
                        oResult.indicatorDataSource.path = oTransformed.uri;
                    }
                    if (sUriDataSource) {
                        oResult.dataSource.uri = oTransformed.uriParent;
                    }
                }
            }
        }

        return oResult;
    };

    /**
     * Gets the href of the current page
     * @returns {string}  href (URL) of the current page
     */
    AdapterBase.prototype.getWindowLocationHref = function () {
        return window.location.href;
    };

    /**
     * Checks if a given group is removable
     *
     * @param {object} oGroup
     *  Group object
     * @returns {boolean}
     *  The return value is <code>true</true> if the given group is
     *  removable, and <code>false</code> if not.
     */
    AdapterBase.prototype.isGroupRemovable = function (oGroup) {
        return !this._isGroupPreset(oGroup);
    };

    /**
     * Checks if a given group is locked
     *
     * @param {object} oGroup
     *  Group object
     * @returns {boolean}
     *  The return value is <code>true</true> if the given group is
     *  locked, and <code>false</code> if not.
     */
    AdapterBase.prototype.isGroupLocked = function (oGroup) {
        return this._isGroupLocked(oGroup);
    };

    /**
     * Returns the tiles for a given group
     *
     * @param {object} oGroup
     *  Group object
     * @returns {array}
     *  The array consists of all group items (tiles and links).
     *  In case the group does not have items, the array will
     *  be empty.
     */
    AdapterBase.prototype.getGroupTiles = function (oGroup) {
        // join both arrays
        return oReadHomePageUtils.getGroupTiles(oGroup)
            .concat(oReadHomePageUtils.getGroupLinks(oGroup));
    };

    /**
     * Returns the type for a given item
     *
     * @param {sap.ui.core.Control} oItem
     *  item object
     * @returns {string}
     *  item type
     */
    AdapterBase.prototype.getTileType = function (oItem) {
        if (oReadHomePageUtils.isLink(this._mResolvedTiles, oItem)) {
            return this.TileType.Link;
        }

        if (oReadHomePageUtils.isCard(this._mResolvedTiles, oItem)) {
            return this.TileType.Card;
        }
        return this.TileType.Tile;
    };

    /**
     * Returns the ID for a given tile
     *
     * @param {object} oTile
     *  Tile object
     * @returns {string}
     *  Tile ID
     */
    AdapterBase.prototype.getTileId = function (oTile) {
        return oReadHomePageUtils.getTileId(oTile);
    };

    /**
     * Returns the size for a given tile
     *
     * @param {object} oTile
     *  Tile object
     * @returns {string}
     *  Tile size, e.g. "1x1" or "1x2"
     */
    AdapterBase.prototype.getTileSize = function (oTile) {
        return oReadHomePageUtils.getTileSize(this._mResolvedTiles, oTile) || "1x1";
    };

    /**
     * Returns the target URL for a given tile
     *
     * @param {object} oTile
     *  Tile object
     * @returns {string}
     *  Tile target.
     *  String could be empty.
     */
    AdapterBase.prototype.getTileTarget = function (oTile) {
        var sTileId = oReadHomePageUtils.getTileId(oTile);
        var oResolvedTile = this._mResolvedTiles[sTileId];

        if (oTile.target && oTile.target.url) {
            // this seems to be a URL bookmark tile
            return oTile.target.url;
        }

        if (oResolvedTile) {
            return oResolvedTile.tileIntent;
        }

        Log.warning(
            "Could not find a target for Tile with id '" + sTileId + "'",
            "sap.ushell.adapters.cdm.LaunchPageAdapter"
        );
        return "";
    };

    /**
     * Checks if a tile intent is supported
     *
     * @param {object} oTile
     *  Tile object
     * @returns {boolean}
     *  The return value is <code>true</true> if the tile intent is
     *  supported, and <code>false</code> if not.
     */
    AdapterBase.prototype.isTileIntentSupported = function (oTile) {
        return (this._mFailedResolvedTiles[oTile.id] === undefined);
    };
    /**
     * Sets the visibility for a given tile
     *
     * @param {object} oTile
     *  Tile object
     * @param {boolean} bNewVisible
     *  New visibility
     */
    AdapterBase.prototype.setTileVisible = function (oTile, bNewVisible) {
        var oResolvedTile = this._mResolvedTiles[oTile.id];

        if (oResolvedTile) {
            if (oResolvedTile.tileComponent) {
                this._notifyTileAboutVisibility(oResolvedTile.tileComponent, bNewVisible, oResolvedTile.visibility);
            }

            // Always cache the visibility for two reasons:
            //  - to only inform the tile if the visibility was UPDATED
            //  - to inform the tile directly after instantiation, in case
            //    this function was called before. This is a contract between
            //    FLP Handler and LaunchPage Service!
            // Note: Actually there is no need to cache the visibility in case the component
            // is present but does not implement the tileSetVisible handler. But for
            // simplicity and consistency it is always cached.
            oResolvedTile.visibility = bNewVisible;
        }
    };

    /**
     * @param {object} oGroupCard
     *  A group card object
     * @returns {object}
     *  The card's manifest
     * @private
     */
    AdapterBase.prototype.getCardManifest = function (oGroupCard) {
        var oResolvedCard = this._mResolvedTiles[oGroupCard.id];
        var oResolutionResult = oResolvedCard.tileResolutionResult;
        return oResolutionResult.tileComponentLoadInfo;
    };

    /**
     * Returns the component container including the respective UI
     * component for group and catalog tiles.
     * Helper function for _getCatalogTileView and _getTileView
     * functions. It bundles the common logic for both functions.
     *
     *
     * @param {object} oTile
     *  Group or catalog tile
     * @param {object} oResolvedTile
     *  Resolved group or catalog tile
     * @param {boolean} bIsCatalogTile
     *  Indicates whether the tile is a catalog tile or not
     *
     * @returns {object}
     *  promise that resolves to Component container including the respective UI component
     *
     * @private
     */
    AdapterBase.prototype._getTileUiComponentContainer = function (oTile, oResolvedTile, bIsCatalogTile) {
        var that = this;
        var oResolutionResult;
        var oComponentLoader;
        var sNavigationMode;
        var oTileComponentInstance;
        var oCompContainer;
        var bIsCustomTile;
        var oDeferred = new jQuery.Deferred();

        sap.ushell.Container.getServiceAsync("Ui5ComponentLoader")
            .then(function (oComponentLoaderService) {
                oComponentLoader = oComponentLoaderService;
                var oTileComponentData = this._createTileComponentData(oTile, bIsCatalogTile, oResolvedTile);
                return oTileComponentData;
            }.bind(this))
            .then(function (oTileComponentData) {
                return this._enhanceTileComponentData(oTile, oTileComponentData);
            }.bind(this))
            .then(function (oTileComponentData) {
                oResolutionResult = oResolvedTile.tileResolutionResult;

                if (oResolvedTile.isLink) {
                    sNavigationMode = oResolutionResult.navigationMode;
                    // Do not instantiate the actual tile but only return a Link control
                    oDeferred.resolve(that._createLinkInstance(oTile, bIsCatalogTile, sNavigationMode, GenericTile, oResources));
                    return;
                }

                var oTileComponentProperties = this._createTileComponentProperties(
                    oTileComponentData,
                    oResolutionResult.tileComponentLoadInfo
                );

                if (!oTileComponentProperties.name) {
                    return Promise.reject("Cannot find name of tile component for tile with id: '" + oTile.id + "'");
                }

                if (oTileComponentProperties.manifest) {
                    oTileComponentData.properties = oTileComponentData.properties || {};
                    oTileComponentData.properties.manifest = oTileComponentProperties.manifest;
                }

                bIsCustomTile = this._isCustomTileComponent(oTileComponentProperties.name);

                var createCompContainer = function (oAppProperties) {
                    var oResolvedTile;
                    oTileComponentInstance = oAppProperties.componentHandle.getInstance();
                    oCompContainer = new ComponentContainer({
                        component: oTileComponentInstance,
                        height: "100%"
                    });
                    if (!bIsCatalogTile) {
                        oResolvedTile = that._mResolvedTiles[oTile.id];
                        oResolvedTile.tileComponent = oTileComponentInstance;
                        if (typeof oResolvedTile.visibility === "boolean") {
                            // visibility was cached (from setTileVisible); notify the tile component
                            that._notifyTileAboutVisibility(oTileComponentInstance, oResolvedTile.visibility);
                        }
                    }
                    return oCompContainer;
                };

                var _tileCreateCompContainer = function () {
                    return oComponentLoader.createComponent({
                        loadCoreExt: bIsCustomTile, // custom tiles may need modules from core-ext-light
                        loadDefaultDependencies: false,
                        componentData: oTileComponentData,
                        url: oTileComponentProperties.url,
                        applicationConfiguration: {},
                        reservedParameters: {},
                        applicationDependencies: oTileComponentProperties,
                        ui5ComponentName: oTileComponentProperties.name
                    },
                        {}, // don't generate an id
                        [], // instantiate directly
                        UI5ComponentType.Visualization
                    ).then(createCompContainer);
                };

                if (bIsCustomTile) {
                    oEventHub.once("CoreResourcesComplementLoaded")
                        .do(function () {
                            _tileCreateCompContainer()
                                .then(function (oCompContainer) {
                                    oDeferred.resolve(oCompContainer);
                                })
                                .fail(function (oError) {
                                    oDeferred.reject(oError);
                                });
                        });
                } else {
                    _tileCreateCompContainer()
                        .then(function (oCompContainer) {
                            oDeferred.resolve(oCompContainer);
                        })
                        .fail(function (oError) {
                            oDeferred.reject(oError);
                        });
                }
            }.bind(this))
            .catch(function (oError) {
                oDeferred.reject(oError);
            });

        return oDeferred.promise();
    };

    AdapterBase.prototype._createTileComponentProperties = function (oTileComponentData, oTileComponentLoadInfo) {
        var oTileComponentProperties = {};

        // oTileComponentLoadInfo might be undefined in cases of an incomplete (resolved) inbound
        // e.g. virtualInbound
        if (!oTileComponentLoadInfo || isEmptyObject(oTileComponentLoadInfo)) {
            // Bookmark tile & external URL tiles
            if (oTileComponentData.properties.indicatorDataSource &&
                oTileComponentData.properties.indicatorDataSource.path) {
                oTileComponentProperties.name = DYNAMIC_TILE_COMPONENT_NAME;
            } else {
                oTileComponentProperties.name = STATIC_TILE_COMPONENT_NAME;
            }
        } else {
            // Do not use tileComponentLoadInfo["sap.platform.runtime"].componentProperties
            // as with "includeManifest" tileComponentLoadInfo.componentProperties contains
            // the entire manifest already
            oTileComponentProperties = oTileComponentLoadInfo.componentProperties || {};
            oTileComponentProperties.name = oTileComponentLoadInfo.componentName;
        }

        return oTileComponentProperties;
    };

    /**
     * Returns the UI for a given group tile
     *
     * @param {object} oGroupTile
     *  Group tile
     * @returns {jQuery.Promise}
     *  In case of success, the done handler is called with the respective
     *  tile UI. In case of failure a respective error message is passed
     *  to the fail handler which will be called in this case.
     */
    AdapterBase.prototype.getTileView = function (oGroupTile) {
        var that = this;
        return new jQuery.Deferred(function (oDeferred) {
            return that._getTileView(oGroupTile, false).then(function (oTileUI) {
                oDeferred.resolve(oTileUI);
            }, function (sReason) {
                var sErrorMessage = "Tile with ID '" + oGroupTile.id + "' could not be initialized" + (sReason ? ":\n" + sReason : ".");

                Log.error(sErrorMessage, null, oGroupTile.tileType);
                oDeferred.reject(sErrorMessage);
            });
        }).promise();
    };

    /**
     * Returns the UI for a given tile.
     *
     * @param {object} oGroupTile
     *  Group tile
     *
     * @returns {jQuery.Deferred}
     *  On success, returns a promise that resolves to tile UI or null
     *  (when component name is unknown or the tile component could not be
     *  instantiated).
     *
     *  Or rejects when tile data cannot be accessed successfully.
     *
     * @private
     */
    AdapterBase.prototype._getTileView = function (oGroupTile) {
        var sErrorMessage;
        var oDeferred = new jQuery.Deferred();

        if (typeof oGroupTile !== "object" || !oGroupTile.id) {
            sErrorMessage = "Invalid input parameter passed to _getTileView: " + oGroupTile;
            Log.error(sErrorMessage);
            return oDeferred.reject(sErrorMessage).promise();
        }

        var oResolvedTile = this._mResolvedTiles[oGroupTile.id];
        if (!oResolvedTile) {
            sErrorMessage = "No resolved tile found for tile ID: " + oGroupTile.id;
            Log.error(sErrorMessage);
            return oDeferred.reject(sErrorMessage).promise();
        }

        return this._getTileUiComponentContainer(oGroupTile, oResolvedTile, false);
    };

    /**
     * Creates the component data needed to instantiate tiles
     *
     * @param {object} oTile
     * tile used to create component data
     * @param {boolean} bIsCatalogTile
     * True, if given tile is a catalog tile.
     * @param {object} oResolutionResult
     * result of the resolution
     * @returns {object}
     * data of tile component
     */
    AdapterBase.prototype._createTileComponentData = function (oTile, bIsCatalogTile, oResolutionResult) {
        var sTitle = bIsCatalogTile ? this.getCatalogTileTitle(oTile) : this.getTileTitle(oTile);
        var sSubTitle = bIsCatalogTile ? this.getCatalogTilePreviewSubtitle(oTile) : this.getTileSubtitle(oTile);
        var sIcon = bIsCatalogTile ? this.getCatalogTilePreviewIcon(oTile) : this.getTileIcon(oTile);
        var sInfo = bIsCatalogTile ? this.getCatalogTilePreviewInfo(oTile) : this.getTileInfo(oTile);
        var sTarget = bIsCatalogTile ? this.getCatalogTileTargetURL(oTile) : this.getTileTarget(oTile);
        var oIndicatorDataSource = this.getTileIndicatorDataSource(oTile);
        var sNumberUnit = oTile.numberUnit || (oResolutionResult.tileResolutionResult && oResolutionResult.tileResolutionResult.numberUnit);
        var oComponentData = {
            properties: {},
            startupParameters: {}
        };

        // Check whether tile is a custom tile
        if (oResolutionResult.tileResolutionResult
            && oResolutionResult.tileResolutionResult.isCustomTile === true
            && oResolutionResult.tileResolutionResult.startupParameters) {
            // Pass startup parameters to tile component data
            oComponentData.startupParameters = oResolutionResult.tileResolutionResult.startupParameters;
        }

        if (sTitle) {
            oComponentData.properties.title = sTitle;
        }
        if (sInfo) {
            oComponentData.properties.info = sInfo;
        }
        if (sSubTitle) {
            oComponentData.properties.subtitle = sSubTitle;
        }
        if (sIcon) {
            oComponentData.properties.icon = sIcon;
        }
        if (sTarget) {
            oComponentData.properties.targetURL = sTarget;
        }
        if (sNumberUnit) {
            oComponentData.properties.numberUnit = sNumberUnit;
        }
        if (oIndicatorDataSource.indicatorDataSource) {
            oComponentData.properties.indicatorDataSource =
                oIndicatorDataSource.indicatorDataSource;

            // data source is only relevant if the indicatorDataSource is present as well
            if (oIndicatorDataSource.dataSource) {
                oComponentData.properties.dataSource =
                    oIndicatorDataSource.dataSource;
            }
        }
        if (oResolutionResult.tileResolutionResult) {
            oComponentData.properties.navigationMode = oResolutionResult.tileResolutionResult.navigationMode;
            oComponentData.properties.contentProviderId = oResolutionResult.tileResolutionResult.contentProviderId || "";
        }

        return oComponentData;
    };

    /**
     * Enhances the component data with the content provider path prefix if a content provider is available
     *
     * @param {object} oTile
     * tile used to create component data
     * @param {object} oComponentData the component data
     *
     * @returns {Promise<object>} data of tile component
     * @private
     * @since 1.91
     */
    AdapterBase.prototype._enhanceTileComponentData = function (oTile, oComponentData) {
        var oPrefixDataSourcePromise = Promise.resolve();
        var sContentProviderId = this.getTileContentProviderId(oTile);

        if (sContentProviderId) {
            oPrefixDataSourcePromise = sap.ushell.Container.getServiceAsync("ClientSideTargetResolution")
                .then(function (oCSTRService) {
                    return oCSTRService.getSystemContext(sContentProviderId);
                })
                .then(function (oSystemContext) {
                    oComponentData.properties.indicatorDataSource.path = oSystemContext.getFullyQualifiedXhrUrl(oComponentData.properties.indicatorDataSource.path);
                })
                .catch(function () {
                    Log.error("System Context not available");
                });
        }

        return oPrefixDataSourcePromise.then(function () {
            return oComponentData;
        });
    };

    AdapterBase.prototype._isGroupTile = function (oTile) {
        return oReadHomePageUtils.isGroupTile(oTile);
    };

    AdapterBase.prototype._isCatalogTile = function (oTile) {
        return !!(oTile && oTile.isCatalogTile);
    };

    AdapterBase.prototype._isFailedGroupTile = function (oTile) {
        return !!(oTile && this._mFailedResolvedTiles &&
            this._mFailedResolvedTiles[oReadHomePageUtils.getTileId(oTile)]);
    };

    /**
     * Returns the catalog tile id for a given group tile or catalog tile
     *
     * @param {object} oGroupTileOrCatalogTile
     *  Group tile or catalog tile
     *
     * @returns {string}
     *  ID of respective group tile or catalog tile.
     *  In case the id could not be determined for group tiles,
     *  <code>undefined</code> is returned.
     */
    AdapterBase.prototype.getCatalogTileId = function (oGroupTileOrCatalogTile) {
        if (this._isGroupTile(oGroupTileOrCatalogTile)) {
            if (this._isFailedGroupTile(oGroupTileOrCatalogTile)) {
                return undefined;
            }

            // for bookmarks group tiles the target url corresponds to the id of the catalog tile
            if (oGroupTileOrCatalogTile.isBookmark
                && ObjectPath.get("target.url", oGroupTileOrCatalogTile)) {
                return oGroupTileOrCatalogTile.target.url;
            }

            // the vizId of the group tile is the id of the catalog tile
            return oGroupTileOrCatalogTile.vizId ||
                (oGroupTileOrCatalogTile.target && oGroupTileOrCatalogTile.target.url);
        }

        if (this._isCatalogTile(oGroupTileOrCatalogTile)) {
            return oGroupTileOrCatalogTile.id;
        }
        return undefined;
    };

    /**
     * Returns the preview title for a given catalog tile
     *
     * @param {object} oGroupTileOrCatalogTile
     *  Group tile or catalog tile
     * @returns {string}
     *  Preview title of given catalog tile
     * @throws an exception when the tile is not valid
     */
    AdapterBase.prototype.getCatalogTilePreviewTitle = function (oGroupTileOrCatalogTile) {
        if (this._isGroupTile(oGroupTileOrCatalogTile)) {
            return this.getTileTitle(oGroupTileOrCatalogTile);
        }
        return (oGroupTileOrCatalogTile.tileResolutionResult &&
            oGroupTileOrCatalogTile.tileResolutionResult.title) || "";
    };

    /**
     * Returns the catalog tile target url for a given tile (group or catalog tile)
     *
     * @param {object} oGroupTileOrCatalogTile
     *  Group tile or catalog tile
     * @returns {string}
     *  Target URL of respective catalog tile
     * @throws an exception when the tile is not valid
     */
    AdapterBase.prototype.getCatalogTileTargetURL = function (oGroupTileOrCatalogTile) {
        if (!oGroupTileOrCatalogTile) {
            // all getCatalogTile[Preview] methods should behave equally, so fail early
            throw new Error("The given tile is falsy");
        }

        if (this._isCatalogTile(oGroupTileOrCatalogTile)) {
            if (oGroupTileOrCatalogTile.tileResolutionResult
                && oGroupTileOrCatalogTile.tileResolutionResult.isCustomTile) {
                if (!oGroupTileOrCatalogTile.tileResolutionResult.targetOutbound) {
                    return "";
                }
                // The target of a custom tile is the Outbound, which is the app started on click of the tile
                return this._toHashFromOutbound(oGroupTileOrCatalogTile.tileResolutionResult.targetOutbound);
            }
            // the target of a non-custom tile is the inbound, the tile has no own app descriptor
            return oGroupTileOrCatalogTile.tileIntent || "";
        }
        return this.getTileTarget(oGroupTileOrCatalogTile);
    };

    /**
     * Checks if a group was marked as featured (meaning the group is a Fiori 3 featured group).
     *
     * Returns <code>true</code> if the group is featured
     * and <code>false</code> if not.
     *
     * @param {object} oGroup
     *     The group to be checked
     *
     * @returns {boolean}
     *  <code>true</code> if featured; <code>false</code> if not (or as default in case the function was not implemented in the proper adapter).
     *
     * @public
     * @alias sap.ushell.services.LaunchPage#isGroupFeatured
     */
    AdapterBase.prototype.isGroupFeatured = function (oGroup) {
        return !!oGroup.isFeatured;
    };

    // TODO check if this is really needed:
    AdapterBase.prototype._getMember = function (oObject, sAccessPath) {
        return oUshellUtils.getMember(oObject, sAccessPath);
    };

    /**
     * Returns the maximum CDM version supported by this launch page adapter
     * @returns {object}
     *  Version of this adapter
     */
    AdapterBase.prototype.getCdmVersionsSupported = function () {
        return {
            min: new Version("3.0.0"),
            max: new Version("3.1.0")
        };
    };

    /**
     * Tells if version of site is supported by this launch page adapter
     * CDM version must be 3.0.0 .
     *
     * Writes a fatal log entry if the given site is not supported.
     *
     * @param {object} oSite Site as json object
     * @returns {boolean}
     *  Indicates if the version of the given site is supported
     */
    AdapterBase.prototype.isSiteSupported = function (oSite) {
        // Check if site has the expected CDM version
        if (!oSite._version ||
            new Version(oSite._version).compareTo(this.getCdmVersionsSupported().min) < 0 ||
            new Version(oSite._version).compareTo(this.getCdmVersionsSupported().max) > 0) {
            Log.fatal("Invalid CDM site version: Only version 3.0.0 is supported");
            return false;
        }
        return true;
    };

    /**
     * Returns whether the passed tile component is a standard tile or a custom tile
     *
     * @param {string} sComponentName The name of the tile component
     * @returns {boolean} Returns true for a custom tile and false for a standard tile
     * @private
     */
    AdapterBase.prototype._isCustomTileComponent = function (sComponentName) {
        return !(sComponentName === STATIC_TILE_COMPONENT_NAME || sComponentName === DYNAMIC_TILE_COMPONENT_NAME);
    };

    return AdapterBase;
});
