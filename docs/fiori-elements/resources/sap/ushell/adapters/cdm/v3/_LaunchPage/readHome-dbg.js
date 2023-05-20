// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
/**
 * @fileOverview Helper for accessing Home Page data for the 'CDM' platform.
 *
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/ushell/utils/type",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readApplications"
], function (
    oTypeUtils,
    readApplications
) {
    "use strict";

    var readHome = {};

    // GROUPS

    /**
     * Returns the array of groups in the correct order as defined by the site.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @returns {object[]}
     *      array of groups
     */
    readHome.getGroupsArrayFromSite = function (oSite) {
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
    };

    /**
     * Returns the map of groups.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @returns {object}
     *      an object containing all groups as properties (property name
     *      is the groupId, property value is the group data)
     */
    readHome.getGroupsMapFromSite = function (oSite) {
        return oSite.groups;
    };

    /**
     * Returns the group IDs in the correct order as defined by the site.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @returns {string[]}
     *      array of group IDs
     */
    readHome.getGroupIdsFromSite = function (oSite) {
        // All existing group ids are stored in the groupsOrder array of the site
        return oSite.site.payload.groupsOrder;
    };

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
    readHome.getGroupFromSite = function (oSite, sGroupId) {
        return oSite.groups[sGroupId];
    };

    /**
     * Returns the first group from the groups array which is flagged as default group.
     * If multiple groups are flagged the following are ignored.
     *
     *  @param {object[]} aGroups
     *      Array of groups
     *  @returns {object}
     *      the default group or undefined if none exists
     */
    readHome.getDefaultGroup = function (aGroups) {
        var aDefaultGroups = aGroups.filter(function (oGroup) {
            return oGroup.payload.hasOwnProperty("isDefaultGroup");
        });

        if (aDefaultGroups.length > 0) {
            // it is expected to only have one default group
            return aDefaultGroups[0];
        }
    };

    // GROUP PROPERTIES

    /**
     * Returns the ID of the given group.
     *
     *  @param {object} oGroup
     *      Group object
     *  @returns {string}
     *      Group ID of the given group
     */
    readHome.getGroupId = function (oGroup) {
        return oGroup.identification && oGroup.identification.id;
    };

    /**
     * Returns the title of the given group.
     *
     *  @param {object} oGroup
     *      Group object
     *  @returns {string}
     *      Title of the given group
     */
    readHome.getGroupTitle = function (oGroup) {
        return oGroup.identification.title;
    };

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
    readHome.isGroupPreset = function (oGroup) {
        if (!oGroup.payload.hasOwnProperty("isPreset")) {
            // the default is true as for all user-created groups false is set
            return true;
        }
        return !!oGroup.payload.isPreset;
    };

    /**
     * Returns true if the end-user is not able to modify (personalize) the group.
     *
     *  @param {object} oGroup
     *      group object
     *  @returns {boolean}
     *      Returns false if the end-user is able to modify (personalize) the group
     *      and true if the user cannot make changes to the group
     */
    readHome.isGroupLocked = function (oGroup) {
        return !!oGroup.payload.locked;
    };

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
    readHome.isGroupVisible = function (oGroup) {
        return !!(oGroup.identification.isVisible === undefined || oGroup.identification.isVisible === true);
    };

    /**
     * Returns the array of tiles from the given group in the correct order
     * as defined by the end-user.
     *
     *  @param {object} oGroup
     *      Group object
     *  @returns {object[]}
     *      array of group tiles
     */
    readHome.getGroupTiles = function (oGroup) {
        if (oGroup.payload.tiles && oTypeUtils.isArray(oGroup.payload.tiles) && oGroup.payload.tiles.length > 0) {
            return oGroup.payload.tiles;
        }
        return [];
    };

    /**
     * Returns the array of links from the given group in the correct order
     * as defined by the end-user.
     *
     *  @param {object} oGroup
     *      Group object
     *  @returns {object[]}
     *      array of group links
     */
    readHome.getGroupLinks = function (oGroup) {
        if (oGroup.payload.links && oTypeUtils.isArray(oGroup.payload.links) && oGroup.payload.links.length > 0) {
            return oGroup.payload.links;
        }
        return [];
    };

    // TILE PROPERTIES

    /**
     * Returns the ID of the given group tile.
     *
     *  @param {object} oTile
     *      tile object
     *  @returns {string}
     *      ID of the given tile
     */
    readHome.getTileId = function (oTile) {
        return oTile.id;
    };

    /**
     * Returns the vizId of the given group tile.
     *
     *  @param {object} oTile
     *      tile object
     *  @returns {string}
     *      vizId of the given tile
     *
     * @since 1.74.0
     * @private
     */
    readHome.getTileVizId = function (oTile) {
        return oTile.vizId;
    };

    /**
     * Returns the title of the given group tile.
     *  @param {object} oResolvedTiles
     *      The map of resolved tiles
     *  @param {object} oTile
     *      The tile object
     *  @returns {string}
     *      The title of the given tile or undefined if not set
     */
    readHome.getTileTitle = function (oResolvedTiles, oTile) {
        var oResolvedTile;

        if (oTile && oTile.isBookmark) {
            return oTile.title;
        }

        oResolvedTile = oResolvedTiles[oTile.id];
        if (oResolvedTile) {
            // oTile.title is set by the user and overwrites the default title
            return oTile.title || oResolvedTile.tileResolutionResult.title;
        }
    };

    /**
     * Returns the content provider of the given group tile
     * @param {object} oTile the tile object
     * @returns {string|undefined} The content provider or undefined if not available
     */
    readHome.getContentProviderId = function (oTile) {
        return oTile.contentProvider || undefined;
    };

    /**
     * Returns the subtitle of the given group tile.
     *  @param {object} oResolvedTiles
     *      The map of resolved tiles
     *  @param {object} oTile
     *      The tile object
     *  @returns {string}
     *      The subtitle of the given tile or undefined if not set
     */
    readHome.getTileSubtitle = function (oResolvedTiles, oTile) {
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
    };

    /**
     * Returns the info text of the given group tile.
     *  @param {object} oResolvedTiles
     *      The map of resolved tiles
     *  @param {object} oTile
     *      The tile object
     *  @returns {string}
     *      The info text of the given tile or undefined if not set
     */
    readHome.getTileInfo = function (oResolvedTiles, oTile) {
        var oResolvedTile;

        if (oTile.isBookmark) {
            return oTile.info;
        }
        oResolvedTile = oResolvedTiles[oTile.id];
        if (oResolvedTile) {
            // oTile.info is set by the user and overwrites the default icon
            return oTile.info || oResolvedTile.tileResolutionResult.info;
        }
    };

    /**
     * Returns the icon ID of the given group tile.
     *  @param {object} oResolvedTiles
     *      The map of resolved tiles
     *  @param {object} oTile
     *      The tile object
     *  @returns {string}
     *      The icon ID of the given tile or undefined if not set
     */
    readHome.getTileIcon = function (oResolvedTiles, oTile) {
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
    };

    /**
     * Returns the indicator data source of the given group tile.
     *  @param {object} oResolvedTiles
     *      The map of resolved tiles
     *  @param {object} oTile
     *      The tile object
     *  @returns {object}
     *      The indicator data source object with structure as defined in
     *      App Descriptor schema
     */
    readHome.getTileIndicatorDataSource = function (oResolvedTiles, oTile) {
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
    };

    /**
     * Returns the size of the given group tile.
     *
     *  @param {object} oTile
     *      tile object
     *  @returns {string}
     *      Size of the given tile, for example "1x1" or "1x2". May be undefined if not set
     */
    readHome.getTileSize = function (oResolvedTiles, oTile) {
        var oResolvedTile = oResolvedTiles[oTile.id];
        if (oResolvedTile && oResolvedTile.tileResolutionResult &&
            oResolvedTile.tileResolutionResult.size) {
            return oResolvedTile.tileResolutionResult.size;
        }
    };

    /**
     * Returns true if the given tile should be visualized as link on the home page.
     *
     *  @param {object} oTile
     *      tile object
     *  @returns {boolean}
     *      Returns true if link. The default is false
     */
    readHome.isLink = function (oResolvedTiles, oTile) {
        var oResolvedTile = oResolvedTiles[oTile.id];
        if (oResolvedTile) {
            return !!oResolvedTile.isLink;
        }
        return false;
    };

    /**
     * @param {object} oResolvedObjects
     *  An object which contains a set of objects(tiles, cards or links).
     * @param {sap.ui.core.Control} oItem
     *  An item which can be a link, tile or card
     * @returns {boolean}
     *  True if the given object is a Card, otherwise false.
     */
    readHome.isCard = function (oResolvedObjects, oItem) {
        var oResolvedObject = oResolvedObjects[oItem.id];
        if (oResolvedObject) {
            return !!oResolvedObject.tileResolutionResult.isCard;
        }
        return false;
    };

    /**
     * Returns true if the given tile is detected to be a group tile.
     *
     *  @param {object} oTile
     *      tile object
     *  @returns {boolean}
     *      Returns true if group tile. Returns false if catalog tile
     *      or not a valid tile at all
     */
    readHome.isGroupTile = function (oTile) {
        return !!(oTile && oTile.id && !oTile.isCatalogTile);
    };

    // APPLICATIONS

    /**
     * Returns true if the App Descriptor supports the given form factor.
     *
     * @param {object} oAppDescriptor
     *      App Descriptor object with a valid structure according to the
     *      App Descriptor and/or Common Data Model schemas
     * @param {string} sFormFactor
     *      the form factor
     * @returns {boolean}
     *      Returns true if form factor is supported
     */
    readHome.supportsFormFactor = function (oAppDescriptor, sFormFactor) {
        return oAppDescriptor.deviceTypes && oAppDescriptor.deviceTypes[sFormFactor];
    };

    /**
     * Returns the inbound of an app descriptor
     *  @param {object} oAppDescriptor
     *      App Descriptor object with a valid structure according to the
     *      App Descriptor and/or Common Data Model schemas
     *  @param {string} sInboundId
     *      Id of the Inbound
     *  @returns {object}
     *      an object containing the key and the inbound object
     *      or undefined if the inbound does not exists
     */
    readHome.getInbound = function (oAppDescriptor, sInboundId) {
        var oInbound = readApplications.getInbound(oAppDescriptor, sInboundId);

        return oInbound && { key: sInboundId, inbound: oInbound };
    };

    return readHome;

}, /* bExport = */ false);
