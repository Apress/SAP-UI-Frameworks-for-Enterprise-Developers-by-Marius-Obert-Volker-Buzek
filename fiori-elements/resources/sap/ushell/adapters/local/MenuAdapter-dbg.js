// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview MenuAdapter for the local platform.
 */

sap.ui.define([
    "sap/base/Log",
    "sap/base/util/ObjectPath",
    "sap/ui/core/Configuration",
    "sap/ushell/library"
], function (
    Log,
    ObjectPath,
    Configuration,
    ushellLibrary
) {
    "use strict";

    // shortcut for sap.ushell.ContentNodeType
    var ContentNodeType = ushellLibrary.ContentNodeType;

    /**
     * Constructs a new instance of the MenuAdapter for the local platform.
     *
     * @constructor
     * @since 1.72.0
     * @param {object} system The system information. In a local environment this is not used
     * @param {string} parameter The Adapter parameter
     * @param {object} adapterConfiguration The Adapter configuration
     * @param {boolean} adapterConfiguration.enabled Determines if the menu should be enabled
     * @param {(string|object)} adapterConfiguration.menuData
     *   If a JSON path is provided as a string the MenuAdapter tries to load and parse the respective JSON.
     *   If an object is provided the adapter uses the data of the specified object.
     * @private
     */
    var MenuAdapter = function (system, parameter, adapterConfiguration) {
        this._oAdapterConfig = ObjectPath.get("config", adapterConfiguration);
    };

    MenuAdapter.prototype.isMenuEnabled = function () {
        return Promise.resolve(!!this._oAdapterConfig.enabled);
    };

    /**
     * Resolves the content nodes defined in the adapter config
     *
     * @returns {Promise<object[]>} Resolves the content nodes
     * @since 1.105.0
     * @private
     */
    MenuAdapter.prototype.getContentNodes = function () {
        var vMenuData = this._oAdapterConfig.menuData;

        if (!vMenuData) {
            Log.error("No menuData specified in the adapter configuration.", null, "sap.ushell.adapters.local.MenuAdapter");
            return Promise.reject(new Error("No menuData specified in the adapter configuration."));
        }

        if (typeof vMenuData === "object") {
            return Promise.resolve(vMenuData);
        }

        return fetch(vMenuData,
            {
                headers: {
                    Accept: "application/json",
                    "Accept-Language": Configuration.getLanguageTag()
                }
            }
        )
            .then(function (oResponse) {
                return oResponse.json();
            })
            .catch(function (oError) {
                Log.error("Menu entries were requested but could not be loaded from JSON file", oError);
                return Promise.reject(new Error("Menu entries could not be fetched"));
            });
    };

    /**
     * Resolves the menu entries based on the content nodes
     * Remarks:
     * - The menu entries have to be spaces and pages
     *
     * @returns {Promise<object[]>} Resolves the menu entries
     * @private
     */
    MenuAdapter.prototype.getMenuEntries = function () {
        return this.getContentNodes().then(function (aContentNodes) {
            return aContentNodes.map(function (oSpaceNode) {
                var oFirstPage = oSpaceNode.children[0];
                var oTopLevelEntry = this._buildMenuEntry(oSpaceNode, oSpaceNode.id, oFirstPage.id);

                if (oSpaceNode.children.length > 1) {
                    oTopLevelEntry.menuEntries = oSpaceNode.children.map(function (oPageNode) {
                        return this._buildMenuEntry(oPageNode, oSpaceNode.id, oPageNode.id);
                    }.bind(this));
                }

                return oTopLevelEntry;
            }.bind(this));
        }.bind(this));
    };

    /**
     * Builds a menu entry based on a content node
     *
     * @param {object} oContentNode The content node containing the details for the menu entry
     * @param {string} sSpaceId The SpaceId of the menu entry
     * @param {string} sPageId The PageId of the menu entry
     * @returns {object} menu entry
     * @private
     * @since 1.105.0
     */
    MenuAdapter.prototype._buildMenuEntry = function (oContentNode, sSpaceId, sPageId) {
        var sHelpIdPrefix = oContentNode.type === ContentNodeType.Space ? "Space-" : "Page-";
        return {
            "help-id": sHelpIdPrefix + oContentNode.id,
            title: oContentNode.label,
            type: "IBN",
            target: {
                semanticObject: "Launchpad",
                action: "openFLPPage",
                parameters: [
                    { name: "spaceId", value: sSpaceId },
                    { name: "pageId", value: sPageId }
                ]
            },
            menuEntries: []
        };
    };

    return MenuAdapter;
});
