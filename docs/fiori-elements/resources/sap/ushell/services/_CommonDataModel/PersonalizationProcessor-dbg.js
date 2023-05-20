// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepClone",
    "sap/base/util/extend",
    "sap/base/util/isEmptyObject",
    "sap/base/util/ObjectPath",
    "sap/ui/thirdparty/jquery"
], function (
    Log,
    deepClone,
    extend,
    isEmptyObject,
    ObjectPath,
    jQuery
) {

    "use strict";

    /**
     * The PersonalizationProcessor, mixing in and out the personalization to and from site objects.
     *
     * @class
     * @constructor
     * @see {@link sap.ushell.services.CommonDataModel}
     * @since 1.38.0
     */
    function PersonalizationProcessor () { }

    /**
     * Returns numerical index of given item inside of the given array.
     *
     * "item" must be an object with existing "item.id" (like in tiles or links), which will
     * be compared against "sItemId".
     *
     * @param {Array} aItemArray
     *   An array of "items" as described before.
     * @param {string} sItemId
     *   ID of the item, which position should be returned.
     *
     * @returns {integer}
     *   Array-index of given item as described before - or "-1", if not found.
     *   Note: The index counts from zero, as usual.
     *
     * @private
     */
    PersonalizationProcessor.prototype._getItemIndex = function (aItemArray, sItemId) {
        var iResult;

        for (iResult = 0; iResult < aItemArray.length; iResult++) {
            if (aItemArray[iResult].id === sItemId) {
                break;
            }
        }

        iResult = (iResult >= aItemArray.length) ? -1 : iResult;
        return iResult;
    };

    /**
     * Mixin logic for renaming a certain group in the original site
     *
     * @param {string} sGroupId
     *   Group id
     * @param {string} sNewTitle
     *   New title which should be set
     * @param {object} oOriginalSite
     *   Original site object
     *
     * @returns {boolean}
     *   true, if the certain group has been renamed, and false,
     *   if the certain group has not been renamed.
     *
     * @private
     */
    PersonalizationProcessor.prototype._applyRenameGroup = function (sGroupId, sNewTitle, oOriginalSite) {
        var oGroup,
            bGroupHasBeenRenamed = false;

        if (!sNewTitle) {
            return false;
        }

        if (sGroupId && oOriginalSite && oOriginalSite.groups && oOriginalSite.groups[sGroupId]) {
            oGroup = oOriginalSite.groups[sGroupId];
            if (oGroup.identification && oGroup.identification.title) {
                oOriginalSite.groups[sGroupId].identification.title = sNewTitle;
                bGroupHasBeenRenamed = true;
            }
        }

        return bGroupHasBeenRenamed;
    };

    /**
     * Mixin logic for changing the visibility of a certain group in the original site
     *
     * @param {string} sGroupId
     *   Group id
     * @param {string} bGroupVisibility
     *   Visibility which should be set
     * @param {object} oOriginalSite
     *   Original site object
     *
     * @returns {boolean}
     *   true, if the certain has changed its visibility, and false,
     *   if not.
     *
     * @private
     */
    PersonalizationProcessor.prototype._applyGroupVisibility = function (sGroupId, bGroupVisibility, oOriginalSite) {
        var bGroupVisibilityHasBeenChanged = false;

        if (bGroupVisibility === undefined) {
            return false;
        }

        if (sGroupId && oOriginalSite && oOriginalSite.groups && oOriginalSite.groups[sGroupId]) {
            oOriginalSite.groups[sGroupId].identification.isVisible = bGroupVisibility;
            bGroupVisibilityHasBeenChanged = true;
        }

        return bGroupVisibilityHasBeenChanged;
    };

    /**
     * Mixes in the given personalization delta into the given original site.
     *
     * @param {object} oOriginalSite
     *  Original site object
     * @param {object} oPersonalizationDelta
     *  Personalization delta
     *
     * @returns {Promise}
     *    jQuery promise that is resolved with a copy of oOriginalSite with mixed-in personalization.
     *
     * @see #extractPersonalization
     * @private
     */
    PersonalizationProcessor.prototype.mixinPersonalization = function (oOriginalSite, oPersonalizationDelta) {
        var oDeferred = new jQuery.Deferred(),
            that = this;

        // in case there is no personalization delta available, resolve the site
        if (!oPersonalizationDelta || isEmptyObject(oPersonalizationDelta)) {
            return oDeferred.resolve(oOriginalSite).promise();
        }

        // Firstly apply group operations (applying item changes does depend on this!):

        // TODO 1: Externalize this functionality into a new method "_applyAddOrRenameGroups".
        // TODO 2: Generalize "tileOrder" into "sItemOrder" (tileOrder || linkOrder).
        // PLUS decouple that code (remove item handling code):
        if (oPersonalizationDelta.groups) {
            // iterate over groups in personalization delta which have changes (NOT new groups!):
            Object.keys(oPersonalizationDelta.groups).forEach(function (sGroupId) {
                var oGroup = oPersonalizationDelta.groups[sGroupId];

                if (oOriginalSite.groups[sGroupId]) {
                    // check for changes in the identification part of the respective group
                    if (oGroup.identification) {
                        if (oGroup.identification.title) {
                            // apply new group title
                            that._applyRenameGroup(sGroupId, oGroup.identification.title, oOriginalSite);
                        }
                        if (oGroup.identification.hasOwnProperty("isVisible") && oGroup.identification.isVisible === false) {
                            that._applyGroupVisibility(sGroupId, false, oOriginalSite);
                        }
                    }
                    // Deleted code (17.06.2016).
                    // Was: "check for changes in the payload part of the respective group"
                    // Was incomplete code, but is needed.
                    // But here is wrong place now.
                    // Better: Handle changes in mixin code for tiles,
                    // see near of end of method "_applyItemChanges(any, any)".
                } // else: Non existent group? This is considered an error now, because newly added groups are in 'addedGroups' collection, not here.
            });
        }

        // Add groups (if available):
        this._applyAddGroups(oOriginalSite, oPersonalizationDelta);

        // Removed groups to apply?:
        if (oPersonalizationDelta.removedGroups && Array.isArray(oPersonalizationDelta.removedGroups)) {
            oPersonalizationDelta.removedGroups.forEach(function (sGroupIdent) {
                that._applyRemoveGroup(oOriginalSite, sGroupIdent);
            });
        }

        // Apply moved groups (order changed). Note: Do this AFTER applying other group operations:
        this._applyMoveGroup(oOriginalSite, oPersonalizationDelta);

        // Now apply all item changes saved in properties "movedTiles", "movedLinks" and "groups":
        // Note: As of 17.06.2016, applying direct item changes is not yet implemented.
        this._applyItemChanges(oOriginalSite, oPersonalizationDelta);
        this._applyTileSettings(oOriginalSite, oPersonalizationDelta);

        return oDeferred.resolve(oOriginalSite).promise();
    };

    /**
     * Mixin logic to add all available added Groups.
     *
     * Iterates over all recorded newly groups in "addedGroups" collection and copies each group
     * with all child tiles (if any) into "oOriginalSite".
     *
     * Note: The parameter must not be undefined, but may be empty objects.
     *
     * @param {object} oOriginalSite
     *   Original site object (admin site) with no or only some personalization.
     * @param {object} oPersonalizationDelta
     *   Personalization Delta. If empty or not valid, oOriginalSite may not be changed at all.
     *
     * @private
     */
    PersonalizationProcessor.prototype._applyAddGroups = function (oOriginalSite, oPersonalizationDelta) {
        var aNewGroupsByAdmin = [];

        oOriginalSite.site = oOriginalSite.site || {};
        oOriginalSite.site.payload = oOriginalSite.site.payload || {};
        oOriginalSite.site.payload.groupsOrder = oOriginalSite.site.payload.groupsOrder || [];
        oOriginalSite.groups = oOriginalSite.groups || {};

        if (Array.isArray(oPersonalizationDelta.groupOrder)) {
            oOriginalSite.site.payload.groupsOrder.forEach(function (sGroupId) {
                // Extract groups which got newly assigned
                if (oPersonalizationDelta.groupOrder.indexOf(sGroupId) === -1) {
                    if ((oPersonalizationDelta.removedGroups && oPersonalizationDelta.removedGroups.indexOf(sGroupId) === -1)
                        || !oPersonalizationDelta.removedGroups
                    ) {
                        // group got newly assigned
                        aNewGroupsByAdmin.push(sGroupId);
                    }
                }
            });
        }

        if (
            Array.isArray(oPersonalizationDelta.groupOrder)
            && oPersonalizationDelta.addedGroups
            && Object.keys(oPersonalizationDelta.addedGroups).length > 0
        ) {
            Object.keys(oPersonalizationDelta.addedGroups).forEach(function (sGroupId) {
                // clone the added groups to prevent the personalization delta from being changed
                // when the tiles are added to this group later on
                oOriginalSite.groups[sGroupId] = deepClone(oPersonalizationDelta.addedGroups[sGroupId], 20);
                // Add flag to allow the end user to remove the group if desired.
                // The flag must be added here as after mixin preset and non-preset groups cannot be distinguished.
                // Note: We want to flag all new groups from personalization delta without persisting that change:
                oOriginalSite.groups[sGroupId].payload.isPreset = false;
            });

            oOriginalSite.site.payload.groupsOrder = oPersonalizationDelta.groupOrder;
        }

        aNewGroupsByAdmin.forEach(function (sNewlyAddedGroupId) {
            oOriginalSite.site.payload.groupsOrder.push(sNewlyAddedGroupId);
        });
    };

    /**
     * Delta creation logic for checking whether groups have been renamed
     *
     * @param {string} sGroupId
     *   Id of the group which might gets renamed
     * @param {object} oPersonalizedSiteGroups
     *   Object containing the groups of the personalized site
     * @param {object} oOriginalSiteGroups
     *   Object containing the groups of the original site
     * @param {object} oPersonalizationDelta
     *   Personalization Delta (Diff between original site and personalized site)
     *
     * @returns {object}
     *   Personalization delta
     *   Hint: This function has direct access to the initial personalization delta as object parameters are passed as references to functions.
     *         For testing the output of this function the final personalization delta will be returned.
     *
     * @private
     */
    PersonalizationProcessor.prototype._checkRenameGroup = function (sGroupId, oPersonalizedSiteGroups, oOriginalSiteGroups, oPersonalizationDelta) {
        if (sGroupId && oPersonalizedSiteGroups && oOriginalSiteGroups) {
            if (oOriginalSiteGroups[sGroupId]) {
                // group was found in original site
                if (oPersonalizedSiteGroups[sGroupId].identification.title
                    !== oOriginalSiteGroups[sGroupId].identification.title) {
                    // title needs to get updated
                    oPersonalizationDelta = oPersonalizationDelta || {};
                    oPersonalizationDelta.groups = oPersonalizationDelta.groups || {};
                    oPersonalizationDelta.groups[sGroupId] = oPersonalizationDelta.groups[sGroupId] || {};
                    oPersonalizationDelta.groups[sGroupId].identification
                        = oPersonalizationDelta.groups[sGroupId].identification || {};
                    oPersonalizationDelta.groups[sGroupId].identification.title
                        = oPersonalizedSiteGroups[sGroupId].identification.title;
                }
            }
        }
        return oPersonalizationDelta;
    };

    /**
     * Mixins the specified personalization delta regarding modified tiles into the given site.
     *
     * @param {object} oSite The target site.
     *
     * @param {object} oPersonalizationDelta The personalization delta to be applied.
     */
    PersonalizationProcessor.prototype._applyTileSettings = function (oSite, oPersonalizationDelta) {
        var aGroups, aModifiedTiles;

        if (!oPersonalizationDelta.modifiedTiles) {
            return;
        }

        aGroups = Object.keys(oSite.groups)
            .map(function (key) {
                return this[key];
            }, oSite.groups);

        aModifiedTiles = Object.keys(oPersonalizationDelta.modifiedTiles)
            .map(function (key) {
                return this[key];
            }, oPersonalizationDelta.modifiedTiles);

        aGroups.some(function (oGroup) {
            ["tiles", "links"].forEach(function (sTileType) {
                if (oGroup.payload[sTileType]) {
                    oGroup.payload[sTileType].some(function (oTile) {
                        // If oTile was modified, and the modification was applied
                        // we should remove that modification (identified by its index)
                        // in the list of ones waiting to be applied.
                        var iProcessedIndex;

                        aModifiedTiles.some(function (oUserTile, iIndex) {
                            if (oUserTile.id === oTile.id) {
                                if (oUserTile.title !== undefined) {
                                    oTile.title = oUserTile.title;
                                }

                                if (oUserTile.subTitle !== undefined) {
                                    oTile.subTitle = oUserTile.subTitle;
                                }

                                if (oUserTile.info !== undefined) {
                                    oTile.info = oUserTile.info;
                                }

                                if (oUserTile.displayFormatHint !== undefined) {
                                    oTile.displayFormatHint = oUserTile.displayFormatHint;
                                }

                                iProcessedIndex = iIndex;

                                // Conclude the search when a matching modified tile is found.
                                return true;
                            }

                            // Continue the search.
                            return false;
                        });

                        if (iProcessedIndex !== undefined) {
                            aModifiedTiles.splice(iProcessedIndex, 1);
                        }

                        // Quit when there are no modified tiles to apply.
                        return aModifiedTiles.length === 0;
                    });
                }
            });
            // Quit when there are no modified tiles to apply.
            return aModifiedTiles.length === 0;
        });
    };

    /**
     * Delta creation logic for checking whether groups have changed their visibility
     *
     * @param {string} sGroupId
     *   Group id
     * @param {object} oPersonalizedSiteGroups
     *   Object containing the groups of the personalized site
     * @param {object} oOriginalSiteGroups
     *   Object containing the groups of the original site
     * @param {object} oPersonalizationDelta
     *   Personalization Delta (Diff between original site and personalized site)
     *
     * @returns {object}
     *   Personalization delta
     *   Hint: This function has direct access to the initial personalization delta as object parameters are passed as references to functions.
     *         For testing the output of this function the final personalization delta will be returned.
     *
     * @private
     */
    PersonalizationProcessor.prototype._checkGroupVisibility = function (sGroupId, oPersonalizedSiteGroups, oOriginalSiteGroups, oPersonalizationDelta) {
        if (sGroupId && oPersonalizedSiteGroups && oOriginalSiteGroups) {
            if (oOriginalSiteGroups[sGroupId]) {
                // group was found in original site
                if (oPersonalizedSiteGroups[sGroupId].identification.isVisible
                    !== oOriginalSiteGroups[sGroupId].identification.isVisible &&
                    typeof oPersonalizedSiteGroups[sGroupId].identification.isVisible === "boolean") {
                    // visibility needs to get updated
                    oPersonalizationDelta = oPersonalizationDelta || {};
                    oPersonalizationDelta.groups = oPersonalizationDelta.groups || {};
                    oPersonalizationDelta.groups[sGroupId] = oPersonalizationDelta.groups[sGroupId] || {};
                    oPersonalizationDelta.groups[sGroupId].identification
                        = oPersonalizationDelta.groups[sGroupId].identification || {};
                    oPersonalizationDelta.groups[sGroupId].identification.isVisible
                        = oPersonalizedSiteGroups[sGroupId].identification.isVisible;
                }
            }
        }
        return oPersonalizationDelta;
    };

    /**
     * Delta creation logic for adding groups to personalization delta
     *
     * This method will be called while extracting differences between original and personalized
     * site object in case there was a new group detected. - So save that new group in the diff now,
     * but without tiles available eventually.
     *
     * @param {object} oPersonalizedSite
     *   Site object with personalization
     * @param {object} oPersonalizationDelta
     *   Personalization Delta (Diff between original site and live site). May be an empty object, but must NOT be undefined.
     * @param {string} sGroupId
     *   Id of the group which gets added
     *
     * @returns {boolean}
     *   TRUE, if group was added successfully, FALSE otherwise.
     *
     * @private
     */
    PersonalizationProcessor.prototype._addGroupToPersonalizationDelta = function (oPersonalizedSite, oPersonalizationDelta, sGroupId) {
        var bSuccess = false,
            aGroupsOrder,
            oNewPersonalizedGroup;

        if (oPersonalizedSite && oPersonalizedSite.site && oPersonalizedSite.site.payload
            && oPersonalizedSite.site.payload.groupsOrder
            && oPersonalizedSite.groups
            && sGroupId
            && oPersonalizedSite.groups[sGroupId]
            && oPersonalizationDelta // If we would create it here, data may be lost. Must at least be empty therefore.
        ) {
            aGroupsOrder = oPersonalizedSite.site.payload.groupsOrder;
            oNewPersonalizedGroup = oPersonalizedSite.groups[sGroupId];

            // Write new group to the delta - but without possible tiles:
            oPersonalizationDelta.addedGroups = oPersonalizationDelta.addedGroups || {};
            oPersonalizationDelta.addedGroups[sGroupId] = {};
            oPersonalizationDelta.addedGroups[sGroupId].identification = extend({}, oNewPersonalizedGroup.identification);
            // TODO: assumtion is: this is not needed...
            oPersonalizationDelta.addedGroups[sGroupId].payload = extend({}, oNewPersonalizedGroup.payload);
            oPersonalizationDelta.addedGroups[sGroupId].payload.tiles = [];
            oPersonalizationDelta.addedGroups[sGroupId].payload.links = [];
            // Save groupsOrder:
            oPersonalizationDelta.groupOrder = aGroupsOrder;
            bSuccess = true;
        }

        return bSuccess;
    };

    /**s
     * Extracts the personalization data from the given personalized site.
     * Therefore it creates a semantic diff out of the personalized site and the original site.
     *
     * @param {object} oPersonalizedSite
     *   Site with personalization
     * @param {object} oOriginalSite
     *   Site without personalization
     *
     * @returns {Promise}
     *    jQuery promise that is resolved with personalization delta
     */
    PersonalizationProcessor.prototype.extractPersonalization = function (oPersonalizedSite, oOriginalSite) {
        var oDeferred = new jQuery.Deferred(),
            oPersonalizedSiteGroups,
            oPersonalizationDelta = {},
            oOriginalSiteGroups,
            oExtractHelper,
            that = this;

        if (oPersonalizedSite && oPersonalizedSite.groups && oOriginalSite && oOriginalSite.groups) {
            oPersonalizedSiteGroups = oPersonalizedSite.groups;
            oOriginalSiteGroups = oOriginalSite.groups;

            // Handle payload changes (tiles and links):
            // For now: Tiles only (use defaults).
            oExtractHelper = this._getExtractHelperObject(oOriginalSite, oPersonalizedSite, oPersonalizationDelta);

            // Iterate over original CDM site object to detect removed groups and items (tiles or links):
            Object.keys(oOriginalSiteGroups).forEach(function (sGroupId) {
                that._checkRemoveGroup(oPersonalizedSite, oPersonalizationDelta, sGroupId);
                // Check for (re-)moved(-) tiles: TODO: Add a line for checking links, too:
                that._extractFromOriginalSiteOneGroup(oOriginalSite, oExtractHelper, sGroupId, "tiles");
                that._extractFromOriginalSiteOneGroup(oOriginalSite, oExtractHelper, sGroupId, "links");
            });

            // Renamed and added groups: Iterate over groups of the personalized site (without handling payload like tiles or links):
            Object.keys(oPersonalizedSiteGroups).forEach(function (sGroupId) {
                if (oOriginalSiteGroups[sGroupId]) {
                    that._checkRenameGroup(sGroupId, oPersonalizedSiteGroups, oOriginalSiteGroups, oPersonalizationDelta);
                    that._checkGroupVisibility(sGroupId, oPersonalizedSiteGroups, oOriginalSiteGroups, oPersonalizationDelta);
                } else {
                    // newly added group
                    that._addGroupToPersonalizationDelta(oPersonalizedSite, oPersonalizationDelta, sGroupId);
                }
                // Check added and moved(+) tiles: TODO: Add a line for checking links, too:
                that._extractFromPersonalizedSiteOneGroup(oPersonalizedSite, oExtractHelper, sGroupId, "tiles");
                that._extractFromPersonalizedSiteOneGroup(oPersonalizedSite, oExtractHelper, sGroupId, "links");
            });

            // To avoid entering the inner loop: Call this method *after* all other group check operations:
            this._checkMoveGroup(oPersonalizedSite, oOriginalSite, oPersonalizationDelta);

            // Cleanup 1: HAVE TO be first called:
            this._cleanupRemovedGroups(oOriginalSite, oPersonalizationDelta);

            // Cleanup 2: Make tests easier (and do not store unnecessary bits):
            if (oExtractHelper.oPersonalizationDelta.movedTiles && isEmptyObject(oExtractHelper.oPersonalizationDelta.movedTiles)) {
                delete (oExtractHelper.oPersonalizationDelta.movedTiles);
            }

            // Cleanup 3: Make tests easier (and do not store unnecessary bits):
            if (oExtractHelper.oPersonalizationDelta.movedLinks && isEmptyObject(oExtractHelper.oPersonalizationDelta.movedLinks)) {
                delete (oExtractHelper.oPersonalizationDelta.movedLinks);
            }
        }

        // Personalization data of different CDM versions cannot be mixed
        if (oOriginalSite._version) {
            oPersonalizationDelta._version = oOriginalSite._version;
        }

        // oExtractHelper.oPersonalizationDelta should be same as oPersonalizationDelta:
        return oDeferred.resolve(oPersonalizationDelta).promise();
    };

    /**
     *Checks if group in question was removed; Updates the personalization delta if needed.
     *
     * @param {object} oPersonalizedSite
     *   Site with personalization.
     * @param {object} oPersonalizationDelta
     *   Personalization Delta object which may already exist - or may an empty object (but must NOT be undefined).
     * @param {string} sOriginalGroupId
     *   Group ID of the group in question.
     *
     * @returns {boolean}
     *   TRUE, if test was successful (e.g. possible), FALSE otherwise.
     *
     * @private
     */
    PersonalizationProcessor.prototype._checkRemoveGroup = function (oPersonalizedSite, oPersonalizationDelta, sOriginalGroupId) {
        var bSuccess = false;

        if (oPersonalizedSite && oPersonalizedSite.groups && oPersonalizationDelta && sOriginalGroupId) {
            if (!oPersonalizedSite.groups[sOriginalGroupId]) {
                // Group was removed => save that fact:
                oPersonalizationDelta.removedGroups = oPersonalizationDelta.removedGroups || [];
                oPersonalizationDelta.groupOrder = oPersonalizationDelta.groupOrder || [];
                if (oPersonalizationDelta.removedGroups.indexOf(sOriginalGroupId) === -1) {
                    oPersonalizationDelta.removedGroups.push(sOriginalGroupId);
                } // else: already saved.

                if (oPersonalizedSite.site
                    && oPersonalizedSite.site.payload
                    && oPersonalizedSite.site.payload.groupsOrder
                    && Array.isArray(oPersonalizedSite.site.payload.groupsOrder)
                ) {
                    oPersonalizationDelta.groupOrder = oPersonalizedSite.site.payload.groupsOrder.slice(0); // Copy
                } // else: Unexpected Error: groupsOrder is required in site objects.
            } // Group in question IS available on personalized site => no action, but state == success
            bSuccess = true;
        } // else: invalid input

        return bSuccess;
    };

    /**
     * Remove specified group from given copy of "original" site object.
     *
     * @param {object} oOriginalSite
     *   CDM site object evolved from "original site", which may or may not modified already(*).
     * @param {string} sGroupId
     *   Id or key(*) of group to remove
     *
     * @returns {boolean}
     *   TRUE, if removing group was successful, FALSE otherwise.
     *
     * @private
     */
    PersonalizationProcessor.prototype._applyRemoveGroup = function (oOriginalSite, sGroupId) {
        var oOriginalGroups,
            aGroupsOrder,
            iGroupPos;

        if (oOriginalSite && oOriginalSite.groups && oOriginalSite.site
            && oOriginalSite.site.payload && oOriginalSite.site.payload.groupsOrder
            && sGroupId
        ) {
            oOriginalGroups = oOriginalSite.groups;
            aGroupsOrder = oOriginalSite.site.payload.groupsOrder;

            // Remove group from tree and order array:
            iGroupPos = aGroupsOrder.indexOf(sGroupId);
            if (!(iGroupPos === -1)) {
                aGroupsOrder.splice(iGroupPos, 1);
                delete (oOriginalGroups[sGroupId]);
                return true;
            } // else: Error: Group to remove isn't listed in groupsOrder array.
        }

        return false;
    };

    /**
     * Check for and save modified group order.
     *
     * After excluding and handling some special cases, this method does loop over "groupsOrder"
     * array of original site and compares with corresponding entry of personalized site.
     * If differences have been found, the order array of personalized site will be copied
     * to the personalization delta.
     *
     * @param {object} oPersonalizedSite
     *   Site with personalization; This object must NOT be undefined, but may be an empty object.
     * @param {object} oOriginalSite
     *   Site without personalization; This object must NOT be undefined, but may be an empty object.
     * @param {object} oPersonalizationDelta
     *   Personalization Delta object which may be prefilled or an empty object (but NOT undefined).
     *
     * @returns {boolean}
     *   TRUE if group order was copied, FALSE otherwise.
     *
     * @private
     */
    PersonalizationProcessor.prototype._checkMoveGroup = function (oPersonalizedSite, oOriginalSite, oPersonalizationDelta) {
        var aPersonalizedGroupsOrder,
            aOriginalGroupsOrder,
            bOrderArraysDiffer = false,
            bSuccess = false;

        if (oPersonalizedSite.site
            && oPersonalizedSite.site.payload
            && Array.isArray(oPersonalizedSite.site.payload.groupsOrder)
            && oOriginalSite.site
            && oOriginalSite.site.payload
            && Array.isArray(oOriginalSite.site.payload.groupsOrder)
        ) {
            aPersonalizedGroupsOrder = oPersonalizedSite.site.payload.groupsOrder;
            aOriginalGroupsOrder = oOriginalSite.site.payload.groupsOrder;

            // Try all to avoid inner loop to compare the arrays element wise:
            if (aPersonalizedGroupsOrder.length === aOriginalGroupsOrder.length) {
                bOrderArraysDiffer = (function () {
                    var bState = false,
                        iIndex;
                    for (iIndex = 0; iIndex < aOriginalGroupsOrder.length; iIndex++) {
                        if (aOriginalGroupsOrder[iIndex] !== aPersonalizedGroupsOrder[iIndex]) {
                            bState = true;
                            break;
                        }
                    }
                    return bState;
                })();
                if (bOrderArraysDiffer) {
                    oPersonalizationDelta.groupOrder = aPersonalizedGroupsOrder;
                    bSuccess = true;
                }
            } // else: Let "_checkAddGroups" or "_checkRemoveGroup" do the work.
        } // else: no order available, therefore no order change possible
        return bSuccess;
    };

    /**
     * Mixin logic to restore a changed group order.
     *
     * @param {object} oOriginalSite
     *   Original site object (admin site) with no or only some personalization; Must NOT be undefined, but may be an empty object.
     * @param {object} oPersonalizationDelta
     *   Personalization Delta. If an empty object or otherwise not valid, oOriginalSite may not be changed at all; Must NOT be undefined.
     *
     * @returns {boolean}
     *   TRUE if successful (e.g. order was restored), FALSE otherwise (e.g. no action).
     *
     * @private
     */
    PersonalizationProcessor.prototype._applyMoveGroup = function (oOriginalSite, oPersonalizationDelta) {
        var bSuccess = false;

        if (Array.isArray(oPersonalizationDelta.groupOrder)) {
            oOriginalSite.site = oOriginalSite.site || {};
            oOriginalSite.site.payload = oOriginalSite.site.payload || {};
            if (!Array.isArray(oOriginalSite.site.payload.groupsOrder)) {
                oOriginalSite.site.payload.groupsOrder = [];
            }
            if (oOriginalSite.site.payload.groupsOrder.length === oPersonalizationDelta.groupOrder.length) {
                // Restore group order:
                oOriginalSite.site.payload.groupsOrder = oPersonalizationDelta.groupOrder;
                bSuccess = true;
            } // else: At least one group add or remove operation was done - which does rewrite groupsOrder, too.
        }

        return bSuccess;
    };

    /**
     * Builds a data structure for given site object which does allow hash based access to tile and link objects.
     *
     * @param {object} oSiteObject
     *   Some valid CDM site object.
     *
     * @returns {object}
     *   Returns an "hashed item collection" object (HashedItems), which is structured
     *   as follows:
     *   {
     *     "someGroupIdUsedAsKeyHere": {
     *       "someItemIdUsedAsKeyHere": {
     *         "iIndex": "someNumericIndexInOriginalArray",
     *         "oItem": "Reference to array item which lies at "iIndex"
     *       },
     *       "moreItems...": {
     *         "..."
     *       }
     *     },
     *     "moreGroups": {"..."}
     *   }
     *
     *   Please replace "speaking" names with real values as pointed out with "speaking".
     *   And note: "item" may be used for tiles or links...
     *
     *   Note: In case of an error, the object may be empty or partially filled out only.
     *
     * @private
     */
    PersonalizationProcessor.prototype._getHashedItemsFromSite = function (oSiteObject) {
        var oResult = null;

        // TODO: Generalize "Tiles" into "Items"... but without an extra parameter.

        // sItemType = sItemType ? sItemType : "tiles";        // Define default

        if (oSiteObject && oSiteObject.groups) {
            if (Object.keys(oSiteObject.groups).length > 0) {
                oResult = {};
                Object.keys(oSiteObject.groups).forEach(function (sGroupId) {
                    var oGroup = oSiteObject.groups[sGroupId],
                        aGroupTiles;

                    oResult[sGroupId] = {};
                    // TODO: For generalizing to tiles: Externalize code as new method:
                    if (oGroup.payload) {
                        ["tiles", "links"].forEach(function (sTileType) {
                            oResult[sGroupId][sTileType] = {};
                            if (Array.isArray(oGroup.payload[sTileType])) {
                                aGroupTiles = oGroup.payload[sTileType];
                                aGroupTiles.forEach(function (oItem, iIndex) {
                                    var sItemId;

                                    if (oItem && oItem.id) {
                                        sItemId = oItem.id;
                                        oResult[sGroupId][sTileType][sItemId] = {
                                            iIndex: iIndex,
                                            sItemId: oItem
                                        };
                                    } // else: oItem is invalid => skip
                                });
                            }
                        });
                    } // else: No payload.tiles array => oGroup is invalid => skip
                });
            } // else: oSiteObject has no groups => Skip
        }

        return oResult;
    };

    /**
     * Creates the "ExtractHelper" object as defined below.
     *
     * The "ExtractHelper" object is used to implement more efficiently algorithms for extracting
     * differences between original und personalized site objects and creating the delta to persist.
     * "ExtractHelper" holds three objects: Two "HashedItems" as defined in "_getHashedItemsFromSite"
     * and the "PersonalizationDelta" object.
     *
     * @param {object} oOriginalSite
     *   Original site object (admin site) with no personalization.
     * @param {object} oPersonalizedSite
     *   Site with personalization.
     * @param {object} oPersonalizationDelta
     *   Personalization Delta. May be prefilled with some data or being an empty object. Must NOT be undefined.
     *
     * @returns {object}
     *   Returns an "ExtractHelper" object, which ist structured as follows:
     *   oExtractHelper: {
     *     "oHashedItemsOriginal": {...},
     *     "oHashedItemsPersonalized": {...},
     *     "oPersonalizationDelta": {...As documented otherwise in Wiki and CDMPersonalizationMobileTiles*}
     *   }
     *
     * @private
     * @see _getHashedItemsFromSite
     */
    PersonalizationProcessor.prototype._getExtractHelperObject = function (oOriginalSite, oPersonalizedSite, oPersonalizationDelta) {
        var oResult = null;

        oResult = {};
        oResult.oHashedItemsOriginal = this._getHashedItemsFromSite(oOriginalSite) || {}; // empty original site is ok
        oResult.oHashedItemsPersonalized = this._getHashedItemsFromSite(oPersonalizedSite);
        oResult.oPersonalizationDelta = oPersonalizationDelta;

        return oResult;
    };

    /**
     * Extract personalization delta part for one group from original site.
     *
     * Iterates over all items (tiles or links) on the given group in <b>original site</b>.
     * thereby checking for moved or removed items.
     *
     * @param oOriginalSite
     *   Original site object (admin site) with no personalization.
     * @param oExtractHelper
     *   Our temporary data structure for computing differences regarding tiles.
     * @param sGroupId
     *   ID of the group handled currently.
     * @param sItemType
     *   Type of item. Currently with two possible values: "tiles" (default) and "links".
     *
     * @returns {boolean}
     *   TRUE, if group is testing was successfully (with or without writing a delta),
     *   FALSE in case of an error done to invalid input data.
     *
     * @private
     */
    PersonalizationProcessor.prototype._extractFromOriginalSiteOneGroup = function (oOriginalSite, oExtractHelper, sGroupId, sItemType) {
        var bSuccess = false,
            aOriginalItems,
            oMovedTiles,
            fMarkAsReMoved,
            sPersonalizedDeltaType = "movedTiles";

        sItemType = sItemType || "tiles"; // Define default

        if (sItemType !== "tiles") {
            sPersonalizedDeltaType = "movedLinks";
        }

        // Define inner helper method for creating a "removed entry" in oExtractHelper.oPersonalizationDelta.movedTiles / moveLinks:
        fMarkAsReMoved = function (sOriginalItemId, sFromGroupId) {
            oMovedTiles[sOriginalItemId] = oMovedTiles[sOriginalItemId] ? oMovedTiles[sOriginalItemId] : {};
            oMovedTiles[sOriginalItemId].fromGroup = sFromGroupId;
            oMovedTiles[sOriginalItemId].toGroup = null;
        };

        if (oExtractHelper
            // Not needed here: && oExtractHelper.oHashedItemsOriginal
            && oExtractHelper.oHashedItemsPersonalized
            && oExtractHelper.oPersonalizationDelta
            && oOriginalSite
            && oOriginalSite.groups
            && oOriginalSite.groups[sGroupId]
            && oOriginalSite.groups[sGroupId].payload
            && Array.isArray(oOriginalSite.groups[sGroupId].payload[sItemType])
        ) {
            aOriginalItems = oOriginalSite.groups[sGroupId].payload[sItemType];
            oExtractHelper.oPersonalizationDelta[sPersonalizedDeltaType] = oExtractHelper.oPersonalizationDelta[sPersonalizedDeltaType]
                ? oExtractHelper.oPersonalizationDelta[sPersonalizedDeltaType] : {};
            oMovedTiles = oExtractHelper.oPersonalizationDelta[sPersonalizedDeltaType];
            if (oExtractHelper.oHashedItemsPersonalized[sGroupId]) {
                // Check for occurrence of item inside of the personalized object:
                aOriginalItems.forEach(function (oItem) {
                    if (!oExtractHelper.oHashedItemsPersonalized[sGroupId][sItemType][oItem.id]) {
                        // Item not found in personalization part => mark as (re)moved:
                        fMarkAsReMoved(oItem.id, sGroupId);
                    }
                });
                bSuccess = true;
            } else {
                // Group not in personalized site object (because it was removed):
                //  =>Mark *ALL* tiles of this group as (re)moved:
                aOriginalItems.forEach(function (oItem) {
                    fMarkAsReMoved(oItem.id, sGroupId);
                });
                bSuccess = true;
            }
        } // else: Invalid data.

        return bSuccess;
    };

    /**
     * Checks for changes done to a tile or link and registers the personalization delta, if any.
     *
     * @param {object} oPersonalizedItem
     *   An tile (or its link) that has been personalized.
     * @param {object} oExtractHelper
     *   Our temporary data structure for computing differences regarding tiles.
     * @param {string} sGroupId
     *   ID of the group handled currently.
     * @param {string} sItemType
     *   Type of item. Currently with two possible values: "tiles" (default) and "links".
     *
     * @returns {boolean}
     *   TRUE, if a change on the destined item was detected and saved in "oExtractHelper",
     *   FALSE otherwise.
     *
     * @private
     */
    PersonalizationProcessor.prototype._extractPersonalizationDeltaForTile = function (oPersonalizedItem, oExtractHelper, sGroupId, sItemType) {
        // Get original tile
        var oOriginalItem = ObjectPath.get(["oHashedItemsOriginal", sGroupId, sItemType, oPersonalizedItem.id, "sItemId"], oExtractHelper);
        if (!oOriginalItem) {
            return false;
        }

        // Calculate personalization delta
        var oModifiedTile = {};

        if (oPersonalizedItem.title !== oOriginalItem.title) {
            oModifiedTile.title = oPersonalizedItem.title;
        }
        if (oPersonalizedItem.subTitle !== oOriginalItem.subTitle) {
            oModifiedTile.subTitle = oPersonalizedItem.subTitle;
        }
        if (oPersonalizedItem.info !== oOriginalItem.info) {
            oModifiedTile.info = oPersonalizedItem.info;
        }
        if (oPersonalizedItem.displayFormatHint !== oOriginalItem.displayFormatHint &&
            // if the displayFormatHint is omitted in the site it is default automatically
            !(oPersonalizedItem.displayFormatHint === "default" && !oOriginalItem.displayFormatHint)) {
            oModifiedTile.displayFormatHint = oPersonalizedItem.displayFormatHint;
        }

        if (isEmptyObject(oModifiedTile)) {
            return false;
        }

        // Register delta for tile
        if (!oExtractHelper.oPersonalizationDelta.modifiedTiles) {
            oExtractHelper.oPersonalizationDelta.modifiedTiles = {};
        }
        var oModifiedTiles = oExtractHelper.oPersonalizationDelta.modifiedTiles;
        oModifiedTile.id = oPersonalizedItem.id;
        oModifiedTiles[oPersonalizedItem.id] = oModifiedTile;

        return true;
    };

    /**
     *
     * Extract personalization delta part for one group from personalized site.
     *
     * Iterates over all items (tiles or links) on the given group in <b>personalized site</b>.
     * thereby checking for differences and extracting it to the delta.
     *
     * @param oPersonalizedSite
     *   Site with personalization.
     * @param oExtractHelper
     *   Our temporary data structure for computing differences regarding tiles.
     * @param sGroupId
     *   ID of the group handled currently.
     * @param sItemType
     *   Type of item. Currently with two possible values: "tiles" (default) and "links".
     *
     * @returns {boolean}
     *   TRUE, if successfully (e.g. checking for differences could be done),
     *   FALSE otherwise (e.g. invalid input data).
     *
     * @private
     */
    // TODO: Generalize "tileOrder" into "sItemOrder" (tileOrder || linkOrder).
    PersonalizationProcessor.prototype._extractFromPersonalizedSiteOneGroup = function (oPersonalizedSite, oExtractHelper, sGroupId, sItemType) {
        var bSuccess = false,
            oMovedTiles,
            aTileOrder,
            bTileOrderChanged = false,
            aPersonalizedItems,
            that = this,
            sPersonalizedDeltaType = "movedTiles";

        sItemType = sItemType || "tiles"; // Define default
        if ((sItemType !== "tiles") && (sItemType !== "links")) {
            return bSuccess; // Not supported item type !
        }

        if (sItemType !== "tiles") {
            sPersonalizedDeltaType = "movedLinks";
        }

        if (oExtractHelper
            // Not needed here: && oExtractHelper.oHashedItemsPersonalized
            && oExtractHelper.oPersonalizationDelta
            && oPersonalizedSite
            && oPersonalizedSite.groups
            && oPersonalizedSite.groups[sGroupId]
            && oPersonalizedSite.groups[sGroupId].payload
            && Array.isArray(oPersonalizedSite.groups[sGroupId].payload[sItemType])
        ) {
            aPersonalizedItems = oPersonalizedSite.groups[sGroupId].payload[sItemType];
            oExtractHelper.oPersonalizationDelta[sPersonalizedDeltaType] = oExtractHelper.oPersonalizationDelta[sPersonalizedDeltaType]
                ? oExtractHelper.oPersonalizationDelta[sPersonalizedDeltaType] : {};
            oMovedTiles = oExtractHelper.oPersonalizationDelta[sPersonalizedDeltaType];
            aTileOrder = [];

            aPersonalizedItems.forEach(function (oItem, iIndex) {
                if (!oItem) {
                    return; // oItem is invalid => skip
                }

                // Build tileOrder array (incrementally):
                aTileOrder.push(oItem.id);

                if (oExtractHelper.oHashedItemsOriginal[sGroupId] && oExtractHelper.oHashedItemsOriginal[sGroupId][sItemType][oItem.id]) {
                    // Item found in original part in SAME group.
                    // Remove item entry in oMovedTiles, as we don't need it anymore:
                    if (oMovedTiles[oItem.id]) {
                        Log.error(
                            "Extract personalization failed",
                            "The Tile ID " + oItem.id + " is not unique in the site",
                            "PersonalizationProcessor"
                        );
                        delete (oMovedTiles[oItem.id]);
                    } // else: Error: It have to be here. Test is for code stability only.

                    // Was item moved within this (same) group?:
                    if (oExtractHelper.oHashedItemsOriginal[sGroupId][sItemType][oItem.id].iIndex !== iIndex) {
                        bTileOrderChanged = true; // Mark: Tile order changed for this group.
                    }

                    that._extractPersonalizationDeltaForTile(oItem, oExtractHelper, sGroupId, sItemType);
                } else {
                    // Not found in same group on original site:
                    // But maybe it was moved from another group or added newly?:
                    bTileOrderChanged = true; // Moved or added items change order inevitable...
                    if (oMovedTiles[oItem.id]) {
                        // Yes, moved item (removed from corresponding group in original site, but now found here):
                        if (oMovedTiles[oItem.id].fromGroup && (oMovedTiles[oItem.id].fromGroup !== sGroupId)) {
                            // Mark item as "moved" by setting "toGroup" property, too:
                            if (!oMovedTiles[oItem.id].toGroup) {
                                oMovedTiles[oItem.id].toGroup = sGroupId;
                                that._extractPersonalizationDeltaForTile(oItem, oExtractHelper, oMovedTiles[oItem.id].fromGroup, sItemType);
                            } // else: Error: Item should NOT be in two different groups or multiple times in one group.
                        } // else: Considered an error: Item should really have a group coming from and should NOT be added twice.
                    } else {
                        // Item was added, create a new entry in personalization delta:
                        oMovedTiles[oItem.id] = {};
                        oMovedTiles[oItem.id].fromGroup = null;
                        oMovedTiles[oItem.id].toGroup = sGroupId;
                        oMovedTiles[oItem.id].item = oItem;
                    }
                }
            });

            // Save tile/link Order, if needed:
            if (bTileOrderChanged) {
                // Move temporary tile/link Order to persistence location (e.g. personalized delta):
                oExtractHelper.oPersonalizationDelta.groups = oExtractHelper.oPersonalizationDelta.groups || {};
                oExtractHelper.oPersonalizationDelta.groups[sGroupId] = oExtractHelper.oPersonalizationDelta.groups[sGroupId] || {};
                oExtractHelper.oPersonalizationDelta.groups[sGroupId].payload = oExtractHelper.oPersonalizationDelta.groups[sGroupId].payload || {};

                if (sItemType === "tiles") {
                    oExtractHelper.oPersonalizationDelta.groups[sGroupId].payload.tileOrder = aTileOrder;
                } else {
                    oExtractHelper.oPersonalizationDelta.groups[sGroupId].payload.linkOrder = aTileOrder;
                }
            }

            bSuccess = true;
        } // else: Invalid data.

        return bSuccess;
    };

    /**
     * Cleanup from personalization delta all items from removed groups, which did not moved into another group.
     *
     * @param {object} oOriginalSite
     *   Site without personalization; This object must NOT be undefined, but may be an empty object.
     * @param {object} oPersonalizationDelta
     *   Site personalization delta.
     *
     * (No return value)
     *
     * @private
     */
    PersonalizationProcessor.prototype._cleanupRemovedGroups = function (oOriginalSite, oPersonalizationDelta) {
        var aItems,
            oMoveTileEntry;

        // TODO: Extend to handle "links", too.

        if (oPersonalizationDelta.removedGroups
            && oPersonalizationDelta
            && Array.isArray(oPersonalizationDelta.removedGroups)
            && (oPersonalizationDelta.removedGroups.length > 0)
        ) {
            oPersonalizationDelta.removedGroups.forEach(function (sGroupId) {
                if (oOriginalSite
                    && oOriginalSite.groups
                    && oOriginalSite.groups[sGroupId]
                    && oOriginalSite.groups[sGroupId].payload
                ) {
                    [{ sType: "tiles", sPersonalizationDeltaType: "movedTiles" }, { sType: "links", sPersonalizationDeltaType: "movedLinks" }].forEach(function (oTileType) {
                        if (Array.isArray(oOriginalSite.groups[sGroupId].payload[oTileType.sType])) {
                            aItems = oOriginalSite.groups[sGroupId].payload[oTileType.sType];
                            aItems.forEach(function (oItem) {
                                if (oPersonalizationDelta[oTileType.sPersonalizationDeltaType]) {
                                    oMoveTileEntry = oPersonalizationDelta[oTileType.sPersonalizationDeltaType][oItem.id];
                                    if (oMoveTileEntry
                                        && oMoveTileEntry.fromGroup
                                        && (oMoveTileEntry.fromGroup === sGroupId)
                                        && !oMoveTileEntry.toGroup
                                    ) {
                                        delete (oPersonalizationDelta[oTileType.sPersonalizationDeltaType][oItem.id]);
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
    };

    /**
     * Sets order of items (tiles, links) in original site object as determined by ITEMOrder array, if any.
     *
     * @param {Array} aOriginalSiteItems
     *   The ITEMS array of a certain group in the original site object (e.g. "payload.tiles" or "payload.links").
     * @param {Array} aItemOrder
     *   The ITEMOrder array for that group, got from personalization delta (e.g. "payload.tileOrder" or "payload.linkOrder").
     *
     * @returns {boolean}
     *   Returns TRUE if successfully and FALSE in case of at least on error.
     *
     * @private
     */
    PersonalizationProcessor.prototype._setItemOrderOnSiteCollection = function (aOriginalSiteItems, aItemOrder) {
        var bSuccess = true,
            iSiteItemsOrigLength = aOriginalSiteItems.length,
            aSavedOriginal,
            oSpareCollection = {},
            iIndex,
            oCurrentOriginalItem,
            sCurrentItemId,
            bFound;

        if (!Array.isArray(aOriginalSiteItems) || !Array.isArray(aOriginalSiteItems) || (aOriginalSiteItems.length !== aItemOrder.length)) {
            return false;
        }

        aSavedOriginal = aOriginalSiteItems.splice(0, aOriginalSiteItems.length);
        for (iIndex = 0; iIndex < aItemOrder.length; iIndex++) {
            sCurrentItemId = aItemOrder[iIndex];
            oCurrentOriginalItem = aSavedOriginal.shift();
            if (oCurrentOriginalItem && sCurrentItemId === oCurrentOriginalItem.id) {
                // All is fine, build result array and continue in loop:
                aOriginalSiteItems.push(oCurrentOriginalItem);
            } else if (oSpareCollection[sCurrentItemId]) {
                // Take it from saved items occurring earlier, push it, clean up and continue:
                aOriginalSiteItems.push(oSpareCollection[sCurrentItemId]);
                delete (oSpareCollection[sCurrentItemId]);
                if (oCurrentOriginalItem) { oSpareCollection[oCurrentOriginalItem.id] = oCurrentOriginalItem; }
            } else if (oCurrentOriginalItem) {
                // Save item for later use and search for a matching one:
                oSpareCollection[oCurrentOriginalItem.id] = oCurrentOriginalItem;
                bFound = false;
                while (aSavedOriginal.length > 0) {
                    oCurrentOriginalItem = aSavedOriginal.shift();
                    if (sCurrentItemId === oCurrentOriginalItem.id) {
                        aOriginalSiteItems.push(oCurrentOriginalItem);
                        bFound = true;
                        break;
                    } else {
                        oSpareCollection[oCurrentOriginalItem.id] = oCurrentOriginalItem;
                    }
                }
                if (!bFound) {
                    bSuccess = false; // Current item not available in site items.
                }
                // continue for-loop.
            } // else: "aSavedOriginal" is empty already.
        }

        if (aOriginalSiteItems.length !== iSiteItemsOrigLength) {
            bSuccess = false; // We did lost some item(s) while sorting!
        }

        return bSuccess;
    };

    /**
     * Calls "_setItemOrderOnSiteCollection" for one item type (tile || link).
     *
     * @param {object} oOriginalGroup
     *   A single group of original site, which NAY have item order changes to apply
     * @param {object} oDeltaGroup
     *   The corresponding group object from personalization delta.
     * @param {string} sItemType
     *   Type of item to reorder: tile or link.
     *
     * @returns {boolean}
     *   Returns TRUE if successfully and FALSE in case of at least on error.
     *
     * @private
     */
    PersonalizationProcessor.prototype._setItemOrderOnSiteGroupForItemType = function (oOriginalGroup, oDeltaGroup, sItemType) {
        var bSuccess = true,
            bTempSuccess,
            sItemOrder;

        if ((sItemType === "tiles") || (sItemType === "links")) {
            sItemOrder = (sItemType === "tiles") ? "tileOrder" : "linkOrder";
        } else {
            // This is in fact really a programming error. But for simplicity, report as normal input data error:
            return false;
        }

        if (oDeltaGroup.payload
            && Array.isArray(oDeltaGroup.payload[sItemOrder])
            && (oDeltaGroup.payload[sItemOrder].length > 0)
        ) {
            if (oOriginalGroup.payload
                && Array.isArray(oOriginalGroup.payload[sItemType])
                && (oOriginalGroup.payload[sItemType].length > 0)
            ) {
                bTempSuccess = this._setItemOrderOnSiteCollection(
                    oOriginalGroup.payload[sItemType],
                    oDeltaGroup.payload[sItemOrder]
                );
                if (!bTempSuccess) { bSuccess = false; }
            } else {
                bSuccess = false; // An order was recorded, but there are no data we can sort.
            }
        } // else: No order changes recorded, so no error

        return bSuccess;
    };

    /**
     * Sets order of items (e.g. tiles, links) in original site object as recorded in personalization delta.
     *
     * @param {object} oOriginalSite
     *   Site without personalization. Have to be a valid CDM site object.
     * @param {object} oPersonalizationDelta
     *   Personalization Delta. May be prefilled with some data or being an empty object. Must NOT be undefined.
     *
     * @returns {boolean}
     *   Returns TRUE if successfully and FALSE in case of at least on error.
     *
     * @private
     */
    PersonalizationProcessor.prototype._setItemOrderOnSite = function (oOriginalSite, oPersonalizationDelta) {
        var bSuccess = true,
            bTempSuccess,
            that = this;

        if (oOriginalSite.groups && oPersonalizationDelta.groups) {
            Object.keys(oPersonalizationDelta.groups).forEach(function (sGroupId) {
                if (oPersonalizationDelta.groups[sGroupId] && oOriginalSite.groups[sGroupId]) {
                    bTempSuccess = that._setItemOrderOnSiteGroupForItemType(oOriginalSite.groups[sGroupId], oPersonalizationDelta.groups[sGroupId], "tiles");
                    if (!bTempSuccess) { bSuccess = false; }
                    bTempSuccess = that._setItemOrderOnSiteGroupForItemType(oOriginalSite.groups[sGroupId], oPersonalizationDelta.groups[sGroupId], "links");
                    if (!bTempSuccess) { bSuccess = false; }
                } // else: No order changes recorded.
            });
        }

        return bSuccess;
    };

    /**
     * Applies all changes recorded in "moveITEMS" (e.g. "movedTiles" and "movedLinks") to original site.
     *
     * This method does NOT handle ITEMOrder related stuff - that will be done in "_setItemOrderOnSite".
     * That's true even for adding items or moving items across groups:
     * This method adds such "new" items to end of items array.
     *
     * @param oOriginalSite
     *   Site without personalization. Have to be a valid CDM site object.
     * @param oPersonalizationDelta
     *   Personalization Delta. May be prefilled with some data or being an empty object. Must NOT be undefined.
     *
     * @returns {boolean}
     *   Returns TRUE if successfully and FALSE in case of at least on error.
     *
     * @private
     * @see _setItemOrderOnSite
     */
    PersonalizationProcessor.prototype._applyMoveItemsWithoutOrder = function (oOriginalSite, oPersonalizationDelta, sItemType) {
        var bSuccess = true,
            bTempSuccess,
            sTypeKey,
            sItemOrder = "tileOrder",
            oDeltaItem,
            iItemIndex,
            oTempItem,
            aOriginalItems = [],
            that = this;

        // Private inner function: Adds given item (tile or link) at end of corresponding array of specified group.
        // Note: Ordering will be done later in another method.
        // Uses outer variables "oPersonalizationDelta", "oOriginalSite", "sItemType" and "sItemOrder".
        // Returns TRUE if successfully and FALSE in case of at least on error.
        function fInsertItem (oCDMSiteItem, sGroupId) {
            var bSuccess = true;
            if (oOriginalSite.groups[sGroupId]
                && oOriginalSite.groups[sGroupId].payload
                && oPersonalizationDelta.groups
                && oPersonalizationDelta.groups[sGroupId]
                && oPersonalizationDelta.groups[sGroupId].payload
                && Array.isArray(oPersonalizationDelta.groups[sGroupId].payload[sItemOrder])
                && (oPersonalizationDelta.groups[sGroupId].payload[sItemOrder].length > 0)
            ) {
                if (!Array.isArray(oOriginalSite.groups[sGroupId].payload[sItemType])) {
                    oOriginalSite.groups[sGroupId].payload[sItemType] = [];
                }
                oOriginalSite.groups[sGroupId].payload[sItemType].push(oCDMSiteItem);
            } else {
                bSuccess = false; // Invalid input data
            }
            return bSuccess;
        } // End of inner function "fInsertItem".

        if ((sItemType === "tiles") || (sItemType === "links")) {
            sTypeKey = (sItemType === "tiles") ? "movedTiles" : "movedLinks";
            sItemOrder = (sItemType === "tiles") ? "tileOrder" : "linkOrder";
        } else {
            // This is in fact really a programming error. But for simplicity, report as normal input data error:
            return false;
        }

        if (!oOriginalSite
            || !oOriginalSite.groups
            || !oOriginalSite.site
            || !oOriginalSite.site.payload
            || !Array.isArray(oOriginalSite.site.payload.groupsOrder)
            || !oPersonalizationDelta
        ) {
            // Invalid input data:
            return false;
        }

        if (oPersonalizationDelta[sTypeKey]) {
            Object.keys(oPersonalizationDelta[sTypeKey]).forEach(function (sItemId) {
                oDeltaItem = oPersonalizationDelta[sTypeKey][sItemId];
                if (oDeltaItem.fromGroup) {
                    if (oDeltaItem.toGroup) {
                        // Both are set ==> moved item.
                        if (oDeltaItem.fromGroup !== oDeltaItem.toGroup) {
                            // Moved across groups.
                            // Note: Ignoring itemOrder (tileOrder || linkOrder) here, because that will be applied in an extra step later.
                            if (oOriginalSite.groups[oDeltaItem.fromGroup]
                                && oOriginalSite.groups[oDeltaItem.fromGroup].payload
                                && Array.isArray(oOriginalSite.groups[oDeltaItem.fromGroup].payload[sItemType])
                            ) {
                                aOriginalItems = oOriginalSite.groups[oDeltaItem.fromGroup].payload[sItemType];
                                iItemIndex = that._getItemIndex(aOriginalItems, sItemId);
                                if (iItemIndex >= 0) {
                                    oTempItem = aOriginalItems.splice(iItemIndex, 1); // Remove array entry; Note: Returns array, not object!
                                    bTempSuccess = fInsertItem(oTempItem[0], oDeltaItem.toGroup);
                                    if (!bTempSuccess) { bSuccess = false; }
                                } else {
                                    bSuccess = false; // Error: Moved item not found in original item array.
                                }
                            } else {
                                bSuccess = false; // Error: No item array at all.
                            }
                        } else {
                            // Moved inside of one group ==> error + ignore (case should not be saved here):
                            bSuccess = false;
                        }
                    } else if (oOriginalSite.groups[oDeltaItem.fromGroup]
                        && oOriginalSite.groups[oDeltaItem.fromGroup].payload
                        && Array.isArray(oOriginalSite.groups[oDeltaItem.fromGroup].payload[sItemType])
                    ) { // Surely a removed item. Unfortunately we don't have position of removed item, so we have to iterate
                        aOriginalItems = oOriginalSite.groups[oDeltaItem.fromGroup].payload[sItemType];
                        iItemIndex = that._getItemIndex(aOriginalItems, sItemId);
                        if (iItemIndex >= 0) {
                            aOriginalItems.splice(iItemIndex, 1); // Remove array entry.
                        } else {
                            bSuccess = false; // Error: Removed item not found in original item array.
                        }
                    } else {
                        bSuccess = false; // Error: No item array at all.
                    }
                } else if (oDeltaItem.toGroup) {
                    if (oDeltaItem.item && !isEmptyObject(oDeltaItem.item)) {
                        // Surely an added item (because no "fromGroup" set).
                        // Note: Group operations have to be done BEFORE applying item changes,
                        // and in case of adding item(s) to a group the personalization delta have to
                        // contain at least one entry in groups[oDeltaItem.toGroup].payload[sItemOrder], too:
                        bTempSuccess = fInsertItem(oDeltaItem.item, oDeltaItem.toGroup);
                        if (!bTempSuccess) { bSuccess = false; }
                    } else {
                        // Error. Ignore added items which are entirely empty:
                        bSuccess = false;
                    }
                } else {
                    // Both NULL ==> error ==> Skip it:
                    bSuccess = false;
                }
            });
        } // else: No recorded changes here, but that's not an error.

        return bSuccess;
    };

    /**
     * Applies changes saved for items such as tiles and links to original site (while personalizing it so).
     *
     * Note 1: BEFORE calling this method: Be sure, group handling code did run already!
     * Note 2: This method does handle ALL item related changes like add, remove, move and changes.
     *
     * @param {object} oOriginalSite
     *   Site without personalization. Have to be a valid CDM site object.
     * @param {object} oPersonalizationDelta
     *   Personalization Delta. May be prefilled with some data or being an empty object. Must NOT be undefined.
     *
     * @returns {boolean}
     *   TRUE if applying changes was successful.
     *   FALSE in case of at least one error done to invalid input data.
     *
     * @private
     */
    PersonalizationProcessor.prototype._applyItemChanges = function (oOriginalSite, oPersonalizationDelta) {
        var bSuccess = true, // Input data probably valid; We will set it to FALSE again later in case of an error...
            bSuccessInner;

        bSuccessInner = this._applyMoveItemsWithoutOrder(oOriginalSite, oPersonalizationDelta, "tiles");
        if (!bSuccessInner) { bSuccess = false; }
        bSuccessInner = this._applyMoveItemsWithoutOrder(oOriginalSite, oPersonalizationDelta, "links");
        if (!bSuccessInner) { bSuccess = false; }

        if (oPersonalizationDelta.groups) {
            // Apply ITEMOrder arrays (if any) to original site structure:
            bSuccessInner = this._setItemOrderOnSite(oOriginalSite, oPersonalizationDelta);
            if (!bSuccessInner) { bSuccess = false; }

            // TODO: Apply direct item changes... ==> extra method.
            //      (To make this method faster, store index into ITEMS arrays in delta.)
        } // else: No changes recorded.

        return bSuccess;
    };

    return PersonalizationProcessor;
});
