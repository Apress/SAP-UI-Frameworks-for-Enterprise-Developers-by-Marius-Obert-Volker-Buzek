// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @file The Unified Shell's page builder service providing the data for the Fiori launchpad's classic Homepage.
 * @version 1.113.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/extend",
    "sap/ushell/services/ContentExtensionAdapterFactory",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/resources",
    "sap/ushell/services/_AppState/AppStatePersistencyMethod",
    "sap/ushell/Config",
    "sap/m/library",
    "sap/m/GenericTile"
], function (
    Log,
    extend,
    ContentExtensionAdapterFactory,
    jQuery,
    resources,
    AppStatePersistencyMethod,
    Config,
    mobileLibrary,
    GenericTile
) {
    "use strict";

    // shortcut for sap.m.LoadState
    var LoadState = mobileLibrary.LoadState;

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call <code>sap.ushell.Container.getServiceAsync("LaunchPage").then(function (LaunchPage) {});</code>.
     * Constructs a new instance of the page builder service.
     *
     * @name sap.ushell.services.LaunchPage
     * @class A service for handling groups, tiles and catalogs.
     *
     * The functions that return the main objects are getGroups, getGroupTitle, getCatalogs and getCatalogTiles.
     * Since the implementation (i.e. adapter) is platform specific, do not call or access properties and functions of returned objects.
     * Instead, use other functions of the LaunchPage service with the relevant object as the input parameter.
     *
     * When using the content extension factory, any extended content needs to refer to the correct adapter with the field "contentProvider".
     *
     * @param {object} oAdapter the page builder adapter for the logon system
     * @param {object} oContainerInterface the interface provided by the container
     * @constructor
     * @see sap.ushell.services.Container#getServiceAsync
     * @since 1.15.0
     * @deprecated since 1.99. This service has been deprecated as it only works for the classic homepage.
     * @public
     */
    function LaunchPage (oAdapter/*, oContainerInterface*/) {
        var that = this,
            aTileActionsProviders = [],
            oAdaptersPromise = ContentExtensionAdapterFactory.getAdapters();

        this.oAdapters = { default: oAdapter };

        oAdaptersPromise.then(function (oAdapters) {
            extend(this.oAdapters, oAdapters);
        }.bind(this));

        /**
         * Returns the groups of the user.
         * In case of success, the <code>done</code> function gets an array of 'anonymous' groups.
         * The order of the array is the order in which the groups will be displayed to the user.
         *
         * @returns {Promise<object>} A promise that resolves to the list of groups
         * @public
         * @deprecated since 1.99. Alternative for use with {@link sap.ushell.services.Bookmark} is {@link sap.ushell.services.Bookmark#getContentNodes}
         * @alias sap.ushell.services.LaunchPage#getGroups
         */
        this.getGroups = function () {
            // In spaces/pages mode the classic homepage is switched-off.
            // It does not make sense to expose group data from it to any consumer like search, All-My-Apps and so on.
            // in order to not break any consumer, we fake that the user has no groups at all.
            if (Config.last("/core/spaces/enabled")) {
                return new jQuery.Deferred().resolve([]).promise();
            }

            var oDeferred = new jQuery.Deferred();

            oAdaptersPromise.then(function () {
                var aGroupsPromises = Object.keys(that.oAdapters).map(function (sAdapterName) {
                    return that._getAdapter(sAdapterName).getGroups();
                });

                jQuery.when.apply(jQuery, aGroupsPromises).done(
                    function () {
                        var groups = [].concat.apply([], arguments);
                        oDeferred.resolve(groups);
                    }).fail(function () {
                        Log.error("getGroups failed");
                    });
            });

            return oDeferred.promise();
        };

        /**
         * Same as "getGroups", but filters out all groups that can not be selected when adding a bookmark.
         * The API is used from "AddBookmarkButton"
         *
         * @param {boolean} bGetAll If set to `true`, all groups, including locked groups, are returned.
         *
         * @returns {Promise<object>} A promise that resolves to the list of groups
         * @private
         */
        this.getGroupsForBookmarks = function (bGetAll) {
            var oDeferred = new jQuery.Deferred();

            this.getGroups().then(function (aGroups) {
                this.getDefaultGroup().then(function (oDefaultGroup) {
                    if (aGroups.length > 0) {
                        aGroups = aGroups.filter(function (group) {
                            if (bGetAll === true) {
                                return this.isGroupVisible(group);
                            }
                            return !this.isGroupLocked(group) && this.isGroupVisible(group);
                        }.bind(this));

                        // create the model structure
                        aGroups = aGroups.map(function (group) {
                            return {
                                title: (group === oDefaultGroup && resources.i18n.getText("my_group")) || this.getGroupTitle(group),
                                object: group
                            };
                        }.bind(this));
                    }

                    oDeferred.resolve(aGroups);
                }.bind(this), function (oError) {
                    Log.error("getGroupsForBookmarks - getDefaultGroup - failed: " + oError.message);
                });
            }.bind(this), function (oError) {
                Log.error("getGroupsForBookmarks - getGroups - failed: " + oError.message);
            });

            return oDeferred.promise();
        };

        /**
         * Fetches the group tiles and clones them for the search
         * This ensures that on ABAP the tiles and in the runtime and the
         * search are not connected anymore via the common chipInstance
         *
         * @param {object} oGroup The group whose tiles are returned
         *
         * @see sap.ushell.services.LaunchPage#getGroupTiles
         *
         * @returns {Promise<object[]>} The group tiles array
         * @since 1.113.0
         * @private
         *
         * @alias sap.ushell.services.LaunchPage#getGroupTilesForSearch
         */
        this.getGroupTilesForSearch = function (oGroup) {
            var oAdapter = this._getAdapter(oGroup.contentProvider);

            if (oAdapter.getGroupTileClones) {
                return oAdapter.getGroupTileClones(oGroup);
            }
            return Promise.resolve(this.getGroupTiles(oGroup));
        };

        /**
         * Returns the default group of the user.
         * In case of success, the <code>done</code> function gets an 'anonymous' object representing the default group.
         *
         * @returns {object} jQuery.promise object.
         * @public
         * @alias sap.ushell.services.LaunchPage#getDefaultGroup
         */
        this.getDefaultGroup = function () {
            var oPromise = this._getAdapter().getDefaultGroup();
            oPromise.fail(function () {
                Log.error("getDefaultGroup failed");
            });
            return oPromise;
        };

        /**
         * Returns the title of the given group.
         *
         * @param {object} oGroup The group whose title is returned
         * @returns {string} group title
         * @public
         * @alias sap.ushell.services.LaunchPage#getGroupTitle
         */
        this.getGroupTitle = function (oGroup) {
            return this._getAdapter(oGroup.contentProvider).getGroupTitle(oGroup);
        };

        /**
         * Returns the unique identifier of the given group
         *
         * @param {object} oGroup The group whose id is returned
         * @returns {string} Group id
         * @public
         * @alias sap.ushell.services.LaunchPage#getGroupId
         */
        this.getGroupId = function (oGroup) {
            return this._getAdapter(oGroup.contentProvider).getGroupId(oGroup);
        };

        /**
         * Returns a group object by its ID
         *
         * @param {string} sGroupId The group id
         * @returns {object} jQuery.promise object.
         * @private
         */
        this.getGroupById = function (sGroupId) {
            var oDeferred = new jQuery.Deferred();

            this.getGroups().then(function (aGroups) {
                oDeferred.resolve(aGroups.find(function (oGroup) {
                    return this.getGroupId(oGroup) === sGroupId;
                }.bind(this)));
            }.bind(this));

            return oDeferred.promise();
        };

        /**
         * Returns an array of 'anonymous' tiles of a group.
         * The order of the array is the order of tiles that will be displayed to the user.
         *
         * @param {object} oGroup The group whose tiles are returned
         * @returns {object[]} The group tiles array
         * @public
         * @alias sap.ushell.services.LaunchPage#getGroupTiles
         */
        this.getGroupTiles = function (oGroup) {
            return this._getAdapter(oGroup.contentProvider).getGroupTiles(oGroup);
        };

        /**
         * Returns an array of 'anonymous' tiles of a group.
         * The order of the array is the order of tiles that will be displayed to the user.
         *
         * @param {string} sGroupId the group id
         * @returns {object[]} The group tiles array
         * @private
         */
        this.getTilesByGroupId = function (sGroupId) {
            var Deferred = new jQuery.Deferred(),
                that = this;

            this.getGroupById(sGroupId).then(function (oGroup) {
                if (oGroup) {
                    var aTiles = that._getAdapter(oGroup.contentProvider).getGroupTiles(oGroup);

                    if (aTiles) {
                        aTiles = aTiles.map(function (oTile) {
                            return {
                                id: that.getTileId(oTile),
                                title: that.getTileTitle(oTile),
                                subtitle: that.getCatalogTilePreviewSubtitle(oTile),
                                //info: that.getCatalogTilePreviewInfo(oTile), //not supported yet in CDM
                                url: that.getCatalogTileTargetURL(oTile),
                                icon: that.getCatalogTilePreviewIcon(oTile),
                                groupId: sGroupId
                            };
                        });
                    } else {
                        aTiles = [];
                    }

                    Deferred.resolve(aTiles);
                } else {
                    Deferred.resolve([]);
                }
            });

            return Deferred.promise();
        };

        /**
         * Returns an array of link tiles for a group.
         * The order of the array is the order in which the links will be displayed to the user.
         *
         * @param {object} oGroup The group whose link tiles are returned
         * @returns {object[]} The array of link tiles
         * @public
         * @alias sap.ushell.services.LaunchPage#getLinkTiles
         */
        this.getLinkTiles = function (oGroup) {
            return this._getAdapter(oGroup.contentProvider).getLinkTiles(oGroup);
        };

        /**
         * Adds a new group at a specific location.
         *
         * In case of success, the <code>done</code> function gets the new added group object.
         * Intention: the page builder adds this group to the specific location on the home screen.
         *
         * In case of failure, the <code>fail</code> function returns the consistent (i.e. persisted) backend state of all groups.
         *
         * @param {string} sTitle The title of the new group
         * @param {int} iIndex the location of the new group
         * @returns {object} jQuery.promise object
         * @public
         * @alias sap.ushell.services.LaunchPage#addGroupAt
         */
        this.addGroupAt = function (sTitle, iIndex) {
            var oPromise, index = iIndex,
                oAdapter = this._getAdapter();

            if (oAdapter.addGroupAt) {
                oPromise = oAdapter.addGroupAt(sTitle, iIndex);
                oPromise.fail(function () {
                    Log.error("addGroup " + sTitle + " failed");
                });
            } else {
                var oDeferred = new jQuery.Deferred();

                oPromise = oAdapter.addGroup(sTitle);
                oPromise.done(function (oNewGroup/*, sGroupId*/) {
                    var movePromise = this.moveGroup(oNewGroup, index),
                        newGroup = oNewGroup;
                    movePromise.done(function () {
                        oDeferred.resolve(newGroup);
                    });
                    movePromise.fail(function () {
                        oDeferred.reject();
                    });
                }.bind(this));

                oPromise.fail(function () {
                    Log.error("addGroup " + sTitle + " failed");
                    oDeferred.reject();
                });

                return oDeferred.promise();
            }

            return oPromise;
        };

        /**
         * Adds a new group.
         *
         * In case of success, the <code>done</code> function gets the new added group object.
         * Intention: the page builder adds this group to the end of the home screen.
         *
         * In case of failure, the <code>fail</code> function returns the consistent (i.e. persisted) backend state of all groups.
         *
         * @param {string} sTitle The title of the new group
         * @returns {object} jQuery.promise object
         * @public
         * @alias sap.ushell.services.LaunchPage#addGroup
         */
        this.addGroup = function (sTitle) {
            var oPromise = this._getAdapter().addGroup(sTitle);
            oPromise.fail(function () {
                Log.error("addGroup " + sTitle + " failed");
            });
            return oPromise;
        };

        /**
         * Removes a group.
         *
         * In case of success, the <code>done</code> function is called without any value (i.e. input data).
         * Intention: the page builder already removed the page (or hid it from the user) and if successful - nothing needs to be done.
         *
         * In case of failure, the <code>fail</code> function returns the consistent (i.e. persisted) backend state of all groups.
         *
         * @param {object} oGroup The group to be removed
         * @param {int} iIndex The index of the group to be removed
         * @returns {object} jQuery.promise object
         * @public
         * @alias sap.ushell.services.LaunchPage#removeGroup
         */
        this.removeGroup = function (oGroup, iIndex) {
            var oPromise = this._getAdapter(oGroup.contentProvider).removeGroup(oGroup, iIndex);
            oPromise.fail(function () {
                Log.error("Fail to removeGroup " + that.getGroupTitle(oGroup));
            });
            return oPromise;
        };

        /**
         * Resets a group.
         *
         * The reset action is relevant for a group that was assigned to the user by an administrator.
         * The reset action means that the group is set back to the state defined by the administrator,
         * and changes made by the end user (e.g. adding tiles) are removed.
         * A group can be reset multiple times.
         *
         * In case of success, the <code>done</code> function gets the reset group object.
         *
         * In case of failure, or when the given group was created by the user (i.e. can't be reset)- <code>fail</code> handler is called,
         * returning the consistent (i.e. persisted) backend state of all groups.
         * The returned group object is the same as the one returned by @see sap.ushell.services.LaunchPage.getGroups
         *
         * @param {object} oGroup The group to be reset
         * @param {int} iIndex The index of the group to be reset
         * @returns {object} jQuery.promise object
         * @public
         * @alias sap.ushell.services.LaunchPage#resetGroup
         */
        this.resetGroup = function (oGroup, iIndex) {
            var oPromise = this._getAdapter(oGroup.contentProvider).resetGroup(oGroup, iIndex);
            oPromise.fail(function () {
                Log.error("Fail to resetGroup " + that.getGroupTitle(oGroup));
            });
            return oPromise;
        };

        /**
         * Checks if a group can be removed.
         *
         * Returns <code>true</code> if the group can be removed (i.e. if the given group was created by the user)
         * and <code>false</code> if the group can only be reset.
         *
         * @param {object} oGroup The group to be checked
         * @returns {boolean} <code>true</code> if removable; <code>false</code> if resettable
         * @public
         * @alias sap.ushell.services.LaunchPage#isGroupRemovable
         */
        this.isGroupRemovable = function (oGroup) {
            return this._getAdapter(oGroup.contentProvider).isGroupRemovable(oGroup);
        };

        /**
         * Checks if a group was marked as locked (meaning the group and its tiles will lack several capabilities such as Rename, Drag&Drop...).
         *
         * Returns <code>true</code> if the group is locked and <code>false</code> if not.
         *
         * @param {object} oGroup The group to be checked
         * @returns {boolean} <code>true</code> if locked; <code>false</code> if not (or as default in case the function was not implemented in the proper adapter).
         * @public
         * @alias sap.ushell.services.LaunchPage#isGroupLocked
         */
        this.isGroupLocked = function (oGroup) {
            var oAdapter = this._getAdapter(oGroup.contentProvider);
            if (typeof oAdapter.isGroupLocked === "function") {
                return oAdapter.isGroupLocked(oGroup);
            }
            return false;
        };

        /**
         * Checks if a group was marked as featured (meaning the group is a Fiori 3 featured group).
         *
         * Returns <code>true</code> if the group is featured and <code>false</code> if not.
         *
         * @param {object} oGroup The group to be checked
         * @returns {boolean} <code>true</code> if featured; <code>false</code> if not (or as default in case the function was not implemented in the proper adapter).
         * @public
         * @alias sap.ushell.services.LaunchPage#isGroupFeatured
         */
        this.isGroupFeatured = function (oGroup) {
            var oAdapter = this._getAdapter(oGroup.contentProvider);
            if (typeof oAdapter.isGroupFeatured === "function") {
                return oAdapter.isGroupFeatured(oGroup);
            }
            return false;
        };

        /**
         * Moves a group to a new index (i.e. location).
         *
         * In case of success, the <code>done</code> function is called without any value.
         * Intention: the page builder already moved the page (visible to the user) and if successful - nothing needs to be done.
         * In case of failure, the <code>fail</code> function returns the consistent (i.e. persisted) backend state of all groups.
         *
         * @param {object} oGroup The group to be moved
         * @param {int} iNewIndex The new index for the group
         * @returns {object} jQuery.promise object
         * @public
         * @alias sap.ushell.services.LaunchPage#moveGroup
         */
        this.moveGroup = function (oGroup, iNewIndex) {
            var oPromise = this._getAdapter(oGroup.contentProvider).moveGroup(oGroup, iNewIndex);
            oPromise.fail(function () {
                Log.error("Fail to moveGroup " + that.getGroupTitle(oGroup));
            });
            return oPromise;
        };

        /**
         * Sets the title of an existing group.
         *
         * In case of success, the <code>done</code> function returns nothing.
         * Intention: the page builder knows the new title, and if successful nothing needs to be done, as the title is already visible to the user.
         * In case of failure, the <code>fail</code> function returns the consistent (i.e. persisted) backend state of the group title,
         *   in most cases the old title.
         *
         * @param {object} oGroup The group whose title is set
         * @param {string} sTitle The new title of the group
         * @returns {object} jQuery.promise object
         * @public
         * @alias sap.ushell.services.LaunchPage#setGroupTitle
         */
        this.setGroupTitle = function (oGroup, sTitle) {
            var oPromise = this._getAdapter(oGroup.contentProvider).setGroupTitle(oGroup, sTitle);
            oPromise.fail(function () {
                Log.error("Fail to set Group title: " + that.getGroupTitle(oGroup));
            });
            return oPromise;
        };

        /**
         * This function receives an array of groups IDs that were selected as hidden by the end user and stores them in the back-end for persistency.
         * Any group not in the list will become visible (again).
         *
         * @param {string[]} aHiddenGroupsIDs An Array containing the IDs of the groups that should be stored as hidden.
         * @returns {object} promise object.
         */
        this.hideGroups = function (aHiddenGroupsIDs) {
            var oDeferred = new jQuery.Deferred(),
                oAdapter = this._getAdapter();
            if (typeof oAdapter.hideGroups !== "function") {
                oDeferred.reject("hideGroups() is not implemented in the Adapter.");
            } else {
                oAdapter.hideGroups(aHiddenGroupsIDs).done(function () {
                    oDeferred.resolve();
                }).fail(function (sMsg) {
                    Log.error("Fail to store groups visibility." + sMsg);
                    oDeferred.reject();
                });
            }
            return oDeferred.promise();
        };

        /**
         * This function checks if a group should be visible or hidden for the specific end user.
         * An end user has the ability to configure which groups should be hidden in his dashboard (as long as edit mode is enabled).
         *
         * @param {object} oGroup A group to be checked
         * @returns {boolean} true \ false accordingly.
         */
        this.isGroupVisible = function (oGroup) {
            var oAdapter = this._getAdapter(oGroup.contentProvider);
            if (typeof oAdapter.isGroupVisible === "function") {
                return oAdapter.isGroupVisible(oGroup);
            }
            return true;
        };

        /**
         * Adds a tile to a group.
         *
         * If no group is provided then the tile is added to the default group.
         *
         * In case of success, the <code>done</code> function returns the new tile.
         * Intention: the page builder by default puts this tile at the end of the default group.
         * In case of failure, the <code>fail</code> function should return the consistent (i.e. persisted) backend state of the default group.
         *
         * @param {object} oCatalogTile An 'anonymous' tile from the tile catalog
         * @param {object} [oGroup] The target group
         * @returns {object} jQuery.promise object
         * @public
         * @alias sap.ushell.services.LaunchPage#addTile
         */
        this.addTile = function (oCatalogTile, oGroup) {
            return this._getAdapter(oGroup.contentProvider).addTile(oCatalogTile, oGroup)
                .fail(function (aGroups, vError) {
                    Log.error("Fail to add Tile: " + that.getCatalogTileId(oCatalogTile), vError, "sap.ushell.services.LaunchPage");
                });
        };

        /**
         * Removes a tile from a group.
         *
         * In case of success, the <code>done</code> function returns the new tile.
         * Intention: the page builder has already 'hidden' (or removed) the tile.
         *
         * In case of failure, the <code>fail</code> function should return the consistent (i.e. persisted) backend state of the group.
         *
         * @param {object} oGroup The group from which to remove the tile instance
         * @param {object} oTile The tile instance to remove
         * @param {int} iIndex The tile index
         * @returns {object} jQuery.promise object
         * @public
         * @alias sap.ushell.services.LaunchPage#removeTile
         */
        this.removeTile = function (oGroup, oTile, iIndex) {
            var oDeferred = new jQuery.Deferred();

            sap.ushell.Container.getServiceAsync("AppState")
                .then(function (AppStateService) {
                    this._getAdapter(oGroup.contentProvider).removeTile(oGroup, oTile, iIndex)
                        .done(function () {
                            var sTileUrl = this.getCatalogTileTargetURL(oTile);

                            this.deleteURLStatesPersistentData(sTileUrl, AppStateService);

                            oDeferred.resolve();
                        }.bind(this))
                        .fail(function (error) {
                            Log.error("Fail to remove Tile: " + this.getTileId(oTile));
                            oDeferred.reject(error);
                        }.bind(this));
                }.bind(this))
                .catch(oDeferred.reject);

            return oDeferred.promise();
        };

        /**
         * Moves a tile within a group or between different groups.
         *
         * In case of success, the <code>done</code> function returns nothing.
         * Intention: the page builder already moved the tile.
         *
         * In case of failure, the <code>fail</code> function returns the consistent (i.e. persisted) backend state of the source group and the target group.
         * The result is in the following format {source:[{},{}], target:[{},{}]}.
         *
         * The source and the target groups tiles are in the form of the @see sap.ushell.services.LaunchPage.getGroupTiles
         *
         * @param {object} oTile a tile instance to be moved. The same object type as the one returned by
         *   <code>sap.ushell.services.LaunchPage.getGroupTiles</code>
         * @param {int} iSourceIndex the index in the source group
         * @param {int} iTargetIndex the target group index, in case this parameter is not supplied we assume the move tile is
         *   within the source group using iSourceIndex
         * @param {object} oSourceGroup the source group the tile came from
         * @param {object} [oTargetGroup] The same object type as the one returned by <code>sap.ushell.services.LaunchPage.getGroups</code>
         *   the target group the tile will be placed in, in case this parameter is not supplied we assume the move tile is within the source group
         * @param {string} [sNewTileType] (added with 1.46) The new type of the tile
         * @returns {object} jQuery.promise object
         * @public
         * @alias sap.ushell.services.LaunchPage#moveTile
         */
        this.moveTile = function (oTile, iSourceIndex, iTargetIndex, oSourceGroup, oTargetGroup, sNewTileType) {
            var oPromise = this._getAdapter().moveTile(oTile, iSourceIndex, iTargetIndex, oSourceGroup, oTargetGroup, sNewTileType);
            oPromise.fail(function () {
                Log.error("Fail to move Tile: " + that.getTileId(oTile));
            });
            return oPromise;
        };

        /**
         * Returns <code>true</code> if link personalization is allowed for the tile.
         *
         * In case this tile parameter is not supplied, returns <code>true</code> if the link personalization feature is allowed at least for some of the tiles.
         *
         * @param {object} oTile A tile instance.
         * @returns {boolean} Returns <code>true</code> if the tile's link personalization is allowed
         * @private
         */
        this.isLinkPersonalizationSupported = function (oTile) {
            var sAdapterName = oTile && oTile.contentProvider,
                oAdapter = this._getAdapter(sAdapterName);
            if (typeof oAdapter.isLinkPersonalizationSupported === "function") {
                return oAdapter.isLinkPersonalizationSupported(oTile);
            }
            return false;
        };

        /**
         * Returns the tile's unique identifier
         *
         * @param {object} oTile The tile
         * @returns {string} Tile id
         * @public
         * @alias sap.ushell.services.LaunchPage#getTileId
         */
        this.getTileId = function (oTile) {
            var sAdapterName = oTile && oTile.contentProvider;
            return this._getAdapter(sAdapterName).getTileId(oTile);
        };

        /**
         * Returns the tile's title.
         *
         * @param {object} oTile The tile
         * @returns {string} The title
         * @public
         * @alias sap.ushell.services.LaunchPage#getTileTitle
         */
        this.getTileTitle = function (oTile) {
            var sAdapterName = oTile && oTile.contentProvider;
            return this._getAdapter(sAdapterName).getTileTitle(oTile);
        };

        /**
         * Returns the tile's type.
         *
         * @param {object} oTile The tile
         * @returns {string} The type
         * @public
         * @alias sap.ushell.services.LaunchPage#getTileType
         */
        this.getTileType = function (oTile) {
            var sAdapterName = oTile && oTile.contentProvider,
                oAdapter = this._getAdapter(sAdapterName);
            if (oAdapter.getTileType) {
                return oAdapter.getTileType(oTile);
            }
            return "tile";
        };

        /**
         * Returns UI5 view or control of the tile.
         * In case of success the <code>done</code> function should return UI5 view or control of the tile.
         * In case of failure the <code>fail</code> function should return nothing.
         *
         * @param {object} oTile The tile
         * @returns {object} jQuery.promise object
         * @public
         * @alias sap.ushell.services.LaunchPage#getTileView
         */
        this.getTileView = function (oTile) {
            var sAdapterName = oTile && oTile.contentProvider,
                oDfd = this._getAdapter(sAdapterName).getTileView(oTile);

            /**
             * API has change to return a promise object instead the tile view since 1.24 version.
             * For backwards compatibility we check if the adapter has return a promise object,
             * if not we create one resolve it with the tile view and return the promise
             */
            if (!jQuery.isFunction(oDfd.promise)) {
                oDfd = new jQuery.Deferred().resolve(oDfd).promise();
            }

            return oDfd;
        };

        /**
         * @param {object} oGroupCard The card
         * @returns {object} The card's manifest
         * @private
         */
        this.getCardManifest = function (oGroupCard) {
            var sAdapterName = oGroupCard && oGroupCard.contentProvider;
            return this._getAdapter(sAdapterName).getCardManifest(oGroupCard);
        };

        /**
         * Returns the press handler for clicking on a tile.
         *
         * @param {object} oTile The tile
         * @returns {function} handler for clicking on the tile.
         * @public
         * @alias sap.ushell.services.LaunchPage#getAppBoxPressHandler
         */
        this.getAppBoxPressHandler = function (oTile) {
            var sAdapterName = oTile && oTile.contentProvider,
                oAdapter = this._getAdapter(sAdapterName);
            if (oAdapter.getAppBoxPressHandler) {
                return oAdapter.getAppBoxPressHandler(oTile);
            }
            return undefined;
        };

        /**
         * Returns the tile size in the format of 1x1 or 1x2 string
         *
         * @param {object} oTile The tile
         * @returns {string} tile size in units in 1x1 format
         * @public
         * @alias sap.ushell.services.LaunchPage#getTileSize
         */
        this.getTileSize = function (oTile) {
            var sAdapterName = oTile && oTile.contentProvider;
            return this._getAdapter(sAdapterName).getTileSize(oTile);
        };

        /**
         * Returns the tile's navigation target.
         *
         * The navigation target string is used (when assigned to <code>location.hash</code>) for performing a navigation action
         *   that eventually opens the application represented by the tile.
         *
         * @param {object} oTile the tile
         * @returns {string} the tile target
         * @public
         * @alias sap.ushell.services.LaunchPage#getTileTarget
         */
        this.getTileTarget = function (oTile) {
            var sAdapterName = oTile && oTile.contentProvider;
            return this._getAdapter(sAdapterName).getTileTarget(oTile);
        };

        /**
         * Returns the technical information about the tile which can be helpful for problem analysis.<p>
         * The implementation of this method in the platform-specific adapter is optional.
         *
         * @param {object} oTile the tile
         * @returns {string} debug information for the tile
         */
        this.getTileDebugInfo = function (oTile) {
            var sAdapterName = oTile && oTile.contentProvider,
                oAdapter = this._getAdapter(sAdapterName);
            if (typeof oAdapter.getTileDebugInfo === "function") {
                return oAdapter.getTileDebugInfo(oTile);
            }
            return undefined;
        };

        /**
         * Returns <code>true</code> if the tile's target intent is supported taking into account the form factor of the current device.
         * "Supported" means that navigation to the intent is possible.<p>
         * This function may be called both for group tiles and for catalog tiles.
         *
         * @param {object} oTile the group tile or catalog tile
         * @returns {boolean} <code>true</code> if the tile's target intent is supported
         * @since 1.21.0
         */
        this.isTileIntentSupported = function (oTile) {
            var sAdapterName = oTile && oTile.contentProvider,
                oAdapter = this._getAdapter(sAdapterName);
            if (typeof oAdapter.isTileIntentSupported === "function") {
                return oAdapter.isTileIntentSupported(oTile);
            }
            return true;
        };

        /**
         * Triggers a refresh action of a tile.
         * Typically this action is related to the value presented in dynamic tiles
         *
         * @param {object} oTile The tile
         * @public
         * @alias sap.ushell.services.LaunchPage#refreshTile
         */
        this.refreshTile = function (oTile) {
            var sAdapterName = oTile && oTile.contentProvider;
            this._getAdapter(sAdapterName).refreshTile(oTile);
        };

        /**
         * Sets the tile's visibility state and notifies the tile about the change.
         *
         * @param {object} oTile The tile
         * @param {boolean} bNewVisible The tile's required visibility state.
         * @public
         * @alias sap.ushell.services.LaunchPage#setTileVisible
         */
        this.setTileVisible = function (oTile, bNewVisible) {
            var sAdapterName = oTile && oTile.contentProvider;
            this._getAdapter(sAdapterName).setTileVisible(oTile, bNewVisible);
        };

        /**
         * Register an external tile actions provider callback function.
         *
         * The callback has to return an array of actions of the given tile.
         * The callback is triggered when @see sap.ushell.services.LaunchPage.getTileActions is called.
         *
         * Tile actions are additional operations that can be executed on a tile, and can be provided by external providers.
         *
         * A tile action is an object with the following properties: text, icon and targetURL or a press handler.
         *
         * Tile actions should be returned immediately without any additional server access in order to avoid delays in rendering the action list in the browser.
         *
         * @example of a tile actions provider callback:
         * <pre>
         *     function (oTile){
         *       return [
         *         {
         *           text: "Some Action",
         *           icon: "sap-icon://action",
         *           targetURL: "#SemanticObject-Action"
         *         },
         *         {
         *           text: "Settings",
         *           icon: "sap-icon://action-settings",
         *           press: function () {
         *             //Open settings UI
         *           }
         *         }
         *       ];
         *     }
         * </pre>
         *
         * Use <code>Function.prototype.bind()</code> to determine the callback's <code>this</code> or some of its arguments.
         *
         * @param {Object} fnProvider A callback which returns an array of action objects.
         * @public
         * @deprecated since 1.99. This feature has been deprecated with the classic homepage. There is no alternative with spaces and pages.
         * @alias sap.ushell.services.LaunchPage#registerTileActionsProvider
         */
        this.registerTileActionsProvider = function (fnProvider) {
            if (typeof fnProvider !== "function") {
                throw new Error("Tile actions Provider is not a function");
            }
            aTileActionsProviders.push(fnProvider);
        };

        /**
         * Returns internal and external tile actions.
         * Tile actions are shown in the UI in the edit mode of the launchpad and can be provided by
         * external providers registered using {@link #registerTileActionsProvider}
         * and by internal provider that can provide tile actions from the underlying implementation (i.e. adapter)
         * @alias sap.ushell.services.LaunchPage#getTileActions
         *
         * @param {object} oTile the tile to get the actions for
         * @returns {object[]} tile actions
         */
        this.getTileActions = function (oTile) {
            var aTileActions = [],
                aActions,
                sAdapterName = oTile && oTile.contentProvider,
                oAdapter = this._getAdapter(sAdapterName);

            if (typeof oAdapter.getTileActions === "function") {
                aActions = oAdapter.getTileActions(oTile);
                if (aActions && aActions.length) {
                    aTileActions.push.apply(aTileActions, aActions);
                }
            }

            for (var i = 0; i < aTileActionsProviders.length; i++) {
                aActions = aTileActionsProviders[i](oTile);
                if (aActions && aActions.length) {
                    aTileActions.push.apply(aTileActions, aActions);
                }
            }

            return aTileActions;
        };

        /**
         * Returns the catalogs of the user.
         * <p>
         * Only severe failures make the overall operation fail. If loading of a remote catalog fails,
         * this is handled gracefully by providing a "dummy" empty catalog (with ID instead of title).
         * Use {@link getCatalogError} to check if a (remote) catalog could not be loaded from the backend.
         * <p>
         * Progress notifications are sent for each single catalog, i.e. attaching a <code>progress</code> handler gives you the same
         * possibilities as attaching a <code>done</code> handler, but with the advantage of improved responsiveness.
         *
         * @example
         *   sap.ushell.Container.getServiceAsync("LaunchPage")
         *     .then(function (LaunchPage) {
         *       LaunchPage.getCatalogs()
         *       .fail(function (sErrorMessage) { // string
         *         // handle error situation
         *       })
         *       .progress(function (oCatalog) { // object
         *         // do s.th. with single catalog
         *       })
         *       .done(function (aCatalogs) { // object[]
         *         aCatalogs.forEach(function (oCatalog) {
         *           // do s.th. with single catalog
         *         });
         *       });
         *     });
         *
         * @returns {object} <code>jQuery.Deferred</code> object's promise
         *   In case of success, an array of black-box catalog objects is provided (which might be empty).
         *   In case of failure, an error message is passed.
         *   Progress notifications are sent for each single catalog, providing a single black-box catalog object each time.
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogs
         */
        this.getCatalogs = function () {
            return this._getAdapter().getCatalogs();
        };

        /**
         * Returns whether the catalogs collection previously returned by <code>getCatalogs()</code> is still valid.
         *
         * Initially the result is <code>false</code> until <code>getCatalogs()</code> has been called.
         * Later, the result might be <code>false</code> again in case one of the catalogs has been invalidated,
         * e.g. due to adding a tile to a catalog ("Add to catalog" scenario).
         *
         * @returns {boolean} <code>true</code> in case the catalogs are still valid; <code>false</code> if not
         * @since 1.16.4
         * @see #getCatalogs
         * @public
         * @alias sap.ushell.services.LaunchPage#isCatalogsValid
         */
        this.isCatalogsValid = function () {
            return this._getAdapter().isCatalogsValid();
        };

        /**
         * Returns catalog's technical data.
         *
         * @param {object} oCatalog the catalog
         * @returns {object} An object that includes the following properties (the list may include additional properties):
         *   <ul>
         *     <li><code>id</code>: the catalog ID
         *     <li><code>systemId</code>: [remote catalogs] the ID of the remote system
         *     <li><code>remoteId</code>: [remote catalogs] the ID of the catalog in the remote system
         *     <li><code>baseUrl</code>: [remote catalogs] the base URL of the catalog in the remote system
         *   </ul>
         * @since 1.21.2
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogData
         */
        this.getCatalogData = function (oCatalog) {
            var oLaunchpageAdapter = this._getAdapter();
            if (typeof oLaunchpageAdapter.getCatalogData !== "function") {
                Log.warning("getCatalogData not implemented in adapter", null,
                    "sap.ushell.services.LaunchPage");
                return {
                    id: this.getCatalogId(oCatalog)
                };
            }
            return oLaunchpageAdapter.getCatalogData(oCatalog);
        };

        /**
         * Returns the catalog's technical error message in case it could not be loaded from the backend.
         * <p>
         * <b>Beware:</b> The technical error message is not translated!
         *
         * @param {object} oCatalog the catalog
         * @returns {string} The technical error message or <code>undefined</code> if the catalog was loaded properly
         * @since 1.17.1
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogError
         */
        this.getCatalogError = function (oCatalog) {
            return this._getAdapter().getCatalogError(oCatalog);
        };

        /**
         * Returns the catalog's unique identifier
         *
         * @param {object} oCatalog The catalog
         * @returns {string} Catalog id
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogId
         */
        this.getCatalogId = function (oCatalog) {
            return this._getAdapter().getCatalogId(oCatalog);
        };

        /**
         * Returns the catalog's title
         *
         * @param {object} oCatalog The catalog
         * @returns {string} Catalog title
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogTitle
         */
        this.getCatalogTitle = function (oCatalog) {
            return this._getAdapter().getCatalogTitle(oCatalog);
        };

        /**
         * Returns the tiles of a catalog.
         * In case of success, the <code>done</code> function of the returned promise object gets an array of 'anonymous' tiles of the catalog.
         *
         * @param {object} oCatalog The catalog
         * @returns {object} jQuery.promise object.
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogTiles
         */
        this.getCatalogTiles = function (oCatalog) {
            var oPromise = this._getAdapter().getCatalogTiles(oCatalog);
            oPromise.fail(function () {
                Log.error("Fail to get Tiles of Catalog: " + that.getCatalogTitle(oCatalog));
            });
            return oPromise;
        };

        /**
         * Returns catalog tile's unique identifier.
         * This function may be called for a catalog tile or (since 1.21.0) for a group tile.
         * In the latter case, the function returns the unique identifier of the catalog tile on which the group tile is based.
         *
         * @param {object} oTile The tile or the catalog tile
         * @returns {string} Tile id
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogTileId
         */
        this.getCatalogTileId = function (oTile) {
            return this._getAdapter(oTile.contentProvider).getCatalogTileId(oTile);
        };

        /**
         * Returns the stable id of the catalog tile
         *
         * @param {object} oTile The tile or the catalog tile
         * @returns {string} Tile stable id
         * @since 1.98.0
         * @private
         * @alias sap.ushell.services.LaunchPage#getStableCatalogTileId
         */
        this.getStableCatalogTileId = function (oTile) {
            var oAdapter = this._getAdapter(oTile.contentProvider);

            if (oAdapter && !oAdapter.getStableCatalogTileId) {
                return null;
            }

            return oAdapter.getStableCatalogTileId(oTile);
        };

        /**
         * Returns the catalog tile's title
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string} Tile title
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogTileTitle
         */
        this.getCatalogTileTitle = function (oCatalogTile) {
            var sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            return this._getAdapter(sAdapterName).getCatalogTileTitle(oCatalogTile);
        };

        /**
         * Returns the size of a catalog tile as a string. For example: "1x1", "1x2"
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string} Tile size in units in 1x1 or 1x2 format
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogTileSize
         */
        this.getCatalogTileSize = function (oCatalogTile) {
            var sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            return this._getAdapter(sAdapterName).getCatalogTileSize(oCatalogTile);
        };

        /**
         * Returns the UI5 view or control  of a catalog tile
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {object} jQuery.deferred.promise object that when resolved, returns the Catalog Tile View
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogTileViewControl
         */
        this.getCatalogTileViewControl = function (oCatalogTile) {
            var sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            var oLaunchpageAdapter = this._getAdapter(sAdapterName);
            if (typeof oLaunchpageAdapter.getCatalogTileViewControl === "function") {
                return oLaunchpageAdapter.getCatalogTileViewControl(oCatalogTile);
            }
            var oDeferred = new jQuery.Deferred();
            var oResult = this.getCatalogTileView(oCatalogTile);

            oDeferred.resolve(oResult);
            return oDeferred.promise();
        };

        /**
         * Returns the UI5 view or control  of a catalog tile
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {object} UI5 view or control
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogTileView
         * @deprecated since 1.48. Please use {@link #getCatalogTileViewControl} instead.
         */
        this.getCatalogTileView = function (oCatalogTile) {
            Log.error("Deprecated API call of 'sap.ushell.LaunchPage.getCatalogTileView'. Please use 'getCatalogTileViewControl' instead",
                null,
                "sap.ushell.services.LaunchPage"
            );
            var sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            var oLaunchpageAdapter = this._getAdapter(sAdapterName);
            if (oLaunchpageAdapter.getCatalogTileView) {
                return oLaunchpageAdapter.getCatalogTileView(oCatalogTile);
            }
            var sTitle = this.getTileTitle(oCatalogTile) || this.getCatalogTileTitle(oCatalogTile);
            return this._createErrorTile(sTitle, "The LaunchPageAdapter does not support getCatalogTileView");
        };

        /**
         * Returns an error tile
         * @param {string} sTitle The title of the error tile
         * @param {string} [sMessage] A message which gets added to the tile as subtitle
         * @returns {sap.m.GenericTile} The error tile
         *
         * @private
         * @since 1.97.0
         */
        this._createErrorTile = function (sTitle, sMessage) {
            var oErrorTile = new GenericTile({
                state: LoadState.Failed,
                header: sTitle,
                subheader: sMessage || ""
            }).addStyleClass("sapUshellTileError");
            return oErrorTile;
        };

        /**
         * Returns the navigation target URL of a catalog tile.
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string} The target URL for the catalog tile's underlying application as provided via the "preview" contract
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogTileTargetURL
         */
        this.getCatalogTileTargetURL = function (oCatalogTile) {
            var sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            return this._getAdapter(sAdapterName).getCatalogTileTargetURL(oCatalogTile);
        };

        /**
         * Returns the tags associated with a catalog tile which can be used to find the catalog tile in a tag filter.
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string[]} The tags associated with this catalog tile
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogTileTags
         */
        this.getCatalogTileTags = function (oCatalogTile) {
            var sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            var oLaunchpageAdapter = this._getAdapter(sAdapterName);
            if (typeof oLaunchpageAdapter.getCatalogTileTags === "function") {
                return oLaunchpageAdapter.getCatalogTileTags(oCatalogTile);
            }
            return [];
        };

        /**
         * Returns the keywords associated with a catalog tile which can be used to find the catalog tile in a search.
         * Note: getCatalogTileViewControl <b>must</b> be called <b>before</b> this method. Otherwise the keywords may be incomplete.
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string[]} The keywords associated with this catalog tile
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogTileKeywords
         */
        this.getCatalogTileKeywords = function (oCatalogTile) {
            var sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            return this._getAdapter(sAdapterName).getCatalogTileKeywords(oCatalogTile);
        };

        /**
         * Returns preview title for a catalog tile.
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string} Preview title for the catalog tile's underlying application as provided via the "preview" contract
         * @since 1.16.3
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogTilePreviewTitle
         */
        this.getCatalogTilePreviewTitle = function (oCatalogTile) {
            var sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            return this._getAdapter(sAdapterName).getCatalogTilePreviewTitle(oCatalogTile);
        };

        /**
         * Returns the catalog tile info
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string} The catalog tile info
         * @since 1.67.0
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogTileTitle
         */
        this.getCatalogTilePreviewInfo = function (oCatalogTile) {
            var sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            // As not all LaunchPageAdaters have implemented getCatalogTilePreviewInfo yet, the call needs to be more defensive
            if (this._getAdapter(sAdapterName).getCatalogTilePreviewInfo) {
                return this._getAdapter(sAdapterName).getCatalogTilePreviewInfo(oCatalogTile);
            }
            return "";
        };

        /**
         * Returns preview subtitle for a catalog tile.
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string} Preview subtitle for the catalog tile's underlying application as provided via the "preview" contract
         * @since 1.40
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogTilePreviewSubtitle
         */
        this.getCatalogTilePreviewSubtitle = function (oCatalogTile) {
            var sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            var oLaunchpageAdapter = this._getAdapter(sAdapterName);
            if (oLaunchpageAdapter.getCatalogTilePreviewSubtitle) {
                return oLaunchpageAdapter.getCatalogTilePreviewSubtitle(oCatalogTile);
            }
            return undefined;
        };

        /**
         * Returns preview icon for a catalog tile.
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string} Preview icon as URL/URI for the catalog tile's underlying application as provided via the "preview" contract
         * @since 1.16.3
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogTilePreviewIcon
         */
        this.getCatalogTilePreviewIcon = function (oCatalogTile) {
            var sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            return this._getAdapter(sAdapterName).getCatalogTilePreviewIcon(oCatalogTile);
        };

        /**
         * Adds a bookmark tile to one of the user's home page groups.
         *
         * @param {object} oParameters bookmark parameters. In addition to title and URL, a bookmark might allow additional settings,
         *   such as an icon or a subtitle. Which settings are supported depends on the environment in which the application is running.
         *   Unsupported parameters will be ignored.
         * @param {string} oParameters.title The title of the bookmark.
         * @param {string} oParameters.url The URL of the bookmark. If the target application shall run in the Shell the URL has to be
         *   in the format <code>"#SO-Action~Context?P1=a&P2=x&/route?RPV=1"</code>
         * @param {string} [oParameters.icon] The icon URL of the bookmark (e.g. <code>"sap-icon://home"</code>).
         * @param {string} [oParameters.info] The information text of the bookmark.
         * @param {string} [oParameters.subtitle] The subtitle of the bookmark.
         * @param {string} [oParameters.serviceUrl]
         *   The URL to a REST or OData service that provides some dynamic information for the bookmark.
         * @param {string} [oParameters.serviceRefreshInterval] The refresh interval for the <code>serviceUrl</code> in seconds.
         * @param {string} [oParameters.numberUnit] The unit for the number retrieved from <code>serviceUrl</code>.
         * @param {object} [oGroup] Reference to the group the bookmark tile should be added to. If not given, the default group is used.
         * @param {string} [sContentProviderId] In the cFLP scenario the content provider ID is needed, so the bookmark's service URLs
         *   can be routed to the correct server, for example.
         * @returns {object} a jQuery promise.
         * @see sap.ushell.services.URLParsing#getShellHash
         * @alias sap.ushell.services.LaunchPage#addBookmark
         * @since 1.15.0
         */
        this.addBookmark = function (oParameters, oGroup, sContentProviderId) {
            var oDeferred = new jQuery.Deferred();
            if (this._hasRequiredBookmarkParameters(oParameters)) {
                if (oGroup && this.isGroupLocked(oGroup)) {
                    var sMessage = "Tile cannot be added, target group (" + this.getGroupTitle(oGroup) + ")is locked!";
                    Log.error(sMessage);
                    return oDeferred.reject(sMessage);
                }

                this.changeURLStatesToPersistent(oParameters.url)
                    .done(function (sNewURL) {
                        var sAdapterName = oGroup && oGroup.contentProvider;
                        oParameters.url = sNewURL;
                        this._getAdapter(sAdapterName).addBookmark(oParameters, oGroup, sContentProviderId)
                            .done(oDeferred.resolve)
                            .fail(function () {
                                Log.error("Fail to add bookmark for URL: "
                                    + oParameters.url + " and Title: " + oParameters.title);
                                oDeferred.reject();
                            });
                    }.bind(this))
                    .fail(function (sMsg) {
                        Log.error(sMsg || "Fail to change url states to persistent: " + oParameters.url);
                        oDeferred.reject();
                    });
            }
            return oDeferred.promise();
        };

        /**
         * Adds a custom bookmark to the user's home page.
         * The bookmark is added to the given group.
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
         * @param {object} oGroup The group where the bookmark should be added
         * @param {string} [sContentProviderId] In the cFLP scenario the content provider ID is needed, so the bookmark's service URLs
         *   can be routed to the correct server, for example.
         *
         * @returns {object} A jQuery.Deferred which resolves with the resulting tile or rejects in case of an error
         *
         * @private
         * @since 1.83.0
         */
        this.addCustomBookmark = function (oBookmarkConfig, oGroup, sContentProviderId) {
            var oDeferred = new jQuery.Deferred();
            if (this._hasRequiredBookmarkParameters(oBookmarkConfig)) {
                if (oGroup && this.isGroupLocked(oGroup)) {
                    var sMessage = "Tile cannot be added, target group (" + this.getGroupTitle(oGroup) + ")is locked!";
                    Log.error(sMessage);
                    return oDeferred.reject(sMessage);
                }

                this.changeURLStatesToPersistent(oBookmarkConfig.url)
                    .done(function (sNewURL) {
                        var sAdapterName = oGroup && oGroup.contentProvider;
                        oBookmarkConfig.url = sNewURL;
                        this._getAdapter(sAdapterName).addCustomBookmark(oBookmarkConfig, oGroup, sContentProviderId)
                            .done(oDeferred.resolve)
                            .fail(function () {
                                Log.error("Fail to add bookmark for URL: "
                                    + oBookmarkConfig.url + " and Title: " + oBookmarkConfig.title);
                                oDeferred.reject();
                            });
                    }.bind(this))
                    .fail(function (sMsg) {
                        Log.error(sMsg || "Fail to change url states to persistent: " + oBookmarkConfig.url);
                        oDeferred.reject();
                    });
            }
            return oDeferred.promise();
        };

        /**
         * Checks whether the url and title exist in the given parameter object.
         * Throws an error if not
         * @param {object} oParameters The parameters containing the bookmark data
         *
         * @returns {boolean} true if necessary parameters exist
         *
         * @private
         * @since 1.83.0
         */
        this._hasRequiredBookmarkParameters = function (oParameters) {
            if (!oParameters.title) {
                Log.error("Add Bookmark - Missing title");
                throw new Error("Title missing in bookmark configuration");
            }
            if (!oParameters.url) {
                Log.error("Add Bookmark - Missing URL");
                throw new Error("URL missing in bookmark configuration");
            }
            return true;
        };

        /**
         * Counts <b>all</b> bookmarks pointing to the given URL from all of the user's pages.
         * You can use this method to check if a bookmark already exists.
         * <p>
         * This is a potentially asynchronous operation in case the user's pages have not yet been loaded completely!
         *
         * @param {string} sUrl The URL of the bookmarks to be counted, exactly as specified to {@link #addBookmark}.
         * @param {string} [sContentProviderId] The content provider identification in cFLP scenario. Only bookmark tiles for the given
         *   content provider shall be considered.
         * @returns {object} A <code>jQuery.Deferred</code> object's promise which informs about success or failure of this asynchronous operation.
         *   In case of success, the count of existing bookmarks is provided (which might be zero). In case of failure, an error message is passed.
         * @see #addBookmark
         * @private
         */
        this.countBookmarks = function (sUrl, sContentProviderId) {
            if (!sUrl || typeof sUrl !== "string") {
                Log.error("Fail to count bookmarks. No valid URL");
                throw new Error("Missing URL");
            }

            var oPromise = this._getAdapter().countBookmarks(sUrl, sContentProviderId);
            oPromise.fail(function () {
                Log.error("Fail to count bookmarks");
            });
            return oPromise;
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
         */
        this.countCustomBookmarks = function (oIdentifier) {
            if (!oIdentifier.url || !oIdentifier.vizType) {
                return Promise.reject("countCustomBookmarks: Some required parameters are missing.");
            }
            return this._getAdapter().countCustomBookmarks(oIdentifier);
        };

        /**
         * Deletes <b>all</b> bookmarks pointing to the given URL from all of the user's pages.
         *
         * @param {string} sUrl The URL of the bookmarks to be deleted, exactly as specified to {@link #addBookmark}.
         * @param {string} [sContentProviderId] The content provider identification in cFLP scenario. Only bookmark tiles for the given
         *   content provider shall be considered.
         * @returns {object} A <code>jQuery.Deferred</code> object's promise which informs about success or failure of this asynchronous operation.
         *   In case of success, the number of deleted bookmarks is provided (which might be zero). In case of failure, an error message is passed.
         * @see #addBookmark
         * @see #countBookmarks
         * @private
         */
        this.deleteBookmarks = function (sUrl, sContentProviderId) {
            var oDeferred = new jQuery.Deferred();

            if (!sUrl || typeof sUrl !== "string") {
                return oDeferred.reject(new Error("Missing URL")).promise();
            }

            sap.ushell.Container.getServiceAsync("AppState")
                .then(function (AppStateService) {
                    this._getAdapter().deleteBookmarks(sUrl, undefined, sContentProviderId)
                        .done(function (iCount) {
                            this.deleteURLStatesPersistentData(sUrl, AppStateService);

                            oDeferred.resolve(iCount);
                        }.bind(this))
                        .fail(function (error) {
                            Log.error("Fail to delete bookmark for: " + sUrl);

                            oDeferred.reject(error);
                        });
                }.bind(this))
                .catch(oDeferred.reject);

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
         *   The viz type is only used by the FLP running on CDM.
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
         */
        this.deleteCustomBookmarks = function (oIdentifier) {
            if (!oIdentifier.url || !oIdentifier.vizType) {
                return Promise.reject("deleteCustomBookmarks: Some required parameters are missing.");
            }
            return this._getAdapter().deleteCustomBookmarks(oIdentifier);
        };

        /**
         * Updates <b>all</b> bookmarks pointing to the given URL on all of the user's pages with the given new parameters.
         * Parameters which are omitted are not changed in the existing bookmarks.
         *
         * @param {string} sUrl The URL of the bookmarks to be updated, exactly as specified to {@link #addBookmark}.
         *   In case you need to update the URL itself, pass the old one here and the new one as <code>oParameters.url</code>!
         * @param {object} oParameters The bookmark parameters as documented in {@link #addBookmark}.
         * @param {string} [sContentProviderId] The content provider identification in cFLP scenario. Only bookmark tiles for the given
         *   content provider shall be considered.
         * @returns {object} A <code>jQuery.Deferred</code> object's promise which informs about success or failure of this asynchronous operation.
         *   In case of success, the number of updated bookmarks is provided (which might be zero). In case of failure, an error message is passed.
         * @see #addBookmark
         * @see #countBookmarks
         * @see #deleteBookmarks
         * @private
         */
        this.updateBookmarks = function (sUrl, oParameters, sContentProviderId) {
            if (!sUrl || typeof sUrl !== "string") {
                Log.error("Fail to update bookmark. No valid URL");
                throw new Error("Missing URL");
            }
            if (!oParameters || typeof oParameters !== "object") {
                Log.error("Fail to update bookmark. No valid parameters, URL is: " + sUrl);
                throw new Error("Missing parameters");
            }
            var oPromise = new jQuery.Deferred();
            this.changeURLStatesToPersistent(oParameters.url)
                .done(function (sNewURL) {
                    oParameters.url = sNewURL;
                    this._getAdapter().updateBookmarks(sUrl, oParameters, undefined, sContentProviderId)
                        .done(oPromise.resolve)
                        .fail(function () {
                            Log.error("Fail to update bookmark for: " + sUrl);
                            oPromise.reject();
                        });
                }.bind(this))
                .fail(function (sMsg) {
                    Log.error(sMsg || "Fail to change url states to persistent: " + oParameters.url);
                    oPromise.reject();
                });

            return oPromise.promise();
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
         *   The viz type is only used by the FLP running on CDM.
         * @param {string} [oIdentifier.chipId]
         *   The chipId which was used to create the bookmark using {@link #addCustomBookmark}.
         *   The chipId is mandatory when used in a FLP running on ABAP.
         *
         * @param {object} oBookmarkConfig The configuration of the bookmark. See below for the structure.
         * <pre>
         *     {
         *         vizConfig: {
         *             "sap.flp": {
         *                 chipConfig: {
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
            if (!oIdentifier.url || !oIdentifier.vizType || !oBookmarkConfig) {
                return Promise.reject("updateCustomBookmarks: Some required parameters are missing.");
            }
            return this._getAdapter().updateCustomBookmarks(oIdentifier, oBookmarkConfig);
        };

        /**
         * This method is called to notify that the given tile has been added to some remote catalog which is not specified further.
         *
         * @param {string} sTileId the ID of the tile that has been added to the catalog (as returned by that OData POST operation)
         * @private
         * @since 1.16.4
         */
        this.onCatalogTileAdded = function (sTileId) {
            this._getAdapter().onCatalogTileAdded(sTileId);
        };

        /**
         * If the bookmark created contains state keys, change their state
         * to be persistent (originally, a cFLP requirement).
         * In case of an error, the function reports it but it will not stop
         * the creation of the bookmark.
         *
         * @param {string} sURL
         *   The URL of the bookmark.
         * @returns {Promise<string>} The URL with the changed states
         * @since 1.69
         * @private
         */
        this.changeURLStatesToPersistent = function (sURL) {
            var oDeferred = new jQuery.Deferred();

            sap.ushell.Container.getServiceAsync("AppState")
                .then(function (AppStateService) {
                    // gate keeper - if the platform did not implement yet the new persistency mechanism
                    // with different persistency method types, no action should be taken
                    if (AppStateService.getSupportedPersistencyMethods().length === 0) {
                        oDeferred.resolve(sURL);
                        return;
                    }

                    if (sURL && sURL.length > 0) {
                        try {
                            AppStateService.setAppStateToPublic(sURL)
                                .done(oDeferred.resolve)
                                .fail(oDeferred.reject);
                        } catch (e) {
                            Log.error(
                                "error in converting transient state to personal persistent when bookmark is added",
                                e,
                                "sap.ushell.services.LaunchPage");
                            oDeferred.reject();
                        }
                    } else {
                        oDeferred.resolve(sURL);
                    }
                });

            return oDeferred.promise();
        };

        /**
         * If the bookmark deleted contains state keys, we need to delete
         * also the persistent data, only if this is the only tile with this URL
         * (originally, a cFLP requirement)
         * In case of an error, the function reports it but it will not stop
         * the deletion of the bookmark.
         *
         * @param {string} sURL The URL of the bookmark.
         * @param {sap.ushell.services.AppState} oAppStateService An instance of the AppState service.
         * @since 1.69
         * @private
         */
        this.deleteURLStatesPersistentData = function (sURL, oAppStateService) {
            //gate keeper - if the platform did not implement yet the new persistency mechanism
            //with different persistency method types, no action should be taken
            if (oAppStateService.getSupportedPersistencyMethods().length === 0) {
                return;
            }

            if (sURL && sURL.length > 0) {
                try {
                    var sXStateKey = getURLParamValue(sURL, "sap-xapp-state"),
                        sIStateKey = getURLParamValue(sURL, "sap-iapp-state");
                    if (sXStateKey !== undefined || sIStateKey !== undefined) {
                        //before deleting the state data behind the URL of the tile, we need to check if this
                        // URL is appears in other tiles. Only if the result iz zero (because the current tile
                        // was already deleted) we can go ahead and delete also the states data
                        this.countBookmarks(sURL).done(function (iCount) {
                            if (iCount === 0) {
                                if (sXStateKey !== undefined) {
                                    oAppStateService.deleteAppState(sXStateKey);
                                }
                                if (sIStateKey !== undefined) {
                                    oAppStateService.deleteAppState(sIStateKey);
                                }
                            }
                        });
                    }
                } catch (e) {
                    Log.error("error in deleting persistent state when bookmark is deleted", e, "sap.ushell.services.LaunchPage");
                }
            }
        };

        function getURLParamValue (sUrl, sParamName) {
            var sReg = new RegExp("(?:" + sParamName + "=)([^&/]+)"),
                sRes = sReg.exec(sUrl),
                sValue;

            if (sRes && sRes.length === 2) {
                sValue = sRes[1];
            }

            return sValue;
        }
    }

    LaunchPage.prototype._getAdapter = function (sAdapter) {
        return this.oAdapters[sAdapter] || this.oAdapters.default;
    };

    LaunchPage.hasNoAdapter = false;
    return LaunchPage;
}, true /* bExport */);
