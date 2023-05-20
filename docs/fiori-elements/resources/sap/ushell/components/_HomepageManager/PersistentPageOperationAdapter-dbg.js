// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/base/Object",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/ushell/components/MessagingHelper",
    "sap/m/GenericTile",
    "sap/base/util/uid",
    "sap/base/Log",
    "sap/ui/performance/Measurement",
    "sap/m/library",
    "sap/base/util/deepEqual"
], function (
    BaseObject,
    Config,
    oResources,
    oMessagingHelper,
    GenericTile,
    fnGetUid,
    Log,
    Measurement,
    mobileLibrary,
    deepEqual
) {
    "use strict";

    // shortcut for sap.m.GenericTileMode
    var GenericTileMode = mobileLibrary.GenericTileMode;

    // shortcut for sap.m.LoadState
    var LoadState = mobileLibrary.LoadState;

    var analyticsConstants = {
        PERSONALIZATION: "FLP: Personalization",
        RENAME_GROUP: "FLP: Rename Group",
        MOVE_GROUP: "FLP: Move Group",
        DELETE_GROUP: "FLP: Delete Group",
        RESET_GROUP: "FLP: Reset Group",
        DELETE_TILE: "FLP: Delete Tile",
        ADD_TILE: "FLP: Add Tile",
        MOVE_TILE: "FLP: Move Tile"
    };

    function _logUsageAnalytics (sEvent, aParams) {
        sap.ushell.Container.getServiceAsync("UsageAnalytics").then(function (oUsageAnalyticsService) {
            oUsageAnalyticsService.logCustomEvent(analyticsConstants.PERSONALIZATION, sEvent, aParams);
        });
    }

    var PersistentPageOperationAdapter = BaseObject.extend("sap.ushell.components._HomepageManager.PersistentPageOperationAdapter", {
        constructor: function (oLaunchPageService) {
            BaseObject.call(this);
            this.oPageBuilderService = oLaunchPageService;
        },

        _getIsAppBox: function (oCatalogTile) {
            var srvc = this.oPageBuilderService,
                bIsAppBox = !!(srvc.getCatalogTileTargetURL(oCatalogTile)
                    && (srvc.getCatalogTilePreviewTitle(oCatalogTile) || srvc.getCatalogTilePreviewSubtitle(oCatalogTile)));
            return bIsAppBox;
        },

        getCurrentHiddenGroupIds: function (oModel) {
            var aGroups = oModel.getProperty("/groups"),
                aHiddenGroupsIDs = [],
                sGroupId,
                groupIndex,
                bGroupVisible;

            for (groupIndex = 0; groupIndex < aGroups.length; groupIndex++) {
                //check if have property isGroupVisible on aGroups if undefined set isGroupVisible true;
                bGroupVisible = aGroups[groupIndex] ? aGroups[groupIndex].isGroupVisible : true;
                //In case of edit mode - it may be that group was only created in RT and still doesn't have an object property
                if (aGroups[groupIndex].object) {
                    sGroupId = this.oPageBuilderService.getGroupId(aGroups[groupIndex].object);
                }
                if (!bGroupVisible && sGroupId !== undefined) {
                    aHiddenGroupsIDs.push(sGroupId);
                }
            }
            return aHiddenGroupsIDs;
        },

        getPreparedTileModel: function (oTile, isGroupLocked, sTileType) {
            var srvc = this.oPageBuilderService,
                sTileUUID = fnGetUid(),
                oTileModelData,
                sSize = srvc.getTileSize(oTile),
                aLinks = [],
                oManifest;

            sTileType = sTileType || srvc.getTileType(oTile);

            if (sTileType === "link") {
                aLinks = [new GenericTile({
                    mode: GenericTileMode.LineMode
                })];
            }

            oTileModelData = {
                "isCustomTile": !this._getIsAppBox(oTile),
                "object": oTile,
                "originalTileId": srvc.getTileId(oTile),
                "uuid": sTileUUID,
                "tileCatalogId": encodeURIComponent(srvc.getCatalogTileId(oTile)),
                "tileCatalogIdStable": srvc.getStableCatalogTileId(oTile),
                "content": aLinks,
                "long": sSize === "1x2",
                // 'target' will be defined (and get a value) later on after the tile will be valid
                "target": srvc.getTileTarget(oTile) || "",
                "debugInfo": srvc.getTileDebugInfo(oTile),
                "isTileIntentSupported": srvc.isTileIntentSupported(oTile),
                "rgba": "",
                "isLocked": isGroupLocked,
                "showActionsIcon": Config.last("/core/home/enableTileActionsIcon"),
                "isLinkPersonalizationSupported": srvc.isLinkPersonalizationSupported(oTile),
                "navigationMode": undefined
            };

            if (sTileType === "card") {
                oManifest = srvc.getCardManifest(oTile);
                oTileModelData.isCard = true;

                if (oManifest) {
                    oTileModelData.manifest = oManifest;
                }
            }

            return oTileModelData;
        },

        getPreparedGroupModel: function (oGroup, bDefault, bLast, oData) {
            var srvc = this.oPageBuilderService,
                aGroupTiles = (oGroup && srvc.getGroupTiles(oGroup)) || [],
                aModelTiles = [],
                aModelLinks = [],
                i,
                isSortable = Config.last("/core/shell/model/personalization"),
                bHelpEnabled = Config.last("/core/extension/enableHelp");

            // in a new group scenario we create the group as null at first.
            var bIsGroupLocked = !!(oGroup && srvc.isGroupLocked(oGroup)),
                bIsGroupFeatured = !!(oGroup && srvc.isGroupFeatured(oGroup));

            for (i = 0; i < aGroupTiles.length; ++i) {
                var oTile = aGroupTiles[i],
                    sTileType = srvc.getTileType(oTile).toLowerCase(); //lowercase to make comparison easier
                if (sTileType === "tile" || sTileType === "card") {
                    aModelTiles.push(this.getPreparedTileModel(aGroupTiles[i], bIsGroupLocked, sTileType));
                } else if (sTileType === "link") {
                    aModelLinks.push(this.getPreparedTileModel(aGroupTiles[i], bIsGroupLocked, sTileType));
                } else {
                    Log.error("Unknown tile type: '" + sTileType + "'",
                        undefined,
                        "sap.ushell.components.HomepageManager"
                    );
                }
            }

            return {
                title: (bDefault && oMessagingHelper.getLocalizedText("my_group"))
                    || (oGroup && srvc.getGroupTitle(oGroup)) || (oData && oData.title) || "",
                object: oGroup,
                groupId: fnGetUid(),
                helpId: (bHelpEnabled && oGroup) ? srvc.getGroupId(oGroup) : null,
                links: aModelLinks,
                pendingLinks: [],
                tiles: aModelTiles,
                isDefaultGroup: !!bDefault,
                editMode: !oGroup,
                isGroupLocked: bIsGroupLocked,
                isFeatured: bIsGroupFeatured,
                visibilityModes: [true, true],
                removable: !oGroup || srvc.isGroupRemovable(oGroup),
                sortable: isSortable,
                isGroupVisible: !oGroup || srvc.isGroupVisible(oGroup),
                isEnabled: !bDefault, //Currently only default groups is considered as locked
                isLastGroup: bLast || false,
                isRendered: !!(oData && oData.isRendered),
                isGroupSelected: false
            };
        },

        getPage: function () {
            Measurement.start("FLP:DashboardManager.loadPersonalizedGroups", "loadPersonalizedGroups", "FLP");

            return this._getGroupsFromServer().then(this.loadGroupsFromArray.bind(this));
        },

        _getGroupsFromServer: function () {
            var that = this;
            return new Promise(function (resolve, reject) {
                that.oPageBuilderService.getGroups().done(function (aGroups) {
                    Measurement.end("FLP:DashboardManager.loadPersonalizedGroups");
                    resolve(aGroups);
                }).fail(reject);
            });
        },

        /**
         * Load all groups in the given array. The default group will be loaded first.
         * @param {Array} aGroups
         *   The array containing all groups (including the default group).
         * @returns {Array} Prepared groups model with tiles and links
         */
        loadGroupsFromArray: function (aGroups) {
            var that = this;
            //For Performance debug only, enabled only when URL parameter sap-flp-perf activated
            Measurement.start("FLP:DashboardManager.loadGroupsFromArray", "loadGroupsFromArray", "FLP");
            Measurement.start("FLP:DashboardManager.getDefaultGroup", "getDefaultGroup", "FLP");
            return new Promise(function (resolve, reject) {
                that.oPageBuilderService.getDefaultGroup().done(function (oDefaultGroup) {
                    Measurement.end("FLP:DashboardManager.getDefaultGroup");
                    // In case the user has no groups
                    if (aGroups.length === 0 && oDefaultGroup === undefined) {
                        resolve([]);
                        return;
                    }

                    var i = 0,
                        oNewGroupModel,
                        aNewGroups = [],
                        groupLength,
                        iDefaultGroupIndex;

                    aGroups = that._sortGroups(oDefaultGroup, aGroups);
                    iDefaultGroupIndex = aGroups.findIndex(function (oGroup) {
                        return deepEqual(oGroup, oDefaultGroup);
                    });

                    groupLength = aGroups.length;

                    Measurement.start("FLP:DashboardManager._getGroupModel", "_getGroupModel", "FLP");

                    for (i = 0; i < groupLength; ++i) {
                        oNewGroupModel = that.getPreparedGroupModel(aGroups[i], i === iDefaultGroupIndex, i === groupLength - 1);
                        oNewGroupModel.index = i;
                        aNewGroups.push(oNewGroupModel);
                    }
                    Measurement.end("FLP:DashboardManager._getGroupModel");
                    Measurement.end("FLP:DashboardManager.loadGroupsFromArray");
                    resolve(aNewGroups);
                }).fail(reject);
            });
        },

        /**
         * the order should be
         * - feature group
         * - locked groups, sorted by title
         * - default group (home group)
         * - other groups, sort order taken from server
         * @param {*} oDefaultGroup Default group
         * @param {*} aGroups all other groups
         * @returns {*} sorted group
         */
        _sortGroups: function (oDefaultGroup, aGroups) {
            var i = 0,
                that = this,
                indexOfDefaultGroup = aGroups.findIndex(function (oGroup) {
                    return deepEqual(oGroup, oDefaultGroup);
                }),
                lockedGroups = [],
                buildSortedGroups,
                oGroup,
                isLocked;

            // remove default group from array
            if (indexOfDefaultGroup > -1) {
                aGroups.splice(indexOfDefaultGroup, 1);
            }

            while (i < aGroups.length) {
                oGroup = aGroups[i];
                isLocked = this.oPageBuilderService.isGroupLocked(oGroup);

                if (isLocked) {
                    lockedGroups.push(oGroup);
                    aGroups.splice(i, 1);
                } else {
                    i++;
                }
            }

            // sort only locked groups
            if (!Config.last("/core/home/disableSortedLockedGroups")) {
                lockedGroups.sort(function (x, y) {
                    var xTitle = that.oPageBuilderService.getGroupTitle(x).toLowerCase(),
                        yTitle = that.oPageBuilderService.getGroupTitle(y).toLowerCase();
                    return xTitle < yTitle ? -1 : 1;
                });
            }
            // Featured groups should always be at the top
            lockedGroups.sort(function (x, y) {
                var bIsXFeatured = that.oPageBuilderService.isGroupFeatured(x),
                    bIsYFeatured = that.oPageBuilderService.isGroupFeatured(y);

                if (bIsXFeatured === bIsYFeatured) {
                    return 0;
                } else if (bIsXFeatured > bIsYFeatured) {
                    return -1;
                }
                return 1;
            });
            // bring back default group to array
            buildSortedGroups = lockedGroups;
            buildSortedGroups.push(oDefaultGroup);
            buildSortedGroups.push.apply(buildSortedGroups, aGroups);

            return buildSortedGroups;
        },

        addGroupAt: function (oGroupModel, iGroupIndex, bIsDefaultGroup) {
            var that = this;

            return new Promise(function (resolve, reject) {
                try {
                    if (iGroupIndex === undefined) {
                        that.oPageBuilderService.addGroup(oGroupModel.title)
                            .done(function (oNewServerGroupObject) {
                                var sGroupId = that.oPageBuilderService.getGroupId(oNewServerGroupObject);
                                _logUsageAnalytics(analyticsConstants.RENAME_GROUP, [null, oGroupModel.title, sGroupId]);
                                resolve(
                                    that.getPreparedGroupModel(
                                        oNewServerGroupObject,
                                        bIsDefaultGroup,
                                        oGroupModel.isLastGroup,
                                        undefined
                                    )
                                );
                            })
                            .fail(reject);
                    } else {
                        that.oPageBuilderService.addGroupAt(oGroupModel.title, iGroupIndex)
                            .done(function (oNewServerGroupObject) {
                                var sGroupId = that.oPageBuilderService.getGroupId(oNewServerGroupObject);
                                _logUsageAnalytics(analyticsConstants.RENAME_GROUP, [null, oGroupModel.title, sGroupId]);
                                resolve(
                                    that.getPreparedGroupModel(
                                        oNewServerGroupObject,
                                        bIsDefaultGroup,
                                        oGroupModel.isLastGroup,
                                        undefined
                                    )
                                );
                            })
                            .fail(reject);
                    }
                } catch (err) {
                    reject();
                }
            });
        },

        renameGroup: function (oGroupModel, sNewTitle, sOldTitle) {
            var that = this;
            return new Promise(function (resolve, reject) {
                try {
                    that.oPageBuilderService.setGroupTitle(oGroupModel.object, sNewTitle)
                        .done(function () {
                            var sGroupOriginalId = that.oPageBuilderService.getGroupId(oGroupModel.object);
                            _logUsageAnalytics(analyticsConstants.RENAME_GROUP, [sOldTitle, sNewTitle, sGroupOriginalId]);
                            resolve();
                        })
                        .fail(reject);
                } catch (Ex) {
                    reject();
                }
            });
        },

        deleteGroup: function (oGroupModel) {
            var that = this,
                oServerGroupObject = oGroupModel.object,
                sGroupObjectId = this.oPageBuilderService.getGroupId(oServerGroupObject),
                sGroupName = this.oPageBuilderService.getGroupTitle(oServerGroupObject);

            return new Promise(function (resolve, reject) {
                try {
                    that.oPageBuilderService.removeGroup(oServerGroupObject)
                        .done(function () {
                            _logUsageAnalytics(analyticsConstants.DELETE_GROUP, [sGroupName, sGroupObjectId]);
                            resolve();
                        })
                        .fail(reject);
                } catch (err) {
                    reject();
                }
            });
        },

        moveGroup: function (oGroupModel, iToIndex, oIndicesInModel) {
            var that = this;
            return new Promise(function (resolve, reject) {
                try {
                    that.oPageBuilderService.moveGroup(oGroupModel.object, iToIndex)
                        .done(function () {
                            var sGroupId = that.oPageBuilderService.getGroupId(oGroupModel.object);
                            _logUsageAnalytics(
                                analyticsConstants.MOVE_GROUP,
                                [oGroupModel.title,
                                oIndicesInModel.iFromIndex,
                                oIndicesInModel.iToIndex,
                                    sGroupId]
                            );
                            resolve();
                        })
                        .fail(reject);
                } catch (err) {
                    reject();
                }
            });
        },

        resetGroup: function (oGroupModel, bIsDefaultGroup) {
            var that = this,
                oServerGroupObject = oGroupModel.object,
                sGroupObjectId = this.oPageBuilderService.getGroupId(oServerGroupObject),
                sGroupTitle = this.oPageBuilderService.getGroupTitle(oServerGroupObject);

            return new Promise(function (resolve, reject) {
                try {
                    that.oPageBuilderService.resetGroup(oServerGroupObject)
                        .done(function (oResetedServerObject) {
                            _logUsageAnalytics(analyticsConstants.RESET_GROUP, [sGroupTitle, sGroupObjectId]);
                            resolve(
                                that.getPreparedGroupModel(
                                    oResetedServerObject || oServerGroupObject,
                                    bIsDefaultGroup,
                                    oGroupModel.isLastGroup,
                                    undefined
                                )
                            );
                        })
                        .fail(reject);
                } catch (err) {
                    reject();
                }
            });
        },

        refreshGroup: function (sGroupId) {
            var that = this,
                sErrorMsg = "Failed to refresh group with id:" + sGroupId + " in the model";

            return new Promise(function (resolve) {
                that.oPageBuilderService.getGroups()
                    .fail(function () {
                        Log.error(sErrorMsg, null, "sap.ushell.components.HomepageManager");
                        resolve(null);
                    })
                    .done(function (aGroups) {
                        var oServerGroupModel = null;
                        for (var i = 0; i < aGroups.length; i++) {
                            if (that.oPageBuilderService.getGroupId(aGroups[i]) === sGroupId) {
                                oServerGroupModel = aGroups[i];
                                break;
                            }
                        }

                        if (oServerGroupModel) {
                            that.oPageBuilderService.getDefaultGroup().done(function (oDefaultGroup) {
                                var bIsDefaultGroup = sGroupId === oDefaultGroup.getId(),
                                    oGroupModel = that.getPreparedGroupModel(
                                        oServerGroupModel,
                                        bIsDefaultGroup,
                                        false,
                                        { isRendered: true }
                                    );
                                resolve(oGroupModel);
                            });
                        } else {
                            resolve(null);
                        }
                    });
            });
        },

        getIndexOfGroup: function (aGroups, oServerGroupObject) {
            var nGroupIndex = -1,
                that = this,
                sGroupId = this.oPageBuilderService.getGroupId(oServerGroupObject);
            aGroups.every(function (oModelGroup, nIndex) {
                var sCurrentGroupId = that.oPageBuilderService.getGroupId(oModelGroup.object);
                if (sCurrentGroupId === sGroupId) {
                    nGroupIndex = nIndex;
                    return false;
                }
                return true;
            });
            return nGroupIndex;
        },

        /*
         * returns the adapter cosponsoring group index
         */
        getOriginalGroupIndex: function (oGroupModel) {
            var srvc = this.oPageBuilderService,
                oServerGroupObject = oGroupModel.object,
                oGroupsPromise = this.oPageBuilderService.getGroups();

            return new Promise(function (resolve, reject) {
                oGroupsPromise.done(function (aGroups) {
                    var nGroupOrgIndex;
                    for (var i = 0; i < aGroups.length; i++) {
                        if (srvc.getGroupId(aGroups[i]) === srvc.getGroupId(oServerGroupObject)) {
                            nGroupOrgIndex = i;
                            break;
                        }
                    }
                    resolve(nGroupOrgIndex);
                }).fail(reject);
            });
        },

        moveTile: function (oTileModel, oIndexInfo, oSourceGroup, oTargetGroup, sType) {
            var that = this,
                oServerTileObject,
                oPromise = new Promise(function (resolve, reject) {
                    try {
                        var oResultPromise = that.oPageBuilderService.moveTile(
                            oTileModel.object,
                            oIndexInfo.tileIndex,
                            oIndexInfo.newTileIndex,
                            oSourceGroup.object,
                            oTargetGroup.object,
                            sType
                        );
                        oResultPromise.done(function (oTargetTile) {
                            var aUsageAnalyticsCustomProps = [
                                that.oPageBuilderService.getTileTitle(oTileModel.object),
                                that.oPageBuilderService.getGroupTitle(oSourceGroup.object),
                                that.oPageBuilderService.getGroupTitle(oTargetGroup.object),
                                oTileModel.uuid
                            ];
                            _logUsageAnalytics(analyticsConstants.MOVE_TILE, aUsageAnalyticsCustomProps);
                            oServerTileObject = oTargetTile;
                            resolve(oTargetTile);
                        });
                        oResultPromise.fail(reject);
                    } catch (err) {
                        reject();
                    }
                });
            return oPromise.then(this._getTileViewAsPromise.bind(this)).then(function (oView) {
                return Promise.resolve({
                    content: oView,
                    originalTileId: that.oPageBuilderService.getTileId(oServerTileObject),
                    object: oServerTileObject
                });
            });
        },

        removeTile: function (oGroupModel, oTileModel) {
            var that = this,
                oServerTileObject = oTileModel.object,
                sTileName = that.oPageBuilderService.getTileTitle(oServerTileObject),
                sCatalogTileId = that.oPageBuilderService.getCatalogTileId(oServerTileObject),
                sCatalogTileTitle = that.oPageBuilderService.getCatalogTileTitle(oServerTileObject),
                sTileRealId = that.oPageBuilderService.getTileId(oServerTileObject),
                oPromise;
            oPromise = new Promise(function (resolve, reject) {
                try {
                    that.oPageBuilderService.removeTile(oGroupModel.object, oServerTileObject)
                        .done(
                            function () {
                                oMessagingHelper.showLocalizedMessage("tile_deleted_msg", [sTileName, oGroupModel.title]);
                                _logUsageAnalytics(
                                    analyticsConstants.DELETE_TILE,
                                    [sTileName || sTileRealId,
                                        sCatalogTileId,
                                        sCatalogTileTitle,
                                    oGroupModel.title
                                    ]
                                );
                                resolve();
                            })
                        .fail(reject);
                } catch (err) {
                    reject();
                }
            });
            return oPromise;
        },

        _getTileViewAsPromise: function (oTargetTile) {
            var that = this,
                oPromise = new Promise(function (resolve, reject) {
                    var resultPromise = that.oPageBuilderService.getTileView(oTargetTile);
                    resultPromise.done(resolve);
                    resultPromise.fail(reject);
                });
            return oPromise;
        },

        refreshTile: function (oServerTileObject) {
            this.oPageBuilderService.refreshTile(oServerTileObject);
        },

        setTileVisible: function (oServerTileObject, bVisible) {
            this.oPageBuilderService.setTileVisible(oServerTileObject, bVisible);
        },

        getTileType: function (oServerTileObject) {
            return this.oPageBuilderService.getTileType(oServerTileObject);
        },

        getTileSize: function (oServerTileObject) {
            return this.oPageBuilderService.getTileSize(oServerTileObject);
        },

        getTileTitle: function (oTileModel) {
            return this.oPageBuilderService.getTileTitle(oTileModel.object);
        },

        getTileId: function (oServerTileObject) {
            return this.oPageBuilderService.getTileId(oServerTileObject);
        },

        isLinkPersonalizationSupported: function (oServerTileObject) {
            return this.oPageBuilderService.isLinkPersonalizationSupported(oServerTileObject);
        },
        getTileTarget: function (oTileModel) {
            return this.oPageBuilderService.getTileTarget(oTileModel.object);
        },

        // should return jQuerry promise, because for static tiles jQuerry promise is resolved immediately
        // and we can update model for these tiles for all static tiles ones and not one by one.
        getTileView: function (oTileModel) {
            return this.oPageBuilderService.getTileView(oTileModel.object);
        },

        /**
         * Returns internal and external tile actions.
         * Tile actions can be provided by external providers registered using
         * @see sap.ushell.services.LaunchPage.registerTileActionsProvider,
         * @alias sap.ushell.services.LaunchPage#getTileActions
         * and by internal provider that can provide tile actions
         * from the underlying implementation (i.e. adapter)
         *
         * @param oTile
         *   the tile
         * @returns {Array}
         *   tile actions
         */
        getTileActions: function (oTile) {
            return this.oPageBuilderService.getTileActions(oTile);
        },

        getFailedLinkView: function (oTileModel) {
            var vSubHeader = this.oPageBuilderService.getCatalogTilePreviewSubtitle(oTileModel.object);
            var vHeader = this.oPageBuilderService.getCatalogTilePreviewTitle(oTileModel.object);

            if (!vHeader && !vSubHeader) {
                vHeader = oResources.i18n.getText("cannotLoadLinkInformation");
            }

            return new GenericTile({
                mode: GenericTileMode.LineMode,
                state: LoadState.Failed,
                header: vHeader,
                subheader: vSubHeader
            });
        },

        getTileModelByCatalogTileId: function (sCatalogTileId) {
            Log.error("Cannot get tile with id " + sCatalogTileId + ": Method is not supported");
        },

        transformGroupModel: function (/*aGroups*/) {
            return;
        }
    });

    var adapterInstance = null;
    return {
        getInstance: function (oLaunchPageService) {
            if (!adapterInstance) {
                adapterInstance = new PersistentPageOperationAdapter(oLaunchPageService);
            }
            return adapterInstance;
        },
        destroy: function () {
            adapterInstance = null;
        }
    };
});
