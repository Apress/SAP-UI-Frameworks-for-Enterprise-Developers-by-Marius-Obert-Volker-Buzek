// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview Helper of modifying the home page data for the 'CDM' platform.
 * @version 1.113.0
 * @private
 */
sap.ui.define([
    "sap/ushell/adapters/cdm/_LaunchPage/readHome"
], function (
    oReadHomeUtils
) {
    "use strict";

    // GROUPS

    /**
     * Returns a new group object which is flagged as default group.
     *
     *  @param {string} sUniqueId
     *      Unique ID to be used as ID for the new group object
     *  @returns {object}
     *      Generated default group. This group is not added to any site
     *
     *  @see #createEmptyGroup
     *  @see #addGroupToSite
     */
    function createDefaultGroup (sUniqueId) {
        return createEmptyGroup(sUniqueId, "Home", /*bDefault*/ true);
    }

    /**
     * Returns a new group object.
     *
     *  @param {string} sUniqueId
     *      Unique ID to be used as ID for the new group object
     *  @param {string} sTitle
     *      Title for the new group object
     *  @param {boolean} [bDefault]
     *      Specifies if the new group should be flagged as default group.
     *      If skipped, the group represents a user-created group
     *  @returns {object}
     *      Generated group. This group is not added to any site
     *
     *  @see #createDefaultGroup
     *  @see #addGroupToSite
     */
    function createEmptyGroup (sUniqueId, sTitle, bDefault) {
        var oGroup = {
            identification: {
                id: sUniqueId,
                namespace: "",
                title: sTitle
            },
            payload: {
                isPreset: false, // groups create at runtime cannot be assigned by admin
                locked: false,
                tiles: [],
                links: [],
                groups: []
            }
        };

        if (bDefault) {
            oGroup.payload.isDefaultGroup = true;
        }

        return oGroup;
    }

    /**
     * Adds the given group to the site in the specified index order.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @param {object} oGroup
     *      Group object to be added
     *  @param {number} [iIndex]
     *      Index in which place inside the current order the
     *      group should be added. If skipped the group is appended
     *  @returns {object}
     *      returns the modified oSite object
     *
     *  @see #createDefaultGroup
     *  @see #createEmptyGroup
     */
    function addGroupToSite (oSite, oGroup, iIndex) {
        var sGroupId = oReadHomeUtils.getGroupId(oGroup);
        // attach group to site object
        oSite.groups[sGroupId] = oGroup;

        if (iIndex !== undefined) {
            // add group in the correct place in the groups order
            oSite.site.payload.groupsOrder.splice(iIndex, 0, sGroupId);
        } else {
            // if no order is specified, just append the group at the end
            oSite.site.payload.groupsOrder.push(sGroupId);
        }

        // TODO do not modify params but create a copy
        return oSite;
    }

    /**
     * Overwrites the group in the given site.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @param {object} oGroup
     *      Group object to overwrite the existing group
     *  @param {string} sGroupId
     *      ID of the Group to be overwritten.
     *      The ID must be equal to the ID of oGroup
     *  @returns {object}
     *      returns the modified oSite object
     */
    function overwriteGroup (oSite, oGroup, sGroupId) {
        if (oSite && oSite.groups && oSite.groups[sGroupId]) {
            oSite.groups[sGroupId] = oGroup;
        }

        return oSite;
    }

    /**
     * removes the specified group from the site.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @param {object} oGroup
     *      Group object to be removed.
     *  @returns {object}
     *      returns the modified oSite object
     */
    function removeGroupFromSite (oSite, oGroup) {
        if (oSite && oSite.groups && oSite.groups[oGroup.identification.id]) {
            delete oSite.groups[oGroup.identification.id];
        }

        // remove group id from groupsOrder array
        if (oSite && oSite.site && oSite.site.payload && oSite.site.payload.groupsOrder) {
            oSite.site.payload.groupsOrder = oSite.site.payload.groupsOrder.filter(function (sGroupId) {
                return sGroupId !== oGroup.identification.id;
            });
        }

        return oSite;
    }

    /**
     * Overwrites the group order in the given site.
     *
     *  @param {object} oSite
     *      Common Data Model site
     *  @param {string[]} aNewGroupsOrder
     *      Array of group IDs in the new order.
     *  @returns {object}
     *      returns the modified oSite object
     */
    function setGroupsOrder (oSite, aNewGroupsOrder) {
        oSite.site.payload.groupsOrder = aNewGroupsOrder;

        return oSite;
    }

    // GROUP PROPERTIES

    /**
     * Overwrites the group's title.
     *
     *  @param {object} oGroup
     *      Group object to be updated
     *  @param {string} sNewTitle
     *      New group title
     */
    function setGroupTitle (oGroup, sNewTitle) {
        oGroup.identification.title = sNewTitle;
    }

    /**
     * Overwrites the group's visibility.
     *
     *  @param {object} oGroup
     *      Group object to be updated
     *  @param {boolean} [sNewVisibility=false]
     *      New visibility of the group. false if the end-user
     *      has hidden the group and true if this is not the case.
     */
    function setGroupVisibility (oGroup, sNewVisibility) {
        if (sNewVisibility) {
            // the default visibility is visible
            delete oGroup.identification.isVisible;
        } else {
            oGroup.identification.isVisible = false;
        }
    }

    return {
        // GROUPS
        createDefaultGroup: createDefaultGroup,
        createEmptyGroup: createEmptyGroup,
        addGroupToSite: addGroupToSite,
        overwriteGroup: overwriteGroup,
        removeGroupFromSite: removeGroupFromSite,
        setGroupsOrder: setGroupsOrder,

        // GROUP PROPERTIES
        setGroupTitle: setGroupTitle,
        setGroupVisibility: setGroupVisibility
    };
}, /* bExport = */ false);
