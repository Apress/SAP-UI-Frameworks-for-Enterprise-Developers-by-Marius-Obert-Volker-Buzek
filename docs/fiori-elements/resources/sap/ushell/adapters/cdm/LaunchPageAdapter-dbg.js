// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's LaunchPageAdapter for the
 *               'CDM' platform - Version 2 (V2)
 * @deprecated since 1.100
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/adapters/cdm/_LaunchPage/readHome",
    "sap/ushell/adapters/cdm/_LaunchPage/modifyHome", // TODO: should be lazy loaded (e.g. in moveTile)
    "sap/ushell/adapters/cdm/_LaunchPage/readCatalogs", // TODO: should be lazy loaded
    "sap/m/GenericTile",
    "sap/m/library",
    "sap/ui/core/ComponentContainer",
    "sap/ushell/adapters/cdm/_LaunchPage/uri.transform",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/navigationMode",
    "sap/ushell/resources",
    "sap/ushell/utils",
    "sap/ushell/utils/utilsCdm",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/components/tiles/utils",
    "sap/base/util/Version",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/deepExtend",
    "sap/base/util/isPlainObject",
    "sap/base/util/isEmptyObject",
    "sap/base/util/ObjectPath",
    "sap/base/Log",
    "sap/ushell/UI5ComponentType"
], function (
    oReadHomePageUtils,
    oModifyHomePageUtils, // TODO should be loaded lazy only when really needed
    oReadCatalogUtils,
    GenericTile,
    oMobileLibrary,
    ComponentContainer,
    fnUriTransform,
    Config,
    oEventHub,
    navigationMode,
    oResources,
    oUshellUtils,
    oUtilsCdm,
    WindowUtils,
    urlParsing,
    utils,
    Version,
    JSONModel,
    jQuery,
    deepExtend,
    isPlainObject,
    isEmptyObject,
    ObjectPath,
    Log,
    UI5ComponentType
) {
    "use strict";

    // shortcut for sap.m.GenericTileMode
    var oGenericTileMode = oMobileLibrary.GenericTileMode;

    /* global hasher */

    var oLogger = Log.getLogger("sap/ushell/adapters/cdm/LaunchPageAdapter"),
        oLogLevel = Log.Level;

    /**
     * This method MUST be called by the Unified Shell's container only.
     * Constructs a new instance of the LaunchPageAdapter for the 'CDM' platform.
     *
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
     * @since 1.15.0
     * @deprecated since 1.100
     */
    function LaunchPageAdapter (oUnused, sParameter, oAdapterConfiguration) {
        var _oDefaultGroup,
            sStaticTileComponent = "sap.ushell.components.tiles.cdm.applauncher",
            sDynamicTileComponent = "sap.ushell.components.tiles.cdm.applauncherdynamic";

        this._mResolvedTiles = {};
        this._mCatalogTilePromises = {};
        this._mFailedResolvedCatalogTiles = {};
        this._mFailedResolvedTiles = {};

        Promise.all([
            sap.ushell.Container.getServiceAsync("URLParsing"),
            sap.ushell.Container.getServiceAsync("CommonDataModel")
        ]).then(function (aServices) {
            this.oURLParsingService = aServices[0]; // It is not used internally. Keep it for back compatibility.
            this.oCDMService = aServices[1];
        }.bind(this));

        //TODO: Rectify Log.error calls and pass correct parameters
        // https://ui5.sap.com/#/api/module:sap/base/Log%23methods/sap/base/Log.error

        /**
         * Returns the maximum CDM version supported by this launch page adapter
         * @returns {sap.base.util.Version}
         *  Version of this adapter
         */
        this.getCdmVersionsSupported = function () {
            return {
                min: Version("0"),
                max: Version("2.0.0")
            };
        };

        /**
         * Tells if version of site is supported by this launch page adapter:
         * CDM version must not be higher than 2.0.0 .
         * For an empty CDM version 2.0.0 is assumed.
         *
         * Writes a fatal log entry if the given site is not supported.
         *
         * @param {object} oSite Site as json object
         * @returns {boolean}
         *  Indicates if the version of the given site is supported
         */
        this.isSiteSupported = function (oSite) {
            // Check if site has the expected CDM version
            if (!!oSite._version
                && Version(oSite._version).compareTo(this.getCdmVersionsSupported().max) > 0) {
                Log.fatal("Invalid CDM site version: Only sites up to version 2.0.0 are supported");
                return false;
            }
            return true;
        };

        this.TileType = {
            Tile: "tile",
            Link: "link"
        };

        /**
         * Returns the groups of the user. These group objects can be passed in to all
         * functions expecting a group.
         *
         * The first group in this list is considered the default group.
         *
         * @returns {jQuery.Promise}
         *  A promise which will be always resolved. In case of success the array consists
         *  of group objects, in case the groups could not be loaded the array is empty.
         */
        this.getGroups = function () {
            var oDeferred = new jQuery.Deferred();

            this._assureLoaded()
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
         * Returns the tile resolution result in the context of a given site.
         *
         * @param {function} fnResolver
         *  The resolve function. Must take <code>sIntent</code> and return a
         *  promise that resolves with the corresponding tile resolution
         *  result.
         *
         * @param {object} oCatalogTilePromiseCache
         *  A cache of promises that may include the tile resolution result
         *  already.
         *
         * @param {string} sIntent
         *   The intent to be resolved (including '#').
         *
         * @returns {jQuery.Promise}
         *   A promise which will be resolved with an object representing the
         *   tile resolution result, and rejected when the tile resolution
         *   failed.
         *
         * @private
         */
        this._getTileFromHashInContextOfSite = function (fnResolver, oCatalogTilePromiseCache, sIntent) {
            var oDeferred = new jQuery.Deferred(),
                oCatalogTilePromise = oCatalogTilePromiseCache[sIntent];

            if (!oCatalogTilePromise) {
                // only call resolve if it was not resolved before
                oCatalogTilePromise = fnResolver(sIntent);

                // store promise for the next call
                oCatalogTilePromiseCache[sIntent] = oCatalogTilePromise;
            }

            oCatalogTilePromise.done(function (oTileIntentResolutionResult) {
                var oTileResolutionResult = {
                    tileIntent: sIntent,
                    tileResolutionResult: oTileIntentResolutionResult
                };

                oDeferred.resolve(oTileResolutionResult);
            }).fail(function (sErrorMsg) {
                oDeferred.reject("Hash '" + sIntent + "' could not be resolved to a tile. " + sErrorMsg);
            });

            return oDeferred.promise();
        };

        /**
         * Construct an appropriate tile by resolving a given intent.
         *
         * @param {string} sIntent
         *  Intent to be resolved including leading "#"
         *
         * @returns {jQuery.Promise}
         *  A promise which will be resolved with an object representing the
         *  tile resolution result, and rejected when the tile resolution
         *  failed.
         *
         * @private
         */
        this._getTileFromHash = function (sIntent) {
            var oDeferred = new jQuery.Deferred();

            sap.ushell.Container.getServiceAsync("ClientSideTargetResolution").then(function (oCstrService) {
                var fnResolveTile = oCstrService.resolveTileIntent.bind(oCstrService);
                this._getTileFromHashInContextOfSite(fnResolveTile, this._mCatalogTilePromises, sIntent)
                    .done(oDeferred.resolve)
                    .fail(oDeferred.reject);
            }.bind(this));

            return oDeferred.promise();
        };

        /**
         * Construct an appropriate tile from an URL.
         * @param {object} oTile
         *  tile with indicatorDataSource
         * @returns {object}
         *  The tile resolution result
         *
         * @private
         */
        this._getTileForUrl = function (oTile) {
            var sTileComponentLoadInfo = oTile.indicatorDataSource ? "#Shell-dynamicTile" : "#Shell-staticTile";
            return {
                tileIntent: "#", //TODO this is not a good intent for arbitrary URL tiles, is it?
                tileResolutionResult: {
                    tileComponentLoadInfo: sTileComponentLoadInfo,
                    isCustomTile: false
                }
            };
        };

        /**
         * Resolves items (tiles and links) for a given group.
         *
         * @param {object} oGroup
         *  Group for which the items should be resolved
         * @param {object} oSite
         *  The corresponding site object
         *
         * @returns {array}
         *  An array of jQuery promises each belonging to a respective item.
         *
         * @private
         */
        this._assureGroupItemsResolved = function (oGroup, oSite) {
            var aPromises = [],
                aResolvedTilesPromises,
                aResolvedLinksPromises;

            // Tiles
            if (oGroup.payload && oGroup.payload.tiles) {
                aResolvedTilesPromises = this._assureGroupTilesResolved(
                    oGroup.payload.tiles, oSite);
                Array.prototype.push.apply(aPromises, aResolvedTilesPromises);
            }

            // Links
            if (oGroup.payload && oGroup.payload.links) {
                aResolvedLinksPromises = this._assureGroupLinksResolved(
                    oGroup.payload.links, oSite);
                Array.prototype.push.apply(aPromises, aResolvedLinksPromises);
            }

            return aPromises;
        };

        /**
         * Resolves the given group tiles.
         *
         * @param {array} aGroupTiles
         *  Array of tiles which should be resolved
         * @param {object} oSite
         *  The corresponding site object
         *
         * @returns {array}
         *  An array of jQuery promises each belonging to a respective tile.
         *
         * @private
         */
        this._assureGroupTilesResolved = function (aGroupTiles, oSite) {
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
         * @param {array} aGroupLinks
         *  Array of links which should be resolved
         * @param {object} oSite
         *  The corresponding site object
         *
         * @returns {array}
         *  An array of jQuery promises each belonging to a respective link.
         *
         * @private
         */
        this._assureGroupLinksResolved = function (aGroupLinks, oSite) {
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
        this._resolveGroupTile = function (oTile, oSite) {
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
            } else if (oTile.isBookmark) {
                // at least for now, we resolve bookmark tiles by intent
                oResultPromise = this._resolveTileByIntent(oTile, oSite);
            } else if (isUrlLauncherTile(oTile)) {
                // TODO: CDM 2.0: remove temporary fallback logic for "Shell-launchURL"
                // tiles (should rather be implemented as above)
                oResultPromise = this._resolveTileByIntent(oTile, oSite);
            } else {
                // in any other case, we resolve by appId
                oResultPromise = this._resolveTileByAppId(oTile, oSite);
            }

            oResultPromise.done(function (oResolvedTile) {
                updateCaches(oResolvedTile);
            }).fail(function (vFailureInfo) {
                mFailureCache[oTile.id] = vFailureInfo;
            });

            return oResultPromise;
        };

        /**
         * Resolves the target app for a given group tile by its appId within a given site
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
        this._resolveTileByAppId = function (oTile, oSite) {
            var sAppId,
                oAppDescriptor,
                oInboundResult,
                oApp,
                sHash;

            function reject (iLogLevel, sMessage) {
                return new jQuery.Deferred()
                    .reject({
                        logLevel: iLogLevel,
                        message: sMessage
                    })
                    .promise();
            }

            if (!isPlainObject(oTile)) {
                return reject(oLogLevel.ERROR, "Cannot resolve tile: oTile must be an object");
            }
            if (!isPlainObject(oSite)) {
                return reject(oLogLevel.ERROR, "Cannot resolve tile: oSite must be an object");
            }

            sAppId = oTile.appId || oTile.appIDHint;
            if (!sAppId) {
                return reject(oLogLevel.ERROR,
                    ["Cannot resolve tile '", oTile.id, "': either appId or appIDHint must be specified"].join(""));
            }

            oAppDescriptor = oSite.applications && oSite.applications[sAppId];
            if (!oAppDescriptor) {
                return reject(oLogLevel.INFO,
                    ["Tile '", oTile.id, "' filtered from result: no app found for appId '",
                        sAppId, "' (dangling app reference)"].join(""));
            }

            // TODO: CDM2.0 - check if custom tile first (should not need an inbound)
            // for referenced apps, this is an error
            oInboundResult = this._getFirstInbound(oAppDescriptor);
            if (!oInboundResult) {
                return reject(oLogLevel.ERROR,
                    ["Cannot resolve tile '", oTile.id, "': app '",
                        sAppId, "' has no navigation inbound"].join(""));
            }

            var oMapped = oUtilsCdm.mapOne(oInboundResult.key, oInboundResult.inbound, oAppDescriptor),
                sApplicationType = oMapped.resolutionResult.applicationType,
                sAdditionalInformation = oMapped.resolutionResult.additionalInformation,
                oEnableInPlaceForClassicUIsConfig = Config.last("/core/navigation/enableInPlaceForClassicUIs"),
                bIsApplicationTypeConfiguredInPlace = oEnableInPlaceForClassicUIsConfig ? oEnableInPlaceForClassicUIsConfig[sApplicationType] : false;

            oApp = oMapped.tileResolutionResult;
            oApp.navigationMode = navigationMode.computeNavigationModeForHomepageTiles(sApplicationType, sAdditionalInformation, bIsApplicationTypeConfiguredInPlace);
            oApp.isLink = false; // TODO remove as it should go one level up

            if (!this._isFormFactorSupported(oApp)) {
                return reject(oLogLevel.INFO,
                    ["Tile '", oTile.id, "' filtered from result: form factor not supported"].join(""));
            }

            sHash = this._toHashFromInbound(oInboundResult.inbound);

            return jQuery.when({
                tileResolutionResult: oApp,
                tileIntent: sHash
            });
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
        this._isFormFactorSupported = function (oAppDescriptor) {
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
         *
         * @returns {object} oResult
         *  a wrapper for the first inbound from the app descriptor or undefined if no inbounds
         *  are specified
         * @returns {object} oResult.key
         *  the key of the first inbound
         * @returns {object} oResult.inbound
         *  the first inbound object
         */
        this._getFirstInbound = function (oAppDescriptor) {
            // TODO: CDM2.0 robust access
            var sFirstInboundKey = Object.keys(oAppDescriptor["sap.app"].crossNavigation.inbounds).shift(),
                oInbound = oAppDescriptor["sap.app"].crossNavigation.inbounds[sFirstInboundKey];

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
         * @param {object} oSite
         *  The corresponding site object
         *
         * @returns {jQuery.Promise}
         *  In case of success, the done handler is called with the respective
         *  tileResolutionResult. In case of failure a respective error message is passed
         *  to the fail handler which will be called in this case.
         */
        this._resolveTileByIntent = function (oTile, oSite) {
            var sHash = this._prepareTileHash(oTile);

            return this._getTileFromHash(sHash);
        };

        /**
         * Constructs the hash for a given tile object.
         * Additional parameters get formatted.
         *
         * @param {object} oTile
         *  Tile object for which the hash should be constructed.
         * @returns {string} constructed hash or <code>undefined</code>
         *   in case something went wrong.
         *
         * @private
         */
        this._prepareTileHash = function (oTile) {
            var oParams = {},
                oTarget,
                aRawParams;

            if (this._isCatalogTile(oTile)) {
                return oTile.tileIntent;
            }

            if (this._isGroupTile(oTile) && oTile.target) {
                // TODO use hash from _mResolvedTiles if tile has been already resolved
                aRawParams = oTile.target.parameters || [];
                aRawParams.forEach(function (oParameter) {
                    if (oParameter.name && oParameter.value) {
                        oParams[oParameter.name] = [oParameter.value];
                    }
                });

                oTarget = {
                    target: {
                        semanticObject: oTile.target.semanticObject,
                        action: oTile.target.action
                    },
                    params: oParams,
                    appSpecificRoute: oTile.target.appSpecificRoute
                };

                return "#" + urlParsing.constructShellHash(oTarget);
            }
            return undefined;
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
         * @param {array} aPromises
         *  Array of promises. The array may be empty.
         * @returns {jQuery.Promise}
         *  A promise which will be resolved in any case, success or failure.
         *
         * @private
         */
        this._allPromisesDone = function (aPromises) {
            var oDeferred = new jQuery.Deferred(),
                oDeferredAlways;

            if (aPromises.length === 0) {
                oDeferred.resolve([]);
            } else {
                // "replace" aPromises with an array of promises which will always resolve.
                var aNoneFailingPromises = aPromises.map(function (oPromise) {
                    oDeferredAlways = new jQuery.Deferred();
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
         * Assures that all items (tiles and links) for all groups returned by the CDM site
         * are resolved. Furthermore the default group gets set. If the default group does
         * not exist yet, one will get generated.
         *
         * @returns {jQuery.Promise}
         *  A promise which will be always resolved. In case all items (tiles and links)
         *  of all groups could be loaded using ClientSideTargetResolution the array
         *  contains the group objects. In case something went wrong
         *  The promise will be rejected when the resolution did not work as expected.
         *
         * @private
         */
        this._assureLoaded = function () {
            var that = this,
                oDeferred;

            // bundle multiple requests running in parallel
            if (this._assureLoadedDeferred) {
                return this._assureLoadedDeferred.promise();
            }

            oDeferred = new jQuery.Deferred();
            this._assureLoadedDeferred = oDeferred;

            sap.ushell.Container.getServiceAsync("CommonDataModel").then(function (oCDMSiteService) {
                oCDMSiteService.getSite()
                    .done(function (oSite) {
                        // Ensure site has expected CDM format
                        if (!that.isSiteSupported(oSite)) {
                            throw new Error("Invalid CDM site version: Check configuration of launchpage adapter and version of FLP site");
                        }

                        var aItemPromises = [];
                        var aGroups = oReadHomePageUtils.getGroupsArrayFromSite(oSite);
                        var oDefaultGroup = oReadHomePageUtils.getDefaultGroup(aGroups);

                        if (!oDefaultGroup) {
                            // the default group is not added by an admin but must be automatically
                            // generated when not present already
                            oDefaultGroup = oModifyHomePageUtils.createDefaultGroup(
                                oUshellUtils.generateUniqueId(oReadHomePageUtils.getGroupIdsFromSite(oSite))
                            );

                            // Note: for not harming the performance during initial start-up of
                            // the FLP, oCdmSiteService.save() is skipped. This means the default
                            // group is added on EVERY start-up until save() is called in a different use case
                            // e.g. a tile was added.
                            oSite = oModifyHomePageUtils.addGroupToSite(oSite, oDefaultGroup, /*index*/ 0);

                            // get groups again as the default group was just added
                            aGroups = oReadHomePageUtils.getGroupsArrayFromSite(oSite);
                        }

                        _oDefaultGroup = oDefaultGroup; // TODO that should be improved

                        aGroups.forEach(function (oGroup) {
                            // resolve the tile intents already now, as methods like getGroupTiles
                            // or getTileTitle are synchronously called
                            aItemPromises = that._assureGroupItemsResolved(oGroup, oSite).concat(aItemPromises); // TODO split method as well
                        });

                        // wait for resolving of all items
                        // Note: _allPromisesDone does never reject. Therefore no fail handler is required.
                        that._allPromisesDone(aItemPromises)
                            .done(function () {
                                that._assureLoadedDeferred.resolve(aGroups);
                                // ensure that following _assureLoaded calls get resolved with a new parameter
                                // (otherwise it will be resolved with the "cached" groups)
                                delete that._assureLoadedDeferred;

                                that._logTileResolutionFailures(that._mFailedResolvedTiles);
                            });
                    })
                    .fail(function (sErrorMessage0) {
                        Log.error("Delivering homepage groups failed - " + sErrorMessage0);
                        that._assureLoadedDeferred.resolve([]);
                        // ensure that following _assureLoaded calls get resolved with a new parameter
                        delete that._assureLoadedDeferred;
                    });
            });

            return oDeferred.promise();
        };

        /**
         * Logs collected failure messages for resolved tiles in a single log message per log level.
         *
         * @param {object} oFailedResolvedTiles - map of tiles that could not be resolved
         *
         * @private
         */
        this._logTileResolutionFailures = function (oFailedResolvedTiles) {
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

            Object.keys(oFailedResolvedTiles).forEach(function (sFailuredKey) {
                var oFailureInfo = oFailedResolvedTiles[sFailuredKey];
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
         * Returns the default group.
         *
         * @returns {jQuery.Promise}
         *  In case of success its <code>done</code> handler is called with the default
         *  group as an argument. In case of failure an error message gets passed to the
         *  fail handler.
         *
         * @public
         */
        this.getDefaultGroup = function () {
            var oDeferred = new jQuery.Deferred(),
                oAssureLoadedDeferred;

            // check whether assureLoaded was already called.
            // The default group is not set before.
            if (!_oDefaultGroup) {
                oAssureLoadedDeferred = this._assureLoaded();
            }

            if (oAssureLoadedDeferred) {
                oAssureLoadedDeferred
                    .done(function () {
                        oDeferred.resolve(_oDefaultGroup);
                    })
                    .fail(function (sMessage) {
                        oDeferred.reject("Failed to access default group. " + sMessage);
                    });
            } else {
                oDeferred.resolve(_oDefaultGroup);
            }

            return oDeferred.promise();
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
        this._isValidTitle = function (sTitle) {
            if (typeof sTitle !== "string" || !sTitle) {
                return false;
            }
            return true;
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
        this._isGroupPreset = function (oGroup) {
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
        this._isGroupLocked = function (oGroup) {
            return oReadHomePageUtils.isGroupLocked(oGroup);
        };

        /**
         * Adds a group to the homepage. Furthermore the personalization will be
         * persisted for the end user.
         *
         * @param {string} sTitle
         *  Group title
         * @returns {jQuery.Promise}
         *  A promise which will be resolved when group has been added successfully.
         *  The group object itself and the group id will be passed to the promise's
         *  done handler. In case of failure, the fail handler will be called with
         *  a respective error message.
         */
        this.addGroup = function (sTitle) {
            var oDeferred = new jQuery.Deferred(),
                oCdmSiteService = this.oCDMService,
                sGeneratedId,
                sGenericErrorMessage,
                that = this;

            if (!this._isValidTitle(sTitle)) {
                return oDeferred.reject("No valid group title").promise();
            }

            sGenericErrorMessage = "Failed to add the group with title '" + sTitle +
                "' to the homepage. ";

            // add group to site
            oCdmSiteService.getSite()
                .done(function (oSite) {
                    sGeneratedId = oUshellUtils.generateUniqueId(oReadHomePageUtils.getGroupIdsFromSite(oSite));

                    // append the group at the end
                    oModifyHomePageUtils.addGroupToSite(oSite, oModifyHomePageUtils.createEmptyGroup(sGeneratedId, sTitle));

                    // store personalization
                    oCdmSiteService.save()
                        .done(function () {
                            delete that._assureLoadedDeferred;
                            oDeferred.resolve(oSite.groups[sGeneratedId], sGeneratedId);
                        })
                        .fail(function (sErrorMsg0) {
                            oDeferred.reject(sErrorMsg0);
                        });
                })
                .fail(function (sErrorMsg) {
                    oDeferred.reject(sGenericErrorMessage + sErrorMsg);
                });

            return oDeferred.promise();
        };

        /**
         * Returns the title for a given group
         *
         * @param {object} oGroup
         *  Group object
         * @returns {string}
         *  Title for a given group
         */
        this.getGroupTitle = function (oGroup) {
            return oReadHomePageUtils.getGroupTitle(oGroup);
        };

        /**
         * Sets a new title for a given group
         *
         * @param {object} oGroup
         *  Group object
         * @param {string} sNewTitle
         *  Title which should be set
         * @returns {jQuery.Promise}
         *  A promise which will be resolved when the group has been set successfully.
         *  In case of failure, the fail handler will be called with the old group title.
         */
        this.setGroupTitle = function (oGroup, sNewTitle) {
            var that = this,
                oDeferred = new jQuery.Deferred(),
                oCdmSiteService = this.oCDMService,
                sOldTitle, // necessary in case the renaming operation fails
                sGenericErrorMessage;

            if (typeof oGroup !== "object" || !oReadHomePageUtils.getGroupId(oGroup)) {
                return oDeferred.reject("Unexpected group value").promise();
            }
            if (!that._isValidTitle(sNewTitle)) {
                return oDeferred.reject("Unexpected oGroup title value").promise();
            }
            sGenericErrorMessage = "Failed to set new title for group with id '" +
                oReadHomePageUtils.getGroupId(oGroup) + "'. ";

            sOldTitle = oReadHomePageUtils.getGroupTitle(oGroup);

            oCdmSiteService.getSite()
                .done(function (oSite) {
                    // adapt title
                    if (oGroup) {
                        oModifyHomePageUtils.setGroupTitle(oGroup, sNewTitle);
                    }
                    // save personalization
                    oCdmSiteService.save()
                        .done(function () {
                            oDeferred.resolve();
                        })
                        .fail(function (sErrorMsg) {
                            Log.error(sErrorMsg);
                            oDeferred.reject(sOldTitle);
                        });
                })
                .fail(function (sError) {
                    oDeferred.reject(sOldTitle, sGenericErrorMessage + sError);
                });

            return oDeferred.promise();
        };

        /**
         * Returns the ID of a given group
         *
         * @param {object} oGroup
         *  Group object
         * @returns {string}
         *  Group ID
         */
        this.getGroupId = function (oGroup) {
            return oReadHomePageUtils.getGroupId(oGroup);
        };

        /**
         * Hides a given set of groups on the homepage.
         * In case an empty array gets passed, all existing groups
         * on the homepage should be set to be visible.
         *
         * @param {object} aHiddenGroupIds
         *  Groups which should be set to be hidden
         * @returns {jQuery.Promise}
         *  Resolves in case the groups are set to be hidden successfully.
         *  In case of failure, the promise rejects with a respective
         *  error message.
         */
        this.hideGroups = function (aHiddenGroupIds) {
            var oDeferred = new jQuery.Deferred(),
                oCdmSiteService = this.oCDMService,
                sGenericErrorMessage;

            if (aHiddenGroupIds && Array.isArray(aHiddenGroupIds)) {
                sGenericErrorMessage = "Failed to hide group. ";
                oCdmSiteService.getSite()
                    .done(function (oSite) {
                        oReadHomePageUtils.getGroupsArrayFromSite(oSite).forEach(function (oGroup) {
                            oModifyHomePageUtils.setGroupVisibility(oGroup,
                                aHiddenGroupIds && // group is not in list of hidden groups -> visibility === true
                                Array.prototype.indexOf.call(aHiddenGroupIds, oReadHomePageUtils.getGroupId(oGroup)) === -1
                            );
                        });

                        // persist personalization
                        oCdmSiteService.save()
                            .done(function () {
                                oDeferred.resolve();
                            })
                            .fail(function (oErrorMsg0) {
                                oDeferred.reject("Hiding of groups did not work as expected - " + oErrorMsg0);
                            });
                    })
                    .fail(function (sError) {
                        oDeferred.reject(sGenericErrorMessage + sError);
                    });
            } else {
                oDeferred.reject("Invalid input parameter aHiddenGroupIds. Please pass a valid input parameter.");
            }

            return oDeferred.promise();
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
        this.isGroupVisible = function (oGroup) {
            return oReadHomePageUtils.isGroupVisible(oGroup);
        };

        /**
         * Moves a given group to a defined position
         *
         * @param {object} oGroup
         *  Group object
         * @param {number} nNewIndex
         *  New index the group will be moved to
         * @returns {jQuery.Deferred}
         *  A promise which will be resolved when the group has been moved successfully.
         *  In case of failure, the fail handler will be called with a respective error message.
         */
        this.moveGroup = function (oGroup, nNewIndex) {
            var oDeferred = new jQuery.Deferred(),
                oCdmSiteService = this.oCDMService,
                aGroupsOrderAfterMove,
                sGenericErrorMessage;

            if (!oGroup || !oReadHomePageUtils.getGroupId(oGroup) || nNewIndex < 0) {
                return oDeferred.reject("Unable to move groups - invalid parameters").promise();
            }

            sGenericErrorMessage = "Failed to move group with id '" + oGroup.identification.id + "'. ";
            // move group inside the site object
            oCdmSiteService.getSite()
                .done(function (oSite) {
                    var aGroupsOrder = oReadHomePageUtils.getGroupIdsFromSite(oSite),
                        sGroupId = oReadHomePageUtils.getGroupId(oGroup);

                    if (!aGroupsOrder) {
                        return oDeferred.reject("groupsOrder not found - abort operation of adding a group.");
                    } else if (aGroupsOrder.indexOf(sGroupId) === nNewIndex) {
                        return oDeferred.resolve();
                    }

                    // move group inside the groupsOrder array
                    aGroupsOrderAfterMove = oUshellUtils.moveElementInsideOfArray(aGroupsOrder, aGroupsOrder.indexOf(sGroupId), nNewIndex);

                    if (!aGroupsOrderAfterMove) {
                        return oDeferred.reject("invalid move group operation - abort.");
                    }

                    oModifyHomePageUtils.setGroupsOrder(oSite, aGroupsOrderAfterMove);

                    // store personalization
                    oCdmSiteService.save()
                        .done(function () {
                            oDeferred.resolve();
                        })
                        .fail(function (sErrorMsg) {
                            oDeferred.reject(sErrorMsg);
                        });
                    return undefined;
                })
                .fail(function (sError) {
                    oDeferred.reject(sGenericErrorMessage + sError);
                });
            return oDeferred.promise();
        };

        /**
         * Removes a given group
         *
         * @param {object} oGroup
         *  Group object
         * @returns {jQuery.Deferred}
         *  A promise which will be resolved when the group has been removed successfully.
         *  In case of failure, the fail handler will be called with a respective error message.
         */
        this.removeGroup = function (oGroup) {
            var oDeferred = new jQuery.Deferred(),
                oCdmSiteService = this.oCDMService,
                sGenericErrorMessage,
                sGroupId;

            if (typeof oGroup !== "object") {
                return oDeferred.reject("invalid group parameter").promise();
            }
            sGroupId = oReadHomePageUtils.getGroupId(oGroup);
            if (!sGroupId) {
                return oDeferred.reject("group without id given").promise();
            }

            sGenericErrorMessage = "Failed to remove group with id '" + sGroupId + "'. ";

            // remove group from site object
            oCdmSiteService.getSite()
                .done(function (oSite) {
                    oModifyHomePageUtils.removeGroupFromSite(oSite, oGroup);

                    oCdmSiteService.save()
                        .done(function () {
                            oDeferred.resolve();
                        })
                        .fail(function (sErrorMsg) {
                            oDeferred.reject(sErrorMsg);
                        });
                })
                .fail(function (sError) {
                    oDeferred.reject(sGenericErrorMessage + sError);
                });

            return oDeferred.promise();
        };

        /**
         * Resets a given group. Only groups for which <code>isGroupRemovable</code> returns
         * false can be reset.
         *
         * @param {object} oGroup
         *  Group object
         * @returns {jQuery.Deferred}
         *  A promise which will be resolved when the group has been reset successfully.
         *  In case of failure, the fail handler will be called with a respective error message
         *  and the set of groups.
         */
        this.resetGroup = function (oGroup) {
            var oDeferred = new jQuery.Deferred(),
                oCdmSiteService = this.oCDMService,
                aSiteGroupsBackup = [],
                that = this,
                sGenericErrorMessage,
                sGroupId;

            if (typeof oGroup === "object" && oReadHomePageUtils.getGroupId(oGroup)) {
                sGroupId = oReadHomePageUtils.getGroupId(oGroup);
                sGenericErrorMessage = "Failed to reset group with id '" + sGroupId + "'. ";

                oCdmSiteService.getSite()
                    .done(function (oSite) {
                        deepExtend(aSiteGroupsBackup, oReadHomePageUtils.getGroupsArrayFromSite(oSite));

                        if (that.isGroupRemovable(oGroup) === false) {
                            oCdmSiteService.getGroupFromOriginalSite(sGroupId)
                                .done(function (oGroupFromOriginalSite) {
                                    // overwrite respective group in site with the one returned by the original site
                                    if (typeof oSite === "object" && oReadHomePageUtils.getGroupFromSite(oSite, sGroupId)) {
                                        oModifyHomePageUtils.overwriteGroup(oSite, oGroupFromOriginalSite, sGroupId);
                                    }

                                    // persist personalization
                                    oCdmSiteService.save()
                                        .done(function () {
                                            oDeferred.resolve(oGroupFromOriginalSite);
                                        })
                                        .fail(function (sErrorMsg1) {
                                            oDeferred.reject("Group could not be reset - " + sErrorMsg1, aSiteGroupsBackup);
                                        });
                                })
                                .fail(function (sErrorMsg) {
                                    oDeferred.reject("Group could not be reset - " + sErrorMsg, aSiteGroupsBackup);
                                });
                        } else {
                            oDeferred.reject("Group could not be reset as it was created by the user", aSiteGroupsBackup);
                        }
                    })
                    .fail(function (sError) {
                        // reject with the original groups cannot be done in this case as
                        // loading of site failed
                        oDeferred.reject(sGenericErrorMessage + sError, []);
                    });
            }
            return oDeferred.promise();
        };

        /**
         * Returns the title for a given tile
         *
         * @param {object} oTile
         *  Tile object
         * @returns {string}
         *  The tile's title
         */
        this.getTileTitle = function (oTile) {
            return oReadHomePageUtils.getTileTitle(this._mResolvedTiles, oTile);
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
        this.getTileSubtitle = function (oTile) {
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
        this.getTileIcon = function (oTile) {
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
        this.getTileInfo = function (oTile) {
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
        this.getTileIndicatorDataSource = function (oTile) {
            // TODO works in all cases? e.g. for tiles added via addTile?
            var oResolvedTile = this._mResolvedTiles[oTile.id],
                oResult = {},
                oResolutionResult;

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
            oResolutionResult = oResolvedTile.tileResolutionResult;
            if (oResolutionResult.indicatorDataSource) {
                // ... indicator data source
                oResult.indicatorDataSource = deepExtend({}, oResolutionResult.indicatorDataSource);

                // ... and related data source (if given)
                if (oResolutionResult.indicatorDataSource.hasOwnProperty("dataSource")) {
                    var sDataSourceName = oResolutionResult.indicatorDataSource.dataSource,
                        oDataSources = oResolutionResult.dataSources;
                    if (oDataSources && oDataSources.hasOwnProperty(sDataSourceName)) {
                        oResult.dataSource = deepExtend({}, oDataSources[sDataSourceName]);
                    } else {
                        Log.warning("datasource referenced but not found for tile: " + oResolvedTile.tileIntent);
                    }
                }

                // Relative URI paths in DataSource and IndicatorDatasource must relate to the component URL, no the HTML page
                // bust as the tile is not aware of the (applicaiton's) component URL, the mentioned paths need to be adopted.
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
        this.getWindowLocationHref = function () {
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
        this.isGroupRemovable = function (oGroup) {
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
        this.isGroupLocked = function (oGroup) {
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
        this.getGroupTiles = function (oGroup) {
            // join both arrays
            return oReadHomePageUtils.getGroupTiles(oGroup)
                .concat(oReadHomePageUtils.getGroupLinks(oGroup));
        };

        /**
         * Returns the links for a given group
         *
         * @param {object} oGroup
         *  Group object
         * @returns {array}
         *  The array consists of all group items (tiles and links).
         *  In case the group does not have items, the array will
         *  be empty.
         */
        this.getLinkTiles = function (oGroup) {
            // Note: This method is actually not used by the FLP Renderer ...
            // getGroupTiles + getTileType is used instead
            return oReadHomePageUtils.getGroupLinks(oGroup);
        };

        /**
         * Returns the type for a given tile
         *
         * @param {object} oTile
         *  Tile object
         * @returns {string}
         *  Tile type
         */
        this.getTileType = function (oTile) {
            if (oReadHomePageUtils.isLink(this._mResolvedTiles, oTile)) {
                return this.TileType.Link;
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
        this.getTileId = function (oTile) {
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
        this.getTileSize = function (oTile) {
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
        this.getTileTarget = function (oTile) {
            var oResolutionResult,
                sTileId = oReadHomePageUtils.getTileId(oTile),
                oResolvedTile = this._mResolvedTiles[sTileId],
                sTargetUrl;

            if (oTile.target && oTile.target.url) {
                // this seems to be a URL bookmark tile
                return oTile.target.url;
            }

            if (oResolvedTile && oResolvedTile.tileResolutionResult) {
                oResolutionResult = oResolvedTile.tileResolutionResult;

                if (oResolutionResult.isCustomTile !== true) {
                    // static or dynamic app launcher
                    return oResolvedTile.tileIntent;
                }

                if (oResolutionResult && typeof oResolutionResult.targetOutbound === "object") {
                    // custom tile with a target outbound
                    sTargetUrl = this._toHashFromOutbound(oResolutionResult.targetOutbound);

                    if (sTargetUrl) {
                        return sTargetUrl;
                    }
                }
            }

            Log.warning(
                "Could not find a target for Tile with id '" + sTileId + "'",
                "sap.ushell.adapters.cdm.LaunchPageAdapter"
            );
            return "";
        };

        /**
         * Checks if a tile personalization is supported
         *
         * @param {object} oTile
         *  Tile to check for personalization support
         * @returns {boolean}
         *  The return value is <code>true</true> if the tile personalization is
         *  supported, and <code>false</code> if not.
         */
        this.isLinkPersonalizationSupported = function (oTile) {
            return true;
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
        this.isTileIntentSupported = function (oTile) {
            return (this._mFailedResolvedTiles[oTile.id] === undefined);
        };

        /**
         * Conditionally informs the tile that it should refresh it's dynamic content.
         * But only if the tile implements the required handler.
         *
         * @param {sap.ui.core.Component} oTileComponent
         *   The component of the tile.
         *
         * @private
         */
        this._notifyTileAboutRefresh = function (oTileComponent) {
            if (typeof oTileComponent.tileRefresh === "function") {
                oTileComponent.tileRefresh();
            }
        };

        /**
         * Refreshes a given tile
         *
         * @param {object} oTile
         *  Tile object
         */
        this.refreshTile = function (oTile) {
            var oResolvedTile = this._mResolvedTiles[oTile.id];

            if (oResolvedTile) {
                if (oResolvedTile.tileComponent) {
                    this._notifyTileAboutRefresh(oResolvedTile.tileComponent);
                }
            }
        };

        /**
         * Conditionally informs the tile about it's visibility. But only if
         * it was updated and the tile implements the handler.
         *
         * @param {sap.ui.core.Component} oTileComponent
         *   The component of the tile.
         * @param {boolean} bNewVisibility
         *   The mandatory new visibility of the tile.
         * @param {boolean} [bOldVisibility]
         *   The old visibility of the tile. May be undefined or null.
         *
         * @private
         */
        this._notifyTileAboutVisibility = function (oTileComponent, bNewVisibility, bOldVisibility) {
            if (typeof oTileComponent.tileSetVisible === "function" && bOldVisibility !== bNewVisibility) {
                oTileComponent.tileSetVisible(bNewVisibility);
            }
        };

        /**
         * Sets the visibility for a given tile
         *
         * @param {object} oTile
         *  Tile object
         * @param {boolean} bNewVisible
         *  New visibility
         */
        this.setTileVisible = function (oTile, bNewVisible) {
            var oResolvedTile = this._mResolvedTiles[oTile.id];

            if (oResolvedTile) {
                if (oResolvedTile.tileComponent) {
                    this._notifyTileAboutVisibility(oResolvedTile.tileComponent,
                        bNewVisible, oResolvedTile.visibility);
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
         * Returns the UI for a given group tile
         *
         * @param {object} oGroupTile
         *  Group tile
         * @returns {jQuery.Promise}
         *  In case of success, the done handler is called with the respective
         *  tile UI. In case of failure a respective error message is passed
         *  to the fail handler which will be called in this case.
         */
        this.getTileView = function (oGroupTile) {
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
         * Returns the component container including the respective UI component for catalog tiles.
         *
         * @param {object} oTile
         *  Catalog tile
         * @param {object} oResolvedTile
         *  Catalog tile
         * @param {boolean} bIsCatalogTile
         *  Indicates whether the tile is a catalog tile or not
         *
         * @returns {object}
         *  Component container including the respective UI component or null
         *  when the component name is not known or there was a problem
         *  instantiating the title component (in this second case an error is
         *  logged).
         *
         * @private
         * @deprecated since 1.99. Please use {@link #_getTileUiComponentContainer} instead.
         */
        this._getTileUiComponentContainerSync = function (oTile, oResolvedTile, bIsCatalogTile) {
            var that = this,
                oResolutionResult,
                oTileComponentData,
                sNavigationMode,
                oTileComponentInstance,
                oConfig = {};

            // should only be called after tile has been resolved
            if (bIsCatalogTile === true) {
                oTileComponentData = that._createTileComponentData(oTile, true, oResolvedTile);
            } else {
                oTileComponentData = that._createTileComponentData(oTile, false, oResolvedTile);
            }

            oResolutionResult = oResolvedTile.tileResolutionResult;

            if (oResolvedTile.isLink) {
                sNavigationMode = oResolutionResult.navigationMode;
                // Do not instantiate the actual tile but only return a Link control
                return that._createLinkInstance(oTile, bIsCatalogTile, sNavigationMode, GenericTile, oResources);
            }

            if (typeof oResolutionResult.tileComponentLoadInfo === "string") {
                // This is a Static or Dynamic App Launcher
                // Consider also the indicatorDataSource from oTile, even if none is set in
                // oResolutionResult. This is done by using oTileComponentData instead of oResolutionResult
                if (oTileComponentData.properties.indicatorDataSource &&
                    oTileComponentData.properties.indicatorDataSource.path) {
                    // Dynamic App launcher
                    oConfig.name = "sap.ushell.components.tiles.cdm.applauncherdynamic";
                } else {
                    // Static App Launcher
                    oConfig.name = "sap.ushell.components.tiles.cdm.applauncher";
                }
            } else if (typeof oResolutionResult.tileComponentLoadInfo === "object" &&
                oResolutionResult.tileComponentLoadInfo !== null) {
                // Custom tile
                // Do not use tileComponentLoadInfo["sap.platform.runtime"].componentProperties
                // as with "includeManifest" tileComponentLoadInfo.componentProperties contains
                // the entire manifest already
                oConfig = oResolutionResult.tileComponentLoadInfo.componentProperties || {};
                oConfig.name = oResolutionResult.tileComponentLoadInfo.componentName;
            }
            // else oConfig.name is undefined and the next if is skipped

            oConfig.componentData = oTileComponentData;

            // FIXME: remove temporary HACK for making SSB tiles running:
            // expose manifest in componentData properties
            if (oConfig.manifest) {
                oConfig.componentData.properties = oConfig.componentData.properties || {};
                oConfig.componentData.properties.manifest = oConfig.manifest;
            }

            if (oConfig.name) {
                oConfig.async = false; // otherwise sap.ui.component will return a Promise in some cases

                var oCompContainer;
                try {
                    oTileComponentInstance = sap.ui.component(oConfig); // LEGACY API (deprecated)
                } catch (oError) {
                    Log.error(
                        oError.message + "\n-- An error occurred while instantiating "
                        + "the tile component for " + oConfig.name,
                        oError.stack ? oError.stack : "",
                        "sap.ushell.adapters.cdm.LaunchPageAdapter"
                    );

                    return null;
                }

                oCompContainer = new ComponentContainer({
                    component: oTileComponentInstance,
                    height: "100%"
                });

                if (!bIsCatalogTile) {
                    that._mResolvedTiles[oTile.id].tileComponent = oTileComponentInstance;
                }

                return oCompContainer;
            }

            return null;
        };

        /**
         * Returns the component container including the respective UI
         * component for group and catalog tiles.
         * Helper function for _getCatalogTileView and _getTileView
         * functions. It bundles the common logic for both functions.
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
        this._getTileUiComponentContainer = function (oTile, oResolvedTile, bIsCatalogTile) {
            var that = this,
                oResolutionResult,
                oTileComponentData,
                sNavigationMode,
                oTileComponentInstance,
                oCompContainer,
                bIsCustomTile,
                oDeferred = new jQuery.Deferred();

            // should only be called after tile has been resolved
            if (bIsCatalogTile === true) {
                oTileComponentData = that._createTileComponentData(oTile, true, oResolvedTile);
            } else {
                oTileComponentData = that._createTileComponentData(oTile, false, oResolvedTile);
            }

            oResolutionResult = oResolvedTile.tileResolutionResult;

            if (oResolvedTile.isLink) {
                sNavigationMode = oResolutionResult.navigationMode;
                // Do not instantiate the actual tile but only return a Link control
                oDeferred.resolve(that._createLinkInstance(oTile, bIsCatalogTile, sNavigationMode, GenericTile, oResources));
                return oDeferred.promise();
            }

            var oTileComponentProperties = this._createTileComponentProperties(
                oTileComponentData,
                oResolutionResult.tileComponentLoadInfo
            );

            if (!oTileComponentProperties.name) {
                return oDeferred
                    .reject("Cannot find name of tile component for tile with id: '" + oTile.id + "'")
                    .promise();
            }

            // FIXME: remove temporary HACK for making SSB tiles running:
            // expose manifest in componentData properties
            if (oTileComponentProperties.manifest) {
                oTileComponentData.properties = oTileComponentData.properties || {};
                oTileComponentData.properties.manifest = oTileComponentProperties.manifest;
            }
            bIsCustomTile = this.isCustomTile(oTileComponentProperties.name);
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
            var _customTileCreateCompContainer = function (oComponentLoader) {
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
                    // TODO: clarify about having stable IDs!
                    [], // instantiate directly,
                    UI5ComponentType.Visualization
                ).then(createCompContainer);
            };

            var _standardTileCreateCompContainer = function () {
                var oComponentProperties = {
                    componentData: oTileComponentData,
                    url: oTileComponentProperties.url,
                    name: oTileComponentProperties.name,
                    async: false
                };
                oTileComponentInstance = sap.ui.component(oComponentProperties);
                var oAppProperties = {
                    componentHandle: {
                        getInstance: function () {
                            return oTileComponentInstance;
                        }
                    }
                };
                return createCompContainer(oAppProperties);
            };

            if (bIsCustomTile) {
                oEventHub.once("CoreResourcesComplementLoaded")
                    .do(function () {
                        sap.ushell.Container.getServiceAsync("Ui5ComponentLoader").then(function (oComponentLoader) {
                            _customTileCreateCompContainer(oComponentLoader)
                                .then(function (oCompContainer) {
                                    oDeferred.resolve(oCompContainer);
                                })
                                .fail(function (oError) {
                                    oDeferred.reject(oError);
                                });
                        });
                    });
            } else {
                var oStandardCompContainer = _standardTileCreateCompContainer();
                oDeferred.resolve(oStandardCompContainer);
            }

            return oDeferred.promise();
        };

        this._createTileComponentProperties = function (oTileComponentData, vTileComponentLoadInfo) {
            var oTileComponentProperties = {};
            if (typeof vTileComponentLoadInfo === "string") {
                // This is a Static or Dynamic App Launcher
                // Consider also the indicatorDataSource from oTile, even if none is set in
                // oResolutionResult. This is done by using oTileComponentData instead of oResolutionResult
                if (oTileComponentData.properties.indicatorDataSource &&
                    oTileComponentData.properties.indicatorDataSource.path) {
                    // Dynamic App launcher
                    oTileComponentProperties.name = sDynamicTileComponent;
                } else {
                    // Static App Launcher
                    oTileComponentProperties.name = sStaticTileComponent;
                }

                return oTileComponentProperties;
            }

            if (typeof vTileComponentLoadInfo === "object" && vTileComponentLoadInfo !== null) {
                // Custom tile
                // Do not use tileComponentLoadInfo["sap.platform.runtime"].componentProperties
                // as with "includeManifest" tileComponentLoadInfo.componentProperties contains
                // the entire manifest already
                oTileComponentProperties = vTileComponentLoadInfo.componentProperties || {};
                oTileComponentProperties.name = vTileComponentLoadInfo.componentName;
            }

            return oTileComponentProperties;
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
        this._getTileView = function (oGroupTile) {
            var oResolvedTile,
                sErrorMessage,
                oDeferred = new jQuery.Deferred();

            if (typeof oGroupTile !== "object" || !oGroupTile.id) {
                sErrorMessage = "Invalid input parameter passed to _getTileView: " + oGroupTile;
                Log.error(sErrorMessage);
                return oDeferred.reject(sErrorMessage).promise();
            }

            oResolvedTile = this._mResolvedTiles[oGroupTile.id];
            if (oResolvedTile) {
                return this._getTileUiComponentContainer(oGroupTile, oResolvedTile, false);
            }

            sErrorMessage = "No resolved tile found for tile ID: " + oGroupTile.id;
            Log.error(sErrorMessage);
            return oDeferred.reject(sErrorMessage).promise();
        };

        /**
         * Returns the UI for a given catalog tile.
         *
         * @param {object} oCatalogTile
         *  Catalog tile
         *
         * @returns {object}
         * return catalog tile view of given catalog tile
         *
         * @private
         * @deprecated since 1.99. Please use {@link #_getCatalogTileViewControl} instead.
         */
        this._getCatalogTileView = function (oCatalogTile) {
            if (typeof oCatalogTile !== "object") {
                throw new Error(oCatalogTile);
            }

            // As catalog tiles are already passed as resolved catalog tiles,
            // we do not distinguish between the unresolved and resolved variant
            // as part of the following call.
            return this._getTileUiComponentContainerSync(oCatalogTile, oCatalogTile, true);
        };
        /**
         * Returns the UI for a given catalog tile.
         *
         * @param {object} oCatalogTile
         *  Catalog tile
         *
         * @returns {object}
         * return promise of Catalog tile view of given catalog tile
         *
         * @private
         */
        this._getCatalogTileViewControl = function (oCatalogTile) {
            var oDeferred = new jQuery.Deferred();

            if (typeof oCatalogTile !== "object") {
                var sErrorMessage = "Invalid input parameter passed to _getCatalogTileView: " + oCatalogTile;
                Log.error(sErrorMessage);
                return oDeferred.reject(sErrorMessage).promise();
            }
            // As catalog tiles are already passed as resolved catalog tiles,
            // we do not distinguish between the unresolved and resolved variant
            // as part of the following call.
            return this._getTileUiComponentContainer(oCatalogTile, oCatalogTile, true);
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
         * returns data of tile component
         */
        this._createTileComponentData = function (oTile, bIsCatalogTile, oResolutionResult) {
            var sTitle = bIsCatalogTile ? this.getCatalogTileTitle(oTile) : this.getTileTitle(oTile),
                sSubTitle = bIsCatalogTile ? this.getCatalogTilePreviewSubtitle(oTile) : this.getTileSubtitle(oTile),
                sIcon = bIsCatalogTile ? this.getCatalogTilePreviewIcon(oTile) : this.getTileIcon(oTile),
                sInfo = bIsCatalogTile ? this.getCatalogTilePreviewInfo(oTile) : this.getTileInfo(oTile),
                sTarget = bIsCatalogTile ? this.getCatalogTileTargetURL(oTile) : this.getTileTarget(oTile),
                oIndicatorDataSource = this.getTileIndicatorDataSource(oTile),
                oComponentData = {
                    properties: {},
                    startupParameters: {}
                };

            // Check whether tile is a custom tile
            if (oResolutionResult.tileResolutionResult.isCustomTile === true
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
            }

            return oComponentData;
        };

        /**
         * Creates a link instance for the given tile
         *
         * @param {object} oTile
         *  The title serves as text for the link
         * @param {boolean} bIsCatalogTile
         *  Indicates whether the tile is a catalog tile or not
         * @param {string} sNavigationMode
         *  Navigation mode
         * @param {function} fnGenericTile
         *  Constructor for generic tile
         * @param {object} oResources
         *  Text resources
         * @returns {object}
         *  Link object
         *
         * @private
         */
        this._createLinkInstance = function (oTile, bIsCatalogTile, sNavigationMode, fnGenericTile, oResources) {
            var sTileTitle,
                linkTileControl,
                sTranslatedNavMode,
                sTileSubTitle = this.getTileSubtitle(oTile);

            var GenericTile = fnGenericTile;

            // should only be called after tile has been resolved
            if (bIsCatalogTile === true) {
                sTileTitle = this.getCatalogTileTitle(oTile);
            } else {
                sTileTitle = this.getTileTitle(oTile);
            }

            // By using the LineMode, the GenericTile is displayed as a Link
            linkTileControl = new GenericTile({
                mode: oGenericTileMode.LineMode,
                subheader: sTileSubTitle,
                header: sTileTitle,
                url: WindowUtils.getLeanURL(this.getTileTarget(oTile)),
                //TODO: The below code is for POC only, should be removed once UI5 provide action buttons for line mode
                press: function (oEvent) {
                    this._genericTilePressHandler(oTile, oEvent);
                }.bind(this)
            });
            if (sNavigationMode) {
                sTranslatedNavMode = oResources.i18n.getText(sNavigationMode + "NavigationMode");
                //According to ACC-257 aria-label should start with the navigation mode, then the tile content
                linkTileControl.setAriaLabel(sTranslatedNavMode + " " + sTileTitle + " " + sTileSubTitle);
            }
            this._mResolvedTiles[oTile.id].linkTileControl = linkTileControl;
            return linkTileControl;
        };

        this._genericTilePressHandler = function (oTile, oEvent) {
            var sTargetURL;

            if (oEvent.getSource().getScope && oEvent.getSource().getScope() === "Display") {
                sTargetURL = this.getTileTarget(oTile);
                if (sTargetURL) {
                    if (sTargetURL[0] === "#") {
                        hasher.setHash(sTargetURL);
                    } else {
                        WindowUtils.openURL(sTargetURL, "_blank");
                    }
                }
            }
        };

        this._addTileToSite = function (oPersonalizedSite, oGroup, oNewTile, oCdmSiteService) {
            // TODO JSDoc
            // TODO consider to change the interface so it is not needed to pass oNewTile
            //  which should be created inside this method
            var that = this,
                oDeferred = new jQuery.Deferred(),
                oIntent = urlParsing.parseShellHash(oNewTile.properties.targetURL),
                oTileToBeAdded = {
                    id: that.getTileId(oNewTile),
                    target: {
                        semanticObject: oIntent.semanticObject,
                        action: oIntent.action,
                        parameters: createTileParametersFromIntentParams(oIntent.params)
                    }
                };

            oPersonalizedSite.groups[oGroup.identification.id].payload.tiles.push(oTileToBeAdded);

            //store personalization
            oCdmSiteService.save()
                .done(function () {
                    oDeferred.resolve(oTileToBeAdded);
                })
                .fail(function (sMessage) {
                    oDeferred.reject(sMessage);
                });

            return oDeferred.promise();
        };

        /**
         * Adds a tile to the homepage. Furthermore the personalization will be
         * persisted for the end user.
         *
         * @param {object} oCatalogTile
         *  Catalog Tile
         * @param {object} oGroup
         *  Group object
         * @returns {jQuery.Promise}
         *  A promise which will be resolved when the tile has been added successfully.
         *  The new tile itself will be passed to the promise's done handler in case of
         *  success. In case of failure, the fail handler will be called with a respective
         *  error message.
         */
        this.addTile = function (oCatalogTile, oGroup) {
            var oDeferred = new jQuery.Deferred(),
                sGenericErrorMessage,
                oCdmSiteService = this.oCDMService,
                oGroupTile;

            if (!oGroup) {
                oGroup = _oDefaultGroup;
            }

            oGroupTile = composeNewTile();
            oGroupTile.appId = oCatalogTile.tileResolutionResult.appId;
            // add new tile to list of resolved tiles
            this._mResolvedTiles[oGroupTile.id] = {
                tileIntent: oCatalogTile.tileIntent,
                tileResolutionResult: oCatalogTile.tileResolutionResult,
                isLink: false
            };
            oCdmSiteService.getSite()
                .done(function (oSite) {
                    // We should think about the reasons why it's not safe to
                    // do the following, even though it's more succinct:
                    //     oGroup.payload.tiles.push(oTile);
                    oSite.groups[oGroup.identification.id].payload.tiles.push(oGroupTile);
                    oCdmSiteService.save()
                        .done(function () {
                            oDeferred.resolve(oGroupTile);
                        })
                        .fail(function (sReason) {
                            oDeferred.reject(sReason);
                        });
                })
                .fail(function (sError) {
                    sGenericErrorMessage = "Failed to add tile with id '" + oGroupTile.id +
                        "' to group with id '" + oGroup.identification.id + "'. ";
                    oDeferred.reject(sGenericErrorMessage + sError);
                });

            return oDeferred.promise();
        };

        /**
         * Removes a tile from a given group on the homepage. Furthermore the personalization will be
         * persisted for the end user.
         *
         * @param {object} oGroup
         *  Group object
         * @param {object} oTile
         *  Tile object
         * @param {number} iIndex
         *  Index of the given tile in the respective group
         * @returns {jQuery.Promise}
         *  A promise which will be resolved when the tile has been removed successfully.
         *  In case of failure, the fail handler will be called with a collection of existing groups.
         */
        this.removeTile = function (oGroup, oTile, iIndex) {
            var oCdmSiteService = this.oCDMService,
                sGenericErrorMessage,
                oDeferred = new jQuery.Deferred(),
                that = this;

            if (!oGroup || typeof oGroup !== "object" || !oGroup.identification || !oGroup.identification.id ||
                !oTile || typeof oTile !== "object" || !oTile.id) {
                return oDeferred.reject({}, "Failed to remove tile. No valid input parameters passed to removeTile method.").promise();
            }

            sGenericErrorMessage = "Failed to remove tile with id '" + oTile.id + "' from group with id '" + oGroup.identification.id + "'. ";

            oCdmSiteService.getSite()
                .done(function (oSite) {
                    var oPayload,
                        sPayloadType;

                    // Succinctly convert iIndex to number
                    iIndex = +iIndex;

                    try {
                        oPayload = oSite.groups[oGroup.identification.id].payload;
                    } catch (e) {
                        oDeferred.reject(oSite.groups[oGroup.identification.id], sGenericErrorMessage);
                    }

                    //according to the tile type set oPayload tile / links to be truncated.
                    sPayloadType = that.getTileType(oTile) === that.TileType.Link ? "links" : "tiles";

                    //In case the target is a link convert the iTargetIndex to the index of links payload.
                    if (that.getTileType(oTile) === that.TileType.Link) {
                        iIndex -= oPayload.tiles.length;
                    }

                    if (iIndex >= 0) {
                        // remove element in group
                        oPayload[sPayloadType].splice(iIndex, 1);
                    } else {
                        oPayload[sPayloadType] = oPayload[sPayloadType].filter(function (oGroupElement) {
                            return oGroupElement.id !== oTile.id;
                        });
                    }

                    oCdmSiteService.save()
                        .done(function () {
                            oDeferred.resolve();
                        })
                        .fail(function (sErrorMsg) {
                            Log.error(sErrorMsg);
                            oDeferred.reject(oSite.groups[oGroup.identification.id], sErrorMsg);
                        });
                })
                .fail(function (sError) {
                    // Reject an empty group object, as site with correct group data could not get accessed
                    oDeferred.reject({}, sGenericErrorMessage + sError);
                });

            return oDeferred.promise();
        };

        /**
         * Moves a tile within a certain group or across different groups
         * on the homepage
         *
         * @param {object} oTile
         *  Tile to be moved
         * @param {number} iSourceIndex
         *  Position index of tile in source group
         * @param {number} iTargetIndex
         *  Aimed position index of tile in target group
         * @param {object} oSourceGroup
         *  Source group which currently contains the tile
         * @param {object} oTargetGroup
         *  Aimed target group where the tile should be moved to
         * @param {object} newTileType
         *  tile type of target tile, optional
         * @returns {jQuery.Promise}
         *  A promise which will be resolved when the tile has been removed successfully.
         *  In case of failure, the fail handler will be called with a collection of existing groups.
         */
        this.moveTile = function (oTile, iSourceIndex, iTargetIndex, oSourceGroup, oTargetGroup, newTileType) {
            var oDeferred = new jQuery.Deferred(),
                oCdmSiteService = this.oCDMService,
                that = this,
                sGenericErrorMessage;

            if (!oTile || isEmptyObject(oTile) ||
                iSourceIndex === undefined || iSourceIndex < 0 ||
                iTargetIndex === undefined || iTargetIndex < 0 ||
                !oSourceGroup || !oSourceGroup.identification || !oSourceGroup.identification.id ||
                !oTargetGroup || !oTargetGroup.identification || !oTargetGroup.identification.id) {
                return oDeferred.reject("Invalid input parameters").promise();
            }

            sGenericErrorMessage = "Failed to move tile with id '" + oTile.id + "'. ";

            oCdmSiteService.getSite()
                .done(function (oSite) {
                    var sTargetPayloadType,
                        oGroupPayload,
                        sOrigTileType = that.getTileType(oTile) === that.TileType.Link ? "links" : "tiles";

                    //if newTileType is not defined convert to the same type.
                    if (!newTileType) {
                        newTileType = that._mResolvedTiles[oTile.id].isLink ? "link" : "tile";
                    }

                    sTargetPayloadType = newTileType === "link" ? "links" : "tiles";

                    // change the _mResolvedTiles tile type.
                    if (sOrigTileType !== sTargetPayloadType && that._mResolvedTiles[oTile.id]) {
                        that._mResolvedTiles[oTile.id].isLink = newTileType === "link"; // currently only bookmark tiles can be created
                    }

                    //In case the target is a link convert the iTargetIndex to the index of links payload.
                    if (sTargetPayloadType === "links") {
                        iTargetIndex -= oSite.groups[oTargetGroup.identification.id].payload.tiles.length;
                    }

                    //In case the source is a link convert the index to the index of links payload.
                    if (sOrigTileType === "links") {
                        iSourceIndex -= oSite.groups[oSourceGroup.identification.id].payload.tiles.length;
                    }

                    // check for move operation within a group or across different groups
                    if (oSourceGroup.identification.id === oTargetGroup.identification.id) {
                        // within a group
                        if (iSourceIndex !== iTargetIndex || sOrigTileType !== sTargetPayloadType) {
                            oGroupPayload = oSite.groups[oTargetGroup.identification.id].payload;

                            oGroupPayload[sOrigTileType].splice(iSourceIndex, 1); // remove tile at source index
                            oGroupPayload[sTargetPayloadType].splice(iTargetIndex, 0, oTile); // add tile at target index
                        } else {
                            // no move operation took place
                            return oDeferred.resolve(oTile).promise();
                        }
                    } else {
                        // across different groups
                        oSite.groups[oSourceGroup.identification.id].payload[sOrigTileType].splice(iSourceIndex, 1); // remove tile in source group
                        oSite.groups[oTargetGroup.identification.id].payload[sTargetPayloadType].splice(iTargetIndex, 0, oTile); // add tile to target group
                    }

                    oCdmSiteService.save()
                        .done(function () {
                            oDeferred.resolve(oTile);
                        })
                        .fail(function (sError) {
                            Log.error(sGenericErrorMessage + sError);
                            oDeferred.reject(sGenericErrorMessage + sError);
                        });
                    return undefined;
                })
                .fail(function (sError) {
                    Log.error(sGenericErrorMessage + sError);
                    oDeferred.reject(sGenericErrorMessage + sError);
                });

            return oDeferred.promise();
        };
        /**
         * Determines if a given Catalog A is bigger than a given Catalog B
         * It is assumed that A.identification.id is unequal B.identification.id
         * @param {object} oA
         * Catalog A
         * @param {object} oB
         * Catalog B
         * @returns {number}
         * 1 if A bigger than B, -1 if B is bigger than A, else 0
         */
        this._compareCatalogs = function (oA, oB) {
            // note: do not return a boolean as IE does not accept it
            if (oA.identification.id > oB.identification.id) {
                return 1;
            }
            return -1;
        };

        /**
         * Requests a collection of catalogs. The catalogs get extracted out of
         * the Common Data Model site. Consumers of this method have the
         * opportunity to attach a progress handler to the returned jQuery
         * Promise to get notified for each catalog once it got processed.
         * The argument of the attached progress handler will be the respective
         * catalog object.
         *
         * @returns {jQuery.Promise}
         *  In case of success the done handler will be called with an array of
         *  catalog objects. In case of failure the fail handler will be called
         *  with a respective error message. No assumption should be made on
         *  the order with which the catalogs are returned.
         */
        this.getCatalogs = function () {
            var that = this,
                oDeferred = new jQuery.Deferred(),
                aCatalogs = [];

            function processCatalog (oCdmSite, sCatalogId, aCatalogs, oGetCatalogsDeferred) {
                var oCatalog = oCdmSite.catalogs[sCatalogId];
                aCatalogs.push(oCatalog);
                oGetCatalogsDeferred.notify(oCatalog);
            }

            // setTimeout is required here. Otherwise the the oDeferred.notify() would
            // be a synchronous call, which would cause wrong behavior in some scenarios
            sap.ushell.Container.getServiceAsync("CommonDataModel").then(function (oCDMSiteService) {
                oCDMSiteService.getSite().done(function (oSite) {
                    // catalogs from site should be loaded first as they require
                    // loading of less resources
                    Object.keys(oSite.catalogs).forEach(function (sCatalogId) {
                        processCatalog(oSite, sCatalogId, aCatalogs, oDeferred);
                    });
                    // In our tests we use indices to access specific
                    // catalogs from the getCatalogs response. For this
                    // reason we are sorting the result. As stated in the
                    // documentation, this shouldn't really matter for the
                    // caller. The caller should not code against a
                    // specific sort order.
                    //
                    // Note that oA.identification.id is a string and
                    // usually not a number Note that "A" is bigger than
                    // "1"
                    oDeferred.resolve(aCatalogs.sort(that._compareCatalogs));
                });
            }, 0);
            return oDeferred.promise();
        };

        /**
         * Test whether an inbound is potentially startable, e.g. has not  an obvious
         * filter.
         *
         * @param {object} oInbound
         *  An inbound
         * @returns {boolean}
         *  Indicates whether the inbound appears as startable
         *
         * @private
         */
        this._isStartableInbound = function (oInbound) {
            var aNonStartableInbounds = [
                "Shell-plugin",
                "Shell-bootConfig" // just in case
            ],
                bRes;

            if (!oInbound.semanticObject || !oInbound.action) {
                return false;
            }
            if (aNonStartableInbounds.indexOf(oInbound.semanticObject + "-" + oInbound.action) > -1) {
                // This is a special intent which is not startable
                return false;
            }
            if (!ObjectPath.get("signature.parameters", oInbound)) {
                return true;
            }
            bRes = Object.keys(oInbound.signature.parameters).every(function (sParameter) {
                // there is a special modelling that an exported tile pointing to a URL
                // is matched by exactly this inbound with a plain filter.
                // The export models tiles in this way (Shell-startUrl), however, generically
                // enabling to display values with a filter would bring up tiles which are
                // explicitly "filtered out" by requiring filters
                return !oInbound.signature.parameters[sParameter].filter ||
                    (!!oInbound.signature.parameters[sParameter].launcherValue || sParameter === "sap-external-url");
            });
            return bRes;
        };

        this._isHiddenInbound = function (oInbound) {
            return !!oInbound.hideLauncher;
        };

        /**
         * Constructs an inner shell hash for an inbound which represents a hash.
         * This includes the hash, e.g. #SO-action?abc=def
         *
         * @param {object} oInbound
         *  Inbound which gets used to construct the hash
         *
         * @returns {string}
         *  Constructed Hash (with prefix '#')
         *
         * @private
         */
        this._toHashFromInbound = function (oInbound) {
            var sConstructedHash = oUtilsCdm.toHashFromInbound(oInbound);

            if (!sConstructedHash) {
                return undefined;
            }
            return "#" + sConstructedHash;
        };

        /**
         * Returns the URL to be launched from a given inbound.
         *
         * @param {object} oInbound
         *    An application inbound as found in the site
         *
         * @returns {string}
         *    The URL to launch when the tile is clicked or null if the launch
         *    url cannot be found.
         *
         * @private
         */
        this._getExternalUrlFromInbound = function (oInbound) {
            return ObjectPath.get("signature.parameters.sap-external-url.launcherValue.value", oInbound) || null;
        };

        /**
         * Constructs an inner shell hash for an outbound which represents a hash.
         * This includes the hash, e.g. #SO-action?abc=def
         *
         * @param {object} oOutbound
         *  Outbound which gets used to construct the hash
         *
         * @returns {string}
         *  Constructed Hash (with prefix '#')
         *
         * @private
         */
        this._toHashFromOutbound = function (oOutbound) {
            var sConstructedHash = oUtilsCdm.toHashFromOutbound(oOutbound);

            if (!sConstructedHash) {
                return undefined;
            }
            return "#" + sConstructedHash;
        };

        /**
         * Checks if an application represents a custom tile
         * @param {object} oApplication
         *  An AppDescriptor subset
         * @returns {boolean}
         *  Indicates whether the application represents a custom tile or not
         *
         * @private
         */
        this._isCustomTile = function (oApplication) {
            if (oUshellUtils.getMember(oApplication, "sap|flp.type") === "tile") {
                return true;
            }
            return false;
        };

        /**
         * Delivers the catalog tiles for a given catalog
         *
         * @param {object} oCatalog
         *  Catalog
         * @returns {jQuery.Promise}
         *  In case of success the done handler will be called with an array
         *  of catalog tiles.
         */
        this.getCatalogTiles = function (oCatalog) {
            var that = this,
                oDeferred = new jQuery.Deferred();

            if (typeof oCatalog !== "object" || oCatalog === null) {
                return oDeferred.reject("Invalid input parameter '" + oCatalog + "' passed to getCatalogTiles.").promise();
            }

            that.oCDMService.getSite()
                .done(function (oSite) {
                    getCatalogTilesFromSite.call(that, oCatalog, oSite)
                        .done(oDeferred.resolve)
                        .fail(oDeferred.reject);
                })
                .fail(function (sErrorMessage2) {
                    oDeferred.reject("Failed to get site: " + sErrorMessage2);
                });

            return oDeferred.promise();
        };

        this.isCustomTile = function (sComponentName) {
            return !(sComponentName === sStaticTileComponent || sComponentName === sDynamicTileComponent);
        };

        function getCatalogTilesFromSite (oCatalog, oSite) {
            var that = this,
                oDeferred = new jQuery.Deferred();

            setTimeout(function () {
                // calculate async
                var aCatalogTiles = ((oCatalog.payload && oCatalog.payload.appDescriptors) || [])
                    .reduce(function (aReturnedCatalogTiles, oAppID) {
                        var oAppDescriptor = oSite.applications[oAppID.id],
                            oInbounds,
                            sTileIntent,
                            sFirstInbound,
                            oFirstInbound,
                            oInbound,
                            oTileResolutionResult,
                            oCatalogTile,
                            sApplicationType,
                            sAdditionalInformation,
                            bIsApplicationTypeConfiguredInPlace,
                            oEnableInPlaceForClassicUIsConfig;

                        if (!oAppDescriptor) {
                            return aReturnedCatalogTiles;
                        }

                        oInbounds = that._getMember(oAppDescriptor, "sap|app.crossNavigation.inbounds");
                        if (!oInbounds || Object.keys(oInbounds).length === 0) {
                            return aReturnedCatalogTiles;
                        }

                        sFirstInbound = Object.keys(oInbounds)[0];
                        oFirstInbound = oInbounds[sFirstInbound];

                        if (that._isStartableInbound(oFirstInbound) && !that._isHiddenInbound(oFirstInbound)) {
                            oInbound = oUtilsCdm.mapOne(sFirstInbound, oFirstInbound, oAppDescriptor);
                            if (!oInbound || !oInbound.tileResolutionResult) {
                                return aReturnedCatalogTiles;
                            }
                            // Add Navigation mode
                            sApplicationType = oInbound.resolutionResult.applicationType;
                            oEnableInPlaceForClassicUIsConfig = Config.last("/core/navigation/enableInPlaceForClassicUIs");
                            bIsApplicationTypeConfiguredInPlace = oEnableInPlaceForClassicUIsConfig ? oEnableInPlaceForClassicUIsConfig[sApplicationType] : false;
                            sAdditionalInformation = oInbound.resolutionResult.additionalInformation;
                            oInbound.tileResolutionResult.navigationMode = navigationMode.computeNavigationModeForHomepageTiles(
                                sApplicationType,
                                sAdditionalInformation,
                                bIsApplicationTypeConfiguredInPlace
                            );

                            oTileResolutionResult = oInbound.tileResolutionResult;
                            sTileIntent = that._toHashFromInbound(oFirstInbound);

                            oCatalogTile = {
                                id: sTileIntent, // reuse the intent as ID as it is stable and unique
                                tileIntent: sTileIntent,
                                tileResolutionResult: oTileResolutionResult,
                                isCatalogTile: true
                            };

                            aReturnedCatalogTiles.push(oCatalogTile);
                        }
                        return aReturnedCatalogTiles;
                    }, []);

                oDeferred.resolve(aCatalogTiles);
            }, 0);

            return oDeferred.promise();
        }

        /**
         * Returns the catalog's technical error message in case it could not be loaded.
         * <p>
         * <b>Beware:</b> The technical error message is not translated!
         *
         * @param {object} oCatalog
         *  Catalog
         * @returns {string}
         *  Technical error message or <code>undefined</code> if the catalog was loaded
         *  properly
         */
        this.getCatalogError = function (oCatalog) {
            if (oCatalog.error) {
                return oCatalog.error;
            }
            return undefined;
        };

        /**
         * Returns the ID for a given catalog
         *
         * @param {object} oCatalog
         *  Catalog object
         * @returns {string}
         *  Catalog ID
         */
        this.getCatalogId = function (oCatalog) {
            return oReadCatalogUtils.getCatalogId(oCatalog);
        };

        /**
         * Returns the title for a given catalog
         *
         * @param {object} oCatalog
         *  Catalog object
         * @returns {string}
         *  Catalog title
         */
        this.getCatalogTitle = function (oCatalog) {
            return oReadCatalogUtils.getCatalogTitle(oCatalog);
        };

        this._isGroupTile = function (oTile) {
            return oReadHomePageUtils.isGroupTile(oTile);
        };

        this._isCatalogTile = function (oTile) {
            return !!(oTile && oTile.isCatalogTile);
        };

        this._isFailedGroupTile = function (oTile) {
            return !!(oTile && this._mFailedResolvedTiles &&
                this._mFailedResolvedTiles[oReadHomePageUtils.getTileId(oTile)]);
        };

        this._isFailedCatalogTile = function (oTile) {
            return !!(oTile && this._mFailedResolvedCatalogTiles &&
                this._mFailedResolvedCatalogTiles[oReadHomePageUtils.getTileId(oTile)]);
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
        this.getCatalogTileId = function (oGroupTileOrCatalogTile) {
            if (this._isGroupTile(oGroupTileOrCatalogTile)) {
                if (this._isFailedGroupTile(oGroupTileOrCatalogTile)) {
                    return undefined;
                }

                // for bookmarks group tiles the target url corresponds to the id of the catalog tile
                if (oGroupTileOrCatalogTile.isBookmark && ObjectPath.get("target.url", oGroupTileOrCatalogTile)) {
                    return oGroupTileOrCatalogTile.target.url;
                }

                // the hash of the group tile is the id of the catalog tile
                return (this._mResolvedTiles[oReadHomePageUtils.getTileId(oGroupTileOrCatalogTile)] || {}).tileIntent;
            }

            if (this._isCatalogTile(oGroupTileOrCatalogTile)) {
                return oGroupTileOrCatalogTile.id;
            }
            return undefined;
        };

        /**
         * Returns the catalog tile title for a given tile (group or catalog tile)
         *
         * @param {object} oGroupTileOrCatalogTile
         *  Group tile or catalog tile
         * @returns {string}
         *  Title of respective group tile or catalog tile.
         *  In case the title could not be determined,
         *  <code>""</code> is returned.
         *  @throws an exception when the tile is not valid
         */
        this.getCatalogTileTitle = function (oGroupTileOrCatalogTile) {
            if (this._isGroupTile(oGroupTileOrCatalogTile)) {
                if (this._isFailedGroupTile(oGroupTileOrCatalogTile)) {
                    return "";
                }
                // the hash of the group tile is the id of the catalog tile
                return this._mResolvedTiles[oGroupTileOrCatalogTile.id].tileResolutionResult.title;
            }

            if (this._isCatalogTile(oGroupTileOrCatalogTile)) {
                if (this._isFailedCatalogTile(oGroupTileOrCatalogTile)) {
                    return undefined;
                }
                return oGroupTileOrCatalogTile.tileResolutionResult.title;
            }
            return undefined;
        };

        /**
         * Returns the size for a given catalog tile
         *
         * @param {object} oCatalogTile
         *  Catalog tile
         * @returns {string}
         *  Size of given catalog tile
         */
        this.getCatalogTileSize = function (oCatalogTile) {
            return oCatalogTile.tileResolutionResult.size || "1x1";
        };

        /**
         * Returns the UI for a given catalog tile
         * Works synchronously, please use getCatalogTileViewControl()
         *
         * @param {object} oCatalogTile Catalog tile
         * @returns {object} returns an object of a given catalog tile
         *
         * @deprecated since 1.99. Please use {@link #getCatalogTileViewControl} instead.
         */
        this.getCatalogTileView = function (oCatalogTile) {
            return this._getCatalogTileView(oCatalogTile);
        };

        /**
         * Returns the UI for a given catalog tile
         *
         * @param {object} oCatalogTile
         *  Catalog tile
         * @returns {object}
         *  returns a promise of a given catalog tile
         */
        this.getCatalogTileViewControl = function (oCatalogTile) {
            return this._getCatalogTileViewControl(oCatalogTile);
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
        this.getCatalogTileTargetURL = function (oGroupTileOrCatalogTile) {
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
         * Returns the preview title for a given catalog tile
         *
         * @param {object} oGroupTileOrCatalogTile
         *  Group tile or catalog tile
         * @returns {string}
         *  Preview title of given catalog tile
         * @throws an exception when the tile is not valid
         */
        this.getCatalogTilePreviewTitle = function (oGroupTileOrCatalogTile) {
            if (this._isGroupTile(oGroupTileOrCatalogTile)) {
                return this.getTileTitle(oGroupTileOrCatalogTile);
            }
            return (oGroupTileOrCatalogTile.tileResolutionResult &&
                oGroupTileOrCatalogTile.tileResolutionResult.title) || "";
        };

        /**
         * Returns the preview subTitle for a given catalog tile
         *
         * @param {object} oGroupTileOrCatalogTile
         *  Group tile or catalog tile
         * @returns {string}
         *  Preview subtitle of given catalog tile
         * @throws an exception when the tile is not valid
         */
        this.getCatalogTilePreviewSubtitle = function (oGroupTileOrCatalogTile) {
            if (this._isGroupTile(oGroupTileOrCatalogTile)) {
                return this.getTileSubtitle(oGroupTileOrCatalogTile);
            }
            return (oGroupTileOrCatalogTile.tileResolutionResult &&
                oGroupTileOrCatalogTile.tileResolutionResult.subTitle) || "";
        };

        /**
         * Returns the preview icon for a given catalog tile
         *
         * @param {object} oGroupTileOrCatalogTile
         *  Group tile or catalog tile
         * @returns {string}
         *  Preview icon of given catalog tile
         * @throws an exception when the tile is not valid
         */
        this.getCatalogTilePreviewIcon = function (oGroupTileOrCatalogTile) {
            if (this._isGroupTile(oGroupTileOrCatalogTile)) {
                return this.getTileIcon(oGroupTileOrCatalogTile);
            }
            return (oGroupTileOrCatalogTile.tileResolutionResult &&
                oGroupTileOrCatalogTile.tileResolutionResult.icon) || "";
        };

        /**
         * Returns the preview Info for a given catalog tile
         *
         * @param {object} oGroupTileOrCatalogTile
         *  Group tile or catalog tile
         * @returns {string}
         *  Preview Info of given catalog tile
         * @throws an exception when the tile is not valid
         */
        this.getCatalogTilePreviewInfo = function (oGroupTileOrCatalogTile) {
            if (this._isGroupTile(oGroupTileOrCatalogTile)) {
                return this.getTileInfo(oGroupTileOrCatalogTile);
            }
            return (oGroupTileOrCatalogTile.tileResolutionResult &&
                oGroupTileOrCatalogTile.tileResolutionResult.info) || "";
        };

        /**
         * Returns the keywords for a given tile (group or catalog tile)
         *
         * @param {object} oGroupTileOrCatalogTile
         *  Group tile or catalog tile
         * @returns {array}
         *  Keywords of respective catalog tile
         */
        this.getCatalogTileKeywords = function (oGroupTileOrCatalogTile) {
            var aKeywords = [],
                oResolvedTile = oGroupTileOrCatalogTile;

            if (!oResolvedTile) {
                Log.error(
                    "Could not find the Tile",
                    "sap.ushell.adapters.cdm.LaunchPageAdapter"
                );
                return aKeywords;
            }

            if (this._mResolvedTiles && this._mResolvedTiles[oGroupTileOrCatalogTile.id]) {
                // input tile is a group tile
                oResolvedTile = this._mResolvedTiles[oGroupTileOrCatalogTile.id];
            }

            // Keywords from catalog tile
            if (oResolvedTile && oResolvedTile.tileResolutionResult &&
                oResolvedTile.tileResolutionResult.title) {
                aKeywords.push(oResolvedTile.tileResolutionResult.title);
            }
            if (oResolvedTile && oResolvedTile.tileResolutionResult &&
                oResolvedTile.tileResolutionResult.subTitle) {
                aKeywords.push(oResolvedTile.tileResolutionResult.subTitle);
            }

            return aKeywords;
        };

        /**
         * Counts <b>all</b> bookmarks pointing to the given URL from all of the user's groups.
         * The count is performed by visiting each matching bookmark and executing the optional
         * visitor procedure if it was provided. This method can be used to check if a bookmark
         * already exists. It will return a promise that resolves to a number greater than zero
         * if a bookmark exists.
         * <p>
         * This is a potentially asynchronous operation in case the user's groups have not yet been
         * loaded completely!
         *
         * @param {string} sUrl
         *   The URL of the bookmarks to be counted, exactly as specified to {@link #addBookmark}.
         * @param {function} [fnVisitor]
         *   For each bookmark tile that matches the given url, this function will be called with
         *   the respective tile as argument.
         *
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which informs about success or failure
         *   of this asynchronous operation. In case of success, the count of existing bookmarks
         *   is provided (which might be zero). In case of failure, an error message is passed.
         *
         * @see #countBookmark
         * @see #addBookmark
         *
         * @private
         */
        this._visitBookmarks = function (sUrl, fnVisitor) {
            var oCDM = this.oCDMService;
            var oReferenceTarget;
            var oIntent = urlParsing.parseShellHash(sUrl);

            if (oIntent) {
                // oUrlParser.parseShellHash was successful
                oReferenceTarget = createNewTargetFromIntent(oIntent);
            } else {
                // this is an arbitrary URL as oUrlParser.parseShellHash failed
                oReferenceTarget = createNewTargetFromUrl(sUrl);
            }

            return oCDM.getSite().then(function (oSite) {
                var oGroups = oSite.groups;

                var aTiles = Object.keys(oGroups)
                    .filter(function (sKey) {
                        // Always ignore locked groups.
                        return !oGroups[sKey].payload.locked;
                    })
                    .map(function (sKey) {
                        return oGroups[sKey].payload.tiles.filter(function (oTile) {
                            // Consider only matching bookmark tiles.
                            return oTile.isBookmark && isSameTarget(oReferenceTarget, oTile.target);
                        });
                    })
                    .reduce(function (aAllTiles, aCurrentGroupTiles) {
                        Array.prototype.push.apply(aAllTiles, aCurrentGroupTiles);
                        return aAllTiles;
                    }, []);

                if (!fnVisitor) {
                    return aTiles.length;
                }

                return jQuery.when(aTiles.map(fnVisitor)).then(function () {
                    return aTiles.length;
                });
            });
        };

        /**
         * Adds a bookmark to the user's home page.
         * Given a specific group the bookmark is added to the group,
         * otherwise it's added to the default group on the user's home page.
         *
         * @param {object} oParameters
         *   Bookmark parameters. In addition to title and URL, a bookmark might allow additional
         *   settings, such as an icon or a subtitle. Which settings are supported depends
         *   on the environment in which the application is running. Unsupported parameters will be
         *   ignored.
         *   <p>
         *   The <code>oParameters.dataSource</code> property always shadows <code>oParameters.serviceUrl</code>.
         *   So if both are provided, the former is used and the later ignored. In essence, note that
         *   <code>oParameters.serviceUrl</code> is marked for eventual deprecation.
         *
         * @param {string} oParameters.title
         *   The title of the bookmark.
         * @param {string} oParameters.url
         *   The URL of the bookmark. If the target application shall run in the Shell the URL has
         *   to be in the format <code>"#SO-Action~Context?P1=a&P2=x&/route?RPV=1"</code>
         * @param {string} [oParameters.icon]
         *   The optional icon URL of the bookmark (e.g. <code>"sap-icon://home"</code>).
         * @param {string} [oParameters.info]
         *   The optional information text of the bookmark. This is a legacy property
         *   and is not applicable in CDM context.
         * @param {string} [oParameters.subtitle]
         *   The optional subtitle of the bookmark.
         *
         * @param {object} [oParameters.dataSource]
         *   This object describes settings for reaching the service the service
         *   that provides dynamic information for the bookmark. This property,
         *   together with the <code>serviceUrlPath</code> are the accepted means
         *   for specifying the location of the dynamic data resource.
         * @param {string} [oParameters.dataSource.uri]
         *   The base URL to the REST or OData service.
         * @param {string} [oParameters.dataSource.type]
         *   The type of the service e.g. "OData".
         * @param {object} [oParameters.dataSource.Settings]
         *   In-depth details of the data source service.
         * @param {string} [oParameters.dataSource.Settings.odataVersion]
         *   The version of oData implementation the service is based on.
         * @param {string} [oParameters.dataSource.Settings.annotations]
         *   The annotations of the data source service
         * @param {string} [oParameters.dataSource.Settings.localUri]
         *   The local URI of the data source service
         * @param {number} [oParameters.dataSource.Settings.maxAge]
         *   The maxAge parameter of the data source service
         * @param {string} [oParameter.serviceUrlPath]
         *   The path to the service method/action that actually returns the dynamic
         *   information.
         * @param {string} [oParameters.serviceRefreshInterval]
         *   The refresh interval for the <code>serviceUrl</code> in seconds.
         *
         * @param {string} [oParameters.serviceUrl]
         *   The URL to a REST or OData service that provides some dynamic information
         *   for the bookmark.
         *   The <code>dataSource</code> property is the preferred interface for
         *   defining where and how the dynamic data is fetched. This property
         *   remains for legacy reasons. Going forward, you are highly discouraged
         *   from utilizing this property.
         * @param {string} [oParameters.numberUnit]
         *   The unit for the number retrieved from <code>serviceUrl</code>. This
         *   is a legacy property and is not applicable in CDM context.
         *
         *   Reference to the group the bookmark should be added to.
         *
         * @returns {object}
         *   A <code>jQuery.Deferred</code> promise which resolves on success, but rejects
         *   (with a reason-message) on failure to add the bookmark to the specified or implied group.
         * @param {object} [oGroup]
         *   Group
         * @see sap.ushell.services.URLParsing#getShellHash
         * @since 1.42.0
         * @public
         */
        this.addBookmark = function (oParameters, oGroup) {
            var that = this;

            return new jQuery.Deferred(function (oDeferred) {
                var oCdmSiteService = that.oCDMService;

                jQuery.when(oGroup || that.getDefaultGroup(), oCdmSiteService.getSite())
                    .done(function (oGroup, oSite) {
                        var oTile,
                            oTarget,
                            oIntent = urlParsing.parseShellHash(oParameters.url),
                            oResolveTilePromise,
                            bIsUrlBookmarkTile = false;

                        if (!oIntent) {
                            oTarget = createNewTargetFromUrl(oParameters.url);
                            bIsUrlBookmarkTile = true;
                        } else {
                            oTarget = createNewTargetFromIntent(oIntent);
                        }

                        oTile = composeNewBookmarkTile(
                            oParameters,
                            oTarget
                        );

                        if (bIsUrlBookmarkTile) {
                            oResolveTilePromise = new jQuery.Deferred();
                            oResolveTilePromise.resolve(that._getTileForUrl(oTile));
                        } else {
                            // resolve tile for later use (other tiles are resolved in getGroups)
                            oResolveTilePromise = that._getTileFromHash(oParameters.url);
                        }

                        oResolveTilePromise
                            .done(function (oNewResolvedTile) {
                                oNewResolvedTile.isLink = false; // currently only bookmark tiles can be created
                                that._mResolvedTiles[oTile.id] = oNewResolvedTile;

                                // add tile to the side and save
                                oSite.groups[oGroup.identification.id].payload.tiles.push(oTile);
                                oCdmSiteService.save()
                                    .done(function () {
                                        oDeferred.resolve(oTile);
                                    })
                                    .fail(function (sReason) {
                                        oDeferred.reject(sReason);
                                    });
                            })
                            .fail(function (sErrorMsg) {
                                // Note: do not add error message to oThisAdapter._mFailedResolvedTiles[oTile.id]
                                // as the tile was not created which makes the cache useless
                                oDeferred.reject("Bookmark creation failed because: " + sErrorMsg);
                            });
                    })
                    .fail(function (sReason) {
                        oDeferred.reject(sReason);
                    });
            }).promise();
        };

        /**
         * Counts <b>all</b> bookmarks pointing to the given URL from all of the user's groups. You
         * can use this method to check if a bookmark already exists.
         * <p>
         * This is a potentially asynchronous operation in case the user's groups have not yet been
         * loaded completely!
         *
         * @param {string} sUrl
         *   The URL of the bookmarks to be counted, exactly as specified to {@link #addBookmark}.
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which informs about success or failure
         *   of this asynchronous operation. In case of success, the count of existing bookmarks
         *   is provided (which might be zero). In case of failure, an error message is passed.
         *
         * @see #addBookmark
         * @private
         */
        this.countBookmarks = function (sUrl) {
            return this._visitBookmarks(sUrl);
        };

        /**
         * Updates <b>all</b> bookmarks pointing to the given URL in all of the user's groups
         * with the given new parameters. Parameters which are omitted are not changed in the
         * existing bookmarks.
         *
         * @param {string} sUrl
         *   The URL of the bookmarks to be updated, exactly as specified to {@link #addBookmark}.
         *   In case you need to update the URL itself, pass the old one here and the new one as
         *   <code>oParameters.url</code>!
         * @param {object} oParameters
         *   The bookmark parameters as documented in {@link #addBookmark}.
         *   <p>
         *   If it is desired to remove the dynamic nature of the bookmark,
         *   set either <code>oParameters.dataSource</code> or <code>oParameters.serviceUrl</code> to null.
         *   <p>
         *   The <code>oParameters.dataSource</code> property always shadows <code>oParameters.serviceUrl</code>.
         *   So if both are provided, the former is used and the later ignored. Trying to update
         *   <code>oParameters.dataSource</code> with <code>oParameters.serviceUrl</code> results
         *   in a warning.
         *   <p>
         *   In essence, note that <code>oParameters.serviceUrl</code> is marked for eventual deprecation.
         *
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which informs about success or failure
         *   of this asynchronous operation.  In case of success, the number of updated bookmarks
         *   is provided (which might be zero). In case of failure, an error message is passed.
         *
         * @see #addBookmark
         * @see #countBookmarks
         * @see #deleteBookmarks
         *
         * @since 1.42.0
         */
        this.updateBookmarks = function (sUrl, oParameters) {
            var oCdmSiteService = this.oCDMService;

            var mResolvedTiles = this._mResolvedTiles;

            // Visitor function that updates each encountered bookmark tile as necessary.
            function updateEach (oTile) {
                return new jQuery.Deferred(function (oDeferred) {
                    var oIntent, oNewTarget;

                    var oTileComponent;
                    var bTileViewPropertiesChanged = false;
                    var oChangedTileViewProperties = {};

                    if (oParameters.url || oParameters.url === "") {
                        oIntent = urlParsing.parseShellHash(oParameters.url);

                        if (!oIntent) {
                            // url bookmark tile
                            oNewTarget = createNewTargetFromUrl(oParameters.url);
                        } else {
                            oNewTarget = createNewTargetFromIntent(oIntent);
                        }
                    }

                    // Check if necessary to propagate change in certain
                    // properties to the view. This check must be done before
                    // oTile is mutated with the effect that it's properties
                    // assume the updated state.
                    if (oTile.icon !== oParameters.icon) {
                        oChangedTileViewProperties.icon = oParameters.icon;
                        bTileViewPropertiesChanged = true;
                    }
                    if (oTile.title !== oParameters.title) {
                        oChangedTileViewProperties.title = oParameters.title;
                        bTileViewPropertiesChanged = true;
                    }
                    if (oTile.subTitle !== oParameters.subtitle) {
                        oChangedTileViewProperties.subtitle = oParameters.subtitle;
                        bTileViewPropertiesChanged = true;
                    }

                    if (oParameters.url && sUrl !== oParameters.url) {
                        // target URL is given and was changed, so inform the view
                        oChangedTileViewProperties.targetURL = oParameters.url;
                        bTileViewPropertiesChanged = true;
                    }
                    if (oTile.info !== oParameters.info) {
                        // target URL is given and was changed, so inform the view
                        oChangedTileViewProperties.info = oParameters.info;
                        bTileViewPropertiesChanged = true;
                    }

                    // Update tile model - mutates the given oTile reference.
                    updateTileComposition(oTile, oParameters, oNewTarget);

                    if (bTileViewPropertiesChanged && mResolvedTiles[oTile.id]) {
                        oTileComponent = mResolvedTiles[oTile.id].tileComponent;
                        //tileComponent is defined in the getTileView method. In case of the direct start, tileComponent is not defined
                        if (oTileComponent) {
                            oTileComponent.tileSetVisualProperties(oChangedTileViewProperties);
                        }
                    }

                    oDeferred.resolve(oTile);
                }).promise();
            }

            // When save is successful, return count of updated bookmarks,
            // otherwise the rejected promise due to the failed save operation is returned.
            return this._visitBookmarks(sUrl, updateEach)
                .then(function (iUpdatedCount) {
                    return oCdmSiteService.save().then(function () {
                        return iUpdatedCount;
                    });
                });
        };

        /**
         * Deletes <b>all</b> bookmarks pointing to the given URL from all of the user's groups.
         *
         * @param {string} sUrl
         *   The URL of the bookmarks to be deleted, exactly as specified to {@link #addBookmark}.
         *
         * @returns {object}
         *   A <code>jQuery.Deferred</code> object's promise which informs about success or failure
         *   of this asynchronous operation. In case of success, the number of deleted bookmarks
         *   is provided (which might be zero). In case of failure, an error message is passed.
         *
         * @see #addBookmark
         * @see #countBookmarks
         * @since 1.42.0
         */
        this.deleteBookmarks = function (sUrl) {
            var oCDM = this.oCDMService;
            var oIntent = urlParsing.parseShellHash(sUrl);
            var oReferenceTarget;

            if (oIntent) {
                // parseShellHash was successful
                oReferenceTarget = createNewTargetFromIntent(oIntent);
            } else {
                // this is an arbitrary URL as parseShellHash failed
                oReferenceTarget = createNewTargetFromUrl(sUrl);
            }

            return oCDM.getSite().then(function (oSite) {
                var oGroups = oSite.groups;

                var iDeletedTiles = Object.keys(oGroups)
                    .map(function (sKey) {
                        var oPayload = oGroups[sKey].payload;
                        var iCountGroupTilesToDelete = 0;

                        oPayload.tiles = oPayload.tiles.filter(function (oTile) {
                            if (oTile.isBookmark
                                && isSameTarget(oReferenceTarget, oTile.target)) {
                                ++iCountGroupTilesToDelete;
                                return false;
                            }

                            return true;
                        });

                        return iCountGroupTilesToDelete;
                    })
                    .reduce(function (aggregateSum, groupSum) {
                        aggregateSum += groupSum;

                        return aggregateSum;
                    }, 0);

                return oCDM.save().then(function () {
                    return iDeletedTiles;
                });
            });
        };

        /**
         * This method is called to notify that the given tile has been added to some remote
         * catalog which is not specified further.
         *
         * @param {string} sTileId
         *   the ID of the tile that has been added to the catalog (as returned by that OData POST
         *   operation)
         * @private
         * @since 1.42.0
         */
        this.onCatalogTileAdded = function (sTileId) {
            // TODO implement (getCatalogs should relaod on the following call)
        };

        /**
         * Callback function which gets triggered once
         * the end user submits the tile settings dialog.
         * Updates the visual properties of the tile and
         * reflects the change to the Common Data Model site.
         *
         * @param {object} oTile
         *  Tile for which the settings dialog got opened
         * @param {object} oSettingsView
         *  Tile settings dialog view instance containing
         *  the input values of the dialog
         * @returns {jQuery.Promise}
         *  The promise resolves when the personalization was saved
         *  or if there was nothing to save.
         *  The promise rejects if the prerequisites were not met.
         *
         * @private
         */
        this._onTileSettingsSave = function (oTile, oSettingsView) {
            var oDeferred = new jQuery.Deferred(),
                oUpdatedVisualTileProperties,
                sNewTitle,
                sNewInfo,
                sNewSubtitle,
                sOldTitle,
                sOldInfo,
                sOldSubtitle;

            if (!oTile || !oTile.id || !oSettingsView) {
                return oDeferred.reject().promise();
            }

            sNewTitle = oSettingsView.oTitleInput.getValue();
            sNewSubtitle = oSettingsView.oSubTitleInput.getValue();
            sNewInfo = oSettingsView.oInfoInput.getValue();
            sOldTitle = this.getTileTitle(oTile);
            sOldInfo = this.getTileInfo(oTile);
            sOldSubtitle = this.getTileSubtitle(oTile);

            // Check whether the end user changed the title or subtitle.
            // If nothing changed, return.
            if (sOldTitle === sNewTitle &&
                sOldSubtitle === sNewSubtitle &&
                sOldInfo === sNewInfo
            ) {
                return oDeferred.resolve().promise();
            }

            oUpdatedVisualTileProperties = {};
            if (sOldTitle !== sNewTitle) {
                oUpdatedVisualTileProperties.title = sNewTitle;
                // Add new properties also to tile for next startup
                oTile.title = sNewTitle;
            }
            if (sOldSubtitle !== sNewSubtitle) {
                oUpdatedVisualTileProperties.subtitle = sNewSubtitle;
                // Add new properties also to tile for next startup
                oTile.subTitle = sNewSubtitle;
            }
            if (sOldInfo !== sNewInfo) {
                oUpdatedVisualTileProperties.info = sNewInfo;
                // Add new properties also to tile for next startup
                oTile.info = sNewInfo;
            }
            // Update visual tile properties for current session,
            // otherwise the change will only be visually reflected
            // after a page reload.
            //
            // This is done conditionally, because this process may
            // not be relevant for some tile types.
            if (this._mResolvedTiles[oTile.id].tileComponent) {
                this._mResolvedTiles[oTile.id].tileComponent.tileSetVisualProperties(oUpdatedVisualTileProperties);
            } else if (this._mResolvedTiles[oTile.id].linkTileControl) {
                // Update visual link properties for current session,
                // otherwise the change will only be visually reflected
                // after a page reload.
                // update title if changed
                if (oUpdatedVisualTileProperties.title) {
                    this._mResolvedTiles[oTile.id].linkTileControl.setHeader(oUpdatedVisualTileProperties.title);
                }
                // update subtitle if changed
                if (oUpdatedVisualTileProperties.subtitle) {
                    this._mResolvedTiles[oTile.id].linkTileControl.setSubheader(oUpdatedVisualTileProperties.subtitle);
                }
                if ((oUpdatedVisualTileProperties.title) || (oUpdatedVisualTileProperties.subtitle)) {
                    //rerender the link to see the changes immediately
                    this._mResolvedTiles[oTile.id].linkTileControl.rerender();
                }
            }

            // Persist personalization changes
            sap.ushell.Container.getServiceAsync("CommonDataModel")
                .then(function (oCdmService) {
                    oCdmService.save()
                        .fail(function (sErrorMsg0) {
                            Log.error(sErrorMsg0);
                            oDeferred.reject("Could not save personalization changes: " + sErrorMsg0);
                        })
                        .done(function () {
                            oDeferred.resolve();
                        });
                });

            return oDeferred.promise();
        };

        /**
         * Returns the tile actions for a given tile.
         *
         * @param {object} oTile
         *  Tile object
         * @returns {array}
         *  Tile actions for the given tile
         *
         * @public
         */
        this.getTileActions = function (oTile) {
            var aTileActions = [],
                oTileSettingsAction,
                oModel;

            if (this._isGroupTile(oTile) && !this._isFailedGroupTile(oTile)) {
                // Create necessary model for dialog to pass actual properties
                oModel = new JSONModel({
                    config: {
                        display_title_text: this.getTileTitle(oTile),
                        display_subtitle_text: this.getTileSubtitle(oTile),
                        display_info_text: this.getTileInfo(oTile)
                    }
                });

                // Get tile settings action
                oTileSettingsAction = utils.getTileSettingsAction(oModel, this._onTileSettingsSave.bind(this, oTile), this.getTileType(oTile));
                aTileActions.push(oTileSettingsAction);
            }
            return aTileActions;
        };

        function composeNewBookmarkTile (oParameters, oTarget) {
            var oTile = composeNewTile(oParameters, oTarget);

            oTile.isBookmark = true;

            return oTile;
        }

        function composeNewTile (oParameters, oTarget) {
            // TODO Collect all tile ids to pass them as an arry to
            // generateUniqueId
            var oTile = {
                id: oUshellUtils.generateUniqueId([])
            };

            updateTileComposition(oTile, oParameters, oTarget);

            return oTile;
        }

        /**
         * Updates the properties of a bookmark tile during its composition.
         * @param {Object} oTile JSON Object that holds the properties of a bookmark tile.
         * @param {Object} oParameters Properties to merge into the bookmark tile
         * @param {Object} oTarget The navigation target as a JSON object.
         *
         * @private
         */
        function updateTileComposition (oTile, oParameters, oTarget) {
            // Avoid modifying callers reference.
            oParameters = deepExtend({}, oParameters);

            if (oTarget) {
                oTile.target = oTarget;
            }

            if (oParameters.title || oParameters.title === "") {
                oTile.title = oParameters.title;
            }

            if (oParameters.icon || oParameters.icon === "") {
                oTile.icon = oParameters.icon;
            }

            if (oParameters.subtitle || oParameters.subtitle === "") {
                oTile.subTitle = oParameters.subtitle;
            }
            if (oParameters.info || oParameters.info === "") {
                oTile.info = oParameters.info;
            }

            if (oParameters.dataSource) {
                oTile.dataSource = {};
                deepExtend(oTile.dataSource, oParameters.dataSource);
            }

            if (oParameters.serviceUrl || oParameters.serviceUrl === "") {
                oTile.indicatorDataSource = {
                    path: oParameters.serviceUrl
                };
            }

            if (oTile.indicatorDataSource && (oParameters.serviceRefreshInterval || oParameters.serviceRefreshInterval === 0)) {
                oTile.indicatorDataSource.refresh
                    = oParameters.serviceRefreshInterval;
            }
        }

        function isSameTarget (oTarget, oOther) {
            if (oTarget && oOther) {
                if (oTarget.url) {
                    // url bookmark tile
                    return oTarget.url === oOther.url;
                }

                return oTarget.semanticObject === oOther.semanticObject
                    && oTarget.action === oOther.action
                    && isSameParameters(oTarget.parameters, oOther.parameters)
                    && oTarget.appSpecificRoute === oOther.appSpecificRoute;
            }

            return oTarget === oOther;
        }

        function isSameParameters (aParameters, aOthers) {
            var sFirst, sOther;

            aParameters = aParameters || [];
            aOthers = aOthers || [];

            if (aParameters.length === aOthers.length) {
                sFirst = transformParameterListToString(aParameters);
                sOther = transformParameterListToString(aOthers);

                return sFirst === sOther;
            }

            return false;
        }

        function transformParameterListToString (aList) {
            return aList
                .map(function (oParameter) {
                    return oParameter.name + oParameter.value;
                })
                .sort()
                .join();
        }

        function createNewTargetFromUrl (sUrl) {
            return {
                url: sUrl
            };
        }

        function createNewTargetFromIntent (oIntent) {
            var oTarget = {
                semanticObject: oIntent.semanticObject,
                action: oIntent.action,
                parameters: createTileParametersFromIntentParams(oIntent.params)
            };

            if (oIntent.appSpecificRoute) {
                // do not loose the inner-app hash (e.g. &/ShoppingCart(12345))
                // BCP 1670533333
                oTarget.appSpecificRoute = oIntent.appSpecificRoute;
            }

            return oTarget;
        }

        function createTileParametersFromIntentParams (oIntentParams) {
            return Object.keys(oIntentParams).map(function (sKey) {
                var sValue = oIntentParams[sKey] && oIntentParams[sKey][0];

                return {
                    name: sKey,
                    value: sValue || "" // "sValue" might be undefined
                };
            });
        }
    }

    // TODO check if this is really needed:
    LaunchPageAdapter.prototype._getMember = function (oObject, sAccessPath) {
        return oUshellUtils.getMember(oObject, sAccessPath);
    };

    return LaunchPageAdapter;
}, /* bExport = */ false);
