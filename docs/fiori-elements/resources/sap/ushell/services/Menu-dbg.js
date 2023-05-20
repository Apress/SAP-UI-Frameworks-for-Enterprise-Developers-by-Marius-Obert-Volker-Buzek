// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The menu service provides the entries for the menu bar
 * @version 1.113.0
 */
sap.ui.define([
    "sap/ushell/Config",
    "sap/ushell/library",
    "sap/ushell/utils",
    "sap/ui/model/json/JSONModel",
    "sap/base/util/deepClone",
    "sap/base/Log",
    "sap/ushell/resources"
], function (
    Config,
    ushellLibrary,
    ushellUtils,
    JSONModel,
    deepClone,
    Log,
    resources
) {
    "use strict";

    // shortcut for sap.ushell.ContentNodeType
    var ContentNodeType = ushellLibrary.ContentNodeType;

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getServiceAsync("Menu").then(function (Menu) {});</code>.
     * Constructs a new instance of the menu service.
     *
     * @namespace sap.ushell.services.Menu
     * @constructor
     * @see sap.ushell.services.Container#getServiceAsync
     * @since 1.71.0
     * @private
     */
    function Menu () {
        this._init.apply(this, arguments);
    }

    /**
     * Private initializer.
     *
     * @param {object} adapter The menu adapter for the frontend server.
     *
     * @since 1.72.0
     * @private
     */
    Menu.prototype._init = function (adapter) {
        this.oAdapter = adapter;
        this.oModel = new JSONModel();
        this.oModel.setSizeLimit(1000); // At least one customer works with a composite role with more than 200 pages.
        this._aBlockedList = [];
    };

    /**
     * Returns whether the menu is enabled.
     *
     * @returns {Promise<boolean>} True if menu is enabled
     *
     *
     * @since 1.71.0
     * @private
     */
    Menu.prototype.isMenuEnabled = function () {
        return this.oAdapter.isMenuEnabled();
    };

    /**
     * @typedef {object} MenuEntry A Menu Entry
     * @property {string} title The text of the menu entry
     * @property {string} description The description of a the menu entry
     * @property {string} type
     *    The type of a the menu entry. May be, for example "IBN" (trigger an intent based navigation when clicked)
     *    or "text" (May be used to display a sub menu).
     * @property {string} target Describes the navigation target if type is "IBN"
     * @property {MenuEntry[]} menuEntries Contains a list of sub menu entries
     */

    /**
     * Gets the menu entries for the current user.
     *
     * The menu offers access to the spaces and its pages the current user may access
     * via intent based navigation. Each menu entry has a unique ID.
     *
     * @returns {Promise<MenuEntry[]>} The menu entries
     *
     * @since 1.71.0
     * @private
     */
     Menu.prototype.getMenuEntries = function () {
        return this.oAdapter.getMenuEntries()
            .then(function (aMenuEntries) {
                if (Config.last("/core/homeApp/enabled")) {
                    var oHomeAppEntry = {
                        title: resources.i18n.getText("HomeApp.Menu.Title"),
                        "help-id": "homeApp-menuEntry",
                        description: "",
                        icon: undefined,
                        type: "IBN",
                        target: {
                            semanticObject: "Shell",
                            action: "home",
                            parameters: [],
                            innerAppRoute: undefined
                        },
                        menuEntries: []
                    };
                    aMenuEntries.splice(0, 0, oHomeAppEntry);
                }
                return aMenuEntries;
            })
            .then(function (aMenuEntries) {
                return aMenuEntries
                    .map(function (oMenuEntry) {

                        // Attach unique ID to all 1st and 2nd level entries
                        oMenuEntry.uid = ushellUtils.generateUniqueId([]);
                        if (oMenuEntry.menuEntries) {
                            oMenuEntry.menuEntries.forEach(function (oSubMenuEntry) {
                                oSubMenuEntry.uid = ushellUtils.generateUniqueId([]);
                            });
                        }

                        return oMenuEntry;
                    });
            });
    };

    /**
     * @typedef {object} SpacePagesHierarchyEntry
     *    An entry in the space-spages-hierarchy which briefly describes a space and its pages
     * @property {string} title Text of the space
     * @property {string} id ID of the space
     * @property {array} pages
     *    Contains an array of pages which contribute to the space
     */

    /**
     * Gets the hierarchy of spaces and subordinate pages a user may access via the menu.
     *
     * This function is used, for example, in the app finder to populate a dialog for page selection
     * when a user is about to pin an app on a page in a space.
     *
     * For performance reasons the promise response of <code>Menu.prototype.getSpacesPagesHierarchy</code>
     * is cached, similiar to <code>Menu.prototype.getMenuEntries</code>. As a consequence dynamic
     * menus and a dynamic changing of the spaces/pages structure, e.g. in a design time scenario,
     * is not supported.
     *
     * @returns {Promise<SpacePagesHierarchyEntry[]>}
     *    The space pages hierarchy entries indicate which pages belong to a space.
     *    In case there is a 1:1 relation between a space and a page, the title for the page is
     *    the space title. This is consistent with the menu.
     *
     * @since 1.75.0
     * @private
     * @deprecated since 1.104. Please use {@link #getContentNodes} instead.
     */
    Menu.prototype.getSpacesPagesHierarchy = function () {
        var oMenuEntriesPromise;
        if (this.oAdapter.getContentNodeEntries) {
            oMenuEntriesPromise = this.oAdapter.getContentNodeEntries();
        } else {
            oMenuEntriesPromise = this.getMenuEntries();
        }

        // Calculate hierarchy from the menu
        return oMenuEntriesPromise
            .then(function (aMenuEntries) {

                return {
                    spaces:
                        // Calculate an array of spaces, which contain a list of their pages each
                        aMenuEntries.reduce(function (aSpaces, oMenuEntry) {

                            // Get pages that can be accessed by the current menu entry
                            var aPages;
                            if (oMenuEntry.menuEntries && oMenuEntry.menuEntries.length) {
                                aPages = this._getAccessiblePages(oMenuEntry.menuEntries);
                            } else {
                                aPages = this._getAccessiblePages([oMenuEntry]);
                            }

                            // Calculate space and add it to spaces array
                            // ... but only if it has at least one page
                            if (aPages.length) {
                                aSpaces.push({
                                    title: oMenuEntry.title,
                                    id: aPages[0].spaceId,
                                    pages: aPages
                                        .map(function (oPage) {
                                            return {
                                                title: oPage.title,
                                                id: oPage.id
                                            };
                                        })
                                });
                            }

                            return aSpaces;

                        }.bind(this), [])
                };

            }.bind(this))
            .catch(function () {
                return { spaces: [] };
            });
    };

    /**
     * @typedef {object} ContentNode
     *  A content node may be:
     *   - a classic homepage group
     *   - an unselectable node (space) or a selectable node (page) in spaces mode
     *   - or any other containers in the future
     *
     * @property {string} id ID of the content node
     * @property {string} label Human-readable representation of a content node which can be displayed in a control
     * @property {sap.ushell.ContentNodeType} type Specifies the content node type. E.g: space, page, group, etc.
     * @property {boolean} isContainer Specifies if a content can be added
     * @property {ContentNode[]} [children] Specifies sub-nodes
     */

    /**
     * Fetches and returns the content nodes from the adapter. These content nodes are filtered based on the provided `aContentNodeTypes`.
     * In case a content node shall not be returned because of its type, this node and all of its children get removed from the result.
     * For `bKeepUnrequestedParents=true` parent nodes are returned even if they are not of the requested type.
     * @param {sap.ushell.ContentNodeType[]} [aContentNodeTypes] Types of content nodes to be returned. Defaults to all content node types defined in `sap.ushell.ContentNodeType`.
     * @param {boolean} [bKeepUnrequestedParents=false] Whether to keep each parent node that contains at least one child of the requested type.
     *
     * @returns {Promise<ContentNode[]>} Resolves content nodes
     *
     * @private
     * @since 1.104.0
     */
    Menu.prototype.getContentNodes = function (aContentNodeTypes, bKeepUnrequestedParents) {
        // no filter provided defaults to all ContentNodeTypes defined
        if (!aContentNodeTypes) {
            aContentNodeTypes = Object.values(ContentNodeType);
        }
        bKeepUnrequestedParents = !!bKeepUnrequestedParents;

        return this.oAdapter.getContentNodes()
            .then(function (aContentNodes) {
                aContentNodes = deepClone(aContentNodes);
                var aFilteredContentNodes = this._filterContentNodes(aContentNodes, aContentNodeTypes, bKeepUnrequestedParents);
                return aFilteredContentNodes;
            }.bind(this));
    };

    /**
     * Filters the content nodes by type. In case a content node shall not be returned because of its type this node and all of its children get removed from the result.
     * For `bKeepUnrequestedParents=true` parent nodes are returned even if they are not of the requested type.
     * @param {ContentNode[]} aContentNodes All content nodes available
     * @param {sap.ushell.ContentNodeType[]} aTypes Types of content nodes to be returned.
     * @param {boolean} bKeepUnrequestedParents Whether to keep each parent node that contains at least one child of the requested type.
     *
     * @returns {ContentNode[]} The filtered content nodes
     *
     * @private
     * @since 1.104.0
     */
    Menu.prototype._filterContentNodes = function (aContentNodes, aTypes, bKeepUnrequestedParents) {
        if (!Array.isArray(aContentNodes)) {
            return [];
        }

        return aContentNodes.reduce(function (aNodes, oContentNode) {
            oContentNode.children = this._filterContentNodes(oContentNode.children, aTypes, bKeepUnrequestedParents);

            var bIsSupportedType = aTypes.includes(oContentNode.type);
            if (bIsSupportedType || (bKeepUnrequestedParents && oContentNode.children.length)) {
                aNodes.push(oContentNode);
            }

            return aNodes;
        }.bind(this), []);
    };

    /**
     * Returns the first non-empty page and its space assigned to the user.
     * @see #getContentNodes
     * @returns {Promise<object>} Resolves to the first space.
     *
     * @since 1.105.0
     * @private
     */
    Menu.prototype.getDefaultSpace = function () {
        return this.getContentNodes([ContentNodeType.Space, ContentNodeType.Page]).then(function (aContentNodes) {
            var oNonEmptySpace = aContentNodes.find(function (oContentNode) {
                return oContentNode.children.length;
            });
            return oNonEmptySpace;
        });
    };

    /**
     * Returns MyHome space.
     *
     * @returns {Promise<object>} Resolves MyHome space. If MyHome feature is disabled, return null
     *
     * @since 1.90.0
     * @private
     */
    Menu.prototype.getMyHomeSpace = function () {
        if (!Config.last("/core/spaces/myHome/enabled")) {
            return Promise.resolve(null);
        }
        var sMySpaceId = Config.last("/core/spaces/myHome/myHomeSpaceId");
        return this.getContentNodes([ContentNodeType.Space, ContentNodeType.Page]).then(function (aContentNodes) {
            return aContentNodes.find(function (oContentNode) {
                return oContentNode.type === ContentNodeType.Space && oContentNode.id === sMySpaceId;
            }) || null;
        });
    };

    /**
     * Extracts the accessible pages from an array of menu entries
     * ignoring sub menu entries
     *
     * @param  {MenuEntry[]} aMenuEntries
     *    An array of menu entries
     * @returns {object[]}
     *    An array indicating pages which are accessible via 1st level menu entries in <code>aMenuEntries</code>
     *
     * @since 1.77.0
     * @private
     */
    Menu.prototype._getAccessiblePages = function (aMenuEntries) {

        return aMenuEntries
            .filter(function (oMenuEntry) {
                return oMenuEntry
                    && oMenuEntry.type === "IBN"
                    && oMenuEntry.target
                    && oMenuEntry.target.semanticObject === "Launchpad"
                    && oMenuEntry.target.action === "openFLPPage";
            })
            .map(function (oMenuEntry) {
                var oSpaceParam = oMenuEntry.target.parameters.find(function (oParam) {
                    return oParam.name === "spaceId";
                });
                var oPageParam = oMenuEntry.target.parameters.find(function (oParam) {
                    return oParam.name === "pageId";
                });
                return {
                    title: oMenuEntry.title,
                    id: oPageParam && oPageParam.value,
                    spaceId: oSpaceParam && oSpaceParam.value
                };
            });
    };

    /**
     * Searches the Content Nodes for the specified space and
     * checks if the space has multiple pages assigned to it.
     *
     * @param {string} spaceId ID of the space which should be checked
     * @returns {Promise<boolean>}
     *  A promise resolving with 'true' if the specified space has multiple pages
     *
     * @since 1.78.0
     * @private
     */
    Menu.prototype.hasMultiplePages = function (spaceId) {
        return this.getContentNodes([ContentNodeType.Space, ContentNodeType.Page])
            .then(function (aContentNodes) {
                var oSpace = aContentNodes.find(function (oContentNode) {
                    return oContentNode.type === ContentNodeType.Space && oContentNode.id === spaceId;
                });
                return oSpace && oSpace.children.length > 1;
            });
    };

    /**
     * Checks whether the combination of spaces and pages is assigned to the current user.
     * @param {string} spaceId The ID of the space
     * @param {string} pageId The ID of the page
     * @returns {Promise<boolean>} A promise resolving with 'true' if the specified space and page are assigned
     *
     * @since 1.93.0
     * @private
     */
    Menu.prototype.isSpacePageAssigned = function (spaceId, pageId) {
        return this.getContentNodes([ContentNodeType.Space, ContentNodeType.Page])
            .then(function (aContentNodes) {
                var oSpace = aContentNodes.find(function (oContentNode) {
                    return oContentNode.type === ContentNodeType.Space && oContentNode.id === spaceId;
                });

                if (!oSpace) {
                    return false;
                }

                var oPage = oSpace.children.find(function (oContentNode) {
                    return oContentNode.type === ContentNodeType.Page && oContentNode.id === pageId;
                });

                return !!oPage;
            });
    };

    /**
     * Returns titles for the specified space and page.
     *
     * @param {string} spaceId ID of the space
     * @param {string} pageId ID of the page in the space
     * @returns {Promise<object>}
     *  A promise resolving with a data object that contains the titles
     *
     * @since 1.92.0
     * @private
     */
    Menu.prototype.getSpaceAndPageTitles = function (spaceId, pageId) {
        return this.getContentNodes([ContentNodeType.Space, ContentNodeType.Page])
            .then(function (aContentNodes) {
                var oSpace,
                    oPage;
                oSpace = aContentNodes.find(function (oContentNode) {
                    return oContentNode.type === ContentNodeType.Space && oContentNode.id === spaceId;
                });
                if (oSpace) {
                    oPage = oSpace.children.find(function (oContentNode) {
                        return oContentNode.type === ContentNodeType.Page && oContentNode.id === pageId;
                    });
                }
                if (oPage) {
                    return {spaceTitle: oSpace.label, pageTitle: oPage.label};
                }
                return null;
            }
        );
    };

    /**
     * Returns the model attached to the MenuBar UI.
     *
     * @returns {Promise<sap.ui.model.json.JSONModel>} Resolves to the JSONModel attached to the UI.
     */
    Menu.prototype.getMenuModel = function () {
        return this.getMenuEntries().then(function (entries) {
            this.oModel.setData(entries);
            return this.oModel;
        }.bind(this));
    };

    /**
     * Resolves to true if the page with the given sPageId is a WorkPage.
     * This is the case if the pageType property in the page Descriptor is not "page".
     *
     * Note:
     * - Strictly private!
     * - To be removed when there is only one page runtime.
     *
     * @param {string} sPageId The pageId to check.
     * @returns {Promise<boolean>} A promise resolving to true if the pageId is a WorkPage or false if not.
     * @private
     * @since 1.107.0
     */
    Menu.prototype.isWorkPage = function (sPageId) {
        if (this.oAdapter.isWorkPage) {
            return this.oAdapter.isWorkPage(sPageId);
        }
        return Promise.resolve(false);
    };

    /**
     * Retrieves info about the given nodeId
     *
     * @param {string} nodeId The nodeId to search for.
     * @param {object[]} nodes The array of nodes and their children.
     * @param {boolean} [isChild] If the current node is a child node.
     * @param {string} [managerId] The managerId - to be called recursively.
     * @returns {object} The result object.
     * @private
     */
    Menu.prototype._getNodeInfo = function (nodeId, nodes, isChild, managerId) {
        var oNodeInfo;
        for (var i = 0; i < nodes.length; i++) {
            if (!isChild) { managerId = this._getManagerIdInNodeTree(nodeId, nodes[i]); }
            if (nodes[i].id === nodeId) {
                return {
                    node: nodes[i],
                    isRootNode: !isChild,
                    managerId: managerId || null
                };
            }

            if (nodes[i].menuEntries && nodes[i].menuEntries.length > 0) {
                oNodeInfo = this._getNodeInfo(nodeId, nodes[i].menuEntries, true, managerId);
                if (oNodeInfo.node) { return oNodeInfo; }
            }
        }
        return {
            node: null,
            isRootNode: false,
            managerId: null
        };
    };

    /**
     * Checks if the given nodeId exists and if the managerId is allowed to manage the given nodeId.
     *
     * @param {string} nodeId The node id to search for.
     * @param {object[]} rootNodes The nodes in the menu.
     * @param {string} managerId The managerId to check.
     * @returns {boolean} The result - True if the managerId of the node is null or equal to the given managerId.
     * @private
     */
    Menu.prototype._nodeManagementPermitted = function (nodeId, rootNodes, managerId) {
        var oNodeInfo = this._getNodeInfo(nodeId, rootNodes);
        if (!oNodeInfo.node) {
            Log.error("Node with id " + nodeId + " cannot be found and will be skipped.");
            return false;
        }
        if (!!oNodeInfo.managerId && oNodeInfo.managerId !== managerId) {
            Log.error("Node with id " + nodeId + " cannot be managed by '" + managerId + "'" +
                " because it is already managed by '" + oNodeInfo.managerId + "'.");
            return false;
        }
        return true;
    };

    /**
     * Returns the managerId for a given node if it exists on itself or on a parent.
     *
     * @param {string} nodeId The node id to search for.
     * @param {object} node The node to start the search.
     * @param {string} [managerId] The if of the entry manager.
     * @returns {string|null} The managerId if a managed node is found.
     * @private
     */
    Menu.prototype._getManagerIdInNodeTree = function (nodeId, node, managerId) {
        if (node.id === nodeId) { return managerId || node.managerId; }
        if (node.managerId) { managerId = node.managerId; }
        if (node.menuEntries && node.menuEntries.length > 0) {
            for (var i = 0; i < node.menuEntries.length; ++i) {
                managerId = this._getManagerIdInNodeTree(nodeId, node.menuEntries[i], managerId);
            }
            return managerId;
        }
        return null;
    };

    /**
     * Replaces the node and all its menuEntries with the given managedTree.
     *
     * @param {string} nodeId The nodeId to replace.
     * @param {object[]} nodes The nodes tree.
     * @param {object} managedTree The tree to replace the node with.
     * @returns {object[]} The new nodes tree.
     * @private
     */
    Menu.prototype._updateNode = function (nodeId, nodes, managedTree) {

        var oTree = deepClone(managedTree || {});
        // Make sure that all menu entries have uid:
        function addUid (treeObj) {
            if (treeObj) {
                treeObj.uid = treeObj.uid || ushellUtils.generateUniqueId([]);
                (treeObj.menuEntries || []).forEach(addUid);
            }
        }
        addUid(oTree);

        // traverse the tree to find the menu entry with the required ID and replace it
        return nodes.map(function (node) {
            if (node.id === nodeId) {
                return oTree;
            }
            if (node.menuEntries && node.menuEntries.length > 0) {
                node.menuEntries = this._updateNode(nodeId, node.menuEntries, oTree);
            }
            return node;
        }.bind(this));
    };

    /**
     * Creates entry provider functions, mapped to the given nodeIds.
     *
     * @param {string} managerId The ID of the entry manager.
     * @param {string[]} nodeIds The nodeIds to update.
     * @param {object} model The model bound to the UI.
     * @returns {object} The entry provider functions mapped to the nodeIds.
     * @private
     */
    Menu.prototype._createEntryProviders = function (managerId, nodeIds, model) {
        var aNodes = model.getData();
        var oMenuEntryProvider = {};
        var sNodeId;

        for (var i = 0; i < nodeIds.length; ++i) {
            sNodeId = nodeIds[i];

            if (!this._nodeManagementPermitted(sNodeId, aNodes, managerId)) {
                continue;
            }

            oMenuEntryProvider[sNodeId] = {
                setData: function (nodeId, managedTree) {
                    var aUpdatedNodes = this._updateNode(nodeId, aNodes, managedTree);

                    model.setData(aUpdatedNodes);
                }.bind(this, sNodeId)
            };
        }

        return oMenuEntryProvider;
    };

    /**
     * @param {string} managerId The ID of the entry manager.
     * @returns {boolean} True if the given managerId is in the blocked list, otherwise false.
     * @private
     */
    Menu.prototype._isManagerBlocked = function (managerId) {
        return this._aBlockedList.indexOf(managerId) > -1;
    };

    /**
     * Adds the given managerId to the blocked list.
     *
     * @param {string} managerId The ID of the entry manager.
     * @private
     */
    Menu.prototype._setManagerBlocked = function (managerId) {
        this._aBlockedList.push(managerId);
    };

    /**
     * Checks if the given managerId (pluginName) is blocked. If not, blocks it and resolves to
     * the entry provider functions for the given nodeIds.
     *
     * @param {string} pluginName The ID of the plugin.
     * @param {string[]} nodeIds An array of nodeId strings.
     * @returns {Promise<object>} The entry provider functions mapped to the nodeIds.
     */
    Menu.prototype.getEntryProvider = function (pluginName, nodeIds) {
        if (this._isManagerBlocked(pluginName)) {
            Log.error("ManagerId '" + pluginName + "' is already listed as an entry manager.");
            return Promise.reject("ManagerId " + pluginName + " is already listed as an entry manager.");
        }
        this._setManagerBlocked(pluginName);
        return this.getMenuModel().then(function (model) {
            return this._createEntryProviders(pluginName, nodeIds, model);
        }.bind(this));
    };

    // Return menu service from this module
    Menu.hasNoAdapter = false;
    return Menu;
});
