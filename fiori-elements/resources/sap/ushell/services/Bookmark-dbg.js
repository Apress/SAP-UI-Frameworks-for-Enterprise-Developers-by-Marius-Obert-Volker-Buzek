// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's bookmark service, which allows you to create shortcuts on the
 * user's home page.
 *
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Config",
    "sap/ushell/library",
    "sap/base/util/deepClone",
    "sap/base/util/deepExtend",
    "sap/base/Log"
], function (
    jQuery,
    Config,
    ushellLibrary,
    deepClone,
    deepExtend,
    Log
) {
    "use strict";

    var sModuleName = "sap.ushell.services.Bookmark";
    var LEGACY_HANA_CATALOG_ID = "X-SAP-UI2-HANA:hana?remoteId=HANA_CATALOG";

    // shortcut for sap.ushell.ContentNodeType
    var ContentNodeType = ushellLibrary.ContentNodeType;

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getServiceAsync("Bookmark").then(function (Bookmark) {});</code>.
     * Constructs a new instance of the bookmark service.
     *
     * @name sap.ushell.services.Bookmark
     *
     * @class The unified shell's bookmark service, which allows you to create shortcuts on the
     * user's home page.
     *
     * @constructor
     * @see sap.ushell.services.Container#getServiceAsync
     * @since 1.15.0
     * @public
     */
    function Bookmark () {
        this._oLaunchPageServicePromise = sap.ushell.Container.getServiceAsync("LaunchPage");

        if (Config.last("/core/spaces/enabled")) {
            this._oPagesServicePromise = sap.ushell.Container.getServiceAsync("Pages");
        }

        /**
         * Adds bookmarks with the provided bookmark data to the specified content nodes.
         *
         * @param {object} oBookmarkParams Parameters which are necessary to create a bookmark
         * @param {sap.ushell.services.Bookmark.ContentNode[]} aContentNodes An array of content nodes to which the bookmark should be added
         * @param {boolean} [bCustom] Whether the bookmark is custom or standard
         * @param {string} [sContentProviderId] The contentProviderId or undefined outside the cFLP
         *
         * @returns {Promise<(void|string)>}
         *  The promise is resolved if the bookmark could be added to all content nodes.
         *  The promise is rejected with an error message if the bookmark couldn't be saved.
         *
         * @see sap.ushell.services.Bookmark#addBookmark
         * @since 1.81
         * @private
         */
        this._addBookmarkToContentNodes = function (oBookmarkParams, aContentNodes, bCustom, sContentProviderId) {
            var aPromises = aContentNodes.map(function (oContentNode) {
                if (oContentNode && oContentNode.hasOwnProperty("type") && oContentNode.isContainer) {
                    switch (oContentNode.type) {
                        case ContentNodeType.Page:
                            return this.addBookmarkToPage(oBookmarkParams, oContentNode.id, sContentProviderId);
                        case ContentNodeType.HomepageGroup:
                            return new Promise(function (resolve, reject) {
                                this._oLaunchPageServicePromise.then(function (LaunchPageService) {
                                    LaunchPageService.getGroupById(oContentNode.id)
                                        .done(resolve)
                                        .fail(reject);
                                });
                            }.bind(this))
                                .then(function (oGroup) {
                                    return this.addBookmarkToHomepageGroup(oBookmarkParams, oGroup, bCustom, sContentProviderId);
                                }.bind(this));
                        default:
                            return Promise.reject("Bookmark Service: The API needs to be called with a valid content node type. '" + oContentNode.type + "' is not supported.");
                    }
                }
                return Promise.reject("Bookmark Service: Not a valid content node.");
            }.bind(this));

            return Promise.all(aPromises);
        };

        /**
         * Adds a bookmark tile to one of the user's classic homepage groups or to multiple provided content nodes.
         *
         * @param {object} oParameters
         *   Bookmark parameters. In addition to title and URL, a bookmark might allow additional
         *   settings, such as an icon or a subtitle. Which settings are supported depends
         *   on the environment in which the application is running. Unsupported parameters will be
         *   ignored.
         *
         * @param {string} oParameters.title
         *   The title of the bookmark.
         * @param {string} oParameters.url
         *   The target URL or intent of the bookmark. If the target application shall run in the current shell, the URL has
         *   to be a valid intent, i.e. in the format like <code>"#SO-Action?P1=a&P2=x&/route?RPV=1"</code>.
         * @param {string} [oParameters.icon]
         *   The optional icon URL of the bookmark (e.g. <code>"sap-icon://home"</code>).
         * @param {string} [oParameters.info]
         *   The information text of the bookmark.
         * @param {string} [oParameters.subtitle]
         *   The subtitle of the bookmark.
         * @param {string} [oParameters.serviceUrl]
         *   The URL to a REST or OData service that provides some dynamic information for the
         *   bookmark.
         * @param {object} [oParameters.dataSource]
         *   Metadata for parameter serviceUrl. Mandatory to specify if parameter serviceURL contains semantic date ranges.
         *   This does not influence the data source of the app itself.
         * @param {string} [oParameters.dataSource.type]
         *   The type of the serviceURL's service. Only "OData" is supported.
         * @param {object} [oParameters.dataSource.settings]
         *   Additional settings for the data source.
         * @param {object} [oParameters.dataSource.settings.odataVersion]
         *   The OData version of parameter serviceURL. Valid values are "2.0" and "4.0".
         * @param {string} [oParameters.serviceRefreshInterval]
         *   The refresh interval for the <code>serviceUrl</code> in seconds.
         * @param {string} [oParameters.numberUnit]
         *   The unit for the number retrieved from <code>serviceUrl</code>.
         * @param {(object|sap.ushell.services.Bookmark.ContentNode|sap.ushell.services.Bookmark.ContentNode[])} [vContainer]
         *   Either a legacy launchpad home page group, one content node or an array of content nodes. (See {@link #getContentNodes})
         *   If not provided, the bookmark will be added to the default group if spaces mode is not active
         *   or to the default page if spaces mode is active.
         * @param {string} [sContentProviderId] The contentProviderId or undefined outside the cFLP
         *
         * @returns {jQuery.Promise}
         *   A <code>jQuery.Promise</code> which resolves on success, but rejects
         *   with a reason-message on failure to add the bookmark to the specified or implied group.
         *   The promise gets resolved if personalization is disabled.
         *
         * @see sap.ushell.services.URLParsing#getShellHash
         * @since 1.15.0
         * @public
         * @alias sap.ushell.services.Bookmark#addBookmark
         */
        this.addBookmark = function (oParameters, vContainer, sContentProviderId) {
            var oDeferred = new jQuery.Deferred();
            var bEnablePersonalization = Config.last("/core/shell/enablePersonalization");
            var bEnableSpace = Config.last("/core/spaces/enabled");
            var bEnableMyHome = Config.last("/core/spaces/myHome/enabled");

            // Ignore call and do not complain if personalization is disabled
            if (!bEnablePersonalization && (!bEnableSpace || !bEnableMyHome)) {
                return oDeferred.resolve().promise();
            }

            this._checkBookmarkParameters(oParameters)
                .then(function () {

                    // Check if no container was provided and we are in spaces mode.
                    if (typeof vContainer === "undefined" && bEnableSpace) {
                        return sap.ushell.Container.getServiceAsync("Menu")
                            .then(function (oMenuService) {
                                return oMenuService.getDefaultSpace();
                            })
                            .then(function (oDefaultSpace) {
                                var oDefaultPage = oDefaultSpace && oDefaultSpace.children && oDefaultSpace.children[0];
                                return oDefaultPage;
                            })
                            .then(function (oContentNode) {
                                return this._addBookmarkToContentNodes(oParameters, [oContentNode], false, sContentProviderId);
                            }.bind(this));
                    }

                    // Check if an old Launchpad Group object was provided instead of a content node
                    if ((typeof vContainer === "undefined" || !vContainer.hasOwnProperty("type")) && !Array.isArray(vContainer)) {
                        return this.addBookmarkToHomepageGroup(oParameters, vContainer, false, sContentProviderId);
                    }

                    // Make sure we always use an array of content nodes
                    var aContentNodes = [].concat(vContainer);

                    return this._addBookmarkToContentNodes(oParameters, aContentNodes, false, sContentProviderId);
                }.bind(this))
                .then(oDeferred.resolve)
                .catch(function (vError) {
                    Log.error("Error during Bookmark creation: ", vError, sModuleName);
                    oDeferred.reject(vError);
                });

            return oDeferred.promise();
        };

        /**
         * Adds a custom bookmark visualization to one or multiple provided content nodes.
         *
         * @param {string} sVizType
         *   Specifies what tile should be created, for example
         *   "ssuite.smartbusiness.abap.tiles.contribution"
         *
         * @param {object} oConfig
         *   Viz type specific configuration including all parameters the visualization needs.
         * @param {string} oConfig.title
         *   Title of the visualization.
         * @param {string} oConfig.url
         *   The URL of the bookmark. If the target application shall run in the Shell, the URL has
         *   to be in the format <code>"#SemanticObject-Action?P1=a&P2=x&/route?RPV=1"</code>.
         * @param {string} [oConfig.subtitle]
         *   Subtitle of the visualization.
         * @param {string} [oConfig.icon]
         *   Icon of the visualization.
         * @param {string} [oConfig.info]
         *   Icon of the visualization.
         * @param {object} oConfig.vizConfig
         *   Can include any app descriptor (manifest.json) namespace the visualization
         *   needs. For example sap.app/datasources.
         * @param {boolean} [oConfig.loadManifest=false]
         *   false: viz config (merged with viz type) represents the full manifest which is injected into UI5 and replaces the manifest of the viz type's component. The latter is not loaded at all.
         *   true: (experimental) Manifest of viz type's component is loaded, oConfig.vizConfig is NOT merged with the component. In future both may be merged!
         *
         * @param {object} [oConfig.chipConfig]
         *   Simplified UI2 CHIP (runtime) model allowing for creation for tiles
         *   based on the ABAP stack. This can be considered as a compatibility feature.
         *   Will end-up in vizConfig/sap.flp/chipConfig.
         * @param {string} [oConfig.chipConfig.chipId]
         *   Specifies what chip is going to be instantiated on the ABAP stack.
         *   The chipId is mandatory when used in a FLP running on ABAP.
         * @param {object} [oConfig.chipConfig.bags]
         *   Simplified model of UI2 bags
         * @param {object} [oConfig.chipConfig.configuration]
         *   UI2 configuration parameters
         *
         * @param {(sap.ushell.services.Bookmark.ContentNode|sap.ushell.services.Bookmark.ContentNode[])} vContentNodes
         *   Either an array of ContentNodes or a single ContentNode in which the Bookmark will be placed.
         * @param {string} [sContentProviderId] The contentProviderId or undefined outside the cFLP
         *
         * @returns {Promise<(void|string)>}
         *   A promise which resolves on success, but rejects
         *   with a reason-message if the bookmark couldn't be created.
         *
         * @since 1.81
         * @private
         * @ui5-restricted ssuite.smartbusiness
         *
         * @alias sap.ushell.services.Bookmark#addCustomBookmark
         */
        this.addCustomBookmark = function (sVizType, oConfig, vContentNodes, sContentProviderId) {
            var oClonedConfig = deepClone(oConfig);
            var oBookmarkConfig = deepExtend(oClonedConfig, {
                vizType: sVizType,
                vizConfig: {
                    "sap.flp": {
                        chipConfig: oClonedConfig.chipConfig
                    },
                    "sap.platform.runtime": {
                        includeManifest: !oClonedConfig.loadManifest
                    }
                }
            });

            delete oBookmarkConfig.chipConfig;
            delete oBookmarkConfig.loadManifest;

            // Make sure we always use an array of content nodes
            var aContentNodes = [].concat(vContentNodes);

            return this._addBookmarkToContentNodes(oBookmarkConfig, aContentNodes, true, sContentProviderId);
        };

        /**
         * Adds a bookmark tile to one of the user's home page groups in the classic homepage mode.
         *
         * @param {object} oParameters
         *   bookmark parameters. In addition to title and URL, a bookmark might allow additional
         *   settings, such as an icon or a subtitle. Which settings are supported depends
         *   on the environment in which the application is running. Unsupported parameters will be
         *   ignored.
         *
         * @param {string} oParameters.title
         *   The title of the bookmark.
         * @param {string} oParameters.url
         *   The URL of the bookmark. If the target application shall run in the Shell the URL has
         *   to be in the format <code>"#SO-Action~Context?P1=a&P2=x&/route?RPV=1"</code>.
         * @param {string} [oParameters.icon]
         *   The optional icon URL of the bookmark (e.g. <code>"sap-icon://home"</code>).
         * @param {string} [oParameters.info]
         *   The optional information text of the bookmark. This property is not relevant in the CDM
         *   context.
         * @param {string} [oParameters.subtitle]
         *   The optional subtitle of the bookmark.
         * @param {string} [oParameters.serviceUrl]
         *   The URL to a REST or OData service that provides some dynamic information for the
         *   bookmark.
         * @param {string} [oParameters.serviceRefreshInterval]
         *   The refresh interval for the <code>serviceUrl</code> in seconds.
         * @param {string} [oParameters.numberUnit]
         *   The unit for the number retrieved from <code>serviceUrl</code>.
         *   This property is not relevant in the CDM context.
         * @param {object} [oGroup]
         *  Optional reference to the group the bookmark tile should be added to.
         *  If not given, the default group is used.
         * @param {boolean} [bCustom] Whether the bookmark is custom or standard
         * @param {string} [sContentProviderId] The contentProviderId or undefined outside the cFLP
         *
         * @returns {Promise}
         *   A promise which resolves on success, but rejects
         *   with a reason-message on failure to add the bookmark to the specified homepage group.
         *
         * @see sap.ushell.services.URLParsing#getShellHash
         * @since 1.81.0
         * @private
         * @alias sap.ushell.services.Bookmark#addBookmarkToHomepageGroup
         */
        this.addBookmarkToHomepageGroup = function (oParameters, oGroup, bCustom, sContentProviderId) {
            // Reject if in launchpad spaces mode
            if (Config.last("/core/spaces/enabled")) {
                var sError = "Bookmark Service: The API is not available in spaces mode.";
                return Promise.reject(sError);
            }

            // Delegate to launchpage service and publish event
            return new Promise(function (resolve, reject) {
                this._oLaunchPageServicePromise.then(function (LaunchPageService) {
                    var oDeferred;

                    if (bCustom) {
                        oDeferred = LaunchPageService.addCustomBookmark(oParameters, oGroup, sContentProviderId);
                    } else {
                        oDeferred = LaunchPageService.addBookmark(oParameters, oGroup, sContentProviderId);
                    }

                    oDeferred
                        .done(function (oTile) {
                            var oData = {
                                tile: oTile,
                                group: oGroup
                            };
                            sap.ui.getCore().getEventBus().publish("sap.ushell.services.Bookmark", "bookmarkTileAdded", oData);
                            resolve();
                        })
                        .fail(reject);
                });
            }.bind(this));
        };

        /**
         * Adds a bookmark tile to one of the user's pages in spaces mode.
         *
         * @param {object} oParameters
         *   bookmark parameters. In addition to title and URL, a bookmark might allow additional
         *   settings, such as an icon or a subtitle. Which settings are supported depends
         *   on the environment in which the application is running. Unsupported parameters will be
         *   ignored.
         *
         * @param {string} oParameters.title
         *   The title of the bookmark.
         * @param {string} oParameters.url
         *   The URL of the bookmark. If the target application shall run in the Shell the URL has
         *   to be in the format <code>"#SO-Action~Context?P1=a&P2=x&/route?RPV=1"</code>.
         * @param {string} [oParameters.icon]
         *   The optional icon URL of the bookmark (e.g. <code>"sap-icon://home"</code>).
         * @param {string} [oParameters.info]
         *   The optional information text of the bookmark. This property is not relevant in the CDM
         *   context.
         * @param {string} [oParameters.subtitle]
         *   The optional subtitle of the bookmark.
         * @param {string} [oParameters.serviceUrl]
         *   The URL to a REST or OData service that provides some dynamic information for the
         *   bookmark.
         * @param {string} [oParameters.serviceRefreshInterval]
         *   The refresh interval for the <code>serviceUrl</code> in seconds.
         * @param {string} [oParameters.numberUnit]
         *   The unit for the number retrieved from <code>serviceUrl</code>.
         *   This property is not relevant in the CDM context.
         * @param {string} sPageId The ID of the page to which the bookmark should be added.
         * @param {string} [sContentProviderId] The contentProviderId or undefined outside the cFLP
         *
         * @returns {Promise}
         *   A promise which resolves on success, but rejects
         *   with a reason-message on failure to add the bookmark to the specified page.
         *
         * @see sap.ushell.services.URLParsing#getShellHash
         * @since 1.75.0
         * @private
         * @alias sap.ushell.services.Bookmark#addBookmarkToPage
         */
        this.addBookmarkToPage = function (oParameters, sPageId, sContentProviderId) {
            // Reject of in launchpad homepage mode
            if (!Config.last("/core/spaces/enabled")) {
                return Promise.reject("Bookmark Service: 'addBookmarkToPage' is not valid in launchpad homepage mode, use 'addBookmark' instead.");
            }

            // Reject if personalization is disabled
            var bEnablePersonalization = Config.last("/core/shell/enablePersonalization");
            var bEnableMyHome = Config.last("/core/spaces/myHome/enabled");
            var sMyHomePageId = Config.last("/core/spaces/myHome/myHomePageId");
            if (!bEnablePersonalization && (!bEnableMyHome || (bEnableMyHome && sPageId !== sMyHomePageId))) {
                return Promise.reject("Bookmark Service: Add bookmark is not allowed as the personalization functionality is not enabled.");
            }

            if (oParameters && (typeof oParameters.title !== "string" || typeof oParameters.url !== "string")) {
                return Promise.reject("Bookmark Service - Invalid bookmark data.");
            }

            // Delegate to pages service
            return this._oPagesServicePromise.then(function (oPagesService) {
                return oPagesService.addBookmarkToPage(sPageId, oParameters, undefined, sContentProviderId);
            });
        };

        /**
         * Adds a bookmark tile to one of the user's home page groups by group id.
         *
         * @param {object} oParameters
         *   bookmark parameters. In addition to title and URL, a bookmark might allow additional
         *   settings, such as an icon or a subtitle. Which settings are supported depends
         *   on the environment in which the application is running. Unsupported parameters will be
         *   ignored.
         *   For list of parameters see the description for the addBookmark function
         * @param {string} [groupId]
         *   ID of the group the bookmark tile should be added to.
         *
         * @returns {jQuery.Promise}
         *   A <code>jQuery.Promise</code> which resolves on success, but rejects
         *   (with a reason-message) on failure to add the bookmark to the specified or implied group.
         *    In launchpad spaces mode the promise gets rejected.
         *
         * @see sap.ushell.services.URLParsing#getShellHash
         * @since 1.66.0
         * @private
         * @alias sap.ushell.services.Bookmark#addBookmarkByGroupId
         */
        this.addBookmarkByGroupId = function (oParameters, groupId, sContentProviderId) {
            // Reject if in launchpad spaces mode
            var oDeferred = new jQuery.Deferred();
            if (Config.last("/core/spaces/enabled")) {
                var sError = "Bookmark Service: The API 'addBookmarkByGroupId' is not supported in launchpad spaces mode.";
                return oDeferred.reject(sError).promise();
            }

            this._oLaunchPageServicePromise
                .then(function (LaunchPageService) {
                    LaunchPageService.getGroups()
                        .done(function (aGroups) {
                            var oGroup = aGroups.find(function (entry) {
                                return entry.id === groupId;
                            }) || null;

                            this.addBookmark(oParameters, oGroup, sContentProviderId)
                                .done(oDeferred.resolve)
                                .fail(oDeferred.reject);
                        }.bind(this))
                        .fail(oDeferred.reject);
                }.bind(this))
                .catch(oDeferred.reject);

            return oDeferred.promise();
        };

        /**
         * Returns the list of group ids and their titles of the user together with filtering out all groups that can not
         * be selected when adding a bookmark.
         * In case of success, the <code>done</code> function gets an array of 'anonymous' groupId-title objects.
         * The order of the array is the order in which the groups will be displayed to the user.
         * the API is used from "AddBookmarkButton" by not native UI5 applications
         *
         * @param {boolean} bGetAll If set to `true`, all groups, including locked groups, are returned.
         * @returns {jQuery.Promise} A promise that resolves to the list of groups. In launchpad spaces mode the promise gets rejected.
         *
         * @since 1.66.0
         * @private
         * @alias sap.ushell.services.Bookmark#getGroupsIdsForBookmarks
         */
        this.getShellGroupIDs = function (bGetAll) {
            var oDeferred = new jQuery.Deferred();

            // Reject if in launchpad spaces mode
            if (Config.last("/core/spaces/enabled")) {
                var sError = "Bookmark Service: The API 'getShellGroupIDs' is not supported in launchpad spaces mode.";

                return oDeferred.reject(sError).promise();
            }

            this._oLaunchPageServicePromise.then(function (LaunchPageService) {
                LaunchPageService.getGroupsForBookmarks(bGetAll)
                    .done(function (aGroups) {
                        aGroups = aGroups.map(function (group) {
                            return {
                                id: LaunchPageService.getGroupId(group.object),
                                title: group.title
                            };
                        });

                        oDeferred.resolve(aGroups);
                    })
                    .fail(oDeferred.reject);
            });

            return oDeferred.promise();
        };

        /**
         * Adds the tile with the given id <code>sCatalogTileId</code> from the catalog with id
         * <code>sCatalogId</code> to the given group.
         * @param {jQuery.Deferred} oDeferred A deferred object to be resolved/rejected when finished. In case of success, no
         *   further details are passed. In case of failure, an error message is passed.
         * @param {string} sCatalogTileId The ID of the tile within the catalog
         * @param {object} oCatalog The catalog containing the catalog tile
         * @param {string} [sGroupId] The id of the group. If not given, the tile is added to the default group
         * @returns {jQuery.Promise} A <code>jQuery.Promise</code> which is resolved once tile has been added to the given group.
         *
         * @private
         */
        this._doAddCatalogTileToGroup = function (oDeferred, sCatalogTileId, oCatalog, sGroupId) {
            this._oLaunchPageServicePromise
                .then(function (LaunchPageService) {
                    if (sGroupId) {
                        LaunchPageService.getGroups()
                            .fail(oDeferred.reject)
                            .done(function (aGroups) {
                                var bGroupFound = aGroups.some(function (oGroup) {
                                    if (LaunchPageService.getGroupId(oGroup) === sGroupId) {
                                        this._addToGroup(oCatalog, oDeferred, sCatalogTileId, oGroup);
                                        return true;
                                    }
                                }.bind(this));

                                if (!bGroupFound) {
                                    // TODO: Consider adding the tile to the default group. This would
                                    // enable the user to add tiles if no valid group ID is available.
                                    // Take into account how the consumer app requests the group ids.
                                    var sError = "Group '" + sGroupId + "' is unknown";
                                    Log.error(sError, null, "sap.ushell.services.Bookmark");
                                    oDeferred.reject(sError);
                                }
                            }.bind(this));
                    } else {
                        LaunchPageService.getDefaultGroup()
                            .fail(oDeferred.reject)
                            .done(function (oGroup) {
                                this._addToGroup(oCatalog, oDeferred, sCatalogTileId, oGroup);
                            }.bind(this));
                    }
                }.bind(this));

            return oDeferred.promise();
        };

        this._isSameCatalogTile = function (sCatalogTileId, oCatalogTile, oLaunchPageService) {
            var sIdWithPotentialSuffix = oLaunchPageService.getCatalogTileId(oCatalogTile);

            if (sIdWithPotentialSuffix === undefined) {
                // prevent to call undefined.indexOf.
                // assumption is that undefined is not a valid ID, so it is not the same tile. Thus false is returned.
                return false;
            }
            // getCatalogTileId appends the system alias of the catalog if present.
            // This must be considered when comparing the IDs.
            // see BCP 0020751295 0000142292 2017
            return sIdWithPotentialSuffix.indexOf(sCatalogTileId) === 0;
        };

        this._addToGroup = function (oCatalog, oDeferred, sCatalogTileId, oGroup) {
            return this._oLaunchPageServicePromise
                .then(function (LaunchPageService) {
                    LaunchPageService.getCatalogTiles(oCatalog)
                        .fail(oDeferred.reject)
                        .done(function (aCatalogTiles) {
                            var sGroupId = LaunchPageService.getGroupId(oGroup);
                            var bTileFound = aCatalogTiles.some(function (oCatalogTile) {
                                if (this._isSameCatalogTile(sCatalogTileId, oCatalogTile, LaunchPageService)) {
                                    LaunchPageService.addTile(oCatalogTile, oGroup)
                                        .fail(oDeferred.reject)
                                        .done(function () { // ignore argument oTile!
                                            oDeferred.resolve();
                                            sap.ui.getCore().getEventBus().publish("sap.ushell.services.Bookmark", "catalogTileAdded", sGroupId);
                                        });
                                    return true;
                                }
                            }.bind(this));

                            if (!bTileFound) {
                                var sError = "No tile '" + sCatalogTileId + "' in catalog '"
                                    + LaunchPageService.getCatalogId(oCatalog) + "'";
                                Log.error(sError, null, "sap.ushell.services.Bookmark");
                                oDeferred.reject(sError);
                            }
                        }.bind(this));
                }.bind(this));
        };

        /**
         * Adds the catalog tile with the given ID to given group. The catalog tile is looked up in
         * the legacy SAP HANA catalog unless data to look up a remote catalog is provided.
         *
         * @param {string} sCatalogTileId
         *   The ID of the tile within the catalog
         * @param {string} [sGroupId]
         *   The id of the group. If not given, the tile is added to the default group
         * @param {object} [oCatalogData]
         *   The data to identify the catalog containing the tile with the given ID
         * @param {string} oCatalogData.baseUrl
         *   The remote catalog's base URL such as
         *   "/sap/hba/apps/kpi/s/odata/hana_chip_catalog.xsodata/"
         * @param {string} oCatalogData.remoteId
         *   The remote catalog's id on the remote system such as "HANA_CATALOG"
         * @returns {jQuery.Promise}
         *   A <code>jQuery.Promise</code> which informs about success or failure
         *   of this asynchronous operation. In case of success, no further details are passed.
         *   In case of failure, an error message is passed.
         *   In launchpad spaces mode the promise gets rejected.
         *
         * @since 1.21.2
         * @public
         * @deprecated since 1.112. Please use {@link #addBookmark} instead.
         * @alias sap.ushell.services.Bookmark#addCatalogTileToGroup
         */
        this.addCatalogTileToGroup = function (sCatalogTileId, sGroupId, oCatalogData) {
            var oDeferred = new jQuery.Deferred();
            var sError;

            Log.error("Deprecated API call of 'sap.ushell.Bookmark.addCatalogTileToGroup'. Please use 'addBookmark' instead",
                null,
                "sap.ushell.services.Bookmark"
            );

            // Reject if in launchpad spaces mode
            if (Config.last("/core/spaces/enabled")) {
                sError = "Bookmark Service: The API 'addCatalogTileToGroup' is not supported in launchpad spaces mode.";
                return oDeferred.reject(sError).promise();
            }

            this._oLaunchPageServicePromise
                .then(function (LaunchPageService) {
                    var fnMatcher = oCatalogData ? this._isMatchingRemoteCatalog : this._isLegacyHANACatalog;

                    oCatalogData = oCatalogData || { id: LEGACY_HANA_CATALOG_ID };
                    // TODO first determine the catalog, then call onCatalogTileAdded incl. its ID
                    LaunchPageService.onCatalogTileAdded(sCatalogTileId);
                    LaunchPageService.getCatalogs()
                        .fail(oDeferred.reject)
                        .done(function (aCatalogs) {
                            var oSourceCatalog;
                            aCatalogs.forEach(function (oCatalog) {
                                if (fnMatcher(oCatalog, oCatalogData, LaunchPageService)) {
                                    if (!oSourceCatalog) {
                                        oSourceCatalog = oCatalog;
                                    } else {
                                        // Note: We use the first match. If more than one catalog matches
                                        // this might be the wrong one, resulting in a "missing tile"
                                        // error. However we log the multiple catalog match before.
                                        Log.warning("More than one matching catalog: " + JSON.stringify(oCatalogData), null, "sap.ushell.services.Bookmark");
                                    }
                                }
                            });
                            if (oSourceCatalog) {
                                this._doAddCatalogTileToGroup(oDeferred, sCatalogTileId, oSourceCatalog, sGroupId);
                            } else {
                                sError = "No matching catalog found: " + JSON.stringify(oCatalogData);
                                Log.error(sError, null, "sap.ushell.services.Bookmark");
                                oDeferred.reject(sError);
                            }
                        }.bind(this));
                }.bind(this));

            return oDeferred.promise();
        };

        /**
         * Check if the bookmark parameters are valid.
         *
         * @param {object} oParameters The bookmark parameters
         * @returns {Promise<undefined>} Rejects with an error message if invalid bookmark data is found.
         *
         * @since 1.112
         * @private
         */
        this._checkBookmarkParameters = function (oParameters) {
            return Promise.resolve()
                .then(function () {

                    if (!oParameters) {
                        throw new Error("Invalid Bookmark Data: No bookmark parameters passed.");
                    }

                    var oDataSource = oParameters.dataSource;
                    var sODataVersion;
                    if (oDataSource) {
                        if (oDataSource.type !== "OData") {
                            throw new Error("Invalid Bookmark Data: Unknown data source type: " + oDataSource.type);
                        }

                        sODataVersion = oDataSource.settings && oDataSource.settings.odataVersion;
                        var aValidODataVersions = ["2.0", "4.0"];
                        if (!aValidODataVersions.includes(sODataVersion)) {
                            throw new Error("Invalid Bookmark Data: Unknown OData version in the data source: " + sODataVersion);
                        }
                    }

                    if (oParameters.serviceUrl) {
                        return sap.ushell.Container.getServiceAsync("ReferenceResolver")
                            .then(function (oReferenceResolver) {
                                if (oReferenceResolver.hasSemanticDateRanges(oParameters.serviceUrl) && !oDataSource) {
                                    throw new Error("Invalid Bookmark Data: Provide a data source to use semantic date ranges.");
                                }
                            });
                    }
                });
        };

        /**
         * Returns <code>true</code> if the given catalog data matches a remote catalog. This
         * requires that the LaunchPageAdapter supports getCatalogData().
         * @param {object} oCatalog
         *   a catalog as given from LaunchPage service
         * @param {object} oRemoteCatalogData
         *   the description of the catalog from a remote system
         * @param {string} oRemoteCatalogData.remoteId
         *   the catalog ID in the remote system
         * @param {string} oRemoteCatalogData.baseUrl
         *   the base URL of the catalog in the remote system
         *
         * @returns {boolean} Resolves to true if the given catalog data matches a remote catalog, otherwise it resolves to false.
         * @static
         * @private
         */
        this._isMatchingRemoteCatalog = function (oCatalog, oRemoteCatalogData, LaunchPageService) {
            var oCatalogData = LaunchPageService.getCatalogData(oCatalog);

            // systemAlias is not considered yet, which might lead to multiple matches
            return oCatalogData.remoteId === oRemoteCatalogData.remoteId
                && oCatalogData.baseUrl.replace(/\/$/, "") === oRemoteCatalogData.baseUrl.replace(/\/$/, ""); // ignore trailing slashes
        };

        this._isLegacyHANACatalog = function (oCatalog, oRemoteCatalogData, LaunchPageService) {
            // this is ABAP specific but should not harm other platforms
            return LaunchPageService.getCatalogId(oCatalog) === LEGACY_HANA_CATALOG_ID;
        };

        /**
         * Counts <b>all</b> bookmarks pointing to the given URL from all of the user's pages. You
         * can use this method to check if a bookmark already exists.
         * <p>
         * This is a potentially asynchronous operation in case the user's pages have not yet been
         * loaded completely!
         *
         * @param {string} sUrl
         *   The URL of the bookmarks to be counted, exactly as specified to {@link #addBookmark}.
         *
         * @returns {jQuery.Promise}
         *   A <code>jQuery.Promise</code> which informs about success or failure
         *   of this asynchronous operation. In case of success, the count of existing bookmarks
         *   is provided (which might be zero). In case of failure, an error message is passed.
         * @see #addBookmark
         * @since 1.17.1
         * @public
         * @alias sap.ushell.services.Bookmark#countBookmarks
         */
        this.countBookmarks = function (sUrl, sContentProviderId) {
            var oDeferred = new jQuery.Deferred();

            if (Config.last("/core/spaces/enabled")) {
                this._oPagesServicePromise
                    .then(function (oPagesService) {
                        return oPagesService.countBookmarks({ url: sUrl, contentProviderId: sContentProviderId });
                    })
                    .then(oDeferred.resolve, oDeferred.reject);

            } else {
                this._oLaunchPageServicePromise
                    .then(function (LaunchPageService) {
                        LaunchPageService.countBookmarks(sUrl, sContentProviderId)
                            .done(oDeferred.resolve)
                            .fail(oDeferred.reject);
                    });
            }

            return oDeferred.promise();
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
         *   The viz type is only used by the FLP running on CDM.
         * @param {string} [oIdentifier.chipId]
         *   The chipId which was used to create the bookmark using {@link #addCustomBookmark}.
         *   The chipId is mandatory when used in a FLP running on ABAP.
         *
         * @returns {Promise<int>} The count of bookmarks matching the identifier.
         *
         * @see #addCustomBookmark
         * @since 1.83.0
         *
         * @private
         * @ui5-restricted ssuite.smartbusiness
         *
         * @alias sap.ushell.services.Bookmark#countCustomBookmarks
         */
        this.countCustomBookmarks = function (oIdentifier) {
            if (!oIdentifier || !oIdentifier.url || !oIdentifier.vizType) {
                return Promise.reject("countCustomBookmarks: Some required parameters are missing.");
            }

            if (Config.last("/core/spaces/enabled")) {
                return this._oPagesServicePromise
                    .then(function (oPagesService) {
                        return oPagesService.countBookmarks(oIdentifier);
                    });
            }

            return this._oLaunchPageServicePromise
                .then(function (LaunchPageService) {
                    return LaunchPageService.countCustomBookmarks(oIdentifier);
                });
        };

        /**
         * Deletes <b>all</b> bookmarks pointing to the given URL from all of the user's pages.
         *
         * @param {string} sUrl
         *   The URL of the bookmarks to be deleted, exactly as specified to {@link #addBookmark}.
         * @param {string} [sContentProviderId] The contentProviderId or undefined outside the cFLP
         *
         * @returns {jQuery.Promise}
         *   A <code>jQuery.Promise</code> which informs about success or
         *   failure of this asynchronous operation. In case of success, the number of deleted
         *   bookmarks is provided (which might be zero). In case of failure, an error message is
         *   passed.
         *
         * @see #addBookmark
         * @see #countBookmarks
         * @since 1.17.1
         * @public
         * @alias sap.ushell.services.Bookmark#deleteBookmarks
         */
        this.deleteBookmarks = function (sUrl, sContentProviderId) {
            var oDeferred = new jQuery.Deferred();

            if (Config.last("/core/spaces/enabled")) {
                this._oPagesServicePromise
                    .then(function (oPagesService) {
                        return oPagesService.deleteBookmarks({ url: sUrl, contentProviderId: sContentProviderId });
                    })
                    .then(oDeferred.resolve, oDeferred.reject);
            } else {
                this._oLaunchPageServicePromise.then(function (LaunchPageService) {
                    LaunchPageService.deleteBookmarks(sUrl, sContentProviderId)
                        .done(function (oResult) {
                            sap.ui.getCore().getEventBus().publish("sap.ushell.services.Bookmark", "bookmarkTileDeleted", sUrl);

                            oDeferred.resolve(oResult);
                        })
                        .fail(oDeferred.reject);
                });
            }

            return oDeferred.promise();
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
         * @param {string} [oIdentifier.chipId]
         *   The chipId which was used to create the bookmark using {@link #addCustomBookmark}.
         *   The chipId is mandatory when used in a FLP running on ABAP.
         *
         * @returns {Promise<int>} The count of bookmarks which were deleted.
         *
         * @see #addCustomBookmark
         * @see #countCustomBookmarks
         * @since 1.83.0
         *
         * @private
         * @ui5-restricted ssuite.smartbusiness
         *
         * @alias sap.ushell.services.Bookmark#deleteCustomBookmarks
         */
        this.deleteCustomBookmarks = function (oIdentifier) {
            if (!oIdentifier || !oIdentifier.url || !oIdentifier.vizType) {
                return Promise.reject("deleteCustomBookmarks: Some required parameters are missing.");
            }
            if (Config.last("/core/spaces/enabled")) {
                return this._oPagesServicePromise
                    .then(function (oPagesService) {
                        return oPagesService.deleteBookmarks(oIdentifier);
                    });
            }

            return this._oLaunchPageServicePromise
                .then(function (LaunchPageService) {
                    return LaunchPageService.deleteCustomBookmarks(oIdentifier);
                })
                .then(function () {
                    sap.ui.getCore().getEventBus().publish("sap.ushell.services.Bookmark", "bookmarkTileDeleted", oIdentifier.url);
                });
        };

        /**
         * Updates <b>all</b> bookmarks pointing to the given URL on all of the user's pages
         * with the given new parameters. Parameters which are omitted are not changed in the
         * existing bookmarks.
         *
         * @param {string} sUrl
         *   The URL of the bookmarks to be updated, exactly as specified to {@link #addBookmark}.
         *   In case you need to update the URL itself, pass the old one here and the new one as
         *   <code>oParameters.url</code>!
         * @param {object} oParameters
         *   The bookmark parameters as documented in {@link #addBookmark}.
         * @param {string} [sContentProviderId] The contentProviderId or undefined outside the cFLP
         * @returns {jQuery.Promise}
         *   A <code>jQuery.Promise</code> which informs about success or
         *   failure of this asynchronous operation. In case of success, the number of updated
         *   bookmarks is provided (which might be zero). In case of failure, an error message is
         *   passed.
         *
         * @see #addBookmark
         * @see #countBookmarks
         * @see #deleteBookmarks
         * @since 1.17.1
         * @public
         * @alias sap.ushell.services.Bookmark#updateBookmarks
         */
        this.updateBookmarks = function (sUrl, oParameters, sContentProviderId) {
            var oDeferred = new jQuery.Deferred();

            if (Config.last("/core/spaces/enabled")) {
                this._oPagesServicePromise
                    .then(function (oPagesService) {
                        return oPagesService.updateBookmarks({ url: sUrl, contentProviderId: sContentProviderId }, oParameters);
                    })
                    .then(oDeferred.resolve, oDeferred.reject);
            } else {
                this._oLaunchPageServicePromise
                    .then(function (LaunchPageService) {
                        LaunchPageService.updateBookmarks(sUrl, oParameters, sContentProviderId)
                            .done(oDeferred.resolve)
                            .fail(oDeferred.reject);
                    });
            }

            return oDeferred.promise();
        };

        /**
         * Updates <b>all</b> custom bookmarks matching exactly the identification data.
         * Only given properties are updated.
         * {@link #countCustomBookmarks} can be used to check upfront how many bookmarks are going to be affected.
         * The vizType as well as the chipId of the bookmarks <b>cannot be changed!</b>
         *
         * @param {object} oIdentifier
         *   An object which is used to find the bookmarks by matching the provided properties.
         * @param {string} oIdentifier.url
         *   The URL which was used to create the bookmark using {@link #addCustomBookmark}.
         * @param {string} oIdentifier.vizType
         *   The visualization type (viz type) which was used to create the bookmark using {@link #addCustomBookmark}.
         * @param {string} [oIdentifier.chipId]
         *   The chipId which was used to create the bookmark using {@link #addCustomBookmark}.
         *   The chipId is mandatory when used in a FLP running on ABAP.
         *
         *  @param {object} oConfig
         *   Viz type specific configuration including all parameters the visualization needs.
         * @param {string} oConfig.title
         *   Title of the visualization.
         * @param {string} oConfig.url
         *   The URL of the bookmark. If the target application shall run in the Shell, the URL has
         *   to be in the format <code>"#SemanticObject-Action?P1=a&P2=x&/route?RPV=1"</code>.
         * @param {string} [oConfig.subtitle]
         *   Subtitle of the visualization.
         * @param {string} [oConfig.icon]
         *   Icon of the visualization.
         * @param {string} [oConfig.info]
         *   Icon of the visualization.
         * @param {object} oConfig.vizConfig
         *   Can include any app descriptor (manifest.json) namespace the visualization
         *   needs. For example sap.app/datasources.
         * @param {boolean} [oConfig.loadManifest=false]
         *   false: viz config (merged with viz type) represents the full manifest which is injected into UI5 and replaces the manifest of the viz type's component. The latter is not loaded at all.
         *   true: (experimental) Manifest of viz type's component is loaded, oConfig.vizConfig is NOT merged with the component. In future both may be merged!
         *
         * @param {object} [oConfig.chipConfig]
         *   Simplified UI2 CHIP (runtime) model allowing for creation for tiles based on the ABAP stack.
         *   This can be considered as a compatibility feature. Will end-up in vizConfig/sap.flp/chipConfig.
         *   In case of errors during the update there are no rollbacks happening. This might lead to corrupt bookmarks.
         * @param {object} [oConfig.chipConfig.bags]
         *   Simplified model of UI2 bags
         * @param {object} [oConfig.chipConfig.configuration]
         *   UI2 configuration parameters
         *
         *
         * @returns {Promise<int>} The count of bookmarks which were updated.
         *
         * @see #addCustomBookmark
         * @see #countCustomBookmarks
         * @since 1.83.0
         *
         * @private
         * @ui5-restricted ssuite.smartbusiness
         *
         * @alias sap.ushell.services.Bookmark#updateCustomBookmarks
         */
        this.updateCustomBookmarks = function (oIdentifier, oConfig) {
            if (!oIdentifier || !oIdentifier.url || !oIdentifier.vizType) {
                return Promise.reject("deleteCustomBookmarks: Some required parameters are missing.");
            }

            var oBookmarkConfig = deepExtend({}, oConfig, {
                vizConfig: {
                    "sap.flp": {
                        chipConfig: oConfig.chipConfig
                    },
                    "sap.platform.runtime": {
                        includeManifest: !oConfig.loadManifest
                    }
                }
            });

            delete oBookmarkConfig.chipConfig;
            delete oBookmarkConfig.loadManifest;

            if (Config.last("/core/spaces/enabled")) {
                return this._oPagesServicePromise
                    .then(function (oPagesService) {
                        return oPagesService.updateBookmarks(oIdentifier, oBookmarkConfig);
                    });
            }

            return this._oLaunchPageServicePromise
                .then(function (LaunchPageService) {
                    return LaunchPageService.updateCustomBookmarks(oIdentifier, oBookmarkConfig);
                });
        };

        /**
         * @typedef {object} sap.ushell.services.Bookmark.ContentNode
         *  A content node may be:
         *   - a classic homepage group
         *   - an unselectable node (space) or a selectable node (page) in spaces mode
         *   - or any other containers in the future
         *
         * @property {string} id ID of the content node
         * @property {string} label Human-readable representation of a content node which can be displayed in a control
         * @property {sap.ushell.ContentNodeType} type Specifies the content node type. E.g: space, page, group, etc. See {@link sap.ushell.sap.ushell.services.Bookmark.ContentNodeType}
         * @property {boolean} isContainer Specifies if a bookmark can be added
         * @property {sap.ushell.services.Bookmark.ContentNode[]} [children] Specifies sub-nodes
         * @public
         */

        /**
         * Returns available content nodes based on the current launchpad context. (Classic homepage, spaces mode)
         *
         * A content node may be:
         * <ul>
         * <li>a classic homepage group</li>
         * <li>an unselectable node (space) or a selectable node (page) in spaces mode</li>
         * <li>or any other containers in the future</li>
         * </ul>
         *
         * It has the following properties:
         * <ul>
         * <li>id: ID of the content node</li>
         * <li>label: Human-readable representation of a content node which can be displayed in a control</li>
         * <li>type: Specifies the content node type. E.g: space, page, group, etc. See {@link sap.ushell.ContentNodeType}</li>
         * <li>isContainer: Specifies if a bookmark can be added</li>
         * <li>children: Specifies sub-nodes</li>
         * <ul>
         *
         * @returns {Promise<sap.ushell.services.Bookmark.ContentNode[]>} Promise resolving the currently available content nodes.
         *
         * @public
         * @since 1.81
         * @alias sap.ushell.services.Bookmark#getContentNodes
         */
        this.getContentNodes = function () {
            // Spaces mode
            if (Config.last("/core/spaces/enabled")) {
                return sap.ushell.Container.getServiceAsync("Menu")
                    .then(function (oMenuService) {
                        return oMenuService.getContentNodes();
                    });
            }

            // Classic homepage
            return new Promise(function (resolve, reject) {
                this._oLaunchPageServicePromise
                    .then(function (LaunchPageService) {
                        LaunchPageService.getGroupsForBookmarks()
                            .done(function (aHomepageGroups) {
                                var aResults = aHomepageGroups.map(function (oBookmarkGroup) {
                                    return {
                                        id: LaunchPageService.getGroupId(oBookmarkGroup.object),
                                        label: oBookmarkGroup.title,
                                        type: ContentNodeType.HomepageGroup,
                                        isContainer: true
                                    };
                                });

                                resolve(aResults);
                            })
                            .fail(reject);
                    });
            }.bind(this));
        };
    }

    Bookmark.hasNoAdapter = true;
    return Bookmark;
}, true /* bExport */);
