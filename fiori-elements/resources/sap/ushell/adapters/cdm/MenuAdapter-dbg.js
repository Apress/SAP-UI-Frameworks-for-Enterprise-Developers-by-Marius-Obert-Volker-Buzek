// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview MenuAdapter for the CDM platform.
 */
sap.ui.define([
    "sap/ushell/library",
    "sap/ushell/Config"
], function (
    ushellLibrary,
    Config
) {
    "use strict";

    // shortcut for sap.ushell.ContentNodeType
    var ContentNodeType = ushellLibrary.ContentNodeType;

    /**
     * @typedef {object} MenuEntry A Menu Entry
     * @property {string} text The text of the menu entry
     * @property {string} intent The intent of the menu entry
     */

    /**
     * Constructs a new instance of the MenuAdapter for the CDM platform
     *
     * @constructor
     * @since 1.72.0
     * @private
     */
    var MenuAdapter = function () { };

    /**
     * Returns whether the menu is enabled
     *
     * @returns {Promise<boolean>} True if the menu is enabled
     * @since 1.72.0
     * @private
     */
    MenuAdapter.prototype.isMenuEnabled = function () {
        if (!Config.last("/core/menu/enabled")) {
            return Promise.resolve(false);
        }

        return sap.ushell.Container.getServiceAsync("CommonDataModel").then(function (oCdmService) {
            return oCdmService.getMenuEntries("main").then(function (aMenuEntries) {
                return aMenuEntries.length > 0;
            });
        });
    };

    /**
     * Gets the menu entries for the pages assigned to the user
     *
     * @returns {Promise<MenuEntry[]>} The menu entries
     * @since 1.72.0
     * @private
     */
    MenuAdapter.prototype.getMenuEntries = function () {
        return sap.ushell.Container.getServiceAsync("CommonDataModel").then(function (oCdmService) {
            return oCdmService.getMenuEntries("main");
        });
    };

    /**
     * Gets the content nodes of the ushell.
     *
     * These are structural elements of the Fiori launchpad that can display
     * a tile directly or as a superordinate element. Currently, this can be
     * a space or page in spaces mode.
     *
     * A content node, that is exposed in the UI may be selected by the user,
     * i.e., to describe where to pin a bookmark or tile in the launchpad.
     *
     * Remarks about the implementation:
     * - The content nodes are computed from the menu entries supplied by
     *   the menu adapter, which in turn are retrieved from the common data model
     *   service. The order is kept.
     * - During processing the menu entries get normalized and filtered.
     * - Find detailed remarks in the documentation of the functions
     *   <code>_buildContentNode</code> and <code>_normalizeMenuEntries</code>.
     *
     * @returns {Promise<ContentNode[]>} The content nodes of the Fiori launchpad
     * @since 1.105.0
     * @private
     */
    MenuAdapter.prototype.getContentNodes = function () {
        // Build content nodes from normalized menu entries
        return this.getMenuEntries()
            .then(this._normalizeMenuEntries.bind(this))
            .then(this._buildContentNodes.bind(this));
    };

    /**
     * Normalizes menu entries.
     *
     * Adds page as a submenu entry to space entry if omitted.
     *
     * Remarks about the implementation:
     * - Fetches page's title from common data model service if needed.
     *
     * @param {MenuEntry[]} aMenuEntries An array of menu entries
     * @returns {Promise<MenuEntry[]>} An array of normalized menu entries
     * @since 1.105.0
     * @private
     */
    MenuAdapter.prototype._normalizeMenuEntries = function (aMenuEntries) {
        var aGetPageTitlePromises = []; // promises array resolving missing page titles

        return sap.ushell.Container.getServiceAsync("CommonDataModel")
            .then(function (oCdmService) {
                aMenuEntries.forEach(function (oMenuEntry) {
                    // Add menuEntries attribute if missing
                    if (this._isSpaceOrPage(oMenuEntry) && oMenuEntry.menuEntries === undefined) {
                        var oPageIdParameter = oMenuEntry.target.parameters.find(function (oParameter) {
                            return (oParameter.name === "pageId");
                        });
                        var sPageId = oPageIdParameter && oPageIdParameter.value;

                        oMenuEntry.menuEntries = [
                            {
                                //id: a menu item ID is not needed for this use case
                                title: sPageId,
                                type: "IBN",
                                target: oMenuEntry.target
                            }
                        ];

                        // Fetch missing page title asynchronously
                        aGetPageTitlePromises.push(oCdmService.getPage(sPageId)
                            .then(function (oPage) {
                                oMenuEntry.menuEntries[0].title = oPage.identification.title;
                            }));
                    }
                }.bind(this));

                return Promise.allSettled(aGetPageTitlePromises);
            }.bind(this))
            .then(function () {
                return aMenuEntries;
            });
    };

    /**
     * Build content nodes from normalized menu entries
     *
     * Remarks about the implementation:
     * - Covers 1st and 2nd level menu entries only.
     * - Ignores work pages or groups of the classic home page.
     * - Doesn't add a node for the home page by itself.
     * - Considers menu entries of type intent based navigation (IBN) only.
     * - Description, help-id and icon of a menu item are not exposed by the corresponding content node.
     * - Spaces without a page are not hidden.
     * - A page that is the only one of a space is not hidden.
     * - The page / space relationship in the content nodes will be added derived directly from the menu structure.
     *   Pages which belong to a different space than the top level menu entry indicates will therefore be part
     *   of this space instead of their space set by the spaceId parameter.
     *
     * @param {MenuEntry[]} aMenuEntries An array of normalized menu entries
     * @returns {ContentNode[]} An array of content nodes
     * @since 1.105.0
     * @private
     */
    MenuAdapter.prototype._buildContentNodes = function (aMenuEntries) {
        return aMenuEntries
            .filter(this._isSpaceOrPage)
            .map(function (oMenuEntry) {
                var sSpaceId = oMenuEntry.target.parameters.find(function (oParameter) {
                    return (oParameter.name === "spaceId");
                }).value;

                // Create content node for space (space node)
                var oSpaceNode = {
                    id: sSpaceId,
                    label: oMenuEntry.title,
                    type: ContentNodeType.Space,
                    isContainer: false
                };

                // Attach pages to space node's children

                // Take 2nd level menu entries of type intent based navigation (IBN)
                // with semanticObject/action = Launchpad/openFLPPage only
                oSpaceNode.children = oMenuEntry.menuEntries
                    .filter(this._isSpaceOrPage)
                    .map(function (oPageMenuEntry) {
                        var oPageIdParameter = oPageMenuEntry.target.parameters.find(function (oParameter) {
                            return oParameter.name === "pageId";
                        });
                        var sPageId = oPageIdParameter && oPageIdParameter.value;
                        if (!sPageId) {
                            return null;
                        }

                        return {
                            id: sPageId,
                            label: oPageMenuEntry.title,
                            type: ContentNodeType.Page,
                            isContainer: true,
                            children: []
                        };
                    })
                    .filter(function (oNode) {
                        return !!oNode;
                    });

                return oSpaceNode;
            }.bind(this));
    };

    /**
     * Checks if a menu entry represents a space or a page
     *
     * @param {MenuEntry} oMenuEntry A menu entry
     * @returns {boolean} returns if it is a space or page menu entry
     * @since 1.105.0
     * @private
     */
    MenuAdapter.prototype._isSpaceOrPage = function (oMenuEntry) {
        return (
            oMenuEntry.type === "IBN" &&
            oMenuEntry.target &&
            oMenuEntry.target.semanticObject === "Launchpad" &&
            oMenuEntry.target.action === "openFLPPage" &&
            Array.isArray(oMenuEntry.target.parameters)
        );
    };

    return MenuAdapter;
});
