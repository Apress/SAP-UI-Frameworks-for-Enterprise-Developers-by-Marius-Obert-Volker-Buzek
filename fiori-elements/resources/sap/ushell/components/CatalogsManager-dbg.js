// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/core/Core",
    "sap/ushell/ui/launchpad/TileState",
    "sap/ushell/EventHub",
    "sap/ushell/utils",
    "sap/ushell/components/DestroyHelper",
    "sap/ushell/components/GroupsHelper",
    "sap/ushell/components/MessagingHelper",
    "sap/ushell/components/HomepageManager",
    "sap/ushell/resources",
    "sap/ui/thirdparty/jquery",
    "sap/ui/performance/Measurement",
    "sap/base/Log",
    "sap/ushell/Config"
], function (
    BaseObject,
    Core,
    TileState,
    oEventHub,
    oUtils,
    oDestroyHelper,
    oGroupsHelper,
    oMessagingHelper,
    HomepageManager,
    resources,
    jQuery,
    Measurement,
    Log,
    Config
) {
    "use strict";

    var oCatalogsManagerInstance;
    var CatalogsManager = BaseObject.extend("sap.ushell.components.CatalogsManager", {
        metadata: {
            publicMethods: [
                "createGroup",
                "createGroupAndSaveTile",
                "createTile",
                "deleteCatalogTileFromGroup",
                "notifyOnActionFailure",
                "resetAssociationOnFailure"
            ]
        },
        analyticsConstants: {
            PERSONALIZATION: "FLP: Personalization",
            RENAME_GROUP: "FLP: Rename Group",
            MOVE_GROUP: "FLP: Move Group",
            DELETE_GROUP: "FLP: Delete Group",
            RESET_GROUP: "FLP: Reset Group",
            DELETE_TILE: "FLP: Delete Tile",
            ADD_TILE: "FLP: Add Tile",
            MOVE_TILE: "FLP: Move Tile"
        },

        _aDoables: [],

        constructor: function (sId, mSettings) {
            this.oLaunchPageServicePromise = sap.ushell.Container.getServiceAsync("LaunchPage").then(function (oLaunchPageService) {
                this.oLaunchPageService = oLaunchPageService;
            }.bind(this));

            //TODO should be removed when AppFinder and Homepage use separate model
            this.oTileCatalogToGroupsMap = {};
            this.tagsPool = [];
            this.iInitialLoad = 100;
            this.oModel = mSettings.model;
            var oHomepageManagerData = {
                model: this.oModel
                //TODO
                //config : this.oConfig
                // Routing and view is not needed in the standalone AppFinder
            };

            this.oHomepageManager = HomepageManager.prototype.getInstance();
            if (!this.oHomepageManager) {
                this.oHomepageManager = new HomepageManager("dashboardMgr", oHomepageManagerData);
            }

            oCatalogsManagerInstance = this.getInterface();

            this.registerEvents();
        },

        registerEvents: function () {
            var oEventBus = Core.getEventBus();
            oEventBus.subscribe("renderCatalog", this.loadAllCatalogs, this);
            // Doable objects are kept in a global array to enable their off-ing later on.
            this._aDoables = [
                oEventHub.on("showCatalog").do(this.updateTilesAssociation.bind(this)),
                oEventHub.on("updateGroups").do(this.updateTilesAssociation.bind(this))
            ];
        },

        unregisterEvents: function () {
            var oEventBus = Core.getEventBus();
            oEventBus.unsubscribe("renderCatalog", this.loadAllCatalogs, this);
            this._aDoables.forEach(function (oDoable) {
                oDoable.off();
            });
            this._aDoables = [];
        },

        // temporary - should not be exposed
        getModel: function () {
            return this.oModel;
        },

        loadAllCatalogs: function (/*sChannelId, sEventId, oData*/) {
            var oGroupsPromise = new jQuery.Deferred();
            var that = this;

            // automatically resolving the group's promise for the scenario where the groups are
            // already loaded (so the group's promise Done callback will execute automatically is such a case)
            oGroupsPromise.resolve();

            // this is a local function (which could be invoked at 2 points in this method).
            // this sets a Done callback on the promise object of the groups.
            var setDoneCBForGroups = function () {
                oGroupsPromise.done(function () {
                    var aGroups = that.getModel().getProperty("/groups");
                    if (aGroups && aGroups.length !== 0) {
                        that.updateTilesAssociation();
                    }
                });
            };

            if (!this.oModel.getProperty("/catalogs")) {
                // catalog also needs groups
                if (!this.oModel.getProperty("/groups") || this.oModel.getProperty("/groups").length === 0) {
                    //Because of segmentation, some pins can be not selected
                    if (!Config.last("/core/spaces/enabled")) {
                        oGroupsPromise = this.oHomepageManager.loadPersonalizedGroups();
                    }
                }
                oDestroyHelper.destroyFLPAggregationModels(this.oModel.getProperty("/catalogs"));
                oDestroyHelper.destroyTileModels(this.oModel.getProperty("/catalogTiles"));
                // Clear existing Catalog items
                this.oModel.setProperty("/catalogs", []);
                this.oModel.setProperty("/catalogSearchEntity", {
                    appBoxes: [],
                    customTiles: []
                });

                // Array of promise objects that are generated inside addCatalogToModel (the "progress" function of getCatalogs)
                this.aPromises = [];

                Measurement.start("FLP:DashboardManager.GetCatalogsRequest", "GetCatalogsRequest", "FLP");
                Measurement.start("FLP:DashboardManager.getCatalogTiles", "getCatalogTiles", "FLP");
                Measurement.pause("FLP:DashboardManager.getCatalogTiles");
                Measurement.start("FLP:DashboardManager.BuildCatalogModelWithRendering", "BuildCatalogModelWithRendering", "FLP");
                Measurement.pause("FLP:DashboardManager.BuildCatalogModelWithRendering");

                // Trigger loading of catalogs
                sap.ushell.Container.getServiceAsync("LaunchPage").then(function (oLaunchPageService) {
                    oLaunchPageService.getCatalogs()
                        // There's a need to make sure that onDoneLoadingCatalogs is called only after all catalogs are loaded
                        // (i.e. all calls to addCatalogToModel are finished).
                        // For this, all the promise objects that are generated inside addCatalogToModel are generated into this.aPromises,
                        // and jQuery.when calls onDoneLoadingCatalogs only after all the promises are resolved
                        .done(function (catalogs) {
                            var aInitialCatalog = catalogs.slice(0, this.iInitialLoad);

                            Measurement.end("FLP:DashboardManager.GetCatalogsRequest");

                            this.aPromises = aInitialCatalog.map(this.addCatalogToModel.bind(this));
                            Promise.all(this.aPromises)
                                .then(this.processPendingCatalogs.bind(this))
                                .then(function () {
                                    this.aPromises = catalogs.slice(this.iInitialLoad).map(this.addCatalogToModel.bind(this));
                                    Promise.all(this.aPromises)
                                        .then(this.processPendingCatalogs.bind(this));
                                }.bind(this))
                                .then(this.onDoneLoadingCatalogs.bind(this, catalogs))
                                .then(setDoneCBForGroups);
                        }.bind(this))
                        //in case of a severe error, show an error message
                        .fail(oMessagingHelper.showLocalizedErrorHelper("fail_to_load_catalog_msg"));
                }.bind(this));
            } else {
                // when groups are loaded we can map the catalog tiles <-> groups map
                setDoneCBForGroups();
            }
        },

        updateTilesAssociation: function () {
            this.mapCatalogTilesToGroups();
            // update the catalogTile model after mapCatalogTilesToGroups() was called
            this.updateCatalogTilesToGroupsMap();
        },

        mapCatalogTilesToGroups: function () {
            var that = this;
            this.oTileCatalogToGroupsMap = {};

            // calculate the relation between the CatalogTile and the instances.
            var aGroups = this.oModel.getProperty("/groups");
            aGroups.forEach(function (oGroup) {
                ["tiles", "links"].forEach(function (sAttribute) {
                    var aTiles = oGroup[sAttribute];
                    if (aTiles) {
                        for (var tileInd = 0; tileInd < aTiles.length; ++tileInd) {
                            // no stableIds required, because this is only used in classic homepage
                            var tileId = encodeURIComponent(that.oLaunchPageService.getCatalogTileId(aTiles[tileInd].object));
                            var tileGroups = that.oTileCatalogToGroupsMap[tileId] || [];
                            var groupId = that.oLaunchPageService.getGroupId(oGroup.object);
                            // We make sure the group is visible and not locked, otherwise we should not put it in the map it fills.
                            if (tileGroups.indexOf(groupId) === -1
                                && (typeof (oGroup.isGroupVisible) === "undefined" || oGroup.isGroupVisible)
                                && !oGroup.isGroupLocked) {
                                tileGroups.push(groupId);
                            }
                            that.oTileCatalogToGroupsMap[tileId] = tileGroups;
                        }
                    }
                });
            });
        },

        updateCatalogTilesToGroupsMap: function () {
            var tileId;
            var associatedGroups;
            var aGroups;
            var aCatalog = this.getModel().getProperty("/catalogs");
            if (aCatalog) { // if the catalogTile model doesn't exist, it will be updated in some time later
                for (var index = 0; index < aCatalog.length; index++) {
                    var aCatalogAppBoxes = aCatalog[index].appBoxes;
                    if (aCatalogAppBoxes) {
                        // iterate over all the appBoxes.
                        for (var aCatalogAppBoxesIndex = 0; aCatalogAppBoxesIndex < aCatalogAppBoxes.length; aCatalogAppBoxesIndex++) {
                            var oAppBoxTile = aCatalogAppBoxes[aCatalogAppBoxesIndex];
                            // no stableIds required, because this is only used in classic homepage
                            tileId = encodeURIComponent(this.oLaunchPageService.getCatalogTileId(oAppBoxTile.src));
                            // get the mapping of the associated groups map.
                            aGroups = this.oTileCatalogToGroupsMap[tileId];
                            associatedGroups = (aGroups || []);
                            oAppBoxTile.associatedGroups = associatedGroups;
                        }
                    }

                    var aCatalogCustom = aCatalog[index].customTiles;
                    if (aCatalogCustom) {
                        // iterate over all the appBoxes.
                        for (var aCatalogCustomIndex = 0; aCatalogCustomIndex < aCatalogCustom.length; aCatalogCustomIndex++) {
                            var oCustomTile = aCatalogCustom[aCatalogCustomIndex];
                            tileId = encodeURIComponent(this.oLaunchPageService.getCatalogTileId(oCustomTile.src));
                            // get the mapping of the associated groups map.
                            aGroups = this.oTileCatalogToGroupsMap[tileId];
                            associatedGroups = (aGroups || []);
                            oCustomTile.associatedGroups = associatedGroups;
                        }
                    }
                }
            }
            this.getModel().setProperty("/catalogs", aCatalog);
        },

        /**
         * Adds a catalog object to the model including the catalog tiles.
         * The catalog is added to the "/catalogs" array in the model, and the tiles are added to "/catalogTiles".
         * If a catalog with the same title already exists - no new entry is added to the model for the new catalog,
         * and the tiles are added to "/catalogTiles" with indexes that place them under the catalog
         * (with the same title) that already exists

        /**
         * TODOs: We want to remove the catalogTiles.
         *
         * Align to the Data structure according to the wiki.
         * I have updated it a bit.
         *
         * catalogs : [
         * catalog: {
         *          title: srvc.getCatalogTitle(oCatalog),
         *          id: srvc.getCatalogId(oCatalog),
         *          numIntentSupportedTiles: 0,
         *          "static": false,
         *          customTiles: [
         *              the normal tile model.
         *          ],
         *          appBoxes: [
         *              {
         *                  title: ,
         *                  subtitle: ,
         *                  icon: ,
         *                  url: ,
         *                  catalogIndex:
         *              }
         *          ],
         *          numberOfCustomTiles: 0,
         *          numberOfAppBoxs: 0
         *      }
         *  ]
         *
         * Also We can simplify TileContainer to support Flat List. with no headers.
         * TileContainer to support one level indexing visible (true / false).
         *
         * @param {object} oCatalog The catalog that is added to the model.
         * @returns {Promise<object>} Resolves to a pending Catalog.
         *
         */
        addCatalogToModel: function (oCatalog) {
            var oCatalogModel = {
                title: this.oLaunchPageService.getCatalogTitle(oCatalog),
                id: this.oLaunchPageService.getCatalogId(oCatalog),
                numberTilesSupportedOnCurrectDevice: 0,
                static: false,
                customTiles: [],
                appBoxes: []
            };

            Measurement.resume("FLP:DashboardManager.getCatalogTiles");

            return new Promise(function (resolve, reject) {
                this.oLaunchPageService.getCatalogTiles(oCatalog)
                    .done(function (oCatalogEntry) {
                        Measurement.pause("FLP:DashboardManager.getCatalogTiles");
                        resolve({
                            oCatalogEntry: oCatalogEntry,
                            oCatalogModel: oCatalogModel
                        });
                    })
                    .fail(function (sError) {
                        oMessagingHelper.showLocalizedErrorHelper("fail_to_load_catalog_tiles_msg");
                        reject(sError);
                    });
            }.bind(this));
        },

        getTagList: function (maxTags) {
            var indexedTags = {};
            var tempTagsLst = [];

            if (this.oModel.getProperty("/tagList") && this.oModel.getProperty("/tagList").length > 0) {
                this.tagsPool.concat(this.oModel.getProperty("/tagList"));
            }

            for (var ind = 0; ind < this.tagsPool.length; ind++) {
                var oTag = this.tagsPool[ind];
                if (indexedTags[oTag]) {
                    indexedTags[oTag]++;
                } else {
                    indexedTags[oTag] = 1;
                }
            }

            // find the place in the sortedTopTiles.
            for (var tag in indexedTags) {
                tempTagsLst.push({ tag: tag, occ: indexedTags[tag] });
            }

            var sorted = tempTagsLst.sort(function (a, b) {
                return b.occ - a.occ;
            });

            if (maxTags) {
                this.oModel.setProperty("/tagList", sorted.slice(0, maxTags));
            } else {
                this.oModel.setProperty("/tagList", sorted);
            }
        },

        /**
         * Processes the catalogs retrieved from the service and updates the model.
         *
         * @param {object[]} aPendingCatalogQueue number of catalogs to be displayed.
         * @returns {Promise<undefined>} Resolves once the processing is done.
         */
        processPendingCatalogs: function (aPendingCatalogQueue) {
            var aCurrentCatalogs = this.oModel.getProperty("/catalogs");
            var oEventBus = Core.getEventBus();
            var aAllEntryInCatalogMaster = this.oModel.getProperty("/masterCatalogs") || [{
                title: oMessagingHelper.getLocalizedText("all")
            }];
            Measurement.end("FLP:DashboardManager.getCatalogTiles");
            Measurement.resume("FLP:DashboardManager.BuildCatalogModelWithRendering");

            // Check if a catalog with the given title already exists in the model.
            // The catalogs are required to be processed one after each other to maintain the correct order
            var oCatalogProcessPromise = aPendingCatalogQueue.reduce(function (oProcessPromise, oPendingCatalogEntry) {
                return oProcessPromise.then(function () {
                    var bIsNewCatalog;
                    var oCatalogObject;
                    var oCatalogEntry = oPendingCatalogEntry.oCatalogEntry;
                    var oCatalogModel = oPendingCatalogEntry.oCatalogModel;
                    var oExistingCatalogInModel = this.searchModelCatalogByTitle(oCatalogModel.title);

                    if (oExistingCatalogInModel.result) {
                        oCatalogObject = this.oModel.getProperty("/catalogs")[oExistingCatalogInModel.indexOfPreviousInstanceInModel];
                        bIsNewCatalog = false;
                    } else {
                        bIsNewCatalog = true;
                        oCatalogObject = oCatalogModel;
                    }

                    var aEntryProcessPromises = oCatalogEntry.map(function (oCatalogTile) {
                        return this._processCatalogObjectForModel(oCatalogObject, oCatalogTile);
                    }.bind(this));

                    return Promise.all(aEntryProcessPromises)
                        .then(function () {
                            //Update model just if catalog has tiles or appbox.
                            if (oCatalogObject.appBoxes.length > 0 || oCatalogObject.customTiles.length > 0) {
                                if (bIsNewCatalog) {
                                    aCurrentCatalogs.push(oCatalogModel);
                                    aAllEntryInCatalogMaster.push({
                                        title: oCatalogModel.title
                                    });
                                }
                            }
                            if (this.oModel.getProperty("/enableCatalogTagFilter") === true) {
                                this.getTagList();
                            }
                        }.bind(this));
                }.bind(this));
            }.bind(this), Promise.resolve());

            return oCatalogProcessPromise.then(function () {
                this.oModel.setProperty("/masterCatalogs", aAllEntryInCatalogMaster);
                this.oModel.setProperty("/catalogs", aCurrentCatalogs);
                oEventBus.publish("launchpad", "afterCatalogSegment");
                setTimeout(function () {
                    // the first segment has been loaded and rendered
                    oUtils.setPerformanceMark("FLP-TTI-AppFinder", { bUseUniqueMark: true });
                }, 0); // Catalogs have not yet been rendered but after a setTimeout they have been

                Measurement.pause("FLP:DashboardManager.BuildCatalogModelWithRendering");
            }.bind(this));
        },

        _processCatalogObjectForModel: function (oCurrentCatalogObject, oCatalogTile) {
            var oAppBoxNew;
            // do not add Item if no intent supported
            if (this._getIsIntentSupported(oCatalogTile)) {
                if (this._getIsAppBox(oCatalogTile)) {
                    oAppBoxNew = this.createCatalogAppBoxes(oCatalogTile, true);
                    oCurrentCatalogObject.appBoxes.push(oAppBoxNew);
                    return Promise.resolve();
                }
                return this.createCatalogTiles(oCatalogTile).then(function (oCatalogTileNew) {
                    oCurrentCatalogObject.customTiles.push(oCatalogTileNew);
                    // add the getTileView to an array of functions that will be executed once the catalog finishes loading
                    // we need this array in order to call geTileView for all customTiles. see incident: ******
                    if (!this.aFnToGetTileView) {
                        this.aFnToGetTileView = [];
                    }
                }.bind(this));
            }
            return Promise.resolve();
        },

        loadCustomTilesKeyWords: function () {
            var fn;
            if (this.aFnToGetTileView) {
                while (this.aFnToGetTileView.length > 0) {
                    fn = this.aFnToGetTileView.pop();
                    fn();
                }
            }
        },

        /**
         * Checks if a catalog with the given title already exists in the model.
         *
         * @param {string} catalogTitle Title of a catalog.
         * @returns {object} An object that includes:
         *   - result - a boolean value indicating whether the model already includes a catalog with the same title
         *   - indexOfPreviousInstanceInModel - the index in the model (in /catalogs) of the existing catalog with the given title
         *   - indexOfPreviousInstanceInPage - the index in the page of the existing  catalog with the given title,
         *     this value usually equals (indexOfPreviousInstanceInModel - 1),
         *     since the model includes the dummy-catalog "All Catalogs" that doesn't appear in the page
         *   - numOfTilesInCatalog - the number of tiles in the catalog with the given title
         */
        searchModelCatalogByTitle: function (catalogTitle) {
            var catalogs = this.oModel.getProperty("/catalogs");
            var catalogTitleExists = false;
            var indexOfPreviousInstance;
            var numOfTilesInCatalog = 0;
            var bGeneralCatalogAppeared = false;

            var tempCatalog;
            for (var index = 0; index < catalogs.length; ++index) {
                tempCatalog = catalogs[index];
                // If this is the catalogsLoading catalog - remember that it was read since the found index should be reduced by 1
                if (tempCatalog.title === resources.i18n.getText("catalogsLoading")) {
                    bGeneralCatalogAppeared = true;
                } else if (catalogTitle === tempCatalog.title) {
                    indexOfPreviousInstance = index;
                    numOfTilesInCatalog = tempCatalog.numberOfTiles;
                    catalogTitleExists = true;
                    break;
                }
            }
            return {
                result: catalogTitleExists,
                indexOfPreviousInstanceInModel: indexOfPreviousInstance,
                indexOfPreviousInstanceInPage: bGeneralCatalogAppeared ? indexOfPreviousInstance - 1 : indexOfPreviousInstance,
                numOfTilesInCatalog: numOfTilesInCatalog
            };
        },

        /**
         * A wrapper for LaunchPage.getCatalogTileId which ensures that the stableCatalogTileId is only fetched for the required scenarios.
         *
         * @param {object} oCatalogTile The CatalogTile returned by the LaunchPage service
         * @returns {string} The catalogTileId
         * @since 1.99.0
         * @private
         */
        _getCatalogTileId: function (oCatalogTile) {
            var sCatalogTileId;
            var bStableIDsEnabled = Config.last("/core/stableIDs/enabled");
            var bSpacesEnabled = Config.last("/core/spaces/enabled");

            if (bStableIDsEnabled && bSpacesEnabled) {
                sCatalogTileId = this.oLaunchPageService.getStableCatalogTileId(oCatalogTile);
            }

            /*
            Always fallback on the catalogTileId.
            Either getStableCatalogTileId is not implemented by the LaunchPageAdapter or spaces is disabled.
            */
            if (!sCatalogTileId) {
                sCatalogTileId = this.oLaunchPageService.getCatalogTileId(oCatalogTile);
            }

            return sCatalogTileId;
        },

        createCatalogAppBoxes: function (oCatalogTile, bGetTileKeyWords) {
            var catalogTileId = encodeURIComponent(this._getCatalogTileId(oCatalogTile));
            var associatedGrps = this.oTileCatalogToGroupsMap[catalogTileId] || [];
            var tileTags = this.oLaunchPageService.getCatalogTileTags(oCatalogTile) || [];

            if (tileTags.length > 0) {
                this.tagsPool = this.tagsPool.concat(tileTags);
            }
            var sNavigationMode;
            if (oCatalogTile.tileResolutionResult) {
                sNavigationMode = oCatalogTile.tileResolutionResult.navigationMode;
            }

            return {
                id: catalogTileId,
                associatedGroups: associatedGrps,
                src: oCatalogTile,
                title: this.oLaunchPageService.getCatalogTilePreviewTitle(oCatalogTile),
                subtitle: this.oLaunchPageService.getCatalogTilePreviewSubtitle(oCatalogTile),
                icon: this.oLaunchPageService.getCatalogTilePreviewIcon(oCatalogTile),
                keywords: bGetTileKeyWords ? (this.oLaunchPageService.getCatalogTileKeywords(oCatalogTile) || []).join(",") : [],
                tags: tileTags,
                navigationMode: sNavigationMode,
                url: this.oLaunchPageService.getCatalogTileTargetURL(oCatalogTile)
            };
        },

        onDoneLoadingCatalogs: function (aCatalogs) {
            var aCatalogTilePromises = aCatalogs.map(function (oCatalog) {
                return new Promise(function (resolve, reject) {
                    this.oLaunchPageService.getCatalogTiles(oCatalog)
                        .done(resolve)
                        .fail(reject);
                }.bind(this));
            }.bind(this));

            Promise.all(aCatalogTilePromises).then(function (aResCatalogTile) {
                var noTiles = true;

                for (var iIndexResCatalogTile = 0; iIndexResCatalogTile < aResCatalogTile.length; iIndexResCatalogTile++) {
                    if (aResCatalogTile[iIndexResCatalogTile].length !== 0) {
                        noTiles = false;
                        break;
                    }
                }

                if (noTiles || !aCatalogs.length) {
                    this.oModel.setProperty("/catalogsNoDataText", resources.i18n.getText("noCatalogs"));
                }
            }.bind(this));

            //Publish event catalog finished loading.
            var oEventBus = Core.getEventBus();
            oEventBus.publish("launchpad", "catalogContentLoaded");

            var aLoadedCatalogs = aCatalogs.filter(function (oCatalog) {
                var sCatalogError = this.oLaunchPageService.getCatalogError(oCatalog);
                if (sCatalogError) {
                    Log.error(
                        "A catalog could not be loaded",
                        sCatalogError,
                        "sap.ushell.components.CatalogsManager"
                    );
                }
                return !sCatalogError;
            }.bind(this));
            //check if some of the catalogs failed to load
            if (aLoadedCatalogs.length !== aCatalogs.length) {
                oMessagingHelper.showLocalizedError("partialCatalogFail");
            }

            oUtils.handleTilesVisibility();
        },

        createCatalogTiles: function (oCatalogTile/*, bGetTileKeyWords*/) {
            var oTileViewPromise = Promise.resolve();
            // if it's not a dynamic or static tile, we need to call the getCatalogTileView already here to make the search work
            // the keywords for Smart Business tiles are only there if their view was rendered before
            var sChipId = oCatalogTile.getChip && oCatalogTile.getChip().getBaseChipId && oCatalogTile.getChip().getBaseChipId();
            if (sChipId && ["X-SAP-UI2-CHIP:/UI2/DYNAMIC_APPLAUNCHER", "X-SAP-UI2-CHIP:/UI2/STATIC_APPLAUNCHER"].indexOf(sChipId) === -1) {
                oTileViewPromise = new Promise(function (resolve, reject) {
                    this.oLaunchPageService.getCatalogTileViewControl(oCatalogTile)
                        .done(resolve)
                        .fail(reject);
                }.bind(this));
            }

            return oTileViewPromise.then(function (oTileView) {
                var sCatalogTileId = encodeURIComponent(this._getCatalogTileId(oCatalogTile));
                var aAssociatedGrps = this.oTileCatalogToGroupsMap[sCatalogTileId] || [];
                var aTileTags = this.oLaunchPageService.getCatalogTileTags(oCatalogTile) || [];

                if (aTileTags.length > 0) {
                    this.tagsPool = this.tagsPool.concat(aTileTags);
                }

                if (!oTileView) {
                    oTileView = new TileState({ state: "Loading" });
                }

                var sTileTitle = this.oLaunchPageService.getCatalogTilePreviewTitle(oCatalogTile);
                if (!sTileTitle) {
                    sTileTitle = this.oLaunchPageService.getCatalogTileTitle(oCatalogTile);
                }
                return {
                    associatedGroups: aAssociatedGrps,
                    src: oCatalogTile,
                    catalog: oCatalogTile.title,
                    catalogId: oCatalogTile.id,
                    title: sTileTitle,
                    tags: aTileTags,
                    keywords: (this.oLaunchPageService.getCatalogTileKeywords(oCatalogTile) || []).join(","),
                    id: sCatalogTileId,
                    size: this.oLaunchPageService.getCatalogTileSize(oCatalogTile),
                    content: [oTileView],
                    isTileIntentSupported: this.oLaunchPageService.isTileIntentSupported(oCatalogTile),
                    tileType: oCatalogTile.tileType
                };
            }.bind(this));
        },

        createGroupAndSaveTile: function (oData) {
            var oCatalogTileContext = oData.catalogTileContext;
            var sNewTitle = oData.newGroupName;
            var oDeferred = new jQuery.Deferred();

            if (oUtils.validHash(sNewTitle) && oCatalogTileContext) {
                this.createGroup(sNewTitle).then(function (oContext) {
                    // Add HeaderActions and before and after content of newly created group,
                    // if the dashboard is already loaded and in edit mode.
                    var oDashboardView = this.oHomepageManager.getDashboardView();
                    if (oDashboardView && oDashboardView.getModel().getProperty("/tileActionModeActive")) {
                        Core.getEventBus().publish("launchpad", "AddTileContainerContent");
                    }

                    var oResponseData = {};

                    this.createTile({
                        catalogTileContext: oCatalogTileContext,
                        groupContext: oContext
                    }).done(function (data) {
                        oResponseData = { group: data.group, status: 1, action: "addTileToNewGroup" }; // 1 - success
                        oDeferred.resolve(oResponseData);
                    }).fail(function (data) {
                        oResponseData = { group: data.group, status: 0, action: "addTileToNewGroup" }; // 0 - failure
                        oDeferred.resolve(oResponseData);
                    });
                }.bind(this));
            }
            return oDeferred.promise();
        },

        createGroup: function (sTitle) {
            var that = this;
            var oDeferred = new jQuery.Deferred();
            if (!oUtils.validHash(sTitle)) {
                return oDeferred.reject({ status: 0, action: "createNewGroup" }); // 0 - failure
            }

            var oResultPromise = this.oLaunchPageService.addGroup(sTitle);
            oResultPromise.done(function (oGroup/*, sGroupId*/) {
                var oGroupContext = that.oHomepageManager.addGroupToModel(oGroup);
                oDeferred.resolve(oGroupContext);
            });
            oResultPromise.fail(function () {
                oMessagingHelper.showLocalizedError("fail_to_create_group_msg");
                var oResponseData = { status: 0, action: "createNewGroup" }; // 0 - failure
                oDeferred.resolve(oResponseData); // 0 - failure
            });

            return oDeferred.promise();
        },

        createTile: function (oData) {
            var that = this;
            var oCatalogTileContext = oData.catalogTileContext;
            var oContext = oData.groupContext;
            var oGroup = this.oModel.getProperty(oContext.getPath());
            var sGroupId = oGroup.groupId;
            var oDeferred = new jQuery.Deferred();
            var oResponseData = {};

            // publish event for UserActivityLog
            var oEventBus = Core.getEventBus();
            oEventBus.publish("launchpad", "addTile", {
                catalogTileContext: oCatalogTileContext,
                groupContext: oContext
            });

            if (!oCatalogTileContext) {
                Log.warning("CatalogsManager: Did not receive catalog tile object. Abort.", this);
                oResponseData = { group: oGroup, status: 0, action: "add" }; // 0 - failure
                return Promise.resolve(oResponseData);
            }

            var oResultPromise = this.oLaunchPageService.addTile(oCatalogTileContext.getProperty("src"), oContext.getProperty("object"));
            oResultPromise.done(function (oTile) {
                var aGroups = that.oModel.getProperty("/groups");
                var sGroupPath = oGroupsHelper.getModelPathOfGroup(aGroups, sGroupId);
                var sTileTitle = that.oLaunchPageService.getTileTitle(oTile);

                that.oHomepageManager.addTileToGroup(sGroupPath, oTile);
                oResponseData = { group: oGroup, status: 1, action: "add" }; // 1 - success
                sap.ushell.Container.getServiceAsync("UsageAnalytics").then(function (oUsageAnalytics) {
                    oUsageAnalytics.logCustomEvent(
                        that.analyticsConstants.PERSONALIZATION,
                        that.analyticsConstants.ADD_TILE,
                        [oGroup.title, sTileTitle]
                    );
                });
                oDeferred.resolve(oResponseData);
            }).fail(function () {
                oMessagingHelper.showLocalizedError("fail_to_add_tile_msg");
                oResponseData = { group: oGroup, status: 0, action: "add" }; // 0 - failure
                oDeferred.resolve(oResponseData);
            });

            return oDeferred.promise();
        },

        /*
         * Deletes all instances of a catalog Tile from a Group
         */
        deleteCatalogTileFromGroup: function (oData) {
            var that = this;
            var sDeletedTileCatalogId = decodeURIComponent(oData.tileId);
            var iGroupIndex = oData.groupIndex;
            var oGroup = this.oModel.getProperty("/groups/" + iGroupIndex);
            var deferred = new jQuery.Deferred();
            var aDeleteTilePromises = [];
            var aRemovedTileIds = [];

            ["tiles", "links"].forEach(function (sAttribute) {
                oGroup[sAttribute].forEach(function (oTile) {
                    // no stableIds required, because this is only used in classic homepage
                    var sTmpTileCatalogId = that.oLaunchPageService.getCatalogTileId(oTile.object);
                    if (sTmpTileCatalogId === sDeletedTileCatalogId) {
                        // Initialize oPositiveDeferred object that will later be resolved with the status of the delete request
                        var oPositiveDeferred = new jQuery.Deferred();
                        // Send the delete request to the server
                        var oDeletePromise = that.oLaunchPageService.removeTile(oGroup.object, oTile.object);

                        oDeletePromise.done(
                            (function (oDeferred) {
                                return function () {
                                    aRemovedTileIds.push(oTile.uuid);
                                    oDeferred.resolve({ status: true });
                                };
                            })(oPositiveDeferred)
                        );

                        oDeletePromise.fail(
                            (function (oDeferred) {
                                return function () {
                                    oDeferred.resolve({ status: false });
                                };
                            })(oPositiveDeferred)
                        );

                        aDeleteTilePromises.push(oPositiveDeferred);
                    }
                });
            });

            // Wait for all of the delete requests before resolving the deferred
            jQuery.when.apply(jQuery, aDeleteTilePromises).done(function (result) {
                //If some promise was rejected, some tiles was not removed
                var bSuccess = aDeleteTilePromises.length === aRemovedTileIds.length;
                //Update groups for removed tiles
                that.oHomepageManager.deleteTilesFromGroup(oGroup.groupId, aRemovedTileIds);
                that.updateTilesAssociation();
                deferred.resolve({ group: oGroup, status: bSuccess, action: "remove" });
            });
            return deferred.promise();
        },

        /**
         * @param {int} catalogIndex the index of the catalog.
         * @param {int} numberOfExistingTiles the number of catalog tiles that were already loaded for previous catalog/s with the same title.
         * @param {int} iTile the index of the current catalog tile in the containing catalog.
         * @returns {int} result the catalog tile index.
         */
        calculateCatalogTileIndex: function (catalogIndex, numberOfExistingTiles, iTile) {
            var result = parseInt(catalogIndex * 100000, 10);
            result += (numberOfExistingTiles !== undefined ? numberOfExistingTiles : 0) + iTile;
            return result;
        },

        /**
         * Shows an appropriate message to the user when action (add or delete tile from group) fails
         *
         * @param {string} sMsgId The localization id of the message.
         * @param {object} aParameters Additional parameters for the Message Toast showing the message. Can be undefined.
         */
        notifyOnActionFailure: function (sMsgId, aParameters) {
            oMessagingHelper.showLocalizedError(sMsgId, aParameters);
        },

        /**
         * Shows an message and update tiles association when action (add or delete tile from group) fails
         *
         * @param {string} sMsgId The localization id of the message.
         * @param {object} aParameters Additional parameters for the Message Toast showing the message. Can be undefined.
         */
        resetAssociationOnFailure: function (sMsgId, aParameters) {
            this.notifyOnActionFailure(sMsgId, aParameters);
            this.updateTilesAssociation();
        },

        _getIsIntentSupported: function (oCatalogTile) {
            return !!(this.oLaunchPageService.isTileIntentSupported(oCatalogTile));
        },

        _getIsAppBox: function (oCatalogTile) {
            var bIsAppBox;

            /*
            When appFinderDisplayMode is set to "tiles", non-custom tiles will have the same display as custom tiles
            (i.e. will not be displayed as AppBoxes).
            In other words - all tiles (custom and non-custom) will be displayed as tiles
            when appFinderDisplayMode is not set at all, or set to "appBoxes", non-custom tiles will be displayed as AppBoxes.
            */

            // get appFinder display mode from configuration
            var sAppFinderDisplayMode = this.oModel.getProperty("/appFinderDisplayMode");

            // determine the catalog tile display mode:
            if (sAppFinderDisplayMode === "tiles") {
                bIsAppBox = false;
            } else {
                bIsAppBox = !!(
                    this.oLaunchPageService.getCatalogTileTargetURL(oCatalogTile) && (
                        this.oLaunchPageService.getCatalogTilePreviewTitle(oCatalogTile) ||
                        this.oLaunchPageService.getCatalogTilePreviewSubtitle(oCatalogTile)
                    )
                );
            }
            return bIsAppBox;
        },

        destroy: function () {
            this.unregisterEvents();
        }
    });

    CatalogsManager.prototype.getInstance = function () {
        return oCatalogsManagerInstance;
    };

    return CatalogsManager;
});
