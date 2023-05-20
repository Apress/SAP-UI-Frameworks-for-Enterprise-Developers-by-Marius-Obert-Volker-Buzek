// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's LaunchPageAdapter for the
 *               'CDM' platform - Version 3 (V3)
 *
 * @deprecated since 1.100
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readHome",
    "sap/ushell/adapters/cdm/_LaunchPage/modifyHome",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readCatalogs",
    "sap/m/library",
    "sap/ushell/utils",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/adapters/cdm/v3/utilsCdm",
    "sap/ushell/components/tiles/utils",
    "sap/ushell/adapters/cdm/v3/AdapterBase",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readVisualizations",
    "sap/ushell/navigationMode",
    "sap/ushell/Config",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/deepExtend",
    "sap/base/util/isEmptyObject",
    "sap/base/util/ObjectPath",
    "sap/base/Log"
], function (
    oReadHomePageUtils,
    oModifyHomePageUtils,
    oReadCatalog,
    mobileLibrary,
    oUshellUtils,
    WindowUtils,
    urlParsing,
    oUtilsCdm,
    oUtils,
    AdapterBase,
    oReadVisualization,
    navigationMode,
    Config,
    JSONModel,
    jQuery,
    deepExtend,
    isEmptyObject,
    ObjectPath,
    Log
) {
    "use strict";

    // shortcut for sap.m.GenericTileMode
    var oGenericTileMode = mobileLibrary.GenericTileMode;

    /* global hasher */

    var STATIC_TILE_COMPONENT_NAME = "sap.ushell.components.tiles.cdm.applauncher";
    var DYNAMIC_TILE_COMPONENT_NAME = "sap.ushell.components.tiles.cdm.applauncherdynamic";

    /**
     * This method MUST be called by the Unified Shell's container only.
     * Constructs a new instance of the LaunchPageAdapter for the 'CDM' platform.
     *
     * @param {object} oUnused
     *     the system served by the adapter
     * @param {string} sParameter
     *     parameter as string (legacy, was used before oAdapterConfiguration was added)
     * @param {oject} oAdapterConfiguration
     *     configuration for the adapter.
     *
     * @class
     *
     * @constructor
     * @since 1.15.0
     * @deprecated since 1.100
     */
    function LaunchPageAdapter (oUnused, sParameter, oAdapterConfiguration) {
        AdapterBase.call(this, oUnused, sParameter, oAdapterConfiguration);
        Promise.all([
            sap.ushell.Container.getServiceAsync("URLParsing"),
            sap.ushell.Container.getServiceAsync("CommonDataModel")
        ]).then(function (aServices) {
            this.oURLParsingService = aServices[0]; // It is not used internally. Keep it for back compatibility.
            this.oCDMService = aServices[1];
        }.bind(this));

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
            var oDeferred = new jQuery.Deferred();
            var oCatalogTilePromise = oCatalogTilePromiseCache[sIntent];

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
            var oTileComponentLoadInfo = {
                componentName: oTile.indicatorDataSource ? DYNAMIC_TILE_COMPONENT_NAME : STATIC_TILE_COMPONENT_NAME
            };
            return {
                tileIntent: "#",
                tileResolutionResult: {
                    tileComponentLoadInfo: oTileComponentLoadInfo,
                    isCustomTile: false
                }
            };
        };

        /**
         * Constructs the hash for a given tile object. Additionaly parameters
         * get formatted.
         *
         * @param {object} oTile
         *  Tile object for which the hash should be constructed.
         * @returns {string} constructed hash or <code>undefined</code>
         *   in case something went wrong.
         *
         * @private
         */
        this._prepareTileHash = function (oTile) {
            var oParams = {};

            if (this._isCatalogTile(oTile)) {
                return oTile.tileIntent;
            }

            if (this._isGroupTile(oTile) && oTile.target) {
                // TODO use hash from _mResolvedTiles if tile has been already resolved
                var aRawParams = oTile.target.parameters || [];
                aRawParams.forEach(function (oParameter) {
                    if (oParameter.name && oParameter.value) {
                        oParams[oParameter.name] = [oParameter.value];
                    }
                });

                var oTarget = {
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
            var oDeferred = new jQuery.Deferred();
            var oAssureLoadedDeferred;
            var that = this;
            // check whether assureLoaded was already called.
            // The default group is not set before.
            if (!this._oDefaultGroup) {
                oAssureLoadedDeferred = this._ensureLoaded();
            }

            if (oAssureLoadedDeferred) {
                oAssureLoadedDeferred
                    .done(function () {
                        oDeferred.resolve(that._oDefaultGroup);
                    })
                    .fail(function (sMessage) {
                        oDeferred.reject("Failed to access default group. " + sMessage);
                    });
            } else {
                oDeferred.resolve(that._oDefaultGroup);
            }

            return oDeferred.promise();
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
            var oDeferred = new jQuery.Deferred();
            var sGeneratedId;
            var that = this;

            if (!this._isValidTitle(sTitle)) {
                return oDeferred.reject("No valid group title").promise();
            }

            var sGenericErrorMessage = "Failed to add the group with title '" + sTitle + "' to the homepage. ";

            // add group to site
            this.oCDMService.getSite()
                .done(function (oSite) {
                    sGeneratedId = oUshellUtils.generateUniqueId(oReadHomePageUtils.getGroupIdsFromSite(oSite));

                    // append the group at the end
                    oModifyHomePageUtils.addGroupToSite(oSite, oModifyHomePageUtils.createEmptyGroup(sGeneratedId, sTitle));

                    // store personalization
                    that.oCDMService.save()
                        .done(function () {
                            delete that._ensureLoadedDeferred;
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
            var that = this;
            var oDeferred = new jQuery.Deferred();

            if (typeof oGroup !== "object" || !oReadHomePageUtils.getGroupId(oGroup)) {
                return oDeferred.reject("Unexpected group value").promise();
            }
            if (!that._isValidTitle(sNewTitle)) {
                return oDeferred.reject("Unexpected oGroup title value").promise();
            }
            var sGenericErrorMessage = "Failed to set new title for group with id '" +
                oReadHomePageUtils.getGroupId(oGroup) + "'. ";

            // necessary in case the renaming operation fails
            var sOldTitle = oReadHomePageUtils.getGroupTitle(oGroup);

            this.oCDMService.getSite()
                .done(function (oSite) {
                    // adapt title
                    if (oGroup) {
                        oModifyHomePageUtils.setGroupTitle(oGroup, sNewTitle);
                    }
                    // save personalization
                    that.oCDMService.save()
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
         * Hides a given set of groups on the homepage.
         * In case an empty array gets passed, all exisiting groups
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
            var oDeferred = new jQuery.Deferred();
            var oCdmSiteService = this.oCDMService;

            if (aHiddenGroupIds && Array.isArray(aHiddenGroupIds)) {
                var sGenericErrorMessage = "Failed to hide group. ";
                oCdmSiteService.getSite()
                    .done(function (oSite) {
                        oReadHomePageUtils.getGroupsArrayFromSite(oSite).forEach(function (oGroup) {
                            var bIsInList = Array.prototype.indexOf.call(aHiddenGroupIds, oReadHomePageUtils.getGroupId(oGroup)) === -1;
                            oModifyHomePageUtils.setGroupVisibility(oGroup, bIsInList);
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
            var oDeferred = new jQuery.Deferred();
            var oCdmSiteService = this.oCDMService;

            if (!oGroup || !oReadHomePageUtils.getGroupId(oGroup) || nNewIndex < 0) {
                return oDeferred.reject("Unable to move groups - invalid parameters").promise();
            }

            var sGenericErrorMessage = "Failed to move group with id '" + oGroup.identification.id + "'. ";
            // move group inside the site object
            oCdmSiteService.getSite()
                .done(function (oSite) {
                    var aGroupsOrder = oReadHomePageUtils.getGroupIdsFromSite(oSite);
                    var sGroupId = oReadHomePageUtils.getGroupId(oGroup);

                    if (!aGroupsOrder) {
                        return oDeferred.reject("groupsOrder not found - abort operation of adding a group.");
                    } if (aGroupsOrder.indexOf(sGroupId) === nNewIndex) {
                        return oDeferred.resolve();
                    }

                    // move group inside the groupsOrder array
                    var aGroupsOrderAfterMove = oUshellUtils.moveElementInsideOfArray(aGroupsOrder, aGroupsOrder.indexOf(sGroupId), nNewIndex);

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
            var oDeferred = new jQuery.Deferred();
            var oCdmSiteService = this.oCDMService;

            if (typeof oGroup !== "object") {
                return oDeferred.reject("invalid group parameter").promise();
            }
            var sGroupId = oReadHomePageUtils.getGroupId(oGroup);
            if (!sGroupId) {
                return oDeferred.reject("group without id given").promise();
            }

            var sGenericErrorMessage = "Failed to remove group with id '" + sGroupId + "'. ";

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
            var oDeferred = new jQuery.Deferred();
            var oCdmSiteService = this.oCDMService;
            var aSiteGroupsBackup = [];
            var that = this;

            if (typeof oGroup === "object" && oReadHomePageUtils.getGroupId(oGroup)) {
                var sGroupId = oReadHomePageUtils.getGroupId(oGroup);
                var sGenericErrorMessage = "Failed to reset group with id '" + sGroupId + "'. ";

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
         * Checks if a tile personalization is supported
         *
         * @param {object} oTile
         *  Tile to check for personalization support
         * @returns {boolean}
         *  The return value is <code>true</true> if the tile personalizationis is
         *  supported, and <code>false</code> if not.
         */
        this.isLinkPersonalizationSupported = function (/*oTile*/) {
            return true;
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
         * Refreshs a given tile
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
            if (typeof oTileComponent.tileSetVisible === "function"
                && bOldVisibility !== bNewVisibility) {
                oTileComponent.tileSetVisible(bNewVisibility);
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
            var sTileTitle;
            var sTileSubTitle = this.getTileSubtitle(oTile);

            var GenericTile = fnGenericTile;

            // should only be called after tile has been resolved
            if (bIsCatalogTile === true) {
                sTileTitle = this.getCatalogTileTitle(oTile);
            } else {
                sTileTitle = this.getTileTitle(oTile);
            }

            // By using the LineMode, the GenericTile is displayed as a Link
            var linkTileControl = new GenericTile({
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
                var sTranslatedNavMode = oResources.i18n.getText(sNavigationMode + "NavigationMode");
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
            var oDeferred = new jQuery.Deferred();
            var oCdmSiteService = this.oCDMService;

            if (!oGroup) {
                oGroup = this._oDefaultGroup;
            }

            var oGroupTile = composeNewTile();
            oGroupTile.vizId = oCatalogTile.vizId;

            // add new tile to list of resolved tiles
            this._mResolvedTiles[oGroupTile.id] = {
                tileIntent: oCatalogTile.tileIntent,
                tileResolutionResult: oCatalogTile.tileResolutionResult,
                isLink: false
            };
            oCdmSiteService.getSite()
                .done(function (oSite) {
                    // We should think about the reasons why it's not safe to
                    // do the following, even though it's more succint:
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
                    var sGenericErrorMessage = "Failed to add tile with id '" + oGroupTile.id +
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
            var oCdmSiteService = this.oCDMService;
            var oDeferred = new jQuery.Deferred();
            var that = this;

            if (!oGroup || typeof oGroup !== "object" || !oGroup.identification || !oGroup.identification.id ||
                !oTile || typeof oTile !== "object" || !oTile.id) {
                return oDeferred.reject({}, "Failed to remove tile. No valid input parameters passed to removeTile method.").promise();
            }

            var sGenericErrorMessage = "Failed to remove tile with id '" + oTile.id + "' from group with id '" + oGroup.identification.id + "'. ";

            oCdmSiteService.getSite()
                .done(function (oSite) {
                    var oPayload;

                    // succinctly convert iIndex to number
                    iIndex = +iIndex;

                    try {
                        oPayload = oSite.groups[oGroup.identification.id].payload;
                    } catch (e) {
                        oDeferred.reject(oSite.groups[oGroup.identification.id], sGenericErrorMessage);
                    }

                    //according to the tile type set oPayload tile / links to be truncated.
                    var sPayloadType = that.getTileType(oTile) === that.TileType.Link ? "links" : "tiles";

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
            var oDeferred = new jQuery.Deferred();
            var oCdmSiteService = this.oCDMService;
            var that = this;

            if (!oTile || isEmptyObject(oTile) ||
                iSourceIndex === undefined || iSourceIndex < 0 ||
                iTargetIndex === undefined || iTargetIndex < 0 ||
                !oSourceGroup || !oSourceGroup.identification || !oSourceGroup.identification.id ||
                !oTargetGroup || !oTargetGroup.identification || !oTargetGroup.identification.id) {
                return oDeferred.reject("Invalid input parameters").promise();
            }

            var sGenericErrorMessage = "Failed to move tile with id '" + oTile.id + "'. ";

            oCdmSiteService.getSite()
                .done(function (oSite) {
                    var sOrigTileType = that.getTileType(oTile) === that.TileType.Link ? "links" : "tiles";

                    //if newTileType is not defined convert to the same type.
                    if (!newTileType) {
                        newTileType = that._mResolvedTiles[oTile.id].isLink ? "link" : "tile";
                    }

                    var sTargetPayloadType = newTileType === "link" ? "links" : "tiles";

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
                            var oGroupPayload = oSite.groups[oTargetGroup.identification.id].payload;
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
         * Sort catalogs by title
         * @param {object} oA Catalog A
         * @param {object} oB Catalog B
         * @returns {number} Sort order
         * @private
         */
        this._compareCatalogs = function (oA, oB) {
            return (oA.identification.title || "").toLowerCase() > (oB.identification.title || "").toLowerCase() ? 1 : -1;
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
            var that = this;
            var oDeferred = new jQuery.Deferred();
            var aCatalogs = [];

            function processCatalog (oCdmSite, sCatalogId, aCatalogs, oGetCatalogsDeferred) {
                var oCatalog = oCdmSite.catalogs[sCatalogId];
                aCatalogs.push(oCatalog);
                oGetCatalogsDeferred.notify(oCatalog);
            }

            // setTimeout is required here. Otherwise the the oDeferred.notify() would
            // be a synchronous call, which would cause wrong behavior in some scenarios
            sap.ushell.Container.getServiceAsync("CommonDataModel").then(function (oCDMSiteService) {
                oCDMSiteService.getSite().done(function (oSite) {
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
            });
            return oDeferred.promise();
        };

        /**
         * Check wether an inbound is startable.
         *
         * @param {object} oInbound An inbound
         * @returns {boolean} Indicates whether the inbound appears to be startable
         *
         * @private
         */
        this._isStartableInbound = function (oInbound) {
            if (!oInbound.semanticObject || !oInbound.action) {
                return false;
            }

            var aNonStartableInbounds = [
                "Shell-plugin",
                "Shell-bootConfig" // just in case
            ];
            if (aNonStartableInbounds.indexOf(oInbound.semanticObject + "-" + oInbound.action) > -1) {
                // This is a special intent which is not startable
                return false;
            }

            return true;
        };

        /**
         * Check whether a visualization is potentially startable together with the inbound it points to.
         * This is only a quick and cheap check and does not perform a full client side target resolution.
         * Therefore it does not filter out all non-startable visualizations but the larger part of them.
         *
         * @param {object} oVisualization A visualization
         * @param {object} oInbound An inbound
         * @returns {boolean} Indicates whether visualization appears to be startable
         *
         * @since 1.89.0
         * @private
         */
        this._isStartableVisualization = function (oVisualization, oInbound) {
            var oInboundParameters = ObjectPath.get("signature.parameters", oInbound);
            if (!oInboundParameters) {
                return true;
            }

            var oVisualizationParameters = ObjectPath.get("parameters", oReadVisualization.getTarget(oVisualization));

            // check for matching filter parameters
            return Object.keys(oInboundParameters).every(function (sInboundParameter) {
                var oInboundParameter = oInboundParameters[sInboundParameter];

                // don't filter out legacy URL applications that use the intent Shell-launchURL to model URL tiles
                if (sInboundParameter === "sap-external-url") {
                    return true;
                }

                // as this check is intended to be cheap and simple only plain filters are checked
                if (!oInboundParameter.filter ||
                    oInboundParameter.filter.format !== "plain") {
                    return true;
                }

                var sExpectedFilterValue = oInboundParameter.filter.value;
                var sSuppliedParameterValue = ObjectPath.get([sInboundParameter, "value", "value"], oVisualizationParameters);

                if (sExpectedFilterValue !== sSuppliedParameterValue) {
                    return false;
                }

                return true;
            });
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
         * Delivers the catalog tiles for a given catalog
         *
         * @param {object} oCatalog
         *  Catalog
         * @returns {jQuery.Promise}
         *  In case of success the done handler will be called with an array
         *  of catalog tiles.
         */
        this.getCatalogTiles = function (oCatalog) {
            var that = this;
            var oDeferred = new jQuery.Deferred();

            if (typeof oCatalog !== "object" || oCatalog === null) {
                return oDeferred.reject("Invalid input parameter '" + oCatalog + "' passed to getCatalogTiles.").promise();
            }

            this.oCDMService.getSite()
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

        function getCatalogTilesFromSite (oCatalog, oSite) {
            var that = this;
            var oDeferred = new jQuery.Deferred();

            setTimeout(function () {
                // calculate async
                var aCatalogTiles = ((oCatalog.payload && oCatalog.payload.viz) || [])
                    .reduce(function (aReturnedCatalogTiles, sVisualizationId) {
                        var sAppId;
                        var oVisualization;
                        var sVisualizationTypeId;
                        var oVisualizationType;
                        var oAppDescriptor;
                        var oInboundResult;
                        var sHash;
                        var oMapped;
                        var sNavigationMode;
                        var oOutbound;
                        var oTileResolutionResult;
                        var oCatalogTile;
                        var sExternalUrl;
                        var sApplicationType;
                        var sAdditionalInformation;
                        var bIsApplicationTypeConfiguredInPlace;
                        var oEnableInPlaceForClassicUIsConfig;

                        // Get visualization and type
                        if (!sVisualizationId) {
                            return aReturnedCatalogTiles;
                        }

                        oVisualization = oReadVisualization.get(oSite, sVisualizationId);
                        if (!oVisualization) {
                            return aReturnedCatalogTiles;
                        }

                        sVisualizationTypeId = oReadVisualization.getTypeId(oVisualization);
                        oVisualizationType = oReadVisualization.getType(oSite, sVisualizationTypeId);

                        sAppId = oReadVisualization.getAppId(oVisualization);

                        if (sAppId) {
                            // Read its target app descriptor and inbound
                            oAppDescriptor = oReadVisualization.getAppDescriptor(oSite, sAppId);
                            if (!oAppDescriptor) {
                                return aReturnedCatalogTiles;
                            }

                            // Resolve tile via app id in visualization target
                            oInboundResult = oReadHomePageUtils.getInbound(oAppDescriptor, oReadVisualization.getTarget(oVisualization).inboundId);
                            if (!oInboundResult) {
                                return aReturnedCatalogTiles;
                            }

                            if (!that._isStartableInbound(oInboundResult.inbound) ||
                                !that._isStartableVisualization(oVisualization, oInboundResult.inbound) ||
                                that._isHiddenInbound(oInboundResult.inbound)) {
                                return aReturnedCatalogTiles;
                            }

                            oMapped = oUtilsCdm.mapOne(oInboundResult.key, oInboundResult.inbound, oAppDescriptor, oVisualization, oVisualizationType, oSite);
                            if (!oMapped || !oMapped.tileResolutionResult) {
                                return aReturnedCatalogTiles;
                            }

                            // Add Navigation mode
                            sApplicationType = oMapped.resolutionResult.applicationType;
                            sAdditionalInformation = oMapped.resolutionResult.additionalInformation;
                            oEnableInPlaceForClassicUIsConfig = Config.last("/core/navigation/enableInPlaceForClassicUIs");
                            bIsApplicationTypeConfiguredInPlace = oEnableInPlaceForClassicUIsConfig ? oEnableInPlaceForClassicUIsConfig[sApplicationType] : false;
                            sNavigationMode = navigationMode.computeNavigationModeForHomepageTiles(sApplicationType, sAdditionalInformation, bIsApplicationTypeConfiguredInPlace);

                            oOutbound = oReadVisualization.getOutbound(oVisualization, oInboundResult.inbound);
                            sHash = that._toHashFromOutbound(oOutbound);
                        } else {
                            // Resolve tile via visualization's configuration
                            var oConfig = oReadVisualization.getConfig(oVisualization);
                            if (oConfig === undefined) {
                                return aReturnedCatalogTiles;
                            }

                            oMapped = oUtilsCdm.mapOne(undefined, undefined, undefined, oVisualization, oVisualizationType, oSite);

                            if (oUshellUtils.getMember(oConfig, "sap|flp.target.type") === "URL") {
                                sExternalUrl = oUshellUtils.getMember(oConfig, "sap|flp.target.url");
                            }
                        }

                        oTileResolutionResult = oMapped.tileResolutionResult;
                        oTileResolutionResult.navigationMode = sNavigationMode;

                        // Device check
                        if (!that._isFormFactorSupported(oTileResolutionResult)) {
                            return aReturnedCatalogTiles;
                        }

                        if (oCatalog.contentProviderId) {
                            // This is an extension catalog from an extension site provided by a
                            // ContentProvider plugin. See "sap-ushell-plugin-type": "ContentProvider"
                            sExternalUrl = that._getMember(
                                oAppDescriptor,
                                "sap|app.crossNavigation.inbounds.Shell-launchURL.signature.parameters.sap-external-url.launcherValue.value"
                            );
                        }

                        oCatalogTile = {
                            id: sVisualizationId, // reuse the vizId as it is stable and unique
                            vizId: sVisualizationId,
                            tileIntent: sExternalUrl || sHash,
                            tileResolutionResult: oTileResolutionResult,
                            isCatalogTile: true
                        };

                        if (oCatalog.contentProviderId && sExternalUrl) {
                            // extension catalog tiles get additional properties
                            // as they are treated differently in addTile
                            oCatalogTile.contentProviderId = oCatalog.contentProviderId;
                            oCatalogTile.externalUrl = sExternalUrl;
                        }

                        aReturnedCatalogTiles.push(oCatalogTile);

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
            return oReadCatalog.getId(oCatalog);
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
            return oReadCatalog.getTitle(oCatalog);
        };

        this._isFailedCatalogTile = function (oTile) {
            return !!(oTile && this._mFailedResolvedCatalogTiles &&
                this._mFailedResolvedCatalogTiles[oReadHomePageUtils.getTileId(oTile)]);
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
                // the vizId of the group tile is the id of the catalog tile
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
         * Asynchronous version of the method
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
         * Returns the indicator data source url
         *
         * @param {object} oGroupTileOrCatalogTile
         *  Group tile or catalog tile
         * @returns {object} The catalog tile indicator data source
         * @since 1.70.0
         */
        this.getCatalogTilePreviewIndicatorDataSource = function (oGroupTileOrCatalogTile) {
            return oGroupTileOrCatalogTile.tileResolutionResult && oGroupTileOrCatalogTile.tileResolutionResult.indicatorDataSource;
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
            var aKeywords = [];
            var oResolvedTile = oGroupTileOrCatalogTile;

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
                Array.isArray(oResolvedTile.tileResolutionResult.keywords)) {
                Array.prototype.push.apply(aKeywords, oResolvedTile.tileResolutionResult.keywords);
            }
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
         * @param {string} [sVizType]
         *  (added with 1.83) The visualization type (viz type) which was used to create the bookmark using {@link #addCustomBookmark}.
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
        this._visitBookmarks = function (sUrl, fnVisitor, sVizType, sContentProviderId) {
            var oReferenceTarget;
            var oIntent = urlParsing.parseShellHash(sUrl);

            if (oIntent) {
                // oUrlParser.parseShellHash was successful
                oReferenceTarget = createNewTargetFromIntent(oIntent);
            } else {
                // this is an arbitrary URL as oUrlParser.parseShellHash failed
                oReferenceTarget = createNewTargetFromUrl(sUrl);
            }

            return this.oCDMService.getSite().then(function (oSite) {
                var oGroups = oSite.groups;

                var aTiles = Object.keys(oGroups)
                    .filter(function (sKey) {
                        // Always ignore locked groups.
                        return !oGroups[sKey].payload.locked;
                    })
                    .map(function (sKey) {
                        return oGroups[sKey].payload.tiles.filter(function (oTile) {
                            // Consider only matching bookmark tiles. VizType is only set for custom bookmark tiles.
                            return oTile.isBookmark
                                && oTile.vizType === sVizType
                                && (oTile.contentProvider || "") === (sContentProviderId || "")
                                && isSameTarget(oReferenceTarget, oTile.target);
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
         * @param {string} [oParameters.serviceUrlPath]
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
         *   from utilising this property.
         * @param {string} [oParameters.numberUnit]
         *   The unit for the number retrieved from <code>serviceUrl</code>. This
         *   is a legacy property and is not applicable in CDM context.
         *
         *   Reference to the group the bookmark should be added to.
         * @param {object} [oGroup]
         *  Group
         * @param {object} [sContentProviderId] The content provider id in cFLP scenario
         *
         * @returns {object}
         *   A <code>jQuery.Deferred</code> promise which resolves on success, but rejects
         *   (with a reason-message) on failure to add the bookmark to the specified or implied group.
         *   Group
         * @see sap.ushell.services.URLParsing#getShellHash
         * @since 1.42.0
         * @public
         */
        this.addBookmark = function (oParameters, oGroup, sContentProviderId) {
            var that = this;

            return new jQuery.Deferred(function (oDeferred) {
                var oCdmSiteService = that.oCDMService;

                jQuery.when(oGroup || that.getDefaultGroup(), oCdmSiteService.getSite())
                    .done(function (oGroup, oSite) {
                        var oTarget;
                        var oIntent = urlParsing.parseShellHash(oParameters.url);
                        var oResolveTilePromise;
                        var bIsUrlBookmarkTile = false;

                        if (!oIntent) {
                            oTarget = createNewTargetFromUrl(oParameters.url);
                            bIsUrlBookmarkTile = true;
                        } else {
                            oTarget = createNewTargetFromIntent(oIntent);
                        }

                        var oTile = composeNewBookmarkTile(
                            oParameters,
                            oTarget,
                            sContentProviderId
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
                                // Note: do not add error message to that._mFailedResolvedTiles[oTile.id]
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
         * Adds a custom bookmark to the user's home page.
         * Given a specific group the bookmark is added to the group,
         * otherwise it's added to the default group on the user's home page.
         *
         * @param {object} oBookmarkConfig The configuration of the bookmark. See below for the structure.
         * <pre>
         *     {
         *         vizType: "sap.ushell.demotiles.cdm.newstile",
         *         vizConfig: {
         *             "sap.flp": {
         *                 chipConfig: {
         *                     chipId: "X-SAP-UI2-CHIP:/UI2/AR_SRVC_NEWS",
         *                     bags: {},
         *                     configuration: {}
         *                 }
         *             },
         *             "sap.platform.runtime": {
         *                 includeManifest: true
         *             }
         *         },
         *         url: "#Action-toBookmark?a=b",
         *         title: "My Title",
         *         icon: "sap-icon://world",
         *         subtitle: "My Subtitle",
         *         info: "My Info"
         *     }
         * </pre>
         * @param {object} oTargetGroup The group where the bookmark should be added
         * @param {string} sContentProviderId The contentProviderId or undefined outside the cFLP
         *
         * @returns {object} A jQuery.Deferred which resolves with the resulting tile or rejects in case of an error
         *
         * @private
         * @since 1.83.0
         */
        this.addCustomBookmark = function (oBookmarkConfig, oTargetGroup, sContentProviderId) {
            var oDeferred = new jQuery.Deferred();

            Promise.all([
                sap.ushell.Container.getServiceAsync("URLParsing"),
                sap.ushell.Container.getServiceAsync("CommonDataModel")
            ]).then(function (aResults) {
                var oUrlParsing = aResults[0];
                var oCdmSiteService = aResults[1];

                jQuery.when(oTargetGroup || this.getDefaultGroup(), oCdmSiteService.getSite())
                    .done(function (oGroup, oSite) {
                        var oIntent = oUrlParsing.parseShellHash(oBookmarkConfig.url);
                        var bIsUrlBookmarkTile = (oIntent === undefined);

                        var oTarget = bIsUrlBookmarkTile ? createNewTargetFromUrl(oBookmarkConfig.url) : createNewTargetFromIntent(oIntent);

                        // building a grouptile but with vizConfig like a visualization
                        var oTile = {
                            id: oUshellUtils.generateUniqueId([]),
                            vizType: oBookmarkConfig.vizType,
                            title: oBookmarkConfig.title,
                            subTitle: oBookmarkConfig.subtitle,
                            icon: oBookmarkConfig.icon,
                            info: oBookmarkConfig.info,
                            numberUnit: oBookmarkConfig.numberUnit,
                            target: oTarget,
                            indicatorDataSource: {
                                path: oBookmarkConfig.serviceUrl,
                                refresh: oBookmarkConfig.serviceRefreshInterval
                            },
                            vizConfig: oBookmarkConfig.vizConfig,
                            isBookmark: true
                        };

                        if (sContentProviderId) {
                            oTile.contentProvider = sContentProviderId;
                        }

                        this._resolveTileByVizId(oTile, oSite)
                            .done(function (oNewResolvedTile) {
                                oNewResolvedTile.isLink = false; // currently only bookmark tiles can be created
                                this._mResolvedTiles[oTile.id] = oNewResolvedTile;

                                // add tile to the site and save
                                oSite.groups[oGroup.identification.id].payload.tiles.push(oTile);
                                oCdmSiteService.save()
                                    .done(function () {
                                        oDeferred.resolve(oTile);
                                    })
                                    .fail(oDeferred.reject);
                            }.bind(this))
                            .fail(function (sErrorMsg) {
                                // Note: do not add error message to that._mFailedResolvedTiles[oTile.id]
                                // as the tile was not created which makes the cache useless
                                oDeferred.reject("Bookmark creation failed because: " + sErrorMsg);
                            });
                    }.bind(this))
                    .fail(oDeferred.reject);
            }.bind(this));

            return oDeferred.promise();
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
        this.countBookmarks = function (sUrl, sContentProviderId) {
            return this._visitBookmarks(sUrl, undefined, undefined, sContentProviderId);
        };

        /**
         * Counts <b>all</b> custom bookmarks matching exactly the identification data.
         * Can be used to check if a bookmark already exists (e.g. before updating).
         *
         * @param {object} oIdentifier
         *   An object which is used to find the bookmarks by matching the provided properties.
         * @param {string} oIdentifier.url
         *   The URL which was used to create the bookmark using {@link #addCustomBookmark}.
         * @param {string} oIdentifier.vizType
         *   The visualization type (viz type) which was used to create the bookmark using {@link #addCustomBookmark}.
         *
         * @returns {Promise<int>} The count of bookmarks matching the identifier.
         *
         * @see #addCustomBookmark
         * @since 1.83.0
         *
         * @private
         */
        this.countCustomBookmarks = function (oIdentifier) {
            if (!oIdentifier.vizType) {
                return Promise.reject("countCustomBookmarks: Required parameter is missing: oIdentifier.vizType");
            }

            return new Promise(function (resolve, reject) {
                this._visitBookmarks(oIdentifier.url, undefined, oIdentifier.vizType, oIdentifier.contentProviderId).done(resolve).fail(reject);
            }.bind(this));
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
         * @param {string} [sVizType]
         *   (added with 1.83) The visualization type (viz type) which was used to create the bookmark using {@link #addCustomBookmark}.
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
        this.updateBookmarks = function (sUrl, oParameters, sVizType, sContentProviderId) {
            var oCdmSiteService = this.oCDMService;

            var mResolvedTiles = this._mResolvedTiles;

            // Visitor function that updates each encountered bookmark tile as necessary.
            function updateEach (oTile) {
                return new jQuery.Deferred(function (oDeferred) {
                    var oNewTarget;
                    var bTileViewPropertiesChanged = false;
                    var oChangedTileViewProperties = {};

                    if (oParameters.url || oParameters.url === "") {
                        var oIntent = urlParsing.parseShellHash(oParameters.url);
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
                        var oTileComponent = mResolvedTiles[oTile.id].tileComponent;
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
            return this._visitBookmarks(sUrl, updateEach, sVizType, sContentProviderId)
                .then(function (iUpdatedCount) {
                    return oCdmSiteService.save().then(function () {
                        return iUpdatedCount;
                    });
                });
        };

        /**
         * Updates <b>all</b> custom bookmarks matching exactly the identification data.
         * Only given properties are updated.
         * {@link #countCustomBookmarks} can be used to check upfront how many bookmarks are going to be affected.
         * The vizType of the bookmarks <b>cannot be changed!</b>
         *
         * @param {object} oIdentifier
         *   An object which is used to find the bookmarks by matching the provided properties.
         * @param {string} oIdentifier.url
         *   The URL which was used to create the bookmark using {@link #addCustomBookmark}.
         * @param {string} oIdentifier.vizType
         *   The visualization type (viz type) which was used to create the bookmark using {@link #addCustomBookmark}.
         *
         * @param {object} oBookmarkConfig The configuration of the bookmark. See below for the structure.
         * <pre>
         *     {
         *         vizConfig: {
         *             "sap.platform.runtime": {
         *                 includeManifest: true
         *             }
         *         },
         *         url: "#Action-toBookmark?a=b",
         *         title: "My Title",
         *         icon: "sap-icon://world",
         *         subtitle: "My Subtitle",
         *         info: "My Info"
         *     }
         * </pre>
         *
         * @returns {Promise<int>} The count of bookmarks which were updated.
         *
         * @see #addCustomBookmark
         * @see #countCustomBookmarks
         * @since 1.83.0
         *
         * @private
         */
        this.updateCustomBookmarks = function (oIdentifier, oBookmarkConfig) {
            if (!oIdentifier.vizType) {
                return Promise.reject("updateCustomBookmarks: Required parameter is missing: oIdentifier.vizType");
            }

            if (oBookmarkConfig.title === "") {
                return Promise.reject("updateCustomBookmarks: The bookmark title cannot be an empty string");
            }

            if (oBookmarkConfig.url === "") {
                return Promise.reject("updateCustomBookmarks: The bookmark url cannot be an empty string");
            }

            return new Promise(function (resolve, reject) {
                this.updateBookmarks(oIdentifier.url, oBookmarkConfig, oIdentifier.vizType, oIdentifier.contentProviderId).done(resolve).fail(reject);
            }.bind(this));
        };

        /**
         * Deletes <b>all</b> bookmarks pointing to the given URL from all of the user's groups.
         *
         * @param {string} sUrl
         *   The URL of the bookmarks to be deleted, exactly as specified to {@link #addBookmark}.
         * @param {string} [sVizType]
         *   (added with 1.83) The visualization type (viz type) which was used to create the bookmark using {@link #addCustomBookmark}.
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
        this.deleteBookmarks = function (sUrl, sVizType, sContentProviderId) {
            var oCDMService = this.oCDMService;
            var oIntent = urlParsing.parseShellHash(sUrl);
            var oReferenceTarget;

            if (oIntent) {
                // oUrlParser.parseShellHash was successful
                oReferenceTarget = createNewTargetFromIntent(oIntent);
            } else {
                // this is an arbitrary URL as oUrlParser.parseShellHash failed
                oReferenceTarget = createNewTargetFromUrl(sUrl);
            }

            return oCDMService.getSite().then(function (oSite) {
                var oGroups = oSite.groups;

                var iDeletedTiles = Object.keys(oGroups)
                    .map(function (sKey) {
                        var oPayload = oGroups[sKey].payload;
                        var iCountGroupTilesToDelete = 0;

                        oPayload.tiles = oPayload.tiles.filter(function (oTile) {
                            if (oTile.isBookmark
                                && oTile.vizType === sVizType // vizType is only set for custom bookmark tiles.
                                && (oTile.contentProvider || "") === (sContentProviderId || "")
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

                return oCDMService.save().then(function () {
                    return iDeletedTiles;
                });
            });
        };

        /**
         * Deletes <b>all</b> custom bookmarks matching exactly the identification data.
         * {@link #countCustomBookmarks} can be used to check upfront how many bookmarks are going to be affected.
         *
         * @param {object} oIdentifier
         *   An object which is used to find the bookmarks by matching the provided properties.
         * @param {string} oIdentifier.url
         *   The URL which was used to create the bookmark using {@link #addCustomBookmark}.
         * @param {string} oIdentifier.vizType
         *   The visualization type (viz type) which was used to create the bookmark using {@link #addCustomBookmark}.
         *
         * @returns {Promise<int>} The count of bookmarks which were deleted.
         *
         * @see #addCustomBookmark
         * @see #countCustomBookmarks
         * @since 1.83.0
         *
         * @private
         */
        this.deleteCustomBookmarks = function (oIdentifier) {
            if (!oIdentifier.vizType) {
                return Promise.reject("deleteCustomBookmarks: Required parameter is missing: oIdentifier.vizType");
            }

            return new Promise(function (resolve, reject) {
                this.deleteBookmarks(oIdentifier.url, oIdentifier.vizType, oIdentifier.contentProviderId).done(resolve).fail(reject);
            }.bind(this));
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
         * In addition it triggers saving the changes to
         * the personalization delta.
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
            var oDeferred = new jQuery.Deferred();

            if (!oTile || !oTile.id || !oSettingsView) {
                return oDeferred.reject().promise();
            }

            var sNewTitle = oSettingsView.oTitleInput.getValue();
            var sNewSubtitle = oSettingsView.oSubTitleInput.getValue();
            var sNewInfo = oSettingsView.oInfoInput.getValue();
            var sOldTitle = this.getTileTitle(oTile);
            var sOldInfo = this.getTileInfo(oTile);
            var sOldSubtitle = this.getTileSubtitle(oTile);

            // Check whether the end user changed the title or subtitle.
            // If nothing changed, return.
            if (sOldTitle === sNewTitle &&
                sOldSubtitle === sNewSubtitle &&
                sOldInfo === sNewInfo
            ) {
                return oDeferred.resolve().promise();
            }

            var oUpdatedVisualTileProperties = {};
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
                if (oUpdatedVisualTileProperties.title) {
                    this._mResolvedTiles[oTile.id].linkTileControl.setHeader(oUpdatedVisualTileProperties.title);
                }
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
            var aTileActions = [];

            if (this._isGroupTile(oTile) && !this._isFailedGroupTile(oTile)) {
                // Create necessary model for dialog to pass actual properties
                var oModel = new JSONModel({
                    config: {
                        display_title_text: this.getTileTitle(oTile),
                        display_subtitle_text: this.getTileSubtitle(oTile),
                        display_info_text: this.getTileInfo(oTile)
                    }
                });

                // Get tile settings action
                var oTileSettingsAction = oUtils.getTileSettingsAction(oModel, this._onTileSettingsSave.bind(this, oTile), this.getTileType(oTile));
                aTileActions.push(oTileSettingsAction);
            }
            return aTileActions;
        };

        function composeNewBookmarkTile (oParameters, oTarget, sContentProviderId) {
            var oTile = composeNewTile(oParameters, oTarget);

            oTile.isBookmark = true;
            if (sContentProviderId) {
                oTile.contentProvider = sContentProviderId;
            }

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

            if (oParameters.numberUnit || oParameters.numberUnit === "") {
                oTile.numberUnit = oParameters.numberUnit;
            }

            if (oParameters.dataSource) {
                oTile.dataSource = {
                    type: oParameters.dataSource.type,
                    settings: {
                        odataVersion: ObjectPath.get(["dataSource", "settings", "odataVersion"], oParameters)
                    }
                };
            }

            if (oParameters.serviceUrl) {
                oTile.indicatorDataSource = {
                    path: oParameters.serviceUrl
                };
            }

            if (oTile.indicatorDataSource && (oParameters.serviceRefreshInterval || oParameters.serviceRefreshInterval === 0)) {
                oTile.indicatorDataSource.refresh = oParameters.serviceRefreshInterval;
            }

            if (oParameters.vizConfig) {
                oTile.vizConfig = oParameters.vizConfig;
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
            aParameters = aParameters || [];
            aOthers = aOthers || [];

            if (aParameters.length === aOthers.length) {
                var sFirst = transformParameterListToString(aParameters);
                var sOther = transformParameterListToString(aOthers);
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
            return { url: sUrl };
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
                    // sValue maybe undefined.
                    value: sValue || ""
                };
            });
        }

        this._getSiteData = function () {
            var oDeferred = new jQuery.Deferred();

            sap.ushell.Container.getServiceAsync("CommonDataModel").then(function (oCDMService) {
                oCDMService.getSite()
                    .done(oDeferred.resolve)
                    .fail(oDeferred.reject);
            });

            return oDeferred.promise();
        };

        this._addDefaultGroup = function (aGroups, oSite) {
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

            this._oDefaultGroup = oDefaultGroup;
            return aGroups;
        };
    }

    LaunchPageAdapter.prototype = AdapterBase.prototype;

    return LaunchPageAdapter;
});
