// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ui/base/Object",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/ushell/components/MessagingHelper",
    "sap/m/GenericTile",
    "sap/m/ImageContent",
    "sap/m/TileContent",
    "sap/base/util/uid",
    "sap/base/Log",
    "sap/m/library"
], function (
    jQuery,
    BaseObject,
    Config,
    oResources,
    oMessagingHelper,
    GenericTile,
    ImageContent,
    TileContent,
    uid,
    Log,
    mobileLibrary
) {
    "use strict";

    // shortcut for sap.m.GenericTileMode
    var GenericTileMode = mobileLibrary.GenericTileMode;

    // shortcut for sap.m.LoadState
    var LoadState = mobileLibrary.LoadState;

    var TransientPageOperationAdapter = BaseObject.extend("sap.ushell.components._HomepageManager.TransientPageOperationAdapter.js", {
        constructor: function (oLaunchPageService) {
            BaseObject.call(this);
            this.oPageBuilderService = oLaunchPageService;
            this._createCatalogMap();
        },

        _createCatalogMap: function () {
            if (this.mCatalogTiles) {
                return;
            }

            var srvc = this.oPageBuilderService;
            var that = this;
            this.mCatalogTiles = {};
            this._getAllCatalogTiles().then(function (aCatalogTiles) {
                for (var i = 0; i < aCatalogTiles.length; i++) {
                    for (var j = 0; j < aCatalogTiles[i].length; j++) {
                        that.mCatalogTiles[srvc.getCatalogTileId(aCatalogTiles[i][j])] = aCatalogTiles[i][j];
                    }
                }
            });
        },

        getCurrentHiddenGroupIds: function (/*oModel*/) {
            return [];
        },

        getTileActions: function (oTile) {
            oTile.isStub = function () { return true; };
            var aResult = this.oPageBuilderService.getTileActions(oTile);
            delete oTile.isStub;
            return aResult;
        },

        getPreparedTileModel: function (oTile, isGroupLocked, sTileType) {
            var sTileUUID = uid();
            var aLinks = [];

            sTileType = sTileType || oTile.type;

            if (sTileType === "link") {
                aLinks = [new GenericTile({
                    mode: GenericTileMode.LineMode
                })];
            }

            var oTileModelData = {
                isCustomTile: false,
                object: oTile,
                originalTileId: sTileUUID,
                uuid: sTileUUID,
                tileCatalogId: "",
                content: aLinks,
                long: false,
                target: "", // 'target' will be defined (and get a value) later on after the tile will be valid
                debugInfo: null,
                isTileIntentSupported: true,
                rgba: "",
                isLocked: isGroupLocked,
                showActionsIcon: Config.last("/core/home/enableTileActionsIcon"),
                isLinkPersonalizationSupported: true,
                navigationMode: undefined
            };

            if (sTileType === "card") {
                oTileModelData.isCard = true;
                oTileModelData.manifest = {};
            }

            return oTileModelData;
        },

        getPreparedGroupModel: function (oGroup, bDefault, bLast, oData) {
            var groupId = uid();
            var aGroupTiles = (oGroup && oGroup.tiles) || [];
            var aModelTiles = [];
            var aModelLinks = [];

            for (var i = 0; i < aGroupTiles.length; ++i) {
                var oTile = aGroupTiles[i];
                var sTileType = oTile.type.toLowerCase(); //lowercase to make comparison easier
                if (sTileType === "tile" || sTileType === "card") {
                    aModelTiles.push(this.getPreparedTileModel(aGroupTiles[i], false, sTileType));
                } else if (sTileType === "link") {
                    aModelLinks.push(this.getPreparedTileModel(aGroupTiles[i], false, sTileType));
                } else {
                    Log.error("Unknown tile type: '" + sTileType + "'",
                        undefined,
                        "sap.ushell.components.HomepageManager"
                    );
                }
            }

            return {
                title: (bDefault && oMessagingHelper.getLocalizedText("my_group"))
                    || (oGroup && oGroup.title) || (oData && oData.title) || "",
                object: oGroup,
                groupId: groupId,
                links: aModelLinks,
                pendingLinks: [],
                tiles: aModelTiles,
                isDefaultGroup: !!bDefault,
                editMode: !oGroup,
                isGroupLocked: false,
                isFeatured: false,
                visibilityModes: [true, true],
                removable: true,
                sortable: true,
                isGroupVisible: true,
                isEnabled: !bDefault, //Currently only default groups is considered as locked
                isLastGroup: bLast || false,
                isRendered: !!(oData && oData.isRendered),
                isGroupSelected: false
            };
        },

        getPage: function () {
            return Promise.resolve([this.getPreparedGroupModel(null, false, true)]);
        },

        addGroupAt: function (oGroupModel, iGroupIndex, bDefaultGroup) {
            var oFakeData = { title: oGroupModel.title };
            // need to return the new prepared model, because the old is destroyed
            return Promise.resolve(this.getPreparedGroupModel({}, bDefaultGroup, oGroupModel.isLastGroup, oFakeData));
        },

        renameGroup: function (/*oGroupModel, sNewTitle, sOldTitle*/) {
            return Promise.resolve();
        },

        deleteGroup: function (/*oGroupModel*/) {
            return Promise.resolve();
        },

        moveGroup: function (/*oGroupModel, iToIndex, oIndicesInModel*/) {
            return Promise.resolve();
        },

        resetGroup: function (/*oGroupModel, bDefaultGroup*/) {
            return Promise.reject("Reset group not supported in transient mode");
        },

        refreshGroup: function (/*sGroupId*/) {
            return Promise.reject("Refresh group not supported in transient mode");
        },

        getIndexOfGroup: function (/*aGroups, oServerGroupObject*/) {
            return Promise.resolve(-1);
        },

        getOriginalGroupIndex: function (oGroupModel, aGroupsModel) {
            var iGroupIndex;
            for (var i = 0; i < aGroupsModel.length; i++) {
                if (aGroupsModel[i].groupId === oGroupModel.groupId) {
                    iGroupIndex = i;
                    break;
                }
            }
            return Promise.resolve(iGroupIndex);
        },

        moveTile: function (oTileModel, oIndexInfo, oSourceGroup, oTargetGroup, sType) {
            var oCatalogTile = this._findCatalogTile(oTileModel.tileCatalogId);
            return Promise.resolve({
                content: this._getTileView(oCatalogTile, sType),
                originalTileId: oTileModel.uuid,
                object: {
                    id: oTileModel.uuid,
                    type: sType,
                    title: this.oPageBuilderService.getCatalogTileTitle(oCatalogTile)
                }
            });
        },

        removeTile: function (/*oGroupModel, oTileModel*/) {
            return Promise.resolve();
        },

        _getTileView: function (oCatalogTile, sType) {
            if (sType === "link") {
                return new GenericTile({
                    mode: GenericTileMode.LineMode,
                    header: this.oPageBuilderService.getCatalogTileTitle(oCatalogTile),
                    subheader: this.oPageBuilderService.getCatalogTilePreviewSubtitle(oCatalogTile)
                });
            }
            return new GenericTile({
                header: this.oPageBuilderService.getCatalogTileTitle(oCatalogTile),
                subheader: this.oPageBuilderService.getCatalogTilePreviewSubtitle(oCatalogTile),
                tileContent: new TileContent({
                    content: new ImageContent({
                        src: this.oPageBuilderService.getCatalogTilePreviewIcon(oCatalogTile)
                    })
                })
            });
        },

        refreshTile: function () {
            return;
        },

        setTileVisible: function () {
            return;
        },

        getTileType: function (oServerTileObject) {
            return oServerTileObject.type;
        },

        getTileSize: function () {
            return "1x1";
        },

        getTileId: function (oServerTileObject) {
            return oServerTileObject.id;
        },

        isLinkPersonalizationSupported: function () {
            return true;
        },

        getTileTarget: function (oTileModel) {
            var oCatalogTile = this._findCatalogTile(oTileModel.tileCatalogId);
            return this.oPageBuilderService.getCatalogTileTargetURL(oCatalogTile);
        },

        getTileTitle: function (oTileModel) {
            return oTileModel.object.title;
        },

        _getAllCatalogTiles: function () {
            var oService = this.oPageBuilderService;

            // get the tiles and save catalog titles for display
            function getTiles (aCatalogs) {
                aCatalogs.map(function (oCatalog) {
                    var sCatalogId = oService.getCatalogId(oCatalog) || "";
                    return oService.getCatalogTitle(oCatalog) || sCatalogId.split(":").slice(1).join(":");
                });
                // CDM catalogs do not have the tiles[] array, get the tiles in a separate call
                return Promise.all(aCatalogs.map(function (oCatalog) {
                    return oService.getCatalogTiles(oCatalog);
                }));
            }

            return Promise.resolve(oService.getCatalogs()).then(getTiles);
        },

        _findCatalogTile: function (sCatalogTileId) {
            return this.mCatalogTiles[sCatalogTileId];
        },

        // should return jQuery promise, because for static tiles jQuery promise is resolved immediately
        // and we can update model for these tiles for all static tiles ones and not one by one.
        getTileView: function (oTileModel) {
            var oCatalogTile = this._findCatalogTile(oTileModel.tileCatalogId);
            var oView = this._getTileView(oCatalogTile, oTileModel.object.type);
            var oDeferred = new jQuery.Deferred();
            oDeferred.resolve(oView);
            return oDeferred.promise();
        },

        getFailedLinkView: function (oTileModel) {
            var vHeader = oTileModel.object.title || oResources.i18n.getText("cannotLoadLinkInformation");
            var vSubHeader = "";

            return new GenericTile({
                mode: GenericTileMode.LineMode,
                state: LoadState.Failed,
                header: vHeader,
                subheader: vSubHeader
            });
        },

        getTileModelByCatalogTileId: function (sCatalogTileId, sType) {
            sType = sType || "tile";
            var oCatalogTile = this._findCatalogTile(sCatalogTileId);
            var oTileModel = this.getPreparedTileModel({}, false, sType);
            oTileModel.tileCatalogId = sCatalogTileId;
            oTileModel.object = {
                id: oTileModel.uuid,
                type: sType,
                title: this.oPageBuilderService.getCatalogTileTitle(oCatalogTile)
            };

            var oView = this._getTileView(oCatalogTile, sType);
            oTileModel.content = [oView];

            return oTileModel;
        },

        transformGroupModel: function (aGroups) {
            var that = this;
            for (var i = 0; i < aGroups.length; i++) {
                var oGroupModel = aGroups[i];
                oGroupModel.object = {};
                oGroupModel.tiles.forEach(function (oTileModel) {
                    var oServerTile = oTileModel.object;
                    oTileModel.tileCatalogId = that.oPageBuilderService.getCatalogTileId(oServerTile);
                    oTileModel.object = {
                        id: oTileModel.uuid,
                        type: "tile",
                        title: that.oPageBuilderService.getTileTitle(oServerTile)
                    };
                });
                oGroupModel.links.forEach(function (oLinkModel) {
                    var oServerLink = oLinkModel.object;
                    oLinkModel.tileCatalogId = that.oPageBuilderService.getCatalogTileId(oServerLink);
                    oLinkModel.object = {
                        id: oLinkModel.uuid,
                        type: "link",
                        title: that.oPageBuilderService.getTileTitle(oServerLink)
                    };
                });
            }
            return aGroups;
        }
    });

    var adapterInstance;
    return {
        getInstance: function (oLaunchPageService) {
            if (!adapterInstance) {
                adapterInstance = new TransientPageOperationAdapter(oLaunchPageService);
            }
            return adapterInstance;
        },
        destroy: function () {
            adapterInstance = null;
        }
    };
});
