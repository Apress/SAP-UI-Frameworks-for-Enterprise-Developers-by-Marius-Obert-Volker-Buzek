// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Helper of accessing Home Page data for the 'CDM' platform.
 *
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/ushell/utils/type"
], function (oTypeUtils) {
    "use strict";

    // GROUPS

    /**
     * Returns the array of groups in the correct order as defined by the site.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @returns {object[]}
     *      array of groups
     */
    function getGroupsArrayFromSite (oSite) {
        var aLoadedGroups = [];

        // order groups based on groupsOrder
        oSite.site.payload.groupsOrder.forEach(function (sGroupId, iIndex) {
            var oGroup = oSite.groups[sGroupId];
            if (oGroup) {
                oGroup.payload = oGroup.payload || {};

                // add groups in the correct order
                aLoadedGroups.push(oGroup);
            }
        });

        return aLoadedGroups;
    }

    /**
     * Returns the map of groups.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @returns {object}
     *      an object containing all groups as properties (property name
     *      is the groupId, property value is the group data)
     */
    function getGroupsMapFromSite (oSite) {
        return oSite.groups;
    }

    /**
     * Returns the group IDs in the correct order as defined by the site.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @returns {string[]}
     *      array of group IDs
     */
    function getGroupIdsFromSite (oSite) {
        // All existing group ids are stored in the groupsOrder array of the site
        return oSite.site.payload.groupsOrder;
    }

    /**
     * Returns the group with the given ID from the site.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @param {string} sGroupId
     *      ID of the group to be returned
     *  @returns {object}
     *      the group with the specified ID or undefined if not present
     */
    function getGroupFromSite (oSite, sGroupId) {
        return oSite.groups[sGroupId];
    }

    /**
     * Returns the first group from the groups array which is flagged as default group.
     * If multiple groups are flagged the following are ignored.
     *
     *  @param {object[]} aGroups
     *      Array of groups
     *  @returns {object}
     *      the default group or undefined if none exists
     */
    function getDefaultGroup (aGroups) {
        var aDefaultGroups = aGroups.filter(function (oGroup) {
            return oGroup.payload.hasOwnProperty("isDefaultGroup");
        });

        if (aDefaultGroups.length > 0) {
            // it is expected to only have one default group
            return aDefaultGroups[0];
        }
        return undefined;
    }

    // GROUP PROPERTIES

    /**
     * Returns the ID of the given group.
     *
     *  @param {object} oGroup
     *      Group object
     *  @returns {string}
     *      Group ID of the given group
     */
    function getGroupId (oGroup) {
        return oGroup.identification && oGroup.identification.id;
    }

    /**
     * Returns the title of the given group.
     *
     *  @param {object} oGroup
     *      Group object
     *  @returns {string}
     *      Title of the given group
     */
    function getGroupTitle (oGroup) {
        return oGroup.identification.title;
    }

    /**
     * Returns true if the given group is preset. This means it was assigned by an
     * admin to the end-user. False means the the group was created by the end-user.
     *
     *  @param {object} oGroup
     *      group object
     *  @returns {boolean}
     *      Returns true if group was assigned by admin and false if group was
     *      created by the end-user
     */
    function isGroupPreset (oGroup) {
        if (!oGroup.payload.hasOwnProperty("isPreset")) {
            // the default is true as for all user-created groups false is set
            return true;
        }
        return !!oGroup.payload.isPreset;
    }

    /**
     * Returns true if the end-user is not able to modify (personalize) the group.
     *
     *  @param {object} oGroup
     *      group object
     *  @returns {boolean}
     *      Returns false if the end-user is able to modify (personalize) the group
     *      and true if the user cannot make changes to the group
     */
    function isGroupLocked (oGroup) {
        return !!oGroup.payload.locked;
    }

    /**
     * Returns false if the end-user has hidden the group and true if
     * this is not the case.
     *
     *  @param {object} oGroup
     *      group object
     *  @returns {boolean}
     *      Returns false if the end-user has hidden the group and true
     *      if this is not the case. The default is true
     */
    function isGroupVisible (oGroup) {
        return !!(oGroup.identification.isVisible === undefined || oGroup.identification.isVisible === true);
    }

    /**
     * Returns the array of tiles from the given group in the correct order
     * as defined by the end-user.
     *
     *  @param {object} oGroup
     *      Group object
     *  @returns {object[]}
     *      array of group tiles
     */
    function getGroupTiles (oGroup) {
        if (oGroup.payload.tiles && oTypeUtils.isArray(oGroup.payload.tiles) && oGroup.payload.tiles.length > 0) {
            return oGroup.payload.tiles;
        }
        return [];
    }

    /**
     * Returns the array of links from the given group in the correct order
     * as defined by the end-user.
     *
     *  @param {object} oGroup
     *      Group object
     *  @returns {object[]}
     *      array of group links
     */
    function getGroupLinks (oGroup) {
        if (oGroup.payload.links && oTypeUtils.isArray(oGroup.payload.links) && oGroup.payload.links.length > 0) {
            return oGroup.payload.links;
        }
        return [];
    }

    // TILE PROPERTIES

    /**
     * Returns the ID of the given group tile.
     *
     *  @param {object} oTile
     *      tile object
     *  @returns {string}
     *      ID of the given tile
     */
    function getTileId (oTile) {
        return oTile.id;
    }

    /**
     * Returns the title of the given group tile.
     *
     *  @param {object} oTile
     *      tile object
     *  @returns {string}
     *      Title of the given tile
     */
    function getTileTitle (oResolvedTiles, oTile) {
        var oResolvedTile;

        if (oTile && oTile.isBookmark) {
            return oTile.title;
        }

        oResolvedTile = oResolvedTiles[oTile.id];
        if (oResolvedTile) {
            // oTile.title is set by the user and overwrites the default title
            return oTile.title || oResolvedTile.tileResolutionResult.title;
        }
        return undefined;
    }

    /**
     * Returns the subtitle of the given group tile.
     *
     *  @param {object} oTile
     *      tile object
     *  @returns {string}
     *      Subtitle of the given tile
     */
    function getTileSubtitle (oResolvedTiles, oTile) {
        var oResolvedTile;

        if (oTile.isBookmark) {
            return oTile.subTitle;
        }

        // TODO works in all cases? e.g. for tiles added via addTile?
        oResolvedTile = oResolvedTiles[oTile.id];
        if (oResolvedTile) {
            // oTile.subTitle is set by the user and overwrites the default subtitle
            return oTile.subTitle || oResolvedTile.tileResolutionResult.subTitle;
        }
        return undefined;
    }

    /**
     * Returns the info text of the given group tile.
     *
     *  @param {object} oTile
     *      tile object
     *  @returns {string}
     *      Info text of the given tile
     */
    function getTileInfo (oResolvedTiles, oTile) {
        var oResolvedTile;

        if (oTile.isBookmark) {
            return oTile.info;
        }
        oResolvedTile = oResolvedTiles[oTile.id];
        return oTile.info || oResolvedTile.tileResolutionResult.info;
    }

    /**
     * Returns the icon ID of the given group tile.
     *
     *  @param {object} oTile
     *      tile object
     *  @returns {string}
     *      Icon ID of the given tile
     */
    function getTileIcon (oResolvedTiles, oTile) {
        var oResolvedTile;

        if (oTile.isBookmark) {
            return oTile.icon;
        }

        // TODO works in all cases? e.g. for tiles added via addTile?
        oResolvedTile = oResolvedTiles[oTile.id];
        if (oResolvedTile) {
            // oTile.icon is set by the user and overwrites the default icon
            return oTile.icon || oResolvedTile.tileResolutionResult.icon;
        }
        return undefined;
    }

    /**
     * Returns the indicator data source of the given group tile.
     *
     *  @param {object} oTile
     *      tile object
     *  @returns {object}
     *      Indicator data source object with structure as defined in
     *      App Descriptor schema
     */
    function getTileIndicatorDataSource (oResolvedTiles, oTile) {
        var oResolvedTile;

        if (oTile.isBookmark) {
            return oTile.icon;
        }

        // TODO works in all cases? e.g. for tiles added via addTile?
        oResolvedTile = oResolvedTiles[oTile.id];
        if (oResolvedTile) {
            // oTile.icon is set by the user and overwrites the default icon
            return oTile.icon || oResolvedTile.tileResolutionResult.icon;
        }
        return undefined;
    }

    /**
     * Returns the size of the given group tile.
     *
     *  @param {object} oTile
     *      tile object
     *  @returns {string}
     *      Size of the given tile, for example "1x1" or "1x2". May be undefined if not set
     */
    function getTileSize (oResolvedTiles, oTile) {
        var oResolvedTile = oResolvedTiles[oTile.id];
        if (oResolvedTile && oResolvedTile.tileResolutionResult &&
            oResolvedTile.tileResolutionResult.size) {
            return oResolvedTile.tileResolutionResult.size;
        }
    }

    /**
     * Returns true if the given tile should be visualized as link on the home page.
     *
     *  @param {object} oTile
     *      tile object
     *  @returns {boolean}
     *      Returns true if link. The default is false
     */
    function isLink (oResolvedTiles, oTile) {
        var oResolvedTile = oResolvedTiles[oTile.id];
        if (oResolvedTile) {
            return !!oResolvedTile.isLink;
        }
        return false;
    }

    /**
     * Returns true if the given tile is detected to be a group tile.
     *
     *  @param {object} oTile
     *      tile object
     *  @returns {boolean}
     *      Returns true if group tile. Returns false if catalog tile
     *      or not a valid tile at all
     */
    function isGroupTile (oTile) {
        return !!(oTile && oTile.id && !oTile.isCatalogTile);
    }

    /**
     * Returns true if the App Descriptor supports the given form factor.
     *
     *  @param {object} oAppDescriptor
     *      App Descriptor object with a valid structure according to the
     *      App Descriptor and/or Common Data Model schemas
     *  @returns {boolean}
     *      Returns true if form factor is supported
     */
    function supportsFormFactor (oAppDescriptor, sFormFactor) {
        return oAppDescriptor.deviceTypes && oAppDescriptor.deviceTypes[sFormFactor];
    }

    return {
        // GROUPS
        getGroupsArrayFromSite: getGroupsArrayFromSite,
        getGroupsMapFromSite: getGroupsMapFromSite,
        getGroupIdsFromSite: getGroupIdsFromSite,
        getGroupFromSite: getGroupFromSite,

        // DEFAULT GROUP
        getDefaultGroup: getDefaultGroup,

        // GROUP PROPERTIES
        getGroupId: getGroupId,
        getGroupTitle: getGroupTitle,
        isGroupPreset: isGroupPreset,
        isGroupLocked: isGroupLocked,
        isGroupVisible: isGroupVisible,
        getGroupTiles: getGroupTiles,
        getGroupLinks: getGroupLinks,

        // TILE PROPERTIES
        getTileId: getTileId,
        getTileTitle: getTileTitle,
        getTileSubtitle: getTileSubtitle,
        getTileInfo: getTileInfo,
        getTileIcon: getTileIcon,
        getTileIndicatorDataSource: getTileIndicatorDataSource,
        getTileSize: getTileSize,
        isLink: isLink,
        isGroupTile: isGroupTile,
        supportsFormFactor: supportsFormFactor
    };
}, /* bExport = */ false);
