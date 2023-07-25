// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview MenuAdapter for the CEP platform
 *
 * Provides the API functions:
 * - MenuAdapter.prototype.isMenuEnabled
 * - MenuAdapter.prototype.getMenuEntries
 * - MenuAdapter.prototype.getContentNodes
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Configuration",
    "sap/ushell/Config",
    "sap/ushell/library",
    "sap/ushell/utils/HttpClient"
], function (
    Log,
    Configuration,
    Config,
    ushellLibrary,
    HttpClient
) {
    "use strict";

    // shortcut for sap.ushell.ContentNodeType
    var oContentNodeTypes = ushellLibrary.ContentNodeType;

    var sCEPMenuAdapterComponent = "sap.ushell.adapters.cep.MenuAdapter";

    /**
     * Constructs a new instance of the CEP Menu Adapter.
     *
     * @param {object} oUnused Parameter is not used.
     * @param {string} sUnused Parameter is not used.
     * @param {object} oAdapterConfiguration The adapter specific configuration
     * @param {string} oAdapterConfiguration.serviceUrl The url to the CEP content API, that is a GraphQL service
     * @param {boolean} oAdapterConfiguration.siteId The relevant site-id
     * @class
     * @constructor
     * @see {@link sap.ushell.adapters.cep.MenuAdapter}
     * @since 1.106.0
     */
    var MenuAdapter = function (oUnused, sUnused, oAdapterConfiguration) {
        if (oAdapterConfiguration
            && oAdapterConfiguration.config
            && oAdapterConfiguration.config.serviceUrl
            && oAdapterConfiguration.config.siteId
        ) {
            this.httpClient = new HttpClient();
            this.serviceUrl = oAdapterConfiguration.config.serviceUrl;
            this.siteId = oAdapterConfiguration.config.siteId;
            this.oSiteDataPromise = this._doRequest(this.serviceUrl, this.siteId);
        } else {
            Log.error("Invalid configuration provided.", "", sCEPMenuAdapterComponent);
        }
    };

    /**
     * Returns whether the menu is enabled.
     * The menu is enabled if there's at least one menu entry.
     *
     * @returns {Promise<boolean>} True if the menu is enabled.
     * @since 1.106.0
     * @private
     */
    MenuAdapter.prototype.isMenuEnabled = function () {
        if (!Config.last("/core/menu/enabled")) {
            return Promise.resolve(false);
        }

        return this.getMenuEntries().then(function (aMenuEntries) {
            return aMenuEntries.length > 0;
        });
    };

    /**
     * Returns a promise that resolves with the menu entries for the pages.
     *
     * @returns {Promise<MenuEntry[]>} Resolves with the menu entries, @see sap.ushell.services.menu#MenuEntry.
     * @since 1.106.0
     * @private
     */
    MenuAdapter.prototype.getMenuEntries = function () {
        return this.oSiteDataPromise
            .then(this._getSpaces.bind(this))
            .then(this._buildMenuEntries.bind(this));
    };

    /**
     * Gets the content nodes for the spaces.
     *
     * @returns {Promise<ContentNode[]>} The content nodes, @see sap.ushell.services.menu#ContentNode
     * @since 1.106.0
     * @private
     */
    MenuAdapter.prototype.getContentNodes = function () {
        return this.oSiteDataPromise
            .then(this._getSpaces.bind(this))
            .then(this._buildContentNodes.bind(this));
    };

    /**
     * Builds a menu which is accepted by the menu service.
     *
     * @param {array} aSpaces The spaces and pages of the menu
     * @returns {MenuEntry[]} The menu structure required by the menu service, @see sap.ushell.services.menu#MenuEntry
     * @since 1.106.0
     * @private
     */
    MenuAdapter.prototype._buildMenuEntries = function (aSpaces) {
        // Create a 1st level menu entry for each space
        // having 2nd level sub menu entries for its pages inside if needed.

        return aSpaces
            .filter(this._isSpaceNotEmpty.bind(null, "FLP menu"))
            .map(function (oSpace) {
                var oTopMenuEntry = {
                    title: oSpace.Descriptor.title || oSpace.Id,
                    "help-id": "Space-" + oSpace.Id,
                    description: oSpace.Descriptor.description || "",
                    icon: undefined,
                    type: "IBN",
                    target: {
                        semanticObject: "Launchpad",
                        action: "openFLPPage",
                        parameters: [
                            {
                                name: "spaceId",
                                value: oSpace.Id
                            },
                            {
                                name: "pageId",
                                value: oSpace.WorkPages.nodes[0].Id
                            }
                        ],
                        innerAppRoute: undefined
                    },
                    menuEntries: []
                };

                var aSubMenuEntries = oSpace.WorkPages.nodes.map(function (oPage) {
                    return {
                        title: oPage.Descriptor.title || oPage.Id,
                        "help-id": "Page-" + oPage.Id,
                        description: oPage.Descriptor.description || "",
                        icon: undefined,
                        type: "IBN",
                        target: {
                            semanticObject: "Launchpad",
                            action: "openFLPPage",
                            parameters: [
                                {
                                    name: "spaceId",
                                    value: oSpace.Id
                                },
                                {
                                    name: "pageId",
                                    value: oPage.Id
                                }
                            ],
                            innerAppRoute: undefined
                        },
                        menuEntries: []
                    };
                });

                if (aSubMenuEntries.length > 1) {
                    oTopMenuEntry.menuEntries = aSubMenuEntries;
                }

                return oTopMenuEntry;
            });
    };

    /**
     * Builds content nodes based on the spaces. The property "isContainer" is set to false for Workpages (which have no pageType)
     *
     * @param {array} aSpaces The spaces and pages of the menu
     * @returns {ContentNode[]} The content nodes required by the menu service, @see sap.ushell.services.menu#ContentNode
     * @private
     * @since 1.106.0
     */
    MenuAdapter.prototype._buildContentNodes = function (aSpaces) {
        return aSpaces
            .filter(this._isSpaceNotEmpty.bind(null, "content nodes"))
            .map(function (oSpace) {
                return {
                    id: oSpace.Id,
                    label: oSpace.Descriptor.title || oSpace.Id,
                    type: oContentNodeTypes.Space,
                    isContainer: false,
                    children: oSpace.WorkPages.nodes.map(function (oPage) {
                        return {
                            id: oPage.Id,
                            label: oPage.Descriptor.title || oPage.Id,
                            type: oContentNodeTypes.Page,
                            isContainer: this._isTraditionalPage(oPage.Descriptor),
                            children: []
                        };
                    }.bind(this))
                };
            }.bind(this));
    };

    /**
     * Resolves to true if the page with the given sPageId is a WorkPage.
     * This is the case if the pageType property in the page Descriptor is not "page".
     *
     * @param {string} sPageId The pageId to check.
     * @returns {Promise<boolean>} A promise resolving to true if the pageId is a WorkPage or false if not.
     * @private
     * @since 1.107.0
     */
    MenuAdapter.prototype.isWorkPage = function (sPageId) {
        return this.oSiteDataPromise
            .then(this._getSpaces.bind(this))
            .then(function (aSpaces) {
                var oFoundPage = aSpaces
                    .flatMap(function (oSpace) {
                        return (oSpace.WorkPages && oSpace.WorkPages.nodes) || [];
                    })
                    .find(function (oPage) {
                        return oPage.Id === sPageId;
                    });

                if (oFoundPage) {
                    return !this._isTraditionalPage(oFoundPage.Descriptor);
                }

                return false;
            }.bind(this));
    };

    /**
     * Returns whether a page is a traditional page based on the pageType property.
     * The pageType is "Page" for traditional pages and missing for work pages
     *
     * @param {object} oPageDescriptor The page's descriptor data
     * @returns {boolean} Whether the page is a traditional page
     * @private
     * @since 1.106.0
     */
    MenuAdapter.prototype._isTraditionalPage = function (oPageDescriptor) {
        if (oPageDescriptor.pageType && oPageDescriptor.pageType.toLowerCase() === oContentNodeTypes.Page.toLowerCase()) {
            return true;
        }
        return false;
    };

    /**
     * Returns a Promise that sends the request to the GraphQL service to fetch site data.
     *
     * Example response:
     * <pre>
     * {
     *   "data": {
     *     "Spaces": {
     *       "nodes": [
     *         {
     *           "Id": "6a559319-8878-40a9-b8b7-22dd81f12121",
     *           "Descriptor": {
     *             "title": "MySpaceTitle"
     *           },
     *           "WorkPages": {
     *             "nodes": [
     *               {
     *                 "Id": "6a559319-8878-40a9-b8b7-22dd81f3c208",
     *                 "Descriptor": {
     *                   "title": "MyPageTitle",
     *                   "pageType": "page",
     *                   "description": "MyPageDescription"
     *                 }
     *               }
     *             ]
     *           }
     *         }
     *       ]
     *     }
     *   }
     * }
     * </pre>
     *
     * @param {string} sServiceUrl The GraphQL service URL that represents the CEP content API
     * @param {string} sSiteId The relevant site-id
     * @returns {Promise<object>} Resolves with the response from the GraphQL service exposing site data.
     * @since 1.106.0
     * @private
     */
    MenuAdapter.prototype._doRequest = function (sServiceUrl, sSiteId) {
        var sQuery = "{" +
            "Spaces(" +
                "SiteId:\"" + sSiteId + "\"" +
            "){" +
                "nodes{" +
                    "Id," +
                    "Descriptor(select:[\"/title\"])," +
                        "WorkPages{" +
                            "nodes{" +
                                "Id," +
                                "Descriptor(select:[\"/title\",\"/pageType\",\"/description\"])" +
                            "}" +
                        "}" +
                    "}" +
                "}" +
            "}";

        return this.httpClient.get(sServiceUrl + "?query=" + sQuery, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Language": Configuration.getLanguageTag()
            }
        }).then(function (oResponse) {
            if (oResponse.status < 200 || oResponse.status >= 300) {
                Log.error(oResponse.responseText, "", sCEPMenuAdapterComponent);
                return Promise.reject("HTTP request to GraphQL service failed with status: " + oResponse.status + " - " + oResponse.statusText);
            }
            return JSON.parse(oResponse.responseText || "{}");
        }).then(function (oData) {
            // Temporary workaround for QESAPSHELL-108
            try {
                oData.data.Spaces.nodes = oData.data.Spaces.nodes.filter(function (node) {
                    return node.Id !== "default_space";
                });
            } catch (e) {
                // No error handling required
            }
            return oData;
        });
    };

    /**
     * Retrieves the spaces from the GraphQL responded JSON object.
     *
     * @param {object} oSiteData The GraphQL response as JSON object
     * @returns {array} All spaces as an array
     * @since 1.106.0
     * @private
     */
    MenuAdapter.prototype._getSpaces = function (oSiteData) {
        if (oSiteData.data
            && oSiteData.data.Spaces
            && Array.isArray(oSiteData.data.Spaces.nodes)
        ) {
            return oSiteData.data.Spaces.nodes;
        }

        Log.warning("No spaces found for site-id: " + this.siteId, "", sCEPMenuAdapterComponent);
        return [];
    };

    /**
     * Filter function that checks if a space is empty to filter it out.
     * If the space is empty, a warning message is logged.
     *
     * @param {string} sEntityName Name of the entity where the space is filtered out for the warning message
     * @param {object} oSpace The space to be filtered
     * @returns {boolean} true = keep, false = remove
     * @private
     * @since 1.106.0
     */
    MenuAdapter.prototype._isSpaceNotEmpty = function (sEntityName, oSpace) {
        if (!oSpace.WorkPages || !oSpace.WorkPages.nodes || oSpace.WorkPages.nodes.length === 0) {
            Log.warning("FLP space " + oSpace.Id + " without page omitted in " + sEntityName + ".", "", sCEPMenuAdapterComponent);
            return false;
        }
        return true;
    };

    return MenuAdapter;
});
